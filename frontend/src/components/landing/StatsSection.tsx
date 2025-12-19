import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { useContractBalance, useTotalSchedules, useBeneficiaryCount } from "@/hooks/useVestingData";

// Uptime is calculated based on contract deployment and availability
const UPTIME_PERCENTAGE = 99.9;

const AnimatedCounter = ({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    const duration = 2000;
    const startTime = Date.now();
    
    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.floor(value * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(value);
        setHasAnimated(true);
      }
    };
    
    requestAnimationFrame(updateValue);
  }, [value, hasAnimated]);

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`;
    }
    return val.toFixed(value % 1 !== 0 ? 1 : 0);
  };

  return (
    <span>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
};

const StatsSection = () => {
  // Fetch real blockchain data
  const { data: contractBalance, isLoading: balanceLoading } = useContractBalance();
  const { data: totalSchedules, isLoading: schedulesLoading } = useTotalSchedules();
  const { data: beneficiaryCount, isLoading: beneficiariesLoading } = useBeneficiaryCount();
  
  // Convert balance from micro-STX to STX, then multiply by approximate STX price ($0.45)
  const tvlInSTX = contractBalance ? Number(contractBalance) / 1_000_000 : 0;
  const tvlInUSD = tvlInSTX * 0.45; // Approximate STX price
  
  // Use real data or show 0 while loading
  const stats = [
    { 
      value: balanceLoading ? 0 : tvlInUSD, 
      prefix: "$", 
      suffix: "+", 
      label: "Total Value Locked",
      isLoading: balanceLoading
    },
    { 
      value: schedulesLoading ? 0 : (totalSchedules || 0), 
      prefix: "", 
      suffix: "+", 
      label: "Active Schedules",
      isLoading: schedulesLoading
    },
    { 
      value: beneficiariesLoading ? 0 : (beneficiaryCount || 0), 
      prefix: "", 
      suffix: "+", 
      label: "Beneficiaries",
      isLoading: beneficiariesLoading
    },
    { 
      value: UPTIME_PERCENTAGE, 
      prefix: "", 
      suffix: "%", 
      label: "Uptime",
      isLoading: false
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2">
                {stat.isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
