import { NextResponse } from 'next/server';
import { findAllPrompts, findTagsByPromptId } from '@cpm/db';
import { getUserId } from '@/lib/get-user-id';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allPrompts = findAllPrompts(userId);

    const promptsWithTags = allPrompts.map((prompt) => {
      const tags = findTagsByPromptId(prompt.id).map((t) => t.tag);
      return { ...prompt, tags };
    });

    return NextResponse.json(promptsWithTags);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
