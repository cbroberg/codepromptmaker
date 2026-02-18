import { NextResponse } from 'next/server';
import { getProfileByUserId, insertProfile, updateProfile, findProfileById } from '@cpm/db';
import { buildNewProfile } from '@cpm/shared';
import { nowISO } from '@cpm/shared';
import { updateProfileSchema } from '@/lib/validations';
import { getUserId } from '@/lib/get-user-id';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = getProfileByUserId(userId);
    return NextResponse.json(profile ?? null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = getProfileByUserId(userId);

    if (existing) {
      updateProfile(existing.id, {
        name: parsed.data.name,
        stack: parsed.data.stack ?? [],
        hardRules: parsed.data.hardRules ?? [],
        patterns: parsed.data.patterns ?? [],
        defaultFailureConditions: parsed.data.defaultFailureConditions ?? [],
        promptLanguage: parsed.data.promptLanguage ?? 'en',
        updatedAt: nowISO(),
      }, userId);
      const updated = findProfileById(existing.id, userId);
      return NextResponse.json(updated);
    } else {
      const newProfile = buildNewProfile({
        name: parsed.data.name,
        stack: parsed.data.stack,
        hardRules: parsed.data.hardRules,
        patterns: parsed.data.patterns,
        defaultFailureConditions: parsed.data.defaultFailureConditions,
        promptLanguage: parsed.data.promptLanguage,
      });
      insertProfile({
        id: newProfile.id,
        userId,
        name: newProfile.name,
        stack: newProfile.stack,
        hardRules: newProfile.hardRules,
        patterns: newProfile.patterns,
        defaultFailureConditions: newProfile.defaultFailureConditions,
        promptLanguage: newProfile.promptLanguage,
        createdAt: newProfile.createdAt,
        updatedAt: newProfile.updatedAt,
      });
      return NextResponse.json(newProfile, { status: 201 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
