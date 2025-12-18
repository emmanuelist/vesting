import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, User, Copy, XCircle, Loader2, AlertCircle } from "lucide-react";
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
import { useVestingData } from "@/hooks/useVestingData";
import { microStxToStx, truncateAddress } from "@/lib/stacks-utils";

interface Schedule {
  id: string;
  beneficiary: string;
  amount: number;
  progress: number;
  status: "active" | "completed" | "revoked" | "pending";
  cliffDate: string;
  endDate: string;
}

const placeholderSchedules: Schedule[] = [
  {
    id: "2",
    beneficiary: "SP3DEF...7UVW",
    amount: 100000,
    progress: 30,
    status: "active",
    cliffDate: "Jun 2024",
    endDate: "Jun 2026",
  },
  {
    id: "3",
    beneficiary: "SP4GHI...9RST",
    amount: 75000,
    progress: 100,
    status: "completed",
    cliffDate: "Jan 2023",
    endDate: "Jan 2025",
  },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  revoked: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export function SchedulesList() {
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();
  const { userAddress, isConnected } = useWallet();
  
  // Fetch user's vesting data
  const { schedule, progress, isLoading } = useVestingData(userAddress);
  
  // Convert blockchain schedule to display format
  const userSchedule: Schedule | null = schedule && schedule.isActive ? {
    id: schedule.beneficiary,
    beneficiary: truncateAddress(schedule.beneficiary),
    amount: Number(microStxToStx(schedule.totalAmount)),
    progress: progress || 0,
    status: progress && progress >= 100 ? "completed" : "active",
    cliffDate: `${Math.floor(schedule.cliffDuration / 144)} days`,
    endDate: `${Math.floor(schedule.vestingDuration / 144)} days`,
  } : null;
  
  // Combine user's schedule with placeholders
  const schedules = userSchedule 
    ? [userSchedule, ...placeholderSchedules]
    : placeholderSchedules;

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
  
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card variant="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Active Schedules</CardTitle>
              <Link to="/schedules">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Beneficiary</th>
                    <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Amount</th>
                    <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Progress</th>
                    <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Status</th>
                    <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Timeline</th>
                    <th className="text-right py-2 px-3 label-caps text-[10px] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => (
                    <motion.tr
                      key={schedule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <span className="font-mono text-xs">{schedule.beneficiary}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-medium">
                          {schedule.amount.toLocaleString()} STX
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                schedule.status === "completed" 
                                  ? "bg-primary" 
                                  : "bg-gradient-to-r from-primary to-accent"
                              )}
                              style={{ width: `${schedule.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {schedule.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge 
                          variant="outline" 
                          className={cn("capitalize text-[10px] px-2 py-0.5", statusColors[schedule.status])}
                        >
                          {schedule.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] text-muted-foreground">
                          {schedule.cliffDate} → {schedule.endDate}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedSchedule && (
        <RevokeScheduleModal
          open={revokeModalOpen}
          onOpenChange={setRevokeModalOpen}
          scheduleId={selectedSchedule.id}
          beneficiary={selectedSchedule.beneficiary}
          remainingAmount={selectedSchedule.amount * (1 - selectedSchedule.progress / 100)}
          onRevoke={handleConfirmRevoke}
        />
      )}
    </>
  );
}