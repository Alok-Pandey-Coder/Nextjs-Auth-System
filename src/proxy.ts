import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('token');

  const isPublicPath = (path === '/login' || path === '/signup' || path === '/verfyemail')


  if(token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if(!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }
  

}

export const config = {
  matcher: [
    '/',
    '/profile',
    '/login',
    '/signup',
    '/verifyemail'
  ],
}