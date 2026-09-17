import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { Database, TransactionDirection } from '../../types/database.types'

export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export function useTransactions(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['transactions', user?.id, options?.startDate, options?.endDate, options?.limit]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from('transactions')
        .select('*, category:finance_categories(name, color)')
        .order('txn_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (options?.startDate) q = q.gte('txn_date', options.startDate)
      if (options?.endDate) q = q.lte('txn_date', options.endDate)
      if (options?.limit) q = q.limit(options.limit)
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    // Journal's per-day rollup is a separate cached query — invalidate it too so
    // changes show up immediately instead of waiting out staleTime.
    queryClient.invalidateQueries({ queryKey: ['day_rollup_transactions', user?.id] })
  }

  const create = useMutation({
    mutationFn: async (input: {
      txnDate: string
      amount: number
      direction: TransactionDirection
      categoryId?: string | null
      note?: string | null
    }) => {
      if (!user) throw new Error('Not signed in')
      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        txn_date: input.txnDate,
        amount: input.amount,
        direction: input.direction,
        category_id: input.categoryId ?? null,
        note: input.note ?? null,
        source: 'manual',
      })
      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  const update = useMutation({
    mutationFn: async (input: {
      id: string
      txnDate: string
      amount: number
      direction: TransactionDirection
      categoryId?: string | null
      note?: string | null
    }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          txn_date: input.txnDate,
          amount: input.amount,
          direction: input.direction,
          category_id: input.categoryId ?? null,
          note: input.note ?? null,
        })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  const remove = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId)
      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  const importBatch = useMutation({
    mutationFn: async (input: {
      filename: string
      rows: Omit<TransactionInsert, 'user_id' | 'source' | 'import_batch_id'>[]
    }) => {
      if (!user) throw new Error('Not signed in')
      const { data: batch, error: batchError } = await supabase
        .from('csv_import_batches')
        .insert({ user_id: user.id, filename: input.filename, row_count: input.rows.length })
        .select('*')
        .single()
      if (batchError) throw batchError

      const rows: TransactionInsert[] = input.rows.map((r) => ({
        ...r,
        user_id: user.id,
        source: 'csv_import',
        import_batch_id: batch.id,
      }))
      const { error: insertError } = await supabase.from('transactions').insert(rows)
      if (insertError) throw insertError
      return batch
    },
    onSuccess: invalidateAll,
  })

  return { ...query, create, update, remove, importBatch }
}
