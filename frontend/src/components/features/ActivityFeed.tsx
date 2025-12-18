import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Coins, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVestingEvent } from "@/hooks/useVestingData";
import { microStxToStx, truncateAddress } from "@/lib/stacks-utils";
import { useMemo } from "react";

interface Activity {
  id: number;
  type: string;
  title: string;
  amount: string;
  time: string;
  icon: any;
  color: string;
}

const eventTypeConfig = {
  created: { icon: PlusCircle, color: "primary", label: "Schedule created" },
  claimed: { icon: CheckCircle, color: "success", label: "Tokens claimed" },
  funded: { icon: Coins, color: "accent", label: "Contract funded" },
  revoked: { icon: AlertTriangle, color: "warning", label: "Schedule revoked" },
};

function useRecentActivities(count: number = 4): Activity[] {
  // Fetch recent events (IDs are sequential, so fetch last N events)
  // Note: This is a simplified implementation - ideally we'd have an endpoint
  // to get the latest event IDs or a counter
  const events = [
    useVestingEvent(0),
    useVestingEvent(1),
    useVestingEvent(2),
    useVestingEvent(3),
  ];

  return useMemo(() => {
    const activities: Activity[] = [];
    
    events.forEach((eventQuery, index) => {
      if (eventQuery.data) {
        const event = eventQuery.data;
        const config = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig] || eventTypeConfig.created;
        
        activities.push({
          id: index,
          type: event.event_type,
          title: `${truncateAddress(event.beneficiary)} - ${config.label}`,
          amount: `${Number(microStxToStx(event.amount)).toLocaleString()} STX`,
          time: `Block ${event.timestamp}`,
          icon: config.icon,
          color: config.color,
        });
      }
    });

    return activities;
  }, [events]);
}

export function ActivityFeed() {
  const activities = useRecentActivities();
  const hasActivities = activities.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glass" className="h-full">
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">Recent Activity</CardTitle>
              {!hasActivities && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">No events yet</p>}
            </div>
            <button className="text-[10px] sm:text-xs text-primary hover:underline">View all</button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {!hasActivities ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
              No recent activity
            </div>
          ) : (
            activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className={cn(
                "p-1 sm:p-1.5 rounded-lg shrink-0",
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
          )))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
