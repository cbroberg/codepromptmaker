import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findPromptById, findTagsByPromptId, deletePrompt, updatePromptTitle, updatePromptRating, updatePromptNotes } from '@cpm/db';
import { getUserId } from '@/lib/get-user-id';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const prompt = findPromptById(id, userId);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);

    return NextResponse.json({ ...prompt, tags });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const prompt = findPromptById(id, userId);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    deletePrompt(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const prompt = findPromptById(id, userId);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.title !== undefined) {
      updatePromptTitle(id, parsed.data.title, userId);
    }
    if (parsed.data.rating !== undefined) {
      updatePromptRating(id, parsed.data.rating, userId);
    }
    if (parsed.data.notes !== undefined) {
      updatePromptNotes(id, parsed.data.notes, userId);
    }

    const updated = findPromptById(id, userId);
    const tags = findTagsByPromptId(id).map((t) => t.tag);

    return NextResponse.json({ ...updated, tags });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
