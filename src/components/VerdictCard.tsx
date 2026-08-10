import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, AlertCircle, Sparkles, FileText, CheckCircle2, Shield } from 'lucide-react';
import { Verdict, RiskLevel, FactCheckDetails, SourceCredibility } from '../types';
import { ConfidenceMeter } from './ConfidenceMeter';
import { RiskBadge } from './RiskBadge';

interface VerdictCardProps {
  verdict: Verdict;
  confidence: number;
  riskLevel: RiskLevel;
  claim: string;
  claimOrigin?: 'ORIGINAL_CLAIM' | 'ARTICLE_CONTEXT' | 'FACT_CHECK_CONCLUSION';
  isFactCheckArticle?: boolean;
  factCheckContext?: string;
  factCheckDetails?: FactCheckDetails;
  sourceCredibility?: SourceCredibility;
  category?: string;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  confidence,
  riskLevel,
  claim,
  claimOrigin,
  isFactCheckArticle,
  factCheckContext,
  factCheckDetails,
  sourceCredibility,
  category,
}) => {
  const getVerdictConfig = (v: Verdict) => {
    switch (v) {
      case 'REAL':
      case 'MOSTLY_REAL':
        return {
          title: 'FACTUAL / REAL',
          badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          gradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
          icon: ShieldCheck,
          accentColor: 'text-emerald-400',
        };
      case 'FAKE':
      case 'MOSTLY_FALSE':
        return {
          title: 'FAKE / FALSE',
          badgeBg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          gradient: 'from-rose-950/60 via-slate-900 to-slate-950',
          icon: AlertTriangle,
          accentColor: 'text-rose-400',
        };
      case 'MISLEADING':
        return {
          title: 'MISLEADING',
          badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
          icon: AlertCircle,
          accentColor: 'text-amber-400',
        };
      case 'UNVERIFIABLE':
      default:
        return {
          title: 'UNVERIFIABLE',
          badgeBg: 'bg-slate-800 border-slate-700 text-slate-300',
          gradient: 'from-slate-900 via-slate-900 to-slate-950',
          icon: HelpCircle,
          accentColor: 'text-slate-400',
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const VerdictIcon = config.icon;

  const displayClaim = factCheckDetails?.originalClaim || claim;

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${config.gradient} border border-slate-800 p-6 shadow-2xl space-y-5 overflow-hidden`}>
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Fact Check Article Detected Banner */}
      {isFactCheckArticle && (
        <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-800/80 text-purple-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold text-purple-300 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>FACT-CHECK ARTICLE DETECTED</span>
            </div>
            {factCheckDetails?.factCheckedOrganization && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-700">
                SOURCE: {factCheckDetails.factCheckedOrganization}
              </span>
            )}
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {factCheckContext ||
              'This input was identified as a fact-checking report. VeriFact AI isolated the original viral claim evaluated by the article rather than rating the publisher.'}
          </p>
          {factCheckDetails?.factCheckConclusion && (
            <div className="pt-1.5 border-t border-purple-900/60 text-purple-200 font-medium">
              <span className="font-bold font-mono text-[10px] uppercase tracking-wider text-purple-400 block">FACT-CHECK CONCLUSION:</span>
              <span className="text-xs text-slate-100">{factCheckDetails.factCheckConclusion}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${config.badgeBg}`}>
            <VerdictIcon className={`w-7 h-7 ${config.accentColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                CLAIM VERDICT
              </span>
              {category && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {category}
                </span>
              )}
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${config.accentColor}`}>
              {config.title}
            </h2>
          </div>
        </div>

        {/* Meters */}
        <div className="flex items-center gap-6 self-start sm:self-auto">
          <RiskBadge level={riskLevel} showDetails />
          <ConfidenceMeter score={confidence} size="md" />
        </div>
      </div>

      {/* Source Credibility vs Claim Verdict Separation Box */}
      {sourceCredibility && (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                SOURCE CREDIBILITY
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {sourceCredibility.organization}: <span className="text-cyan-300">{sourceCredibility.credibilityScore}% Trustworthy</span>
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight max-w-md">
            {sourceCredibility.ratingReason}
          </p>
        </div>
      )}

      {/* Analyzed Claim Box */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">
              ORIGINAL CLAIM
            </span>
            {claimOrigin && (
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                {claimOrigin}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Core Claim Extracted
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 text-sm font-mono text-slate-100 leading-relaxed">
          "{displayClaim}"
        </div>
      </div>
    </div>
  );
};
