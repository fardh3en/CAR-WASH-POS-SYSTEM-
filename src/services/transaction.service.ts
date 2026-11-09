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
  runTransaction,
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
import { getTodayDateString, transactionCounterService } from './transactionCounter.service'
import { normalizeRegistrationNumber } from '@/utils/vehicle.utils'
import { auditService } from './audit.service'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

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
    if (BACKEND_PROVIDER === 'supabase') {
      const { data: row, error } = await getSupabaseClient().rpc('rpc_create_transaction', {
        p_ist_date_string: getTodayDateString(),
        p_vehicle_snapshot: data.vehicleSnapshot,
        p_customer_snapshot: data.customerSnapshot,
        p_service_package_snapshot: data.servicePackageSnapshot,
        p_pricing_snapshot: data.pricingSnapshot,
        p_staff_snapshot: data.staffSnapshot,
        p_expected_pickup_at: data.expectedPickupAt ?? null,
      })
      if (error) throw error
      return mapSupabaseTransaction(row as Record<string, unknown>)
    }
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
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('transactions')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data ? mapSupabaseTransaction(data as Record<string, unknown>) : null
    }
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

    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('transactions')
        .select('*')
        .filter('vehicle_snapshot->>registrationNumber', 'eq', normalized)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => mapSupabaseTransaction(row as Record<string, unknown>))
    }

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
    if (BACKEND_PROVIDER === 'supabase') {
      const { data, error } = await getSupabaseClient()
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount)
      if (error) throw error
      return (data ?? []).map((row) => mapSupabaseTransaction(row as Record<string, unknown>))
    }
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
   * Controlled Order Cancellation Flow (100% Atomic).
   * Updates ONLY status -> 'CANCELLED', cancellationReason, and updatedAt.
   * Creates TRANSACTION_CANCELLED audit record atomically in the same runTransaction.
   * Snapshot fields remain completely untouched.
   */
  async cancelTransaction(
    id: string,
    cancellationReason: string,
    performedBy?: { userId: string; userName: string; userRole: 'ADMIN' | 'STAFF' }
  ): Promise<void> {
    const reason = cancellationReason.trim()
    if (!reason) {
      throw new Error('A mandatory cancellation reason must be provided.')
    }

    if (BACKEND_PROVIDER === 'supabase') {
      const { error } = await getSupabaseClient().rpc('rpc_cancel_transaction', {
        p_transaction_id: id,
        p_cancellation_reason: reason,
        p_user_id: performedBy?.userId ?? null,
        p_user_name: performedBy?.userName ?? null,
        p_user_role: performedBy?.userRole ?? null,
      })
      if (error) throw error
      return
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    const now = new Date().toISOString()

    try {
      await runTransaction(db, async (t) => {
        const snap = await t.get(docRef)
        if (!snap.exists()) {
          throw new Error('Transaction record not found.')
        }

        const txData = snap.data() as Transaction
        if (txData.status !== 'OPEN') {
          throw new Error('Only OPEN transactions can be cancelled.')
        }

        // Prepare audit record helper
        const { docRef: auditRef, record: auditRec } = auditService.prepareAuditRecord({
          eventType: 'TRANSACTION_CANCELLED',
          targetDocumentId: id,
          targetReference: txData.transactionNumber || id,
          performedByUserId: performedBy?.userId || txData.staffSnapshot.staffId,
          performedByUserName: performedBy?.userName || txData.staffSnapshot.staffName,
          performedByUserRole: performedBy?.userRole || 'STAFF',
          reason,
          metadata: {
            vehicleRegistration: txData.vehicleSnapshot.registrationNumber,
            servicePackageName: txData.servicePackageSnapshot.name,
            standardPrice: txData.pricingSnapshot.standardPrice,
            actualPrice: txData.pricingSnapshot.actualPrice,
          },
        })

        // Update transaction status (restricted by firestore.rules to status, cancellationReason, updatedAt)
        t.update(docRef, {
          status: 'CANCELLED',
          cancellationReason: reason,
          updatedAt: now,
        })

        // Write audit record atomically inside the same transaction
        t.set(auditRef, auditRec)
      })
    } catch (error) {
      console.error(`Error cancelling transaction ${id}:`, error)
      throw error
    }
  },
}

function mapSupabaseTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    transactionNumber: row.transaction_number as string,
    status: row.status as Transaction['status'],
    vehicleSnapshot: row.vehicle_snapshot as VehicleSnapshot,
    customerSnapshot: row.customer_snapshot as CustomerSnapshot,
    servicePackageSnapshot: row.service_package_snapshot as ServicePackageSnapshot,
    pricingSnapshot: row.pricing_snapshot as PricingSnapshot,
    staffSnapshot: row.staff_snapshot as StaffSnapshot,
    vehicleArrivedAt: row.vehicle_arrived_at as string,
    expectedPickupAt: (row.expected_pickup_at as string | null) ?? undefined,
    cancellationReason: (row.cancellation_reason as string | null) ?? undefined,
    paymentStatus: row.payment_status as Transaction['paymentStatus'],
    paidAmount: row.paid_amount as number,
    paymentMethod: (row.payment_method as Transaction['paymentMethod'] | null) ?? undefined,
    paidAt: (row.paid_at as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}
