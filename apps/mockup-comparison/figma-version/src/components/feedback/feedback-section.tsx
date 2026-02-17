'use client';

import { useFeedback } from './use-feedback';
import { FeedbackPanel } from './feedback-panel';

interface FeedbackSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

export function FeedbackSection({ id, label, children }: FeedbackSectionProps) {
  const { feedback, updateFeedback, hasFeedback } = useFeedback(id, label);

  return (
    <div className="relative group/feedback">
      <FeedbackPanel
        label={label}
        feedback={feedback}
        hasFeedback={hasFeedback}
        onFeedbackChange={updateFeedback}
      />
      {/* Highlight ring when section has feedback */}
      <div className={hasFeedback ? 'ring-2 ring-[#6366F1]/20 ring-offset-2 rounded-sm' : ''}>
        {children}
      </div>
    </div>
  );
}
