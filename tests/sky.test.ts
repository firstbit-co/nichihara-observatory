import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jstTime, moonTimes } from '../src/lib/sky.ts';
import { cloudText, parseOpenMeteo, weatherText } from '../src/lib/weather.ts';

test('月の出・月の入りは SunCalc とほぼ同じ(2026-12-14:出 10:46/入り 21:43)', () => {
  const { rise, set } = moonTimes('2026-12-14');
  assert.ok(rise && set);
  const minutes = (d: Date, h: number, m: number) => Math.abs(Number(jstTime(d).split(':')[0]) * 60 + Number(jstTime(d).split(':')[1]) - (h * 60 + m));
  assert.ok(minutes(rise, 10, 46) <= 3, jstTime(rise));
  assert.ok(minutes(set, 21, 43) <= 3, jstTime(set));
});

test('天気コードと雲量を日本語にする', () => {
  assert.equal(weatherText(0), '快晴');
  assert.equal(weatherText(61), '雨');
  assert.equal(cloudText(10), '雲は少なめ');
  assert.equal(cloudText(90), '雲が多い見込み');
});

test('Open-Meteo の応答から今日の天気と今夜の雲量を取り出す', () => {
  const hours = Array.from({ length: 24 }, (_, h) => `2026-10-28T${String(h).padStart(2, '0')}:00`);
  const json = {
    daily: { time: ['2026-10-28', '2026-10-29'], weather_code: [2, 61], temperature_2m_max: [18.4, 15], temperature_2m_min: [7.6, 9], precipitation_probability_max: [10, 80] },
    hourly: { time: hours, cloud_cover: hours.map((_, h) => (h >= 19 && h <= 22 ? 20 : 90)) },
  };
  const w = parseOpenMeteo(json, '2026-10-28');
  assert.deepEqual(w, { date: '2026-10-28', summary: '晴れ時々くもり', tempMax: 18, tempMin: 8, precipitation: 10, nightCloud: 20 });
  assert.equal(parseOpenMeteo(json, '2026-11-01'), null);
});
