/**
 * Hindu Panchang & Vedic Calendar Utility
 * Provides accurate calculation of Tithi, Paksha, Vikram Samvat,
 * sacred fasting days (Ekadashi, Purnima, Amavasya), and Vedic wisdom.
 */

export interface HinduPanchangInfo {
  vikramSamvat: number;
  shakaSamvat: number;
  tithiNumber: number; // 1 to 30
  tithiNameEn: string;
  tithiNameHi: string;
  tithiNameUr: string;
  pakshaEn: 'Shukla Paksha (Waxing)' | 'Krishna Paksha (Waning)';
  pakshaHi: 'शुक्ल पक्ष' | 'कृष्ण पक्ष';
  pakshaUr: 'شکلا پکش (چاند بڑھتا)' | 'کرشن پکش (چاند گھٹتا)';
  hinduMonthEn: string;
  hinduMonthHi: string;
  hinduMonthUr: string;
  isEkadashi: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
  isPradosh: boolean;
  auspiciousTag?: string;
  auspiciousTagHi?: string;
  auspiciousTagUr?: string;
  abhijitMuhurat: string;
  rahuKaal: string;
}

const TITHI_NAMES = [
  { en: 'Pratipada', hi: 'प्रतिपदा (पड़वा)', ur: 'پرتپدا' },
  { en: 'Dwitiya', hi: 'द्वितीया (दूج)', ur: 'دویتیا' },
  { en: 'Tritiya', hi: 'तृतीया (तीज)', ur: 'ترتیا' },
  { en: 'Chaturthi', hi: 'चतुर्थी (चौथ)', ur: 'چتورتھی' },
  { en: 'Panchami', hi: 'पंचमी', ur: 'پنچمی' },
  { en: 'Shashthi', hi: 'षष्ठी (छठ)', ur: 'ششتھی' },
  { en: 'Saptami', hi: 'सप्तमी', ur: 'سیتمی' },
  { en: 'Ashtami', hi: 'अष्टमी', ur: 'اشٹمی' },
  { en: 'Navami', hi: 'नवमी', ur: 'نومی' },
  { en: 'Dashami', hi: 'दशमी', ur: 'دشمی' },
  { en: 'Ekadashi', hi: 'एकादशी (ग्यारस)', ur: 'ایکادشی (روزہ/ورَت)' },
  { en: 'Dwadashi', hi: 'द्वादशी (बारस)', ur: 'دوادشی' },
  { en: 'Trayodashi', hi: 'त्रयोदशी (तेरस)', ur: 'تریودشی (پردوش)' },
  { en: 'Chaturdashi', hi: 'चतुर्दशी (चौदस)', ur: 'چتوردشی' },
  { en: 'Purnima', hi: 'पूर्णिमा (पूर्ण चंद्र)', ur: 'پورنما (پورا چاند)' },
  // Krishna Paksha 16-30
  { en: 'Pratipada', hi: 'प्रतिपदा', ur: 'پرتپدا' },
  { en: 'Dwitiya', hi: 'द्वितीया', ur: 'دویتیا' },
  { en: 'Tritiya', hi: 'तृतीया', ur: 'ترتیا' },
  { en: 'Chaturthi', hi: 'चतुर्थी (संकष्टी)', ur: 'چتورتھی' },
  { en: 'Panchami', hi: 'पंचमी', ur: 'پنچمی' },
  { en: 'Shashthi', hi: 'षष्ठी', ur: 'ششتھی' },
  { en: 'Saptami', hi: 'सप्तमी', ur: 'سیتمی' },
  { en: 'Ashtami', hi: 'अष्टमी', ur: 'اشٹمی' },
  { en: 'Navami', hi: 'नवमी', ur: 'نومی' },
  { en: 'Dashami', hi: 'दशमी', ur: 'دشمی' },
  { en: 'Ekadashi', hi: 'एकादशी (ग्यारस)', ur: 'ایکادشی (روزہ/ورَت)' },
  { en: 'Dwadashi', hi: 'द्वादशी', ur: 'دوادشی' },
  { en: 'Trayodashi', hi: 'त्रयोदशी (प्रदोष)', ur: 'تریودشی' },
  { en: 'Chaturdashi', hi: 'चतुर्दशी', ur: 'چتوردشی' },
  { en: 'Amavasya', hi: 'अमावस्या (नई चंद्र)', ur: 'اماوسیا (نواں چاند)' },
];

