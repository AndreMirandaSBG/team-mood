import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { WeeklyStat } from '../hooks/useWeeklyStats'
import { formatWeekKey } from '../hooks/useWeekKey'

interface Props {
  stats: WeeklyStat[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-brand-600 font-bold text-lg">{payload[0].value.toFixed(1)}</p>
    </div>
  )
}

export default function WeeklyChart({ stats }: Props) {
  const data = stats.map((s) => ({
    week: formatWeekKey(s.weekKey).replace('Semana ', 'S').replace(',', ''),
    average: parseFloat(s.average.toFixed(1)),
    count: s.count,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Ainda não há dados suficientes
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 3, 5, 7, 10]}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#4a52e8"
          strokeWidth={2.5}
          dot={{ fill: '#4a52e8', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#4a52e8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
