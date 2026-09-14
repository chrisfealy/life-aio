import { useState } from 'react'
import { AddButton } from '../../components/ui/AddButton'
import { Modal } from '../../components/ui/Modal'
import { DragHandle, SortableItem } from '../../components/ui/SortableItem'
import { SortableList } from '../../components/ui/SortableList'
import type { Database } from '../../types/database.types'
import { ExercisePicker } from './ExercisePicker'
import { useProgramExercises, usePrograms } from './usePrograms'

type Exercise = Database['public']['Tables']['exercises']['Row']

export function ProgramsPanel() {
  const { data: programs, create, update, remove } = usePrograms()
  const [modalOpen, setModalOpen] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function handleCreate() {
    if (!newProgramName.trim()) return
    create.mutate({ name: newProgramName.trim() })
    setNewProgramName('')
    setModalOpen(false)
  }

  function startRename(id: string, currentName: string) {
    setRenamingId(id)
    setRenameValue(currentName)
  }

  function saveRename() {
    if (!renamingId || !renameValue.trim()) return
    update.mutate({ id: renamingId, name: renameValue.trim() })
    setRenamingId(null)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Programs</h2>
        <AddButton onClick={() => setModalOpen(true)} label="Add program" />
      </div>

      <ul className="mt-3 divide-y divide-slate-100">
        {(programs ?? []).map((program) =>
          renamingId === program.id ? (
            <li key={program.id} className="flex items-center gap-2 py-2">
              <input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                autoFocus
              />
              <button onClick={saveRename} className="text-xs font-medium text-slate-700 hover:text-slate-900">
                Save
              </button>
              <button onClick={() => setRenamingId(null)} className="text-xs text-slate-400 hover:text-slate-700">
                Cancel
              </button>
            </li>
          ) : (
            <li key={program.id} className="py-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedProgramId(expandedProgramId === program.id ? null : program.id)}
                  className="text-sm font-medium text-slate-800 hover:underline"
                >
                  {program.name}
                </button>
                <span className="flex gap-2 text-xs">
                  <button onClick={() => startRename(program.id, program.name)} className="text-slate-400 hover:text-slate-900">
                    rename
                  </button>
                  <button onClick={() => remove.mutate(program.id)} className="text-slate-300 hover:text-red-600">
                    delete
                  </button>
                </span>
              </div>
              {expandedProgramId === program.id && <ProgramExerciseEditor programId={program.id} />}
            </li>
          ),
        )}
        {(programs ?? []).length === 0 && <p className="py-2 text-sm text-slate-400">No programs yet — tap + to add one.</p>}
      </ul>

      {modalOpen && (
        <Modal title="Add program" onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">Name</label>
              <input
                autoFocus
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                placeholder="e.g. Push Day"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              onClick={handleCreate}
              className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add program
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ProgramExerciseEditor({ programId }: { programId: string }) {
  const { data: programExercises, addExercise, removeExercise, reorder } = useProgramExercises(programId)
  const [pickerOpen, setPickerOpen] = useState(false)

  function handlePick(exercise: Exercise) {
    addExercise.mutate({ exerciseId: exercise.id, sortOrder: programExercises?.length ?? 0 })
    setPickerOpen(false)
  }

  const rowIds = (programExercises ?? []).map((pe) => pe.id)

  return (
    <div className="mt-2 pl-2">
      <SortableList ids={rowIds} onReorder={(nextIds) => reorder.mutate(nextIds)}>
        <div className="space-y-1">
          {(programExercises ?? []).map((pe) => (
            <SortableItem key={pe.id} id={pe.id}>
              {(drag) => (
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <DragHandle {...drag} />
                    {(pe.exercise as unknown as Exercise | null)?.name ?? 'Exercise'}
                    {pe.target_sets && pe.target_reps ? ` — ${pe.target_sets}x${pe.target_reps}` : ''}
                  </span>
                  <button onClick={() => removeExercise.mutate(pe.id)} className="text-xs text-slate-300 hover:text-red-600">
                    ✕
                  </button>
                </div>
              )}
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <button onClick={() => setPickerOpen(true)} className="mt-1 text-xs text-slate-400 underline hover:text-slate-700">
        + add exercise
      </button>
      {pickerOpen && <ExercisePicker exerciseType="strength" onClose={() => setPickerOpen(false)} onPick={handlePick} />}
    </div>
  )
}
