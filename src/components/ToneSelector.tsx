import React from 'react';
import { Award, Feather, MessageCircle } from 'lucide-react';
import { HumanlyTone } from '../types/humanly.ts';

interface ToneOption {
  id: HumanlyTone;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    subtitle: 'Direct & Measured',
    description: 'Straightforward, respectful, and authoritative without stiff corporate jargon.',
    icon: Award,
  },
  {
    id: 'polished',
    label: 'Polished',
    subtitle: 'Articulate & Refined',
    description: 'Fluid sentence cadence, elegant vocabulary, and executive clarity.',
    icon: Feather,
  },
  {
    id: 'conversational',
    label: 'Conversational',
    subtitle: 'Warm & Authentic',
    description: 'Approachable, friendly, and natural while keeping workplace decorum.',
    icon: MessageCircle,
  },
];

interface ToneSelectorProps {
  value: HumanlyTone;
  onChange: (value: HumanlyTone) => void;
  disabled?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <span>2. Select Humanization Style</span>
          <span className="text-xs font-normal text-slate-500">(Shapes tone & rhythm)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {TONE_OPTIONS.map((opt) => {
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
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                  {opt.subtitle}
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
