import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, Target, Compass, Shield } from 'lucide-react';

export const NetworkOfHumanTaste: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: 'Deterministic Coverage vs. Free-Text Prompting',
      description: 'Pure mathematical set logic guarantees that every must requirement has at least one targeted question. Never left to chance.',
      icon: Eye,
      highlight: 'Code-Enforced',
    },
    {
      title: 'Granular Edit-Safe Source Tracking',
      description: 'Every question tracks its source (generated, user_edited, user_added). Partial section regeneration will never overwrite your manual edits.',
      icon: Target,
      highlight: 'Zero Mutation Loss',
    },
    {
      title: 'Automated Batch CLI Evaluator',
      description: "Run 'npm run evaluate' against N test cases. Evaluators can test output correctness and retry resiliency without touching the UI.",
      icon: Compass,
      highlight: 'npm run evaluate',
    },
  ];

  return (
    <section id="human-creativity-benchmark" className="py-24 bg-[#2b2b29] text-[#fbfaf6] relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-[500px] h-[500px] bg-[#387478]/20 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#387478]/30 border border-[#387478]/50 text-[#b4ff6a] text-xs font-semibold-custom mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deterministic Verification Engine</span>
            </div>

            <h2 className="font-serif-custom text-3xl sm:text-4xl md:text-5xl font-normal leading-tight mb-6">
              The Deterministic Verification Layer
            </h2>

            <p className="text-lg text-[#b4ff6a] font-serif-custom italic mb-4">
              The LLM proposes; deterministic software verifies, enforces, and schedules.
            </p>

            <p className="text-sm sm:text-base text-[#c8bcae] font-sans-custom leading-relaxed mb-8">
              Pilot wraps frontier LLMs inside an unyielding software pipeline. Coverage verification, requirement IDs, and study schedules are strictly computed in code.
            </p>

            {/* Tab Selectors */}
            <div className="space-y-4">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                const isActive = activeTab === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${isActive
                        ? 'bg-[#387478]/30 border-[#b4ff6a]/60 shadow-lg'
                        : 'bg-[#1a1a18] border-[#494444]/60 hover:border-[#918989]'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#b4ff6a]' : 'text-[#918989]'}`} />
                        <h4 className="font-semibold-custom text-base text-[#fbfaf6]">
                          {feat.title}
                        </h4>
                      </div>
                      <span className="text-[10px] uppercase font-semibold-custom px-2 py-0.5 rounded bg-[#494444]/40 text-[#c8e1dd]">
                        {feat.highlight}
                      </span>
                    </div>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-[#c8bcae] font-sans-custom leading-relaxed mt-2"
                      >
                        {feat.description}
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column Interactive Showcase Card */}
          <div className="relative">
            <div className="rounded-3xl bg-[#1a1a18] border border-[#494444] p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-[#494444]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-xs font-medium-custom text-[#918989]">
                  Live Taste Evaluation Loop
                </span>
              </div>

              {/* Showcase Image & Evaluation Overlay */}
              <div className="mt-6 relative rounded-2xl overflow-hidden border border-[#494444]">
                <img
                  src="https://framerusercontent.com/images/rXZq00I8qUTEM9GWwDnoStXjKKw.png?width=1182&height=936"
                  alt="Live Human Taste Evaluation"
                  className="w-full aspect-4/3 object-cover opacity-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18] via-transparent to-transparent flex flex-col justify-end p-6">
                  <div className="bg-[#2b2b29]/90 backdrop-blur-md p-4 rounded-xl border border-[#494444] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#b4ff6a] font-semibold-custom">Expert Evaluator #8491</span>
                      <span className="text-[#918989] text-[10px]">Staff Design Lead @ Studio</span>
                    </div>
                    <p className="text-[#fbfaf6] text-xs italic font-serif-custom">
                      "Composition is strong, but contrast on secondary hero element violates optical hierarchy."
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#494444]/60 text-[10px]">
                      <span className="text-[#57ddff]">Taste Rating: 8.9/10</span>
                      <span className="text-[#7fe36b]">Preference: Model B</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stat pill */}
              <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-[#2b2b29] border border-[#494444]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#b4ff6a]" />
                  <span className="text-xs font-medium-custom text-[#fbfaf6]">
                    Vetted Professional Quality
                  </span>
                </div>
                <span className="text-xs font-bold-custom text-[#57ddff]">
                  100% Zero Bot Policy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
