'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SimilarPromptData {
  promptId: string;
  similarity: number;
  title?: string;
  description?: string;
}

interface SimilarPromptsPanelProps {
  similarPrompts: Array<{ promptId: string; similarity: number }>;
}

export function SimilarPromptsPanel({ similarPrompts }: SimilarPromptsPanelProps) {
  const [enriched, setEnriched] = useState<SimilarPromptData[]>(
    similarPrompts.map((sp) => ({ ...sp })),
  );

  useEffect(() => {
    async function fetchDetails() {
      const results = await Promise.all(
        similarPrompts.map(async (sp) => {
          try {
            const res = await fetch(`/api/prompts/${sp.promptId}`);
            if (!res.ok) return { ...sp };
            const data = await res.json();
            return { ...sp, title: data.title, description: data.description };
          } catch {
            return { ...sp };
          }
        }),
      );
      setEnriched(results);
    }

    if (similarPrompts.length > 0) {
      fetchDetails();
    }
  }, [similarPrompts]);

  if (similarPrompts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Similar Past Prompts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {enriched.map((sp) => (
          <Link
            key={sp.promptId}
            href={`/prompts/${sp.promptId}`}
            className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {sp.title ?? sp.promptId}
              </p>
              {sp.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {sp.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="ml-3 shrink-0">
              {Math.round(sp.similarity * 100)}%
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
