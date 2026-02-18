import { NextResponse } from 'next/server';
import {
  getEmbeddingProvider,
  rankBySimilarity,
  bufferToVector,
} from '@cpm/shared';
import {
  findAllPromptsWithEmbeddings,
  findPromptsByIds,
  findTagsByPromptId,
} from '@cpm/db';
import { getUserId } from '@/lib/get-user-id';

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';

    if (query.length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters' },
        { status: 400 },
      );
    }

    const provider = getEmbeddingProvider();
    const queryEmbedding = await provider.embed(query);

    const allEmbeddings = findAllPromptsWithEmbeddings(userId);
    const candidates = allEmbeddings
      .filter((row) => row.embedding != null)
      .map((row) => ({
        promptId: row.id,
        vector: bufferToVector(row.embedding as Buffer),
      }));

    if (candidates.length === 0) {
      return NextResponse.json([]);
    }

    const ranked = rankBySimilarity(queryEmbedding.vector, candidates, 10, 0.3);

    if (ranked.length === 0) {
      return NextResponse.json([]);
    }

    const ids = ranked.map((r) => r.promptId);
    const promptRows = findPromptsByIds(ids, userId);

    const results = ranked.map((r) => {
      const prompt = promptRows.find((p) => p.id === r.promptId);
      if (!prompt) return null;
      const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);
      return {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        tags,
        createdAt: prompt.createdAt,
        similarity: Math.round(r.similarity * 100) / 100,
      };
    }).filter(Boolean);

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
