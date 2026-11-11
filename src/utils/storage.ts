import {
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  CalendarFaithMode,
  Language,
  Theme,
} from '../types/calendar';
import { formatDateToLocalYMD, getTodayLocalYMD } from './dateUtils';

const STORAGE_KEYS = {
  EVENTS: 'harmony_calendar_events_v3',
  TASKS: 'harmony_calendar_tasks_v3',
  FILTERS: 'harmony_calendar_filters_v3',
  LANGUAGE: 'harmony_calendar_lang_v3',
  THEME: 'harmony_calendar_theme_v3',
  MODE: 'harmony_active_user_mode_v3',
};

const LEGACY_KEYS = {
  EVENTS: 'almanac_calendar_events_v2',
  TASKS: 'almanac_calendar_tasks_v2',
  FILTERS: 'almanac_calendar_filters_v2',
  LANGUAGE: 'almanac_calendar_lang_v2',
  THEME: 'almanac_calendar_theme_v2',
  MODE: 'almanac_active_user_mode_v2',
};

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    }
  } catch {}
  return null;
}

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

/**
 * Generates sample demo events anchored to the current local date.
 */
export function getDemoSampleEvents(): CalendarEvent[] {
  const now = new Date();
  const formatOffset = (offsetDays: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
    return formatDateToLocalYMD(d);
  };

  return [
    {
      id: 'demo-evt-1',
      title: 'Diwali Festival of Lights & Family Gathering',
      description: 'Lighting 51 clay diyas, welcoming prosperity, chanting Sri Suktam, and sharing sweets with neighbors.',
      startDate: formatOffset(0),
      startTime: '18:30',
      endDate: formatOffset(0),
      endTime: '21:00',
      allDay: false,
      category: 'festival',
      priority: 'high',
      recurrence: 'yearly',
      color: '#d97706',
      location: 'Home Mandir & Courtyard',
      reminderMinutesBefore: 30,
      faithTag: 'hindu',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'demo-evt-2',
      title: 'Weekly Strategy & Lifestyle Focus Planning',
      description: 'Review personal productivity goals, weekly calendar priorities, and family schedule.',
      startDate: formatOffset(1),
      startTime: '10:00',
      endDate: formatOffset(1),
      endTime: '11:15',
      allDay: false,
      category: 'work',
      priority: 'medium',
      recurrence: 'weekly',
      color: '#2563eb',
      location: 'Home Office / Google Meet',
      reminderMinutesBefore: 15,
      faithTag: 'universal',
      createdAt: Date.now() - 43200000,
    },
    {
      id: 'demo-evt-3',
      title: 'Jummah Prayer & Community Brotherhood',
      description: 'Attend Friday congregational prayer and listen to the Khutbah on unity and community welfare.',
      startDate: formatOffset(2),
      startTime: '13:00',
      endDate: formatOffset(2),
      endTime: '14:15',
      allDay: false,
      category: 'spiritual',
      priority: 'high',
      recurrence: 'weekly',
      color: '#059669',
      location: 'Central Jamia Masjid',
      reminderMinutesBefore: 45,
      faithTag: 'muslim',
      createdAt: Date.now() - 20000000,
    },
    {
      id: 'demo-evt-4',
      title: 'Sunday Morning Fellowship & Worship Service',
      description: 'Attend church service, hymnal choir recital, and coffee fellowship with community members.',
      startDate: formatOffset(4),
      startTime: '09:30',
      endDate: formatOffset(4),
      endTime: '11:30',
      allDay: false,
      category: 'spiritual',
      priority: 'high',
      recurrence: 'weekly',
      color: '#4f46e5',
      location: 'Grace Cathedral / Local Church',
      reminderMinutesBefore: 30,
      faithTag: 'christian',
      createdAt: Date.now(),
    },
    {
      id: 'demo-evt-5',
      title: 'Morning Yoga, Pranayama & Outdoor Run',
      description: 'Refreshing 45-minute wellness session followed by hydration and mindful meditation.',
      startDate: formatOffset(0),
      startTime: '06:30',
      endDate: formatOffset(0),
      endTime: '07:30',
      allDay: false,
      category: 'health',
      priority: 'low',
      recurrence: 'daily',
      color: '#0284c7',
      location: 'City Green Park',
      reminderMinutesBefore: 15,
      faithTag: 'universal',
      createdAt: Date.now(),
    },
  ];
}

