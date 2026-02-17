import { eq, desc, isNotNull, isNull, inArray, sql } from 'drizzle-orm';
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

export function updatePromptEmbedding(id: string, embedding: Buffer) {
  return db.update(prompts).set({ embedding }).where(eq(prompts.id, id)).run();
}

export function findAllPromptsWithEmbeddings() {
  return db
    .select({ id: prompts.id, embedding: prompts.embedding })
    .from(prompts)
    .where(isNotNull(prompts.embedding))
    .all();
}

export function findPromptsWithoutEmbeddings() {
  return db
    .select({ id: prompts.id, description: prompts.description, fullPrompt: prompts.fullPrompt })
    .from(prompts)
    .where(isNull(prompts.embedding))
    .all();
}

export function findPromptsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return db.select().from(prompts).where(inArray(prompts.id, ids)).all();
}

export function updatePromptTitle(id: string, title: string) {
  return db.update(prompts).set({ title, updatedAt: new Date().toISOString() }).where(eq(prompts.id, id)).run();
}

export function updatePromptRating(id: string, rating: number | null) {
  return db.update(prompts).set({ rating, updatedAt: new Date().toISOString() }).where(eq(prompts.id, id)).run();
}

export function updatePromptNotes(id: string, notes: string | null) {
  return db.update(prompts).set({ notes, updatedAt: new Date().toISOString() }).where(eq(prompts.id, id)).run();
}

export function findAllDistinctTags() {
  return db
    .selectDistinct({ tag: promptTags.tag })
    .from(promptTags)
    .orderBy(sql`${promptTags.tag} COLLATE NOCASE`)
    .all()
    .map((row) => row.tag);
}
