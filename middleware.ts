import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const [user, pwd] = atob(basicAuth.split(' ')[1]).split(':')
    const validPassword = process.env.DASHBOARD_PASSWORD
    const validUser = process.env.DASHBOARD_USER || 'lh'

    if (validPassword && user === validUser && pwd === validPassword) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Access denied', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="LH PM Dashboard - SiteMinder Internal"',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
