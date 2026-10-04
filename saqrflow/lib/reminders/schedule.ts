import { daysBetween } from '../time'

export const DEFAULT_OFFSETS = [90, 60, 30, 15, 7, 3, 1, 0]
export interface ScheduleOptions { offsets?: number[] | null; overdueEveryDays?: number; overdueMax?: number }
export interface Occurrence { key: string; kind: 'upcoming' | 'due' | 'overdue'; offset: number | null; daysRemaining: number }

/**
 * Which reminder (if any) should be sent for an item today?
 *
 * Catch-up semantics: only the *latest* threshold already crossed is returned, so an item entered
 * 10 days before expiry produces one "15 days" reminder – not 90/60/30/15 at once – and a cron that
 * missed a day still sends it. Uniqueness comes from `key` (+ due date, added by the caller), so a
 * re-run never sends twice, and a renewal (new due date) restarts the schedule.
 */
export function nextOccurrence(dueDate: string, today: string, opts: ScheduleOptions = {}): Occurrence | null {
  const offsets = [...new Set((opts.offsets?.length ? opts.offsets : DEFAULT_OFFSETS).filter(n => Number.isInteger(n) && n >= 0))].sort((a, b) => b - a)
  const remaining = daysBetween(today, dueDate)
  const every = opts.overdueEveryDays ?? 7, max = opts.overdueMax ?? 4

  if (remaining < 0) {
    const overdueDays = -remaining
    if (every > 0) {
      const k = Math.floor(overdueDays / every)
      if (k >= 1) return k <= max ? { key: `overdue:${k}`, kind: 'overdue', offset: null, daysRemaining: remaining } : null
    }
    // Between due date and first overdue reminder: the "on due date" reminder is still the latest crossed one.
    return offsets.includes(0) ? { key: 'offset:0', kind: 'due', offset: 0, daysRemaining: remaining } : null
  }
  const crossed = offsets.filter(o => o >= remaining)        // thresholds we've reached
  if (!crossed.length) return null
  const o = Math.min(...crossed)
  return { key: `offset:${o}`, kind: o === 0 ? 'due' : 'upcoming', offset: o, daysRemaining: remaining }
}

export function parseOffsets(input: string): number[] {
  return [...new Set(input.split(/[,\s]+/).map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 730))].sort((a, b) => b - a)
}
