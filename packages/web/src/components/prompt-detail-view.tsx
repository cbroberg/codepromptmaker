'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, ArrowLeft, Trash2, Star, RefreshCw, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const HANDSHAKE = 'Read CLAUDE.md and confirm you understand the project constraints before doing anything.';

interface PromptDetailViewProps {
  id: string;
  title: string;
  description: string;
  fullPrompt: string;
  goal: string;
  constraints: string;
  format: string;
  failureConditions: string;
  language: string;
  tags: string[];
  rating: number | null;
  notes: string | null;
  profileId: string | null;
  createdAt: string;
}

export function PromptDetailView({
  id,
  title,
  description,
  fullPrompt: _fullPrompt,
  goal: initialGoal,
  constraints: initialConstraints,
  format: initialFormat,
  failureConditions: initialFailureConditions,
  language,
  tags,
  rating: initialRating,
  notes: initialNotes,
  profileId,
  createdAt,
}: PromptDetailViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<'prompt' | 'cli' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [goal, setGoal] = useState(initialGoal);
  const [constraints, setConstraints] = useState(initialConstraints);
  const [format, setFormat] = useState(initialFormat);
  const [failureConditions, setFailureConditions] = useState(initialFailureConditions);
  const [rating, setRating] = useState<number | null>(initialRating);
  const [notes, setNotes] = useState(initialNotes ?? '');

  async function handleTitleBlur() {
    const value = editedTitle.trim();
    if (!value || value === title) return;
    await fetch(`/api/prompts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: value }),
    });
  }

  async function handleRating(value: number) {
    const newRating = value === rating ? null : value;
    setRating(newRating);
    await fetch(`/api/prompts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating }),
    });
  }

  async function handleNotesBlur() {
    const value = notes.trim() || null;
    await fetch(`/api/prompts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: value }),
    });
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editedDescription,
          profileId: profileId ?? undefined,
          language,
          tags,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      toast.success('New prompt generated');
      router.push(`/prompts/${data.id}`);
    } catch {
      toast.error('Failed to regenerate prompt');
      setRegenerating(false);
    }
  }

  function buildFullPrompt() {
    return [
      HANDSHAKE,
      '',
      '## GOAL',
      goal.trim(),
      '',
      '## CONSTRAINTS',
      constraints.trim(),
      '',
      '## FORMAT',
      format.trim(),
      '',
      '## FAILURE CONDITIONS',
      failureConditions.trim(),
    ].join('\n');
  }

  async function handleDelete() {
    if (!confirm('Delete this prompt? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Prompt deleted');
      router.push('/prompts');
    } catch {
      toast.error('Failed to delete prompt');
      setDeleting(false);
    }
  }

  async function copyToClipboard(text: string, type: 'prompt' | 'cli') {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/prompts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Header card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="space-y-3">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  Original description
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-3">
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="min-h-[300px] resize-y text-sm bg-muted border-border"
                />
                <Button
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerating || !editedDescription.trim()}
                  className="bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  <RefreshCw className={`mr-1 h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                  {regenerating ? 'Generating...' : 'Regenerate'}
                </Button>
              </CollapsibleContent>
            </Collapsible>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{date}</span>
              <span>Language: {language}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="hover:border-indigo-500/50 transition-colors"
                onClick={() => copyToClipboard(buildFullPrompt(), 'prompt')}
              >
                {copied === 'prompt' ? (
                  <Check className="mr-1 h-4 w-4 text-indigo-500" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                Copy Prompt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:border-indigo-500/50 transition-colors"
                onClick={() => copyToClipboard(`cpm run ${id} --dir .`, 'cli')}
              >
                {copied === 'cli' ? (
                  <Check className="mr-1 h-4 w-4 text-indigo-500" />
                ) : (
                  <Terminal className="mr-1 h-4 w-4" />
                )}
                Copy CLI Command
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:border-red-400/50"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 pt-3">
            <span className="text-xs text-muted-foreground mr-1">Rating:</span>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleRating(value)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-5 w-5 ${
                    rating !== null && value <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/40'
                  }`}
                />
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Contract sections card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <Tabs defaultValue="goal">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="goal" className="data-[state=active]:text-indigo-500">Goal</TabsTrigger>
              <TabsTrigger value="constraints" className="data-[state=active]:text-indigo-500">Constraints</TabsTrigger>
              <TabsTrigger value="format" className="data-[state=active]:text-indigo-500">Format</TabsTrigger>
              <TabsTrigger value="failures" className="data-[state=active]:text-indigo-500">Failures</TabsTrigger>
            </TabsList>
            <TabsContent value="goal" className="mt-4">
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono bg-muted border-border"
              />
            </TabsContent>
            <TabsContent value="constraints" className="mt-4">
              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono bg-muted border-border"
              />
            </TabsContent>
            <TabsContent value="format" className="mt-4">
              <Textarea
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono bg-muted border-border"
              />
            </TabsContent>
            <TabsContent value="failures" className="mt-4">
              <Textarea
                value={failureConditions}
                onChange={(e) => setFailureConditions(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono bg-muted border-border"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notes card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-2">
          <label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
            Notes
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="How did this prompt perform? Any observations..."
            className="min-h-[100px] resize-y text-sm bg-muted border-border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
