/**
 * Analytics result types for Phase 8 — Admin Dashboard & Analytics.
 *
 * Terminology rules (Business Specification compliance):
 * - "totalSales" is used for sum of actual prices — never "revenue"
 * - System Architecture §13.14: the system must not describe totals as "profit"
 */

export interface ServiceDistributionItem {
  /** Service package name: 'Body Wash' | 'Body & Vacuum' | 'Full Wash' */
  name: string
  /** Number of COMPLETED transactions for this service in the period */
  count: number
  /** Sum of pricingSnapshot.actualPrice for this service (NOT called "revenue") */
  totalSales: number
}

export interface CategoryDistributionItem {
  /** vehicleSnapshot.categoryName value */
  name: string
  /** Number of COMPLETED transactions for this category in the period */
  count: number
  /** Sum of pricingSnapshot.actualPrice for this category (NOT called "revenue") */
  totalSales: number
}

export interface DailyTrendPoint {
  /**
   * Human-readable period label:
   * - Today view: single point, label = HH:00 or "Today"
   * - Week view: 'Mon' | 'Tue' | ... | 'Sun'
   * - Month view: '01' | '02' | ... | '31'
   * - Year view: 'Jan' | 'Feb' | ... | 'Dec'
   * - Custom: date string
   */
  label: string
  /** Total actualPrice for completed transactions in this sub-period */
  sales: number
  /** Count of completed transactions in this sub-period */
  vehicles: number
}

export interface AnalyticsResult {
  /** Human-readable period label, e.g. "Today (09/08/2026)" or "August 2026" */
  periodLabel: string

  // --- Core KPI Metrics ---
  /** Count of COMPLETED+PAID transactions in period */
  totalVehicles: number
  /** Sum of pricingSnapshot.actualPrice for COMPLETED+PAID transactions */
  totalSales: number
  /** Sum of paidAmount where paymentMethod === 'CASH' */
  cashSales: number
  /** Sum of paidAmount where paymentMethod === 'UPI' */
  upiSales: number
  /** Count of CASH transactions */
  cashCount: number
  /** Count of UPI transactions */
  upiCount: number
  /** totalSales / totalVehicles; 0 when no transactions */
  averageTransactionValue: number

  // --- Distribution Breakdowns ---
  serviceDistribution: ServiceDistributionItem[]
  categoryDistribution: CategoryDistributionItem[]

  // --- New vs Returning Vehicles ---
  /** Unique vehicles with NO prior COMPLETED transaction before period start */
  newVehicles: number
  /** Unique vehicles with at least one COMPLETED transaction before period start */
  returningVehicles: number

  // --- Price Adjustment Analysis ---
  /** Count of transactions where priceAdjustment !== 0 */
  adjustedTransactionCount: number
  /** Sum of priceAdjustment values (can be negative if reductions) */
  totalAdjustmentAmount: number

  // --- Trend Data ---
  /** Grouped sales trend for charting (daily/weekly/monthly granularity) */
  dailyTrend: DailyTrendPoint[]
}
