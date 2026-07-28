// Compute a UTC [from, to] window for one store-LOCAL calendar day. The server
// runs in UTC, but a store's "hari ini" is its own timezone (WIB = +420), so the
// client passes its tz offset (minutes east of UTC) and, optionally, a picked
// date (YYYY-MM-DD). Without this, reports drift onto the neighbouring UTC day.
export function dayWindow(dateParam?: string | null, tzParam?: string | null) {
  const offMs = (parseInt(tzParam ?? "0", 10) || 0) * 60000;
  const DAY = 86400000;
  const ymd = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? dateParam
    : new Date(Date.now() + offMs).toISOString().slice(0, 10);   // store-local today
  const startUTC = new Date(`${ymd}T00:00:00.000Z`).getTime() - offMs;
  return { from: new Date(startUTC), to: new Date(startUTC + DAY - 1), ymd };
}
