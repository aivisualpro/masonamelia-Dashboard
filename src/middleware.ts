import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that do not require authentication
const publicPaths = ['/login', '/register', '/api/auth/login', '/api/auth/register'];

// Paths that are static resources
const isStaticAsset = (path: string) => {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/favicon.ico') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token');

  // Verify if the path is an asset or public
  if (isStaticAsset(pathname) || publicPaths.includes(pathname)) {
    // If user is already logged in (has token) and tries to access login/register, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If no token and trying to access a protected route (everything else)
  if (!token) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    // loginUrl.searchParams.set('from', pathname); // Optional: remember where they were going
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> We MIGHT want to protect API routes too, but let's start with pages.
     *   Actually, let's protect everything and then exclude specific API routes in the logic above if needed.
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
