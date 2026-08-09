export type AuditEventType =
  | 'TRANSACTION_CANCELLED'
  | 'PAYMENT_REVERSED'
  | 'PRICE_CHANGED'
  | 'SERVICE_CONFIGURATION_CHANGED'

export interface AuditLogRecord {
  id: string
  eventType: AuditEventType
  targetDocumentId: string    // e.g. transactionId, paymentId, ruleId, packageId
  targetReference: string     // e.g. TRX-20260809-0001, KL 01 AB 1234, or Body Wash
  performedByUserId: string   // Must match request.auth.uid in Firestore security rules
  performedByUserName: string // Display name or email
  performedByUserRole: 'ADMIN' | 'STAFF' // Must match user's actual role in users doc
  reason?: string             // Mandatory for cancellations and reversals
  metadata?: Record<string, string | number | boolean> // Context payload (old/new values)
  createdAt: string           // ISO timestamp (IST conversion for UI display)
}
