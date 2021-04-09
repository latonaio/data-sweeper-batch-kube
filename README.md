# data-sweeper-batch-kube
data-sweeper-batch-kubeは、kubernetes上で動作するdata-sweeperです。キャッシュやログなど、指定ディレクトリ配下の、一定の保存期間を過ぎたデータを削除対象とします。
# 概要
data-sweeper-batch-kubeは、MySQLに格納された、削除対象のディレクトリの情報を取得し、保存期間を過ぎたディレクトリ配下のキャッシュ・ログ等のデータを全て削除します。

# 動作環境
data-sweeper-batch-kubeは、kubernetes上での動作を前提としています。以下の環境が必要となります。
- kubernetes
- MySQL
# 起動準備
上記の環境下で、以下のコマンドを入力し、MySQLの初期設定を行ってください。
```
$ cd /path/to/data-sweeper-batch-kube/sql
$ mysql < DataSweeper_sweep_directories.sql
```
# 起動方法
上記の環境下で、以下のコマンドを入力してDeploymentを作成してください。
```
$ cd /path/to/data-sweeper-batch-kube
$ kubectl apply -f ./k8s/data-sweeper-batch-deployment.yaml
```
Deployment作成後、以下のコマンドでPodが正しく生成されていることを確認してください。
```
$ kubectl get pods
```
また、docker imageのbuild方法は以下の通りです。
```
$ cd /path/to/data-sweeper-batch-kube
$ make
```

# 各種設定の変更

k8s/data-sweeper-batch-deployment.yamlのパラメータを変更することで、Inputを指定するyamlファイルの配置場所や、削除対象のディレクトリを変更することができます。

| VolumeMounts/Volume | name         | デフォルト値                           | 備考                                   | 
| :-----------------: | :----------: | :------------------------------------: | :------------------------------------- | 
| VolumeMounts        | delete-path  | /data/chromium                         | 削除対象のディレクトリ<br>(コンテナ上) | 
| VolumeMounts        | delete-path2 | /data/Downloads/                       | 削除対象のディレクトリ<br>(コンテナ上) | 
| Volume              | delete-path  | HOME_PATH_XXX/.cache/chromium/Default/ | 削除対象のディレクトリ                 | 
| Volume              | delete-path2 | HOME_PATH_XXX/Downloads/               | 削除対象のディレクトリ                 | 

また、データ削除の動作周期(interval)は60秒に設定されています。

## MySQL設定
MySQLの設定は、mysql-config.jsonに記述してください。

| 項目     | デフォルト値       | 
| :------: | :----------------: | 
| host     | mysql              | 
| user     | MYSQL_USER_XXX     | 
| password | MYSQL_PASSWORD_XXX | 

# Input/Output
## Input
削除対象となるファイルの設定は、MySQLデータベース上の以下のテーブルに記載されます。  

| Database    | Table             | 
| :---------: | :---------------: | 
| DataSweeper | sweep_directories |   



また、sweep_directoriesテーブルに含まれるカラムは以下の通りです。  

| カラム名        | 型情報                    | 
| :-------------: | :-----------------------: | 
| path            | varchar(100) NOT NULL     | 
| sweep_minutes   | int(10) unsigned NOT NULL | 
| is_subdirectory | tinyint(1) DEFAULT NULL   | 

## Output
指定したディレクトリ配下のファイルが削除されます。
