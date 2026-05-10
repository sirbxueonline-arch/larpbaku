'use client'

import { useEffect, useRef } from 'react'

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
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const pushed = useRef(false)

  useEffect(() => {
    if (!client || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {}
  }, [client])

  if (!client || !slot) return null

  return (
    <ins
      className={`adsbygoogle block ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
