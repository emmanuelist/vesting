import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, TrendingDown, Users, Coins, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const monthlyData = [
  { month: "Jul", vested: 45000, claimed: 32000 },
  { month: "Aug", vested: 52000, claimed: 41000 },
  { month: "Sep", vested: 61000, claimed: 48000 },
  { month: "Oct", vested: 75000, claimed: 59000 },
  { month: "Nov", vested: 88000, claimed: 71000 },
  { month: "Dec", vested: 102000, claimed: 85000 },
];

const statusData = [
  { name: "Active", value: 18, color: "hsl(142, 76%, 46%)" },
  { name: "Completed", value: 8, color: "hsl(187, 94%, 53%)" },
  { name: "Pending", value: 4, color: "hsl(45, 93%, 58%)" },
  { name: "Revoked", value: 2, color: "hsl(0, 84%, 60%)" },
];

const topBeneficiaries = [
  { address: "SP2ABC...XYZ", amount: 250000 },
  { address: "SP3DEF...UVW", amount: 150000 },
  { address: "SP4GHI...RST", amount: 100000 },
  { address: "SP5JKL...MNO", amount: 75000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-2 border border-border/50 rounded-lg text-xs">
        <p className="label-caps mb-1">{label}</p>
        <div className="space-y-0.5">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center gap-1.5">
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-mono font-medium">{entry.value?.toLocaleString()}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function AnalyticsModal({ open, onOpenChange }: AnalyticsModalProps) {
  const [timeframe, setTimeframe] = useState<"6m" | "1y" | "all">("6m");
  const { toast } = useToast();

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      timeframe,
      summary: {
        totalVested: 423000,
        totalClaimed: 336000,
        beneficiaries: 32,
        avgDuration: "18 months",
      },
      statusDistribution: statusData,
      monthlyData,
      topBeneficiaries,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Analytics report saved as JSON",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Analytics Overview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Time Filter */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-secondary/50 border border-border w-fit">
            {(["6m", "1y", "all"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  timeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tf === "6m" ? "6 Months" : tf === "1y" ? "1 Year" : "All Time"}
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span className="label-caps text-[10px]">Total Vested</span>
              </div>
              <p className="font-mono text-lg font-semibold">423K STX</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-[10px] text-success">+15.3%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-3.5 h-3.5 text-accent" />
                <span className="label-caps text-[10px]">Total Claimed</span>
              </div>
              <p className="font-mono text-lg font-semibold">336K STX</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-[10px] text-success">+22.1%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="label-caps text-[10px]">Beneficiaries</span>
              </div>
              <p className="font-mono text-lg font-semibold">32</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-[10px] text-success">+4</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="label-caps text-[10px]">Avg Duration</span>
              </div>
              <p className="font-mono text-lg font-semibold">18 mo</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingDown className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">-2 mo</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Vesting Trend Chart */}
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
              <h4 className="label-caps text-[10px] mb-3">Vesting & Claims Over Time</h4>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vestedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(187, 94%, 53%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(187, 94%, 53%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="claimedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(262, 83%, 66%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(262, 83%, 66%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="vested"
                      stroke="hsl(187, 94%, 53%)"
                      strokeWidth={2}
                      fill="url(#vestedGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="claimed"
                      stroke="hsl(262, 83%, 66%)"
                      strokeWidth={2}
                      fill="url(#claimedGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
              <h4 className="label-caps text-[10px] mb-3">Schedule Status Distribution</h4>
              <div className="h-[180px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                      <span className="font-mono text-xs font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Beneficiaries */}
          <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
            <h4 className="label-caps text-[10px] mb-3">Top Beneficiaries by Allocation</h4>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBeneficiaries} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="address" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(187, 94%, 53%)" 
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="default" size="sm" onClick={handleExportReport}>
              Export Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}