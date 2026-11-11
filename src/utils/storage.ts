import {
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  CalendarFaithMode,
  Language,
  Theme,
} from '../types/calendar';

const STORAGE_KEYS = {
  EVENTS: 'almanac_calendar_events_v2',
  TASKS: 'almanac_calendar_tasks_v2',
  FILTERS: 'almanac_calendar_filters_v2',
  LANGUAGE: 'almanac_calendar_lang_v2',
  THEME: 'almanac_calendar_theme_v2',
  MODE: 'almanac_active_user_mode_v2',
};

export const DEFAULT_FILTERS: CalendarFilterSettings = {
  selectedState: 'all',
  selectedCity: 'mumbai',
  asrMethod: 'hanafi',
  prayerMethod: 'karachi',
  enabledCategories: {
    hindu: true,
    islamic: true,
    sikh: true,
    christian: true,
    jain: true,
    buddhist: true,
    national: true,
  },
  showGazettedOnly: false,
  showHijri: true,
  hijriAdjustmentDays: 0,
  showPrayerTimes: true,
  highlightFridays: true,
  showTasksOnCalendar: true,
  showMoonPhases: true,
  muslimOnlyMode: false,
  calendarMode: 'christian',
};

export const DEMO_SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Diwali Shopping & Home Decor',
    description: 'Buy handmade earthen diyas, brass lamps, rangoli colors, and dry fruits gift hampers for relatives.',
    startDate: '2026-11-06',
    startTime: '16:00',
    endDate: '2026-11-06',
    endTime: '19:30',
    allDay: false,
    category: 'festival',
    priority: 'high',
    recurrence: 'none',
    color: '#d97706',
    location: 'Chandni Chowk / Local Bazaar',
    reminderMinutesBefore: 60,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'evt-2',
    title: 'Lakshmi Puja & Family Gathering',
    description: 'Auspicious evening Diwali Puja with family, lighting 51 clay diyas, chanting Sri Suktam, sharing homemade sweets.',
    startDate: '2026-11-08',
    startTime: '18:30',
    endDate: '2026-11-08',
    endTime: '21:30',
    allDay: false,
    category: 'spiritual',
    priority: 'high',
    recurrence: 'yearly',
    color: '#b45309',
    location: 'Home Mandir',
    reminderMinutesBefore: 30,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'evt-3',
    title: 'Weekly Strategy & Project Sync',
    description: 'Review product sprint milestones, roadmap deliverables, and customer feedback.',
    startDate: '2026-11-09',
    startTime: '10:00',
    endDate: '2026-11-09',
    endTime: '11:30',
    allDay: false,
    category: 'work',
    priority: 'medium',
    recurrence: 'weekly',
    color: '#2563eb',
    location: 'Conference Room 4B / Google Meet',
    reminderMinutesBefore: 15,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'evt-4',
    title: 'Jummah Congregation & Spiritual Reflection',
    description: 'Attend Friday congregational prayer and listen to the Khutbah on unity and community welfare.',
    startDate: '2026-11-13',
    startTime: '13:00',
    endDate: '2026-11-13',
    endTime: '14:15',
    allDay: false,
    category: 'spiritual',
    priority: 'medium',
    recurrence: 'weekly',
    color: '#059669',
    location: 'Central Jamia Masjid',
    reminderMinutesBefore: 45,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'evt-5',
    title: 'Chhath Puja Ghat Arghya',
    description: 'Join family members at the river ghat for offering Sandhya Arghya to the setting sun.',
    startDate: '2026-11-15',
    startTime: '16:30',
    endDate: '2026-11-15',
    endTime: '18:30',
    allDay: false,
    category: 'festival',
    priority: 'high',
    recurrence: 'none',
    color: '#ea580c',
    location: 'Ganga Ghat',
    reminderMinutesBefore: 60,
    createdAt: Date.now(),
  },
  {
    id: 'evt-6',
    title: 'Health & Morning Jogging Session',
    description: '5km light run around the park followed by breathing exercises and yoga.',
    startDate: '2026-11-07',
    startTime: '06:30',
    endDate: '2026-11-07',
    endTime: '07:30',
    allDay: false,
    category: 'health',
    priority: 'low',
    recurrence: 'daily',
    color: '#0284c7',
    location: 'City Green Park',
    reminderMinutesBefore: 15,
    createdAt: Date.now(),
  },
];

