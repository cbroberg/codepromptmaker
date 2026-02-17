import type { PromptContractSections } from '../types/index';
import { CLAUDE_MD_HANDSHAKE } from './templates';

export function buildContract(sections: PromptContractSections): string {
  const parts = [
    CLAUDE_MD_HANDSHAKE,
    '',
    '## GOAL',
    sections.goal.trim(),
    '',
    '## CONSTRAINTS',
    sections.constraints.trim(),
    '',
    '## FORMAT',
    sections.format.trim(),
    '',
    '## FAILURE CONDITIONS',
    sections.failureConditions.trim(),
  ];

  return parts.join('\n');
}

export function parseContract(raw: string): PromptContractSections | null {
  const sectionPattern = /## ?(GOAL|CONSTRAINTS|FORMAT|FAILURE CONDITIONS)\s*\n([\s\S]*?)(?=\n## |$)/gi;
  const sections: Partial<Record<string, string>> = {};

  let match: RegExpExecArray | null;
  while ((match = sectionPattern.exec(raw)) !== null) {
    const key = match[1].toUpperCase().trim();
    sections[key] = match[2].trim();
  }

  if (!sections['GOAL'] || !sections['CONSTRAINTS'] || !sections['FORMAT'] || !sections['FAILURE CONDITIONS']) {
    return null;
  }

  return {
    goal: sections['GOAL'],
    constraints: sections['CONSTRAINTS'],
    format: sections['FORMAT'],
    failureConditions: sections['FAILURE CONDITIONS'],
  };
}
