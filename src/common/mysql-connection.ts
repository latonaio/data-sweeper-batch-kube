import mysql from 'mysql';

export class MysqlConnection{
  connection:mysql.Connection;

  constructor(configFile: string){
    // MySQL-DBに定義された静的な設定を取得する
    const mysqlConf = require(configFile);
    console.log(mysqlConf);
    this.connection = mysql.createConnection({
      host     : mysqlConf.host,
      user     : mysqlConf.user,
      password : mysqlConf.password,
    });
  }

  async execute(query:string): Promise<any>{
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, results, fields) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  close(){
    this.connection.end()
  }
  
}
