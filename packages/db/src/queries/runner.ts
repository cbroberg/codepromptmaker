import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { runnerSessions } from '../schema';

export function insertRunnerSession(data: typeof runnerSessions.$inferInsert) {
  return db.insert(runnerSessions).values(data).run();
}

export function findRunnerSessionById(id: string) {
  return db.select().from(runnerSessions).where(eq(runnerSessions.id, id)).get();
}

export function updateRunnerSession(id: string, data: Partial<typeof runnerSessions.$inferInsert>) {
  return db.update(runnerSessions).set(data).where(eq(runnerSessions.id, id)).run();
}
