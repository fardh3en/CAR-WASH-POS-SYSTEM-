import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type {
  Transaction,
  VehicleSnapshot,
  CustomerSnapshot,
  ServicePackageSnapshot,
  PricingSnapshot,
  StaffSnapshot,
} from '@/types/transaction.types'
import { transactionCounterService } from './transactionCounter.service'
import { normalizeRegistrationNumber } from '@/utils/vehicle.utils'

const COLLECTION_NAME = 'transactions'

export const transactionService = {
  /**
   * Create immutable transaction sales record with complete snapshots.
   * Status initialized to 'OPEN' and paymentStatus to 'UNPAID'.
   */
  async createTransaction(data: {
    vehicleSnapshot: VehicleSnapshot
    customerSnapshot: CustomerSnapshot
    servicePackageSnapshot: ServicePackageSnapshot
    pricingSnapshot: PricingSnapshot
    staffSnapshot: StaffSnapshot
    expectedPickupAt?: string
  }): Promise<Transaction> {
    try {
      const transactionNumber = await transactionCounterService.generateNextTransactionNumber()
      const docRef = doc(collection(db, COLLECTION_NAME))
      const now = new Date().toISOString()

      const newTransaction: Transaction = {
        id: docRef.id,
        transactionNumber,
        status: 'OPEN',
        paymentStatus: 'UNPAID',
        paidAmount: 0,
        vehicleSnapshot: data.vehicleSnapshot,
        customerSnapshot: data.customerSnapshot,
        servicePackageSnapshot: data.servicePackageSnapshot,
        pricingSnapshot: data.pricingSnapshot,
        staffSnapshot: data.staffSnapshot,
        vehicleArrivedAt: now,
        expectedPickupAt: data.expectedPickupAt || undefined,
        createdAt: now,
        updatedAt: now,
      }

      await setDoc(docRef, newTransaction)
      return newTransaction
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  },

  /**
   * Fetch single transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return null
      return { id: snap.id, ...snap.data() } as Transaction
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error)
      throw error
    }
  },

  /**
   * Operational Vehicle History Lookup by normalized vehicle registration number.
   */
  async getTransactionsByVehicle(rawRegNumber: string): Promise<Transaction[]> {
    const normalized = normalizeRegistrationNumber(rawRegNumber)
    if (!normalized) return []

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('vehicleSnapshot.registrationNumber', '==', normalized),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      return snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Transaction[]
    } catch (error) {
      console.error(`Error fetching history for vehicle ${normalized}:`, error)
      throw error
    }
  },

  /**
   * Fetch recent transactions for Staff shift view or Admin records view.
   */
  async getRecentTransactions(limitCount: number = 20): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const snap = await getDocs(q)
      return snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Transaction[]
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
      throw error
    }
  },

  /**
   * Controlled Order Cancellation Flow.
   * Updates ONLY status -> 'CANCELLED', cancellationReason, and updatedAt.
   * Snapshot fields remain completely untouched.
   */
  async cancelTransaction(id: string, cancellationReason: string): Promise<void> {
    const reason = cancellationReason.trim()
    if (!reason) {
      throw new Error('A mandatory cancellation reason must be provided.')
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        status: 'CANCELLED',
        cancellationReason: reason,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Error cancelling transaction ${id}:`, error)
      throw error
    }
  },
}
