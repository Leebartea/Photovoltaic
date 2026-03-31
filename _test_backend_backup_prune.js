const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'pv-backup-prune-'));

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function makeBackup(name, createdAt) {
    const backupDir = path.join(TMP_ROOT, name);
    const filesDir = path.join(backupDir, 'files');
    fs.mkdirSync(filesDir, { recursive: true });
    fs.writeFileSync(path.join(filesDir, 'sample.txt'), `${name}\n`, 'utf8');
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify({
        createdAt,
        storageDriver: 'sqlite',
        copiedFiles: [
            {
                name: 'sample.txt',
                backupFile: 'files/sample.txt'
            }
        ]
    }, null, 2) + '\n', 'utf8');
}

function runPrune(args = []) {
    const result = spawnSync(process.execPath, ['scripts/backend_backup_prune.js', TMP_ROOT, ...args], {
        cwd: __dirname,
        encoding: 'utf8'
    });
    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || 'backend backup prune command failed');
    }
    return result.stdout;
}

function listBackupNames() {
    return fs.readdirSync(TMP_ROOT).sort();
}

try {
    makeBackup('backend-backup-2026-03-01', '2026-03-01T00:00:00.000Z');
    makeBackup('backend-backup-2026-03-10', '2026-03-10T00:00:00.000Z');
    makeBackup('backend-backup-2026-03-20', '2026-03-20T00:00:00.000Z');

    const dryRunOutput = runPrune(['--keep-count=1', '--keep-days=0', '--dry-run']);
    assert(dryRunOutput.includes('pruned backups: 2'), 'Dry run should report two backups to prune.');
    assert(listBackupNames().length === 3, 'Dry run should not delete any backups.');

    const liveOutput = runPrune(['--keep-count=1', '--keep-days=0']);
    assert(liveOutput.includes('pruned backups: 2'), 'Live prune should remove two backups.');
    const remaining = listBackupNames();
    assert(remaining.length === 1, `Expected one backup to remain after prune, found ${remaining.length}`);
    assert(remaining[0] === 'backend-backup-2026-03-20', `Expected newest backup to remain, found ${remaining[0]}`);

    console.log('BACKEND BACKUP PRUNE OK');
} finally {
    fs.rmSync(TMP_ROOT, { recursive: true, force: true });
}
