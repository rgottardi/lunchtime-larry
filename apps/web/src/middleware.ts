import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/privacy',
  '/terms',
];

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!authToken) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Allow access to authenticated paths
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api).*)',
  ],
};