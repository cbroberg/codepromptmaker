import type { EmbeddingProviderInterface } from './provider';
import type { EmbeddingProvider } from '../types/embedding';
import { LocalEmbeddingProvider } from './local-provider';
import { AnthropicEmbeddingProvider } from './anthropic-provider';

export type { EmbeddingProviderInterface } from './provider';
export { LocalEmbeddingProvider } from './local-provider';
export { AnthropicEmbeddingProvider } from './anthropic-provider';
export { cosineSimilarity, rankBySimilarity } from './similarity';
export { vectorToBuffer, bufferToVector } from './serialize';

let cachedProvider: EmbeddingProviderInterface | null = null;
let cachedProviderType: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProviderInterface {
  const providerType = (process.env.CPM_EMBEDDING_PROVIDER ?? 'local') as EmbeddingProvider;

  if (cachedProvider && cachedProviderType === providerType) {
    return cachedProvider;
  }

  if (providerType === 'anthropic') {
    cachedProvider = new AnthropicEmbeddingProvider();
  } else {
    cachedProvider = new LocalEmbeddingProvider();
  }

  cachedProviderType = providerType;
  return cachedProvider;
}

export function buildEmbeddingText(description: string, fullPrompt: string): string {
  return `${description}\n\n${fullPrompt}`;
}
