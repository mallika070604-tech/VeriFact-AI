import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Search,
  Sparkles,
  AlertCircle,
  X,
  Edit3,
  CheckCircle2,
  Globe,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult, Language } from '../types';
import { LoadingAnalyzer } from './LoadingAnalyzer';
import { useLanguage } from '../context/LanguageContext';

interface AnalysisInterfaceProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export const AnalysisInterface: React.FC<AnalysisInterfaceProps> = ({ onAnalysisComplete }) => {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');

  // Text state
  const [textInput, setTextInput] = useState('');

  // URL state
  const [urlInput, setUrlInput] = useState('');

  // Image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [ocrText, setOcrText] = useState<string>('');
  const [isExtractingOcr, setIsExtractingOcr] = useState<boolean>(false);

  // General loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle passed demo claims from state if redirected from demo section
  useEffect(() => {
    if (location.state && (location.state as any).demoContent) {
      const demoType = (location.state as any).demoType || 'text';
      const demoContent = (location.state as any).demoContent;

      if (demoType === 'url') {
        setActiveTab('url');
        setUrlInput(demoContent);
      } else {
        setActiveTab('text');
        setTextInput(demoContent);
      }
    }
  }, [location.state]);

  // Handle Image File Drop / Selection
  const handleImageFileChange = async (file: File) => {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setErrorMsg(null);
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);

      // Auto-trigger OCR extraction step
      setIsExtractingOcr(true);
      try {
        const extracted = await api.extractOcr(base64, file.type);
        setOcrText(extracted);
      } catch (err: any) {
        console.error('OCR Extraction Notice:', err);
        setOcrText('');
      } finally {
        setIsExtractingOcr(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit Analysis Handler
  const handleAnalyze = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let result: AnalysisResult;

      if (activeTab === 'text') {
        if (!textInput.trim()) {
          setErrorMsg('Please enter or paste a claim or news text to analyze.');
          setIsLoading(false);
          return;
        }
        result = await api.analyzeText(textInput, language);
      } else if (activeTab === 'url') {
        if (!urlInput.trim()) {
          setErrorMsg('Please enter a valid news article URL.');
          setIsLoading(false);
          return;
        }
        result = await api.analyzeUrl(urlInput, language);
      } else {
        if (!selectedImage) {
          setErrorMsg('Please upload a screenshot or image to analyze.');
          setIsLoading(false);
          return;
        }
        result = await api.analyzeImage(selectedImage, imageMime, ocrText, language);
      }

      onAnalysisComplete(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMsg(err.message || 'Analysis failed. Please check your network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingAnalyzer inputType={activeTab} />;
  }

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/95 border border-slate-800/90 shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>VeriFact AI Intelligence Workbench</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose input method below: paste text, enter article URL, or upload a screenshot.
          </p>
        </div>

        {/* Output Language Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-400">Target Output:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900">English</option>
            <option value="te" className="bg-slate-900">తెలుగు (Telugu)</option>
            <option value="hi" className="bg-slate-900">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
        <button
          onClick={() => {
            setActiveTab('text');
            setErrorMsg(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'text'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>TAB 1: TEXT</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('url');
            setErrorMsg(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>TAB 2: URL</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('image');
            setErrorMsg(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>TAB 3: IMAGE</span>
        </button>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-bold text-rose-300">Notice</p>
              <p className="mt-0.5 leading-relaxed text-slate-200">{errorMsg}</p>
            </div>
            {(activeTab === 'url' || errorMsg.includes('Text tab')) && (
              <button
                onClick={() => {
                  setActiveTab('text');
                  setErrorMsg(null);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-semibold hover:bg-cyan-900 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Switch to Text Tab to Paste Article</span>
              </button>
            )}
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: TEXT ANALYSIS */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-slate-300">
              PASTE NEWS ARTICLE, VIRAL CLAIM, OR HEADLINE:
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              placeholder="Paste any article paragraph, social media post, viral message, or headline here... (e.g. 'NASA announced three days of total darkness due to a solar storm')"
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all leading-relaxed font-sans"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Character count: {textInput.length}</span>
            {textInput.length > 0 && (
              <button
                onClick={() => setTextInput('')}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: URL ANALYSIS */}
      {activeTab === 'url' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-slate-300">
              PASTE ARTICLE OR NEWS WEBPAGE URL:
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/news/article-headline"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-mono transition-all"
              />
              <LinkIcon className="w-5 h-5 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-300">💡 URL Analysis Capability:</p>
            <p>
              VeriFact AI fetches the web article, extracts claims, and evaluates if the URL is a fact-check report or an unverified news claim. If an article is paywalled or unreachable, you can easily paste the article text in Tab 1.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: IMAGE / OCR ANALYSIS */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          {!selectedImage ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-8 text-center space-y-4 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-slate-800 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Drag & Drop screenshot or click to upload
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files?.[0] && handleImageFileChange(e.target.files[0])}
                className="hidden"
                id="image-upload-input"
              />
              <label
                htmlFor="image-upload-input"
                className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Browse Image File
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    SCREENSHOT PREVIEW
                  </span>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setOcrText('');
                    }}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Image
                  </button>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 max-h-60 flex items-center justify-center p-2">
                  <img
                    src={selectedImage}
                    alt="Uploaded news screenshot"
                    className="max-h-56 object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Extracted Text (OCR Editable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> EXTRACTED OCR TEXT (EDITABLE)
                  </span>
                  {isExtractingOcr && (
                    <span className="text-[11px] text-cyan-400 font-mono animate-pulse">
                      Running OCR...
                    </span>
                  )}
                </div>
                <textarea
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  rows={8}
                  placeholder={
                    isExtractingOcr
                      ? 'Extracting text from image using Gemini OCR...'
                      : 'Extracted text will appear here. You can edit or refine any words before submitting for fact-checking analysis.'
                  }
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Analyze CTA Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={handleAnalyze}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 group"
        >
          <Search className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-200" />
          <span>ANALYZE CLAIM NOW</span>
        </button>
      </div>
    </div>
  );
};
