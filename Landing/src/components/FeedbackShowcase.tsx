import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Sliders } from 'lucide-react';

export const FeedbackShowcase: React.FC = () => {
  const criteriaList = [
    { label: 'Company Brief & Verified Sources', score: '100/100', color: 'bg-[#b4ff6a]' },
    { label: 'Must-Requirement Coverage Audit', score: '100/100', color: 'bg-[#57ddff]' },
    { label: '4-Tier Question Bank Mapping', score: '96/100', color: 'bg-[#fff981]' },
    { label: 'Edit-Safe Preservation & Diffs', score: '100/100', color: 'bg-[#c8e1dd]' },
  ];

  return (
    <section id="stats" className="py-24 bg-[#faf9f5] border-t border-[#e4e2d9] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8e1dd]/50 text-[#387478] text-xs font-semibold-custom mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Structured Deliverables</span>
          </span>
          <h2 className="font-serif-custom text-3xl sm:text-4xl md:text-5xl font-normal text-[#2b2b29] leading-tight mb-4">
            Prep kits that feel <span className="italic text-[#387478]">rigorous</span>
          </h2>
          <p className="text-base sm:text-lg text-[#494444] font-sans-custom leading-relaxed">
            Walk into any technical interview fully prepared with structured company briefs, 4-tier question banks, flashcards, and an audit coverage report.
          </p>
        </div>

        {/* Grid of Interactive Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Multi-Dimensional Rubric */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-white border border-[#e4e2d9] p-8 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2b2b29] flex items-center justify-center text-[#b4ff6a]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold-custom text-lg text-[#2b2b29]">
                  6 Synchronized Deliverables
                </h3>
                <span className="text-xs text-[#918989] font-medium-custom">Comprehensive Assessment Output</span>
              </div>
            </div>

            <p className="text-sm text-[#494444] font-sans-custom leading-relaxed mb-6">
              From company intelligence to spaced-repetition flashcards, every artifact is strictly linked back to the exact JD requirements.
            </p>

            <div className="space-y-4 bg-[#faf9f5] p-5 rounded-2xl border border-[#e4e2d9]">
              {criteriaList.map((crit, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium-custom text-[#2b2b29]">
                    <span>{crit.label}</span>
                    <span className="font-bold-custom">{crit.score}</span>
                  </div>
                  <div className="h-2 w-full bg-[#e4e2d9] rounded-full overflow-hidden">
                    <div className={`h-full ${crit.color} rounded-full transition-all duration-1000`} style={{ width: crit.score.split('/')[0] + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Pairwise Preference & DPO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-white border border-[#e4e2d9] p-8 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#387478] flex items-center justify-center text-[#fbfaf6]">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold-custom text-lg text-[#2b2b29]">
                  Mathematical Study Schedule
                </h3>
                <span className="text-xs text-[#918989] font-medium-custom">Exact N-Day Time Allocation</span>
              </div>
            </div>

            <p className="text-sm text-[#494444] font-sans-custom leading-relaxed mb-6">
              Study plan computed in code from question volume, flashcard count, and days available. Exactly N days allocated, zero random LLM estimations.
            </p>

            <div className="grid grid-cols-2 gap-4 bg-[#faf9f5] p-5 rounded-2xl border border-[#e4e2d9]">
              <div className="p-3 rounded-xl bg-white border border-[#e4e2d9] text-center space-y-2">
                <span className="text-[10px] uppercase font-bold-custom px-2 py-0.5 rounded bg-[#e4e2d9] text-[#494444]">
                  Day 1
                </span>
                <p className="text-xs text-[#918989]">Role & Core Architecture</p>
                <div className="text-[11px] font-semibold-custom text-[#387478]">45 Mins Allocated</div>
              </div>

              <div className="p-3 rounded-xl bg-[#2b2b29] text-[#fbfaf6] border border-[#2b2b29] text-center space-y-2 relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold-custom px-2 py-0.5 rounded bg-[#b4ff6a] text-[#2b2b29]">
                  Day 2–N
                </span>
                <p className="text-xs text-[#c8bcae]">Deep Dives & Weak Cards</p>
                <div className="text-[11px] font-semibold-custom text-[#b4ff6a]">60 Mins Allocated</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
