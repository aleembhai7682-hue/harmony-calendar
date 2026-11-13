import { HijriDateInfo, IslamicOccasion, PrayerTimes } from '../types/calendar';

export interface HijriMonthMeta {
  index: number; // 1-12
  nameEn: string;
  nameAr: string;
  nameHi: string;
  nameUr: string;
  isSacred: boolean;
}

export const HIJRI_MONTHS: HijriMonthMeta[] = [
  { index: 1, nameEn: 'Muharram', nameAr: 'مُحَرَّم', nameHi: 'मुहर्रम', nameUr: 'محرم الحرام', isSacred: true },
  { index: 2, nameEn: 'Safar', nameAr: 'صَفَر', nameHi: 'सफ़र', nameUr: 'صفر المظفر', isSacred: false },
  { index: 3, nameEn: "Rabi' al-Awwal", nameAr: 'رَبِيع ٱلْأَوَّل', nameHi: 'रबीउल अव्वल', nameUr: 'ربیع الاول', isSacred: false },
  { index: 4, nameEn: "Rabi' al-Thani", nameAr: 'رَبِيع ٱلثَّانِي', nameHi: 'रबीउल आख़िर', nameUr: 'ربیع الثانی', isSacred: false },
  { index: 5, nameEn: 'Jumada al-Ula', nameAr: 'جُمَادَىٰ ٱلْأُولَىٰ', nameHi: 'जुमादा अल-ऊला', nameUr: 'جمادی الاولیٰ', isSacred: false },
  { index: 6, nameEn: 'Jumada al-Akhirah', nameAr: 'جُمَادَىٰ ٱلْآخِرَة', nameHi: 'जुमादा अल-आख़िरा', nameUr: 'جمادی الاخریٰ', isSacred: false },
  { index: 7, nameEn: 'Rajab', nameAr: 'رَجَب', nameHi: 'रजब', nameUr: 'رجب المرجب', isSacred: true },
  { index: 8, nameEn: "Sha'ban", nameAr: 'شَعْبَان', nameHi: 'शाबान', nameUr: 'شعبان المعظم', isSacred: false },
  { index: 9, nameEn: 'Ramadan', nameAr: 'رَمَضَان', nameHi: 'रमज़ान', nameUr: 'رمضان المبارک', isSacred: false },
  { index: 10, nameEn: 'Shawwal', nameAr: 'شَوَّال', nameHi: 'शव्वाल', nameUr: 'شوال المکرم', isSacred: false },
  { index: 11, nameEn: "Dhu al-Qi'dah", nameAr: 'ذُو ٱلْقَعْدَة', nameHi: 'ज़ुल-क़ादा', nameUr: 'ذوالقعدۃ', isSacred: true },
  { index: 12, nameEn: 'Dhu al-Hijjah', nameAr: 'ذُو ٱلْحِجَّة', nameHi: 'ज़ुल-हिज्जा', nameUr: 'ذوالحجۃ', isSacred: true },
];

/**
 * Astronomical conversion from Gregorian to Islamic (Hijri)
 * Based on the Kuwati / Umm al-Qura standard algorithm,
 * works dynamically across any year (2024 to 2050+),
 * with adjustable day offset for local moon sighting (Hilal).
 */
export function getHijriDate(date: Date, offsetDays: number = 0): HijriDateInfo {
  const adjusted = new Date(date.getTime() + offsetDays * 86400000);
  
  let day = adjusted.getDate();
  let month = adjusted.getMonth();
  let year = adjusted.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  
  // Julian Day to Hijri conversion
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  let hMonth = Math.floor((24 * l3) / 709);
  let hDay = l3 - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  if (hDay === 0) {
    hDay = 30;
    hMonth -= 1;
  }
  if (hMonth === 0) {
    hMonth = 12;
    hYear -= 1;
  }
  if (hMonth > 12) {
    hMonth = 1;
    hYear += 1;
  }

  const monthMeta = HIJRI_MONTHS[hMonth - 1] || HIJRI_MONTHS[0];

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthNameEn: monthMeta.nameEn,
    monthNameAr: monthMeta.nameAr,
    monthNameHi: monthMeta.nameHi,
    monthNameUr: monthMeta.nameUr,
    formattedEn: `${hDay} ${monthMeta.nameEn} ${hYear} AH`,
    formattedHi: `${hDay} ${monthMeta.nameHi} ${hYear} हिजरी`,
    formattedUr: `${hDay} ${monthMeta.nameUr} ${hYear} ھ`,
    isEstimated: true,
  };
}

