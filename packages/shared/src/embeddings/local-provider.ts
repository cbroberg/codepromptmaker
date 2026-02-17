import type { EmbeddingProviderInterface } from './provider';
import type { EmbeddingResult } from '../types/embedding';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const DIMENSIONS = 384;

let pipelineInstance: ((text: string, options?: Record<string, unknown>) => Promise<{ data: Float32Array }>) | null = null;

async function getPipeline() {
  if (pipelineInstance) return pipelineInstance;

  const { pipeline } = await import('@huggingface/transformers');
  pipelineInstance = (await pipeline('feature-extraction', MODEL_NAME, {
    dtype: 'fp32',
  })) as unknown as (text: string, options?: Record<string, unknown>) => Promise<{ data: Float32Array }>;
  return pipelineInstance;
}

export class LocalEmbeddingProvider implements EmbeddingProviderInterface {
  readonly dimensions = DIMENSIONS;
  readonly modelName = MODEL_NAME;

  async embed(text: string): Promise<EmbeddingResult> {
    const pipe = await getPipeline();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    const vector = new Float32Array(output.data);

    return {
      vector,
      dimensions: DIMENSIONS,
      model: MODEL_NAME,
      provider: 'local',
    };
  }
}
