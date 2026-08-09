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
import { analyticsService } from '@/services/analytics.service'
import {
  getPeriodBoundariesIST,
  type ReportingPeriod,
} from '@/utils/date.utils'
import type { AnalyticsResult } from '@/types/analytics.types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Car,
  IndianRupee,
  Banknote,
  QrCode,
  TrendingUp,
  BarChart2,
  Users,
  AlertCircle,
  RefreshCw,
  Loader2,
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

// ---------------------------------------------------------------------------
// Small reusable KPI card
// ---------------------------------------------------------------------------
function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="border-[hsl(var(--border))]">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              {label}
            </span>
            <span className="text-2xl font-extrabold text-[hsl(var(--foreground))] truncate">
              {value}
            </span>
            {sub && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</span>
            )}
          </div>
          <div className="shrink-0 text-[hsl(var(--primary))] mt-0.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

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
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriod>('TODAY')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Business analytics computed from completed transactions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadAnalytics()}
          disabled={loading}
          className="gap-1.5 self-start sm:self-auto"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="border-[hsl(var(--border))]">
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
                <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
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
                <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
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

      {/* Error State */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !analytics && (
        <div className="flex items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-sm">Computing analytics…</span>
        </div>
      )}

      {/* Analytics Content */}
      {analytics && !loading && (
        <>
          {/* Period Label */}
          <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            {analytics.periodLabel}
          </div>

          {/* KPI Cards — mirrors System Architecture §13.4 example layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={<Car className="h-5 w-5" />}
              label="Vehicles Serviced"
              value={String(analytics.totalVehicles)}
            />
            <KpiCard
              icon={<IndianRupee className="h-5 w-5" />}
              label="Total Sales"
              value={formatINR(analytics.totalSales)}
              sub={
                analytics.totalVehicles > 0
                  ? `Avg ${formatINR(analytics.averageTransactionValue)} / vehicle`
                  : undefined
              }
            />
            <KpiCard
              icon={<Banknote className="h-5 w-5" />}
              label="Cash"
              value={formatINR(analytics.cashSales)}
              sub={`${analytics.cashCount} transaction${analytics.cashCount !== 1 ? 's' : ''}`}
            />
            <KpiCard
              icon={<QrCode className="h-5 w-5" />}
              label="UPI"
              value={formatINR(analytics.upiSales)}
              sub={`${analytics.upiCount} transaction${analytics.upiCount !== 1 ? 's' : ''}`}
            />
          </div>

          {/* Secondary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Avg Transaction Value"
              value={analytics.totalVehicles > 0 ? formatINR(analytics.averageTransactionValue) : '—'}
            />
            <KpiCard
              icon={<Users className="h-5 w-5" />}
              label="New Vehicles"
              value={String(analytics.newVehicles)}
              sub={`${analytics.returningVehicles} returning`}
            />
            <KpiCard
              icon={<BarChart2 className="h-5 w-5" />}
              label="Price Adjustments"
              value={String(analytics.adjustedTransactionCount)}
              sub={
                analytics.adjustedTransactionCount > 0
                  ? `Total: ${formatINR(analytics.totalAdjustmentAmount)}`
                  : 'None this period'
              }
            />
          </div>

          {/* Daily Sales Trend — hidden for Today (single-point, no trend) */}
          {analytics.dailyTrend.length > 1 && (
            <Card className="border-[hsl(var(--border))]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={analytics.dailyTrend}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Service Package Distribution */}
          {analytics.serviceDistribution.length > 0 && (
            <Card className="border-[hsl(var(--border))]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Service Package Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.serviceDistribution.map((svc) => (
                    <div key={svc.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">{svc.name}</span>
                        <span className="text-[hsl(var(--muted-foreground))]">
                          {svc.count} vehicle{svc.count !== 1 ? 's' : ''} · {formatINR(svc.totalSales)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{
                            width: `${analytics.totalVehicles > 0 ? Math.round((svc.count / analytics.totalVehicles) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
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
            <Card className="border-[hsl(var(--border))]">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                      width={90}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        String(name) === 'totalSales' ? formatINR(Number(value || 0)) : Number(value || 0),
                        String(name) === 'totalSales' ? 'Total Sales' : 'Vehicles',
                      ]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      name="Vehicles"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment Split */}
          <Card className="border-[hsl(var(--border))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Method Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Cash */}
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-green-700">
                    Cash
                  </div>
                  <div className="text-xl font-extrabold text-green-800">
                    {formatINR(analytics.cashSales)}
                  </div>
                  <div className="text-xs text-green-600">
                    {analytics.cashCount} transaction{analytics.cashCount !== 1 ? 's' : ''}
                    {analytics.totalVehicles > 0 && (
                      <span className="ml-1">
                        ({Math.round((analytics.cashCount / analytics.totalVehicles) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                {/* UPI */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    UPI
                  </div>
                  <div className="text-xl font-extrabold text-blue-800">
                    {formatINR(analytics.upiSales)}
                  </div>
                  <div className="text-xs text-blue-600">
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

          {/* Price Adjustment Summary — uses "Price Adjustment" terminology, never "Discount" */}
          {analytics.adjustedTransactionCount > 0 && (
            <Card className="border-[hsl(var(--border))] border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Price Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider font-semibold mb-1">
                      Adjusted Transactions
                    </div>
                    <div className="text-xl font-extrabold">
                      {analytics.adjustedTransactionCount}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      {analytics.totalVehicles > 0
                        ? `${Math.round((analytics.adjustedTransactionCount / analytics.totalVehicles) * 100)}% of total`
                        : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-wider font-semibold mb-1">
                      Total Price Adjustment
                    </div>
                    <div
                      className={`text-xl font-extrabold ${
                        analytics.totalAdjustmentAmount < 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {analytics.totalAdjustmentAmount >= 0 ? '+' : ''}
                      {formatINR(analytics.totalAdjustmentAmount)}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      vs. standard prices
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {analytics.totalVehicles === 0 && (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))] text-sm">
              No completed transactions found for this period.
            </div>
          )}
        </>
      )}
    </div>
  )
}
