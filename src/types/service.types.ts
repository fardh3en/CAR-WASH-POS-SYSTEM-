export interface ServicePackage {
  id: string
  name: string
  description?: string
  activities: string[]
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PricingRule {
  id: string
  vehicleCategoryId: string
  servicePackageId: string
  variant?: string
  price: number // Whole rupees (INR ₹)
  isActive: boolean
  effectiveFrom: string
  createdAt: string
  updatedAt: string
}

export interface ServiceSelectionState {
  servicePackageId: string
  servicePackageName: string
  standardPrice: number | null // null = "Price not configured"
  actualPrice: number | null
  adjustmentReason?: string
  isConfigured: boolean
}
