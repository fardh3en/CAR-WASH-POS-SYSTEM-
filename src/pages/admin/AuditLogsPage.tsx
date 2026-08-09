import { useState, useEffect, useCallback } from 'react'
import { auditService } from '@/services/audit.service'
import { getPeriodBoundariesIST, type ReportingPeriod } from '@/utils/date.utils'
import type { AuditLogRecord, AuditEventType } from '@/types/audit.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ShieldCheck,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  UserCheck,
  FileText,
} from 'lucide-react'

const EVENT_TYPE_OPTIONS: { key: AuditEventType | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All Event Types' },
  { key: 'TRANSACTION_CANCELLED', label: 'Order Cancelled' },
  { key: 'PAYMENT_REVERSED', label: 'Payment Reversed' },
  { key: 'PRICE_CHANGED', label: 'Price Changed' },
  { key: 'SERVICE_CONFIGURATION_CHANGED', label: 'Service Config Changed' },
]

const PERIODS: { key: ReportingPeriod; label: string }[] = [
  { key: 'TODAY', label: 'Today' },
  { key: 'THIS_WEEK', label: 'This Week' },
  { key: 'THIS_MONTH', label: 'This Month' },
  { key: 'THIS_YEAR', label: 'This Year' },
  { key: 'CUSTOM', label: 'Custom Range' },
]

function formatIST(isoString: string): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  const istMs = d.getTime() + 330 * 60 * 1000
  const ist = new Date(istMs)
  const day = String(ist.getUTCDate()).padStart(2, '0')
  const month = String(ist.getUTCMonth() + 1).padStart(2, '0')
  const year = ist.getUTCFullYear()
  const hrs = String(ist.getUTCHours()).padStart(2, '0')
  const mins = String(ist.getUTCMinutes()).padStart(2, '0')
  const secs = String(ist.getUTCSeconds()).padStart(2, '0')
  return `${day}/${month}/${year} ${hrs}:${mins}:${secs}`
}

function getEventBadgeColor(type: AuditEventType): string {
  switch (type) {
    case 'TRANSACTION_CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'PAYMENT_REVERSED':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'PRICE_CHANGED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'SERVICE_CONFIGURATION_CHANGED':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function AdminAuditLogsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportingPeriod>('THIS_MONTH')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [eventTypeFilter, setEventTypeFilter] = useState<AuditEventType | 'ALL'>('ALL')

  const [logs, setLogs] = useState<AuditLogRecord[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadAuditLogs = useCallback(async () => {
    if (selectedPeriod === 'CUSTOM' && (!customFrom || !customTo)) return

    setLoading(true)
    setError(null)

    try {
      const boundaries = getPeriodBoundariesIST(
        selectedPeriod,
        customFrom || undefined,
        customTo || undefined
      )

      const result = await auditService.getAuditLogs(
        boundaries.start.toISOString(),
        boundaries.end.toISOString(),
        eventTypeFilter,
        100
      )
      setLogs(result)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
      setError('Failed to load audit trail logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, customFrom, customTo, eventTypeFilter])

  useEffect(() => {
    if (selectedPeriod !== 'CUSTOM') {
      void loadAuditLogs()
    }
  }, [selectedPeriod, eventTypeFilter, loadAuditLogs])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[hsl(var(--primary))]" />
            Audit Trail & Log Viewer
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Append-only, immutable record of sensitive operational events, cancellations, payment reversals, and price changes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadAuditLogs()}
          disabled={loading}
          className="gap-1.5 self-start sm:self-auto"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh Log
        </Button>
      </div>

      {/* Filter Controls — uses native <select> pattern */}
      <Card className="border-[hsl(var(--border))]">
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Period Selector Buttons */}
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

            {/* Event Type Filter (Native <select> pattern) */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <select
                className="h-9 px-3 rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-xs font-semibold"
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value as AuditEventType | 'ALL')}
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {selectedPeriod === 'CUSTOM' && (
            <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-[hsl(var(--border))]">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  From Date (IST)
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
                  To Date (IST)
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
                onClick={() => void loadAuditLogs()}
                disabled={!customFrom || !customTo || loading}
                className="gap-1.5"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Apply Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && logs.length === 0 && (
        <div className="flex items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-sm">Loading audit logs…</span>
        </div>
      )}

      {/* Audit Log Table */}
      {!loading && logs.length > 0 && (
        <Card className="border-[hsl(var(--border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[hsl(var(--muted))/60] border-b border-[hsl(var(--border))] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Target Reference</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))] font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[hsl(var(--muted))/30] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-[hsl(var(--muted-foreground))] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatIST(log.createdAt)}</span>
                      </div>
                    </td>

                    {/* Event Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadgeColor(
                          log.eventType
                        )}`}
                      >
                        {log.eventType}
                      </span>
                    </td>

                    {/* Target Reference */}
                    <td className="py-3 px-4 font-mono font-bold text-[hsl(var(--foreground))]">
                      {log.targetReference || log.targetDocumentId}
                    </td>

                    {/* Performed By */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                        <span>{log.performedByUserName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] font-semibold">
                          {log.performedByUserRole}
                        </span>
                      </div>
                    </td>

                    {/* Reason / Details */}
                    <td className="py-3 px-4 max-w-md">
                      {log.reason && (
                        <div className="text-[hsl(var(--foreground))] font-semibold mb-0.5">
                          "{log.reason}"
                        </div>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-[11px] text-[hsl(var(--muted-foreground))] flex flex-wrap gap-x-2 gap-y-0.5">
                          {Object.entries(log.metadata).map(([k, v]) => (
                            <span key={k}>
                              <span className="font-semibold">{k}:</span> {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && logs.length === 0 && (
        <Card className="border-[hsl(var(--border))] p-12 text-center text-[hsl(var(--muted-foreground))] space-y-2">
          <FileText className="h-8 w-8 mx-auto text-[hsl(var(--muted-foreground))]" />
          <p className="font-semibold text-base text-[hsl(var(--foreground))]">No Audit Logs Found</p>
          <p className="text-xs">No audited operations recorded for the selected period and event filter.</p>
        </Card>
      )}
    </div>
  )
}
