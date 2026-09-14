import { useMemo, useState } from 'react'
import { useExercises } from './useExercises'

const CATEGORY_ORDER = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body', 'cardio']

export function ExerciseLibraryPanel() {
  const { data: exercises, isLoading, remove } = useExercises()
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const filtered = (exercises ?? []).filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    const byCategory = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const list = byCategory.get(e.category) ?? []
      list.push(e)
      byCategory.set(e.category, list)
    }
    return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
      category: c,
      exercises: (byCategory.get(c) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }))
  }, [exercises, search])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" from your exercise library?`)) return
    setError(null)
    try {
      await remove.mutateAsync(id)
    } catch {
      setError(`Can't delete "${name}" — it's already used in a workout or program.`)
    }
  }

  if (isLoading) return <p className="mt-2 text-sm text-slate-400">Loading…</p>

  return (
    <div className="mt-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search exercises…"
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 max-h-96 space-y-4 overflow-y-auto">
        {grouped.map(({ category, exercises: list }) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{category.replace('_', ' ')}</h3>
            <ul className="mt-1 divide-y divide-slate-100">
              {list.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-slate-700">{e.name}</span>
                  <span className="flex items-center gap-2">
                    {e.is_custom && <span className="text-xs text-slate-400">custom</span>}
                    {e.is_custom && (
                      <button onClick={() => handleDelete(e.id, e.name)} className="text-xs text-slate-300 hover:text-red-600">
                        Delete
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {grouped.length === 0 && <p className="text-sm text-slate-400">No exercises match.</p>}
      </div>
    </div>
  )
}
