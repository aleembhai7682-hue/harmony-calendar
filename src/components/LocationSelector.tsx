import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Globe,
  X,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { CalendarFilterSettings, CalendarFaithMode, Language } from '../types/calendar';
import {
  CityLocation,
  getCityLocation,
  hasExplicitLocation,
  formatCityCountryLabel,
  searchLocalCities,
  searchGlobalCitiesOnline,
  isValidCoordinatePair,
} from '../utils/cities';
import { getDeviceTimezone, getTimezoneOffsetHoursForZone, formatUtcOffset } from '../utils/istTime';
import { needsLegacyMumbaiConfirmation } from '../utils/storage';

interface LocationSelectorProps {
  filters: CalendarFilterSettings;
  onLocationUpdate: (updates: Partial<CalendarFilterSettings>) => void;
  calendarMode?: CalendarFaithMode;
  language?: Language;
  compact?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  filters,
  onLocationUpdate,
  calendarMode = 'christian',
  language = 'en',
  compact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState<CityLocation[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineSearchNotice, setOnlineSearchNotice] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [showManualCoords, setShowManualCoords] = useState<boolean>(
    filters.selectedCity === 'custom' &&
      isValidCoordinatePair(filters.customLatitude, filters.customLongitude)
  );
  const [manualLat, setManualLat] = useState<string>(
    filters.customLatitude !== undefined ? String(filters.customLatitude) : ''
  );
  const [manualLon, setManualLon] = useState<string>(
    filters.customLongitude !== undefined ? String(filters.customLongitude) : ''
  );
  const [manualName, setManualName] = useState<string>(filters.customLocationName || '');
  const [manualCountry, setManualCountry] = useState<string>(filters.selectedCountry || '');

  const hasLocation = hasExplicitLocation(
    filters.selectedCity,
    filters.customLatitude,
    filters.customLongitude
  );
  const isLegacyMumbai = needsLegacyMumbaiConfirmation(filters);

  const activeLocation = getCityLocation(
    filters.selectedCity,
    filters.customLatitude,
    filters.customLongitude,
    filters.customLocationName,
    filters.selectedCountry,
    filters.selectedLocationTimezone
  );

  const deviceTz = getDeviceTimezone();
  const deviceOffsetStr = formatUtcOffset(getTimezoneOffsetHoursForZone(deviceTz));
  const locationTz = hasLocation ? activeLocation.timezone || deviceTz : deviceTz;
  const locationTzOffsetStr = formatUtcOffset(getTimezoneOffsetHoursForZone(locationTz));

  const localResults = useMemo(() => searchLocalCities(searchQuery), [searchQuery]);

  const handleSelectCity = (city: CityLocation) => {
    const isBuiltIn = !city.id.startsWith('geocoded:');
    onLocationUpdate({
      selectedCity: isBuiltIn ? city.id : 'custom',
      selectedCountry: city.country,
      selectedLocationTimezone: city.timezone,
      customLatitude: city.latitude,
      customLongitude: city.longitude,
      customLocationName: city.nameEn,
      locationExplicitlyConfirmed: true,
    });
    setManualLat(String(city.latitude));
    setManualLon(String(city.longitude));
    setManualName(city.nameEn);
    setManualCountry(city.country);
    setGeoStatus(null);
    setOnlineSearchNotice(null);
  };

  const handleClearLocation = () => {
    onLocationUpdate({
      selectedCity: '',
      selectedCountry: undefined,
      selectedLocationTimezone: undefined,
      customLatitude: undefined,
      customLongitude: undefined,
      customLocationName: undefined,
      locationExplicitlyConfirmed: true,
    });
    setManualLat('');
    setManualLon('');
    setManualName('');
    setManualCountry('');
    setGeoStatus(null);
  };

  const handleConfirmLegacyMumbai = () => {
    const mumbai = getCityLocation('mumbai');
    onLocationUpdate({
      selectedCity: 'mumbai',
      selectedCountry: mumbai.country,
      selectedLocationTimezone: mumbai.timezone,
      customLatitude: mumbai.latitude,
      customLongitude: mumbai.longitude,
      customLocationName: mumbai.nameEn,
      locationExplicitlyConfirmed: true,
    });
  };

