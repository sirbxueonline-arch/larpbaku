import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Crown, Medal, ArrowLeft, BadgeCheck } from 'lucide-react'
import type { Metadata } from 'next'
import type { Larp } from '@/lib/types'
import Avatar from '@/app/components/Avatar'

export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

async function fetchLarp(id: string): Promise<{ larp: Larp; rank: number } | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    },
  )

  // Fetch the larp directly by id — fast, doesn't depend on full table fetch
  const { data: row, error: rowErr } = await supabase
    .from('larps')
    .select('id, name, claim, upvotes, downvotes, created_at, user_id, score, profiles(username, avatar_url, bio, tiktok, instagram)')
    .eq('id', id)
    .maybeSingle()

  if (rowErr || !row) return null
  // Supabase TS inference returns embedded `profiles` as array.
  const larp = row as unknown as Larp & { score?: number }
  const score = (larp.score ?? larp.upvotes - larp.downvotes) || 0

  // Rank = number of larps with a strictly higher score, plus 1. Ties
  // resolved by created_at (earlier wins) per the leaderboard's sort.
  const { count: higherScore } = await supabase
    .from('larps')
    .select('id', { count: 'exact', head: true })
    .gt('score', score)
  const { count: tiedEarlier } = await supabase
    .from('larps')
    .select('id', { count: 'exact', head: true })
    .eq('score', score)
    .lt('created_at', larp.created_at)
  const rank = (higherScore ?? 0) + (tiedEarlier ?? 0) + 1

  return { larp, rank }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await fetchLarp(params.id)
  if (!result) return { title: 'Larp not found — Baku Larp' }
  const { larp, rank } = result
  const score = larp.upvotes - larp.downvotes
  const displayName = larp.user_id ? `@${larp.name}` : larp.name
  const title = `${displayName} — #${rank} on Baku Larp`
  const description = `"${larp.claim}" · ${score > 0 ? '+' : ''}${score} votes`
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function LarpDetailPage({ params }: Props) {
  const result = await fetchLarp(params.id)
  if (!result) notFound()
  const { larp, rank } = result
  const score = larp.upvotes - larp.downvotes

  const top = rank === 1
    ? { label: 'CHAMPION', icon: Crown, color: 'text-yellow-500', bg: 'from-amber-300 via-yellow-400 to-amber-500' }
    : rank === 2
    ? { label: 'SILVER', icon: Medal, color: 'text-slate-500', bg: 'from-slate-300 via-slate-400 to-slate-500' }
    : rank === 3
    ? { label: 'BRONZE', icon: Medal, color: 'text-orange-500', bg: 'from-orange-400 via-orange-500 to-amber-700' }
    : null

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-az-blue hover:underline"
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Back to leaderboard
      </Link>

      <div className="relative overflow-hidden rounded-3xl border-2 border-zinc-200 bg-white p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
        {top && (
          <div className={`absolute inset-y-0 left-0 w-2 bg-gradient-to-b ${top.bg}`} />
        )}

        {/* Rank pill */}
        <div className="mb-6 flex items-center gap-3">
          {top ? (
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${top.bg} text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)]`}>
              <top.icon size={24} strokeWidth={2.5} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl font-black text-zinc-500">
              #{rank}
            </div>
          )}
          {top && (
            <span className={`rounded-full bg-gradient-to-r ${top.bg} px-3 py-1 text-xs font-black tracking-wider text-white`}>
              {top.label} · #{rank}
            </span>
          )}
        </div>

        {/* Owner profile block (verified entries only) */}
        {larp.user_id && (
          <div className="mb-5 flex items-center gap-3">
            <Avatar
              url={larp.profiles?.avatar_url}
              username={larp.profiles?.username ?? larp.name}
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-sm font-bold text-zinc-900">
                @{larp.profiles?.username ?? larp.name}
                <BadgeCheck size={14} strokeWidth={2.5} className="text-az-blue" />
              </div>
              {larp.profiles?.bio && (
                <p className="text-sm text-zinc-500 leading-snug">
                  {larp.profiles.bio}
                </p>
              )}
              {(larp.profiles?.tiktok || larp.profiles?.instagram) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {larp.profiles?.tiktok && (
                    <a
                      href={`https://www.tiktok.com/@${larp.profiles.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-zinc-800"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
                      </svg>
                      @{larp.profiles.tiktok}
                    </a>
                  )}
                  {larp.profiles?.instagram && (
                    <a
                      href={`https://www.instagram.com/${larp.profiles.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-2.5 py-1 text-[11px] font-bold text-white transition hover:brightness-110"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                      @{larp.profiles.instagram}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Name + claim */}
        <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900 sm:text-5xl">
          {larp.user_id ? `@${larp.name}` : larp.name}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 leading-snug">
          {larp.claim}
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="text-2xl font-black text-az-green tabular-nums">
              {larp.upvotes}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Upvotes
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="text-2xl font-black text-az-red tabular-nums">
              {larp.downvotes}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Downvotes
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div
              className={`text-2xl font-black tabular-nums ${
                score > 0 ? 'text-az-green' : score < 0 ? 'text-az-red' : 'text-zinc-400'
              }`}
            >
              {score > 0 ? '+' : ''}{score}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Net score
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/#larp-${larp.id}`}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-az-blue px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
        >
          Vote on the leaderboard
        </Link>
      </div>
    </main>
  )
}
