import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center px-8 py-3 font-display text-xl font-bold tracking-wide transition-colors'
const styles = {
  primary: `${base} bg-wine-400 text-bone hover:bg-wine-300`,
  outline: `${base} border border-wine-400 text-bone hover:bg-wine-700`,
}

interface Props {
  variant?: keyof typeof styles
  to?: string
  href?: string
  children: ReactNode
}

export function Button({ variant = 'primary', to, href, children }: Props) {
  if (to) return <Link to={to} className={styles[variant]}>{children}</Link>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles[variant]}>
      {children}
    </a>
  )
}
