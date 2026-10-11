import React, { useState } from 'react';
import { Lock, Plus, X } from 'lucide-react';

interface ProtectedTermsInputProps {
  terms: string[];
  onChange: (terms: string[]) => void;
  disabled?: boolean;
}

export const ProtectedTermsInput: React.FC<ProtectedTermsInputProps> = ({
  terms,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTerm = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !terms.includes(trimmed)) {
      onChange([...terms, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTerm();
    }
  };

  const handleRemove = (termToRemove: string) => {
    onChange(terms.filter(t => t !== termToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#22342B] flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#344E41]" />
          <span>Protected Terms & Non-Negotiable Entities</span>
          <span className="text-[11px] font-normal text-[#6C7A72]">
            (Strictly preserved: names, metrics, acronyms)
          </span>
        </label>
        {terms.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            className="text-[11px] text-[#6C7A72] hover:text-rose-600 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#F4EFE6]/60 rounded-xl border border-[#E8E2D5]">
        {terms.map(term => (
          <span
            key={term}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#344E41]/30 text-[#22342B] text-xs font-medium shadow-2xs group"
          >
            <Lock className="w-2.5 h-2.5 text-[#344E41]" />
            <span>{term}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleRemove(term)}
              className="text-[#8A9A90] hover:text-rose-600 ml-0.5 rounded-sm p-0.5 cursor-pointer"
              title="Remove protected term"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex items-center gap-1 flex-1 min-w-[200px]">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              terms.length === 0
                ? "Type a name or term and press Enter (e.g. 'Sarah Jenkins', 'Q3 budget')"
                : "Add another protected term..."
            }
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-[#22342B] placeholder-[#8A9A90] px-2 py-1"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={handleAddTerm}
              disabled={disabled}
              className="px-2.5 py-1 rounded-lg bg-[#344E41] text-white text-xs font-medium hover:bg-[#22342B] flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-colors"
            >
              <Plus className="w-3 h-3 text-[#DFC998]" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
