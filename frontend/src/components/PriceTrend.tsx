import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime } from '../utils/time'
import { fetchItems, fetchPrices } from '../services/api'
import type { ItemDto, PriceDto } from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface ProductOption {
  label: string
  itemId: string
  unitId: string
}

type State = 'loading' | 'itemsLoaded' | 'offline' | 'emptyItems'

const CHART_COLORS = ['#1D9E75', '#378ADD', '#F73939', '#9B59B6', '#E67E22', '#2C3E50']

export default function PriceTrend() {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<ItemDto[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [prices, setPrices] = useState<PriceDto[]>([])
  const [pricesLoading, setPricesLoading] = useState(false)

  const products = useMemo(() => {
    const result: ProductOption[] = []
    for (const item of items) {
      for (const unit of item.units) {
        result.push({ label: `${item.name}, ${unit.label}`, itemId: item.id, unitId: unit.id })
      }
    }
    return result
  }, [items])

  useEffect(() => {
    fetchItems()
      .then((data) => {
        setItems(data)
        setState(data.length === 0 ? 'emptyItems' : 'itemsLoaded')
      })
      .catch(() => setState('offline'))
  }, [])

  const active = products[activeIdx]

  useEffect(() => {
    if (!active) return
    setPricesLoading(true)
    fetchPrices({ itemId: active.itemId, unitId: active.unitId, pageSize: 50 })
      .then((res) => setPrices(res.items))
      .catch(() => setPrices([]))
      .finally(() => setPricesLoading(false))
  }, [active?.itemId, active?.unitId])

  const marketSeries = useMemo(() => {
    const groups = new Map<string, PriceDto[]>()
    for (const p of prices) {
      const name = p.market.name
      if (!name) continue
      if (!groups.has(name)) groups.set(name, [])
      groups.get(name)!.push(p)
    }
    for (const [, arr] of groups) {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    return groups
  }, [prices])

  const marketNames = useMemo(() => Array.from(marketSeries.keys()), [marketSeries])

  const chartData = useMemo(() => {
    const allDates = new Set<string>()
    for (const [, arr] of marketSeries) {
      for (const p of arr) {
        allDates.add(new Date(p.createdAt).toISOString())
      }
    }
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    )

    return sortedDates.map((dateStr) => {
      const point: Record<string, string | number | null> = { fullDate: dateStr }
      for (const name of marketNames) {
        const series = marketSeries.get(name)!
        const match = series
          .filter((p) => new Date(p.createdAt).getTime() <= new Date(dateStr).getTime())
          .pop()
        point[name] = match?.price ?? null
      }
      return point
    })
  }, [marketSeries, marketNames])

  const summary = useMemo(() => {
    if (marketNames.length === 0 || prices.length === 0) return null

    let latestPrice: PriceDto | null = null
    for (const [, arr] of marketSeries) {
      const last = arr[arr.length - 1]
      if (!last) continue
      if (!latestPrice || new Date(last.createdAt) > new Date(latestPrice.createdAt)) {
        latestPrice = last
      }
    }

    const latestPerMarket = marketNames
      .map((name) => {
        const arr = marketSeries.get(name)!
        return arr[arr.length - 1]
      })
      .filter(Boolean) as PriceDto[]

    const avg = latestPerMarket.length > 0
      ? Math.round(latestPerMarket.reduce((s, p) => s + p.price, 0) / latestPerMarket.length)
      : 0

    const allSorted = prices.slice().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    const firstPrice = allSorted[0]?.price ?? 0
    const lastPriceRaw = allSorted[allSorted.length - 1]?.price ?? 0
    const diff = lastPriceRaw - firstPrice

    return { latestPrice, avg, firstPrice, lastPriceRaw, diff }
  }, [marketSeries, marketNames, prices])

  const measure = active?.label.split(', ')[1] || ''

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <div className="px-6 sm:px-12 lg:px-20 pb-12">
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
          <div className="m-8">
            <div className="skeleton h-8 w-1/2 rounded-lg mb-2" />
            <div className="skeleton h-5 w-1/3 rounded-lg mb-6" />
            <div className="skeleton h-12 rounded-lg mb-4" />
            <div className="flex gap-2 mb-8">
              {[1,2,3,4].map((i) => <div key={i} className="skeleton h-9 rounded-lg w-24" />)}
            </div>
            <div className="flex gap-6 flex-wrap mb-8">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-lg flex-1 min-w-[200px]" />)}
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
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
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
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
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
  const isLoadingPrices = pricesLoading && prices.length === 0

  return (
    <div className="px-6 sm:px-12 lg:px-20 pb-12">
      <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
        <div className="m-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-black mb-1">Price trend - {active?.label}</h2>
              <p className="text-lg font-medium text-black">
                {isLoadingPrices ? 'Loading...' : chartData.length > 0 ? `Last ${chartData.length} observations across ${marketNames.length} markets` : 'Waiting for submissions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-input-bg border border-input-border rounded-lg px-4 py-3.5 mb-4">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
              <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-black">{active?.label}</span>
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

          {!isLoadingPrices && chartData.length === 0 && (
            <div className="text-center py-16 mb-6">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <path d="M3 3V21H21" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 16L11 11L15 14L19 8" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No trend data yet</h3>
              <p className="text-sm text-[#666] mb-5">Be the first to submit a price for {active?.label}!</p>
              <Link to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'} className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                Submit a price
              </Link>
            </div>
          )}

          {!isLoadingPrices && chartData.length > 0 && summary && (
            <>
              <div className="flex gap-6 flex-wrap mb-8">
                <div className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
                  <p className="text-xs text-text-dark mb-0.5">Latest price</p>
                  <p className="text-xl font-semibold text-text-dark mb-0.5">
                    ₦{summary.latestPrice!.price.toLocaleString()} / {measure}
                  </p>
                  <p className="text-xs text-green-text">
                    {summary.latestPrice!.market.name} - {getRelativeTime(summary.latestPrice!.createdAt)}
                  </p>
                </div>
                <div className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
                  <p className="text-xs text-text-dark mb-0.5">Market average (latest)</p>
                  <p className="text-xl font-semibold text-text-dark mb-0.5">₦{summary.avg.toLocaleString()}</p>
                  <p className="text-xs text-green-text">across {marketNames.length} market{marketNames.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
                  <p className="text-xs text-text-dark mb-0.5">Overall direction</p>
                  <p className="text-xl font-semibold text-text-dark mb-0.5">
                    {summary.diff < 0 ? 'Going up' : summary.diff > 0 ? 'Going down' : 'Stable'}
                  </p>
                  <p className="text-xs text-green-text">
                    {summary.diff > 0
                      ? `↘ ₦${summary.diff.toLocaleString()} drop`
                      : summary.diff < 0
                        ? `↗ ₦${Math.abs(summary.diff).toLocaleString()} rise`
                        : '— No change'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-8 flex-wrap mb-6">
                {marketNames.map((name) => {
                  const idx = marketNames.indexOf(name)
                  return (
                    <div key={name} className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="font-semibold text-sm sm:text-base text-text-dark">{name}</span>
                    </div>
                  )
                })}
              </div>

              <div className="w-full h-72 sm:h-80 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(208,213,221,0.87)" />
                    <XAxis
                      dataKey="fullDate"
                      tickFormatter={(val: string) => getRelativeTime(val)}
                      tick={{ fontSize: 11, fill: '#121212' }}
                    />
                    <YAxis
                      domain={['dataMin - 200', 'dataMax + 200']}
                      tick={{ fontSize: 13, fill: '#121212' }}
                    />
                    <Tooltip labelFormatter={(val) => getRelativeTime(String(val))} />
                    <Legend />
                    {marketNames.map((name) => {
                      const idx = marketNames.indexOf(name)
                      return (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: CHART_COLORS[idx % CHART_COLORS.length] }}
                          connectNulls
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          <div className="flex justify-center gap-5 flex-wrap pt-6 border-t border-dashed border-[rgba(208,213,221,0.87)]">
            <Link
              to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'}
              className="min-w-[220px] bg-[#2C2424] border border-grey-border text-white px-4 py-4 rounded-lg text-sm text-center hover:brightness-110 transition cursor-pointer block"
            >
              Submit price
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
