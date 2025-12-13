import { motion } from "framer-motion";
import { useState } from "react";
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
  Copy
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

const allSchedules: Schedule[] = [
  {
    id: "1",
    beneficiary: "SP2ABCD1234...XYZ789",
    amount: 250000,
    claimed: 87500,
    progress: 65,
    status: "active",
    cliffDate: "Mar 15, 2024",
    endDate: "Mar 15, 2026",
    createdAt: "Sep 15, 2023",
  },
  {
    id: "2",
    beneficiary: "SP3EFGH5678...UVW456",
    amount: 100000,
    claimed: 30000,
    progress: 30,
    status: "active",
    cliffDate: "Jun 1, 2024",
    endDate: "Jun 1, 2026",
    createdAt: "Dec 1, 2023",
  },
  {
    id: "3",
    beneficiary: "SP4IJKL9012...RST123",
    amount: 75000,
    claimed: 75000,
    progress: 100,
    status: "completed",
    cliffDate: "Jan 1, 2023",
    endDate: "Jan 1, 2025",
    createdAt: "Jul 1, 2022",
  },
  {
    id: "4",
    beneficiary: "SP5MNOP3456...QRS789",
    amount: 50000,
    claimed: 0,
    progress: 0,
    status: "revoked",
    cliffDate: "Apr 1, 2024",
    endDate: "Apr 1, 2026",
    createdAt: "Oct 1, 2023",
  },
  {
    id: "5",
    beneficiary: "SP6QRST7890...DEF012",
    amount: 150000,
    claimed: 0,
    progress: 0,
    status: "pending",
    cliffDate: "Jan 1, 2025",
    endDate: "Jan 1, 2027",
    createdAt: "Nov 1, 2024",
  },
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

  const filteredSchedules = allSchedules.filter((schedule) => {
    const matchesSearch = schedule.beneficiary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = allSchedules.reduce((acc, s) => acc + s.amount, 0);
  const totalClaimed = allSchedules.reduce((acc, s) => acc + s.claimed, 0);

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
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5"
          >
            <div>
              <h1 className="text-xl font-semibold text-foreground">All Schedules</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage and monitor all vesting schedules
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 self-start" onClick={handleExportCSV}>
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
          >
            <Card variant="glass" className="p-3">
              <p className="label-caps text-[10px] mb-0.5">Total Schedules</p>
              <p className="stat-number text-lg">{allSchedules.length}</p>
            </Card>
            <Card variant="glass" className="p-3">
              <p className="label-caps text-[10px] mb-0.5">Total Value</p>
              <p className="stat-number text-lg">{(totalValue / 1000).toFixed(0)}K STX</p>
            </Card>
            <Card variant="glass" className="p-3">
              <p className="label-caps text-[10px] mb-0.5">Total Claimed</p>
              <p className="stat-number text-lg text-primary">{(totalClaimed / 1000).toFixed(0)}K STX</p>
            </Card>
            <Card variant="glass" className="p-3">
              <p className="label-caps text-[10px] mb-0.5">Active</p>
              <p className="stat-number text-lg text-success">
                {allSchedules.filter(s => s.status === "active").length}
              </p>
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

                {filteredSchedules.length === 0 && (
                  <div className="py-10 text-center">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No schedules found</p>
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