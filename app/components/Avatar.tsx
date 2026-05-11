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
}: {
  url?: string | null
  username?: string | null
  size?: keyof typeof SIZES
  className?: string
}) {
  const s = SIZES[size]
  const initial = username?.[0]?.toUpperCase() ?? '?'

  if (url) {
    return (
      <img
        src={url}
        alt={username ? `${username}'s avatar` : 'avatar'}
        className={`${s.box} shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    )
  }

  return (
    <div
      aria-label={username ? `${username}'s avatar` : 'avatar'}
      className={`${s.box} ${s.text} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 font-black text-zinc-600 ring-2 ring-white shadow-sm ${className}`}
    >
      {initial}
    </div>
  )
}
