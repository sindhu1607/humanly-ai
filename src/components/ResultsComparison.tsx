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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E8E2D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EEF3F0] text-[#344E41] border border-[#344E41]/20">
              {result.context.replace('_', ' ')}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/30 capitalize">
              Tone: {result.tone}
            </span>
            <span className="text-xs text-[#6C7A72]">
              • Processed in {result.processingTimeMs}ms
            </span>
          </div>
          <p className="text-xs text-[#22342B] mt-1 font-medium">{result.changesSummary}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F4EFE6] p-1 rounded-xl border border-[#E8E2D5] text-xs">
            <button
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
              onClick={() => setViewMode('diff')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === 'diff'
                  ? 'bg-white text-[#22342B] shadow-2xs font-semibold'
                  : 'text-[#6C7A72] hover:text-[#22342B]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Text Audit</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#F4EFE6] text-xs font-medium text-[#22342B] shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#344E41]" /> : <Copy className="w-3.5 h-3.5 text-[#5B7A6C]" />}
            <span>{copied ? 'Copied!' : 'Copy Result'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E2D5] bg-white hover:bg-[#F4EFE6] text-xs font-medium text-[#22342B] shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#5B7A6C]" />
            <span>Export TXT</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#344E41] text-white hover:bg-[#22342B] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#DFC998]" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Original Machine Text */}
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8A9A90]" />
                <h3 className="font-bold text-sm text-[#22342B]">Original Machine Text</h3>
              </div>
              <span className="text-xs text-[#6C7A72] font-mono">
                {origWords} words ({result.originalText.length} chars)
              </span>
            </div>

            <div className="mt-3 p-3.5 bg-[#FAF7F0]/60 rounded-xl border border-[#E8E2D5] text-[#22342B] text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap min-h-[220px]">
              {result.originalText}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E2D5] flex items-center justify-between text-xs text-[#6C7A72]">
            <span>Source text with formulaic cadences</span>
            <span className="font-medium text-[#22342B]">Protected Terms: {result.protectedTerms.length}</span>
          </div>
        </div>

        {/* Right: Refined Human Rewrite (Editable) */}
        <div className="bg-white border border-[#344E41]/35 rounded-2xl p-5 shadow-xs flex flex-col justify-between ring-1 ring-[#344E41]/20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#344E41] animate-pulse" />
                <h3 className="font-bold text-sm text-[#22342B]">Refined Human Communication</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/30">
                  Editable
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#6C7A72]">
                <span>
                  {newWords} words ({editedText.length} chars)
                </span>
                <span
                  className={`font-semibold ${
                    wordDiff < 0 ? 'text-[#344E41]' : 'text-[#6C7A72]'
                  }`}
                >
                  ({wordDiff > 0 ? `+${wordDiff}` : wordDiff} words)
                </span>
              </div>
            </div>

            <div className="mt-3 relative">
              <textarea
                value={editedText}
                onChange={handleTextChange}
                rows={10}
                className="w-full p-3.5 bg-[#FAF7F0]/30 focus:bg-white rounded-xl border border-[#E8E2D5] focus:border-[#344E41] focus:ring-1 focus:ring-[#344E41] text-[#22342B] text-xs sm:text-sm font-sans leading-relaxed resize-y focus:outline-hidden transition-colors"
                placeholder="Edit rewritten text here..."
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E2D5] flex items-center justify-between">
            <span className="text-xs text-[#6C7A72]">
              {isModified ? 'Text modified by user' : 'Authentic human phrasing'}
            </span>

            {isModified && (
              <button
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
