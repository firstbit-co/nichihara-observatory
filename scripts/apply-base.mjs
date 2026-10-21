// BASE_PATH(例 /nichihara-observatory)で配信するとき、dist の HTML の
// ルート相対リンク(href="/guide/" など)に base を付ける。BASE_PATH がなければ何もしない
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
if (!base) process.exit(0);

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

const attr = /\b(href|src)="\/(?!\/)([^"]*)"/g;
let count = 0;
for await (const file of htmlFiles('dist')) {
  const html = await readFile(file, 'utf8');
  const out = html.replace(attr, (m, name, rest) => {
    if (`/${rest}`.startsWith(`${base}/`)) return m;
    count++;
    return `${name}="${base}/${rest}"`;
  });
  if (out !== html) await writeFile(file, out);
}
console.log(`base ${base}: ${count} 件のリンクを付け替え`);
