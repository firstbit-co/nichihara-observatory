/**
 * 担当者が書いた Google スプレッドシートのお知らせ・イベントを取り込む(使い方は docs/09-sheet.md)。
 *
 *   SHEET_ID=<スプレッドシートのID> node scripts/fetch-sheet.mjs
 *
 * - シート「お知らせ」「イベント」の行を src/content/{news,events}/sheet-*.md に書き出す(git には入れない)
 * - 「公開」が「公開する」の行だけ載せる。日付がない・表記ルールに反する行は載せない
 * - 載せた行・載せなかった行と理由を public/admin/status.html に書き出す(担当者が確認するページ)
 * - SHEET_ID がなければ何もしない。取得に失敗したら止める(古い公開サイトをそのまま残すため)
 *
 * 試すとき:SHEET_CSV_DIR=<フォルダ> を付けると、そのフォルダの お知らせ.csv / イベント.csv を読む
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRuleViolations } from './copy-rules.mjs';

export const NEWS_SHEET = 'お知らせ';
export const EVENTS_SHEET = 'イベント';
const NEWS_CATEGORIES = ['お知らせ', '休館・営業', '道路・アクセス', 'メディア'];
const EVENT_CATEGORIES = ['観望会', '天文現象', 'ワークショップ', '季節イベント', 'その他'];
const PUBLISH = '公開する';

/** RFC 4180 の CSV を行の配列にする(セル内の改行・"" に対応) */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** 1行目を見出しにして、見出し名で引けるオブジェクトの配列にする。空行は除く */
export function toRecords(rows) {
  const [header = [], ...body] = rows;
  const keys = header.map((h) => h.trim());
  return body
    .map((cells, i) => ({ line: i + 2, ...Object.fromEntries(keys.map((k, j) => [k, (cells[j] ?? '').trim()])) }))
    .filter((r) => keys.some((k) => r[k]));
}

