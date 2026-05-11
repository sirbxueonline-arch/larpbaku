'use client'

import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT } from '@/lib/adsense'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

export default function AdSlot({
  slot,
  className,
  format = 'auto',
}: {
  slot: string
  className?: string
  format?: string
}) {
  const pushed = useRef(false)

  useEffect(() => {
    // Only push when an <ins> will actually render. Without this guard,
    // an empty-slot AdSlot would still call adsbygoogle.push(), which
    // triggers a "No slot size for availableWidth=0" error in the console.
    if (!slot || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {}
  }, [slot])

  if (!slot) return null

  return (
    <ins
      className={`adsbygoogle block ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
