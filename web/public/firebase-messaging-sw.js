// Firebase Messaging Service Worker
// This file MUST be at the root of the public directory.
// It handles background push notifications when the app is not in the foreground.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// These values are intentionally public (they appear in index.html too).
// Security is enforced via Firebase Security Rules, not by hiding these keys.
firebase.initializeApp({
  apiKey: self.__FIREBASE_API_KEY__,
  authDomain: self.__FIREBASE_AUTH_DOMAIN__,
  projectId: self.__FIREBASE_PROJECT_ID__,
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__,
  appId: self.__FIREBASE_APP_ID__,
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title = 'Team Mood', body = '' } = payload.notification ?? {}
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'weekly-reminder',
    renotify: false,
    data: { url: '/' },
  })
})

// Open app on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url.includes(self.location.origin))
        if (existing) return existing.focus()
        return clients.openWindow(url)
      })
  )
})
