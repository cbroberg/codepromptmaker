'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'cpm-mockup-figma';

export interface SectionFeedback {
  sectionId: string;
  sectionLabel: string;
  feedback: string;
  updatedAt: string;
}

function getStorageKey(sectionId: string) {
  return `${STORAGE_PREFIX}:feedback:${sectionId}`;
}

export function useFeedback(sectionId: string, sectionLabel: string) {
  const [feedback, setFeedback] = useState('');
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(sectionId));
    if (stored) {
      try {
        const parsed: SectionFeedback = JSON.parse(stored);
        setFeedback(parsed.feedback);
      } catch {
        // ignore corrupt data
      }
    }
    setLoaded(true);
  }, [sectionId]);

  const updateFeedback = useCallback(
    (value: string) => {
      setFeedback(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const data: SectionFeedback = {
          sectionId,
          sectionLabel,
          feedback: value,
          updatedAt: new Date().toISOString(),
        };
        if (value.trim()) {
          localStorage.setItem(getStorageKey(sectionId), JSON.stringify(data));
        } else {
          localStorage.removeItem(getStorageKey(sectionId));
        }
      }, 300);
    },
    [sectionId, sectionLabel]
  );

  const hasFeedback = loaded && feedback.trim().length > 0;

  return { feedback, updateFeedback, hasFeedback, loaded };
}

export function exportAllFeedback(mockupName: string): string {
  const sections: SectionFeedback[] = [];
  const prefix = `${STORAGE_PREFIX}:feedback:`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        const data: SectionFeedback = JSON.parse(localStorage.getItem(key)!);
        if (data.feedback.trim()) {
          sections.push(data);
        }
      } catch {
        // skip
      }
    }
  }

  return JSON.stringify(
    {
      version: '1.0',
      mockup: mockupName,
      exportedAt: new Date().toISOString(),
      sections,
    },
    null,
    2
  );
}
