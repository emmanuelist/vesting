import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContractBalance, useTotalSchedules } from "@/hooks/useVestingData";

const HeroSection = () => {
  const { data: contractBalance, isLoading: isBalanceLoading } = useContractBalance();
  const { data: totalSchedules, isLoading: isSchedulesLoading } = useTotalSchedules();

  // Calculate TVL in USD (using approximate STX price of $0.45)
  const tvlInUSD = contractBalance ? (contractBalance / 1_000_000) * 0.45 : 0;
  const formattedTVL = isBalanceLoading 
    ? "..." 
    : `$${(tvlInUSD / 1_000_000).toFixed(1)}M${tvlInUSD >= 1_000_000 ? '+' : ''}`;
  
  const formattedSchedules = isSchedulesLoading 
    ? "..." 
    : `${totalSchedules}${totalSchedules >= 100 ? '+' : ''}`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Secure Token Vesting Platform</span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Token Vesting</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create, manage, and track token vesting schedules with ease. 
            Secure smart contracts, real-time tracking, and complete transparency for teams and investors.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/dashboard">
                Launch App
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
              <a href="#features">Learn More</a>
            </Button>
          </div>

          {/* Live stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {formattedTVL}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Value Locked</div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="text-2xl md:text-3xl font-bold text-accent">
                {formattedSchedules}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Active Schedules</div>
            </div>
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="text-2xl md:text-3xl font-bold text-primary">99.9%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Uptime</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
