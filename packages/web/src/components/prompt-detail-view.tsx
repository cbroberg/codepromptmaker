'use client';

import { useState } from 'react';
import { Check, Copy, Terminal, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`cpm run ${id} --dir .`, 'cli')}
              >
                {copied === 'cli' ? (
                  <Check className="mr-1 h-4 w-4" />
                ) : (
                  <Terminal className="mr-1 h-4 w-4" />
                )}
                Launch in cc
              </Button>
              <Button
                variant="destructive"
                size="sm"
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
        <CardContent className="space-y-4">
          <EditableSection title="GOAL" value={goal} onChange={setGoal} />
          <Separator />
          <EditableSection title="CONSTRAINTS" value={constraints} onChange={setConstraints} />
          <Separator />
          <EditableSection title="FORMAT" value={format} onChange={setFormat} />
          <Separator />
          <EditableSection title="FAILURE CONDITIONS" value={failureConditions} onChange={setFailureConditions} />
        </CardContent>
      </Card>
    </div>
  );
}

function EditableSection({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] resize-y text-sm font-mono"
        rows={Math.max(3, value.split('\n').length)}
      />
    </div>
  );
}
