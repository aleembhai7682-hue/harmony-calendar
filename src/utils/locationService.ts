import { resolveTimezoneFromCoordinates } from './cities';

export interface ReverseGeocodedPlace {
  city: string;
  region: string;
  country: string;
  countryCode: string;
}

export interface DetectedLocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  timezone: string | null;
  place: ReverseGeocodedPlace | null;
  errorCode?: 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'unknown';
  errorMessage?: string;
}

/**
 * Reverse-geocodes geographic coordinates to city, region, and country using
 * BigDataCloud's free, keyless client-side reverse-geocoding endpoint.
 * Never fabricates location names if offline or unavailable.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<ReverseGeocodedPlace | null> {
  if (typeof fetch === 'undefined' || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;
    const res = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;

    const city =
      (typeof data.city === 'string' && data.city.trim()) ||
      (typeof data.locality === 'string' && data.locality.trim()) ||
      '';
    const region =
      typeof data.principalSubdivision === 'string' ? data.principalSubdivision.trim() : '';
    const country = typeof data.countryName === 'string' ? data.countryName.trim() : '';
    const countryCode =
      typeof data.countryCode === 'string' ? data.countryCode.trim().toUpperCase() : '';

    if (!city && !region && !country) {
      return null;
    }

    return {
      city: city || region || country,
      region,
      country,
      countryCode,
    };
  } catch {
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Requests browser geolocation, resolves its IANA timezone strictly from coordinates
 * (never falling back to device timezone), and reverse-geocodes city/region/country when online.
 */
export function detectDeviceGpsLocation(): Promise<DetectedLocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({
        success: false,
        timezone: null,
        place: null,
        errorCode: 'unsupported',
        errorMessage:
          'Geolocation is not supported by your browser. Search for a city or enter manual coordinates.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        const timezone = resolveTimezoneFromCoordinates(lat, lon);
        const place = await reverseGeocodeCoordinates(lat, lon);

        resolve({
          success: true,
          latitude: lat,
          longitude: lon,
          timezone,
          place,
        });
      },
      (err) => {
        let errorCode: DetectedLocationResult['errorCode'] = 'unknown';
        let errorMessage = 'Unable to access your device location.';

        if (err.code === err.PERMISSION_DENIED) {
          errorCode = 'denied';
          errorMessage =
            'Location permission was denied. Standard calendar views, events, tasks, and reminders remain fully functional; select a country and city manually when needed.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorCode = 'unavailable';
          errorMessage =
            'Device location is unavailable right now. Please select a country and city manually.';
        } else if (err.code === err.TIMEOUT) {
          errorCode = 'timeout';
          errorMessage =
            'Location detection timed out. Please select a country and city manually.';
        }

        resolve({
          success: false,
          timezone: null,
          place: null,
          errorCode,
          errorMessage,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}
