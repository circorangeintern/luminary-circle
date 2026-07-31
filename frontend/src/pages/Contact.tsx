import { useEffect } from 'react'
import { trackScreenView } from '../services/events'

export default function Contact() {
  useEffect(() => { trackScreenView('contact') }, [])
  return (
    <div className="min-h-screen bg-bg-grey">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-20 py-12 sm:py-20">
        <div className="flex flex-row items-start justify-center gap-4 lg:gap-32">
          {/* Logo */}
          <div className="flex items-center gap-1.5 lg:gap-3.5 shrink-0">
            <img src="/logo-icon.png" srcSet="/logo-icon@2x.png 2x" alt="Market Compare" style={{ width: 'auto', height: 20 }} className="lg:hidden" />
            <img src="/logo-icon.png" srcSet="/logo-icon@2x.png 2x" alt="Market Compare" style={{ width: 'auto', height: 56 }} className="hidden lg:block" />
            <div>
              <h1 style={{ fontSize: 11, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.05, color: '#141414' }} className="m-0 lg:hidden">
                Market<br />Compare
              </h1>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.05, color: '#141414' }} className="m-0 hidden lg:block">
                Market<br />Compare
              </h1>
              <p style={{ fontSize: 8, color: '#555' }} className="mt-0.5 text-left lg:text-left">Know before you go</p>
            </div>
          </div>

          {/* Let's connect */}
          <div className="flex flex-col gap-[5px] lg:gap-[18px] max-w-[105px] lg:max-w-[268px]">
            <h2 className="text-[11px] lg:text-lg font-bold text-black" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', Inter, sans-serif" }}>
              Let&rsquo;s connect:
            </h2>
            <div className="flex flex-col gap-[4px] lg:gap-[14px]">
              <p className="text-[9.5px] lg:text-[15px] font-normal text-black">Convenant: +234 811 675 4009</p>
              <p className="text-[9.5px] lg:text-[15px] font-normal text-black">Rasheed: +234 802 595 2293</p>
              <p className="text-[9.5px] lg:text-[15px] font-normal text-black">Michael: +234 814 251 3384</p>
              <p className="text-[9.5px] lg:text-[15px] font-normal text-black">Sommy: +234 813 212 9317</p>
              <p className="text-[9.5px] lg:text-[15px] font-normal text-black">Emmanuel: +234 813 944 4569</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[5px] lg:gap-[11px] max-w-[100px] lg:max-w-[246px]">
            <p className="text-[9.5px] lg:text-[15px] font-semibold leading-[13px] lg:leading-[21px] text-black">
              Email us directly:<br />info@marketcompare.ng
            </p>
            <p className="text-[9.5px] lg:text-[15px] font-normal text-black">Ibadan, Nigeria</p>
          </div>
        </div>
      </div>
    </div>
  )
}
