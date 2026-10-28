/**
 * 表記ルール(docs/07-copy-rules.md)。サイト全体の検査(check-copy.mjs)と、
 * スプレッドシートの取り込み(fetch-sheet.mjs)の両方で使う。
 */
export const RULES = [
  { pattern: /隣の|隣接/, why: '「隣の」は使わない' },
  { pattern: /日本初|日本で最初|すばるの試作|世界に2台/, why: '「日本初」「すばるの試作機」「世界に2台」は使わない(天文台について原稿の編集メモ)' },
  // 種類「休館・営業」のお知らせ(臨時休館の案内)だけは例外
  { pattern: /金曜[^。]{0,10}休/, why: '金曜の休館は書かない(休館は毎週火曜・水曜と元日。臨時休館はお知らせの種類を「休館・営業」にする)', allowInClosureNews: true },
  { pattern: /祝日の場合は翌/, why: '休館は毎週火曜・水曜。祝日の振替は書かない' },
  { pattern: /電話[^。]{0,12}(確認|お問い合わせください|お問い合わせを)/, why: '電話での確認はすすめない' },
  { pattern: /料金[^。]{0,10}(変わることがあります|変わる場合|変更になる)/, why: '料金は変わらない' },
  { pattern: /要予約|予約制|予約が必要|先着順|予約を受け付けて(い)?ます|ご予約ください/, why: '予約は受け付けていない' },
];

/** text が表記ルールに反していれば理由と該当箇所を返す */
export function findRuleViolations(text, { closureNews = false } = {}) {
  const found = [];
  for (const { pattern, why, allowInClosureNews } of RULES) {
    if (allowInClosureNews && closureNews) continue;
    const m = text.match(pattern);
    if (m) {
      const at = Math.max(0, m.index - 20);
      found.push({ why, excerpt: text.slice(at, m.index + m[0].length + 20).trim() });
    }
  }
  return found;
}
