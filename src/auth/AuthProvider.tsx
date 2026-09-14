import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './authContext'

// Google (or any OAuth provider) lets anyone with an account sign in, not just the app's
// owner. RLS still fully isolates data per user_id, so a stranger could never see the
// owner's data — but for a single-user app there's no reason to let anyone else create an
// account at all, so reject and sign out anyone whose email doesn't match this one.
const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL as string | undefined

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    async function applySession(newSession: Session | null) {
      if (newSession && allowedEmail && newSession.user.email?.toLowerCase() !== allowedEmail.toLowerCase()) {
        await supabase.auth.signOut()
        setSession(null)
        setAuthError('This app is private — that account is not authorized to sign in.')
        setLoading(false)
        return
      }
      setSession(newSession)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applySession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, authError }}>
      {children}
    </AuthContext.Provider>
  )
}
