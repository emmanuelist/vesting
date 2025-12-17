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
import { User, Coins, Clock, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const vestingData = generateVestingData(amount, cliffMonths, vestingMonths);
  const monthlyVesting = amount / (vestingMonths - cliffMonths);

  const validateAddress = (address: string) => {
    // Simple validation for Stacks addresses
    if (address.length === 0) {
      setIsValidAddress(null);
      return;
    }
    setIsValidAddress(address.startsWith("SP") && address.length >= 10);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card variant="glass" className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    "font-mono text-sm bg-secondary/50 border-border h-10 pr-10",
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
                  className="font-mono text-sm bg-secondary/50 border-border h-10 pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">
                  STX
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Contract Balance: <span className="text-success">500,000 STX</span> ✓ Sufficient
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

            {/* Create Button */}
            <Button variant="hero" size="lg" className="w-full mt-4">
              Create Vesting Schedule
            </Button>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Visual Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart */}
            <div className="h-[200px] w-full">
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
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="text-center">
                <p className="label-caps text-[10px] mb-0.5">Cliff</p>
                <p className="font-mono text-sm font-semibold">{cliffMonths} mo</p>
              </div>
              <div className="text-center border-x border-border/50">
                <p className="label-caps text-[10px] mb-0.5">Duration</p>
                <p className="font-mono text-sm font-semibold">{vestingMonths} mo</p>
              </div>
              <div className="text-center">
                <p className="label-caps text-[10px] mb-0.5">Monthly</p>
                <p className="font-mono text-sm font-semibold text-primary">
                  {(monthlyVesting / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-mono">Today</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cliff Ends</span>
                <span className="font-mono">{vestingData[cliffMonths]?.month}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fully Vested</span>
                <span className="font-mono">{vestingData[vestingMonths]?.month}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Est. Gas Fee</span>
                <span className="font-mono text-muted-foreground">~0.01 STX</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
