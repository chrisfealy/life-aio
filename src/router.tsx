import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from './auth/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard'
import { FinancePage } from './features/finance/FinancePage'
import { HabitsList } from './features/habits/HabitsList'
import { JournalPage } from './features/journal/JournalPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { WorkoutsHome } from './features/workouts/WorkoutsHome'
import { WorkoutSessionPage } from './features/workouts/WorkoutSessionPage'
import { todayISO } from './utils/dates'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to={`/day/${todayISO()}`} replace /> },
          { path: 'day/:date', element: <JournalPage /> },
          { path: 'habits', element: <HabitsList /> },
          { path: 'workouts', element: <WorkoutsHome /> },
          { path: 'workouts/:workoutId', element: <WorkoutSessionPage /> },
          { path: 'finance', element: <FinancePage /> },
          { path: 'analytics', element: <AnalyticsDashboard /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
])
