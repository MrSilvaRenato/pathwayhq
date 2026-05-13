import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that parents cannot access (coaches and admins can)
const PARENT_BLOCKED_PATHS = [
  '/athletes',
  '/squad',
  '/squads',
  '/sessions',
  '/milestones',
  '/admin',
]

// Routes only club_admin can access
const ADMIN_ONLY_PATHS = ['/admin']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthRoute = path.startsWith('/auth')
  const isAppRoute = !isAuthRoute && path !== '/'

  // Not logged in → redirect to login
  if (isAppRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Already logged in → skip auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-based protection for authenticated users
  if (user && isAppRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Parents can only access /parent, /dashboard, /settings
    if (role === 'parent') {
      const blocked = PARENT_BLOCKED_PATHS.some(p => path.startsWith(p))
      if (blocked) {
        return NextResponse.redirect(new URL('/parent', request.url))
      }
    }

    // Admin-only paths
    if (ADMIN_ONLY_PATHS.some(p => path.startsWith(p)) && role !== 'club_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
