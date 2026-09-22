import { useState } from 'react'
import { addDaysISO, startOfMonthISO, todayISO } from '../../utils/dates'

export type RangePreset = 'mtd' | 30 | 90 | 365

export function useAnalyticsRange(defaultPreset: RangePreset = 'mtd') {
  const [preset, setPreset] = useState<RangePreset>(defaultPreset)
  const endDate = todayISO()
  const startDate = preset === 'mtd' ? startOfMonthISO(endDate) : addDaysISO(endDate, -preset)
  return { preset, setPreset, startDate, endDate }
}
