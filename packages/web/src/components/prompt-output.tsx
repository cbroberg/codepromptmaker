'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const HANDSHAKE = 'Read CLAUDE.md and confirm you understand the project constraints before doing anything.';

interface PromptOutputProps {
  id: string;
  title: string;
  fullPrompt: string;
  goal: string;
  constraints: string;
  format: string;
  failureConditions: string;
  tags: string[];
  tokensUsed?: number;
  model?: string;
}

export function PromptOutput({
  id,
  title,
  fullPrompt: _fullPrompt,
  goal: initialGoal,
  constraints: initialConstraints,
  format: initialFormat,
  failureConditions: initialFailureConditions,
  tags,
  tokensUsed,
  model,
}: PromptOutputProps) {
  const [copied, setCopied] = useState<'prompt' | 'cli' | null>(null);
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

  async function copyToClipboard(text: string, type: 'prompt' | 'cli') {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
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
      {(tokensUsed || model) && (
        <CardFooter className="text-xs text-muted-foreground">
          {model && <span>Model: {model}</span>}
          {model && tokensUsed ? <span className="mx-2">|</span> : null}
          {tokensUsed ? <span>Tokens: {tokensUsed}</span> : null}
        </CardFooter>
      )}
    </Card>
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
