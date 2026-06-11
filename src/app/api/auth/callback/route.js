/**
 * @fileoverview OAuth callback handler for FurnAI.
 *
 * After a user authenticates with an OAuth provider (Google, GitHub, etc.),
 * Supabase redirects to this route with a `code` query parameter.
 * We exchange that code for a session, then redirect the user to their
 * intended destination (defaults to `/dashboard`).
 *
 * Route: GET /api/auth/callback?code=<code>&next=<path>
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Handles the OAuth callback by exchanging the authorization code for a
 * Supabase session.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's no code or the exchange failed, redirect home with an error flag.
  return NextResponse.redirect(`${origin}/?error=auth`)
}
