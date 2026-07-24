import { lazy } from 'react'
import { getRelativeTime } from '../utils/time'

interface ChartProps {
  chartData: { fullDate: string; price: number }[]
}

const LazyLineChart = lazy(() =>
  import('recharts').then((m) => ({
    default: ({
      data,
    }: {
      data: { fullDate: string; price: number }[]
    }) => {
      const {
        LineChart,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
      } = m
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 60, bottom: 30 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(208,213,221,0.87)"
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="fullDate"
              tickFormatter={(val: string) => getRelativeTime(val)}
              tick={{ fontSize: 14, fill: '#121212', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              domain={['dataMin - 200', 'dataMax + 200']}
              tick={{ fontSize: 14, fill: '#121212', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip labelFormatter={(val) => getRelativeTime(String(val))} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#378ADD"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#378ADD', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#378ADD', stroke: '#fff', strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )
    },
  })),
)

export default function PriceTrendChart({ chartData }: ChartProps) {
  return <LazyLineChart data={chartData} />
}