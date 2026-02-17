export type EmbeddingProvider = 'local' | 'anthropic';

export interface EmbeddingResult {
  vector: Float32Array;
  dimensions: number;
  model: string;
  provider: EmbeddingProvider;
}

export interface SimilarPrompt {
  promptId: string;
  similarity: number;
}
