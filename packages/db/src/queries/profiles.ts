import { eq } from 'drizzle-orm';
import { db } from '../connection';
import { developerProfiles } from '../schema';

export function insertProfile(data: typeof developerProfiles.$inferInsert) {
  return db.insert(developerProfiles).values(data).run();
}

export function updateProfile(id: string, data: Partial<typeof developerProfiles.$inferInsert>) {
  return db.update(developerProfiles).set(data).where(eq(developerProfiles.id, id)).run();
}

export function findProfileById(id: string) {
  return db.select().from(developerProfiles).where(eq(developerProfiles.id, id)).get();
}

export function findAllProfiles() {
  return db.select().from(developerProfiles).all();
}

export function getFirstProfile() {
  return db.select().from(developerProfiles).get();
}
