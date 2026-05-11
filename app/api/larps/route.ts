import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NAME_MAX = 50
const CLAIM_MAX = 200

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
  const b = body as { name?: unknown; claim?: unknown }
  const claim = typeof b.claim === 'string' ? b.claim.trim() : ''
  if (!claim || claim.length > CLAIM_MAX) {
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

  // If the client sent an auth token, verify it and force the larp's name
  // to the user's username — preventing impersonation. Anonymous submits
  // can pick any name (validated below).
  let userId: string | null = null
  let name = ''
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
    }
    userId = userData.user.id
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle()
    if (!profile) {
      return NextResponse.json({ error: 'no_profile' }, { status: 400 })
    }
    name = (profile as { username: string }).username
  } else {
    name = typeof b.name === 'string' ? b.name.trim() : ''
    if (!name || name.length > NAME_MAX) {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
    }
  }

  const { data, error } = await supabase.rpc('add_larp_with_rate_limit', {
    p_name: name,
    p_claim: claim,
    p_ip_hash: hashIp(ip),
  })

  if (error) {
    if (error.message.includes('rate_limited')) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    return NextResponse.json(
      { error: 'db_error', detail: error.message },
      { status: 500 },
    )
  }

  // Attach the owner if signed in. We do this in a second statement
  // (not inside the RPC) so the existing function signature is unchanged.
  if (userId && data) {
    await supabase.from('larps').update({ user_id: userId }).eq('id', data)
  }

  return NextResponse.json({ ok: true, id: data })
}
