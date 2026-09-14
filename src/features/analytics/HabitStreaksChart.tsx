import { useQuery } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { todayISO } from '../../utils/dates'

export function HabitStreaksChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['analytics_habits', user?.id, startDate, endDate],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: habits, error: habitsError }, { data: logs, error: logsError }] = await Promise.all([
        supabase.from('habits').select('*').eq('is_archived', false),
        supabase.from('habit_logs').select('*').gte('log_date', startDate).lte('log_date', endDate),
      ])
      if (habitsError) throw habitsError
      if (logsError) throw logsError

      const totalDays = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1

      return (habits ?? []).map((habit) => {
        const habitLogs = (logs ?? []).filter((l) => l.habit_id === habit.id)
        const completedDays = habitLogs.filter((l) =>
          habit.habit_type === 'boolean' ? l.completed : l.value !== null && (habit.target_value ? l.value >= habit.target_value : l.value > 0),
        )
        const completionRate = totalDays > 0 ? Math.round((completedDays.length / totalDays) * 100) : 0

        // current streak: walk backwards from today
        let streak = 0
        const logByDate = new Map(habitLogs.map((l) => [l.log_date, l]))
        let cursor = todayISO()
        while (true) {
          const log = logByDate.get(cursor)
          const done = log && (habit.habit_type === 'boolean' ? log.completed : log.value !== null && log.value > 0)
          if (!done) break
          streak += 1
          cursor = format(addDays(parseISO(cursor), -1), 'yyyy-MM-dd')
        }

        return { name: habit.name, completionRate, streak }
      })
    },
  })

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400">No habits to show yet.</p>
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="completionRate" fill="#0f172a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
