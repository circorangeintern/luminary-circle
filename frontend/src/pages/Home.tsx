import Hero from '../components/Hero'
import ComparePrices from '../components/ComparePrices'
import SubmissionBanner from '../components/SubmissionBanner'
import PriceTrend from '../components/PriceTrend'

export default function Home() {
  return (
    <>
      <Hero />
      <ComparePrices />
      <SubmissionBanner />
      <PriceTrend />
    </>
  )
}
