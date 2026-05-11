import { createContext, useContext } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/types'

export type AuthContextValue = {
  isConfigured: boolean
  loading: boolean
  session: Session | null
  user: SupabaseUser | null
  profile: Profile | null
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth 必须在 AuthProvider 内使用。')
  }
  return value
}
