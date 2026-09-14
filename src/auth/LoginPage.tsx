import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { session, loading, authError } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  async function handleGoogleSignIn() {
    setSigningIn(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      setSigningIn(false)
      setErrorMessage(error.message)
    }
    // On success the browser navigates away to Google, so no further state change here.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">life-aio</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue.</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <GoogleIcon />
          {signingIn ? 'Redirecting…' : 'Sign in with Google'}
        </button>

        {(errorMessage || authError) && <p className="mt-3 text-sm text-red-600">{errorMessage || authError}</p>}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.6 2.5-7.6 2.5-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.9 39.7 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.5 5.5C41.4 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}
