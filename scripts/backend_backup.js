#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_DATA_DIR = path.resolve(process.env.BACKEND_DATA_DIR || path.join(process.cwd(), 'backend', 'data'));
const STORAGE_DRIVER = String(process.env.BACKEND_STORAGE_DRIVER || 'json').trim().toLowerCase() === 'sqlite'
    ? 'sqlite'
    : 'json';
const SQLITE_FILE = path.resolve(process.env.BACKEND_SQLITE_FILE || path.join(DEFAULT_DATA_DIR, 'premium_sync.sqlite'));

const JSON_RUNTIME_FILES = [
    'licenses.json',
    'company_profiles.json',
    'team_handbacks.json',
    'team_roster.json',
    'team_seats.json',
    'audit_log.json',
    'admin_action_approvals.json',
    'admin_delivery_trail.json'
];

function asString(value) {
    return String(value || '').trim();
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIfPresent(source, target) {
    if (!fs.existsSync(source)) return false;
    ensureDir(path.dirname(target));
    fs.copyFileSync(source, target);
    return true;
}

function buildTimestampTag() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function resolveOutputDir(args) {
    const explicit = asString(args[0]);
    if (explicit) return path.resolve(explicit);
    return path.join(process.cwd(), 'backups', `backend-backup-${buildTimestampTag()}`);
}

function collectSqliteFiles(sqliteFile) {
    const files = [sqliteFile, `${sqliteFile}-wal`, `${sqliteFile}-shm`];
    return files.filter(filePath => fs.existsSync(filePath));
}

function backupJsonMode(targetDir) {
    const filesDir = path.join(targetDir, 'files');
    ensureDir(filesDir);
    const copied = [];
    for (const name of JSON_RUNTIME_FILES) {
        const source = path.join(DEFAULT_DATA_DIR, name);
        const target = path.join(filesDir, name);
        if (copyFileIfPresent(source, target)) {
            copied.push({
                name,
                source,
                target
            });
        }
    }
    return copied;
}

function backupSqliteMode(targetDir) {
    const filesDir = path.join(targetDir, 'files');
    ensureDir(filesDir);
    const copied = [];
    for (const source of collectSqliteFiles(SQLITE_FILE)) {
        const target = path.join(filesDir, path.basename(source));
        copyFileIfPresent(source, target);
        copied.push({
            name: path.basename(source),
            source,
            target
        });
    }
    return copied;
}

function main() {
    const args = process.argv.slice(2);
    const outputDir = resolveOutputDir(args);
    if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length) {
        throw new Error(`Backup output directory already exists and is not empty: ${outputDir}`);
    }

    ensureDir(outputDir);
    const copiedFiles = STORAGE_DRIVER === 'sqlite'
        ? backupSqliteMode(outputDir)
        : backupJsonMode(outputDir);

    const manifest = {
        createdAt: new Date().toISOString(),
        storageDriver: STORAGE_DRIVER,
        dataDir: DEFAULT_DATA_DIR,
        sqliteFile: SQLITE_FILE,
        copiedFiles: copiedFiles.map(item => ({
            name: item.name,
            source: item.source,
            backupFile: path.relative(outputDir, item.target)
        }))
    };

    fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    console.log('BACKEND BACKUP OK');
    console.log(`- storage driver: ${STORAGE_DRIVER}`);
    console.log(`- output directory: ${outputDir}`);
    console.log(`- copied files: ${copiedFiles.length}`);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
