import { HabitForm } from './HabitForm'
import { useHabits } from './useHabits'

export function HabitsList() {
  const { data: habits, isLoading, create, archive } = useHabits()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Habits</h1>
        <p className="text-sm text-slate-500">Define the habits you want tracked on your daily journal page.</p>
      </div>

      <HabitForm onSubmit={(input) => create.mutate(input)} submitting={create.isPending} />

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : !habits || habits.length === 0 ? (
        <p className="text-sm text-slate-400">No habits yet — add your first one above.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {habits.map((habit) => (
            <li key={habit.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{habit.name}</p>
                <p className="text-xs text-slate-400">
                  {habit.habit_type === 'boolean' ? 'Yes / No' : `Numeric${habit.unit ? ` (${habit.unit})` : ''}`}
                </p>
              </div>
              <button
                onClick={() => archive.mutate(habit.id)}
                className="text-xs text-slate-400 hover:text-red-600"
              >
                Archive
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
