import { useState } from 'react'
import { addDaysISO, todayISO } from '../../utils/dates'

export type RangePreset = 30 | 90 | 365

export function useAnalyticsRange(defaultPreset: RangePreset = 90) {
  const [preset, setPreset] = useState<RangePreset>(defaultPreset)
  const endDate = todayISO()
  const startDate = addDaysISO(endDate, -preset)
  return { preset, setPreset, startDate, endDate }
}
