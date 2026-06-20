# モタスポ沼ナビ

F1以外のモータースポーツも「今のストーリー」「最新順位メモ」「歴史」「人物・チーム」から楽しむための静的Webアプリです。

## この版の特徴

- GitHub Pages / Vercel どちらでも公開しやすい静的サイト
- データは `data/*.json` に分離
- Codexに週1更新を依頼しやすい構成
- 公式ロゴ・写真は未使用
- 順位は上位5件までのメモ表示
- 公式順位表へのリンクを入れる前提

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
