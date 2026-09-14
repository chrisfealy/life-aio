import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './authContext'

// Google (or any OAuth provider) lets anyone with an account sign in, not just the people
// this app is meant for. RLS still fully isolates each signed-in user's data from every
// other's, so a stranger could never see anyone else's data — but there's no reason to let
// just anyone create an account, so reject and sign out anyone whose email isn't allowlisted.
const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAILS as string | undefined)
  ?.split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    async function applySession(newSession: Session | null) {
      const email = newSession?.user.email?.toLowerCase()
      if (newSession && allowedEmails && allowedEmails.length > 0 && (!email || !allowedEmails.includes(email))) {
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
