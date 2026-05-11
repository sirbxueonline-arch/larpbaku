/* eslint-disable @next/next/no-img-element */
'use client'

const SIZES = {
  sm: { box: 'h-7 w-7', text: 'text-[11px]' },
  md: { box: 'h-10 w-10', text: 'text-sm' },
  lg: { box: 'h-16 w-16', text: 'text-xl' },
  xl: { box: 'h-24 w-24', text: 'text-3xl' },
} as const

export default function Avatar({
  url,
  username,
  size = 'md',
  className = '',
  bare = false,
}: {
  url?: string | null
  username?: string | null
  size?: keyof typeof SIZES
  className?: string
  /** Omit the default white ring + shadow — useful when wrapping in a frame. */
  bare?: boolean
}) {
  const s = SIZES[size]
  const initial = username?.[0]?.toUpperCase() ?? '?'
  const decoration = bare ? '' : 'ring-2 ring-white shadow-sm'

  if (url) {
    return (
      <img
        src={url}
        alt={username ? `${username}'s avatar` : 'avatar'}
        className={`${s.box} shrink-0 rounded-full object-cover ${decoration} ${className}`}
      />
    )
  }

  return (
    <div
      aria-label={username ? `${username}'s avatar` : 'avatar'}
      className={`${s.box} ${s.text} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 font-black text-zinc-600 ${decoration} ${className}`}
    >
      {initial}
    </div>
  )
}
