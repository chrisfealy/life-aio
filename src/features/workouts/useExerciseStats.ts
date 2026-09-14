import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { estimateOneRepMax } from './oneRepMax'

export interface SessionVolumePoint {
  date: string
  volume: number
  estOneRepMax: number
}

export interface ExerciseStats {
  heaviestWeight: number | null
  bestEstOneRepMax: number | null
  repPRs: Map<number, number> // reps -> heaviest weight achieved for that rep count
  sessions: SessionVolumePoint[]
}

export function useExerciseStats(exerciseId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['exercise_stats', user?.id, exerciseId],
    enabled: !!user && !!exerciseId,
    queryFn: async (): Promise<ExerciseStats> => {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('weight, reps, is_warmup, created_at, workout:workouts(workout_date)')
        .eq('exercise_id', exerciseId as string)
        .eq('is_warmup', false)
        .order('created_at', { ascending: true })
      if (error) throw error

      let heaviestWeight: number | null = null
      let bestEstOneRepMax: number | null = null
      const repPRs = new Map<number, number>()
      const sessionMap = new Map<string, { volume: number; estOneRepMax: number }>()

      for (const row of data ?? []) {
        const weight = row.weight ?? 0
        const reps = row.reps ?? 0
        if (weight <= 0 || reps <= 0) continue

        if (heaviestWeight === null || weight > heaviestWeight) heaviestWeight = weight

        const est1RM = estimateOneRepMax(weight, reps)
        if (bestEstOneRepMax === null || est1RM > bestEstOneRepMax) bestEstOneRepMax = est1RM

        const currentPR = repPRs.get(reps) ?? 0
        if (weight > currentPR) repPRs.set(reps, weight)

        const date = (row.workout as unknown as { workout_date: string } | null)?.workout_date
        if (date) {
          const existing = sessionMap.get(date) ?? { volume: 0, estOneRepMax: 0 }
          existing.volume += weight * reps
          existing.estOneRepMax = Math.max(existing.estOneRepMax, est1RM)
          sessionMap.set(date, existing)
        }
      }

      const sessions = Array.from(sessionMap.entries())
        .map(([date, v]) => ({ date, volume: v.volume, estOneRepMax: v.estOneRepMax }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return { heaviestWeight, bestEstOneRepMax, repPRs, sessions }
    },
  })
}
