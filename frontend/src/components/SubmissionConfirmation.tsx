interface Props {
  product: string
  price: string
  unit: string
  market: string
  onBack: () => void
}

export default function SubmissionConfirmation({ product, price, unit, market, onBack }: Props) {
  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[500px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-[#c8e6c9] rounded-full flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" className="w-[50px] h-[50px] stroke-[#2e7d32] fill-none stroke-[3] stroke-linecap-round stroke-linejoin-round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-[28px] font-semibold text-black mb-3">Price submitted</h1>

        <p className="text-sm text-[#666666] leading-relaxed mb-8">
          Thanks for submitting this price. Our team will review it and publish it once it has been verified.
        </p>

        <div className="border border-[#e0e0e0] rounded-lg p-5 mb-8 bg-[#fafafa]">
          <span className="block text-xs text-[#999999] uppercase tracking-[0.5px] mb-2">You Submitted</span>
          <div className="text-base font-semibold text-black mb-2">
            {product} - ₦{price} / {unit}
          </div>
          <div className="text-xs text-[#999999]">
            {market}
          </div>
        </div>

        <button onClick={onBack} className="w-full py-3.5 bg-[#f5f5f5] text-black border border-[#e0e0e0] rounded-lg text-base font-semibold hover:bg-[#eeeeee] transition cursor-pointer">
          Back
        </button>
      </div>
    </main>
  )
}
