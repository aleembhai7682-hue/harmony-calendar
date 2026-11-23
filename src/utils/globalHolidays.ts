import { CalendarFaithMode, FestivalCategory, IndianFestival } from '../types/calendar';
import { getFestivalsForDate, INDIAN_FESTIVALS_DATABASE } from './indianFestivals';
import { ChristianObservance, getChristianObservancesForYear } from './christianData';

export interface CountryHolidaySummary {
  countryCode: string;
  countryName: string;
  hasNationalHolidayData: boolean;
  notice: string;
}

const SUPPORTED_COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  GB: 'United Kingdom',
  US: 'United States',
  AE: 'United Arab Emirates',
  JP: 'Japan',
  AU: 'Australia',
  CA: 'Canada',
  SG: 'Singapore',
};

function toYmd(year: number, monthIndex0: number, day: number): string {
  return `${year}-${String(monthIndex0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Computes the Nth weekday of a month (e.g., 3rd Monday = nthWeekday(y, 0, 1, 3)).
 */
function nthWeekday(year: number, month0: number, weekday0: number, nth: number): string {
  const firstDow = new Date(year, month0, 1).getDay();
  const offset = (weekday0 - firstDow + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return toYmd(year, month0, day);
}

/**
 * Computes the last occurrence of a weekday in a month (e.g., last Monday in May).
 */
function lastWeekday(year: number, month0: number, weekday0: number): string {
  const lastDate = new Date(year, month0 + 1, 0);
  const lastDay = lastDate.getDate();
  const lastDow = lastDate.getDay();
  const back = (lastDow - weekday0 + 7) % 7;
  return toYmd(year, month0, lastDay - back);
}

function makeNationalHoliday(
  id: string,
  countryCode: string,
  date: string,
  nameEn: string,
  descriptionEn: string,
  significance: string,
  rituals: string[],
  regionalVariationNote?: string
): IndianFestival {
  return {
    id: `${countryCode.toLowerCase()}-${id}-${date}`,
    nameEn,
    nameHi: nameEn,
    category: 'national',
    countryCode,
    date,
    holidayType: 'gazetted',
    descriptionEn,
    descriptionHi: descriptionEn,
    significance,
    rituals,
    regionalVariationNote,
  };
}

/**
 * Returns verified fixed and statutory rule-based national/public holidays for a supported country and year.
 * Religious festivals (Christian liturgical, Islamic Hijri, Hindu Panchang) are handled separately by their
 * respective faith modules and never fabricated here.
 */
export function getNationalHolidaysForCountryYear(
  countryCode: string,
  year: number
): IndianFestival[] {
  const cc = countryCode.trim().toUpperCase();
  const list: IndianFestival[] = [];

  if (cc === 'GB') {
    list.push(
      makeNationalHoliday('nyd', 'GB', `${year}-01-01`, "New Year's Day", 'Public holiday marking the start of the civil calendar year in the United Kingdom.', 'Civil new year', ['Community celebrations'], 'Substitute weekday bank holiday applies if Jan 1 falls on a weekend.'),
      makeNationalHoliday('may-early', 'GB', nthWeekday(year, 4, 1, 1), 'Early May Bank Holiday', 'First Monday in May public bank holiday across the United Kingdom.', 'Spring bank holiday', ['Local fairs and community gatherings']),
      makeNationalHoliday('spring-bank', 'GB', lastWeekday(year, 4, 1), 'Spring Bank Holiday', 'Last Monday in May public bank holiday across the United Kingdom.', 'Late spring bank holiday', ['Outdoor activities and civic events']),
      makeNationalHoliday('summer-bank', 'GB', lastWeekday(year, 7, 1), 'Summer Bank Holiday (England, Wales & NI)', 'Late August bank holiday observed in England, Wales, and Northern Ireland.', 'Late summer break', ['Community festivals'], 'Scotland observes its Summer Bank Holiday on the first Monday of August.'),
      makeNationalHoliday('christmas', 'GB', `${year}-12-25`, 'Christmas Day (UK Bank Holiday)', 'Public bank holiday across the United Kingdom.', 'Winter holiday', ['Family gatherings']),
      makeNationalHoliday('boxing', 'GB', `${year}-12-26`, 'Boxing Day', 'Public bank holiday following Christmas Day across the United Kingdom.', 'Civic & family holiday', ['Charity, family visits, and sporting fixtures'], 'Substitute weekday applies if Boxing Day falls on a weekend.')
    );
  } else if (cc === 'US') {
    list.push(
      makeNationalHoliday('nyd', 'US', `${year}-01-01`, "New Year's Day", 'Federal holiday marking the start of the Gregorian calendar year.', 'Civil new year', ['New Year celebrations']),
      makeNationalHoliday('mlk', 'US', nthWeekday(year, 0, 1, 3), 'Martin Luther King Jr. Day', 'US federal holiday honoring Dr. Martin Luther King Jr. (3rd Monday of January).', 'Civil rights and service', ['Community service projects']),
      makeNationalHoliday('presidents', 'US', nthWeekday(year, 1, 1, 3), "Washington's Birthday (Presidents' Day)", 'US federal holiday observed on the 3rd Monday of February.', 'Civic remembrance', ['Civic observances']),
      makeNationalHoliday('memorial', 'US', lastWeekday(year, 4, 1), 'Memorial Day', 'US federal holiday honoring fallen military personnel (last Monday of May).', 'National remembrance', ['Memorial ceremonies']),
      makeNationalHoliday('juneteenth', 'US', `${year}-06-19`, 'Juneteenth National Independence Day', 'US federal holiday commemorating the emancipation of enslaved African Americans.', 'Freedom and emancipation', ['Community gatherings and reflection']),
      makeNationalHoliday('ind', 'US', `${year}-07-04`, 'Independence Day (Fourth of July)', 'Commemorates the Declaration of Independence of the United States in 1776.', 'National independence', ['Fireworks, parades, family gatherings']),
      makeNationalHoliday('labor', 'US', nthWeekday(year, 8, 1, 1), 'Labor Day', 'US federal holiday honoring the American labor movement (1st Monday of September).', 'Workers and community', ['End-of-summer gatherings']),
      makeNationalHoliday('columbus', 'US', nthWeekday(year, 9, 1, 2), 'Columbus Day / Indigenous Peoples Day', 'Observed on the 2nd Monday of October; naming and observance vary by US state.', 'Heritage & civic reflection', ['Regional cultural events'], 'Observance varies significantly by US state and municipality.'),
      makeNationalHoliday('veterans', 'US', `${year}-11-11`, 'Veterans Day', 'Honors all United States military veterans.', 'Civic gratitude', ['Veterans parades and tributes']),
      makeNationalHoliday('thanksgiving', 'US', nthWeekday(year, 10, 4, 4), 'Thanksgiving Day', 'US federal holiday observed on the 4th Thursday of November.', 'Gratitude and harvest', ['Family meal and gratitude'])
    );
  } else if (cc === 'AE') {
    list.push(
      makeNationalHoliday('nyd', 'AE', `${year}-01-01`, "New Year's Day", 'Public holiday in the United Arab Emirates marking the Gregorian New Year.', 'Civil new year', ['Public festivities']),
      makeNationalHoliday('commemoration', 'AE', `${year}-11-30`, 'Commemoration Day', 'Honors Emirati citizens who sacrificed their lives in service to the nation.', 'National remembrance', ['Flag lowering and moment of silent prayer']),
      makeNationalHoliday('national-day', 'AE', `${year}-12-02`, 'UAE National Day (Eid Al Etihad)', 'Celebrates the unification of the Emirates on December 2, 1971.', 'National unity', ['Flag displays, cultural parades, and celebrations'], 'UAE Islamic holidays (Eid al-Fitr, Arafah, Eid al-Adha, Hijri New Year) depend on official UAE Moon Sighting Committee announcements.')
    );
  } else if (cc === 'JP') {
    list.push(
      makeNationalHoliday('shogatsu', 'JP', `${year}-01-01`, "New Year's Day (Ganjitsu)", 'National holiday celebrating the Japanese New Year.', 'Renewal and family', ['Hatsumode shrine/temple visits', 'Osechi ryori']),
      makeNationalHoliday('coming-of-age', 'JP', nthWeekday(year, 0, 1, 2), 'Coming of Age Day (Seijin no Hi)', 'Celebrates young adults reaching the age of majority (2nd Monday of January).', 'Youth and civic adulthood', ['Municipal ceremonies']),
      makeNationalHoliday('foundation', 'JP', `${year}-02-11`, 'National Foundation Day (Kenkoku Kinen no Hi)', 'Commemorates the founding of Japan as a nation.', 'National heritage', ['Civic reflection']),
      makeNationalHoliday('showa', 'JP', `${year}-04-29`, 'Showa Day', 'Marks the start of Golden Week and reflects on the Showa era.', 'Historical reflection', ['Golden Week travel and family time']),
      makeNationalHoliday('constitution', 'JP', `${year}-05-03`, 'Constitution Memorial Day', 'Commemorates the 1947 Constitution of Japan.', 'Constitutional democracy', ['Civic discussions']),
      makeNationalHoliday('greenery', 'JP', `${year}-05-04`, 'Greenery Day (Midori no Hi)', 'Dedicated to appreciating nature and environmental stewardship.', 'Nature and environment', ['Park visits and tree planting']),
      makeNationalHoliday('children', 'JP', `${year}-05-05`, "Children's Day (Kodomo no Hi)", 'Celebrates the health, growth, and happiness of children.', 'Family and youth', ['Koinobori carp streamers']),
      makeNationalHoliday('marine', 'JP', nthWeekday(year, 6, 1, 3), 'Marine Day (Umi no Hi)', 'Appreciates the blessings of the ocean (3rd Monday of July).', 'Maritime gratitude', ['Coastal events']),
      makeNationalHoliday('mountain', 'JP', `${year}-08-11`, 'Mountain Day (Yama no Hi)', 'Encourages appreciation of Japan’s mountains.', 'Nature appreciation', ['Hiking and outdoor travel']),
      makeNationalHoliday('aged', 'JP', nthWeekday(year, 8, 1, 3), 'Respect for the Aged Day (Keiro no Hi)', 'Honors elderly citizens (3rd Monday of September).', 'Respect for elders', ['Family visits']),
      makeNationalHoliday('culture', 'JP', `${year}-11-03`, 'Culture Day (Bunka no Hi)', 'Promotes culture, the arts, and academic endeavor.', 'Arts and peace', ['Exhibitions and awards']),
      makeNationalHoliday('labor', 'JP', `${year}-11-23`, 'Labor Thanksgiving Day', 'Honors labor, production, and mutual gratitude.', 'Community & work', ['Gratitude observances'])
    );
  } else if (cc === 'AU') {
    list.push(
      makeNationalHoliday('nyd', 'AU', `${year}-01-01`, "New Year's Day", 'National public holiday across Australia.', 'Civil new year', ['Community celebrations']),
      makeNationalHoliday('aus-day', 'AU', `${year}-01-26`, 'Australia Day', 'Official national day of Australia.', 'National reflection & citizenship', ['Citizenship ceremonies and community events'], 'Substitute Monday holiday applies in most states/territories if Jan 26 falls on a weekend.'),
      makeNationalHoliday('anzac', 'AU', `${year}-04-25`, 'Anzac Day', 'National day of remembrance for Australian and New Zealand service members.', 'Remembrance', ['Dawn services and marches']),
      makeNationalHoliday('boxing', 'AU', `${year}-12-26`, 'Boxing Day / Proclamation Day', 'Public holiday across Australia (Proclamation Day in South Australia).', 'Public holiday', ['Family gatherings'], 'Australian state-specific holidays (e.g., King’s Birthday, Labour Day) vary by state/territory.')
    );
  } else if (cc === 'CA') {
    list.push(
      makeNationalHoliday('nyd', 'CA', `${year}-01-01`, "New Year's Day", 'Statutory holiday across Canada.', 'Civil new year', ['New Year celebrations']),
      makeNationalHoliday('canada-day', 'CA', `${year}-07-01`, 'Canada Day', 'Celebrates Canadian Confederation on July 1, 1867.', 'National day', ['Civic events and fireworks']),
      makeNationalHoliday('labour-day', 'CA', nthWeekday(year, 8, 1, 1), 'Labour Day', 'Federal statutory holiday observed on the 1st Monday of September.', 'Workers and community', ['Community gatherings']),
      makeNationalHoliday('truth-reconciliation', 'CA', `${year}-09-30`, 'National Day for Truth and Reconciliation', 'Honors Indigenous survivors of residential schools and commemorates their history.', 'Remembrance and reconciliation', ['Orange Shirt Day reflection']),
      makeNationalHoliday('thanksgiving', 'CA', nthWeekday(year, 9, 1, 2), 'Thanksgiving (Canada)', 'Statutory holiday observed on the 2nd Monday of October.', 'Harvest gratitude', ['Family dinner']),
      makeNationalHoliday('remembrance', 'CA', `${year}-11-11`, 'Remembrance Day', 'Honors members of the armed forces who served in the line of duty.', 'Remembrance', ['11:00 AM moment of silence']),
      makeNationalHoliday('boxing', 'CA', `${year}-12-26`, 'Boxing Day', 'Federal statutory holiday following Christmas Day.', 'Winter holiday', ['Family time'])
    );
  } else if (cc === 'SG') {
    list.push(
      makeNationalHoliday('nyd', 'SG', `${year}-01-01`, "New Year's Day", 'Gazetted public holiday in Singapore.', 'Civil new year', ['Countdown celebrations']),
      makeNationalHoliday('labour', 'SG', `${year}-05-01`, 'Labour Day', 'Gazetted public holiday honoring workers in Singapore.', 'Workers and community', ['Civic events']),
      makeNationalHoliday('national', 'SG', `${year}-08-09`, 'Singapore National Day', 'Commemorates Singapore’s independence on August 9, 1965.', 'National unity', ['National Day Parade and flag display'], 'Lunar/religious Singapore public holidays (Chinese New Year, Hari Raya Puasa, Hari Raya Haji, Vesak Day, Deepavali) follow annual official gazettes.')
    );
  }

  return list;
}

/**
 * Returns regional/national summary for honest UI disclosure.
 */
export function getCountryHolidaySummary(countryCode?: string): CountryHolidaySummary {
  const cc = countryCode?.trim().toUpperCase() || '';
  if (!cc) {
    return {
      countryCode: '',
      countryName: '',
      hasNationalHolidayData: false,
      notice:
        'Select a location to view country-specific public holidays. Christian liturgical observances, Islamic Hijri dates, and Hindu Panchang calendars work globally.',
    };
  }
  const name = SUPPORTED_COUNTRY_NAMES[cc];
  if (!name) {
    return {
      countryCode: cc,
      countryName: cc,
      hasNationalHolidayData: false,
      notice: `Country-specific public holidays are not yet bundled for ${cc}. Faith-based calendars (Christian, Hindu, Islamic) and personal events remain fully active.`,
    };
  }
  if (cc === 'IN') {
    return {
      countryCode: 'IN',
      countryName: 'India',
      hasNationalHolidayData: true,
      notice:
        'Showing India national/regional holidays (state-filterable). Regional Panchang & moon-sighting dates may vary by ±1 day.',
    };
  }
  return {
    countryCode: cc,
    countryName: name,
    hasNationalHolidayData: true,
    notice: `Showing verified ${name} public/national holidays alongside your active faith calendar.`,
  };
}

function christianObservanceToFestival(obs: ChristianObservance): IndianFestival {
  return {
    id: `christian-${obs.id}`,
    nameEn: obs.name,
    nameHi: obs.name,
    category: 'christian',
    date: obs.dateStr,
    holidayType: 'observance',
    descriptionEn: obs.description,
    descriptionHi: obs.description,
    significance: `${obs.season} Christian observance`,
    rituals: ['Church worship service', 'Scripture reading', 'Prayer & community fellowship'],
  };
}

function getChristianFestivalsForYear(year: number): IndianFestival[] {
  const fromChristianData = getChristianObservancesForYear(year).map(christianObservanceToFestival);
  const fromDb = INDIAN_FESTIVALS_DATABASE.filter(
    (f) => f.category === 'christian' && f.date.startsWith(`${year}-`)
  );

  const merged: IndianFestival[] = [...fromChristianData];
  for (const item of fromDb) {
    const alreadyExists = merged.some(
      (existing) =>
        existing.date === item.date &&
        existing.nameEn.toLowerCase() === item.nameEn.toLowerCase()
    );
    if (!alreadyExists) {
      merged.push(item);
    }
  }
  return merged.sort((a, b) => a.date.localeCompare(b.date));
}

function matchesCalendarMode(
  fest: IndianFestival,
  calendarMode?: CalendarFaithMode
): boolean {
  if (!calendarMode) return true;
  if (calendarMode === 'muslim') {
    return false; // Muslim Mode uses Hijri/Islamic occasions exclusively
  }
  if (calendarMode === 'christian') {
    return fest.category === 'christian' || fest.category === 'national';
  }
  if (calendarMode === 'hindu') {
    return fest.category === 'hindu' || fest.category === 'national';
  }
  return true;
}

/**
 * Retrieves holidays/festivals for a specific date, respecting the active country and faith mode:
 * - Christian Mode: Christian liturgical observances + applicable country public/national holidays ONLY.
 *   Never includes Hindu, Sikh, Jain, Buddhist, or Islamic festivals.
 * - Hindu Mode: Hindu festivals + applicable country public/national holidays.
 * - Muslim Mode: returns empty list (Islamic occasions are computed via Hijri calendar).
 */
export function getGlobalHolidaysForDate(
  dateStr: string,
  options: {
    countryCode?: string;
    state?: string;
    enabledCategories?: Record<FestivalCategory, boolean>;
    showGazettedOnly?: boolean;
    calendarMode?: CalendarFaithMode;
  }
): IndianFestival[] {
  if (options.calendarMode === 'muslim') {
    return [];
  }

  const cc = options.countryCode?.trim().toUpperCase() || '';
  const [yearStr] = dateStr.split('-');
  const year = Number(yearStr);

  let rawList: IndianFestival[];

  if (cc === 'IN') {
    rawList = getFestivalsForDate(
      dateStr,
      options.state || 'all',
      options.enabledCategories,
      options.showGazettedOnly || false
    );
  } else {
    const countryNational =
      cc && Number.isFinite(year)
        ? getNationalHolidaysForCountryYear(cc, year).filter((h) => h.date === dateStr)
        : [];

    const religiousFromDb = getFestivalsForDate(
      dateStr,
      'all',
      options.enabledCategories,
      options.showGazettedOnly || false
    ).filter((f) => f.category !== 'national');

    rawList = [...countryNational, ...religiousFromDb];
  }

  if (options.calendarMode === 'christian' && Number.isFinite(year)) {
    const christianYearItems = getChristianFestivalsForYear(year).filter((f) => f.date === dateStr);
    for (const obs of christianYearItems) {
      const dup = rawList.some(
        (existing) =>
          existing.category === 'christian' &&
          existing.nameEn.toLowerCase() === obs.nameEn.toLowerCase()
      );
      if (!dup) {
        rawList.push(obs);
      }
    }
  }

  return rawList.filter((fest) => {
    if (!matchesCalendarMode(fest, options.calendarMode)) {
      return false;
    }
    if (options.enabledCategories && !options.enabledCategories[fest.category]) {
      return false;
    }
    if (options.showGazettedOnly && fest.holidayType !== 'gazetted') {
      return false;
    }
    return true;
  });
}

/**
 * Computes upcoming national holidays + faith-appropriate observances from a base date,
 * strictly filtered by calendarMode BEFORE any caller truncation.
 */
export function getUpcomingGlobalHolidays(
  fromDate: Date,
  fromDateStr: string,
  countryCode?: string,
  options?: {
    calendarMode?: CalendarFaithMode;
    state?: string;
    showGazettedOnly?: boolean;
    enabledCategories?: Record<FestivalCategory, boolean>;
  }
): IndianFestival[] {
  const calendarMode = options?.calendarMode;
  if (calendarMode === 'muslim') {
    return [];
  }

  const cc = countryCode?.trim().toUpperCase() || '';
  const year = fromDate.getFullYear();
  const state = options?.state || 'all';
  const showGazettedOnly = options?.showGazettedOnly || false;
  const enabledCategories = options?.enabledCategories;

  let combined: IndianFestival[] = [];

  if (cc === 'IN') {
    combined = INDIAN_FESTIVALS_DATABASE.filter((f) => {
      if (f.date < fromDateStr) return false;
      if (
        state !== 'all' &&
        f.applicableStates &&
        f.applicableStates.length > 0 &&
        !f.applicableStates.includes(state)
      ) {
        return false;
      }
      return true;
    });
  } else {
    const countryHolidays = cc
      ? [
          ...getNationalHolidaysForCountryYear(cc, year),
          ...getNationalHolidaysForCountryYear(cc, year + 1),
        ].filter((h) => h.date >= fromDateStr)
      : [];

    const religious = INDIAN_FESTIVALS_DATABASE.filter(
      (f) => f.category !== 'national' && f.date >= fromDateStr
    );

    combined = [...countryHolidays, ...religious];
  }

  if (calendarMode === 'christian') {
    const christianObservances = [
      ...getChristianFestivalsForYear(year),
      ...getChristianFestivalsForYear(year + 1),
    ].filter((f) => f.date >= fromDateStr);

    for (const obs of christianObservances) {
      const dup = combined.some(
        (existing) =>
          existing.category === 'christian' &&
          existing.date === obs.date &&
          existing.nameEn.toLowerCase() === obs.nameEn.toLowerCase()
      );
      if (!dup) {
        combined.push(obs);
      }
    }
  }

  return combined
    .filter((fest) => {
      if (!matchesCalendarMode(fest, calendarMode)) return false;
      if (enabledCategories && !enabledCategories[fest.category]) return false;
      if (showGazettedOnly && fest.holidayType !== 'gazetted') return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
