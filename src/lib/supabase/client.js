/**
 * @fileoverview Browser-side Supabase client for FurnAI.
 * Uses @supabase/ssr's createBrowserClient for automatic cookie-based
 * session management in Next.js App Router client components.
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/client'
 *   const supabase = createClient()
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client configured for browser/client-component usage.
 * Session tokens are stored and refreshed automatically via cookies.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client instance
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
