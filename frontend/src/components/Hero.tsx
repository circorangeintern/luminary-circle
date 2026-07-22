import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/prices?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="bg-cream relative overflow-hidden pb-16 lg:pb-24">
      <div className="px-6 sm:px-12 lg:px-20 pt-8 pb-10">
        <div className="max-w-[800px] mx-auto flex items-center gap-3 px-4 h-[65px] bg-input-bg border border-days-grey rounded-[10px] w-full" style={{ borderWidth: '0.5px' }}>
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 shrink-0">
            <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
            <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search foodstuffs"
            className="bg-transparent border-none outline-none text-sm text-days-grey w-full placeholder-days-grey tracking-tight"
            style={{ letterSpacing: '-0.24px', lineHeight: '20px' }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col lg:flex-row items-center gap-10">
        <div className="relative z-10 max-w-[637px]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight mb-5">
            Know Market Prices Before You Shop.
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-[#1a1a1a] max-w-[605px] mb-11">
            Compare food prices across nearby markets and plan smarter before leaving home.
          </p>
          <div className="flex gap-5 flex-wrap">
            <Link
              to="/prices"
              className="inline-flex items-center gap-2 bg-red text-white px-8 py-4 rounded-lg text-base hover:brightness-110 transition"
            >
              See Prices
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-sm leading-none shrink-0">+</span>
            </Link>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-transparent text-black border border-black px-8 py-4 rounded-lg text-base hover:bg-black/5 transition"
            >
              Update Price
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-sm leading-none shrink-0">+</span>
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-[607px] shrink-0 flex items-center justify-center">
          <img
            src="/hero-image.png"
            alt="Basket with rice, beans, and oil"
            className="relative z-10 w-full h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]"
          />
        </div>
      </div>
    </section>
  )
}
