import type { ReportingPeriod } from '@/utils/date.utils'

export type ExportScope = 'SALES_ONLY' | 'OPERATIONAL_AUDIT'

export interface ExcelExportFilterOptions {
  period: ReportingPeriod
  customFrom?: string // YYYY-MM-DD
  customTo?: string   // YYYY-MM-DD
  categoryFilter?: string // 'ALL' or specific categoryName
  serviceFilter?: string  // 'ALL' or specific servicePackage name
  paymentMethodFilter?: string // 'ALL' | 'CASH' | 'UPI'
  exportScope?: ExportScope // Default: 'SALES_ONLY'
}

export interface SummaryRowData {
  Metric: string
  Value: string | number
}

export interface TransactionDetailRowData {
  'Date': string
  'Time': string
  'Receipt No': string
  'Registration No': string
  'Vehicle Category': string
  'Vehicle Variant': string
  'Service Package': string
  'Standard Price (INR)': number
  'Actual Price (INR)': number
  'Price Adjustment (INR)': number
  'Adjustment Reason': string
  'Payment Method': string
  'Served By': string
  'Customer Name': string
  'Customer Phone': string
  'Status'?: string // Present in Operational Audit Export
  'Cancellation Reason'?: string // Present in Operational Audit Export
}
