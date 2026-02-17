import { eq } from 'drizzle-orm';
import { db } from '../connection.js';
import { prompts, promptTags } from '../schema.js';

export async function insertPrompt(_data: typeof prompts.$inferInsert) {
  // TODO: Insert prompt + tags
  throw new Error('Not implemented');
}

export async function findPromptById(id: string) {
  return db.select().from(prompts).where(eq(prompts.id, id)).get();
}

export async function findAllPrompts() {
  return db.select().from(prompts).all();
}

export async function findTagsByPromptId(promptId: string) {
  return db.select().from(promptTags).where(eq(promptTags.promptId, promptId)).all();
}
