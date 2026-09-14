import { useState } from 'react'
import { AddButton } from '../../components/ui/AddButton'
import { Modal } from '../../components/ui/Modal'
import type { CategoryDirection } from '../../types/database.types'
import { useCategories } from './useCategories'

export function CategoryManager() {
  const { data: categories, create, update, archive } = useCategories()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [direction, setDirection] = useState<CategoryDirection>('expense')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDirection, setEditDirection] = useState<CategoryDirection>('expense')

  function handleCreate() {
    if (!name.trim()) return
    create.mutate({ name: name.trim(), direction })
    setName('')
    setDirection('expense')
    setModalOpen(false)
  }

  function startEdit(id: string, currentName: string, currentDirection: CategoryDirection) {
    setEditingId(id)
    setEditName(currentName)
    setEditDirection(currentDirection)
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return
    update.mutate({ id: editingId, name: editName.trim(), direction: editDirection })
    setEditingId(null)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Categories</h2>
        <AddButton onClick={() => setModalOpen(true)} label="Add category" />
      </div>

      <ul className="mt-3 space-y-1">
        {(categories ?? []).map((c) =>
          editingId === c.id ? (
            <li key={c.id} className="flex items-center gap-2 rounded-md bg-slate-50 px-2 py-1">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm"
                autoFocus
              />
              <select
                value={editDirection}
                onChange={(e) => setEditDirection(e.target.value as CategoryDirection)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
              <button onClick={saveEdit} className="text-xs font-medium text-slate-700 hover:text-slate-900">
                Save
              </button>
              <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-700">
                Cancel
              </button>
            </li>
          ) : (
            <li key={c.id} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50">
              <span className="text-sm text-slate-700">
                {c.name} <span className="text-xs text-slate-400">({c.direction})</span>
              </span>
              <span className="flex gap-2 text-xs">
                <button onClick={() => startEdit(c.id, c.name, c.direction)} className="text-slate-400 hover:text-slate-900">
                  Edit
                </button>
                <button onClick={() => archive.mutate(c.id)} className="text-slate-400 hover:text-red-600">
                  Delete
                </button>
              </span>
            </li>
          ),
        )}
        {(categories ?? []).length === 0 && <p className="text-sm text-slate-400">No categories yet — tap + to add one.</p>}
      </ul>

      {modalOpen && (
        <Modal title="Add category" onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">Name</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as CategoryDirection)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Add category
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
