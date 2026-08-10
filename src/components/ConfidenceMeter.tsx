import React from 'react';
import { Info } from 'lucide-react';

interface ConfidenceMeterProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ score, size = 'md' }) => {
  const radius = size === 'sm' ? 24 : size === 'lg' ? 44 : 34;
  const stroke = size === 'sm' ? 4 : size === 'lg' ? 7 : 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-cyan-400';
  if (score >= 85) colorClass = 'text-cyan-400';
  else if (score >= 60) colorClass = 'text-amber-400';
  else colorClass = 'text-rose-400';

  const dimension = radius * 2;

  return (
    <div className="flex flex-col items-center justify-center group relative">
      <div className="relative flex items-center justify-center">
        <svg height={dimension} width={dimension} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-800"
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-black font-mono ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm'} text-white`}>
            {score}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-slate-300">
        <span>CONFIDENCE</span>
        <div className="relative group/tooltip cursor-pointer">
          <Info className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 shadow-xl z-50 leading-normal">
            Confidence reflects how strongly the available evidence supports this assessment.
          </div>
        </div>
      </div>
    </div>
  );
};
