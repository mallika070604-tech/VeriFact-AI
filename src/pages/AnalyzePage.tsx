import React, { useState } from 'react';
import { AnalysisInterface } from '../components/AnalysisInterface';
import { ResultDashboard } from '../components/ResultDashboard';
import { AnalysisResult } from '../types';

export const AnalyzePage: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#020617] to-[#020617] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {!currentResult ? (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                Claim Verification Workbench
              </h1>
              <p className="text-slate-400 text-sm">
                Paste any news statement, article URL, or upload a social media screenshot image to evaluate claim truthfulness with Google Gemini AI.
              </p>
            </div>
            <AnalysisInterface onAnalysisComplete={(result) => setCurrentResult(result)} />
          </div>
        ) : (
          <ResultDashboard
            result={currentResult}
            onNewAnalysis={() => setCurrentResult(null)}
          />
        )}
      </div>
    </div>
  );
};
