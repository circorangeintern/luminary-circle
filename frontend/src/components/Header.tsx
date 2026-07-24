import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/prices', label: 'Prices' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-ink sticky top-0 z-50 h-20 lg:h-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between h-full">
      <Link to="/" className="flex items-center shrink-0">
        <img src="/logo.png" alt="Market Compare" className="h-9 w-auto" />
      </Link>

      <div className="hidden lg:flex items-center gap-[340px]">
        <ul className="flex items-center gap-[53px] list-none">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-white text-base leading-[19px] transition-opacity hover:opacity-70 ${isActive ? 'opacity-100 underline underline-offset-4' : 'opacity-80'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">{user?.displayName}</span>
            <button
              onClick={logout}
              className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition cursor-pointer"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/signin" className="bg-red text-white w-[134px] h-[49px] flex items-center justify-center rounded-[10px] text-base leading-[19px] hover:brightness-110 transition">
            Sign in
          </Link>
        )}
      </div>

      <button
        className="lg:hidden flex flex-col justify-center items-center w-10 h-10 bg-transparent border-none rounded-lg shrink-0 ms-auto gap-1.5 relative z-50"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-[5px]' : ''}`} />
        <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-[5px]' : ''}`} />
      </button>

      <div
        className={`lg:hidden absolute top-full right-4 sm:right-12 bg-ink border border-white/10 rounded-xl py-4 px-6 transition-all duration-200 z-40 min-w-[200px] ${
          open ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
        }`}
      >
        <ul className="flex flex-col gap-1 list-none">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-2.5 px-3 rounded-lg text-sm transition-colors ${
                    isActive ? 'text-white bg-white/10 font-semibold' : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          <li className="border-t border-white/10 pt-2 mt-2">
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setOpen(false) }}
                className="block w-full text-left py-2.5 px-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Sign out ({user?.displayName})
              </button>
            ) : (
              <Link
                to="/signin"
                onClick={() => setOpen(false)}
                className="block py-2.5 px-3 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
              >
                Sign in
              </Link>
            )}
          </li>
        </ul>
      </div>
      </div>
    </header>
  )
}
