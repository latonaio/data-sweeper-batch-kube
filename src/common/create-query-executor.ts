import mysql from 'mysql';

export function createQueryExecutor(configFile: string): Function{
  // MySQL-DBに定義された静的な設定を取得する
  const mysqlConf = require(configFile);
  const connection = mysql.createConnection({
    host     : mysqlConf.host,
    user     : mysqlConf.user,
    password : mysqlConf.password,
  });

  // 非同期処理を作成する
  return function(query:string): Promise<any>{
    return new Promise((resolve, reject) => {
      connection.query(query, (err, results, fields) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }
}