import { useEffect } from 'react'
import { trackScreenView } from '../services/events'

export default function Contact() {
  useEffect(() => { trackScreenView('contact') }, [])
  return (
    <div className="min-h-screen bg-bg-grey">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-20 py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-0">
          {/* Logo */}
          <div className="flex items-center gap-3.5 shrink-0">
            <img src="/logo-icon.png" srcSet="/logo-icon@2x.png 2x" alt="Market Compare" style={{ width: 'auto', height: 72 }} />
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.05, color: '#141414' }} className="m-0">
                Market<br />Compare
              </h1>
              <p style={{ fontSize: 11, color: '#555' }} className="mt-0.5">Know before you go</p>
            </div>
          </div>

          {/* Let's connect */}
          <div className="flex flex-col gap-[18px] max-w-[268px]">
            <h2 className="text-xl font-bold text-black" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', Inter, sans-serif" }}>
              Let&rsquo;s connect:
            </h2>
            <div className="flex flex-col gap-[18px]">
              <p className="text-base font-normal text-black">Convenant: +234 811 675 4009</p>
              <p className="text-base font-normal text-black">Rasheed: +234 802 595 2293</p>
              <p className="text-base font-normal text-black">Michael: +234 814 251 3384</p>
              <p className="text-base font-normal text-black">Sommy: +234 813 212 9317</p>
              <p className="text-base font-normal text-black">Emmanuel: +234 813 944 4569</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[11px] max-w-[246px]">
            <p className="text-base font-semibold leading-[22px] text-black">
              Email us directly:<br />info@marketcompare.ng
            </p>
            <p className="text-base font-normal text-black">Ibadan, Nigeria</p>
          </div>
        </div>
      </div>
    </div>
  )
}
