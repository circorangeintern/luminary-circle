import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRelativeTime, isStale, formatDate } from '../utils/time'
import { trackScreenView, trackApiError } from '../services/events'
import { fetchPrices } from '../services/api'
import type { PriceDto } from '../services/api'

type State = 'loading' | 'offline' | 'empty' | 'loaded'

export default function PriceList() {
  useEffect(() => { trackScreenView('price-list') }, [])
  const [state, setState] = useState<State>('loading')
  const [prices, setPrices] = useState<PriceDto[]>([])

  function load() {
    setState('loading')
    fetchPrices({ pageSize: 100 })
      .then((res) => {
        setPrices(res.items)
        setState(res.items.length === 0 ? 'empty' : 'loaded')
      })
      .catch(() => { setState('offline'); trackApiError('price-list', 'NETWORK_ERROR') })
  }

  useEffect(load, [])

  return (
    <div className="min-h-screen bg-bg-grey">
      <div className="max-w-[797px] mx-auto flex flex-col">
        <div className="bg-[#262121] flex items-center justify-between px-[27px] py-[10px]">
          <h1 className="text-[37px] font-bold text-white leading-[31px] tracking-[-0.37px]" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', 'Inter', sans-serif" }}>
            Current price of products
          </h1>
          <Link
            to="/submit"
            className="bg-white text-black border border-black rounded-[10px] flex items-center justify-center gap-2 px-10 py-[10px] text-base leading-[19px] hover:bg-gray-50 transition"
          >
            Update Price
            <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center text-sm leading-none shrink-0 relative">
              <span className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <line x1="8" y1="12" x2="16" y2="12" stroke="black" strokeWidth="1.5" />
                  <line x1="12" y1="8" x2="12" y2="16" stroke="black" strokeWidth="1.5" />
                </svg>
              </span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-[20px] mt-0">
          <div className="px-[59px] py-5 border-b border-days-grey">
            <div className="flex items-center gap-[136px]">
              <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Products</span>
              <div className="flex items-center gap-[81px]">
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Market</span>
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Size</span>
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Price</span>
                <span className="text-base font-bold leading-5 tracking-[-0.24px] text-black">Updated</span>
              </div>
            </div>
          </div>

          {state === 'loading' && (
            <div className="px-[30px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-[78px] border-b border-days-grey min-h-[84px]">
                  <div className="w-[172px] shrink-0">
                    <div className="skeleton h-4 rounded w-3/4" />
                  </div>
                  <div className="flex items-center gap-[61px]">
                    <div className="skeleton h-4 rounded w-[69px]" />
                    <div className="skeleton h-4 rounded w-[48px]" />
                    <div className="skeleton h-4 rounded w-[82px]" />
                    <div className="skeleton h-4 rounded w-[85px]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {state === 'offline' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" stroke="#A1A1A1" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="#A1A1A1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Couldn't load prices</h3>
              <p className="text-sm text-[#666] mb-5">Check your connection and try again</p>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 bg-input-bg border border-grey-border text-black px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#eee]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M4 4V9H9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.6 15A8 8 0 1 0 6 7.3L4 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try again
              </button>
            </div>
          )}

          {state === 'empty' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" stroke="#A1A1A1" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="#A1A1A1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No prices yet</h3>
              <p className="text-sm text-[#666] mb-5">Be the first to submit a price</p>
              <Link to="/submit" className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                Submit a price
              </Link>
            </div>
          )}

          {state === 'loaded' && (
            <div className="px-[30px]">
              {prices.map((p, i) => {
                const stale = isStale(p.createdAt)
                return (
                  <div
                    key={p.id || i}
                    className={`flex items-center gap-[78px] border-b border-days-grey min-h-[84px] ${stale ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-[27px] w-[172px] shrink-0">
                      <div className="w-[18px] h-[18px] rounded-full border border-black shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base leading-6 tracking-[-0.24px] text-black">
                          {p.item.name}
                        </span>
                        {p.source === 'SEED_DEMO' && (
                          <span className="text-[10px] font-medium text-[#8a7a3a] bg-[#f6d99a] px-2 py-0.5 rounded-full w-fit leading-normal">
                            Source: NBS
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-[61px]">
                      <span className="w-[69px] text-base leading-5 tracking-[-0.24px] text-black text-center">{p.market.name}</span>
                      <span className="w-[48px] text-base leading-5 tracking-[-0.24px] text-black text-center">{p.unit.label}</span>
                      <span className="w-[82px] text-base leading-5 tracking-[-0.24px] text-black text-center">₦{p.price.toLocaleString()}</span>
                      <span className="w-[85px] text-base leading-5 tracking-[-0.24px] text-black text-center flex flex-col items-center">
                        <span className={stale ? 'text-[#888]' : ''}>{formatDate(p.createdAt)}</span>
                        {stale && (
                          <span className="text-[10px] font-semibold text-[#888]">{getRelativeTime(p.createdAt)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
