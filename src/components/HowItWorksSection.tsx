import React from 'react';
import { Upload, FileText, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Submit Content',
      description: 'Paste any news statement, article URL, or upload a social media screenshot image.',
      icon: Upload,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      number: '02',
      title: 'Extract Claims',
      description: 'System automatically parses URL web content or runs multimodal OCR on screenshots.',
      icon: FileText,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      number: '03',
      title: 'AI Verification',
      description: 'Gemini evaluates the core claim, distinguishes fact-check context, and cross-references sources.',
      icon: Sparkles,
      color: 'from-indigo-600 to-purple-600',
    },
    {
      number: '04',
      title: 'Understand Truth',
      description: 'Receive verdict rating, confidence score, risk level, warning red flags, and downloadable report.',
      icon: ShieldCheck,
      color: 'from-purple-600 to-cyan-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-900/50 border-y border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-bold font-mono tracking-widest text-cyan-400 uppercase">
            VERIFICATION PIPELINE
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How VeriFact AI Uncovers the Truth
          </p>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A transparent 4-step workflow that analyzes factual claims with mathematical rigor, avoiding blind URL rating or guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10"
              >
                {/* Step Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyan-300 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-cyan-400/80 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
