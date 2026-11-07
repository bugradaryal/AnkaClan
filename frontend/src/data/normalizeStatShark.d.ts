import type { SquadData } from './types'

export const SCHEMA_VERSION: number
export const PERIODS: string[]
export function normalizeSquadResponse(raw: unknown, importedAt: string, sourceId?: string | null): SquadData
export function snapshotId(iso: string): string
