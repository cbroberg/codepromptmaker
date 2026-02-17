import type { DeveloperProfile, GeneratePromptInput, PromptContractSections } from '../types/index';
import { getAnthropicClient } from '../anthropic';
import { buildSystemPrompt } from '../prompts/system-prompt';
import type { FewShotExample } from '../prompts/system-prompt';
import { buildContract, parseContract } from '../prompts/contract-builder';

export interface GeneratePromptResult {
  title: string;
  description: string;
  goal: string;
  constraints: string;
  format: string;
  failureConditions: string;
  fullPrompt: string;
  language: string;
  tokensUsed: number;
  model: string;
}

export async function generatePromptContract(
  input: GeneratePromptInput,
  profile?: DeveloperProfile,
  examples?: FewShotExample[],
): Promise<GeneratePromptResult> {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Set it in .env.local');
  }

  const systemPrompt = buildSystemPrompt(profile, examples);
  const language = input.language ?? profile?.promptLanguage ?? 'en';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: input.description,
      },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => ('text' in block ? block.text : ''))
    .join('\n');

  const sections = parseContract(rawText);
  if (!sections) {
    throw new Error('Failed to parse Claude response into Prompt Contract sections. Raw response:\n' + rawText);
  }

  const fullPrompt = buildContract(sections);

  const title = extractTitle(input.description);

  const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  return {
    title,
    description: input.description,
    goal: sections.goal,
    constraints: sections.constraints,
    format: sections.format,
    failureConditions: sections.failureConditions,
    fullPrompt,
    language,
    tokensUsed,
    model: response.model,
  };
}

function extractTitle(description: string): string {
  const firstLine = description.split('\n')[0].trim();
  if (firstLine.length <= 80) return firstLine;
  return firstLine.slice(0, 77) + '...';
}
