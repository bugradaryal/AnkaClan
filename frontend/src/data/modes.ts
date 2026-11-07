import type { PeriodKey } from './types'

/** The four modes the site shows. The keys are the mode names used in the StatShark data ("tank" = ground). */
/** The six modes supported by the StatShark data. */
export const MODES = [
  { key: 'tank_realistic', label: 'Ground Realistic', short: 'Ground RB' },
  { key: 'tank_arcade', label: 'Ground Arcade', short: 'Ground AB' },
  { key: 'tank_simulation', label: 'Ground Simulation', short: 'Ground SB' },
  { key: 'air_realistic', label: 'Air Realistic', short: 'Air RB' },
  { key: 'air_arcade', label: 'Air Arcade', short: 'Air AB' },
  { key: 'air_simulation', label: 'Air Simulation', short: 'Air SB' },
] as const

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'total', label: 'Total' },
  { key: 'monthly', label: 'Monthly' },
]
