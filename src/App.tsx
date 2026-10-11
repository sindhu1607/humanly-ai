import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  FileText,
  ShieldAlert,
  Loader2,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { ContextSelector } from './components/ContextSelector.tsx';
import { ToneSelector } from './components/ToneSelector.tsx';
import { ProtectedTermsInput } from './components/ProtectedTermsInput.tsx';
import { PresetLibrary } from './components/PresetLibrary.tsx';
import { ResultsComparison } from './components/ResultsComparison.tsx';
import { PrivacyNoticeModal } from './components/PrivacyNoticeModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import {
  HumanizeResponse,
  HumanlyContext,
  HumanlyTone,
  CompleteValidationResult,
} from './types/humanly.ts';
import { SamplePreset } from './data/presetSamples.ts';

function HumanlyPlayground() {
  const { user } = useAuth();
  const [showLoginPage, setShowLoginPage] = useState(false);

  const [text, setText] = useState('');
  const [context, setContext] = useState<HumanlyContext>('recruiter_feedback');
  const [tone, setTone] = useState<HumanlyTone>('polished');
  const [protectedTerms, setProtectedTerms] = useState<string[]>([
    'Elena Rostova',
    'Kubernetes',
    '3.5/5.0',
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [result, setResult] = useState<HumanizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [apiConfigured, setApiConfigured] = useState<boolean>(true);
  const [modelName, setModelName] = useState<string>('gemini-3.8-flash');
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  // Check config on initial load
  const checkConfig = async () => {
    setIsCheckingConfig(true);
    try {
      const res = await fetch('/api/config-status');
      if (res.ok) {
        const data = await res.json();
        setApiConfigured(Boolean(data.configured));
        if (data.model) setModelName(data.model);
      }
    } catch (e) {
      console.warn('Unable to reach config-status endpoint:', e);
    } finally {
      setIsCheckingConfig(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  const handleSelectPreset = (preset: SamplePreset) => {
    setText(preset.roboticText);
    setContext(preset.context);
    setTone(preset.suggestedTone);
    setProtectedTerms(preset.protectedTerms);
    setError(null);
  };

  const handleProcess = async () => {
    if (!text.trim()) {
      setError('Please provide text to analyze and humanize.');
      return;
    }

    if (text.trim().length < 5) {
      setError('Input text is too short. Please provide at least a few words.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProcessingStep('1. Identifying robotic markers and stiff formulations...');

    // Progress step updates for responsive UX
    const stepTimer1 = setTimeout(() => {
      setProcessingStep('2. Contextual humanization: refining rhythm and tone...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setProcessingStep('3. Factuality audit: verifying numbers, dates, and intent...');
    }, 2500);

    try {
      const response = await fetch('/api/process-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          context,
          tone,
          protectedTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process communication.');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Humanize workflow error:', err);
      setError(
        err.message ||
          'An unexpected error occurred while communicating with the AI service. Please verify your GEMINI_API_KEY.'
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleRevalidate = async (
    editedText: string
  ): Promise<CompleteValidationResult | null> => {
    if (!result) return null;
    setIsRevalidating(true);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: result.originalText,
          rewrittenText: editedText,
          context: result.context,
          protectedTerms: result.protectedTerms,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Validation failed.');
      }
      return data as CompleteValidationResult;
    } catch (err: any) {
      console.error('Revalidation error:', err);
      setError(err.message || 'Failed to rerun factuality validation on edited text.');
      return null;
    } finally {
      setIsRevalidating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  // Word and character count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  // Render Login page if not authenticated or explicitly toggled
  if (!user || showLoginPage) {
    return (
      <LoginPage
        onSuccess={() => setShowLoginPage(false)}
        onExploreAsGuest={() => setShowLoginPage(false)}
        onBackToWorkspace={user ? () => setShowLoginPage(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#22342B] font-sans flex flex-col selection:bg-[#C2A56B]/30 selection:text-[#344E41]">
      <Header
        apiConfigured={apiConfigured}
        modelName={modelName}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onRefreshStatus={checkConfig}
        isCheckingConfig={isCheckingConfig}
        onOpenLogin={() => setShowLoginPage(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Missing API Key Guidance Banner if not configured */}
        {!apiConfigured && (
          <div className="p-4 rounded-2xl bg-[#FBF7EE] border border-[#E5D5B3] text-[#7A612D] flex items-start justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#C2A56B] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-sm block mb-1 text-[#5A451B]">
                  Gemini API Key Required on Backend
                </span>
                <span>
                  HumanlyAI uses official Google GenAI ({modelName}) to analyze robotic language and rewrite communications. Enter your API key to activate live AI processing.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-3.5 py-2 bg-[#344E41] hover:bg-[#22342B] text-white font-semibold text-xs rounded-xl shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#DFC998]" />
              <span>Configure Key</span>
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-sm block mb-0.5">Execution Notice</span>
                <span>{error}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(error.toLowerCase().includes('gemini_api_key') ||
                error.toLowerCase().includes('api key') ||
                error.toLowerCase().includes('unauthorized')) && (
                <button
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="px-2.5 py-1 bg-[#344E41] hover:bg-[#22342B] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <KeyRound className="w-3 h-3 text-[#DFC998]" />
                  <span>Enter Key</span>
                </button>
              )}
              <button
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-1 rounded-md cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Sample Presets Selector */}
        <PresetLibrary onSelectPreset={handleSelectPreset} />

        {/* Input Configuration & Transformation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Input Text Area (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E2D5] p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#344E41]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#22342B] tracking-tight">
                  Source Communication Input
                </h2>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] sm:text-xs text-[#6C7A72] font-mono">
                  {wordCount} words • {charCount} chars
                </span>
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    title="Clear text"
                    className="text-[#8A9A90] hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste machine-generated or corporate text here to analyze robotic phrasing, adapt the tone, and run dual-layer validation on entities and meaning..."
              rows={6}
              className="w-full rounded-xl border border-[#E8E2D5] p-3.5 text-xs sm:text-sm font-sans leading-relaxed text-[#22342B] placeholder-[#8A9A90] focus:outline-hidden focus:ring-2 focus:ring-[#344E41]/20 focus:border-[#344E41] transition-all resize-y min-h-[140px] max-h-[360px] bg-[#FAF7F0]/40"
            />

            {/* Protected Entities Input */}
            <ProtectedTermsInput
              terms={protectedTerms}
              onChange={setProtectedTerms}
            />

            {/* Action Bar */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => handleReset()}
                disabled={!result && !text}
                className="h-10 sm:h-11 px-4 rounded-xl border border-[#E8E2D5] text-xs font-semibold text-[#5B7A6C] hover:text-[#22342B] hover:bg-[#F4EFE6] disabled:opacity-40 disabled:hover:bg-transparent transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>

              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !text.trim()}
                className="h-10 sm:h-11 px-6 rounded-xl bg-gradient-to-r from-[#344E41] via-[#2F473B] to-[#24362D] hover:from-[#24362D] hover:to-[#1A2821] text-white font-semibold text-xs tracking-wide shadow-md shadow-[#344E41]/20 hover:shadow-[#344E41]/35 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#DFC998]" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#DFC998]" />
                    <span>Humanize & Validate Text</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-[#DFC998]" />
                  </>
                )}
              </button>
            </div>

            {/* Processing Steps Status indicator */}
            {isProcessing && (
              <div className="pt-2.5 border-t border-[#E8E2D5]">
                <div className="flex items-center gap-2 text-xs text-[#344E41] font-medium animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#344E41] animate-ping" />
                  <span>{processingStep}</span>
                </div>
                <div className="w-full bg-[#FAF7F0] h-1.5 rounded-full overflow-hidden mt-1.5 border border-[#E8E2D5]/60">
                  <div className="bg-[#344E41] h-full rounded-full animate-indeterminate" />
                </div>
              </div>
            )}
          </div>

          {/* Configuration Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Context Selector */}
            <ContextSelector value={context} onChange={setContext} />

            {/* Tone Selector */}
            <ToneSelector value={tone} onChange={setTone} />
          </div>
        </div>

        {/* Results and Validation Section */}
        {result && (
          <ResultsComparison
            result={result}
            onReset={handleReset}
            onRevalidate={handleRevalidate}
            isRevalidating={isRevalidating}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-white py-6 text-xs text-[#6C7A72]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#22342B]">HumanlyAI</span>
            <span>•</span>
            <span>AI Humanization & Refinement Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginPage(true)}
              className="hover:text-[#344E41] transition-colors font-medium text-[#5B7A6C] cursor-pointer"
            >
              Account / Switch Persona
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-[#22342B] transition-colors cursor-pointer"
            >
              Privacy & Responsible AI Notice
            </button>
            <span>•</span>
            <span>Powered by Google GenAI ({modelName})</span>
          </div>
        </div>
      </footer>

      {/* Privacy Notice Modal */}
      <PrivacyNoticeModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiConfigured={apiConfigured}
        modelName={modelName}
        onKeyConfigured={() => {
          checkConfig();
          setError(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HumanlyPlayground />
    </AuthProvider>
  );
}
