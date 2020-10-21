/*
 * データスイーパ バッチ
 * サービス稼働により生じる中間データの保存場所以外
 * キャッシュ、ログなどの指定ディレクトリ配下の全データを対象とする
 */

import childProcess from 'child_process';
import { MysqlConnection } from './common/mysql-connection';

import { dataSweeperDir } from './data-sweeper-for-directories';
import path from 'path';

// データ消去の動作周期
const PROCESSING_TIME_INTERVAL_SWEEP_FOR_DIR = 1000 * 60; // 1 minute
const RETRY_MAX = 10;

async function getCurrentDeviceData(my: MysqlConnection){
  // シリアル番号取得処理
  let serial: string;
  if(process.platform==='linux'){
    // linux
    const execResult = 0 // childProcess.execSync("lshw | grep -m1 serial | awk '{print $2}'");
    serial = execResult.toString();
  }else if(process.platform==='darwin'){
    // mac osx
    const execResult = childProcess.execSync("ioreg -l | grep IOPlatformSerialNumber");
    serial = execResult.toString();
  }else{
    // Windowsはコマンドでシリアル取得できない
    serial = '0000000000000';
  }
  serial = serial.replace(/\r?\n/g, '');
  console.log('your serial number is: '+serial);

  const network_manager_query = `SELECT * FROM ServiceBroker.devices WHERE serial_number = "${serial}" LIMIT 1`;
  const network_manager_result = await my.execute(network_manager_query);
  return network_manager_result[0];
}

function sleep(milliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), milliseconds);
  });
}

function isValidTarget(target:any, index:any, array:any) {
  return (target.path && target.sweep_minutes);
}

async function main(){

  // MySQLに接続
  //const execQuery = createQueryExecutor('mysql-config.json');
  let execQuery;
  let DB_DIRECTORY_TARGETS;
  let retry:number = 0;
  const dirTargetsQuery = "SELECT * FROM DataSweeper.sweep_directories;"

  while (retry < RETRY_MAX)
  {
    try {
      execQuery = new MysqlConnection('mysql-config.json');
      DB_DIRECTORY_TARGETS = await execQuery.execute(dirTargetsQuery);
	    if (DB_DIRECTORY_TARGETS.length > 0) {
        execQuery.close();
        break;
      }
      console.log("target directories not found.");  
    } catch (e) {
          // console.log(`${e.name}: ${e.message}`);
          console.log(e);
    }
      retry = retry +  1;
      console.log(`retry: ${retry}`);
      sleep(1000);
  }
  if (retry == RETRY_MAX) {
  	console.log("data-sweeper-bactch: retry max. process exit.");
      	process.exit(1);
  }


  // filter valid targets
  DB_DIRECTORY_TARGETS = DB_DIRECTORY_TARGETS.filter(isValidTarget);

  console.log(DB_DIRECTORY_TARGETS);
  if (DB_DIRECTORY_TARGETS.length>0) {
    dataSweeperDir(DB_DIRECTORY_TARGETS);
    setInterval(dataSweeperDir, PROCESSING_TIME_INTERVAL_SWEEP_FOR_DIR, DB_DIRECTORY_TARGETS);
  } else {
    console.log("no target found. exist")
  }
}

// 処理を開始
main();
