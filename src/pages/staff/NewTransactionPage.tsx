import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Vehicle, VehicleCategory } from '@/types/vehicle.types'
import type { Customer } from '@/types/customer.types'
import type { ServiceSelectionState, ServicePackage } from '@/types/service.types'
import type { Transaction } from '@/types/transaction.types'
import { vehicleService } from '@/services/vehicle.service'
import { vehicleCategoryService } from '@/services/vehicleCategory.service'
import { customerService } from '@/services/customer.service'
import { servicePackageService } from '@/services/servicePackage.service'
import { transactionService } from '@/services/transaction.service'
import { VehicleSearch } from '@/components/vehicle/VehicleSearch'
import { VehicleForm } from '@/components/vehicle/VehicleForm'
import { ServiceSelector } from '@/components/service/ServiceSelector'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { ReceiptModal } from '@/components/receipt/ReceiptModal'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseDateTimeLocalIST } from '@/utils/date.utils'
import { User as UserIcon, CheckCircle2, RefreshCw, AlertCircle, Clock, FileCheck, CreditCard, Receipt } from 'lucide-react'

export function StaffNewTransactionPage() {
  const { user, userProfile } = useAuth()

  const [searchedRegNumber, setSearchedRegNumber] = useState<string>('')
  const [searching, setSearching] = useState<boolean>(false)
  const [searchExecuted, setSearchExecuted] = useState<boolean>(false)

  const [foundVehicle, setFoundVehicle] = useState<Vehicle | null>(null)
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([])

  // Optional customer update state
  const [showCustomerUpdate, setShowCustomerUpdate] = useState<boolean>(false)
  const [updatePhone, setUpdatePhone] = useState<string>('')
  const [updateName, setUpdateName] = useState<string>('')
  const [updatingCustomer, setUpdatingCustomer] = useState<boolean>(false)

  // Phase 4: Service Selection State
  const [selectedService, setSelectedService] = useState<ServiceSelectionState | null>(null)

  // Phase 5: Time & Creation State
  const [expectedPickup, setExpectedPickup] = useState<string>('')
  const [creatingOrder, setCreatingOrder] = useState<boolean>(false)
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null)

  // Phase 6: Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false)

  // Phase 7: Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [catList, pkgList] = await Promise.all([
          vehicleCategoryService.getVehicleCategories(),
          servicePackageService.getServicePackages(),
        ])
        setCategories(catList)
        setServicePackages(pkgList)
      } catch (err) {
        console.error('Failed to load initial data:', err)
      }
    }
    void loadData()
  }, [])

  const handleSearch = async (normalizedReg: string) => {
    setSearchedRegNumber(normalizedReg)
    setSearching(true)
    setSearchExecuted(false)
    setErrorMessage(null)
    setFoundVehicle(null)
    setFoundCustomer(null)
    setSelectedService(null)
    setCreatedTransaction(null)
    setShowPaymentModal(false)
    setShowReceiptModal(false)
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

  const handleResetAll = () => {
    setSearchedRegNumber('')
    setSearchExecuted(false)
    setFoundVehicle(null)
    setFoundCustomer(null)
    setSelectedService(null)
    setCreatedTransaction(null)
    setShowPaymentModal(false)
    setShowReceiptModal(false)
    setShowCustomerUpdate(false)
    setExpectedPickup('')
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

  const handleCreateOrder = async () => {
    if (!foundVehicle || !selectedService || !user || !userProfile) {
      setErrorMessage('Cannot create order: missing vehicle, service selection, or staff session.')
      return
    }

    if (selectedService.standardPrice === null || selectedService.actualPrice === null) {
      setErrorMessage('Cannot create order with an unconfigured price.')
      return
    }

    setCreatingOrder(true)
    setErrorMessage(null)

    try {
      const category = categories.find((c) => c.id === foundVehicle.categoryId)
      const pkgObj = servicePackages.find((p) => p.id === selectedService.servicePackageId)

      const vehicleSnap = {
        vehicleId: foundVehicle.id,
        registrationNumber: foundVehicle.registrationNumber,
        displayRegistrationNumber: foundVehicle.displayRegistrationNumber,
        categoryId: foundVehicle.categoryId,
        categoryName: category?.name || 'Vehicle Category',
        variant: foundVehicle.variant,
        model: foundVehicle.model,
      }

      const customerSnap = {
        customerId: foundVehicle.customerId,
        name: foundCustomer?.name,
        phoneNumber: foundCustomer?.phoneNumber,
      }

      const pkgSnap = {
        servicePackageId: selectedService.servicePackageId,
        name: selectedService.servicePackageName,
        description: pkgObj?.description,
        activities: pkgObj?.activities || [],
      }

      const standardP = selectedService.standardPrice
      const actualP = selectedService.actualPrice
      const pricingSnap = {
        standardPrice: standardP,
        actualPrice: actualP,
        priceAdjustment: actualP - standardP,
        adjustmentReason: selectedService.adjustmentReason,
      }

      const staffSnap = {
        staffId: user.uid,
        staffName: userProfile.displayName || user.email || 'Staff Member',
        staffEmail: user.email || userProfile.email || 'staff@mrwash.com',
      }

      const created = await transactionService.createTransaction({
        vehicleSnapshot: vehicleSnap,
        customerSnapshot: customerSnap,
        servicePackageSnapshot: pkgSnap,
        pricingSnapshot: pricingSnap,
        staffSnapshot: staffSnap,
        expectedPickupAt: expectedPickup ? parseDateTimeLocalIST(expectedPickup) : undefined,
      })

      setCreatedTransaction(created)
    } catch (err) {
      console.error('Failed to create sales transaction:', err)
      setErrorMessage('Failed to create transaction order. Please try again.')
    } finally {
      setCreatingOrder(false)
    }
  }

  const categoryName =
    categories.find((c) => c.id === foundVehicle?.categoryId)?.name || 'Vehicle Category'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-editorial text-3xl font-black text-[#0E120A] tracking-tighter">Front-Desk Service Order</h1>
        <p className="text-xs font-semibold text-[#312B22] mt-1">
          Create sales order and collect payment
        </p>
      </div>

      {/* Step 1: Vehicle Search Form */}
      {!createdTransaction && (
        <Card className="border border-[rgba(14,18,10,0.14)] bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">Step 1: Vehicle Search</span>
              {searchExecuted && (
                <Button variant="ghost" size="sm" onClick={handleResetAll} className="h-8 text-xs">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleSearch onSearchSubmit={handleSearch} loading={searching} />
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 2: Search Result handling */}
      {searchExecuted && !createdTransaction && (
        <>
          {foundVehicle ? (
            /* Vehicle Identified */
            <div className="space-y-6">
              <Card className="border border-[rgba(14,18,10,0.14)] bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#0E120A]">
                      <CheckCircle2 className="h-5 w-5" />
                      <CardTitle className="text-lg font-black text-[#0E120A]">Vehicle Identified</CardTitle>
                    </div>
                    <span className="status-completed">
                      {foundVehicle.displayRegistrationNumber}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4F5EF] p-4 border border-[rgba(14,18,10,0.14)]">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Vehicle Category</span>
                      <span className="text-sm font-black text-[#0E120A]">{categoryName}</span>
                      {foundVehicle.variant && (
                        <span className="text-xs text-[#312B22] font-semibold ml-1">({foundVehicle.variant})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Customer Account</span>
                      {foundCustomer ? (
                        <span className="text-sm font-black text-[#0E120A]">
                          {foundCustomer.name || 'Unnamed Customer'} {foundCustomer.phoneNumber ? `(${foundCustomer.phoneNumber})` : ''}
                        </span>
                      ) : (
                        <span className="text-xs italic text-[#312B22] font-semibold">
                          No customer details linked (customerId = null)
                        </span>
                      )}
                    </div>
                  </div>

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
                    <form onSubmit={handleSaveCustomerInfo} className="bg-[#F4F5EF] p-4 border border-[rgba(14,18,10,0.14)] space-y-3">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">
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

              {/* Step 3: Service Package & Pricing Selection */}
              {!selectedService ? (
                <ServiceSelector
                  vehicle={foundVehicle}
                  categoryName={categoryName}
                  onSelectionComplete={(selection) => setSelectedService(selection)}
                />
              ) : (
                /* Order Review & Creation Card */
                <Card className="border-2 border-[#0E120A] bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-black text-[#0E120A] flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Review & Create Sales Order
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setSelectedService(null)} className="h-8 text-xs">
                        Change Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F4F5EF] p-4 border border-[rgba(14,18,10,0.14)]">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Selected Package</span>
                        <span className="text-base font-black text-[#0E120A]">{selectedService.servicePackageName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Standard Price</span>
                        <span className="text-base font-black text-[#0E120A]">₹{selectedService.standardPrice}</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Final Charged Price</span>
                        <span className="text-lg font-black text-[#0E120A]">₹{selectedService.actualPrice}</span>
                        {selectedService.adjustmentReason && (
                          <span className="text-[11px] text-[#312B22] font-semibold block">
                            Reason: {selectedService.adjustmentReason}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-[#F4F5EF] p-4 border border-[rgba(14,18,10,0.14)]">
                      <label htmlFor="pickupTime" className="text-[11px] font-black uppercase tracking-widest text-[#312B22] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#987E63]" />
                        Customer Expected Return / Pickup Time <span className="text-xs font-normal text-[#987E63]">(Optional)</span>
                      </label>
                      <Input
                        id="pickupTime"
                        type="datetime-local"
                        className="max-w-xs"
                        value={expectedPickup}
                        onChange={(e) => setExpectedPickup(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <Button
                        type="button"
                        variant="lime"
                        size="lg"
                        onClick={handleCreateOrder}
                        disabled={creatingOrder}
                        className="min-w-[180px]"
                      >
                        {creatingOrder ? 'Creating Order...' : 'Create Order'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Register New Vehicle */
            <VehicleForm
              normalizedRegistrationNumber={searchedRegNumber}
              onVehicleSaved={handleVehicleSaved}
              onCancel={handleResetAll}
            />
          )}
        </>
      )}

      {/* Step 4: Created Order Confirmation & Phase 6 Payment Action */}
      {createdTransaction && (
        <Card className="border-2 border-[#0E120A] bg-white">
          <CardHeader className="pb-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#0E120A]">
                <CheckCircle2 className="h-6 w-6" />
                <CardTitle className="text-xl font-black text-[#0E120A]">
                  {createdTransaction.status === 'COMPLETED' ? 'Order Paid & Completed' : 'Order Created Successfully'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-widest border ${
                  createdTransaction.status === 'COMPLETED'
                    ? 'bg-[#D3FA2E] text-[#0E120A] border-[#0E120A]'
                    : 'bg-[#F4F5EF] text-[#0E120A] border-[rgba(14,18,10,0.3)]'
                }`}>
                  Status: {createdTransaction.status}
                </span>
                <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-widest border ${
                  createdTransaction.paymentStatus === 'PAID'
                    ? 'bg-[#D3FA2E] text-[#0E120A] border-[#0E120A]'
                    : 'bg-[#F4F5EF] text-[#0E120A] border-[rgba(14,18,10,0.3)]'
                }`}>
                  {createdTransaction.paymentStatus}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#F4F5EF] p-5 border border-[rgba(14,18,10,0.14)] space-y-4">
              <div className="flex items-baseline justify-between border-b border-[rgba(14,18,10,0.14)] pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">
                    Transaction Number
                  </span>
                  <span className="font-editorial text-xl font-black text-[#0E120A]">
                    {createdTransaction.transactionNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">
                    Vehicle Number
                  </span>
                  <span className="text-base font-black font-mono text-[#0E120A]">
                    {createdTransaction.vehicleSnapshot.displayRegistrationNumber}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Vehicle Category</span>
                  <span className="font-black text-sm text-[#0E120A]">
                    {createdTransaction.vehicleSnapshot.categoryName} {createdTransaction.vehicleSnapshot.variant ? `(${createdTransaction.vehicleSnapshot.variant})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Service Package</span>
                  <span className="font-black text-sm text-[#0E120A]">
                    {createdTransaction.servicePackageSnapshot.name}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63] block">Charged Amount</span>
                  <span className="font-black text-sm text-[#0E120A]">
                    ₹{createdTransaction.pricingSnapshot.actualPrice}
                  </span>
                  {createdTransaction.paymentMethod && (
                    <span className="text-xs font-black text-[#0E120A] block">
                      Paid via {createdTransaction.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              {createdTransaction.status === 'OPEN' && createdTransaction.paymentStatus !== 'PAID' ? (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="lime"
                    size="lg"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" /> Collect Payment Now (₹{createdTransaction.pricingSnapshot.actualPrice})
                  </Button>
                  {/* Phase 7: Print Order Summary for OPEN transactions (Refinement 2) */}
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setShowReceiptModal(true)}
                    className="gap-1.5"
                  >
                    <Receipt className="h-4 w-4" /> Print Order Summary
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleResetAll}>
                    Pay Later
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs text-[#0E120A] font-black flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Payment recorded successfully. Transaction completed.
                  </div>
                  {/* Phase 7: Print Receipt for COMPLETED transactions (Refinement 2) */}
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setShowReceiptModal(true)}
                    className="gap-1.5"
                  >
                    <Receipt className="h-4 w-4" /> Print Receipt
                  </Button>
                </div>
              )}

              <Button variant="ghost" onClick={handleResetAll}>
                Start New Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      {showPaymentModal && createdTransaction && user && userProfile && (
        <PaymentModal
          transaction={createdTransaction}
          staffId={user.uid}
          staffName={userProfile.displayName || user.email || 'Staff Member'}
          onPaymentSuccess={() => {
            setShowPaymentModal(false)
            setCreatedTransaction({
              ...createdTransaction,
              status: 'COMPLETED',
              paymentStatus: 'PAID',
              paidAmount: createdTransaction.pricingSnapshot.actualPrice,
            })
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Phase 7: Receipt Modal */}
      {showReceiptModal && createdTransaction && (
        <ReceiptModal
          transaction={createdTransaction}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  )
}
