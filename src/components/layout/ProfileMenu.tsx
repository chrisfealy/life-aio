import { LogOut, Settings, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function ProfileMenu() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {user?.email && <p className="truncate border-b border-slate-100 px-3 py-2 text-xs text-slate-400">{user.email}</p>}
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
