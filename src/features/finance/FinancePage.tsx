import { useState } from 'react'
import { AddButton } from '../../components/ui/AddButton'
import { CategoryManager } from './CategoryManager'
import { CsvImportWizard } from './csv-import/CsvImportWizard'
import { TransactionForm } from './TransactionForm'
import { TransactionsList } from './TransactionsList'

export function FinancePage() {
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Finance</h1>
          <p className="text-sm text-slate-500">Track money in and out.</p>
        </div>
        <button
          onClick={() => setImportOpen(true)}
          className="hidden rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block"
        >
          Import CSV
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Transactions</h2>
          <AddButton onClick={() => setAddOpen(true)} label="Add transaction" />
        </div>
        <div className="mt-3">
          <TransactionsList />
        </div>
      </div>

      <CategoryManager />

      {addOpen && <TransactionForm onClose={() => setAddOpen(false)} />}
      {importOpen && <CsvImportWizard onClose={() => setImportOpen(false)} />}
    </div>
  )
}