/**
 * Generates sample demo tasks anchored to the current local date.
 */
export function getDemoSampleTasks(): CalendarTask[] {
  const now = new Date();
  const formatOffset = (offsetDays: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
    return formatDateToLocalYMD(d);
  };

  return [
    {
      id: 'demo-tsk-1',
      title: 'Deep work sprint: complete quarterly deliverables',
      description: 'Focused session without notifications to wrap up key milestone projects.',
      dueDate: formatOffset(0),
      dueTime: '16:00',
      completed: false,
      priority: 'high',
      category: 'work',
      faithTag: 'universal',
      createdAt: Date.now(),
    },
    {
      id: 'demo-tsk-2',
      title: 'Send festive greetings and sweets to relatives',
      description: 'Share handmade sweets and warm wishes with family and neighbors.',
      dueDate: formatOffset(1),
      dueTime: '18:00',
      completed: false,
      priority: 'medium',
      category: 'festival',
      faithTag: 'hindu',
      createdAt: Date.now(),
    },
    {
      id: 'demo-tsk-3',
      title: 'Calculate annual Zakat & charity contributions',
      description: 'Identify eligible charitable causes and allocate Sadaqah to verified families.',
      dueDate: formatOffset(2),
      dueTime: '15:00',
      completed: false,
      priority: 'high',
      category: 'spiritual',
      faithTag: 'muslim',
      createdAt: Date.now(),
    },
    {
      id: 'demo-tsk-4',
      title: 'Advent preparation & community charity donations',
      description: 'Pack warm blankets and donate food rations for winter shelter drives.',
      dueDate: formatOffset(3),
      dueTime: '11:00',
      completed: false,
      priority: 'medium',
      category: 'spiritual',
      faithTag: 'christian',
      createdAt: Date.now(),
    },
  ];
}

export const DEMO_SAMPLE_EVENTS = getDemoSampleEvents();

/**
 * Loads events from localStorage. Returns empty array for new users (clean slate).
 */
