import {
  collection,
  doc,
  getDocs,
  query,
  where,
  runTransaction,
  deleteField,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { PaymentRecord, PaymentMethod } from '@/types/transaction.types'

const PAYMENTS_COLLECTION = 'payments'
const TRANSACTIONS_COLLECTION = 'transactions'

export const paymentService = {
  /**
   * Process payment for an OPEN transaction atomically.
   * Creates payment record and completes transaction in a single Firestore runTransaction.
   */
  async processPayment(data: {
    transactionId: string
    paymentMethod: PaymentMethod
    amount: number // Must equal actualPrice
    upiReferenceNumber?: string
    notes?: string
    staffId: string
    staffName: string
  }): Promise<PaymentRecord> {
    const { transactionId, paymentMethod, amount, upiReferenceNumber, notes, staffId, staffName } = data

    if (amount <= 0) {
      throw new Error('Payment amount must be a positive whole rupee amount.')
    }
    if (paymentMethod !== 'CASH' && paymentMethod !== 'UPI') {
      throw new Error('Invalid payment method. Only CASH and UPI are supported.')
    }

    const txDocRef = doc(db, TRANSACTIONS_COLLECTION, transactionId)
    const paymentDocRef = doc(collection(db, PAYMENTS_COLLECTION))
    const now = new Date().toISOString()

    try {
      const newPayment = await runTransaction(db, async (transaction) => {
        const txSnap = await transaction.get(txDocRef)
        if (!txSnap.exists()) {
          throw new Error('Transaction record not found.')
        }

        const txData = txSnap.data()
        if (txData.status !== 'OPEN') {
          throw new Error(`Cannot record payment: Transaction status is ${txData.status}. Only OPEN transactions can be paid.`)
        }
        if (txData.paymentStatus === 'PAID') {
          throw new Error('Transaction has already been paid.')
        }

        const expectedActualPrice = txData.pricingSnapshot?.actualPrice
        if (typeof expectedActualPrice !== 'number' || amount !== expectedActualPrice) {
          throw new Error(
            `Payment amount (₹${amount}) must exactly equal the transaction actual price (₹${expectedActualPrice}).`
          )
        }

        const paymentRecord: PaymentRecord = {
          id: paymentDocRef.id,
          transactionId: txSnap.id,
          transactionNumber: txData.transactionNumber,
          amount,
          paymentMethod,
          upiReferenceNumber: upiReferenceNumber?.trim() || undefined,
          notes: notes?.trim() || undefined,
          recordedByStaffId: staffId,
          recordedByStaffName: staffName,
          recordedAt: now,
          isReversed: false,
        }

        // Write payment document
        transaction.set(paymentDocRef, paymentRecord)

        // Update transaction document
        transaction.update(txDocRef, {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paidAmount: amount,
          paymentMethod,
          paidAt: now,
          updatedAt: now,
        })

        return paymentRecord
      })

      return newPayment
    } catch (error) {
      console.error('Error processing atomic payment:', error)
      throw error
    }
  },

  /**
   * Controlled Admin Payment Reversal Exception.
   * Atomically marks payment record as reversed and resets transaction to OPEN / UNPAID.
   */
  async reversePayment(data: {
    paymentId: string
    reversalReason: string
    adminId: string
  }): Promise<void> {
    const { paymentId, reversalReason, adminId } = data
    const reason = reversalReason.trim()
    if (!reason) {
      throw new Error('A mandatory reversal reason must be provided.')
    }

    const paymentDocRef = doc(db, PAYMENTS_COLLECTION, paymentId)
    const now = new Date().toISOString()

    try {
      await runTransaction(db, async (transaction) => {
        const paymentSnap = await transaction.get(paymentDocRef)
        if (!paymentSnap.exists()) {
          throw new Error('Payment record not found.')
        }

        const paymentData = paymentSnap.data() as PaymentRecord
        if (paymentData.isReversed) {
          throw new Error('Payment record has already been reversed.')
        }

        const txDocRef = doc(db, TRANSACTIONS_COLLECTION, paymentData.transactionId)
        const txSnap = await transaction.get(txDocRef)
        if (!txSnap.exists()) {
          throw new Error('Associated transaction record not found.')
        }

        const txData = txSnap.data()
        if (txData.status !== 'COMPLETED' || txData.paymentStatus !== 'PAID') {
          throw new Error('Only COMPLETED / PAID transactions can be reversed by Admin.')
        }

        // Mark payment record reversed
        transaction.update(paymentDocRef, {
          isReversed: true,
          reversedAt: now,
          reversedByAdminId: adminId,
          reversalReason: reason,
        })

        // Reset transaction to OPEN / UNPAID
        transaction.update(txDocRef, {
          status: 'OPEN',
          paymentStatus: 'UNPAID',
          paidAmount: 0,
          paymentMethod: deleteField(),
          paidAt: deleteField(),
          updatedAt: now,
        })
      })
    } catch (error) {
      console.error('Error reversing payment atomically:', error)
      throw error
    }
  },

  /**
   * Fetch payment records for a transaction (excluding reversed unless specified)
   */
  async getPaymentForTransaction(transactionId: string): Promise<PaymentRecord | null> {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION),
        where('transactionId', '==', transactionId)
      )
      const snap = await getDocs(q)
      if (snap.empty) return null

      // Find first non-reversed payment if available
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PaymentRecord)
      const activePayment = docs.find((p) => !p.isReversed)
      return activePayment || docs[0] || null
    } catch (error) {
      console.error(`Error fetching payment for transaction ${transactionId}:`, error)
      throw error
    }
  },
}
