import { useState } from 'react'
import type { AccountType } from '../../types/database.types'
import { useAccountBalances, useAccounts } from './useAccounts'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
]

function typeLabel(type: AccountType) {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type
}

export function AccountsManager() {
  const { data: accounts, create, update, archive } = useAccounts()
  const { data: balances } = useAccountBalances()

  const [name, setName] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('checking')
  const [startingBalance, setStartingBalance] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<AccountType>('checking')
  const [editBalance, setEditBalance] = useState('')

  function handleCreate() {
    if (!name.trim()) return
    create.mutate({ name: name.trim(), accountType, startingBalance: Number(startingBalance) || 0 })
    setName('')
    setStartingBalance('')
  }

  function startEdit(id: string, currentName: string, currentType: AccountType, currentBalance: number) {
    setEditingId(id)
    setEditName(currentName)
    setEditType(currentType)
    setEditBalance(currentBalance.toString())
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return
    update.mutate({ id: editingId, name: editName.trim(), accountType: editType, startingBalance: Number(editBalance) || 0 })
    setEditingId(null)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">Accounts</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chase Checking"
          className="flex-1 min-w-[8rem] rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as AccountType)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          value={startingBalance}
          onChange={(e) => setStartingBalance(e.target.value)}
          placeholder="Starting balance"
          className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
        <button
          onClick={handleCreate}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add
        </button>
      </div>

      <ul className="mt-3 space-y-1">
        {(accounts ?? []).map((a) =>
          editingId === a.id ? (
            <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-md bg-slate-50 px-2 py-1.5">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 min-w-[8rem] rounded-md border border-slate-300 px-2 py-1 text-sm"
                autoFocus
              />
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as AccountType)}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
              <button onClick={saveEdit} className="text-xs font-medium text-slate-700 hover:text-slate-900">
                Save
              </button>
              <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-700">
                Cancel
              </button>
            </li>
          ) : (
            <li key={a.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-slate-50">
              <span className="text-sm text-slate-700">
                {a.name} <span className="text-xs text-slate-400">({typeLabel(a.account_type)})</span>
              </span>
              <span className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    (balances?.get(a.id) ?? a.starting_balance) < 0 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  ${(balances?.get(a.id) ?? a.starting_balance).toFixed(2)}
                </span>
                <span className="flex gap-2 text-xs">
                  <button
                    onClick={() => startEdit(a.id, a.name, a.account_type, a.starting_balance)}
                    className="text-slate-400 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button onClick={() => archive.mutate(a.id)} className="text-slate-400 hover:text-red-600">
                    Delete
                  </button>
                </span>
              </span>
            </li>
          ),
        )}
        {(accounts ?? []).length === 0 && <p className="text-sm text-slate-400">No accounts yet — add one above.</p>}
      </ul>
    </div>
  )
}
