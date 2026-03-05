interface Props {
  distribution: Record<string, number>
  total: number
}

const COLOR_MAP: Record<number, string> = {
  1: 'bg-red-500', 2: 'bg-red-400', 3: 'bg-orange-400', 4: 'bg-orange-300',
  5: 'bg-yellow-300', 6: 'bg-yellow-400', 7: 'bg-lime-400', 8: 'bg-green-400',
  9: 'bg-green-500', 10: 'bg-emerald-500',
}

export default function DistributionBar({ distribution, total }: Props) {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const count = distribution[String(n)] ?? 0
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={n} className="flex items-center gap-3">
            <span className="w-4 text-xs text-gray-500 text-right">{n}</span>
            <div className="flex-1 bg-surface-subtle rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${COLOR_MAP[n]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-xs text-gray-400 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
