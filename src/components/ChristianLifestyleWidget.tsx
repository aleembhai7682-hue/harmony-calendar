import React, { useState, useEffect } from 'react';
import {
  getDailyBibleVerse,
  getChristmasCountdown,
  getLiturgicalSeason,
  BibleVerse,
} from '../utils/christianData';
import { getDeviceTimezone, formatLocalTime } from '../utils/istTime';
import {
  Calendar,
  Heart,
  ChevronDown,
  ChevronUp,
  Gift,
  MapPin,
  Church,
  Sparkles,
} from 'lucide-react';

interface ChristianLifestyleWidgetProps {
  currentDate: Date;
}

/**
 * Cathedral Stained-Glass Rose Window SVG
 * Rendered with jewel-tone facets (sapphire, amber, amethyst, ruby) and leaded tracery
 */
const StainedGlassRoseWindow: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="roseCoreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#b45309" stopOpacity="0.4" />
      </radialGradient>
      <radialGradient id="sapphirePetal" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#1e40af" stopOpacity="0.65" />
      </radialGradient>
      <radialGradient id="amethystPetal" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#6b21a8" stopOpacity="0.65" />
      </radialGradient>
      <radialGradient id="amberPetal" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fde68a" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
      </radialGradient>
      <radialGradient id="rubyPetal" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#991b1b" stopOpacity="0.6" />
      </radialGradient>
    </defs>

    {/* Outer Lead Frame */}
    <circle cx="50" cy="50" r="48" stroke="#fcd34d" strokeWidth="1.5" strokeOpacity="0.5" />
    <circle cx="50" cy="50" r="45" stroke="#1e293b" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="43" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.7" />

    {/* 12 Cathedral Rosette Petals */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
      const fill =
        i % 4 === 0
          ? 'url(#amberPetal)'
          : i % 4 === 1
          ? 'url(#sapphirePetal)'
          : i % 4 === 2
          ? 'url(#amethystPetal)'
          : 'url(#rubyPetal)';
      return (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          <path
            d="M 50 14 C 43 25, 43 35, 50 43 C 57 35, 57 25, 50 14 Z"
            fill={fill}
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          {/* Inner trefoil arch */}
          <path
            d="M 50 20 C 46 26, 46 32, 50 37 C 54 32, 54 26, 50 20 Z"
            fill="none"
            stroke="#fef08a"
            strokeWidth="0.6"
            strokeOpacity="0.6"
          />
        </g>
      );
    })}

    {/* Mid Tracery Ring */}
    <circle cx="50" cy="50" r="24" stroke="#1e293b" strokeWidth="2" fill="none" />
    <circle cx="50" cy="50" r="22" stroke="#fbbf24" strokeWidth="0.8" strokeOpacity="0.8" fill="none" />

    {/* Inner Radial Star Facets */}
    {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg, idx) => (
      <line
        key={deg}
        x1="50"
        y1="50"
        x2={50 + 22 * Math.cos(((deg - 90) * Math.PI) / 180)}
        y2={50 + 22 * Math.sin(((deg - 90) * Math.PI) / 180)}
        stroke="#0f172a"
        strokeWidth="1.2"
      />
    ))}

    {/* Center Sacred Medallion */}
    <circle cx="50" cy="50" r="13" fill="url(#roseCoreGlow)" stroke="#0f172a" strokeWidth="1.8" />
    <circle cx="50" cy="50" r="11" stroke="#fef08a" strokeWidth="0.8" strokeOpacity="0.9" fill="none" />

    {/* Golden Greek Cross at the Center */}
    <path
      d="M 50 42 L 50 58 M 42 50 L 58 50"
      stroke="#78350f"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M 50 43 L 50 57 M 43 50 L 57 50"
      stroke="#fffbeb"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Refined Cross Motif with Trefoil / Budded Finials & Radiant Halo
 */
