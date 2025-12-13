import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingUp, Clock } from "lucide-react";

export function NextMilestone() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glassHover" className="p-4 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-warning/20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <span className="label-caps text-[10px]">Next Milestone</span>
            <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1 mb-3">
            <h3 className="text-2xl font-mono font-thin text-foreground">75%</h3>
            <p className="text-xs text-muted-foreground">vesting completion</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">in</span>
            <span className="font-mono font-semibold text-warning">23 days</span>
          </div>

          {/* Progress to milestone */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Progress to 75%</span>
              <span className="font-mono">87%</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "87%" }}
                transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-warning"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
