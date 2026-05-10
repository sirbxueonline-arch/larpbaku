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
        <div className="mx-auto mb-4 flex h-1 w-32 overflow-hidden rounded-full">
          <div className="flex-1 bg-az-blue" />
          <div className="flex-1 bg-az-red" />
          <div className="flex-1 bg-az-green" />
        </div>
        <h1 className="text-6xl font-black tracking-tight text-zinc-900 sm:text-7xl">
          Baku<span className="text-az-blue">Larp</span>
        </h1>
        <p className="mt-3 text-base text-zinc-500">
          Submit your larp. Let Baku decide.
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
