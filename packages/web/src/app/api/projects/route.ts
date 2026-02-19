import { NextResponse } from 'next/server';
import {
  findProjectsByOrgId,
  findProjectBySlug,
  findMemberByOrgAndUser,
  findOrganizationById,
  insertProject,
  countPromptsByProjectId,
} from '@cpm/db';
import { generateId, nowISO } from '@cpm/shared';
import { getUserId } from '@/lib/get-user-id';

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    // Verify membership
    const member = findMemberByOrgAndUser(orgId, userId);
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const projects = findProjectsByOrgId(orgId);
    const projectsWithCounts = projects.map((project) => ({
      ...project,
      promptCount: countPromptsByProjectId(project.id),
    }));

    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { orgId, name, description, machineSize, region } = body;

    if (!orgId || typeof orgId !== 'string') {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Verify org exists
    const org = findOrganizationById(orgId);
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    // Verify membership
    const member = findMemberByOrgAndUser(orgId, userId);
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Generate slug from name, dedup within org
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseSlug) baseSlug = 'project';

    let slug = baseSlug;
    let suffix = 1;
    while (findProjectBySlug(orgId, slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const now = nowISO();
    const projectId = generateId();

    insertProject({
      id: projectId,
      orgId,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      machineSize: machineSize || 'free',
      region: region || 'iad',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { id: projectId, name: name.trim(), slug, orgId },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
