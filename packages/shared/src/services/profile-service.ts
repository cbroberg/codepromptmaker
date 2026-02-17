import type { CreateProfileInput, DeveloperProfile } from '../types/index';
import { generateId, nowISO } from '../utils';

export function buildNewProfile(input: CreateProfileInput): DeveloperProfile {
  const now = nowISO();
  return {
    id: generateId(),
    name: input.name,
    stack: input.stack ?? [],
    hardRules: input.hardRules ?? [],
    patterns: input.patterns ?? [],
    defaultFailureConditions: input.defaultFailureConditions ?? [],
    promptLanguage: input.promptLanguage ?? 'en',
    createdAt: now,
    updatedAt: now,
  };
}
