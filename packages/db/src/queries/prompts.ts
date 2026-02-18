import { eq, and, desc, isNotNull, isNull, inArray, sql } from 'drizzle-orm';
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

export function findPromptById(id: string, userId: string = 'local') {
  return db.select().from(prompts).where(and(eq(prompts.id, id), eq(prompts.userId, userId))).get();
}

export function findAllPrompts(userId: string = 'local') {
  return db.select().from(prompts).where(eq(prompts.userId, userId)).orderBy(desc(prompts.createdAt)).all();
}

export function findTagsByPromptId(promptId: string) {
  return db.select().from(promptTags).where(eq(promptTags.promptId, promptId)).all();
}

export function deletePrompt(id: string, userId: string = 'local') {
  return db.transaction((tx) => {
    tx.delete(promptTags).where(eq(promptTags.promptId, id)).run();
    tx.delete(prompts).where(and(eq(prompts.id, id), eq(prompts.userId, userId))).run();
  });
}

export function updatePromptEmbedding(id: string, embedding: Buffer, userId: string = 'local') {
  return db.update(prompts).set({ embedding }).where(and(eq(prompts.id, id), eq(prompts.userId, userId))).run();
}

export function findAllPromptsWithEmbeddings(userId: string = 'local') {
  return db
    .select({ id: prompts.id, embedding: prompts.embedding })
    .from(prompts)
    .where(and(isNotNull(prompts.embedding), eq(prompts.userId, userId)))
    .all();
}

export function findPromptsWithoutEmbeddings(userId: string = 'local') {
  return db
    .select({ id: prompts.id, description: prompts.description, fullPrompt: prompts.fullPrompt })
    .from(prompts)
    .where(and(isNull(prompts.embedding), eq(prompts.userId, userId)))
    .all();
}

export function findPromptsByIds(ids: string[], userId: string = 'local') {
  if (ids.length === 0) return [];
  return db.select().from(prompts).where(and(inArray(prompts.id, ids), eq(prompts.userId, userId))).all();
}

export function updatePromptTitle(id: string, title: string, userId: string = 'local') {
  return db.update(prompts).set({ title, updatedAt: new Date().toISOString() }).where(and(eq(prompts.id, id), eq(prompts.userId, userId))).run();
}

export function updatePromptRating(id: string, rating: number | null, userId: string = 'local') {
  return db.update(prompts).set({ rating, updatedAt: new Date().toISOString() }).where(and(eq(prompts.id, id), eq(prompts.userId, userId))).run();
}

export function updatePromptNotes(id: string, notes: string | null, userId: string = 'local') {
  return db.update(prompts).set({ notes, updatedAt: new Date().toISOString() }).where(and(eq(prompts.id, id), eq(prompts.userId, userId))).run();
}

export function findAllDistinctTags(userId: string = 'local') {
  return db
    .selectDistinct({ tag: promptTags.tag })
    .from(promptTags)
    .innerJoin(prompts, eq(promptTags.promptId, prompts.id))
    .where(eq(prompts.userId, userId))
    .orderBy(sql`${promptTags.tag} COLLATE NOCASE`)
    .all()
    .map((row) => row.tag);
}
