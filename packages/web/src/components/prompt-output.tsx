'use client';

import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2 shrink-0">
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
              Copy
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
              CLI
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
      </CardHeader>
      <CardContent>
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
              className="min-h-[300px] resize-y text-sm font-mono bg-muted border-border"
            />
          </TabsContent>
          <TabsContent value="constraints" className="mt-4">
            <Textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="min-h-[300px] resize-y text-sm font-mono bg-muted border-border"
            />
          </TabsContent>
          <TabsContent value="format" className="mt-4">
            <Textarea
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="min-h-[300px] resize-y text-sm font-mono bg-muted border-border"
            />
          </TabsContent>
          <TabsContent value="failures" className="mt-4">
            <Textarea
              value={failureConditions}
              onChange={(e) => setFailureConditions(e.target.value)}
              className="min-h-[300px] resize-y text-sm font-mono bg-muted border-border"
            />
          </TabsContent>
        </Tabs>
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
