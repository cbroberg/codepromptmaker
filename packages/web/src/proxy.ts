import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isAuthEnabled(): boolean {
  if (process.env.CPM_LOCAL === '1') return false;
  return !!process.env.AUTH_SECRET;
}

export function proxy(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  // Check for session token (Auth.js database sessions)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ??
    request.cookies.get('__Secure-authjs.session-token')?.value;

  const isAuthenticated = !!sessionToken;

  if (!isAuthenticated) {
    // API routes → 401
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Page routes → redirect to sign in
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/generate/:path*',
    '/prompts/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/api/((?!auth).*)',
  ],
};
