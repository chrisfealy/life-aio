// Epley formula: a standard, simple estimate of one-rep max from a submaximal set.
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 1) return weight
  return weight * (1 + reps / 30)
}