export function loadEvents(): CalendarEvent[] {
  try {
    const storage = getSafeStorage();
    if (!storage) return [];
    const raw =
      storage.getItem(STORAGE_KEYS.EVENTS) ||
      storage.getItem(LEGACY_KEYS.EVENTS);
    if (!raw) {
      return []; // Clean slate for new users!
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load events from storage:', err);
    return [];
  }
}

/**
 * Saves events to localStorage.
 */
export function saveEvents(events: CalendarEvent[]): void {
  try {
    const storage = getSafeStorage();
    storage?.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to storage:', err);
  }
}

/**
 * Loads tasks from localStorage. Returns empty array for new users (clean slate).
 */
export function loadTasks(): CalendarTask[] {
  try {
    const storage = getSafeStorage();
    if (!storage) return [];
    const raw =
      storage.getItem(STORAGE_KEYS.TASKS) ||
      storage.getItem(LEGACY_KEYS.TASKS);
    if (!raw) {
      return []; // Clean slate for new users!
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load tasks from storage:', err);
    return [];
  }
}

/**
 * Saves tasks to localStorage.
 */
export function saveTasks(tasks: CalendarTask[]): void {
  try {
    const storage = getSafeStorage();
    storage?.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage:', err);
  }
}

/**
 * Populates sample demo events and tasks into storage and returns them.
 */
export function loadDemoSampleData(): { events: CalendarEvent[]; tasks: CalendarTask[] } {
  const demoEvents = getDemoSampleEvents();
  const demoTasks = getDemoSampleTasks();
  saveEvents(demoEvents);
  saveTasks(demoTasks);
  return { events: demoEvents, tasks: demoTasks };
}

export function loadDemoSampleEvents(): CalendarEvent[] {
  const { events } = loadDemoSampleData();
  return events;
}

/**
 * Clears all user events and tasks, resetting to a pristine clean slate.
 */
export function clearAllUserCalendarData(): void {
  try {
    const storage = getSafeStorage();
    storage?.removeItem(STORAGE_KEYS.EVENTS);
    storage?.removeItem(LEGACY_KEYS.EVENTS);
    storage?.removeItem(STORAGE_KEYS.TASKS);
    storage?.removeItem(LEGACY_KEYS.TASKS);
  } catch (err) {
    console.error('Failed to clear calendar data:', err);
  }
}

export function loadFilters(): CalendarFilterSettings {
  try {
    const storage = getSafeStorage();
    if (!storage) return DEFAULT_FILTERS;
    const raw =
      storage.getItem(STORAGE_KEYS.FILTERS) ||
      storage.getItem(LEGACY_KEYS.FILTERS);
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
    const storage = getSafeStorage();
    storage?.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  } catch (err) {
    console.error('Failed to save filters to storage:', err);
  }
}

export function loadTheme(): Theme {
  try {
    const storage = getSafeStorage();
    const raw = (
      storage?.getItem(STORAGE_KEYS.THEME) ||
      storage?.getItem(LEGACY_KEYS.THEME)
    ) as Theme;
    const active =
      raw === 'dark' || raw === 'light'
        ? raw
        : typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    if (typeof document !== 'undefined') {
      if (active === 'dark') {
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
    }
    return active;
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: Theme): void {
  try {
    const storage = getSafeStorage();
    storage?.setItem(STORAGE_KEYS.THEME, theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body?.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body?.classList.remove('dark');
      }
    }
  } catch (err) {
    console.error('Failed to save theme:', err);
  }
}

/**
 * Loads language with strict mode isolation:
 * - Christian Mode: English exclusively.
 * - Hindu Mode: English / Hinglish (never Urdu).
 * - Muslim Mode: Urdu / Hinglish / English.
 */
export function loadLanguage(): Language {
  try {
    const mode = loadActiveMode();
    const storage = getSafeStorage();
    const raw = (
      storage?.getItem(STORAGE_KEYS.LANGUAGE) ||
      storage?.getItem(LEGACY_KEYS.LANGUAGE)
    ) as Language;

    if (mode === 'christian') return 'en';
    if (mode === 'hindu') {
      if (raw === 'ur' || !raw) return 'en';
      return raw === 'hinglish' ? 'hinglish' : 'en';
    }
    // Muslim mode
    if (raw === 'ur' || raw === 'hinglish' || raw === 'en') return raw;
    return 'ur';
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    const storage = getSafeStorage();
    storage?.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (err) {
    console.error('Failed to save language:', err);
  }
}

export function exportBackupData(): string {
  const data = {
    app: 'Harmony Calendar',
    version: '3.0',
    exportDate: new Date().toISOString(),
    activeMode: loadActiveMode(),
    language: loadLanguage(),
    theme: loadTheme(),
    events: loadEvents(),
    tasks: loadTasks(),
    filters: loadFilters(),
  };
  return JSON.stringify(data, null, 2);
}

export interface ImportBackupResult {
  success: boolean;
  message?: string;
  data?: {
    events?: CalendarEvent[];
    tasks?: CalendarTask[];
    filters?: CalendarFilterSettings;
    activeMode?: CalendarFaithMode;
    language?: Language;
    theme?: Theme;
  };
}

/**
 * Validates and safely imports backup data.
 * Protects application state by rejecting corrupt, malicious, or invalid schemas.
 */
export function importBackupData(jsonString: string): ImportBackupResult {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, message: 'Empty or invalid file content.' };
    }

    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { success: false, message: 'Invalid backup file: root must be a JSON object.' };
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const validEvents: CalendarEvent[] = [];
    const validTasks: CalendarTask[] = [];

    // Validate Events
    if (parsed.events !== undefined) {
      if (!Array.isArray(parsed.events)) {
        return { success: false, message: 'Invalid backup: "events" must be an array.' };
      }
      for (const e of parsed.events) {
        if (!e || typeof e !== 'object') continue;
        if (typeof e.id !== 'string' || !e.id.trim()) continue;
        if (typeof e.title !== 'string' || !e.title.trim()) continue;
        if (typeof e.startDate !== 'string' || !datePattern.test(e.startDate)) continue;

        const faithTag = ['universal', 'christian', 'hindu', 'muslim'].includes(e.faithTag)
          ? e.faithTag
          : 'universal';

        validEvents.push({
          id: String(e.id),
          title: String(e.title).trim(),
          description: typeof e.description === 'string' ? e.description : '',
          startDate: e.startDate,
          startTime: typeof e.startTime === 'string' ? e.startTime : undefined,
          endDate: typeof e.endDate === 'string' && datePattern.test(e.endDate) ? e.endDate : e.startDate,
          endTime: typeof e.endTime === 'string' ? e.endTime : undefined,
          allDay: Boolean(e.allDay),
          category: typeof e.category === 'string' ? e.category : 'personal',
          priority: typeof e.priority === 'string' ? e.priority : 'medium',
          recurrence: typeof e.recurrence === 'string' ? e.recurrence : 'none',
          color: typeof e.color === 'string' ? e.color : '#4f46e5',
          location: typeof e.location === 'string' ? e.location : undefined,
          reminderMinutesBefore: typeof e.reminderMinutesBefore === 'number' ? e.reminderMinutesBefore : 15,
          faithTag,
          createdAt: typeof e.createdAt === 'number' ? e.createdAt : Date.now(),
        });
      }
    }

    // Validate Tasks
    if (parsed.tasks !== undefined) {
      if (!Array.isArray(parsed.tasks)) {
        return { success: false, message: 'Invalid backup: "tasks" must be an array.' };
      }
      for (const t of parsed.tasks) {
        if (!t || typeof t !== 'object') continue;
        if (typeof t.id !== 'string' || !t.id.trim()) continue;
        if (typeof t.title !== 'string' || !t.title.trim()) continue;
        if (typeof t.dueDate !== 'string' || !datePattern.test(t.dueDate)) continue;

        const faithTag = ['universal', 'christian', 'hindu', 'muslim'].includes(t.faithTag)
          ? t.faithTag
          : 'universal';

        validTasks.push({
          id: String(t.id),
          title: String(t.title).trim(),
          description: typeof t.description === 'string' ? t.description : '',
          dueDate: t.dueDate,
          dueTime: typeof t.dueTime === 'string' ? t.dueTime : undefined,
          completed: Boolean(t.completed),
          priority: typeof t.priority === 'string' ? t.priority : 'medium',
          category: typeof t.category === 'string' ? t.category : 'personal',
          faithTag,
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        });
      }
    }

    // Validate Active Mode
    let validMode: CalendarFaithMode | undefined;
    if (parsed.activeMode && ['christian', 'hindu', 'muslim'].includes(parsed.activeMode)) {
      validMode = parsed.activeMode;
    }

    // Validate Language with Mode Isolation Enforcement
    let validLanguage: Language | undefined;
    if (parsed.language && ['en', 'hi', 'hinglish', 'ur'].includes(parsed.language)) {
      const targetMode = validMode || loadActiveMode();
      if (targetMode === 'christian') {
        validLanguage = 'en';
      } else if (targetMode === 'hindu') {
        validLanguage = parsed.language === 'ur' ? 'en' : (parsed.language as Language);
      } else {
        validLanguage = parsed.language as Language;
      }
    }

    // Validate Theme
    let validTheme: Theme | undefined;
    if (parsed.theme === 'dark' || parsed.theme === 'light') {
      validTheme = parsed.theme;
    }

    // Validate Filters
    let validFilters: CalendarFilterSettings | undefined;
    if (parsed.filters && typeof parsed.filters === 'object') {
      validFilters = {
        ...DEFAULT_FILTERS,
        ...parsed.filters,
        calendarMode: validMode || DEFAULT_FILTERS.calendarMode,
        muslimOnlyMode: (validMode || DEFAULT_FILTERS.calendarMode) === 'muslim',
      };
    }

    // Save validated data to storage
    if (parsed.events !== undefined) saveEvents(validEvents);
    if (parsed.tasks !== undefined) saveTasks(validTasks);
    if (validMode) saveActiveMode(validMode);
    if (validLanguage) saveLanguage(validLanguage);
    if (validTheme) saveTheme(validTheme);
    if (validFilters) saveFilters(validFilters);

    return {
      success: true,
      data: {
        events: parsed.events !== undefined ? validEvents : undefined,
        tasks: parsed.tasks !== undefined ? validTasks : undefined,
        activeMode: validMode,
        language: validLanguage,
        theme: validTheme,
        filters: validFilters,
      },
    };
  } catch (err: any) {
    console.error('Import failed:', err);
    return { success: false, message: err?.message || 'Failed to parse JSON backup.' };
  }
}

export function loadActiveMode(): CalendarFaithMode {
  try {
    const storage = getSafeStorage();
    const raw = (
      storage?.getItem(STORAGE_KEYS.MODE) ||
      storage?.getItem(LEGACY_KEYS.MODE)
    ) as CalendarFaithMode;
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
    const storage = getSafeStorage();
    storage?.setItem(STORAGE_KEYS.MODE, mode);
  } catch (err) {
    console.error('Failed to save active mode:', err);
  }
}
