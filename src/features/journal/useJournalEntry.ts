import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function useJournalEntry(entryDate: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['journal_entries', user?.id, entryDate]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('entry_date', entryDate)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })

  const save = useMutation({
    mutationFn: async (summary: string) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('journal_entries')
        .upsert(
          { user_id: user.id, entry_date: entryDate, summary, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,entry_date' },
        )
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data)
    },
  })

  return { ...query, save }
}
