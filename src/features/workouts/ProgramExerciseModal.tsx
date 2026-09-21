import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import type { Database } from '../../types/database.types'
import { useProgramExercises } from './usePrograms'

type Exercise = Database['public']['Tables']['exercises']['Row']
type ProgramExercise = Database['public']['Tables']['workout_program_exercises']['Row'] & {
  exercise: Exercise | null
}

export function ProgramExerciseModal({
  programId,
  programExercise,
  onClose,
}: {
  programId: string
  programExercise: ProgramExercise
  onClose: () => void
}) {
  const { updateExercise } = useProgramExercises(programId)
  const [warmupSets, setWarmupSets] = useState(programExercise.warmup_sets?.toString() ?? '')
  const [sets, setSets] = useState(programExercise.target_sets?.toString() ?? '')
  const [notes, setNotes] = useState(programExercise.notes ?? '')

  function handleSave() {
    updateExercise.mutate({
      id: programExercise.id,
      warmupSets: warmupSets === '' ? null : Number(warmupSets),
      targetSets: sets === '' ? null : Number(sets),
      notes: notes.trim() || null,
    })
    onClose()
  }

  return (
    <Modal title={programExercise.exercise?.name ?? 'Exercise'} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500">Warm-up sets</label>
            <input
              autoFocus
              type="number"
              min="0"
              value={warmupSets}
              onChange={(e) => setWarmupSets(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Sets</label>
            <input
              type="number"
              min="0"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. keep elbows tucked, pause at the bottom"
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={updateExercise.isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </Modal>
  )
}
