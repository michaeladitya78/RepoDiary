import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.session.user
      const providerToken = data.session.provider_token // GitHub access token

      // Extract GitHub user data from user metadata
      const githubUsername = user.user_metadata?.user_name || user.user_metadata?.preferred_username
      const avatarUrl = user.user_metadata?.avatar_url
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name

      // Upsert profile
      if (githubUsername) {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            username: githubUsername.toLowerCase(),
            github_username: githubUsername,
            avatar_url: avatarUrl,
            full_name: fullName,
            github_access_token: providerToken, // stored for GitHub auto-commit
          },
          { onConflict: 'id' }
        )
      }

      // Use the configured app URL to avoid open redirect via forwardedHost header
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const baseUrl = isLocalEnv ? origin : (appUrl || origin)

      // Ensure the redirect path is a relative path starting with a single '/' to prevent open redirect vulnerabilities
      let safeNext = '/dashboard'
      if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
        safeNext = next
      }

      return NextResponse.redirect(`${baseUrl}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${new URL(request.url).origin}/login?error=auth_failed`)
}
