'use client';

import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface BackfillBannerProps {
  count: number;
}

export function BackfillBanner({ count }: BackfillBannerProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (count === 0 || done) return null;

  async function handleBackfill() {
    setLoading(true);
    try {
      const res = await fetch('/api/prompts/backfill', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Backfill failed');
      }
      const data = await res.json();
      toast.success(`Generated embeddings for ${data.processed} prompt${data.processed !== 1 ? 's' : ''}`);
      setDone(true);
      // Reload the page to refresh search capabilities
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Backfill failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">
              {count} prompt{count !== 1 ? 's' : ''} without embeddings
            </p>
            <p className="text-xs text-muted-foreground">
              Generate embeddings to enable semantic search and RAG
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackfill}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Embeddings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
