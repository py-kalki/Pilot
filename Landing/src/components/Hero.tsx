import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

interface HeroProps {
  onOpenContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenContact }) => {
  const scrollToResearch = () => {
    const el = document.getElementById('human-creativity-benchmark');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Soft background ambient gradient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#c8e1dd]/30 via-[#b4ff6a]/20 to-transparent blur-[120px] pointer-events-none rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#e4e2d9]/60 border border-[#918989]/20 text-[#2b2b29] text-[13px] font-medium-custom shadow-2xs mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#387478] animate-pulse" />
            <span>Deterministic AI Pipeline</span>
            <span className="text-[#918989] font-normal">•</span>
            <span className="text-[#494444] font-semibold-custom">Pilot v0.1</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif-custom text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-[#2b2b29] leading-[1.12] mb-8"
          >
            Personalized, practice-ready interview prep kits generated from any{' '}
            <span className="italic font-serif-custom text-[#387478] relative inline-block">
              job description.
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#b4ff6a]"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,15 Q50,5 100,15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          {/* Subtitle Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl font-sans-custom text-[#494444] max-w-2xl mx-auto leading-relaxed mb-10"
          >
            User gives a Job Description + Company Website + days until interview → Pilot researches the company and generates an editable, practice-ready prep kit with guaranteed 100% requirement coverage.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={onOpenContact}
              className="btn-glow w-full sm:w-auto px-8 py-4 rounded-full bg-[#2b2b29] text-[#fbfaf6] font-medium-custom text-base hover:bg-[#1a1a18] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md group"
            >
              <span>Generate Interview Kit</span>
              <div className="w-7 h-7 rounded-full bg-[#387478] flex items-center justify-center text-[#fbfaf6] group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={scrollToResearch}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#faf9f5] border border-[#e4e2d9] text-[#2b2b29] font-medium-custom text-base hover:bg-[#e4e2d9]/40 hover:border-[#918989]/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Explore 10-Stage Pipeline</span>
              <span className="text-[#918989]">→</span>
            </button>
          </motion.div>
        </div>

        {/* Media Showcase Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: Creative Arena Showcase */}
          <div className="group relative rounded-3xl overflow-hidden bg-white/70 border border-[#e4e2d9] p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#2b2b29] mb-5">
              <img
                src="https://framerusercontent.com/images/rXZq00I8qUTEM9GWwDnoStXjKKw.png?width=1182&height=936"
                alt="10-Stage Pipeline"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute top-3 left-3 bg-[#2b2b29]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium-custom flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#b4ff6a]" />
                <span>10-Stage Pipeline</span>
              </div>
            </div>
            <h3 className="font-semibold-custom text-lg text-[#2b2b29] mb-1">
              Stage-Isolated Research
            </h3>
            <p className="text-xs text-[#494444] font-sans-custom leading-relaxed">
              Crawls official company pages, extracts hiring signals and interview patterns, and assigns stable requirement IDs (R1, R2).
            </p>
          </div>

          {/* Card 2: Human Taste Benchmark */}
          <div className="group relative rounded-3xl overflow-hidden bg-white/70 border border-[#e4e2d9] p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#2b2b29] mb-5">
              <img
                src="https://framerusercontent.com/images/EAqiHb4AngRpeOiVRA9km1enQ.png?width=987&height=1188"
                alt="Code-Verified Coverage"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute top-3 left-3 bg-[#2b2b29]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium-custom flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#57ddff]" />
                <span>100% Coverage Guarantee</span>
              </div>
            </div>
            <h3 className="font-semibold-custom text-lg text-[#2b2b29] mb-1">
              Deterministic Verification
            </h3>
            <p className="text-xs text-[#494444] font-sans-custom leading-relaxed">
              Guarantees zero uncovered 'must' requirements using deterministic TypeScript set logic and automated gap-generation loops.
            </p>
          </div>

          {/* Card 3: Trajectories & RL */}
          <div className="group relative rounded-3xl overflow-hidden bg-white/70 border border-[#e4e2d9] p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#2b2b29] mb-5">
              <img
                src="https://framerusercontent.com/images/rXZq00I8qUTEM9GWwDnoStXjKKw.png?width=1182&height=936"
                alt="Edit-Safe Regeneration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute top-3 left-3 bg-[#2b2b29]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium-custom flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#fff981]" />
                <span>Zero Edit Loss</span>
              </div>
            </div>
            <h3 className="font-semibold-custom text-lg text-[#2b2b29] mb-1">
              Edit-Safe Regeneration
            </h3>
            <p className="text-xs text-[#494444] font-sans-custom leading-relaxed">
              Granular source tracking (`generated` vs `user_edited`) ensures your custom edits and questions survive section regenerations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
