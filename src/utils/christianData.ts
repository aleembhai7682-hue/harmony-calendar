/**
 * Christian Mode Database & Utilities
 * Provides inspiring Bible verses, Liturgical season calculation,
 * Christmas and major Christian feast countdowns, and Sunday planner prompts.
 */

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: string;
  citation: string;
  textEn: string;
  textHi: string;
  reflection: string;
  theme: 'Faith' | 'Love' | 'Hope' | 'Peace' | 'Strength' | 'Gratitude';
}

export interface LiturgicalSeasonInfo {
  seasonName: string;
  liturgicalColor: string; // e.g., 'Purple' for Advent/Lent, 'White/Gold' for Christmas/Easter, 'Green' for Ordinary Time
  colorHex: string;
  description: string;
  spiritualFocus: string;
}

export const BIBLE_VERSES: BibleVerse[] = [
  {
    id: 'philippians-4-13',
    book: 'Philippians',
    chapter: 4,
    verse: '13',
    citation: 'Philippians 4:13',
    textEn: 'I can do all things through Christ who strengthens me.',
    textHi: 'जो मुझे सामर्थ्य देता है, उसमें मैं सब कुछ कर सकता हूँ।',
    reflection: 'No challenge before you today is greater than the divine strength within you.',
    theme: 'Strength',
  },
  {
    id: 'psalm-23-1',
    book: 'Psalms',
    chapter: 23,
    verse: '1-3',
    citation: 'Psalm 23:1-3',
    textEn: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures; He leads me beside still waters. He restores my soul.',
    textHi: 'यहोवा मेरा चरवाहा है, मुझे कुछ घटी न होगी। वह मुझे हरी-हरी चराइयों में बैठाता है; वह मुझे सुखदाई जल के झरने के पास ले चलता है। वह मेरे जी में जी ले आता है।',
    reflection: 'Rest your weary heart today. You are guided, provided for, and deeply loved.',
    theme: 'Peace',
  },
  {
    id: 'corinthians-13-4',
    book: '1 Corinthians',
    chapter: 13,
    verse: '4-7',
    citation: '1 Corinthians 13:4-7',
    textEn: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It always protects, always trusts, always hopes, always perseveres.',
    textHi: 'प्रेम धीरजवन्त है, और कृपालु है; प्रेम डाह नहीं करता; प्रेम अपनी बड़ाई नहीं करता, और फूलता नहीं... वह सब बातें सह लेता है, सब बातों की प्रतीति करता है, सब बातों की आशा रखता है।',
    reflection: 'Choose patience and gentle kindness in every interaction today, especially when tested.',
    theme: 'Love',
  },
  {
    id: 'proverbs-3-5',
    book: 'Proverbs',
    chapter: 3,
    verse: '5-6',
    citation: 'Proverbs 3:5-6',
    textEn: 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge Him, and He will make your paths straight.',
    textHi: 'तू अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना। उसी को स्मरण करके सब काम करना, तब वह तेरे लिये सीधा मार्ग निकालेगा।',
    reflection: 'Release the heavy burden of needing to figure out every outcome. Take the next honest step in faith.',
    theme: 'Faith',
  },
  {
    id: 'john-3-16',
    book: 'John',
    chapter: 3,
    verse: '16',
    citation: 'John 3:16',
    textEn: 'For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.',
    textHi: 'क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।',
    reflection: 'The foundation of the universe is unconditional divine love for you and all humanity.',
    theme: 'Love',
  },
  {
    id: 'isaiah-40-31',
    book: 'Isaiah',
    chapter: 40,
    verse: '31',
    citation: 'Isaiah 40:31',
    textEn: 'Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.',
    textHi: 'जो यहोवा की बाट जोहते हैं, वे नया बल प्राप्त करते जाएंगे, वे उकाबों की नाईं उड़ेंगे, वे दौड़ेंगे और श्रमित न होंगे, चलेंगे और थकित न होंगे।',
    reflection: 'Patience in waiting on God turns human exhaustion into soaring spiritual wings.',
    theme: 'Hope',
  },
  {
    id: 'matthew-6-33',
    book: 'Matthew',
    chapter: 6,
    verse: '33-34',
    citation: 'Matthew 6:33-34',
    textEn: 'Seek first the kingdom of God and His righteousness, and all these things will be added to you. Therefore do not worry about tomorrow, for tomorrow will worry about itself.',
    textHi: 'पहले तुम परमेश्वर के राज्य और उसके धर्म की खोज करो तो ये सब वस्तुएं भी तुम्हें मिल जाएंगी। इसलिये कल की चिन्ता न करो, क्योंकि कल का दिन अपनी चिन्ता आप कर लेगा।',
    reflection: 'Live fully in today. Align your heart with honesty and service, and daily necessities will follow.',
    theme: 'Peace',
  },
];

