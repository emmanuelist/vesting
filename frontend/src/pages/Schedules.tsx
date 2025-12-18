import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  MoreHorizontal, 
  User, 
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Copy,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RevokeScheduleModal } from "@/components/modals/RevokeScheduleModal";
import { useWallet } from "@/contexts/WalletContext";
import { useVestingData, useTotalSchedules, useBeneficiaryCount } from "@/hooks/useVestingData";
import { microStxToStx, truncateAddress } from "@/lib/stacks-utils";
import { VestingSchedule } from "@/lib/stacks-utils";

interface Schedule {
  id: string;
  beneficiary: string;
  amount: number;
  claimed: number;
  progress: number;
  status: "active" | "completed" | "revoked" | "pending";
  cliffDate: string;
  endDate: string;
  createdAt: string;
}

function convertScheduleToDisplay(schedule: VestingSchedule, progress: number): Schedule {
  return {
    id: schedule.beneficiary,
    beneficiary: truncateAddress(schedule.beneficiary),
    amount: Number(microStxToStx(schedule.totalAmount)),
    claimed: Number(microStxToStx(schedule.claimedAmount)),
    progress,
    status: schedule.isActive 
      ? (progress >= 100 ? "completed" : "active")
      : "revoked",
    cliffDate: `${Math.floor(schedule.cliffDuration / 144)} days`,
    endDate: `${Math.floor(schedule.vestingDuration / 144)} days`,
    createdAt: new Date(schedule.startTime * 1000).toLocaleDateString(),
  };
}

const allSchedules: Schedule[] = [
  {
    id: "6",
    beneficiary: "SP7UVWX1234...ABC345",
    amount: 200000,
    claimed: 100000,
    progress: 50,
    status: "active",
    cliffDate: "Feb 1, 2024",
    endDate: "Feb 1, 2026",
    createdAt: "Aug 1, 2023",
  },
];

