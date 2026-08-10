import React, { useState } from 'react';
import { User, Mail, Shield, Key, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl">
        <div className="border-b border-slate-800 pb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
              ROLE: {user?.role?.toUpperCase() || 'RESEARCHER'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Account Details
            </h2>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold uppercase text-slate-400">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold uppercase text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
