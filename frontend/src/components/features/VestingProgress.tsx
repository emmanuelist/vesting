import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Lock, Unlock, ArrowRight, Loader2 } from "lucide-react";
import { ClaimConfirmationModal } from "@/components/modals/ClaimConfirmationModal";
import { useWallet } from "@/contexts/WalletContext";
import { useVestingData, useClaimTokens } from "@/hooks/useVestingData";
import { microStxToStx, formatDuration, blocksToTime } from "@/lib/stacks-utils";
import { useToast } from "@/hooks/use-toast";

interface VestingProgressProps {
  beneficiaryAddress?: string; // Optional override for viewing other addresses
}

export function VestingProgress({ beneficiaryAddress }: VestingProgressProps) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const { userAddress } = useWallet();
  const { toast } = useToast();
  
  // Use provided address or user's address
  const targetAddress = beneficiaryAddress || userAddress;
  
  // Fetch vesting data from blockchain
  const { schedule, vestedAmount, progress, cliffPassed, isLoading, refetch } = 
    useVestingData(targetAddress);
  
  // Claim mutation
  const claimMutation = useClaimTokens();

  // Calculate display values
  const totalAllocated = schedule ? Number(microStxToStx(schedule.totalAmount)) : 0;
  const claimedAmount = schedule ? Number(microStxToStx(schedule.claimedAmount)) : 0;
  const availableToClaim = vestedAmount ? Number(microStxToStx(vestedAmount)) : 0;
  const currentlyVested = claimedAmount + availableToClaim;
  const stillLocked = totalAllocated - currentlyVested;
  const progressPercentage = progress || 0;
  
  // Calculate dates from block heights
  const cliffDate = schedule 
    ? formatDuration(schedule.cliffDuration)
    : "N/A";
  const endDate = schedule 
    ? formatDuration(schedule.vestingDuration)
    : "N/A";

  const handleClaim = async () => {
    try {
      const txId = await claimMutation.mutateAsync();
      toast({
        title: "Claim successful",
        description: `Transaction submitted: ${txId.slice(0, 8)}...`,
      });
      
      // Refetch data after claim
      setTimeout(() => refetch(), 2000);
    } catch (error: any) {
      toast({
        title: "Claim failed",
        description: error.message || "Failed to claim tokens",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card variant="glow" className="p-5 relative overflow-hidden">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  // Show no schedule message
  if (!schedule || !schedule.isActive) {
    return (
      <Card variant="glow" className="p-5 relative overflow-hidden">
        <div className="text-center py-10">
          <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-1">No Active Vesting Schedule</h3>
          <p className="text-sm text-muted-foreground">
            {targetAddress 
              ? "This address doesn't have an active vesting schedule"
              : "Connect your wallet to view your vesting schedule"
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card variant="glow" className="p-5 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Vesting Status</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Token allocation progress</p>
              </div>
              {isCliffPassed ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
                  <Unlock className="w-3.5 h-3.5 text-success" />
                  <span className="text-[10px] font-medium text-success">Cliff Passed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20">
                  <Lock className="w-3.5 h-3.5 text-warning" />
                  <span className="text-[10px] font-medium text-warning">Before Cliff</span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="space-y-0.5">
                <span className="label-caps text-[10px]">Total Allocated</span>
                <p className="stat-number text-lg lg:text-xl">{totalAllocated.toLocaleString()}</p>
                <span className="text-[10px] text-muted-foreground font-mono">STX</span>
              </div>
              <div className="space-y-0.5">
                <span className="label-caps text-[10px]">Currently Vested</span>
                <p className="stat-number text-lg lg:text-xl text-primary">{currentlyVested.toLocaleString()}</p>
                <span className="text-[10px] text-muted-foreground font-mono">STX</span>
              </div>
              <div className="space-y-0.5">
                <span className="label-caps text-[10px]">Available to Claim</span>
                <p className="stat-number text-lg lg:text-xl text-success">{availableToClaim.toLocaleString()}</p>
                <span className="text-[10px] text-muted-foreground font-mono">STX</span>
              </div>
              <div className="space-y-0.5">
                <span className="label-caps text-[10px]">Still Locked</span>
                <p className="stat-number text-lg lg:text-xl text-accent">{stillLocked.toLocaleString()}</p>
                <span className="text-[10px] text-muted-foreground font-mono">STX</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Vesting Progress</span>
                <span className="font-mono text-xs text-foreground">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-5">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Cliff: {cliffDate}</span>
              </div>
              <div className="flex-1 mx-3 border-t border-dashed border-border" />
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>End: {endDate}</span>
              </div>
            </div>

            {/* Claim Button */}
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={availableToClaim === 0 || !cliffPassed || claimMutation.isPending}
              onClick={() => setClaimModalOpen(true)}
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Claim {availableToClaim.toLocaleString()} STX</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            
            {!cliffPassed && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Cliff period has not passed yet
              </p>
            )}
            {cliffPassed && availableToClaim === 0 && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                No tokens available to claim at this time
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      <ClaimConfirmationModal
        open={claimModalOpen}
        onOpenChange={setClaimModalOpen}
        amount={availableToClaim}
        onConfirm={handleClaim}
      />
    </>
  );
}