const statusConfig = {
  active: {
    icon: CheckCircle,
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  completed: {
    icon: CheckCircle,
    label: "Completed",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  revoked: {
    icon: XCircle,
    label: "Revoked",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
  },
};

const Schedules = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();
  const { userAddress, isConnected } = useWallet();
  
  // Fetch user's vesting schedule
  const { schedule, progress, isLoading: scheduleLoading } = useVestingData(userAddress);
  const { data: totalSchedules, isLoading: totalLoading } = useTotalSchedules();
  const { data: beneficiaryCount, isLoading: countLoading } = useBeneficiaryCount();
  
  const isLoading = scheduleLoading || totalLoading || countLoading;
  
  // Convert blockchain data to display format
  const userSchedules: Schedule[] = schedule && schedule.isActive
    ? [convertScheduleToDisplay(schedule, progress || 0)]
    : [];
  
  // Note: Contract only allows viewing your own schedule
  // Placeholder data represents other schedules that exist
  const displaySchedules = userSchedules.length > 0 ? userSchedules : [];

  const filteredSchedules = displaySchedules.filter((schedule) => {
    const matchesSearch = schedule.beneficiary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = displaySchedules.reduce((acc, s) => acc + s.amount, 0);
  const totalClaimed = displaySchedules.reduce((acc, s) => acc + s.claimed, 0);
  const hasUserSchedule = displaySchedules.length > 0;

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied",
      description: "Beneficiary address copied to clipboard",
    });
  };

  const handleRevoke = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async (reason?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const handleExportCSV = () => {
    const headers = ["Beneficiary", "Amount", "Claimed", "Progress", "Status", "Cliff Date", "End Date", "Created At"];
    const rows = filteredSchedules.map(s => [
      s.beneficiary,
      s.amount,
      s.claimed,
      `${s.progress}%`,
      s.status,
      s.cliffDate,
      s.endDate,
      s.createdAt
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vesting-schedules-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "CSV exported",
      description: `Exported ${filteredSchedules.length} schedules to CSV`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-5"
          >
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">All Schedules</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Manage and monitor all vesting schedules
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 self-start text-xs" onClick={handleExportCSV}>
              <Download className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </Button>
          </motion.div>

          {/* Info Banner */}
          {isConnected && !isLoading && !hasUserSchedule && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card variant="glass" className="border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-xs sm:text-sm mb-1">No Vesting Schedule</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        You don't have an active vesting schedule yet. The contract has {totalSchedules || 0} total schedule(s) across {beneficiaryCount || 0} beneficiar{beneficiaryCount === 1 ? 'y' : 'ies'}, but you can only view your own schedule.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4"
          >
            <Card variant="glass" className="p-2 sm:p-3">
              <p className="label-caps text-[9px] sm:text-[10px] mb-0.5">Total Schedules</p>
              <p className="stat-number text-base sm:text-lg">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : totalSchedules || 0}
              </p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Network-wide</p>
            </Card>
            <Card variant="glass" className="p-2 sm:p-3">
              <p className="label-caps text-[9px] sm:text-[10px] mb-0.5">Your Schedules</p>
              <p className="stat-number text-base sm:text-lg">{displaySchedules.length}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Visible to you</p>
            </Card>
            <Card variant="glass" className="p-2 sm:p-3">
              <p className="label-caps text-[9px] sm:text-[10px] mb-0.5">Your Value</p>
              <p className="stat-number text-base sm:text-lg text-primary">{totalValue.toLocaleString()} STX</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Total amount</p>
            </Card>
            <Card variant="glass" className="p-3">
              <p className="label-caps text-[10px] mb-0.5">Beneficiaries</p>
              <p className="stat-number text-lg text-success">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : beneficiaryCount || 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Network-wide</p>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mb-4"
          >
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-secondary/50"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <Button
                  key={key}
                  variant={statusFilter === key ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => setStatusFilter(key)}
                >
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Schedules Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card variant="glass">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground ml-3">Loading schedules...</p>
                  </div>
                ) : !isConnected ? (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-1">Connect Your Wallet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your wallet to view your vesting schedule
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Note: You can only view schedules where you are the beneficiary
                    </p>
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-1">No Vesting Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      You don't have an active vesting schedule yet
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      The contract has {totalSchedules || 0} total schedule(s) across {beneficiaryCount || 0} beneficiar{beneficiaryCount === 1 ? 'y' : 'ies'}
                    </p>
                    <Link to="/create">
                      <Button variant="outline" size="sm">
                        Create Schedule
                      </Button>
                    </Link>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 label-caps text-[10px] font-medium">Beneficiary</th>
                        <th className="text-left py-3 px-3 label-caps text-[10px] font-medium">Amount</th>
                        <th className="text-left py-3 px-3 label-caps text-[10px] font-medium">Claimed</th>
                        <th className="text-left py-3 px-3 label-caps text-[10px] font-medium">Progress</th>
                        <th className="text-left py-3 px-3 label-caps text-[10px] font-medium">Status</th>
                        <th className="text-left py-3 px-3 label-caps text-[10px] font-medium">Timeline</th>
                        <th className="text-right py-3 px-4 label-caps text-[10px] font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map((schedule, index) => {
                        const StatusIcon = statusConfig[schedule.status].icon;
                        return (
                          <motion.tr
                            key={schedule.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                                <div>
                                  <span className="font-mono text-xs block">
                                    {schedule.beneficiary}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Created {schedule.createdAt}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-xs font-medium">
                                {schedule.amount.toLocaleString()} STX
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-xs text-primary">
                                {schedule.claimed.toLocaleString()} STX
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      schedule.status === "completed"
                                        ? "bg-primary"
                                        : schedule.status === "revoked"
                                        ? "bg-destructive"
                                        : "bg-gradient-to-r from-primary to-accent"
                                    )}
                                    style={{ width: `${schedule.progress}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-muted-foreground w-8">
                                  {schedule.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize gap-1 text-[10px] px-2 py-0.5",
                                  statusConfig[schedule.status].className
                                )}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                {schedule.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-[10px]">
                                <p className="text-muted-foreground">
                                  Cliff: <span className="text-foreground">{schedule.cliffDate}</span>
                                </p>
                                <p className="text-muted-foreground">
                                  End: <span className="text-foreground">{schedule.endDate}</span>
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link to={`/schedule/${schedule.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <MoreHorizontal className="w-3.5 h-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40 bg-background border-border">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/schedule/${schedule.id}`} className="flex items-center gap-2 cursor-pointer">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleCopyAddress(schedule.beneficiary)}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      Copy Address
                                    </DropdownMenuItem>
                                    {schedule.status === "active" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => handleRevoke(schedule)}
                                          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                          Revoke Schedule
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {selectedSchedule && (
        <RevokeScheduleModal
          open={revokeModalOpen}
          onOpenChange={setRevokeModalOpen}
          scheduleId={selectedSchedule.id}
          beneficiary={selectedSchedule.beneficiary}
          remainingAmount={selectedSchedule.amount - selectedSchedule.claimed}
          onRevoke={handleConfirmRevoke}
        />
      )}
    </div>
  );
};

export default Schedules;