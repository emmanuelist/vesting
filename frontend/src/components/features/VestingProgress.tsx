import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Lock, Unlock, ArrowRight } from "lucide-react";
import { ClaimConfirmationModal } from "@/components/modals/ClaimConfirmationModal";

interface VestingProgressProps {
  totalAllocated: number;
  currentlyVested: number;
  availableToClaim: number;
  stillLocked: number;
  cliffDate: string;
  endDate: string;
  isCliffPassed: boolean;
}

export function VestingProgress({
  totalAllocated = 250000,
  currentlyVested = 125000,
  availableToClaim = 45000,
  stillLocked = 125000,
  cliffDate = "Jun 2024",
  endDate = "May 2026",
  isCliffPassed = true,
}: Partial<VestingProgressProps>) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const progressPercentage = (currentlyVested / totalAllocated) * 100;

  const handleClaim = async () => {
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

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
              disabled={availableToClaim === 0 || !isCliffPassed}
              onClick={() => setClaimModalOpen(true)}
            >
              <span>Claim {availableToClaim.toLocaleString()} STX</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
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
