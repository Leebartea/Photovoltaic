const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const PORT = Number(process.env.TEST_BACKEND_ADMIN_PORT || 5061);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const INSTALLATION_KEY = 'demo-engineering-plus';
const ADMIN_SEAT_ID = 'team_seat_admin_demo';
const ADMIN_CODE = 'AdaOps2026!';
const APPROVAL_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'admin_action_approvals.json');
const DELIVERY_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'admin_delivery_trail.json');
const AUDIT_RUNTIME_FILE = path.join(__dirname, 'backend', 'data', 'audit_log.json');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(url, options = {}) {
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
                resolve({
                    status: res.statusCode || 0,
                    headers: res.headers || {},
                    body,
                    raw: text
                });
            });
        });
        req.on('error', reject);
        if (rawBody) req.write(rawBody);
        req.end();
    });
}

async function waitForHealth(timeoutMs = 10000, getDebugOutput = () => '') {
    const started = Date.now();
    while ((Date.now() - started) < timeoutMs) {
        try {
            const response = await request(`${BASE_URL}/health`);
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
    fs.rmSync(APPROVAL_RUNTIME_FILE, { force: true });
    fs.rmSync(DELIVERY_RUNTIME_FILE, { force: true });
    fs.rmSync(AUDIT_RUNTIME_FILE, { force: true });
}

async function run() {
    cleanupRuntimeFiles();
    const child = spawn(process.execPath, ['backend/server.js'], {
        cwd: __dirname,
        env: {
            ...process.env,
            PORT: String(PORT),
            BACKEND_API_KEY: 'codex-test',
            BACKEND_ACTION_LINK_SECRET: 'admin-console-secret',
            BACKEND_ALLOWED_ORIGINS: BASE_URL
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

        const adminHtml = await request(`${BASE_URL}/admin`);
        assert(adminHtml.status === 200, `Expected /admin to return 200, got ${adminHtml.status}`);
        assert(String(adminHtml.headers['content-type'] || '').includes('text/html'), 'Expected /admin to serve HTML.');
        assert(adminHtml.raw.includes('PV Premium Admin Console'), 'Admin HTML should contain the console title.');
        assert(adminHtml.raw.includes('/admin/app.js'), 'Admin HTML should load the admin JS asset.');
        assert(adminHtml.raw.includes('/admin/app.css'), 'Admin HTML should load the admin CSS asset.');
        assert(adminHtml.raw.includes('Admin Unlock State'), 'Admin HTML should include the authenticated shell section.');
        assert(adminHtml.raw.includes('Action Approval Queue'), 'Admin HTML should include the high-risk action approval section.');
        assert(adminHtml.raw.includes('Invite & Recovery Handoff Log'), 'Admin HTML should include the delivery trail section.');
        assert(adminHtml.raw.includes('Provider-Ready Handoff Copy'), 'Admin HTML should include the dispatch-pack section.');
        assert(adminHtml.raw.includes('Copy snapshot'), 'Admin HTML should include audit snapshot export controls.');
        assert(adminHtml.raw.includes('approvalStatusFilter'), 'Admin HTML should include the approval queue filter.');
        assert(adminHtml.raw.includes('deliveryTypeFilter'), 'Admin HTML should include the delivery-trail type filter.');
        assert(adminHtml.raw.includes('deliveryAckStatusFilter'), 'Admin HTML should include the delivery acknowledgment status filter.');
        assert(adminHtml.raw.includes('recordInviteDeliveryBtn'), 'Admin HTML should include the invite delivery recorder.');
        assert(adminHtml.raw.includes('prepareInviteDispatchBtn'), 'Admin HTML should include the invite dispatch-prep action.');
        assert(adminHtml.raw.includes('auditCategoryFilter'), 'Admin HTML should include the audit category filter.');
        assert(adminHtml.raw.includes('auditActionFilter'), 'Admin HTML should include the audit action filter.');
        assert(adminHtml.raw.includes('auditQueryFilter'), 'Admin HTML should include the audit query filter.');
        assert(!adminHtml.raw.includes('<script>'), 'Admin HTML should not rely on inline scripts.');
        assert(String(adminHtml.headers['content-security-policy'] || '').includes("script-src 'self'"), 'Admin HTML should set a page-specific CSP.');

        const adminJs = await request(`${BASE_URL}/admin/app.js`);
        assert(adminJs.status === 200, `Expected /admin/app.js to return 200, got ${adminJs.status}`);
        assert(String(adminJs.headers['content-type'] || '').includes('application/javascript'), 'Expected admin JS asset to serve JavaScript.');
        assert(adminJs.raw.includes('/api/admin/posture'), 'Admin JS should fetch the posture endpoint.');
        assert(adminJs.raw.includes('/api/admin/session-context'), 'Admin JS should fetch the session-only admin context endpoint.');
        assert(adminJs.raw.includes('/api/admin/audit-export'), 'Admin JS should use the admin audit export endpoint.');
        assert(adminJs.raw.includes('/api/admin/action-approvals?'), 'Admin JS should load the admin approval queue.');
        assert(adminJs.raw.includes('/api/admin/action-approvals/request'), 'Admin JS should request high-risk approvals.');
        assert(adminJs.raw.includes('/api/admin/action-approvals/review'), 'Admin JS should review high-risk approvals.');
        assert(adminJs.raw.includes('/api/admin/delivery-trail?'), 'Admin JS should load the admin delivery trail.');
        assert(adminJs.raw.includes('/api/admin/delivery-trail/record'), 'Admin JS should record admin delivery trail entries.');
        assert(adminJs.raw.includes('/api/admin/delivery-trail/acknowledge'), 'Admin JS should acknowledge admin delivery trail entries.');
        assert(adminJs.raw.includes('/api/admin/delivery-dispatch/prepare'), 'Admin JS should prepare provider-ready admin dispatch packs.');
        assert(adminJs.raw.includes("params.set('category'"), 'Admin JS should propagate audit filter query parameters.');
        assert(adminJs.raw.includes("params.set('action'"), 'Admin JS should propagate audit action filter query parameters.');
        assert(adminJs.raw.includes("params.set('query'"), 'Admin JS should propagate audit search filter query parameters.');
        assert(adminJs.raw.includes('Ops readiness'), 'Admin JS should surface premium ops readiness in the posture summary.');

        const adminCss = await request(`${BASE_URL}/admin/app.css`);
        assert(adminCss.status === 200, `Expected /admin/app.css to return 200, got ${adminCss.status}`);
        assert(String(adminCss.headers['content-type'] || '').includes('text/css'), 'Expected admin CSS asset to serve CSS.');
        assert(adminCss.raw.includes('--accent'), 'Admin CSS should include the console theme variables.');
        assert(adminCss.raw.includes('.requires-session.is-locked'), 'Admin CSS should include the locked-shell treatment.');

        const posture = await request(`${BASE_URL}/api/admin/posture`);
        assert(posture.status === 200, `Expected /api/admin/posture to return 200, got ${posture.status}`);
        assert(posture.body.ok === true, 'Admin posture response should be ok.');
        assert(posture.body.entitlementSource === 'manual_admin', `Admin posture should report manual_admin entitlement source, got ${posture.body.entitlementSource}`);
        assert(posture.body.storageDriver === 'json', `Admin posture should report json storage in this test, got ${posture.body.storageDriver}`);
        assert(posture.body.apiKeyProtectionEnabled === true, 'Admin posture should report API key protection enabled for the test backend.');
        assert(posture.body.allowedOriginsConfigured === true, 'Admin posture should report allowed origins configured for the test backend.');
        assert(posture.body.actionLinkSecretSource === 'explicit', 'Admin posture should report the explicit action-link secret source.');
        assert(posture.body.operationsReadiness && posture.body.operationsReadiness.ready === false, 'Admin posture should report incomplete premium ops readiness in this minimal test backend.');
        assert(Array.isArray(posture.body.operationsReadiness.missing) && posture.body.operationsReadiness.missing.includes('Backup owner'), 'Admin posture should expose missing backup ownership in ops readiness.');
        assert(Array.isArray(posture.body.availableAdminRoutes) && posture.body.availableAdminRoutes.includes('/admin'), 'Admin posture should advertise the /admin route.');
        assert(Array.isArray(posture.body.warnings) && posture.body.warnings.some(item => String(item || '').includes('JSON file mode')), 'Admin posture should warn when runtime storage is still in JSON mode.');
        assert(Array.isArray(posture.body.warnings) && posture.body.warnings.some(item => String(item || '').includes('Operational ownership is incomplete')), 'Admin posture should warn when premium ops ownership is incomplete.');

        const lockedContext = await request(`${BASE_URL}/api/admin/session-context?installationKey=${encodeURIComponent(INSTALLATION_KEY)}`);
        assert(lockedContext.status === 401, `Expected admin session context to require a live session, got ${lockedContext.status}`);

        const lockedAuditExport = await request(`${BASE_URL}/api/admin/audit-export?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&format=txt&limit=5`);
        assert(lockedAuditExport.status === 401, `Expected admin audit export to require a live session, got ${lockedAuditExport.status}`);

        const lockedDeliveryTrail = await request(`${BASE_URL}/api/admin/delivery-trail?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&deliveryType=seat_invite&limit=5`);
        assert(lockedDeliveryTrail.status === 401, `Expected admin delivery trail to require a live session, got ${lockedDeliveryTrail.status}`);

        const lockedAcknowledge = await request(`${BASE_URL}/api/admin/delivery-trail/acknowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                entryId: 'delivery_missing'
            })
        });
        assert(lockedAcknowledge.status === 401, `Expected delivery acknowledgment to require a live session, got ${lockedAcknowledge.status}`);

        const lockedDispatchPack = await request(`${BASE_URL}/api/admin/delivery-dispatch/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_invite',
                targetSeatId: 'team_seat_sales_demo',
                deliveryRefId: 'seat_invite_issue_missing',
                deliveryChannel: 'email',
                artifactMode: 'code_plus_link',
                oneTimeCode: 'missing',
                signedLinkToken: 'missing'
            })
        });
        assert(lockedDispatchPack.status === 401, `Expected dispatch-pack preparation to require a live session, got ${lockedDispatchPack.status}`);

        const issuedSession = await request(`${BASE_URL}/api/seat-session/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                actorSeatCode: ADMIN_CODE,
                deviceLabel: 'Admin Console Test'
            })
        });
        assert(issuedSession.status === 200, `Expected admin seat session issue to succeed, got ${issuedSession.status}`);
        assert(issuedSession.body.sessionToken, 'Expected seat-session issue to return a session token.');

        const unlockedContext = await request(`${BASE_URL}/api/admin/session-context?installationKey=${encodeURIComponent(INSTALLATION_KEY)}`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(unlockedContext.status === 200, `Expected session-backed admin context to succeed, got ${unlockedContext.status}`);
        assert(unlockedContext.body.unlocked === true, 'Expected admin context to report unlocked.');
        assert(unlockedContext.body.actorSeatId === ADMIN_SEAT_ID, 'Expected admin context to resolve the active admin seat.');
        assert(unlockedContext.body.capabilities && unlockedContext.body.capabilities.teamSeatPublish === true, 'Expected admin context to expose team-seat publish capability for the admin seat.');

        const initialApprovalQueue = await request(`${BASE_URL}/api/admin/action-approvals?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&status=open`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(initialApprovalQueue.status === 200, `Expected admin approval queue to load with a live session, got ${initialApprovalQueue.status}`);
        assert(Array.isArray(initialApprovalQueue.body.approvals), 'Approval queue response should include approvals.');

        const requestApproval = await request(`${BASE_URL}/api/admin/action-approvals/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actionType: 'team_seat_recovery',
                recoveryAction: 'suspend_seat',
                targetSeatId: 'team_seat_eng_demo',
                note: 'Queue a suspension for admin-console approval coverage.'
            })
        });
        assert(requestApproval.status === 200, `Expected approval request to succeed, got ${requestApproval.status}`);
        assert(requestApproval.body.approval && requestApproval.body.approval.status === 'pending', 'Approval request should create a pending record.');

        const reviewApproval = await request(`${BASE_URL}/api/admin/action-approvals/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                approvalId: requestApproval.body.approval.id,
                decision: 'approve',
                note: 'Approved for admin-console regression coverage.'
            })
        });
        assert(reviewApproval.status === 200, `Expected approval review to succeed, got ${reviewApproval.status}`);
        assert(reviewApproval.body.approval && reviewApproval.body.approval.status === 'approved', 'Approval review should move the request to approved state.');

        const approvedQueue = await request(`${BASE_URL}/api/admin/action-approvals?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&status=approved`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(approvedQueue.status === 200, `Expected approved approval queue to load, got ${approvedQueue.status}`);
        assert(Array.isArray(approvedQueue.body.approvals) && approvedQueue.body.approvals.some(entry => entry.id === requestApproval.body.approval.id), 'Approved queue should include the reviewed approval.');

        const issuedInvite = await request(`${BASE_URL}/api/team-seats/invite/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: 'team_seat_sales_demo',
                note: 'Admin console invite delivery trail coverage.'
            })
        });
        assert(issuedInvite.status === 200, `Expected invite issue to succeed for delivery trail coverage, got ${issuedInvite.status}`);
        assert(issuedInvite.body.deliveryRefId, 'Invite issue should return a delivery reference id.');

        const recordInviteDelivery = await request(`${BASE_URL}/api/admin/delivery-trail/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_invite',
                targetSeatId: 'team_seat_sales_demo',
                deliveryChannel: 'email',
                recipient: 'sales.ops@example.test',
                artifactMode: 'code_plus_link',
                deliveryRefId: issuedInvite.body.deliveryRefId,
                note: 'Invite mailed to the sales desk operator.'
            })
        });
        assert(recordInviteDelivery.status === 200, `Expected invite delivery record to succeed, got ${recordInviteDelivery.status}`);
        assert(recordInviteDelivery.body.entry && recordInviteDelivery.body.entry.deliveryType === 'seat_invite', 'Invite delivery record should echo a seat_invite entry.');

        const acknowledgeInviteDelivery = await request(`${BASE_URL}/api/admin/delivery-trail/acknowledge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                entryId: recordInviteDelivery.body.entry.id,
                acknowledgmentNote: 'Sales desk confirmed receipt.'
            })
        });
        assert(acknowledgeInviteDelivery.status === 200, `Expected invite delivery acknowledgment to succeed, got ${acknowledgeInviteDelivery.status}`);
        assert(acknowledgeInviteDelivery.body.entry && acknowledgeInviteDelivery.body.entry.acknowledgmentStatus === 'acknowledged', 'Invite delivery acknowledgment should mark the entry acknowledged.');

        const prepareInviteDispatch = await request(`${BASE_URL}/api/admin/delivery-dispatch/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_invite',
                targetSeatId: 'team_seat_sales_demo',
                deliveryRefId: issuedInvite.body.deliveryRefId,
                deliveryChannel: 'email',
                recipient: 'sales.ops@example.test',
                artifactMode: 'code_plus_link',
                note: 'Invite emailed from the admin console.',
                oneTimeCode: issuedInvite.body.inviteCode,
                signedLinkToken: issuedInvite.body.inviteLinkToken,
                frontendAppUrl: 'https://example.com/pv_calculator_ui.html'
            })
        });
        assert(prepareInviteDispatch.status === 200, `Expected invite dispatch-pack preparation to succeed, got ${prepareInviteDispatch.status}`);
        assert(prepareInviteDispatch.body.dispatch && prepareInviteDispatch.body.dispatch.subject.includes('Seat Invite'), 'Invite dispatch pack should include a seat-invite subject.');
        assert(prepareInviteDispatch.body.dispatch && prepareInviteDispatch.body.dispatch.body.includes(issuedInvite.body.inviteCode), 'Invite dispatch pack should include the one-time invite code when requested.');
        assert(prepareInviteDispatch.body.dispatch && prepareInviteDispatch.body.dispatch.body.includes('https://example.com/pv_calculator_ui.html#pvSeatInviteToken='), 'Invite dispatch pack should include the signed frontend handoff link when a frontend URL is supplied.');

        const issuedRecovery = await request(`${BASE_URL}/api/team-seats/recovery-code/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                actorSeatId: ADMIN_SEAT_ID,
                targetSeatId: 'team_seat_eng_demo',
                note: 'Admin console recovery delivery trail coverage.'
            })
        });
        assert(issuedRecovery.status === 200, `Expected recovery issue to succeed for delivery trail coverage, got ${issuedRecovery.status}`);
        assert(issuedRecovery.body.deliveryRefId, 'Recovery issue should return a delivery reference id.');

        const recordRecoveryDelivery = await request(`${BASE_URL}/api/admin/delivery-trail/record`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_recovery',
                targetSeatId: 'team_seat_eng_demo',
                deliveryChannel: 'secure_chat',
                recipient: 'engineering desk chat',
                artifactMode: 'signed_link',
                deliveryRefId: issuedRecovery.body.deliveryRefId,
                note: 'Recovery link handed over in the secure engineering channel.'
            })
        });
        assert(recordRecoveryDelivery.status === 200, `Expected recovery delivery record to succeed, got ${recordRecoveryDelivery.status}`);
        assert(recordRecoveryDelivery.body.entry && recordRecoveryDelivery.body.entry.deliveryType === 'seat_recovery', 'Recovery delivery record should echo a seat_recovery entry.');

        const prepareRecoveryDispatch = await request(`${BASE_URL}/api/admin/delivery-dispatch/prepare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': issuedSession.body.sessionToken
            },
            body: JSON.stringify({
                installationKey: INSTALLATION_KEY,
                deliveryType: 'seat_recovery',
                targetSeatId: 'team_seat_eng_demo',
                deliveryRefId: issuedRecovery.body.deliveryRefId,
                deliveryChannel: 'secure_chat',
                recipient: 'engineering desk chat',
                artifactMode: 'signed_link',
                note: 'Recovery item shared in secure chat.',
                oneTimeCode: issuedRecovery.body.recoveryCode,
                signedLinkToken: issuedRecovery.body.recoveryLinkToken,
                frontendAppUrl: 'https://example.com/pv_calculator_ui.html'
            })
        });
        assert(prepareRecoveryDispatch.status === 200, `Expected recovery dispatch-pack preparation to succeed, got ${prepareRecoveryDispatch.status}`);
        assert(prepareRecoveryDispatch.body.dispatch && prepareRecoveryDispatch.body.dispatch.body.includes('pvSeatRecoveryToken='), 'Recovery dispatch pack should include the signed recovery handoff link.');
        assert(Array.isArray(prepareRecoveryDispatch.body.dispatch.warnings) && prepareRecoveryDispatch.body.dispatch.warnings.length === 0, 'Recovery dispatch pack should not warn when the frontend app URL is present.');

        const filteredDeliveryTrail = await request(`${BASE_URL}/api/admin/delivery-trail?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&deliveryType=seat_invite&deliveryChannel=email&limit=5`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(filteredDeliveryTrail.status === 200, `Expected filtered admin delivery trail to load, got ${filteredDeliveryTrail.status}`);
        assert(filteredDeliveryTrail.body.filters && filteredDeliveryTrail.body.filters.deliveryType === 'seat_invite', 'Filtered delivery trail should echo the delivery type filter.');
        assert(filteredDeliveryTrail.body.filters && filteredDeliveryTrail.body.filters.deliveryChannel === 'email', 'Filtered delivery trail should echo the delivery channel filter.');
        assert(Array.isArray(filteredDeliveryTrail.body.entries) && filteredDeliveryTrail.body.entries.length === 1, 'Filtered delivery trail should only include the matching invite delivery record.');
        assert(filteredDeliveryTrail.body.entries[0].deliveryRefId === issuedInvite.body.deliveryRefId, 'Filtered delivery trail should include the expected delivery reference id.');
        assert(filteredDeliveryTrail.body.entries[0].acknowledgmentStatus === 'acknowledged', 'Filtered delivery trail should include the acknowledgment state.');

        const pendingDeliveryTrail = await request(`${BASE_URL}/api/admin/delivery-trail?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&acknowledgmentStatus=pending&limit=10`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(pendingDeliveryTrail.status === 200, `Expected pending delivery trail to load, got ${pendingDeliveryTrail.status}`);
        assert(Array.isArray(pendingDeliveryTrail.body.entries) && pendingDeliveryTrail.body.entries.some(entry => entry.deliveryType === 'seat_recovery' && entry.acknowledgmentStatus === 'pending'), 'Pending delivery trail should include the unacknowledged recovery entry.');

        const filteredAudit = await request(`${BASE_URL}/api/audit-log?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&actorSeatId=${encodeURIComponent(ADMIN_SEAT_ID)}&limit=10&category=team_session&action=issue`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(filteredAudit.status === 200, `Expected filtered audit timeline request to succeed, got ${filteredAudit.status}`);
        assert(filteredAudit.body.filters && filteredAudit.body.filters.category === 'team_session', 'Filtered audit response should echo the category filter.');
        assert(filteredAudit.body.filters && filteredAudit.body.filters.action === 'issue', 'Filtered audit response should echo the action filter.');
        assert(Array.isArray(filteredAudit.body.entries) && filteredAudit.body.entries.every(entry => entry.category === 'team_session' && entry.action === 'issue'), 'Filtered audit response should only include matching entries.');

        const auditTxt = await request(`${BASE_URL}/api/admin/audit-export?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&format=txt&limit=5&category=team_session&action=issue`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(auditTxt.status === 200, `Expected TXT admin audit export to succeed, got ${auditTxt.status}`);
        assert(String(auditTxt.headers['content-type'] || '').includes('text/plain'), 'Expected TXT admin audit export to serve text/plain.');
        assert(auditTxt.raw.includes('PV Premium Admin Audit Snapshot'), 'TXT audit export should include the export title.');
        assert(auditTxt.raw.includes(`Installation Key: ${INSTALLATION_KEY}`), 'TXT audit export should include the installation key.');
        assert(auditTxt.raw.includes('Active Filters: category=team_session • action=issue'), 'TXT audit export should describe the active audit filters.');

        const auditCsv = await request(`${BASE_URL}/api/admin/audit-export?installationKey=${encodeURIComponent(INSTALLATION_KEY)}&format=csv&limit=5&category=team_session&action=issue`, {
            headers: {
                'X-Session-Token': issuedSession.body.sessionToken
            }
        });
        assert(auditCsv.status === 200, `Expected CSV admin audit export to succeed, got ${auditCsv.status}`);
        assert(String(auditCsv.headers['content-type'] || '').includes('text/csv'), 'Expected CSV admin audit export to serve text/csv.');
        assert(auditCsv.raw.includes('installation_key,exported_at,operator_seat_id'), 'CSV audit export should include the export header row.');
        assert(auditCsv.raw.includes('filter_category,filter_action,filter_query'), 'CSV audit export should include filter columns.');
        assert(auditCsv.raw.includes('team_session,issue,'), 'CSV audit export should carry the selected audit filters.');
    } finally {
        await stopServer(child);
        cleanupRuntimeFiles();
    }
}

run().then(() => {
    console.log('Backend admin console checks passed.');
}).catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