  const handleDetectLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus({
        message:
          'Geolocation is not supported by your browser. Search for a city below or enter manual coordinates. Standard calendar views, events, and reminders continue working normally.',
        isError: true,
      });
      return;
    }

    setIsLocating(true);
    setGeoStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        const tz = getDeviceTimezone();
        onLocationUpdate({
          selectedCity: 'custom',
          selectedCountry: '',
          selectedLocationTimezone: tz,
          customLatitude: lat,
          customLongitude: lon,
          customLocationName: 'Device GPS Location',
          locationExplicitlyConfirmed: true,
        });
        setManualLat(String(lat));
        setManualLon(String(lon));
        setManualName('Device GPS Location');
        setManualCountry('');
        setGeoStatus({
          message: `Location detected: ${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'} (${tz})`,
          isError: false,
        });
      },
      (err) => {
        setIsLocating(false);
        let reason = 'Unable to access your device location.';
        if (err.code === err.PERMISSION_DENIED) {
          reason =
            'Location permission was denied. Your calendar, events, tasks, and reminders remain fully functional; select a city below or enter coordinates for sunrise, sunset, prayer times, and solar Panchang.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reason =
            'Device location is unavailable right now. Please select a city below or enter coordinates manually.';
        } else if (err.code === err.TIMEOUT) {
          reason =
            'Location detection timed out. Please select a city below or enter coordinates manually.';
        }
        setGeoStatus({ message: reason, isError: true });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleOnlineSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setIsSearchingOnline(true);
    setOnlineSearchNotice(null);
    const results = await searchGlobalCitiesOnline(searchQuery);
    setIsSearchingOnline(false);
    setOnlineResults(results);
    if (results.length === 0) {
      setOnlineSearchNotice(
        'No additional places returned from global geocoding. Choose from the list above or enter manual coordinates.'
      );
    }
  };

  const handleApplyManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);
    if (!isValidCoordinatePair(lat, lon)) {
      setGeoStatus({
        message: 'Please enter valid coordinates: Latitude between -90 and 90, Longitude between -180 and 180.',
        isError: true,
      });
      return;
    }
    onLocationUpdate({
      selectedCity: 'custom',
      selectedCountry: manualCountry.trim() || undefined,
      selectedLocationTimezone: deviceTz,
      customLatitude: Number(lat.toFixed(4)),
      customLongitude: Number(lon.toFixed(4)),
      customLocationName: manualName.trim() || undefined,
      locationExplicitlyConfirmed: true,
    });
    setGeoStatus({
      message: `Manual coordinates saved (${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}).`,
      isError: false,
    });
  };

  const isUrdu = calendarMode === 'muslim' && language === 'ur';

  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
      {/* Header + Detect & Clear actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-500" />
          <span>
            {isUrdu
              ? 'جغرافیائی مقام اور ٹائم زون'
              : 'Geographical Location & Timezone'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Detect my location'}</span>
          </button>

          {hasLocation && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-200/70 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Clear selected location"
            >
              <X className="w-3 h-3" />
              <span>Clear location</span>
            </button>
          )}
        </div>
      </div>

      {/* Legacy Mumbai One-Time Confirmation Prompt */}
      {isLegacyMumbai && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-2">
          <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Please confirm your saved location</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Mumbai, India was previously saved as the default. Confirm if you are in Mumbai, or clear and choose your actual city.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleConfirmLegacyMumbai}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Confirm Mumbai, India</span>
            </button>
            <button
              type="button"
              onClick={handleClearLocation}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-bold cursor-pointer"
            >
              Choose another location
            </button>
          </div>
        </div>
      )}

      {/* Separated Status Cards: Current City/Country vs Current Device Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-500" />
            <span>Current City & Country</span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
            {hasLocation ? formatCityCountryLabel(activeLocation) : 'Location not set'}
          </div>
          <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            {hasLocation
              ? `${Math.abs(activeLocation.latitude).toFixed(2)}°${activeLocation.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(activeLocation.longitude).toFixed(2)}°${activeLocation.longitude >= 0 ? 'E' : 'W'} • ${locationTz} (${locationTzOffsetStr})`
              : 'Select a city, enable GPS, or enter coordinates'}
          </div>
        </div>

        <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" />
            <span>Device Timezone (Clock & Events)</span>
          </div>
          <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
            {deviceTz}
          </div>
          <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
            {deviceOffsetStr} • Auto-detected (DST-aware)
          </div>
        </div>
      </div>

      {/* Geolocation / Validation Feedback */}
      {geoStatus && (
        <div
          className={`p-2.5 rounded-xl text-xs font-medium ${
            geoStatus.isError
              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {geoStatus.message}
        </div>
      )}

      {/* Searchable City / Country Selector */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOnlineResults([]);
              setOnlineSearchNotice(null);
            }}
            placeholder="Search city, state, or country (e.g. Kanpur, Mumbai, London, Dubai, New York)..."
            className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setOnlineResults([]);
                setOnlineSearchNotice(null);
              }}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Matching Verified Cities List */}
        <div
          className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 ${
            compact ? 'max-h-40' : 'max-h-48'
          }`}
        >
          {localResults.length === 0 && onlineResults.length === 0 ? (
            <div className="p-3 text-center space-y-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                No built-in city matched "{searchQuery}".
              </p>
              {searchQuery.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={handleOnlineSearch}
                  disabled={isSearchingOnline}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  {isSearchingOnline ? 'Searching global cities...' : `Search global directory for "${searchQuery.trim()}"`}
                </button>
              )}
              {onlineSearchNotice && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">{onlineSearchNotice}</p>
              )}
            </div>
          ) : (
            <>
              {localResults.map((c) => {
                const isSelected = filters.selectedCity?.toLowerCase() === c.id.toLowerCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 dark:bg-indigo-950/60' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.nameEn}, {c.country}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {c.stateOrRegion} • {c.timezone}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5">
                      <span>
                        {Math.abs(c.latitude).toFixed(2)}°{c.latitude >= 0 ? 'N' : 'S'},{' '}
                        {Math.abs(c.longitude).toFixed(2)}°{c.longitude >= 0 ? 'E' : 'W'}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                  </button>
                );
              })}

              {onlineResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCity(c)}
                  className="w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.nameEn}{c.country ? `, ${c.country}` : ''}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                      Global Geocoding • {c.timezone}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    {Math.abs(c.latitude).toFixed(2)}°{c.latitude >= 0 ? 'N' : 'S'},{' '}
                    {Math.abs(c.longitude).toFixed(2)}°{c.longitude >= 0 ? 'E' : 'W'}
                  </div>
                </button>
              ))}

              {searchQuery.trim().length >= 2 && onlineResults.length === 0 && (
                <div className="p-2 text-center bg-slate-50/70 dark:bg-slate-800/40">
                  <button
                    type="button"
                    onClick={handleOnlineSearch}
                    disabled={isSearchingOnline}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {isSearchingOnline
                      ? 'Searching global directory...'
                      : `Not listed? Search global places for "${searchQuery.trim()}"`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Manual Coordinates Toggle & Inputs */}
      <div>
        <button
          type="button"
          onClick={() => setShowManualCoords(!showManualCoords)}
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {showManualCoords ? 'Hide manual coordinates' : 'Enter manual coordinates (latitude / longitude)'}
        </button>

        {showManualCoords && (
          <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="e.g. 26.4499"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  placeholder="e.g. 80.3319"
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="City or Place Name"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Country (optional)
                </label>
                <input
                  type="text"
                  value={manualCountry}
                  onChange={(e) => setManualCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyManualCoords}
              className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Save Manual Coordinates
            </button>
          </div>
        )}
      </div>

      {!hasLocation && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Without a selected location, standard calendar views, events, tasks, reminders, and Gregorian/Hijri dates continue working normally in your device timezone ({deviceTz}). Select a location above when you want sunrise, sunset, prayer times, or solar Panchang timings.
        </p>
      )}
    </div>
  );
};
