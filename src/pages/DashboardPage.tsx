import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  Search,
  Plus,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AnalysisResult } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await api.getHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metric computations
  const totalAnalyses = history.length;
  const fakeCount = history.filter((h) => h.verdict === 'FAKE' || h.verdict === 'MOSTLY_FALSE').length;
  const realCount = history.filter((h) => h.verdict === 'REAL' || h.verdict === 'MOSTLY_REAL').length;
  const misleadingCount = history.filter((h) => h.verdict === 'MISLEADING').length;

  const avgConfidence =
    totalAnalyses > 0
      ? Math.round(history.reduce((sum, item) => sum + item.confidence, 0) / totalAnalyses)
      : 94;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || 'Researcher'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30">
                PRO PLAN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time monitoring & fact verification analytics dashboard.
            </p>
          </div>

          <Link
            to="/analyze"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze New Claim</span>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              Total Analyses
            </p>
            <p className="text-3xl font-extrabold text-white">{totalAnalyses}</p>
            <p className="text-[11px] text-slate-400 pt-1">Across text, URLs & images</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-rose-500/80 text-xs uppercase tracking-wider font-semibold">
              Fake / Hoaxes Detected
            </p>
            <p className="text-3xl font-extrabold text-rose-400">{fakeCount}</p>
            <p className="text-[11px] text-rose-400/80 pt-1">
              {totalAnalyses > 0 ? Math.round((fakeCount / totalAnalyses) * 100) : 0}% of all checks
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-emerald-500/80 text-xs uppercase tracking-wider font-semibold">
              Factual / Verified Real
            </p>
            <p className="text-3xl font-extrabold text-emerald-400">{realCount}</p>
            <p className="text-[11px] text-emerald-400/80 pt-1">
              {totalAnalyses > 0 ? Math.round((realCount / totalAnalyses) * 100) : 0}% of all checks
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl space-y-1">
            <p className="text-indigo-500/80 text-xs uppercase tracking-wider font-semibold">
              Avg AI Confidence
            </p>
            <p className="text-3xl font-extrabold text-indigo-400">{avgConfidence}%</p>
            <p className="text-[11px] text-indigo-300/80 pt-1">Grounded in verified evidence</p>
          </div>
        </div>

        {/* Dashboard Main Grid: Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Recent Analyses Table / List */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Recent Fact Checks</span>
              </h2>
              <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                View Full Archive <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Loading recent dashboard activity...
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <p>No recent fact checks recorded.</p>
                <Link to="/analyze" className="text-indigo-400 font-bold hover:underline">
                  Analyze your first claim now →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            item.verdict === 'FAKE' || item.verdict === 'MOSTLY_FALSE'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : item.verdict === 'REAL' || item.verdict === 'MOSTLY_REAL'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {item.verdict}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-200 truncate">
                        "{item.claim}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-shrink-0">
                      <span>{item.confidence}% Confidence</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Plan Credits & Usage Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600/10 rounded-2xl p-6 border border-indigo-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  VERIFACT PRO ENGINE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div>
                <p className="text-3xl font-extrabold text-white font-mono">24,102</p>
                <p className="text-xs text-slate-400 mt-0.5">Verification Credits Available</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-indigo-500/20 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Gemini 3.6 OCR Engine:</span>
                  <span className="font-semibold text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>URL Web Scraping:</span>
                  <span className="font-semibold text-emerald-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>PDF Export Module:</span>
                  <span className="font-semibold text-emerald-400">Enabled</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-2 text-xs text-slate-400">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Verification Best Practices</span>
              </h3>
              <p className="leading-relaxed">
                When analyzing screenshots, verify that headline dates match current events. VeriFact AI's OCR handles multilingual text in English, Telugu, and Hindi.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
