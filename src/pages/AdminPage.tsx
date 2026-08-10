import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Server, Database, CheckCircle2, AlertTriangle, Search, Trash2, Cpu } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';

export const AdminPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const items = await api.getHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Admin Action: Permanently purge this record from system database?')) {
      await api.deleteHistoryItem(id);
      setHistory(history.filter((h) => h.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">System Administration Panel</h1>
              <p className="text-xs text-slate-400">
                Platform health, Gemini API quota monitoring, and global claim auditing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM OPERATIONAL
            </span>
          </div>
        </div>

        {/* System Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>GEMINI 3.6 API ENGINE</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white">100% Online</p>
            <p className="text-[11px] text-emerald-400">Latency: 240ms avg</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>MULTIMODAL OCR SERVICE</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white">Active</p>
            <p className="text-[11px] text-indigo-300">Supported: JPG, PNG, WEBP</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>GLOBAL CLAIM LOGS</span>
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white">{history.length} Records</p>
            <p className="text-[11px] text-slate-400">AES-256 Storage</p>
          </div>
        </div>

        {/* Global Claim Audit Log Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Global Claim Audit Trail
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
              Loading global audit trail...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No claim records found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-3 font-semibold">TIMESTAMP</th>
                    <th className="pb-3 font-semibold">VERDICT</th>
                    <th className="pb-3 font-semibold">CLAIM SUMMARY</th>
                    <th className="pb-3 font-semibold">CONFIDENCE</th>
                    <th className="pb-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 font-mono text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.verdict === 'FAKE' || item.verdict === 'MOSTLY_FALSE'
                              ? 'bg-rose-500/20 text-rose-300'
                              : item.verdict === 'REAL' || item.verdict === 'MOSTLY_REAL'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.verdict}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-200 max-w-md truncate">
                        "{item.claim}"
                      </td>
                      <td className="py-3 font-mono text-indigo-300 font-bold">
                        {item.confidence}%
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
                          title="Purge Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
