import { doc, runTransaction } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

const COUNTER_COLLECTION = 'transactionCounters'
const IST_OFFSET_MINUTES = 330 // UTC+5:30

/**
 * Get current date string formatted as YYYYMMDD in Indian Standard Time (IST, UTC+5:30).
 * Calendar-correct regardless of local server or client timezone.
 */
export function getTodayDateString(): string {
  const now = new Date()
  const istMs = now.getTime() + IST_OFFSET_MINUTES * 60 * 1000
  const istDate = new Date(istMs)
  const year = istDate.getUTCFullYear()
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(istDate.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export const transactionCounterService = {
  /**
   * Concurrency-safe atomic transaction counter generation using Firestore runTransaction.
   * Increments daily counter atomically by exactly 1 and formats TRX-YYYYMMDD-XXXX.
   */
  async generateNextTransactionNumber(): Promise<string> {
    const dateStr = getTodayDateString()
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient().rpc('rpc_next_transaction_number', {
        p_ist_date_string: dateStr,
      })
      if (error) throw error
      return String(data)
    }
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
