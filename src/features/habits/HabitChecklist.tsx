import { useHabitLogs } from './useHabitLogs'
import { useHabits } from './useHabits'

export function HabitChecklist({ date }: { date: string }) {
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: logs, upsertLog } = useHabitLogs(date)

  if (habitsLoading) return <p className="text-sm text-slate-400">Loading habits…</p>
  if (!habits || habits.length === 0) {
    return <p className="text-sm text-slate-400">No habits yet. Add some from the Habits tab.</p>
  }

  const logByHabit = new Map((logs ?? []).map((l) => [l.habit_id, l]))

  return (
    <ul className="divide-y divide-slate-100">
      {habits.map((habit) => {
        const log = logByHabit.get(habit.id)
        return (
          <li key={habit.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">{habit.name}</p>
              {habit.unit && <p className="text-xs text-slate-400">{habit.unit}</p>}
            </div>
            {habit.habit_type === 'boolean' ? (
              <input
                type="checkbox"
                checked={log?.completed ?? false}
                onChange={(e) => upsertLog.mutate({ habitId: habit.id, completed: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300"
              />
            ) : (
              <input
                type="number"
                value={log?.value ?? ''}
                onChange={(e) =>
                  upsertLog.mutate({
                    habitId: habit.id,
                    value: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                placeholder={habit.target_value ? `/ ${habit.target_value}` : undefined}
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm"
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
