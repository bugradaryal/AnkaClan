import { Link, NavLink } from 'react-router-dom'
import { Emblem } from '../common/Emblem'
import { site } from '../../config/site'

export function Navbar() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm transition-colors ${isActive ? 'text-bone' : 'text-mute hover:text-bone'}`
  return (
    <header className="absolute inset-x-0 top-0 z-20 border-b border-wine-800/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3">
          <Emblem />
          <span className="font-display text-2xl font-bold tracking-wide">{site.communityName}</span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/stats" className={link}>İstatistikler</NavLink>
          <NavLink to="/news" className={link}>Haberler</NavLink>
          <a href={site.discordUrl} target="_blank" rel="noopener noreferrer" className="ml-3 border border-wine-400 px-4 py-1.5 text-sm hover:bg-wine-700">
            Discord
          </a>
        </nav>
      </div>
    </header>
  )
}
