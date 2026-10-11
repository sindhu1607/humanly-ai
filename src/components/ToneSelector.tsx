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
        <label className="text-sm font-semibold text-[#22342B] flex items-center gap-1.5">
          <span>2. Select Humanization Style</span>
          <span className="text-xs font-normal text-[#6C7A72]">(Shapes tone & rhythm)</span>
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
                  ? 'border-[#344E41] bg-[#EEF3F0] shadow-xs ring-1 ring-[#344E41]/30'
                  : 'border-[#E8E2D5] bg-white hover:border-[#344E41]/40 hover:bg-[#FAF7F0]'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#344E41] text-[#FAF7F0] shadow-xs'
                        : 'bg-[#F4EFE6] text-[#5B7A6C] group-hover:text-[#22342B]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#344E41]" />
                  )}
                </div>

                <div className="font-bold text-xs text-[#22342B] leading-snug">
                  {opt.label}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8C6D2D] mt-0.5">
                  {opt.subtitle}
                </div>
              </div>

              <p className="text-[11px] text-[#6C7A72] mt-2 leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
