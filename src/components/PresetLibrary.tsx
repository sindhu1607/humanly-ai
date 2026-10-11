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
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Test Bench Presets (Workplace Communication Scenarios)
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Click any preset to test robotic language detection & factual preservation
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {SAMPLE_PRESETS.map(preset => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPreset(preset)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all duration-150 flex flex-col justify-between group disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <div>
              <div className="font-semibold text-xs text-slate-800 group-hover:text-indigo-900 line-clamp-1">
                {preset.name}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-indigo-600">
              <span>Load Sample</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
