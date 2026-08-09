import { useState, useEffect } from 'react'
import { excelService } from '@/services/excel.service'
import { vehicleCategoryService } from '@/services/vehicleCategory.service'
import type { VehicleCategory } from '@/types/vehicle.types'
import type { ReportingPeriod } from '@/utils/date.utils'
import type { ExportScope } from '@/types/excel.types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileCheck,
  ShieldAlert,
} from 'lucide-react'

const PERIODS: { key: ReportingPeriod; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'THIS_WEEK', label: 'This Week' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: 'THIS_YEAR', label: 'This Year' },
  { key: 'CUSTOM', label: 'Custom Range' },
]

export function AdminReportsPage() {
  // Export Scope
  const [exportScope, setExportScope] = useState<ExportScope>('SALES_ONLY')

  // Period State
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriod>('TODAY')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [serviceFilter, setServiceFilter] = useState<string>('ALL')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL')

  // Loaded Categories (for category filter dropdown)
  const [categories, setCategories] = useState<VehicleCategory[]>([])

  // Export State
  const [exporting, setExporting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const list = await vehicleCategoryService.getVehicleCategories()
      setCategories(list)
    } catch (err) {
      console.error('Failed to load vehicle categories for report filter:', err)
    }
  }

  const handleExport = async (
    overridePeriod?: ReportingPeriod,
    overrideFrom?: string,
    overrideTo?: string,
    overrideScope?: ExportScope
  ) => {
    const period = overridePeriod || selectedPeriod
    const from = overrideFrom || customFrom
    const to = overrideTo || customTo
    const scope = overrideScope || exportScope

    if (period === 'CUSTOM' && (!from || !to)) {
      setErrorMessage('Please select both From and To dates for custom date range.')
      return
    }

    setExporting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const result = await excelService.exportSalesReport({
        period,
        customFrom: from || undefined,
        customTo: to || undefined,
        categoryFilter: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        serviceFilter: serviceFilter !== 'ALL' ? serviceFilter : undefined,
        paymentMethodFilter: paymentMethodFilter !== 'ALL' ? paymentMethodFilter : undefined,
        exportScope: scope,
      })

      if (result.success) {
        setSuccessMessage(result.message || `Export complete (${result.recordCount} records).`)
      } else {
        setErrorMessage(result.message || 'Export failed.')
      }
    } catch (err) {
      console.error('Excel Export Error:', err)
      setErrorMessage('Failed to generate Excel report. Please check network connection.')
    } finally {
      setExporting(false)
    }
  }

  // Calculate Yesterday's date string YYYY-MM-DD for preset
  const getYesterdayDateString = (): string => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Excel Export Hub</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Generate, filter, and download native Excel spreadsheets (.xlsx) derived from authoritative transaction snapshots
        </p>
      </div>

      {/* Quick Export Presets */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-[hsl(var(--primary))]" />
            Quick Export Presets (Daily Sales MVP)
          </CardTitle>
          <CardDescription>
            One-click Excel sales report generation for common daily and monthly periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => void handleExport('TODAY', undefined, undefined, 'SALES_ONLY')}
              disabled={exporting}
              className="gap-1.5 font-semibold bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Export Today's Sales (.xlsx)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const yest = getYesterdayDateString()
                void handleExport('CUSTOM', yest, yest, 'SALES_ONLY')
              }}
              disabled={exporting}
              className="gap-1.5"
            >
              <Calendar className="h-4 w-4" />
              Export Yesterday's Sales
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleExport('THIS_MONTH', undefined, undefined, 'SALES_ONLY')}
              disabled={exporting}
              className="gap-1.5"
            >
              <FileCheck className="h-4 w-4" />
              Export This Month's Sales
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Notifications */}
      {successMessage && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Custom Filtered Export Configurator */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4 text-[hsl(var(--primary))]" />
            Custom Report & Filter Configurator
          </CardTitle>
          <CardDescription>
            Configure scope, IST date boundaries, and combined vehicle/service/payment filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Export Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
              Report Scope
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={exportScope === 'SALES_ONLY' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportScope('SALES_ONLY')}
                className="text-xs gap-1.5"
              >
                <FileCheck className="h-3.5 w-3.5" />
                Completed Sales Export (COMPLETED + PAID)
              </Button>
              <Button
                type="button"
                variant={exportScope === 'OPERATIONAL_AUDIT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setExportScope('OPERATIONAL_AUDIT')}
                className="text-xs gap-1.5 border-amber-300 hover:bg-amber-50 text-amber-900"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                Operational Audit Export (OPEN / CANCELLED)
              </Button>
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {exportScope === 'SALES_ONLY'
                ? 'Primary Sales Export: Includes only COMPLETED and PAID transactions. Unpaid and cancelled orders are excluded.'
                : 'Operational Audit Export: Includes OPEN (unpaid) and CANCELLED transactions for operational audit purposes.'}
            </p>
          </div>

          {/* Period Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
              Reporting Period (IST)
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <Button
                  key={p.key}
                  type="button"
                  variant={selectedPeriod === p.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(p.key)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {selectedPeriod === 'CUSTOM' && (
            <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-[hsl(var(--muted))/50] border border-[hsl(var(--border))]">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                  From Date (IST)
                </label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-44 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
                  To Date (IST, Inclusive)
                </label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-44 text-sm"
                />
              </div>
            </div>
          )}

          {/* Combinable Filters (Native <select> elements per Section 30 correction) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
              Combined Pre-Export Filters
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Vehicle Category Filter */}
              <div className="space-y-1">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] block font-medium">
                  Vehicle Category
                </span>
                <select
                  className="w-full h-9 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-xs font-semibold"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {/* Common standard fallback categories */}
                  {!categories.some((c) => c.name === 'Hatchback') && <option value="Hatchback">Hatchback</option>}
                  {!categories.some((c) => c.name === 'Sedan') && <option value="Sedan">Sedan</option>}
                  {!categories.some((c) => c.name === 'SUV') && <option value="SUV">SUV</option>}
                  {!categories.some((c) => c.name === 'Luxury / Large') && <option value="Luxury / Large">Luxury / Large</option>}
                </select>
              </div>

              {/* Service Package Filter */}
              <div className="space-y-1">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] block font-medium">
                  Service Package
                </span>
                <select
                  className="w-full h-9 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-xs font-semibold"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="ALL">All Packages</option>
                  <option value="Body Wash">Body Wash</option>
                  <option value="Body & Vacuum">Body & Vacuum</option>
                  <option value="Full Wash">Full Wash</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-1">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))] block font-medium">
                  Payment Method
                </span>
                <select
                  className="w-full h-9 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-xs font-semibold"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                >
                  <option value="ALL">All Methods</option>
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-[hsl(var(--border))] flex justify-end">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={() => void handleExport()}
              disabled={exporting}
              className="gap-2 font-bold bg-green-600 hover:bg-green-700"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Excel (.xlsx)…
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-5 w-5" />
                  Generate & Download Excel Report (.xlsx)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
