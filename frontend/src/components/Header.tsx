import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchItems } from '../services/api'
import type { ItemDto } from '../services/api'

const links = [
  { to: '/', label: 'Home' },
  { to: '/prices', label: 'Prices' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ItemDto[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const allProducts = useMemo(() => {
    const result: { label: string }[] = []
    for (const item of items) {
      for (const unit of item.units) {
        result.push({ label: `${item.name}, ${unit.label}` })
      }
    }
    return result
  }, [items])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allProducts.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 20)
  }, [allProducts, query])

  useEffect(() => {
    fetchItems()
      .then((data) => setItems(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/prices?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
      setShowDropdown(false)
    }
  }

  function selectProduct(product: { label: string }) {
    setQuery(product.label)
    setShowDropdown(false)
    navigate(`/prices?search=${encodeURIComponent(product.label)}`)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <header className="bg-ink sticky top-0 z-50">
      <div className="h-[52px] lg:h-24 max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 flex items-center justify-between">
      <Link to="/" onClick={() => { if (window.location.pathname === '/') document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) }} className="flex items-center shrink-0">
        <img src="/logo.png" alt="Market Compare" className="h-8 lg:h-9 w-auto" />
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

      <div className="lg:hidden flex items-center gap-1 ms-auto">
        <button
          className="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-lg shrink-0"
          aria-label="Search"
          onClick={() => { setSearchOpen(!searchOpen); setOpen(false) }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
            <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="1.5" />
            <path d="M14 14L17.5 17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          className="flex flex-col justify-center items-center w-9 h-9 bg-transparent border-none rounded-lg shrink-0 gap-1 relative z-50"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          <span className={`block h-[2px] w-5 bg-white rounded transition-all duration-300 ${open ? 'rotate-45 translate-y-[4px]' : ''}`} />
          <span className={`block h-[2px] w-5 bg-white rounded transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-[2px] w-5 bg-white rounded transition-all duration-300 ${open ? '-rotate-45 -translate-y-[4px]' : ''}`} />
        </button>
      </div>

      <div
        className={`lg:hidden absolute top-full left-4 right-4 sm:left-auto sm:right-12 bg-ink border border-white/10 rounded-xl py-4 px-6 transition-all duration-200 z-40 sm:min-w-[200px] ${
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

      {/* Mobile search bar */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 ${
          searchOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-3 pt-1" ref={searchRef}>
          <div className="flex items-center gap-2 bg-input-bg border border-input-border rounded-lg px-3 py-2.5">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
              <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search foodstuffs"
              className="bg-transparent border-none outline-none text-sm text-black w-full placeholder-muted-text"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setShowDropdown(false) }}
                className="text-muted-text text-sm bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          {showDropdown && query.trim() !== '' && suggestions.length > 0 && (
            <div className="absolute z-50 left-4 right-4 mt-1 bg-white border border-grey-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((p) => (
                <button
                  key={p.label}
                  onClick={() => selectProduct(p)}
                  className="w-full text-left px-4 py-3 text-sm text-black hover:bg-input-bg transition cursor-pointer border-b border-input-border last:border-0"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
