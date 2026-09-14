import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function useCardioLog(workoutId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['cardio_log', workoutId]

  const query = useQuery({
    queryKey,
    enabled: !!user && !!workoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cardio_logs')
        .select('*')
        .eq('workout_id', workoutId)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })

  const save = useMutation({
    mutationFn: async (input: {
      exerciseId: string | null
      durationSeconds: number | null
      distance: number | null
      distanceUnit: string
      calories: number | null
      avgHeartRate: number | null
    }) => {
      if (!user) throw new Error('Not signed in')
      const existingId = query.data?.id
      if (existingId) {
        const { error } = await supabase
          .from('cardio_logs')
          .update({
            exercise_id: input.exerciseId,
            duration_seconds: input.durationSeconds,
            distance: input.distance,
            distance_unit: input.distanceUnit,
            calories: input.calories,
            avg_heart_rate: input.avgHeartRate,
          })
          .eq('id', existingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('cardio_logs').insert({
          user_id: user.id,
          workout_id: workoutId,
          exercise_id: input.exerciseId,
          duration_seconds: input.durationSeconds,
          distance: input.distance,
          distance_unit: input.distanceUnit,
          calories: input.calories,
          avg_heart_rate: input.avgHeartRate,
        })
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, save }
}
