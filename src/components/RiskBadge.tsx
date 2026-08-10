import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  showDetails?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showDetails = false }) => {
  const configs = {
    LOW: {
      label: 'LOW RISK',
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: ShieldCheck,
      desc: 'Minimal potential harm or public danger.',
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Zap,
      desc: 'Moderate risk of misleading commercial or social influence.',
    },
    HIGH: {
      label: 'HIGH RISK',
      bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: AlertTriangle,
      desc: 'Significant risk of spreading viral panic, political hoaxes, or public distress.',
    },
    CRITICAL: {
      label: 'CRITICAL RISK',
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: ShieldAlert,
      desc: 'Severe immediate threat: health misinformation, financial fraud, or emergency panic.',
    },
  };

  const config = configs[level] || configs.LOW;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-start gap-1">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${config.bg}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </div>
      {showDetails && (
        <span className="text-[11px] text-slate-400 font-medium leading-tight">
          {config.desc}
        </span>
      )}
    </div>
  );
};
