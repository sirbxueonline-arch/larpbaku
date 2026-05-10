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

      {/* Leaderboard */}
      <Leaderboard initialLarps={larps} />

      <footer className="mt-16 text-center text-xs text-zinc-400">
        One vote per entry per browser · votes are anonymous
      </footer>
    </main>
  )
}
