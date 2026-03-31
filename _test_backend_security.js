const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const PORT = 5061;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const API_KEY = 'codex-test';
const INSTALLATION_KEY = 'demo-engineering-plus';
const ADMIN_SEAT_ID = 'team_seat_admin_demo';
const ENGINEERING_SEAT_ID = 'team_seat_eng_demo';
const SALES_SEAT_ID = 'team_seat_sales_demo';
const ADMIN_CODE = 'AdaOps2026!';
const ROTATED_ADMIN_CODE = 'AdaOps2027!';
const ENGINEERING_CODE = 'ChineduStudy2026!';
const ROTATED_ENGINEERING_CODE = 'ChineduStudy2027!';
const RECOVERY_ENGINEERING_CODE = 'ChineduRecovered2028!';
const INVITED_SALES_CODE = 'TundeInvite2028!';
const TEAM_SEATS_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'team_seats.json');
const AUDIT_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'audit_log.json');
const APPROVAL_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'admin_action_approvals.json');
const DELIVERY_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'admin_delivery_trail.json');

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
            if (response.status === 200) return;
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

function cleanupRuntimeFiles() {
    fs.rmSync(TEAM_SEATS_RUNTIME_FILE, { force: true });
    fs.rmSync(AUDIT_RUNTIME_FILE, { force: true });
    fs.rmSync(APPROVAL_RUNTIME_FILE, { force: true });
    fs.rmSync(DELIVERY_RUNTIME_FILE, { force: true });
}

async function requestAndApproveHighRiskAction(sessionToken, targetSeatId, recoveryAction, note) {
    const requestApproval = await requestJson(`${BASE_URL}/api/admin/action-approvals/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken
        },
        body: JSON.stringify({
            installationKey: INSTALLATION_KEY,
            actionType: 'team_seat_recovery',
            recoveryAction,
            targetSeatId,
            note
        })
    });
    assert(requestApproval.status === 200, `Expected approval request for ${recoveryAction} to succeed, got ${requestApproval.status}`);
    assert(requestApproval.body.approval && requestApproval.body.approval.id, `Approval request for ${recoveryAction} should return an approval record`);

    const reviewApproval = await requestJson(`${BASE_URL}/api/admin/action-approvals/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken
        },
        body: JSON.stringify({
            installationKey: INSTALLATION_KEY,
            approvalId: requestApproval.body.approval.id,
            decision: 'approve',
            note: `Approved ${recoveryAction} for security test coverage.`
        })
    });
    assert(reviewApproval.status === 200, `Expected approval review for ${recoveryAction} to succeed, got ${reviewApproval.status}`);
    assert(reviewApproval.body.approval && reviewApproval.body.approval.status === 'approved', `Approval review for ${recoveryAction} should move the request to approved status`);
}

