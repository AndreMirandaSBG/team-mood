import { useState } from 'react'
import { useWeeklyStats } from '../hooks/useWeeklyStats'
import { formatWeekKey } from '../hooks/useWeekKey'
import WeeklyChart from '../components/WeeklyChart'
import DistributionBar from '../components/DistributionBar'

export default function DashboardPage() {
  const { stats, loading } = useWeeklyStats(12)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const displayStats = [...stats].reverse() // most recent first for the selector
  const latest = stats[stats.length - 1]
  const focused = selectedWeek !== null ? displayStats[selectedWeek] : latest

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Tendência da equipa</h1>
        <p className="text-sm text-gray-500 mt-1">Últimas 12 semanas · dados agregados</p>
      </header>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      )}

      {!loading && stats.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 text-sm">
            Ainda não há dados suficientes.<br />
            São necessárias pelo menos 3 respostas por semana.
          </p>
        </div>
      )}

      {!loading && stats.length > 0 && (
        <>
          {/* Summary card */}
          {latest && (
            <div className="card flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                  Semana actual
                </p>
                <p className="text-3xl font-bold text-brand-600 mt-1">
                  {latest.average.toFixed(1)}
                  <span className="text-base font-normal text-gray-400">/10</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">{latest.count} respostas</p>
              </div>
              <div className="text-5xl">
                {latest.average >= 8 ? '🤩' : latest.average >= 6 ? '😊' : latest.average >= 4 ? '😐' : '😟'}
              </div>
            </div>
          )}

          {/* Trend chart */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Média semanal</h2>
            <WeeklyChart stats={stats} />
          </div>

          {/* Weekly breakdown */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Distribuição</h2>
              <select
                className="text-xs text-gray-500 bg-surface-subtle rounded-lg px-2 py-1 border-0 focus:ring-2 focus:ring-brand-500"
                value={selectedWeek ?? ''}
                onChange={(e) => setSelectedWeek(e.target.value === '' ? null : Number(e.target.value))}
              >
                <option value="">Semana mais recente</option>
                {displayStats.map((s, i) => (
                  <option key={s.weekKey} value={i}>
                    {formatWeekKey(s.weekKey)}
                  </option>
                ))}
              </select>
            </div>
            {focused && (
              <>
                <DistributionBar distribution={focused.distribution} total={focused.count} />
                <p className="text-xs text-gray-400 mt-3 text-center">
                  {focused.count} respostas · média {focused.average.toFixed(1)}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </main>
  )
}
