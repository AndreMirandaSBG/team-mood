import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

if (!admin.apps.length) admin.initializeApp()

const db = admin.firestore()
const messaging = admin.messaging()

/**
 * Cloud Scheduler trigger — runs every Monday at 09:00 Lisbon time (UTC+0 in winter, UTC+1 in summer).
 * Schedule: "0 9 * * 1" (Europe/Lisbon timezone)
 */
export const sendWeeklyReminder = functions
  .region('europe-west1')
  .pubsub.schedule('0 9 * * 1')
  .timeZone('Europe/Lisbon')
  .onRun(async () => {
    const snapshot = await db.collection('fcm_tokens').get()

    if (snapshot.empty) {
      functions.logger.info('No FCM tokens found, skipping.')
      return
    }

    const tokens = snapshot.docs.map((d) => (d.data() as { token: string }).token)

    // FCM supports batches of up to 500 tokens
    const BATCH_SIZE = 500
    const batches: string[][] = []
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      batches.push(tokens.slice(i, i + BATCH_SIZE))
    }

    let totalSuccess = 0
    let totalFailed = 0
    const staleTokens: string[] = []

    for (const batch of batches) {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: 'Como te sentes esta semana? 😊',
          body: 'Regista o teu mood — leva apenas 5 segundos.',
        },
        webpush: {
          notification: {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            requireInteraction: false,
          },
          fcmOptions: {
            link: '/',
          },
        },
      })

      totalSuccess += response.successCount
      totalFailed += response.failureCount

      // Collect stale/invalid tokens for cleanup
      response.responses.forEach((r, idx) => {
        if (
          !r.success &&
          (r.error?.code === 'messaging/registration-token-not-registered' ||
            r.error?.code === 'messaging/invalid-registration-token')
        ) {
          staleTokens.push(batch[idx])
        }
      })
    }

    // Remove stale tokens in batches
    if (staleTokens.length > 0) {
      const firestoreBatch = db.batch()
      staleTokens.forEach((token) => {
        firestoreBatch.delete(db.collection('fcm_tokens').doc(token))
      })
      await firestoreBatch.commit()
      functions.logger.info(`Removed ${staleTokens.length} stale tokens`)
    }

    functions.logger.info(
      `Weekly reminder sent: ${totalSuccess} success, ${totalFailed} failed`
    )
  })
