import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime } from '../utils/time'
import { fetchItems, fetchPrices } from '../services/api'
import type { ItemDto, PriceDto } from '../services/api'
import ReportPriceModal from './ReportPriceModal'

interface ProductOption {
  label: string
  itemId: string
  unitId: string
}

type State = 'loading' | 'itemsLoaded' | 'offline' | 'emptyItems'

export default function ComparePrices() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<ItemDto[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [prices, setPrices] = useState<PriceDto[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ product: string; market: string; price: string } | null>(null)

  const products = useMemo(() => {
    const result: ProductOption[] = []
    for (const item of items) {
      for (const unit of item.units) {
        result.push({ label: `${item.name}, ${unit.label}`, itemId: item.id, unitId: unit.id })
      }
    }
    return result
  }, [items])

  const active = products[activeIdx]

  useEffect(() => {
    fetchItems()
      .then((data) => {
        setItems(data)
        setState(data.length === 0 ? 'emptyItems' : 'itemsLoaded')
      })
      .catch(() => setState('offline'))
  }, [])

  useEffect(() => {
    if (!active) return
    setPricesLoading(true)
    fetchPrices({ itemId: active.itemId, unitId: active.unitId, pageSize: 50 })
      .then((res) => setPrices(res.items))
      .catch(() => setPrices([]))
      .finally(() => setPricesLoading(false))
  }, [active?.itemId, active?.unitId])

  const entries = useMemo(() => {
    const map = new Map<string, PriceDto>()
    for (const p of prices) {
      const key = p.market.name || p.market.id
      if (!key) continue
      const existing = map.get(key)
      if (!existing || new Date(p.createdAt) > new Date(existing.createdAt)) {
        map.set(key, p)
      }
    }
    return Array.from(map.values())
  }, [prices])

  const cheapestPrice = useMemo(() => {
    const unflagged = entries.filter((e) => !e.isFlagged)
    return unflagged.length > 0 ? Math.min(...unflagged.map((e) => e.price)) : null
  }, [entries])

  function handleFlag(marketName: string, price: number) {
    if (!isAuthenticated) {
      navigate('/signin?returnUrl=/prices#compare')
      return
    }
    setReportTarget({
      product: active?.label || '',
      market: marketName,
      price: `₦${price.toLocaleString()}`,
    })
  }

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
        <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12">
          <div className="m-8">
            <div className="skeleton h-8 rounded-lg w-1/3 mb-3" />
            <div className="skeleton h-5 rounded-lg w-1/4 mb-6" />
            <div className="skeleton h-12 rounded-lg mb-4" />
            <div className="flex gap-2 mb-8">
              {[1,2,3,4].map((i) => <div key={i} className="skeleton h-9 rounded-lg w-24" />)}
            </div>
            <div className="space-y-4">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ===== OFFLINE =====
  if (state === 'offline') {
    return (
      <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
        <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12">
          <div className="m-8 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M2 8.5C7 4 17 4 22 8.5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5.5 12C9 9 15 9 18.5 12" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 15.5C10.8 14 13.2 14 15 15.5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="19" r="1.1" fill="#111" />
                <path d="M2 2L22 22" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Cannot load prices</h3>
            <p className="text-sm text-[#666]">Check your connection and try again</p>
          </div>
        </div>
      </section>
    )
  }

  // ===== EMPTY ITEMS =====
  if (state === 'emptyItems') {
    return (
      <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
        <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12">
          <div className="m-8 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <circle cx="12" cy="12" r="10" stroke="#A1A1A1" strokeWidth="1.5" />
                <path d="M12 8V12M12 16H12.01" stroke="#A1A1A1" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No items available yet</h3>
            <p className="text-sm text-[#666]">Check back later</p>
          </div>
        </div>
      </section>
    )
  }

  // ===== ITEMS LOADED - MAIN UI =====
  const isLoadingPrices = pricesLoading && prices.length === 0

  return (
    <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
      {reportTarget && (
        <ReportPriceModal
          product={reportTarget.product}
          market={reportTarget.market}
          price={reportTarget.price}
          onClose={() => setReportTarget(null)}
        />
      )}
      <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12">
        <div className="m-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-black mb-1">Compare prices across markets</h2>
              {entries.length > 0 && (
                <p className="text-lg font-medium text-black">Showing prices for: {active?.label}</p>
              )}
            </div>
            {entries.length > 1 && (
              <span className="text-sm font-medium text-[#1E1E1E] whitespace-nowrap">
                updated {getRelativeTime(Math.min(...entries.map((e) => new Date(e.createdAt).getTime())).toString())}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 bg-input-bg border border-input-border rounded-lg px-4 py-3.5 mb-4">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
              <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-black">{active?.label || 'Select an item'}</span>
          </div>

          <div className="flex gap-2 flex-wrap mb-8">
            {products.map((p, i) => (
              <button
                key={`${p.itemId}-${p.unitId}`}
                onClick={() => setActiveIdx(i)}
                className={`px-4 py-2 rounded-lg text-sm tracking-tight transition cursor-pointer ${
                  i === activeIdx
                    ? 'bg-ink text-white border-ink'
                    : 'bg-input-bg border border-input-border text-[#252323] hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {isLoadingPrices && (
            <div className="flex justify-center py-16">
              <div className="skeleton h-8 w-32 rounded-lg" />
            </div>
          )}

          {!isLoadingPrices && entries.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" stroke="#A1A1A1" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="#A1A1A1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No prices yet</h3>
              <p className="text-sm text-[#666] mb-5">Be the first to submit a price for {active?.label}!</p>
              <Link to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'} className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                Submit a price
              </Link>
            </div>
          )}

          {!isLoadingPrices && entries.length === 1 && (() => {
            const e = entries[0]
            return (
              <div className="border border-days-grey rounded-[12px] p-8 max-w-[600px] mx-auto">
                <div className="flex items-center justify-center gap-1.5 text-green-text text-sm font-medium mb-6">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Only one price available — nothing to compare yet</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-days-grey mb-1.5">{e.market.name}</p>
                  <p className="text-4xl font-extrabold text-black mb-2">₦{e.price.toLocaleString()}</p>
                  <p className="text-sm text-[#555]">per {active?.label.split(', ')[1] || ''}</p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-days-grey">
                    <span>{getRelativeTime(e.createdAt)}</span>
                    <span>·</span>
                    <span>by {e.submitterDisplayName}</span>
                  </div>
                </div>
                <div className="flex justify-center mt-7">
                  <button
                    onClick={() => handleFlag(e.market.name || '', e.price)}
                    className="border border-days-grey rounded-lg px-4 py-2 text-sm text-red-flag hover:bg-gray-50 transition cursor-pointer"
                  >
                    ⚑ Flag
                  </button>
                </div>
              </div>
            )
          })()}

          {!isLoadingPrices && entries.length >= 2 && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] pb-4 border-b border-text-dark text-sm font-bold text-text-dark">
                  <span>Market</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Submitted</span>
                  <span className="text-center">By</span>
                  <span />
                </div>

                {entries.map((e) => {
                  const marketName = e.market.name || ''
                  const marketLga = e.market.lga || ''
                  const marketState = e.market.state || ''
                  const area = [marketLga, marketState].filter(Boolean).join(', ')
                  const isCheapest = cheapestPrice !== null && e.price === cheapestPrice && !e.isFlagged
                  const stale = e.isStale
                  const reported = e.flagCount >= 2 || e.isFlagged

                  return (
                    <div
                      key={e.id}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-5 border-b border-text-dark gap-2 ${
                        stale ? 'opacity-50' : reported ? 'opacity-40' : ''
                      } ${isCheapest ? 'bg-[#eafaf1] border-l-4 border-l-green-text pl-1 rounded-sm' : ''}`}
                    >
                      <div>
                        <div className="flex items-center flex-wrap gap-x-2">
                          <span className={`font-semibold text-base ${isCheapest ? 'text-green-text' : 'text-text-dark'}`}>
                            {marketName}
                          </span>
                          {isCheapest && (
                            <span className="bg-green-text text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-normal">
                              Cheapest
                            </span>
                          )}
                          {stale && (
                            <span className="text-[10px] font-semibold text-[#888] bg-[#eee] px-2 py-0.5 rounded-full leading-normal">
                              {getRelativeTime(e.createdAt)}
                            </span>
                          )}
                          {reported && (
                            <span className="text-[10px] font-semibold text-red-flag bg-red-flag/10 px-2 py-0.5 rounded-full leading-normal">
                              reported
                            </span>
                          )}
                          {e.source === 'SEED' && (
                            <span className="text-[10px] font-medium text-[#8a7a3a] bg-[#f6d99a] px-2 py-0.5 rounded-full leading-normal">
                              Source: NBS
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-text-dark">{area}</span>
                      </div>
                      <span className={`font-bold text-base text-center ${isCheapest ? 'text-green-text text-lg' : 'text-text-dark'}`}>
                        ₦{e.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-text-dark text-center">{getRelativeTime(e.createdAt)}</span>
                      <span className="text-sm text-text-dark text-center">{e.submitterDisplayName}</span>
                      <button
                        onClick={() => handleFlag(marketName, e.price)}
                        className="border border-days-grey rounded-lg px-3.5 py-2 text-sm text-red-flag justify-self-center hover:bg-gray-50 transition cursor-pointer"
                      >
                        ⚑ Flag
                      </button>
                    </div>
                  )
                })}
              </div>

              <p className="text-sm font-medium text-text-dark py-5">
                Average across {entries.length} markets: ₦{Math.round(entries.reduce((a, e) => a + e.price, 0) / entries.length).toLocaleString()}
                {cheapestPrice !== null && (() => {
                  const cheapestEntry = entries.find((e) => e.price === cheapestPrice && !e.isFlagged)
                  return cheapestEntry ? <> — <span className="text-green-text">{cheapestEntry.market.name} is cheapest</span></> : null
                })()}
              </p>
            </div>
          )}

          <div className="flex gap-5 flex-wrap">
            <Link to="/prices/list" className="flex-1 min-w-[180px] bg-[#2C2424] border border-grey-border text-white px-4 py-4 rounded-lg text-sm text-center hover:brightness-110 transition cursor-pointer block">
              View details
            </Link>
            <Link
              to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'}
              className="flex-1 min-w-[180px] bg-input-bg border border-grey-border text-[#252323] px-4 py-4 rounded-lg text-sm text-center hover:bg-gray-100 transition cursor-pointer block"
            >
              Submit price
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
