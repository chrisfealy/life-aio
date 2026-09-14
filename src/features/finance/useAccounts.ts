import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { AccountType } from '../../types/database.types'

export function useAccounts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['finance_accounts', user?.id]

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_accounts')
        .select('*')
        .eq('is_archived', false)
        .order('sort_order')
        .order('name')
      if (error) throw error
      return data
    },
  })

  const create = useMutation({
    mutationFn: async (input: { name: string; accountType: AccountType; startingBalance: number }) => {
      if (!user) throw new Error('Not signed in')
      const { data, error } = await supabase
        .from('finance_accounts')
        .insert({
          name: input.name,
          account_type: input.accountType,
          starting_balance: input.startingBalance,
          user_id: user.id,
        })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const update = useMutation({
    mutationFn: async (input: { id: string; name: string; accountType: AccountType; startingBalance: number }) => {
      const { error } = await supabase
        .from('finance_accounts')
        .update({ name: input.name, account_type: input.accountType, starting_balance: input.startingBalance })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const archive = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase.from('finance_accounts').update({ is_archived: true }).eq('id', accountId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, create, update, archive }
}

// Balance per account = starting_balance + sum(in) - sum(out) of its own transactions.
export function useAccountBalances() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['finance_account_balances', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: accounts, error: accountsError }, { data: transactions, error: transactionsError }] = await Promise.all([
        supabase.from('finance_accounts').select('id, starting_balance').eq('is_archived', false),
        supabase.from('transactions').select('account_id, amount, direction').not('account_id', 'is', null),
      ])
      if (accountsError) throw accountsError
      if (transactionsError) throw transactionsError

      const balances = new Map<string, number>()
      for (const account of accounts ?? []) balances.set(account.id, account.starting_balance)
      for (const txn of transactions ?? []) {
        if (!txn.account_id) continue
        const current = balances.get(txn.account_id) ?? 0
        balances.set(txn.account_id, current + (txn.direction === 'in' ? txn.amount : -txn.amount))
      }
      return balances
    },
  })
}
