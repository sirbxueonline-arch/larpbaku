'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Crown, Medal } from 'lucide-react'
import type { Larp } from '@/lib/types'

type Vote = 'up' | 'down'

const TOP3 = [
  {
    // 1st — gold
    badge:
      'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-white shadow-[0_6px_20px_-4px_rgba(251,191,36,0.7)] ring-2 ring-yellow-200/60',
    card:
      'border-yellow-300/80 bg-gradient-to-br from-yellow-50/90 via-white to-amber-50/50 shadow-[0_8px_32px_-8px_rgba(251,191,36,0.45)]',
    icon: Crown,
    label: 'CHAMPION',
    labelCls: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
  },
  {
    // 2nd — silver
    badge:
      'bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-white shadow-[0_6px_20px_-4px_rgba(161,161,170,0.6)] ring-2 ring-zinc-200/60',
    card:
      'border-zinc-300/80 bg-gradient-to-br from-zinc-50/90 via-white to-zinc-100/50 shadow-[0_8px_28px_-8px_rgba(161,161,170,0.4)]',
    icon: Medal,
    label: 'SILVER',
    labelCls: 'bg-gradient-to-r from-zinc-400 to-zinc-500 text-white',
  },
  {
    // 3rd — bronze
    badge:
      'bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-[0_6px_20px_-4px_rgba(217,119,6,0.55)] ring-2 ring-orange-200/60',
    card:
      'border-amber-400/70 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50 shadow-[0_8px_28px_-8px_rgba(217,119,6,0.35)]',
    icon: Medal,
    label: 'BRONZE',
    labelCls: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
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
      className={`flex items-center gap-3 rounded-2xl px-4 transition-all duration-200 ${
        isTop3 ? 'py-5 hover:scale-[1.01]' : 'py-3.5 hover:scale-[1.005]'
      } ${cardCls}`}
    >
      {/* Rank badge */}
      <div
        className={`flex shrink-0 flex-col items-center justify-center rounded-xl font-black ${
          isTop3 ? 'h-14 w-14' : 'h-10 w-10 text-xs'
        } ${badgeCls}`}
      >
        {RankIcon ? <RankIcon size={isTop3 ? 22 : 15} strokeWidth={2.5} /> : null}
        <span
          className={
            RankIcon
              ? `leading-none ${isTop3 ? 'mt-1 text-[11px]' : 'mt-0.5 text-[10px]'}`
              : 'text-sm'
          }
        >
          #{rank}
        </span>
      </div>

      {/* Name + claim */}
      <div className="min-w-0 flex-1">
        {top && (
          <span
            className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider ${top.labelCls}`}
          >
            {top.label}
          </span>
        )}
        <div
          className={`truncate font-bold text-zinc-900 leading-tight ${
            isTop3 ? 'text-lg font-black' : ''
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
