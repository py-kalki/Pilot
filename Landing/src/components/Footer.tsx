import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  return (
    <footer className="bg-[#2b2b29] text-[#fbfaf6] pt-20 pb-12 border-t border-[#494444]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Call to Action Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1a1a18] via-[#2b2b29] to-[#387478]/40 border border-[#494444] p-8 sm:p-12 mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold-custom text-[#b4ff6a] tracking-widest block mb-2">
              Generate Your Interview Kit
            </span>
            <h3 className="font-serif-custom text-2xl sm:text-4xl text-[#fbfaf6] font-normal leading-tight mb-3">
              Ready to generate your personalized, verified interview prep kit?
            </h3>
            <p className="text-sm text-[#c8bcae] font-sans-custom">
              Input any Job Description and company URL. Receive 6 synchronized deliverables in under 3 minutes.
            </p>
          </div>

          <button
            onClick={onOpenContact}
            className="btn-glow px-8 py-4 rounded-full bg-[#fbfaf6] text-[#2b2b29] font-semibold-custom text-base hover:bg-[#e4e2d9] transition-all flex items-center gap-3 cursor-pointer shrink-0 shadow-lg"
          >
            <span>Generate Prep Kit</span>
            <ArrowRight className="w-4 h-4 text-[#387478]" />
          </button>
        </div>

        {/* Main Footer Links & Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16 border-b border-[#494444]">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#fbfaf6] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#387478]" />
              </div>
              <span className="font-semibold-custom text-lg text-[#fbfaf6]">
                Pilot<span className="font-light text-[#918989] ml-1">v0.1</span>
              </span>
            </a>
            <p className="text-sm text-[#c8bcae] font-sans-custom max-w-sm leading-relaxed mb-6">
              Personalized, practice-ready interview prep kits generated from any job description. A deterministic software engine wrapped around an LLM with code-enforced coverage.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1a1a18] border border-[#494444] flex items-center justify-center text-[#c8bcae] hover:text-[#b4ff6a] hover:border-[#b4ff6a] transition-all"
                aria-label="Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1a1a18] border border-[#494444] flex items-center justify-center text-[#c8bcae] hover:text-[#57ddff] hover:border-[#57ddff] transition-all"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                </svg>
              </a>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1a1a18] border border-[#494444] flex items-center justify-center text-[#c8bcae] hover:text-[#fff981] hover:border-[#fff981] transition-all"
                aria-label="Discord"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold-custom text-xs uppercase tracking-wider text-[#918989] mb-4">
              Pipeline & Core
            </h4>
            <ul className="space-y-2.5 text-sm text-[#c8bcae]">
              <li>
                <a href="#pipeline" className="hover:text-[#fbfaf6] transition-colors">
                  10-Stage Pipeline
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-[#fbfaf6] transition-colors">
                  Coverage Verification
                </a>
              </li>
              <li>
                <a href="#deliverables" className="hover:text-[#fbfaf6] transition-colors">
                  Edit-Safe Regeneration
                </a>
              </li>
              <li>
                <a href="#human-creativity-benchmark" className="hover:text-[#fbfaf6] transition-colors">
                  Spaced Repetition Practice
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="font-semibold-custom text-xs uppercase tracking-wider text-[#918989] mb-4">
              Evaluation & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#c8bcae]">
              <li>
                <a href="/terms" className="hover:text-[#fbfaf6] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-[#fbfaf6] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-[#fbfaf6] transition-colors flex items-center gap-1">
                  PRD Specification <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-[#fbfaf6] transition-colors">
                  CLI Evaluator (npm run evaluate)
                </a>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-[#b4ff6a] transition-colors text-left cursor-pointer">
                  Generate Kit Now
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#918989] gap-4">
          <p>© 2026 Pilot. Developed by <a href="https://www.vedanshh.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#b4ff6a] transition-colors">vedanshh.dev</a>. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7fe36b]" />
            <span>Deterministic Core Online • 10-Stage Verified Execution SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
