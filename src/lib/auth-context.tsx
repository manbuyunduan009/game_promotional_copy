import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from '@/lib/auth'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

async function loadProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,role,plan')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Profile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return

      if (error) {
        setSession(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setSession(data.session)
      if (data.session?.user) {
        try {
          setProfile(await loadProfile(data.session.user.id))
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    }

    initializeAuth()

    if (!supabase) {
      return () => {
        mounted = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession?.user) {
        setProfile(null)
        return
      }

      loadProfile(nextSession.user.id)
        .then(setProfile)
        .catch(() => setProfile(null))
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isConfigured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      async signIn(email, password) {
        if (!supabase) {
          throw new Error('Supabase 尚未配置。请先创建 .env.local 并填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_KEY。')
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      async signUp(email, password, metadata) {
        if (!supabase) {
          throw new Error('Supabase 尚未配置。请先创建 .env.local 并填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_PUBLISHABLE_KEY。')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        })

        if (error) throw error
        return Boolean(data.session)
      },
      async signOut() {
        if (!supabase) return
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [loading, profile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
