/**
 * にちはらん(日原天文台キャラクター案)のラフ画を生成する。
 * デザインの元:新田さん提供のキャラクター案(2026-10-21、docs/mascot/nichiharan/reference-v2.webp)。
 * ドームの帽子(右寄りの紺のスリット+太いつば)、波形の紺の襟とマントの裾、胸の金の星、紺の足、たて長の目。
 * 帽子のスリットの中には、いつも星を描く。
 *
 *   node docs/mascot/nichiharan.mjs   → docs/mascot/nichiharan/*.svg
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'nichiharan');

export const COLORS = {
  line: '#1f2b57',
  skin: '#fdf8ec',
  hat: '#fffdf6',
  hatShade: '#e8ecf5',
  panel: '#a9b1c4',
  navy: '#1f2b57',
  gold: '#e3b341',
  blush: '#fbc8b4',
  mouth: '#ec9289',
  tongue: '#ff6f7d',
  pillow: '#ffe7a3',
  cloud: '#a3adc8',
  rain: '#6aaef0',
  paper: '#ffffff',
};
const C = COLORS;

/** 線の共通属性(属性の重複は SVG として不正になるので太さは引数で渡す) */
const sw = (w = 5) => `stroke="${C.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export function star(cx, cy, r, inner = 0.45) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * inner : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')}Z`;
}
/** 4方向のきらきら */
const twinkle = (x, y, r) =>
  `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${C.gold}"/>`;

/** 腕:肩(x1,y1)から手先(x2,y2)までの丸いカプセル。手先が丸い手になる */
const limb = (x1, y1, x2, y2, w = 24) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return `<g transform="translate(${x1} ${y1}) rotate(${deg.toFixed(1)})"><rect x="${-w / 2}" y="${-w / 2}" width="${(len + w).toFixed(1)}" height="${w}" rx="${w / 2}" fill="${C.skin}" ${sw()}/></g>`;
};
const hand = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.skin}" ${sw()}/>`;

