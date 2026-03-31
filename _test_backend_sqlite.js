const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const PORT = 5062;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const INSTALLATION_KEY = 'demo-engineering-plus';
const ADMIN_SEAT_ID = 'team_seat_admin_demo';
const ADMIN_CODE = 'AdaOps2026!';
const SQLITE_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'pv-backend-sqlite-'));
const SQLITE_FILE = path.join(SQLITE_ROOT, 'premium_sync.sqlite');

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

async function waitForHealth(timeoutMs = 10000, getDebugOutput = () => '') {
    const start = Date.now();
    while ((Date.now() - start) < timeoutMs) {
        try {
            const response = await requestJson(`${BASE_URL}/health`);
            if (response.status === 200) return response.body;
        } catch (error) {
            // Keep polling.
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
            BACKEND_ACTION_LINK_SECRET: 'sqlite-storage-secret',
            BACKEND_ALLOWED_ORIGINS: BASE_URL,
            BACKEND_API_KEY: 'codex-test'
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let startupOutput = '';
    child.stdout.on('data', chunk => {
        startupOutput += String(chunk);
    });
    child.stderr.on('data', chunk => {
        startupOutput += String(chunk);
    });

    return { child, getStartupOutput: () => startupOutput };
}

async function issueAdminSession() {
    const response = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            installationKey: INSTALLATION_KEY,
            actorSeatId: ADMIN_SEAT_ID,
            actorSeatCode: ADMIN_CODE,
            deviceLabel: 'SQLite Smoke Test'
        })
    });
    assert(response.status === 200, `Expected admin seat session issue to succeed, got ${response.status}`);
    assert(response.body.sessionToken, 'Expected admin seat session issue to return a session token.');
    return response.body.sessionToken;
}

async function run() {
    let current = null;
    try {
        current = startServer();
        const initialHealth = await waitForHealth(10000, current.getStartupOutput);
        assert(initialHealth.storageDriver === 'sqlite', `Expected sqlite storage driver in health response, got ${initialHealth.storageDriver}`);
        assert(String(initialHealth.sourceFile || '').endsWith('premium_sync.sqlite'), 'Health should point at the sqlite file.');
        assert(fs.existsSync(SQLITE_FILE), 'SQLite file should be created on first startup.');

        const sessionToken = await issueAdminSession();
        const publishProfile = await requestJson(`${BASE_URL}/api/company-profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                profile: {
                    label: 'SQLite Durable Profile',
                    companyName: 'SQLite Durable Profile Ltd',
                    contactName: 'Durable Admin',
                    contactEmail: 'sqlite@example.com'
                }
            })
        });
        assert(publishProfile.status === 200, `Expected company profile publish to succeed, got ${publishProfile.status}`);

        const readProfiles = await requestJson(`${BASE_URL}/api/company-profiles?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}`, {
            headers: {
                'X-Session-Token': sessionToken
            }
        });
        assert(readProfiles.status === 200, `Expected company profile read to succeed, got ${readProfiles.status}`);
        assert(Array.isArray(readProfiles.body.profiles) && readProfiles.body.profiles.some(profile => profile.label === 'SQLite Durable Profile'), 'Expected freshly published sqlite-backed profile to be readable before restart.');

        await stopServer(current.child);
        current = startServer();
        const restartedHealth = await waitForHealth(10000, current.getStartupOutput);
        assert(restartedHealth.storageDriver === 'sqlite', 'Restarted backend should still report sqlite storage.');

        const restartedSessionToken = await issueAdminSession();
        const readAfterRestart = await requestJson(`${BASE_URL}/api/company-profiles?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}`, {
            headers: {
                'X-Session-Token': restartedSessionToken
            }
        });
        assert(readAfterRestart.status === 200, `Expected company profile read after restart to succeed, got ${readAfterRestart.status}`);
        assert(Array.isArray(readAfterRestart.body.profiles) && readAfterRestart.body.profiles.some(profile => profile.label === 'SQLite Durable Profile'), 'Expected sqlite-backed profile to persist across backend restart.');

        console.log('BACKEND SQLITE OK');
    } finally {
        if (current && current.child) {
            await stopServer(current.child);
        }
        fs.rmSync(SQLITE_ROOT, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
