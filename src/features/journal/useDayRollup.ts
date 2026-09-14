import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function useDayRollup(date: string) {
  const { user } = useAuth()

  const workouts = useQuery({
    queryKey: ['day_rollup_workouts', user?.id, date],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, workout_type, notes, program:workout_programs(name)')
        .eq('workout_date', date)
      if (error) throw error
      return data
    },
  })

  const transactions = useQuery({
    queryKey: ['day_rollup_transactions', user?.id, date],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, direction, note')
        .eq('txn_date', date)
      if (error) throw error
      return data
    },
  })

  return { workouts, transactions }
}
