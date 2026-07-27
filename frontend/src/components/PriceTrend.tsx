import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime } from '../utils/time'
import { fetchItems, fetchMarkets, fetchComparePrices, fetchTrend } from '../services/api'
import type { ItemDto, MarketDto, TrendResponse } from '../services/api'
import { trackTrendView } from '../services/events'
import { Suspense } from 'react'
import PriceTrendChart from './PriceTrendChart'

interface ProductOption {
  label: string
  itemId: string
  unitId: string
}

type State = 'loading' | 'itemsLoaded' | 'offline' | 'emptyItems'

export default function PriceTrend() {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<ItemDto[]>([])
  const [markets, setMarkets] = useState<MarketDto[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [activeMarketIdx, setActiveMarketIdx] = useState(0)
  const [trend, setTrend] = useState<TrendResponse | null>(null)
  const [trendLoading, setTrendLoading] = useState(false)
  const [cheapestMarketName, setCheapestMarketName] = useState('')
  const [cheapestDirection, setCheapestDirection] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
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
    if (!searchInput.trim()) return []
    const q = searchInput.toLowerCase()
    return allProducts.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 20)
  }, [allProducts, searchInput])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    Promise.all([fetchItems(), fetchMarkets()])
      .then(([itemsData, marketsData]) => {
        setItems(itemsData)
        setMarkets(marketsData)
        setState(itemsData.length === 0 ? 'emptyItems' : 'itemsLoaded')
      })
      .catch(() => setState('offline'))
  }, [])

  const active = allProducts[activeIdx]
  const activeMarket = markets[activeMarketIdx]

  useEffect(() => {
    if (activeIdx >= allProducts.length && allProducts.length > 0) {
      setActiveIdx(0)
    }
  }, [allProducts.length, activeIdx])

  useEffect(() => {
    if (!active || !activeMarket) return
    setTrendLoading(true)
    fetchTrend(active.itemId, active.unitId, activeMarket.id)
      .then((t) => { setTrend(t); trackTrendView(t.points.length > 0) })
      .catch(() => { setTrend(null); trackTrendView(false) })
      .finally(() => setTrendLoading(false))
  }, [active?.itemId, active?.unitId, activeMarket?.id])

  useEffect(() => {
    if (!active) return
    fetchComparePrices(active.itemId, active.unitId)
      .then((res) => {
        const cheapest = res.items.find((e) => e.isCheapest)
        if (cheapest) setCheapestMarketName(cheapest.market.name)
      })
      .catch(() => {})
  }, [active?.itemId, active?.unitId])

  useEffect(() => {
    if (!active || !cheapestMarketName) return
    const market = markets.find((m) => m.name === cheapestMarketName)
    if (!market) return
    fetchTrend(active.itemId, active.unitId, market.id)
      .then((t) => setCheapestDirection(t.direction))
      .catch(() => setCheapestDirection(''))
  }, [active?.itemId, active?.unitId, cheapestMarketName])

  const chartData = useMemo(() => {
    if (!trend) return []
    return trend.points.map((p) => ({
      fullDate: p.createdAt,
      price: p.price,
    }))
  }, [trend])

  const measure = active?.label.split(', ')[1] || ''
  const isLoading = trendLoading && !trend

  function selectProduct(idx: number) {
    setActiveIdx(idx)
    setSearchInput(allProducts[idx]?.label || '')
    setShowDropdown(false)
    setActiveMarketIdx(0)
  }

  function selectMarket(idx: number) {
    setActiveMarketIdx(idx)
  }

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <div className="px-6 sm:px-12 lg:px-20 pb-12">
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-[30px] p-6 sm:p-8 lg:p-10 mt-12">
          <div className="m-8">
            <div className="skeleton h-8 w-1/2 rounded-lg mb-2" />
            <div className="skeleton h-5 w-1/3 rounded-lg mb-6" />
            <div className="skeleton h-12 rounded-lg mb-4" />
            <div className="flex gap-2 mb-8">
              {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-[47px] rounded-[10px] flex-1 max-w-[162px]" />)}
            </div>
            <div className="flex gap-[20px] flex-wrap mb-8">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-[114px] rounded-[10px] flex-1 min-w-[220px]" />)}
            </div>
            <div className="skeleton h-80 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // ===== OFFLINE =====
  if (state === 'offline') {
    return (
      <div className="px-6 sm:px-12 lg:px-20 pb-12">
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-[30px] p-6 sm:p-8 lg:p-10 mt-12">
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
            <h3 className="text-xl font-bold text-black mb-2">Cannot load price trends</h3>
            <p className="text-sm text-[#666]">Check your connection and try again</p>
          </div>
        </div>
      </div>
    )
  }

  // ===== EMPTY ITEMS =====
  if (state === 'emptyItems') {
    return (
      <div className="px-6 sm:px-12 lg:px-20 pb-12">
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-[30px] p-6 sm:p-8 lg:p-10 mt-12">
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
      </div>
    )
  }

  // ===== MAIN UI =====
  return (
    <div id="trend" className="px-6 sm:px-12 lg:px-20 pb-12">
      <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-[30px] p-[20px_10px_10px] sm:p-10 mt-6 lg:mt-12">
        <div className="pl-4 sm:pl-10 pr-4 sm:pr-4 mb-1 lg:mb-2">
          {/* Search bar */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-3 bg-input-bg border border-input-border rounded-lg px-4 py-3.5">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
                <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
                <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search items..."
                className="bg-transparent border-none outline-none w-full text-sm text-black placeholder:text-[#999]"
              />
              <svg viewBox="0 0 14 8" fill="none" className="w-3.5 h-2 shrink-0">
                <path d="M1 1L7 7L13 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {showDropdown && searchInput.trim() !== '' && suggestions.length > 0 && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-grey-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((p) => {
                  const idx = allProducts.indexOf(p)
                  return (
                    <button
                      key={`${p.itemId}-${p.unitId}`}
                      onClick={() => selectProduct(idx)}
                      className="w-full text-left px-4 py-3 text-sm text-black hover:bg-input-bg transition cursor-pointer border-b border-input-border last:border-0"
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pl-4 sm:pl-10 pr-4 sm:pr-4">
          {/* Heading */}
          <div className="flex flex-col items-start gap-1 lg:gap-[9px] mb-3 lg:mb-[27px]">
            <h2 className="text-lg lg:text-3xl font-bold tracking-tight text-text-black leading-tight">
              Price trends
            </h2>
            <p className="text-[10px] lg:text-lg text-black">{active?.label.split(',')[0] || ''} / {measure || 'unit'}</p>
          </div>
        </div>

        {/* Market pills */}
        <div className="pl-4 sm:pl-10 pr-4 sm:pr-4 mb-3 lg:mb-[28px] overflow-x-auto -mx-1 lg:mx-0">
          <div className="flex gap-2 px-1 lg:px-0 min-w-max">
            {markets.map((m, i) => (
              <button
                key={m.id}
                onClick={() => selectMarket(i)}
                className={`rounded-lg lg:rounded-xl text-[11px] lg:text-sm tracking-tight cursor-pointer transition shrink-0 px-3 lg:px-4 py-1.5 lg:py-2 ${
                  i === activeMarketIdx
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white border border-days-grey text-black hover:bg-gray-50'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-10 pb-[2px] overflow-hidden">
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="skeleton h-8 w-32 rounded-lg" />
            </div>
          )}

          {!isLoading && (!trend || trend.points.length === 0) && (
            <div className="text-center py-16 mb-6">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <path d="M3 3V21H21" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 16L11 11L15 14L19 8" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No trend data yet</h3>
              <p className="text-sm text-[#666] mb-5">Be the first to submit a price for {active?.label} at {activeMarket?.name}!</p>
              <Link to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'} className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                Submit a price
              </Link>
            </div>
          )}

          {!isLoading && trend && trend.points.length > 0 && (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-3 lg:flex gap-2 lg:gap-[20px] mb-4 lg:mb-[47px]">
                <div className="border border-days-grey rounded-[10px] px-2 lg:px-4 py-2 lg:py-3">
                  <div className="flex flex-col gap-1 lg:gap-[6px]">
                    <span className="text-[9px] lg:text-xs font-semibold text-muted-text tracking-tight">Latest price</span>
                    <span className="text-[10px] lg:text-sm font-semibold text-text-dark tracking-tight">
                      ₦{trend.latest?.price.toLocaleString()}{measure ? ` / ${measure}` : ''}
                    </span>
                    <span className="text-[8px] lg:text-xs text-green-text tracking-tight">
                      {activeMarket?.name} - {getRelativeTime(trend.latest?.createdAt || '')}
                    </span>
                  </div>
                </div>

                <div className="border border-days-grey rounded-[10px] px-2 lg:px-4 py-2 lg:py-3">
                  <div className="flex flex-col gap-1 lg:gap-[6px]">
                    <span className="text-[9px] lg:text-xs font-semibold text-muted-text tracking-tight">Sample size</span>
                    <span className="text-[10px] lg:text-sm font-semibold text-text-dark tracking-tight">{trend.sampleSize}</span>
                    <span className="text-[8px] lg:text-xs text-green-text tracking-tight">Observations</span>
                  </div>
                </div>

                <div className="border border-days-grey rounded-[10px] px-2 lg:px-4 py-2 lg:py-3">
                  <div className="flex flex-col gap-1 lg:gap-[6px]">
                    <span className="text-[9px] lg:text-xs font-semibold text-muted-text tracking-tight">Direction</span>
                    <span className="text-[10px] lg:text-sm font-semibold text-text-dark tracking-tight">{trend.direction === 'UP' ? 'Going up' : trend.direction === 'DOWN' ? 'Going down' : trend.direction === 'STABLE' ? 'Stable' : 'Not enough data'}</span>
                    <span className="text-[8px] lg:text-xs text-green-text tracking-tight">
                      {trend.direction === 'UP'
                        ? `↗ ₦${(trend.points[trend.points.length - 1].price - trend.points[0].price).toLocaleString()}`
                        : trend.direction === 'DOWN'
                          ? `↘ ₦${(trend.points[0].price - trend.points[trend.points.length - 1].price).toLocaleString()}`
                          : trend.direction === 'STABLE'
                            ? '— No significant change'
                            : 'Not enough data points'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="w-full h-[208px] lg:h-[420px] mb-4 lg:mb-[46px]">
                <Suspense fallback={<div className="skeleton h-full w-full rounded-lg" />}>
                  <PriceTrendChart chartData={chartData} compact />
                </Suspense>
              </div>
            </>
          )}

          {/* Insight + Submit button */}
          {!isLoading && trend && trend.points.length > 0 && (
            <>
              <div className="border-t border-dashed border-[rgba(208,213,221,0.87)] mb-3 lg:mb-5" />
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-6">
                <span className="text-[10px] lg:text-sm font-medium text-[#121212] tracking-tight leading-tight text-center lg:text-left">
                  {cheapestMarketName || activeMarket?.name} is cheapest{cheapestDirection === 'DOWN' ? ' and still falling' : cheapestDirection === 'UP' ? ' but rising' : ''} - good time to buy
                </span>
                <Link
                  to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'}
                  className="inline-flex items-center justify-center w-full lg:w-[378px] h-9 lg:h-[66px] bg-[#2C2424] border border-[#BDBDBD] rounded-lg lg:rounded-[10px] text-[11px] lg:text-sm font-bold text-white tracking-tight hover:brightness-110 transition cursor-pointer"
                  style={{ borderWidth: '0.5px' }}
                >
                  Submit price
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
