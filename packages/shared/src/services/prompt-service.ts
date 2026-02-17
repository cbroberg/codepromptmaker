import type { GeneratePromptInput, PromptContract } from '../types/index.js';

export async function generatePrompt(_input: GeneratePromptInput): Promise<PromptContract> {
  // TODO: Implement Claude API call with system prompt + contract builder
  throw new Error('Not implemented');
}

export async function getPrompt(_id: string): Promise<PromptContract | null> {
  // TODO: Fetch from database
  throw new Error('Not implemented');
}

export async function listPrompts(): Promise<PromptContract[]> {
  // TODO: Fetch all from database
  throw new Error('Not implemented');
}
