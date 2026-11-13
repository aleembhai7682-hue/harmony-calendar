import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ViewMode,
  Language,
  Theme,
  CalendarEvent,
  CalendarTask,
  CalendarFilterSettings,
  CalendarFaithMode,
  IndianFestival,
  IslamicOccasion,
} from './types/calendar';
import {
  loadEvents,
  saveEvents,
  loadTasks,
  saveTasks,
  loadFilters,
  saveFilters,
  loadTheme,
  saveTheme,
  loadLanguage,
  saveLanguage,
  loadActiveMode,
  saveActiveMode,
  loadDemoSampleData,
  clearAllUserCalendarData,
  importBackupData,
  DEFAULT_FILTERS,
} from './utils/storage';
import { formatDateToLocalYMD, getTodayLocalYMD } from './utils/dateUtils';
import { isEventOnDate, isEventVisibleInMode } from './utils/eventUtils';
import { isTaskVisibleInMode } from './utils/taskFilter';
import { getHijriDate, getIslamicOccasionForDate } from './utils/hijri';
import { getUpcomingGlobalHolidays } from './utils/globalHolidays';
import { getDeviceTimezone } from './utils/istTime';
import { getEffectiveCalendarTimezone, getEventDisplayInTimezone } from './utils/timezoneService';
import { exportEventsToIcs } from './utils/icsExport';
import {
  shouldTriggerReminder,
  playGentleChime,
  triggerNativeNotification,
  requestNotificationPermissionByUser,
  testNotificationChimeAndAlert,
  CalendarReminderItem,
} from './utils/notifications';
import { Bell, CheckCircle2, X } from 'lucide-react';

// Calendar Views & Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { YearView } from './components/YearView';
import { AgendaView } from './components/AgendaView';
import { EventModal } from './components/EventModal';
import { TaskModal } from './components/TaskModal';
import { FestivalDetailModal } from './components/FestivalDetailModal';
import { IslamicOccasionModal } from './components/IslamicOccasionModal';
import { QuickAddModal } from './components/QuickAddModal';
import { SettingsModal } from './components/SettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

// Dedicated Lifestyle & Productivity Widgets
import { IslamicPrayerWidget } from './components/IslamicPrayerWidget';
import { HinduPanchangWidget } from './components/HinduPanchangWidget';
import { ChristianLifestyleWidget } from './components/ChristianLifestyleWidget';
import { ProductivityTimerWidget } from './components/ProductivityTimerWidget';

