import { useState } from 'react'
import type { Database, TransactionDirection } from '../../types/database.types'
import { formatISO } from '../../utils/dates'
import { useCategories } from './useCategories'
import { useTransactions } from './useTransactions'

type Transaction = Database['public']['Tables']['transactions']['Row']

export function TransactionsList() {
  const { data: transactions, isLoading, update, remove } = useTransactions({ limit: 100 })
  const { data: categories } = useCategories()
  const [editingId, setEditingId] = useState<string | null>(null)

  if (isLoading) return <p className="text-sm text-slate-400">Loading…</p>
  if (!transactions || transactions.length === 0) {
    return <p className="text-sm text-slate-400">No transactions yet — tap + to add one.</p>
  }

  return (
    <ul className="divide-y divide-slate-100">
      {transactions.map((t) =>
        editingId === t.id ? (
          <EditRow
            key={t.id}
            transaction={t as unknown as Transaction}
            categories={categories ?? []}
            saving={update.isPending}
            onCancel={() => setEditingId(null)}
            onSave={(input) => {
              update.mutate({ id: t.id, ...input })
              setEditingId(null)
            }}
          />
        ) : (
          <li key={t.id} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <span className="text-slate-500">{formatISO(t.txn_date, 'MMM d, yyyy')}</span>
                <span className="truncate text-slate-700">
                  {(t.category as unknown as { name: string } | null)?.name ?? 'Uncategorized'}
                </span>
                {t.source === 'csv_import' && (
                  <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-400">csv</span>
                )}
              </div>
              {t.note && <p className="truncate text-xs text-slate-400">{t.note}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className={`text-sm font-medium ${t.direction === 'in' ? 'text-emerald-600' : 'text-slate-800'}`}>
                {t.direction === 'in' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
              <span className="flex gap-2 text-xs">
                <button onClick={() => setEditingId(t.id)} className="text-slate-400 hover:text-slate-900">
                  Edit
                </button>
                <button onClick={() => remove.mutate(t.id)} className="text-slate-400 hover:text-red-600">
                  Delete
                </button>
              </span>
            </div>
          </li>
        ),
      )}
    </ul>
  )
}

function EditRow({
  transaction,
  categories,
  saving,
  onCancel,
  onSave,
}: {
  transaction: Transaction
  categories: { id: string; name: string; direction: string }[]
  saving: boolean
  onCancel: () => void
  onSave: (input: {
    txnDate: string
    amount: number
    direction: TransactionDirection
    categoryId: string | null
    note: string | null
  }) => void
}) {
  const [date, setDate] = useState(transaction.txn_date)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [direction, setDirection] = useState<TransactionDirection>(transaction.direction)
  const [categoryId, setCategoryId] = useState(transaction.category_id ?? '')
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
      note: note.trim() || null,
    })
  }

  return (
    <li className="space-y-2 rounded-md bg-slate-50 px-2 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-slate-300 px-1.5 py-1 text-sm"
        />
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as TransactionDirection)}
          className="rounded border border-slate-300 px-1.5 py-1 text-sm"
        >
          <option value="out">out</option>
          <option value="in">in</option>
        </select>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 rounded border border-slate-300 px-1.5 py-1 text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border border-slate-300 px-1.5 py-1 text-sm"
        >
          <option value="">Uncategorized</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="note"
          className="min-w-0 flex-1 rounded border border-slate-300 px-1.5 py-1 text-sm"
        />
      </div>
      <div className="flex justify-end gap-3 text-xs">
        <button onClick={handleSave} disabled={saving} className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50">
          Save
        </button>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700">
          Cancel
        </button>
      </div>
    </li>
  )
}
