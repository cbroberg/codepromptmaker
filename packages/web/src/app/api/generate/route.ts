import { NextResponse } from 'next/server';
import { generatePromptContract } from '@cpm/shared';
import { generateId, nowISO } from '@cpm/shared';
import { insertPromptWithTags, findProfileById } from '@cpm/db';
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

    const result = await generatePromptContract(
      { description, profileId, language, tags },
      profile,
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
