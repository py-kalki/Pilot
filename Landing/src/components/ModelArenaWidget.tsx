import { useState } from 'react';
import { Swords, Check, RefreshCw, Sparkles } from 'lucide-react';

export const ModelArenaWidget: React.FC = () => {
  const [selectedVote, setSelectedVote] = useState<'A' | 'B' | 'TIE' | null>(null);
  const [voted, setVoted] = useState(false);
  const [stats, setStats] = useState({ modelAWin: 42, modelBWin: 58 });

  const handleVote = (choice: 'A' | 'B' | 'TIE') => {
    setSelectedVote(choice);
    setVoted(true);
    if (choice === 'A') setStats((s) => ({ ...s, modelAWin: s.modelAWin + 1 }));
    if (choice === 'B') setStats((s) => ({ ...s, modelBWin: s.modelBWin + 1 }));
  };

  const resetVote = () => {
    setSelectedVote(null);
    setVoted(false);
  };

  return (
    <section id="human-creativity-benchmark" className="py-24 bg-[#2b2b29] text-[#fbfaf6] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b4ff6a]/20 text-[#b4ff6a] text-xs font-semibold-custom mb-4">
            <Swords className="w-3.5 h-3.5" />
            <span>Practice Mode & Spaced Repetition</span>
          </span>
          <h2 className="font-serif-custom text-3xl sm:text-4xl md:text-5xl font-normal leading-tight mb-4">
            Interactive Flashcard & Confidence Assessment
          </h2>
          <p className="text-base sm:text-lg text-[#c8bcae] font-sans-custom leading-relaxed">
            Practice high-yield questions tagged to verified JD requirements. Calibrate your recall confidence to dynamically prioritize weak topics in your study queue.
          </p>
        </div>

        {/* Interactive Arena Window */}
        <div className="rounded-3xl bg-[#1a1a18] border border-[#494444] p-6 sm:p-8 shadow-2xl">
          {/* Prompt Header */}
          <div className="mb-8 p-4 rounded-2xl bg-[#2b2b29] border border-[#494444] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold-custom text-[#918989] block mb-1">
                Flashcard #104 • Linked to [R3: Distributed Systems]
              </span>
              <p className="text-sm font-medium-custom text-[#fbfaf6]">
                "Explain how Kafka ensures at-least-once message delivery and how an idempotent producer prevents duplicate writes during network partition timeouts."
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-[#387478]/40 text-[#57ddff] text-xs font-semibold-custom">
                Category: Technical & System Design
              </span>
            </div>
          </div>

          {/* Model Side-by-Side Arena Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Model A */}
            <div className={`relative rounded-2xl overflow-hidden border transition-all p-5 ${selectedVote === 'A'
                ? 'border-[#b4ff6a] bg-[#2b2b29] ring-2 ring-[#b4ff6a]/40'
                : 'border-[#494444] bg-[#2b2b29]/80'
              }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold-custom text-[#918989] uppercase">
                  Candidate Recall (Baseline)
                </span>
                {selectedVote === 'A' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#b4ff6a] text-[#2b2b29] text-[11px] font-bold-custom flex items-center gap-1">
                    <Check className="w-3 h-3" /> Baseline Selected
                  </span>
                )}
              </div>
              <div className="aspect-16/10 rounded-xl bg-[#1a1a18] overflow-hidden border border-[#494444] mb-4 relative">
                <img
                  src="https://framerusercontent.com/images/rXZq00I8qUTEM9GWwDnoStXjKKw.png?width=1182&height=936"
                  alt="Candidate Recall Output"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-[#c8bcae] space-y-1">
                <div className="flex justify-between">
                  <span>Explanation Depth:</span>
                  <span className="text-[#fbfaf6] font-semibold-custom">7.8 / 10</span>
                </div>
                <div className="flex justify-between">
                  <span>Requirement [R3] Coverage:</span>
                  <span className="text-[#fbfaf6] font-semibold-custom">80% (Misses ISR)</span>
                </div>
              </div>
              <button
                onClick={() => handleVote('A')}
                disabled={voted}
                className={`mt-4 w-full py-2.5 rounded-xl font-medium-custom text-xs transition-all cursor-pointer ${selectedVote === 'A'
                    ? 'bg-[#b4ff6a] text-[#2b2b29]'
                    : 'bg-[#387478]/40 hover:bg-[#387478] text-[#fbfaf6]'
                  }`}
              >
                {selectedVote === 'A' ? 'Needs Review (Hard)' : 'Rate Baseline (Again / Hard)'}
              </button>
            </div>

            {/* Model B */}
            <div className={`relative rounded-2xl overflow-hidden border transition-all p-5 ${selectedVote === 'B'
                ? 'border-[#57ddff] bg-[#2b2b29] ring-2 ring-[#57ddff]/40'
                : 'border-[#494444] bg-[#2b2b29]/80'
              }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold-custom text-[#918989] uppercase">
                  Pilot Verified Golden Answer
                </span>
                {selectedVote === 'B' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#57ddff] text-[#2b2b29] text-[11px] font-bold-custom flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mastered Standard
                  </span>
                )}
              </div>
              <div className="aspect-16/10 rounded-xl bg-[#1a1a18] overflow-hidden border border-[#494444] mb-4 relative">
                <img
                  src="https://framerusercontent.com/images/EAqiHb4AngRpeOiVRA9km1enQ.png?width=987&height=1188"
                  alt="Pilot Verified Answer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-[#c8bcae] space-y-1">
                <div className="flex justify-between">
                  <span>Explanation Depth:</span>
                  <span className="text-[#fbfaf6] font-semibold-custom">9.8 / 10</span>
                </div>
                <div className="flex justify-between">
                  <span>Requirement [R3] Coverage:</span>
                  <span className="text-[#fbfaf6] font-semibold-custom">100% (ACKs, ISR, PID)</span>
                </div>
              </div>
              <button
                onClick={() => handleVote('B')}
                disabled={voted}
                className={`mt-4 w-full py-2.5 rounded-xl font-medium-custom text-xs transition-all cursor-pointer ${selectedVote === 'B'
                    ? 'bg-[#57ddff] text-[#2b2b29]'
                    : 'bg-[#387478]/40 hover:bg-[#387478] text-[#fbfaf6]'
                  }`}
              >
                {selectedVote === 'B' ? 'Mastered (Easy)' : 'Rate Mastery (Good / Easy)'}
              </button>
            </div>
          </div>

          {/* Voting Action Bar & Results */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#494444]">
            {voted ? (
              <div className="flex items-center gap-3 text-xs text-[#b4ff6a]">
                <Sparkles className="w-4 h-4" />
                <span>Confidence score recorded! Dynamic spaced-repetition scheduler prioritized 4 weak requirement cards in Day 2 study block.</span>
                <button
                  onClick={resetVote}
                  className="ml-2 underline text-[#918989] hover:text-[#fbfaf6] cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Next Flashcard
                </button>
              </div>
            ) : (
              <div className="text-xs text-[#918989]">
                Rate your recall against Pilot's verified answer to calibrate confidence scoring and schedule allocation.
              </div>
            )}

            <div className="flex items-center gap-3 text-xs font-semibold-custom">
              <span className="text-[#918989]">Requirement [R3] Recall:</span>
              <span className="text-[#b4ff6a]">Review ({stats.modelAWin}%)</span>
              <span className="text-[#494444]">|</span>
              <span className="text-[#57ddff]">Mastered ({stats.modelBWin}%)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
