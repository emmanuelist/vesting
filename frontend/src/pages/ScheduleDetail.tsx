import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RevokeScheduleModal } from "@/components/modals/RevokeScheduleModal";
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Clock,
  TrendingUp,
  User,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useWallet } from "@/contexts/WalletContext";
import { useVestingData, useClaimTokens, useRevokeVesting } from "@/hooks/useVestingData";
import { microStxToStx, truncateAddress } from "@/lib/stacks-utils";
import { useToast } from "@/hooks/use-toast";
import { getTransactionUrl } from "@/lib/stacks-config";

const claimHistory = [
  { id: "1", amount: 15000, date: "Dec 10, 2024", txHash: "0x1a2b...3c4d", status: "confirmed" },
  { id: "2", amount: 10000, date: "Nov 1, 2024", txHash: "0x5e6f...7g8h", status: "confirmed" },
  { id: "3", amount: 5000, date: "Sep 15, 2024", txHash: "0x9i0j...k1l2", status: "confirmed" },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  revoked: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

export default function ScheduleDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const { userAddress, isConnected } = useWallet();
  const { toast } = useToast();
  
  // Use the id from URL as beneficiary address, or default to user's address
  const beneficiaryAddress = id || userAddress;
  
  // Fetch vesting data
  const { schedule, vestedAmount, progress, cliffPassed, isLoading, refetch } = 
    useVestingData(beneficiaryAddress);
  
  // Claim and revoke mutations
  const claimMutation = useClaimTokens();
  const revokeMutation = useRevokeVesting();

  const handleCopy = () => {
    if (beneficiaryAddress) {
      navigator.clipboard.writeText(beneficiaryAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address copied",
        description: "Beneficiary address copied to clipboard",
      });
    }
  };

  const handleClaim = async () => {
    try {
      const txId = await claimMutation.mutateAsync();
      toast({
        title: "Claim successful",
        description: `Transaction: ${txId.slice(0, 8)}...`,
      });
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast({
        title: "Claim failed",
        description: error.message || "Failed to claim tokens",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = async (reason: string) => {
    if (!beneficiaryAddress) return;
    
    try {
      const txId = await revokeMutation.mutateAsync({
        beneficiary: beneficiaryAddress,
      });
      
      toast({
        title: "Schedule revoked",
        description: `Transaction: ${txId.slice(0, 8)}...`,
      });
      
      // Refetch data after revoke
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast({
        title: "Failed to revoke schedule",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 pb-10 px-4">
          <div className="container mx-auto max-w-6xl flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }
  
  // Redirect if no schedule found
  if (!schedule || !schedule.isActive) {
    return <Navigate to="/schedules" replace />;
  }
  
  // Calculate display values
  const totalAllocation = Number(microStxToStx(schedule.totalAmount));
  const claimedAmount = Number(microStxToStx(schedule.claimedAmount));
  const availableToClaim = vestedAmount ? Number(microStxToStx(vestedAmount)) : 0;
  const currentlyVested = claimedAmount + availableToClaim;
  const lockedAmount = totalAllocation - currentlyVested;
  
  const scheduleData = {
    id: id || "current",
    beneficiary: beneficiaryAddress || "",
    beneficiaryShort: truncateAddress(beneficiaryAddress || ""),
    totalAllocation,
    vestedAmount: currentlyVested,
    claimedAmount,
    availableToClaim,
    lockedAmount,
    status: "active" as const,
    createdAt: new Date(schedule.startTime * 1000).toLocaleDateString(),
    cliffDate: `${Math.floor(schedule.cliffDuration / 144)} days`,
    endDate: `${Math.floor(schedule.vestingDuration / 144)} days`,
    cliffPassed: cliffPassed || false,
    vestingProgress: progress || 0,
  };
  
  // Generate chart data
  const vestingChartData = Array.from({ length: 9 }, (_, i) => {
    const progressPoint = (i / 8) * 100;
    const vestedAtPoint = (totalAllocation * progressPoint) / 100;
    return {
      month: `Month ${i * 3}`,
      vested: Math.round(vestedAtPoint),
      locked: Math.round(totalAllocation - vestedAtPoint),
    };
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5"
          >
            <Link
              to="/schedules"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Schedules
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">Schedule #{id}</h1>
                <Badge variant="outline" className={cn("capitalize", statusColors[scheduleData.status])}>
                  {scheduleData.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Created {scheduleData.createdAt}</p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Left Column - Chart & Info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Vesting Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Vesting Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={vestingChartData}>
                          <defs>
                            <linearGradient id="vestedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="lockedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            tickFormatter={(v) => `${v / 1000}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="vested"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#vestedGradient)"
                            name="Vested"
                          />
                          <Area
                            type="monotone"
                            dataKey="locked"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            fill="url(#lockedGradient)"
                            name="Locked"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Timeline Markers */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Cliff: {scheduleData.cliffDate}</span>
                        {scheduleData.cliffPassed && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">End: {scheduleData.endDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Claim History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">Claim History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Date</th>
                            <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Amount</th>
                            <th className="text-left py-2 px-3 label-caps text-[10px] font-medium">Status</th>
                            <th className="text-right py-2 px-3 label-caps text-[10px] font-medium">Transaction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {claimHistory.map((claim, index) => (
                            <motion.tr
                              key={claim.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                              className="border-b border-border/50"
                            >
                              <td className="py-3 px-3 text-sm">{claim.date}</td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-sm font-medium text-success">
                                  +{claim.amount.toLocaleString()} STX
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                                  <span className="text-xs text-success capitalize">{claim.status}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <a
                                  href={`https://explorer.stacks.co/txid/${claim.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                                >
                                  {claim.txHash}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Details & Actions */}
            <div className="space-y-5">
              {/* Schedule Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card variant="glass" className="p-4">
                  <h3 className="text-base font-semibold mb-4">Schedule Details</h3>
                  
                  {/* Beneficiary */}
                  <div className="space-y-3">
                    <div>
                      <span className="label-caps text-[10px]">Beneficiary</span>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{scheduleData.beneficiaryShort}</span>
                        <button
                          onClick={handleCopy}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="label-caps text-[10px]">Total Allocated</span>
                        <p className="font-mono text-lg mt-0.5">{scheduleData.totalAllocation.toLocaleString()}</p>
                        <span className="text-xs text-muted-foreground">STX</span>
                      </div>
                      <div>
                        <span className="label-caps text-[10px]">Vested</span>
                        <p className="font-mono text-lg mt-0.5 text-primary">{scheduleData.vestedAmount.toLocaleString()}</p>
                        <span className="text-xs text-muted-foreground">STX</span>
                      </div>
                      <div>
                        <span className="label-caps text-[10px]">Claimed</span>
                        <p className="font-mono text-lg mt-0.5 text-success">{scheduleData.claimedAmount.toLocaleString()}</p>
                        <span className="text-xs text-muted-foreground">STX</span>
                      </div>
                      <div>
                        <span className="label-caps text-[10px]">Locked</span>
                        <p className="font-mono text-lg mt-0.5 text-accent">{scheduleData.lockedAmount.toLocaleString()}</p>
                        <span className="text-xs text-muted-foreground">STX</span>
                      </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="label-caps text-[10px]">Progress</span>
                        <span className="font-mono text-xs">{scheduleData.vestingProgress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scheduleData.vestingProgress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Cliff Date</span>
                        </div>
                        <span className="text-xs font-mono">{scheduleData.cliffDate}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">End Date</span>
                        </div>
                        <span className="text-xs font-mono">{scheduleData.endDate}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Admin Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card variant="glass" className="p-4 border-destructive/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <h3 className="text-base font-semibold">Admin Actions</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Revoking will return remaining {scheduleData.lockedAmount.toLocaleString()} STX to the contract.
                  </p>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setRevokeModalOpen(true)}
                  >
                    Revoke Schedule
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <RevokeScheduleModal
        open={revokeModalOpen}
        onOpenChange={setRevokeModalOpen}
        scheduleId={scheduleData.id}
        beneficiary={scheduleData.beneficiaryShort}
        remainingAmount={scheduleData.lockedAmount}
        onRevoke={handleRevoke}
      />
    </div>
  );
}
