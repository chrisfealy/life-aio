import { useState, type FormEvent } from 'react'
import type { HabitInput } from './useHabits'

export function HabitForm({ onSubmit, submitting }: { onSubmit: (input: HabitInput) => void; submitting: boolean }) {
  const [name, setName] = useState('')
  const [habitType, setHabitType] = useState<'boolean' | 'numeric'>('boolean')
  const [unit, setUnit] = useState('')
  const [targetValue, setTargetValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      habit_type: habitType,
      unit: unit.trim() || null,
      target_value: targetValue === '' ? null : Number(targetValue),
    })
    setName('')
    setUnit('')
    setTargetValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Habit name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read, Meditate, Drink water"
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Type</label>
        <select
          value={habitType}
          onChange={(e) => setHabitType(e.target.value as 'boolean' | 'numeric')}
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
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        Add habit
      </button>
    </form>
  )
}
