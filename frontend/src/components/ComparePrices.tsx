import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReportPriceModal from './ReportPriceModal'

interface MarketRow {
  name: string
  location: string
  price: string
  trend: string
  reports: string
  badge?: 'cheapest' | 'highest'
}

const products = ['Rice (local)', 'Beans', 'Tomatoes', 'Garri', 'Palm oil']

const rows: MarketRow[] = [
  { name: 'Bodija Market', location: 'Ibadan, Oyo', price: '₦1,800 / mudu', trend: '↘ ₦200 down', reports: '12 reports', badge: 'cheapest' },
  { name: 'Dugbe Market', location: 'Ibadan, Oyo', price: '₦2,100 / mudu', trend: '— No change', reports: '7 reports' },
  { name: 'Gbagi Market', location: 'Ibadan, Oyo', price: '₦2,500 / mudu', trend: '↗ ₦300 up', reports: '5 reports', badge: 'highest' },
]

export default function ComparePrices() {
  const [active, setActive] = useState(0)
  const [reportTarget, setReportTarget] = useState<{ product: string; market: string; price: string } | null>(null)

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
              <p className="text-lg font-medium text-black">Showing current prices for: Rice(local)&nbsp;- per mudu</p>
            </div>
            <span className="text-sm font-medium text-[#1E1E1E] whitespace-nowrap">updated 20mins ago</span>
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

          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] pb-4 border-b border-text-dark text-sm font-bold text-text-dark">
                <span>Market</span>
                <span className="text-center">Price</span>
                <span className="text-center">Trend</span>
                <span className="text-center">Submissions</span>
                <span />
              </div>

              {rows.map((r) => (
                <div
                  key={r.name}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center py-5 border-b border-text-dark gap-2"
                >
                  <div>
                    <span className="font-semibold text-base text-text-dark block">{r.name}</span>
                    <span className="text-sm text-text-dark">{r.location}</span>
                    {r.badge && (
                      <span
                      className={`inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-medium text-white mt-1.5 ml-2 w-fit ${
                        r.badge === 'cheapest' ? 'bg-green' : 'bg-highest-red'
                      }`}
                      >
                        {r.badge === 'cheapest' ? 'Cheapest' : 'Highest'}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-base text-text-dark text-center">{r.price}</span>
                  <span className="text-sm text-text-dark text-center">{r.trend}</span>
                  <span className="text-sm text-text-dark text-center">{r.reports}</span>
                  <button
                    onClick={() => setReportTarget({ product: products[active], market: r.name, price: r.price })}
                    className="border border-days-grey rounded-lg px-3.5 py-2 text-sm text-red-flag justify-self-center hover:bg-gray-50 transition cursor-pointer"
                  >
                    ⚑ Flag
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm font-medium text-text-dark py-5">Average across all markets: ₦2,133 / mudu</p>

          <div className="flex gap-5 flex-wrap">
            <Link to="/prices/list" className="flex-1 min-w-[180px] bg-[#2C2424] border border-grey-border text-white px-4 py-4 rounded-lg text-sm text-center hover:brightness-110 transition cursor-pointer block">
              View details
            </Link>
            <button className="flex-1 min-w-[180px] bg-input-bg border border-grey-border text-[#252323] px-4 py-4 rounded-lg text-sm text-center hover:bg-gray-100 transition cursor-pointer">
              Submit price
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
