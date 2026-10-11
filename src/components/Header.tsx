import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  RefreshCw,
  User as UserIcon,
  LogOut,
  LogIn,
  ChevronDown,
  Building2,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  apiConfigured: boolean;
  modelName: string;
  onOpenPrivacy: () => void;
  onRefreshStatus: () => void;
  isCheckingConfig: boolean;
  onOpenLogin: () => void;
  onOpenApiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiConfigured,
  modelName,
  onOpenPrivacy,
  onRefreshStatus,
  isCheckingConfig,
  onOpenLogin,
  onOpenApiKeyModal,
}) => {
  const { user, isAuthenticated, isGuest, logout, quickLoginAsDemo, demoAccounts } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-[#E8E2D5] bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#18261F] via-[#22342B] to-[#344E41] flex items-center justify-center text-white shadow-sm ring-1 ring-[#18261F]/10">
              <Sparkles className="w-5 h-5 text-[#DFC998]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#22342B] text-lg tracking-tight">HumanlyAI</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/40">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-xs text-[#6C7A72] hidden sm:block">
                AI Humanization & Natural Language Refinement Platform
              </p>
            </div>
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Model & AI Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                apiConfigured
                  ? 'bg-[#EEF3F0] border-[#344E41]/25 text-[#22342B]'
                  : 'bg-[#FBF7EE] border-[#E5D5B3] text-[#7A612D]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#344E41]" />
              <span className="hidden lg:inline font-mono">{modelName}</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiConfigured ? 'bg-[#344E41] animate-pulse' : 'bg-[#C2A56B]'
                  }`}
                />
                {apiConfigured ? 'AI Connected' : 'Key Missing'}
              </span>

              {onOpenApiKeyModal && (
                <button
                  type="button"
                  onClick={onOpenApiKeyModal}
                  title={apiConfigured ? 'Change Gemini API Key' : 'Configure Gemini API Key'}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ${
                    apiConfigured
                      ? 'bg-[#344E41]/10 hover:bg-[#344E41]/20 text-[#344E41]'
                      : 'bg-[#F5EEDC] hover:bg-[#EBDDBF] text-[#8C6D2D] ring-1 ring-[#C2A56B]/60'
                  }`}
                >
                  {apiConfigured ? 'Config' : 'Set Key'}
                </button>
              )}

              <button
                type="button"
                onClick={onRefreshStatus}
                title="Refresh AI Connection Status"
                className="hover:opacity-75 transition-opacity ml-0.5 cursor-pointer text-[#5B7A6C]"
                disabled={isCheckingConfig}
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingConfig ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Privacy Modal Button */}
            <button
              onClick={onOpenPrivacy}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#344E41] bg-[#F4EFE6] hover:bg-[#E8E2D5] transition-colors border border-[#E8E2D5] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#344E41]" />
              <span>Privacy & Ethics</span>
            </button>

            {/* Auth / User Profile Control */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-[#E8E2D5] hover:border-[#344E41]/30 bg-[#F4EFE6]/60 hover:bg-[#F4EFE6] transition-all text-xs font-medium text-[#22342B] shadow-xs cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#E8E2D5]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-[#344E41] text-[#FAF7F0] flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left hidden md:block">
                    <div className="leading-tight font-semibold text-[#22342B] truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-[#6C7A72] leading-none">
                      {user.isGuest ? 'Guest Pass' : user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6C7A72] ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E2D5] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-3 border-b border-[#E8E2D5]">
                      <p className="text-xs font-bold text-[#22342B]">{user.name}</p>
                      <p className="text-[11px] text-[#6C7A72] truncate">{user.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5EEDC] text-[#8C6D2D] border border-[#C2A56B]/30">
                          {user.role}
                        </span>
                        {user.organization && (
                          <span className="text-[10px] text-[#6C7A72] flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-[#5B7A6C]" />
                            {user.organization}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Switch Profile Fast-Track */}
                    <div className="px-3 py-2 border-b border-[#E8E2D5]">
                      <p className="text-[10px] font-semibold text-[#8A9A90] uppercase tracking-wider mb-1.5 px-1">
                        Switch Demo Persona
                      </p>
                      <div className="space-y-1">
                        {demoAccounts.map((acc, idx) => (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => {
                              quickLoginAsDemo(idx);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              user.id === acc.id
                                ? 'bg-[#EEF3F0] text-[#344E41] font-semibold'
                                : 'text-[#5B7A6C] hover:bg-[#FAF7F0]'
                            }`}
                          >
                            <span className="truncate">{acc.name} ({acc.role.split(' ')[0]})</span>
                            {user.id === acc.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#344E41] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="p-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenLogin();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#22342B] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#5B7A6C]" />
                        <span>Manage Account / Switch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          onOpenLogin();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#344E41] hover:bg-[#22342B] active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#DFC998]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
