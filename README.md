# SEN Mobile

SEN専用の原価率・粗利・レシピ確認用PWAです。Android Chromeで開き、ホーム画面に追加して使う想定です。

## できること

- ダッシュボードで平均原価率、平均粗利率、登録レシピ数を確認
- 販売レシピの原価率、1人前原価、粗利を確認
- 販売レシピ、仕込みレシピ、食材、明細を名前ベースで入力
- 明細追加時に仕入先で食材候補を絞り込み
- 端末内にデータ保存
- JSONバックアップ、JSON復元
- Excel v6へ取り込むためのCSV出力

## Excel v6向けCSV

出力ボタンで以下の4ファイルを出力します。

- `ingredients.csv`
- `parts.csv`
- `products.csv`
- `recipe_lines.csv`

Excel側では `SEN_ImportMobileCSV` で、この4CSVを読み込む構成にします。
Excelで作成・編集した値をスマホへ戻す場合は、Excel側の `SEN_ExportMobileCSV` で同じ4CSVを出力します。

## GitHub Pages公開

このアプリは `sen-yoshitaka/sen-mobile` のGitHub Pagesで公開する前提にしています。

公開URL:

```text
https://sen-yoshitaka.github.io/sen-mobile/
```

アップロードとPages設定の手順は `GITHUB_PAGES_SETUP.md` を見てください。

## Excelで編集したCSVをスマホへ戻す

1. Excel側の `SEN_ExportMobileCSV`、またはスマホ側のCSV出力で4CSVを作成します。
2. 4ファイル名は以下のまま保存します。
   - `ingredients.csv`
   - `parts.csv`
   - `products.csv`
   - `recipe_lines.csv`
3. SEN Mobileの「出力」画面で「Excel CSV取込」を押します。
4. 4CSVをまとめて選択すると、スマホ側のデータがCSV内容に置き換わります。

## 開発用コマンド

```powershell
pnpm install
pnpm build
pnpm dev -- --host 127.0.0.1 --port 5173
```

## Androidでの使い方

1. PCでこのアプリをローカルまたはLAN上に起動します。
2. Android ChromeでURLを開きます。
3. Chromeメニューから「ホーム画面に追加」を選びます。
4. 普段はSEN Mobileを開いて入力します。
5. Excel v6へ戻すときは「出力」からCSVを出力します。

## 注意

- データはブラウザ内に保存されます。
- スマホ紛失やブラウザデータ削除に備え、定期的にJSONバックアップを保存してください。
- Excel v6を正本にする運用なら、CSV出力後にExcel側へ取り込む日を決めてください。
