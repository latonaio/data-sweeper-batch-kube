import moment from 'moment';
import { ITargetsDir } from './interface';
import { deleteOldAccessFile, getAllFilePath } from './fs-util';

export async function dataSweeperDir(DB_TARGETS: ITargetsDir[]) {
    // 現在時刻を取得
    const now = moment();
    let deleted: {name: String, delete: boolean}[] = [];

    DB_TARGETS.map(async target => {
        // 削除時間を計算
        const deletTime = now.subtract(target.sweep_minutes, 'minutes');

        // 削除対象ファイルパスを取得
        const files = getAllFilePath(target.path, target.is_subdirectory);
        files.map(async file_path => {
            deleted = deleteOldAccessFile(file_path, deletTime.toDate());
        })
    });
}