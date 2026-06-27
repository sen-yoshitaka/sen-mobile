# GitHub Pages Setup

このフォルダの中身を、GitHubリポジトリ `sen-yoshitaka/sen-mobile` のルートへアップロードします。

## 1. GitHubへアップロード

1. `https://github.com/sen-yoshitaka/sen-mobile` を開きます。
2. `uploading an existing file` または `Add file` → `Upload files` を開きます。
3. このフォルダ `sen-mobile-pwa` の中身をアップロードします。
4. `node_modules`、`dist`、`qa` はアップロードしなくて大丈夫です。
5. Commit message は `Initial SEN Mobile app` などにして、`Commit changes` を押します。

## 2. GitHub Pagesを有効化

1. リポジトリの `Settings` を開きます。
2. 左メニューの `Pages` を開きます。
3. `Build and deployment` の `Source` を `GitHub Actions` にします。

## 3. 公開を確認

1. リポジトリの `Actions` タブを開きます。
2. `Deploy SEN Mobile to GitHub Pages` が成功するまで待ちます。
3. 成功後、次のURLで開きます。

```text
https://sen-yoshitaka.github.io/sen-mobile/
```

## 注意

- GitHub Pages上のアプリ本体は公開されます。
- スマホやPCで入力したレシピデータはブラウザ内保存なので、GitHubには送信されません。
- JSONバックアップやCSVをリポジトリへアップロードしないでください。
