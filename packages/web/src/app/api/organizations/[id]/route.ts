import { NextResponse } from 'next/server';
import {
  findOrganizationById,
  findOrganizationBySlug,
  findMemberByOrgAndUser,
  updateOrganization,
  deleteOrganization,
  countProjectsByOrgId,
} from '@cpm/db';
import { nowISO } from '@cpm/shared';
import { getUserId } from '@/lib/get-user-id';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const org = findOrganizationById(id);
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check membership
    const member = findMemberByOrgAndUser(id, userId);
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({
      ...org,
      role: member.role,
      projectCount: countProjectsByOrgId(id),
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
    const org = findOrganizationById(id);
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (org.isPersonal) {
      return NextResponse.json({ error: 'Cannot rename personal organization' }, { status: 400 });
    }

    // Check owner/admin
    const member = findMemberByOrgAndUser(id, userId);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate new slug from name
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseSlug) baseSlug = 'org';

    let slug = baseSlug;
    let suffix = 1;
    let existing = findOrganizationBySlug(slug);
    while (existing && existing.id !== id) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
      existing = findOrganizationBySlug(slug);
    }

    updateOrganization(id, {
      name: name.trim(),
      slug,
      updatedAt: nowISO(),
    });

    return NextResponse.json({ id, name: name.trim(), slug });
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
    const org = findOrganizationById(id);
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (org.isPersonal) {
      return NextResponse.json({ error: 'Cannot delete personal organization' }, { status: 400 });
    }

    // Only owner can delete
    const member = findMemberByOrgAndUser(id, userId);
    if (!member || member.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    deleteOrganization(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
