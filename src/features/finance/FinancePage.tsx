import { useState } from 'react'
import { CategoryManager } from './CategoryManager'
import { CsvImportWizard } from './csv-import/CsvImportWizard'
import { TransactionForm } from './TransactionForm'
import { TransactionsList } from './TransactionsList'

export function FinancePage() {
  const [importOpen, setImportOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Finance</h1>
          <p className="text-sm text-slate-500">Track money in and out, and where it goes.</p>
        </div>
        <button
          onClick={() => setImportOpen(true)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Import CSV
        </button>
      </div>

      <TransactionForm />
      <CategoryManager />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Transactions</h2>
        <TransactionsList />
      </div>

      {importOpen && <CsvImportWizard onClose={() => setImportOpen(false)} />}
    </div>
  )
}
