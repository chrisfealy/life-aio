import { Check, Plus } from 'lucide-react'
import type { Database } from '../../types/database.types'
import { useHabitLogs } from './useHabitLogs'
import { useHabits } from './useHabits'
import { useHabitStreaks } from './useHabitStreaks'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

export function HabitChecklist({ date }: { date: string }) {
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: logs, upsertLog } = useHabitLogs(date)
  const { data: streaks } = useHabitStreaks(habits, date)

  if (habitsLoading) return <p className="text-sm text-slate-400">Loading habits…</p>
  if (!habits || habits.length === 0) {
    return <p className="text-sm text-slate-400">No habits yet — tap the icon above to add one.</p>
  }

  const logByHabit = new Map((logs ?? []).map((l) => [l.habit_id, l]))

  return (
    <div className="space-y-2">
      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          habit={habit}
          log={logByHabit.get(habit.id)}
          streak={streaks?.get(habit.id) ?? 0}
          onToggle={() => upsertLog.mutate({ habitId: habit.id, completed: !logByHabit.get(habit.id)?.completed })}
          onIncrement={() => upsertLog.mutate({ habitId: habit.id, value: (logByHabit.get(habit.id)?.value ?? 0) + 1 })}
        />
      ))}
    </div>
  )
}

function HabitRow({
  habit,
  log,
  streak,
  onToggle,
  onIncrement,
}: {
  habit: Habit
  log: HabitLog | undefined
  streak: number
  onToggle: () => void
  onIncrement: () => void
}) {
  const done =
    habit.habit_type === 'boolean'
      ? !!log?.completed
      : log?.value != null && (habit.target_value ? log.value >= habit.target_value : log.value > 0)

  if (habit.habit_type === 'boolean') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
          done ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`}
      >
        <span className={`text-sm font-medium ${done ? 'text-white' : 'text-slate-800'}`}>{habit.name}</span>
        <span className="flex items-center gap-3">
          <span className={`text-sm tabular-nums ${done ? 'text-blue-100' : 'text-slate-400'}`}>{streak}</span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-white/20' : 'bg-slate-100'}`}>
            {done ? <Check className="h-3.5 w-3.5 text-white" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
          </span>
        </span>
      </button>
    )
  }

  return (
    <div
      className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
        done ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white'
      }`}
    >
      <span className={`text-sm font-medium ${done ? 'text-white' : 'text-slate-800'}`}>
        {habit.name}
        <span className={`ml-1.5 text-xs font-normal ${done ? 'text-blue-100' : 'text-slate-400'}`}>
          {log?.value ?? 0}
          {habit.target_value ? `/${habit.target_value}` : ''}
          {habit.unit ? ` ${habit.unit}` : ''}
        </span>
      </span>
      <span className="flex items-center gap-3">
        <span className={`text-sm tabular-nums ${done ? 'text-blue-100' : 'text-slate-400'}`}>{streak}</span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Log ${habit.name}`}
          className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-white/20' : 'bg-slate-100'}`}
        >
          <Plus className={`h-3.5 w-3.5 ${done ? 'text-white' : 'text-slate-400'}`} />
        </button>
      </span>
    </div>
  )
}
