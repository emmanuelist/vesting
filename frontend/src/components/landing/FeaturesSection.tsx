import { Clock, BarChart3, TrendingUp, Shield, Users, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Clock,
    title: "Time-Locked Distribution",
    description: "Set precise vesting periods with customizable start dates and durations.",
  },
  {
    icon: BarChart3,
    title: "Cliff Periods",
    description: "Configure cliff periods before tokens begin unlocking for your beneficiaries.",
  },
  {
    icon: TrendingUp,
    title: "Linear Vesting",
    description: "Smooth, predictable token releases with linear vesting curves.",
  },
  {
    icon: Shield,
    title: "Secure Smart Contracts",
    description: "Audited contracts ensure your tokens are safe and distributed correctly.",
  },
  {
    icon: Users,
    title: "Multi-Beneficiary Support",
    description: "Create schedules for multiple beneficiaries with individual parameters.",
  },
  {
    icon: Smartphone,
    title: "Real-time Tracking",
    description: "Monitor vesting progress, claims, and analytics from any device.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="text-primary">Token Vesting</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make token distribution simple, secure, and transparent.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