async function run() {
    cleanupRuntimeFiles();
    const child = spawn(process.execPath, ['backend/server.js'], {
        cwd: __dirname,
        env: {
            ...process.env,
            BACKEND_API_KEY: API_KEY,
            PORT: String(PORT),
            MAX_SEAT_SIGNIN_ATTEMPTS: '2',
            SEAT_SIGNIN_WINDOW_MS: '60000',
            SEAT_SIGNIN_LOCKOUT_MS: '30000'
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

    try {
        await waitForHealth(10000, () => startupOutput);

        const issueOne = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                actorSeatCode: ADMIN_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(issueOne.status === 200, `Expected first seat sign-in issue to succeed, got ${issueOne.status}`);
        assert(issueOne.body.authMode === 'seat_code', 'First issue should use seat_code auth mode');
        const firstToken = issueOne.body.sessionToken;
        assert(firstToken, 'First issue should return a session token');

        const renewOne = await requestJson(`${BASE_URL}/api/seat-session/renew`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': firstToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(renewOne.status === 200, `Expected renew to succeed, got ${renewOne.status}`);
        assert(renewOne.body.authMode === 'session_renew', 'Renew should report session_renew auth mode');
        const renewedToken = renewOne.body.sessionToken;
        assert(renewedToken && renewedToken !== firstToken, 'Renew should rotate the session token');

        const oldTokenAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}&limit=2`, {
            headers: { 'X-Session-Token': firstToken }
        });
        assert(oldTokenAudit.status === 401, `Old token should fail after renew, got ${oldTokenAudit.status}`);

        const renewedTokenAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}&limit=5`, {
            headers: { 'X-Session-Token': renewedToken }
        });
        assert(renewedTokenAudit.status === 200, `Renewed token should reach protected audit route, got ${renewedTokenAudit.status}`);
        assert(Array.isArray(renewedTokenAudit.body.entries) && renewedTokenAudit.body.entries.some(entry => entry.action === 'renew'), 'Audit should record the renew event');

        const badSignInOne = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: 'wrong-one',
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(badSignInOne.status === 401, `First bad sign-in should be 401, got ${badSignInOne.status}`);
        assert(String(badSignInOne.body.error || '').includes('1 attempt left'), 'First bad sign-in should report one attempt left');

        const badSignInTwo = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: 'wrong-two',
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(badSignInTwo.status === 429, `Second bad sign-in should trigger lockout, got ${badSignInTwo.status}`);

        const lockedCorrectCode = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(lockedCorrectCode.status === 429, `Correct code should still be locked during cooldown, got ${lockedCorrectCode.status}`);

        const bootstrapRecovery = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(bootstrapRecovery.status === 200, `API bootstrap recovery should still work during lockout, got ${bootstrapRecovery.status}`);
        assert(bootstrapRecovery.body.authMode === 'api_key', 'Bootstrap recovery should use api_key auth mode');

        const clearLockout = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'clear_signin_lockout',
                note: 'Cleared after verifying desk identity.'
            })
        });
        assert(clearLockout.status === 200, `Clearing seat lockout should succeed, got ${clearLockout.status}`);
        assert(clearLockout.body.clearedLockoutCount >= 1, 'Clearing seat lockout should report at least one cleared throttle path');

        const engineeringIssue = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(engineeringIssue.status === 200, `Engineering seat should sign in after lockout clear, got ${engineeringIssue.status}`);
        const engineeringToken = engineeringIssue.body.sessionToken;
        assert(engineeringToken, 'Engineering sign-in should return a session token after lockout clear');

        const revokeEngineeringSessions = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'revoke_active_sessions',
                note: 'Desk handover in progress.'
            })
        });
        assert(revokeEngineeringSessions.status === 200, `Revoking target seat sessions should succeed, got ${revokeEngineeringSessions.status}`);
        assert(revokeEngineeringSessions.body.revokedSessionCount >= 1, 'Revoking target seat sessions should report at least one revoked session');

        const revokedEngineeringAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ENGINEERING_SEAT_ID)}&limit=2`, {
            headers: { 'X-Session-Token': engineeringToken }
        });
        assert(revokedEngineeringAudit.status === 401, `Engineering token should fail after forced revoke, got ${revokedEngineeringAudit.status}`);

        const rotateWithoutApproval = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'rotate_access_code',
                nextAccessCode: ROTATED_ENGINEERING_CODE,
                nextAccessCodeHint: 'Updated study phrase',
                note: 'Engineering seat code rotation after device replacement.'
            })
        });
        assert(rotateWithoutApproval.status === 409, `High-risk recovery should require approval first, got ${rotateWithoutApproval.status}`);
        assert(rotateWithoutApproval.body.approvalRequired === true, 'High-risk recovery should advertise approvalRequired when blocked');

        await requestAndApproveHighRiskAction(renewedToken, ENGINEERING_SEAT_ID, 'rotate_access_code', 'Engineering seat code rotation after device replacement.');

        const rotateEngineeringSeat = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'rotate_access_code',
                nextAccessCode: ROTATED_ENGINEERING_CODE,
                nextAccessCodeHint: 'Updated study phrase',
                note: 'Engineering seat code rotation after device replacement.'
            })
        });
        assert(rotateEngineeringSeat.status === 200, `Engineering seat recovery rotation should succeed, got ${rotateEngineeringSeat.status}`);
        assert(rotateEngineeringSeat.body.seat && rotateEngineeringSeat.body.seat.authEnabled === true, 'Rotated engineering seat should still advertise authEnabled');
        assert(rotateEngineeringSeat.body.approval && rotateEngineeringSeat.body.approval.status === 'consumed', 'Approved high-risk recovery should consume the queued approval');

        const engineeringOldCode = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(engineeringOldCode.status === 401, `Old engineering code should fail after recovery rotation, got ${engineeringOldCode.status}`);

        const engineeringRotatedIssue = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ROTATED_ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(engineeringRotatedIssue.status === 200, `Rotated engineering code should sign in, got ${engineeringRotatedIssue.status}`);
        const engineeringRotatedToken = engineeringRotatedIssue.body.sessionToken;
        assert(engineeringRotatedToken, 'Rotated engineering sign-in should return a fresh session token');

        const suspendWithoutApproval = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'suspend_seat',
                note: 'Temporarily disabled while desk ownership is being verified.'
            })
        });
        assert(suspendWithoutApproval.status === 409, `Suspending a seat should require approval first, got ${suspendWithoutApproval.status}`);

        await requestAndApproveHighRiskAction(renewedToken, ENGINEERING_SEAT_ID, 'suspend_seat', 'Temporarily disabled while desk ownership is being verified.');

        const suspendEngineeringSeat = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'suspend_seat',
                note: 'Temporarily disabled while desk ownership is being verified.'
            })
        });
        assert(suspendEngineeringSeat.status === 200, `Suspending engineering seat should succeed, got ${suspendEngineeringSeat.status}`);
        assert(suspendEngineeringSeat.body.seat && suspendEngineeringSeat.body.seat.stateKey === 'suspended', 'Engineering seat should be suspended after recovery action');

        const suspendedEngineeringAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ENGINEERING_SEAT_ID)}&limit=2`, {
            headers: { 'X-Session-Token': engineeringRotatedToken }
        });
        assert(suspendedEngineeringAudit.status === 401, `Engineering token should fail after suspension, got ${suspendedEngineeringAudit.status}`);

        const suspendedEngineeringIssue = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ROTATED_ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(suspendedEngineeringIssue.status === 403, `Suspended engineering seat should not issue a session, got ${suspendedEngineeringIssue.status}`);

        const restoreEngineeringSeat = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                recoveryAction: 'restore_active',
                note: 'Seat restored after recovery review.'
            })
        });
        assert(restoreEngineeringSeat.status === 200, `Restoring engineering seat should succeed, got ${restoreEngineeringSeat.status}`);
        assert(restoreEngineeringSeat.body.seat && restoreEngineeringSeat.body.seat.stateKey === 'active', 'Engineering seat should return to active posture');

        const engineeringRestoredIssue = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ROTATED_ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(engineeringRestoredIssue.status === 200, `Restored engineering seat should sign in again, got ${engineeringRestoredIssue.status}`);

        const rotateAdminWithoutApproval = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ADMIN_SEAT_ID,
                recoveryAction: 'rotate_access_code',
                nextAccessCode: ROTATED_ADMIN_CODE,
                nextAccessCodeHint: 'Ops desk phrase v2',
                note: 'Admin access code rotated after security review.'
            })
        });
        assert(rotateAdminWithoutApproval.status === 409, `Admin code rotation should require approval first, got ${rotateAdminWithoutApproval.status}`);

        await requestAndApproveHighRiskAction(renewedToken, ADMIN_SEAT_ID, 'rotate_access_code', 'Admin access code rotated after security review.');

        const rotateAdminSeat = await requestJson(`${BASE_URL}/api/team-seats/recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': renewedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ADMIN_SEAT_ID,
                recoveryAction: 'rotate_access_code',
                nextAccessCode: ROTATED_ADMIN_CODE,
                nextAccessCodeHint: 'Ops desk phrase v2',
                note: 'Admin access code rotated after security review.'
            })
        });
        assert(rotateAdminSeat.status === 200, `Admin recovery rotation should succeed, got ${rotateAdminSeat.status}`);
        assert(rotateAdminSeat.body.revokedSessionCount >= 1, 'Admin recovery rotation should revoke the active admin session');

        const invalidatedAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}&limit=2`, {
            headers: { 'X-Session-Token': renewedToken }
        });
        assert(invalidatedAudit.status === 401, `Admin session should be invalidated after recovery rotation, got ${invalidatedAudit.status}`);

        const issueRotated = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                actorSeatCode: ROTATED_ADMIN_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(issueRotated.status === 200, `Admin seat sign-in should succeed with rotated code, got ${issueRotated.status}`);
        const rotatedToken = issueRotated.body.sessionToken;
        assert(rotatedToken, 'Admin rotated sign-in should return a fresh session token');

        const issueRecoveryCode = await requestJson(`${BASE_URL}/api/team-seats/recovery-code/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: ENGINEERING_SEAT_ID,
                note: 'Admin-issued one-time reset after engineering desk recovery.'
            })
        });
        assert(issueRecoveryCode.status === 200, `Issuing a one-time recovery code should succeed, got ${issueRecoveryCode.status}`);
        assert(issueRecoveryCode.body.recoveryCode, 'Issuing a recovery code should return the one-time code');
        assert(issueRecoveryCode.body.recoveryLinkToken, 'Issuing a recovery code should also return a signed recovery-link token');
        assert(issueRecoveryCode.body.deliveryRefId, 'Issuing a recovery code should return a delivery reference id');

        const prepareRecoveryDispatch = await requestJson(`${BASE_URL}/api/admin/delivery-dispatch/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_recovery',
                targetSeatId: ENGINEERING_SEAT_ID,
                deliveryRefId: issueRecoveryCode.body.deliveryRefId,
                deliveryChannel: 'secure_chat',
                recipient: 'engineering desk operator',
                artifactMode: 'code_plus_link',
                note: 'Recovery link handed over in the secure engineering channel.',
                oneTimeCode: issueRecoveryCode.body.recoveryCode,
                signedLinkToken: issueRecoveryCode.body.recoveryLinkToken,
                frontendAppUrl: 'https://example.com/pv_calculator_ui.html'
            })
        });
        assert(prepareRecoveryDispatch.status === 200, `Preparing a recovery dispatch pack should succeed, got ${prepareRecoveryDispatch.status}`);
        assert(prepareRecoveryDispatch.body.dispatch && prepareRecoveryDispatch.body.dispatch.body.includes(issueRecoveryCode.body.recoveryCode), 'Recovery dispatch pack should include the active one-time code when requested');

        const tamperedRecoveryDispatch = await requestJson(`${BASE_URL}/api/admin/delivery-dispatch/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_recovery',
                targetSeatId: ENGINEERING_SEAT_ID,
                deliveryRefId: issueRecoveryCode.body.deliveryRefId,
                deliveryChannel: 'secure_chat',
                recipient: 'engineering desk operator',
                artifactMode: 'code_plus_link',
                note: 'Recovery link handed over in the secure engineering channel.',
                oneTimeCode: issueRecoveryCode.body.recoveryCode,
                signedLinkToken: `${issueRecoveryCode.body.recoveryLinkToken}tampered`,
                frontendAppUrl: 'https://example.com/pv_calculator_ui.html'
            })
        });
        assert(tamperedRecoveryDispatch.status === 401, `Tampering with the signed recovery dispatch link should fail, got ${tamperedRecoveryDispatch.status}`);

        const recoveryDeliveryRecord = await requestJson(`${BASE_URL}/api/admin/delivery-trail/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_recovery',
                targetSeatId: ENGINEERING_SEAT_ID,
                deliveryChannel: 'secure_chat',
                recipient: 'engineering desk operator',
                artifactMode: 'signed_link',
                deliveryRefId: issueRecoveryCode.body.deliveryRefId,
                note: 'Recovery link delivered over the engineering secure chat.'
            })
        });
        assert(recoveryDeliveryRecord.status === 200, `Recording recovery delivery should succeed, got ${recoveryDeliveryRecord.status}`);
        assert(recoveryDeliveryRecord.body.entry && recoveryDeliveryRecord.body.entry.deliveryRefId === issueRecoveryCode.body.deliveryRefId, 'Recovery delivery record should retain the delivery reference id');

        const acknowledgeRecoveryDelivery = await requestJson(`${BASE_URL}/api/admin/delivery-trail/acknowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                entryId: recoveryDeliveryRecord.body.entry.id,
                acknowledgmentNote: 'Engineering desk confirmed receipt.'
            })
        });
        assert(acknowledgeRecoveryDelivery.status === 200, `Acknowledging recovery delivery should succeed, got ${acknowledgeRecoveryDelivery.status}`);
        assert(acknowledgeRecoveryDelivery.body.entry && acknowledgeRecoveryDelivery.body.entry.acknowledgmentStatus === 'acknowledged', 'Recovery delivery acknowledgment should mark the entry acknowledged');

        const recoveryRedeem = await requestJson(`${BASE_URL}/api/team-seats/recovery-code/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                recoveryLinkToken: issueRecoveryCode.body.recoveryLinkToken,
                nextAccessCode: RECOVERY_ENGINEERING_CODE,
                nextAccessCodeHint: 'Recovered study phrase',
                deviceLabel: 'Recovered Engineering Desk'
            })
        });
        assert(recoveryRedeem.status === 200, `Redeeming a one-time recovery code should succeed, got ${recoveryRedeem.status}`);
        assert(recoveryRedeem.body.authMode === 'recovery_code', 'Recovery-code redeem should report recovery_code auth mode');
        const recoverySessionToken = recoveryRedeem.body.sessionToken;
        assert(recoverySessionToken, 'Recovery-code redeem should issue a fresh seat session');

        const recoveryAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ENGINEERING_SEAT_ID)}&limit=8`, {
            headers: { 'X-Session-Token': recoverySessionToken }
        });
        assert(recoveryAudit.status === 200, `Recovery session should reach protected audit route, got ${recoveryAudit.status}`);
        assert(Array.isArray(recoveryAudit.body.entries) && recoveryAudit.body.entries.some(entry => entry.category === 'team_seat_recovery_code' && entry.action === 'redeem'), 'Audit should record the recovery-code redeem event');

        const tamperedRecoveryRedeem = await requestJson(`${BASE_URL}/api/team-seats/recovery-code/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                recoveryLinkToken: `${issueRecoveryCode.body.recoveryLinkToken}tampered`,
                nextAccessCode: 'ShouldFailRecoveryLink2028!',
                nextAccessCodeHint: 'Do not reuse',
                deviceLabel: 'Recovered Engineering Desk'
            })
        });
        assert(tamperedRecoveryRedeem.status === 401, `Tampering with a signed recovery link should fail, got ${tamperedRecoveryRedeem.status}`);

        const recoveryRedeemReuse = await requestJson(`${BASE_URL}/api/team-seats/recovery-code/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                recoveryLinkToken: issueRecoveryCode.body.recoveryLinkToken,
                nextAccessCode: 'ShouldFailAgain2028!',
                nextAccessCodeHint: 'Do not reuse',
                deviceLabel: 'Recovered Engineering Desk'
            })
        });
        assert(recoveryRedeemReuse.status === 401, `Reusing a one-time recovery code should fail, got ${recoveryRedeemReuse.status}`);

        const engineeringRotatedCodeAfterRecovery = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ENGINEERING_SEAT_ID,
                actorSeatCode: ROTATED_ENGINEERING_CODE,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(engineeringRotatedCodeAfterRecovery.status === 401, `The pre-recovery engineering code should fail after redeem, got ${engineeringRotatedCodeAfterRecovery.status}`);

        const issueSeatInvite = await requestJson(`${BASE_URL}/api/team-seats/invite/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: SALES_SEAT_ID,
                note: 'Admin-issued onboarding invite for sales desk browser replacement.'
            })
        });
        assert(issueSeatInvite.status === 200, `Issuing a one-time seat invite should succeed, got ${issueSeatInvite.status}`);
        assert(issueSeatInvite.body.inviteCode, 'Issuing a seat invite should return the one-time invite code');
        assert(issueSeatInvite.body.inviteLinkToken, 'Issuing a seat invite should also return a signed seat-invite token');
        assert(issueSeatInvite.body.deliveryRefId, 'Issuing a seat invite should return a delivery reference id');

        const prepareInviteDispatch = await requestJson(`${BASE_URL}/api/admin/delivery-dispatch/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_invite',
                targetSeatId: SALES_SEAT_ID,
                deliveryRefId: issueSeatInvite.body.deliveryRefId,
                deliveryChannel: 'email',
                recipient: 'sales.ops@example.test',
                artifactMode: 'signed_link',
                note: 'Invite handed over to the sales operations alias.',
                oneTimeCode: issueSeatInvite.body.inviteCode,
                signedLinkToken: issueSeatInvite.body.inviteLinkToken,
                frontendAppUrl: 'https://example.com/pv_calculator_ui.html'
            })
        });
        assert(prepareInviteDispatch.status === 200, `Preparing an invite dispatch pack should succeed, got ${prepareInviteDispatch.status}`);
        assert(prepareInviteDispatch.body.dispatch && prepareInviteDispatch.body.dispatch.body.includes('pvSeatInviteToken='), 'Invite dispatch pack should include the signed invite handoff link');

        const inviteDeliveryRecord = await requestJson(`${BASE_URL}/api/admin/delivery-trail/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_invite',
                targetSeatId: SALES_SEAT_ID,
                deliveryChannel: 'email',
                recipient: 'sales.ops@example.test',
                artifactMode: 'code_plus_link',
                deliveryRefId: issueSeatInvite.body.deliveryRefId,
                note: 'Invite handed over to the sales operations alias.'
            })
        });
        assert(inviteDeliveryRecord.status === 200, `Recording invite delivery should succeed, got ${inviteDeliveryRecord.status}`);
        assert(inviteDeliveryRecord.body.entry && inviteDeliveryRecord.body.entry.deliveryRefId === issueSeatInvite.body.deliveryRefId, 'Invite delivery record should retain the delivery reference id');

        const pendingInviteTrail = await requestJson(`${BASE_URL}/api/admin/delivery-trail?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&acknowledgmentStatus=pending&limit=5`, {
            headers: { 'X-Session-Token': rotatedToken }
        });
        assert(pendingInviteTrail.status === 200, `Pending delivery trail should load for the admin seat, got ${pendingInviteTrail.status}`);
        assert(Array.isArray(pendingInviteTrail.body.entries) && pendingInviteTrail.body.entries.some(entry => entry.id === inviteDeliveryRecord.body.entry.id), 'Pending delivery trail should include the unacknowledged invite delivery');

        const inviteDeliveryTrail = await requestJson(`${BASE_URL}/api/admin/delivery-trail?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&deliveryType=seat_invite&deliveryChannel=email&limit=5`, {
            headers: { 'X-Session-Token': rotatedToken }
        });
        assert(inviteDeliveryTrail.status === 200, `Filtered delivery trail should load for the admin seat, got ${inviteDeliveryTrail.status}`);
        assert(Array.isArray(inviteDeliveryTrail.body.entries) && inviteDeliveryTrail.body.entries.some(entry => entry.deliveryRefId === issueSeatInvite.body.deliveryRefId), 'Filtered delivery trail should include the recorded invite delivery');

        const acknowledgeInviteDelivery = await requestJson(`${BASE_URL}/api/admin/delivery-trail/acknowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                entryId: inviteDeliveryRecord.body.entry.id,
                acknowledgmentNote: 'Sales operations confirmed receipt.'
            })
        });
        assert(acknowledgeInviteDelivery.status === 200, `Acknowledging invite delivery should succeed, got ${acknowledgeInviteDelivery.status}`);
        assert(acknowledgeInviteDelivery.body.entry && acknowledgeInviteDelivery.body.entry.acknowledgmentStatus === 'acknowledged', 'Invite delivery acknowledgment should mark the entry acknowledged');

        const inviteRedeem = await requestJson(`${BASE_URL}/api/team-seats/invite/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                inviteLinkToken: issueSeatInvite.body.inviteLinkToken,
                nextAccessCode: INVITED_SALES_CODE,
                nextAccessCodeHint: 'Sales desk invite phrase',
                deviceLabel: 'Invited Sales Desk Browser'
            })
        });
        assert(inviteRedeem.status === 200, `Redeeming a one-time seat invite should succeed, got ${inviteRedeem.status}`);
        assert(inviteRedeem.body.authMode === 'seat_invite', 'Seat-invite redeem should report seat_invite auth mode');
        assert(inviteRedeem.body.actorSeatId === SALES_SEAT_ID, 'Seat-invite redeem should activate the invited target seat');
        const inviteSessionToken = inviteRedeem.body.sessionToken;
        assert(inviteSessionToken, 'Seat-invite redeem should issue a fresh seat session');

        const invitedSeatRead = await requestJson(`${BASE_URL}/api/team-seats?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(SALES_SEAT_ID)}`, {
            headers: { 'X-Session-Token': inviteSessionToken }
        });
        assert(invitedSeatRead.status === 200, `Invited seat session should reach protected shared-read routes, got ${invitedSeatRead.status}`);
        assert(Array.isArray(invitedSeatRead.body.seats) && invitedSeatRead.body.seats.some(entry => entry.id === SALES_SEAT_ID), 'Shared team-seat fetch should include the invited seat');

        const inviteRedeemReuse = await requestJson(`${BASE_URL}/api/team-seats/invite/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                inviteLinkToken: issueSeatInvite.body.inviteLinkToken,
                nextAccessCode: 'ShouldFailInviteReuse2028!',
                nextAccessCodeHint: 'Do not reuse',
                deviceLabel: 'Invited Sales Desk Browser'
            })
        });
        assert(inviteRedeemReuse.status === 401, `Reusing a one-time seat invite should fail, got ${inviteRedeemReuse.status}`);

        const tamperedInviteRedeem = await requestJson(`${BASE_URL}/api/team-seats/invite/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                inviteLinkToken: `${issueSeatInvite.body.inviteLinkToken}tampered`,
                nextAccessCode: 'ShouldFailInviteLink2028!',
                nextAccessCodeHint: 'Do not reuse',
                deviceLabel: 'Invited Sales Desk Browser'
            })
        });
        assert(tamperedInviteRedeem.status === 401, `Tampering with a signed seat invite should fail, got ${tamperedInviteRedeem.status}`);

        const invitedSeatSignIn = await requestJson(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: SALES_SEAT_ID,
                actorSeatCode: INVITED_SALES_CODE,
                deviceLabel: 'Invited Sales Desk Browser'
            })
        });
        assert(invitedSeatSignIn.status === 200, `Invited seat should sign in with its new access code, got ${invitedSeatSignIn.status}`);

        const revokeRotated = await requestJson(`${BASE_URL}/api/seat-session/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': rotatedToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deviceLabel: 'Backend Security Test'
            })
        });
        assert(revokeRotated.status === 200, `Admin revoke should succeed, got ${revokeRotated.status}`);

        const revokedAudit = await requestJson(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}&limit=2`, {
            headers: { 'X-Session-Token': rotatedToken }
        });
        assert(revokedAudit.status === 401, `Revoked admin token should fail, got ${revokedAudit.status}`);

        console.log('BACKEND SECURITY OK');
    } finally {
        await stopServer(child);
        cleanupRuntimeFiles();
    }
}

run().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
