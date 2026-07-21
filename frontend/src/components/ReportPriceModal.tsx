import { useState, useEffect } from 'react'

interface ReportPriceModalProps {
  product: string
  market: string
  price: string
  onClose: () => void
}

const reasons = [
  {
    title: 'Price is too low - seems incorrect',
    desc: 'The amount looks unrealistically cheap',
  },
  {
    title: 'Price is too high - seems incorrect',
    desc: 'The amount looks unrealistically expensive',
  },
  {
    title: 'Price is outdated',
    desc: 'This no longer reflects current market price',
  },
  {
    title: 'Wrong market or item',
    desc: 'This was submitted for the wrong location or food',
  },
]

type State = 'loading' | 'default' | 'validationError' | 'notSent' | 'confirm'

export default function ReportPriceModal({ product, market, price, onClose }: ReportPriceModalProps) {
  const [state, setState] = useState<State>('loading')
  const [selected, setSelected] = useState<number | null>(null)
  const [details, setDetails] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setState('default'), 1200)
    return () => clearTimeout(timer)
  }, [])

  function handleSubmit() {
    if (selected === null) {
      setState('validationError')
      return
    }
    setState('confirm')
  }

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="w-full max-w-[680px] bg-white rounded-[16px] p-8">
          <div className="flex items-center justify-between pb-5 border-b border-days-grey mb-8">
            <h1 className="text-xl font-bold text-black">Report this price</h1>
            <span className="text-sm text-days-grey">Loading price data...</span>
          </div>
          <div className="skeleton h-[74px] rounded-[12px] mb-6" />
          <div className="skeleton h-[34px] rounded-[12px] w-[52%] mb-6" />
          <div className="skeleton h-[74px] rounded-[12px] mb-6" />
          <div className="skeleton h-[74px] rounded-[12px] mb-6" />
          <div className="skeleton h-[74px] rounded-[12px] mb-6" />
          <div className="flex gap-5">
            <div className="skeleton h-[74px] rounded-[12px] flex-[0_0_42%]" />
            <div className="skeleton h-[74px] rounded-[12px] flex-1" />
          </div>
        </div>
      </div>
    )
  }

  if (state === 'notSent') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="w-full max-w-[640px] bg-white rounded-[16px] p-8">
          <div className="flex items-center justify-between pb-5 border-b border-days-grey mb-8">
            <h1 className="text-xl font-bold text-black">Report this price</h1>
            <span className="text-sm text-days-grey">No internet connection</span>
          </div>
          <div className="text-center max-w-[520px] mx-auto">
            <div className="w-20 h-20 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M2 8.5C7 4 17 4 22 8.5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5.5 12C9 9 15 9 18.5 12" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 15.5C10.8 14 13.2 14 15 15.5" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="19" r="1.1" fill="#111" />
                <path d="M2 2L22 22" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-black mb-4">Report couldn't be sent</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-8">
              Your report was saved but could not be submitted — you appear to be offline. It will be sent automatically once you reconnect.
            </p>
            <span className="inline-block bg-[#f5f5f5] rounded-lg px-5 py-2.5 text-sm font-mono text-[#6a6a6a] mb-7">
              Error: 503 - Network unavailable
            </span>
            <div className="bg-[#f6d99a] border border-[#e4bd6d] rounded-[12px] px-5 py-5 text-left mb-7">
              <div className="flex items-center gap-2 font-bold text-[#7a5a13] text-sm mb-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M5 3H15L19 7V21H5V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M9 13.5L11 15.5L15 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Saved locally</span>
              </div>
              <div className="text-sm text-[#2a2a2a]">
                {product} - {price} - {market} — &ldquo;{selected !== null ? reasons[selected].title : 'No reason selected'}&rdquo; — waiting to send
              </div>
            </div>
            <div className="flex gap-5 max-w-[520px] mx-auto mb-6">
              <button
                onClick={() => setState('confirm')}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-input-bg border border-grey-border rounded-[12px] text-sm text-black hover:bg-gray-200 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M4 4V9H9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.6 15A8 8 0 1 0 6 7.3L4 9" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Retry now
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-white border border-days-grey rounded-[12px] text-sm text-black hover:bg-gray-50 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to comparison
              </button>
            </div>
            <p className="text-sm text-[#4a4a4a]">Your report will not be lost</p>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="w-full max-w-[640px] bg-white rounded-[16px] p-8">
          <div className="text-center max-w-[520px] mx-auto pt-2">
            <div className="w-[76px] h-[76px] rounded-full bg-[#d3f2d9] flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-[34px] h-[34px] text-[#1a7d34]">
                <path d="M5 13L10 18L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-black mb-4">Report submitted</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-8">
              Thanks for keeping MarketCompare accurate. Our team will review this price and remove it if confirmed wrong.
            </p>
            <div className="border border-days-grey rounded-[12px] px-6 mb-8 divide-y divide-days-grey">
              {[
                { label: 'Food item', value: product },
                { label: 'Price', value: price },
                { label: 'Market', value: market },
                { label: 'Reason', value: selected !== null ? reasons[selected].title : '' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-3.5">
                  <span className="text-sm text-black">{row.label}</span>
                  <span className="text-sm text-[#3a3a3a] text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-5">
              <button
                onClick={onClose}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-white border border-days-grey rounded-[12px] text-sm text-black hover:bg-gray-50 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to comparison
              </button>
              <button
                onClick={() => { setState('default'); setSelected(null); setDetails('') }}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#161111] rounded-[12px] text-sm text-white hover:brightness-125 transition cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" />
                  <path d="M12 8V16M8 12H16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Submit another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const showValidationError = state === 'validationError'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-[680px] bg-white rounded-[16px] flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-days-grey">
          <h1 className="text-xl font-bold text-black">Report this price</h1>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-black cursor-pointer bg-white shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M6 6L18 18M18 6L6 18" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          {showValidationError && (
            <div className="flex items-center justify-center gap-2.5 bg-[#fbd7d7] border border-[#e3a3a3] rounded-[12px] px-5 py-[18px] mb-7">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0 text-[#b40000]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
              </svg>
              <span className="text-[#b40000] font-bold text-sm">Please select a reason before submitting your report.</span>
            </div>
          )}

          {showValidationError ? (
            <div className="flex items-center justify-between gap-4 border border-days-grey rounded-[10px] px-5 py-[18px] mb-8 flex-wrap">
              <span className="text-[17px] text-black">{product} - {price}</span>
              <span className="text-sm text-days-grey whitespace-nowrap">{market} - today</span>
            </div>
          ) : (
            <div className="mb-9">
              <p className="text-lg font-normal text-black mb-5">You are Reporting</p>
              <p className="text-[19px] text-black mb-1.5">{product} - {price}</p>
              <p className="text-sm text-days-grey">{market} - submitted today</p>
            </div>
          )}

          <p className="text-[19px] font-semibold text-black mb-[18px]">Why is the pricing wrong?</p>
          <div className="flex flex-col gap-[18px] mb-2">
            {reasons.map((reason, i) => (
              <button
                key={i}
                onClick={() => { setSelected(i); if (showValidationError) setState('default') }}
                className={`flex items-start gap-5 w-full px-[26px] py-[22px] border rounded-[14px] text-left cursor-pointer transition ${
                  showValidationError && selected === i
                    ? 'border-[#fbd7d7] bg-[#fbd7d7]'
                    : 'border-days-grey bg-white hover:border-black/30'
                }`}
              >
                <div className={`w-[22px] h-[22px] rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition ${
                  selected === i
                    ? showValidationError ? 'border-[#b40000]' : 'border-ink'
                    : 'border-[#7a7a7a]'
                }`}>
                  {selected === i && (
                    <div className={`w-[10px] h-[10px] rounded-full ${showValidationError ? 'bg-[#b40000]' : 'bg-ink'}`} />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[18px] font-semibold text-black">{reason.title}</span>
                  <span className="text-sm text-days-grey">{reason.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {showValidationError && (
            <div className="flex items-center gap-2 mt-5 mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-[17px] h-[17px] shrink-0 text-[#b40000]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
              </svg>
              <span className="text-sm font-semibold text-[#b40000]">You must select a reason to continue</span>
            </div>
          )}

          <p className="text-[17px] font-semibold text-black mb-4 mt-8">
            Extra details <span className="font-normal text-days-grey">(optional)</span>
          </p>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g I was at Bodija today and it was ₦1,800 / mudu"
            className="w-full min-h-[110px] border border-days-grey rounded-[12px] px-5 py-5 text-sm text-days-grey resize-y outline-none focus:border-black focus:text-black mb-10"
          />

          <div className="flex gap-[22px]">
            <button
              onClick={onClose}
              className="flex-[0_0_260px] h-12 flex items-center justify-center border border-days-grey rounded-[12px] text-sm font-semibold text-black bg-white hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 h-12 flex items-center justify-center bg-[#161111] rounded-[12px] text-sm font-semibold text-white hover:brightness-125 transition cursor-pointer"
            >
              Submit report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