/** 「2026/10/28」「2026-10-28」「2026年10月28日」などを YYYY-MM-DD にする */
export function normalizeDate(value) {
  const m = value.match(/(\d{4})\s*[/\-.年]\s*(\d{1,2})\s*[/\-.月]\s*(\d{1,2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  return Number.isNaN(Date.parse(date)) ? null : date;
}

/** 「19:00」「19:00:00」「19時」を HH:MM にする。空なら undefined */
export function normalizeTime(value) {
  if (!value) return undefined;
  const m = value.match(/^(\d{1,2})\s*[:時]\s*(\d{2})?/);
  if (!m || Number(m[1]) > 23) return null;
  return `${m[1].padStart(2, '0')}:${m[2] ?? '00'}`;
}

/** 本文の改行を Markdown の段落・改行にする */
const toMarkdown = (body) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.split('\n').map((l) => l.trim()).join('  \n'))
    .join('\n\n');

/** タイトルが変わらないかぎり同じ URL になるようにする */
const slugFor = (date, title) => `sheet-${date}-${createHash('sha1').update(title).digest('hex').slice(0, 6)}`;

/** frontmatter の値(JSON の文字列は YAML としても正しい) */
const yaml = (fields) =>
  Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`)
    .join('\n');

/** お知らせの1行 → { ok, slug, markdown } または { ok: false, reason } */
export function newsFromRecord(r) {
  const title = r['タイトル'];
  if (r['公開'] !== PUBLISH) return { ok: false, draft: true, title, reason: '「公開」が「公開する」ではないので載せていません' };
  if (!title) return { ok: false, title, reason: 'タイトルが空です' };
  const date = normalizeDate(r['日付'] ?? '');
  if (!date) return { ok: false, title, reason: '日付が読めません(例:2026/10/28)' };
  const category = NEWS_CATEGORIES.includes(r['種類']) ? r['種類'] : 'お知らせ';
  const body = r['本文'] ?? '';
  const violations = findRuleViolations(`${title}\n${body}`, { closureNews: category === '休館・営業' });
  if (violations.length) return { ok: false, title, reason: violations.map((v) => `${v.why}(「${v.excerpt}」)`).join(' / ') };
  const important = /^(○|◯|はい|true|重要)$/i.test(r['重要'] ?? '');
  return {
    ok: true,
    title,
    slug: slugFor(date, title),
    markdown: `---\n${yaml({ title, date, category, important })}\n---\n\n${toMarkdown(body)}\n`,
  };
}

/** イベントの1行 → { ok, slug, markdown } または { ok: false, reason } */
export function eventFromRecord(r) {
  const title = r['イベント名'];
  if (r['公開'] !== PUBLISH) return { ok: false, draft: true, title, reason: '「公開」が「公開する」ではないので載せていません' };
  if (!title) return { ok: false, title, reason: 'イベント名が空です' };
  const date = normalizeDate(r['開催日'] ?? '');
  if (!date) return { ok: false, title, reason: '開催日が読めません(例:2026/12/14)' };
  const startTime = normalizeTime(r['開始'] ?? '');
  const endTime = normalizeTime(r['終了'] ?? '');
  if (startTime === null || endTime === null) return { ok: false, title, reason: '時刻が読めません(例:19:00)' };
  const summary = r['ひとことで'];
  if (!summary) return { ok: false, title, reason: '「ひとことで」が空です(一覧に出る短い説明)' };
  const category = EVENT_CATEGORIES.includes(r['種類']) ? r['種類'] : 'その他';
  const fee = r['料金'];
  const body = r['本文'] ?? '';
  const violations = findRuleViolations(`${title}\n${summary}\n${fee ?? ''}\n${body}`);
  if (violations.length) return { ok: false, title, reason: violations.map((v) => `${v.why}(「${v.excerpt}」)`).join(' / ') };
  return {
    ok: true,
    title,
    slug: slugFor(date, title),
    markdown: `---\n${yaml({ title, date, startTime, endTime, category, summary, fee })}\n---\n\n${toMarkdown(body)}\n`,
  };
}

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** 担当者が見る確認ページ */
function statusPage(sections) {
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const rows = (items) =>
    items
      .map(
        (i) =>
          `<tr class="${i.ok ? 'ok' : i.draft ? 'draft' : 'ng'}"><td>${i.line}行目</td><td>${esc(i.title || '(無題)')}</td><td>${
            i.ok ? '載せました' : i.draft ? '下書き' : '載せていません'
          }</td><td>${i.ok ? '' : esc(i.reason)}</td></tr>`,
      )
      .join('');
  const body = sections
    .map(
      ({ name, items }) =>
        `<h2>${esc(name)}</h2>${
          items.length ? `<table><tr><th>行</th><th>タイトル</th><th>結果</th><th>理由</th></tr>${rows(items)}</table>` : '<p>行がありません。</p>'
        }`,
    )
    .join('');
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>取り込みの結果|日原天文台</title>
<style>body{font-family:sans-serif;margin:16px;max-width:960px;color:#1b2340;background:#fff}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd;padding:6px 8px;text-align:left;vertical-align:top}tr.ng td{background:#fde8e8}tr.draft td{color:#667}</style>
</head><body><h1>スプレッドシートの取り込み結果</h1><p>最終確認:${esc(now)}(約30分ごとに更新)</p>
<p>「載せていません」の行は、理由を直すと次の更新でサイトに出ます。</p>${body}</body></html>
`;
}

async function loadCsv(sheetId, name) {
  if (process.env.SHEET_CSV_DIR) return readFileSync(join(process.env.SHEET_CSV_DIR, `${name}.csv`), 'utf8');
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok || text.trimStart().startsWith('<')) {
    throw new Error(`シート「${name}」を読めませんでした(${res.status})。共有が「リンクを知っている全員:閲覧者」になっているか確認してください`);
  }
  return text;
}

function writeAll(dir, results) {
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) if (f.startsWith('sheet-')) rmSync(join(dir, f));
  const used = new Set();
  for (const r of results.filter((x) => x.ok)) {
    let slug = r.slug;
    for (let n = 2; used.has(slug); n++) slug = `${r.slug}-${n}`;
    used.add(slug);
    writeFileSync(join(dir, `${slug}.md`), r.markdown);
  }
}

async function main() {
  const sheetId = process.env.SHEET_ID;
  if (!sheetId && !process.env.SHEET_CSV_DIR) {
    console.log('SHEET_ID がないので、スプレッドシートの取り込みはしません');
    return;
  }
  const news = toRecords(parseCsv(await loadCsv(sheetId, NEWS_SHEET))).map((r) => ({ line: r.line, ...newsFromRecord(r) }));
  const events = toRecords(parseCsv(await loadCsv(sheetId, EVENTS_SHEET))).map((r) => ({ line: r.line, ...eventFromRecord(r) }));
  writeAll('src/content/news', news);
  writeAll('src/content/events', events);
  mkdirSync('public/admin', { recursive: true });
  writeFileSync('public/admin/status.html', statusPage([{ name: NEWS_SHEET, items: news }, { name: EVENTS_SHEET, items: events }]));
  const count = (xs) => `${xs.filter((x) => x.ok).length}件載せる / ${xs.filter((x) => !x.ok && !x.draft).length}件エラー`;
  console.log(`お知らせ ${count(news)}、イベント ${count(events)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
