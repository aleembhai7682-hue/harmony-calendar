import { IndianFestival, Language } from '../types/calendar';
import { getFestivalsForDate } from './indianFestivals';

export interface FridayFestivalCoincidence {
  isCoincidence: boolean;
  festivalNameEn: string;
  festivalNameUr: string;
  festivalNameHi: string;
  warningEn: string;
  warningUr: string;
  warningHinglish: string;
}

/**
 * Checks if a sensitive major festival (e.g. Holi, Holika Dahan) falls on a Friday (Jummah)
 * to provide a helpful communal harmony and timing advisory alert.
 */
export function checkFridayFestivalCoincidence(date: Date): FridayFestivalCoincidence | null {
  const isFriday = date.getDay() === 5;
  if (!isFriday) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  // Check all festivals regardless of user filter
  const festivals = getFestivalsForDate(dateStr);
  const holiMatch = festivals.find(
    (f) =>
      f.id.includes('holi') ||
      f.nameEn.toLowerCase().includes('holi') ||
      f.nameEn.toLowerCase().includes('dhulandi')
  );

  if (holiMatch) {
    return {
      isCoincidence: true,
      festivalNameEn: holiMatch.nameEn,
      festivalNameUr: holiMatch.nameUr || 'ہولی (رنگوں کا تہوار)',
      festivalNameHi: holiMatch.nameHi,
      warningEn: '⚠️ Advisory: Friday Jummah prayer coincides with Holi festivities. Please verify local mosque prayer timings and maintain peaceful harmony.',
      warningUr: '🚨 انتباہ: جمعۃ المبارک اور ہولی کا تہوار ایک ہی دن ہے۔ نمازِ جمعہ کے اوقات اور باہمی امن و ہم آہنگی کا خاص خیال رکھیں۔',
      warningHinglish: '⚠️ Alert: Jummah aur Holi ek hi din hain. Masjid me namaz ke waqt aur aman-o-aman ka dhyan rakhein.',
    };
  }

  return null;
}
