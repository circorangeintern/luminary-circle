import { useState } from 'react'
import SubmissionConfirmation from '../components/SubmissionConfirmation'

const foodstuffs = ['Select foodstuff', 'Rice', 'Beans', 'Maize', 'Cassava', 'Yam']
const markets = ['Select market', 'Bodija Market', 'Dugbe Market', 'Gbagi Market']

export default function SubmitPrice() {
  const [submitted, setSubmitted] = useState(false)
  const [foodstuff, setFoodstuff] = useState('')
  const [market, setMarket] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [desc, setDesc] = useState('')

  if (submitted) {
    return (
      <SubmissionConfirmation
        product={foodstuff}
        price={price}
        unit={unit}
        market={market}
        onBack={() => setSubmitted(false)}
      />
    )
  }

  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-black mb-2">Price Submission form</h1>
          <p className="text-sm text-[#666666]">Help others compare before they travel</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">Foodstuff:</label>
            <select
              value={foodstuff}
              onChange={(e) => setFoodstuff(e.target.value)}
              className="w-full px-3.5 py-3 border border-[#d0d0d0] rounded-md text-sm bg-white text-[#999999] focus:outline-none focus:border-[#d0d0d0] appearance-none"
              style={{
                backgroundImage: `url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '20px',
                paddingRight: '36px',
              }}
            >
              {foodstuffs.map((f) => (
                <option key={f} value={f === 'Select foodstuff' ? '' : f} disabled={f === 'Select foodstuff'} className="text-black">{f}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">Market</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-3.5 py-3 border border-[#d0d0d0] rounded-md text-sm bg-white text-[#999999] focus:outline-none focus:border-[#d0d0d0] appearance-none"
              style={{
                backgroundImage: `url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22%3e%3cpolyline points=%226 9 12 15 18 9%22%3e%3c/polyline%3e%3c/svg%3e')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '20px',
                paddingRight: '36px',
              }}
            >
              {markets.map((m) => (
                <option key={m} value={m === 'Select market' ? '' : m} disabled={m === 'Select market'} className="text-black">{m}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">Price (NGN)</label>
            <div className="flex">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="113,47669"
                className="flex-1 px-3.5 py-3 border border-[#d0d0d0] rounded-l-md text-sm text-black bg-white focus:outline-none"
              />
              <div className="px-3.5 py-3 border border-[#d0d0d0] border-l-0 rounded-r-md bg-[#f5f5f5] text-sm font-medium text-black flex items-center">
                NGN
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">Quantity / Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. 1 paint, 1 cup, per kg"
              className="w-full px-3.5 py-3 border border-[#d0d0d0] rounded-md text-sm text-black bg-white placeholder-[#999999] focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">Description (optional)</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. measured at 8am today"
              className="w-full px-3.5 py-3 border border-[#d0d0d0] rounded-md text-sm text-black bg-white placeholder-[#999999] focus:outline-none"
            />
          </div>

          <button type="submit" className="w-full py-3.5 bg-red text-white rounded-lg text-base font-semibold mb-3 hover:brightness-110 transition cursor-pointer">
            Submit price
          </button>
          <p className="text-center text-xs text-[#666666]">Your name is never shown publicly</p>
        </form>
      </div>
    </main>
  )
}
