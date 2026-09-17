import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import type { TransactionDirection } from '../../types/database.types'
import { todayISO } from '../../utils/dates'
import { useCategories } from './useCategories'
import { useTransactions } from './useTransactions'

export function TransactionForm({ onClose }: { onClose: () => void }) {
  const { create } = useTransactions()
  const { data: categories } = useCategories()
  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<TransactionDirection>('out')
  const [categoryId, setCategoryId] = useState('')
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
      note: note.trim() || null,
    })
    onClose()
  }

  const categoryDirection = direction === 'in' ? 'income' : 'expense'
  const filteredCategories = (categories ?? []).filter((c) => c.direction === categoryDirection || c.direction === 'both')

  return (
    <Modal title="Add transaction" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as TransactionDirection)}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="out">Money out</option>
              <option value="in">Money in</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Amount</label>
          <input
            autoFocus
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
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
          className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add transaction
        </button>
      </form>
    </Modal>
  )
}
