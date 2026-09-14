import { Modal } from '../../components/ui/Modal'
import { HabitForm } from './HabitForm'
import { useHabits } from './useHabits'

export function ManageHabitsModal({ onClose }: { onClose: () => void }) {
  const { data: habits, create, archive } = useHabits()

  return (
    <Modal title="Manage habits" onClose={onClose}>
      <div className="space-y-4">
        <HabitForm onSubmit={(input) => create.mutate(input)} submitting={create.isPending} />

        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {(habits ?? []).map((habit) => (
            <li key={habit.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{habit.name}</p>
                <p className="text-xs text-slate-400">
                  {habit.habit_type === 'boolean' ? 'Yes / No' : `Numeric${habit.unit ? ` (${habit.unit})` : ''}`}
                </p>
              </div>
              <button onClick={() => archive.mutate(habit.id)} className="text-xs text-slate-400 hover:text-red-600">
                Archive
              </button>
            </li>
          ))}
          {(habits ?? []).length === 0 && <li className="px-3 py-2 text-sm text-slate-400">No habits yet.</li>}
        </ul>
      </div>
    </Modal>
  )
}
