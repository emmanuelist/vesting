import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
  variant?: "default" | "primary" | "accent";
}

export function StatCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  delay = 0,
  variant = "default" 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      <Card 
        variant="glassHover" 
        className={cn(
          "p-3 sm:p-4 relative overflow-hidden",
          variant === "primary" && "border-primary/30",
          variant === "accent" && "border-accent/30"
        )}
      >
        {/* Glow Effect */}
        <div 
          className={cn(
            "absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 rounded-full blur-3xl opacity-20",
            variant === "primary" && "bg-primary",
            variant === "accent" && "bg-accent",
            variant === "default" && "bg-muted"
          )}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <span className="label-caps text-[9px] sm:text-[10px]">{label}</span>
            <div className={cn(
              "p-1 sm:p-1.5 rounded-lg",
              variant === "primary" && "bg-primary/10 text-primary",
              variant === "accent" && "bg-accent/10 text-accent",
              variant === "default" && "bg-secondary text-muted-foreground"
            )}>
              <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>

          {/* Value */}
          <div className="space-y-0.5">
            <h3 className="stat-number text-lg sm:text-xl">{value}</h3>
            {subValue && (
              <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">{subValue}</p>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div className={cn(
              "mt-3 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
