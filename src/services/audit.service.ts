/**
 * Audit Service — Phase 10
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. auditService MUST NOT execute runTransaction() itself.
 * 2. prepareAuditRecord() is a pure helper function returning a DocumentReference and
 *    AuditLogRecord object.
 * 3. The mutating service (paymentService, transactionService, pricingService, servicePackageService)
 *    owns the outer Firestore runTransaction and performs transaction.set(auditDocRef, auditRecord).
 * 4. getAuditLogs() is a read-only query method for the Admin Audit Viewer.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { AuditLogRecord, AuditEventType } from '@/types/audit.types'
import { BACKEND_PROVIDER } from '@/config/backend'
import { getSupabaseClient } from '@/config/supabase'

const AUDIT_COLLECTION = 'auditLogs'

export const auditService = {
  /**
   * Pure synchronous helper function.
   * Constructs a DocumentReference in `auditLogs` and a populated AuditLogRecord object.
   * DOES NOT perform any database writes — returned reference & record MUST be written
   * inside the mutating service's outer runTransaction using transaction.set(docRef, record).
   */
  prepareAuditRecord(
    data: Omit<AuditLogRecord, 'id' | 'createdAt'>
  ): { docRef: DocumentReference; record: AuditLogRecord } {
    const docRef = doc(collection(db, AUDIT_COLLECTION))
    const now = new Date().toISOString()
    const record: AuditLogRecord = {
      ...data,
      id: docRef.id,
      createdAt: now,
    }
    return { docRef, record }
  },

  /**
   * Read-only query method for Admin Audit Log Viewer (/admin/audit).
   * Supports filtering by IST date range and event type.
   */
  async getAuditLogs(
    startIso?: string,
    endIso?: string,
    eventTypeFilter?: AuditEventType | 'ALL',
    limitCount: number = 50
  ): Promise<AuditLogRecord[]> {
    if (BACKEND_PROVIDER === 'supabase') {
      let request = getSupabaseClient()
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount)
      if (startIso && endIso) request = request.gte('created_at', startIso).lt('created_at', endIso)
      if (eventTypeFilter && eventTypeFilter !== 'ALL') {
        request = request.eq('event_type', eventTypeFilter)
      }
      const { data, error } = await request
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        eventType: row.event_type as AuditEventType,
        targetDocumentId: row.target_document_id,
        targetReference: row.target_reference,
        performedByUserId: row.performed_by_user_id,
        performedByUserName: row.performed_by_user_name,
        performedByUserRole: row.performed_by_user_role as AuditLogRecord['performedByUserRole'],
        reason: row.reason ?? undefined,
        metadata: row.metadata ?? undefined,
        createdAt: row.created_at,
      }))
    }
    try {
      let q = query(
        collection(db, AUDIT_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      if (startIso && endIso) {
        q = query(
          collection(db, AUDIT_COLLECTION),
          where('createdAt', '>=', startIso),
          where('createdAt', '<', endIso),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        )
      }

      const snap = await getDocs(q)
      let logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogRecord)

      if (eventTypeFilter && eventTypeFilter !== 'ALL') {
        logs = logs.filter((l) => l.eventType === eventTypeFilter)
      }

      return logs
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  },
}
