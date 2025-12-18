import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useRevokeVesting } from "@/hooks/useVestingData";
import { useToast } from "@/hooks/use-toast";
import { getTransactionUrl } from "@/lib/stacks-config";

type ModalState = "confirm" | "processing" | "success";

interface RevokeScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
  beneficiary: string;
  remainingAmount: number;
  onRevoke: (reason: string) => Promise<void>;
}

export function RevokeScheduleModal({
  open,
  onOpenChange,
  scheduleId,
  beneficiary,
  remainingAmount,
  onRevoke,
}: RevokeScheduleModalProps) {
  const [state, setState] = useState<ModalState>("confirm");
  const [reason, setReason] = useState("");
  const [txId, setTxId] = useState<string>("");
  
  const { toast } = useToast();
  const revokeMutation = useRevokeVesting();

  const handleRevoke = async () => {
    setState("processing");
    try {
      const txHash = await revokeMutation.mutateAsync({
        beneficiary,
      });
      setTxId(txHash);
      setState("success");
      await onRevoke(reason);
    } catch (error: any) {
      setState("confirm");
      toast({
        title: "Failed to revoke schedule",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setState("confirm");
      setReason("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <AnimatePresence mode="wait">
          {state === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Revoke Schedule
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Warning Card */}
                <Card className="p-3 bg-destructive/10 border-destructive/20">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">This action cannot be undone</p>
                      <p className="text-muted-foreground mt-1">
                        The remaining tokens will be returned to the contract and the beneficiary
                        will no longer be able to claim them.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Schedule Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Schedule ID</span>
                    <span className="font-mono text-sm">{scheduleId}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Beneficiary</span>
                    <span className="font-mono text-sm">{beneficiary}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <span className="text-sm text-muted-foreground">Remaining Tokens</span>
                    <span className="font-mono text-sm text-warning">{remainingAmount.toLocaleString()} STX</span>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="label-caps text-[10px]">Reason (Optional)</label>
                  <Textarea
                    placeholder="Enter reason for revoking..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={handleRevoke}
                >
                  Revoke Schedule
                </Button>
              </div>
            </motion.div>
          )}

          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 flex flex-col items-center justify-center"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-destructive animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-destructive/20 blur-xl animate-pulse" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Revoking Schedule</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center">
                Confirm the transaction in your wallet...
              </p>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-6 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="relative"
              >
                <CheckCircle2 className="w-14 h-14 text-success" />
                <div className="absolute inset-0 w-14 h-14 rounded-full bg-success/20 blur-xl" />
              </motion.div>

              <h3 className="mt-4 text-lg font-semibold">Schedule Revoked</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {remainingAmount.toLocaleString()} STX returned to contract
              </p>
              
              {txId && (
                <a
                  href={getTransactionUrl(txId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View transaction
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <Button variant="hero" className="mt-5 w-full" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
