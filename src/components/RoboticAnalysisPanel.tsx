import React, { useState } from 'react';
import {
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { RoboticAnalysisResult, RoboticIssue } from '../types/humanly.ts';

interface RoboticAnalysisPanelProps {
  analysis: RoboticAnalysisResult;
}

const CATEGORY_LABELS: Record<RoboticIssue['category'], { label: string; badgeColor: string }> = {
  repetitive_phrases: {
    label: 'Repetitive Phrasing',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  overly_formal_or_templated: {
    label: 'Templated / Over-Formal',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  awkward_transitions: {
    label: 'Awkward Transition',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  unnatural_wording: {
    label: 'Unnatural / Stiff Phrasing',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  unnecessary_verbosity: {
    label: 'Filler / Verbosity',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
  },
};

export const RoboticAnalysisPanel: React.FC<RoboticAnalysisPanelProps> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredIssues =
    filterCategory === 'all'
      ? analysis.issues
      : analysis.issues.filter(issue => issue.category === filterCategory);

  const densityBadge =
    analysis.roboticDensity === 'high'
      ? { label: 'High Robotic Density', color: 'bg-rose-100 text-rose-800 border-rose-200' }
      : analysis.roboticDensity === 'moderate'
      ? { label: 'Moderate Robotic Density', color: 'bg-amber-100 text-amber-800 border-amber-200' }
      : { label: 'Low Robotic Density', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Robotic Language Observations
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${densityBadge.color}`}
              >
                {densityBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditing cadences, artificial templates, verbosity, and awkward markers
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Naturalness Assessment Box */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Overall Assessment</span>
            </div>
            <p className="leading-relaxed">{analysis.overallAssessment}</p>
            {analysis.readabilityNotes && (
              <p className="text-slate-600 border-t border-slate-200 pt-2 text-[11px] leading-relaxed">
                <span className="font-medium text-slate-800">Readability & Rhythm: </span>
                {analysis.readabilityNotes}
              </p>
            )}
          </div>

          {/* Ethics Clarification Disclaimer */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/50 border border-blue-200/60 text-[11px] text-blue-900 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Disclaimer:</strong> These observations evaluate style, formulaic phrasing, and natural flow. HumanlyAI does not claim to definitively identify AI authorship, but surfaces linguistic markers that diminish human engagement.
            </span>
          </div>

          {/* Filter Pills */}
          {analysis.issues.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Observations ({analysis.issues.length})
              </button>
              {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => {
                const count = analysis.issues.filter(i => i.category === catKey).length;
                if (count === 0) return null;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setFilterCategory(catKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      filterCategory === catKey
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : `${catMeta.badgeColor} hover:opacity-80`
                    }`}
                  >
                    {catMeta.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Issues List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredIssues.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No specific robotic issues flagged for this category.
              </div>
            ) : (
              filteredIssues.map((issue, idx) => {
                const catInfo = CATEGORY_LABELS[issue.category] || {
                  label: issue.category,
                  badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        {issue.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${catInfo.badgeColor}`}
                      >
                        {catInfo.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>

                    {issue.excerpt && (
                      <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100 text-xs font-mono text-rose-950">
                        <span className="font-bold text-rose-800 text-[10px] uppercase block mb-0.5">
                          Detected Excerpt:
                        </span>
                        "{issue.excerpt}"
                      </div>
                    )}

                    {issue.suggestion && (
                      <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950">
                        <span className="font-bold text-emerald-800 text-[10px] uppercase block mb-0.5">
                          Refined Alternative:
                        </span>
                        {issue.suggestion}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
