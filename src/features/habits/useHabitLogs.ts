import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function useHabitLogs(logDate: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['habit_logs', user?.id, logDate]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_logs').select('*').eq('log_date', logDate)
      if (error) throw error
      return data
    },
  })

  const upsertLog = useMutation({
    mutationFn: async (input: { habitId: string; completed?: boolean | null; value?: number | null }) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          {
            user_id: user.id,
            habit_id: input.habitId,
            log_date: logDate,
            completed: input.completed ?? null,
            value: input.value ?? null,
          },
          { onConflict: 'habit_id,log_date' },
        )
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, upsertLog }
}
