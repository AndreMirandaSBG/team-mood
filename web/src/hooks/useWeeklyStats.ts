import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export interface WeeklyStat {
  weekKey: string
  average: number
  count: number
  distribution: Record<string, number>
}

export function useWeeklyStats(weeks = 12) {
  const [stats, setStats] = useState<WeeklyStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'weekly_stats'),
      orderBy('weekKey', 'desc'),
      limit(weeks)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => d.data() as WeeklyStat)
        // Only show weeks with enough responses to preserve anonymity
        .filter((s) => s.count >= 3)
        .reverse() // chronological order for charts
      setStats(data)
      setLoading(false)
    })

    return unsubscribe
  }, [weeks])

  return { stats, loading }
}
