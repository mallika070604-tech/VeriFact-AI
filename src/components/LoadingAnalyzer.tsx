import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoadingAnalyzerProps {
  inputType?: 'text' | 'url' | 'image';
}

const STEPS = [
  { id: 1, label: 'Reading content and validating sources...' },
  { id: 2, label: 'Extracting core factual claims & isolating context...' },
  { id: 3, label: 'Evaluating evidence, dates & scientific plausibility...' },
  { id: 4, label: 'Calculating confidence score & generating verdict...' },
];

export const LoadingAnalyzer: React.FC<LoadingAnalyzerProps> = ({ inputType = 'text' }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 1200);
    const timer2 = setTimeout(() => setCurrentStep(3), 2600);
    const timer3 = setTimeout(() => setCurrentStep(4), 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6 my-12 backdrop-blur-xl">
      {/* Animated AI Pulse Icon */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 animate-ping opacity-30" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <span>VeriFact AI Engine Active</span>
          <Sparkles className="w-4 h-4 text-cyan-400 animate-bounce" />
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Evaluating input using Google Gemini 3.6 AI reasoning models...
        </p>
      </div>

      {/* Steps Checklist */}
      <div className="space-y-3 text-left max-w-md mx-auto pt-2">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all ${
                isDone
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-200 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/50 border-slate-800/60 text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
              )}
              <span>{step.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
