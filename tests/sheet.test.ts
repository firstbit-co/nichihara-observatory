import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventFromRecord, newsFromRecord, normalizeDate, normalizeTime, parseCsv, toRecords } from '../scripts/fetch-sheet.mjs';

test('CSV のセル内の改行と "" を読める', () => {
  const rows = parseCsv('公開,タイトル,本文\n公開する,"見出し","1行目\n2行目 ""引用"""\n');
  assert.deepEqual(rows[1], ['公開する', '見出し', '1行目\n2行目 "引用"']);
});

test('空行は除き、行番号はシートの行に合わせる', () => {
  const recs = toRecords(parseCsv('公開,タイトル\n,\n公開する,A\n'));
  assert.equal(recs.length, 1);
  assert.equal(recs[0].line, 3);
});

test('日付と時刻の書き方の違いを吸収する', () => {
  assert.equal(normalizeDate('2026/1/5'), '2026-01-05');
  assert.equal(normalizeDate('2026年12月14日'), '2026-12-14');
  assert.equal(normalizeDate('あした'), null);
  assert.equal(normalizeTime('19:00:00'), '19:00');
  assert.equal(normalizeTime('9時'), '09:00');
  assert.equal(normalizeTime(''), undefined);
  assert.equal(normalizeTime('25:00'), null);
});

const news = (over: Record<string, string>) => ({ 公開: '公開する', 日付: '2026/10/28', 種類: 'お知らせ', タイトル: 'テスト', 本文: '本文です。', 重要: '', ...over });

test('お知らせは「公開する」の行だけ載せる', () => {
  assert.equal(newsFromRecord(news({})).ok, true);
  const draft = newsFromRecord(news({ 公開: '下書き' }));
  assert.equal(draft.ok, false);
  assert.equal(draft.draft, true);
});

test('金曜の休館は「休館・営業」のお知らせだけ書ける', () => {
  assert.equal(newsFromRecord(news({ 本文: '毎週金曜日は臨時休館します。' })).ok, false);
  assert.equal(newsFromRecord(news({ 種類: '休館・営業', 本文: '毎週金曜日は臨時休館します。' })).ok, true);
});

test('予約の言葉はイベントでも止める', () => {
  const r = eventFromRecord({ 公開: '公開する', 開催日: '2026/12/14', イベント名: '観望会', ひとことで: '要予約です', 種類: '観望会' });
  assert.equal(r.ok, false);
});

test('重要・タイトルの記号を正しく書き出す', () => {
  const r = newsFromRecord(news({ タイトル: '「臨時」: 休館', 重要: '○' }));
  assert.ok(r.ok);
  assert.match(r.markdown, /title: "「臨時」: 休館"/);
  assert.match(r.markdown, /important: true/);
});
