import type { EmbeddingProviderInterface } from './provider';
import type { EmbeddingResult } from '../types/embedding';

const MODEL_NAME = 'voyage-3';
const DIMENSIONS = 1024;
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';

export class AnthropicEmbeddingProvider implements EmbeddingProviderInterface {
  readonly dimensions = DIMENSIONS;
  readonly modelName = MODEL_NAME;

  async embed(text: string): Promise<EmbeddingResult> {
    const apiKey = process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      throw new Error('VOYAGE_API_KEY is not configured. Set it in .env.local');
    }

    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        input: [text],
        input_type: 'document',
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Voyage API error (${response.status}): ${body}`);
    }

    const json = await response.json() as { data: Array<{ embedding: number[] }> };
    const vector = new Float32Array(json.data[0].embedding);

    return {
      vector,
      dimensions: DIMENSIONS,
      model: MODEL_NAME,
      provider: 'anthropic',
    };
  }
}
