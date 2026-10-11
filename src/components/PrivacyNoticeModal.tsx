import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, AlertCircle, X } from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18261F]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E8E2D5] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3F0] text-[#344E41] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#22342B] text-base">Privacy & Responsible AI Commitments</h3>
              <p className="text-xs text-[#6C7A72]">Enterprise Ethical AI Standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6C7A72] hover:text-[#22342B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commitments List */}
        <div className="space-y-3.5 text-xs text-[#6C7A72] leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
            <Lock className="w-4 h-4 text-[#344E41] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#22342B] block mb-0.5">Zero Persistent Storage</span>
              <span>
                HumanlyAI does not store your submitted text in databases, cookies, or disk logs. Once your session ends or you trigger a new analysis, text is cleared from transient memory.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
            <Server className="w-4 h-4 text-[#344E41] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#22342B] block mb-0.5">Secure AI Processing</span>
              <span>
                Submitted communication is forwarded securely via the backend proxy to Google Gemini API (gemini-3.8-flash) exclusively for the requested robotic analysis, refinement, and semantic audit.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#E8E2D5]">
            <EyeOff className="w-4 h-4 text-[#344E41] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#22342B] block mb-0.5">No Device Telemetry or Scraping</span>
              <span>
                No personal tracking, contacts harvesting, address books, or unrelated browser data is captured or uploaded under any circumstances.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF7EE] border border-[#E5D5B3] text-[#7A612D]">
            <AlertCircle className="w-4 h-4 text-[#C2A56B] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#5A451B] block mb-0.5">Responsible AI Assistance Principle</span>
              <span>
                Deterministic entity checks and semantic validation assist in flagging potential omissions or shifts in meaning. A 'PASS' status signifies that automated audits detected no discrepancies—it does not substitute for human judgment. Users retain final review authority.
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#344E41] text-white hover:bg-[#22342B] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
