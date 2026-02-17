'use client';

import { Download } from 'lucide-react';
import { exportAllFeedback } from './use-feedback';

interface FeedbackExportProps {
  mockupName: string;
}

export function FeedbackExport({ mockupName }: FeedbackExportProps) {
  const handleExport = () => {
    const json = exportAllFeedback(mockupName);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mockupName}-feedback-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#6366F1] text-white px-4 py-2.5 text-sm font-medium shadow-lg hover:bg-[#4F46E5] transition-colors"
    >
      <Download className="w-4 h-4" />
      Export Feedback
    </button>
  );
}
