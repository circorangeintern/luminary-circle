import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const data = [
  { date: '1week ago', Bodija: 2500, Dugbe: 2200, Gbagi: 2600 },
  { date: '5days ago', Bodija: 2400, Dugbe: 2100, Gbagi: 2550 },
  { date: '4days ago', Bodija: 2550, Dugbe: 2050, Gbagi: 2450 },
  { date: '3days ago', Bodija: 2100, Dugbe: 2300, Gbagi: 2200 },
  { date: 'yesterday', Bodija: 2200, Dugbe: 2100, Gbagi: 2500 },
  { date: 'today', Bodija: 1800, Dugbe: 2100, Gbagi: 2500 },
]

export default function PriceTrend() {
  return (
    <div className="px-6 sm:px-12 lg:px-20 pb-12">
      <div className="max-w-[1240px] mx-auto bg-white border border-grey-border rounded-2xl p-6 sm:p-8 lg:p-12 mt-12">
        <div className="m-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-black mb-1">Price trend - Rice (local)</h2>
              <p className="text-lg font-medium text-black">last 6 submission across all markets</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {['6 entries', 'This week', 'This month'].map((label) => (
                <button
                  key={label}
                  className="bg-input-bg border border-input-border rounded-lg px-5 py-3.5 text-sm text-[#252323] cursor-pointer hover:bg-gray-100 transition"
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
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(208,213,221,0.87)" />
                <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#121212' }} />
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
            {[
              { label: 'Latest price', value: '₦1,800 / mudu', delta: '↘ Bodija - today' },
              { label: '6-entry average', value: '₦2,083', delta: '-across 3 markets' },
              { label: 'Overall direction', value: 'Going down', delta: '↘ ₦500 drop total' },
            ].map((s) => (
              <div key={s.label} className="flex-1 min-w-[220px] border border-days-grey rounded-lg px-5 py-4">
                <p className="text-xs text-text-dark mb-0.5">{s.label}</p>
                <p className="text-xl font-semibold text-text-dark mb-0.5">{s.value}</p>
                <p className="text-xs text-green-text">{s.delta}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center gap-5 flex-wrap pt-6 border-t border-dashed border-[rgba(208,213,221,0.87)]">
            <p className="text-sm font-medium text-text-dark">Bodija is cheapest and still falling - good time to buy</p>
            <button className="min-w-[220px] bg-[#2C2424] border border-grey-border text-white px-4 py-4 rounded-lg text-sm text-center hover:brightness-110 transition cursor-pointer">
              Submit price
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
