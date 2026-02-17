'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ArrayFieldEditorProps {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}

export function ArrayFieldEditor({ label, placeholder, values, onChange }: ArrayFieldEditorProps) {
  const [input, setInput] = useState('');

  function add() {
    const value = input.trim();
    if (value && !values.includes(value)) {
      onChange([...values, value]);
      setInput('');
    }
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((value, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {value}
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-1 rounded-full hover:bg-foreground/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
