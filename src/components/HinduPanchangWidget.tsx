import React, { useState, useEffect } from 'react';
import { getHinduPanchang } from '../utils/panchang';
import { getDailyGitaVerse, GitaVerse } from '../utils/gitaData';
import { getNowInIST, formatISTTime } from '../utils/istTime';
import {
  Sun,
  Flame,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface HinduPanchangWidgetProps {
  currentDate: Date;
}

export const HinduPanchangWidget: React.FC<HinduPanchangWidgetProps> = ({
  currentDate,
}) => {
  const [nowIST, setNowIST] = useState<Date>(() => getNowInIST());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mantraCount, setMantraCount] = useState(108);

  // Live timer tick strictly in IST
  useEffect(() => {
    const timer = setInterval(() => {
      setNowIST(getNowInIST());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const panchang = getHinduPanchang(currentDate);
  const gitaVerse: GitaVerse = getDailyGitaVerse(currentDate);

  return (
    <div className="rounded-3xl bg-slate-900 border border-amber-900/40 text-slate-100 shadow-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border-b border-amber-900/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-xs">
            <span className="text-xl">🕉️</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-white tracking-tight">
                Vedic Panchang & Bhagavad Gita Shloka
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-900/70 text-amber-300 border border-amber-700/50 font-bold">
                {panchang.pakshaHi} • {panchang.tithiNameHi}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>IST Mumbai Zone</span>
              </span>
              {panchang.auspiciousTag && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 animate-pulse">
                  <span>🪔</span>
                  <span>{panchang.auspiciousTagHi || panchang.auspiciousTag}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Vikram Samvat {panchang.vikramSamvat} • Shaka {panchang.shakaSamvat} • Month: <span className="text-amber-200 font-semibold">{panchang.hinduMonthHi} ({panchang.hinduMonthEn})</span> • IST: <span className="font-mono text-amber-300 font-bold">{formatISTTime(nowIST)}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{isCollapsed ? 'Show Panchang & Gita' : 'Minimize'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="p-5 space-y-4">
          
          {/* Panchang Grid: Tithi, Paksha, Samvat, Abhijit Muhurat, Rahu Kaal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <span>🌑 Tithi & Phase</span>
              </div>
              <div className="text-base font-black text-amber-300 mt-1">
                {panchang.tithiNameEn}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {panchang.tithiNameHi}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <span>🌓 Lunar Fortnight (Paksha)</span>
              </div>
              <div className="text-base font-black text-white mt-1">
                {panchang.pakshaEn.split(' ')[0]} Paksha
              </div>
              <div className="text-xs text-amber-200 mt-0.5">
                {panchang.pakshaHi}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50">
              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                <span>✨ Abhijit Muhurat (Auspicious)</span>
              </div>
              <div className="text-sm font-black font-mono text-emerald-200 mt-1">
                11:46 AM – 12:35 PM
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">
                Ideal for starting positive ventures
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50">
              <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                <span>⚠️ Rahu Kaal (Cautionary)</span>
              </div>
              <div className="text-sm font-black font-mono text-rose-200 mt-1">
                {panchang.rahuKaal}
              </div>
              <div className="text-[10px] text-rose-400/80 mt-0.5">
                Avoid signing contracts / major deals
              </div>
            </div>
          </div>

          {/* Inspiring Bhagavad Gita Shloka Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-600/40 shadow-inner">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Shrimad Bhagavad Gita Verse of the Day
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 font-bold border border-amber-700/50">
                  {gitaVerse.citation}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Theme: <span className="text-white font-bold">{gitaVerse.theme}</span>
              </span>
            </div>

            {/* Sanskrit Devanagari */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-center my-2.5">
              <div className="font-serif text-base sm:text-lg font-bold text-amber-200 whitespace-pre-line leading-relaxed">
                {gitaVerse.sanskrit}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 italic">
                {gitaVerse.transliteration}
              </div>
            </div>

            {/* Meanings & Practical Life Lesson */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-amber-900/40">
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Hindi Meaning (भावार्थ)
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {gitaVerse.meaningHi}
                </p>
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  English Translation & Life Lesson
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                  "{gitaVerse.meaningEn}"
                </p>
                <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded-xl border border-amber-800/40">
                  <span className="font-bold">🎯 Daily Application: </span>
                  <span>{gitaVerse.practicalLesson}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
