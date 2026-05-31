import { createClient, createServiceClient } from '@/lib/supabase/server'
import { commitEntryToGitHub } from '@/lib/github'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entryId } = body

    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 })
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
        { error: 'GitHub not connected. Please log out and sign in again.' },
        { status: 400 }
      )
    }

    // Fetch the entry
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single()

    if (entryError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Commit to GitHub
    const { commitUrl } = await commitEntryToGitHub(
      profile.github_access_token,
      profile.github_username,
      entry
    )

    // Update entry with commit info
    await serviceSupabase
      .from('entries')
      .update({ github_committed: true, github_commit_url: commitUrl })
      .eq('id', entryId)

    return NextResponse.json({ commitUrl }, { status: 200 })
  } catch (err: unknown) {
    console.error('GitHub commit error:', err)

    const message = err instanceof Error ? err.message : 'Unknown error'

    // Surface token errors clearly
    if (message.includes('401') || message.includes('Bad credentials')) {
      return NextResponse.json(
        { error: 'GitHub token expired. Please log out and sign in again to reconnect.', reconnect: true },
        { status: 401 }
      )
    }

    if (message.includes("You don't have write access")) {
      return NextResponse.json(
        { error: "You don't have write access to this repo. Choose a repo you own." },
        { status: 403 }
      )
    }

    if (message.includes("This repo has no commits yet")) {
      return NextResponse.json(
        { error: "This repo has no commits yet. Push at least one commit to it first, then try again." },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: `GitHub commit failed: ${message}` }, { status: 500 })
  }
}
