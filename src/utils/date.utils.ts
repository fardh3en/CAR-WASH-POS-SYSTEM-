/**
 * IST Date Boundary Utilities
 *
 * All reporting period boundaries are calculated in Indian Standard Time (IST, UTC+5:30).
 * Queries use:  createdAt >= periodStart  (inclusive)
 *               createdAt <  periodEnd    (exclusive)
 *
 * This ensures calendar-correct day/week/month/year alignment in IST
 * regardless of the server or client's local timezone.
 */

const IST_OFFSET_MINUTES = 330 // UTC+5:30

/**
 * Returns a Date representing the start of the given UTC date-like value in IST.
 * "Start of day in IST" = midnight IST = (midnight IST expressed as UTC).
 *
 * @param year  IST calendar year
 * @param month IST calendar month (0-indexed, JS convention)
 * @param day   IST calendar day
 * @returns UTC Date equivalent to 00:00:00 IST on that day
 */
function istMidnight(year: number, month: number, day: number): Date {
  // Construct midnight IST as an ISO string and parse to UTC Date
  const pad = (n: number) => String(n).padStart(2, '0')
  const monthStr = pad(month + 1)
  const dayStr = pad(day)
  // "+05:30" suffix makes the JS Date parser interpret this as IST
  return new Date(`${year}-${monthStr}-${dayStr}T00:00:00+05:30`)
}

/**
 * Returns current date and time expressed in IST calendar components.
 */
function nowInIST(): { year: number; month: number; day: number; dayOfWeek: number } {
  const now = new Date()
  // Shift by IST offset to get IST "local" time from UTC
  const istMs = now.getTime() + IST_OFFSET_MINUTES * 60 * 1000
  const istDate = new Date(istMs)
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),      // 0-indexed
    day: istDate.getUTCDate(),
    dayOfWeek: istDate.getUTCDay(),    // 0=Sunday
  }
}

export type ReportingPeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'

export interface PeriodBoundaries {
  start: Date  // inclusive (createdAt >= start.toISOString())
  end: Date    // exclusive (createdAt <  end.toISOString())
  label: string
}

/**
 * Compute IST-correct period boundaries for the given reporting period.
 *
 * For CUSTOM, customFrom and customTo must be provided as YYYY-MM-DD strings.
 * customTo is treated as inclusive (end = customTo + 1 day midnight IST).
 */
export function getPeriodBoundariesIST(
  period: ReportingPeriod,
  customFrom?: string,  // YYYY-MM-DD
  customTo?: string     // YYYY-MM-DD (inclusive)
): PeriodBoundaries {
  const { year, month, day, dayOfWeek } = nowInIST()

  switch (period) {
    case 'TODAY': {
      const start = istMidnight(year, month, day)
      const end = istMidnight(year, month, day + 1)
      return { start, end, label: `Today (${new Date().toLocaleDateString('en-IN')})` }
    }

    case 'THIS_WEEK': {
      // Monday = start of week. dayOfWeek: 0=Sun,1=Mon,...,6=Sat
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const start = istMidnight(year, month, day - daysFromMonday)
      const end = istMidnight(year, month, day - daysFromMonday + 7)
      return { start, end, label: 'This Week' }
    }

    case 'THIS_MONTH': {
      const start = istMidnight(year, month, 1)
      const end = istMidnight(year, month + 1, 1)  // JS Date handles month overflow
      const monthName = new Date(year, month, 1).toLocaleString('en-IN', { month: 'long' })
      return { start, end, label: `${monthName} ${year}` }
    }

    case 'THIS_YEAR': {
      const start = istMidnight(year, 0, 1)
      const end = istMidnight(year + 1, 0, 1)
      return { start, end, label: `Year ${year}` }
    }

    case 'CUSTOM': {
      if (!customFrom || !customTo) {
        throw new Error('customFrom and customTo are required for CUSTOM period.')
      }
      const [fy, fm, fd] = customFrom.split('-').map(Number)
      const [ty, tm, td] = customTo.split('-').map(Number)
      const start = istMidnight(fy, fm - 1, fd)   // months are 0-indexed in istMidnight
      const end = istMidnight(ty, tm - 1, td + 1) // exclusive: to-date + 1 day
      return {
        start,
        end,
        label: `${customFrom} to ${customTo}`,
      }
    }

    default: {
      const _exhaustive: never = period
      throw new Error(`Unknown reporting period: ${String(_exhaustive)}`)
    }
  }
}
