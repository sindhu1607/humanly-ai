import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Hash,
  Calendar,
  Lock,
  Tag,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CompleteValidationResult, ValidationStatus } from '../types/humanly.ts';

interface ValidationReportProps {
  validation: CompleteValidationResult;
}

export const ValidationReport: React.FC<ValidationReportProps> = ({ validation }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'entities' | 'semantic'>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const statusConfig: Record<
    ValidationStatus,
    { badgeBg: string; textCol: string; borderCol: string; icon: React.ElementType }
  > = {
    PASS: {
      badgeBg: 'bg-emerald-500',
      textCol: 'text-emerald-950',
      borderCol: 'border-emerald-300',
      icon: CheckCircle2,
    },
    REVIEW: {
      badgeBg: 'bg-amber-500',
      textCol: 'text-amber-950',
      borderCol: 'border-amber-300',
      icon: AlertTriangle,
    },
    FAIL: {
      badgeBg: 'bg-rose-500',
      textCol: 'text-rose-950',
      borderCol: 'border-rose-300',
      icon: XCircle,
    },
  };

  const curr = statusConfig[validation.overallStatus];
  const StatusIcon = curr.icon;

  const { deterministic, semantic } = validation;

  return (
    <div className={`bg-white border ${curr.borderCol} rounded-2xl p-5 shadow-xs space-y-4`}>
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${curr.badgeBg} text-white flex items-center justify-center shrink-0 shadow-xs`}
          >
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  validation.overallStatus === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : validation.overallStatus === 'REVIEW'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {validation.overallStatus}
              </span>
              <h3 className="font-bold text-[#22342B] text-sm">{validation.statusHeadline}</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/40">
                Score: {deterministic.score}%
              </span>
            </div>
            <p className="text-xs text-[#6C7A72] mt-1 leading-relaxed">
              {validation.summaryReason}
            </p>
            {validation.actionableGuidance && (
              <p className="text-xs font-medium text-amber-800 mt-1">
                {validation.actionableGuidance}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-[#6C7A72] hover:text-[#22342B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
              <div className="text-[11px] text-[#6C7A72] font-medium">Preserved Entities</div>
              <div className="text-sm font-bold text-[#22342B] mt-0.5">
                {deterministic.checksSummary.preservedCount} /{' '}
                {deterministic.checksSummary.totalEntitiesFound}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
              <div className="text-[11px] text-[#6C7A72] font-medium">Numbers & Scores</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  deterministic.checksSummary.numbersPreserved
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {deterministic.checksSummary.numbersPreserved ? 'Preserved' : 'Missing Numbers'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
              <div className="text-[11px] text-[#6C7A72] font-medium">Dates & Times</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  deterministic.checksSummary.datesPreserved
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {deterministic.checksSummary.datesPreserved ? 'Preserved' : 'Needs Review'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
              <div className="text-[11px] text-[#6C7A72] font-medium">Semantic Rating</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  semantic.meaningPreservationRating === 'EXACT'
                    ? 'text-[#344E41]'
                    : semantic.meaningPreservationRating === 'SLIGHT_VARIATION'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {semantic.meaningPreservationRating}
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1.5 border-b border-[#E8E2D5] pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#344E41] text-[#FAF7F0]'
                  : 'text-[#5B7A6C] hover:bg-[#EEF3F0]'
              }`}
            >
              All Validation Findings
            </button>
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'entities'
                  ? 'bg-[#344E41] text-[#FAF7F0]'
                  : 'text-[#5B7A6C] hover:bg-[#EEF3F0]'
              }`}
            >
              Deterministic Entities ({deterministic.preservedEntities.length} Preserved /{' '}
              {deterministic.missingEntities.length} Missing)
            </button>
            <button
              onClick={() => setActiveTab('semantic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'semantic'
                  ? 'bg-[#344E41] text-[#FAF7F0]'
                  : 'text-[#5B7A6C] hover:bg-[#EEF3F0]'
              }`}
            >
              AI Semantic Audit ({semantic.findings.length} Items)
            </button>
          </div>

          {/* Tab 1 or Tab 2: Deterministic Entity Matrix */}
          {(activeTab === 'all' || activeTab === 'entities') && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#22342B] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#344E41]" />
                <span>Deterministic Fact & Entity Tracking</span>
              </h4>

              {/* Missing Entities Alert */}
              {deterministic.missingEntities.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                  <div className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Missing Entities Detected in Rewrite</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {deterministic.missingEntities.map((e, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-800 text-xs font-medium"
                      >
                        [{e.type}] <span className="font-bold">{e.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly Introduced Entities Alert */}
              {deterministic.newEntities.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Newly Introduced Unverified Numbers or Dates</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {deterministic.newEntities.map((e, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-800 text-xs font-medium"
                      >
                        [{e.type}] <span className="font-bold">{e.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preserved Entities Chips */}
              <div>
                <div className="text-[11px] font-medium text-[#6C7A72] mb-1.5">
                  Faithfully Preserved Entities ({deterministic.preservedEntities.length}):
                </div>
                {deterministic.preservedEntities.length === 0 ? (
                  <div className="text-xs text-[#8A9A90] italic">No entities extracted.</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {deterministic.preservedEntities.map((e, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF3F0] border border-[#344E41]/25 text-[#22342B] text-xs font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#344E41]" />
                        <span className="text-[10px] uppercase text-[#344E41] font-semibold">
                          {e.type.replace('_', ' ')}:
                        </span>
                        <span>{e.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 1 or Tab 3: AI Semantic Audit Findings */}
          {(activeTab === 'all' || activeTab === 'semantic') && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#22342B] uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#344E41]" />
                <span>AI Semantic Comparison Audit</span>
              </h4>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5] text-xs text-[#22342B] leading-relaxed">
                <span className="font-semibold text-[#22342B]">Semantic Evaluation Summary: </span>
                {semantic.explanation}
              </div>

              {semantic.findings.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#6C7A72] bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl">
                  No semantic contradictions, unsupported claims, or omissions flagged by the audit.
                </div>
              ) : (
                <div className="space-y-2">
                  {semantic.findings.map((finding, idx) => {
                    const isMismatch = finding.severity === 'definite_mismatch';
                    const isReview = finding.severity === 'uncertain_review';
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          isMismatch
                            ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                            : isReview
                            ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                            : 'bg-[#FAF7F0] border-[#E8E2D5] text-[#22342B]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold capitalize">
                            {finding.type.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isMismatch
                                ? 'bg-rose-200 text-rose-900'
                                : isReview
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-[#E8E2D5] text-[#22342B]'
                            }`}
                          >
                            {finding.severity.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="leading-relaxed">{finding.description}</p>

                        {(finding.originalSnippet || finding.rewriteSnippet) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                            {finding.originalSnippet && (
                              <div className="p-2 rounded-lg bg-white border border-[#E8E2D5]">
                                <span className="font-bold text-[#6C7A72] block mb-0.5">
                                  Original:
                                </span>
                                "{finding.originalSnippet}"
                              </div>
                            )}
                            {finding.rewriteSnippet && (
                              <div className="p-2 rounded-lg bg-white border border-[#E8E2D5]">
                                <span className="font-bold text-[#6C7A72] block mb-0.5">
                                  Rewrite:
                                </span>
                                "{finding.rewriteSnippet}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
