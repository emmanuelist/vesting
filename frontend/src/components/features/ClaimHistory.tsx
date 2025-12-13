import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimHistoryItem {
  id: string;
  amount: number;
  date: string;
  txHash: string;
  status: "confirmed" | "pending" | "failed";
}

const claimHistory: ClaimHistoryItem[] = [
  {
    id: "1",
    amount: 25000,
    date: "Dec 11, 2025",
    txHash: "0x1a2b...3c4d",
    status: "confirmed",
  },
  {
    id: "2",
    amount: 20000,
    date: "Nov 15, 2025",
    txHash: "0x5e6f...7g8h",
    status: "confirmed",
  },
  {
    id: "3",
    amount: 15000,
    date: "Oct 12, 2025",
    txHash: "0x9i0j...k1l2",
    status: "confirmed",
  },
  {
    id: "4",
    amount: 10000,
    date: "Sep 8, 2025",
    txHash: "0xm3n4...o5p6",
    status: "confirmed",
  },
];

const statusIcons = {
  confirmed: CheckCircle,
  pending: Clock,
  failed: AlertTriangle,
};

const statusColors = {
  confirmed: "text-success",
  pending: "text-warning",
  failed: "text-destructive",
};

export function ClaimHistory() {
  const totalClaimed = claimHistory.reduce((acc, item) => acc + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card variant="glass">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Claim History</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total: <span className="text-primary font-mono">{totalClaimed.toLocaleString()} STX</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {claimHistory.map((item, index) => {
            const StatusIcon = statusIcons[item.status];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-1.5 rounded-lg bg-secondary",
                    statusColors[item.status]
                  )}>
                    <StatusIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-medium">
                      +{item.amount.toLocaleString()} STX
                    </p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <a
                  href={`https://explorer.stacks.co/txid/${item.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  {item.txHash}
                </a>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
