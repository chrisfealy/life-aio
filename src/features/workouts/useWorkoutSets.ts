import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function useWorkoutSets(workoutId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['workout_sets', workoutId]

  const query = useQuery({
    queryKey,
    enabled: !!user && !!workoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const addSet = useMutation({
    mutationFn: async (input: {
      exerciseId: string
      setNumber: number
      weight: number | null
      reps: number | null
      isWarmup?: boolean
    }) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          exercise_id: input.exerciseId,
          set_number: input.setNumber,
          weight: input.weight,
          reps: input.reps,
          is_warmup: input.isWarmup ?? false,
        })
        .select('*, exercise:exercises(*)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const updateSet = useMutation({
    mutationFn: async (input: { setId: string; weight: number | null; reps: number | null }) => {
      const { error } = await supabase
        .from('workout_sets')
        .update({ weight: input.weight, reps: input.reps })
        .eq('id', input.setId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const removeSet = useMutation({
    mutationFn: async (setId: string) => {
      const { error } = await supabase.from('workout_sets').delete().eq('id', setId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  // Session-only exercise swap: moves this workout's already-logged sets from one exercise to
  // another. Scoped to a single workout_id, so it never touches the exercise's other sessions
  // or any program definition.
  const reassignExercise = useMutation({
    mutationFn: async (input: { fromExerciseId: string; toExerciseId: string }) => {
      const { error } = await supabase
        .from('workout_sets')
        .update({ exercise_id: input.toExerciseId })
        .eq('workout_id', workoutId)
        .eq('exercise_id', input.fromExerciseId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, addSet, updateSet, removeSet, reassignExercise }
}

// RepCount-style convenience: prefill weight/reps from the most recent previous session for this exercise.
export function useLastSessionSets(exerciseId: string | null, excludeWorkoutId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['last_session_sets', user?.id, exerciseId, excludeWorkoutId],
    enabled: !!user && !!exerciseId,
    queryFn: async () => {
      const { data: lastWorkoutSet, error: lastError } = await supabase
        .from('workout_sets')
        .select('workout_id')
        .eq('exercise_id', exerciseId as string)
        .neq('workout_id', excludeWorkoutId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (lastError) throw lastError
      if (!lastWorkoutSet) return []

      const { data, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('workout_id', lastWorkoutSet.workout_id)
        .eq('exercise_id', exerciseId as string)
        .order('set_number', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
