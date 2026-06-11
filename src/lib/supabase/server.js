/**
 * @fileoverview Server-side Supabase client for FurnAI.
 * Uses @supabase/ssr's createServerClient with Next.js cookie handling
 * for Server Components, Server Actions, and Route Handlers.
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client configured for server-side usage.
 * Reads and writes auth tokens through the Next.js cookie store.
 *
 * Must be called with `await` because `cookies()` is async in Next.js 16.
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>} Supabase client instance
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from a Server Component where the cookie
            // store is read-only. This is expected — the middleware will
            // handle the token refresh for the next request.
          }
        },
      },
    }
  )
}
