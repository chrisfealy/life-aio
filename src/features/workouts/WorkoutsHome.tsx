import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatISO } from '../../utils/dates'
import { ExerciseLibraryPanel } from './ExerciseLibraryPanel'
import { ExerciseStatsPanel } from './ExerciseStatsPanel'
import { ProgramsPanel } from './ProgramsPanel'
import { useDeleteWorkout, useRecentWorkouts, useStartWorkout } from './useWorkouts'
import { usePrograms } from './usePrograms'

export function WorkoutsHome() {
  const { data: recent, isLoading } = useRecentWorkouts()
  const { data: programs } = usePrograms()
  const startWorkout = useStartWorkout()
  const deleteWorkout = useDeleteWorkout()
  const [libraryOpen, setLibraryOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Workouts</h1>
        <p className="text-sm text-slate-500">Log strength and cardio sessions, track programs, and see progress.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-4">
        <button
          onClick={() => startWorkout.mutate({ workoutType: 'strength' })}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Start freeform strength
        </button>
        <button
          onClick={() => startWorkout.mutate({ workoutType: 'cardio' })}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Start cardio session
        </button>
        {programs && programs.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) startWorkout.mutate({ workoutType: 'strength', programId: e.target.value })
              e.target.value = ''
            }}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-600"
            defaultValue=""
          >
            <option value="" disabled>
              Start from program…
            </option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Recent sessions</h2>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : !recent || recent.length === 0 ? (
          <p className="text-sm text-slate-400">No workouts logged yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2 text-sm hover:bg-slate-50">
                <Link to={`/workouts/${w.id}`} className="flex-1">
                  <span className="text-slate-800">
                    {(w.program as unknown as { name: string } | null)?.name ??
                      (w.workout_type === 'strength' ? 'Strength' : 'Cardio')}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">{formatISO(w.workout_date)}</span>
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Delete this workout session? This cannot be undone.')) deleteWorkout.mutate(w.id)
                  }}
                  className="text-xs text-slate-300 hover:text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ProgramsPanel />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Exercise library</h2>
          <button onClick={() => setLibraryOpen((v) => !v)} className="text-xs text-slate-500 underline hover:text-slate-900">
            {libraryOpen ? 'Hide' : 'View all exercises'}
          </button>
        </div>
        {libraryOpen && <ExerciseLibraryPanel />}
      </div>

      <ExerciseStatsPanel />
    </div>
  )
}
