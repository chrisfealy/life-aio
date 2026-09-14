import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { HabitType } from '../../types/database.types'

export interface HabitInput {
  name: string
  description?: string | null
  habit_type: HabitType
  target_value?: number | null
  unit?: string | null
}

export function useHabits(includeArchived = false) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['habits', user?.id, includeArchived]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from('habits').select('*').order('sort_order', { ascending: true })
      if (!includeArchived) q = q.eq('is_archived', false)
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (input: HabitInput) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits', user?.id] }),
  })

  const update = useMutation({
    mutationFn: async (input: {
      id: string
      name: string
      habitType: HabitType
      unit?: string | null
      targetValue?: number | null
    }) => {
      const { error } = await supabase
        .from('habits')
        .update({
          name: input.name,
          habit_type: input.habitType,
          unit: input.unit ?? null,
          target_value: input.targetValue ?? null,
        })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits', user?.id] }),
  })

  const archive = useMutation({
    mutationFn: async (habitId: string) => {
      const { error } = await supabase.from('habits').update({ is_archived: true }).eq('id', habitId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits', user?.id] }),
  })

  return { ...query, create, update, archive }
}
