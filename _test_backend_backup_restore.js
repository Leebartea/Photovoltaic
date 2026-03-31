const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');

const PORT = 5063;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const INSTALLATION_KEY = 'demo-engineering-plus';
const ADMIN_SEAT_ID = 'team_seat_admin_demo';
const ADMIN_CODE = 'AdaOps2026!';
const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'pv-backup-restore-'));
const DATA_ROOT = path.join(TMP_ROOT, 'runtime');
const SQLITE_FILE = path.join(DATA_ROOT, 'premium_sync.sqlite');
const BACKUP_DIR = path.join(TMP_ROOT, 'backup');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
    const target = new URL(url);
    const method = options.method || 'GET';
    const headers = { ...(options.headers || {}) };
    const rawBody = typeof options.body === 'string' ? options.body : '';
    if (rawBody && !headers['Content-Length']) {
        headers['Content-Length'] = Buffer.byteLength(rawBody);
    }

    return new Promise((resolve, reject) => {
        const req = http.request({
            protocol: target.protocol,
            hostname: target.hostname,
            port: target.port,
            path: `${target.pathname}${target.search}`,
            method,
            headers
        }, res => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8');
                let body = {};
                try {
                    body = text ? JSON.parse(text) : {};
                } catch (error) {
                    body = { raw: text };
                }
                resolve({ status: res.statusCode || 0, body });
            });
        });
        req.on('error', reject);
        if (rawBody) req.write(rawBody);
        req.end();
    });
}

async function waitForHealth(timeoutMs, getDebugOutput) {
    const start = Date.now();
    while ((Date.now() - start) < timeoutMs) {
        try {
            const response = await requestJson(`${BASE_URL}/health`);
            if (response.status === 200) return response.body;
        } catch (error) {
            // keep polling
        }
        await sleep(200);
    }
    throw new Error(`Backend did not become healthy in time. Startup output: ${getDebugOutput() || 'none'}`);
}

async function stopServer(child) {
    if (!child || child.killed) return;
    child.kill('SIGINT');
    await new Promise(resolve => {
        const timer = setTimeout(() => {
            if (!child.killed) child.kill('SIGKILL');
            resolve();
        }, 2000);
        child.once('exit', () => {
            clearTimeout(timer);
            resolve();
        });
    });
}

function startServer() {
    const child = spawn(process.execPath, ['--experimental-sqlite', 'backend/server.js'], {
        cwd: __dirname,
        env: {
            ...process.env,
            PORT: String(PORT),
            BACKEND_STORAGE_DRIVER: 'sqlite',
            BACKEND_SQLITE_FILE: SQLITE_FILE,
            BACKEND_DATA_DIR: DATA_ROOT,
            BACKEND_API_KEY: 'codex-test',
            BACKEND_ACTION_LINK_SECRET: 'backup-restore-secret',
            BACKEND_ALLOWED_ORIGINS: BASE_URL
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.on('data', chunk => {
        output += String(chunk);
    });
    child.stderr.on('data', chunk => {
        output += String(chunk);
    });
    return { child, getOutput: () => output };
}

async function issueSession() {
    const response = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            installationKey: INSTALLATION_KEY,
            actorSeatId: ADMIN_SEAT_ID,
            actorSeatCode: ADMIN_CODE,
            deviceLabel: 'Backup Restore Test'
        })
    });
    assert(response.status === 200, `Expected seat session issue to succeed, got ${response.status}`);
    return response.body.sessionToken;
}

async function publishProfile(sessionToken, label) {
    const response = await requestJson(`${BASE_URL}/api/company-profiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken
        },
        body: JSON.stringify({
            installationKey: INSTALLATION_KEY,
            actorSeatId: ADMIN_SEAT_ID,
            profile: {
                label,
                companyName: `${label} Ltd`,
                contactName: 'Restore Admin',
                contactEmail: `${label.toLowerCase().replace(/\s+/g, '.')}@example.com`
            }
        })
    });
    assert(response.status === 200, `Expected profile publish to succeed, got ${response.status}`);
}

async function listProfiles(sessionToken) {
    const response = await requestJson(`${BASE_URL}/api/company-profiles?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}`, {
        headers: {
            'X-Session-Token': sessionToken
        }
    });
    assert(response.status === 200, `Expected profile read to succeed, got ${response.status}`);
    return Array.isArray(response.body.profiles) ? response.body.profiles : [];
}

function runCommand(command, args, env = {}) {
    const result = spawnSync(command, args, {
        cwd: __dirname,
        env: {
            ...process.env,
            ...env
        },
        encoding: 'utf8'
    });
    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || `${command} ${args.join(' ')} failed`);
    }
}

async function run() {
    let server = null;
    try {
        server = startServer();
        await waitForHealth(10000, server.getOutput);
        let sessionToken = await issueSession();

        await publishProfile(sessionToken, 'Profile Before Backup');
        const beforeBackup = await listProfiles(sessionToken);
        assert(beforeBackup.some(profile => profile.label === 'Profile Before Backup'), 'Expected baseline profile before backup.');

        await stopServer(server.child);
        runCommand(process.execPath, ['scripts/backend_backup.js', BACKUP_DIR], {
            BACKEND_STORAGE_DRIVER: 'sqlite',
            BACKEND_SQLITE_FILE: SQLITE_FILE,
            BACKEND_DATA_DIR: DATA_ROOT
        });

        server = startServer();
        await waitForHealth(10000, server.getOutput);
        sessionToken = await issueSession();
        await publishProfile(sessionToken, 'Profile After Backup');
        const mutatedProfiles = await listProfiles(sessionToken);
        assert(mutatedProfiles.some(profile => profile.label === 'Profile After Backup'), 'Expected mutated profile before restore.');

        await stopServer(server.child);
        runCommand(process.execPath, ['scripts/backend_restore.js', BACKUP_DIR], {
            BACKEND_STORAGE_DRIVER: 'sqlite',
            BACKEND_SQLITE_FILE: SQLITE_FILE,
            BACKEND_DATA_DIR: DATA_ROOT
        });

        server = startServer();
        await waitForHealth(10000, server.getOutput);
        sessionToken = await issueSession();
        const restoredProfiles = await listProfiles(sessionToken);
        assert(restoredProfiles.some(profile => profile.label === 'Profile Before Backup'), 'Expected baseline profile after restore.');
        assert(!restoredProfiles.some(profile => profile.label === 'Profile After Backup'), 'Expected post-backup mutation to be removed by restore.');

        console.log('BACKEND BACKUP/RESTORE OK');
    } finally {
        if (server && server.child) {
            await stopServer(server.child);
        }
        fs.rmSync(TMP_ROOT, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
