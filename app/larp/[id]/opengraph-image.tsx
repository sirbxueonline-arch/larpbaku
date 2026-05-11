import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = 'Larp on Baku Larp Leaderboard'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase
    .from('larps')
    .select('id, name, claim, upvotes, downvotes')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })

  type Row = { id: string; name: string; claim: string; upvotes: number; downvotes: number }
  const rows = (data as Row[] | null) ?? []
  const rank = rows.findIndex((l) => l.id === params.id)
  const larp = rank >= 0 ? rows[rank] : null
  const displayRank = rank >= 0 ? rank + 1 : 0
  const score = larp ? larp.upvotes - larp.downvotes : 0

  const top1 = displayRank === 1
  const top2 = displayRank === 2
  const top3 = displayRank === 3
  const gradient = top1
    ? 'linear-gradient(135deg, #fde047, #f59e0b)'
    : top2
    ? 'linear-gradient(135deg, #cbd5e1, #64748b)'
    : top3
    ? 'linear-gradient(135deg, #fb923c, #b45309)'
    : 'linear-gradient(135deg, #71717a, #3f3f46)'
  const label = top1 ? 'CHAMPION' : top2 ? 'SILVER' : top3 ? 'BRONZE' : `#${displayRank || '?'}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f0f0f2',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', height: 12 }}>
          <div style={{ flex: 1, backgroundColor: '#00B5E2' }} />
          <div style={{ flex: 1, backgroundColor: '#EF3340' }} />
          <div style={{ flex: 1, backgroundColor: '#509E2F' }} />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 80px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 88,
                height: 88,
                borderRadius: 22,
                background: gradient,
                color: 'white',
                fontSize: 36,
                fontWeight: 900,
              }}
            >
              #{displayRank || '?'}
            </div>
            <div
              style={{
                display: 'flex',
                padding: '8px 18px',
                borderRadius: 999,
                background: gradient,
                color: 'white',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              {label}
            </div>
          </div>

          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: '#18181b',
              letterSpacing: -3,
              lineHeight: 1,
              marginTop: 28,
            }}
          >
            {larp ? larp.name : 'Larp not found'}
          </div>

          {larp && (
            <div
              style={{
                fontSize: 36,
                color: '#52525b',
                lineHeight: 1.2,
                marginTop: 16,
                maxWidth: 1000,
              }}
            >
              &ldquo;{larp.claim}&rdquo;
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              marginTop: 36,
            }}
          >
            {larp && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 34,
                  fontWeight: 900,
                  color: score >= 0 ? '#509E2F' : '#EF3340',
                }}
              >
                {score > 0 ? '+' : ''}
                {score} votes
              </div>
            )}
            <div
              style={{
                display: 'flex',
                marginLeft: 'auto',
                fontSize: 26,
                fontWeight: 800,
                color: '#52525b',
              }}
            >
              larpbaku.com
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', height: 12 }}>
          <div style={{ flex: 1, backgroundColor: '#00B5E2' }} />
          <div style={{ flex: 1, backgroundColor: '#EF3340' }} />
          <div style={{ flex: 1, backgroundColor: '#509E2F' }} />
        </div>
      </div>
    ),
    { ...size },
  )
}
