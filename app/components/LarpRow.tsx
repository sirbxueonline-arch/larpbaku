'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Crown, Medal } from 'lucide-react'
import type { Larp } from '@/lib/types'

type Vote = 'up' | 'down'

const TOP3 = [
  {
    // 1st — gold
    badge:
      'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-white shadow-[0_6px_18px_-4px_rgba(245,158,11,0.55)]',
    card:
      'border-2 border-amber-300 bg-white shadow-[0_6px_24px_-8px_rgba(245,158,11,0.3)]',
    accent: 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500',
    icon: Crown,
  },
  {
    // 2nd — silver
    badge:
      'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white shadow-[0_6px_18px_-4px_rgba(100,116,139,0.45)]',
    card:
      'border-2 border-slate-300 bg-white shadow-[0_6px_22px_-8px_rgba(100,116,139,0.22)]',
    accent: 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500',
    icon: Medal,
  },
  {
    // 3rd — bronze
    badge:
      'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-700 text-white shadow-[0_6px_18px_-4px_rgba(234,88,12,0.45)]',
    card:
      'border-2 border-orange-300 bg-white shadow-[0_6px_22px_-8px_rgba(234,88,12,0.22)]',
    accent: 'bg-gradient-to-b from-orange-400 via-orange-500 to-amber-700',
    icon: Medal,
  },
]

export default function LarpRow({
  larp,
  rank,
  myVote,
  disabled,
  onVote,
}: {
  larp: Larp
  rank: number
  myVote: Vote | null
  disabled: boolean
  onVote: (type: Vote) => void
}) {
  const total = larp.upvotes + larp.downvotes
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
    <li
      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl pr-4 transition-all duration-200 ${
        isTop3 ? 'py-4 pl-5 hover:scale-[1.01]' : 'py-3.5 pl-4 hover:scale-[1.005]'
      } ${cardCls}`}
    >
      {/* Left accent stripe (top 3 only) */}
      {top && <div className={`absolute inset-y-0 left-0 w-1.5 ${top.accent}`} />}

      {/* Rank badge */}
      <div
        className={`flex shrink-0 flex-col items-center justify-center rounded-xl font-black ${
          isTop3 ? 'h-12 w-12' : 'h-10 w-10 text-xs'
        } ${badgeCls}`}
      >
        {RankIcon ? (
          <RankIcon
            size={isTop3 ? 20 : 15}
            strokeWidth={2.5}
            className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
          />
        ) : null}
        <span
          className={
            RankIcon
              ? `leading-none mt-0.5 ${isTop3 ? 'text-[10px]' : 'text-[10px]'}`
              : 'text-sm'
          }
        >
          #{rank}
        </span>
      </div>

      {/* Name + claim */}
      <div className="min-w-0 flex-1">
        <div
          className={`truncate font-black text-zinc-900 leading-tight ${
            isTop3 ? 'text-base' : 'font-bold'
          }`}
        >
          {larp.name}
        </div>
        <div className="truncate text-sm text-zinc-500 mt-0.5">{larp.claim}</div>
      </div>

      {/* Score + vote buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Upvote */}
        <button
          type="button"
          onClick={() => onVote('up')}
          disabled={disabled}
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

        {/* Total votes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={total}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`w-10 text-center text-base font-black tabular-nums ${
              total > 0 ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            {total}
          </motion.div>
        </AnimatePresence>

        {/* Downvote */}
        <button
          type="button"
          onClick={() => onVote('down')}
          disabled={disabled}
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
