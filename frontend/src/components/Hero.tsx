import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchItems } from '../services/api'
import type { ItemDto } from '../services/api'

interface ProductOption {
  label: string
  itemId: string
  unitId: string
}

export default function Hero() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<ItemDto[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)

  const allProducts = useMemo(() => {
    const result: ProductOption[] = []
    for (const item of items) {
      for (const unit of item.units) {
        result.push({ label: `${item.name}, ${unit.label}`, itemId: item.id, unitId: unit.id })
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
      setShowDropdown(false)
    }
  }

  function selectProduct(product: ProductOption) {
    setQuery(product.label)
    setShowDropdown(false)
    navigate(`/prices?search=${encodeURIComponent(product.label)}`)
  }

  return (
    <section id="hero" className="bg-cream relative overflow-hidden pb-10 lg:pb-24">
      <div className="px-6 sm:px-12 lg:px-20 pt-6 lg:pt-8 pb-6 lg:pb-10">
        <div className="max-w-[800px] mx-auto relative hidden lg:block" ref={searchRef}>
          <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 h-[44px] lg:h-[65px] bg-input-bg border border-days-grey rounded-lg lg:rounded-[10px] w-full" style={{ borderWidth: '0.5px' }}>
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
              <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search foodstuffs"
              className="bg-transparent border-none outline-none text-sm text-muted-text w-full placeholder-muted-text tracking-tight"
              style={{ letterSpacing: '-0.24px', lineHeight: '20px' }}
            />
          </div>
          {showDropdown && query.trim() !== '' && suggestions.length > 0 && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-grey-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((p) => (
                <button
                  key={`${p.itemId}-${p.unitId}`}
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
        <div className="relative z-10 max-w-[637px] w-full text-center lg:text-left">
          <h1 className="text-[26px] sm:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight mb-3 lg:mb-5">
            Know Market Prices Before You Shop.
          </h1>
          <p className="text-sm sm:text-xl lg:text-2xl leading-relaxed text-[#1a1a1a] max-w-[605px] mb-6 lg:mb-11 mx-auto lg:mx-0">
            Compare food prices across nearby markets and plan smarter before leaving home.
          </p>
          <div className="flex gap-3 lg:gap-5 flex-wrap justify-center lg:justify-start">
            <Link
              to="/prices/list"
              className="inline-flex items-center gap-2 bg-red text-white px-5 lg:px-8 py-3 lg:py-4 rounded-lg text-sm lg:text-base hover:brightness-110 transition"
            >
              Live Market Prices
            
            </Link>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-transparent text-black border border-black px-5 lg:px-8 py-3 lg:py-4 rounded-lg text-sm lg:text-base hover:bg-black/5 transition"
            >
              Update Price
              <span className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 border-current flex items-center justify-center text-xs lg:text-sm leading-none shrink-0">+</span>
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-[280px] lg:max-w-[607px] shrink-0 flex items-center justify-center">
          <picture>
            <source srcSet="/hero-image.webp" type="image/webp" />
            <img
              src="/hero-image.png"
              alt="Basket with rice, beans, and oil"
              width={607}
              height={456}
              fetchPriority="high"
              className="relative z-10 w-full h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]"
            />
          </picture>
        </div>
      </div>
    </section>
  )
}
