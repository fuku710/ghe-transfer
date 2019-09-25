# ghe-transfer
GitHubEnterpriseのServerからCloudに移行するためのツールです

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
```
# パッケージのインストール
npm install
# 実行
npm run exec
```
.envで環境変数を設定するとデフォルト値として設定されます
```
SOURCE_GH_TOKEN        # 移行元のユーザのGitHubのアクセストークン
SOURCE_DOMAIN          # 移行元のリポジトリのドメイン 例)github.com
SOURCE_REPO_NAME       # 移行元のリポジトリの名前
SOURCE_REPO_OWNER      # 移行元のリポジトリのオーナー
SOURCE_IS_ORGANIZATION # 移行元のリポジトリのオーナーが組織かどうか
SOURCE_CLONE_TYPE      # 移行元のリポジトリをクローンするときの種類(https,ssh)

TARGET_GH_TOKEN        # 移行先のユーザのGitHubのアクセストークン
TARGET_DOMAIN          # 移行先のリポジトリのドメイン 例)github.com
TARGET_REPO_NAME       # 移行先のリポジトリの名前
TARGET_REPO_OWNER      # 移行先のリポジトリのオーナー
TARGET_IS_ORGANIZATION # 移行先のリポジトリのオーナーが組織かどうか
TARGET_CLONE_TYPE      # 移行先のリポジトリをプッシュするときの種類(https,ssh)
```

## 注意事項
組織のリポジトリに移行するにはパブリックリポジトリを作成する権限が必要です

## Wikiの移行
Wikiの移行はツールからできないので手動で行ってください

1. GitHubから移行先のリポジトリのWikiを作成
2. 移行元のリポジトリのWikiをクローン   
`git clone https://github.com/<オーナー>/<移行元リポジトリ>.wiki.git --bare`
3. クローンしたローカルリポジトリに移動  
`cd <移行元リポジトリ>.wiki.git`
4. 移行先のリモートリポジトリを追加  
`git remote add target https://github.com/<オーナー>/<移行先リポジトリ>.wiki.git`
5. 移行先のリモートリポジトリにプッシュ  
`git push target --mirror`
