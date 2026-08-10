import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, ExternalLink, Github, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-lg text-white">VeriFact AI</span>
          </div>
          <p className="text-sm text-slate-300 font-medium">
            "See the claim. Verify the truth."
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            VeriFact AI is an advanced misinformation detection engine powered by Google Gemini. It evaluates news text, article URLs, and screenshots to isolate core factual claims and distinguish origin claims from fact-checking commentary.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <Lock className="w-3 h-3 text-cyan-400" /> AES-256 Encrypted
            </span>
            <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              Google Gemini 3.6
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Product & Tools</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/analyze" className="hover:text-cyan-400 transition-colors">Analyze Claim</Link>
            </li>
            <li>
              <Link to="/history" className="hover:text-cyan-400 transition-colors">Analysis History</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">User Dashboard</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-cyan-400 transition-colors">How It Works & AI Ethics</Link>
            </li>
          </ul>
        </div>

        {/* Responsible AI Disclaimer & Legal */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Responsible AI Notice</h4>
          <p className="text-[11px] text-slate-400 leading-normal bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
            VeriFact AI is an AI-assisted verification tool and should not replace professional journalism, peer-reviewed research, or authoritative emergency alerts. Users should verify critical claims independently.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>© {new Date().getFullYear()} VeriFact AI Platform. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/about" className="hover:text-slate-300">Privacy Policy</Link>
          <Link to="/about" className="hover:text-slate-300">Terms of Service</Link>
          <Link to="/about" className="hover:text-slate-300">Responsible AI</Link>
        </div>
      </div>
    </footer>
  );
};
