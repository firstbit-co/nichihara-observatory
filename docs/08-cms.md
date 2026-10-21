# 08. 更新画面(CMS)の使い方

お知らせとイベントは、ブラウザの更新画面から追加・修正できます。
保存すると GitHub に記事が入り、**1〜2分でサイトに反映**されます(`.github/workflows/deploy.yml` が自動で公開し直す)。

- 更新画面:`https://firstbit-co.github.io/nichihara-observatory/admin/`(独自ドメインにしたら `https://<ドメイン>/admin/`)
- しくみ:[Sveltia CMS](https://sveltiacms.app/)(無料・サーバー不要)。設定は `public/admin/config.yml`
- 更新できるもの:お知らせ(`src/content/news/`)、イベント(`src/content/events/`)、記事に入れる画像(`public/images/uploads/`)

## はじめに(1人1回)

更新する人は、GitHub のアカウントと、このリポジトリへの書き込み権限が必要です。

1. 管理者が、更新する人を `firstbit-co/nichihara-observatory` の **Collaborators**(Settings → Collaborators)に **Write** で追加する
2. 更新する人が GitHub で **アクセストークン** を作る
   - GitHub 右上のアイコン → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
   - Resource owner:`firstbit-co`、Repository access:**Only select repositories** → `nichihara-observatory`
   - Permissions → Repository permissions → **Contents:Read and write**
   - 有効期限は1年以内にし、切れたら作り直す
3. 更新画面を開き、**Sign In Using Access Token** を押してトークンを貼る

トークンはパスワードと同じです。人に渡さない、メールやチャットに貼らない。漏れたら GitHub で削除して作り直す。

> 「Sign In with GitHub」ボタン(トークンなしでログイン)を使うには、GitHub の OAuth App と認証用の小さなサーバー(例:Cloudflare Workers の sveltia-cms-auth)が別に必要です。人数が増えたら検討します。

## お知らせを書く

1. 左の「お知らせ」→ **新規作成**
2. タイトル・日付・種類を入れ、本文を書く
3. 臨時休館など急ぎのものは **重要なお知らせ** をオン(トップの上の帯に出る)
4. まだ出したくないときは **下書き** をオン
5. **保存** → 1〜2分でサイトに出る

## イベントを書く

- 開催日・開始/終了時刻(「19:00」のように半角)・種類・「ひとことで」(一覧に出る短い説明)を入れる
- 料金は「通常の観望料金」「無料」など。なければ空のまま
- 開催日が過ぎると「これからのイベント」から自動で外れる(毎朝6時に公開し直すため)

## 書き方のきまり(`docs/07-copy-rules.md`)

- 休館は毎週火曜・水曜と元日。**金曜の休館は書かない**
- **予約は受け付けていない**ので、予約・定員・先着順は書かない
- **電話での確認はすすめない**
- 開館時間は変わることがあるが、**料金は変わらない**
- 「隣の」「隣接」「日本初」「すばるの試作機」「世界に2台」は使わない

きまりに反する言葉があると、公開前の検査(`npm run check:copy`)で止まり、**サイトに反映されません**。
GitHub の Actions に赤い×が付いたら、その記事の言葉を直して保存し直してください。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| ログインできない | トークンの期限・権限(Contents:Read and write)・対象リポジトリ |
| 保存したのにサイトが変わらない | GitHub → Actions の「Deploy」が緑か。赤なら書き方のきまりに反していないか |
| 画像が大きすぎる | 幅1600px・1MB くらいまでに縮めてから入れる |

## パソコンで試す(開発者向け)

Chrome / Edge で `npm run dev` を動かし、`http://localhost:4321/admin/` → **Work with Local Repository** でこのフォルダを選ぶと、GitHub を通さずに手元のファイルを直接編集できる。
