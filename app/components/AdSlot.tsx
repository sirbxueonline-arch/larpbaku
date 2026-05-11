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
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {}
  }, [])

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
