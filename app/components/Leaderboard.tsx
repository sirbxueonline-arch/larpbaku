'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import type { Larp } from '@/lib/types'
import LarpRow from './LarpRow'

const VOTE_KEY = 'baku-larp:vote'
type Vote = 'up' | 'down'
type StoredVote = { larpId: string; type: Vote }

function readVote(): StoredVote | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(VOTE_KEY)
    return raw ? (JSON.parse(raw) as StoredVote) : null
  } catch {
    return null
  }
}
function writeVote(v: StoredVote | null) {
  try {
    if (v) window.localStorage.setItem(VOTE_KEY, JSON.stringify(v))
    else window.localStorage.removeItem(VOTE_KEY)
  } catch {}
}

function sortLarps(larps: Larp[]): Larp[] {
  return [...larps].sort((a, b) => {
    const sa = a.upvotes - a.downvotes
    const sb = b.upvotes - b.downvotes
    if (sb !== sa) return sb - sa
    return a.created_at.localeCompare(b.created_at)
  })
}

export default function Leaderboard({ initialLarps }: { initialLarps: Larp[] }) {
  const [larps, setLarps] = useState<Larp[]>(() => sortLarps(initialLarps))
  const [vote, setVote] = useState<StoredVote | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => { setVote(readVote()) }, [])

  const totalVotes = larps.reduce((s, l) => s + l.upvotes + l.downvotes, 0)

  async function handleVote(larpId: string, type: Vote) {
    if (vote || busy) return
    setBusy(true)
    setErrorMsg(null)
    const newVote: StoredVote = { larpId, type }
    setVote(newVote)
    writeVote(newVote)
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ larpId, type }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setVote(null)
        writeVote(null)
        if (data?.error === 'already_voted') {
          setErrorMsg('Already voted from this network — one vote per IP.')
        } else {
          setErrorMsg('Vote failed. Try again.')
        }
        setTimeout(() => setErrorMsg(null), 4000)
      }
    } catch {
      setVote(null)
      writeVote(null)
      setErrorMsg('Network error. Try again.')
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('larps-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'larps' }, (payload) => {
        setLarps((current) => {
          if (payload.eventType === 'INSERT') {
            const inserted = payload.new as Larp
            if (current.some((l) => l.id === inserted.id)) return current
            return sortLarps([...current, inserted])
          }
          if (payload.eventType === 'UPDATE') {
            return sortLarps(current.map((l) => (l.id === (payload.new as Larp).id ? (payload.new as Larp) : l)))
          }
          if (payload.eventType === 'DELETE') {
            return current.filter((l) => l.id !== (payload.old as { id: string }).id)
          }
          return current
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // Refetch from scratch when the tab becomes visible again — covers the
  // case where the realtime websocket drops while the tab is asleep and
  // we miss updates. Belt-and-suspenders alongside the realtime channel.
  useEffect(() => {
    async function refetch() {
      const { data } = await supabase
        .from('larps')
        .select('id, name, claim, upvotes, downvotes, created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
      if (data) setLarps(sortLarps(data as Larp[]))
    }
    function onVisible() {
      if (document.visibilityState === 'visible') refetch()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  return (
    <div>
      {/* Error toast */}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-az-red/30 bg-az-red/5 px-4 py-3 text-sm font-semibold text-az-red">
          {errorMsg}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-2xl font-black text-zinc-900">{larps.length}</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-0.5">Larps</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-2xl font-black text-zinc-900">{totalVotes}</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-0.5">Total votes</div>
        </div>
      </div>

      {/* List */}
      {larps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <div className="text-4xl mb-3">🏆</div>
          <p className="font-semibold text-zinc-700">No larps yet</p>
          <p className="text-sm text-zinc-500 mt-1">Be the first to claim something ridiculous</p>
        </div>
      ) : (
        <ol className="space-y-2">
          <AnimatePresence initial={false}>
            {larps.map((larp, i) => (
              <motion.div
                key={larp.id}
                layout
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <LarpRow
                  larp={larp}
                  rank={i + 1}
                  myVote={vote?.larpId === larp.id ? vote.type : null}
                  disabled={!!vote || busy}
                  onVote={(type) => handleVote(larp.id, type)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </ol>
      )}
    </div>
  )
}
