import type { PromptLanguage } from './languages';

export interface DeveloperProfile {
  id: string;
  name: string;
  stack: string[];
  hardRules: string[];
  patterns: string[];
  defaultFailureConditions: string[];
  promptLanguage: PromptLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  name: string;
  stack?: string[];
  hardRules?: string[];
  patterns?: string[];
  defaultFailureConditions?: string[];
  promptLanguage?: PromptLanguage;
}

export interface UpdateProfileInput extends Partial<CreateProfileInput> {}
