import React, { useState, useEffect } from 'react'
import type { ServicePackage, ServiceSelectionState } from '@/types/service.types'
import type { Vehicle } from '@/types/vehicle.types'
import { servicePackageService } from '@/services/servicePackage.service'
import { pricingService } from '@/services/pricing.service'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Check, AlertTriangle, Edit3 } from 'lucide-react'

interface ServiceSelectorProps {
  vehicle: Vehicle
  categoryName: string
  onSelectionComplete: (selection: ServiceSelectionState) => void
}

export function ServiceSelector({ vehicle, categoryName, onSelectionComplete }: ServiceSelectorProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [pricesMap, setPricesMap] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState<boolean>(true)

  // Negotiated Pricing Exception State
  const [isNegotiated, setIsNegotiated] = useState<boolean>(false)
  const [actualPriceInput, setActualPriceInput] = useState<string>('')
  const [adjustmentReasonInput, setAdjustmentReasonInput] = useState<string>('')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const pkgs = await servicePackageService.getServicePackages()
        setPackages(pkgs)
        if (pkgs.length > 0) {
          setSelectedPackageId(pkgs[0].id)
        }

        // Fetch standard prices for each package based on vehicle category & variant
        const priceMap: Record<string, number | null> = {}
        for (const pkg of pkgs) {
          const price = await pricingService.getStandardPriceRule(
            vehicle.categoryId,
            pkg.id,
            vehicle.variant
          )
          priceMap[pkg.id] = price
        }
        setPricesMap(priceMap)
      } catch (err) {
        console.error('Failed to load service selection data:', err)
        setErrorMessage('Failed to load service packages or pricing rules.')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [vehicle.categoryId, vehicle.variant])

  const selectedPackage = packages.find((p) => p.id === selectedPackageId)
  const standardPrice = selectedPackageId ? pricesMap[selectedPackageId] : null
  const isConfigured = standardPrice !== null && standardPrice >= 0

  // Calculate actual price
  const parsedActualPrice = actualPriceInput !== '' ? Math.max(0, parseInt(actualPriceInput, 10) || 0) : null
  const finalActualPrice = isNegotiated ? parsedActualPrice : standardPrice

  // Calculate price adjustment difference
  const priceDifference =
    isConfigured && finalActualPrice !== null ? finalActualPrice - (standardPrice || 0) : 0

  const handleConfirmSelection = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedPackage) {
      setErrorMessage('Please select a service package.')
      return
    }

    if (!isConfigured) {
      setErrorMessage('Cannot proceed: The standard price for this package is not configured.')
      return
    }

    if (isNegotiated && (finalActualPrice === null || isNaN(finalActualPrice))) {
      setErrorMessage('Please enter a valid whole-rupee actual price.')
      return
    }

    onSelectionComplete({
      servicePackageId: selectedPackage.id,
      servicePackageName: selectedPackage.name,
      standardPrice: standardPrice,
      actualPrice: finalActualPrice,
      adjustmentReason: isNegotiated ? adjustmentReasonInput.trim() || undefined : undefined,
      isConfigured: true,
    })
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Calculating service package pricing for {categoryName}...
      </div>
    )
  }

  return (
    <form onSubmit={handleConfirmSelection} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
            Select Service Package
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Pricing calculated for {categoryName} {vehicle.variant ? `(${vehicle.variant})` : ''}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Package Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg) => {
          const price = pricesMap[pkg.id]
          const isSelected = pkg.id === selectedPackageId
          const hasPrice = price !== null && price >= 0

          return (
            <div
              key={pkg.id}
              onClick={() => {
                setSelectedPackageId(pkg.id)
                setIsNegotiated(false)
                setActualPriceInput('')
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-sm'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-base text-[hsl(var(--foreground))]">{pkg.name}</h3>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{pkg.description}</p>

                {/* Included Activities */}
                <div className="space-y-1 pt-2 border-t border-[hsl(var(--border))]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Included Activities:
                  </span>
                  <ul className="text-xs space-y-1">
                    {pkg.activities.map((act) => (
                      <li key={act} className="flex items-center gap-1.5 text-[hsl(var(--foreground))]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price Tag */}
              <div className="pt-3 border-t border-[hsl(var(--border))]">
                {hasPrice ? (
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Standard Price</span>
                    <span className="text-xl font-extrabold text-[hsl(var(--primary))]">₹{price}</span>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-red-50 border border-red-200 text-center">
                    <span className="text-xs font-bold text-red-700 block">Price not configured</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Package Summary & Negotiated Pricing Exception */}
      {selectedPackage && (
        <Card className="border-[hsl(var(--border))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selected Package: {selectedPackage.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]">
              <span className="text-sm font-medium">Standard Price</span>
              {isConfigured ? (
                <span className="text-lg font-bold">₹{standardPrice}</span>
              ) : (
                <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded uppercase">
                  Price not configured
                </span>
              )}
            </div>

            {/* Negotiated Pricing Toggle */}
            {isConfigured && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="negotiatedCheck"
                    className="h-4 w-4 rounded border-[hsl(var(--input))] text-[hsl(var(--primary))]"
                    checked={isNegotiated}
                    onChange={(e) => {
                      setIsNegotiated(e.target.checked)
                      if (e.target.checked && standardPrice !== null) {
                        setActualPriceInput(String(standardPrice))
                      }
                    }}
                  />
                  <label htmlFor="negotiatedCheck" className="text-xs font-semibold cursor-pointer flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                    Record Negotiated Price / Price Adjustment Exception
                  </label>
                </div>

                {isNegotiated && (
                  <div className="p-4 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="actualPriceInput" className="text-xs font-semibold uppercase tracking-wider block">
                          Actual Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="actualPriceInput"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 450"
                          value={actualPriceInput}
                          onChange={(e) => setActualPriceInput(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="reasonInput" className="text-xs font-semibold uppercase tracking-wider block">
                          Adjustment Reason <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">(Optional)</span>
                        </label>
                        <Input
                          id="reasonInput"
                          type="text"
                          placeholder="e.g. Special vehicle condition, fleet agreement..."
                          value={adjustmentReasonInput}
                          onChange={(e) => setAdjustmentReasonInput(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Price Difference Indicator */}
                    {priceDifference !== 0 && (
                      <div className="flex items-center justify-between text-xs p-2 rounded bg-[hsl(var(--secondary))]">
                        <span>Price Adjustment Difference:</span>
                        <span className={`font-bold ${priceDifference < 0 ? 'text-green-600' : 'text-amber-600'}`}>
                          {priceDifference > 0 ? `+₹${priceDifference}` : `-₹${Math.abs(priceDifference)}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <Button type="submit" variant="default" size="lg" disabled={!isConfigured}>
                {isConfigured ? 'Confirm Service Selection' : 'Price Not Configured'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
