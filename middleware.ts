import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page and auth API through without a cookie
  if (pathname === '/login' || pathname === '/api/auth') {
    return NextResponse.next()
  }

  const validPassword = process.env.DASHBOARD_PASSWORD
  const authCookie = request.cookies.get('lh-auth')

  if (validPassword && authCookie?.value === validPassword) {
    return NextResponse.next()
  }

  // Redirect to login page
  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
