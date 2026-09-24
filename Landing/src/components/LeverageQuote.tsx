import React from 'react';
import { motion } from 'framer-motion';

export const LeverageQuote: React.FC = () => {
  return (
    <section className="py-28 bg-[#faf9f5] border-t border-[#e4e2d9] relative overflow-hidden text-center">
      {/* Soft radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c8e1dd]/40 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs uppercase tracking-widest font-semibold-custom text-[#387478] mb-6 block">
            Engineering Thesis
          </span>

          <h2 className="font-serif-custom text-3xl sm:text-5xl md:text-6xl font-normal text-[#2b2b29] leading-[1.2] mb-8">
            "Compute what can be calculated, <br className="hidden sm:inline" />
            use AI where judgment is <span className="italic font-serif-custom text-[#387478]">irreplaceable."</span>
          </h2>

          <p className="text-base sm:text-lg text-[#494444] font-sans-custom max-w-xl mx-auto">
            Deterministic code verifies 100% requirement coverage and edit persistence. LLMs synthesize company signals, but verifiable algorithms ensure nothing slips through.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