export const ISLAMIC_OCCASIONS_DEFINITIONS: Omit<IslamicOccasion, 'estimatedDate'>[] = [
  {
    id: 'islamic-new-year',
    nameEn: 'Islamic New Year (Al-Hijra)',
    nameAr: 'رأس السنة الهجرية',
    nameHi: 'इस्लामी नववर्ष (हिजरी नया साल)',
    nameUr: 'نیا اسلامی سال (رأس السنۃ الهجریۃ)',
    hijriMonth: 1,
    hijriDay: 1,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The beginning of the Islamic lunar calendar year, commemorating the historic migration (Hijrah) of Prophet Muhammad (PBUH) from Mecca to Medina in 622 CE.',
    descriptionHi: 'इस्लामी चंद्र वर्ष का पहला दिन, जो 622 ईस्वी में पैगंबर हज़रत मुहम्मद (स.) के मक्का से मदीना हिजरत (प्रवासन) की याद में मनाया जाता है।',
    descriptionUr: 'اسلامی سال کا پہلا مبارک دن، جو 622ء میں حضور اکرم صلی اللہ علیہ وسلم کے مکہ مکرمہ سے مدینہ منورہ ہجرت کی یاد دلاتا ہے۔',
    spiritualSignificance: 'Marks a time of self-reflection, spiritual renewal, and intention-setting for the year ahead.',
    practices: ['Special prayers and Dua for peace', 'Recitation of Quran', 'Charity (Sadaqah)', 'Fasting recommended during sacred Muharram'],
  },
  {
    id: 'ashura',
    nameEn: 'Day of Ashura',
    nameAr: 'يوم عاشوراء',
    nameHi: 'यौम-ए-आशूरा (10 मुहर्रम)',
    nameUr: 'یومِ عاشورہ (10 محرم الحرام - شہادتِ امام حسینؓ)',
    hijriMonth: 1,
    hijriDay: 10,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The 10th day of Muharram. A profound day of remembrance for the supreme sacrifice and martyrdom of Imam Hussain (RA), grandson of Prophet Muhammad (PBUH), at the Battle of Karbala. Also commemorates the deliverance of Prophet Moses (Musa) from Pharaoh.',
    descriptionHi: 'मुहर्रम की 10वीं तारीख। कर्बला के मैदान में पैगंबर के नवासे हज़रत इमाम हुसैन (र.अ.) और उनके साथियों की शहादत का गम व स्मरण दिवस।',
    descriptionUr: 'محرم الحرام کی دسویں تاریخ، میدانِ کربلا میں نواسۂ رسول حضرت امام حسین رضی اللہ عنہ اور ان کے باوفا رفقاء کی عظیم الشان شہادت کا یادگار دن اور حضرت موسیٰ علیہ السلام کی فرعون سے نجات کا دن۔',
    spiritualSignificance: 'Standing up for truth, justice, dignity, and unwavering faith in the face of tyranny.',
    practices: ['Voluntary fasting on 9th & 10th (or 10th & 11th)', 'Majalis and mourning gatherings (Tazia processions)', 'Sabeel (water distribution)', 'Generosity to family and the needy'],
  },
  {
    id: 'eid-e-milad',
    nameEn: 'Eid-e-Milad-un-Nabi (Mawlid)',
    nameAr: 'المولد النبوي الشريف',
    nameHi: 'ईद-ए-मिलादुन्नबी (पैगंबर जन्मदिवस)',
    nameUr: 'عید میلاد النبی ﷺ (جشنِ ولادتِ باسعادت)',
    hijriMonth: 3,
    hijriDay: 12,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'Celebration of the birth anniversary of Prophet Muhammad (PBUH), the final Messenger of Islam, recognized for preaching compassion, peace, and universal brotherhood.',
    descriptionHi: 'इस्लाम के अंतिम पैगंबर हज़रत मुहम्मद मुस्तफ़ा (स.) की विलादत (जन्म) की मुबारक तारीख, जो अमन, रहमत और भाईचारे का संदेश देती है।',
    descriptionUr: 'سرورِ کائنات، رحمت اللعالمین حضرت محمد مصطفیٰ صلی اللہ علیہ وسلم کی ولادتِ با سعادت کا پرنور اور بابرکت دن۔',
    spiritualSignificance: 'Expressing gratitude for the mercy and light bestowed upon humanity through the Prophet.',
    practices: ['Seerat-un-Nabi gatherings', 'Darood and Salaam recitations', 'Illuminating homes and mosques', 'Feeding the poor and communal feasts'],
  },
  {
    id: 'shab-e-meraj',
    nameEn: "Shab-e-Meraj (Al-Isra wal-Mi'raj)",
    nameAr: 'الإسراء والمعراج',
    nameHi: 'शब-ए-मेराज (आसमानी सफ़र की रात)',
    nameUr: 'شبِ معراج (واقعۂ اسراء و معراج النبی ﷺ)',
    hijriMonth: 7,
    hijriDay: 27,
    isMajor: false,
    isMoonSightingDependent: true,
    descriptionEn: 'The miraculous night journey of Prophet Muhammad (PBUH) from the Sacred Mosque in Mecca to Al-Aqsa Mosque in Jerusalem, and his ascension through the Seven Heavens into the Divine Presence, where five daily prayers were ordained.',
    descriptionHi: 'पैगंबर मुहम्मद (स.) की मक्का से मस्जिद-ए-अक़्सा और वहां से सात आसमानों की अलौकिक यात्रा की रात, जिसमें मुसलमानों पर 5 वक्त की नमाज़ फ़र्ज़ हुई।',
    descriptionUr: 'حضور اکرم ﷺ کے مسجد حرام سے مسجد اقصی اور وہاں سے ساتوں آسمانوں کی سیر اور قربِ خداوندی پانے کا معجزاتی شبینہ سفر، جس میں پانچ وقت کی نماز کا تحفہ عطا ہوا۔',
    spiritualSignificance: 'The ultimate gift of prayer (Salah) as a direct spiritual ascension (Mi\'raj) for every believer.',
    practices: ['Night vigil (Nafal prayers)', 'Fasting the preceding or following day', 'Recitation of Surah Al-Isra', 'Seeking divine nearness'],
  },
  {
    id: 'shab-e-barat',
    nameEn: "Shab-e-Barat (Laylat al-Bara'at)",
    nameAr: 'ليلة البراءة',
    nameHi: 'शब-ए-बरात (मग़फ़िरत व रहमत की रात)',
    nameUr: 'شبِ برات (لیلۃ البراءۃ - مغفرت و رحمت کی رات)',
    hijriMonth: 8,
    hijriDay: 15,
    isMajor: false,
    isMoonSightingDependent: true,
    descriptionEn: 'The Night of Forgiveness, Records, and Salvation. Believed to be a blessed night when Allah determines fortunes, sustenance, and lifespan for the coming year, forgiving sincere seekers of repentance.',
    descriptionHi: 'क्षमादान, मग़फ़िरत और तक़दीर की रात। इसमें इंसान के कर्मों का लेखा-जोखा तैयार होता है और सच्चे दिल से तौबा करने वालों की दुआएं क़बूल होती हैं।',
    descriptionUr: 'بخشش، نجات اور مغفرت کی مبارک رات جس میں بندوں کے رزق اور زندگی کے فیصلے ہوتے ہیں اور توبہ کرنے والوں کی دعائیں قبول ہوتی ہیں۔',
    spiritualSignificance: 'Preparing the heart and soul for the arrival of the blessed month of Ramadan.',
    practices: ['Night vigil (Tahajjud & Istighfar)', 'Visiting cemeteries (Qabristan) to pray for departed souls', 'Distributing Halwa and charity', 'Fasting on 15th Sha\'ban'],
  },
  {
    id: 'ramadan-start',
    nameEn: 'First Day of Holy Ramadan (Ramazan)',
    nameAr: 'بداية شهر رمضان المبارك',
    nameHi: 'माह-ए-रमज़ान मुबारक का आग़ाज़',
    nameUr: 'پہلا روزہ و آغازِ رمضان المبارک',
    hijriMonth: 9,
    hijriDay: 1,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The beginning of the ninth and holiest month of the Islamic calendar, in which the Holy Quran was revealed. Muslims observe dawn-to-sunset fasting (Roza), increased devotion, and self-restraint.',
    descriptionHi: 'इस्लाम के सबसे मुक़द्दस माह रमज़ान का पहला रोज़ा। यह महीना सब्र, इबादत, क़ुरआन की तिलावत और आत्म-शुद्धि का प्रतीक है।',
    descriptionUr: 'قرآن مجید کے نزول کا مقدس مہینہ، جس میں صبح صادق سے غروب آفتاب تک روزہ، تراویح اور تلاوتِ کلام پاک کی خصوصی پابندی کی جاتی ہے۔',
    spiritualSignificance: 'Purification of soul, empathy for the underprivileged, and cultivating God-consciousness (Taqwa).',
    practices: ['Daily Roza (fasting from Sehri to Iftar)', 'Nightly Taraweeh congregational prayers', 'Recitation of the entire Quran', 'Zakat and generous charity'],
  },
  {
    id: 'laylat-al-qadr',
    nameEn: 'Laylat al-Qadr (Shab-e-Qadr - Night of Power)',
    nameAr: 'ليلة القدر',
    nameHi: 'शब-ए-क़द्र (हज़ार महीनों से बेहतर रात)',
    nameUr: 'شبِ قدر (لیلۃ القدر - ہزار مہینوں سے افضل رات)',
    hijriMonth: 9,
    hijriDay: 27,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The Night of Decree and Power, commemorated mainly on the 27th night of Ramadan (and sought in the odd nights of the last 10 days). Better than a thousand months according to Surah Al-Qadr.',
    descriptionHi: 'सूरह अल-क़द्र के अनुसार यह रात "हज़ार महीनों से उत्तम" है, जिसमें क़ुरआन का नाज़िल होना शुरू हुआ। इबादत और मग़फ़िरत की सबसे बड़ी रात।',
    descriptionUr: 'قرآن کریم کی رو سے ہزار مہینوں سے افضل ترین رات جس میں فرشتوں کا نزول ہوتا ہے اور گناہوں کی معافی اور دعائیں قبول ہوتی ہیں۔',
    spiritualSignificance: 'One night of prayer equals more than 83 years of continuous worship; immense divine mercy.',
    practices: ['Full night vigil in mosques (Qiyam-ul-Layl)', 'Dua: Allahumma innaka \'afuwwun tuhibbul-\'afwa fa\'fu \'anni', 'Itikaf (spiritual retreat) in the mosque', 'Intense supplication'],
  },
  {
    id: 'alvida-jumma',
    nameEn: "Jumat-ul-Wida (Alvida Jumma)",
    nameAr: 'جمعة الوداع',
    nameHi: 'अलविदा जुम्मा (रमज़ान का अंतिम शुक्रवार)',
    nameUr: 'جمعۃ الوداع (رمضان المبارک کا آخری جمعہ)',
    hijriMonth: 9,
    hijriDay: 29,
    isMajor: false,
    isMoonSightingDependent: true,
    descriptionEn: 'The Farewell Friday of the holy month of Ramadan. Huge congregations gather across mosques in India for Friday prayers with deep gratitude and prayers for global peace.',
    descriptionHi: 'पवित्र रमज़ान का आख़िरी जुम्मा (शुक्रवार)। मस्जिदों में भारी संख्या में नमाज़ी एकत्र होते हैं और मुल्क व इंसानियत की सलामती की दुआ मांगते हैं।',
    descriptionUr: 'ماہِ صیام کا الوداعی جمعہ، مساجد میں عظیم الشان اجتماعات اور امت و عالم کے لیے خصوصی دعائیں کی جاتی ہیں۔',
    spiritualSignificance: 'Bidding farewell to the blessings of Ramadan and praying for acceptance of all deeds.',
    practices: ['Massive Juma prayers in Jamia Masjids', 'Special sermons on retaining Ramadan values', 'Generous donations before Eid'],
  },
  {
    id: 'eid-ul-fitr',
    nameEn: 'Eid-ul-Fitr (Meethi Eid)',
    nameAr: 'عيد الفطر المبارك',
    nameHi: 'ईद-उल-फ़ितर (मीठी ईद)',
    nameUr: 'عید الفطر المبارک (میٹھی عید)',
    hijriMonth: 10,
    hijriDay: 1,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The joyous Festival of Breaking the Fast, celebrating the successful completion of the month-long Ramadan spiritual trial. Commences with sighting of the Shawwal crescent (Chand Raat).',
    descriptionHi: 'रमज़ान के 30 दिनों के रोज़ों के मुकम्मल होने पर ख़ुशी और अल्लाह का शुक्र अदा करने का त्यौहार। मीठी सेवइयां, नए कपड़े, ईदी और गले मिलकर मुबारकबाद।',
    descriptionUr: 'ماہِ رمضان کے روزوں کے اختتام پر شکر گزاری اور مسرت کا عظیم اسلامی تہوار، صدقۂ فطر، شیر خرمہ، نمازِ عید اور باہمی محبت کا اظہار۔',
    spiritualSignificance: 'Gratitude, forgiveness, familial unity, and ensuring no poor person goes hungry via Sadaqat-ul-Fitr.',
    practices: ['Payment of Fitra (mandatory charity) before prayer', 'Special morning Eid prayer at Eidgah/Mosque', 'Sheer Khurma and sweet delicacies', 'Eidi gifts to children and elders'],
  },
  {
    id: 'day-of-arafah',
    nameEn: "Day of Arafah (Hajj Apex Day)",
    nameAr: 'يوم عرفة',
    nameHi: 'यौम-ए-अराफ़ात (हज का सर्वोच्च दिन)',
    nameUr: 'یومِ عرفہ (حج کا عظیم ترین رکن)',
    hijriMonth: 12,
    hijriDay: 9,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The pinnacle day of the sacred Hajj pilgrimage where millions of pilgrims stand on the plains of Mount Arafat in prayer. For non-pilgrims worldwide, fasting on this day expiates sins of two years.',
    descriptionHi: 'हज का सबसे महत्वपूर्ण दिन जब लाखों हाजी मैदान-ए-अराफ़ात में दुआएं करते हैं। इस दिन रोज़ा रखना दो साल के गुनाहों की माफ़ी का सबब है।',
    descriptionUr: 'حج کا سب سے بڑا دن جب عازمین میدانِ عرفات میں وقوف کرتے ہیں۔ غیر حاجیوں کے لیے اس دن کا روزہ دو سالوں کے گناہوں کا کفارہ ہے۔',
    spiritualSignificance: 'A day of maximum divine forgiveness and liberation from distress.',
    practices: ['Sunnah fasting for non-pilgrims', 'Extensive Dua and Istighfar', 'Takbeerat-e-Tashreeq starts after Fajr'],
  },
  {
    id: 'eid-ul-adha',
    nameEn: 'Eid-ul-Adha (Bakrid / Feast of Sacrifice)',
    nameAr: 'عيد الأضحى المبارك',
    nameHi: 'ईद-उल-अज़हा (बकरीद / क़ुर्बानी की ईद)',
    nameUr: 'عید الاضحیٰ (بقر عید - قربانی کی عید)',
    hijriMonth: 12,
    hijriDay: 10,
    isMajor: true,
    isMoonSightingDependent: true,
    descriptionEn: 'The major Festival of Sacrifice honoring Prophet Ibrahim\'s (Abraham) willingness to sacrifice his son in obedience to God\'s command. Concludes the annual Hajj pilgrimage.',
    descriptionHi: 'हज़रत इब्राहिम (अ.स.) की असीम निष्ठा व आज्ञाकारिता की याद में मनाया जाने वाला पर्व। क़ुर्बानी का गोश्त गरीबों, रिश्तेदारों में बांटा जाता है।',
    descriptionUr: 'حضرت ابراہیم علیہ السلام اور حضرت اسماعیل علیہ السلام کی لازوال قربانی کی یاد میں سنتِ ابراہیمی ادا کرنے کا مبارک دن۔',
    spiritualSignificance: 'Absolute devotion, sacrifice of ego and material attachments for the sake of the Creator.',
    practices: ['Eid prayer at morning', 'Qurbani (sacrificing livestock for charity)', 'Distributing meat to poor, relatives and home', 'Takbeerat after every obligatory prayer'],
  },
];

