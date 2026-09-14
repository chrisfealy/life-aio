import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { WorkoutType } from '../../types/database.types'
import { todayISO } from '../../utils/dates'

export function useRecentWorkouts(limit = 20) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['workouts', user?.id, limit],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, program:workout_programs(name)')
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data
    },
  })
}

export function useWorkout(workoutId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['workout', workoutId],
    enabled: !!user && !!workoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, program:workout_programs(name)')
        .eq('id', workoutId as string)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useStartWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: { workoutType: WorkoutType; programId?: string | null; date?: string }) => {
      if (!user) throw new Error('Not signed in')

      // Copy the program's exercise list into the session at start time — from here on the
      // session's own planned_exercise_ids is the source of truth, so later swaps/removals/
      // additions never touch the shared program definition.
      let plannedExerciseIds: string[] = []
      if (input.programId) {
        const { data: programExercises, error: programExercisesError } = await supabase
          .from('workout_program_exercises')
          .select('exercise_id')
          .eq('program_id', input.programId)
          .order('sort_order')
        if (programExercisesError) throw programExercisesError
        plannedExerciseIds = (programExercises ?? []).map((pe) => pe.exercise_id)
      }

      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          workout_date: input.date ?? todayISO(),
          workout_type: input.workoutType,
          program_id: input.programId ?? null,
          started_at: new Date().toISOString(),
          planned_exercise_ids: plannedExerciseIds,
        })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (workout) => {
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] })
      // Journal's per-day rollup is a separate cached query — invalidate it too so a newly
      // started session shows up there immediately instead of waiting out its staleTime.
      queryClient.invalidateQueries({ queryKey: ['day_rollup_workouts', user?.id] })
      navigate(`/workouts/${workout.id}`)
    },
  })
}

export function useDeleteWorkout() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workoutId: string) => {
      const { error } = await supabase.from('workouts').delete().eq('id', workoutId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['day_rollup_workouts', user?.id] })
    },
  })
}

export function useUpdateWorkoutDate(workoutId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (workoutDate: string) => {
      const { error } = await supabase.from('workouts').update({ workout_date: workoutDate }).eq('id', workoutId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
      queryClient.invalidateQueries({ queryKey: ['workouts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['day_rollup_workouts', user?.id] })
    },
  })
}

export function useUpdateWorkoutNotes(workoutId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (notes: string) => {
      const { error } = await supabase.from('workouts').update({ notes }).eq('id', workoutId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
      queryClient.invalidateQueries({ queryKey: ['day_rollup_workouts', user?.id] })
    },
  })
}
