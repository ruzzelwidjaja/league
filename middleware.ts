import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/', 
      '/join/:path*', 
      '/api/webhooks/workos',
      '/api/auth/signin',
      '/api/auth/signout',
      '/api/leagues/check/:path*'
    ],
  },
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};