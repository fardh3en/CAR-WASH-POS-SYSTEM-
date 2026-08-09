/**
 * Excel Export Service — Phase 9
 *
 * Generates native client-side binary spreadsheets (.xlsx) from authoritative
 * Firestore transactions using SheetJS (xlsx).
 *
 * ARCHITECTURAL CONSTRAINTS:
 * 1. Historical data is sourced STRICTLY from immutable transaction snapshots:
 *    - vehicleSnapshot (registration, category, variant)
 *    - servicePackageSnapshot (name)
 *    - pricingSnapshot (standardPrice, actualPrice, priceAdjustment, adjustmentReason)
 *    - staffSnapshot (staffName)
 *    - customerSnapshot (name, phoneNumber)
 *    Current configuration collections are NEVER queried for historical sales data.
 *
 * 2. COMPLETED Sales Export includes ONLY:
 *    status === 'COMPLETED' && paymentStatus === 'PAID'
 *    CANCELLED and OPEN/UNPAID transactions are strictly excluded from sales exports.
 *
 * 3. Separate Operational Audit Export for OPEN / CANCELLED orders.
 *
 * 4. Mandatory Terminology Compliance:
 *    - Standard Price, Actual Price, Price Adjustment, Adjustment Reason, Total Sales
 *    - ZERO occurrences of "Discount" or "Profit".
 *
 * 5. Native binary .xlsx generation with zero server-side dependencies.
 */

import * as XLSX from 'xlsx'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Transaction } from '@/types/transaction.types'
import type { ExcelExportFilterOptions } from '@/types/excel.types'
import { getPeriodBoundariesIST } from '@/utils/date.utils'

const TRANSACTIONS_COLLECTION = 'transactions'
const IST_OFFSET_MINUTES = 330 // UTC+5:30

/** Format ISO timestamp into IST date string DD/MM/YYYY */
function formatISTDate(isoString: string): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  const istMs = d.getTime() + IST_OFFSET_MINUTES * 60 * 1000
  const ist = new Date(istMs)
  const day = String(ist.getUTCDate()).padStart(2, '0')
  const month = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const year = ist.getUTCFullYear()
  return `${day}/${month}/${year}`
}

/** Format ISO timestamp into IST 24-hour time string HH:mm:ss */
function formatISTTime(isoString: string): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  const istMs = d.getTime() + IST_OFFSET_MINUTES * 60 * 1000
  const ist = new Date(istMs)
  const hrs = String(ist.getUTCHours()).padStart(2, '0')
  const mins = String(ist.getUTCMinutes()).padStart(2, '0')
  const secs = String(ist.getUTCSeconds()).padStart(2, '0')
  return `${hrs}:${mins}:${secs}`
}

/** Generate filename according to System Architecture §15.14 specifications */
function generateFilename(options: ExcelExportFilterOptions, start: Date): string {
  const { period, customFrom, customTo, exportScope } = options

  // Format start date as YYYY-MM-DD in IST
  const istMs = start.getTime() + IST_OFFSET_MINUTES * 60 * 1000
  const ist = new Date(istMs)
  const yyyy = ist.getUTCFullYear()
  const mm = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(ist.getUTCDate()).padStart(2, '0')

  if (exportScope === 'OPERATIONAL_AUDIT') {
    return `Operational_Audit_${yyyy}-${mm}-${dd}.xlsx`
  }

  switch (period) {
    case 'TODAY':
      return `Daily_Sales_${yyyy}-${mm}-${dd}.xlsx`

    case 'THIS_WEEK': {
      // Calculate ISO week number
      const target = new Date(ist.valueOf())
      const dayNr = (ist.getUTCDay() + 6) % 7
      target.setUTCDate(target.getUTCDate() - dayNr + 3)
      const firstThursday = target.valueOf()
      target.setUTCMonth(0, 1)
      if (target.getUTCDay() !== 4) {
        target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7))
      }
      const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / 604800000)
      const ww = String(weekNumber).padStart(2, '0')
      return `Weekly_Sales_${yyyy}-W${ww}.xlsx`
    }

    case 'THIS_MONTH':
      return `Monthly_Sales_${yyyy}-${mm}.xlsx`

    case 'THIS_YEAR':
      return `Yearly_Sales_${yyyy}.xlsx`

    case 'CUSTOM':
      return `Custom_Sales_${customFrom || yyyy + '-' + mm + '-' + dd}_to_${customTo || yyyy + '-' + mm + '-' + dd}.xlsx`

    default:
      return `Sales_Export_${yyyy}-${mm}-${dd}.xlsx`
  }
}

