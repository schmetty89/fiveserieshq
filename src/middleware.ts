import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/members/me',
  '/forums/new',
  '/videos/submit',
  '/vendors/apply',
  '/events/submit',
  '/technical/submit',
]

const GUEST_ONLY_ROUTES = [
  '/auth/login',
  '/auth/join',
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (user && GUEST_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!user && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
