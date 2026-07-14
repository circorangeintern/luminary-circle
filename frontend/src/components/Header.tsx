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
    <header className="bg-ink flex items-center px-4 sm:px-8 lg:px-16 gap-6 sticky top-0 z-50 h-16 lg:h-20">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 30V14L11 6L17 14L23 6L30 14V30" stroke="#FFF3F6" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          <path d="M11 30V20" stroke="#FFF3F6" strokeWidth="2.6" strokeLinecap="round"/>
          <path d="M23 30V20" stroke="#FFF3F6" strokeWidth="2.6" strokeLinecap="round"/>
        </svg>
        <span className="text-[#FFF3F6] font-semibold text-base lg:text-lg">Market Compare</span>
      </Link>

      <button
        className="lg:hidden flex flex-col justify-between w-7 h-5 bg-transparent border-none shrink-0"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <span className="block h-0.5 w-full bg-white rounded" />
        <span className="block h-0.5 w-full bg-white rounded" />
        <span className="block h-0.5 w-full bg-white rounded" />
      </button>

      <ul
        className={`${
          open ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-0 lg:inset-auto bg-ink lg:bg-transparent flex flex-col lg:flex-row items-center justify-center lg:ms-auto lg:me-4 gap-8 lg:gap-10 z-50 transition-transform duration-300 list-none`}
      >
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-white text-lg lg:text-sm transition-opacity hover:opacity-70 ${isActive ? 'opacity-100 underline underline-offset-4' : 'opacity-80'}`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="hidden lg:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-input-bg border border-input-border rounded-lg px-4 py-3 w-44 mr-40">
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
    </header>
  )
}
