'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { FeedbackButton } from './feedback-button';

interface FeedbackPanelProps {
  label: string;
  feedback: string;
  hasFeedback: boolean;
  onFeedbackChange: (value: string) => void;
  buttonTopClass?: string;
}

export function FeedbackPanel({ label, feedback, hasFeedback, onFeedbackChange, buttonTopClass }: FeedbackPanelProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <FeedbackButton hasFeedback={hasFeedback} onClick={() => {}} topClass={buttonTopClass} />
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 bg-white border-[#E2E8F0]">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-[#0F172A]">{label}</h4>
            <p className="text-xs text-[#94A3B8]">What to keep, change, or remove?</p>
          </div>
          <Textarea
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder="e.g. Keep the gradient headline. Remove the CLI badge."
            className="min-h-[100px] text-sm border-[#E2E8F0] bg-[#FAFBFC] text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:ring-[#6366F1]/30"
          />
          <p className="text-[10px] text-[#94A3B8]">Auto-saves as you type</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
