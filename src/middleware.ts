import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger todas las rutas /admin excepto /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('admin_session')
    const secret = process.env.ADMIN_SESSION_SECRET

    if (!secret || session?.value !== secret) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Proteger rutas de API admin
  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/login')
  ) {
    const session = request.cookies.get('admin_session')
    const secret = process.env.ADMIN_SESSION_SECRET

    if (!secret || session?.value !== secret) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
