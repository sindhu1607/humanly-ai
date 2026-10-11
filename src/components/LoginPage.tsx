import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Briefcase,
  Users,
  Building2,
  AlertCircle,
  HelpCircle,
  X,
  FileText,
  Quote,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { User } from '../types/auth.ts';

interface LoginPageProps {
  onSuccess?: () => void;
  onExploreAsGuest?: () => void;
  onBackToWorkspace?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onExploreAsGuest,
  onBackToWorkspace,
}) => {
  const { login, signup, loginWithGoogle, loginWithGithub, loginAsGuest, quickLoginAsDemo, demoAccounts } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<User['role']>('Recruiter');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Too short', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 2) return { score: 50, label: 'Moderate', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-600' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-600' };
  };

  const passStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'signin') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in. Please verify your details.');
          setIsLoading(false);
          return;
        }
      } else {
        const res = await signup(fullName, email, password, role, organization);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create account.');
          setIsLoading(false);
          return;
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithGithub();
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setErrorMessage(`Failed to authenticate with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = (idx: number) => {
    quickLoginAsDemo(idx);
    if (onSuccess) onSuccess();
  };

  const handleGuestClick = () => {
    loginAsGuest();
    if (onExploreAsGuest) onExploreAsGuest();
    else if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Studio Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white font-bold text-base tracking-wider shadow-sm">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-950 text-lg tracking-tight">Humanly<span className="text-slate-500 font-medium">AI</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Refinement Platform
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToWorkspace && (
              <button
                type="button"
                onClick={onBackToWorkspace}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <span>&larr;</span>
                <span>Open Playground</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleGuestClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200"
            >
              <span>Instant Guest Pass</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Content Layout */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Editorial Product Narrative & Tangible Memo Sample */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Dual-Layer Entity & Meaning Validation</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Machine intelligence, calibrated for <span className="underline decoration-slate-300 decoration-3 underline-offset-4">human nuance</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Raw AI outputs often sound cold, formulaic, and detached. HumanlyAI transforms 
                stiff drafts into authentic, resonant communication — using dual-layer validation 
                to help identify and preserve critical facts, dates, scores, and protected terms.
              </p>
            </div>

            {/* Tangible Workplace Memo Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/40 p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Transformation Benchmark
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  DOC-REF #8201 · Recruiter Feedback
                </span>
              </div>

              {/* Before Section: The Robotic Draft */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Stiff AI Draft (Detached & Formulaic)
                </div>
                <p className="text-xs text-slate-600 bg-rose-50/40 p-3 rounded-xl border border-rose-200/60 font-mono leading-relaxed">
                  "Furthermore, it has come to our attention that applicant{' '}
                  <span className="text-slate-900 bg-rose-100/70 px-1 py-0.5 rounded font-semibold">Elena Rostova</span>{' '}
                  achieved an evaluation score of{' '}
                  <span className="text-slate-900 bg-rose-100/70 px-1 py-0.5 rounded font-semibold">3.5/5.0</span>.
                  Regrettably, we cannot proceed with your candidacy at this juncture."
                </p>
              </div>

              {/* After Section: The Humanly Refinement */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  HumanlyAI Refinement (Warm, Clear & Authentic)
                </div>
                <p className="text-xs text-slate-800 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200/60 leading-relaxed font-sans">
                  "Thank you for interviewing with us,{' '}
                  <span className="font-bold text-slate-950">Elena</span>! While your score of{' '}
                  <span className="font-bold text-slate-950">3.5/5.0</span> highlighted strong expertise in
                  distributed systems, we've decided to proceed with candidates closer to our immediate
                  senior team roadmap."
                </p>
              </div>

              {/* Verified Verification Stamp */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dual-Layer Validation Checked</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Protected: <span className="font-mono text-slate-700">Elena Rostova</span>, <span className="font-mono text-slate-700">3.5/5.0</span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
              <Quote className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <p className="italic text-slate-800 font-medium mb-1">
                  "Our hiring team sends hundreds of candidate notes weekly. HumanlyAI removes the robotic corporate chill while ensuring our feedback remains completely accurate."
                </p>
                <p className="text-[11px] text-slate-500">
                  <strong className="text-slate-700 font-semibold">Sarah Jenkins</strong> · Lead Technical Recruiter
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, High-End Studio Authentication Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-7 sm:p-9 relative">
              
              {/* Header Title & Tab Switcher */}
              <div className="mb-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                    {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeTab === 'signin'
                      ? 'Sign in to access your refinement workspace and presets.'
                      : 'Join the platform to humanize communication and audit meaning preservation.'}
                  </p>
                </div>

                {/* Minimal Segmented Tab Switcher */}
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'signin'
                        ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      activeTab === 'signup'
                        ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Social OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-xs active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-xs active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 fill-slate-900 shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-slate-200" />
                <span className="absolute bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Or with email
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'signup' && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all"
                        />
                      </div>
                    </div>

                    {/* Workplace Role Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Workplace Role
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Recruiter', 'Hiring Manager', 'Talent Partner', 'Executive Lead'] as User['role'][]).map(
                          (r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                                role === r
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  role === r ? 'bg-white' : 'bg-slate-400'
                                }`}
                              />
                              <span className="truncate">{r}</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Company or Team
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. Stripe, Linear, Notion"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setShowForgotModal(true);
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {activeTab === 'signup' && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Security rating:</span>
                        <span className="font-semibold text-slate-700">{passStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passStrength.color} transition-all duration-300`}
                          style={{ width: `${passStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Remember Me */}
                {activeTab === 'signin' && (
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="remember" className="ml-2 text-xs text-slate-600 cursor-pointer">
                      Keep me signed in on this device
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{activeTab === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Discrete Sandbox Demo Personas (Evaluator Friendly) */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Personas
                  </span>
                  <span className="text-[11px] text-slate-400">1-click test</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoClick(0)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">Sarah (Recruiter)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoClick(1)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">Devon (Manager)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">HumanlyAI</span>
            <span>•</span>
            <span>AI Humanization & Natural Language Refinement</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleGuestClick}
              className="text-slate-600 hover:text-slate-950 font-medium"
            >
              Continue as Guest Evaluator &rarr;
            </button>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-slate-900">
              <HelpCircle className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-lg">Reset Password</h3>
            </div>

            {forgotSent ? (
              <div className="space-y-4 text-center py-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Recovery Instructions Sent</p>
                  <p className="text-xs text-slate-500">
                    We sent password reset steps to <span className="text-slate-900 font-medium">{forgotEmail}</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your work email address and we'll send you an instant reset link to access your account.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotEmail.includes('@')) {
                        setForgotSent(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-semibold"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
