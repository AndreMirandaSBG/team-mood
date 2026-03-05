/**
 * Returns the ISO week key for a given date, e.g. "2026-W10"
 */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7 // treat Sunday as 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

/** Format a weekKey like "2026-W10" to "Semana 10, 2026" */
export function formatWeekKey(weekKey: string): string {
  const [year, w] = weekKey.split('-W')
  return `Semana ${parseInt(w)}, ${year}`
}
