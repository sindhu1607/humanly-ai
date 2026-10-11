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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
              {result.context.replace('_', ' ')}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
              Tone: {result.tone}
            </span>
            <span className="text-xs text-slate-400">
              • Processed in {result.processingTimeMs}ms
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 font-medium">{result.changesSummary}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'sideBySide'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side by Side</span>
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'diff'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Text Audit</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Result'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TXT</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Original Machine Text */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-slate-900">Original Machine Text</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {origWords} words ({result.originalText.length} chars)
              </span>
            </div>

            <div className="mt-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap min-h-[220px]">
              {result.originalText}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Source text with formulaic cadences</span>
            <span className="font-medium text-slate-700">Protected Terms: {result.protectedTerms.length}</span>
          </div>
        </div>

        {/* Right: Refined Human Rewrite (Editable) */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between ring-1 ring-indigo-500/10">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">Refined Human Communication</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  Editable
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>
                  {newWords} words ({editedText.length} chars)
                </span>
                <span
                  className={`font-semibold ${
                    wordDiff < 0 ? 'text-emerald-700' : 'text-slate-600'
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
                className="w-full p-3.5 bg-indigo-50/20 focus:bg-white rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 text-xs sm:text-sm font-sans leading-relaxed resize-y focus:outline-hidden transition-colors"
                placeholder="Edit rewritten text here..."
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isModified ? 'Text modified by user' : 'Authentic human phrasing'}
            </span>

            {isModified && (
              <button
                onClick={handleTriggerRevalidate}
                disabled={isRevalidating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRevalidating ? 'animate-spin' : ''}`} />
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
