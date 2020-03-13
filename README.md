# ghe-transfer

GitHubEnterprise の Server から Cloud に移行するためのツールです

## できること

- リポジトリの移行
- issue の移行(open,close)
- open している pull request の移行
- issue と pull request のコメントの移行
- hooks の移行

## 現時点でできないこと

- issue や pull request の作成者の保持(アクセストークンのユーザが作成者になります)
- issue や pull request の作成時間や更新時間の保持
- issue や pull request についているラベルやマイルストーンやリアクションの移行
- Wiki の移行

## 使い方

### アクセストークンの発行

移行元、移行先両方でアクセストークンを発行してください  
Settings > Developer settings > Personal access tokens > Generate new token  
Note:任意の名前  
Select scopes:repo と admin:repo_hook にチェック

### ツールの実行

1. リポジトリのクローン  
   `$ git clone https://github.com/fuku710/ghe-transfer.git`
   `$ cd ghe-transfer`
2. パッケージのインストール  
   `$ npm install`
3. 実行  
   `$ npm run exec`

## 環境変数

.env で環境変数を設定するとデフォルト値として設定されます

```
# 移行元のユーザのGitHubのアクセストークン
SOURCE_GH_TOKEN=<アクセストークン>
# 移行元のリポジトリのドメイン
SOURCE_DOMAIN=ghe.hoge.com
# 移行元のリポジトリの名前
SOURCE_REPO_NAME=fuga
# 移行元のリポジトリのオーナー
SOURCE_REPO_OWNER=hoge
# 移行元のリポジトリのオーナーが組織かどうか
SOURCE_IS_ORGANIZATION=true
# 移行元のリポジトリをクローンするときの種類(https,ssh)
SOURCE_CLONE_TYPE=ssh

# 移行先のユーザのGitHubのアクセストークン
TARGET_GH_TOKEN=<アクセストークン>
# 移行先のリポジトリのドメイン
TARGET_DOMAIN=github.com
# 移行先のリポジトリの名前
TARGET_REPO_NAME=fuga
# 移行先のリポジトリのオーナー
TARGET_REPO_OWNER=nifty-nexus
# 移行先のリポジトリのオーナーが組織かどうか
TARGET_IS_ORGANIZATION=true
# 移行先のリポジトリをプッシュするときの種類(https,ssh)
TARGET_CLONE_TYPE=https

USE_PROXY=true
PROXY_URL=http://proxy:80
```

## 注意事項

組織のリポジトリに移行するにはパブリックリポジトリを作成する権限が必要です

## Wiki の移行

Wiki の移行はツールからできないので手動で行ってください

1. GitHub から移行先のリポジトリの Wiki を作成
2. 移行元のリポジトリの Wiki をクローン  
   `git clone https://github.com/<オーナー>/<移行元リポジトリ>.wiki.git --bare`
3. クローンしたローカルリポジトリに移動  
   `cd <移行元リポジトリ>.wiki.git`
4. 移行先のリモートリポジトリを追加  
   `git remote add target https://github.com/<オーナー>/<移行先リポジトリ>.wiki.git`
5. 移行先のリモートリポジトリにプッシュ  
   `git push target --mirror`
   
## LICENSE
MIT

## Author
NIFTY NeXus Co., Ltd.
