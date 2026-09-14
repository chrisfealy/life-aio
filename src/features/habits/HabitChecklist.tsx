import { Check, Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Database } from '../../types/database.types'
import { EditHabitModal } from './EditHabitModal'
import { useHabitLogs } from './useHabitLogs'
import { useHabits } from './useHabits'
import { useHabitStreaks } from './useHabitStreaks'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

export function HabitChecklist({ date }: { date: string }) {
  const { data: habits, isLoading: habitsLoading } = useHabits()
  const { data: logs, upsertLog } = useHabitLogs(date)
  const { data: streaks } = useHabitStreaks(habits, date)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

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
          onOpenEdit={() => setEditingHabit(habit)}
        />
      ))}

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          streak={streaks?.get(editingHabit.id) ?? 0}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  )
}

interface RowProps {
  habit: Habit
  log: HabitLog | undefined
  streak: number
  onToggle: () => void
  onIncrement: () => void
  onOpenEdit: () => void
}

function HabitRow(props: RowProps) {
  return props.habit.habit_type === 'boolean' ? <BooleanHabitRow {...props} /> : <NumericHabitRow {...props} />
}

function containerHandlers(onOpenEdit: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: onOpenEdit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onOpenEdit()
      }
    },
  }
}

function BooleanHabitRow({ habit, streak, log, onToggle, onOpenEdit }: RowProps) {
  const done = !!log?.completed

  function handleControlClick(e: React.MouseEvent) {
    e.stopPropagation()
    onToggle()
  }

  return (
    <div
      {...containerHandlers(onOpenEdit)}
      className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
        done ? 'border-blue-600 bg-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <span className={`text-sm font-medium ${done ? 'text-white' : 'text-slate-800'}`}>{habit.name}</span>
      <span className="flex items-center gap-3">
        <span className={`text-sm tabular-nums ${done ? 'text-blue-100' : 'text-slate-400'}`}>{streak}</span>
        <button
          type="button"
          onClick={handleControlClick}
          aria-label={`Mark ${habit.name} complete`}
          className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-white/20' : 'bg-slate-100'}`}
        >
          {done ? <Check className="h-3.5 w-3.5 text-white" /> : <Plus className="h-3.5 w-3.5 text-slate-400" />}
        </button>
      </span>
    </div>
  )
}

function numericRowContent(
  habit: Habit,
  log: HabitLog | undefined,
  streak: number,
  variant: 'dark' | 'light',
  showCheck: boolean,
  onControlClick: (e: React.MouseEvent) => void,
): ReactNode {
  const textClass = variant === 'light' ? 'text-white' : 'text-slate-800'
  const subTextClass = variant === 'light' ? 'text-blue-100' : 'text-slate-400'
  const iconBg = variant === 'light' ? 'bg-white/20' : 'bg-slate-100'
  const iconColor = variant === 'light' ? 'text-white' : 'text-slate-400'

  return (
    <>
      <span className={`text-sm font-medium ${textClass}`}>
        {habit.name}
        <span className={`ml-1.5 text-xs font-normal ${subTextClass}`}>
          {log?.value ?? 0}
          {habit.target_value ? `/${habit.target_value}` : ''}
          {habit.unit ? ` ${habit.unit}` : ''}
        </span>
      </span>
      <span className="flex items-center gap-3">
        <span className={`text-sm tabular-nums ${subTextClass}`}>{streak}</span>
        <button
          type="button"
          onClick={onControlClick}
          aria-label={`Log ${habit.name}`}
          className={`flex h-6 w-6 items-center justify-center rounded-full ${iconBg}`}
        >
          {showCheck ? <Check className={`h-3.5 w-3.5 ${iconColor}`} /> : <Plus className={`h-3.5 w-3.5 ${iconColor}`} />}
        </button>
      </span>
    </>
  )
}

// Numeric habits fill the container with blue left-to-right, proportional to value/target,
// and animate on change. Two full-size content layers (dark text, white text) sit on top of
// the fill, each clipped to exactly the filled/unfilled region so the text stays readable
// right up to the fill boundary instead of one flat color washing out against the other.
function NumericHabitRow({ habit, log, streak, onIncrement, onOpenEdit }: RowProps) {
  const value = log?.value ?? 0
  const pct = habit.target_value ? Math.min(100, (value / habit.target_value) * 100) : value > 0 ? 100 : 0
  const done = pct >= 100

  function handleControlClick(e: React.MouseEvent) {
    e.stopPropagation()
    onIncrement()
  }

  return (
    <div
      {...containerHandlers(onOpenEdit)}
      className="relative isolate flex w-full cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white text-left"
    >
      {/* Sizing spacer: the layers below are all absolutely positioned, so this (identical,
          non-absolute) copy is what actually gives the row its height/width. */}
      <div className="invisible flex w-full items-center justify-between px-4 py-3">
        {numericRowContent(habit, log, streak, 'dark', done, () => {})}
      </div>

      <div
        className="absolute inset-y-0 left-0 bg-blue-600 transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />

      <div
        className="absolute inset-0 flex items-center justify-between px-4 py-3 transition-[clip-path] duration-500 ease-out"
        style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
      >
        {numericRowContent(habit, log, streak, 'dark', false, handleControlClick)}
      </div>

      <div
        className="absolute inset-0 flex items-center justify-between px-4 py-3 transition-[clip-path] duration-500 ease-out"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        {numericRowContent(habit, log, streak, 'light', done, handleControlClick)}
      </div>
    </div>
  )
}
