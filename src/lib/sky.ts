/**
 * 月の出・月の入りの計算(外部API不要)。
 * 月の位置は SunCalc(V. Agafonkin, BSD-2)と同じ簡易式。誤差は数分程度なので、画面では「目安」と書く。
 * ブラウザと Node のテストの両方から読むため、型注釈以外の TypeScript 固有構文は使わない。
 */

/** 日原天文台(看板の表示:北緯34°31′50″ 東経131°50′30″) */
export const OBSERVATORY = { lat: 34 + 31 / 60 + 50 / 3600, lng: 131 + 50 / 60 + 30 / 3600 };

const rad = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = rad * 23.4397;
/** 月の出・入りの判定に使う高度(視半径と大気差の分) */
const MOON_HORIZON = 0.133 * rad;
const JST_OFFSET_MS = 9 * 3_600_000;

const toDays = (ms: number) => ms / DAY_MS - 0.5 + J1970 - J2000;

function moonCoords(d: number) {
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.22935 * d);
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  const ra = Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l));
  const dec = Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l));
  return { ra, dec };
}

function refraction(h: number) {
  const hh = h < 0 ? 0 : h;
  return 0.0002967 / Math.tan(hh + 0.00312536 / (hh + 0.08901179));
}

/** その時刻の月の高度(ラジアン、大気差込み) */
export function moonAltitude(ms: number, lat = OBSERVATORY.lat, lng = OBSERVATORY.lng): number {
  const d = toDays(ms);
  const { ra, dec } = moonCoords(d);
  const H = rad * (280.16 + 360.9856235 * d) + rad * lng - ra;
  const phi = rad * lat;
  const h = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  return h + refraction(h);
}

/** JST の日付(YYYY-MM-DD)の 0時〜24時にある月の出・月の入り。ない日は null */
export function moonTimes(jstDate: string, lat = OBSERVATORY.lat, lng = OBSERVATORY.lng): { rise: Date | null; set: Date | null } {
  const start = Date.parse(`${jstDate}T00:00:00Z`) - JST_OFFSET_MS;
  const STEP = 10 * 60_000;
  let rise: Date | null = null;
  let set: Date | null = null;
  let prev = moonAltitude(start, lat, lng) - MOON_HORIZON;
  for (let t = start + STEP; t <= start + DAY_MS; t += STEP) {
    const cur = moonAltitude(t, lat, lng) - MOON_HORIZON;
    if (prev < 0 !== cur < 0) {
      // 10分の間は直線で近似して、横切った時刻を求める
      const at = new Date(t - STEP + (STEP * prev) / (prev - cur));
      if (cur > 0 && !rise) rise = at;
      if (cur < 0 && !set) set = at;
    }
    prev = cur;
  }
  return { rise, set };
}

/** Date を JST の「H:MM」にする */
export function jstTime(date: Date): string {
  const d = new Date(date.getTime() + JST_OFFSET_MS);
  return `${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
