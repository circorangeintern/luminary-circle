import { useEffect } from 'react'
import Hero from '../components/Hero'
import ComparePrices from '../components/ComparePrices'
import SubmissionBanner from '../components/SubmissionBanner'
import PriceTrend from '../components/PriceTrend'
import { trackScreenView } from '../services/events'

export default function Home() {
  useEffect(() => { trackScreenView('home') }, [])
  return (
    <>
      <Hero />
      <ComparePrices />
      <SubmissionBanner />
      <PriceTrend />
    </>
  )
}
