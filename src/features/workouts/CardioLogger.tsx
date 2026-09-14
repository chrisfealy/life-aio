import { useState } from 'react'
import { useCardioLog } from './useCardioLog'
import type { Database } from '../../types/database.types'

type CardioLogRow = Database['public']['Tables']['cardio_logs']['Row']

export function CardioLogger({ workoutId }: { workoutId: string }) {
  const { data: existing, isLoading, save } = useCardioLog(workoutId)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800">Cardio</h3>
      {/* Remounts once the existing log finishes loading so its initial values reflect
          the fetched row without an effect+setState sync. */}
      <CardioForm
        key={isLoading ? 'loading' : existing?.id ?? 'new'}
        existing={existing ?? null}
        saving={save.isPending}
        onSave={(input) => save.mutate(input)}
      />
    </div>
  )
}

function CardioForm({
  existing,
  saving,
  onSave,
}: {
  existing: CardioLogRow | null
  saving: boolean
  onSave: (input: {
    exerciseId: string | null
    durationSeconds: number | null
    distance: number | null
    distanceUnit: string
    calories: number | null
    avgHeartRate: number | null
  }) => void
}) {
  const [duration, setDuration] = useState(existing?.duration_seconds ? (existing.duration_seconds / 60).toString() : '')
  const [distance, setDistance] = useState(existing?.distance?.toString() ?? '')
  const [distanceUnit, setDistanceUnit] = useState(existing?.distance_unit ?? 'mi')
  const [calories, setCalories] = useState(existing?.calories?.toString() ?? '')
  const [heartRate, setHeartRate] = useState(existing?.avg_heart_rate?.toString() ?? '')

  function handleSave() {
    onSave({
      exerciseId: null,
      durationSeconds: duration === '' ? null : Math.round(Number(duration) * 60),
      distance: distance === '' ? null : Number(distance),
      distanceUnit,
      calories: calories === '' ? null : Number(calories),
      avgHeartRate: heartRate === '' ? null : Number(heartRate),
    })
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-slate-500">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Distance</label>
          <div className="mt-1 flex gap-1">
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="rounded-md border border-slate-300 px-1 text-sm"
            >
              <option value="mi">mi</option>
              <option value="km">km</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Calories</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Avg HR</label>
          <input
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </>
  )
}
