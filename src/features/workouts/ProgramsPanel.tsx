import { useState } from 'react'
import { AddButton } from '../../components/ui/AddButton'
import { Modal } from '../../components/ui/Modal'
import type { Database } from '../../types/database.types'
import { EditProgramModal } from './EditProgramModal'
import { usePrograms } from './usePrograms'

type Program = Database['public']['Tables']['workout_programs']['Row']

export function ProgramsPanel() {
  const { data: programs, create } = usePrograms()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newProgramName, setNewProgramName] = useState('')
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  function handleCreate() {
    if (!newProgramName.trim()) return
    create.mutate({ name: newProgramName.trim() })
    setNewProgramName('')
    setAddModalOpen(false)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Programs</h2>
        <AddButton onClick={() => setAddModalOpen(true)} label="Add program" />
      </div>

      <ul className="mt-3 divide-y divide-slate-100">
        {(programs ?? []).map((program) => (
          <li key={program.id}>
            <button
              onClick={() => setEditingProgram(program)}
              className="w-full py-2 text-left text-sm font-medium text-slate-800 hover:text-slate-900"
            >
              {program.name}
            </button>
          </li>
        ))}
        {(programs ?? []).length === 0 && <p className="py-2 text-sm text-slate-400">No programs yet — tap + to add one.</p>}
      </ul>

      {addModalOpen && (
        <Modal title="Add program" onClose={() => setAddModalOpen(false)}>
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

      {editingProgram && <EditProgramModal program={editingProgram} onClose={() => setEditingProgram(null)} />}
    </div>
  )
}
