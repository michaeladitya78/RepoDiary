import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Octokit } from '@octokit/rest'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client to read the access token (not exposed by anon key)
    const serviceSupabase = await createServiceClient()

    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('github_username, github_access_token')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.github_access_token) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please log out and sign in again.', reconnect: true },
        { status: 400 }
      )
    }

    // Fetch repositories from GitHub
    const octokit = new Octokit({ auth: profile.github_access_token })
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 50,
      affiliation: 'owner',
    })

    const mappedRepos = repos.map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
    }))

    return NextResponse.json({ repos: mappedRepos }, { status: 200 })
  } catch (err: unknown) {
    console.error('Fetch GitHub repos error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('401') || message.includes('Bad credentials')) {
      return NextResponse.json(
        { error: 'GitHub token expired. Please log out and sign in again to reconnect.', reconnect: true },
        { status: 401 }
      )
    }
    return NextResponse.json({ error: `Failed to fetch repos: ${message}` }, { status: 500 })
  }
}
