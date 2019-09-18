# ghe-transfer
ghe間でリポジトリを移行するためのツールです

## できること
- リポジトリの移行
- issueの移行(open,close)
- openしているpull requestの移行
- issueとpull requestのコメントの移行
- hooksの移行

## 現時点でできないこと
- issueやpull requestの作成者の保持(アクセストークンのユーザが作成者になります)
- issueやpull requestの作成時間や更新時間の保持
- issueやpull requestについているラベルやマイルストーンやリアクションの移行
- Wikiの移行

## 使い方
.envで以下の環境変数を設定してください
```
SOURCE_GH_TOKEN   # 移行元のユーザのGitHubのアクセストークン
SOURCE_REPO_URL   # 移行元のリポジトリのURL
SOURCE_API_URL    # 移行元のGitHubAPIのURL(ex.https://api.github.com)
SOURCE_REPO_OWNER # 移行元のリポジトリのオーナー
SOURCE_REPO_NAME  # 移行元のリポジトリの名前

TARGET_GH_TOKEN   # 移行先のユーザのGitHubのアクセストークン
TARGET_REPO_URL   # 移行先のリポジトリのURL
TARGET_API_URL    # 移行先のリポジトリのオーナー
TARGET_REPO_OWNER # 移行先のリポジトリのオーナー
TARGET_REPO_NAME  # 移行先のリポジトリの名前
```

```
# パッケージのインストール
npm install
# 実行
npm run exec
```