import { NextResponse } from 'next/server';
import {
  findProjectById,
  findProjectBySlug,
  findMemberByOrgAndUser,
  updateProject,
  deleteProject,
  countPromptsByProjectId,
} from '@cpm/db';
import { nowISO } from '@cpm/shared';
import { getUserId } from '@/lib/get-user-id';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = findProjectById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check membership via org
    const member = findMemberByOrgAndUser(project.orgId, userId);
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({
      ...project,
      promptCount: countPromptsByProjectId(id),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = findProjectById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check owner/admin
    const member = findMemberByOrgAndUser(project.orgId, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, machineSize, region } = body;

    const updates: Record<string, unknown> = { updatedAt: nowISO() };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updates.name = name.trim();

      // Regenerate slug
      let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      if (!baseSlug) baseSlug = 'project';

      let slug = baseSlug;
      let suffix = 1;
      let existing = findProjectBySlug(project.orgId, slug);
      while (existing && existing.id !== id) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
        existing = findProjectBySlug(project.orgId, slug);
      }
      updates.slug = slug;
    }

    if (description !== undefined) updates.description = description?.trim() || null;
    if (machineSize !== undefined) updates.machineSize = machineSize;
    if (region !== undefined) updates.region = region;

    updateProject(id, updates);

    return NextResponse.json({ id, ...updates });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = findProjectById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only owner can delete
    const member = findMemberByOrgAndUser(project.orgId, userId);
    if (!member || member.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
