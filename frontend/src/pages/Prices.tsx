import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ComparePrices from '../components/ComparePrices'
import PriceTrend from '../components/PriceTrend'
import { trackScreenView } from '../services/events'

export default function Prices() {
  const { hash } = useLocation()

  useEffect(() => { trackScreenView('prices') }, [])

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.substring(1))
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <div className="bg-bg-grey">
      <div className="pt-8" />
      <ComparePrices />
      <PriceTrend />
    </div>
  )
}
