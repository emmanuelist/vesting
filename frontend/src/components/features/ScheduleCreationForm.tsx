import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from "recharts";
import { User, Coins, Clock, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateVestingSchedule, useContractBalance } from "@/hooks/useVestingData";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { isValidStacksAddress } from "@/lib/stacks-utils";

function generateVestingData(amount: number, cliffMonths: number, vestingMonths: number) {
  const data = [];
  const monthlyVesting = amount / (vestingMonths - cliffMonths);
  
  for (let i = 0; i <= vestingMonths; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    const monthName = month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    let vested = 0;
    let locked = amount;
    
    if (i >= cliffMonths) {
      vested = Math.min((i - cliffMonths + 1) * monthlyVesting, amount);
      locked = amount - vested;
    }
    
    data.push({
      month: monthName,
      vested: Math.round(vested),
      locked: Math.round(locked),
    });
  }
  
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border/50 rounded-lg text-sm">
        <p className="label-caps mb-2">{label}</p>
        <div className="space-y-1">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Vested:</span>
            <span className="font-mono font-medium">{payload[0]?.value?.toLocaleString()}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted-foreground">Locked:</span>
            <span className="font-mono font-medium">{payload[1]?.value?.toLocaleString()}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ScheduleCreationForm() {
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState(100000);
  const [cliffMonths, setCliffMonths] = useState(6);
  const [vestingMonths, setVestingMonths] = useState(24);
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch contract balance
  const { data: contractBalance, isLoading: balanceLoading } = useContractBalance();
  
  // Create schedule mutation
  const createMutation = useCreateVestingSchedule();

  const vestingData = generateVestingData(amount, cliffMonths, vestingMonths);
  const monthlyVesting = amount / (vestingMonths - cliffMonths);

  const validateAddress = (address: string) => {
    if (address.length === 0) {
      setIsValidAddress(null);
      return;
    }
    setIsValidAddress(isValidStacksAddress(address));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a vesting schedule",
        variant: "destructive",
      });
      return;
    }
    
    if (!beneficiary || beneficiary.trim().length === 0) {
      toast({
        title: "Beneficiary required",
        description: "Please enter a beneficiary address",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidAddress) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Stacks address (starts with SP or ST)",
        variant: "destructive",
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!hasSufficientBalance) {
      toast({
        title: "Insufficient balance",
        description: `Contract balance (${balance.toLocaleString()} STX) is less than amount (${amount.toLocaleString()} STX)`,
        variant: "destructive",
      });
      return;
    }
    
    if (vestingMonths <= cliffMonths) {
      toast({
        title: "Invalid duration",
        description: "Vesting duration must be greater than cliff period",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Convert months to blocks (approx 144 blocks per day, 30 days per month)
      const cliffBlocks = cliffMonths * 30 * 144;
      const vestingBlocks = vestingMonths * 30 * 144;
      
      toast({
        title: "Creating schedule...",
        description: "Please confirm the transaction in your wallet",
      });
      
      const txId = await createMutation.mutateAsync({
        beneficiary,
        totalAmount: amount,
        cliffDuration: cliffBlocks,
        vestingDuration: vestingBlocks,
      });
      
      toast({
        title: "✅ Schedule created successfully!",
        description: (
          <div className="space-y-1">
            <p>Transaction ID: {txId.slice(0, 12)}...{txId.slice(-8)}</p>
            <p className="text-xs text-muted-foreground">Redirecting to schedules...</p>
          </div>
        ),
      });
      
      // Navigate to schedules page after success
      setTimeout(() => navigate("/schedules"), 2500);
    } catch (error: any) {
      console.error('Create schedule error:', error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error.message) {
        if (error.message.includes('User rejected')) {
          errorMessage = "Transaction was cancelled by user";
        } else if (error.message.includes('Insufficient')) {
          errorMessage = "Insufficient funds to complete transaction";
        } else if (error.message.includes('already exists')) {
          errorMessage = "A schedule already exists for this beneficiary";
        } else if (error.message.includes('Unauthorized') || error.message.includes('owner-only')) {
          errorMessage = "Only the contract owner can create schedules";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "❌ Failed to create schedule",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const balance = contractBalance ? Number(contractBalance) / 1_000_000 : 0;
  const hasSufficientBalance = balance >= amount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Beneficiary Input */}
            <div className="space-y-1.5">
              <Label className="label-caps text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Beneficiary Address
              </Label>
              <div className="relative">
                <Input
                  placeholder="SP2ABC..."
                  value={beneficiary}
                  onChange={(e) => {
                    setBeneficiary(e.target.value);
                    validateAddress(e.target.value);
                  }}
                  className={cn(
                    "font-mono text-xs sm:text-sm bg-secondary/50 border-border h-9 sm:h-10 pr-10",
                    isValidAddress === true && "border-success/50",
                    isValidAddress === false && "border-destructive/50"
                  )}
                />
                {isValidAddress !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValidAddress ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              {isValidAddress === false && (
                <p className="text-[10px] text-destructive">Invalid Stacks address format</p>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label className="label-caps text-[10px] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                Amount (STX)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="font-mono text-xs sm:text-sm bg-secondary/50 border-border h-9 sm:h-10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                  STX
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Contract Balance: {balanceLoading ? (
                  <Loader2 className="inline w-3 h-3 animate-spin" />
                ) : (
                  <span className={hasSufficientBalance ? "text-success" : "text-destructive"}>
                    {balance.toLocaleString()} STX
                  </span>
                )}
                {!balanceLoading && (hasSufficientBalance ? " ✓ Sufficient" : " ✗ Insufficient")}
              </p>
            </div>

            {/* Cliff Period */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="label-caps text-[10px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Cliff Period
                </Label>
                <span className="font-mono text-xs text-foreground">{cliffMonths} months</span>
              </div>
              <Slider
                value={[cliffMonths]}
                onValueChange={([value]) => setCliffMonths(value)}
                max={24}
                min={0}
                step={1}
                className="py-1"
              />
            </div>

            {/* Vesting Duration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="label-caps text-[10px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Vesting Duration
                </Label>
                <span className="font-mono text-xs text-foreground">{vestingMonths} months</span>
              </div>
              <Slider
                value={[vestingMonths]}
                onValueChange={([value]) => setVestingMonths(Math.max(value, cliffMonths + 1))}
                max={48}
                min={cliffMonths + 1}
                step={1}
                className="py-1"
              />
            </div>

            {/* Validation Warnings */}
            {!isConnected && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-warning">Wallet Not Connected</p>
                  <p className="text-warning/80 mt-0.5">Connect your wallet to create a vesting schedule</p>
                </div>
              </div>
            )}
            
            {isConnected && !hasSufficientBalance && balance > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-destructive">Insufficient Contract Balance</p>
                  <p className="text-destructive/80 mt-0.5">
                    Contract has {balance.toLocaleString()} STX but needs {amount.toLocaleString()} STX. 
                    Please fund the contract first.
                  </p>
                </div>
              </div>
            )}
            
            {isConnected && balance === 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-destructive">Contract Not Funded</p>
                  <p className="text-destructive/80 mt-0.5">
                    The contract has 0 STX. Please fund it before creating schedules.
                  </p>
                </div>
              </div>
            )}

            {/* Create Button */}
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full mt-3 sm:mt-4 h-10 sm:h-11 text-sm sm:text-base"
              onClick={handleSubmit}
              disabled={!isConnected || !isValidAddress || createMutation.isPending || !hasSufficientBalance || amount <= 0}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Schedule...
                </>
              ) : !isConnected ? (
                "Connect Wallet First"
              ) : !hasSufficientBalance ? (
                "Insufficient Balance"
              ) : (
                "Create Vesting Schedule"
              )}
            </Button>
            
            {createMutation.isPending && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                Waiting for wallet confirmation...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Visual Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Chart */}
            <div className="h-[180px] sm:h-[200px] w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vestingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="previewVestedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(187, 94%, 53%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(187, 94%, 53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="previewLockedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(262, 83%, 66%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(262, 83%, 66%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 9 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 9 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {cliffMonths > 0 && (
                    <ReferenceLine 
                      x={vestingData[cliffMonths]?.month} 
                      stroke="hsl(45, 93%, 58%)" 
                      strokeDasharray="5 5" 
                      label={{ 
                        value: 'Cliff', 
                        fill: 'hsl(45, 93%, 58%)', 
                        fontSize: 9,
                        position: 'top'
                      }} 
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="vested"
                    stackId="1"
                    stroke="hsl(187, 94%, 53%)"
                    strokeWidth={2}
                    fill="url(#previewVestedGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="locked"
                    stackId="1"
                    stroke="hsl(262, 83%, 66%)"
                    strokeWidth={2}
                    fill="url(#previewLockedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="text-center">
                <p className="label-caps text-[9px] sm:text-[10px] mb-0.5">Cliff</p>
                <p className="font-mono text-xs sm:text-sm font-semibold">{cliffMonths} mo</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="label-caps text-[9px] sm:text-[10px] mb-0.5">Duration</p>
                <p className="font-mono text-xs sm:text-sm font-semibold">{vestingMonths} mo</p>
              </div>
              <div className="text-center">
                <p className="label-caps text-[9px] sm:text-[10px] mb-0.5">Monthly</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-primary">
                  {(monthlyVesting / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 p-2 sm:p-3 rounded-lg bg-secondary/20">
              <p className="label-caps text-[10px] mb-2">Schedule Summary</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-mono">Block {'{current}'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cliff Period</span>
                <span className="font-mono">{cliffMonths * 30 * 144} blocks (~{cliffMonths} months)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Duration</span>
                <span className="font-mono">{vestingMonths * 30 * 144} blocks (~{vestingMonths} months)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Vesting After Cliff</span>
                <span className="font-mono">{(vestingMonths - cliffMonths) * 30 * 144} blocks</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Est. Gas Fee</span>
                <span className="font-mono text-muted-foreground">~0.005-0.01 STX</span>
              </div>
            </div>
            
            {/* Important Notes */}
            <div className="space-y-2 p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-[10px] space-y-1">
                  <p className="font-medium text-primary">Important Notes:</p>
                  <ul className="text-muted-foreground space-y-1 ml-2">
                    <li>• Tokens vest linearly after cliff period</li>
                    <li>• Beneficiary can claim anytime after vesting starts</li>
                    <li>• Schedule can be revoked by contract owner</li>
                    <li>• Only one schedule per beneficiary</li>
                    <li>• Contract must be funded before creation</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
