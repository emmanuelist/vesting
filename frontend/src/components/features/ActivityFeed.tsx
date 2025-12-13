import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Coins, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "claim",
    title: "Marcus claimed tokens",
    amount: "25,000 STX",
    time: "2 minutes ago",
    icon: CheckCircle,
    color: "success",
  },
  {
    id: 2,
    type: "create",
    title: "New schedule created",
    amount: "100,000 STX",
    time: "1 hour ago",
    icon: PlusCircle,
    color: "primary",
  },
  {
    id: 3,
    type: "fund",
    title: "Contract funded",
    amount: "500,000 STX",
    time: "3 hours ago",
    icon: Coins,
    color: "accent",
  },
  {
    id: 4,
    type: "revoke",
    title: "Schedule revoked",
    amount: "50,000 STX",
    time: "1 day ago",
    icon: AlertTriangle,
    color: "warning",
  },
];

export function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glass" className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <button className="text-xs text-primary hover:underline">View all</button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className={cn(
                "p-1.5 rounded-lg shrink-0",
                activity.color === "success" && "bg-success/10 text-success",
                activity.color === "primary" && "bg-primary/10 text-primary",
                activity.color === "accent" && "bg-accent/10 text-accent",
                activity.color === "warning" && "bg-warning/10 text-warning",
              )}>
                <activity.icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.time}
                </p>
              </div>
              <span className="font-mono text-sm text-foreground shrink-0">
                {activity.amount}
              </span>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
