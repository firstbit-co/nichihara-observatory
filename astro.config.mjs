// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 本番ドメイン確定後に SITE_URL を設定する(src/data/facility.ts の SITE.url も合わせる)
const site = process.env.SITE_URL || 'https://example.com';
// 独自ドメインなしの GitHub Pages(https://<org>.github.io/<repo>/)ではサブパスで配信する。
// ページ内のリンクは scripts/apply-base.mjs がビルド後に付け替える
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
});
