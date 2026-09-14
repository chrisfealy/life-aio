import { NavLink } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const links = [
  { to: '/', label: 'Journal', end: true },
  { to: '/habits', label: 'Habits' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/finance', label: 'Finance' },
  { to: '/analytics', label: 'Analytics' },
]

export function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">life-aio</span>
        <nav className="flex gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
