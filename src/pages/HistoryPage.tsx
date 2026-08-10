import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, ExternalLink, Calendar, AlertTriangle, ShieldCheck, HelpCircle, FileText, Download } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult, Verdict } from '../types';
import { ResultDashboard } from '../components/ResultDashboard';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await api.getHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this report from history?')) {
      await api.deleteHistoryItem(id);
      setHistory(history.filter((item) => item.id !== id));
      if (selectedResult?.id === id) {
        setSelectedResult(null);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history items?')) {
      await api.clearHistory();
      setHistory([]);
      setSelectedResult(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesQuery =
      item.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVerdict =
      selectedVerdict === 'ALL' || item.verdict === selectedVerdict;

    return matchesQuery && matchesVerdict;
  });

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case 'REAL':
      case 'MOSTLY_REAL':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> REAL
          </span>
        );
      case 'FAKE':
      case 'MOSTLY_FALSE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> FAKE
          </span>
        );
      case 'MISLEADING':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> MISLEADING
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> UNVERIFIABLE
          </span>
        );
    }
  };

  if (selectedResult) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <ResultDashboard
          result={selectedResult}
          onNewAnalysis={() => setSelectedResult(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Analysis History & Archive
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse, search, and review all previous fact-check assessments.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, summaries, or categories..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <select
              value={selectedVerdict}
              onChange={(e) => setSelectedVerdict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Verdicts</option>
              <option value="FAKE">FAKE / FALSE</option>
              <option value="REAL">REAL / FACTUAL</option>
              <option value="MISLEADING">MISLEADING</option>
              <option value="UNVERIFIABLE">UNVERIFIABLE</option>
            </select>
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm animate-pulse">
            Loading analysis history archive...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-base font-bold text-slate-300">No matching history found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedVerdict !== 'ALL'
                ? 'Try adjusting your search query or filter settings.'
                : 'You have not analyzed any claims yet. Run a claim check to populate your archive.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedResult(item)}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getVerdictBadge(item.verdict)}
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 line-clamp-3">
                    "{item.claim}"
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-indigo-400 font-bold">
                    Confidence: {item.confidence}%
                  </span>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
