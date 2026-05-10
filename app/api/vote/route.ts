import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return null
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? ''
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!ip) {
    return NextResponse.json({ error: 'no_ip' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const b = body as { larpId?: unknown; type?: unknown }
  if (
    typeof b.larpId !== 'string' ||
    (b.type !== 'up' && b.type !== 'down')
  ) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.rpc('increment_vote_by_ip', {
    p_larp_id: b.larpId,
    p_vote_type: b.type,
    p_ip_hash: hashIp(ip),
  })

  if (error) {
    return NextResponse.json(
      { error: 'db_error', detail: error.message },
      { status: 500 },
    )
  }

  if (data === false) {
    return NextResponse.json({ error: 'already_voted' }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