export function getIslamicOccasionForDate(date: Date, offsetDays: number = 0): IslamicOccasion | null {
  const hijri = getHijriDate(date, offsetDays);
  const match = ISLAMIC_OCCASIONS_DEFINITIONS.find(
    (occ) => occ.hijriMonth === hijri.month && occ.hijriDay === hijri.day
  );

  if (!match) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  return {
    ...match,
    estimatedDate: dateStr,
  };
}

export function getMoonPhase(date: Date): { phase: number; nameEn: string; nameHi: string; nameUr: string; icon: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let c = 0;
  let e = 0;
  let jd = 0;

  if (month < 3) {
    const y = year - 1;
    const m = month + 12;
    c = 365.25 * y;
    e = 30.6 * m;
  } else {
    c = 365.25 * year;
    e = 30.6 * (month + 1);
  }

  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  const b = parseInt(jd.toString());
  jd -= b;
  let phaseNum = Math.round(jd * 8);
  if (phaseNum >= 8) phaseNum = 0;

  switch (phaseNum) {
    case 0:
      return { phase: jd, nameEn: 'New Moon (Hilal)', nameHi: 'नया चांद (हिलाल)', nameUr: 'ہلال (نیا چاند)', icon: '🌑' };
    case 1:
      return { phase: jd, nameEn: 'Waxing Crescent', nameHi: 'बालचंद्र', nameUr: 'ہلال افزائش', icon: '🌒' };
    case 2:
      return { phase: jd, nameEn: 'First Quarter', nameHi: 'प्रथम चरण', nameUr: 'پہلا چوتھائی', icon: '🌓' };
    case 3:
      return { phase: jd, nameEn: 'Waxing Gibbous', nameHi: 'शुक्ल एकादशी', nameUr: 'قریب بدر', icon: '🌔' };
    case 4:
      return { phase: jd, nameEn: 'Full Moon (Badr)', nameHi: 'पूर्णिमा (बद्र)', nameUr: 'بدر (چودہویں کا چاند)', icon: '🌕' };
    case 5:
      return { phase: jd, nameEn: 'Waning Gibbous', nameHi: 'कृष्ण प्रतिपदा', nameUr: 'گھٹتا چاند', icon: '🌖' };
    case 6:
      return { phase: jd, nameEn: 'Last Quarter', nameHi: 'अंतिम चरण', nameUr: 'آخری چوتھائی', icon: '🌗' };
    case 7:
    default:
      return { phase: jd, nameEn: 'Waning Crescent', nameHi: 'कृष्ण त्रयोदशी', nameUr: 'ہلال محاق', icon: '🌘' };
  }
}

