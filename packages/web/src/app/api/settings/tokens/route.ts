import { NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { insertApiToken, findApiTokensByUserId } from '@cpm/db';
import { getUserId } from '@/lib/get-user-id';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tokens = findApiTokensByUserId(userId);

    // Mask the hash — only return metadata
    const masked = tokens.map((t) => ({
      id: t.id,
      name: t.name,
      lastUsedAt: t.lastUsedAt,
      expiresAt: t.expiresAt,
      createdAt: t.createdAt,
    }));

    return NextResponse.json(masked);
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
    const name = body.name?.trim();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Token name is required' }, { status: 400 });
    }

    // Generate a random token and hash it
    const plaintext = `cpm_${randomBytes(32).toString('hex')}`;
    const tokenHash = createHash('sha256').update(plaintext).digest('hex');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    insertApiToken({
      id,
      userId,
      tokenHash,
      name,
      createdAt: now,
    });

    // Return plaintext only once — never stored
    return NextResponse.json({
      id,
      name,
      token: plaintext,
      createdAt: now,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
