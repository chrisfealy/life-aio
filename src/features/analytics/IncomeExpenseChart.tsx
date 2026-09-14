import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

export function IncomeExpenseChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['analytics_income_expense', user?.id, startDate, endDate],
    enabled: !!user,
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('txn_date, amount, direction')
        .gte('txn_date', startDate)
        .lte('txn_date', endDate)
      if (error) throw error

      const monthly = new Map<string, { income: number; expense: number }>()
      for (const t of transactions ?? []) {
        const monthKey = format(parseISO(t.txn_date), 'yyyy-MM')
        const bucket = monthly.get(monthKey) ?? { income: 0, expense: 0 }
        if (t.direction === 'in') bucket.income += t.amount
        else bucket.expense += t.amount
        monthly.set(monthKey, bucket)
      }

      return Array.from(monthly.entries())
        .map(([month, v]) => ({ month, ...v }))
        .sort((a, b) => a.month.localeCompare(b.month))
    },
  })

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400">No transactions in this range.</p>
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
