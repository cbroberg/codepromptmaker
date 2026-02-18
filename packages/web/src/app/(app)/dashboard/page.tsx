import { redirect } from 'next/navigation';
import { isAuthEnabled } from '@/lib/auth-mode';
import { getUserId } from '@/lib/get-user-id';
import { ensurePersonalOrg } from '@/lib/ensure-personal-org';
import { findOrgsByUserId, countProjectsByOrgId } from '@cpm/db';
import { DashboardContent } from '@/components/dashboard-content';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!isAuthEnabled()) {
    redirect('/generate');
  }

  const userId = await getUserId();
  if (!userId) {
    redirect('/auth/signin');
  }

  ensurePersonalOrg(userId);
  const orgs = findOrgsByUserId(userId);
  const orgsWithCounts = orgs.map((org) => ({
    ...org,
    projectCount: countProjectsByOrgId(org.id),
  }));

  return <DashboardContent initialOrgs={orgsWithCounts} />;
}