export const excelService = {
  /**
   * Primary Export Method: Queries completed transactions from Firestore,
   * applies combined filters, formats immutable snapshot data, and triggers
   * client-side native .xlsx file download.
   */
  async exportSalesReport(options: ExcelExportFilterOptions): Promise<{
    success: boolean
    message?: string
    recordCount: number
  }> {
    const scope = options.exportScope || 'SALES_ONLY'
    const boundaries = getPeriodBoundariesIST(
      options.period,
      options.customFrom,
      options.customTo
    )

    const startIso = boundaries.start.toISOString()
    const endIso = boundaries.end.toISOString()

    // -------------------------------------------------------------------------
    // 1. Fetch transactions from Firestore for the IST period
    // -------------------------------------------------------------------------
    let rawDocs: Transaction[] = []

    if (scope === 'SALES_ONLY') {
      // Sales report: query COMPLETED status
      const txQuery = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('status', '==', 'COMPLETED'),
        where('createdAt', '>=', startIso),
        where('createdAt', '<', endIso)
      )
      const snap = await getDocs(txQuery)
      snap.forEach((d) => {
        const data = d.data() as Transaction
        // Dual guard: must be COMPLETED + PAID
        if (data.status === 'COMPLETED' && data.paymentStatus === 'PAID') {
          rawDocs.push({ ...data, id: d.id })
        }
      })
    } else {
      // Operational Audit Export: fetch OPEN or CANCELLED orders
      const txQuery = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('createdAt', '>=', startIso),
        where('createdAt', '<', endIso)
      )
      const snap = await getDocs(txQuery)
      snap.forEach((d) => {
        const data = d.data() as Transaction
        // Include non-completed or cancelled orders
        if (data.status === 'OPEN' || data.status === 'CANCELLED') {
          rawDocs.push({ ...data, id: d.id })
        }
      })
    }

    // Sort by createdAt ascending
    rawDocs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    // -------------------------------------------------------------------------
    // 2. Apply combined pre-export filters (Category, Service, Payment Method)
    // -------------------------------------------------------------------------
    const filteredDocs = rawDocs.filter((tx) => {
      // Vehicle Category filter
      if (
        options.categoryFilter &&
        options.categoryFilter !== 'ALL' &&
        tx.vehicleSnapshot.categoryName !== options.categoryFilter
      ) {
        return false
      }

      // Service Package filter
      if (
        options.serviceFilter &&
        options.serviceFilter !== 'ALL' &&
        tx.servicePackageSnapshot.name !== options.serviceFilter
      ) {
        return false
      }

      // Payment Method filter
      if (
        options.paymentMethodFilter &&
        options.paymentMethodFilter !== 'ALL' &&
        tx.paymentMethod !== options.paymentMethodFilter
      ) {
        return false
      }

      return true
    })

    // Handle empty record match
    if (filteredDocs.length === 0) {
      return {
        success: false,
        message: 'No records found matching the selected export criteria.',
        recordCount: 0,
      }
    }

    // -------------------------------------------------------------------------
    // 3. Build Executive Summary Worksheet Data
    // -------------------------------------------------------------------------
    let totalSales = 0
    let cashSales = 0
    let upiSales = 0
    let cashCount = 0
    let upiCount = 0
    let adjustedCount = 0
    let totalAdjustmentAmount = 0

    const serviceMap = new Map<string, { count: number; totalSales: number }>()
    const categoryMap = new Map<string, { count: number; totalSales: number }>()

    for (const tx of filteredDocs) {
      const actual = tx.pricingSnapshot.actualPrice
      totalSales += actual

      if (tx.paymentMethod === 'CASH') {
        cashSales += tx.paidAmount || actual
        cashCount++
      } else if (tx.paymentMethod === 'UPI') {
        upiSales += tx.paidAmount || actual
        upiCount++
      }

      if (tx.pricingSnapshot.priceAdjustment !== 0) {
        adjustedCount++
        totalAdjustmentAmount += tx.pricingSnapshot.priceAdjustment
      }

      // Service Package distribution from snapshot
      const svcName = tx.servicePackageSnapshot.name
      const svcCurr = serviceMap.get(svcName) || { count: 0, totalSales: 0 }
      serviceMap.set(svcName, {
        count: svcCurr.count + 1,
        totalSales: svcCurr.totalSales + actual,
      })

      // Vehicle Category distribution from snapshot
      const catName = tx.vehicleSnapshot.categoryName
      const catCurr = categoryMap.get(catName) || { count: 0, totalSales: 0 }
      categoryMap.set(catName, {
        count: catCurr.count + 1,
        totalSales: catCurr.totalSales + actual,
      })
    }

    const totalVehicles = filteredDocs.length
    const avgValue = totalVehicles > 0 ? Math.round(totalSales / totalVehicles) : 0

    // Construct Summary Sheet rows (AOA = Array of Arrays)
    const summaryRows: (string | number)[][] = [
      ['MR. WASH — CAR WASH POS'],
      [scope === 'SALES_ONLY' ? 'COMPLETED SALES REPORT' : 'OPERATIONAL AUDIT REPORT'],
      ['Period Scope:', boundaries.label],
      ['Generated At (IST):', `${formatISTDate(new Date().toISOString())} ${formatISTTime(new Date().toISOString())}`],
      [''],
      ['EXECUTIVE SUMMARY KEY METRICS'],
      ['Total Vehicles Serviced', totalVehicles],
      ['Total Sales (INR ₹)', totalSales],
      ['Cash Sales Total (INR ₹)', cashSales],
      ['Cash Transactions Count', cashCount],
      ['UPI Sales Total (INR ₹)', upiSales],
      ['UPI Transactions Count', upiCount],
      ['Average Transaction Value (INR ₹)', avgValue],
      ['Price Adjustments Count', adjustedCount],
      ['Total Adjustment Amount (INR ₹)', totalAdjustmentAmount],
      [''],
      ['SERVICE PACKAGE BREAKDOWN'],
      ['Package Name', 'Vehicle Count', 'Total Sales (INR ₹)'],
    ]

    serviceMap.forEach((val, name) => {
      summaryRows.push([name, val.count, val.totalSales])
    })

    summaryRows.push([''])
    summaryRows.push(['VEHICLE CATEGORY BREAKDOWN'])
    summaryRows.push(['Category Name', 'Vehicle Count', 'Total Sales (INR ₹)'])

    categoryMap.forEach((val, name) => {
      summaryRows.push([name, val.count, val.totalSales])
    })

    // -------------------------------------------------------------------------
    // 4. Build Transaction Details Worksheet Data
    // -------------------------------------------------------------------------
    const detailHeaders = scope === 'SALES_ONLY'
      ? [
          'Date',
          'Time (IST)',
          'Receipt No',
          'Registration No',
          'Vehicle Category',
          'Vehicle Variant',
          'Service Package',
          'Standard Price (INR)',
          'Actual Price (INR)',
          'Price Adjustment (INR)',
          'Adjustment Reason',
          'Payment Method',
          'Served By',
          'Customer Name',
          'Customer Phone',
        ]
      : [
          'Date',
          'Time (IST)',
          'Receipt No',
          'Registration No',
          'Vehicle Category',
          'Vehicle Variant',
          'Service Package',
          'Standard Price (INR)',
          'Actual Price (INR)',
          'Price Adjustment (INR)',
          'Adjustment Reason',
          'Payment Method',
          'Status',
          'Cancellation Reason',
          'Served By',
          'Customer Name',
          'Customer Phone',
        ]

    const detailRows: (string | number)[][] = [detailHeaders]

    for (const tx of filteredDocs) {
      const row = scope === 'SALES_ONLY'
        ? [
            formatISTDate(tx.vehicleArrivedAt || tx.createdAt),
            formatISTTime(tx.vehicleArrivedAt || tx.createdAt),
            tx.transactionNumber,
            tx.vehicleSnapshot.displayRegistrationNumber || tx.vehicleSnapshot.registrationNumber,
            tx.vehicleSnapshot.categoryName,
            tx.vehicleSnapshot.variant || '—',
            tx.servicePackageSnapshot.name,
            tx.pricingSnapshot.standardPrice,
            tx.pricingSnapshot.actualPrice,
            tx.pricingSnapshot.priceAdjustment,
            tx.pricingSnapshot.adjustmentReason || '—',
            tx.paymentMethod || 'UNPAID',
            tx.staffSnapshot.staffName,
            tx.customerSnapshot.name || 'N/A',
            tx.customerSnapshot.phoneNumber || 'N/A',
          ]
        : [
            formatISTDate(tx.vehicleArrivedAt || tx.createdAt),
            formatISTTime(tx.vehicleArrivedAt || tx.createdAt),
            tx.transactionNumber,
            tx.vehicleSnapshot.displayRegistrationNumber || tx.vehicleSnapshot.registrationNumber,
            tx.vehicleSnapshot.categoryName,
            tx.vehicleSnapshot.variant || '—',
            tx.servicePackageSnapshot.name,
            tx.pricingSnapshot.standardPrice,
            tx.pricingSnapshot.actualPrice,
            tx.pricingSnapshot.priceAdjustment,
            tx.pricingSnapshot.adjustmentReason || '—',
            tx.paymentMethod || 'UNPAID',
            tx.status,
            tx.cancellationReason || '—',
            tx.staffSnapshot.staffName,
            tx.customerSnapshot.name || 'N/A',
            tx.customerSnapshot.phoneNumber || 'N/A',
          ]

      detailRows.push(row)
    }

    // -------------------------------------------------------------------------
    // 5. Generate SheetJS Workbook & Worksheets
    // -------------------------------------------------------------------------
    const wb = XLSX.utils.book_new()

    // Sheet 1: Executive Summary
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 20 }, { wch: 22 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary')

    // Sheet 2: Transaction Details
    const wsDetails = XLSX.utils.aoa_to_sheet(detailRows)
    wsDetails['!cols'] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 20 }, // Receipt No
      { wch: 16 }, // Reg No
      { wch: 16 }, // Category
      { wch: 14 }, // Variant
      { wch: 18 }, // Service Package
      { wch: 20 }, // Standard Price
      { wch: 18 }, // Actual Price
      { wch: 22 }, // Price Adjustment
      { wch: 24 }, // Adjustment Reason
      { wch: 16 }, // Payment Method
      { wch: 16 }, // Served By
      { wch: 18 }, // Customer Name
      { wch: 18 }, // Customer Phone
    ]
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Transaction Details')

    // -------------------------------------------------------------------------
    // 6. Trigger Browser Native File Download
    // -------------------------------------------------------------------------
    const filename = generateFilename(options, boundaries.start)
    XLSX.writeFile(wb, filename)

    return {
      success: true,
      message: `Exported ${filteredDocs.length} transaction records to ${filename}`,
      recordCount: filteredDocs.length,
    }
  },
}
