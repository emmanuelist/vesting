import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "VestFlow made our token distribution seamless. The cliff and linear vesting features are exactly what we needed for our team allocation.",
    author: "Sarah Chen",
    role: "CEO",
    company: "DeFi Protocol",
    avatar: "SC",
  },
  {
    quote: "We've tried several vesting platforms, but VestFlow's real-time tracking and analytics are unmatched. Our investors love the transparency.",
    author: "Marcus Johnson",
    role: "CFO",
    company: "Web3 Startup",
    avatar: "MJ",
  },
  {
    quote: "Setting up vesting schedules for 50+ team members took less than an hour. The multi-beneficiary support is a game-changer.",
    author: "Elena Rodriguez",
    role: "Operations Lead",
    company: "GameFi Studio",
    avatar: "ER",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by <span className="text-primary">Leading Teams</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience with VestFlow.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/90 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
