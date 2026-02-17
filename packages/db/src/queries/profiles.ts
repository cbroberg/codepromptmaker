import { eq } from 'drizzle-orm';
import { db } from '../connection.js';
import { developerProfiles } from '../schema.js';

export async function insertProfile(_data: typeof developerProfiles.$inferInsert) {
  // TODO: Insert profile
  throw new Error('Not implemented');
}

export async function findProfileById(id: string) {
  return db.select().from(developerProfiles).where(eq(developerProfiles.id, id)).get();
}

export async function findAllProfiles() {
  return db.select().from(developerProfiles).all();
}
