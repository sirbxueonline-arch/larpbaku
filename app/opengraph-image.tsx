import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const alt = "Baku's Larp Leaderboard"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data } = await supabase
    .from('larps')
    .select('name, claim, upvotes, downvotes')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)

  const top = data?.[0] as { name: string; claim: string; upvotes: number; downvotes: number } | undefined
  const score = top ? top.upvotes - top.downvotes : 0

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
        {/* Flag stripe */}
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
          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            <span style={{ color: '#18181b' }}>Baku&apos;s </span>
            <span style={{ color: '#00B5E2', marginLeft: 18 }}>Larp</span>
            <span style={{ color: '#18181b', marginLeft: 18 }}>Leaderboard</span>
          </div>

          {top ? (
            <div
              style={{
                marginTop: 50,
                display: 'flex',
                flexDirection: 'column',
                padding: '32px 36px',
                backgroundColor: 'white',
                borderRadius: 24,
                border: '2px solid #fcd34d',
                boxShadow: '0 8px 32px -8px rgba(245, 158, 11, 0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #fde047, #f59e0b)',
                    color: 'white',
                    fontSize: 28,
                    fontWeight: 900,
                  }}
                >
                  #1
                </div>
                <div
                  style={{
                    display: 'flex',
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: 1.5,
                  }}
                >
                  CHAMPION
                </div>
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: '#18181b',
                  lineHeight: 1.05,
                  letterSpacing: -1,
                }}
              >
                {top.name}
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: '#71717a',
                  marginTop: 8,
                  maxWidth: 900,
                }}
              >
                {top.claim}
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 18,
                  fontSize: 26,
                  fontWeight: 800,
                  color: score >= 0 ? '#509E2F' : '#EF3340',
                }}
              >
                {score > 0 ? '+' : ''}
                {score} votes
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: 48,
                fontSize: 32,
                color: '#71717a',
              }}
            >
              Who&apos;s the biggest larp in Baku? You decide.
            </div>
          )}

          {/* Footer URL */}
          <div
            style={{
              marginTop: 48,
              display: 'flex',
              fontSize: 26,
              fontWeight: 800,
              color: '#52525b',
            }}
          >
            larpbaku.com
          </div>
        </div>

        {/* Flag stripe */}
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
