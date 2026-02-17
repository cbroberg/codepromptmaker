import { eq, desc } from 'drizzle-orm';
import { db } from '../connection';
import { prompts, promptTags } from '../schema';

export function insertPrompt(data: typeof prompts.$inferInsert) {
  return db.insert(prompts).values(data).run();
}

export function insertPromptWithTags(promptData: typeof prompts.$inferInsert, tags: string[]) {
  return db.transaction((tx) => {
    tx.insert(prompts).values(promptData).run();
    if (tags.length > 0) {
      tx.insert(promptTags)
        .values(tags.map((tag) => ({ promptId: promptData.id, tag })))
        .run();
    }
  });
}

export function findPromptById(id: string) {
  return db.select().from(prompts).where(eq(prompts.id, id)).get();
}

export function findAllPrompts() {
  return db.select().from(prompts).orderBy(desc(prompts.createdAt)).all();
}

export function findTagsByPromptId(promptId: string) {
  return db.select().from(promptTags).where(eq(promptTags.promptId, promptId)).all();
}

export function deletePrompt(id: string) {
  return db.transaction((tx) => {
    tx.delete(promptTags).where(eq(promptTags.promptId, id)).run();
    tx.delete(prompts).where(eq(prompts.id, id)).run();
  });
}
