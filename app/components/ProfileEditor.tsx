'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import Avatar from './Avatar'

const BIO_MAX = 200
const MAX_BYTES = 2 * 1024 * 1024 // 2MB
const HANDLE_RE = /^[a-zA-Z0-9._]*$/

function cleanHandle(s: string) {
  return s.trim().replace(/^@+/, '').toLowerCase()
}

export default function ProfileEditor({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { session, profile, refreshProfile } = useAuth()
  const [bio, setBio] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [instagram, setInstagram] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setBio(profile?.bio ?? '')
      setTiktok(profile?.tiktok ?? '')
      setInstagram(profile?.instagram ?? '')
      setAvatarPreview(profile?.avatar_url ?? null)
      setError(null)
    }
  }, [open, profile])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('That file isn\'t an image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image too large — keep it under 2 MB.')
      return
    }
    if (!session) {
      setError('You need to be logged in.')
      return
    }
    setError(null)
    setBusy(true)

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${session.user.id}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) {
      setError(`Upload failed: ${upErr.message}`)
      setAvatarPreview(profile?.avatar_url ?? null)
      setBusy(false)
      return
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = pub.publicUrl

    const { error: profErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', session.user.id)
    if (profErr) {
      setError(`Profile update failed: ${profErr.message}`)
      setBusy(false)
      return
    }

    await refreshProfile()
    setBusy(false)
  }

  async function saveBio(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    setError(null)
    const tk = cleanHandle(tiktok)
    const ig = cleanHandle(instagram)
    if (tk && (tk.length > 24 || !HANDLE_RE.test(tk))) {
      setError('TikTok: letters, numbers, dots, underscores. Max 24 chars.')
      return
    }
    if (ig && (ig.length > 30 || !HANDLE_RE.test(ig))) {
      setError('Instagram: letters, numbers, dots, underscores. Max 30 chars.')
      return
    }
    setBusy(true)
    const trimmed = bio.trim().slice(0, BIO_MAX)
    const { error: err } = await supabase
      .from('profiles')
      .update({
        bio: trimmed || null,
        tiktok: tk || null,
        instagram: ig || null,
      })
      .eq('user_id', session.user.id)
    if (err) {
      setError(err.message)
    } else {
      await refreshProfile()
      onClose()
    }
    setBusy(false)
  }

  if (!open || !profile) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
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

        <h2 className="text-xl font-black text-zinc-900">Edit profile</h2>
        <p className="mt-1 text-sm text-zinc-500">
          @{profile.username}
        </p>

        {/* Avatar */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Avatar url={avatarPreview} username={profile.username} size="xl" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:border-az-blue hover:text-az-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={13} strokeWidth={2.5} />
            {avatarPreview ? 'Change photo' : 'Upload photo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {/* Bio */}
        <form onSubmit={saveBio} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Bio
              <span className="tabular-nums text-zinc-400">
                {bio.length}/{BIO_MAX}
              </span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              placeholder="Tell the city who you really are."
              rows={3}
              maxLength={BIO_MAX}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder-zinc-400 transition focus:border-az-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-az-blue/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              TikTok
            </label>
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 transition focus-within:border-az-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-az-blue/20">
              <span className="text-sm font-bold text-zinc-400">@</span>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value.replace(/^@+/, ''))}
                placeholder="larpbaku"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={24}
                className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Instagram
            </label>
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 transition focus-within:border-az-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-az-blue/20">
              <span className="text-sm font-bold text-zinc-400">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/^@+/, ''))}
                placeholder="larpbaku"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={30}
                className="flex-1 bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-az-blue px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? '…' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
