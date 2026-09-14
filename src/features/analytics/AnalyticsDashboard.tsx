import { HabitStreaksChart } from './HabitStreaksChart'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { SpendingByCategoryChart } from './SpendingByCategoryChart'
import { useAnalyticsRange, type RangePreset } from './useAnalyticsRange'
import { WorkoutVolumeChart } from './WorkoutVolumeChart'

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 365, label: 'Last year' },
]

export function AnalyticsDashboard() {
  const { preset, setPreset, startDate, endDate } = useAnalyticsRange()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
        <select
          value={preset}
          onChange={(e) => setPreset(Number(e.target.value) as RangePreset)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Habit completion</h2>
        <HabitStreaksChart startDate={startDate} endDate={endDate} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Workout volume & sessions</h2>
        <WorkoutVolumeChart startDate={startDate} endDate={endDate} />
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Income vs. expense</h2>
          <IncomeExpenseChart startDate={startDate} endDate={endDate} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Spending by category</h2>
          <SpendingByCategoryChart startDate={startDate} endDate={endDate} />
        </section>
      </div>
    </div>
  )
}
