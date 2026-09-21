import { useState } from 'react'
import { DragHandle, type DragHandleProps } from '../../components/ui/SortableItem'
import type { Database } from '../../types/database.types'
import { estimateOneRepMax } from './oneRepMax'
import { useLastSessionSets, useWorkoutSets } from './useWorkoutSets'

type Exercise = Database['public']['Tables']['exercises']['Row']
type WorkoutSet = Database['public']['Tables']['workout_sets']['Row']

export function ExerciseBlock({
  workoutId,
  exercise,
  sets,
  onSwap,
  onDelete,
  dragHandleProps,
}: {
  workoutId: string
  exercise: Exercise
  sets: WorkoutSet[]
  onSwap?: () => void
  onDelete?: () => void
  dragHandleProps?: DragHandleProps
}) {
  const { addSet, updateSet, removeSet } = useWorkoutSets(workoutId)
  const { data: lastSessionSets } = useLastSessionSets(exercise.id, workoutId)

  const nextSetNumber = sets.length + 1
  const prefillSet = lastSessionSets?.[Math.min(sets.length, (lastSessionSets?.length ?? 1) - 1)]

  // Warm-up and working sets are numbered in their own separate sequences (W1, W2… / 1, 2…) so
  // pre-filled warm-ups from a program plan read distinctly from the actual working sets.
  let warmupCount = 0
  let workCount = 0
  const setLabels = sets.map((set) => (set.is_warmup ? `W${++warmupCount}` : `${++workCount}`))

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragHandleProps && <DragHandle {...dragHandleProps} />}
          <h3 className="text-sm font-semibold text-slate-800">{exercise.name}</h3>
        </div>
        <span className="flex gap-3 text-xs">
          {onSwap && (
            <button onClick={onSwap} className="text-slate-400 hover:text-slate-900">
              Swap for this session
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-slate-300 hover:text-red-600">
              Delete
            </button>
          )}
        </span>
      </div>

      {sets.length > 0 && (
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="py-1 font-medium">Set</th>
              <th className="py-1 font-medium">Weight</th>
              <th className="py-1 font-medium">Reps</th>
              <th className="py-1 font-medium">Est. 1RM</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {setLabels.map((label, i) => {
              const set = sets[i]
              return (
              <tr key={set.id} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-500">{label}</td>
                <td className="py-1.5">
                  <input
                    type="number"
                    defaultValue={set.weight ?? ''}
                    onBlur={(e) =>
                      updateSet.mutate({
                        setId: set.id,
                        weight: e.target.value === '' ? null : Number(e.target.value),
                        reps: set.reps,
                      })
                    }
                    className="w-16 rounded border border-slate-200 px-1.5 py-0.5"
                  />
                </td>
                <td className="py-1.5">
                  <input
                    type="number"
                    defaultValue={set.reps ?? ''}
                    onBlur={(e) =>
                      updateSet.mutate({
                        setId: set.id,
                        weight: set.weight,
                        reps: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-16 rounded border border-slate-200 px-1.5 py-0.5"
                  />
                </td>
                <td className="py-1.5 text-slate-500">
                  {set.weight && set.reps ? estimateOneRepMax(set.weight, set.reps).toFixed(0) : '—'}
                </td>
                <td className="py-1.5 text-right">
                  <button onClick={() => removeSet.mutate(set.id)} className="text-xs text-slate-300 hover:text-red-600">
                    ✕
                  </button>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {/* Keyed by set number so the row's typed-but-not-submitted input clears between sets. */}
      <AddSetRow
        key={nextSetNumber}
        nextSetNumber={nextSetNumber}
        prefillWeight={prefillSet?.weight ?? null}
        prefillReps={prefillSet?.reps ?? null}
        submitting={addSet.isPending}
        onAdd={(weight, reps) => addSet.mutate({ exerciseId: exercise.id, setNumber: nextSetNumber, weight, reps })}
      />
    </div>
  )
}

function AddSetRow({
  nextSetNumber,
  prefillWeight,
  prefillReps,
  submitting,
  onAdd,
}: {
  nextSetNumber: number
  prefillWeight: number | null
  prefillReps: number | null
  submitting: boolean
  onAdd: (weight: number | null, reps: number | null) => void
}) {
  // Prior weight/reps for this exercise are shown as a placeholder hint only — the field
  // itself starts blank, so a set is only ever recorded with a value the user actually entered.
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  function handleAddSet() {
    onAdd(weight === '' ? null : Number(weight), reps === '' ? null : Number(reps))
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder={prefillWeight?.toString() ?? ''}
        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        placeholder={prefillReps?.toString() ?? ''}
        className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
      />
      <button
        onClick={handleAddSet}
        disabled={submitting}
        className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        Add set {nextSetNumber}
      </button>
    </div>
  )
}
