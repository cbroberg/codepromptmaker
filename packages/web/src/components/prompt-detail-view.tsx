'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  createdAt,
}: PromptDetailViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState<'prompt' | 'cli' | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [goal, setGoal] = useState(initialGoal);
  const [constraints, setConstraints] = useState(initialConstraints);
  const [format, setFormat] = useState(initialFormat);
  const [failureConditions, setFailureConditions] = useState(initialFailureConditions);

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

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                <span>{date}</span>
                <span>Language: {language}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(buildFullPrompt(), 'prompt')}
              >
                {copied === 'prompt' ? (
                  <Check className="mr-1 h-4 w-4" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                Copy Prompt
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(`cpm run ${id} --dir .`, 'cli')}
              >
                {copied === 'cli' ? (
                  <Check className="mr-1 h-4 w-4" />
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
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="goal">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="goal">Goal</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="format">Format</TabsTrigger>
              <TabsTrigger value="failures">Failures</TabsTrigger>
            </TabsList>
            <TabsContent value="goal" className="mt-4">
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono"
              />
            </TabsContent>
            <TabsContent value="constraints" className="mt-4">
              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono"
              />
            </TabsContent>
            <TabsContent value="format" className="mt-4">
              <Textarea
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono"
              />
            </TabsContent>
            <TabsContent value="failures" className="mt-4">
              <Textarea
                value={failureConditions}
                onChange={(e) => setFailureConditions(e.target.value)}
                className="min-h-[400px] resize-y text-sm font-mono"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
