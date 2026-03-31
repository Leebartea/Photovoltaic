#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEFAULT_DATA_DIR = path.resolve(process.env.BACKEND_DATA_DIR || path.join(process.cwd(), 'backend', 'data'));
const SQLITE_FILE = path.resolve(process.env.BACKEND_SQLITE_FILE || path.join(DEFAULT_DATA_DIR, 'premium_sync.sqlite'));

function asString(value) {
    return String(value || '').trim();
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function readManifest(backupDir) {
    const manifestPath = path.join(backupDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error(`Backup manifest not found at ${manifestPath}`);
    }
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function copyBack(backupDir, manifest) {
    const files = Array.isArray(manifest.copiedFiles) ? manifest.copiedFiles : [];
    if (!files.length) {
        throw new Error('Backup manifest contains no files to restore.');
    }

    if (manifest.storageDriver === 'sqlite') {
        ensureDir(path.dirname(SQLITE_FILE));
        for (const suffix of ['', '-wal', '-shm']) {
            fs.rmSync(`${SQLITE_FILE}${suffix}`, { force: true });
        }
        for (const file of files) {
            const source = path.join(backupDir, file.backupFile);
            const target = path.join(path.dirname(SQLITE_FILE), file.name);
            fs.copyFileSync(source, target);
        }
        return files.length;
    }

    ensureDir(DEFAULT_DATA_DIR);
    for (const file of files) {
        const source = path.join(backupDir, file.backupFile);
        const target = path.join(DEFAULT_DATA_DIR, file.name);
        fs.copyFileSync(source, target);
    }
    return files.length;
}

function main() {
    const backupDir = path.resolve(asString(process.argv[2]));
    if (!backupDir) {
        throw new Error('Usage: node scripts/backend_restore.js <backup-directory>');
    }
    const manifest = readManifest(backupDir);
    const restoredCount = copyBack(backupDir, manifest);
    console.log('BACKEND RESTORE OK');
    console.log(`- storage driver: ${manifest.storageDriver}`);
    console.log(`- backup directory: ${backupDir}`);
    console.log(`- restored files: ${restoredCount}`);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
