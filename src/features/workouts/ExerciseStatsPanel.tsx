import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useExerciseStats } from './useExerciseStats'
import { useExercises } from './useExercises'

export function ExerciseStatsPanel() {
  const { data: exercises } = useExercises()
  const [exerciseId, setExerciseId] = useState<string>('')
  const { data: stats } = useExerciseStats(exerciseId || null)

  const strengthExercises = (exercises ?? []).filter((e) => e.exercise_type === 'strength')

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">Exercise stats</h2>
      <select
        value={exerciseId}
        onChange={(e) => setExerciseId(e.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      >
        <option value="">Select an exercise…</option>
        {strengthExercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      {stats && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xs text-slate-400">Heaviest weight</p>
              <p className="font-semibold text-slate-900">{stats.heaviestWeight ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Best est. 1RM</p>
              <p className="font-semibold text-slate-900">{stats.bestEstOneRepMax?.toFixed(0) ?? '—'}</p>
            </div>
          </div>

          {stats.sessions.length > 0 && (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.sessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="estOneRepMax" name="Est. 1RM" stroke="#0f172a" dot={false} />
                  <Line type="monotone" dataKey="volume" name="Volume" stroke="#94a3b8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {stats.repPRs.size > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500">Rep records</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {Array.from(stats.repPRs.entries())
                  .sort((a, b) => a[0] - b[0])
                  .map(([reps, weight]) => (
                    <span key={reps} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {reps} reps @ {weight}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
