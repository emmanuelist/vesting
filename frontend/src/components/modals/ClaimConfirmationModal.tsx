import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Fuel,
  Wallet,
  Clock,
  ExternalLink,
} from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";

type ModalState = "preview" | "processing" | "success" | "error";

interface ClaimConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onConfirm: () => Promise<void>;
}

export function ClaimConfirmationModal({
  open,
  onOpenChange,
  amount,
  onConfirm,
}: ClaimConfirmationModalProps) {
  const [state, setState] = useState<ModalState>("preview");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const gasEstimate = 0.01;
  const networkFee = 0.001;

  const handleConfirm = async () => {
    setState("processing");
    try {
      await onConfirm();
      // Simulate tx hash
      setTxHash("0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6));
      setState("success");
      triggerConfetti();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Transaction failed");
      setState("error");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setState("preview");
      setTxHash("");
      setErrorMessage("");
    }, 200);
  };

  const handleRetry = () => {
    setState("preview");
    setErrorMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <AnimatePresence mode="wait">
          {state === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Confirm Claim</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                {/* Amount Card */}
                <Card variant="glass" className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="label-caps">Claim Amount</span>
                    <span className="text-xl font-mono font-semibold text-primary">
                      {amount.toLocaleString()} STX
                    </span>
                  </div>
                </Card>

                {/* Transaction Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Fuel className="w-3.5 h-3.5" />
                      <span>Gas Estimate</span>
                    </div>
                    <span className="font-mono text-sm">~{gasEstimate} STX</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Network Fee</span>
                    </div>
                    <span className="font-mono text-sm">~{networkFee} STX</span>
                  </div>

                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Est. Time</span>
                    </div>
                    <span className="font-mono text-sm">~30 seconds</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">You'll Receive</span>
                  <span className="text-lg font-mono font-semibold text-foreground">
                    {(amount - gasEstimate - networkFee).toLocaleString()} STX
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={handleConfirm}>
                  Confirm Claim
                  <ArrowRight className="w-4 h-4" />
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
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary/20 blur-xl animate-pulse" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Processing Transaction</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center">
                Please confirm the transaction in your wallet...
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
              
              <h3 className="mt-4 text-lg font-semibold text-success">Claim Successful!</h3>
              <p className="mt-1 text-2xl font-mono font-semibold text-foreground">
                +{amount.toLocaleString()} STX
              </p>
              
              <a
                href={`https://explorer.stacks.co/txid/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
              >
                {txHash}
                <ExternalLink className="w-3 h-3" />
              </a>

              <Button variant="hero" className="mt-5 w-full" onClick={handleClose}>
                Done
              </Button>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-6 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                <XCircle className="w-14 h-14 text-destructive" />
                <div className="absolute inset-0 w-14 h-14 rounded-full bg-destructive/20 blur-xl" />
              </motion.div>
              
              <h3 className="mt-4 text-lg font-semibold text-destructive">Transaction Failed</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
                {errorMessage || "Something went wrong. Please try again."}
              </p>

              <div className="flex gap-2 mt-5 w-full">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
