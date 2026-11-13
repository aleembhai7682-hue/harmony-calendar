declare module 'tz-lookup' {
  /**
   * Returns the IANA timezone ID (e.g. 'Europe/London', 'Asia/Kolkata')
   * for the given latitude and longitude.
   */
  export default function tzlookup(lat: number, lon: number): string;
}
