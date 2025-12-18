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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { 
  Coins, 
  Calendar, 
  Clock, 
  PlusCircle, 
  Wallet, 
  BarChart3,
  ArrowUpRight,
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useContractBalance, useTotalSchedules } from "@/hooks/useVestingData";

type ViewMode = "admin" | "beneficiary";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("admin");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16 sm:pt-20 pb-6 sm:pb-10 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* View Mode Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6"
          >
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                {viewMode === "admin" ? "Dashboard" : "My Vesting"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {viewMode === "admin" 
                  ? "Manage vesting schedules and monitor activity" 
                  : "Track your token vesting progress"
                }
              </p>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-lg bg-secondary/50 border border-border">
              <button
                onClick={() => setViewMode("admin")}
                className={cn(
                  "px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap",
                  viewMode === "admin" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="hidden xs:inline">Admin View</span>
                <span className="xs:hidden">Admin</span>
              </button>
              <button
                onClick={() => setViewMode("beneficiary")}
                className={cn(
                  "px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap",
                  viewMode === "beneficiary" 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="hidden xs:inline">Beneficiary View</span>
                <span className="xs:hidden">Beneficiary</span>
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
  
  // Fetch real blockchain data
  const { data: contractBalance, error: balanceError, isLoading: balanceLoading } = useContractBalance();
  const { data: totalSchedules, error: schedulesError, isLoading: schedulesLoading } = useTotalSchedules();
  
  // Check if contract is deployed
  const contractNotDeployed = 
    balanceError?.message?.includes('NoSuchContract') || 
    schedulesError?.message?.includes('NoSuchContract');

  const handleFund = async (amount: number) => {
    // Fund is handled by the modal
  };
  
  // Use real data only, show 0 or "..." when loading
  const tvl = contractBalance ? Number(contractBalance) / 1_000_000 : 0;
  const scheduleCount = totalSchedules ?? 0;
  const isLoading = balanceLoading || schedulesLoading;

  return (
    <>
      <div className="space-y-5">
        {/* Contract not deployed warning */}
        {contractNotDeployed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Contract Connection Issue</AlertTitle>
            <AlertDescription>
              Cannot connect to the vesting contract. Ensure your wallet is on <strong>Mainnet</strong> (contract address: SPHB047A30W99178TR7KE0784C2GV22070JTKX8.vesting).
            </AlertDescription>
          </Alert>
        )}
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          <StatCard
            label="Total Value Locked"
            value={isLoading ? "..." : `${tvl.toLocaleString()} STX`}
            subValue={isLoading ? "Loading..." : `≈ $${(tvl * 1.93).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`}
            icon={Coins}
            delay={0}
            variant="primary"
          />
          <StatCard
            label="Active Schedules"
            value={isLoading ? "..." : scheduleCount.toString()}
            subValue={isLoading ? "Loading..." : `${scheduleCount} vesting ${scheduleCount === 1 ? 'schedule' : 'schedules'}`}
            icon={Calendar}
            delay={0.1}
          />
          <StatCard
            label="Contract Status"
            value={contractNotDeployed ? "Not Deployed" : isLoading ? "..." : "Live"}
            subValue={contractNotDeployed ? "Deploy required" : isLoading ? "Checking..." : "On Mainnet"}
            icon={Clock}
            delay={0.2}
            variant={contractNotDeployed ? "default" : "accent"}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-1.5 sm:gap-2"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
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
    <div className="space-y-3 sm:space-y-4">
      {/* Vesting Progress Hero */}
      <VestingProgress />

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
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
