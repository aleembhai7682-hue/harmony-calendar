import React, { useState, useEffect } from 'react';
import { PrayerTimes, Language } from '../types/calendar';
import { getPrayerTimes, getDailyWisdom, getHijriDate } from '../utils/hijri';
import { getLocaleTag } from '../utils/localization';
import {
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Heart,
  Moon,
} from 'lucide-react';

interface IslamicPrayerCountdownProps {
  currentDate: Date;
  hijriOffset?: number;
  language?: Language;
}

interface PrayerSlot {
  id: string;
  nameEn: string;
  nameUr: string;
  nameHi: string;
  timeStr: string; // HH:mm
  minutesFromMidnight: number;
  isJummah?: boolean;
}

export const IslamicPrayerCountdown: React.FC<IslamicPrayerCountdownProps> = ({
  currentDate,
  hijriOffset = 0,
  language = 'ur',
}) => {
  const [now, setNow] = useState(new Date());
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [selectedZikr, setSelectedZikr] = useState<string>('SubhanAllah');
  const [audioNotification, setAudioNotification] = useState<boolean>(true);

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerTimes: PrayerTimes = getPrayerTimes(currentDate);
  const wisdom = getDailyWisdom(currentDate);
  const hijri = getHijriDate(currentDate, hijriOffset);
  const isFriday = currentDate.getDay() === 5;

  // Convert "HH:mm" to minutes from midnight
  const parseTimeToMinutes = (tStr: string): number => {
    const parts = tStr.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    return parts[0] * 60 + parts[1];
  };

  const slots: PrayerSlot[] = [
    {
      id: 'fajr',
      nameEn: 'Fajr',
      nameUr: 'فجر',
      nameHi: 'फ़ज्र',
      timeStr: prayerTimes.fajr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.fajr),
    },
    {
      id: 'dhuhr',
      nameEn: isFriday ? 'Jummah / Dhuhr' : 'Dhuhr',
      nameUr: isFriday ? 'جمعہ مبارک / ظہر' : 'ظہر',
      nameHi: isFriday ? 'जुम्मा / ज़ुहर' : 'ज़ुहर',
      timeStr: prayerTimes.dhuhr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.dhuhr),
      isJummah: isFriday,
    },
    {
      id: 'asr',
      nameEn: 'Asr',
      nameUr: 'عصر',
      nameHi: 'असर',
      timeStr: prayerTimes.asr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.asr),
    },
    {
      id: 'maghrib',
      nameEn: 'Maghrib (Iftar)',
      nameUr: 'مغرب (افطار)',
      nameHi: 'मगरिब (इफ़्तार)',
      timeStr: prayerTimes.maghrib,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.maghrib),
    },
    {
      id: 'isha',
      nameEn: 'Isha',
      nameUr: 'عشاء',
      nameHi: 'इशा',
      timeStr: prayerTimes.isha,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.isha),
    },
  ];

  // Calculate current minutes from midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  // Find next upcoming prayer
  let nextPrayer = slots.find((s) => s.minutesFromMidnight > currentMinutes);
  let isTomorrowFajr = false;

  if (!nextPrayer) {
    // All prayers for today have passed; next is tomorrow's Fajr
    nextPrayer = slots[0];
    isTomorrowFajr = true;
  }

  // Calculate countdown duration in seconds
  let targetTotalSeconds: number;
  if (!isTomorrowFajr) {
    targetTotalSeconds = nextPrayer.minutesFromMidnight * 60;
  } else {
    // 24 hours + Fajr time tomorrow
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

  const zikrOptions = [
    { label: 'سُبْحَانَ اللَّهِ', en: 'SubhanAllah', target: 33 },
    { label: 'الْحَمْدُ لِلَّهِ', en: 'Alhamdulillah', target: 33 },
    { label: 'اللَّهُ أَكْبَرُ', en: 'Allahu Akbar', target: 34 },
    { label: 'أَسْتَغْفِرُ اللَّهَ', en: 'Astaghfirullah', target: 100 },
    { label: 'لَا إِلٰهَ إِلَّا اللَّهُ', en: 'La ilaha illallah', target: 100 },
    { label: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', en: 'Salawat (Darood)', target: 100 },
  ];

  return (
    <div className="space-y-4">
      {/* 🌟 Jummah Banner when on Friday */}
      {isFriday && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-emerald-600/20 border border-amber-400/40 dark:border-amber-500/30 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🕌</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-300">
                  جمعہ مبارک • Jummah Mubarak
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                  سید الایام
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                سنتیں: غسل، خوشبو، سورۂ کہف کی تلاوت، خطبہ اور نمازِ جمعہ کی جلد حاضری۔
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {prayerTimes.dhuhr} PM
            </div>
            <div className="text-[10px] text-slate-500">جماعت وقت</div>
          </div>
        </div>
      )}

      {/* ⏱️ Live Next Prayer Countdown Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-5 shadow-xl border border-emerald-500/20">
        {/* Decorative background crescent glow */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-28 h-28 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>اگلی نماز • Next Upcoming Prayer</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {nextPrayer.nameUr}
              </h2>
              <span className="text-base text-emerald-200 font-medium">
                ({nextPrayer.nameEn})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                {nextPrayer.timeStr}
              </span>
            </div>
            <div className="text-xs text-emerald-200/80 mt-1 flex items-center gap-1.5">
              <span>{hijri.formattedUr}</span>
              <span>•</span>
              <span>{currentDate.toLocaleDateString(getLocaleTag(language), { weekday: 'long', day: 'numeric', month: 'short' })}</span>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="w-full sm:w-auto bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/30 text-center sm:text-right flex items-center justify-between sm:justify-end gap-3">
            <div>
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                باقی وقت • Time Remaining
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
                {formatCountdown()}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>
        </div>

        {/* 5 Daily Prayer Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-4 border-t border-emerald-700/50">
          {slots.map((slot) => {
            const isNext = slot.id === nextPrayer.id;
            return (
              <div
                key={slot.id}
                className={`p-2.5 rounded-xl transition-all flex flex-col justify-between ${
                  isNext
                    ? 'bg-gradient-to-b from-amber-400/25 to-emerald-500/25 border-2 border-amber-300/80 shadow-md ring-1 ring-amber-300/40 text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-100/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{slot.nameUr}</span>
                  {isNext && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping" />
                  )}
                </div>
                <div className="text-sm font-black font-mono mt-1 text-amber-200">
                  {slot.timeStr}
                </div>
                <div className="text-[9px] text-emerald-300/80 truncate">
                  {slot.nameEn}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sehri & Iftar Timings Strip */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-emerald-200 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-300">🌙 سحری ختم:</span>
            <span className="font-mono font-bold text-white">{prayerTimes.sehriEnds} AM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-300">✨ افطار وقت:</span>
            <span className="font-mono font-bold text-white">{prayerTimes.iftarTime} PM</span>
          </div>
        </div>
      </div>

      {/* 📿 Digital Tasbeeh & Masnoon Duas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Interactive Digital Tasbeeh Counter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                  ڈیجیٹل تسبیح کاؤنٹر • Digital Tasbeeh
                </span>
              </div>
              <button
                onClick={() => setTasbeehCount(0)}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                title="Reset Counter"
              >
                ری سیٹ
              </button>
            </div>

            {/* Select Zikr */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {zikrOptions.map((z) => (
                <button
                  key={z.en}
                  onClick={() => {
                    setSelectedZikr(z.en);
                    setTasbeehCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedZikr === z.en
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Tap Area */}
          <div
            onClick={() => setTasbeehCount((c) => c + 1)}
            className="cursor-pointer select-none bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-500/10 hover:from-emerald-500/20 rounded-2xl p-4 text-center border border-emerald-500/20 active:scale-95 transition-all"
          >
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
              {tasbeehCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              کلک کریں یا ٹیپ کریں (Tap to Count)
            </div>
          </div>
        </div>

        {/* Card 2: Daily Hadith & Dua */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                روزانہ کی مسنون دعا و حکمت • Daily Wisdom
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 my-2 text-right">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 font-urdu leading-relaxed">
                "{wisdom.textUr}"
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-left italic">
                "{wisdom.textEn}"
              </p>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-left">
                — {wisdom.source}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
            <span>نماز کے بعد دعا: استغفار اور درود شریف</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">آمین</span>
          </div>
        </div>
      </div>
    </div>
  );
};
