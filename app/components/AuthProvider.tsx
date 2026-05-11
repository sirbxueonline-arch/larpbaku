'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type AuthState = {
  session: Session | null
  username: string | null
  loading: boolean
  refreshUsername: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  username: null,
  loading: true,
  refreshUsername: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUsername = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setUsername(null)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle()
    setUsername((data as { username: string } | null)?.username ?? null)
  }, [])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      await loadUsername(data.session?.user.id)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mounted) return
      setSession(sess)
      await loadUsername(sess?.user.id)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUsername])

  const refreshUsername = useCallback(
    () => loadUsername(session?.user.id),
    [loadUsername, session?.user.id],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, username, loading, refreshUsername, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
