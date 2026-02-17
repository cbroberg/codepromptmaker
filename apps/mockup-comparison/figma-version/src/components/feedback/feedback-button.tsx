'use client';

import { MessageSquarePlus } from 'lucide-react';

interface FeedbackButtonProps {
  hasFeedback: boolean;
  onClick: () => void;
}

export function FeedbackButton({ hasFeedback, onClick }: FeedbackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 right-3 z-[60] flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-medium text-[#64748B] shadow-sm hover:bg-white hover:text-[#6366F1] hover:border-[#6366F1]/30 transition-all"
      title="Add feedback for this section"
    >
      <MessageSquarePlus className="w-3.5 h-3.5" />
      Feedback
      {hasFeedback && (
        <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
      )}
    </button>
  );
}
