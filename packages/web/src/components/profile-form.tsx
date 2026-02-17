'use client';

import { useState } from 'react';
import { useRef } from 'react';
import { Loader2, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrayFieldEditor } from '@/components/array-field-editor';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  stack: string[];
  hardRules: string[];
  patterns: string[];
  defaultFailureConditions: string[];
  promptLanguage: string;
}

interface ProfileFormProps {
  initialProfile: Profile | null;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [name, setName] = useState(initialProfile?.name ?? '');
  const [stack, setStack] = useState<string[]>(initialProfile?.stack ?? []);
  const [hardRules, setHardRules] = useState<string[]>(initialProfile?.hardRules ?? []);
  const [patterns, setPatterns] = useState<string[]>(initialProfile?.patterns ?? []);
  const [defaultFailureConditions, setDefaultFailureConditions] = useState<string[]>(
    initialProfile?.defaultFailureConditions ?? [],
  );
  const [promptLanguage, setPromptLanguage] = useState(initialProfile?.promptLanguage ?? 'en');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    if (!confirm('Importing a profile will overwrite all current fields. Continue?')) return;
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseProfileMarkdown(text);
        setName(parsed.name);
        setStack(parsed.stack);
        setHardRules(parsed.hardRules);
        setPatterns(parsed.patterns);
        setDefaultFailureConditions(parsed.defaultFailureConditions);
        setPromptLanguage(parsed.promptLanguage);
        toast.success('Profile imported — click Save to persist');
      } catch {
        toast.error('Failed to parse markdown file');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = '';
  }

  function handleExportMarkdown() {
    const lines = [
      `# Developer Profile — ${name || 'Untitled'}`,
      '',
      `**Prompt Language:** ${promptLanguage === 'da' ? 'Danish (Dansk)' : 'English'}`,
      '',
      '## Tech Stack',
      ...(stack.length > 0 ? stack.map((s) => `- ${s}`) : ['_None configured_']),
      '',
      '## Hard Rules',
      ...(hardRules.length > 0 ? hardRules.map((r) => `- ${r}`) : ['_None configured_']),
      '',
      '## Patterns',
      ...(patterns.length > 0 ? patterns.map((p) => `- ${p}`) : ['_None configured_']),
      '',
      '## Default Failure Conditions',
      ...(defaultFailureConditions.length > 0 ? defaultFailureConditions.map((f) => `- ${f}`) : ['_None configured_']),
      '',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cpm-profile-${(name || 'untitled').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile exported');
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          stack,
          hardRules,
          patterns,
          defaultFailureConditions,
          promptLanguage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }

      toast.success('Profile saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Save failed';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name or project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Prompt Language</Label>
          <Select value={promptLanguage} onValueChange={setPromptLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="da">Danish (Dansk)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ArrayFieldEditor
          label="Tech Stack"
          placeholder="e.g. Next.js, TypeScript, Tailwind"
          values={stack}
          onChange={setStack}
        />

        <ArrayFieldEditor
          label="Hard Rules"
          placeholder="e.g. Always use ES modules"
          values={hardRules}
          onChange={setHardRules}
        />

        <ArrayFieldEditor
          label="Patterns"
          placeholder="e.g. Server components by default"
          values={patterns}
          onChange={setPatterns}
        />

        <ArrayFieldEditor
          label="Default Failure Conditions"
          placeholder="e.g. Never use CommonJS require()"
          values={defaultFailureConditions}
          onChange={setDefaultFailureConditions}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          className="hidden"
          onChange={handleImportFile}
        />
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
          <Button variant="outline" onClick={handleExportMarkdown}>
            <Download className="mr-2 h-4 w-4" />
            Export .md
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import .md
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function parseProfileMarkdown(text: string) {
  const lines = text.split('\n');

  // Extract name from heading: "# Developer Profile — Name"
  const headingLine = lines.find((l) => l.startsWith('# '));
  const name = headingLine
    ? headingLine.replace(/^#\s+Developer Profile\s*[-—]\s*/, '').replace(/^#\s+/, '').trim()
    : 'Imported Profile';

  // Extract language from "**Prompt Language:** English" or "Danish"
  const langLine = lines.find((l) => l.includes('Prompt Language'));
  let promptLanguage = 'en';
  if (langLine && /danish|dansk/i.test(langLine)) {
    promptLanguage = 'da';
  }

  // Parse sections by heading
  function parseSection(heading: string): string[] {
    const idx = lines.findIndex((l) => l.trim().toLowerCase().startsWith(`## ${heading.toLowerCase()}`));
    if (idx === -1) return [];
    const items: string[] = [];
    for (let i = idx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('## ')) break;
      if (line.startsWith('- ') && !line.includes('_None configured_')) {
        items.push(line.slice(2).trim());
      }
    }
    return items;
  }

  return {
    name,
    stack: parseSection('Tech Stack'),
    hardRules: parseSection('Hard Rules'),
    patterns: parseSection('Patterns'),
    defaultFailureConditions: parseSection('Default Failure Conditions'),
    promptLanguage,
  };
}
