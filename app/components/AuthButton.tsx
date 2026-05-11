'use client'

import { useEffect, useRef, useState } from 'react'
import { LogIn, LogOut, Pencil, ChevronDown } from 'lucide-react'
import { useAuth } from './AuthProvider'
import AuthModal from './AuthModal'
import ProfileEditor from './ProfileEditor'
import Avatar from './Avatar'

export default function AuthButton() {
  const { session, profile, loading, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [editorOpen, setEditorOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-200" />
  }

  if (session && profile) {
    return (
      <>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-zinc-900 shadow-sm transition hover:border-az-blue"
          >
            <Avatar url={profile.avatar_url} username={profile.username} size="sm" />
            @{profile.username}
            <ChevronDown size={13} strokeWidth={2.5} className="text-zinc-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setEditorOpen(true)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Pencil size={13} strokeWidth={2.5} />
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  signOut()
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-az-red hover:bg-az-red/5"
              >
                <LogOut size={13} strokeWidth={2.5} />
                Sign out
              </button>
            </div>
          )}
        </div>
        <ProfileEditor open={editorOpen} onClose={() => setEditorOpen(false)} />
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setAuthMode('login')
            setAuthOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 transition hover:border-az-blue hover:text-az-blue"
        >
          <LogIn size={14} strokeWidth={2.5} />
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('signup')
            setAuthOpen(true)
          }}
          className="rounded-xl bg-az-blue px-3 py-2 text-sm font-bold text-white transition hover:brightness-110"
        >
          Sign up
        </button>
      </div>
      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  )
}
