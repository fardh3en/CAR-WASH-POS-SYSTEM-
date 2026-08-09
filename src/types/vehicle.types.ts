export interface VehicleCategory {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
  variants?: string[]
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  registrationNumber: string // Normalized uppercase no spaces (e.g., "KL01AB1234")
  displayRegistrationNumber: string // Formatted for UI (e.g., "KL 01 AB 1234")
  categoryId: string
  variant?: string
  model?: string
  customerId: string | null
  createdAt: string
  updatedAt: string
}