/**
 * Returns the Bible verse for any day.
 */
export function getDailyBibleVerse(date: Date): BibleVerse {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = Math.abs(dayOfYear % BIBLE_VERSES.length);
  return BIBLE_VERSES[index];
}

/**
 * Calculates countdown in days to the next Christmas (Dec 25).
 */
export function getChristmasCountdown(currentDate: Date): { days: number; isToday: boolean } {
  const year = currentDate.getFullYear();
  let christmas = new Date(year, 11, 25); // Dec 25
  
  // If Christmas has already passed this year, count to next year's Christmas
  const curTime = new Date(year, currentDate.getMonth(), currentDate.getDate()).getTime();
  if (curTime > christmas.getTime()) {
    christmas = new Date(year + 1, 11, 25);
  }

  const diffMs = christmas.getTime() - curTime;
  const days = Math.round(diffMs / 86400000);

  return {
    days,
    isToday: days === 0,
  };
}

/**
 * Calculates current Liturgical Season based on date.
 */
export function getLiturgicalSeason(date: Date): LiturgicalSeasonInfo {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const day = date.getDate();

  // Advent: Late Nov to Dec 24
  if ((month === 10 && day >= 27) || (month === 11 && day <= 24)) {
    return {
      seasonName: 'Advent Season',
      liturgicalColor: 'Violet / Purple',
      colorHex: '#8b5cf6',
      description: 'A holy season of joyful expectation, preparation, and spiritual readiness for the Nativity of Christ.',
      spiritualFocus: 'Hope, Peace, Joy, and Love',
    };
  }

  // Christmas Season: Dec 25 to Jan 6 (Epiphany)
  if ((month === 11 && day >= 25) || (month === 0 && day <= 6)) {
    return {
      seasonName: 'Christmas Season & Nativity',
      liturgicalColor: 'White & Gold',
      colorHex: '#f59e0b',
      description: 'The festive celebration of the Birth of Jesus Christ and the revelation of divine light to the world.',
      spiritualFocus: 'Goodwill to all humanity and celebration of life',
    };
  }

  // Lent season approx: Feb/March
  if (month === 2 || (month === 1 && day >= 15)) {
    return {
      seasonName: 'Holy Lent Season',
      liturgicalColor: 'Purple',
      colorHex: '#7c3aed',
      description: '40 days of prayer, fasting, introspection, and charitable deeds leading to Holy Week.',
      spiritualFocus: 'Repentance, humility, and self-discipline',
    };
  }

  // Easter season approx: April/May
  if (month === 3 && day >= 10) {
    return {
      seasonName: 'Easter Season (Resurrection)',
      liturgicalColor: 'White & Gold',
      colorHex: '#eab308',
      description: 'Triumph of life over darkness, celebrating the Resurrection and eternal hope.',
      spiritualFocus: 'New life, renewal, and radiant hope',
    };
  }

  // Ordinary Time
  return {
    seasonName: 'Ordinary Time (Kingdom Walk)',
    liturgicalColor: 'Green',
    colorHex: '#10b981',
    description: 'A season of steady spiritual growth, walking in grace, and applying teachings to daily life.',
    spiritualFocus: 'Patience, faithful service, and everyday wisdom',
  };
}

