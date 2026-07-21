import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-cream relative overflow-hidden px-6 sm:px-12 lg:px-20 py-16 lg:py-24">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
        <div className="relative z-10 max-w-[637px]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight mb-5">
            Know Market Prices Before You Shop.
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-[#1a1a1a] max-w-[605px] mb-11">
            Compare food prices across nearby markets and plan smarter before leaving home.
          </p>
          <div className="flex gap-5 flex-wrap">
            <Link
              to="/prices"
              className="inline-flex items-center gap-2 bg-red text-white px-8 py-4 rounded-lg text-base hover:brightness-110 transition"
            >
              See Prices
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-sm leading-none shrink-0">+</span>
            </Link>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-transparent text-black border border-black px-8 py-4 rounded-lg text-base hover:bg-black/5 transition"
            >
              Update Price
              <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-sm leading-none shrink-0">+</span>
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-[607px] shrink-0 flex items-center justify-center">
          <div className="absolute rounded-full bg-bg-grey z-0 w-[120%] h-[120%] -top-[10%] -right-[20%] lg:w-[600px] lg:h-[600px] lg:-top-[40px] lg:-right-[80px]" />
          <img
            src="/hero-image.png"
            alt="Basket with rice, beans, and oil"
            className="relative z-10 w-full h-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]"
          />
        </div>
      </div>
    </section>
  )
}
