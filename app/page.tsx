import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import AddLarpForm from './components/AddLarpForm'
import AdSlot from './components/AdSlot'
import AuthButton from './components/AuthButton'
import Leaderboard from './components/Leaderboard'
import type { Larp } from '@/lib/types'
import {
  ADSENSE_SLOT_LEFT,
  ADSENSE_SLOT_RIGHT,
  ADSENSE_SLOT_MOBILE,
} from '@/lib/adsense'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // Force Next.js not to cache any Supabase fetch calls on this page
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    },
  )

  // Order by the `score` generated column (upvotes - downvotes) so the
  // server-rendered list matches the client-side sort and there's no
  // visible re-shuffling on hydration. created_at is the deterministic
  // tiebreaker.
  const { data, error } = await supabase
    .from('larps')
    .select('id, name, claim, upvotes, downvotes, created_at, user_id')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Leaderboard] Supabase fetch error:', JSON.stringify(error))
  }

  const larps: Larp[] = (data as Larp[] | null) ?? []

  return (
    <>
      {/* Viral marquee banner — full-width, screenshot-worthy for stories.
          Hover pauses on desktop; respects prefers-reduced-motion. */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.4)]">
        {/* Top flag stripe */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-az-blue" />
          <div className="flex-1 bg-az-red" />
          <div className="flex-1 bg-az-green" />
        </div>

        {/* Subtle gradient fade on left/right edges so text looks like it
            scrolls into a void instead of cutting off hard */}
        <div className="pointer-events-none absolute inset-y-1.5 left-0 z-10 w-12 bg-gradient-to-r from-zinc-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-1.5 right-0 z-10 w-12 bg-gradient-to-l from-zinc-950 to-transparent" />

        {/* Scrolling track — duplicated for seamless loop */}
        <div className="flex w-max animate-marquee py-4">
          {[0, 1].map((dup) => (
            <div
              key={dup}
              aria-hidden={dup === 1}
              className="flex shrink-0 items-center gap-9 px-5 text-xl font-black uppercase italic tracking-tight sm:text-2xl"
            >
              <span className="text-white">Advertise yourself</span>
              <Crown
                size={22}
                strokeWidth={2.5}
                className="shrink-0 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]"
              />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]">
                Be the biggest larp in Baku
              </span>
              <span className="text-az-red drop-shadow-[0_0_8px_rgba(239,51,64,0.55)]">★</span>
              <span className="text-white">larpbaku.com</span>
              <span className="text-az-blue drop-shadow-[0_0_8px_rgba(0,181,226,0.55)]">★</span>
              <span className="text-white">Vote or be larped</span>
              <span className="text-az-green drop-shadow-[0_0_8px_rgba(80,158,47,0.55)]">★</span>
              <span className="text-white">@larpbaku</span>
              <Crown
                size={22}
                strokeWidth={2.5}
                className="shrink-0 text-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]"
              />
              <span className="text-white">Rank your friends</span>
              <span className="text-az-red drop-shadow-[0_0_8px_rgba(239,51,64,0.55)]">★</span>
            </div>
          ))}
        </div>

        {/* Bottom flag stripe */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-az-blue" />
          <div className="flex-1 bg-az-red" />
          <div className="flex-1 bg-az-green" />
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 py-10 sm:py-16">
        {/* Left ad rail (desktop only) */}
        <aside className="sticky top-8 hidden w-40 shrink-0 lg:block xl:w-48">
          {ADSENSE_SLOT_LEFT && (
            <AdSlot slot={ADSENSE_SLOT_LEFT} format="vertical" className="min-h-[600px]" />
          )}
        </aside>

        {/* Main content */}
        <main className="mx-auto w-full max-w-2xl pb-24 lg:pb-0">
          {/* Auth row */}
          <div className="mb-8 flex justify-end">
            <AuthButton />
          </div>

          {/* Header */}
          <header className="mb-12 text-center">
            {/* Flag stripe */}
            <div className="mx-auto mb-5 flex h-1.5 w-28 overflow-hidden rounded-full">
              <div className="flex-1 bg-az-blue" />
              <div className="flex-1 bg-az-red" />
              <div className="flex-1 bg-az-green" />
            </div>

            {/* Title */}
            <h1 className="text-5xl font-black leading-tight tracking-tighter sm:text-6xl">
              <span className="text-zinc-900">Baku&apos;s </span>
              <span className="text-az-blue">Larp</span>
              <span className="text-zinc-900"> Leaderboard</span>
            </h1>

            {/* Tagline */}
            <p className="mt-4 text-base text-zinc-500">
              Who&apos;s the biggest larp in Baku? You decide.
            </p>
          </header>

          {/* Form */}
          <section className="mb-10">
            <AddLarpForm />
          </section>

          {/* Debug: show fetch error in red if something went wrong */}
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-mono">
              DB error: {error.message} (code: {error.code})
            </p>
          )}

          {/* Leaderboard */}
          <Leaderboard initialLarps={larps} />

          <div className="mt-16 flex justify-center">
            <a
              href="https://www.tiktok.com/@larpbaku"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-zinc-800 hover:shadow-lg"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
              </svg>
              Follow @larpbaku on TikTok
            </a>
          </div>
          <footer className="mt-6 text-center text-xs text-zinc-400">
            One vote per network · votes are anonymous ·{' '}
            <Link href="/privacy" className="hover:text-zinc-600 hover:underline">
              Privacy
            </Link>
          </footer>
        </main>

        {/* Right ad rail (desktop only) */}
        <aside className="sticky top-8 hidden w-40 shrink-0 lg:block xl:w-48">
          {ADSENSE_SLOT_RIGHT && (
            <AdSlot slot={ADSENSE_SLOT_RIGHT} format="vertical" className="min-h-[600px]" />
          )}
        </aside>
      </div>

      {/* Mobile sticky bottom ad */}
      {ADSENSE_SLOT_MOBILE && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white p-2 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] lg:hidden">
          <AdSlot slot={ADSENSE_SLOT_MOBILE} format="auto" className="min-h-[60px]" />
        </div>
      )}
    </>
  )
}