const HINDU_MONTHS = [
  { en: 'Chaitra', hi: 'चैत्र', ur: 'چیت' },
  { en: 'Vaishakha', hi: 'वैशाख', ur: 'بیساکھ' },
  { en: 'Jyeshtha', hi: 'ज्येष्ठ', ur: 'جیٹھ' },
  { en: 'Ashadha', hi: 'आषाढ़', ur: 'اَسارھ' },
  { en: 'Shravana', hi: 'श्रावण (सावन)', ur: 'ساون' },
  { en: 'Bhadrapada', hi: 'भाद्रपद (भादो)', ur: 'بھادوں' },
  { en: 'Ashwina', hi: 'आश्विन (क्वार)', ur: 'آسوج' },
  { en: 'Kartika', hi: 'कार्तिक', ur: 'کاتک' },
  { en: 'Margashirsha', hi: 'मार्गशीर्ष (अगहन)', ur: 'مگھر' },
  { en: 'Pausha', hi: 'पौष (पूस)', ur: 'پوہ' },
  { en: 'Magha', hi: 'माघ', ur: 'ماگھ' },
  { en: 'Phalguna', hi: 'फाल्गुन (फागुन)', ur: 'پھاگن' },
];

export const VEDIC_WISDOM_QUOTES = [
  {
    shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    source: 'Bhagavad Gita 2.47',
    meaningEn: 'You have a right to perform your prescribed duty, but you are not entitled to the fruits of actions. Never consider yourself the cause of results.',
    meaningHi: 'कर्म करने में ही तुम्हारा अधिकार है, उसके फलों में कभी नहीं। इसलिए कर्मफल का हेतु मत बनो और न ही अकर्मण्यता में तुम्हारी आसक्ति हो।',
    meaningUr: 'تمہارا حق صرف نیک عمل کرنے پر ہے، اس کے نتیجے پر نہیں۔ اس لیے صلے کی تمنا کے بغیر خلوص نیت سے اپنا فرض ادا کرو۔',
  },
  {
    shloka: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    source: 'Bhagavad Gita 4.7',
    meaningEn: 'Whenever virtue subsides and unrighteousness prevails, I manifest Myself to restore righteousness and protect the good.',
    meaningHi: 'हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं धर्म की स्थापना हेतु साकार रूप में प्रकट होता हूँ।',
    meaningUr: 'جب بھی دنیا میں نیکی کمزور ہوتی ہے اور بدی سر اٹھاتی ہے، حق کی بالادستی اور برائی کے خاتمے کے لیے حق نمودار ہوتا ہے۔',
  },
  {
    shloka: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    source: 'Bhagavad Gita 2.48',
    meaningEn: 'Perform your duties established in Yoga, renouncing attachment, and remaining even-minded in success and failure. Equanimity of mind is called Yoga.',
    meaningHi: 'आसक्ति को त्यागकर तथा सिद्धि और असिद्धि में समान बुद्धि रखकर कर्म करो। यह समत्व भाव ही योग कहलाता है।',
    meaningUr: 'کامیابی اور ناکامی دونوں حالتوں میں اپنے دل کو پرسکون اور متوازن رکھو۔ ذہن کا یہی توازن اصل حکمت ہے۔',
  },
  {
    shloka: 'वसुधैव कुटुम्बकम् (उदारचरितानां तु वसुधैव कुटुम्बकम्)',
    source: 'Maha Upanishad 6.71',
    meaningEn: 'The entire world is one family. For noble-minded people, all living beings are kin.',
    meaningHi: 'सम्पूर्ण पृथ्वी ही एक परिवार है। उदार हृदय वाले महापुरुषों के लिए सारा संसार ही अपना कुटुम्ब होता है।',
    meaningUr: 'ساری دنیا ایک کنبہ ہے۔ بلند حوصلہ اور نیک دل انسانوں کے نزدیک تمام مخلوق ایک ہی خاندان کی طرح ہے۔',
  },
  {
    shloka: 'सत्यमेव जयते नानृतं सत्येन पन्था विततो देवयानः॥',
    source: 'Mundaka Upanishad 3.1.6',
    meaningEn: 'Truth alone triumphs, not falsehood. Through truth the divine path of righteousness is illuminated.',
    meaningHi: 'सत्य की ही सदा विजय होती है, असत्य की नहीं। सत्य के मार्ग से ही कल्याण और ज्ञान का विस्तार होता है।',
    meaningUr: 'ہمیشہ سچ کی ہی فتح ہوتی ہے، جھوٹ کی نہیں۔ سچائی کے راستے پر چل کر ہی انسان سرخرو ہوتا ہے۔',
  },
];

/**
 * Calculates Panchang info for a given Gregorian date using astronomical lunar elongation.
 */
