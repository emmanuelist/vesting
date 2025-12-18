import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useWallet } from "@/contexts/WalletContext";
import { useVestingData } from "@/hooks/useVestingData";
import { microStxToStx } from "@/lib/stacks-utils";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

function generateVestingTimeline(schedule: any) {
  if (!schedule) return [];
  
  const totalAmount = Number(microStxToStx(schedule.totalAmount));
  const cliffMonths = Math.floor(Number(schedule.cliffDuration) / (144 * 30)); // Approximate months
  const vestingMonths = Math.floor(Number(schedule.vestingDuration) / (144 * 30));
  const monthlyVesting = totalAmount / vestingMonths;
  
  const timeline = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 0; i <= 12; i++) {
    let vested = 0;
    
    if (i < cliffMonths) {
      vested = 0;
    } else if (i >= vestingMonths + cliffMonths) {
      vested = totalAmount;
    } else {
      vested = monthlyVesting * (i - cliffMonths);
    }
    
    timeline.push({
      month: months[i % 12],
      vested: Math.round(vested),
      locked: Math.round(totalAmount - vested),
    });
  }
  
  return timeline;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border border-border/50 rounded-lg">
        <p className="label-caps mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="text-primary font-mono">●</span>{" "}
            <span className="text-muted-foreground">Vested:</span>{" "}
            <span className="font-mono font-medium text-foreground">
              {payload[0]?.value?.toLocaleString()} STX
            </span>
          </p>
          <p className="text-sm">
            <span className="text-accent font-mono">●</span>{" "}
            <span className="text-muted-foreground">Locked:</span>{" "}
            <span className="font-mono font-medium text-foreground">
              {payload[1]?.value?.toLocaleString()} STX
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function VestingChart() {
  const { userAddress } = useWallet();
  const { schedule, isLoading } = useVestingData(userAddress);
  
  const vestingData = useMemo(() => {
    if (schedule) {
      return generateVestingTimeline(schedule);
    }
    // Default sample data if no schedule
    return [
      { month: "M1", vested: 0, locked: 100000 },
      { month: "M2", vested: 0, locked: 100000 },
      { month: "M3", vested: 0, locked: 100000 },
      { month: "M4", vested: 16667, locked: 83333 },
      { month: "M5", vested: 33333, locked: 66667 },
      { month: "M6", vested: 50000, locked: 50000 },
      { month: "M7", vested: 66667, locked: 33333 },
      { month: "M8", vested: 83333, locked: 16667 },
      { month: "M9", vested: 100000, locked: 0 },
    ];
  }, [schedule]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card variant="glass" className="p-3 sm:p-5">
          <div className="flex items-center justify-center h-[250px] sm:h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glass" className="p-3 sm:p-5">
        <CardHeader className="p-0 pb-3 sm:pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold">Vesting Timeline</CardTitle>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {schedule ? "Your token distribution over time" : "Example vesting schedule"}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-primary" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Vested</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-accent" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Locked</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[220px] sm:h-[260px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vestingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="vestedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(187, 94%, 53%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(187, 94%, 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lockedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(262, 83%, 66%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(262, 83%, 66%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  x="Jun" 
                  stroke="hsl(45, 93%, 58%)" 
                  strokeDasharray="5 5" 
                  label={{ 
                    value: 'Cliff', 
                    fill: 'hsl(45, 93%, 58%)', 
                    fontSize: 11,
                    position: 'top'
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="vested"
                  stackId="1"
                  stroke="hsl(187, 94%, 53%)"
                  strokeWidth={2}
                  fill="url(#vestedGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="locked"
                  stackId="1"
                  stroke="hsl(262, 83%, 66%)"
                  strokeWidth={2}
                  fill="url(#lockedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
