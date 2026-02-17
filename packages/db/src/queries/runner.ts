import { eq } from 'drizzle-orm';
import { db } from '../connection.js';
import { runnerSessions } from '../schema.js';

export async function insertRunnerSession(_data: typeof runnerSessions.$inferInsert) {
  // TODO: Insert runner session
  throw new Error('Not implemented');
}

export async function findRunnerSessionById(id: string) {
  return db.select().from(runnerSessions).where(eq(runnerSessions.id, id)).get();
}

export async function updateRunnerSession(_id: string, _data: Partial<typeof runnerSessions.$inferInsert>) {
  // TODO: Update runner session
  throw new Error('Not implemented');
}
