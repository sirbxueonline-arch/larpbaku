import { createClient } from '@supabase/supabase-js'
import AddLarpForm from './components/AddLarpForm'
import Leaderboard from './components/Leaderboard'
import type { Larp } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data } = await supabase
    .from('larps')
    .select('*')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })

  const larps: Larp[] = (data as Larp[] | null) ?? []

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      {/* Header */}
      <header className="mb-12 text-center">
        {/* Flag stripe */}
        <div className="mx-auto mb-5 flex h-1.5 w-28 overflow-hidden rounded-full">
          <div className="flex-1 bg-az-blue" />
          <div className="flex-1 bg-az-red" />
          <div className="flex-1 bg-az-green" />
        </div>

        {/* Title */}
        <h1 className="text-7xl font-black leading-none tracking-tighter sm:text-8xl">
          <span className="text-zinc-900">Baku </span>
          <span className="text-az-blue">Larp</span>
        </h1>

        {/* Tagline */}
        <p className="mt-5 text-base font-semibold text-zinc-600">
          Baku&apos;s biggest larps, ranked by the people.
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Add your larp. Get exposed.
        </p>
      </header>

      {/* Form */}
      <section className="mb-10">
        <AddLarpForm />
      </section>

      {/* Leaderboard */}
      <Leaderboard initialLarps={larps} />

      <footer className="mt-16 text-center text-xs text-zinc-400">
        One vote per entry per browser · votes are anonymous
      </footer>
    </main>
  )
}
