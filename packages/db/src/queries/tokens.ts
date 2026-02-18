import { eq, and } from 'drizzle-orm';
import { db } from '../connection';
import { apiTokens } from '../schema';

export function insertApiToken(data: typeof apiTokens.$inferInsert) {
  return db.insert(apiTokens).values(data).run();
}

export function findApiTokensByUserId(userId: string) {
  return db.select().from(apiTokens).where(eq(apiTokens.userId, userId)).all();
}

export function findApiTokenByHash(hash: string) {
  return db.select().from(apiTokens).where(eq(apiTokens.tokenHash, hash)).get();
}

export function deleteApiToken(id: string, userId: string) {
  return db.delete(apiTokens).where(and(eq(apiTokens.id, id), eq(apiTokens.userId, userId))).run();
}

export function updateTokenLastUsed(id: string) {
  return db.update(apiTokens).set({ lastUsedAt: new Date().toISOString() }).where(eq(apiTokens.id, id)).run();
}
