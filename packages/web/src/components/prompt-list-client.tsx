'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';

interface PromptItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  rating: number | null;
  createdAt: string;
}

interface PromptListClientProps {
  prompts: PromptItem[];
  allTags: string[];
}

export function PromptListClient({ prompts, allTags }: PromptListClientProps) {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return prompts.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query)) {
        return false;
      }
      if (selectedTags.size > 0) {
        for (const tag of selectedTags) {
          if (!p.tags.includes(tag)) return false;
        }
      }
      return true;
    });
  }, [prompts, search, selectedTags]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearch('');
    setSelectedTags(new Set());
  }

  const hasFilters = search.length > 0 || selectedTags.size > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="pl-9"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.has(tag) ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} of {prompts.length} prompts
        </span>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {hasFilters ? 'No prompts match your filters.' : 'No prompts yet. Generate your first Prompt Contract from the home page.'}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.description}
              tags={prompt.tags}
              rating={prompt.rating}
              createdAt={prompt.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
