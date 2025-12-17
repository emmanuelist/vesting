import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const vestingData = [
  { month: "Jan", vested: 0, locked: 250000 },
  { month: "Feb", vested: 0, locked: 250000 },
  { month: "Mar", vested: 0, locked: 250000 },
  { month: "Apr", vested: 0, locked: 250000 },
  { month: "May", vested: 0, locked: 250000 },
  { month: "Jun", vested: 0, locked: 250000 },
  { month: "Jul", vested: 41667, locked: 208333 },
  { month: "Aug", vested: 83333, locked: 166667 },
  { month: "Sep", vested: 125000, locked: 125000 },
  { month: "Oct", vested: 166667, locked: 83333 },
  { month: "Nov", vested: 208333, locked: 41667 },
  { month: "Dec", vested: 250000, locked: 0 },
];

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glass" className="p-5">
        <CardHeader className="p-0 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Vesting Timeline</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Token distribution over time</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Vested</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground">Locked</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[260px] w-full">
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
