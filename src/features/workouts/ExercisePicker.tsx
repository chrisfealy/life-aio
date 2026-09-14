import { useMemo, useState } from 'react'
import type { Database, ExerciseType } from '../../types/database.types'
import { useExercises } from './useExercises'

type Exercise = Database['public']['Tables']['exercises']['Row']

export function ExercisePicker({
  exerciseType,
  onPick,
  onClose,
}: {
  exerciseType: ExerciseType
  onPick: (exercise: Exercise) => void
  onClose: () => void
}) {
  const { data: exercises, isLoading, createCustom } = useExercises()
  const [search, setSearch] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('full_body')

  const filtered = useMemo(() => {
    return (exercises ?? [])
      .filter((e) => e.exercise_type === exerciseType)
      .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
  }, [exercises, exerciseType, search])

  async function handleCreateCustom() {
    if (!customName.trim()) return
    const created = await createCustom.mutateAsync({
      name: customName.trim(),
      category: customCategory,
      exercise_type: exerciseType,
    })
    onPick(created)
  }

  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center bg-black/30 p-4 pt-16" onClick={onClose}>
      <div
        className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />

        {isLoading ? (
          <p className="mt-3 text-sm text-slate-400">Loading…</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {filtered.map((exercise) => (
              <li key={exercise.id}>
                <button
                  onClick={() => onPick(exercise)}
                  className="flex w-full items-center justify-between py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="text-slate-800">{exercise.name}</span>
                  <span className="text-xs text-slate-400">{exercise.category.replace('_', ' ')}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <p className="py-3 text-sm text-slate-400">No matches.</p>}
          </ul>
        )}

        <div className="mt-3 border-t border-slate-100 pt-3">
          {!showCustomForm ? (
            <button onClick={() => setShowCustomForm(true)} className="text-sm text-slate-500 underline hover:text-slate-900">
              + Add custom exercise
            </button>
          ) : (
            <div className="space-y-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Exercise name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio'].map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateCustom}
                disabled={createCustom.isPending}
                className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Add and select
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
