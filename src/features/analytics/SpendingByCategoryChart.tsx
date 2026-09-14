import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#0ea5e9', '#6366f1', '#f59e0b', '#f43f5e']

export function SpendingByCategoryChart({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['analytics_spending_category', user?.id, startDate, endDate],
    enabled: !!user,
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, category:finance_categories(name)')
        .eq('direction', 'out')
        .gte('txn_date', startDate)
        .lte('txn_date', endDate)
      if (error) throw error

      const byCategory = new Map<string, number>()
      for (const t of transactions ?? []) {
        const name = (t.category as unknown as { name: string } | null)?.name ?? 'Uncategorized'
        byCategory.set(name, (byCategory.get(name) ?? 0) + t.amount)
      }

      return Array.from(byCategory.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    },
  })

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400">No spending in this range.</p>
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
