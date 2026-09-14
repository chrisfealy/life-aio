import { Modal } from '../../components/ui/Modal'
import { HabitForm } from './HabitForm'
import { useHabits } from './useHabits'

export function AddHabitModal({ onClose }: { onClose: () => void }) {
  const { create } = useHabits()

  return (
    <Modal title="Add habit" onClose={onClose}>
      <HabitForm
        onSubmit={(input) => {
          create.mutate(input)
          onClose()
        }}
        submitting={create.isPending}
      />
    </Modal>
  )
}
