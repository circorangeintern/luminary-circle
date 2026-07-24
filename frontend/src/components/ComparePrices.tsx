import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime } from '../utils/time'
import { fetchItems, fetchComparePrices } from '../services/api'
import type { ItemDto, ComparePriceEntry } from '../services/api'
import { trackComparisonView } from '../services/events'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<ItemDto[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [compareEntries, setCompareEntries] = useState<ComparePriceEntry[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ priceId: string; product: string; market: string; price: string } | null>(null)
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

  const products = useMemo(() => {
    if (!searchQuery) return allProducts
    const q = searchQuery.toLowerCase()
    return allProducts.filter((p) => p.label.toLowerCase().includes(q))
  }, [allProducts, searchQuery])

  const active = products[activeIdx]

  const suggestions = useMemo(() => {
    if (!searchInput.trim()) return []
    const q = searchInput.toLowerCase()
    return allProducts.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 20)
  }, [allProducts, searchInput])

  useEffect(() => {
    if (searchQuery && active) {
      setSearchInput(active.label)
    }
  }, [searchQuery, active?.label])

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
    fetchItems()
      .then((data) => {
        setItems(data)
        setState(data.length === 0 ? 'emptyItems' : 'itemsLoaded')
      })
      .catch(() => setState('offline'))
  }, [])

  useEffect(() => {
    if (activeIdx >= products.length && products.length > 0) {
      setActiveIdx(0)
    }
  }, [products.length, activeIdx])

  useEffect(() => {
    if (!active) return
    setPricesLoading(true)
    fetchComparePrices(active.itemId, active.unitId)
      .then((res) => {
        setCompareEntries(res.items)
        trackComparisonView(res.items.length)
      })
      .catch(() => { setCompareEntries([]) })
      .finally(() => setPricesLoading(false))
  }, [active?.itemId, active?.unitId])

  function handleFlag(priceId: string, marketName: string, price: number) {
    if (!isAuthenticated) {
      navigate('/signin?returnUrl=/prices#compare')
      return
    }
    setReportTarget({
      priceId,
      product: active?.label || '',
      market: marketName,
      price: `₦${price.toLocaleString()}`,
    })
  }

  function selectProduct(idx: number) {
    setActiveIdx(idx)
    setSearchInput(products[idx]?.label || '')
    setShowDropdown(false)
    if (searchQuery) {
      setSearchParams({})
    }
  }

  function handleSearchChange(value: string) {
    setSearchInput(value)
    setShowDropdown(true)
  }

  const cheapestPrice = compareEntries.length > 0 ? Math.min(...compareEntries.map(e => e.price)) : 0
  const highestPrice = compareEntries.length > 0 ? Math.max(...compareEntries.map(e => e.price)) : 0
  const avgPrice = compareEntries.length > 0
    ? Math.round(compareEntries.reduce((a, e) => a + e.price, 0) / compareEntries.length)
    : 0
  const unitLabel = active?.label.split(', ')[1] || ''
  const itemName = active?.label.split(', ')[0] || ''

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
        <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-12">
          <div className="skeleton h-16 rounded-lg w-3/4 mb-3" />
          <div className="skeleton h-4 rounded-lg w-1/3 mb-7" />
          <div className="skeleton h-16 rounded-lg w-full mb-4" />
          <div className="flex gap-3 mb-10">
            {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-11 rounded-xl flex-1 max-w-[140px]" />)}
          </div>
          <div className="flex justify-between mb-6">
            <div className="skeleton h-6 rounded-lg w-36" />
            <div className="flex gap-8">
              <div className="skeleton h-6 rounded-lg w-20" />
              <div className="skeleton h-6 rounded-lg w-20" />
              <div className="skeleton h-6 rounded-lg w-20" />
            </div>
          </div>
          {[1,2,3].map((i) => (
            <div key={i} className="grid grid-cols-[1.7fr_1fr_1fr_1fr_0.8fr] gap-4 mb-5">
              <div className="skeleton h-20 rounded-lg" />
              <div className="skeleton h-20 rounded-lg" />
              <div className="skeleton h-20 rounded-lg" />
              <div className="skeleton h-20 rounded-lg" />
              <div className="skeleton h-20 rounded-lg" />
            </div>
          ))}
          <div className="skeleton h-4 rounded-lg w-3/5 mb-8 mt-4" />
          <div className="flex gap-6">
            <div className="skeleton h-16 rounded-xl flex-1" />
            <div className="skeleton h-16 rounded-xl flex-1" />
          </div>
        </div>
      </section>
    )
  }

  // ===== OFFLINE =====
  if (state === 'offline') {
    return (
      <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
        <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-12">
          <div className="flex items-start justify-between gap-5 pb-5 border-b border-days-grey mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Compare price</h1>
            <span className="text-sm font-medium text-[#8a8a8a] whitespace-nowrap mt-3">No internet connection</span>
          </div>

          <div className="flex gap-3 flex-wrap mb-10">
            {products.slice(0, 5).map((p, i) => (
              <button key={i} className="px-4 py-2 rounded-lg text-sm text-[#bdbdbd] border border-[#e5e5e5] bg-white cursor-not-allowed">
                {p.label.split(',')[0]}
              </button>
            ))}
          </div>

          <div className="text-center py-16 max-w-[680px] mx-auto">
            <div className="w-[88px] h-[88px] rounded-full bg-[#fbd7d7] flex items-center justify-center mx-auto mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-[38px] h-[38px]">
                <path d="M12 4L22 20H2L12 4Z" stroke="#b40000" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M12 10V14.5" stroke="#b40000" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="17.3" r="1" fill="#b40000"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black mb-4">Couldn't load prices</h2>
            <p className="text-sm leading-relaxed text-[#1a1a1a] mb-7">
              We ran into a problem fetching the latest prices for this item. This is on our end &mdash; your data is safe
            </p>
            <span className="inline-block bg-[#f5f5f5] rounded-xl px-6 py-3.5 font-mono text-sm text-[#5a5a5a] mb-8">
              Error: 503 service unavailable
            </span>

            <div className="flex gap-5 justify-center flex-wrap">
              <button
                onClick={() => { setState('loading'); fetchItems().then(d => { setItems(d); setState(d.length === 0 ? 'emptyItems' : 'itemsLoaded') }).catch(() => setState('offline')) }}
                className="inline-flex items-center gap-2.5 bg-input-bg border border-grey-border text-black px-8 py-5 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#eee]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M4 4V9H9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.6 15A8 8 0 1 0 6 7.3L4 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Try again
              </button>
              <Link
                to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'}
                className="inline-flex items-center gap-2.5 bg-white border-2 border-black text-black px-8 py-5 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#fafafa]"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <circle cx="12" cy="12" r="9" stroke="#000" strokeWidth="1.7"/>
                  <path d="M12 8V16M8 12H16" stroke="#000" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
                Submit a price instead
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ===== EMPTY ITEMS =====
  if (state === 'emptyItems') {
    return (
      <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
        <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-12">
          <div className="text-center py-16">
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
  const isLoadingPrices = pricesLoading && compareEntries.length === 0

  return (
    <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
      {reportTarget && (
        <ReportPriceModal
          priceId={reportTarget.priceId}
          product={reportTarget.product}
          market={reportTarget.market}
          price={reportTarget.price}
          onClose={() => setReportTarget(null)}
        />
      )}
      <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-12">
        <div>
          {/* Heading */}
          <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black leading-tight">Compare prices across markets</h1>
            {compareEntries.length > 0 && (
              <span className="text-sm text-[#9a9a9a] whitespace-nowrap mt-3">
                {itemName} - {compareEntries.length} market{compareEntries.length !== 1 ? 's' : ''}- updated now
              </span>
            )}
          </div>
          <p className="text-lg text-black mb-8">
            Showing current prices for: <b>{itemName}{unitLabel ? `- per ${unitLabel}` : ''}</b>
          </p>

          {/* Search / Autocomplete */}
          <div className="relative mb-8" ref={searchRef}>
            <div className="flex items-center gap-3 bg-input-bg border border-input-border rounded-xl px-4 py-4">
              <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 shrink-0">
                <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
                <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder={active?.label || 'Search items...'}
                className="bg-transparent border-none outline-none w-full text-sm text-black placeholder:text-[#999]"
              />
            </div>
            {showDropdown && searchInput.trim() !== '' && suggestions.length > 0 && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-grey-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((p) => {
                  const globalIdx = allProducts.indexOf(p)
                  return (
                    <button
                      key={`${p.itemId}-${p.unitId}`}
                      onClick={() => selectProduct(globalIdx)}
                      className="w-full text-left px-4 py-3 text-sm text-black hover:bg-input-bg transition cursor-pointer border-b border-input-border last:border-0"
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product pills (max 5 shown) */}
          <div className="flex gap-3 flex-wrap mb-10">
            {products.slice(0, 5).map((p, i) => (
              <button
                key={`${p.itemId}-${p.unitId}`}
                onClick={() => selectProduct(i)}
                className={`rounded-lg text-sm tracking-tight cursor-pointer transition ${
                  i === activeIdx
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white border border-days-grey text-black hover:bg-gray-50'
                } px-4 py-2`}
              >
                {p.label.split(',')[0]}
              </button>
            ))}
            {searchQuery && (
              <button
                onClick={() => { setSearchParams({}); setActiveIdx(0); setSearchInput('') }}
                className="px-4 py-2 rounded-lg text-sm cursor-pointer bg-white border border-red text-red hover:bg-red/5"
              >
                Clear search
              </button>
            )}
          </div>

          {searchQuery && products.length === 0 && allProducts.length > 0 && (
            <div className="text-center py-12">
              <p className="text-base text-[#666]">No items match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}

          {isLoadingPrices && (
            <div className="flex justify-center py-16">
              <div className="skeleton h-8 w-32 rounded-lg" />
            </div>
          )}

          {!isLoadingPrices && compareEntries.length === 0 && (
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

          {!isLoadingPrices && compareEntries.length > 0 && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Table header */}
                <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr_0.8fr] pb-5 border-b-2 border-black font-bold text-sm text-black">
                  <span>Market</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Submitted</span>
                  <span className="text-center">By</span>
                  <span />
                </div>

                {/* Table rows */}
                {compareEntries.map((e) => {
                  const marketName = e.market.name || ''
                  const area = [e.market.lga, e.market.state].filter(Boolean).join(', ')
                  const isCheapest = e.isCheapest
                  const isHighest = !isCheapest && e.price === highestPrice && highestPrice !== cheapestPrice
                  const stale = e.isStale
                  const reported = e.flagCount >= 2 || e.isFlagged

                  return (
                    <div
                      key={e.id}
                      className={`grid grid-cols-[1.7fr_1fr_1fr_1fr_0.8fr] items-center py-6 border-b border-black gap-2 ${
                        stale ? 'opacity-50' : reported ? 'opacity-40' : ''
                      }`}
                    >
                      {/* Market */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-black">{marketName}</span>
                          <span className="text-xs text-black">{area}</span>
                        </div>
                        {isCheapest && (
                          <span className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold text-white bg-green">
                            Cheapest
                          </span>
                        )}
                        {isHighest && (
                          <span className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold text-white bg-highest-red">
                            Highest
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <span className="font-semibold text-sm text-black text-center">
                        ₦{e.price.toLocaleString()} <span className="font-normal">{unitLabel ? `/ ${unitLabel}` : ''}</span>
                      </span>

                      {/* Submitted */}
                      <span className="text-sm text-black text-center">{getRelativeTime(e.createdAt)}</span>

                      {/* By */}
                      <span className="text-sm text-black text-center">{e.submitterDisplayName}</span>

                      {/* Flag */}
                      <button
                        onClick={() => handleFlag(e.id, marketName, e.price)}
                        className="border border-days-grey rounded-lg px-3 py-1.5 text-sm font-semibold text-highest-red justify-self-center bg-white hover:bg-gray-50 transition cursor-pointer"
                      >
                        Flag
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Average */}
              <p className="text-sm text-black py-6">
                Average across all markets: <b>₦{avgPrice.toLocaleString()}{unitLabel ? ` / ${unitLabel}` : ''}</b>
              </p>
            </div>
          )}

          {/* Bottom buttons */}
          <div className="flex gap-6 flex-wrap">
            <Link
              to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'}
              className="flex-1 min-w-[220px] bg-input-bg border border-days-grey text-black px-5 py-5 rounded-xl text-sm font-bold text-center hover:bg-[#efefef] transition cursor-pointer block"
            >
              Submit price
            </Link>
            <Link
              to="/prices"
              className="flex-1 min-w-[220px] bg-[#211a1a] text-white px-5 py-5 rounded-xl text-sm font-bold text-center hover:brightness-110 transition cursor-pointer block"
            >
              View trends
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
