import { useState, useEffect } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { messagingPromise, db } from '../firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export function useNotifications() {
  const [permission, setPermission] = useState<NotifPermission>('default')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    messagingPromise.then((m) => {
      setSupported(!!m)
      if (!m) return
      setPermission(Notification.permission as NotifPermission)

      // Handle foreground messages (show a simple in-app toast)
      onMessage(m, (payload) => {
        const title = payload.notification?.title ?? 'Team Mood'
        const body = payload.notification?.body ?? ''
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/icons/icon-192.png' })
        }
      })
    })
  }, [])

  async function enableNotifications(): Promise<void> {
    const messaging = await messagingPromise
    if (!messaging) return

    const result = await Notification.requestPermission()
    setPermission(result as NotifPermission)
    if (result !== 'granted') return

    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    // Store token in a separate collection — not linked to user identity
    await setDoc(doc(db, 'fcm_tokens', token), {
      token,
      subscribedAt: serverTimestamp(),
    })
  }

  async function disableNotifications(): Promise<void> {
    const messaging = await messagingPromise
    if (!messaging) return

    const token = await getToken(messaging, { vapidKey: VAPID_KEY }).catch(() => null)
    if (token) {
      await deleteDoc(doc(db, 'fcm_tokens', token))
    }
    setPermission('default')
  }

  return { permission, supported, enableNotifications, disableNotifications }
}