import { calculateLocationPrayerTimes, PrayerCalculationOptions } from './prayerTimes';

/**
 * Estimates prayer times and Sehri/Iftar for any date using selected location or device timezone.
 */
export function getPrayerTimes(
  date: Date,
  options: PrayerCalculationOptions = {}
): PrayerTimes {
  return calculateLocationPrayerTimes(date, options).times;
}

/**
 * Inspirational daily spiritual Hadith or Ayat
 */
export function getDailyWisdom(date: Date): { textUr: string; textEn: string; source: string } {
  const quotes = [
    {
      textUr: 'نماز میری آنکھوں کی ٹھنڈک ہے۔',
      textEn: 'Prayer is the coolness of my eyes.',
      source: 'سنن نسائی (Hadith)',
    },
    {
      textUr: 'تم میں سے بہترین وہ ہے جو دوسروں کو نفع پہنچائے۔',
      textEn: 'The best of people are those that bring most benefit to others.',
      source: 'طبرانی (Hadith)',
    },
    {
      textUr: 'بے شک تنگی کے ساتھ آسانی ہے۔',
      textEn: 'Verily, along with every hardship comes ease.',
      source: 'سورۃ الشرح (Al-Quran 94:6)',
    },
    {
      textUr: 'مسکرا کر ملنا بھی صدقہ ہے۔',
      textEn: 'Smiling at your brother is an act of charity.',
      source: 'جامع ترمذی (Hadith)',
    },
    {
      textUr: 'اللہ تعالیٰ کے ذکر سے ہی دلوں کو سکون ملتا ہے۔',
      textEn: 'Verily, in the remembrance of Allah do hearts find rest.',
      source: 'سورۃ الرعد (Al-Quran 13:28)',
    },
  ];

  const idx = Math.abs((date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate()) % quotes.length);
  return quotes[idx];
}