const P = {
  feet: `<g fill="${C.navy}" ${sw(4)}><ellipse cx="125" cy="302" rx="21" ry="10"/><ellipse cx="175" cy="302" rx="21" ry="10"/></g>`,
  body: `<path d="M100 226 C84 256 88 296 120 300 L180 300 C212 296 216 256 200 226Z" fill="${C.skin}" ${sw()}/>`,
  badge: `<path d="${star(150, 272, 11)}" fill="${C.gold}" stroke="${C.gold}" stroke-width="2" stroke-linejoin="round"/>`,
  /** 紺の襟。波形のふちで、左右にマントの裾がのびる */
  cape: `<path d="M98 222 Q86 236 62 246 Q84 252 102 242 Q114 252 126 244 Q138 254 150 246 Q162 254 174 244 Q186 252 198 242 Q216 252 238 246 Q214 236 202 222Z" fill="${C.navy}" ${sw(4)}/>`,
  head: `<path d="M80 138 C72 196 98 228 150 228 C202 228 228 196 220 138Z" fill="${C.skin}" ${sw()}/>`,
  /** ドームの帽子。右寄りの紺のスリットの中に、いつも星が見える */
  hat: () => `
    <path d="M60 134 C60 66 100 30 150 30 C200 30 240 66 240 134Z" fill="${C.hat}" ${sw()}/>
    <g fill="none" stroke="${C.panel}" stroke-width="3" stroke-linecap="round"><path d="M110 42 Q90 86 94 128"/><path d="M204 48 Q220 90 216 128"/></g>
    <path d="M150 31 Q170 30 186 38 Q198 84 196 132 L160 132 Q162 82 150 31Z" fill="${C.navy}" ${sw(4)}/>
    <path d="${star(174, 64, 9)}" fill="${C.gold}"/>
    <path d="${star(170, 104, 5.5)}" fill="${C.gold}"/>
    <circle cx="181" cy="46" r="1.8" fill="#fff"/><circle cx="165" cy="84" r="1.6" fill="#fff"/><circle cx="184" cy="120" r="2" fill="#fff"/><circle cx="178" cy="88" r="1.2" fill="#fff"/>
    <path d="M46 134 Q46 116 150 114 Q254 116 254 134 Q254 154 150 158 Q46 154 46 134Z" fill="${C.hat}" ${sw()}/>
    <path d="M60 142 Q150 152 240 142" fill="none" stroke="${C.panel}" stroke-width="3" stroke-linecap="round"/>`,
  blush: `<ellipse cx="100" cy="198" rx="14" ry="10" fill="${C.blush}" opacity=".9"/><ellipse cx="204" cy="198" rx="14" ry="10" fill="${C.blush}" opacity=".9"/>`,
  eyes: {
    open: [124, 180].map((x) => `<ellipse cx="${x}" cy="180" rx="8" ry="12" fill="${C.navy}"/>`).join(''),
    up: [124, 180].map((x) => `<ellipse cx="${x}" cy="176" rx="8" ry="12" fill="${C.navy}"/><circle cx="${x + 2}" cy="169" r="2.6" fill="#fff"/>`).join(''),
    happy: `<g fill="none" ${sw(5)}><path d="M112 184 Q124 170 136 184"/><path d="M168 184 Q180 170 192 184"/></g>`,
    wink: `<path d="M112 184 Q124 170 136 184" fill="none" ${sw(5)}/><ellipse cx="180" cy="180" rx="8" ry="12" fill="${C.navy}"/>`,
    sleep: `<g fill="none" ${sw(5)}><path d="M112 180 Q124 190 136 180"/><path d="M168 180 Q180 190 192 180"/></g>`,
    sad:
      [124, 180].map((x) => `<ellipse cx="${x}" cy="182" rx="7" ry="10" fill="${C.navy}"/>`).join('') +
      `<g fill="none" ${sw(4)}><path d="M110 164 L134 158"/><path d="M194 164 L170 158"/></g>`,
    sparkle: [124, 180].map((x) => `<path d="${star(x, 180, 13, 0.46)}" fill="${C.navy}" ${sw(2.5)}/>`).join(''),
  },
  mouth: {
    open: `<path d="M138 196 Q152 192 166 196 Q163 214 152 214 Q141 214 138 196Z" fill="${C.mouth}" ${sw(3.5)}/>`,
    smile: `<path d="M142 200 Q152 208 162 200" fill="none" ${sw(4)}/>`,
    cat: `<path d="M138 200 Q145 207 152 200 Q159 207 166 200" fill="none" ${sw(4)}/>`,
    small: `<path d="M147 202 Q152 206 157 202" fill="none" ${sw(4)}/>`,
    frown: `<path d="M143 207 Q152 199 161 207" fill="none" ${sw(4)}/>`,
    o: `<ellipse cx="152" cy="204" rx="6" ry="7" fill="${C.mouth}" ${sw(3.5)}/>`,
  },
  // 小物・効果
  wave: `<g fill="none" stroke="${C.line}" stroke-width="3.5" stroke-linecap="round" opacity=".55"><path d="M22 182 q-8 12 0 24"/><path d="M12 174 q-10 20 0 40"/></g>`,
  sparkles: twinkle(30, 100, 14) + twinkle(272, 120, 12) + twinkle(262, 52, 8),
  zzz: `<g fill="#7f8bb0" font-family="sans-serif" font-weight="700"><text x="244" y="72" font-size="26">Z</text><text x="264" y="48" font-size="18">z</text><text x="278" y="30" font-size="13">z</text></g>`,
  pillow: `<rect x="82" y="238" width="136" height="46" rx="22" fill="${C.pillow}" ${sw()}/><path d="${star(116, 260, 8)}" fill="${C.gold}"/><path d="${star(184, 264, 7)}" fill="${C.gold}"/><circle cx="150" cy="270" r="3" fill="${C.gold}"/>`,
  cloud: `<path d="M214 40 a17 17 0 0 1 32 -6 a15 15 0 0 1 28 11 a13 13 0 0 1 -4 26 h-54 a15 15 0 0 1 -2 -31z" fill="${C.cloud}" ${sw(4)}/><g stroke="${C.rain}" stroke-width="4.5" stroke-linecap="round"><path d="M230 82 l-4 11"/><path d="M248 82 l-4 11"/><path d="M266 82 l-4 11"/></g>`,
  sweat: `<path d="M228 160 q9 13 0 18 q-9 -5 0 -18z" fill="${C.rain}" ${sw(3)}/>`,
  letter: `<rect x="104" y="240" width="92" height="56" rx="6" fill="${C.paper}" ${sw()}/><path d="M104 245 L150 274 L196 245" fill="none" ${sw(4)}/><path d="${star(150, 280, 10)}" fill="${C.gold}" ${sw(2.5)}/>`,
  telescope: `<g transform="rotate(-24 222 172)"><rect x="196" y="158" width="78" height="28" rx="9" fill="${C.navy}" ${sw(4)}/><rect x="266" y="152" width="20" height="40" rx="7" fill="${C.navy}" ${sw(4)}/><ellipse cx="282" cy="172" rx="5" ry="14" fill="#3a4a80"/><path d="M226 158 V186" stroke="${C.gold}" stroke-width="5"/></g>`,
  /** 口ぐせのふきだし */
  bubble: `<path d="M12 4 H80 a10 10 0 0 1 10 10 V44 a10 10 0 0 1 -10 10 H56 L52 70 L40 54 H12 a10 10 0 0 1 -10 -10 V14 a10 10 0 0 1 10 -10Z" fill="#fff" ${sw(3)}/><g font-family="'Hiragino Maru Gothic ProN','Zen Maru Gothic','Noto Sans JP',sans-serif" font-size="12.5" font-weight="700" fill="${C.navy}" text-anchor="middle"><text x="46" y="25">今日は</text><text x="46" y="43">晴れるかなぁ</text></g>`,
  shadow: `<ellipse cx="150" cy="306" rx="70" ry="8" fill="${C.line}" opacity=".08"/>`,
};

