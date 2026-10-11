import React from 'react';
import {
  MessageSquare,
  Send,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  Briefcase,
} from 'lucide-react';
import { HumanlyContext } from '../types/humanly.ts';

interface ContextOption {
  id: HumanlyContext;
  label: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
}

const CONTEXT_OPTIONS: ContextOption[] = [
  {
    id: 'recruiter_feedback',
    label: 'Recruiter Feedback',
    tagline: 'Candidate Guidance',
    description: 'Constructive feedback and empathetic updates without sterile rejection formulas.',
    icon: MessageSquare,
  },
  {
    id: 'candidate_communication',
    label: 'Candidate Communication',
    tagline: 'Interviews & Updates',
    description: 'Warm, clear scheduling notices, prep notes, and interview prep alignment.',
    icon: Send,
  },
  {
    id: 'interview_questions',
    label: 'Interview Questions',
    tagline: 'Evaluative Inquiries',
    description: 'Natural, engaging prompts that encourage candidates to share authentic depth.',
    icon: HelpCircle,
  },
  {
    id: 'interview_summaries',
    label: 'Interview Summaries',
    tagline: 'Debriefs & Scores',
    description: 'Crisp, structured evaluation takeaways highlighting strengths and gaps.',
    icon: FileSpreadsheet,
  },
  {
    id: 'professional_reports',
    label: 'Professional Reports',
    tagline: 'Executive Insights',
    description: 'Punchy takeaways and clear data summaries without corporate fluff.',
    icon: FileText,
  },
  {
    id: 'general_professional',
    label: 'General Professional',
    tagline: 'Workplace Correspondence',
    description: 'Authentic workplace messages, emails, and cross-team alignment.',
    icon: Briefcase,
  },
];

interface ContextSelectorProps {
  value: HumanlyContext;
  onChange: (value: HumanlyContext) => void;
  disabled?: boolean;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <span>1. Select Communication Context</span>
          <span className="text-xs font-normal text-slate-500">(Shapes domain nuance & tone)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CONTEXT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between relative group ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-950 leading-snug">
                  {opt.label}
                </div>
                <div className="text-[11px] font-medium text-indigo-700 mt-0.5">
                  {opt.tagline}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
