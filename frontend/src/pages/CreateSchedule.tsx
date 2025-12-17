import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { ScheduleCreationForm } from "@/components/features/ScheduleCreationForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CreateSchedule = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-5"
          >
            <h1 className="text-xl font-semibold text-foreground">
              Create Vesting Schedule
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Set up a new token vesting schedule for a beneficiary
            </p>
          </motion.div>

          {/* Form */}
          <ScheduleCreationForm />
        </div>
      </main>
    </div>
  );
};

export default CreateSchedule;
