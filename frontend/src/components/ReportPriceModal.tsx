import { useState } from 'react'
import { flagPrice } from '../services/api'

interface ReportPriceModalProps {
  priceId: string
  product: string
  market: string
  price: string
  onClose: () => void
}

const REASONS = [
  { title: 'Price is too low - seems incorrect', desc: 'The amount looks unrealistically cheap', apiReason: 'WRONG_PRICE' as const },
  { title: 'Price is too high - seems incorrect', desc: 'The amount looks unrealistically expensive', apiReason: 'WRONG_PRICE' as const },
  { title: 'Price is outdated', desc: 'This no longer reflects current market price', apiReason: 'OUTDATED' as const },
  { title: 'Wrong market or item', desc: 'This was submitted for the wrong location or food', apiReason: 'OTHER' as const },
]

type State = 'form' | 'validationError' | 'submitting' | 'confirm' | 'error'

export default function ReportPriceModal({ priceId, product, market, price, onClose }: ReportPriceModalProps) {
  const [state, setState] = useState<State>('form')
  const [selected, setSelected] = useState<number | null>(null)
  const [flagCount, setFlagCount] = useState(0)

  async function handleSubmit() {
    if (selected === null) {
      setState('validationError')
      return
    }
    setState('submitting')
    try {
      const res = await flagPrice(priceId, REASONS[selected].apiReason)
      setFlagCount(res.flagCount)
      setState('confirm')
    } catch {
      setState('error')
    }
  }

  // ===== SUBMITTING =====
  if (state === 'submitting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="w-full max-w-[640px] bg-white rounded-[16px] p-8">
          <div className="flex items-center justify-between pb-5 border-b border-days-grey mb-8">
            <h1 className="text-xl font-bold text-black">Report this price</h1>
            <span className="text-sm text-days-grey">Submitting report...</span>
          </div>
          <div className="flex justify-center py-12">
            <div className="skeleton h-8 w-48 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  // ===== CONFIRM =====
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
              Thanks for keeping MarketCompare accurate. This price has been flagged ({flagCount} report{flagCount > 1 ? 's' : ''}) and will be reviewed.
            </p>
            <div className="border border-days-grey rounded-[12px] px-6 mb-8 divide-y divide-days-grey">
              {[
                { label: 'Food item', value: product },
                { label: 'Price', value: price },
                { label: 'Market', value: market },
                { label: 'Reason', value: selected !== null ? REASONS[selected].title : '' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-3.5">
                  <span className="text-sm text-black">{row.label}</span>
                  <span className="text-sm text-[#3a3a3a] text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="h-12 px-8 flex items-center justify-center bg-[#161111] rounded-[12px] text-sm text-white hover:brightness-125 transition cursor-pointer"
              >
                Back to comparison
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== ERROR =====
  if (state === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
        <div className="w-full max-w-[640px] bg-white rounded-[16px] p-8">
          <div className="flex items-center justify-between pb-5 border-b border-days-grey mb-8">
            <h1 className="text-xl font-bold text-black">Report this price</h1>
            <span className="text-sm text-red-flag">Something went wrong</span>
          </div>
          <div className="text-center max-w-[520px] mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#fbd7d7] flex items-center justify-center mx-auto mb-8">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#b40000]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-black mb-4">Report couldn't be sent</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-8">
              Please check your connection and try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSubmit}
                className="h-12 px-6 flex items-center justify-center bg-input-bg border border-grey-border rounded-[12px] text-sm text-black hover:bg-gray-200 transition cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="h-12 px-6 flex items-center justify-center border border-days-grey rounded-[12px] text-sm text-black hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== FORM =====
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

          <div className="mb-9">
            <p className="text-lg font-normal text-black mb-5">You are Reporting</p>
            <p className="text-[19px] text-black mb-1.5">{product} - {price}</p>
            <p className="text-sm text-days-grey">{market}</p>
          </div>

          <p className="text-[19px] font-semibold text-black mb-[18px]">Why is the pricing wrong?</p>
          <div className="flex flex-col gap-[18px] mb-2">
            {REASONS.map((reason, i) => (
              <button
                key={i}
                onClick={() => { setSelected(i); if (showValidationError) setState('form') }}
                className={`flex items-start gap-5 w-full px-[26px] py-[22px] border rounded-[14px] text-left cursor-pointer transition ${
                  showValidationError && selected === i
                    ? 'border-[#fbd7d7] bg-[#fbd7d7]'
                    : selected === i
                      ? 'border-ink bg-gray-50'
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

          <div className="flex gap-[22px] mt-10">
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