import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DateNav } from '../../components/ui/DateNav'
import { todayISO } from '../../utils/dates'
import { HabitChecklist } from '../habits/HabitChecklist'
import { useDayRollup } from './useDayRollup'
import { useJournalEntry } from './useJournalEntry'

export function JournalPage() {
  const { date: dateParam } = useParams()
  const date = dateParam ?? todayISO()
  const navigate = useNavigate()

  const { data: entry, isLoading, save } = useJournalEntry(date)
  const { workouts, transactions } = useDayRollup(date)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Journal</h1>
        <DateNav date={date} onChange={(next) => navigate(`/day/${next}`)} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-xs font-medium text-slate-500">What did you accomplish today?</label>
        {/* Remounts once the entry finishes loading (or when the date changes) so its
            initial text always reflects the loaded entry without an effect+setState sync. */}
        <SummaryEditor
          key={`${date}-${entry ? 'loaded' : 'loading'}`}
          initialSummary={entry?.summary ?? ''}
          disabled={isLoading}
          onSave={(value) => save.mutate(value)}
          saving={save.isPending}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Habits</h2>
        <HabitChecklist date={date} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Workouts</h2>
          {workouts.data && workouts.data.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {workouts.data.map((w) => (
                <li key={w.id}>
                  <Link to={`/workouts/${w.id}`} className="text-slate-600 hover:text-slate-900 hover:underline">
                    {(w.program as unknown as { name: string } | null)?.name ??
                      `${w.workout_type === 'strength' ? 'Strength' : 'Cardio'} workout`}
                    {w.notes ? ` — ${w.notes}` : ''}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No workout logged today.</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Finances</h2>
          {transactions.data && transactions.data.length > 0 ? (
            <ul className="space-y-1 text-sm text-slate-600">
              {transactions.data.map((t) => (
                <li key={t.id}>
                  {t.direction === 'in' ? '+' : '-'}${t.amount.toFixed(2)}
                  {t.note ? ` — ${t.note}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No transactions today.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryEditor({
  initialSummary,
  disabled,
  saving,
  onSave,
}: {
  initialSummary: string
  disabled: boolean
  saving: boolean
  onSave: (value: string) => void
}) {
  const [summary, setSummary] = useState(initialSummary)
  const [dirty, setDirty] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    setSummary(value)
    setDirty(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSave(value), 600)
  }

  return (
    <>
      <textarea
        value={summary}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder="Write a quick summary of your day…"
        className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
      <p className="mt-1 text-xs text-slate-400">{saving ? 'Saving…' : dirty ? 'Saved' : ''}</p>
    </>
  )
}
