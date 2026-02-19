import { eq, and } from 'drizzle-orm';
import { db } from '../connection';
import { organizations, organizationMembers } from '../schema';

// ─── Organizations ─────────────────────────────────────────────────────────

export function insertOrganization(data: typeof organizations.$inferInsert) {
  return db.insert(organizations).values(data).run();
}

export function findOrganizationById(id: string) {
  return db.select().from(organizations).where(eq(organizations.id, id)).get();
}

export function findOrganizationBySlug(slug: string) {
  return db.select().from(organizations).where(eq(organizations.slug, slug)).get();
}

export function updateOrganization(id: string, data: Partial<typeof organizations.$inferInsert>) {
  return db.update(organizations).set(data).where(eq(organizations.id, id)).run();
}

export function deleteOrganization(id: string) {
  return db.delete(organizations).where(eq(organizations.id, id)).run();
}

// ─── Organization Members ──────────────────────────────────────────────────

export function insertOrgMember(data: typeof organizationMembers.$inferInsert) {
  return db.insert(organizationMembers).values(data).run();
}

export function findOrgsByUserId(userId: string) {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
      isPersonal: organizations.isPersonal,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.orgId, organizations.id))
    .where(eq(organizationMembers.userId, userId))
    .all();
}

export function findPersonalOrgByUserId(userId: string) {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
      isPersonal: organizations.isPersonal,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.orgId, organizations.id))
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizations.isPersonal, true),
      ),
    )
    .get();
}

export function findMembersByOrgId(orgId: string) {
  return db
    .select()
    .from(organizationMembers)
    .where(eq(organizationMembers.orgId, orgId))
    .all();
}

export function findMemberByOrgAndUser(orgId: string, userId: string) {
  return db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.orgId, orgId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .get();
}

export function removeOrgMember(orgId: string, userId: string) {
  return db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.orgId, orgId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .run();
}