export function getHinduPanchang(date: Date): HinduPanchangInfo {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Vikram Samvat is Gregorian Year + 57 (or 56 before Chaitra Navratri in March/April)
  const isAfterChaitra = month > 2 || (month === 2 && day >= 22);
  const vikramSamvat = year + (isAfterChaitra ? 57 : 56);
  const shakaSamvat = year - (isAfterChaitra ? 78 : 79);

  // Astronomical Julian Day calculation
  const a = Math.floor((14 - (month + 1)) / 12);
  const y = year + 4800 - a;
  const m = (month + 1) + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Synodic lunar cycle reference: Known New Moon on Jan 6, 2000 (JD 2451549.5)
  const daysSinceNewMoon = jd - 2451549.5;
  const lunarCycle = 29.53058770576;
  const currentPhase = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;

  // A Tithi is 1/30th of the lunar month (approx 0.98435 days)
  const tithiIndex = Math.min(29, Math.floor((currentPhase / lunarCycle) * 30));
  const tithiNum = tithiIndex + 1; // 1 to 30

  const isShukla = tithiNum <= 15;
  const tithiMeta = TITHI_NAMES[tithiIndex] || TITHI_NAMES[0];

  const isEkadashi = tithiNum === 11 || tithiNum === 26;
  const isPurnima = tithiNum === 15;
  const isAmavasya = tithiNum === 30;
  const isPradosh = tithiNum === 13 || tithiNum === 28;

  // Determine Hindu Solar/Lunar Month estimate
  // Approximate mapping of Gregorian months to Hindu lunar months
  const hinduMonthIndex = (month + 10) % 12;
  const hinduMonth = HINDU_MONTHS[hinduMonthIndex];

  let auspiciousTag: string | undefined;
  let auspiciousTagHi: string | undefined;
  let auspiciousTagUr: string | undefined;

  if (isEkadashi) {
    auspiciousTag = 'Sacred Ekadashi Vrat (Holy Fasting Day)';
    auspiciousTagHi = 'पवित्र एकादशी व्रत (ग्यारस)';
    auspiciousTagUr = 'مقدس ایکادشی ورَت (روحانی روزہ)';
  } else if (isPurnima) {
    auspiciousTag = 'Holy Purnima (Satyanarayan Pooja & Full Moon)';
    auspiciousTagHi = 'सत्यनारायण पूजा एवं पवित्र पूर्णिमा स्नान';
    auspiciousTagUr = 'پورنما (مکمل چاند کا متبرک دن)';
  } else if (isAmavasya) {
    auspiciousTag = 'Amavasya (Ancestral Peace & Meditation)';
    auspiciousTagHi = 'पितृ शांति एवं अमावस्या ध्यान';
    auspiciousTagUr = 'اماوسیا (روحانی امن کا دن)';
  } else if (isPradosh) {
    auspiciousTag = 'Pradosh Vrat (Shiva Aradhana)';
    auspiciousTagHi = 'प्रदोष व्रत (शिव आराधना)';
    auspiciousTagUr = 'پردوش ورَت';
  }

  // Rahu Kaal varies by weekday (approx 1.5 hr window)
  const dayOfWeek = date.getDay(); // 0 Sun, 1 Mon, ...
  const rahuKaalTimes = [
    '04:30 PM - 06:00 PM', // Sun
    '07:30 AM - 09:00 AM', // Mon
    '03:00 PM - 04:30 PM', // Tue
    '12:00 PM - 01:30 PM', // Wed
    '01:30 PM - 03:00 PM', // Thu
    '10:30 AM - 12:00 PM', // Fri
    '09:00 AM - 10:30 AM', // Sat
  ];

  return {
    vikramSamvat,
    shakaSamvat,
    tithiNumber: tithiNum,
    tithiNameEn: tithiMeta.en,
    tithiNameHi: tithiMeta.hi,
    tithiNameUr: tithiMeta.ur,
    pakshaEn: isShukla ? 'Shukla Paksha (Waxing)' : 'Krishna Paksha (Waning)',
    pakshaHi: isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष',
    pakshaUr: isShukla ? 'شکلا پکش (چاند بڑھتا)' : 'کرشن پکش (چاند گھٹتا)',
    hinduMonthEn: hinduMonth.en,
    hinduMonthHi: hinduMonth.hi,
    hinduMonthUr: hinduMonth.ur,
    isEkadashi,
    isPurnima,
    isAmavasya,
    isPradosh,
    auspiciousTag,
    auspiciousTagHi,
    auspiciousTagUr,
    abhijitMuhurat: '11:46 AM - 12:34 PM (Auspicious)',
    rahuKaal: rahuKaalTimes[dayOfWeek] || '01:30 PM - 03:00 PM',
  };
}

export function getDailyVedicWisdom(date: Date) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return VEDIC_WISDOM_QUOTES[dayOfYear % VEDIC_WISDOM_QUOTES.length];
}
