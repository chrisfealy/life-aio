import { BarChart3, CheckSquare, Dumbbell, NotebookPen, Wallet, type LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { todayISO } from '../../utils/dates'
import { ProfileMenu } from './ProfileMenu'

type NavItem = { to: string; label: string; icon: LucideIcon; match: (pathname: string) => boolean }

function getLinks(): NavItem[] {
  return [
    // Recomputed per render (not a module-level constant) so it still points at "today" if
    // the app is left open across midnight.
    { to: `/day/${todayISO()}`, label: 'Journal', icon: NotebookPen, match: (p) => p.startsWith('/day') },
    { to: '/habits', label: 'Habits', icon: CheckSquare, match: (p) => p.startsWith('/habits') },
    { to: '/workouts', label: 'Workouts', icon: Dumbbell, match: (p) => p.startsWith('/workouts') },
    { to: '/finance', label: 'Finance', icon: Wallet, match: (p) => p.startsWith('/finance') },
    { to: '/analytics', label: 'Analytics', icon: BarChart3, match: (p) => p.startsWith('/analytics') },
  ]
}

export function NavBar() {
  const { pathname } = useLocation()
  const links = getLinks()

  return (
    <>
      {/* Slim top bar: profile menu only. Primary nav lives in the top bar on larger screens
          and the bottom tab bar (thumb-reachable) on phones. */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:py-3">
          <nav className="hidden gap-1 sm:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                  link.match(pathname) ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto">
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Bottom tab bar: phones only. */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto flex max-w-5xl">
          {links.map((link) => {
            const active = link.match(pathname)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <link.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {link.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
