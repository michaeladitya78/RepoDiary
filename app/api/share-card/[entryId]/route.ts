import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Share card generation using satori + @resvg/resvg-js
// Returns a 1200×630 PNG for OG image / share cards

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { entryId } = await params

  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('entries')
    .select('*, profiles(username, full_name, avatar_url)')
    .eq('id', entryId)
    .single()

  if (error || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  // Dynamic import to avoid edge runtime issues
  const satori = (await import('satori')).default
  const { Resvg } = await import('@resvg/resvg-js')

  // Fetch Inter font
  const fontRes = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff'
  )
  const fontData = await fontRes.arrayBuffer()

  const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles
  const displayName = profile?.full_name || profile?.username || 'Builder'
  const username = profile?.username || ''

  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const truncate = (str: string, max: number) =>
    str.length > max ? str.slice(0, max) + '…' : str

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          backgroundColor: '#0d1117',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          // Header row
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
              children: [
                // Logo
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    children: [
                      { type: 'div', props: { style: { width: '36px', height: '36px', backgroundColor: '#22c55e', borderRadius: '8px' }, children: [] } },
                      { type: 'span', props: { style: { color: '#ffffff', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }, children: 'theRepoDiary' } },
                    ],
                  },
                },
                // User info
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '12px' },
                    children: [
                      profile?.avatar_url
                          ? { type: 'img', props: { src: profile.avatar_url, style: { width: '44px', height: '44px', borderRadius: '50%' } } }
                          : { type: 'div', props: { style: { width: '44px', height: '44px', backgroundColor: '#22c55e', borderRadius: '50%' }, children: [] } },
                      { type: 'span', props: { style: { color: '#94a3b8', fontSize: '20px' }, children: displayName } },
                    ],
                  },
                },
              ],
            },
          },
          // Entry content
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '24px', flex: '1' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
                    children: [
                      { type: 'span', props: { style: { color: '#22c55e', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }, children: '🔨 Built' } },
                      { type: 'span', props: { style: { color: '#f1f5f9', fontSize: '22px', lineHeight: '1.4' }, children: truncate(entry.built, 120) } },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '6px' },
                    children: [
                      { type: 'span', props: { style: { color: '#38bdf8', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }, children: '💡 Learned' } },
                      { type: 'span', props: { style: { color: '#f1f5f9', fontSize: '22px', lineHeight: '1.4' }, children: truncate(entry.learned, 120) } },
                    ],
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' },
              children: [
                { type: 'span', props: { style: { color: '#475569', fontSize: '18px' }, children: formattedDate } },
                { type: 'span', props: { style: { color: '#22c55e', fontSize: '20px', fontWeight: '600' }, children: `repodiary.com/${username}` } },
              ],
            },
          },
        ],
      },
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: fontData, style: 'normal' }],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render().asPng()

  return new Response(png as any, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
