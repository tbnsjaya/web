import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// Tentukan rute mana saja yang ingin dilindungi, dan rute publik
const publicRoutes = ['/login'];

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  const sessionCookie = req.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  // Jika mencoba mengakses rute yang dilindungi tanpa sesi, redirect ke login
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Jika mencoba mengakses rute login padahal sudah ada sesi, redirect ke dashboard
  if (isPublicRoute && session && path === '/login') {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
