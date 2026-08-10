import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, FileCheck2 } from 'lucide-react';
import { EvidenceQuality } from '../types';

interface EvidenceQualityProps {
  quality: EvidenceQuality;
}

export const EvidenceQualityBadge: React.FC<EvidenceQualityProps> = ({ quality }) => {
  const configs = {
    STRONG: {
      label: 'STRONG EVIDENCE',
      bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: FileCheck2,
      desc: 'Multiple independent authoritative sources confirm this conclusion.',
    },
    MODERATE: {
      label: 'MODERATE EVIDENCE',
      bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: CheckCircle2,
      desc: 'Corroborating primary references with minor context gaps.',
    },
    WEAK: {
      label: 'WEAK EVIDENCE',
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: AlertCircle,
      desc: 'Limited primary sources or reliance on secondary commentary.',
    },
    INSUFFICIENT: {
      label: 'INSUFFICIENT EVIDENCE',
      bg: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: HelpCircle,
      desc: 'Lack of verifiable data to confirm or refute the claim definitively.',
    },
  };

  const config = configs[quality] || configs.INSUFFICIENT;
  const Icon = config.icon;

  return (
    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
          EVIDENCE QUALITY
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${config.bg}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-normal">{config.desc}</p>
    </div>
  );
};
