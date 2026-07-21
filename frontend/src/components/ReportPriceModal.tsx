import { useState } from 'react'

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

export default function ReportPriceModal({ product, market, price, onClose }: ReportPriceModalProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [details, setDetails] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-[680px] bg-white rounded-[16px] flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-border">
          <h1 className="text-xl font-bold text-black">
            Report this price
          </h1>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black cursor-pointer"
          >
            <svg viewBox="0 0 10 10" className="w-3 h-3">
              <path d="M1 1L9 9M9 1L1 9" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium text-black">
                You are Reporting
              </h2>
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium text-black">
                  {product} - {price}
                </p>
                <p className="text-xs text-days-grey">
                  {market} - submitted today
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-base font-medium text-black">
                Why is the pricing wrong?
              </p>

              <div className="flex flex-col gap-3">
                {reasons.map((reason, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className="flex items-center w-full px-4 py-3 border border-days-grey rounded-[10px] bg-white text-left cursor-pointer hover:border-black/30 transition"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-[22px] h-[22px] flex items-center justify-center shrink-0">
                        <div
                          className={`w-[18px] h-[18px] rounded-full border transition ${
                            selected === i ? 'border-ink bg-ink' : 'border-black'
                          }`}
                        >
                          {selected === i && (
                            <svg viewBox="0 0 16 16" className="w-full h-full p-[3px]">
                              <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-black">
                          {reason.title}
                        </span>
                        <span className="text-xs text-days-grey">
                          {reason.desc}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-base font-medium text-black">
                Extra details (optional)
              </p>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="e.g I was at Bodija today and it was ₦1,800 / mudu"
                className="w-full h-24 border border-days-grey rounded-[10px] px-4 py-3 text-sm text-[#757575] resize-none outline-none focus:border-black/30 transition"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex-1 h-12 flex items-center justify-center border border-grey-border rounded-[10px] text-sm tracking-tight text-[#252323] bg-white cursor-pointer hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log({ product, market, price, reason: selected, details })
                  onClose()
                }}
                className="flex-1 h-12 flex items-center justify-center bg-[#1D1919] border border-grey-border rounded-[10px] text-sm tracking-tight text-white cursor-pointer hover:brightness-125 transition"
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
