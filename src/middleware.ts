import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Protect admin pages
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  // Protect document management API
  // 開発環境では認証をスキップ
  if (pathname.startsWith('/api/documents') && !isLoggedIn && process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

export const config = {
  matcher: ['/admin/:path*', '/api/documents/:path*'],
};
