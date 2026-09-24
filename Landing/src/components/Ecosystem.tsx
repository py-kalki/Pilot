import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Layers, Award, Terminal } from 'lucide-react';

interface EcosystemProps {
  onOpenContact: () => void;
}

export const Ecosystem: React.FC<EcosystemProps> = ({ onOpenContact }) => {
  return (
    <section id="offerings" className="py-24 bg-[#faf9f5] border-y border-[#e4e2d9]/80 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8e1dd]/50 text-[#387478] text-xs font-semibold-custom mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Architecture</span>
          </div>
          <h2 className="font-serif-custom text-3xl sm:text-4xl md:text-5xl font-normal text-[#2b2b29] leading-tight mb-6">
            Inside the Pilot interview intelligence engine
          </h2>
          <p className="text-base sm:text-lg text-[#494444] font-sans-custom leading-relaxed">
            A deterministic software engine wrapped around an LLM. Pure code verifies 100% must-have requirement coverage, while AI researches company signals and interview patterns.
          </p>
        </div>

        {/* 3 Core Pillar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pillar 1: Research & Synthesis */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-between rounded-3xl bg-white border border-[#e4e2d9] p-8 shadow-xs relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-[#b4ff6a]/40 text-[#2b2b29] text-xs font-semibold-custom">
                  Stage 1–6: Research & Synthesis
                </span>
                <span className="text-[#918989] text-xs font-medium-custom">01</span>
              </div>

              <h3 className="font-serif-custom text-2xl text-[#2b2b29] mb-3">
                Role & Company Dissection
              </h3>

              <p className="text-sm text-[#494444] leading-relaxed mb-6 font-sans-custom">
                Crawls official company pages, extracts hiring signals and interview patterns, and classifies JD requirements with stable IDs (R1, R2) into must and nice.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-[#2b2b29]">
                  <CheckCircle2 className="w-4 h-4 text-[#387478] shrink-0 mt-0.5" />
                  <span>Verified crawled company sources (zero hallucinated URLs)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#2b2b29]">
                  <CheckCircle2 className="w-4 h-4 text-[#387478] shrink-0 mt-0.5" />
                  <span>Stable requirement ID persistence across regenerations</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#2b2b29]">
                  <CheckCircle2 className="w-4 h-4 text-[#387478] shrink-0 mt-0.5" />
                  <span>4-category question banks: Tech, Behav, System Design, Fit</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e4e2d9]/60 flex items-center justify-between">
              <button
                onClick={onOpenContact}
                className="text-xs font-semibold-custom text-[#2b2b29] hover:text-[#387478] transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>Launch Pipeline</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <span className="text-[11px] text-[#918989] font-medium-custom">Deep Semantic Research</span>
            </div>
          </motion.div>

          {/* Pillar 2: Deterministic Core */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-between rounded-3xl bg-[#2b2b29] text-[#fbfaf6] p-8 shadow-md relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-[#57ddff]/20 text-[#57ddff] text-xs font-semibold-custom">
                  Stage 7–9: Deterministic Core
                </span>
                <span className="text-[#918989] text-xs font-medium-custom">02</span>
              </div>

              <h3 className="font-serif-custom text-2xl text-[#fbfaf6] mb-3">
                Coverage & Scheduling
              </h3>

              <p className="text-sm text-[#c8bcae] leading-relaxed mb-6 font-sans-custom">
                Coverage checking and schedule allocation are executed as pure, unit-testable TypeScript algorithms—never delegated to the LLM as free text.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-[#fbfaf6]">
                  <Award className="w-4 h-4 text-[#b4ff6a] shrink-0 mt-0.5" />
                  <span>Deterministic code verification against all mandatory requirements</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#fbfaf6]">
                  <Award className="w-4 h-4 text-[#b4ff6a] shrink-0 mt-0.5" />
                  <span>Automated gap-generation loop with retry backoff (max 2–3 attempts)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#fbfaf6]">
                  <Award className="w-4 h-4 text-[#b4ff6a] shrink-0 mt-0.5" />
                  <span>Exact N-day study schedule calculated from question volume and time budget</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#494444] flex items-center justify-between">
              <button
                onClick={onOpenContact}
                className="text-xs font-semibold-custom text-[#fbfaf6] hover:text-[#b4ff6a] transition-colors flex items-center gap-1 group cursor-pointer"
              >
                <span>View Coverage Math</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <span className="text-[11px] text-[#918989] font-medium-custom">Code Verification</span>
            </div>
          </motion.div>

          {/* Pillar 3: Edit-Safe & CLI */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col justify-between rounded-3xl bg-white border border-[#e4e2d9] p-8 shadow-xs relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-[#fff981]/60 text-[#2b2b29] text-xs font-semibold-custom">
                  Stage 10 & Evaluator: Production Rigor
                </span>
                <span className="text-[#918989] text-xs font-medium-custom">03</span>
              </div>

              <h3 className="font-serif-custom text-2xl text-[#2b2b29] mb-3">
                Edit-Safe State & CLI Evaluator
              </h3>

              <p className="text-sm text-[#494444] leading-relaxed mb-6 font-sans-custom">
                Designed for serious candidates and automated assessment evaluators. Run the exact same pipeline headless via CLI or edit questions in the interactive workspace.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2.5 text-xs text-[#2b2b29]">
                  <Terminal className="w-4 h-4 text-[#387478] shrink-0 mt-0.5" />
                  <span>Granular source-tracking (`generated` vs `user_edited` vs `user_added`)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#2b2b29]">
                  <Terminal className="w-4 h-4 text-[#387478] shrink-0 mt-0.5" />
                  <span>Headless batch evaluation CLI (`npm run evaluate`) with failure isolation</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#2b2b29]">
                  <Terminal className="w-4 h-4 text-[#387478] shrink-0 mt-0.5" />
                  <span>5 full assessment cases processed within 15 minutes with local fixture support</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e4e2d9]/60 flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-[#e4e2d9] text-[#494444] text-[11px] font-medium-custom">
                Ready in v0.1
              </span>
              <span className="text-[11px] text-[#918989] font-medium-custom">npm run evaluate</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
