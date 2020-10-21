
import * as fs from 'fs';
import path from 'path';

// 最終アクセス時刻が一定時間経過したものを削除
export function deleteOldAccessFile(file_path: string, deleteTime: Date){
  let deleted: {name: String, delete: boolean}[] = [];

  try{
    const fstat = fs.statSync(file_path)
    if (fstat.isDirectory()) {
      return [];
    }
    const lastAccessTime = fstat.atime
    if(deleteTime > lastAccessTime) {
      fs.unlink( file_path, (err) => { 
        if(err) console.log('delete failed: '+ file_path ); });
      deleted.push({name: file_path, delete: true}); // 削除したファイルを記録
      console.log('delete: '+ file_path);
    }
  }catch(err){
    return deleted
  }
  return deleted;
}


// ディレクトリにあるファイル一覧を取得
export function getAllFilePath(directory: string, is_sub: number): string[]{
  let files :string[] = []
  let pathes :string[] = []

  try{
    pathes = fs.readdirSync( directory );
    if (!pathes) {throw new Error()}
    for (const _path of pathes) {
      const fp = path.join(directory, _path);
      if (fs.statSync(fp).isDirectory()) {
        if (!is_sub) {continue;}
        files = files.concat(getAllFilePath(fp, is_sub));
      } else {
        files.push(fp);
      }
    }
  }catch(err) {
      console.log('DataSweeeper ERROR: directory is not exist: '+ directory);
  }
  return files
}