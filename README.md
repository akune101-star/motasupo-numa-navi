# モタスポ沼ナビ

F1からほかのモータースポーツへ入る人が、「今のストーリー」「最新順位メモ」「歴史」「人物・チーム」から観戦の入口を見つけるための静的Webアプリです。速報ではなく、順位の理由と次に見る場所を伝えるストーリーガイドです。

## この版の特徴

- v0.2では「F1から入る」「3ワード」「観戦前」「歴史の入口」「レース後の余韻」の読み物を追加
- GitHub Pages / Vercel どちらでも公開しやすい静的サイト
- データは `data/*.json` に分離
- 7カテゴリーを同じ視点で横断できる構成
- 公式ロゴ・写真は未使用
- 順位は上位5件までのメモ表示
- 各カテゴリーの公式順位表へ直接移動可能

対象カテゴリーはF1、WRC、WEC、SUPER GT、スーパーフォーミュラ、フォーミュラE、NASCARです。

## ローカルで確認する

ファイルを直接開くとブラウザの制限でJSONを読み込めない場合があります。簡易サーバーで確認してください。

```bash
python3 -m http.server 3000
```

その後、ブラウザで `http://localhost:3000` を開きます。

## データ更新

主に更新するファイルは以下です。

- `data/standings.json` : 上位順位、出典、更新日
- `data/stories.json` : 今季ストーリー、今見る理由、次に見るポイント
- `data/people.json` : 初心者が覚える人物・チーム
- `data/history.json` : 年代別ヒストリー
- `data/deepDives.json` : F1からの入口、3ワード、観戦前チェック、歴史の入口、レース後の余韻

更新後は検証を実行してください。

```bash
npm run validate
```

## GitHub Pagesで公開する

1. GitHubで新しいリポジトリを作る
2. このフォルダの中身をアップロードする
3. Settings → Pages
4. Sourceを `Deploy from a branch`
5. Branchを `main`、Folderを `/root` にする
6. 保存するとURLが発行される

## Vercelで公開する

1. GitHubにこのリポジトリを置く
2. Vercelで `New Project`
3. GitHubリポジトリをImport
4. Framework Presetは `Other`
5. Build Commandは空欄、Output Directoryも空欄でOK
6. Deploy

## 注意

このアプリは初心者向けの観戦ガイドです。順位や日程の正確な最終確認は必ず公式サイトで行ってください。

## 主な参照元

- Formula 1 / FIA / WRC公式サイト
- FIA WEC / 24 Hours of Le Mansの公式資料
- SUPER GT / SUPER FORMULA公式サイト
- Formula E / FIA公式サイト
- NASCAR公式サイト

本文は各公式情報を参照して独自に要約し、公式文章の長文転載、公式ロゴ、写真、映像は使用しません。
