import React, { useState } from 'react';
import {
  KeyRound,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  Loader2,
  FileCode,
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfigured: boolean;
  modelName: string;
  onKeyConfigured: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiConfigured,
  modelName,
  onKeyConfigured,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [shouldVerify, setShouldVerify] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = apiKey.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a Gemini API key.');
      return;
    }

    if (trimmed.length < 15) {
      setErrorMessage('API key seems too short. Gemini keys typically start with AIzaSy... and are ~39 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: trimmed,
          test: shouldVerify,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to configure API key.');
      }

      setSuccessMessage(data.message || 'Gemini API key configured and activated successfully!');
      setApiKey('');
      onKeyConfigured();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify or save Gemini API key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18261F]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E8E2D5] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F4EFE6]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#18261F] via-[#22342B] to-[#344E41] text-[#DFC998] flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#22342B] text-base">Gemini API Key Setup</h3>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    apiConfigured
                      ? 'bg-[#EEF3F0] text-[#344E41] border-[#344E41]/30'
                      : 'bg-[#FBF7EE] text-[#7A612D] border-[#E5D5B3]'
                  }`}
                >
                  {apiConfigured ? 'Active' : 'Missing'}
                </span>
              </div>
              <p className="text-xs text-[#6C7A72] mt-0.5">
                Model: <span className="font-mono text-[#344E41] font-semibold">{modelName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6C7A72] hover:text-[#22342B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Status Context Banner */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] text-xs text-[#22342B] leading-relaxed space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-[#22342B]">
              <Sparkles className="w-3.5 h-3.5 text-[#C2A56B]" />
              <span>How to get your free Gemini API key:</span>
            </div>
            <p>
              1. Open{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#344E41] font-semibold inline-flex items-center gap-1 hover:underline"
              >
                Google AI Studio <ExternalLink className="w-3 h-3 text-[#C2A56B]" />
              </a>{' '}
              (Free tier available, no credit card required).
            </p>
            <p>2. Click <strong>Create API Key</strong> and paste it below.</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-2.5 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Success!</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Setup Error</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Key Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#22342B] flex items-center justify-between">
              <span>Paste Gemini API Key</span>
              <span className="text-[11px] font-normal text-[#6C7A72]">Starts with AIzaSy...</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                autoFocus
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono rounded-xl border border-[#E8E2D5] focus:outline-hidden focus:ring-2 focus:ring-[#344E41]/20 focus:border-[#344E41] transition-colors bg-white disabled:bg-[#FAF7F0] text-[#22342B]"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9A90] hover:text-[#22342B] cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Verification Option */}
          <label className="flex items-center gap-2 text-xs text-[#5B7A6C] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shouldVerify}
              onChange={(e) => setShouldVerify(e.target.checked)}
              className="rounded border-[#E8E2D5] text-[#344E41] focus:ring-[#344E41] w-3.5 h-3.5 cursor-pointer"
            />
            <span>Test key with Google Gemini API before saving</span>
          </label>

          {/* CLI / Developer Tip */}
          <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-[#6C7A72]">
            <div className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-[#5B7A6C]" />
              <span>Or add to <code>.env</code> file:</span>
            </div>
            <code className="bg-[#FAF7F0] border border-[#E8E2D5] px-1.5 py-0.5 rounded text-[10px] font-mono text-[#22342B]">
              GEMINI_API_KEY="..."
            </code>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[#5B7A6C] hover:bg-[#F4EFE6] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !apiKey.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#344E41] hover:bg-[#22342B] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DFC998]" />
                  <span>Verifying & Saving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#DFC998]" />
                  <span>Save & Activate Key</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
