import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/features/StatCard";
import { VestingChart } from "@/components/features/VestingChart";
import { ActivityFeed } from "@/components/features/ActivityFeed";
import { VestingProgress } from "@/components/features/VestingProgress";
import { SchedulesList } from "@/components/features/SchedulesList";
import { ClaimHistory } from "@/components/features/ClaimHistory";
import { NextMilestone } from "@/components/features/NextMilestone";
import { FundContractModal } from "@/components/modals/FundContractModal";
import { AnalyticsModal } from "@/components/modals/AnalyticsModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Coins, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Wallet, 
  BarChart3,
  ArrowUpRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "admin" | "beneficiary";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("admin");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* View Mode Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {viewMode === "admin" ? "Dashboard" : "My Vesting"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {viewMode === "admin" 
                  ? "Manage vesting schedules and monitor activity" 
                  : "Track your token vesting progress"
                }
              </p>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary/50 border border-border">
              <button
                onClick={() => setViewMode("admin")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  viewMode === "admin" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Admin View
              </button>
              <button
                onClick={() => setViewMode("beneficiary")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                  viewMode === "beneficiary" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Beneficiary View
              </button>
            </div>
          </motion.div>

          {viewMode === "admin" ? <AdminDashboard /> : <BeneficiaryDashboard />}
        </div>
      </main>
    </div>
  );
};

function AdminDashboard() {
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  const handleFund = async (amount: number) => {
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <>
      <div className="space-y-5">
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-3">
          <StatCard
            label="Total Value Locked"
            value="1,245,000"
            subValue="≈ $2.4M USD"
            icon={Coins}
            trend={{ value: "+12.5%", isPositive: true }}
            delay={0}
            variant="primary"
          />
          <StatCard
            label="Active Schedules"
            value="24"
            subValue="across 18 beneficiaries"
            icon={Calendar}
            delay={0.1}
          />
          <StatCard
            label="Pending Claims"
            value="3"
            subValue="45,000 STX available"
            icon={Clock}
            delay={0.2}
            variant="accent"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-2"
        >
          <Link to="/create">
            <Button variant="hero" size="sm" className="gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Create Schedule
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFundModalOpen(true)}>
            <Wallet className="w-3.5 h-3.5" />
            Fund Contract
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAnalyticsModalOpen(true)}>
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </Button>
        </motion.div>

        {/* Chart and Activity */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <VestingChart />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* Schedules Table */}
        <SchedulesList />
      </div>

      <FundContractModal
        open={fundModalOpen}
        onOpenChange={setFundModalOpen}
        onFund={handleFund}
      />

      <AnalyticsModal
        open={analyticsModalOpen}
        onOpenChange={setAnalyticsModalOpen}
      />
    </>
  );
}

function BeneficiaryDashboard() {
  return (
    <div className="space-y-4">
      {/* Vesting Progress Hero */}
      <VestingProgress />

      {/* Additional Info */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VestingChart />
        </div>
        <div className="space-y-4">
          <NextMilestone />
          <ClaimHistory />
        </div>
      </div>
    </div>
  );
}

export default Index;
