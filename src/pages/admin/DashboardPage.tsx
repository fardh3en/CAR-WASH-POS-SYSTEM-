import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { analyticsService } from '@/services/analytics.service'
import { excelService } from '@/services/excel.service'
import { mockDataService } from '@/services/mockData.service'
import {
  getPeriodBoundariesIST,
  type ReportingPeriod,
} from '@/utils/date.utils'
import type { AnalyticsResult } from '@/types/analytics.types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  AlertCircle,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  X,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Check,
  BarChart2,
  Sparkles,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Period selector configuration
// ---------------------------------------------------------------------------
const PERIODS: { key: ReportingPeriod; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'THIS_WEEK', label: 'This Week' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: 'THIS_YEAR', label: 'This Year' },
  { key: 'CUSTOM', label: 'Custom Range' },
]

// Modal popup types
type ActiveModalType = 'COMPARISON' | 'FLEET' | 'PAYMENTS' | 'ATV' | null

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------
function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------
export function AdminDashboardPage() {
  const { user, userProfile } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriod>('TODAY')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [activeModal, setActiveModal] = useState<ActiveModalType>(null)
  const [exporting, setExporting] = useState<boolean>(false)
  const [generatingMock, setGeneratingMock] = useState<boolean>(false)
  const [mockProgress, setMockProgress] = useState<string>('')
  const [mockSuccessMsg, setMockSuccessMsg] = useState<string | null>(null)

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleGenerateMockData = async () => {
    if (!user || !userProfile) {
      setError('Active administrator session required to generate demo data.')
      return
    }
    setGeneratingMock(true)
    setError(null)
    setMockSuccessMsg(null)
    setMockProgress('Starting...')
    try {
      const res = await mockDataService.generateDemoSalesData(
        {
          staffId: user.uid,
          staffName: userProfile.displayName || user.email || 'Admin Staff',
          staffEmail: user.email || 'admin@mrwash.com',
        },
        (current, total) => {
          setMockProgress(`${current}/${total}`)
        }
      )
      if (res.success) {
        setMockSuccessMsg(res.message)
        await loadAnalytics()
      } else {
        setError('Failed to generate mock transactions.')
      }
    } catch (err: unknown) {
      console.error('Mock data generation failed:', err)
      const msg = err instanceof Error ? err.message : 'Error generating demo transactions.'
      setError(msg)
    } finally {
      setGeneratingMock(false)
      setMockProgress('')
    }
  }

  const handleExportExcel = async () => {
    if (selectedPeriod === 'CUSTOM' && (!customFrom || !customTo)) return
    setExporting(true)
    setError(null)
    try {
      const res = await excelService.exportSalesReport({
        period: selectedPeriod,
        customFrom: customFrom || undefined,
        customTo: customTo || undefined,
        exportScope: 'SALES_ONLY',
      })
      if (!res.success) {
        setError(res.message || 'Export failed.')
      }
    } catch (err) {
      console.error('Excel Export Error from Dashboard:', err)
      setError('Failed to generate Excel export.')
    } finally {
      setExporting(false)
    }
  }

  const loadAnalytics = useCallback(async () => {
    if (selectedPeriod === 'CUSTOM' && (!customFrom || !customTo)) return

    setLoading(true)
    setError(null)

    try {
      const boundaries = getPeriodBoundariesIST(
        selectedPeriod,
        customFrom || undefined,
        customTo || undefined
      )
      const result = await analyticsService.getAnalytics(
        boundaries.start,
        boundaries.end,
        boundaries.label
      )
      setAnalytics(result)
    } catch (err) {
      console.error('Analytics load failed:', err)
      setError('Failed to load analytics. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, customFrom, customTo])

  useEffect(() => {
    if (selectedPeriod !== 'CUSTOM') {
      void loadAnalytics()
    }
  }, [selectedPeriod, loadAnalytics])

  // Categorize fleet for quick summary
  const getFleetBreakdown = () => {
    if (!analytics) return { cars: 0, bikes: 0, commercial: 0, carsList: [], bikesList: [], commercialList: [] }

    let cars = 0
    let bikes = 0
    let commercial = 0

    const carsList: { name: string; count: number; totalSales: number }[] = []
    const bikesList: { name: string; count: number; totalSales: number }[] = []
    const commercialList: { name: string; count: number; totalSales: number }[] = []

    for (const item of analytics.categoryDistribution) {
      const lower = item.name.toLowerCase()
      if (lower.includes('scooter') || lower.includes('bike') || lower.includes('bullet')) {
        bikes += item.count
        bikesList.push(item)
      } else if (
        lower.includes('auto') ||
        lower.includes('traveller') ||
        lower.includes('pickup') ||
        lower.includes('dost') ||
        lower.includes('ace')
      ) {
        commercial += item.count
        commercialList.push(item)
      } else {
        cars += item.count
        carsList.push(item)
      }
    }

    return { cars, bikes, commercial, carsList, bikesList, commercialList }
  }

  const fleet = getFleetBreakdown()

  const cashSales = analytics?.cashSales ?? 0
  const upiSales = analytics?.upiSales ?? 0
  const totalPayments = cashSales + upiSales
  const upiPercent = totalPayments > 0 ? Math.round((upiSales / totalPayments) * 100) : 0
  const cashPercent = totalPayments > 0 ? 100 - upiPercent : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-editorial text-3xl font-black text-[#0E120A] tracking-tighter">Admin Dashboard</h1>
          <p className="text-xs font-semibold text-[#312B22] mt-1">
            Authoritative business analytics computed directly from completed transactions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            variant="default"
            size="sm"
            onClick={() => void handleGenerateMockData()}
            disabled={generatingMock || loading}
            className="gap-1.5 bg-[#0E120A] text-[#D3FA2E] hover:bg-[#1a2014] border border-[#0E120A]"
          >
            {generatingMock ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {generatingMock ? `Generating (${mockProgress})...` : 'Generate Demo Data'}
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={() => void handleExportExcel()}
            disabled={exporting || loading}
            className="gap-1.5"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5" />
            )}
            Export to Excel (.xlsx)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.key}
                variant={selectedPeriod === p.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(p.key)}
                className="text-xs"
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range Inputs */}
          {selectedPeriod === 'CUSTOM' && (
            <div className="flex flex-wrap items-end gap-3 mt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                  From
                </label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-40 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                  To
                </label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-40 text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={() => void loadAnalytics()}
                disabled={!customFrom || !customTo || loading}
                className="gap-1.5"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Apply
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Helper Hint */}
      <p className="text-xs text-[#312B22] flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5 shrink-0 text-[#987E63]" />
        <span>Tap any metric card below to open its detailed breakdown popup. Tap outside to close.</span>
      </p>

      {/* Success State for Demo Data */}
      {mockSuccessMsg && (
        <div className="p-3.5 bg-[#D3FA2E]/20 border-2 border-[#0E120A] text-[#0E120A] text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-[#0E120A]" />
            <span>{mockSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setMockSuccessMsg(null)}
            className="text-xs font-black uppercase tracking-wider underline hover:text-[#312B22]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !analytics && (
        <div className="flex items-center justify-center py-16 text-[#312B22]">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-sm font-semibold">Computing analytics…</span>
        </div>
      )}

      {/* Analytics Content */}
      {analytics && !loading && (
        <>
          {/* Period Label */}
          <div className="text-xs font-black text-[#987E63] uppercase tracking-widest">
            {analytics.periodLabel}
          </div>

          {/* Interactive KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. TOTAL SALES CARD */}
            <div
              onClick={() => setActiveModal('COMPARISON')}
              className="editorial-card-interactive h-48 flex flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                  {selectedPeriod === 'TODAY' ? "Today's Total Sales" : 'Total Sales'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0E120A] uppercase tracking-wider">
                  Compare
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <div className="font-editorial text-3xl font-black text-[#0E120A] tracking-tighter">
                  {formatINR(analytics.totalSales)}
                </div>
                {analytics.yesterdayComparison ? (
                  <div className="mt-2 text-xs flex items-center gap-1 font-bold">
                    {analytics.yesterdayComparison.differenceSales >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#0E120A]" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                    )}
                    <span className="text-[#312B22]">
                      {analytics.yesterdayComparison.percentGrowth >= 0 ? '+' : ''}
                      {analytics.yesterdayComparison.percentGrowth}% vs Yesterday
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-[#312B22] font-semibold">
                    {analytics.totalVehicles} completed transactions
                  </div>
                )}
              </div>
            </div>

            {/* 2. TOTAL SERVICED CARD */}
            <div
              onClick={() => setActiveModal('FLEET')}
              className="editorial-card-interactive h-48 flex flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                  Total Serviced
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0E120A] uppercase tracking-wider">
                  Fleet
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <div className="font-editorial text-3xl font-black text-[#0E120A] tracking-tighter">
                  {analytics.totalVehicles} <span className="text-xl">Vehicles</span>
                </div>
                <div className="mt-2 text-xs text-[#312B22] font-semibold truncate">
                  {fleet.cars} Cars · {fleet.bikes} Bikes · {fleet.commercial} Commercial
                </div>
              </div>
            </div>

            {/* 3. PAYMENT MODE SPLIT CARD */}
            <div
              onClick={() => setActiveModal('PAYMENTS')}
              className="editorial-card-interactive h-48 flex flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                  Payment Split
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0E120A] uppercase tracking-wider">
                  Analysis
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              <div>
                <div className="font-editorial text-3xl font-black text-[#0E120A] tracking-tighter">
                  {upiPercent >= cashPercent ? `${upiPercent}% UPI` : `${cashPercent}% Cash`}
                </div>
                <div className="mt-2 text-xs text-[#312B22] font-semibold flex items-center justify-between">
                  <span>UPI: {formatINR(analytics.upiSales)}</span>
                  <span>Cash: {formatINR(analytics.cashSales)}</span>
                </div>
              </div>
            </div>

            {/* 4. AVERAGE TRANSACTION VALUE CARD */}
            <div
              onClick={() => setActiveModal('ATV')}
              className="editorial-card-interactive h-48 flex flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                  Avg Transaction
                </span>
                <span className="text-[11px] font-black text-[#0E120A] uppercase tracking-wider">
                  Formula ⓘ
                </span>
              </div>
              <div>
                <div className="font-editorial text-3xl font-black text-[#0E120A] tracking-tighter">
                  {analytics.totalVehicles > 0 ? formatINR(analytics.averageTransactionValue) : '—'}
                </div>
                <div className="mt-2 text-xs text-[#312B22] font-semibold truncate">
                  {formatINR(analytics.totalSales)} ÷ {analytics.totalVehicles} Orders
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Operational Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                    New Customers
                  </span>
                  <div className="text-xl font-black mt-0.5 text-[#0E120A]">{analytics.newVehicles}</div>
                  <span className="text-xs text-[#312B22] font-semibold">{analytics.returningVehicles} returning</span>
                </div>
                <Users className="h-6 w-6 text-[#987E63] shrink-0 opacity-80" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                    Price Adjustments
                  </span>
                  <div className="text-xl font-black mt-0.5 text-[#0E120A]">{analytics.adjustedTransactionCount}</div>
                  <span className="text-xs text-[#312B22] font-semibold">
                    {analytics.adjustedTransactionCount > 0 ? formatINR(analytics.totalAdjustmentAmount) : 'None this period'}
                  </span>
                </div>
                <BarChart2 className="h-6 w-6 text-[#987E63] shrink-0 opacity-80" />
              </CardContent>
            </Card>

            <Card className="col-span-2 lg:col-span-1">
              <CardContent className="pt-4 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#987E63]">
                    Audit Status
                  </span>
                  <div className="text-xl font-black text-[#0E120A] mt-0.5">Immutable</div>
                  <span className="text-xs text-[#312B22] font-semibold">100% Server Timestamps</span>
                </div>
                <Check className="h-6 w-6 text-[#0E120A] shrink-0 opacity-80" />
              </CardContent>
            </Card>
          </div>

          {/* Daily Sales Trend — hidden for Today (single point, no trend) */}
          {analytics.dailyTrend.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analytics.dailyTrend}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,18,10,0.14)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatINR(Number(value || 0)), 'Total Sales']}
                      contentStyle={{
                        fontSize: 12,
                        border: '1px solid #0E120A',
                        borderRadius: 0,
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#D3FA2E"
                      radius={[0, 0, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Service Package Distribution */}
          {analytics.serviceDistribution.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Service Package Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.serviceDistribution.map((svc) => (
                    <div key={svc.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-black text-[#0E120A]">{svc.name}</span>
                        <span className="text-[#312B22] font-semibold">
                          {svc.count} vehicle{svc.count !== 1 ? 's' : ''} · {formatINR(svc.totalSales)}
                        </span>
                      </div>
                      <div className="h-2 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] overflow-hidden">
                        <div
                          className="h-full bg-[#D3FA2E]"
                          style={{
                            width: `${analytics.totalVehicles > 0 ? Math.round((svc.count / analytics.totalVehicles) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-[#312B22] font-semibold">
                        {analytics.totalVehicles > 0
                          ? `${Math.round((svc.count / analytics.totalVehicles) * 100)}% of vehicles`
                          : '0%'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Category Distribution */}
          {analytics.categoryDistribution.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Vehicle Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analytics.categoryDistribution}
                    layout="vertical"
                    margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,18,10,0.14)" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        String(name) === 'totalSales' ? formatINR(Number(value || 0)) : Number(value || 0),
                        String(name) === 'totalSales' ? 'Total Sales' : 'Vehicles',
                      ]}
                      contentStyle={{
                        fontSize: 12,
                        border: '1px solid #0E120A',
                        borderRadius: 0,
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#D3FA2E"
                      radius={[0, 0, 0, 0]}
                      name="Vehicles"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment Split Detailed Cards */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Method Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Cash */}
                <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-[#312B22]">
                    Cash
                  </div>
                  <div className="text-xl font-black text-[#0E120A]">
                    {formatINR(analytics.cashSales)}
                  </div>
                  <div className="text-xs text-[#312B22] font-semibold">
                    {analytics.cashCount} transaction{analytics.cashCount !== 1 ? 's' : ''}
                    {analytics.totalVehicles > 0 && (
                      <span className="ml-1">
                        ({Math.round((analytics.cashCount / analytics.totalVehicles) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                {/* UPI */}
                <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-[#312B22]">
                    UPI
                  </div>
                  <div className="text-xl font-black text-[#0E120A]">
                    {formatINR(analytics.upiSales)}
                  </div>
                  <div className="text-xs text-[#312B22] font-semibold">
                    {analytics.upiCount} transaction{analytics.upiCount !== 1 ? 's' : ''}
                    {analytics.totalVehicles > 0 && (
                      <span className="ml-1">
                        ({Math.round((analytics.upiCount / analytics.totalVehicles) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty state */}
          {analytics.totalVehicles === 0 && (
            <div className="text-center py-12 text-[#312B22] text-sm font-semibold">
              No completed transactions found for this period.
            </div>
          )}
        </>
      )}

      {/* =====================================================================
          INTERACTIVE POPUP MODALS
          Dismiss on click outside (backdrop) or on close button
          ===================================================================== */}

      {/* 1. SALES COMPARISON MODAL */}
      {activeModal === 'COMPARISON' && analytics && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#0E120A] max-w-md w-full shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-lg font-black text-[#0E120A] tracking-tight">
                  Sales Comparison (IST)
                </h3>
                <p className="text-xs text-[#312B22] font-semibold">
                  Day-over-day operational growth
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#312B22] hover:text-[#0E120A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)]">
                <span className="text-[11px] font-black text-[#987E63] uppercase tracking-widest block">
                  Today's Sales
                </span>
                <span className="text-xl font-black text-[#0E120A] mt-1 block">
                  {formatINR(analytics.totalSales)}
                </span>
                <span className="text-xs text-[#312B22] font-semibold mt-1 block">
                  {analytics.totalVehicles} Completed Orders
                </span>
              </div>

              <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)]">
                <span className="text-[11px] font-black text-[#987E63] uppercase tracking-widest block">
                  Yesterday
                </span>
                <span className="text-xl font-black text-[#0E120A] mt-1 block">
                  {formatINR(analytics.yesterdayComparison?.yesterdaySales ?? 0)}
                </span>
                <span className="text-xs text-[#312B22] font-semibold mt-1 block">
                  {analytics.yesterdayComparison?.yesterdayVehicles ?? 0} Completed Orders
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#D3FA2E] border-2 border-[#0E120A]">
              <span className="text-xs font-black text-[#0E120A] block">
                {analytics.yesterdayComparison && analytics.yesterdayComparison.differenceSales >= 0
                  ? `Net Increase: +${formatINR(analytics.yesterdayComparison.differenceSales)} (+${analytics.yesterdayComparison.percentGrowth}%)`
                  : `Net Variance: ${formatINR(analytics.yesterdayComparison?.differenceSales ?? 0)}`}
              </span>
              <p className="text-xs text-[#0E120A] font-semibold mt-1">
                Your service bay serviced {analytics.yesterdayComparison?.differenceVehicles ?? 0} vehicle variance compared to yesterday's closing numbers.
              </p>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              className="w-full"
            >
              Close Comparison
            </Button>
          </div>
        </div>
      )}

      {/* 2. FLEET BREAKDOWN MODAL */}
      {activeModal === 'FLEET' && analytics && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#0E120A] max-w-md w-full shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-lg font-black text-[#0E120A] tracking-tight">
                  Vehicles Breakdown ({analytics.totalVehicles} Total)
                </h3>
                <p className="text-xs text-[#312B22] font-semibold">
                  Fleet distribution across all classifications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#312B22] hover:text-[#0E120A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {/* Cars */}
              <div className="p-3.5 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[#0E120A]">
                    Cars ({fleet.cars} Total)
                  </span>
                  <span className="text-xs font-black text-[#312B22]">
                    {formatINR(fleet.carsList.reduce((acc, c) => acc + c.totalSales, 0))} Sales
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[#312B22]">
                  {fleet.carsList.map((c) => (
                    <div key={c.name} className="truncate">
                      • {c.name}: <span className="font-black">{c.count}</span>
                    </div>
                  ))}
                  {fleet.carsList.length === 0 && <span className="text-[#987E63]">No cars serviced</span>}
                </div>
              </div>

              {/* Two-Wheelers */}
              <div className="p-3.5 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[#0E120A]">
                    Two-Wheelers / Bikes ({fleet.bikes} Total)
                  </span>
                  <span className="text-xs font-black text-[#312B22]">
                    {formatINR(fleet.bikesList.reduce((acc, b) => acc + b.totalSales, 0))} Sales
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[#312B22]">
                  {fleet.bikesList.map((b) => (
                    <div key={b.name} className="truncate">
                      • {b.name}: <span className="font-black">{b.count}</span>
                    </div>
                  ))}
                  {fleet.bikesList.length === 0 && <span className="text-[#987E63]">No bikes serviced</span>}
                </div>
              </div>

              {/* Commercial / Others */}
              <div className="p-3.5 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-[#0E120A]">
                    Commercial / Auto ({fleet.commercial} Total)
                  </span>
                  <span className="text-xs font-black text-[#312B22]">
                    {formatINR(fleet.commercialList.reduce((acc, a) => acc + a.totalSales, 0))} Sales
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-[#312B22]">
                  {fleet.commercialList.map((a) => (
                    <div key={a.name} className="truncate">
                      • {a.name}: <span className="font-black">{a.count}</span>
                    </div>
                  ))}
                  {fleet.commercialList.length === 0 && <span className="text-[#987E63]">No commercial vehicles</span>}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* 3. PAYMENT MODE ANALYSIS MODAL */}
      {activeModal === 'PAYMENTS' && analytics && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#0E120A] max-w-md w-full shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-lg font-black text-[#0E120A] tracking-tight">
                  Payment Mode Analysis
                </h3>
                <p className="text-xs text-[#312B22] font-semibold">
                  Authoritative collection reconciliation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#312B22] hover:text-[#0E120A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* UPI */}
              <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#312B22]">
                    <span className="h-2 w-2 rounded-full bg-[#0E120A] shrink-0" />
                    UPI Collections
                  </div>
                  <div className="font-editorial text-2xl font-black text-[#0E120A] mt-1">
                    {formatINR(analytics.upiSales)}
                  </div>
                  <div className="text-xs text-[#312B22] font-semibold mt-0.5">
                    {analytics.upiCount} Successful Transactions
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-editorial text-2xl font-black text-[#0E120A]">
                    {upiPercent}.0%
                  </span>
                  <span className="text-[11px] text-[#312B22] font-semibold block">of total sales</span>
                </div>
              </div>

              {/* Cash */}
              <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#312B22]">
                    <span className="h-2 w-2 rounded-full bg-[#312B22] shrink-0" />
                    Cash Collections
                  </div>
                  <div className="font-editorial text-2xl font-black text-[#0E120A] mt-1">
                    {formatINR(analytics.cashSales)}
                  </div>
                  <div className="text-xs text-[#312B22] font-semibold mt-0.5">
                    {analytics.cashCount} Successful Transactions
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-editorial text-2xl font-black text-[#0E120A]">
                    {cashPercent}.0%
                  </span>
                  <span className="text-[11px] text-[#312B22] font-semibold block">of total sales</span>
                </div>
              </div>

              {/* Reconciled Total */}
              <div className="p-3.5 bg-[#D3FA2E] border-2 border-[#0E120A] flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-[#0E120A]">
                  Total Sales Reconciled
                </span>
                <span className="text-base font-black text-[#0E120A]">
                  {formatINR(analytics.totalSales)} ({analytics.totalVehicles} Orders)
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              className="w-full"
            >
              Close Analysis
            </Button>
          </div>
        </div>
      )}

      {/* 4. AVERAGE TRANSACTION VALUE MODAL */}
      {activeModal === 'ATV' && analytics && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-[#0E120A] max-w-md w-full shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-lg font-black text-[#0E120A] tracking-tight">
                  Average Transaction Value (ATV)
                </h3>
                <p className="text-xs text-[#312B22] font-semibold">
                  Key Revenue Metric Definition
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#312B22] hover:text-[#0E120A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#312B22] font-semibold">
              Average Transaction Value (ATV) measures the average amount collected per completed vehicle wash.
            </p>

            <div className="p-4 bg-[#F4F5EF] border border-[rgba(14,18,10,0.14)] text-center space-y-1">
              <span className="text-[11px] font-black text-[#987E63] uppercase tracking-widest block">
                ATV Formula
              </span>
              <div className="text-base font-mono font-black text-[#0E120A]">
                Total Sales ÷ Completed Orders
              </div>
              <div className="text-xs font-mono text-[#312B22] font-semibold pt-1">
                {formatINR(analytics.totalSales)} ÷ {analytics.totalVehicles} Orders = {formatINR(analytics.averageTransactionValue)} per vehicle
              </div>
            </div>

            <div className="p-3.5 bg-[#D3FA2E] border-2 border-[#0E120A] space-y-1">
              <span className="text-xs font-black text-[#0E120A] block">
                Business Purpose:
              </span>
              <p className="text-xs text-[#0E120A] font-semibold leading-relaxed">
                Helps evaluate upsells (getting cars to upgrade from Body Wash to Full Wash & Detail) without solely relying on increasing vehicle queue volume.
              </p>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={() => setActiveModal(null)}
              className="w-full"
            >
              Got It
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
