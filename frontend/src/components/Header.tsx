import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/prices', label: 'Prices' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/directory', label: 'Directory' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-ink flex items-center px-6 sm:px-12 lg:px-20 gap-6 sticky top-0 z-50 h-20 lg:h-24">
      <Link to="/" className="flex items-center shrink-0">
        <img src="/logo.png" alt="Market Compare" className="h-8 lg:h-9 w-auto brightness-0 invert" />
      </Link>

      <div className="flex-1 lg:flex hidden items-center">
        <ul className="flex items-center justify-center ms-auto me-4 gap-6 xl:gap-10 list-none">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-white text-sm transition-opacity hover:opacity-70 ${isActive ? 'opacity-100 underline underline-offset-4' : 'opacity-80'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="hidden lg:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-input-bg border border-input-border rounded-lg px-4 py-3 w-44 mr-20 xl:mr-40">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
            <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
            <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm text-black w-full placeholder-days-grey" />
        </div>
        <Link to="/signin" className="bg-red text-white px-10 py-3 rounded-lg text-sm whitespace-nowrap hover:brightness-110 transition">
          Sign in
        </Link>
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
        </ul>
      </div>
    </header>
  )
}
