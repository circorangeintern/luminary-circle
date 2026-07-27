import { lazy } from 'react'
import { getRelativeTime } from '../utils/time'

interface ChartProps {
  chartData: { fullDate: string; price: number }[]
  compact?: boolean
}

const LazyLineChart = lazy(() =>
  import('recharts').then((m) => ({
    default: ({
      data,
      compact,
    }: {
      data: { fullDate: string; price: number }[]
      compact?: boolean
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
          <LineChart data={data} margin={{ top: compact ? 10 : 20, right: compact ? 20 : 20, left: compact ? 0 : 60, bottom: compact ? 5 : 30 }}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(208,213,221,0.87)"
              vertical={true}
              horizontal={true}
            />
            <XAxis
              dataKey="fullDate"
              tickFormatter={(val: string) => getRelativeTime(val)}
              tick={{ fontSize: compact ? 9 : 14, fill: '#121212', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              dy={compact ? 5 : 10}
            />
            <YAxis
              domain={['dataMin - 200', 'dataMax + 200']}
              tick={{ fontSize: compact ? 8 : 14, fill: '#121212', fontWeight: 400 }}
              axisLine={false}
              tickLine={false}
              width={compact ? 20 : 60}
            />
            <Tooltip labelFormatter={(val) => getRelativeTime(String(val))} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#378ADD"
              strokeWidth={2.5}
              dot={{ r: compact ? 3 : 5, fill: '#378ADD', strokeWidth: 0 }}
              activeDot={{ r: compact ? 4 : 6, fill: '#378ADD', stroke: '#fff', strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )
    },
  })),
)

export default function PriceTrendChart({ chartData, compact }: ChartProps) {
  return <LazyLineChart data={chartData} compact={compact} />
}
