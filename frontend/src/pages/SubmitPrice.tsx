import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchItems, fetchMarkets, submitPrice as apiSubmitPrice, createMarketRequest } from '../services/api'
import type { ItemDto, MarketDto } from '../services/api'
import { trackPriceSubmission } from '../services/events'

type State = 'loading' | 'empty' | 'form' | 'validationError' | 'offline' | 'confirm' | 'duplicate' | 'rateLimited'

export default function SubmitPrice() {
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<ItemDto[]>([])
  const [markets, setMarkets] = useState<MarketDto[]>([])

  const [selectedItem, setSelectedItem] = useState<ItemDto | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [marketId, setMarketId] = useState('')
  const [marketLabel, setMarketLabel] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [pickerStep, setPickerStep] = useState<'item' | 'unit'>('item')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const [requestMode, setRequestMode] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [requestLga, setRequestLga] = useState('')
  const [requestState, setRequestState] = useState('')
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [requestDone, setRequestDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchItems(), fetchMarkets()])
      .then(([itemsData, marketsData]) => {
        if (cancelled) return
        setItems(itemsData)
        setMarkets(marketsData)
        if (marketsData.length === 0) {
          setState('empty')
        } else {
          setState('form')
        }
      })
      .catch(() => {
        if (!cancelled) setState('offline')
      })
    return () => { cancelled = true }
  }, [])

  const itemMeasure = selectedItem && selectedUnitId
    ? `${selectedItem.name}, ${selectedItem.units.find((u) => u.id === selectedUnitId)?.label || ''}`
    : ''

  const marketError = state === 'validationError' && !marketId
  const itemError = state === 'validationError' && !itemMeasure
  const priceError = state === 'validationError' && !price

  function validate() {
    if (!itemMeasure || !marketId || !price) {
      setState('validationError')
      return false
    }
    if (!/^\d+$/.test(price)) {
      setState('validationError')
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      trackPriceSubmission()
      await apiSubmitPrice({ itemId: selectedItem!.id, unitId: selectedUnitId, marketId, price: parseInt(price, 10), note: note || '' })
      setState('confirm')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 409) {
        setState('duplicate')
      } else if (status === 429) {
        setState('rateLimited')
      } else if (!status || status === 0) {
        setState('offline')
      } else {
        setState('offline')
      }
    }
  }

  async function handleRequestSubmit() {
    if (!requestName || !requestLga || !requestState) return
    setRequestSubmitting(true)
    try {
      await createMarketRequest(requestName, requestLga, requestState)
      setRequestDone(true)
    } catch {
      setRequestDone(true)
    }
  }

  function resetForm() {
    setSelectedItem(null)
    setSelectedUnitId('')
    setMarketId('')
    setMarketLabel('')
    setPrice('')
    setNote('')
    setPickerStep('item')
    setRequestMode(false)
    setState('form')
  }

  function openPicker() {
    setPickerStep('item')
    setPickerOpen(true)
  }

  function selectItem(item: ItemDto) {
    setSelectedItem(item)
    setSelectedUnitId('')
    setPickerStep('unit')
  }

  function selectUnit(unitId: string) {
    setSelectedUnitId(unitId)
    setPickerOpen(false)
    if (state === 'validationError' && itemError) setState('form')
  }

  // ===== LOADING =====
  if (state === 'loading') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[600px]">
          <div className="skeleton h-[56px] rounded-[12px] w-[36%] mx-auto mb-[22px]" />
          <div className="skeleton h-[14px] rounded-[8px] w-[34%] mx-auto mb-[44px]" />
          {[...Array(4)].map((_, i) => (
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

  // ===== EMPTY =====
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
            <p className="text-sm text-[#4a4a4a]">Check back later — markets are added regularly</p>
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
              Your price could not be submitted. Check your connection and try again.
            </p>
            <button
              onClick={resetForm}
              className="min-w-[280px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ===== DUPLICATE =====
  if (state === 'duplicate') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[640px]">
          <div className="flex items-start justify-between pb-5 border-b border-days-grey mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-black tracking-tight mb-1.5">Price Submission form</h1>
              <p className="text-sm text-days-grey">Help others compare before they travel</p>
            </div>
          </div>
          <div className="text-center max-w-[560px] mx-auto pt-8">
            <div className="w-[76px] h-[76px] rounded-full bg-[#fdf0d5] flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-[30px] h-[30px] text-[#b8860b]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[28px] font-extrabold text-black mb-3">Seems this was already submitted</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-7">
              The exact same price for {itemMeasure} was submitted very recently. If you meant to submit a different price or item, please go back and adjust.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={resetForm}
                className="min-w-[200px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
              >
                Go back
              </button>
              <Link to="/prices" className="min-w-[200px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer">
                View prices
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ===== RATE LIMITED =====
  if (state === 'rateLimited') {
    return (
      <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
        <div className="w-full max-w-[640px]">
          <div className="flex items-start justify-between pb-5 border-b border-days-grey mb-10">
            <div>
              <h1 className="text-[32px] font-extrabold text-black tracking-tight mb-1.5">Price Submission form</h1>
              <p className="text-sm text-days-grey">Help others compare before they travel</p>
            </div>
          </div>
          <div className="text-center max-w-[560px] mx-auto pt-8">
            <div className="w-[76px] h-[76px] rounded-full bg-[#e8f0fe] flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-[30px] h-[30px] text-[#1a73e8]">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[28px] font-extrabold text-black mb-3">You are submitting very fast</h2>
            <p className="text-base leading-relaxed text-[#4a4a4a] mb-7">
              Please take a short break and try again soon. This limit helps us keep the data accurate and prevents spam.
            </p>
            <button
              onClick={resetForm}
              className="min-w-[220px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
            >
              Try again later
            </button>
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
                <span className="text-[17px] text-black">Item</span>
                <span className="text-[17px] text-black text-right">{itemMeasure}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Market</span>
                <span className="text-[17px] text-black text-right">{marketLabel}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Price</span>
                <span className="text-[17px] text-black text-right">₦{price}</span>
              </div>
              <div className="flex justify-between items-center py-3.5">
                <span className="text-[17px] text-black">Submitted</span>
                <span className="text-[17px] text-green-text text-right">Just now</span>
              </div>
            </div>
            <div className="flex gap-5 flex-wrap">
              <button
                onClick={resetForm}
                className="flex-1 min-w-[220px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer"
              >
                Add another
              </button>
              <Link to="/prices" className="flex-1 min-w-[220px] h-[58px] flex items-center justify-center gap-2.5 bg-input-bg border border-grey-border rounded-[12px] text-base font-bold text-black hover:bg-gray-200 transition cursor-pointer">
                View comparison
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ===== FORM =====
  const showAlert = state === 'validationError'
  const errorFields: string[] = []
  if (itemError) errorFields.push('item')
  if (marketError) errorFields.push('market')
  if (priceError) errorFields.push('price')
  const fieldCount = errorFields.length
  const itemOpen = pickerOpen && pickerStep === 'item'
  const unitOpen = pickerOpen && pickerStep === 'unit'

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
            <span className="text-[#b40000] font-bold text-sm">{fieldCount} field{fieldCount > 1 ? 's' : ''} need{fieldCount === 1 ? 's' : ''} your attention before we can submit this price.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-7">
            <label className="block text-base text-[#111] mb-3">Item</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { if (!pickerOpen) openPicker(); else setPickerOpen(false) }}
                className={`w-full border rounded-[12px] px-5 py-[18px] text-base text-left flex items-center justify-between bg-white ${
                  itemError ? 'border-[#b40000] bg-[#fbd7d7]' : 'border-days-grey'
                }`}
              >
                <span className={itemMeasure ? 'text-black' : 'text-days-grey'}>
                  {itemMeasure || (selectedItem ? `Choose unit for ${selectedItem.name}` : 'Select item')}
                </span>
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px] shrink-0">
                  <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {itemOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-days-grey rounded-[12px] z-10 overflow-hidden max-h-[260px] overflow-y-auto">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectItem(item)}
                      className={`w-full px-5 py-3 text-base text-left hover:bg-input-bg transition cursor-pointer flex items-center justify-between ${
                        selectedItem?.id === item.id ? 'bg-input-bg font-semibold' : ''
                      }`}
                    >
                      {item.name}
                      {selectedItem?.id === item.id && (
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-green-text">
                          <path d="M5 13L10 18L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {unitOpen && selectedItem && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-days-grey rounded-[12px] z-10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setPickerStep('item') }}
                    className="w-full px-5 py-2.5 text-xs text-left text-days-grey border-b border-days-grey hover:bg-input-bg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to {selectedItem.name}
                  </button>
                  <div className="px-5 py-2.5 text-xs font-semibold text-days-grey border-b border-days-grey">
                    {selectedItem.name} — pick a unit
                  </div>
                  {selectedItem.units.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUnit(u.id)}
                      className={`w-full px-5 py-3 text-base text-left hover:bg-input-bg transition cursor-pointer flex items-center justify-between ${
                        selectedUnitId === u.id ? 'bg-input-bg font-semibold' : ''
                      }`}
                    >
                      {u.label}
                      {selectedUnitId === u.id && (
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-green-text">
                          <path d="M5 13L10 18L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {itemError && (
              <div className="flex items-center gap-2 mt-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#b40000]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold text-[#b40000]">Please select an item and unit</span>
              </div>
            )}
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
                <span className={marketId ? 'text-black' : 'text-days-grey'}>{marketLabel || 'Select market'}</span>
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {marketOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-days-grey rounded-[12px] z-10 overflow-hidden max-h-[260px] overflow-y-auto">
                  {markets.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setMarketId(m.id); setMarketLabel(`${m.name} (${m.lga}, ${m.state})`); setMarketOpen(false); if (marketError) setState('form') }}
                      className={`w-full px-5 py-3 text-base text-left hover:bg-input-bg transition cursor-pointer flex items-center justify-between ${
                        marketId === m.id ? 'bg-input-bg font-semibold' : ''
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="text-sm text-days-grey">{m.lga}, {m.state}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setMarketOpen(false); setRequestMode(true) }}
                    className="w-full px-5 py-3 text-base text-left hover:bg-gray-100 transition cursor-pointer border-t border-days-grey text-red font-semibold"
                  >
                    + Request new market
                  </button>
                </div>
              )}
              {requestMode && !requestDone && (
                <div className="mt-3 border border-days-grey rounded-[12px] p-5 bg-white">
                  {requestSubmitting ? (
                    <div className="flex justify-center py-6">
                      <div className="skeleton h-6 w-40 rounded-lg" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-black mb-4">Suggest a market to add</p>
                      <input
                        type="text"
                        value={requestName}
                        onChange={(e) => setRequestName(e.target.value)}
                        placeholder="Market name (e.g. Rumuokoro Market)"
                        className="w-full border border-days-grey rounded-[12px] px-4 py-3 text-sm text-black outline-none focus:border-black placeholder-days-grey mb-3"
                      />
                      <div className="flex gap-3 mb-3">
                        <input
                          type="text"
                          value={requestLga}
                          onChange={(e) => setRequestLga(e.target.value)}
                          placeholder="LGA (e.g. Obio/Akpor)"
                          className="flex-1 border border-days-grey rounded-[12px] px-4 py-3 text-sm text-black outline-none focus:border-black placeholder-days-grey"
                        />
                        <input
                          type="text"
                          value={requestState}
                          onChange={(e) => setRequestState(e.target.value)}
                          placeholder="State (e.g. Rivers)"
                          className="flex-1 border border-days-grey rounded-[12px] px-4 py-3 text-sm text-black outline-none focus:border-black placeholder-days-grey"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => { setRequestMode(false); setRequestName(''); setRequestLga(''); setRequestState('') }}
                          className="flex-1 h-11 border border-days-grey rounded-[12px] text-sm text-black hover:bg-gray-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestSubmit}
                          disabled={!requestName || !requestLga || !requestState}
                          className="flex-1 h-11 bg-[#161111] rounded-[12px] text-sm text-white hover:brightness-125 transition cursor-pointer disabled:opacity-40"
                        >
                          Submit request
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {requestDone && (
                <div className="mt-3 border border-days-grey rounded-[12px] p-5 bg-white text-center">
                  <p className="text-sm text-green-text font-semibold">
                    ✓ Request submitted — our team will review it.
                  </p>
                  <p className="text-xs text-days-grey mt-2">
                    Approved markets appear on the list above.
                  </p>
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
            <div className={`flex border rounded-[12px] overflow-hidden ${priceError ? 'border-[#b40000]' : 'border-days-grey'}`}>
              <input
                type="number"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 1500"
                className={`flex-1 px-5 py-[18px] text-base outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  priceError ? 'bg-[#fbd7d7] text-black' : 'text-black'
                }`}
              />
              <div className="px-[22px] py-[18px] text-base text-black border-l border-days-grey whitespace-nowrap bg-white">
                NGN
              </div>
            </div>
            {priceError && (
              <div className="flex items-center gap-2 mt-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#b40000]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold text-[#b40000]">Please enter a valid price</span>
              </div>
            )}
          </div>

          <div className="mb-9">
            <label className="block text-base text-[#111] mb-3">Note <span className="text-days-grey font-normal">(optional)</span></label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
