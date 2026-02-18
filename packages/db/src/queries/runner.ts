import { eq, and } from 'drizzle-orm';
import { db } from '../connection';
import { runnerSessions } from '../schema';

export function insertRunnerSession(data: typeof runnerSessions.$inferInsert) {
  return db.insert(runnerSessions).values(data).run();
}

export function findRunnerSessionById(id: string, userId: string = 'local') {
  return db.select().from(runnerSessions).where(and(eq(runnerSessions.id, id), eq(runnerSessions.userId, userId))).get();
}

export function updateRunnerSession(id: string, data: Partial<typeof runnerSessions.$inferInsert>, userId: string = 'local') {
  return db.update(runnerSessions).set(data).where(and(eq(runnerSessions.id, id), eq(runnerSessions.userId, userId))).run();
}
