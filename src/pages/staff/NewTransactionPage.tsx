import { useState, useEffect } from 'react'
import type { Vehicle, VehicleCategory } from '@/types/vehicle.types'
import type { Customer } from '@/types/customer.types'
import { vehicleService } from '@/services/vehicle.service'
import { vehicleCategoryService } from '@/services/vehicleCategory.service'
import { customerService } from '@/services/customer.service'
import { VehicleSearch } from '@/components/vehicle/VehicleSearch'
import { VehicleForm } from '@/components/vehicle/VehicleForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User as UserIcon, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react'

export function StaffNewTransactionPage() {
  const [searchedRegNumber, setSearchedRegNumber] = useState<string>('')
  const [searching, setSearching] = useState<boolean>(false)
  const [searchExecuted, setSearchExecuted] = useState<boolean>(false)

  const [foundVehicle, setFoundVehicle] = useState<Vehicle | null>(null)
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
  const [categories, setCategories] = useState<VehicleCategory[]>([])

  // Optional customer update state for existing vehicle
  const [showCustomerUpdate, setShowCustomerUpdate] = useState<boolean>(false)
  const [updatePhone, setUpdatePhone] = useState<string>('')
  const [updateName, setUpdateName] = useState<string>('')
  const [updatingCustomer, setUpdatingCustomer] = useState<boolean>(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const list = await vehicleCategoryService.getVehicleCategories()
        setCategories(list)
      } catch (err) {
        console.error('Failed to load vehicle categories:', err)
      }
    }
    void loadCategories()
  }, [])

  /**
   * Search vehicle by normalized registration number.
   * Single exact-match Firestore query executed ONLY when Staff submits search.
   */
  const handleSearch = async (normalizedReg: string) => {
    setSearchedRegNumber(normalizedReg)
    setSearching(true)
    setSearchExecuted(false)
    setErrorMessage(null)
    setFoundVehicle(null)
    setFoundCustomer(null)
    setShowCustomerUpdate(false)

    try {
      const vehicle = await vehicleService.getVehicleByRegistration(normalizedReg)
      setFoundVehicle(vehicle)

      if (vehicle && vehicle.customerId) {
        const cust = await customerService.getCustomerById(vehicle.customerId)
        setFoundCustomer(cust)
      }
    } catch (err) {
      console.error('Search error:', err)
      setErrorMessage('Failed to search vehicle records.')
    } finally {
      setSearching(false)
      setSearchExecuted(true)
    }
  }

  const handleVehicleSaved = (savedVehicle: Vehicle, savedCustomer: Customer | null) => {
    setFoundVehicle(savedVehicle)
    setFoundCustomer(savedCustomer)
  }

  const handleResetSearch = () => {
    setSearchedRegNumber('')
    setSearchExecuted(false)
    setFoundVehicle(null)
    setFoundCustomer(null)
    setShowCustomerUpdate(false)
    setErrorMessage(null)
  }

  const handleSaveCustomerInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foundVehicle) return
    setUpdatingCustomer(true)

    try {
      const trimmedPhone = updatePhone.trim()
      const trimmedName = updateName.trim()

      if (trimmedPhone || trimmedName) {
        let cust = foundCustomer
        if (cust) {
          await customerService.updateCustomer(cust.id, {
            name: trimmedName || cust.name,
            phoneNumber: trimmedPhone || cust.phoneNumber,
          })
          cust = await customerService.getCustomerById(cust.id)
        } else {
          cust = await customerService.createCustomer({
            name: trimmedName || undefined,
            phoneNumber: trimmedPhone || undefined,
            vehicleId: foundVehicle.id,
          })
          await vehicleService.updateVehicle(foundVehicle.id, { customerId: cust.id })
          setFoundVehicle({ ...foundVehicle, customerId: cust.id })
        }
        setFoundCustomer(cust)
        setShowCustomerUpdate(false)
      }
    } catch (err) {
      console.error('Failed to update customer info:', err)
    } finally {
      setUpdatingCustomer(false)
    }
  }

  const categoryName = categories.find((c) => c.id === foundVehicle?.categoryId)?.name || 'Unknown Category'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Registration & Vehicle Lookup</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Front-Desk Phase 3 Operational Flow &mdash; Search vehicle registration number
        </p>
      </div>

      {/* Step 1: Search Form */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Vehicle Search</span>
            {searchExecuted && (
              <Button variant="ghost" size="sm" onClick={handleResetSearch} className="h-8 text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> New Search
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleSearch onSearchSubmit={handleSearch} loading={searching} />
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 2: Search Result handling */}
      {searchExecuted && (
        <>
          {foundVehicle ? (
            /* Existing Vehicle Found */
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <CardTitle className="text-lg">Existing Vehicle Identified</CardTitle>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-800 rounded-full uppercase tracking-wider">
                    Found in Database
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[hsl(var(--card))] p-4 rounded-md border border-[hsl(var(--border))]">
                  <div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] block">Registration Number</span>
                    <span className="text-base font-bold font-mono tracking-wider">
                      {foundVehicle.displayRegistrationNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] block">Vehicle Category</span>
                    <span className="text-sm font-semibold">{categoryName}</span>
                    {foundVehicle.variant && (
                      <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">({foundVehicle.variant})</span>
                    )}
                  </div>
                  {foundVehicle.model && (
                    <div>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] block">Vehicle Model</span>
                      <span className="text-sm font-medium">{foundVehicle.model}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] block">Customer Account</span>
                    {foundCustomer ? (
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {foundCustomer.name || 'Unnamed Customer'} {foundCustomer.phoneNumber ? `(${foundCustomer.phoneNumber})` : ''}
                      </span>
                    ) : (
                      <span className="text-xs italic text-[hsl(var(--muted-foreground))]">
                        No customer details linked (customerId = null)
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Update Option */}
                {!showCustomerUpdate ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUpdatePhone(foundCustomer?.phoneNumber || '')
                      setUpdateName(foundCustomer?.name || '')
                      setShowCustomerUpdate(true)
                    }}
                    className="text-xs"
                  >
                    <UserIcon className="h-3.5 w-3.5 mr-1" />
                    {foundCustomer ? 'Update Customer Info' : 'Add Customer Info'}
                  </Button>
                ) : (
                  <form onSubmit={handleSaveCustomerInfo} className="bg-[hsl(var(--card))] p-4 rounded-md border border-[hsl(var(--border))] space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block">
                      Associate Customer Info (Optional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        value={updatePhone}
                        onChange={(e) => setUpdatePhone(e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder="Customer Name"
                        value={updateName}
                        onChange={(e) => setUpdateName(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowCustomerUpdate(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="default" size="sm" disabled={updatingCustomer}>
                        {updatingCustomer ? 'Saving...' : 'Save Customer Info'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : (
            /* New Vehicle Form */
            <VehicleForm
              normalizedRegistrationNumber={searchedRegNumber}
              onVehicleSaved={handleVehicleSaved}
              onCancel={handleResetSearch}
            />
          )}
        </>
      )}
    </div>
  )
}
