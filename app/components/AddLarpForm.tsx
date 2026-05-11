'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const NAME_MAX = 50
const CLAIM_MAX = 120

export default function AddLarpForm() {
  const [name, setName] = useState('')
  const [claim, setClaim] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim(), c = claim.trim()
    if (!n || !c) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/larps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, claim: c }),
      })
      if (res.ok) {
        setName('')
        setClaim('')
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        if (data?.error === 'rate_limited') {
          setError('You just added one — wait a few minutes before adding another.')
        } else if (data?.error === 'invalid_body') {
          setError('Name or claim is too long. Trim it down.')
        } else {
          setError('Could not add. Try again in a moment.')
        }
      }
    } catch {
      setError('Network error. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = name.trim().length > 0 && claim.trim().length > 0 && !busy

  return (
    <form onSubmit={submit} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Name input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={NAME_MAX}
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 transition focus:border-az-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-az-blue/20"
          />
          {name.length > 30 && (
            <span className="absolute right-3 bottom-2.5 text-[10px] tabular-nums text-zinc-400">
              {name.length}/{NAME_MAX}
            </span>
          )}
        </div>

        {/* Claim input */}
        <div className="relative flex-[2]">
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Your larp (e.g. I own 3 Lambos)"
            maxLength={CLAIM_MAX}
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 transition focus:border-az-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-az-blue/20"
          />
          {claim.length > 60 && (
            <span className="absolute right-3 bottom-2.5 text-[10px] tabular-nums text-zinc-400">
              {claim.length}/{CLAIM_MAX}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-az-blue px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={15} strokeWidth={2.5} />
          {busy ? 'Adding…' : 'Add'}
        </button>
      </div>

      {error && (
        <p className="mt-2.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
