import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { Database } from '../../types/database.types'
import { addDaysISO } from '../../utils/dates'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

function isDone(habit: Habit, log: HabitLog | undefined): boolean {
  if (!log) return false
  if (habit.habit_type === 'boolean') return !!log.completed
  return log.value !== null && (habit.target_value ? log.value >= habit.target_value : log.value > 0)
}

// Current streak per habit, in consecutive days ending on `asOfDate`. If `asOfDate` itself
// isn't done yet, count backwards from the day before instead — an unmarked "today" shouldn't
// make an otherwise-live streak read as broken.
export function useHabitStreaks(habits: Habit[] | undefined, asOfDate: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habit_streaks', user?.id, asOfDate, habits?.map((h) => h.id).join(',')],
    enabled: !!user && !!habits && habits.length > 0,
    queryFn: async () => {
      const { data: logs, error } = await supabase.from('habit_logs').select('*').lte('log_date', asOfDate)
      if (error) throw error

      const streaks = new Map<string, number>()
      for (const habit of habits ?? []) {
        const logsByDate = new Map((logs ?? []).filter((l) => l.habit_id === habit.id).map((l) => [l.log_date, l]))
        const doneToday = isDone(habit, logsByDate.get(asOfDate))

        let cursor = doneToday ? asOfDate : addDaysISO(asOfDate, -1)
        let streak = 0
        while (isDone(habit, logsByDate.get(cursor))) {
          streak += 1
          cursor = addDaysISO(cursor, -1)
        }
        streaks.set(habit.id, streak)
      }
      return streaks
    },
  })
}
