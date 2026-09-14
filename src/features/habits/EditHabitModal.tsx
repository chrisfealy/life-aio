import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import type { Database, HabitType } from '../../types/database.types'
import { useHabits } from './useHabits'

type Habit = Database['public']['Tables']['habits']['Row']

export function EditHabitModal({ habit, streak, onClose }: { habit: Habit; streak: number; onClose: () => void }) {
  const { update, archive } = useHabits()
  const [name, setName] = useState(habit.name)
  const [habitType, setHabitType] = useState<HabitType>(habit.habit_type)
  const [unit, setUnit] = useState(habit.unit ?? '')
  const [targetValue, setTargetValue] = useState(habit.target_value?.toString() ?? '')

  function handleSave() {
    if (!name.trim()) return
    update.mutate({
      id: habit.id,
      name: name.trim(),
      habitType,
      unit: unit.trim() || null,
      targetValue: targetValue === '' ? null : Number(targetValue),
    })
    onClose()
  }

  function handleDelete() {
    if (!confirm(`Delete "${habit.name}"? Its history will no longer be tracked.`)) return
    archive.mutate(habit.id)
    onClose()
  }

  return (
    <Modal title="Edit habit" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-slate-500">
          Current streak: <span className="font-medium text-slate-800">{streak} day{streak === 1 ? '' : 's'}</span>
        </p>

        <div>
          <label className="block text-xs font-medium text-slate-500">Habit name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500">Type</label>
          <select
            value={habitType}
            onChange={(e) => setHabitType(e.target.value as HabitType)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="boolean">Yes / No</option>
            <option value="numeric">Numeric</option>
          </select>
        </div>

        {habitType === 'numeric' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500">Unit</label>
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="glasses"
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500">Target</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="flex-1 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}
