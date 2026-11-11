export type ViewMode = 'month' | 'week' | 'day' | 'year' | 'agenda';

export type Language = 'en' | 'ur' | 'hinglish';

export type Theme = 'light' | 'dark';

export type Priority = 'low' | 'medium' | 'high';

export type EventCategory =
  | 'work'
  | 'personal'
  | 'family'
  | 'spiritual'
  | 'health'
  | 'birthday'
  | 'festival';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  allDay: boolean;
  category: EventCategory;
  priority: Priority;
  recurrence: RecurrenceType;
  color?: string;
  location?: string;
  reminderMinutesBefore?: number;
  faithTag?: 'universal' | 'muslim' | 'hindu' | 'christian';
  createdAt: number;
}

export type CalendarFaithMode = 'muslim' | 'hindu' | 'christian';

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  priority: Priority;
  category: string;
  faithTag?: 'universal' | 'muslim' | 'hindu' | 'christian';
  createdAt: number;
}

export type FestivalCategory =
  | 'hindu'
  | 'islamic'
  | 'sikh'
  | 'christian'
  | 'jain'
  | 'buddhist'
  | 'national';

export type HolidayType = 'gazetted' | 'restricted' | 'regional' | 'observance';

export interface IndianFestival {
  id: string;
  nameEn: string;
  nameHi: string;
  nameUr?: string;
  category: FestivalCategory;
  date: string; // YYYY-MM-DD
  endDate?: string;
  holidayType: HolidayType;
  descriptionEn: string;
  descriptionHi: string;
  descriptionUr?: string;
  significance: string;
  rituals: string[];
  applicableStates?: string[]; // empty or undefined means all-India
  isTentative?: boolean;
}

export interface IslamicOccasion {
  id: string;
  nameEn: string;
  nameAr: string;
  nameHi: string;
  nameUr?: string;
  hijriDay: number;
  hijriMonth: number; // 1-12
  descriptionEn: string;
  descriptionHi: string;
  descriptionUr?: string;
  spiritualSignificance: string;
  practices: string[];
  isMajor: boolean;
  estimatedDate: string; // YYYY-MM-DD computed with current offset
  isMoonSightingDependent: boolean;
}

export interface HijriDateInfo {
  day: number;
  month: number; // 1-12
  year: number;
  monthNameEn: string;
  monthNameAr: string;
  monthNameHi: string;
  monthNameUr: string;
  formattedEn: string;
  formattedHi: string;
  formattedUr: string;
  isEstimated: boolean;
}

export interface IndianState {
  code: string;
  nameEn: string;
  nameHi: string;
  nameUr?: string;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sehriEnds: string;
  iftarTime: string;
}

export interface CalendarFilterSettings {
  selectedState: string; // 'all' or state code
  selectedCity: string; // 'mumbai', 'delhi', etc. from INDIAN_CITIES
  customLatitude?: number;
  customLongitude?: number;
  asrMethod: 'hanafi' | 'standard'; // Hanafi (2x shadow) vs Standard (1x shadow)
  prayerMethod: 'karachi' | 'mwl' | 'makkah' | 'egypt';
  enabledCategories: Record<FestivalCategory, boolean>;
  showGazettedOnly: boolean;
  showHijri: boolean;
  hijriAdjustmentDays: number; // -2, -1, 0, +1, +2
  showPrayerTimes: boolean;
  highlightFridays: boolean;
  showTasksOnCalendar: boolean;
  showMoonPhases: boolean;
  muslimOnlyMode: boolean; // Focus on Islamic calendar, prayer times, and Islamic occasions
  calendarMode: CalendarFaithMode; // 'christian' | 'hindu' | 'muslim'
}
