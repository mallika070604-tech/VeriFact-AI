import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

interface DemoClaim {
  id: string;
  type: 'text' | 'url';
  title: string;
  claim: string;
  expectedVerdict: 'FAKE' | 'REAL';
  category: string;
}

const DEMO_CLAIMS: DemoClaim[] = [
  {
    id: 'demo-1',
    type: 'text',
    title: 'NASA Solar Darkness Hoax',
    claim: 'NASA has announced that Earth will experience three days of complete darkness because of a massive solar storm.',
    expectedVerdict: 'FAKE',
    category: 'Science & Space',
  },
  {
    id: 'demo-2',
    type: 'text',
    title: 'Water Freezing Point Metric',
    claim: 'Pure water freezes at 0 degrees Celsius under standard atmospheric pressure.',
    expectedVerdict: 'REAL',
    category: 'Physical Chemistry',
  },
  {
    id: 'demo-3',
    type: 'text',
    title: '5G Tower Viral Health Rumor',
    claim: 'Installing 5G cellular towers directly causes immediate respiratory illness and viral infections in nearby residents.',
    expectedVerdict: 'FAKE',
    category: 'Technology & Health',
  },
  {
    id: 'demo-4',
    type: 'url',
    title: 'Snopes Fact-Check Report',
    claim: 'https://www.snopes.com/fact-check/bleach-cure-covid19/',
    expectedVerdict: 'FAKE',
    category: 'Medical Misinformation',
  },
];

export const DemoClaimsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleRunDemo = (item: DemoClaim) => {
    navigate('/analyze', {
      state: {
        demoType: item.type,
        demoContent: item.claim,
      },
    });
  };

  return (
    <section className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>TEST DRIVE VERIFACT AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive Demo Claims
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Select a safe benchmark claim below to run an instant real-time Gemini AI fact check.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_CLAIMS.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      item.expectedVerdict === 'FAKE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.expectedVerdict === 'FAKE' ? (
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                    ) : (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    )}
                    EXPECTED: {item.expectedVerdict}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 line-clamp-2">
                  "{item.claim}"
                </p>
              </div>

              <button
                onClick={() => handleRunDemo(item)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-cyan-600/90 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current text-cyan-400 group-hover:text-white" />
                <span>Test Analyze This Claim</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
