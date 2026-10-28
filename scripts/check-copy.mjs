/**
 * 表記ルールの検査(npm run build のあとに npm run check:copy)。ルールは docs/07-copy-rules.md。
 *
 * 1. dist/ の全ページの本文に、使わない表現が入っていないか調べる
 * 2. トップの <main> が確定稿 docs/copy/home-main.html と同じか調べる(空白の違いは無視)
 *
 * 確定稿を意図して変えたときは、docs/copy/home-main.html も同じように直す。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { findRuleViolations } from './copy-rules.mjs';

const DIST = 'dist';
const APPROVED_HOME = 'docs/copy/home-main.html';


function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return path.endsWith('.html') ? [path] : [];
  });
}

/** 画面に出る文字だけにする(script/style とタグを除く) */
const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ');

/** 比較用に、タグ間の空白・連続空白・属性の並び以外の差を見えるようにそろえる */
const normalize = (html) =>
  html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/\s*\/>/g, '>')
    .trim();

if (!existsSync(DIST)) {
  console.error('dist/ がありません。先に npm run build を実行してください。');
  process.exit(1);
}

/** 種類が「休館・営業」のお知らせのページ(news/<id>/index.html)。臨時休館の案内なので金曜の休館も書ける */
const NEWS_DIR = 'src/content/news';
const closureNews = new Set(
  readdirSync(NEWS_DIR)
    .filter((name) => name.endsWith('.md'))
    .filter((name) => /^category:\s*["']?休館・営業["']?\s*$/m.test(readFileSync(join(NEWS_DIR, name), 'utf8')))
    .map((name) => join('news', name.replace(/\.md$/, ''), 'index.html')),
);

const problems = [];
// admin/ は担当者向けのページ(取り込み結果は、ルールに反した文をそのまま見せる)なので調べない
for (const file of htmlFiles(DIST).filter((f) => !relative(DIST, f).startsWith('admin'))) {
  const text = visibleText(readFileSync(file, 'utf8'));
  const isClosureNews = closureNews.has(relative(DIST, file));
  for (const { why, excerpt } of findRuleViolations(text, { closureNews: isClosureNews })) {
    problems.push(`${relative(DIST, file)}: ${why} … 「${excerpt}」`);
  }
}

const home = readFileSync(join(DIST, 'index.html'), 'utf8').match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
const approved = readFileSync(APPROVED_HOME, 'utf8');
if (normalize(home) !== normalize(approved)) {
  const a = normalize(home);
  const b = normalize(approved);
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  problems.push(
    `index.html: トップの <main> が確定稿(${APPROVED_HOME})と違います\n    ビルド: …${a.slice(Math.max(0, i - 40), i + 60)}…\n    確定稿: …${b.slice(Math.max(0, i - 40), i + 60)}…`,
  );
}

if (problems.length) {
  console.error(`表記ルールの検査で ${problems.length} 件見つかりました:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('表記ルールの検査: 問題なし');
