import { NextResponse } from 'next/server';
import {
  findOrgsByUserId,
  findOrganizationBySlug,
  insertOrganization,
  insertOrgMember,
  countProjectsByOrgId,
} from '@cpm/db';
import { generateId, nowISO } from '@cpm/shared';
import { getUserId } from '@/lib/get-user-id';
import { ensurePersonalOrg } from '@/lib/ensure-personal-org';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure personal org exists
    ensurePersonalOrg(userId);

    const orgs = findOrgsByUserId(userId);
    const orgsWithCounts = orgs.map((org) => ({
      ...org,
      projectCount: countProjectsByOrgId(org.id),
    }));

    return NextResponse.json(orgsWithCounts);
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
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate slug from name
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseSlug) baseSlug = 'org';

    // Dedup slug with suffix if taken
    let slug = baseSlug;
    let suffix = 1;
    while (findOrganizationBySlug(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const now = nowISO();
    const orgId = generateId();

    insertOrganization({
      id: orgId,
      name: name.trim(),
      slug,
      plan: 'free',
      isPersonal: false,
      createdAt: now,
      updatedAt: now,
    });

    insertOrgMember({
      id: generateId(),
      orgId,
      userId,
      role: 'owner',
      createdAt: now,
    });

    return NextResponse.json({ id: orgId, name: name.trim(), slug }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
