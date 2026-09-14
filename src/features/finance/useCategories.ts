import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { CategoryDirection } from '../../types/database.types'

export function useCategories() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['finance_categories', user?.id]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .eq('is_archived', false)
        .order('name')
      if (error) throw error
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (input: { name: string; direction: CategoryDirection; color?: string | null }) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('finance_categories')
        .insert({ ...input, user_id: user.id })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const update = useMutation({
    mutationFn: async (input: { id: string; name: string; direction: CategoryDirection }) => {
      const { error } = await supabase
        .from('finance_categories')
        .update({ name: input.name, direction: input.direction })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const archive = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase.from('finance_categories').update({ is_archived: true }).eq('id', categoryId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, create, update, archive }
}

export function useCategoryRules() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['category_rules', user?.id]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('category_rules').select('*')
      if (error) throw error
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (input: { categoryId: string; keyword: string }) => {
      if (!user) throw new Error('Not signed in')
      const { error } = await supabase
        .from('category_rules')
        .insert({ user_id: user.id, category_id: input.categoryId, keyword: input.keyword.toLowerCase() })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, create }
}

export function suggestCategoryId(
  description: string,
  rules: { keyword: string; category_id: string }[] | undefined,
): string | null {
  if (!rules) return null
  const lower = description.toLowerCase()
  const match = rules.find((r) => lower.includes(r.keyword.toLowerCase()))
  return match?.category_id ?? null
}
