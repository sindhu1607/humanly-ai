import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  RefreshCw,
  Edit3,
  Columns,
  GitCompare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { HumanizeResponse, CompleteValidationResult } from '../types/humanly.ts';
import { RoboticAnalysisPanel } from './RoboticAnalysisPanel.tsx';
import { ValidationReport } from './ValidationReport.tsx';

interface ResultsComparisonProps {
  result: HumanizeResponse;
  onReset: () => void;
  onRevalidate: (editedText: string) => Promise<CompleteValidationResult | null>;
  isRevalidating: boolean;
}

export const ResultsComparison: React.FC<ResultsComparisonProps> = ({
  result,
  onReset,
  onRevalidate,
  isRevalidating,
}) => {
  const [editedText, setEditedText] = useState(result.rewrittenText);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'diff'>('sideBySide');
  const [validationResult, setValidationResult] = useState<CompleteValidationResult>(
    result.validation
  );
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setEditedText(result.rewrittenText);
    setValidationResult(result.validation);
    setIsModified(false);
  }, [result]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditedText(val);
    setIsModified(val !== result.rewrittenText);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editedText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `humanly_${result.context}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleTriggerRevalidate = async () => {
    const updated = await onRevalidate(editedText);
    if (updated) {
      setValidationResult(updated);
      setIsModified(false);
    }
  };

  // Word & character counts
  const origWords = result.originalText.trim().split(/\s+/).filter(Boolean).length;
  const newWords = editedText.trim().split(/\s+/).filter(Boolean).length;
  const wordDiff = newWords - origWords;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EEF3F0] text-[#344E41] border border-[#344E41]/20">
              {result.context.replace('_', ' ')}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/30 capitalize">
              Style: {result.tone}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                validationResult.overallStatus === 'PASS'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : validationResult.overallStatus === 'REVIEW'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {validationResult.overallStatus} • {validationResult.deterministic.score}% Factual Score
            </span>
            <span className="text-[11px] text-[#6C7A72]">
              • {result.processingTimeMs}ms
            </span>
          </div>
          <p className="text-xs text-[#22342B] mt-1 font-medium">{result.changesSummary}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F4EFE6] p-0.5 rounded-xl border border-[#E8E2D5] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('sideBySide')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'sideBySide'
                  ? 'bg-white text-[#22342B] shadow-2xs font-semibold'
                  : 'text-[#6C7A72] hover:text-[#22342B]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side by Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('diff')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'diff'
                  ? 'bg-white text-[#22342B] shadow-2xs font-semibold'
                  : 'text-[#6C7A72] hover:text-[#22342B]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Detailed Audit</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#344E41]/30 bg-[#EEF3F0] hover:bg-[#344E41] hover:text-white text-xs font-semibold text-[#344E41] shadow-2xs transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Refined Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#F4EFE6] text-xs font-medium text-[#22342B] shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5B7A6C]" />
            <span>Export TXT</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#344E41] text-white hover:bg-[#22342B] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#DFC998]" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: Original Machine Text */}
        <div className="bg-[#FAF7F0]/40 border border-[#E8E2D5] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-[#22342B]">Original AI Draft</h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  Stiff Cadence
                </span>
              </div>
              <span className="text-xs text-[#6C7A72] font-mono">
                {origWords} words • {result.originalText.length} chars
              </span>
            </div>

            <div className="mt-3 p-3.5 bg-white/70 rounded-xl border border-[#E8E2D5] text-[#22342B] text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap min-h-[220px] max-h-[460px] overflow-y-auto">
              {result.originalText}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between text-xs text-[#6C7A72]">
            <span>Contains repetitive formulas & stiff markers</span>
            <span className="font-medium text-[#22342B]">
              Protected Entities: {result.protectedTerms.length}
            </span>
          </div>
        </div>

        {/* Right: Refined Human Rewrite (Strongest Visual Emphasis) */}
        <div className="bg-white border-2 border-[#344E41] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between ring-2 ring-[#344E41]/15 relative">
          {/* Subtle Top Accent Pill */}
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#344E41] text-white text-[10px] font-bold tracking-wide uppercase shadow-2xs flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#DFC998]" />
            <span>HumanlyAI Refined Output</span>
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5] mt-1 sm:mt-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="font-bold text-sm text-[#22342B]">Authentic Human Voice</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/30">
                  Editable
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#6C7A72]">
                <span>
                  {newWords} words
                </span>
                <span
                  className={`font-semibold ${
                    wordDiff <= 0 ? 'text-[#344E41]' : 'text-[#8C6D2D]'
                  }`}
                >
                  ({wordDiff > 0 ? `+${wordDiff}` : wordDiff} words)
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy text"
                  className="p-1 text-[#5B7A6C] hover:text-[#344E41] hover:bg-[#EEF3F0] rounded cursor-pointer transition-colors ml-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="mt-3 relative">
              <textarea
                value={editedText}
                onChange={handleTextChange}
                rows={9}
                className="w-full p-3.5 bg-[#FAF7F0]/20 focus:bg-white rounded-xl border border-[#E8E2D5] focus:border-[#344E41] focus:ring-2 focus:ring-[#344E41]/20 text-[#22342B] text-xs sm:text-sm font-sans leading-relaxed resize-y focus:outline-hidden transition-all min-h-[220px] max-h-[460px]"
                placeholder="Edit rewritten text here..."
              />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E8E2D5] flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-[#5B7A6C] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#344E41]" />
              {isModified ? 'Text modified by user — revalidation recommended' : 'Authentic human phrasing • Facts preserved'}
            </span>

            {isModified && (
              <button
                type="button"
                onClick={handleTriggerRevalidate}
                disabled={isRevalidating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C6D2D] hover:bg-[#735721] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#DFC998] ${isRevalidating ? 'animate-spin' : ''}`} />
                <span>{isRevalidating ? 'Revalidating...' : 'Rerun Validation on Edit'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Report Banner and Detail Matrix */}
      <ValidationReport validation={validationResult} />

      {/* Robotic Language Analysis Panel */}
      {result.roboticAnalysis && (
        <RoboticAnalysisPanel analysis={result.roboticAnalysis} />
      )}
    </div>
  );
};
