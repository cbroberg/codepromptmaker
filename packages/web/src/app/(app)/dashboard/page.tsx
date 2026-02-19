import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAuthEnabled } from '@/lib/auth-mode';
import { getUserId } from '@/lib/get-user-id';
import { ensurePersonalOrg } from '@/lib/ensure-personal-org';
import {
  findOrgsByUserId,
  countProjectsByOrgId,
  findOrganizationById,
  findMemberByOrgAndUser,
  findProjectsByOrgId,
  countPromptsByProjectId,
} from '@cpm/db';
import { DashboardContent } from '@/components/dashboard-content';
import { ProjectsContent } from '@/components/projects-content';

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

  // Check if an org is selected via cookie
  const cookieStore = await cookies();
  const selectedOrgId = cookieStore.get('cpm-org')?.value;

  if (selectedOrgId) {
    // Verify org exists and user is a member
    const org = findOrganizationById(selectedOrgId);
    const member = org ? findMemberByOrgAndUser(selectedOrgId, userId) : null;

    if (org && member) {
      // Show projects for this org
      const projects = findProjectsByOrgId(selectedOrgId);
      const projectsWithCounts = projects.map((project) => ({
        ...project,
        promptCount: countPromptsByProjectId(project.id),
      }));

      return (
        <ProjectsContent
          org={{ ...org, role: member.role }}
          initialProjects={projectsWithCounts}
        />
      );
    }
  }

  // No org selected or invalid — show org list
  const orgs = findOrgsByUserId(userId);
  const orgsWithCounts = orgs.map((org) => ({
    ...org,
    projectCount: countProjectsByOrgId(org.id),
  }));

  return <DashboardContent initialOrgs={orgsWithCounts} />;
}
