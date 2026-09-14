import { useState, type FormEvent } from 'react'
import type { TransactionDirection } from '../../types/database.types'
import { todayISO } from '../../utils/dates'
import { useAccounts } from './useAccounts'
import { useCategories } from './useCategories'
import { useTransactions } from './useTransactions'

export function TransactionForm() {
  const { create } = useTransactions()
  const { data: categories } = useCategories()
  const { data: accounts } = useAccounts()
  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<TransactionDirection>('out')
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return
    create.mutate({
      txnDate: date,
      amount: value,
      direction,
      categoryId: categoryId || null,
      accountId: accountId || null,
      note: note.trim() || null,
    })
    setAmount('')
    setNote('')
  }

  const categoryDirection = direction === 'in' ? 'income' : 'expense'
  const filteredCategories = (categories ?? []).filter((c) => c.direction === categoryDirection || c.direction === 'both')

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label className="block text-xs font-medium text-slate-500">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Direction</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as TransactionDirection)}
          className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="out">Money out</option>
          <option value="in">Money in</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Uncategorized</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Account</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">No account</option>
          {(accounts ?? []).map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[10rem]">
        <label className="block text-xs font-medium text-slate-500">Note</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="optional"
          className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        Add transaction
      </button>
    </form>
  )
}
