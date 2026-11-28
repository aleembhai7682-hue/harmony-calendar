import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CalendarFaithMode } from '../types/calendar';
import { getModeTheme } from '../utils/modeTheme';

interface PWAInstallButtonProps {
  calendarMode?: CalendarFaithMode;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  calendarMode = 'christian',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const modeTheme = getModeTheme(calendarMode);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="Install Harmony Calendar for offline access"
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${modeTheme.subtleActionBtn}`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden md:inline">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Install Harmony Calendar on iPhone / iPad"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${modeTheme.subtleActionBtn}`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className={`w-full max-w-sm rounded-2xl p-5 shadow-xl border ${modeTheme.cardSurface} ${modeTheme.cardBorder}`}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Install Harmony Calendar
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                1. Tap the <strong>Share</strong> button in your Safari toolbar.
                <br />
                2. Scroll down and tap <strong>Add to Home Screen</strong> for instant offline calendar access.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition-colors cursor-pointer ${modeTheme.primaryBtn}`}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
