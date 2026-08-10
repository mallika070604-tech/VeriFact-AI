import React, { useState } from 'react';
import {
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  FileText,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { VerdictCard } from './VerdictCard';
import { EvidenceQualityBadge } from './EvidenceQualityBadge';
import { generatePdfReport } from '../utils/pdfGenerator';

interface ResultDashboardProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onNewAnalysis }) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport(result, 'result-dashboard-container');
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopySummary = () => {
    const text = `VeriFact AI Verdict: ${result.verdict} (${result.confidence}% Confidence)\nClaim: "${result.claim}"\nSummary: ${result.summary}\nRisk: ${result.riskLevel}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn" id="result-dashboard-container">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Analyze Another Claim</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'Share Summary'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Top Verdict Summary Header */}
      <VerdictCard
        verdict={result.verdict}
        confidence={result.confidence}
        riskLevel={result.riskLevel}
        claim={result.claim}
        claimOrigin={result.claimOrigin}
        isFactCheckArticle={result.isFactCheckArticle}
        factCheckContext={result.factCheckContext}
        factCheckDetails={result.factCheckDetails}
        sourceCredibility={result.sourceCredibility}
        category={result.category}
      />

      {/* Multiple Fact-Checked Claims Hub Section */}
      {(result.isMultipleClaimsDetected || (result.subClaims && result.subClaims.length > 0)) && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                  MULTIPLE FACT-CHECKED CLAIMS DETECTED ({result.subClaims?.length || 0})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This page contains multiple distinct claims. Each claim has been isolated and evaluated individually below.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              FACT-CHECK HUB
            </span>
          </div>

          <div className="space-y-6">
            {result.subClaims?.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      CLAIM #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      ORIGINAL_CLAIM
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                      sub.verdict === 'REAL' || sub.verdict === 'MOSTLY_REAL'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : sub.verdict === 'FAKE' || sub.verdict === 'MOSTLY_FALSE'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : sub.verdict === 'MISLEADING'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}>
                      {sub.verdict} ({sub.confidence}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    ORIGINAL CLAIM #{idx + 1}:
                  </span>
                  <p className="text-sm font-mono text-slate-100 font-semibold leading-relaxed p-3 rounded-lg bg-slate-900 border border-slate-800">
                    "{sub.claim}"
                  </p>
                </div>

                {sub.factCheckConclusion && (
                  <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200">
                    <span className="font-mono font-bold text-[10px] uppercase text-purple-300 block">FACT-CHECK CONCLUSION:</span>
                    <p className="mt-0.5">{sub.factCheckConclusion}</p>
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">{sub.summary}</p>
                  <p className="text-slate-400 text-xs mt-1">{sub.explanation}</p>
                </div>

                {sub.evidence && sub.evidence.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Key Evidence:</span>
                    <ul className="space-y-1">
                      {sub.evidence.map((ev, eIdx) => (
                        <li key={eIdx} className="text-xs text-slate-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Executive Summary & Evidence Quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
              VERDICT EXECUTIVE SUMMARY
            </h3>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {result.summary}
          </p>
        </div>

        <div className="space-y-4">
          <EvidenceQualityBadge quality={result.evidenceQuality} />

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              RECOMMENDED ACTION
            </span>
            <p className="text-xs text-cyan-300 font-semibold leading-relaxed">
              {result.recommendedAction}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Section: "Why?" */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>DETAILED REASONING & EVALUATION</span>
        </h3>
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 font-sans">
          {result.explanation.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Warning Signs (Red Flags) */}
      {result.warningSigns && result.warningSigns.length > 0 && (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-900/40 space-y-4 shadow-xl">
          <h3 className="text-sm font-mono font-bold uppercase text-rose-300 tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>RED FLAGS & WARNING SIGNS DETECTED ({result.warningSigns.length})</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.warningSigns.map((warning, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/30 text-xs text-rose-200 flex items-start gap-2.5 leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Supporting Evidence */}
      {result.evidence && result.evidence.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SUPPORTING EVIDENCE & CORROBORATION ({result.evidence.length})</span>
          </h3>
          <ul className="space-y-2.5">
            {result.evidence.map((item, idx) => (
              <li
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-3 leading-relaxed"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grounded Authoritative Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>AUTHORITATIVE SOURCES & REFERENCES ({result.sources.length})</span>
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.sources.map((src, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 truncate">{src.name}</span>
                  {src.trustworthiness && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      Trust: {src.trustworthiness}%
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {src.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                  {src.relevance}
                </p>
                {src.link && src.link.startsWith('http') && (
                  <a
                    href={src.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 pt-1"
                  >
                    <span>View Reference Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
