export const dash = '-'

export function formatNumber(v: number | null | undefined): string {
  return v == null ? dash : v.toLocaleString('en-US')
}

/** Rounds to a whole number: 927.34 -> 927, 608.76 -> 609. */
export function formatWhole(v: number | null | undefined): string {
  return v == null ? dash : Math.round(v).toLocaleString('en-US')
}

/** 0.45095 -> 0.45 */
export function formatTwoDecimals(v: number | null | undefined): string {
  return v == null ? dash : v.toFixed(2)
}

/** A fraction shown as a percentage: 0.4714 -> 47.1% */
export function formatRate(v: number | null | undefined): string {
  return v == null ? dash : `${(v * 100).toFixed(1)}%`
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : dash
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : dash
}

export function formatAgo(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours} h ago`
  return `${Math.floor(hours / 24)} days ago`
}
