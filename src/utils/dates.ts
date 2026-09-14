import { format, parseISO } from 'date-fns'

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatISO(dateISO: string, pattern = 'EEE, MMM d, yyyy'): string {
  return format(parseISO(dateISO), pattern)
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = parseISO(dateISO)
  d.setDate(d.getDate() + days)
  return format(d, 'yyyy-MM-dd')
}
