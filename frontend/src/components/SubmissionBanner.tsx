export default function SubmissionBanner() {
  return (
    <div className="px-4 sm:px-10 lg:px-16 pt-12">
      <div className="max-w-[1240px] mx-auto bg-gradient-to-r from-[#2C2424] to-[#927878] rounded-2xl px-6 sm:px-10 lg:px-16 py-8 lg:py-12 flex flex-col sm:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-2">
            Price Submission form
          </h3>
          <p className="text-white text-base">Help others compare before they travel</p>
        </div>
        <a
          href="#"
          className="bg-white text-black px-10 py-5 rounded-2xl text-lg sm:text-xl whitespace-nowrap hover:-translate-y-0.5 transition"
        >
          Click HERE
        </a>
      </div>
    </div>
  )
}
