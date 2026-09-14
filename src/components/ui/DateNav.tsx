import { addDaysISO, todayISO } from '../../utils/dates'

export function DateNav({
  date,
  onChange,
}: {
  date: string
  onChange: (nextDate: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(addDaysISO(date, -1))}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        aria-label="Previous day"
      >
        ←
      </button>
      <input
        type="date"
        value={date}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="min-w-[10rem] rounded-md border border-slate-300 px-2 py-1 text-center text-sm font-medium text-slate-900"
      />
      <button
        onClick={() => onChange(addDaysISO(date, 1))}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        aria-label="Next day"
      >
        →
      </button>
      {date !== todayISO() && (
        <button
          onClick={() => onChange(todayISO())}
          className="ml-1 text-sm text-slate-500 underline hover:text-slate-900"
        >
          Today
        </button>
      )}
    </div>
  )
}
