'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Crown, Medal, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import type { Larp } from '@/lib/types'
import ShareButton from './ShareButton'
import Avatar from './Avatar'

type Vote = 'up' | 'down'

const TOP3 = [
  {
    // 1st — gold
    ring: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.55)]',
    pill: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500',
    card: 'border-2 border-amber-300 bg-white shadow-[0_6px_24px_-8px_rgba(245,158,11,0.3)]',
    icon: Crown,
  },
  {
    // 2nd — silver
    ring: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[0_4px_16px_-4px_rgba(100,116,139,0.45)]',
    pill: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
    card: 'border-2 border-slate-300 bg-white shadow-[0_6px_22px_-8px_rgba(100,116,139,0.22)]',
    icon: Medal,
  },
  {
    // 3rd — bronze
    ring: 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-700 shadow-[0_4px_16px_-4px_rgba(234,88,12,0.45)]',
    pill: 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-700',
    card: 'border-2 border-orange-300 bg-white shadow-[0_6px_22px_-8px_rgba(234,88,12,0.22)]',
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
  const score = larp.upvotes - larp.downvotes
  const isTop3 = rank <= 3
  const top = isTop3 ? TOP3[rank - 1] : null
  // Display every entry as a handle ("@name") regardless of verified status.
  const displayName = `@${larp.name}`

  const cardCls = top
    ? `border bg-white ${top.card}`
    : 'border border-zinc-200 bg-white shadow-sm'

  const RankIcon = top?.icon ?? null

  return (
    <li
      className={`relative flex items-center gap-3 rounded-2xl px-4 transition-all duration-200 ${
        isTop3 ? 'py-4 hover:scale-[1.01]' : 'py-3.5 hover:scale-[1.005]'
      } ${cardCls}`}
    >
      {/* Framed avatar + corner rank badge */}
      <div className="relative shrink-0">
        {/* Gradient ring frame */}
        <div
          className={`rounded-full ${
            top
              ? `p-1 ${top.ring}`
              : 'p-[2px] bg-gradient-to-br from-zinc-200 to-zinc-300'
          }`}
        >
          {/* White spacer so the gradient reads as a frame */}
          <div className="rounded-full bg-white p-0.5">
            <Avatar
              url={larp.profiles?.avatar_url}
              username={larp.profiles?.username ?? larp.name}
              size="md"
              bare
            />
          </div>
        </div>

        {/* Rank badge at bottom-right corner of the avatar */}
        <div
          className={`absolute bottom-0 right-0 flex h-5 min-w-[20px] items-center justify-center gap-0.5 rounded-full px-1 ring-2 ring-white shadow-md translate-x-1 translate-y-1 ${
            top ? `${top.pill} text-white` : 'bg-zinc-900 text-white'
          }`}
        >
          {RankIcon ? (
            <RankIcon
              size={11}
              strokeWidth={3}
              className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
            />
          ) : (
            <span className="text-[9px] font-black tabular-nums leading-none px-0.5">
              {rank}
            </span>
          )}
        </div>
      </div>

      {/* Name + claim (link to detail page) */}
      <Link
        href={`/larp/${larp.id}`}
        className="group min-w-0 flex-1"
        aria-label={`Open ${displayName}'s page`}
      >
        <div
          className={`flex items-center gap-1 truncate font-black text-zinc-900 leading-tight group-hover:text-az-blue transition-colors ${
            isTop3 ? 'text-base' : 'font-bold'
          }`}
        >
          <span className="truncate">{displayName}</span>
          {larp.user_id && (
            <BadgeCheck
              size={14}
              strokeWidth={2.5}
              className="shrink-0 text-az-blue"
              aria-label="Verified account"
            />
          )}
        </div>
        <div className="truncate text-sm text-zinc-500 mt-0.5">{larp.claim}</div>
      </Link>

      {/* Share */}
      <ShareButton larpId={larp.id} name={displayName} rank={rank} />

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

        {/* Net score */}
        <AnimatePresence mode="wait">
          <motion.div
            key={score}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`w-12 text-center text-base font-black tabular-nums ${
              score > 0 ? 'text-az-green' : score < 0 ? 'text-az-red' : 'text-zinc-400'
            }`}
          >
            {score > 0 ? '+' : ''}{score}
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
