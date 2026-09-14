import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

// Mutates a workout's planned_exercise_ids — the durable, session-only list of which
// exercises belong to this session. Every mutation takes the caller's current view of the
// list (`currentIds`) and writes the full updated array back, so it also naturally persists
// a legacy/backfilled list the first time an old pre-planned_exercise_ids session is edited.
export function useSessionPlan(workoutId: string) {
  const queryClient = useQueryClient()

  async function writePlan(ids: string[]) {
    const { error } = await supabase.from('workouts').update({ planned_exercise_ids: ids }).eq('id', workoutId)
    if (error) throw error
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['workout', workoutId] })
  }

  const addExercise = useMutation({
    mutationFn: async (input: { currentIds: string[]; exerciseId: string }) => {
      if (input.currentIds.includes(input.exerciseId)) return
      await writePlan([...input.currentIds, input.exerciseId])
    },
    onSuccess: invalidate,
  })

  const swapExercise = useMutation({
    mutationFn: async (input: { currentIds: string[]; fromExerciseId: string; toExerciseId: string }) => {
      const nextIds = input.currentIds.map((id) => (id === input.fromExerciseId ? input.toExerciseId : id))
      await writePlan(nextIds)
    },
    onSuccess: invalidate,
  })

  const removeExercise = useMutation({
    mutationFn: async (input: { currentIds: string[]; exerciseId: string }) => {
      await writePlan(input.currentIds.filter((id) => id !== input.exerciseId))
      // Also drop any sets already logged against it in this session — it's being removed
      // entirely, not just hidden.
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', workoutId)
        .eq('exercise_id', input.exerciseId)
      if (error) throw error
    },
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['workout_sets', workoutId] })
    },
  })

  // Drag-and-drop reordering hands back the whole new order at once.
  const reorder = useMutation({
    mutationFn: async (nextIds: string[]) => {
      await writePlan(nextIds)
    },
    onSuccess: invalidate,
  })

  return { addExercise, swapExercise, removeExercise, reorder }
}
