import { Plus } from 'lucide-react'

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-slate-700"
      aria-label={label}
    >
      <Plus className="h-4 w-4" />
    </button>
  )
}
