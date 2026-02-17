'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PromptCard } from '@/components/prompt-card';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  similarity: number;
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // Silently fail — user can retry
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  function handleClear() {
    setQuery('');
    setResults(null);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search prompts by meaning..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleClear}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {results !== null && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No similar prompts found.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''} by semantic similarity
              </p>
              {results.map((result) => (
                <div key={result.id} className="relative">
                  <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 z-10"
                  >
                    {Math.round(result.similarity * 100)}%
                  </Badge>
                  <PromptCard
                    id={result.id}
                    title={result.title}
                    description={result.description}
                    tags={result.tags}
                    createdAt={result.createdAt}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
