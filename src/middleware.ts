import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// FIXED: must be named "middleware" — Next.js ignores any other name
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // FIXED: typo "verfyemail" → "verifyemail", added "/" as public
  const isPublicPath = (
    path === '/login' ||
    path === '/signup' ||
    path === '/verifyemail' ||
    path === '/'
  );

  // Logged in + trying to access login/signup → send to profile
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/profile', request.nextUrl));
  }

  // Not logged in + trying to access protected route → send to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
}

export const config = {
  matcher: [
    '/',
    '/profile',
    '/login',
    '/signup',
    '/verifyemail',
  ],
}


