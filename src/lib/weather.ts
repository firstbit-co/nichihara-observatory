/**
 * 津和野町(日原天文台の位置)の天気予報を Open-Meteo(無料・APIキー不要、CC BY 4.0)から取る。
 * サイトは30分ごとに作り直すので、そのたびに最新の予報になる。取れなかったときは null(ページは出す)。
 */
import { OBSERVATORY } from './sky.ts';

export type TodayWeather = {
  /** 予報の日(JST、YYYY-MM-DD) */
  date: string;
  summary: string;
  tempMax: number;
  tempMin: number;
  /** 降水確率(%) */
  precipitation: number;
  /** 今夜 19〜22時の雲量の平均(%) */
  nightCloud: number | null;
};

/** WMO の天気コード → 日本語 */
export function weatherText(code: number): string {
  if (code === 0) return '快晴';
  if (code === 1) return '晴れ';
  if (code === 2) return '晴れ時々くもり';
  if (code === 3) return 'くもり';
  if (code === 45 || code === 48) return '霧';
  if (code >= 51 && code <= 57) return '霧雨';
  if (code >= 61 && code <= 67) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return 'にわか雨';
  if (code === 85 || code === 86) return 'にわか雪';
  if (code >= 95) return '雷雨';
  return '—';
}

/** 今夜の雲量のひとこと */
export function cloudText(percent: number): string {
  if (percent < 30) return '雲は少なめ';
  if (percent < 70) return '雲がやや多め';
  return '雲が多い見込み';
}

type OpenMeteo = {
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
  hourly: { time: string[]; cloud_cover: number[] };
};

export function parseOpenMeteo(json: OpenMeteo, jstDate: string): TodayWeather | null {
  const i = json.daily.time.indexOf(jstDate);
  if (i < 0) return null;
  const night = json.hourly.time
    .map((t, k) => ({ t, c: json.hourly.cloud_cover[k] }))
    .filter(({ t }) => t.startsWith(jstDate) && ['19', '20', '21', '22'].includes(t.slice(11, 13)))
    .map(({ c }) => c);
  return {
    date: jstDate,
    summary: weatherText(json.daily.weather_code[i]),
    tempMax: Math.round(json.daily.temperature_2m_max[i]),
    tempMin: Math.round(json.daily.temperature_2m_min[i]),
    precipitation: json.daily.precipitation_probability_max[i] ?? 0,
    nightCloud: night.length ? Math.round(night.reduce((a, b) => a + b, 0) / night.length) : null,
  };
}

export async function getTodayWeather(jstDate: string): Promise<TodayWeather | null> {
  const url =
    process.env.OPEN_METEO_URL ??
    `https://api.open-meteo.com/v1/forecast?latitude=${OBSERVATORY.lat.toFixed(4)}&longitude=${OBSERVATORY.lng.toFixed(4)}&timezone=Asia%2FTokyo&forecast_days=2` +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=cloud_cover';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseOpenMeteo(await res.json(), jstDate);
  } catch (e) {
    console.warn(`[weather] 天気予報を取得できませんでした: ${(e as Error).message}`);
    return null;
  }
}
