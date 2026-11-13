import { CalendarEvent, CalendarFaithMode } from '../types/calendar';
import { getEventDisplayInTimezone } from './timezoneService';

/**
 * Checks whether an event occurs on a specific target date (YYYY-MM-DD),
 * accurately accounting for single-day, multi-day spans, recurring frequencies
 * (daily, weekly, monthly, yearly), and optional target timezone conversion
 * for timed events carrying an explicit IANA timezone.
 */
export function isEventOnDate(
  event: CalendarEvent,
  targetDateStr: string,
  targetTimeZone?: string
): boolean {
  const effective = getEventDisplayInTimezone(event, targetTimeZone);

  if (targetDateStr < effective.startDate) {
    return false;
  }

  // Exact start date match
  if (effective.startDate === targetDateStr) {
    return true;
  }

  // Multi-day non-recurring event span
  if (event.recurrence === 'none') {
    if (
      effective.endDate &&
      effective.startDate <= targetDateStr &&
      targetDateStr <= effective.endDate
    ) {
      return true;
    }
    return false;
  }

  // Parse dates to compare day of week / day of month
  const [sYear, sMonth, sDay] = effective.startDate.split('-').map(Number);
  const [tYear, tMonth, tDay] = targetDateStr.split('-').map(Number);

  const startObj = new Date(sYear, sMonth - 1, sDay);
  const targetObj = new Date(tYear, tMonth - 1, tDay);

  switch (event.recurrence) {
    case 'daily':
      return true;

    case 'weekly':
      return startObj.getDay() === targetObj.getDay();

    case 'monthly':
      // Matches the same day of the month (e.g. every 15th)
      return sDay === tDay;

    case 'yearly':
      // Matches the same month and day (e.g. every Nov 10)
      return sMonth === tMonth && sDay === tDay;

    default:
      return false;
  }
}

/**
 * Checks whether an event should be visible in the selected faith mode.
 * - Muslim Mode: Shows only Muslim and Universal events
 * - Hindu Mode: Shows only Hindu and Universal events
 * - Christian Mode: Shows only Christian and Universal events
 */
export function isEventVisibleInMode(
  event: CalendarEvent,
  mode?: CalendarFaithMode
): boolean {
  if (!mode) return true;
  const tag = event.faithTag;
  if (!tag || tag === 'universal') return true;

  if (mode === 'muslim') {
    return tag === 'muslim';
  }
  if (mode === 'hindu') {
    return tag === 'hindu';
  }
  if (mode === 'christian') {
    return tag === 'christian';
  }
  return true;
}

/**
 * Filters a list of events for a specific date and active faith mode.
 */
export function getEventsForDateAndMode(
  events: CalendarEvent[],
  dateStr: string,
  mode?: CalendarFaithMode,
  targetTimeZone?: string
): CalendarEvent[] {
  return events.filter(
    (e) =>
      isEventVisibleInMode(e, mode) &&
      isEventOnDate(e, dateStr, targetTimeZone)
  );
}
