import { useQuery } from '@tanstack/react-query'
import { format, parseISO, startOfWeek } from 'date-fns'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function WorkoutVolumeChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['analytics_workout_volume', user?.id, startDate, endDate],
    enabled: !!user,
    queryFn: async () => {
      const { data: workouts, error: workoutsError } = await supabase
        .from('workouts')
        .select('id, workout_date')
        .gte('workout_date', startDate)
        .lte('workout_date', endDate)
      if (workoutsError) throw workoutsError

      const workoutIds = (workouts ?? []).map((w) => w.id)
      const workoutDateById = new Map((workouts ?? []).map((w) => [w.id, w.workout_date]))

      const { data: sets, error: setsError } =
        workoutIds.length > 0
          ? await supabase.from('workout_sets').select('workout_id, weight, reps').in('workout_id', workoutIds)
          : { data: [], error: null }
      if (setsError) throw setsError

      const weekly = new Map<string, { volume: number; workoutIds: Set<string> }>()

      for (const w of workouts ?? []) {
        const weekKey = format(startOfWeek(parseISO(w.workout_date)), 'yyyy-MM-dd')
        const bucket = weekly.get(weekKey) ?? { volume: 0, workoutIds: new Set<string>() }
        bucket.workoutIds.add(w.id)
        weekly.set(weekKey, bucket)
      }

      for (const s of sets ?? []) {
        const date = workoutDateById.get(s.workout_id)
        if (!date) continue
        const weekKey = format(startOfWeek(parseISO(date)), 'yyyy-MM-dd')
        const bucket = weekly.get(weekKey) ?? { volume: 0, workoutIds: new Set<string>() }
        bucket.volume += (s.weight ?? 0) * (s.reps ?? 0)
        weekly.set(weekKey, bucket)
      }

      return Array.from(weekly.entries())
        .map(([week, v]) => ({ week, volume: v.volume, sessions: v.workoutIds.size }))
        .sort((a, b) => a.week.localeCompare(b.week))
    },
  })

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400">No workouts in this range.</p>
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar yAxisId="left" dataKey="volume" name="Volume" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="sessions" name="Sessions" stroke="#0f172a" dot />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
