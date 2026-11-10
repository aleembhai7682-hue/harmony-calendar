import React, { useState, useEffect } from 'react';
import { PrayerTimes, Language } from '../types/calendar';
import { getHijriDate, getDailyWisdom } from '../utils/hijri';
import { getMumbaiPrayerTimes, getNowInIST, formatISTTime } from '../utils/istTime';
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
} from 'lucide-react';

interface IslamicPrayerWidgetProps {
  currentDate: Date;
  hijriOffset?: number;
  language?: Language;
}

interface PrayerSlot {
  id: string;
  nameEn: string;
  nameHinglish: string;
  nameAr: string;
  timeStr: string; // HH:mm
  minutesFromMidnight: number;
  isJummah?: boolean;
}

export const IslamicPrayerWidget: React.FC<IslamicPrayerWidgetProps> = ({
  currentDate,
  hijriOffset = 0,
  language = 'en',
}) => {
  const [nowIST, setNowIST] = useState<Date>(() => getNowInIST());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasbeehCount, setTasbeehCount] = useState<number>(0);
  const [selectedZikr, setSelectedZikr] = useState<string>('SubhanAllah');

  // Live timer tick every second strictly in IST
  useEffect(() => {
    const timer = setInterval(() => {
      setNowIST(getNowInIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Mumbai / IST prayer times
  const prayerTimes: PrayerTimes = getMumbaiPrayerTimes(currentDate);
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
      nameAr: 'الفجر',
      timeStr: prayerTimes.fajr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.fajr),
    },
    {
      id: 'dhuhr',
      nameEn: isFriday ? 'Jummah / Dhuhr' : 'Dhuhr',
      nameHinglish: isFriday ? 'Jummah Prayer' : 'Dhuhr (Dopahar)',
      nameAr: isFriday ? 'الجمعة' : 'الظهر',
      timeStr: prayerTimes.dhuhr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.dhuhr),
      isJummah: isFriday,
    },
    {
      id: 'asr',
      nameEn: 'Asr',
      nameHinglish: 'Asr (Teesra Pehar)',
      nameAr: 'العصر',
      timeStr: prayerTimes.asr,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.asr),
    },
    {
      id: 'maghrib',
      nameEn: 'Maghrib',
      nameHinglish: 'Maghrib (Iftar)',
      nameAr: 'المغرب',
      timeStr: prayerTimes.maghrib,
      minutesFromMidnight: parseTimeToMinutes(prayerTimes.maghrib),
    },
    {
      id: 'isha',
      nameEn: 'Isha',
      nameHinglish: 'Isha (Raat)',
      nameAr: 'العشاء',
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
    { label: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ' },
  ];

  return (
    <div className="rounded-3xl bg-slate-900 border border-emerald-900/40 text-slate-100 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border-b border-emerald-900/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
            <Moon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>Islamic Hijri Calendar & Live Prayer Timetable</span>
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-900/70 text-emerald-300 border border-emerald-700/50 font-bold">
                {hijri.day} {hijri.monthNameEn} {hijri.year} AH
              </span>
              {/* IST / Mumbai Accuracy Badge */}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>Locked to Mumbai (IST UTC+5:30)</span>
              </span>
              {isFriday && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 animate-pulse">
                  <span>✨</span>
                  <span>Jummah Mubarak</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live IST: <span className="font-mono text-emerald-300 font-bold">{formatISTTime(nowIST)}</span> • High precision Mumbai solar prayer calculations.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isCollapsed ? 'Show Prayer Times' : 'Minimize'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-4">
          
          {/* Friday Jummah Banner */}
          {isFriday && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🕌</span>
                <div>
                  <span className="font-bold text-xs text-amber-300">
                    Jummah Mubarak Sunnah:
                  </span>
                  <span className="text-xs text-slate-300 ml-1.5">
                    Ghusl (bath), clean clothes, Attar, recitation of Surah Al-Kahf, and arriving early for Friday congregation.
                  </span>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-xl border border-emerald-800/50">
                Jummah Khutbah: {prayerTimes.dhuhr} PM IST
              </div>
            </div>
          )}

          {/* Hero Row: Next Prayer Live Countdown + 5 Daily Prayer Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Live Countdown Box (4 Cols) */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-600/30 flex flex-col justify-between shadow-inner">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Next Upcoming Prayer (IST)</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-white">
                    {nextPrayer.nameEn}
                  </h3>
                  <span className="text-sm font-semibold text-emerald-300 font-mono">
                    at {nextPrayer.timeStr}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {nextPrayer.nameHinglish} ({nextPrayer.nameAr})
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-900/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Time Remaining (Live IST)
                  </div>
                  <div className="font-mono text-2xl font-black text-amber-300 tracking-wider">
                    {formatCountdown()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
                </div>
              </div>
            </div>

            {/* 5 Daily Prayer Cards (8 Cols) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {slots.map((slot) => {
                const isNext = slot.id === nextPrayer.id;
                return (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-2xl transition-all flex flex-col justify-between border ${
                      isNext
                        ? 'bg-gradient-to-b from-emerald-900/60 to-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/40 text-white'
                        : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{slot.nameEn}</span>
                        {isNext && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                      </div>
                      <div className="text-sm font-black font-mono text-amber-200 mt-1">
                        {slot.timeStr}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-2">
                      {slot.id === 'maghrib' ? 'Iftar / Maghrib' : slot.nameHinglish}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spiritual Quote & Sehri/Iftar + Tasbeeh Counter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-800">
            
            {/* Daily Hadith / Quranic Ayat (7 Cols) */}
            <div className="md:col-span-7 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900/40 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 flex-shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-0.5">
                  <span>Daily Verse & Wisdom</span>
                  <span className="text-slate-400 font-normal">{wisdom.source}</span>
                </div>
                <div className="text-sm font-serif text-amber-200 text-right leading-relaxed mb-1 font-semibold" dir="rtl">
                  {wisdom.textUr}
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  "{wisdom.textEn}"
                </div>
              </div>
            </div>

            {/* Fasting (Sehri/Iftar) & Digital Tasbeeh Counter (5 Cols) */}
            <div className="md:col-span-5 flex flex-col justify-between gap-2 p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">🌙 Sehri:</span>
                  <span className="font-mono font-bold text-white">{prayerTimes.sehriEnds} AM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">✨ Iftar:</span>
                  <span className="font-mono font-bold text-amber-300">{prayerTimes.iftarTime} PM</span>
                </div>
              </div>

              {/* Digital Tasbeeh Counter */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-700">
                  {zikrList.slice(0, 3).map((z) => (
                    <button
                      key={z.label}
                      onClick={() => {
                        setSelectedZikr(z.label);
                        setTasbeehCount(0);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        selectedZikr === z.label
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setTasbeehCount((c) => c + 1)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer ml-auto"
                  title="Tap to count Dhikr"
                >
                  <span>Count:</span>
                  <span className="font-black text-amber-200">{tasbeehCount}</span>
                </button>

                <button
                  onClick={() => setTasbeehCount(0)}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Reset Counter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
