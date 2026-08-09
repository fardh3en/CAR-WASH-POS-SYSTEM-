/**
 * Analytics Service — Phase 8
 *
 * Computes all Admin Dashboard metrics client-side from authoritative
 * Firestore `transactions` collection. No aggregation collection is used.
 *
 * FILTERING RULE (verified against actual transaction.types.ts):
 *   TransactionStatus = 'OPEN' | 'CANCELLED' | 'COMPLETED'
 *   PaymentStatus     = 'UNPAID' | 'PAID'
 *
 *   Firestore query: status == 'COMPLETED'  (indexed via firestore.indexes.json)
 *   Client guard:    paymentStatus === 'PAID'  (double-check after fetch)
 *
 * Both conditions must be satisfied for a transaction to appear in any metric.
 *
 * CANCELLED and OPEN transactions contribute ₹0 and 0 vehicles to all metrics.
 *
 * IST boundary rules (Correction 2):
 *   createdAt >= start.toISOString()   (inclusive)
 *   createdAt <  end.toISOString()     (exclusive)
 */

import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Transaction } from '@/types/transaction.types'
import type {
  AnalyticsResult,
  ServiceDistributionItem,
  CategoryDistributionItem,
  DailyTrendPoint,
} from '@/types/analytics.types'

const TRANSACTIONS_COLLECTION = 'transactions'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Format an ISO date string into the IST day label appropriate for the period */
function getTrendLabel(
  isoDate: string,
  granularity: 'day-of-week' | 'day-of-month' | 'month'
): string {
  // Parse to IST date components
  const date = new Date(isoDate)
  const istMs = date.getTime() + 330 * 60 * 1000
  const ist = new Date(istMs)

  if (granularity === 'day-of-week') {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][ist.getUTCDay()]
  }
  if (granularity === 'day-of-month') {
    return String(ist.getUTCDate()).padStart(2, '0')
  }
  // month
  return [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][ist.getUTCMonth()]
}

/** Select trend grouping granularity based on period duration in days */
function selectGranularity(
  start: Date,
  end: Date
): 'day-of-week' | 'day-of-month' | 'month' {
  const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 7) return 'day-of-week'
  if (days <= 31) return 'day-of-month'
  return 'month'
}

/** Build ordered trend points from a completed transaction set */
function buildDailyTrend(
  transactions: Transaction[],
  start: Date,
  end: Date
): DailyTrendPoint[] {
  const granularity = selectGranularity(start, end)
  const map = new Map<string, { sales: number; vehicles: number }>()

  for (const tx of transactions) {
    const label = getTrendLabel(tx.createdAt, granularity)
    const existing = map.get(label) ?? { sales: 0, vehicles: 0 }
    map.set(label, {
      sales: existing.sales + tx.pricingSnapshot.actualPrice,
      vehicles: existing.vehicles + 1,
    })
  }

  // Build ordered list
  const points: DailyTrendPoint[] = []

  if (granularity === 'day-of-week') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for (const d of days) {
      const v = map.get(d) ?? { sales: 0, vehicles: 0 }
      points.push({ label: d, ...v })
    }
  } else if (granularity === 'day-of-month') {
    // 1–31 in order
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    for (let i = 0; i < totalDays; i++) {
      const dayNum = String(
        new Date(start.getTime() + i * 24 * 60 * 60 * 1000 + 330 * 60 * 1000)
          .getUTCDate()
      ).padStart(2, '0')
      const v = map.get(dayNum) ?? { sales: 0, vehicles: 0 }
      points.push({ label: dayNum, ...v })
    }
  } else {
    // months Jan–Dec
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    for (const m of months) {
      const v = map.get(m) ?? { sales: 0, vehicles: 0 }
      points.push({ label: m, ...v })
    }
  }

  return points
}

// ---------------------------------------------------------------------------
// New vs Returning: Deduplicated vehicle history lookups (Correction 3)
// ---------------------------------------------------------------------------

/**
 * Given a set of unique vehicle registration numbers (already deduplicated),
 * determine which are "new" (no prior COMPLETED transaction before periodStart)
 * and which are "returning".
 *
 * One Firestore query per unique registration — never per transaction row.
 * No analytics collection is created.
 */
async function classifyVehicles(
  uniqueRegistrations: string[],
  periodStart: Date
): Promise<{ newVehicles: number; returningVehicles: number }> {
  const startIso = periodStart.toISOString()
  let newVehicles = 0
  let returningVehicles = 0

  for (const reg of uniqueRegistrations) {
    const priorQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('vehicleSnapshot.registrationNumber', '==', reg),
      where('status', '==', 'COMPLETED'),
      where('createdAt', '<', startIso),
      limit(1)
    )
    const snap = await getDocs(priorQuery)
    if (snap.empty) {
      newVehicles++
    } else {
      returningVehicles++
    }
  }

  return { newVehicles, returningVehicles }
}

// ---------------------------------------------------------------------------
// Main analytics function
// ---------------------------------------------------------------------------

