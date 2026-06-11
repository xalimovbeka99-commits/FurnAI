/**
 * @fileoverview Next.js middleware for FurnAI.
 *
 * Responsibilities:
 * 1. Refreshes Supabase auth tokens on every matched request so sessions
 *    stay alive across server-rendered pages.
 * 2. Protects `/dashboard` routes — unauthenticated users are redirected
 *    to the home page.
 *
 * The matcher excludes static assets and image files to avoid unnecessary
 * overhead on those requests.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

/**
 * Middleware that refreshes Supabase auth cookies and guards protected routes.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    // Supabase keys are not configured yet. Skip auth checks so the site doesn't crash.
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First, mirror cookies onto the request so downstream
          // server code sees the refreshed tokens.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          // Re-create the response so it carries the updated request cookies.
          supabaseResponse = NextResponse.next({ request })

          // Set cookies on the outgoing response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Calling getUser() triggers a token refresh when needed.
  // IMPORTANT: Do NOT use getSession() — it reads from local storage
  // and can't be trusted on the server. Always use getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ---------- Route protection ----------
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

/**
 * Match all routes except static assets, images, and favicon.
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