export default function App() {
  // Mode Isolation State: 'christian' (default) | 'hindu' | 'muslim'
  const [calendarMode, setCalendarMode] = useState<CalendarFaithMode>(() => loadActiveMode());

  // Calendar State - Initialize to actual current date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [activeReminderToast, setActiveReminderToast] = useState<CalendarReminderItem | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const mode = loadActiveMode();
    if (mode === 'christian') return 'en';
    if (mode === 'hindu') {
      const l = loadLanguage();
      return l === 'ur' ? 'en' : l;
    }
    return loadLanguage();
  });
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents());
  const [tasks, setTasks] = useState<CalendarTask[]>(() => loadTasks());
  const [filters, setFilters] = useState<CalendarFilterSettings>(() => {
    const loaded = loadFilters();
    const activeM = loadActiveMode();
    return {
      ...loaded,
      calendarMode: activeM,
      muslimOnlyMode: activeM === 'muslim',
    };
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<string>('');
  const [eventModalTime, setEventModalTime] = useState<string>('10:00');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [taskModalDate, setTaskModalDate] = useState<string>('');

  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<IndianFestival | null>(null);

  const [isIslamicModalOpen, setIsIslamicModalOpen] = useState(false);
  const [selectedIslamic, setSelectedIslamic] = useState<IslamicOccasion | null>(null);

  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Synchronize Theme & Language in localStorage and DOM
  useEffect(() => {
    saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  // Handle Mode Change with Strict Segregation & Persistence
  const handleModeChange = (newMode: CalendarFaithMode) => {
    setCalendarMode(newMode);
    saveActiveMode(newMode);

    // Strict language isolation:
    // Christian Mode: English exclusively, no Urdu
    // Hindu Mode: Hindi / Sanskrit / English, no Urdu
    // Muslim Mode: Preserve existing Urdu support
    if (newMode === 'christian') {
      setLanguage('en');
      saveLanguage('en');
    } else if (newMode === 'hindu') {
      if (language === 'ur') {
        setLanguage('en');
        saveLanguage('en');
      }
    } else if (newMode === 'muslim') {
      const savedLang = loadLanguage();
      if (savedLang === 'ur' || savedLang === 'hinglish') {
        setLanguage(savedLang);
      } else {
        setLanguage('ur');
        saveLanguage('ur');
      }
    }

    const updatedFilters: CalendarFilterSettings = {
      ...filters,
      calendarMode: newMode,
      muslimOnlyMode: newMode === 'muslim',
    };
    setFilters(updatedFilters);
    saveFilters(updatedFilters);
  };

  // Calendar persistence handlers
  const handleUpdateEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const handleUpdateTasks = (newTasks: CalendarTask[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const handleUpdateFilters = (newFilters: CalendarFilterSettings) => {
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  const effectiveTz = useMemo(() => getEffectiveCalendarTimezone(filters), [filters]);

  // Upcoming items calculation (country-aware national holidays + religious festivals)
  const upcomingFestivals = useMemo(() => {
    const todayStr = formatDateToLocalYMD(currentDate);
    return getUpcomingGlobalHolidays(currentDate, todayStr, filters.selectedCountryCode).slice(0, 8);
  }, [currentDate, filters.selectedCountryCode]);

  const upcomingIslamic = useMemo(() => {
    const list: IslamicOccasion[] = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      const occ = getIslamicOccasionForDate(d, filters.hijriAdjustmentDays);
      if (occ && !list.some((x) => x.id === occ.id)) {
        list.push(occ);
      }
    }
    return list.slice(0, 8);
  }, [currentDate, filters.hijriAdjustmentDays]);

  // Date navigation with safe month clamping to prevent overflow bugs
  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      if (direction === 'today') {
        setCurrentDate(new Date());
        return;
      }

      setCurrentDate((prev) => {
        const d = new Date(prev);
        const delta = direction === 'next' ? 1 : -1;

        switch (viewMode) {
          case 'month':
          case 'agenda': {
            const curDay = d.getDate();
            d.setDate(1);
            d.setMonth(d.getMonth() + delta);
            const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(curDay, maxDays));
            break;
          }
          case 'week':
            d.setDate(d.getDate() + delta * 7);
            break;
          case 'day':
            d.setDate(d.getDate() + delta);
            break;
          case 'year': {
            const curDay = d.getDate();
            d.setDate(1);
            d.setFullYear(d.getFullYear() + delta);
            const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(curDay, maxDays));
            break;
          }
        }
        return d;
      });
    },
    [viewMode]
  );

  // Periodic Reminder Engine - Checks every 30 seconds for upcoming events & tasks
  useEffect(() => {
    const checkReminders = () => {
      const todayStr = getTodayLocalYMD();
      const deviceTz = getDeviceTimezone();

      // Check Events (strictly filtered by active faith mode & converted to device local TZ when timed)
      for (const evt of events) {
        const display = getEventDisplayInTimezone(evt, deviceTz);
        if (
          isEventVisibleInMode(evt, calendarMode) &&
          isEventOnDate(evt, todayStr, deviceTz) &&
          shouldTriggerReminder(
            `evt-${evt.id}`,
            todayStr,
            display.startTime,
            evt.reminderMinutesBefore || 15
          )
        ) {
          const item: CalendarReminderItem = {
            id: `evt-${evt.id}`,
            title: evt.title,
            timeStr: display.startTime || 'All Day',
            type: 'event',
            category: evt.category,
            message: evt.description || `Event starting at ${display.startTime || 'today'}`,
            timestamp: Date.now(),
          };
          playGentleChime();
          triggerNativeNotification(item);
          setActiveReminderToast(item);
          break;
        }
      }

      // Check Tasks (strictly filtered by active faith mode)
      for (const tsk of tasks) {
        if (
          !tsk.completed &&
          isTaskVisibleInMode(tsk, calendarMode) &&
          tsk.dueDate === todayStr &&
          shouldTriggerReminder(`tsk-${tsk.id}`, tsk.dueDate, tsk.dueTime, 30)
        ) {
          const item: CalendarReminderItem = {
            id: `tsk-${tsk.id}`,
            title: tsk.title,
            timeStr: tsk.dueTime ? `Due at ${tsk.dueTime}` : 'Due Today',
            type: 'task',
            category: tsk.category,
            message: tsk.description || `Task pending: ${tsk.title}`,
            timestamp: Date.now(),
          };
          playGentleChime();
          triggerNativeNotification(item);
          setActiveReminderToast(item);
          break;
        }
      }
    };

    const interval = setInterval(checkReminders, 30000);
    const timeout = setTimeout(checkReminders, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [events, tasks, calendarMode]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 't') {
        handleNavigate('today');
      } else if (key === 'm') {
        setViewMode('month');
      } else if (key === 'w') {
        setViewMode('week');
      } else if (key === 'd') {
        setViewMode('day');
      } else if (key === 'y') {
        setViewMode('year');
      } else if (key === 'a') {
        setViewMode('agenda');
      } else if (key === 'c' || key === 'n') {
        e.preventDefault();
        setSelectedEvent(null);
        setEventModalDate(formatDateToLocalYMD(currentDate));
        setEventModalTime('10:00');
        setIsEventModalOpen(true);
      } else if (key === 'k') {
        e.preventDefault();
        setIsQuickAddModalOpen(true);
      } else if (key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
      } else if (e.key === 'ArrowLeft') {
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        handleNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate, handleNavigate]);

  // Event & Task Handlers
  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    const exists = events.some((e) => e.id === savedEvent.id);
    if (exists) {
      handleUpdateEvents(events.map((e) => (e.id === savedEvent.id ? savedEvent : e)));
    } else {
      handleUpdateEvents([savedEvent, ...events]);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    handleUpdateEvents(events.filter((e) => e.id !== eventId));
  };

  const handleSaveTask = (savedTask: CalendarTask) => {
    const taskWithTag: CalendarTask = {
      ...savedTask,
      faithTag: savedTask.faithTag || 'universal',
    };

    const exists = tasks.some((t) => t.id === taskWithTag.id);
    if (exists) {
      handleUpdateTasks(tasks.map((t) => (t.id === taskWithTag.id ? taskWithTag : t)));
    } else {
      handleUpdateTasks([taskWithTag, ...tasks]);
    }
  };

  const handleToggleTask = (taskId: string) => {
    handleUpdateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    handleUpdateTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleExportIcs = () => {
    exportEventsToIcs(events, 'Harmony Calendar', effectiveTz);
  };

  const handleExportBackup = () => {
    const data = {
      app: 'Harmony Calendar',
      version: '3.0',
      exportDate: new Date().toISOString(),
      activeMode: calendarMode,
      language,
      theme,
      events,
      tasks,
      filters,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmony_calendar_backup_${formatDateToLocalYMD(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const result = importBackupData(jsonStr);
    if (!result.success) {
      alert(`Import failed: ${result.message || 'Invalid backup data structure.'}`);
      return;
    }
    if (result.data) {
      if (result.data.events !== undefined) handleUpdateEvents(result.data.events);
      if (result.data.tasks !== undefined) handleUpdateTasks(result.data.tasks);
      if (result.data.filters !== undefined) handleUpdateFilters(result.data.filters);
      if (result.data.activeMode !== undefined) handleModeChange(result.data.activeMode);
      if (result.data.language !== undefined) setLanguage(result.data.language);
      if (result.data.theme !== undefined) setTheme(result.data.theme);
      alert('Backup data restored successfully!');
    }
  };

  const todayHijri = getHijriDate(currentDate, filters.hijriAdjustmentDays);

  return (
    <div
      className={`min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors relative overflow-x-hidden ${
        calendarMode === 'christian'
          ? 'bg-gradient-to-b from-[#FAF8F3] via-[#F4F8FD] to-[#EEF3FA] dark:bg-gradient-to-b dark:from-[#070E1D] dark:via-[#0B162C] dark:to-[#081020]'
          : calendarMode === 'hindu'
          ? 'bg-gradient-to-b from-amber-50/40 via-orange-50/20 to-slate-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-[#191107] dark:to-slate-950'
          : 'bg-slate-50 dark:bg-slate-950'
      }`}
    >
      {/* Ambient background light glow for peaceful Christian / Hindu themes */}
      {calendarMode === 'christian' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-sky-300/18 via-amber-200/12 to-transparent dark:from-sky-500/10 dark:via-amber-300/5 blur-3xl pointer-events-none -z-0" />
      )}
      {calendarMode === 'hindu' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-amber-500/10 via-orange-400/5 to-transparent blur-3xl pointer-events-none -z-0" />
      )}
      
      {/* 🌟 Unified Clean Navbar with 3-Way Mode Switcher */}
      <Navbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigate={handleNavigate}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeToggle={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          saveTheme(next);
        }}
        todayHijri={todayHijri}
        calendarMode={calendarMode}
        onModeChange={handleModeChange}
        onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
        onOpenNewEvent={() => {
          setSelectedEvent(null);
          setEventModalDate(formatDateToLocalYMD(currentDate));
          setEventModalTime('10:00');
          setIsEventModalOpen(true);
        }}
        onOpenNewTask={() => {
          setSelectedTask(null);
          setTaskModalDate(formatDateToLocalYMD(currentDate));
          setIsTaskModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={filters.selectedCity}
        selectedCountry={filters.selectedCountry}
        selectedCountryCode={filters.selectedCountryCode}
        selectedLocationTimezone={filters.selectedLocationTimezone}
        locationSource={filters.locationSource}
        locationExplicitlyConfirmed={filters.locationExplicitlyConfirmed}
        customLatitude={filters.customLatitude}
        customLongitude={filters.customLongitude}
        customLocationName={filters.customLocationName}
        timeFormat={filters.timeFormat}
        dateFormat={filters.dateFormat}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        
        {/* 🌟 Dedicated Multi-Faith Mode Hero Card */}
        {calendarMode === 'muslim' && (
          <IslamicPrayerWidget
            currentDate={currentDate}
            hijriOffset={filters.hijriAdjustmentDays}
            language={language}
            selectedCity={filters.selectedCity}
            selectedCountry={filters.selectedCountry}
            selectedCountryCode={filters.selectedCountryCode}
            selectedLocationTimezone={filters.selectedLocationTimezone}
            locationSource={filters.locationSource}
            locationExplicitlyConfirmed={filters.locationExplicitlyConfirmed}
            customLat={filters.customLatitude}
            customLon={filters.customLongitude}
            customName={filters.customLocationName}
            prayerMethod={filters.prayerMethod}
            asrMethod={filters.asrMethod}
            timeFormat={filters.timeFormat}
            onLocationChange={(loc) => handleUpdateFilters({ ...filters, ...loc })}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {calendarMode === 'hindu' && (
          <HinduPanchangWidget
            currentDate={currentDate}
            selectedCity={filters.selectedCity}
            selectedCountry={filters.selectedCountry}
            selectedCountryCode={filters.selectedCountryCode}
            selectedLocationTimezone={filters.selectedLocationTimezone}
            locationSource={filters.locationSource}
            locationExplicitlyConfirmed={filters.locationExplicitlyConfirmed}
            customLat={filters.customLatitude}
            customLon={filters.customLongitude}
            customName={filters.customLocationName}
            timeFormat={filters.timeFormat}
            onLocationChange={(loc) => handleUpdateFilters({ ...filters, ...loc })}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {calendarMode === 'christian' && (
          <ChristianLifestyleWidget
            currentDate={currentDate}
            selectedCountryCode={filters.selectedCountryCode}
            timeFormat={filters.timeFormat}
            dateFormat={filters.dateFormat}
          />
        )}

        {/* ⚡ Lifestyle & Daily Routine Productivity Focus Timer */}
        <ProductivityTimerWidget />

        {/* Calendar Grid + Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Interactive Sidebar */}
          <Sidebar
            currentDate={currentDate}
            onSelectDate={(d) => setCurrentDate(d)}
            filters={filters}
            onFilterChange={handleUpdateFilters}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenNewTask={() => {
              setSelectedTask(null);
              setTaskModalDate(formatDateToLocalYMD(currentDate));
              setIsTaskModalOpen(true);
            }}
            onSelectIslamic={(occ) => {
              setSelectedIslamic(occ);
              setIsIslamicModalOpen(true);
            }}
            onSelectFestival={(fest) => {
              setSelectedFestival(fest);
              setIsFestivalModalOpen(true);
            }}
            language={language}
            upcomingFestivals={upcomingFestivals}
            upcomingIslamic={upcomingIslamic}
          />

          {/* Calendar View Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {viewMode === 'month' && (
              <MonthView
                currentDate={currentDate}
                onSelectDate={(d) => setCurrentDate(d)}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onOpenCreateEventOnDate={(dStr) => {
                  setSelectedEvent(null);
                  setEventModalDate(dStr);
                  setEventModalTime('10:00');
                  setIsEventModalOpen(true);
                }}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setEventModalDate(evt.startDate);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
                onToggleTask={handleToggleTask}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                currentDate={currentDate}
                onSelectDate={(d) => setCurrentDate(d)}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onOpenCreateEventOnDateAndTime={(dStr, tStr) => {
                  setSelectedEvent(null);
                  setEventModalDate(dStr);
                  setEventModalTime(tStr);
                  setIsEventModalOpen(true);
                }}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setEventModalDate(evt.startDate);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
              />
            )}

            {viewMode === 'day' && (
              <DayView
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onOpenCreateEventOnDateAndTime={(dStr, tStr) => {
                  setSelectedEvent(null);
                  setEventModalDate(dStr);
                  setEventModalTime(tStr);
                  setIsEventModalOpen(true);
                }}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setEventModalDate(evt.startDate);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
                onToggleTask={handleToggleTask}
                onOpenNewTask={() => {
                  setSelectedTask(null);
                  setTaskModalDate(formatDateToLocalYMD(currentDate));
                  setIsTaskModalOpen(true);
                }}
              />
            )}

            {viewMode === 'year' && (
              <YearView
                currentDate={currentDate}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
                onNavigateToMonth={(year, month) => {
                  setCurrentDate(new Date(year, month, 1));
                  setViewMode('month');
                }}
                events={events}
                filters={filters}
                language={language}
              />
            )}

            {viewMode === 'agenda' && (
              <AgendaView
                currentDate={currentDate}
                onSelectDate={(d) => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
                events={events}
                tasks={tasks}
                filters={filters}
                language={language}
                onSelectEvent={(evt) => {
                  setSelectedEvent(evt);
                  setIsEventModalOpen(true);
                }}
                onSelectFestival={(f) => {
                  setSelectedFestival(f);
                  setIsFestivalModalOpen(true);
                }}
                onSelectIslamic={(occ) => {
                  setSelectedIslamic(occ);
                  setIsIslamicModalOpen(true);
                }}
                onToggleTask={handleToggleTask}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={selectedEvent}
        defaultDate={eventModalDate}
        defaultTime={eventModalTime}
        language={language}
        activeTimeZone={effectiveTz}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={selectedTask}
        defaultDate={taskModalDate}
        language={language}
      />

      <FestivalDetailModal
        isOpen={isFestivalModalOpen}
        onClose={() => setIsFestivalModalOpen(false)}
        festival={selectedFestival}
        language={language}
        onAddToEvents={(fest) => {
          handleSaveEvent({
            id: `fest-evt-${Date.now()}`,
            title: fest.nameEn,
            description: `${fest.significance}\n\nRituals: ${fest.rituals.join(', ')}`,
            startDate: fest.date,
            endDate: fest.endDate || fest.date,
            allDay: true,
            category: 'festival',
            priority: 'medium',
            recurrence: 'yearly',
            color: '#f59e0b',
            createdAt: Date.now(),
          });
        }}
      />

      <IslamicOccasionModal
        isOpen={isIslamicModalOpen}
        onClose={() => setIsIslamicModalOpen(false)}
        occasion={selectedIslamic}
        language={language}
        onAddToEvents={(occ) => {
          handleSaveEvent({
            id: `islamic-evt-${Date.now()}`,
            title: occ.nameEn,
            description: `${occ.spiritualSignificance}\n\nPractices: ${occ.practices.join(', ')}`,
            startDate: occ.estimatedDate,
            endDate: occ.estimatedDate,
            allDay: true,
            category: 'spiritual',
            priority: 'high',
            recurrence: 'none',
            color: '#10b981',
            createdAt: Date.now(),
          });
        }}
      />

      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onAddEvent={handleSaveEvent}
        language={language}
        calendarMode={calendarMode}
        activeTimeZone={effectiveTz}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        filters={filters}
        onFilterChange={handleUpdateFilters}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        calendarMode={calendarMode}
        onExportIcs={handleExportIcs}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDefaults={() => {
          handleUpdateFilters(DEFAULT_FILTERS);
        }}
        onLoadDemoData={() => {
          const { events: demoEvts, tasks: demoTasks } = loadDemoSampleData();
          handleUpdateEvents(demoEvts);
          handleUpdateTasks(demoTasks);
        }}
        onClearAllData={() => {
          clearAllUserCalendarData();
          handleUpdateEvents([]);
          handleUpdateTasks([]);
        }}
        onTestReminder={() => {
          const item = testNotificationChimeAndAlert();
          setActiveReminderToast(item);
          setTimeout(() => {
            setActiveReminderToast((current) => (current?.id === item.id ? null : current));
          }, 8000);
        }}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        language={language}
      />

      {/* 🔔 In-App Gentle Reminder Toast Notification */}
      {activeReminderToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white border border-indigo-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {activeReminderToast.type === 'event' ? 'Upcoming Event' : 'Task Reminder'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeReminderToast.timeStr}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white truncate mt-0.5">
                {activeReminderToast.title}
              </h4>
              {activeReminderToast.message && (
                <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">
                  {activeReminderToast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => setActiveReminderToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

    </div>
  );
}
