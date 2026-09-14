import { parse as parseDate, isValid } from 'date-fns'
import Papa from 'papaparse'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useCategories, useCategoryRules, suggestCategoryId } from '../useCategories'
import { useTransactions, type TransactionInsert } from '../useTransactions'

type Step = 'upload' | 'map' | 'preview'

interface ParsedRow {
  include: boolean
  date: string | null
  amount: number | null
  direction: 'in' | 'out'
  description: string
  categoryId: string | null
  isDuplicate: boolean
}

const DATE_FORMATS = ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'M/d/yyyy'] as const

export function CsvImportWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>('upload')
  const [filename, setFilename] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])

  const [dateCol, setDateCol] = useState('')
  const [descCol, setDescCol] = useState('')
  const [dateFormat, setDateFormat] = useState<(typeof DATE_FORMATS)[number]>('MM/dd/yyyy')
  const [splitMode, setSplitMode] = useState(false)
  const [amountCol, setAmountCol] = useState('')
  const [debitCol, setDebitCol] = useState('')
  const [creditCol, setCreditCol] = useState('')

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])

  const { data: categories } = useCategories()
  const { data: rules } = useCategoryRules()
  const { data: existingTransactions } = useTransactions({ limit: 500 })
  const { importBatch } = useTransactions()

  function handleFile(file: File) {
    setFilename(file.name)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields ?? [])
        setRawRows(results.data)
        setStep('map')
      },
    })
  }

  function normalizeRows() {
    const existingKeys = new Set(
      (existingTransactions ?? []).map((t) => `${t.txn_date}|${t.amount}|${t.raw_description ?? ''}`),
    )

    const rows: ParsedRow[] = rawRows.map((raw) => {
      const rawDateStr = dateCol ? raw[dateCol] : ''
      const parsedDate = rawDateStr ? parseDate(rawDateStr, dateFormat, new Date()) : null
      const dateISO = parsedDate && isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : null

      let amount: number | null = null
      let direction: 'in' | 'out' = 'out'

      if (splitMode) {
        const debit = debitCol ? parseFloat(raw[debitCol] || '0') : 0
        const credit = creditCol ? parseFloat(raw[creditCol] || '0') : 0
        if (credit > 0) {
          amount = credit
          direction = 'in'
        } else if (debit > 0) {
          amount = debit
          direction = 'out'
        }
      } else {
        const raw_val = amountCol ? parseFloat(raw[amountCol] || '0') : 0
        amount = Math.abs(raw_val)
        direction = raw_val < 0 ? 'out' : 'in'
      }

      const description = descCol ? raw[descCol] ?? '' : ''
      const categoryId = suggestCategoryId(description, rules)
      const isDuplicate = dateISO !== null && amount !== null && existingKeys.has(`${dateISO}|${amount}|${description}`)

      return {
        include: !isDuplicate,
        date: dateISO,
        amount,
        direction,
        description,
        categoryId,
        isDuplicate,
      }
    })

    setParsedRows(rows)
    setStep('preview')
  }

  function updateRow(index: number, patch: Partial<ParsedRow>) {
    setParsedRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  const includedCount = useMemo(() => parsedRows.filter((r) => r.include).length, [parsedRows])

  async function handleConfirm() {
    const rows: Omit<TransactionInsert, 'user_id' | 'source' | 'import_batch_id'>[] = parsedRows
      .filter((r) => r.include && r.date && r.amount)
      .map((r) => ({
        txn_date: r.date as string,
        amount: r.amount as number,
        direction: r.direction,
        category_id: r.categoryId,
        raw_description: r.description,
        note: null,
      }))

    if (rows.length === 0) return
    await importBatch.mutateAsync({ filename, rows })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-black/30 p-4" onClick={onClose}>
      <div
        className="my-8 w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Import CSV</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        {step === 'upload' && (
          <div>
            <p className="text-sm text-slate-500">Choose a CSV export from your bank.</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="mt-3 text-sm"
            />
          </div>
        )}

        {step === 'map' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Map your bank's columns ({headers.length} columns detected in {filename}).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date column">
                <Select value={dateCol} onChange={setDateCol} options={headers} />
              </Field>
              <Field label="Date format">
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as (typeof DATE_FORMATS)[number])}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                >
                  {DATE_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description column">
                <Select value={descCol} onChange={setDescCol} options={headers} />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={splitMode} onChange={(e) => setSplitMode(e.target.checked)} />
              My bank uses separate debit/credit columns
            </label>

            {splitMode ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Debit (money out) column">
                  <Select value={debitCol} onChange={setDebitCol} options={headers} />
                </Field>
                <Field label="Credit (money in) column">
                  <Select value={creditCol} onChange={setCreditCol} options={headers} />
                </Field>
              </div>
            ) : (
              <Field label="Amount column (negative = money out)">
                <Select value={amountCol} onChange={setAmountCol} options={headers} />
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setStep('upload')} className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
                Back
              </button>
              <button
                onClick={normalizeRows}
                disabled={!dateCol || (!splitMode && !amountCol) || (splitMode && !debitCol && !creditCol)}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <p className="text-sm text-slate-500">
              {includedCount} of {parsedRows.length} rows will be imported. Duplicates are unchecked by default.
            </p>
            <div className="mt-2 max-h-96 overflow-y-auto rounded-md border border-slate-200">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="p-2"></th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className={`border-t border-slate-100 ${row.isDuplicate ? 'bg-amber-50' : ''}`}>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={row.include}
                          onChange={(e) => updateRow(i, { include: e.target.checked })}
                        />
                      </td>
                      <td className="p-2">{row.date ?? '—'}</td>
                      <td className="p-2">{row.description}</td>
                      <td className={row.direction === 'in' ? 'p-2 text-emerald-600' : 'p-2'}>
                        {row.direction === 'in' ? '+' : '-'}
                        {row.amount?.toFixed(2) ?? '—'}
                      </td>
                      <td className="p-2">
                        <select
                          value={row.categoryId ?? ''}
                          onChange={(e) => updateRow(i, { categoryId: e.target.value || null })}
                          className="rounded border border-slate-200 px-1 py-0.5 text-xs"
                        >
                          <option value="">Uncategorized</option>
                          {(categories ?? []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setStep('map')} className="rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={includedCount === 0 || importBatch.isPending}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {importBatch.isPending ? 'Importing…' : `Import ${includedCount} transactions`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