const ARMS = {
  // 上げた腕は頭の後ろに描き、手先だけ顔の外に出す(付け根が頭に隠れてちびキャラらしくなる)
  waveDown: limb(196, 258, 212, 280),
  waveUp: limb(104, 256, 50, 210),
  cheer: limb(104, 254, 52, 208) + limb(196, 254, 248, 208),
  down: limb(104, 258, 90, 280) + limb(196, 258, 210, 280),
  telescope: limb(196, 254, 222, 206),
  look: limb(196, 258, 212, 280) + limb(104, 254, 66, 214),
  hold: hand(90, 262) + hand(210, 262),
};

/** layers は描画順。腕は体の上・ケープと頭の下に描くと、肩の付け根が襟で隠れて自然になる */
export const VARIANTS = [
  { name: 'wave', label: 'こんばんは!(基本)', layers: ['shadow', 'feet', 'body', 'badge', 'arms.waveDown', 'arms.waveUp', 'cape', 'head', 'hat', 'blush', 'eyes.open', 'mouth.open', 'wave'] },
  { name: 'telescope', label: '観望ガイド', layers: ['shadow', 'feet', 'body', 'badge', 'arms.down', 'cape', 'head', 'hat', 'blush', 'eyes.wink', 'mouth.open', 'telescope', 'arms.telescope'] },
  { name: 'cheer', label: '今夜は開催!', layers: ['shadow', 'feet', 'body', 'badge', 'arms.cheer', 'cape', 'head', 'hat', 'blush', 'eyes.happy', 'mouth.open', 'sparkles'] },
  { name: 'hareru', label: '今日は晴れるかなぁ', layers: ['shadow', 'feet', 'body', 'badge', 'arms.look', 'cape', 'head', 'hat', 'blush', 'eyes.up', 'mouth.o', 'bubble'] },
  { name: 'sleep', label: '休館日・おやすみ', layers: ['shadow', 'feet', 'body', 'cape', 'head', 'hat', 'blush', 'eyes.sleep', 'mouth.cat', 'pillow', 'arms.hold', 'zzz'] },
  { name: 'cancelled', label: 'くもりで中止…', layers: ['shadow', 'feet', 'body', 'badge', 'arms.down', 'cape', 'head', 'hat', 'blush', 'eyes.sad', 'mouth.frown', 'cloud', 'sweat'] },
  { name: 'wish', label: '願い星★宅配便', layers: ['shadow', 'feet', 'body', 'cape', 'head', 'hat', 'blush', 'eyes.sparkle', 'mouth.open', 'letter', 'arms.hold'] },
];

function resolve(layer) {
  if (layer === 'hat') return P.hat();
  const [group, key] = layer.split('.');
  if (group === 'arms') return ARMS[key];
  const v = key ? P[group][key] : P[group];
  return typeof v === 'function' ? v() : v;
}

export const nichiharanBody = (name) => VARIANTS.find((v) => v.name === name).layers.map(resolve).join('');

export function nichiharanSvg(v) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320" role="img"><title>にちはらん(${v.label})</title>${v.layers.map(resolve).join('')}</svg>\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(OUT, { recursive: true });
  for (const v of VARIANTS) writeFileSync(join(OUT, `${v.name}.svg`), nichiharanSvg(v));
  console.log(`wrote ${VARIANTS.length} files to ${OUT}`);
}
