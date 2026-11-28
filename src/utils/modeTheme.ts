import { CalendarFaithMode } from '../types/calendar';

export interface ModeThemeTokens {
  // Root page canvas
  pageCanvas: string;
  // Navbar & Header surfaces
  headerSurface: string;
  brandBadge: string;
  clockText: string;
  // Primary CTA & Focus controls
  primaryBtn: string;
  subtleActionBtn: string;
  activeTab: string;
  // Card & Container Surfaces
  cardSurface: string;
  cardSubSurface: string;
  cardBorder: string;
  gridDivider: string;
  // Calendar Cell & Today Highlights
  todayCircle: string;
  selectedCell: string;
  specialDayCell: string;
  specialDayTopBorder: string;
  accentText: string;
  accentTextMuted: string;
  // Timer Widget
  timerCard: string;
  timerHeader: string;
  timerIconBox: string;
  timerBadge: string;
  timerDigits: string;
  timerBar: string;
  // Modal / Form Focus
  focusRing: string;
}

const CHRISTIAN_THEME: ModeThemeTokens = {
  pageCanvas:
    'bg-gradient-to-b from-[#FAF8F3] via-[#F4F7FC] to-[#EDF2FA] dark:bg-gradient-to-b dark:from-[#070E1D] dark:via-[#0B162C] dark:to-[#081020]',
  headerSurface:
    'bg-[#FCFBF8]/92 dark:bg-[#0B1528]/92 border-b border-[#E4DDD0] dark:border-slate-800/80 shadow-[0_2px_12px_rgba(20,40,75,0.04)]',
  brandBadge:
    'bg-gradient-to-tr from-[#14284B] via-[#1E3A6E] to-[#C69C44] shadow-[#14284B]/20',
  clockText: 'text-[#8C6418] dark:text-amber-300',
  primaryBtn:
    'bg-[#14284B] hover:bg-[#1D396A] text-white dark:bg-sky-600 dark:hover:bg-sky-500 shadow-xs',
  subtleActionBtn:
    'bg-[#F1F5FC] hover:bg-[#E5EEF9] text-[#14284B] border-[#D3DFEE] dark:bg-sky-950/60 dark:hover:bg-sky-900/60 dark:text-sky-200 dark:border-sky-800/70',
  activeTab:
    'bg-white dark:bg-slate-900 text-[#14284B] dark:text-sky-300 shadow-xs font-bold',
  cardSurface: 'bg-[#FCFBF8] dark:bg-[#0D182D]',
  cardSubSurface: 'bg-[#F6F3EB] dark:bg-[#101D36]',
  cardBorder: 'border-[#E4DDD0] dark:border-slate-800',
  gridDivider: 'border-[#EAE4D7] dark:border-slate-800/80',
  todayCircle:
    'bg-[#14284B] dark:bg-sky-500 text-white shadow-xs ring-2 ring-[#C69C44]/50',
  selectedCell:
    'bg-[#EDF3FC] dark:bg-sky-950/35 ring-1 ring-inset ring-[#1E3A6E]/25 dark:ring-sky-500/30',
  specialDayCell:
    'bg-[#F4F8FE]/80 dark:bg-sky-950/15 hover:bg-[#EBF2FC] dark:hover:bg-sky-950/25',
  specialDayTopBorder: 'border-t-2 border-t-[#C69C44]/75 dark:border-t-sky-500/70',
  accentText: 'text-[#14284B] dark:text-sky-300',
  accentTextMuted: 'text-[#8C6418] dark:text-amber-300',
  timerCard:
    'bg-[#FCFBF8] dark:bg-[#0D182D] border border-[#E4DDD0] dark:border-slate-800 shadow-[0_8px_26px_-12px_rgba(20,40,75,0.1)] dark:shadow-xl',
  timerHeader:
    'bg-gradient-to-r from-[#F6F3EB] via-[#FCFBF8] to-[#F1F6FC] dark:from-[#101D36] dark:via-[#0D182D] dark:to-[#0B1528] border-b border-[#E4DDD0] dark:border-slate-800',
  timerIconBox:
    'bg-[#14284B]/10 dark:bg-sky-500/15 text-[#14284B] dark:text-sky-300 border border-[#C69C44]/40 dark:border-sky-500/30',
  timerBadge:
    'bg-[#FBF4E4] dark:bg-amber-950/50 text-[#8C6418] dark:text-amber-300 border border-[#E6D3A3] dark:border-amber-700/50',
  timerDigits: 'text-[#14284B] dark:text-sky-300',
  timerBar: 'from-[#14284B] to-[#C69C44] dark:from-sky-400 dark:to-amber-300',
  focusRing: 'focus:ring-[#1E3A6E] dark:focus:ring-sky-500',
};

