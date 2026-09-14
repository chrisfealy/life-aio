import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  authError: string | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
