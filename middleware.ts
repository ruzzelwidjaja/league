import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  console.log('Middleware:', { pathname, isAuthenticated, sessionCookie: !!sessionCookie });

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/privacy',
    '/rules',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-callback',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  // API routes and static files should pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // Join routes with league codes can be accessed by anyone (they handle auth internally)
  if (pathname.startsWith('/join/')) {
    return NextResponse.next();
  }

  // Handle authentication redirects
  if (!isAuthenticated) {
    // User not authenticated
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to signin
    const signinUrl = new URL('/auth/signin', request.url);
    if (pathname !== '/auth/signin') {
      signinUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(signinUrl);
  }

  // User is authenticated
  if (isAuthenticated) {
    // Redirect authenticated users away from auth pages to home
    if (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For authenticated users visiting home, redirect to join page
    // (The home page will now only show landing for unauthenticated users)
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/join', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Better Auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
