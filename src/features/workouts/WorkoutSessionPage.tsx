import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SortableItem } from '../../components/ui/SortableItem'
import { SortableList } from '../../components/ui/SortableList'
import { CardioLogger } from './CardioLogger'
import { ExerciseBlock } from './ExerciseBlock'
import { ExercisePicker } from './ExercisePicker'
import { RestTimer } from './RestTimer'
import { useProgramExercises } from './usePrograms'
import { useSessionPlan } from './useSessionPlan'
import { useExercises } from './useExercises'
import { useDeleteWorkout, useUpdateWorkoutDate, useUpdateWorkoutNotes, useWorkout } from './useWorkouts'
import { useWorkoutSets } from './useWorkoutSets'

export function WorkoutSessionPage() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { data: workout, isLoading } = useWorkout(workoutId)
  const { data: sets, reassignExercise } = useWorkoutSets(workoutId ?? '')
  const { data: exercises } = useExercises()
  // Legacy fallback only, for sessions started before planned_exercise_ids existed.
  const { data: programExercises } = useProgramExercises(workout?.program_id ?? null)
  const { addExercise, swapExercise, removeExercise, reorder } = useSessionPlan(workoutId ?? '')
  const updateNotes = useUpdateWorkoutNotes(workoutId ?? '')
  const updateDate = useUpdateWorkoutDate(workoutId ?? '')
  const deleteWorkout = useDeleteWorkout()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [swapTargetId, setSwapTargetId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  if (isLoading || !workout) return <p className="text-sm text-slate-400">Loading…</p>

  const allSets = sets ?? []
  const exerciseById = new Map((exercises ?? []).map((e) => [e.id, e]))

  const storedIds = workout.planned_exercise_ids ?? []
  let effectiveIds: string[]
  if (storedIds.length > 0) {
    effectiveIds = storedIds
  } else {
    // No persisted plan yet (a session started before this session-plan existed, or one with
    // no plan at all) — fall back to the program's current list plus whatever already has
    // sets logged, so nothing already entered appears to vanish.
    const seen = new Set<string>()
    effectiveIds = []
    for (const id of [...(programExercises ?? []).map((pe) => pe.exercise_id), ...allSets.map((s) => s.exercise_id)]) {
      if (!seen.has(id)) {
        seen.add(id)
        effectiveIds.push(id)
      }
    }
  }
  // Safety net: never drop an exercise that has logged sets, even if it's missing from the plan.
  const currentIds = [...effectiveIds, ...allSets.map((s) => s.exercise_id).filter((id) => !effectiveIds.includes(id))]

  const sessionExercises = currentIds.flatMap((id) => {
    const exercise = exerciseById.get(id)
    if (!exercise) return []
    return [{ exercise, sets: allSets.filter((s) => s.exercise_id === id) }]
  })

  function handleDelete() {
    if (!workoutId) return
    if (confirm('Delete this workout session? This cannot be undone.')) {
      deleteWorkout.mutate(workoutId)
      navigate('/workouts')
    }
  }

  function handleDeleteExercise(exerciseId: string, name: string) {
    if (!confirm(`Remove "${name}" from this session? Any sets logged for it will be deleted too.`)) return
    removeExercise.mutate({ currentIds, exerciseId })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {(workout.program as unknown as { name: string } | null)?.name ??
              `${workout.workout_type === 'strength' ? 'Strength' : 'Cardio'} workout`}
          </h1>
          <input
            type="date"
            defaultValue={workout.workout_date}
            onBlur={(e) => {
              if (e.target.value && e.target.value !== workout.workout_date) updateDate.mutate(e.target.value)
            }}
            className="mt-0.5 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-slate-500 hover:border-slate-300 focus:border-slate-300 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {workout.workout_type === 'strength' && <RestTimer />}
          <button onClick={handleDelete} className="text-xs text-slate-400 hover:text-red-600">
            Delete session
          </button>
        </div>
      </div>

      {workout.workout_type === 'cardio' ? (
        <CardioLogger workoutId={workout.id} />
      ) : (
        <>
          <SortableList ids={currentIds} onReorder={(nextIds) => reorder.mutate(nextIds)}>
            <div className="space-y-4">
              {sessionExercises.map((entry) => (
                <SortableItem key={entry.exercise.id} id={entry.exercise.id}>
                  {(drag) => (
                    <ExerciseBlock
                      workoutId={workout.id}
                      exercise={entry.exercise}
                      sets={entry.sets}
                      onSwap={() => setSwapTargetId(entry.exercise.id)}
                      onDelete={() => handleDeleteExercise(entry.exercise.id, entry.exercise.name)}
                      dragHandleProps={drag}
                    />
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableList>

          <button
            onClick={() => setPickerOpen(true)}
            className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            + Add exercise
          </button>

          {pickerOpen && (
            <ExercisePicker
              exerciseType="strength"
              onClose={() => setPickerOpen(false)}
              onPick={(exercise) => {
                addExercise.mutate({ currentIds, exerciseId: exercise.id })
                setPickerOpen(false)
              }}
            />
          )}

          {swapTargetId && (
            <ExercisePicker
              exerciseType="strength"
              onClose={() => setSwapTargetId(null)}
              onPick={(exercise) => {
                swapExercise.mutate({ currentIds, fromExerciseId: swapTargetId, toExerciseId: exercise.id })
                // Move any sets already logged against the old exercise onto the new one, so
                // nothing entered so far is lost.
                reassignExercise.mutate({ fromExerciseId: swapTargetId, toExerciseId: exercise.id })
                setSwapTargetId(null)
              }}
            />
          )}
        </>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
        <textarea
          value={notes || workout.notes || ''}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={(e) => updateNotes.mutate(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  )
}
