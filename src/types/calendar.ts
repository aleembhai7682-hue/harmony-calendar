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
  timeZone?: string; // IANA timezone identifier in which timed event was scheduled
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
  applicableStates?: string[]; // empty or undefined means all-India / nationwide
  countryCode?: string; // ISO-3166-1 alpha-2 country code (e.g. 'IN', 'GB', 'US', 'AE', 'JP', 'AU')
  isTentative?: boolean;
  regionalVariationNote?: string;
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
  selectedState: string; // 'all' or Indian state code for regional holidays
  selectedCity: string; // '' (Location not set), 'custom', or city id from ALL_CITIES
  selectedCountry?: string; // Display country for active geographical location
  selectedCountryCode?: string; // ISO-3166-1 alpha-2 country code (e.g. 'IN', 'GB', 'US', 'AE', 'JP', 'AU')
  selectedRegion?: string; // State / province / region name
  selectedLocationTimezone?: string; // IANA timezone of selected geographical location (separate from device timezone)
  locationSource?: 'detected' | 'manual'; // Distinguishes GPS-detected vs manually selected location
  locationExplicitlyConfirmed?: boolean; // True once user explicitly selects/confirms location; false/undefined for legacy defaults
  customLatitude?: number;
  customLongitude?: number;
  customLocationName?: string;
  weekStartDay?: 'auto' | 0 | 1 | 6; // 'auto' (locale-based), 0 (Sunday), 1 (Monday), 6 (Saturday)
  timeFormat?: 'auto' | '12h' | '24h'; // Clock display format
  dateFormat?: 'auto' | 'DMY' | 'MDY' | 'YMD'; // Date order preference
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