const INITIAL_TASKS: CalendarTask[] = [
  // Hindu Specific Tasks
  {
    id: 'tsk-1',
    title: 'Send Diwali & New Year greetings to clients and partners',
    description: 'Personalized greeting cards and gourmet gift boxes delivery.',
    dueDate: '2026-11-07',
    dueTime: '17:00',
    completed: false,
    priority: 'high',
    category: 'festival',
    faithTag: 'hindu',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tsk-2',
    title: 'Prepare Prasad & buy fresh marigold garlands for Laxmi Pooja',
    description: 'Yellow and orange marigold flowers, banana leaves, fresh coconuts, and pure desi ghee.',
    dueDate: '2026-11-08',
    dueTime: '11:00',
    completed: false,
    priority: 'high',
    category: 'spiritual',
    faithTag: 'hindu',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tsk-h3',
    title: 'Purchase earthen Diyas, sesame oil, and colorful Rangoli powders',
    description: 'Traditional terracotta oil lamps from local potters and stencils for doorstep rangoli.',
    dueDate: '2026-11-09',
    dueTime: '18:00',
    completed: false,
    priority: 'medium',
    category: 'festival',
    faithTag: 'hindu',
    createdAt: Date.now(),
  },
  // Muslim Specific Tasks
  {
    id: 'tsk-3',
    title: 'Check moon sighting notification for Jumada al-Akhirah',
    description: 'Verify local Hilal committee update to confirm Hijri day offset.',
    dueDate: '2026-11-10',
    dueTime: '19:45',
    completed: false,
    priority: 'medium',
    category: 'spiritual',
    faithTag: 'muslim',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-m2',
    title: 'Send Jummah Mubarak greetings & attend Friday congregational prayer',
    description: 'Sunnah bath, perfume (Attar), clean Kurta, and reach mosque early for Khutbah.',
    dueDate: '2026-11-13',
    dueTime: '12:30',
    completed: false,
    priority: 'high',
    category: 'spiritual',
    faithTag: 'muslim',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-m3',
    title: 'Calculate annual Zakat-ul-Mal on savings & gold assets',
    description: 'Determine 2.5% eligible charity threshold and allocate to verified destitute families.',
    dueDate: '2026-11-18',
    dueTime: '15:00',
    completed: false,
    priority: 'high',
    category: 'spiritual',
    faithTag: 'muslim',
    createdAt: Date.now(),
  },
  // Universal Tasks
  {
    id: 'tsk-4',
    title: 'Submit monthly financial expense reconciliation',
    description: 'Upload all invoices and travel receipts into the accounting portal.',
    dueDate: '2026-11-12',
    dueTime: '16:00',
    completed: true,
    priority: 'medium',
    category: 'work',
    faithTag: 'universal',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tsk-5',
    title: 'Book train tickets for winter family vacation',
    description: 'Confirm IRCTC Tatkal booking for Agra/Jaipur trip in December.',
    dueDate: '2026-11-14',
    dueTime: '10:00',
    completed: false,
    priority: 'low',
    category: 'family',
    faithTag: 'universal',
    createdAt: Date.now(),
  },
  // Personal Productivity & Lifestyle Tasks
  {
    id: 'tsk-p1',
    title: 'Deep work sprint: complete client roadmap presentation',
    description: 'Focus session without notifications to wrap up quarterly strategic deliverables.',
    dueDate: '2026-11-10',
    dueTime: '15:00',
    completed: false,
    priority: 'high',
    category: 'work',
    faithTag: 'universal',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-p2',
    title: 'Fitness routine: 45-min cardio and evening core stretching',
    description: 'Outdoor jog in the park followed by hydration and cool down.',
    dueDate: '2026-11-11',
    dueTime: '18:00',
    completed: false,
    priority: 'medium',
    category: 'health',
    faithTag: 'universal',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-p3',
    title: 'Personal habit: Read 20 pages of current book & journal entry',
    description: 'Quiet evening reading session before sleep.',
    dueDate: '2026-11-12',
    dueTime: '21:30',
    completed: false,
    priority: 'low',
    category: 'personal',
    faithTag: 'universal',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-p4',
    title: 'Friday Jummah congregation & community gathering',
    description: 'Attend Friday prayer, Khutbah, and connect with friends and family.',
    dueDate: '2026-11-13',
    dueTime: '12:45',
    completed: false,
    priority: 'high',
    category: 'spiritual',
    faithTag: 'muslim',
    createdAt: Date.now(),
  },
  // Christian Specific Tasks
  {
    id: 'tsk-c1',
    title: 'Sunday Morning Church Service & Fellowship',
    description: 'Attend Sunday mass/worship service, choir, and community coffee fellowship.',
    dueDate: '2026-11-15',
    dueTime: '09:30',
    completed: false,
    priority: 'high',
    category: 'spiritual',
    faithTag: 'christian',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-c2',
    title: 'Advent preparation & Christmas family gifts planning',
    description: 'Begin Christmas carol choir rehearsal, Advent wreath arrangement, and gift list.',
    dueDate: '2026-11-18',
    dueTime: '17:00',
    completed: false,
    priority: 'medium',
    category: 'family',
    faithTag: 'christian',
    createdAt: Date.now(),
  },
  {
    id: 'tsk-c3',
    title: 'Community charity drive & winter shelter donation',
    description: 'Donate warm blankets and pack food rations for underprivileged families.',
    dueDate: '2026-11-20',
    dueTime: '14:00',
    completed: false,
    priority: 'high',
    category: 'spiritual',
    faithTag: 'christian',
    createdAt: Date.now(),
  },
];

