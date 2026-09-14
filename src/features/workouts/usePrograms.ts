import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function usePrograms() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['workout_programs', user?.id]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('workout_programs').select('*').order('name')
      if (error) throw error
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (input: { name: string; description?: string | null }) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('workout_programs')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const update = useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase.from('workout_programs').update({ name: input.name }).eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const remove = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase.from('workout_programs').delete().eq('id', programId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, create, update, remove }
}

export function useProgramExercises(programId: string | null) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['workout_program_exercises', programId]

  const query = useQuery({
    queryKey,
    enabled: !!programId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_program_exercises')
        .select('*, exercise:exercises(*)')
        .eq('program_id', programId as string)
        .order('sort_order')
      if (error) throw error
      return data
    },
  })

  const addExercise = useMutation({
    mutationFn: async (input: {
      exerciseId: string
      targetSets?: number | null
      targetReps?: number | null
      targetWeight?: number | null
      sortOrder: number
    }) => {
      if (!user || !programId) throw new Error('Missing program')
      const { error } = await supabase.from('workout_program_exercises').insert({
        user_id: user.id,
        program_id: programId,
        exercise_id: input.exerciseId,
        target_sets: input.targetSets ?? null,
        target_reps: input.targetReps ?? null,
        target_weight: input.targetWeight ?? null,
        sort_order: input.sortOrder,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const removeExercise = useMutation({
    mutationFn: async (programExerciseId: string) => {
      const { error } = await supabase.from('workout_program_exercises').delete().eq('id', programExerciseId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  // Drag-and-drop reordering hands back the whole new row order at once; rewrite every row's
  // sort_order to match its new index.
  const reorder = useMutation({
    mutationFn: async (orderedProgramExerciseIds: string[]) => {
      const results = await Promise.all(
        orderedProgramExerciseIds.map((id, index) =>
          supabase.from('workout_program_exercises').update({ sort_order: index }).eq('id', id),
        ),
      )
      const failed = results.find((r) => r.error)
      if (failed?.error) throw failed.error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, addExercise, removeExercise, reorder }
}
