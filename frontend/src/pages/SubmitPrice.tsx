import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const foodstuffs = ['Rice', 'Beans', 'Maize', 'Cassava', 'Yam']
const markets = ['Bodija Market', 'Dugbe Market', 'Gbagi Market']

type State = 'loading' | 'empty' | 'form' | 'validationError' | 'offline' | 'confirm'

export default function SubmitPrice() {
  const [state, setState] = useState<State>('loading')
  const [foodstuff, setFoodstuff] = useState('')
  const [market, setMarket] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [desc, setDesc] = useState('')
  const [foodOpen, setFoodOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setState('form'), 1200)
    return () => clearTimeout(timer)
  }, [])

  const marketError = state === 'validationError' && !market

  function validate() {
    if (!market) {
      setState('validationError')
      return false
    }
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setState('confirm')
  }

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[600px]">
          <div className="skeleton h-[56px] rounded-[12px] w-[36%] mx-auto mb-[22px]" />
          <div className="skeleton h-[14px] rounded-[8px] w-[34%] mx-auto mb-[44px]" />

          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="skeleton h-[16px] rounded-[8px] w-[110px] mb-3" />
              <div className="skeleton h-[64px] rounded-[12px] mb-[30px]" />
            </div>
          ))}

          <div className="skeleton h-[64px] rounded-[12px] mb-0" />
          <div className="skeleton h-[12px] rounded-[8px] w-[34%] mx-auto mt-6" />
        </div>
      </main>
    )
  }

  // ===== NO MARKET ADDED =====
  if (state === 'empty') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[640px]">
          <div className="flex items-start justify-between pb-5 border-b border-days-grey mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-black tracking-tight mb-1.5">Price Submission form</h1>
              <p className="text-sm text-days-grey">Help others compare before they travel</p>
            </div>
          </div>

          <div className="text-center max-w-[540px] mx-auto pt-10">
            <div className="w-20 h-20 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M3 9L4 4H20L21 9" stroke="#111" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M4 9C4 10.1 3.1 11 2 11M4 9C4 10.1 4.9 11 6 11M4 9V21H10V15H14V21H20V9M20 9C20 10.1 19.1 11 18 11M20 9C20 10.1 20.9 11 22 11M12 9C12 10.1 11.1 11 10 11M12 9C12 10.1 12.9 11 14 11M8 9C8 10.1 7.1 11 6 11M16 9C16 10.1 15.1 11 14 11" stroke="#111" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[28px] font-extrabold text-black mb-4">No market added yet</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-8">
              We don't have any markets in your area yet. Be the first to add a market and help your community shop smarter.
            </p>
            <button className="inline-flex items-center gap-2.5 px-[30px] py-[18px] bg-white border border-days-grey rounded-[12px] text-base font-bold text-black hover:bg-gray-50 transition cursor-pointer mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                <circle cx="12" cy="12" r="9" stroke="#000" strokeWidth="1.7" />
                <path d="M12 8V16M8 12H16" stroke="#000" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              Suggest a market
            </button>
            <p className="text-sm text-[#4a4a4a]">or check back later — markets are added regularly</p>
          </div>
        </div>
      </main>
    )
  }

  // ===== OFFLINE =====
  if (state === 'offline') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[640px]">
          <div className="flex items-start justify-between pb-5 border-b border-days-grey mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-black tracking-tight mb-1.5">Price Submission form</h1>
              <p className="text-sm text-days-grey">Help others compare before they travel</p>
            </div>
            <span className="text-sm text-days-grey whitespace-nowrap mt-1.5 font-medium">No internet connection</span>
          </div>

          <div className="text-center max-w-[540px] mx-auto">
            <div className="w-20 h-20 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M2 8.5C7 4 17 4 22 8.5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5.5 12C9 9 15 9 18.5 12" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 15.5C10.8 14 13.2 14 15 15.5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="19" r="1.1" fill="#111" />
                <path d="M2 2L22 22" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[28px] font-extrabold text-black mb-4">Can't reach the server</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-8">
              Your price could not be submitted. This could be a network issue or the server may be temporarily down. Your data has been saved and will submit automatically when you reconnect.
            </p>
            <span className="inline-block bg-[#f5f5f5] rounded-lg px-5 py-3 text-sm font-mono tracking-wider text-[#5a5a5a] mb-7">
              ERROR: 503 SERVICE UNAVAILABLE
            </span>

            <div className="bg-[#f6d99a] border border-[#e4bd6d] rounded-[12px] px-5 py-5 text-left mb-9">
              <div className="flex items-center gap-2 font-bold text-[#7a5a13] text-sm mb-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M5 3H15L19 7V21H5V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M9 13.5L11 15.5L15 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Saved locally</span>
              </div>
              <div className="text-base text-[#1a1a1a]">
                {foodstuff || 'Food item'} - {price ? `₦${price}` : 'Price'} / {unit || 'unit'} - waiting to sync
              </div>
            </div>

            <div className="flex justify-center mb-[22px]">
              <button
                onClick={() => setState('confirm')}
                className="min-w-[280px] inline-flex items-center justify-center gap-2.5 px-[30px] py-[18px] bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <path d="M4 4V9H9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.6 15A8 8 0 1 0 6 7.3L4 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Try again
              </button>
            </div>
            <p className="text-sm text-[#4a4a4a]">Check your internet connection and try again</p>
          </div>
        </div>
      </main>
    )
  }

  // ===== CONFIRMATION =====
  if (state === 'confirm') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[640px]">
          <div className="flex items-start justify-between pb-5 border-b border-days-grey mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-black tracking-tight mb-1.5">Price Submission form</h1>
              <p className="text-sm text-days-grey">Help others compare before they travel</p>
            </div>
          </div>

          <div className="text-center max-w-[560px] mx-auto pt-2">
            <div className="w-[76px] h-[76px] rounded-full bg-[#d3f2d9] flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-[34px] h-[34px] text-[#1a7d34]">
                <path d="M5 13L10 18L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[28px] font-extrabold text-black mb-4">Price submitted</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-8">
              Thanks for submitting this price. Our team will review it and publish it once it has been verified.
            </p>

            <div className="border border-days-grey rounded-[12px] px-[26px] mb-8 divide-y divide-days-grey">
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Food item</span>
                <span className="text-[17px] text-black text-right">{foodstuff}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Market</span>
                <span className="text-[17px] text-black text-right">{market}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Price</span>
                <span className="text-[17px] text-black text-right">₦{price} / {unit}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Submitted</span>
                <span className="text-[17px] text-green-text text-right">Just now</span>
              </div>
            </div>

            <div className="flex gap-5 flex-wrap">
              <button
                onClick={() => { setState('form'); setFoodstuff(''); setMarket(''); setPrice(''); setUnit(''); setDesc('') }}
                className="flex-1 min-w-[220px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <circle cx="12" cy="12" r="9" stroke="#000" strokeWidth="1.7" />
                  <path d="M12 8V16M8 12H16" stroke="#000" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                Add another
              </button>
              <Link
                to="/prices"
                className="flex-1 min-w-[220px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="#000" strokeWidth="1.6" />
                  <rect x="13" y="4" width="7" height="7" rx="1.2" stroke="#000" strokeWidth="1.6" />
                  <rect x="4" y="13" width="7" height="7" rx="1.2" stroke="#000" strokeWidth="1.6" />
                  <rect x="13" y="13" width="7" height="7" rx="1.2" stroke="#000" strokeWidth="1.6" />
                </svg>
                View comparison
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ===== FORM (default & validation error) =====
  const showAlert = state === 'validationError'

  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[600px]">
        <div className="flex items-start justify-between pb-5 border-b border-days-grey mb-10">
          <div>
            <h1 className="text-[32px] font-extrabold text-black tracking-tight mb-1.5">Price Submission form</h1>
            <p className="text-sm text-days-grey">Help others compare before they travel</p>
          </div>
        </div>

        {showAlert && (
          <div className="flex items-center justify-center gap-2.5 bg-[#fbd7d7] border border-[#e3a3a3] rounded-[12px] px-5 py-[18px] mb-8">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0 text-[#b40000]">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
            </svg>
            <span className="text-[#b40000] font-bold text-sm">1 field needs your attention before we can submit this price.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-7">
            <label className="block text-base text-[#111] mb-3">Foodstuff:</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setFoodOpen(!foodOpen)}
                className="w-full border border-days-grey rounded-[12px] px-5 py-[18px] text-base text-left flex items-center justify-between bg-white"
              >
                <span className={foodstuff ? 'text-black' : 'text-days-grey'}>{foodstuff || 'Select foodstuff'}</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {foodOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-days-grey rounded-[12px] z-10 overflow-hidden">
                  {foodstuffs.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => { setFoodstuff(f); setFoodOpen(false) }}
                      className="w-full px-5 py-3 text-base text-left hover:bg-input-bg transition cursor-pointer"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-7">
            <label className="block text-base text-[#111] mb-3">Market</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMarketOpen(!marketOpen)}
                className={`w-full border rounded-[12px] px-5 py-[18px] text-base text-left flex items-center justify-between bg-white ${
                  marketError ? 'border-[#b40000] bg-[#fbd7d7]' : 'border-days-grey'
                }`}
              >
                <span className={market ? 'text-black' : marketError ? 'text-black' : 'text-days-grey'}>{market || 'Select market'}</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {marketOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-days-grey rounded-[12px] z-10 overflow-hidden">
                  {markets.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMarket(m); setMarketOpen(false); if (marketError) setState('form') }}
                      className="w-full px-5 py-3 text-base text-left hover:bg-input-bg transition cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {marketError && (
              <div className="flex items-center gap-2 mt-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#b40000]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold text-[#b40000]">Please select a market</span>
              </div>
            )}
          </div>

          <div className="mb-7">
            <label className="block text-base text-[#111] mb-3">Price (NGN)</label>
            <div className="flex border border-days-grey rounded-[12px] overflow-hidden">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="113,47669"
                className="flex-1 px-5 py-[18px] text-base text-black outline-none border-none"
              />
              <div className="px-[22px] py-[18px] text-base text-black border-l border-days-grey whitespace-nowrap bg-white">
                NGN
              </div>
            </div>
          </div>

          <div className="mb-7">
            <label className="block text-base text-[#111] mb-3">Quantity / Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. 1 paint, 1 cup, per kg"
              className="w-full border border-days-grey rounded-[12px] px-5 py-[18px] text-base text-black outline-none focus:border-black placeholder-days-grey"
            />
          </div>

          <div className="mb-9">
            <label className="block text-base text-[#111] mb-3">Description <span className="text-days-grey font-normal">(optional)</span></label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. measured at 8am today"
              className="w-full border border-days-grey rounded-[12px] px-5 py-[18px] text-base text-black outline-none focus:border-black placeholder-days-grey"
            />
          </div>

          <button type="submit" className="w-full bg-[#b40000] text-white border-none rounded-[12px] py-5 text-[17px] font-bold cursor-pointer hover:brightness-110 transition mb-[18px]">
            Submit price
          </button>
          <p className="text-center text-sm text-[#333]">Your name is never shown publicly</p>
        </form>
      </div>
    </main>
  )
}
