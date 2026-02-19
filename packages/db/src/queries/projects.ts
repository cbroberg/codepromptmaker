import { eq, and, sql } from 'drizzle-orm';
import { db } from '../connection';
import { projects, prompts } from '../schema';

// ─── Projects CRUD ────────────────────────────────────────────────────────

export function insertProject(data: typeof projects.$inferInsert) {
  return db.insert(projects).values(data).run();
}

export function findProjectById(id: string) {
  return db.select().from(projects).where(eq(projects.id, id)).get();
}

export function findProjectBySlug(orgId: string, slug: string) {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.orgId, orgId), eq(projects.slug, slug)))
    .get();
}

export function updateProject(id: string, data: Partial<typeof projects.$inferInsert>) {
  return db.update(projects).set(data).where(eq(projects.id, id)).run();
}

export function deleteProject(id: string) {
  return db.delete(projects).where(eq(projects.id, id)).run();
}

// ─── Projects Listing ─────────────────────────────────────────────────────

export function findProjectsByOrgId(orgId: string) {
  return db.select().from(projects).where(eq(projects.orgId, orgId)).all();
}

export function countProjectsByOrgId(orgId: string) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(eq(projects.orgId, orgId))
    .get();
  return result?.count ?? 0;
}

export function countPromptsByProjectId(projectId: string) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(prompts)
    .where(eq(prompts.projectId, projectId))
    .get();
  return result?.count ?? 0;
}
