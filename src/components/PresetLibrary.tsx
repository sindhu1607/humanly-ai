import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '../data/presetSamples.ts';

interface PresetLibraryProps {
  onSelectPreset: (preset: SamplePreset) => void;
  disabled?: boolean;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({
  onSelectPreset,
  disabled = false,
}) => {
  return (
    <div className="bg-[#F4EFE6]/60 border border-[#E8E2D5] rounded-2xl p-3 sm:p-3.5 shadow-2xs">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C2A56B] shrink-0" />
          <span className="text-xs font-bold text-[#22342B] tracking-wide uppercase">
            Sample Templates
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#5B7A6C] border border-[#E8E2D5]">
            {SAMPLE_PRESETS.length} Scenarios
          </span>
        </div>
        <span className="text-[11px] text-[#6C7A72] hidden md:inline">
          Load realistic workplace drafts with pre-configured non-negotiable entities
        </span>
      </div>

      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        {SAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(preset)}
            className="w-[200px] sm:w-auto shrink-0 p-2.5 rounded-xl border border-[#E8E2D5] bg-white hover:border-[#344E41]/50 hover:bg-[#EEF3F0]/60 text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 cursor-pointer shadow-2xs"
            title={`${preset.name}: ${preset.description}`}
          >
            <div>
              <div className="font-semibold text-xs text-[#22342B] group-hover:text-[#344E41] truncate leading-tight">
                {preset.name}
              </div>
              <p className="text-[10px] text-[#6C7A72] mt-0.5 line-clamp-1 leading-normal">
                {preset.description}
              </p>
            </div>
            <div className="mt-2 pt-1.5 border-t border-[#E8E2D5]/70 flex items-center justify-between text-[10px] font-semibold text-[#344E41] group-hover:text-[#22342B]">
              <span>Load Sample</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#8C6D2D]" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
