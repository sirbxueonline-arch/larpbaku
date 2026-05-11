/* eslint-disable @next/next/no-img-element */
import { Phone } from 'lucide-react'

/**
 * House ad — runs while AdSense is in review. Drop the two jersey
 * images into `public/ads/` with the filenames below.
 */
const JERSEY_QARABAG = '/ads/jersey-qarabag.jpg'
const JERSEY_NEFTCI = '/ads/jersey-neftci.jpg'

// Display number with spaces; tel: link uses digits only (with country code).
const PHONE_DISPLAY = '+994 50 235 24 00'
const PHONE_TEL = '+994502352400'

export default function SponsoredCard() {
  return (
    <aside className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-sm">
      {/* Sponsored ribbon */}
      <div className="absolute left-3 top-3 z-10 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
        Sponsored
      </div>

      {/* Two jerseys side by side */}
      <div className="grid grid-cols-2 gap-px bg-zinc-100">
        <img
          src={JERSEY_QARABAG}
          alt="Signed Qarabağ Azersun jersey"
          className="aspect-square w-full bg-white object-cover"
        />
        <img
          src={JERSEY_NEFTCI}
          alt="Signed Neftçi SOCAR jersey"
          className="aspect-square w-full bg-white object-cover"
        />
      </div>

      {/* Caption + CTA */}
      <div className="p-4">
        <h3 className="text-lg font-black leading-tight text-zinc-900">
          Signed jerseys for sale
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Qarabağ & Neftçi — authentic full-squad signatures. Limited pieces.
        </p>
        <a
          href={`tel:${PHONE_TEL}`}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.99]"
        >
          <Phone size={14} strokeWidth={2.5} />
          {PHONE_DISPLAY}
        </a>
      </div>
    </aside>
  )
}
