import { Link } from 'react-router-dom'

export default function SubmissionBanner() {
  return (
    <div className="px-6 sm:px-12 lg:px-20 pt-6 lg:pt-12">
      <div className="max-w-[1240px] mx-auto bg-gradient-to-r from-[#2C2424] to-[#927878] rounded-2xl px-4 sm:px-10 lg:px-16 py-4 lg:py-12 flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-8">
        <div>
          <h3 className="text-base lg:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-1 lg:mb-2">
            Price Submission form
          </h3>
          <p className="text-white text-[10px] lg:text-base">Help others compare before they travel</p>
        </div>
        <Link
          to="/submit"
          className="bg-white text-black px-4 lg:px-10 py-2 lg:py-5 rounded-xl lg:rounded-2xl text-[10px] lg:text-lg lg:text-xl lg:whitespace-nowrap hover:-translate-y-0.5 transition"
        >
          Submit a price
        </Link>
      </div>
    </div>
  )
}