export interface ChristianObservance {
  id: string;
  name: string;
  dateStr: string; // YYYY-MM-DD
  season: string;
  description: string;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Meeus/Jones/Butcher Gregorian Easter Sunday algorithm.
 */
export function getGregorianEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/**
 * Computes key fixed and movable Christian calendar observances for a given year.
 */
export function getChristianObservancesForYear(year: number): ChristianObservance[] {
  const easter = getGregorianEasterSunday(year);
  const addDays = (base: Date, delta: number) =>
    new Date(base.getFullYear(), base.getMonth(), base.getDate() + delta);

  // First Sunday of Advent: Sunday nearest Nov 30 (Nov 27 .. Dec 3)
  const nov30 = new Date(year, 10, 30);
  const dayOfWeek = nov30.getDay(); // 0 = Sun
  const offsetToSunday = dayOfWeek <= 3 ? -dayOfWeek : 7 - dayOfWeek;
  const adventSunday = addDays(nov30, offsetToSunday);

  const items: ChristianObservance[] = [
    {
      id: `epiphany-${year}`,
      name: 'Epiphany',
      dateStr: `${year}-01-06`,
      season: 'Christmas & Epiphany',
      description: 'Celebrates the manifestation of Christ to the Magi and the nations.',
    },
    {
      id: `ash-wednesday-${year}`,
      name: 'Ash Wednesday',
      dateStr: toYMD(addDays(easter, -46)),
      season: 'Lent',
      description: 'First day of the 40-day Lenten season of prayer, reflection, and renewal.',
    },
    {
      id: `palm-sunday-${year}`,
      name: 'Palm Sunday',
      dateStr: toYMD(addDays(easter, -7)),
      season: 'Holy Week',
      description: 'Marks the beginning of Holy Week and Christ’s triumphant entry into Jerusalem.',
    },
    {
      id: `maundy-thursday-${year}`,
      name: 'Maundy Thursday',
      dateStr: toYMD(addDays(easter, -3)),
      season: 'Holy Week',
      description: 'Commemorates the Last Supper and the commandment of selfless service.',
    },
    {
      id: `good-friday-${year}`,
      name: 'Good Friday',
      dateStr: toYMD(addDays(easter, -2)),
      season: 'Holy Week',
      description: 'Solemn remembrance of the crucifixion and sacrifice of Jesus Christ.',
    },
    {
      id: `easter-sunday-${year}`,
      name: 'Easter Sunday',
      dateStr: toYMD(easter),
      season: 'Eastertide',
      description: 'Celebration of the Resurrection of Jesus Christ and new life.',
    },
    {
      id: `ascension-${year}`,
      name: 'Ascension Day',
      dateStr: toYMD(addDays(easter, 39)),
      season: 'Eastertide',
      description: 'Commemorates the Ascension of Christ 40 days after Easter.',
    },
    {
      id: `pentecost-${year}`,
      name: 'Pentecost Sunday',
      dateStr: toYMD(addDays(easter, 49)),
      season: 'Pentecost',
      description: 'Celebrates the descent of the Holy Spirit upon the disciples.',
    },
    {
      id: `all-saints-${year}`,
      name: "All Saints' Day",
      dateStr: `${year}-11-01`,
      season: 'Ordinary Time',
      description: 'Day of gratitude and remembrance for faithful witnesses across generations.',
    },
    {
      id: `first-advent-${year}`,
      name: 'First Sunday of Advent',
      dateStr: toYMD(adventSunday),
      season: 'Advent',
      description: 'Beginning of the liturgical year and the season of hopeful preparation.',
    },
    {
      id: `christmas-eve-${year}`,
      name: 'Christmas Eve',
      dateStr: `${year}-12-24`,
      season: 'Advent',
      description: 'Evening vigil of carols, candlelight services, and quiet anticipation.',
    },
    {
      id: `christmas-day-${year}`,
      name: 'Christmas Day',
      dateStr: `${year}-12-25`,
      season: 'Christmas',
      description: 'Celebration of the Nativity of Jesus Christ, peace, and goodwill.',
    },
  ];

  return items.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
}

/**
 * Returns any Christian observance matching the given date.
 */
export function getChristianObservancesForDate(date: Date): ChristianObservance[] {
  const ymd = toYMD(date);
  return getChristianObservancesForYear(date.getFullYear()).filter((o) => o.dateStr === ymd);
}

/**
 * Returns the next upcoming (or today's) Christian observance from a given date.
 */
export function getNextChristianObservance(date: Date): {
  observance: ChristianObservance;
  daysUntil: number;
} {
  const ymd = toYMD(date);
  const currentYearItems = getChristianObservancesForYear(date.getFullYear());
  const nextYearItems = getChristianObservancesForYear(date.getFullYear() + 1);
  const all = [...currentYearItems, ...nextYearItems];
  const next = all.find((o) => o.dateStr >= ymd) || nextYearItems[0];

  const [ny, nm, nd] = next.dateStr.split('-').map(Number);
  const targetMidnight = new Date(ny, nm - 1, nd).getTime();
  const curMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const daysUntil = Math.max(0, Math.round((targetMidnight - curMidnight) / 86400000));

  return { observance: next, daysUntil };
}

