import type { PromptLanguage } from './languages';

export interface PromptContract {
  id: string;
  title: string;
  description: string;
  goal: string;
  constraints: string;
  format: string;
  failureConditions: string;
  fullPrompt: string;
  language: PromptLanguage;
  tags: string[];
  rating: number | null;
  notes: string | null;
  profileId: string | null;
  embedding: Buffer | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratePromptInput {
  description: string;
  profileId?: string;
  language?: PromptLanguage;
  tags?: string[];
}

export interface PromptContractSections {
  goal: string;
  constraints: string;
  format: string;
  failureConditions: string;
}
