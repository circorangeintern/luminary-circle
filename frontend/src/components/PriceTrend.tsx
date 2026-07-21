import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRelativeTime } from '../utils/time'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface TrendPoint {
  date: string
  dateLabel: string
  Bodija: number
  Dugbe: number
  Gbagi: number
}

const trendData: TrendPoint[] = [
  { date: '2026-07-15T10:00:00Z', dateLabel: getRelativeTime('2026-07-15T10:00:00Z'), Bodija: 2500, Dugbe: 2200, Gbagi: 2600 },
  { date: '2026-07-17T10:00:00Z', dateLabel: getRelativeTime('2026-07-17T10:00:00Z'), Bodija: 2400, Dugbe: 2100, Gbagi: 2550 },
  { date: '2026-07-18T10:00:00Z', dateLabel: getRelativeTime('2026-07-18T10:00:00Z'), Bodija: 2550, Dugbe: 2050, Gbagi: 2450 },
  { date: '2026-07-19T10:00:00Z', dateLabel: getRelativeTime('2026-07-19T10:00:00Z'), Bodija: 2100, Dugbe: 2300, Gbagi: 2200 },
  { date: '2026-07-21T10:00:00Z', dateLabel: getRelativeTime('2026-07-21T10:00:00Z'), Bodija: 2200, Dugbe: 2100, Gbagi: 2500 },
  { date: '2026-07-22T10:00:00Z', dateLabel: getRelativeTime('2026-07-22T10:00:00Z'), Bodija: 1800, Dugbe: 2100, Gbagi: 2500 },
]

export default function PriceTrend() {
  const { isAuthenticated } = useAuth()
  const [period, setPeriod] = useState('6 entries')

  if (trendData.length === 0) {
    return (
      <div className="px-6 sm:px-12 lg:px-20 pb-12">
        <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
          <div className="m-8 text-center py-16">
            <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M3 3V21H21" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M7 16L11 11L15 14L19 8" stroke="#A1A1A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No trend data yet</h3>
            <p className="text-sm text-[#666] mb-5">Be the first to submit a price and help build the trend!</p>
            <Link to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'} className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-lg text-sm font-semibold hover:brightness-110 transition">
              Submit a price
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const latest = trendData[trendData.length - 1]
  const first = trendData[0]
  const avg = Math.round(trendData.reduce((s, d) => s + (d.Bodija + d.Dugbe + d.Gbagi) / 3, 0) / trendData.length)
  const totalDrop = latest.Bodija - first.Bodija

  return (
    <div className="px-6 sm:px-12 lg:px-20 pb-12">
      <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
        <div className="m-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-black mb-1">Price trend - Rice (local)</h2>
              <p className="text-lg font-medium text-black">last {trendData.length} submissions across all markets</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {['6 entries', 'This week', 'This month'].map((label) => (
                <button
                  key={label}
                  onClick={() => setPeriod(label)}
                  className={`px-5 py-3.5 rounded-lg text-sm cursor-pointer transition ${
                    period === label
                      ? 'bg-ink text-white border-ink'
                      : 'bg-input-bg border border-input-border text-[#252323] hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 sm:gap-8 flex-wrap mb-6">
            {[
              { color: '#1D9E75', label: 'Bodija Market' },
              { color: '#378ADD', label: 'Dugbe Market' },
              { color: '#F73939', label: 'Gbagi Market' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="font-semibold text-sm sm:text-base text-text-dark">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-72 sm:h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(208,213,221,0.87)" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#121212' }} />
                <YAxis domain={[1200, 3600]} tick={{ fontSize: 13, fill: '#121212' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Bodija" stroke="#1D9E75" strokeWidth={2.5} dot={{ r: 5, fill: '#1D9E75' }} />
                <Line type="monotone" dataKey="Dugbe" stroke="#378ADD" strokeWidth={2.5} dot={{ r: 5, fill: '#378ADD' }} />
                <Line type="monotone" dataKey="Gbagi" stroke="#F73939" strokeWidth={2.5} dot={{ r: 5, fill: '#F73939' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-6 flex-wrap mb-8">
            <div className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
              <p className="text-xs text-text-dark mb-0.5">Latest price</p>
              <p className="text-xl font-semibold text-text-dark mb-0.5">₦{latest.Bodija.toLocaleString()} / mudu</p>
              <p className="text-xs text-green-text">↘ Bodija - {getRelativeTime(latest.date)}</p>
            </div>
            <div className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
              <p className="text-xs text-text-dark mb-0.5">{trendData.length}-entry average</p>
              <p className="text-xl font-semibold text-text-dark mb-0.5">₦{avg.toLocaleString()}</p>
              <p className="text-xs text-green-text">across 3 markets</p>
            </div>
            <div className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
              <p className="text-xs text-text-dark mb-0.5">Overall direction</p>
              <p className="text-xl font-semibold text-text-dark mb-0.5">{totalDrop < 0 ? 'Going up' : totalDrop > 0 ? 'Going down' : 'Stable'}</p>
              <p className="text-xs text-green-text">{totalDrop > 0 ? `↘ ₦${totalDrop.toLocaleString()} drop total` : totalDrop < 0 ? `↗ ₦${Math.abs(totalDrop).toLocaleString()} rise total` : '— No change'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-5 flex-wrap pt-6 border-t border-dashed border-[rgba(208,213,221,0.87)]">
            <p className="text-sm font-medium text-text-dark">Bodija is cheapest and still falling - good time to buy</p>
            <Link
              to={isAuthenticated ? '/submit' : '/signin?returnUrl=/submit'}
              className="min-w-[220px] bg-[#2C2424] border border-grey-border text-white px-4 py-4 rounded-lg text-sm text-center hover:brightness-110 transition cursor-pointer block"
            >
              Submit price
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
