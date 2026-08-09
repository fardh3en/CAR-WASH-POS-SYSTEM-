import React, { useState, useEffect } from 'react'
import type { VehicleCategory, ServicePackage, PricingRule } from '@/types'
import { vehicleCategoryService } from '@/services/vehicleCategory.service'
import { servicePackageService } from '@/services/servicePackage.service'
import { pricingService, generatePricingRuleId } from '@/services/pricing.service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, Edit2, AlertCircle } from 'lucide-react'

interface PricingRowItem {
  categoryId: string
  categoryName: string
  variant?: string
  displayName: string
}

export function AdminPricingPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>([])
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Editing Modal / Cell state
  const [editingItem, setEditingItem] = useState<{
    categoryId: string
    variant?: string
    servicePackageId: string
    currentPrice: number | null
    displayName: string
    packageName: string
  } | null>(null)

  const [inputPrice, setInputPrice] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadPricingData()
  }, [])

  async function loadPricingData() {
    setLoading(true)
    try {
      const [cats, pkgs, rls] = await Promise.all([
        vehicleCategoryService.getVehicleCategories(),
        servicePackageService.getServicePackages(),
        pricingService.getAllPricingRules(),
      ])
      setCategories(cats)
      setPackages(pkgs)
      setRules(rls)
    } catch (err) {
      console.error('Failed to load pricing matrix data:', err)
      setErrorMessage('Failed to load pricing matrix.')
    } finally {
      setLoading(false)
    }
  }

  // Construct table rows (including variants)
  const pricingRows: PricingRowItem[] = []
  categories.forEach((cat) => {
    if (cat.variants && cat.variants.length > 0) {
      cat.variants.forEach((v) => {
        pricingRows.push({
          categoryId: cat.id,
          categoryName: cat.name,
          variant: v,
          displayName: `${cat.name} (${v})`,
        })
      })
    } else {
      pricingRows.push({
        categoryId: cat.id,
        categoryName: cat.name,
        displayName: cat.name,
      })
    }
  })

  const getPrice = (categoryId: string, servicePackageId: string, variant?: string): number | null => {
    const ruleId = generatePricingRuleId(categoryId, servicePackageId, variant)
    const match = rules.find((r) => r.id === ruleId)
    if (match && typeof match.price === 'number' && match.price >= 0) {
      return match.price
    }
    return null
  }

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    setErrorMessage(null)

    const parsedPrice = parseInt(inputPrice, 10)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Please enter a valid non-negative whole-rupee price.')
      return
    }

    setSaving(true)
    try {
      await pricingService.setStandardPriceRule(
        editingItem.categoryId,
        editingItem.servicePackageId,
        parsedPrice,
        editingItem.variant
      )
      await loadPricingData()
      setEditingItem(null)
    } catch (err) {
      console.error('Failed to save price rule:', err)
      setErrorMessage('Failed to update price rule.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Standard Pricing Matrix</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Configure standard prices (INR ₹) per Vehicle Category & Service Package. Changes apply to future transactions only.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5 text-[hsl(var(--primary))]" />
            Pricing Matrix Grid
          </CardTitle>
          <CardDescription>
            Click edit on any cell to configure or update standard pricing. Unconfigured prices display "Not Configured".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-6">
              Loading pricing matrix...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                    <th className="p-3 font-bold text-xs uppercase tracking-wider text-[hsl(var(--foreground))]">
                      Vehicle Category / Variant
                    </th>
                    {packages.map((pkg) => (
                      <th
                        key={pkg.id}
                        className="p-3 font-bold text-xs uppercase tracking-wider text-center text-[hsl(var(--foreground))]"
                      >
                        {pkg.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {pricingRows.map((row) => (
                    <tr key={`${row.categoryId}_${row.variant || 'base'}`} className="hover:bg-[hsl(var(--accent))]/40">
                      <td className="p-3 font-medium text-[hsl(var(--foreground))]">{row.displayName}</td>
                      {packages.map((pkg) => {
                        const price = getPrice(row.categoryId, pkg.id, row.variant)
                        const isConfigured = price !== null

                        return (
                          <td key={pkg.id} className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem({
                                  categoryId: row.categoryId,
                                  variant: row.variant,
                                  servicePackageId: pkg.id,
                                  currentPrice: price,
                                  displayName: row.displayName,
                                  packageName: pkg.name,
                                })
                                setInputPrice(price !== null ? String(price) : '')
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                                isConfigured
                                  ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]'
                                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              <span>{isConfigured ? `₹${price}` : 'Not Configured'}</span>
                              <Edit2 className="h-3 w-3 opacity-60" />
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full shadow-xl border-[hsl(var(--border))]">
            <CardHeader>
              <CardTitle className="text-lg">Update Standard Price</CardTitle>
              <CardDescription className="text-xs">
                {editingItem.displayName} &mdash; <span className="font-semibold">{editingItem.packageName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePrice} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="priceModalInput" className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                    Standard Price (INR ₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-sm text-[hsl(var(--muted-foreground))]">₹</span>
                    <Input
                      id="priceModalInput"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 500"
                      className="pl-8 text-base font-bold"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    Enter whole rupees (e.g. 250, 500, 750). Price changes apply to future transactions only.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingItem(null)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Price'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
