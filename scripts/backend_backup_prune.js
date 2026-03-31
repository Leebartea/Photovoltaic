#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function asString(value) {
    return String(value || '').trim();
}

function asPositiveInt(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return fallback;
    return Math.floor(numeric);
}

function parseArgs(argv) {
    const result = {
        rootDir: '',
        keepCount: 14,
        keepDays: 30,
        dryRun: false
    };
    const args = [...argv];
    while (args.length) {
        const token = args.shift();
        if (!token) continue;
        if (token === '--dry-run') {
            result.dryRun = true;
            continue;
        }
        if (token.startsWith('--keep-count=')) {
            result.keepCount = asPositiveInt(token.split('=').slice(1).join('='), result.keepCount);
            continue;
        }
        if (token === '--keep-count') {
            result.keepCount = asPositiveInt(args.shift(), result.keepCount);
            continue;
        }
        if (token.startsWith('--keep-days=')) {
            result.keepDays = asPositiveInt(token.split('=').slice(1).join('='), result.keepDays);
            continue;
        }
        if (token === '--keep-days') {
            result.keepDays = asPositiveInt(args.shift(), result.keepDays);
            continue;
        }
        if (!result.rootDir) {
            result.rootDir = path.resolve(token);
        }
    }
    return result;
}

function readBackupManifest(backupDir) {
    const manifestPath = path.join(backupDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return null;
    try {
        const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        return parsed && typeof parsed === 'object'
            ? parsed
            : null;
    } catch (error) {
        return null;
    }
}

function listBackupEntries(rootDir) {
    if (!fs.existsSync(rootDir)) return [];
    return fs.readdirSync(rootDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => {
            const absoluteDir = path.join(rootDir, entry.name);
            const manifest = readBackupManifest(absoluteDir);
            const createdAt = asString(manifest?.createdAt);
            const createdAtMs = Date.parse(createdAt);
            return {
                name: entry.name,
                absoluteDir,
                manifest,
                createdAt,
                createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0
            };
        })
        .filter(entry => entry.manifest && entry.createdAtMs > 0)
        .sort((left, right) => right.createdAtMs - left.createdAtMs);
}

function shouldPrune(entry, index, keepCount, keepDays, nowMs) {
    if (index < keepCount) return false;
    if (!keepDays) return true;
    const ageMs = Math.max(0, nowMs - entry.createdAtMs);
    return ageMs > (keepDays * 24 * 60 * 60 * 1000);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const rootDir = asString(args.rootDir) || path.join(process.cwd(), 'backups');
    const nowMs = Date.now();
    const entries = listBackupEntries(rootDir);
    const pruned = [];

    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        if (!shouldPrune(entry, index, args.keepCount, args.keepDays, nowMs)) continue;
        pruned.push(entry);
        if (!args.dryRun) {
            fs.rmSync(entry.absoluteDir, { recursive: true, force: true });
        }
    }

    console.log('BACKEND BACKUP PRUNE OK');
    console.log(`- root directory: ${rootDir}`);
    console.log(`- dry run: ${args.dryRun ? 'yes' : 'no'}`);
    console.log(`- keep count: ${args.keepCount}`);
    console.log(`- keep days: ${args.keepDays}`);
    console.log(`- discovered backups: ${entries.length}`);
    console.log(`- pruned backups: ${pruned.length}`);
    if (pruned.length) {
        for (const entry of pruned) {
            console.log(`  - ${entry.name}`);
        }
    }
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
