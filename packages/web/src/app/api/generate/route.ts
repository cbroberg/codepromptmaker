import { NextResponse } from 'next/server';
import { generatePromptContract } from '@cpm/shared';
import { generateId, nowISO } from '@cpm/shared';
import {
  getEmbeddingProvider,
  buildEmbeddingText,
  rankBySimilarity,
  vectorToBuffer,
  bufferToVector,
} from '@cpm/shared';
import type { FewShotExample } from '@cpm/shared';
import {
  insertPromptWithTags,
  findProfileById,
  findAllPromptsWithEmbeddings,
  findPromptsByIds,
  updatePromptEmbedding,
} from '@cpm/db';
import { generatePromptSchema } from '@/lib/validations';
import type { DeveloperProfile } from '@cpm/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generatePromptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { description, profileId, language, tags } = parsed.data;

    let profile: DeveloperProfile | undefined;
    if (profileId) {
      const row = findProfileById(profileId);
      if (row) {
        profile = row as DeveloperProfile;
      }
    }

    // RAG: embed the description and find similar prompts
    let similarPrompts: Array<{ promptId: string; similarity: number }> = [];
    let examples: FewShotExample[] = [];

    try {
      const provider = getEmbeddingProvider();
      const queryEmbedding = await provider.embed(description);

      const allEmbeddings = findAllPromptsWithEmbeddings();
      const candidates = allEmbeddings
        .filter((row) => row.embedding != null)
        .map((row) => ({
          promptId: row.id,
          vector: bufferToVector(row.embedding as Buffer),
        }));

      if (candidates.length > 0) {
        similarPrompts = rankBySimilarity(queryEmbedding.vector, candidates, 3, 0.4);

        if (similarPrompts.length > 0) {
          const similarIds = similarPrompts.map((sp) => sp.promptId);
          const fullPrompts = findPromptsByIds(similarIds);
          examples = similarPrompts
            .map((sp) => {
              const prompt = fullPrompts.find((p) => p.id === sp.promptId);
              if (!prompt) return null;
              return {
                description: prompt.description,
                fullPrompt: prompt.fullPrompt,
              };
            })
            .filter((ex): ex is FewShotExample => ex !== null);
        }
      }
    } catch (embeddingError) {
      console.error('Embedding search failed, proceeding without RAG:', embeddingError);
    }

    const result = await generatePromptContract(
      { description, profileId, language, tags },
      profile,
      examples.length > 0 ? examples : undefined,
    );

    const id = generateId();
    const now = nowISO();

    insertPromptWithTags(
      {
        id,
        title: result.title,
        description: result.description,
        goal: result.goal,
        constraints: result.constraints,
        format: result.format,
        failureConditions: result.failureConditions,
        fullPrompt: result.fullPrompt,
        language: result.language,
        profileId: profileId ?? null,
        createdAt: now,
        updatedAt: now,
      },
      tags ?? [],
    );

    // Re-embed with richer text (description + generated prompt) and store
    try {
      const provider = getEmbeddingProvider();
      const richText = buildEmbeddingText(result.description, result.fullPrompt);
      const embedding = await provider.embed(richText);
      updatePromptEmbedding(id, vectorToBuffer(embedding.vector));
    } catch (embeddingError) {
      console.error('Failed to store embedding for prompt:', embeddingError);
    }

    return NextResponse.json({
      id,
      title: result.title,
      description: result.description,
      goal: result.goal,
      constraints: result.constraints,
      format: result.format,
      failureConditions: result.failureConditions,
      fullPrompt: result.fullPrompt,
      language: result.language,
      tags: tags ?? [],
      tokensUsed: result.tokensUsed,
      model: result.model,
      createdAt: now,
      similarPrompts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
