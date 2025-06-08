import { NextResponse } from "next/server";

export async function middleware() {
  // For Better Auth, we don't need complex middleware
  // The session management is handled by Better Auth itself
  // We just need to ensure API routes are accessible

  // Allow all requests to pass through - Better Auth handles authentication at the component level
  // This is much simpler than the WorkOS approach
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
