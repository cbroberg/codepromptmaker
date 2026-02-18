import {
  findPersonalOrgByUserId,
  insertOrganization,
  insertOrgMember,
} from '@cpm/db';
import { generateId, nowISO } from '@cpm/shared';
import { isAuthEnabled, LOCAL_USER_ID } from '@/lib/auth-mode';

/**
 * Idempotent: ensures a personal organization exists for the given user.
 * In local mode, creates a 'local' org with id 'local'.
 * Returns the personal org.
 */
export function ensurePersonalOrg(userId?: string) {
  const effectiveUserId = userId ?? (isAuthEnabled() ? undefined : LOCAL_USER_ID);
  if (!effectiveUserId) return null;

  const existing = findPersonalOrgByUserId(effectiveUserId);
  if (existing) return existing;

  const now = nowISO();
  const orgId = effectiveUserId === LOCAL_USER_ID ? 'local' : generateId();
  const slug = effectiveUserId === LOCAL_USER_ID ? 'local' : `personal-${effectiveUserId.slice(0, 8)}`;

  insertOrganization({
    id: orgId,
    name: 'Personal',
    slug,
    plan: 'free',
    isPersonal: true,
    createdAt: now,
    updatedAt: now,
  });

  insertOrgMember({
    id: generateId(),
    orgId,
    userId: effectiveUserId,
    role: 'owner',
    createdAt: now,
  });

  return findPersonalOrgByUserId(effectiveUserId);
}