const MUSLIM_THEME: ModeThemeTokens = {
  pageCanvas:
    'bg-gradient-to-b from-[#F5FAF7] via-[#EEF7F2] to-[#E6F2EC] dark:bg-gradient-to-b dark:from-[#060E0C] dark:via-[#081512] dark:to-[#050C0A]',
  headerSurface:
    'bg-[#FAFDFC]/92 dark:bg-[#091612]/92 border-b border-[#CFE2D8] dark:border-emerald-950/90 shadow-[0_2px_12px_rgba(6,78,59,0.04)]',
  brandBadge:
    'bg-gradient-to-tr from-[#064E3B] via-[#047857] to-[#0D9488] shadow-emerald-900/20',
  clockText: 'text-emerald-800 dark:text-emerald-300',
  primaryBtn:
    'bg-emerald-700 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs',
  subtleActionBtn:
    'bg-emerald-50 hover:bg-teal-50/90 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-teal-950/60 dark:text-emerald-200 dark:border-emerald-800/60',
  activeTab:
    'bg-white dark:bg-[#0F241D] text-emerald-800 dark:text-emerald-300 shadow-xs font-bold',
  cardSurface: 'bg-[#FCFDFC] dark:bg-[#0A1814]',
  cardSubSurface: 'bg-[#EEF6F2] dark:bg-[#0F221C]',
  cardBorder: 'border-[#CFE2D8] dark:border-[#1B382E]',
  gridDivider: 'border-[#DAE9E1] dark:border-[#173028]',
  todayCircle:
    'bg-emerald-700 dark:bg-emerald-500 text-white shadow-xs ring-2 ring-teal-500/45 dark:ring-emerald-400/50',
  selectedCell:
    'bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-inset ring-teal-700/25 dark:ring-emerald-500/35',
  specialDayCell:
    'bg-[#EFF8F3] dark:bg-emerald-950/25 hover:bg-[#E4F2EB] dark:hover:bg-emerald-950/35',
  specialDayTopBorder: 'border-t-2 border-t-teal-600/80 dark:border-t-emerald-400/70',
  accentText: 'text-emerald-800 dark:text-emerald-300',
  accentTextMuted: 'text-teal-700 dark:text-teal-300',
  timerCard:
    'bg-[#FCFDFC] dark:bg-[#0A1814] border border-[#CFE2D8] dark:border-[#1B382E] shadow-[0_8px_26px_-12px_rgba(6,78,59,0.1)] dark:shadow-xl',
  timerHeader:
    'bg-gradient-to-r from-[#EEF6F2] via-[#FAFDFC] to-[#E9F5F2] dark:from-[#0E221B] dark:via-[#0A1814] dark:to-[#081915] border-b border-[#CFE2D8] dark:border-[#1B382E]',
  timerIconBox:
    'bg-emerald-700/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-teal-600/30 dark:border-teal-400/30',
  timerBadge:
    'bg-[#EAF7F2] dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-[#BCE0D2] dark:border-teal-700/50',
  timerDigits: 'text-emerald-800 dark:text-emerald-300',
  timerBar: 'from-emerald-700 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:to-teal-300',
  focusRing: 'focus:ring-emerald-600 dark:focus:ring-teal-500',
};

const HINDU_THEME: ModeThemeTokens = {
  pageCanvas:
    'bg-gradient-to-b from-[#FDFBF6] via-[#F9F3E6] to-[#F3E9D6] dark:bg-gradient-to-b dark:from-[#0D0A07] dark:via-[#14100B] dark:to-[#0B0805]',
  headerSurface:
    'bg-[#FFFDFA]/92 dark:bg-[#14100B]/92 border-b border-[#E8D9BE] dark:border-[#33271A] shadow-[0_2px_12px_rgba(146,64,14,0.05)]',
  brandBadge:
    'bg-gradient-to-tr from-[#9A3412] via-[#C2410C] to-[#D97706] shadow-amber-900/20',
  clockText: 'text-amber-800 dark:text-amber-300',
  primaryBtn:
    'bg-amber-700 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500 shadow-xs',
  subtleActionBtn:
    'bg-amber-50 hover:bg-amber-100/90 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800/60',
  activeTab:
    'bg-white dark:bg-[#231B12] text-amber-800 dark:text-amber-300 shadow-xs font-bold',
  cardSurface: 'bg-[#FFFDF9] dark:bg-[#15110C]',
  cardSubSurface: 'bg-[#FAF3E6] dark:bg-[#1D1710]',
  cardBorder: 'border-[#E8D9BE] dark:border-[#34281B]',
  gridDivider: 'border-[#ECE0CB] dark:border-[#2C2217]',
  todayCircle:
    'bg-amber-700 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs ring-2 ring-amber-400/50',
  selectedCell:
    'bg-amber-50/80 dark:bg-amber-950/35 ring-1 ring-inset ring-amber-700/25 dark:ring-amber-500/35',
  specialDayCell:
    'bg-[#FDF7EB] dark:bg-amber-950/20 hover:bg-[#FAF0DD] dark:hover:bg-amber-950/30',
  specialDayTopBorder: 'border-t-2 border-t-amber-600/80 dark:border-t-amber-400/75',
  accentText: 'text-amber-800 dark:text-amber-300',
  accentTextMuted: 'text-[#9A3412] dark:text-orange-300',
  timerCard:
    'bg-[#FFFDF9] dark:bg-[#15110C] border border-[#E8D9BE] dark:border-[#34281B] shadow-[0_8px_26px_-12px_rgba(146,64,14,0.1)] dark:shadow-xl',
  timerHeader:
    'bg-gradient-to-r from-[#FAF3E6] via-[#FFFDF9] to-[#FDF6E8] dark:from-[#1E170F] dark:via-[#15110C] dark:to-[#120E0A] border-b border-[#E8D9BE] dark:border-[#34281B]',
  timerIconBox:
    'bg-amber-700/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-600/30 dark:border-amber-500/30',
  timerBadge:
    'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/50',
  timerDigits: 'text-amber-800 dark:text-amber-300',
  timerBar: 'from-[#9A3412] to-[#D97706] dark:from-orange-400 dark:to-amber-300',
  focusRing: 'focus:ring-amber-600 dark:focus:ring-amber-500',
};

export function getModeTheme(mode: CalendarFaithMode = 'christian'): ModeThemeTokens {
  switch (mode) {
    case 'muslim':
      return MUSLIM_THEME;
    case 'hindu':
      return HINDU_THEME;
    case 'christian':
    default:
      return CHRISTIAN_THEME;
  }
}
