import { eq, and } from 'drizzle-orm';
import { db } from '../connection';
import { developerProfiles } from '../schema';

export function insertProfile(data: typeof developerProfiles.$inferInsert) {
  return db.insert(developerProfiles).values(data).run();
}

export function updateProfile(id: string, data: Partial<typeof developerProfiles.$inferInsert>, userId: string = 'local') {
  return db.update(developerProfiles).set(data).where(and(eq(developerProfiles.id, id), eq(developerProfiles.userId, userId))).run();
}

export function findProfileById(id: string, userId: string = 'local') {
  return db.select().from(developerProfiles).where(and(eq(developerProfiles.id, id), eq(developerProfiles.userId, userId))).get();
}

export function findAllProfiles(userId: string = 'local') {
  return db.select().from(developerProfiles).where(eq(developerProfiles.userId, userId)).all();
}

export function getProfileByUserId(userId: string = 'local') {
  return db.select().from(developerProfiles).where(eq(developerProfiles.userId, userId)).get();
}

/** @deprecated Use getProfileByUserId instead. Kept for backward compatibility in CLI. */
export function getFirstProfile() {
  return db.select().from(developerProfiles).get();
}
