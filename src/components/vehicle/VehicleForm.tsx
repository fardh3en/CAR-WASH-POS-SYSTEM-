import React, { useState, useEffect } from 'react'
import type { VehicleCategory, Vehicle } from '@/types/vehicle.types'
import type { Customer } from '@/types/customer.types'
import { vehicleCategoryService } from '@/services/vehicleCategory.service'
import { vehicleService } from '@/services/vehicle.service'
import { customerService } from '@/services/customer.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRegistrationNumber } from '@/utils/vehicle.utils'
import { Car, User as UserIcon, Phone, AlertCircle } from 'lucide-react'

interface VehicleFormProps {
  normalizedRegistrationNumber: string
  onVehicleSaved: (vehicle: Vehicle, customer: Customer | null) => void
  onCancel?: () => void
}

export function VehicleForm({ normalizedRegistrationNumber, onVehicleSaved, onCancel }: VehicleFormProps) {
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [model, setModel] = useState<string>('')

  // Optional customer fields
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetched = await vehicleCategoryService.getVehicleCategories()
        setCategories(fetched)
        if (fetched.length > 0) {
          setSelectedCategoryId(fetched[0].id)
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
        setErrorMessage('Failed to load vehicle categories.')
      } finally {
        setLoading(false)
      }
    }
    void loadCategories()
  }, [])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedCategoryId) {
      setErrorMessage('Please select a vehicle category.')
      return
    }

    setSaving(true)
    try {
      let createdCustomer: Customer | null = null
      let customerId: string | null = null

      // Optional Customer Handling:
      // Create Customer document ONLY if phone or name is explicitly provided.
      // If blank, customerId remains null (no dummy customer documents created!)
      const trimmedPhone = customerPhone.trim()
      const trimmedName = customerName.trim()

      if (trimmedPhone || trimmedName) {
        // Check if existing customer has matching phone
        if (trimmedPhone) {
          createdCustomer = await customerService.findCustomerByPhone(trimmedPhone)
        }

        if (!createdCustomer) {
          createdCustomer = await customerService.createCustomer({
            name: trimmedName || undefined,
            phoneNumber: trimmedPhone || undefined,
          })
        }
        customerId = createdCustomer.id
      }

      // Create Vehicle
      const newVehicle = await vehicleService.createVehicle({
        registrationNumber: normalizedRegistrationNumber,
        categoryId: selectedCategoryId,
        variant: selectedVariant || undefined,
        model: model.trim() || undefined,
        customerId: customerId,
      })

      // Link vehicle to customer if customer exists
      if (createdCustomer && newVehicle.id) {
        await customerService.linkVehicleToCustomer(createdCustomer.id, newVehicle.id)
      }

      onVehicleSaved(newVehicle, createdCustomer)
    } catch (err) {
      console.error('Failed to save vehicle:', err)
      setErrorMessage('Failed to save vehicle. Please check input.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Loading vehicle categories...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[hsl(var(--card))] p-6 rounded-lg border border-[hsl(var(--border))]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-lg font-bold">Register New Vehicle</h2>
        </div>
        <span className="text-sm font-semibold tracking-wider font-mono bg-[hsl(var(--secondary))] px-3 py-1 rounded-md text-[hsl(var(--secondary-foreground))]">
          {formatRegistrationNumber(normalizedRegistrationNumber)}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Vehicle Details */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="categorySelect" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
            Vehicle Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categorySelect"
            className="w-full h-11 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value)
              setSelectedVariant('')
            }}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Variant Select (if available for category) */}
        {selectedCategory?.variants && selectedCategory.variants.length > 0 && (
          <div className="space-y-1.5">
            <label htmlFor="variantSelect" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
              Variant / Size Option
            </label>
            <select
              id="variantSelect"
              className="w-full h-11 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
            >
              <option value="">Select Variant (Optional)</option>
              {selectedCategory.variants.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="modelInput" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
            Vehicle Model <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">(Optional)</span>
          </label>
          <Input
            id="modelInput"
            type="text"
            placeholder="e.g. Swift, Seltos, Activa..."
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
      </div>

      {/* Optional Customer Information */}
      <div className="pt-4 border-t border-[hsl(var(--border))] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
            Customer Information (Optional)
          </span>
          <span className="text-[11px] italic text-[hsl(var(--muted-foreground))]">
            May be left blank if customer declines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="phoneInput" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                id="phoneInput"
                type="tel"
                placeholder="e.g. 9876543210"
                className="pl-9"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nameInput" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))] block">
              Customer Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                id="nameInput"
                type="text"
                placeholder="e.g. John Doe"
                className="pl-9"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="default" className="min-w-[140px]" disabled={saving}>
          {saving ? 'Saving...' : 'Save Vehicle'}
        </Button>
      </div>
    </form>
  )
}
