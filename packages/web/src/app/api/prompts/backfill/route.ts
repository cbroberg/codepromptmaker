import { NextResponse } from 'next/server';
import {
  getEmbeddingProvider,
  buildEmbeddingText,
  vectorToBuffer,
} from '@cpm/shared';
import {
  findPromptsWithoutEmbeddings,
  updatePromptEmbedding,
} from '@cpm/db';
import { getUserId } from '@/lib/get-user-id';

export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const promptsToEmbed = findPromptsWithoutEmbeddings(userId);

    if (promptsToEmbed.length === 0) {
      return NextResponse.json({ total: 0, processed: 0 });
    }

    const provider = getEmbeddingProvider();
    let processed = 0;
    const errors: Array<{ id: string; error: string }> = [];

    for (const prompt of promptsToEmbed) {
      try {
        const text = buildEmbeddingText(prompt.description, prompt.fullPrompt);
        const result = await provider.embed(text);
        updatePromptEmbedding(prompt.id, vectorToBuffer(result.vector), userId);
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ id: prompt.id, error: message });
      }
    }

    return NextResponse.json({
      total: promptsToEmbed.length,
      processed,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
