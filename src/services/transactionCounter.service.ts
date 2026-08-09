import { doc, runTransaction } from 'firebase/firestore'
import { db } from '@/config/firebase'

const COUNTER_COLLECTION = 'transactionCounters'

/**
 * Get current date string formatted as YYYYMMDD (Asia/Kolkata timezone)
 */
export function getTodayDateString(): string {
  const now = new Date()
  // Adjust for IST (+5:30) if needed or use standard ISO YYYYMMDD
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export const transactionCounterService = {
  /**
   * Concurrency-safe atomic transaction counter generation using Firestore runTransaction.
   * Increments daily counter atomically by exactly 1 and formats TRX-YYYYMMDD-XXXX.
   */
  async generateNextTransactionNumber(): Promise<string> {
    const dateStr = getTodayDateString()
    const counterDocRef = doc(db, COUNTER_COLLECTION, dateStr)

    try {
      const nextCount = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterDocRef)

        if (!counterSnap.exists()) {
          transaction.set(counterDocRef, {
            count: 1,
            dateStr,
            updatedAt: new Date().toISOString(),
          })
          return 1
        } else {
          const currentCount = counterSnap.data().count || 0
          const newCount = currentCount + 1
          transaction.update(counterDocRef, {
            count: newCount,
            updatedAt: new Date().toISOString(),
          })
          return newCount
        }
      })

      const sequenceStr = String(nextCount).padStart(4, '0')
      return `TRX-${dateStr}-${sequenceStr}`
    } catch (error) {
      console.error('Error generating transaction number atomically:', error)
      throw error
    }
  },
}
