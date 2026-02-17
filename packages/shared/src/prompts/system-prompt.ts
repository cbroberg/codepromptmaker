import type { DeveloperProfile } from '../types/index.js';

export function buildSystemPrompt(_profile?: DeveloperProfile): string {
  // TODO: Build the full system prompt incorporating:
  // 1. Prompt Contract Framework (GOAL / CONSTRAINTS / FORMAT / FAILURE CONDITIONS)
  // 2. Anthropic best practices (XML tags, role prompting, chain-of-thought)
  // 3. Anti-patterns from research
  // 4. Developer Profile (stack, rules, patterns)
  // 5. Language instruction
  throw new Error('Not implemented');
}
