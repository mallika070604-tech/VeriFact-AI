import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { DemoClaimsSection } from '../components/DemoClaimsSection';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <DemoClaimsSection />

      {/* Final Call to Action Banner */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Ready to verify news claims in real time?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Stop Misinformation Before It Spreads
          </h2>

          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Protect yourself and your community with AI-driven fact verification. Free, instant, and grounded in transparent evidence.
          </p>

          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all group"
            >
              <span>Analyze Your First Claim</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