export const analyticsService = {
  /**
   * Compute all Phase 8 analytics metrics for the given IST period boundaries.
   *
   * @param start  Inclusive period start (00:00 IST expressed as UTC Date)
   * @param end    Exclusive period end   (00:00 IST next boundary expressed as UTC Date)
   * @param periodLabel Human-readable label for the period
   */
  async getAnalytics(
    start: Date,
    end: Date,
    periodLabel: string
  ): Promise<AnalyticsResult> {
    const startIso = start.toISOString()
    const endIso = end.toISOString()

    // -------------------------------------------------------------------------
    // 1. Fetch COMPLETED transactions within the IST period boundary
    //    Firestore query uses the composite index: status + createdAt
    // -------------------------------------------------------------------------
    const txQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('status', '==', 'COMPLETED'),
      where('createdAt', '>=', startIso),
      where('createdAt', '<', endIso)
    )

    const snapshot = await getDocs(txQuery)

    // -------------------------------------------------------------------------
    // 2. Client-side COMPLETED + PAID guard (Correction verified against types)
    //    TransactionStatus: 'OPEN' | 'CANCELLED' | 'COMPLETED'
    //    PaymentStatus:     'UNPAID' | 'PAID'
    //    Both must be satisfied.
    // -------------------------------------------------------------------------
    const transactions: Transaction[] = []
    snapshot.forEach((doc) => {
      const data = doc.data() as Transaction
      // Guard: only include COMPLETED transactions that are also PAID
      if (data.status === 'COMPLETED' && data.paymentStatus === 'PAID') {
        transactions.push({ ...data, id: doc.id })
      }
    })

    // -------------------------------------------------------------------------
    // 3. Single-pass metric computation
    // -------------------------------------------------------------------------
    let totalSales = 0
    let cashSales = 0
    let upiSales = 0
    let cashCount = 0
    let upiCount = 0
    let adjustedTransactionCount = 0
    let totalAdjustmentAmount = 0

    const serviceSalesMap = new Map<string, { count: number; totalSales: number }>()
    const categorySalesMap = new Map<string, { count: number; totalSales: number }>()
    const registrationSet = new Set<string>()

    for (const tx of transactions) {
      const actualPrice = tx.pricingSnapshot.actualPrice

      totalSales += actualPrice

      if (tx.paymentMethod === 'CASH') {
        cashSales += tx.paidAmount
        cashCount++
      } else if (tx.paymentMethod === 'UPI') {
        upiSales += tx.paidAmount
        upiCount++
      }

      // Service distribution
      const svcName = tx.servicePackageSnapshot.name
      const svc = serviceSalesMap.get(svcName) ?? { count: 0, totalSales: 0 }
      serviceSalesMap.set(svcName, {
        count: svc.count + 1,
        totalSales: svc.totalSales + actualPrice,
      })

      // Category distribution
      const catName = tx.vehicleSnapshot.categoryName
      const cat = categorySalesMap.get(catName) ?? { count: 0, totalSales: 0 }
      categorySalesMap.set(catName, {
        count: cat.count + 1,
        totalSales: cat.totalSales + actualPrice,
      })

      // Price adjustment analysis (priceAdjustment = actualPrice - standardPrice)
      if (tx.pricingSnapshot.priceAdjustment !== 0) {
        adjustedTransactionCount++
        totalAdjustmentAmount += tx.pricingSnapshot.priceAdjustment
      }

      // Collect unique registration numbers (deduplicated by Set)
      registrationSet.add(tx.vehicleSnapshot.registrationNumber)
    }

    const totalVehicles = transactions.length
    const averageTransactionValue =
      totalVehicles > 0 ? Math.round(totalSales / totalVehicles) : 0

    // -------------------------------------------------------------------------
    // 4. Distribution arrays (sorted by count descending)
    // -------------------------------------------------------------------------
    const serviceDistribution: ServiceDistributionItem[] = Array.from(
      serviceSalesMap.entries()
    )
      .map(([name, v]) => ({ name, count: v.count, totalSales: v.totalSales }))
      .sort((a, b) => b.count - a.count)

    const categoryDistribution: CategoryDistributionItem[] = Array.from(
      categorySalesMap.entries()
    )
      .map(([name, v]) => ({ name, count: v.count, totalSales: v.totalSales }))
      .sort((a, b) => b.count - a.count)

    // -------------------------------------------------------------------------
    // 5. New vs Returning vehicles
    //    Deduplicated: one lookup per unique registration (Correction 3)
    // -------------------------------------------------------------------------
    const uniqueRegistrations = Array.from(registrationSet)
    const { newVehicles, returningVehicles } =
      uniqueRegistrations.length > 0
        ? await classifyVehicles(uniqueRegistrations, start)
        : { newVehicles: 0, returningVehicles: 0 }

    // -------------------------------------------------------------------------
    // 6. Daily trend for charting
    // -------------------------------------------------------------------------
    const dailyTrend: DailyTrendPoint[] = buildDailyTrend(transactions, start, end)

    return {
      periodLabel,
      totalVehicles,
      totalSales,
      cashSales,
      upiSales,
      cashCount,
      upiCount,
      averageTransactionValue,
      serviceDistribution,
      categoryDistribution,
      newVehicles,
      returningVehicles,
      adjustedTransactionCount,
      totalAdjustmentAmount,
      dailyTrend,
    }
  },
}
