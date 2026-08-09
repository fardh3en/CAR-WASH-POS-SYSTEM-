export type TransactionStatus = 'OPEN' | 'CANCELLED'

export interface VehicleSnapshot {
  vehicleId: string
  registrationNumber: string // Normalized uppercase (e.g. "KL01AB1234")
  displayRegistrationNumber: string // Formatted (e.g. "KL 01 AB 1234")
  categoryId: string
  categoryName: string
  variant?: string
  model?: string
}

export interface CustomerSnapshot {
  customerId: string | null
  name?: string
  phoneNumber?: string
}

export interface ServicePackageSnapshot {
  servicePackageId: string
  name: string
  description?: string
  activities: string[]
}

export interface PricingSnapshot {
  standardPrice: number // Whole rupees (INR ₹)
  actualPrice: number // Whole rupees (INR ₹)
  priceAdjustment: number // actualPrice - standardPrice
  adjustmentReason?: string
}

export interface StaffSnapshot {
  staffId: string
  staffName: string
  staffEmail: string
}

export interface Transaction {
  id: string // Independently unique Firestore doc ID
  transactionNumber: string // Concurrency-safe format e.g. TRX-20260809-0001
  status: TransactionStatus

  // Immutable Snapshots
  vehicleSnapshot: VehicleSnapshot
  customerSnapshot: CustomerSnapshot
  servicePackageSnapshot: ServicePackageSnapshot
  pricingSnapshot: PricingSnapshot
  staffSnapshot: StaffSnapshot

  // Time & Operations
  vehicleArrivedAt: string // ISO timestamp when vehicle arrived
  expectedPickupAt?: string // Optional ISO timestamp for customer pickup time
  cancellationReason?: string

  createdAt: string
  updatedAt: string
}
