import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

if (!admin.apps.length) admin.initializeApp()

const db = admin.firestore()

/**
 * Triggered every time a mood document is written.
 * Recomputes the weekly_stats document for that weekKey.
 */
export const aggregateStats = functions.firestore
  .document('moods/{docId}')
  .onWrite(async (change) => {
    const data = (change.after.exists ? change.after.data() : change.before.data()) as {
      weekKey: string
      score: number
    } | undefined

    if (!data) return

    const { weekKey } = data

    // Fetch all moods for this week
    const snapshot = await db
      .collection('moods')
      .where('weekKey', '==', weekKey)
      .get()

    const scores = snapshot.docs.map((d) => (d.data() as { score: number }).score)
    const count = scores.length

    if (count === 0) {
      // If all moods for this week were deleted, remove the stats document
      await db.collection('weekly_stats').doc(weekKey).delete()
      return
    }

    const average = scores.reduce((a, b) => a + b, 0) / count

    const distribution: Record<string, number> = {}
    for (let i = 1; i <= 10; i++) {
      distribution[String(i)] = scores.filter((s) => s === i).length
    }

    await db.collection('weekly_stats').doc(weekKey).set({
      weekKey,
      average,
      count,
      distribution,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })
