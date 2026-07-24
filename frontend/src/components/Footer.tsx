import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink mt-20 px-6 sm:px-12 lg:px-20 py-16 pb-10">
      <div className="max-w-[1380px] mx-auto flex flex-wrap gap-12 justify-between mb-10">
        <div>
          <h4 className="text-white text-lg font-bold mb-5">PLATFORM</h4>
          <ul className="list-none">
            <li className="mb-4"><Link to="/prices/list" onClick={() => window.scrollTo(0, 0)} className="text-white text-sm opacity-90 hover:opacity-100 hover:underline transition">Price Charts</Link></li>
            <li className="mb-4"><Link to="/prices#compare" className="text-white text-sm opacity-90 hover:opacity-100 hover:underline transition">Real-Time Prices</Link></li>
            <li className="mb-4"><Link to="/prices#compare" className="text-white text-sm opacity-90 hover:opacity-100 hover:underline transition">Compare Prices</Link></li>
            <li className="mb-4"><Link to="/prices#trend" className="text-white text-sm opacity-90 hover:opacity-100 hover:underline transition">Market trends</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-lg font-bold mb-5">COMPANY</h4>
          <ul className="list-none">
            <li className="mb-4"><Link to="/about" onClick={() => window.scrollTo(0, 0)} className="text-white text-sm opacity-90 hover:opacity-100 hover:underline transition">About Us</Link></li>
            <li className="mb-4"><Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="text-white text-sm opacity-90 hover:opacity-100 hover:underline transition">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-lg font-bold mb-5">REACH US</h4>
          <p className="text-white text-sm opacity-90 mb-3">info@marketcompare.ng</p>
          <p className="text-white text-sm opacity-90 mb-3">+234 8139444569</p>
          <p className="text-white text-sm opacity-90">Ibadan, Nigeria</p>
        </div>

        <div className="max-w-[340px]">
          <h4 className="text-white text-lg font-bold mb-5">STAY INFORMED</h4>
          <p className="text-white text-sm leading-relaxed opacity-90 mb-4">
            Get weekly market intelligence and price updates delivered to your inbox.
          </p>
          <div className="flex items-center bg-input-bg border border-input-border rounded-lg px-4 py-3.5 mb-3">
            <input type="email" placeholder="Enter your email address" className="bg-transparent border-none outline-none text-sm text-black w-full placeholder-muted-text" />
          </div>
          <button className="text-white text-base opacity-90 hover:opacity-70 hover:underline transition cursor-pointer bg-transparent border-none">
            Get Updates
          </button>
        </div>
      </div>

      <div className="max-w-[1380px] mx-auto pt-6 border-t border-white/15 text-xs text-white/60 text-center">
        &copy; 2026 Market Compare. All rights reserved.
      </div>
    </footer>
  )
}
