import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { ExerciseType } from '../../types/database.types'

export function useExercises() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['exercises', user?.id]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('exercises').select('*').order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const createCustom = useMutation({
    mutationFn: async (input: { name: string; category: string; exercise_type: ExerciseType }) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...input, user_id: user.id, is_custom: true })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const remove = useMutation({
    mutationFn: async (exerciseId: string) => {
      const { error } = await supabase.from('exercises').delete().eq('id', exerciseId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, createCustom, remove }
}
