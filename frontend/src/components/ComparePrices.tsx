import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime, isStale } from '../utils/time'
import { getReportCount, addReport } from '../utils/reports'
import ReportPriceModal from './ReportPriceModal'

interface MarketRow {
  name: string
  location: string
  price: string
  priceValue: number
  unit: string
  trend: string
  trendDir: 'up' | 'down' | 'stable'
  change: number
  badge?: 'cheapest' | 'highest'
  isSeed?: boolean
  source?: string
  updatedAt: string
}

const products = ['Rice (local)', 'Beans', 'Tomatoes', 'Garri', 'Palm oil']

const baseRows: MarketRow[] = [
  { name: 'Bodija Market', location: 'Ibadan, Oyo', price: '₦1,800', priceValue: 1800, unit: 'mudu', trend: '↘ ₦200 down', trendDir: 'down', change: -200, badge: 'cheapest', updatedAt: '2026-07-20T08:00:00Z' },
  { name: 'Dugbe Market', location: 'Ibadan, Oyo', price: '₦2,100', priceValue: 2100, unit: 'mudu', trend: '— No change', trendDir: 'stable', change: 0, updatedAt: '2026-07-15T10:30:00Z', isSeed: true, source: 'NBS' },
  { name: 'Gbagi Market', location: 'Ibadan, Oyo', price: '₦2,500', priceValue: 2500, unit: 'mudu', trend: '↗ ₦300 up', trendDir: 'up', change: 300, badge: 'highest', updatedAt: '2026-06-10T14:00:00Z' },
]

export default function ComparePrices() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [reportTarget, setReportTarget] = useState<{ product: string; market: string; price: string } | null>(null)
  const [reportVersion, setReportVersion] = useState(0)

  const rows = useMemo(() => {
    return baseRows.map((r) => ({
      ...r,
      reportCount: getReportCount(products[active], r.name),
    }))
  }, [active, reportVersion])

  const visibleRows = rows.filter((r) => r.reportCount < 3)

  function handleFlag(market: string, price: string) {
    if (!isAuthenticated) {
      navigate('/signin?returnUrl=/prices#compare')
      return
    }
    setReportTarget({ product: products[active], market, price })
  }

  function handleReported(market: string) {
    addReport(products[active], market)
    setReportVersion((v) => v + 1)
    setReportTarget(null)
  }

  return (
    <section id="compare" className="px-6 sm:px-12 lg:px-20 mt-10 relative z-10">
      {reportTarget && (
        <ReportPriceModal
          product={reportTarget.product}
          market={reportTarget.market}
          price={reportTarget.price}
          onClose={() => setReportTarget(null)}
          onReported={() => handleReported(reportTarget.market)}
        />
      )}
      <div className="max-w-[1240px] mx-3 sm:mx-6 lg:mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12">
        <div className="m-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-black mb-1">Compare prices across markets</h2>
              <p className="text-lg font-medium text-black">Showing current prices for: {products[active]}&nbsp;- per {rows[0]?.unit || 'unit'}</p>
            </div>
            <span className="text-sm font-medium text-[#1E1E1E] whitespace-nowrap">
              updated {getRelativeTime(Math.min(...rows.map((r) => new Date(r.updatedAt).getTime())).toString())}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-input-bg border border-input-border rounded-lg px-4 py-3.5 mb-4">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
              <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-black">{products[active]}</span>
          </div>

          <div className="flex gap-2 flex-wrap mb-8">
            {products.map((p, i) => (
              <button
                key={p}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-lg text-sm tracking-tight transition cursor-pointer ${
                  i === active
                    ? 'bg-ink text-white border-ink'
                    : 'bg-input-bg border border-input-border text-[#252323] hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {visibleRows.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" stroke="#A1A1A1" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="#A1A1A1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No prices yet</h3>
              <p className="text-sm text-[#666] mb-5">Be the first to submit a price for {products[active]}!</p>
              <Link to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'} className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                Submit a price
              </Link>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] pb-4 border-b border-text-dark text-sm font-bold text-text-dark">
                  <span>Market</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Trend</span>
                  <span className="text-center">Age</span>
                  <span className="text-center">Reports</span>
                  <span />
                </div>

                {visibleRows.map((r) => {
                  const stale = isStale(r.updatedAt)
                  const reported = r.reportCount >= 2 && r.reportCount < 3

                  return (
                    <div
                      key={r.name + (r.reportCount >= 2 ? '-reported' : '')}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center py-5 border-b border-text-dark gap-2 ${
                        stale ? 'opacity-50' : reported ? 'opacity-40' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center flex-wrap gap-x-2">
                          <span className="font-semibold text-base text-text-dark">{r.name}</span>
                          {stale && (
                            <span className="text-[10px] font-semibold text-[#888] bg-[#eee] px-2 py-0.5 rounded-full leading-normal">
                              {getRelativeTime(r.updatedAt)}
                            </span>
                          )}
                          {reported && (
                            <span className="text-[10px] font-semibold text-red-flag bg-red-flag/10 px-2 py-0.5 rounded-full leading-normal">
                              reported
                            </span>
                          )}
                          {r.isSeed && (
                            <span className="text-[10px] font-medium text-[#8a7a3a] bg-[#f6d99a] px-2 py-0.5 rounded-full leading-normal">
                              Source: {r.source}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-text-dark">{r.location}</span>
                        {r.badge && (
                          <span
                            className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium text-white mt-1.5 w-fit ${
                              r.badge === 'cheapest' ? 'bg-green' : 'bg-highest-red'
                            }`}
                          >
                            {r.badge === 'cheapest' ? 'Cheapest' : 'Highest'}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-base text-text-dark text-center">{r.price} / {r.unit}</span>
                      <span className="text-sm text-text-dark text-center">{r.trend}</span>
                      <span className="text-xs text-text-dark text-center">{getRelativeTime(r.updatedAt)}</span>
                      <span className="text-sm text-text-dark text-center">{r.reportCount > 0 ? `${r.reportCount} reports` : '—'}</span>
                      <button
                        onClick={() => handleFlag(r.name, r.price)}
                        className="border border-days-grey rounded-lg px-3.5 py-2 text-sm text-red-flag justify-self-center hover:bg-gray-50 transition cursor-pointer"
                      >
                        ⚑ Flag
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <p className="text-sm font-medium text-text-dark py-5">
            {visibleRows.length > 0 && `Average across all markets: ₦${Math.round(visibleRows.reduce((a, r) => a + r.priceValue, 0) / visibleRows.length)} / ${rows[0]?.unit || 'unit'}`}
          </p>

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
