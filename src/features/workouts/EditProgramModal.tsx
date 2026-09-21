import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { DragHandle, SortableItem } from '../../components/ui/SortableItem'
import { SortableList } from '../../components/ui/SortableList'
import type { Database } from '../../types/database.types'
import { ExercisePicker } from './ExercisePicker'
import { ProgramExerciseModal } from './ProgramExerciseModal'
import { useProgramExercises, usePrograms } from './usePrograms'

type Exercise = Database['public']['Tables']['exercises']['Row']
type Program = Database['public']['Tables']['workout_programs']['Row']
type ProgramExercise = Database['public']['Tables']['workout_program_exercises']['Row'] & {
  exercise: Exercise | null
}

function formatPlan(pe: { warmup_sets: number | null; target_sets: number | null }) {
  const parts: string[] = []
  if (pe.warmup_sets) parts.push(`${pe.warmup_sets} warm-up`)
  if (pe.target_sets) parts.push(`${pe.target_sets} sets`)
  return parts.join(' + ')
}

export function EditProgramModal({ program, onClose }: { program: Program; onClose: () => void }) {
  const { update, remove } = usePrograms()
  const { data: programExercises, addExercise, removeExercise, reorder } = useProgramExercises(program.id)
  const [name, setName] = useState(program.name)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ProgramExercise | null>(null)

  function handleSaveName() {
    if (!name.trim() || name.trim() === program.name) return
    update.mutate({ id: program.id, name: name.trim() })
  }

  function handleDelete() {
    if (!confirm(`Delete "${program.name}"? This won't affect workouts already started from it.`)) return
    remove.mutate(program.id)
    onClose()
  }

  function handlePick(exercise: Exercise) {
    addExercise.mutate({ exerciseId: exercise.id, sortOrder: programExercises?.length ?? 0 })
    setPickerOpen(false)
  }

  const rowIds = (programExercises ?? []).map((pe) => pe.id)

  return (
    <Modal title="Edit program" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500">Exercises</label>
          <div className="mt-1">
            <SortableList ids={rowIds} onReorder={(nextIds) => reorder.mutate(nextIds)}>
              <div className="space-y-1">
                {(programExercises ?? []).map((pe) => (
                  <SortableItem key={pe.id} id={pe.id}>
                    {(drag) => (
                      <div className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-600">
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <DragHandle {...drag} />
                          <button
                            onClick={() => setEditingExercise(pe as ProgramExercise)}
                            className="min-w-0 flex-1 truncate text-left hover:text-slate-900"
                          >
                            {(pe.exercise as unknown as Exercise | null)?.name ?? 'Exercise'}
                            {formatPlan(pe) && <span className="ml-1 text-xs text-slate-400">— {formatPlan(pe)}</span>}
                            {pe.notes && (
                              <span className="ml-1 rounded bg-slate-200 px-1 text-[10px] text-slate-500">note</span>
                            )}
                          </button>
                        </span>
                        <button onClick={() => removeExercise.mutate(pe.id)} className="text-xs text-slate-300 hover:text-red-600">
                          ✕
                        </button>
                      </div>
                    )}
                  </SortableItem>
                ))}
                {(programExercises ?? []).length === 0 && <p className="text-sm text-slate-400">No exercises yet.</p>}
              </div>
            </SortableList>
            <button onClick={() => setPickerOpen(true)} className="mt-2 text-xs text-slate-400 underline hover:text-slate-700">
              + add exercise
            </button>
            {pickerOpen && <ExercisePicker exerciseType="strength" onClose={() => setPickerOpen(false)} onPick={handlePick} />}
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="w-full rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete program
        </button>
      </div>

      {editingExercise && (
        <ProgramExerciseModal
          programId={program.id}
          programExercise={editingExercise}
          onClose={() => setEditingExercise(null)}
        />
      )}
    </Modal>
  )
}
