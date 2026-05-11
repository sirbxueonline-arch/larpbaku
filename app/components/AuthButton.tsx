'use client'

import { useState } from 'react'
import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from './AuthProvider'
import AuthModal from './AuthModal'

export default function AuthButton() {
  const { session, username, loading, signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login')

  if (loading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-200" />
    )
  }

  if (session && username) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-900 shadow-sm">
          <User size={14} strokeWidth={2.5} />@{username}
        </span>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:border-az-red hover:text-az-red"
        >
          <LogOut size={14} strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setModalMode('login')
            setModalOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-700 transition hover:border-az-blue hover:text-az-blue"
        >
          <LogIn size={14} strokeWidth={2.5} />
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setModalMode('signup')
            setModalOpen(true)
          }}
          className="rounded-xl bg-az-blue px-3 py-2 text-sm font-bold text-white transition hover:brightness-110"
        >
          Sign up
        </button>
      </div>
      <AuthModal
        open={modalOpen}
        initialMode={modalMode}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
