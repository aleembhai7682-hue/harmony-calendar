import React, { useState, useEffect } from 'react';
import { Language } from '../types/calendar';
import { getHijriDate, getDailyWisdom } from '../utils/hijri';
import { getNowInIST, formatISTTime } from '../utils/istTime';
import { calculateLocationPrayerTimes, DetailedPrayerInfo } from '../utils/prayerTimes';
import {
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Moon,
  BookOpen,
  MapPin,
  Volume2,
  Compass,
} from 'lucide-react';

interface IslamicPrayerWidgetProps {
  currentDate: Date;
  hijriOffset?: number;
  language?: Language;
  selectedCity?: string;
  customLat?: number;
  customLon?: number;
  prayerMethod?: 'karachi' | 'mwl' | 'makkah' | 'egypt';
  asrMethod?: 'hanafi' | 'standard';
}

interface PrayerSlot {
  id: string;
  nameEn: string;
  nameHinglish: string;
  nameUr: string;
  nameAr: string;
  timeStr: string; // HH:mm
  minutesFromMidnight: number;
  isJummah?: boolean;
}

export const IslamicPrayerWidget: React.FC<IslamicPrayerWidgetProps> = ({
  currentDate,
  hijriOffset = 0,
  language = 'en',
  selectedCity = 'mumbai',
  customLat,
  customLon,
  prayerMethod = 'karachi',
  asrMethod = 'hanafi',
}) => {
  const [nowIST, setNowIST] = useState<Date>(() => getNowInIST());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [selectedZikr, setSelectedZikr] = useState<string>('SubhanAllah');

  // Live timer tick every second strictly synchronized to IST
  useEffect(() => {
    const timer = setInterval(() => {
      setNowIST(getNowInIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute location-aware astronomical prayer times
  const prayerData: DetailedPrayerInfo = calculateLocationPrayerTimes(currentDate, {
    cityId: selectedCity,
    customLat,
    customLon,
    prayerMethod,
    asrMethod,
  });

  const prayerTimes = prayerData.times;
  const hijri = getHijriDate(currentDate, hijriOffset);
  const wisdom = getDailyWisdom(currentDate);
  const isFriday = currentDate.getDay() === 5;

  const parseTimeToMinutes = (tStr: string): number => {
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  };

  const slots: PrayerSlot[] = [
    {
      id: 'fajr',
      nameEn: 'Fajr',
      nameHinglish: 'Fajr (Subah)',
      nameUr: 'فجر',
      nameAr: 'فجر',
      timeStr: prayerTimes.fajr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.fajr),
    },
    {
      id: 'dhuhr',
      nameEn: isFriday ? 'Jummah / Dhuhr' : 'Dhuhr',
      nameHinglish: isFriday ? 'Jummah Prayer' : 'Dhuhr (Dopahar)',
      nameUr: isFriday ? 'نمازِ جمعہ / ظہر' : 'ظہر',
      nameAr: isFriday ? 'جمعة / ظهر' : 'ظهر',
      timeStr: prayerTimes.dhuhr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.dhuhr),
      isJummah: isFriday,
    },
    {
      id: 'asr',
      nameEn: 'Asr',
      nameHinglish: 'Asr (Teesra Pehar)',
      nameUr: 'عصر',
      nameAr: 'عصر',
      timeStr: prayerTimes.asr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.asr),
    },
    {
      id: 'maghrib',
      nameEn: 'Maghrib',
      nameHinglish: 'Maghrib (Iftar)',
      nameUr: 'مغرب',
      nameAr: 'مغرب',
      timeStr: prayerTimes.maghrib,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.maghrib),
    },
    {
      id: 'isha',
      nameEn: 'Isha',
      nameHinglish: 'Isha (Raat)',
      nameUr: 'عشاء',
      nameAr: 'عشاء',
      timeStr: prayerTimes.isha,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.isha),
    },
  ];

  const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();
  const currentSeconds = nowIST.getSeconds();

  let nextPrayer = slots.find((s) => s.minutesFromMidnight > currentMinutes);
  let isTomorrowFajr = false;

  if (!nextPrayer) {
    nextPrayer = slots[0];
    isTomorrowFajr = true;
  }

  let targetTotalSeconds: number;
  if (!isTomorrowFajr) {
    targetTotalSeconds = nextPrayer.minutesFromMidnight * 60;
  } else {
    targetTotalSeconds = (24 * 60 + nextPrayer.minutesFromMidnight) * 60;
  }

  const nowTotalSeconds = currentMinutes * 60 + currentSeconds;
  let remainingSeconds = targetTotalSeconds - nowTotalSeconds;
  if (remainingSeconds < 0) remainingSeconds = 0;

  const hoursLeft = Math.floor(remainingSeconds / 3600);
  const minutesLeft = Math.floor((remainingSeconds % 3600) / 60);
  const secondsLeft = remainingSeconds % 60;

  const formatCountdown = () => {
    const hh = String(hoursLeft).padStart(2, '0');
    const mm = String(minutesLeft).padStart(2, '0');
    const ss = String(secondsLeft).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const zikrList = [
    { label: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ' },
    { label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ' },
    { label: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ' },
    { label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ' },
    { label: 'Darood Sharif', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ' },
  ];

  return (
    <div className="rounded-3xl bg-slate-900 border border-emerald-900/50 text-slate-100 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border-b border-emerald-900/40 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
            <span className="text-xl">🌙</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {language === 'ur' ? 'اوقاتِ نماز و اسلامی تقویم' : 'Islamic Prayer Times & Hijri Calendar'}
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 font-bold">
                {language === 'ur' ? hijri.formattedUr : hijri.formattedEn}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>
                  {language === 'ur' ? prayerData.cityNameUr : prayerData.cityName} ({prayerData.coordinates})
                </span>
              </span>
              {isFriday && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 font-bold flex items-center gap-1 animate-pulse shadow-xs">
                  <span>✨</span>
                  <span>{language === 'ur' ? 'جمعۃ المبارک' : 'Blessed Jummah'}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium flex items-center gap-2 flex-wrap">
              <span>{prayerData.asrJuristicName}</span>
              <span className="text-slate-500">•</span>
              <span>IST Time: <strong className="font-mono text-emerald-300">{formatISTTime(nowIST)}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-800/40 cursor-pointer shadow-xs"
          >
            <span>
              {isCollapsed
                ? language === 'ur'
                  ? 'اوقات دکھائیں'
                  : 'Show Timetable'
                : language === 'ur'
                ? 'چھپائیں'
                : 'Minimize'}
            </span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-4">
          
          {/* Live Next Prayer Countdown Hero Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-800/60 to-emerald-950/70 border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                  {language === 'ur' ? 'اگلی نماز کا وقت' : 'Next Upcoming Prayer'}
                </div>
                <div className="text-lg font-black text-white flex items-center gap-2">
                  <span>
                    {language === 'ur'
                      ? nextPrayer.nameUr
                      : language === 'hinglish'
                      ? nextPrayer.nameHinglish
                      : nextPrayer.nameEn}
                  </span>
                  <span className="text-sm font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50">
                    {nextPrayer.timeStr}
                  </span>
                  {isTomorrowFajr && (
                    <span className="text-[10px] text-slate-300 font-normal">
                      ({language === 'ur' ? 'کل صبح' : 'Tomorrow Morning'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {language === 'ur' ? 'باقی وقت' : 'Remaining Time'}
                </div>
                <div className="text-2xl font-black font-mono text-emerald-300 tracking-tight">
                  {formatCountdown()}
                </div>
              </div>
            </div>
          </div>

          {/* 5 Daily Prayer Cards + Sehri / Iftar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {slots.map((slot) => {
              const isNext = slot.id === nextPrayer.id && !isTomorrowFajr;
              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isNext
                      ? 'bg-emerald-900/50 border-emerald-400 ring-1 ring-emerald-400/50 shadow-md'
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                    <span>
                      {language === 'ur' ? slot.nameUr : slot.nameEn}
                    </span>
                    <span className="font-serif text-xs text-emerald-400">
                      {slot.nameAr}
                    </span>
                  </div>
                  <div className="text-base font-black font-mono text-white">
                    {slot.timeStr}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {slot.isJummah ? 'Jummah Adhan' : 'Adhan Time'}
                  </div>
                </div>
              );
            })}

            {/* Sehri Ends */}
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/40">
              <div className="text-[11px] font-bold text-amber-300 mb-1">
                {language === 'ur' ? 'سحری ختم (امساک)' : 'Sehri Ends'}
              </div>
              <div className="text-base font-black font-mono text-amber-200">
                {prayerTimes.sehriEnds}
              </div>
              <div className="text-[10px] text-amber-300/80 mt-1">
                -10 min precaution
              </div>
            </div>

            {/* Iftar Time */}
            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-800/40">
              <div className="text-[11px] font-bold text-rose-300 mb-1">
                {language === 'ur' ? 'افطار کا وقت' : 'Iftar Time'}
              </div>
              <div className="text-base font-black font-mono text-rose-200">
                {prayerTimes.iftarTime}
              </div>
              <div className="text-[10px] text-rose-300/80 mt-1">
                At Maghrib Adhan
              </div>
            </div>
          </div>

          {/* Official Mosque Timetable vs Calculated Disclaimer Notice */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span>🕌</span>
              <span>{language === 'ur' ? prayerData.disclaimerUr : prayerData.disclaimer}</span>
            </span>
            <span className="text-emerald-400 font-semibold text-[10px]">
              Method: {prayerData.methodName.split(' ')[0]}
            </span>
          </div>

          {/* Inspirational Daily Hadith & Digital Tasbeeh Counter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
            
            {/* Hadith / Ayat Card */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{language === 'ur' ? 'فرمانِ نبوی ﷺ / آیتِ مبارکہ' : 'Daily Islamic Spiritual Wisdom'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {wisdom.source}
                  </span>
                </div>
                
                <p className="font-serif text-base sm:text-lg text-emerald-200 mt-1 leading-relaxed text-right" dir="rtl">
                  "{wisdom.textUr}"
                </p>
                <p className="text-xs text-slate-300 mt-2 font-medium">
                  "{wisdom.textEn}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <span>Islamic Lifestyle Harmony</span>
                <span className="text-emerald-400 font-semibold">Peace & Reflection</span>
              </div>
            </div>

            {/* Digital Tasbeeh Counter */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    {language === 'ur' ? 'ڈیجیٹل تسبیح' : 'Digital Tasbeeh'}
                  </span>
                  <button
                    onClick={() => setTasbeehCount(0)}
                    title="Reset counter"
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 mb-2">
                  {zikrList.map((z) => (
                    <button
                      key={z.label}
                      onClick={() => setSelectedZikr(z.label)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        selectedZikr === z.label
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>

                <div className="text-center py-1">
                  <div className="text-4xl font-black font-mono text-emerald-300">
                    {tasbeehCount}
                  </div>
                  <div className="text-[11px] font-serif text-slate-300 mt-0.5">
                    {zikrList.find((z) => z.label === selectedZikr)?.arabic}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTasbeehCount((prev) => prev + 1)}
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Tap to Count (تسبیح)</span>
                <span className="text-xs font-mono">+{tasbeehCount % 33} / 33</span>
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