export function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      return []; // Clean slate for new users, avoid cluttering with misleading sample events
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load events from storage:', err);
    return [];
  }
}

export function loadDemoSampleEvents(): CalendarEvent[] {
  saveEvents(DEMO_SAMPLE_EVENTS);
  return DEMO_SAMPLE_EVENTS;
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to storage:', err);
  }
}

export function loadTasks(): CalendarTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load tasks from storage:', err);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: CalendarTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

export function loadFilters(): CalendarFilterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw);
    const mode = parsed.calendarMode || (parsed.muslimOnlyMode ? 'muslim' : 'all');
    return {
      ...DEFAULT_FILTERS,
      ...parsed,
      calendarMode: mode,
      muslimOnlyMode: mode === 'muslim',
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function saveFilters(filters: CalendarFilterSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  } catch (err) {
    console.error('Failed to save filters to storage:', err);
  }
}

export function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME) as Theme;
    const active = raw === 'dark' || raw === 'light' ? raw : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (active === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    }
    return active;
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body?.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body?.classList.remove('dark');
    }
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
}

export function loadLanguage(): Language {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    if (raw === 'ur' || raw === 'hinglish' || raw === 'en') return raw;
    return 'en'; // Default to English for Christian mode on first launch
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (err) {
    console.error('Failed to save language:', err);
  }
}

export function exportBackupData(): string {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    events: loadEvents(),
    tasks: loadTasks(),
    filters: loadFilters(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): { success: boolean; message?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid backup file: not a JSON object.' };
    }

    // Validate events array if present
    if (parsed.events) {
      if (!Array.isArray(parsed.events)) {
        return { success: false, message: 'Invalid backup file: events must be a list.' };
      }
      const validEvents = parsed.events.filter(
        (e: any) => e && typeof e.id === 'string' && typeof e.title === 'string' && typeof e.startDate === 'string'
      );
      saveEvents(validEvents);
    }

    // Validate tasks array if present
    if (parsed.tasks) {
      if (!Array.isArray(parsed.tasks)) {
        return { success: false, message: 'Invalid backup file: tasks must be a list.' };
      }
      const validTasks = parsed.tasks.filter(
        (t: any) => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.dueDate === 'string'
      );
      saveTasks(validTasks);
    }

    // Validate filters if present
    if (parsed.filters && typeof parsed.filters === 'object') {
      saveFilters({
        ...DEFAULT_FILTERS,
        ...parsed.filters,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Import failed:', err);
    return { success: false, message: err?.message || 'Failed to parse JSON backup.' };
  }
}

export function loadActiveMode(): CalendarFaithMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODE) as CalendarFaithMode;
    if (raw === 'muslim' || raw === 'hindu' || raw === 'christian') {
      return raw;
    }
    return 'christian'; // Default opening mode is Christian Mode on first launch!
  } catch {
    return 'christian';
  }
}

export function saveActiveMode(mode: CalendarFaithMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  } catch (err) {
    console.error('Failed to save active mode:', err);
  }
}
