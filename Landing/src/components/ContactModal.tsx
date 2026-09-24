import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    interest: 'Comparative Model Evals',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Auto close after success
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2b2b29]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#faf9f5] border border-[#e4e2d9] p-8 shadow-2xl overflow-hidden"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-[#918989] hover:text-[#2b2b29] hover:bg-[#e4e2d9]/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#c8e1dd] text-[#387478] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="font-serif-custom text-2xl text-[#2b2b29]">
                Generation Pipeline Dispatched
              </h3>
              <p className="text-sm text-[#494444] font-sans-custom max-w-md mx-auto">
                Job #PLT-8821 queued. Stages 1–6 are crawling company signals, while Stages 7–10 will verify 100% requirement coverage. Your kit will be ready in under 3 minutes.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#b4ff6a]" />
                <span className="text-xs uppercase font-bold-custom text-[#387478]">
                  Pilot v0.1 Generator
                </span>
              </div>

              <h3 className="font-serif-custom text-2xl sm:text-3xl text-[#2b2b29] mb-2">
                Generate Interview Prep Kit
              </h3>
              <p className="text-xs sm:text-sm text-[#494444] font-sans-custom mb-6">
                Input your target Job Description, company website, and interview timeline. The 10-stage pipeline will build your verified kit.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold-custom text-[#2b2b29] mb-1">
                      Target Role / Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Senior Full-Stack Engineer"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#e4e2d9] text-[#2b2b29] focus:outline-none focus:border-[#387478]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold-custom text-[#2b2b29] mb-1">
                      Candidate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="candidate@gmail.com"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#e4e2d9] text-[#2b2b29] focus:outline-none focus:border-[#387478]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold-custom text-[#2b2b29] mb-1">
                      Company Website URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="https://company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#e4e2d9] text-[#2b2b29] focus:outline-none focus:border-[#387478]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold-custom text-[#2b2b29] mb-1">
                      Timeline (Days until Interview)
                    </label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#e4e2d9] text-[#2b2b29] focus:outline-none focus:border-[#387478]"
                    >
                      <option value="3 Days (Intensive Sprint)">3 Days (Intensive Sprint)</option>
                      <option value="7 Days (Standard Week)">7 Days (Standard Week)</option>
                      <option value="14 Days (Two-Week Mastery)">14 Days (Two-Week Mastery)</option>
                      <option value="30 Days (Comprehensive Prep)">30 Days (Comprehensive Prep)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold-custom text-[#2b2b29] mb-1">
                    Job Description (JD Text or Key Requirements) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Paste the full job description text or key technical requirements here..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#e4e2d9] text-[#2b2b29] focus:outline-none focus:border-[#387478]"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-glow w-full py-3.5 rounded-full bg-[#2b2b29] text-[#fbfaf6] font-semibold-custom text-sm hover:bg-[#1a1a18] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
                >
                  <Send className="w-4 h-4 text-[#b4ff6a]" />
                  <span>Launch Generation Pipeline</span>
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
