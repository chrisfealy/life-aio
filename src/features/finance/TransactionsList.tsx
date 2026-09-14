import { useState } from 'react'
import type { Database, TransactionDirection } from '../../types/database.types'
import { formatISO } from '../../utils/dates'
import { useAccounts } from './useAccounts'
import { useCategories } from './useCategories'
import { useTransactions } from './useTransactions'

type Transaction = Database['public']['Tables']['transactions']['Row']

export function TransactionsList() {
  const { data: transactions, isLoading, update, remove } = useTransactions({ limit: 100 })
  const { data: categories } = useCategories()
  const { data: accounts } = useAccounts()
  const [editingId, setEditingId] = useState<string | null>(null)

  if (isLoading) return <p className="text-sm text-slate-400">Loading…</p>
  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-slate-400">No transactions yet.</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
          <th className="py-2 font-medium">Date</th>
          <th className="py-2 font-medium">Category</th>
          <th className="py-2 font-medium">Account</th>
          <th className="py-2 font-medium">Note</th>
          <th className="py-2 text-right font-medium">Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) =>
          editingId === t.id ? (
            <EditRow
              key={t.id}
              transaction={t as unknown as Transaction}
              categories={categories ?? []}
              accounts={accounts ?? []}
              saving={update.isPending}
              onCancel={() => setEditingId(null)}
              onSave={(input) => {
                update.mutate({ id: t.id, ...input })
                setEditingId(null)
              }}
            />
          ) : (
            <tr key={t.id} className="border-b border-slate-100">
              <td className="py-1.5 text-slate-600">{formatISO(t.txn_date, 'MMM d, yyyy')}</td>
              <td className="py-1.5 text-slate-600">
                {(t.category as unknown as { name: string } | null)?.name ?? '—'}
                {t.source === 'csv_import' && (
                  <span className="ml-1 rounded bg-slate-100 px-1 text-[10px] text-slate-400">csv</span>
                )}
              </td>
              <td className="py-1.5 text-slate-500">{(t.account as unknown as { name: string } | null)?.name ?? '—'}</td>
              <td className="py-1.5 text-slate-500">{t.note ?? ''}</td>
              <td className={`py-1.5 text-right font-medium ${t.direction === 'in' ? 'text-emerald-600' : 'text-slate-800'}`}>
                {t.direction === 'in' ? '+' : '-'}${t.amount.toFixed(2)}
              </td>
              <td className="py-1.5 text-right">
                <span className="flex justify-end gap-2 text-xs">
                  <button onClick={() => setEditingId(t.id)} className="text-slate-400 hover:text-slate-900">
                    Edit
                  </button>
                  <button onClick={() => remove.mutate(t.id)} className="text-slate-400 hover:text-red-600">
                    Delete
                  </button>
                </span>
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  )
}

function EditRow({
  transaction,
  categories,
  accounts,
  saving,
  onCancel,
  onSave,
}: {
  transaction: Transaction
  categories: { id: string; name: string; direction: string }[]
  accounts: { id: string; name: string }[]
  saving: boolean
  onCancel: () => void
  onSave: (input: {
    txnDate: string
    amount: number
    direction: TransactionDirection
    categoryId: string | null
    accountId: string | null
    note: string | null
  }) => void
}) {
  const [date, setDate] = useState(transaction.txn_date)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [direction, setDirection] = useState<TransactionDirection>(transaction.direction)
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? '')
  const [accountId, setAccountId] = useState(transaction.account_id ?? '')
  const [note, setNote] = useState(transaction.note ?? '')

  const categoryDirection = direction === 'in' ? 'income' : 'expense'
  const filteredCategories = categories.filter((c) => c.direction === categoryDirection || c.direction === 'both')

  function handleSave() {
    const value = Number(amount)
    if (!value || value <= 0) return
    onSave({
      txnDate: date,
      amount: value,
      direction,
      categoryId: categoryId || null,
      accountId: accountId || null,
      note: note.trim() || null,
    })
  }

  return (
    <tr className="border-b border-slate-100 bg-slate-50">
      <td className="py-1.5">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-32 rounded border border-slate-300 px-1.5 py-1 text-sm" />
      </td>
      <td className="py-1.5">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded border border-slate-300 px-1.5 py-1 text-sm">
          <option value="">Uncategorized</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-1.5">
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="rounded border border-slate-300 px-1.5 py-1 text-sm">
          <option value="">No account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-1.5">
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded border border-slate-300 px-1.5 py-1 text-sm" />
      </td>
      <td className="py-1.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as TransactionDirection)}
            className="rounded border border-slate-300 px-1 py-1 text-xs"
          >
            <option value="out">out</option>
            <option value="in">in</option>
          </select>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-20 rounded border border-slate-300 px-1.5 py-1 text-right text-sm"
          />
        </div>
      </td>
      <td className="py-1.5 text-right">
        <span className="flex justify-end gap-2 text-xs">
          <button onClick={handleSave} disabled={saving} className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50">
            Save
          </button>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700">
            Cancel
          </button>
        </span>
      </td>
    </tr>
  )
}
