/**
 * The data gives the squadron role as a number. Role 0 is the squadron leader (it matches the creator's id).
 * The rest follow War Thunder's rank order (Commander > Deputy > Officer > Sergeant > Private); the role counts in
 * the ANKA data (1, 1, 6, 10, 110) fit that, but StatShark does not document the codes. Fix them here if needed.
 */
const ROLE_LABELS: Record<number, string> = {
  0: 'Commander',
  1: 'Deputy',
  2: 'Officer',
  3: 'Sergeant',
  4: 'Er', // Private: the lowest rank, everyone who has no higher one
}

export function roleLabel(role: number | null): string {
  if (role === null) return '-'
  return ROLE_LABELS[role] ?? `Rank ${role}`
}
