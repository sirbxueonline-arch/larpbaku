'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

type Mode = 'login' | 'signup'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
// Supabase rejects .local / .test / .invalid as domains. Use the real
// project domain — no real email is ever sent to these addresses
// (email confirmation must stay off in Supabase auth settings).
const SYNTH_DOMAIN = 'larpbaku.com'

function synthEmail(username: string) {
  return `${username.trim().toLowerCase()}@${SYNTH_DOMAIN}`
}

export default function AuthModal({
  open,
  initialMode = 'login',
  onClose,
}: {
  open: boolean
  initialMode?: Mode
  onClose: () => void
}) {
  const { refreshProfile } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setUsername('')
      setPassword('')
      setError(null)
    }
  }, [open, initialMode])

  // Close on escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const u = username.trim().toLowerCase()
    if (!USERNAME_RE.test(u)) {
      setError('Username: 3–20 chars, letters/numbers/underscore only.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: synthEmail(u),
          password,
        })
        if (error) {
          setError(
            error.message.toLowerCase().includes('already')
              ? 'That username is taken.'
              : error.message,
          )
          return
        }
        const userId = data.user?.id
        if (userId) {
          const { error: profileErr } = await supabase
            .from('profiles')
            .insert({ user_id: userId, username: u })
          if (profileErr) {
            setError(
              profileErr.message.toLowerCase().includes('duplicate') ||
                profileErr.message.toLowerCase().includes('unique')
                ? 'That username is taken.'
                : 'Signup partially failed. Try logging in.',
            )
            return
          }

          // Claim any anonymous larps with the same name via a
          // SECURITY DEFINER RPC — needed because there's no public
          // RLS UPDATE policy on larps, so a direct .update() would
          // succeed-but-affect-zero-rows.
          await supabase.rpc('claim_larps_for_user')
        }
        await refreshProfile()
        // Tell the leaderboard to refetch with the new join data so
        // the freshly-claimed entry picks up the avatar/bio/socials.
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('larps:refetch'))
        }
        onClose()
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: synthEmail(u),
          password,
        })
        if (error) {
          setError(
            error.message.toLowerCase().includes('invalid')
              ? 'Wrong username or password.'
              : error.message,
          )
          return
        }
        await refreshProfile()
        onClose()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl bg-zinc-100 p-1">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                setError(null)
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${
                mode === m
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="iska"
              autoCapitalize="off"
              autoComplete="username"
              spellCheck={false}
              minLength={3}
              maxLength={20}
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 transition focus:border-az-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-az-blue/20"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 transition focus:border-az-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-az-blue/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-xl bg-az-blue px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? '…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          {mode === 'signup' && (
            <p className="text-[11px] text-zinc-500 leading-snug">
              No email required. Pick a username and remember it — there&apos;s no
              password recovery.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
