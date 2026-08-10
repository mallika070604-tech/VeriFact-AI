import React from 'react';
import {
  ShieldAlert,
  FileCheck2,
  Globe2,
  Download,
  Flame,
  CheckCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

export const FeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Fact-Check Article vs Claim Isolation',
      desc: 'Disambiguates between fact-checking reports debunking rumors and the original viral claim itself.',
    },
    {
      icon: FileCheck2,
      title: 'Multimodal OCR Screenshot Parsing',
      desc: 'Extracts headline text, tweet text, and article text directly from uploaded screenshots before verification.',
    },
    {
      icon: ShieldAlert,
      title: 'Risk Level & Harm Scoring',
      desc: 'Calculates public health, financial fraud, and emergency risk levels (Low, Medium, High, Critical).',
    },
    {
      icon: Globe2,
      title: 'Multilingual AI Explanations',
      desc: 'Native support for English, Telugu (తెలుగు), and Hindi (हिंदी) explanation outputs.',
    },
    {
      icon: Download,
      title: 'Downloadable PDF Verification Reports',
      desc: 'Generate branded, professional PDF reports with executive summary, evidence, and grounded sources.',
    },
    {
      icon: Flame,
      title: 'Zero-Hallucination Source Grounding',
      desc: 'Cross-references real-time web databases and scientific references without fabricating citations.',
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE-GRADE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Truth and Precision
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Built with cutting-edge AI architecture to safeguard citizens, journalists, and organizations against viral misinformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
