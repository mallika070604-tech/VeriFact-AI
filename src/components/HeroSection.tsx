import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Zap, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-16 lg:py-24 bg-slate-950 text-white">
      {/* Background Subtle Glowing Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Next-Gen Fact Verification Engine</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              Don't Just Read the News.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Verify It.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              VeriFact AI analyzes viral text, article URLs, and screenshots using Google Gemini AI. It isolates core factual claims, detects misinformation, and distinguishes fact-check articles from underlying rumors.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/analyze"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center gap-2.5 group"
              >
                <Search className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>Analyze a Claim</span>
                <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-medium text-sm transition-colors text-center"
              >
                How It Works
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-6 border-t border-slate-800/80 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Multimodal OCR
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Article URL Scraping
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Multi-Language (EN/TE/HI)
              </span>
            </motion.div>
          </div>

          {/* Right Column: Interactive Live Analysis Card Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                    LIVE AI ANALYSIS DEMO
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.6
                </span>
              </div>

              {/* Sample Claim Box */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CLAIM ANALYZED</span>
                  <div className="mt-1 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                    "NASA has announced that Earth will experience three days of complete darkness because of a massive solar storm."
                  </div>
                </div>

                {/* Live Output Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-center">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">VERDICT</span>
                    <span className="text-sm font-black text-rose-400 tracking-wide flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> FAKE
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CONFIDENCE</span>
                    <span className="text-sm font-black text-cyan-400 font-mono">97%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-center">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">RISK</span>
                    <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> HIGH
                    </span>
                  </div>
                </div>

                {/* Explanation snippet */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-200 flex items-center gap-1 text-[11px]">
                    <Zap className="w-3 h-3 text-cyan-400" /> Core Distinction Identified:
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This is a recurring internet viral hoax falsely attributing statements to NASA. Solar activity cannot physically obscure sunlight globally.
                  </p>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Want to check your own news link or screenshot?</span>
                <Link to="/analyze" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                  Test Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
