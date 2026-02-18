'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PromptOutput } from '@/components/prompt-output';
import { SimilarPromptsPanel } from '@/components/similar-prompts-panel';
import { toast } from 'sonner';

interface GeneratedPrompt {
  id: string;
  title: string;
  fullPrompt: string;
  goal: string;
  constraints: string;
  format: string;
  failureConditions: string;
  tags: string[];
  tokensUsed: number;
  model: string;
  similarPrompts?: Array<{ promptId: string; similarity: number }>;
}

interface PromptGeneratorProps {
  profileId?: string | null;
}

export function PromptGenerator({ profileId }: PromptGeneratorProps) {
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  async function handleGenerate() {
    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          profileId: profileId ?? undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data);
      toast.success('Prompt Contract generated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Input column */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="description">What do you want to build?</Label>
          <Textarea
            id="description"
            placeholder="Describe the task you want Claude Code to accomplish..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="resize-none bg-muted border-border focus-visible:ring-indigo-500/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="bg-muted border-border focus-visible:ring-indigo-500/30"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-500 cursor-pointer transition-colors hover:bg-indigo-500/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag} &times;
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Prompt Contract
            </>
          )}
        </Button>
      </div>

      {/* Output column */}
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-muted-foreground">Generating your Prompt Contract...</p>
            </div>
          </div>
        )}

        {result && (
          <>
            <PromptOutput
              id={result.id}
              title={result.title}
              fullPrompt={result.fullPrompt}
              goal={result.goal}
              constraints={result.constraints}
              format={result.format}
              failureConditions={result.failureConditions}
              tags={result.tags}
              tokensUsed={result.tokensUsed}
              model={result.model}
            />
            {result.similarPrompts && result.similarPrompts.length > 0 && (
              <SimilarPromptsPanel similarPrompts={result.similarPrompts} />
            )}
          </>
        )}

        {!loading && !result && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-12">
            <div className="flex flex-col items-center gap-2 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Your generated Prompt Contract will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
