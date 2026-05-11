/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

/**
 * House ad — runs while AdSense is in review. Drop the two jersey
 * images into `public/ads/` with the filenames below.
 */
const JERSEY_QARABAG = '/ads/jersey-qarabag.jpg'
const JERSEY_NEFTCI = '/ads/jersey-neftci.jpg'

const CTA_HREF = 'https://www.tiktok.com/@larpbaku'

export default function SponsoredCard() {
  return (
    <aside className="relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white shadow-sm">
      {/* Sponsored ribbon — required by AdSense policy on ad placements */}
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
          Signed Qarabağ & Neftçi jerseys
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Authentic, full squad signatures. Limited pieces — DM to buy.
        </p>
        <Link
          href={CTA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-800"
        >
          DM @larpbaku on TikTok →
        </Link>
      </div>
    </aside>
  )
}
