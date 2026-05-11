'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({
  larpId,
  name,
  rank,
}: {
  larpId: string
  name: string
  rank: number
}) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/larp/${larpId}`
        : `/larp/${larpId}`
    const title = `${name} — #${rank} on Baku Larp`

    // Pass ONLY the url field — no `text`. Some share targets concatenate
    // text + url together with a space, which produced links like
    //   larpbaku.com/larp/<id>%20<message>%20https://larpbaku.com/larp/<id>
    // that 404. The OG image already shows the name/rank/claim when the
    // URL is previewed, so the descriptive text is redundant anyway.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this larp"
      title={copied ? 'Link copied!' : 'Share'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition active:scale-95 ${
        copied
          ? 'border-az-green bg-az-green/10 text-az-green'
          : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-az-blue hover:bg-az-blue/5 hover:text-az-blue'
      }`}
    >
      {copied ? (
        <Check size={14} strokeWidth={2.5} />
      ) : (
        <Share2 size={14} strokeWidth={2.5} />
      )}
    </button>
  )
}
