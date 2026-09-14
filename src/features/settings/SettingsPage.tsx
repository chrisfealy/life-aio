import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function SettingsPage() {
  const { user } = useAuth()
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const fullName = user?.user_metadata?.full_name as string | undefined

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-900">Settings</h1>

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{fullName ?? user?.email}</p>
          {fullName && <p className="truncate text-xs text-slate-500">{user?.email}</p>}
        </div>
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  )
}
