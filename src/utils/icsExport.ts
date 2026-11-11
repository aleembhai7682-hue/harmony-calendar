import { CalendarEvent } from '../types/calendar';
import { formatDateToLocalYMD } from './dateUtils';

export function exportEventsToIcs(events: CalendarEvent[], calendarTitle = 'Harmony Calendar'): void {
  const pad = (n: number) => String(n).padStart(2, '0');

  const formatIcsDate = (dateStr: string, timeStr?: string, allDay?: boolean) => {
    const cleanDate = dateStr.replace(/-/g, '');
    if (allDay || !timeStr) {
      return { value: cleanDate, isAllDay: true };
    }
    const cleanTime = timeStr.replace(/:/g, '') + '00';
    return { value: `${cleanDate}T${cleanTime}`, isAllDay: false };
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Harmony Calendar//Unified Multi-Faith Lifestyle App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  events.forEach((evt) => {
    const start = formatIcsDate(evt.startDate, evt.startTime, evt.allDay);
    const end = formatIcsDate(evt.endDate || evt.startDate, evt.endTime || evt.startTime, evt.allDay);

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${evt.id}@harmonycalendar.app`);
    ics.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    
    if (start.isAllDay) {
      ics.push(`DTSTART;VALUE=DATE:${start.value}`);
      ics.push(`DTEND;VALUE=DATE:${end.value}`);
    } else {
      ics.push(`DTSTART:${start.value}`);
      ics.push(`DTEND:${end.value}`);
    }

    ics.push(`SUMMARY:${evt.title.replace(/[,;]/g, '\\$&')}`);
    if (evt.description) {
      ics.push(`DESCRIPTION:${evt.description.replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&')}`);
    }
    if (evt.location) {
      ics.push(`LOCATION:${evt.location.replace(/[,;]/g, '\\$&')}`);
    }
    ics.push(`CATEGORIES:${evt.category.toUpperCase()}`);
    ics.push(`PRIORITY:${evt.priority === 'high' ? '1' : evt.priority === 'medium' ? '5' : '9'}`);
    
    if (evt.recurrence && evt.recurrence !== 'none') {
      const freq = evt.recurrence.toUpperCase();
      ics.push(`RRULE:FREQ=${freq}`);
    }

    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');

  const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harmony-calendar-export-${formatDateToLocalYMD(new Date())}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
