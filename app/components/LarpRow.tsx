'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Crown, Medal } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Larp } from '@/lib/types'

const VOTES_KEY = 'baku-larp:votes'
type Vote = 'up' | 'down'
type VoteMap = Record<string, Vote>

function readVotes(): VoteMap {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(VOTES_KEY) || '{}') } catch { return {} }
}
function writeVotes(v: VoteMap) {
  try { window.localStorage.setItem(VOTES_KEY, JSON.stringify(v)) } catch {}
}

const TOP3 = [
  {
    badge: 'bg-gradient-to-br from-yellow-300 to-amber-400 text-white shadow-[0_4px_16px_-4px_rgba(251,191,36,0.7)]',
    card: 'border-yellow-300/60 shadow-[0_2px_20px_-6px_rgba(251,191,36,0.3)]',
    icon: Crown,
    iconColor: 'text-yellow-700',
  },
  {
    badge: 'bg-gradient-to-br from-zinc-300 to-zinc-400 text-white shadow-[0_4px_16px_-4px_rgba(161,161,170,0.6)]',
    card: 'border-zinc-300/70 shadow-[0_2px_16px_-6px_rgba(161,161,170,0.25)]',
    icon: Medal,
    iconColor: 'text-zinc-600',
  },
  {
    badge: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_4px_16px_-4px_rgba(217,119,6,0.55)]',
    card: 'border-amber-400/50 shadow-[0_2px_16px_-6px_rgba(217,119,6,0.2)]',
    icon: Medal,
    iconColor: 'text-amber-800',
  },
]

export default function LarpRow({ larp, rank }: { larp: Larp; rank: number }) {
  const [myVote, setMyVote] = useState<Vote | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { setMyVote(readVotes()[larp.id] ?? null) }, [larp.id])

  async function vote(type: Vote) {
    if (myVote || busy) return
    setBusy(true)
    const votes = readVotes()
    votes[larp.id] = type
    writeVotes(votes)
    setMyVote(type)
    const { error } = await supabase.rpc('increment_vote', { larp_id: larp.id, vote_type: type })
    if (error) {
      const rolled = readVotes()
      delete rolled[larp.id]
      writeVotes(rolled)
      setMyVote(null)
    }
    setBusy(false)
  }

  const score = larp.upvotes - larp.downvotes
  const isTop3 = rank <= 3
  const top = isTop3 ? TOP3[rank - 1] : null

  const badgeCls = top
    ? top.badge
    : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
  const cardCls = top
    ? `border bg-white ${top.card}`
    : 'border border-zinc-200 bg-white shadow-sm'

  const RankIcon = top?.icon ?? null

  return (
    <li className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:scale-[1.005] ${cardCls}`}>
      {/* Rank badge */}
      <div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-black ${badgeCls}`}>
        {RankIcon ? <RankIcon size={15} strokeWidth={2.5} /> : null}
        <span className={RankIcon ? 'text-[10px] leading-none mt-0.5' : 'text-sm'}>#{rank}</span>
      </div>

      {/* Name + claim */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold text-zinc-900 leading-tight">{larp.name}</div>
        <div className="truncate text-sm text-zinc-500 mt-0.5">{larp.claim}</div>
      </div>

      {/* Score + vote buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Upvote */}
        <button
          type="button"
          onClick={() => vote('up')}
          disabled={!!myVote || busy}
          className={`group flex flex-col items-center gap-0.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all ${
            myVote === 'up'
              ? 'border-az-green bg-az-green/10 text-az-green'
              : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-az-green hover:bg-az-green/5 hover:text-az-green'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ChevronUp size={14} strokeWidth={2.5} />
          <AnimatePresence mode="wait">
            <motion.span
              key={larp.upvotes}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="tabular-nums"
            >
              {larp.upvotes}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Net score */}
        <AnimatePresence mode="wait">
          <motion.div
            key={score}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`w-10 text-center text-base font-black tabular-nums ${
              score > 0 ? 'text-az-green' : score < 0 ? 'text-az-red' : 'text-zinc-400'
            }`}
          >
            {score > 0 ? '+' : ''}{score}
          </motion.div>
        </AnimatePresence>

        {/* Downvote */}
        <button
          type="button"
          onClick={() => vote('down')}
          disabled={!!myVote || busy}
          className={`group flex flex-col items-center gap-0.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all ${
            myVote === 'down'
              ? 'border-az-red bg-az-red/10 text-az-red'
              : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-az-red hover:bg-az-red/5 hover:text-az-red'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ChevronDown size={14} strokeWidth={2.5} />
          <AnimatePresence mode="wait">
            <motion.span
              key={larp.downvotes}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="tabular-nums"
            >
              {larp.downvotes}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </li>
  )
}
