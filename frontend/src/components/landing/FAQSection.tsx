import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is token vesting?",
    answer: "Token vesting is a mechanism that releases tokens to beneficiaries gradually over time, rather than all at once. This helps ensure long-term commitment and prevents market manipulation from sudden token dumps.",
  },
  {
    question: "How does the cliff period work?",
    answer: "A cliff period is an initial waiting time before any tokens are released. For example, with a 6-month cliff, no tokens will be unlocked until 6 months have passed. After the cliff, tokens begin vesting according to the schedule.",
  },
  {
    question: "Are my tokens secure?",
    answer: "Yes, all tokens are held in audited smart contracts. Once deposited, tokens can only be claimed by the designated beneficiaries according to the vesting schedule. The contracts are immutable and transparent.",
  },
  {
    question: "Can I modify a vesting schedule after creation?",
    answer: "Vesting schedules are designed to be immutable for security and trust. However, admins can revoke unvested tokens if the schedule was created with revocation enabled. Vested tokens always belong to the beneficiary.",
  },
  {
    question: "How do beneficiaries claim their tokens?",
    answer: "Beneficiaries can claim their vested tokens anytime through the dashboard. Simply connect your wallet, view your available balance, and click 'Claim' to receive your unlocked tokens directly to your wallet.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about token vesting with VestFlow.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
