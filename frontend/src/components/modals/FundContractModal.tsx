import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/WalletContext";
import { useFundContract, useContractBalance } from "@/hooks/useVestingData";
import { CONTRACT_ADDRESS, getTransactionUrl, API_URL } from "@/lib/stacks-config";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type ModalState = "form" | "processing" | "success";

interface FundContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFund: (amount: number) => Promise<void>;
}

/**
 * Fetch wallet STX balance from Stacks API
 */
async function fetchWalletBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/extended/v1/address/${address}/stx`);
    if (!response.ok) {
      throw new Error('Failed to fetch wallet balance');
    }
    const data = await response.json();
    // Convert from micro-STX to STX
    return Number(data.balance) / 1_000_000;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

export function FundContractModal({
  open,
  onOpenChange,
  onFund,
}: FundContractModalProps) {
  const [state, setState] = useState<ModalState>("form");
  const [amount, setAmount] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [txId, setTxId] = useState<string>("");
  
  const { userAddress, isConnected } = useWallet();
  const { toast } = useToast();
  const fundMutation = useFundContract();
  const { data: contractBalanceData, isLoading: balanceLoading } = useContractBalance();
  
  // Fetch wallet balance from Stacks API
  const { data: walletBalanceData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet-balance', userAddress],
    queryFn: () => userAddress ? fetchWalletBalance(userAddress) : Promise.resolve(0),
    enabled: !!userAddress && isConnected,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Real data from blockchain
  const walletBalance = walletBalanceData || 0;
  const contractAddress = CONTRACT_ADDRESS;
  const currentContractBalance = contractBalanceData ? Number(contractBalanceData) / 1_000_000 : 0;
  const minDeposit = 100;

  const numericAmount = parseFloat(amount) || 0;
  const isInsufficientBalance = numericAmount > walletBalance;
  const isBelowMinimum = numericAmount > 0 && numericAmount < minDeposit;
  const isValidAmount = numericAmount >= minDeposit && numericAmount <= walletBalance;

  const handleMax = () => {
    setAmount(walletBalance.toString());
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = async () => {
    // Pre-validation checks
    if (!isConnected || !userAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to fund the contract",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAmount) {
      toast({
        title: "Invalid Amount",
        description: isInsufficientBalance 
          ? `Insufficient balance. You have ${walletBalance.toFixed(2)} STX`
          : `Minimum deposit is ${minDeposit} STX`,
        variant: "destructive",
      });
      return;
    }
    
    setState("processing");
    try {
      const txHash = await fundMutation.mutateAsync({
        amount: numericAmount,
        senderAddress: userAddress,
      });
      setTxId(txHash);
      setState("success");
      toast({
        title: "Contract Funded Successfully! 🎉",
        description: `Added ${numericAmount.toLocaleString()} STX to the contract`,
      });
      await onFund(numericAmount);
    } catch (error: any) {
      setState("form");
      console.error('Fund contract error:', error);
      
      const errorMessage = error.message || error.toString();
      
      // Categorize errors for better user feedback
      let title = "Failed to Fund Contract";
      let description = "Transaction failed. Please try again.";
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('cancelled')) {
        title = "Transaction Cancelled";
        description = "You cancelled the transaction in your wallet";
      } else if (errorMessage.includes('Insufficient')) {
        title = "Insufficient Balance";
        description = `You need at least ${numericAmount.toLocaleString()} STX plus gas fees`;
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('owner')) {
        title = "Unauthorized";
        description = "Only the contract owner can perform this action";
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        title = "Network Error";
        description = "Network connection issue. Please check your connection and try again";
      } else if (errorMessage) {
        description = errorMessage;
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setState("form");
      setAmount("");
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {state === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Fund Contract
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Contract Info */}
                <Card variant="glass" className="p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="label-caps text-[10px]">Contract Address</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs truncate">{contractAddress}</span>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 rounded hover:bg-secondary transition-colors flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="label-caps text-[10px]">Current Balance</span>
                      <p className="font-mono text-sm text-primary mt-1">
                        {balanceLoading ? (
                          <span className="flex items-center gap-1 justify-end">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading...
                          </span>
                        ) : (
                          `${currentContractBalance.toLocaleString()} STX`
                        )}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Warning Banners */}
                {!isConnected && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Wallet not connected. Please connect your wallet to fund the contract.
                    </AlertDescription>
                  </Alert>
                )}

                {isConnected && walletLoading && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Loading wallet balance...
                    </AlertDescription>
                  </Alert>
                )}

                {isConnected && !walletLoading && walletBalance === 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your wallet has no STX. Please add funds to your wallet first.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="label-caps text-[10px]">Deposit Amount</label>
                    <span className="text-xs text-muted-foreground">
                      {walletLoading ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        <>Balance: <span className="font-mono text-foreground">{walletBalance.toLocaleString()} STX</span></>
                      )}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!isConnected || walletLoading || walletBalance === 0}
                      className={cn(
                        "pr-20 font-mono text-lg h-11",
                        isInsufficientBalance && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={handleMax}
                        disabled={!isConnected || walletLoading || walletBalance === 0}
                        className="px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        MAX
                      </button>
                      <span className="text-sm text-muted-foreground font-mono">STX</span>
                    </div>
                  </div>

                  {/* Validation Messages */}
                  {isInsufficientBalance && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      Insufficient balance
                    </p>
                  )}
                  {isBelowMinimum && (
                    <p className="flex items-center gap-1.5 text-xs text-warning">
                      <AlertCircle className="w-3 h-3" />
                      Minimum deposit is {minDeposit} STX
                    </p>
                  )}
                </div>

                {/* Summary */}
                {isValidAmount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2 pt-3 border-t border-border/50"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">New Contract Balance</span>
                      <span className="font-mono text-foreground">
                        {(currentContractBalance + numericAmount).toLocaleString()} STX
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Est. Gas Fee</span>
                      <span className="font-mono text-foreground">~0.01 STX</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 gap-2"
                  onClick={handleFund}
                  disabled={!isConnected || walletLoading || !isValidAmount || fundMutation.isPending}
                >
                  {fundMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Fund Contract
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
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
              <h3 className="mt-5 text-lg font-semibold">Processing Deposit</h3>
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

              <h3 className="mt-4 text-lg font-semibold text-success">Deposit Successful!</h3>
              <p className="mt-1 text-2xl font-mono font-semibold text-foreground">
                +{numericAmount.toLocaleString()} STX
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Contract funded successfully
              </p>
              
              {txId && (
                <a
                  href={getTransactionUrl(txId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View transaction
                  <ArrowRight className="w-3 h-3" />
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
