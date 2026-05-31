import { createClient } from '@/lib/supabase/server'
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
    const { built, learned, next, tags, repo_name, repo_url, repo_is_private } = body

    // Validate
    if (!built?.trim() || !learned?.trim() || !next?.trim() || !repo_name?.trim()) {
      return NextResponse.json({ error: 'All fields including repository are required' }, { status: 400 })
    }
    if (built.length > 280 || learned.length > 280 || next.length > 280) {
      return NextResponse.json({ error: 'Each field must be under 280 characters' }, { status: 400 })
    }

    // Parse tags
    const parsedTags = tags
      ? tags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      : []

    const { data: entry, error } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        built: built.trim(),
        learned: learned.trim(),
        next: next.trim(),
        tags: parsedTags.length > 0 ? parsedTags : null,
        repo_name: repo_name.trim(),
        repo_url: repo_url ? repo_url.trim() : null,
        repo_is_private: !!repo_is_private,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert entry error:', error)
      return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
    }

    return NextResponse.json({ entry }, { status: 201 })
  } catch (err) {
    console.error('Entries route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, built, learned, next, tags } = body

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    // Validate fields
    if (!built?.trim() || !learned?.trim() || !next?.trim()) {
      return NextResponse.json({ error: 'All three fields are required' }, { status: 400 })
    }
    if (built.length > 280 || learned.length > 280 || next.length > 280) {
      return NextResponse.json({ error: 'Each field must be under 280 characters' }, { status: 400 })
    }

    // Parse tags: support string (comma separated) or array
    let parsedTags: string[] = []
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
    } else if (Array.isArray(tags)) {
      parsedTags = tags.map((t: any) => String(t).trim().toLowerCase()).filter(Boolean)
    }

    const { data: entry, error } = await supabase
      .from('entries')
      .update({
        built: built.trim(),
        learned: learned.trim(),
        next: next.trim(),
        tags: parsedTags.length > 0 ? parsedTags : null,
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure owner
      .select()
      .single()

    if (error) {
      console.error('Update entry error:', error)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    return NextResponse.json({ entry }, { status: 200 })
  } catch (err) {
    console.error('Entries PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check request body first, fallback to query params
    let id: string | null = null
    try {
      const body = await request.json()
      id = body.id || body.entryId
    } catch {
      const { searchParams } = new URL(request.url)
      id = searchParams.get('id') || searchParams.get('entryId')
    }

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure owner

    if (error) {
      console.error('Delete entry error:', error)
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Entries DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
