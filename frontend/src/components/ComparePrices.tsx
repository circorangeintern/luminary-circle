import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime, isStale } from '../utils/time'
import { getReportCount, addReport } from '../utils/reports'
import ReportPriceModal from './ReportPriceModal'

interface PriceEntry {
  market: string
  area: string
  price: number
  submittedAt: string
  submittedBy: string
  isCheapest?: boolean
  reportCount: number
  isSeed?: boolean
  source?: string
}

interface ProductOption {
  item: string
  measure: string
  label: string
  entries: PriceEntry[]
}

const products: ProductOption[] = [
  {
    item: 'Rice', measure: 'derica', label: 'Rice, derica',
    entries: [
      { market: 'Bodija Market', area: 'Ibadan, Oyo', price: 1800, submittedAt: '2026-07-21T08:00:00Z', submittedBy: 'Chioma O.', isCheapest: true, reportCount: 0 },
      { market: 'Dugbe Market', area: 'Ibadan, Oyo', price: 2100, submittedAt: '2026-07-15T10:30:00Z', submittedBy: 'Segun A.', reportCount: 0, isSeed: true, source: 'NBS' },
      { market: 'Gbagi Market', area: 'Ibadan, Oyo', price: 2500, submittedAt: '2026-06-10T14:00:00Z', submittedBy: 'Funmi K.', reportCount: 1 },
    ],
  },
  {
    item: 'Rice', measure: 'paint bucket', label: 'Rice, paint bucket',
    entries: [
      { market: 'Bodija Market', area: 'Ibadan, Oyo', price: 4500, submittedAt: '2026-07-20T09:00:00Z', submittedBy: 'Chioma O.', isCheapest: true, reportCount: 0 },
      { market: 'Dugbe Market', area: 'Ibadan, Oyo', price: 4900, submittedAt: '2026-07-18T12:00:00Z', submittedBy: 'Segun A.', reportCount: 0 },
    ],
  },
  {
    item: 'Eggs', measure: 'crate', label: 'Eggs, crate',
    entries: [
      { market: 'Dugbe Market', area: 'Ibadan, Oyo', price: 3200, submittedAt: '2026-07-22T06:00:00Z', submittedBy: 'Musa B.', reportCount: 0 },
    ],
  },
  {
    item: 'Garri', measure: '50kg bag', label: 'Garri, 50kg bag',
    entries: [],
  },
  {
    item: 'Tomatoes', measure: 'basket', label: 'Tomatoes, basket',
    entries: [
      { market: 'Gbagi Market', area: 'Ibadan, Oyo', price: 8500, submittedAt: '2026-07-19T14:00:00Z', submittedBy: 'Ifeanyi E.', reportCount: 2 },
      { market: 'Bodija Market', area: 'Ibadan, Oyo', price: 9200, submittedAt: '2026-07-17T10:00:00Z', submittedBy: 'Chioma O.', reportCount: 0 },
      { market: 'Dugbe Market', area: 'Ibadan, Oyo', price: 7800, submittedAt: '2026-07-22T08:00:00Z', submittedBy: 'Amina S.', isCheapest: true, reportCount: 0 },
    ],
  },
]