const RefinedCrossMotif: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    className={`select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="crossGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="crossBevel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
      </linearGradient>
    </defs>

    {/* Radiant Trinity Halo behind the cross intersection */}
    <circle
      cx="32"
      cy="24"
      r="13"
      stroke="url(#crossGoldGrad)"
      strokeWidth="1.5"
      strokeOpacity="0.6"
      strokeDasharray="2 3"
    />
    <circle
      cx="32"
      cy="24"
      r="15"
      stroke="#93c5fd"
      strokeWidth="0.8"
      strokeOpacity="0.4"
    />

    {/* Main Cross Body with floriated trefoil tips */}
    {/* Vertical Beam */}
    <path
      d="M 29 8 C 29 6, 35 6, 35 8 L 35 56 C 35 58, 29 58, 29 56 Z"
      fill="url(#crossGoldGrad)"
      stroke="#78350f"
      strokeWidth="1.2"
    />
    {/* Horizontal Beam */}
    <path
      d="M 12 21 C 10 21, 10 27, 12 27 L 52 27 C 54 27, 54 21, 52 21 Z"
      fill="url(#crossGoldGrad)"
      stroke="#78350f"
      strokeWidth="1.2"
    />

    {/* Bevel highlights for depth */}
    <path
      d="M 31 9 L 31 55 M 13 23 L 51 23"
      stroke="#ffffff"
      strokeWidth="0.9"
      strokeOpacity="0.8"
      strokeLinecap="round"
    />

    {/* Central Heart Jewel */}
    <circle cx="32" cy="24" r="3.2" fill="#fffbeb" stroke="#b45309" strokeWidth="1" />
  </svg>
);

/**
 * Dove of Peace & Holy Spirit Motif
 */
const DoveOfPeaceMotif: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    className={`select-none ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Graceful Flying Dove with Olive Leaf */}
    <path
      d="M 28 8 C 24 10, 20 15, 18 19 C 14 15, 9 14, 5 16 C 10 19, 13 23, 14 26 C 11 27, 8 28, 6 31 C 10 31, 15 29, 18 26 C 21 28, 25 29, 31 28 C 34 26, 35 22, 33 19 C 34 16, 33 12, 28 8 Z"
      fill="#f8fafc"
      fillOpacity="0.92"
      stroke="#93c5fd"
      strokeWidth="1.2"
    />
    {/* Olive Sprig */}
    <path
      d="M 32 18 C 35 17, 38 18, 38 18 C 37 20, 34 20, 32 19"
      stroke="#10b981"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export const ChristianLifestyleWidget: React.FC<ChristianLifestyleWidgetProps> = ({
  currentDate,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Live timer tick strictly synchronized to device local time
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bibleVerse: BibleVerse = getDailyBibleVerse(currentDate);
  const christmasCountdown = getChristmasCountdown(currentDate);
  const liturgicalSeason = getLiturgicalSeason(currentDate);
  const isSunday = currentDate.getDay() === 0;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-[#141b34] border border-amber-400/30 text-slate-100 shadow-2xl overflow-hidden transition-all ring-1 ring-amber-400/20">
      
      {/* 🌟 Sophisticated Soft-Glow Animation Aura Behind Header & Card */}
      <div className="absolute top-0 right-1/4 w-[420px] h-[340px] bg-gradient-to-bl from-amber-400/15 via-blue-500/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-celestial-glow -z-0" />
      <div className="absolute bottom-0 left-10 w-[360px] h-[300px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-amber-400/5 rounded-full blur-2xl pointer-events-none animate-celestial-glow -z-0" />

      {/* 🌟 Subtle Cathedral Cross & Rosette Pattern Watermark Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] -z-0 overflow-hidden">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="crossTapestry" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 24 14 L 24 34 M 14 21 L 34 21"
                stroke="#fef08a"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="21" r="2.5" stroke="#fef08a" strokeWidth="0.8" fill="none" />
              <circle cx="24" cy="21" r="0.8" fill="#fef08a" />
              <circle cx="6" cy="6" r="0.8" fill="#93c5fd" />
              <circle cx="42" cy="42" r="0.8" fill="#93c5fd" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crossTapestry)" />
        </svg>
      </div>

      {/* Decorative Large Watermark Rose Window in Top-Right Corner */}
      <div className="absolute -top-12 -right-12 pointer-events-none animate-stained-glass-pulse select-none opacity-20">
        <StainedGlassRoseWindow size={240} />
      </div>

      {/* Header Bar */}
      <div className="relative px-5 py-4 bg-gradient-to-r from-[#0d162d]/95 via-[#0e172e]/90 to-[#0c1222]/95 border-b border-amber-400/25 flex items-center justify-between gap-3 flex-wrap backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          
          {/* Stained-Glass & Cross Emblem with Ambient Halo */}
          <div className="relative flex items-center justify-center">
            {/* Animated soft halo under emblem */}
            <div className="absolute inset-0 rounded-2xl bg-amber-400/30 blur-md animate-celestial-glow" />
            
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-center shadow-lg shadow-amber-500/10 border border-amber-400/40 p-1 overflow-hidden">
              <StainedGlassRoseWindow size={42} className="absolute inset-0 m-auto opacity-70" />
              <div className="relative z-10 animate-cross-float">
                <RefinedCrossMotif size={26} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                <span>Christian Calendar & Daily Scripture Devotion</span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>Stained Glass & Sanctum</span>
                </span>
              </span>

              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/40 font-bold flex items-center gap-1.5 shadow-xs">
                <DoveOfPeaceMotif size={13} />
                <span>{liturgicalSeason.seasonName}</span>
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/90 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{getDeviceTimezone().replace(/_/g, ' ')}</span>
              </span>

              {isSunday && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/50 font-bold flex items-center gap-1.5 animate-pulse shadow-xs">
                  <span>✨</span>
                  <span>The Lord's Day (Sunday)</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 font-medium flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span>Liturgical Season: <strong className="text-amber-200">{liturgicalSeason.liturgicalColor}</strong></span>
              </span>
              <span className="text-slate-500">•</span>
              <span>Spiritual Focus: <strong className="text-indigo-200">{liturgicalSeason.spiritualFocus}</strong></span>
              <span className="text-slate-500">•</span>
              <span>Current Time: <strong className="font-mono text-amber-300">{formatLocalTime(now)}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-amber-400/30 cursor-pointer shadow-xs hover:border-amber-400/60"
          >
            <span>{isCollapsed ? 'Show Devotion & Feasts' : 'Minimize'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCollapsed && (
        <div className="relative p-5 space-y-4">
          
          {/* Sunday Worship Service Banner */}
          {isSunday ? (
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-amber-950/40 border border-amber-400/40 flex items-center justify-between gap-3 flex-wrap shadow-lg">
              {/* Soft divine sweep highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 to-transparent pointer-events-none animate-divine-sweep" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-200 flex items-center justify-center border border-amber-400/40 shadow-inner">
                  <Church className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                    <span>The Lord's Day Worship & Holy Fellowship</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40">Blessed Sabbath</span>
                  </span>
                  <p className="text-xs text-slate-200 mt-0.5">
                    "Remember the Sabbath day to keep it holy." Set aside time today for prayer, family fellowship, and gratitude for divine grace.
                  </p>
                </div>
              </div>
              <div className="relative z-10 text-xs font-bold text-amber-200 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-amber-400/40 shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sunday Morning Service: 09:30 AM</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-amber-500/25 flex items-center justify-between gap-3 text-xs text-slate-200 flex-wrap backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>
                  <strong className="text-white">Weekend & Sunday Church Planner:</strong> Next Sunday Worship Service is scheduled for Sunday at 09:30 AM.
                </span>
              </div>
              <span className="text-[11px] text-amber-300 font-semibold bg-indigo-950/70 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                <span>🕊️</span>
                <span>Daily Grace & Sanctification</span>
              </span>
            </div>
          )}

          {/* 3 Metric Cards: Christmas Countdown, Liturgical Season, Faith Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Christmas & Holiday Countdown */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-indigo-950/40 border border-rose-500/30 flex items-center justify-between shadow-md hover:border-rose-400/60 transition-all group">
              <div className="relative z-10">
                <div className="text-[10px] uppercase font-bold text-rose-300 flex items-center gap-1.5 tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-rose-400" />
                  <span>Days Until Christmas</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-sm">
                    {christmasCountdown.isToday ? 'TODAY!' : christmasCountdown.days}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {christmasCountdown.isToday ? 'Merry Christmas!' : 'days left to Dec 25'}
                  </span>
                </div>
                <div className="text-[10px] text-rose-200/90 mt-1 font-medium">
                  Solemnity of the Nativity of the Lord
                </div>
              </div>
              
              <div className="relative w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                🎄
              </div>
            </div>

            {/* Liturgical Season Overview with Stained Glass Rosette Motif */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-blue-950/40 border border-indigo-500/30 flex items-center justify-between shadow-md hover:border-indigo-400/60 transition-all group">
              <div className="relative z-10">
                <div className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1.5 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Liturgical Season</span>
                </div>
                <div className="text-base font-black text-white mt-1.5">
                  {liturgicalSeason.seasonName}
                </div>
                <div className="text-xs text-indigo-200 mt-0.5 font-medium">
                  Focus: {liturgicalSeason.spiritualFocus}
                </div>
              </div>

              <div className="relative w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center p-1 shadow-inner group-hover:scale-105 transition-transform">
                <StainedGlassRoseWindow size={34} />
              </div>
            </div>

            {/* Daily Theme & Peace */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-blue-950/40 border border-amber-500/30 flex items-center justify-between shadow-md hover:border-amber-400/60 transition-all group">
              <div className="relative z-10">
                <div className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1.5 tracking-wider">
                  <Heart className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scripture Spiritual Theme</span>
                </div>
                <div className="text-base font-black text-amber-300 mt-1.5">
                  {bibleVerse.theme}
                </div>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">
                  {bibleVerse.citation}
                </div>
              </div>

              <div className="relative w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <RefinedCrossMotif size={28} />
              </div>
            </div>

          </div>

          {/* Daily Uplifting Holy Scripture Devotion Card with Illuminated Stained-Glass Border */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#0e172e] via-[#101b38] to-[#0c1428] border border-amber-400/35 shadow-xl">
            {/* Subtle Divine Light Sweep Across Scripture */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/5 to-transparent pointer-events-none animate-divine-sweep" />

            <div className="flex items-center justify-between gap-2 flex-wrap mb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shadow-xs">
                  <RefinedCrossMotif size={18} />
                </div>
                <span className="text-xs font-black text-amber-200 uppercase tracking-wider">
                  Holy Scripture Verse of the Day
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-900/80 text-amber-300 font-bold border border-amber-400/40">
                  {bibleVerse.citation}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <span>🕊️</span>
                <span>Word of God for Hope, Peace & Healing</span>
              </span>
            </div>

            {/* Scripture Quote Container with Stained-Glass Arch Accents */}
            <div className="relative p-5 rounded-xl bg-slate-950/70 border border-amber-400/25 my-2.5 backdrop-blur-sm shadow-inner">
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-1.5 left-2 text-amber-400/30 text-xs font-serif select-none">✝</div>
              <div className="absolute top-1.5 right-2 text-amber-400/30 text-xs font-serif select-none">✝</div>
              <div className="absolute bottom-1.5 left-2 text-amber-400/30 text-xs font-serif select-none">✝</div>
              <div className="absolute bottom-1.5 right-2 text-amber-400/30 text-xs font-serif select-none">✝</div>

              <p className="font-serif text-base sm:text-lg font-medium text-white italic leading-relaxed text-center sm:text-left px-2">
                "{bibleVerse.textEn}"
              </p>
            </div>

            {/* Spiritual Reflection Prompt */}
            <div className="flex items-start sm:items-center gap-2.5 mt-3 pt-3 border-t border-amber-500/20 text-xs text-slate-200 relative z-10">
              <span className="text-amber-300 font-bold whitespace-nowrap flex items-center gap-1">
                <span>✨</span>
                <span>Today's Reflection:</span>
              </span>
              <span className="leading-relaxed text-slate-200 font-medium">{bibleVerse.reflection}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
