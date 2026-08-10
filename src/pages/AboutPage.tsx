import React from 'react';
import { ShieldCheck, Sparkles, BookOpen, Lock, AlertTriangle, Layers, CheckCircle2, Globe2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>TRANSPARENT AI METHODOLOGY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How VeriFact AI Uncovers Truth
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            VeriFact AI combines multimodal Google Gemini AI, web scraping, and OCR technology to combat online misinformation with speed and precision.
          </p>
        </div>

        {/* Section 1: Core Innovations */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Fact-Check Article vs. Viral Claim Isolation</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            One of the most frequent defects in automated fact-checkers is rating a fact-checking article (e.g. from Snopes, Reuters, or AFP) as "FAKE" simply because the article discusses a viral hoax.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            VeriFact AI employs a two-pass contextual parser. It evaluates whether the input is a news rumor or an investigative debunking piece, correctly isolating the underlying claim being evaluated.
          </p>
        </div>

        {/* Section 2: Methodology Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Zero-Hallucination Evidence Grounding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every verdict requires corroborating evidence from authoritative news archives, government announcements, or scientific publications. Unverified claims are categorized as UNVERIFIABLE rather than guessed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Globe2 className="w-6 h-6 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Multilingual Accessibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Misinformation spreads rapidly across regional linguistic groups. VeriFact AI provides native verification explanations in English, Telugu (తెలుగు), and Hindi (हिंदी).
            </p>
          </div>
        </div>

        {/* Section 3: Responsible AI & Ethics */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Responsible AI Disclaimer & Limitations</span>
          </h2>
          <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-normal">
            <p>
              VeriFact AI is an AI-assisted decision support system designed for educational, research, and general information purposes. While Gemini AI is exceptionally accurate, AI output should not be treated as absolute legal testimony or emergency instructions.
            </p>
            <p>
              For critical medical emergencies, severe weather warnings, or financial decisions, users should always consult official government channels, licensed professionals, and peer-reviewed scientific journals.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
