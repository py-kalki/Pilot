import React from 'react';
import { motion } from 'framer-motion';
import { Users, Palette, Code, Box, Wand2, Volume2, Sparkles, CheckCircle } from 'lucide-react';

export const RealWorldExpertise: React.FC = () => {
  const disciplines = [
    { name: 'Full-Stack Engineers', icon: Code, tag: 'Next.js & Microservices' },
    { name: 'System Architects', icon: Box, tag: 'Distributed Systems & Scaling' },
    { name: 'Backend Engineers', icon: Code, tag: 'Postgres, Redis & APIs' },
    { name: 'Frontend Specialists', icon: Palette, tag: 'UI Polish & TypeScript' },
    { name: 'ML & AI Engineers', icon: Wand2, tag: 'LLMs & Inference Pipelines' },
    { name: 'DevOps & SREs', icon: Volume2, tag: 'Docker, K8s & Observability' },
    { name: 'Engineering Managers', icon: Sparkles, tag: 'Culture & Technical Leadership' },
    { name: 'Product Engineers', icon: Users, tag: 'System Design & Product Sense' },
  ];

  const stats = [
    { label: 'Must-Requirement Coverage', value: '100%' },
    { label: 'Isolated Pipeline Stages', value: '10' },
    { label: 'Avg. Kit Generation Time', value: '<3m' },
    { label: 'Manual Edit Data Loss', value: '0%' },
  ];

  return (
    <section id="experts" className="py-24 bg-[#fbfaf6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e4e2d9]/60 text-[#387478] text-xs font-semibold-custom mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>Reliability & Contracts</span>
          </span>
          <h2 className="font-serif-custom text-3xl sm:text-4xl md:text-5xl font-normal text-[#2b2b29] leading-tight mb-6">
            Built on deterministic software engineering
          </h2>
          <p className="text-base sm:text-lg text-[#494444] font-sans-custom leading-relaxed">
            Standard AI wrappers hallucinate questions and miss critical requirements. Pilot wraps the LLM in strict TypeScript verification algorithms.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-[#e4e2d9] shadow-2xs text-center"
            >
              <div className="font-serif-custom text-3xl sm:text-4xl text-[#2b2b29] font-normal mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-medium-custom text-[#918989] uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Discipline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {disciplines.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group p-5 rounded-2xl bg-[#faf9f5] border border-[#e4e2d9] hover:bg-white hover:border-[#387478]/40 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#c8e1dd]/40 flex items-center justify-center text-[#387478] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase font-semibold-custom text-[#918989] bg-[#e4e2d9]/40 px-2 py-0.5 rounded-md">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-semibold-custom text-base text-[#2b2b29] mb-1">
                  {item.name}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#494444]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#7fe36b]" />
                  <span>Vetted portfolio & clients</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
