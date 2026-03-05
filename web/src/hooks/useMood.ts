import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { getWeekKey } from './useWeekKey'

/** sha256 of uid + salt to avoid storing raw uid */
async function hashUid(uid: string): Promise<string> {
  const salt = import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'team-mood'
  const data = new TextEncoder().encode(uid + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export type MoodStatus =
  | { state: 'loading' }
  | { state: 'submitted'; score: number }
  | { state: 'pending' }
  | { state: 'error'; message: string }

export function useMood() {
  const [status, setStatus] = useState<MoodStatus>({ state: 'loading' })
  const weekKey = getWeekKey()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return
      try {
        const uidHash = await hashUid(user.uid)
        const ref = doc(collection(db, 'moods'), `${weekKey}_${uidHash}`)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setStatus({ state: 'submitted', score: snap.data().score as number })
        } else {
          setStatus({ state: 'pending' })
        }
      } catch {
        setStatus({ state: 'error', message: 'Erro ao verificar submissão' })
      }
    })
    return unsubscribe
  }, [weekKey])

  async function submitMood(score: number): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    setStatus({ state: 'loading' })
    try {
      const uidHash = await hashUid(user.uid)
      const ref = doc(collection(db, 'moods'), `${weekKey}_${uidHash}`)
      await setDoc(ref, {
        weekKey,
        score,
        submittedAt: serverTimestamp(),
        uidHash,
      })
      setStatus({ state: 'submitted', score })
    } catch (err) {
      setStatus({ state: 'error', message: 'Erro ao guardar. Tenta novamente.' })
      throw err
    }
  }

  return { status, weekKey, submitMood }
}