export default function ComparePrices() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [reportTarget, setReportTarget] = useState<{ product: string; market: string; price: string } | null>(null)
  const [reportVersion, setReportVersion] = useState(0)

  const product = products[active]

  const entries = useMemo(() => {
    return product.entries.map((e) => ({
      ...e,
      reportCount: getReportCount(product.label, e.market),
    }))
  }, [product, reportVersion])

  const validEntries = entries.filter((e) => e.reportCount < 3)
  const cheapest = validEntries.find((e) => e.isCheapest) ?? null

  function handleFlag(market: string, price: number) {
    if (!isAuthenticated) {
      navigate('/signin?returnUrl=/prices#compare')
      return
    }
    setReportTarget({ product: product.label, market, price: `₦${price.toLocaleString()}` })
  }

  function handleReported(market: string) {
    addReport(product.label, market)
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
              {validEntries.length > 0 && (
                <p className="text-lg font-medium text-black">Showing prices for: {product.label}</p>
              )}
            </div>
            {validEntries.length > 1 && (
              <span className="text-sm font-medium text-[#1E1E1E] whitespace-nowrap">
                updated {getRelativeTime(Math.min(...validEntries.map((e) => new Date(e.submittedAt).getTime())).toString())}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 bg-input-bg border border-input-border rounded-lg px-4 py-3.5 mb-4">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
              <circle cx="9" cy="9" r="6" stroke="#A1A1A1" strokeWidth="1.5" />
              <path d="M14 14L17.5 17.5" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-black">{product.label}</span>
          </div>

          <div className="flex gap-2 flex-wrap mb-8">
            {products.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-lg text-sm tracking-tight transition cursor-pointer ${
                  i === active
                    ? 'bg-ink text-white border-ink'
                    : 'bg-input-bg border border-input-border text-[#252323] hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {validEntries.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <circle cx="12" cy="12" r="10" stroke="#A1A1A1" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="#A1A1A1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No prices yet</h3>
              <p className="text-sm text-[#666] mb-5">Be the first to submit a price for {product.label}!</p>
              <Link to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'} className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
                Submit a price
              </Link>
            </div>
          )}

          {validEntries.length === 1 && (
            <div className="border border-days-grey rounded-[12px] p-8 max-w-[600px] mx-auto">
              <div className="flex items-center justify-center gap-1.5 text-green-text text-sm font-medium mb-6">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Only one price available — nothing to compare yet</span>
              </div>
              <div className="text-center">
                <p className="text-xs text-days-grey mb-1.5">{validEntries[0].market}</p>
                <p className="text-4xl font-extrabold text-black mb-2">₦{validEntries[0].price.toLocaleString()}</p>
                <p className="text-sm text-[#555]">per {product.measure}</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-days-grey">
                  <span>{getRelativeTime(validEntries[0].submittedAt)}</span>
                  <span>·</span>
                  <span>by {validEntries[0].submittedBy}</span>
                </div>
              </div>
              <div className="flex justify-center mt-7">
                <button
                  onClick={() => handleFlag(validEntries[0].market, validEntries[0].price)}
                  className="border border-days-grey rounded-lg px-4 py-2 text-sm text-red-flag hover:bg-gray-50 transition cursor-pointer"
                >
                  ⚑ Flag
                </button>
              </div>
            </div>
          )}

          {validEntries.length >= 2 && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] pb-4 border-b border-text-dark text-sm font-bold text-text-dark">
                  <span>Market</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Submitted</span>
                  <span className="text-center">By</span>
                  <span />
                </div>

                {validEntries.map((e) => {
                  const stale = isStale(e.submittedAt)
                  const reported = e.reportCount >= 2 && e.reportCount < 3

                  return (
                    <div
                      key={e.market}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-5 border-b border-text-dark gap-2 ${
                        stale ? 'opacity-50' : reported ? 'opacity-40' : ''
                      } ${e.isCheapest ? 'bg-[#eafaf1] border-l-4 border-l-green-text pl-1 rounded-sm' : ''}`}
                    >
                      <div>
                        <div className="flex items-center flex-wrap gap-x-2">
                          <span className={`font-semibold text-base ${e.isCheapest ? 'text-green-text' : 'text-text-dark'}`}>
                            {e.market}
                          </span>
                          {e.isCheapest && (
                            <span className="bg-green-text text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full leading-normal">
                              Cheapest
                            </span>
                          )}
                          {stale && (
                            <span className="text-[10px] font-semibold text-[#888] bg-[#eee] px-2 py-0.5 rounded-full leading-normal">
                              {getRelativeTime(e.submittedAt)}
                            </span>
                          )}
                          {reported && (
                            <span className="text-[10px] font-semibold text-red-flag bg-red-flag/10 px-2 py-0.5 rounded-full leading-normal">
                              reported
                            </span>
                          )}
                          {e.isSeed && (
                            <span className="text-[10px] font-medium text-[#8a7a3a] bg-[#f6d99a] px-2 py-0.5 rounded-full leading-normal">
                              Source: {e.source}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-text-dark">{e.area}</span>
                      </div>
                      <span className={`font-bold text-base text-center ${e.isCheapest ? 'text-green-text text-lg' : 'text-text-dark'}`}>
                        ₦{e.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-text-dark text-center">{getRelativeTime(e.submittedAt)}</span>
                      <span className="text-sm text-text-dark text-center">{e.submittedBy}</span>
                      <button
                        onClick={() => handleFlag(e.market, e.price)}
                        className="border border-days-grey rounded-lg px-3.5 py-2 text-sm text-red-flag justify-self-center hover:bg-gray-50 transition cursor-pointer"
                      >
                        ⚑ Flag
                      </button>
                    </div>
                  )
                })}
              </div>

              <p className="text-sm font-medium text-text-dark py-5">
                Average across {validEntries.length} markets: ₦{Math.round(validEntries.reduce((a, e) => a + e.price, 0) / validEntries.length).toLocaleString()} / {product.measure}
                {cheapest && <> — <span className="text-green-text">{cheapest.market} is cheapest</span></>}
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
