export function Emblem({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="ANKA emblem">
      <circle cx="32" cy="32" r="29" fill="none" stroke="#B01E36" strokeWidth="2" />
      <path d="M32 9 L50 44 L32 36 L14 44 Z" fill="#D3283F" />
      <path d="M32 22 L40 40 L32 36 L24 40 Z" fill="#12070A" />
    </svg>
  )
}
