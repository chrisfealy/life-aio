import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:pb-6">
        <Outlet />
      </main>
    </div>
  )
}
