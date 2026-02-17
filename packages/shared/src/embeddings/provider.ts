import type { EmbeddingResult } from '../types/embedding';

export interface EmbeddingProviderInterface {
  embed(text: string): Promise<EmbeddingResult>;
  readonly dimensions: number;
  readonly modelName: string;
}
