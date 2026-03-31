#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 5055);
const DEFAULT_DATA_DIR = path.join(__dirname, 'data');
const DATA_DIR = path.resolve(process.env.BACKEND_DATA_DIR || DEFAULT_DATA_DIR);
const STORAGE_DRIVER = String(process.env.BACKEND_STORAGE_DRIVER || 'json').trim().toLowerCase() === 'sqlite'
    ? 'sqlite'
    : 'json';
const SQLITE_FILE = path.resolve(process.env.BACKEND_SQLITE_FILE || path.join(DATA_DIR, 'premium_sync.sqlite'));
const ENTITLEMENT_SOURCE_DEFINITIONS = {
    manual_admin: {
        label: 'Manual Admin-Managed',
        description: 'Backend-managed license records are the premium entitlement source of truth for v1.'
    }
};
const BACKEND_ENTITLEMENT_SOURCE = String(process.env.BACKEND_ENTITLEMENT_SOURCE || 'manual_admin').trim().toLowerCase();
if (!ENTITLEMENT_SOURCE_DEFINITIONS[BACKEND_ENTITLEMENT_SOURCE]) {
    throw new Error(`Unsupported BACKEND_ENTITLEMENT_SOURCE "${BACKEND_ENTITLEMENT_SOURCE}". Supported values: ${Object.keys(ENTITLEMENT_SOURCE_DEFINITIONS).join(', ')}`);
}
const PRIMARY_DATA_FILE = path.join(DATA_DIR, 'licenses.json');
const EXAMPLE_DATA_FILE = path.join(DEFAULT_DATA_DIR, 'licenses.example.json');
const PRIMARY_PROFILES_FILE = path.join(DATA_DIR, 'company_profiles.json');
const EXAMPLE_PROFILES_FILE = path.join(DEFAULT_DATA_DIR, 'company_profiles.example.json');
const PRIMARY_TEAM_HANDBACKS_FILE = path.join(DATA_DIR, 'team_handbacks.json');
const EXAMPLE_TEAM_HANDBACKS_FILE = path.join(DEFAULT_DATA_DIR, 'team_handbacks.example.json');
const PRIMARY_TEAM_ROSTER_FILE = path.join(DATA_DIR, 'team_roster.json');
const EXAMPLE_TEAM_ROSTER_FILE = path.join(DEFAULT_DATA_DIR, 'team_roster.example.json');
const PRIMARY_TEAM_SEATS_FILE = path.join(DATA_DIR, 'team_seats.json');
const EXAMPLE_TEAM_SEATS_FILE = path.join(DEFAULT_DATA_DIR, 'team_seats.example.json');
const PRIMARY_AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit_log.json');
const EXAMPLE_AUDIT_LOG_FILE = path.join(DEFAULT_DATA_DIR, 'audit_log.example.json');
const PRIMARY_ADMIN_ACTION_APPROVALS_FILE = path.join(DATA_DIR, 'admin_action_approvals.json');
const EXAMPLE_ADMIN_ACTION_APPROVALS_FILE = path.join(DEFAULT_DATA_DIR, 'admin_action_approvals.example.json');
const PRIMARY_ADMIN_DELIVERY_TRAIL_FILE = path.join(DATA_DIR, 'admin_delivery_trail.json');
const EXAMPLE_ADMIN_DELIVERY_TRAIL_FILE = path.join(DEFAULT_DATA_DIR, 'admin_delivery_trail.example.json');
const ADMIN_DIR = path.join(__dirname, 'admin');
const ADMIN_INDEX_FILE = path.join(ADMIN_DIR, 'index.html');
const ADMIN_APP_JS_FILE = path.join(ADMIN_DIR, 'app.js');
const ADMIN_APP_CSS_FILE = path.join(ADMIN_DIR, 'app.css');
const MAX_BODY_BYTES = Math.max(1024, Number(process.env.MAX_BODY_BYTES || 262144));
const MAX_AUDIT_EVENTS_PER_INSTALLATION = Math.max(10, Number(process.env.MAX_AUDIT_EVENTS_PER_INSTALLATION || 120));
const SEAT_SESSION_TTL_MS = Math.max(300000, Number(process.env.SEAT_SESSION_TTL_MS || 8 * 60 * 60 * 1000));
const BACKEND_SEAT_CODE_PEPPER = String(process.env.BACKEND_SEAT_CODE_PEPPER || '');
const BACKEND_RECOVERY_CODE_PEPPER = String(process.env.BACKEND_RECOVERY_CODE_PEPPER || BACKEND_SEAT_CODE_PEPPER || '');
const MAX_SEAT_SIGNIN_ATTEMPTS = Math.max(2, Number(process.env.MAX_SEAT_SIGNIN_ATTEMPTS || 5));
const SEAT_SIGNIN_WINDOW_MS = Math.max(60000, Number(process.env.SEAT_SIGNIN_WINDOW_MS || 15 * 60 * 1000));
const SEAT_SIGNIN_LOCKOUT_MS = Math.max(30000, Number(process.env.SEAT_SIGNIN_LOCKOUT_MS || 10 * 60 * 1000));
const SEAT_RECOVERY_CODE_TTL_MS = Math.max(300000, Number(process.env.SEAT_RECOVERY_CODE_TTL_MS || 20 * 60 * 1000));
const SEAT_INVITE_CODE_TTL_MS = Math.max(600000, Number(process.env.SEAT_INVITE_CODE_TTL_MS || 6 * 60 * 60 * 1000));
const ADMIN_ACTION_APPROVAL_TTL_MS = Math.max(600000, Number(process.env.ADMIN_ACTION_APPROVAL_TTL_MS || 4 * 60 * 60 * 1000));
const CONFIGURED_API_KEYS = Array.from(new Set(
    String(process.env.BACKEND_API_KEYS || process.env.BACKEND_API_KEY || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
));
const ACTION_LINK_SECRET_SOURCE = process.env.BACKEND_ACTION_LINK_SECRET
    ? 'explicit'
    : BACKEND_RECOVERY_CODE_PEPPER
        ? 'recovery_pepper_fallback'
        : CONFIGURED_API_KEYS[0]
            ? 'api_key_fallback'
            : 'dev_default';
const BACKEND_ACTION_LINK_SECRET = String(
    process.env.BACKEND_ACTION_LINK_SECRET
    || BACKEND_RECOVERY_CODE_PEPPER
    || CONFIGURED_API_KEYS[0]
    || 'pv-calculator-dev-action-link-secret'
);
const BACKEND_BACKUP_ROOT_DIR = String(process.env.BACKEND_BACKUP_ROOT_DIR || '').trim();
const BACKEND_BACKUP_SCHEDULE_CRON = String(process.env.BACKEND_BACKUP_SCHEDULE_CRON || '').trim();
const BACKEND_BACKUP_KEEP_COUNT = String(process.env.BACKEND_BACKUP_KEEP_COUNT || '').trim();
const BACKEND_BACKUP_KEEP_DAYS = String(process.env.BACKEND_BACKUP_KEEP_DAYS || '').trim();
const BACKEND_BACKUP_OWNER = String(process.env.BACKEND_BACKUP_OWNER || '').trim();
const BACKEND_BACKUP_REVIEW_CHANNEL = String(process.env.BACKEND_BACKUP_REVIEW_CHANNEL || '').trim();
const BACKEND_RESTORE_OWNER = String(process.env.BACKEND_RESTORE_OWNER || '').trim();
const BACKEND_RESTORE_DRILL_CADENCE = String(process.env.BACKEND_RESTORE_DRILL_CADENCE || '').trim();
const BACKEND_AUDIT_RETENTION_DAYS = String(process.env.BACKEND_AUDIT_RETENTION_DAYS || '').trim();
const BACKEND_DELIVERY_RETENTION_DAYS = String(process.env.BACKEND_DELIVERY_RETENTION_DAYS || '').trim();
const BACKEND_APPROVAL_RETENTION_DAYS = String(process.env.BACKEND_APPROVAL_RETENTION_DAYS || '').trim();
const BACKEND_INCIDENT_OWNER = String(process.env.BACKEND_INCIDENT_OWNER || '').trim();
const BACKEND_INCIDENT_CHANNEL = String(process.env.BACKEND_INCIDENT_CHANNEL || '').trim();
const BACKEND_INCIDENT_RUNBOOK_URL = String(process.env.BACKEND_INCIDENT_RUNBOOK_URL || '').trim();
const ALLOWED_ORIGINS = Array.from(new Set(
    String(process.env.BACKEND_ALLOWED_ORIGINS || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
));
const ACTIVE_SEAT_SESSIONS = new Map();
const ACTIVE_SEAT_RECOVERY_CODES = new Map();
const ACTIVE_SEAT_INVITES = new Map();
const FAILED_SEAT_SIGNINS = new Map();
const TEAM_SEAT_READONLY_PERMISSIONS = ['shared_read', 'audit_read'];
const TEAM_SEAT_ROLE_DEFINITIONS = {
    sales_desk: {
        label: 'Sales Desk',
        permissions: ['shared_read', 'company_profile_publish', 'team_handback_publish']
    },
    commercial_review: {
        label: 'Commercial Review',
        permissions: ['shared_read', 'company_profile_publish', 'team_handback_publish']
    },
    engineering_review: {
        label: 'Engineering Review',
        permissions: ['shared_read', 'audit_read', 'team_handback_publish', 'team_roster_publish']
    },
    installer_ops: {
        label: 'Installer Ops',
        permissions: ['shared_read', 'team_handback_publish']
    },
    client_delivery: {
        label: 'Client Delivery',
        permissions: ['shared_read', 'team_handback_publish']
    },
    management_signoff: {
        label: 'Management Sign-off',
        permissions: ['shared_read', 'audit_read', 'company_profile_publish', 'team_handback_publish', 'team_roster_publish']
    },
    workspace_admin: {
        label: 'Workspace Admin',
        permissions: ['shared_read', 'audit_read', 'company_profile_publish', 'team_handback_publish', 'team_roster_publish', 'team_seat_publish']
    }
};
const TEAM_SEAT_STATE_DEFINITIONS = {
    active: {
        label: 'Active',
        permissionMode: 'full'
    },
    review_only: {
        label: 'Review-only',
        permissionMode: 'read_only'
    },
    suspended: {
        label: 'Suspended',
        permissionMode: 'blocked'
    }
};
const TEAM_SEAT_RECOVERY_ACTION_DEFINITIONS = {
    revoke_active_sessions: {
        label: 'Revoke Active Sessions',
        invalidatesSessions: true,
        clearsLockout: false
    },
    clear_signin_lockout: {
        label: 'Clear Sign-In Lockout',
        invalidatesSessions: false,
        clearsLockout: true
    },
    rotate_access_code: {
        label: 'Rotate Access Code',
        invalidatesSessions: true,
        clearsLockout: true
    },
    disable_sign_in: {
        label: 'Disable Shared Sign-In',
        invalidatesSessions: true,
        clearsLockout: true
    },
    suspend_seat: {
        label: 'Suspend Seat',
        invalidatesSessions: true,
        clearsLockout: true
    },
    restore_active: {
        label: 'Restore Active',
        invalidatesSessions: false,
        clearsLockout: false
    }
};
const APPROVAL_GATED_TEAM_SEAT_RECOVERY_ACTIONS = ['rotate_access_code', 'disable_sign_in', 'suspend_seat'];
const ADMIN_DELIVERY_TYPE_DEFINITIONS = {
    seat_invite: {
        label: 'Seat Invite'
    },
    seat_recovery: {
        label: 'Seat Recovery'
    }
};
const ADMIN_DELIVERY_CHANNELS = ['secure_chat', 'email', 'sms', 'phone', 'in_person', 'other'];
const SQLITE_STORE_KEYS = {
    companyProfiles: 'company_profiles',
    teamHandbacks: 'team_handbacks',
    teamRoster: 'team_roster',
    teamSeats: 'team_seats',
    auditLog: 'audit_log',
    adminActionApprovals: 'admin_action_approvals',
    adminDeliveryTrail: 'admin_delivery_trail'
};
let SQLITE_DB = null;

function asString(value) {
    return String(value || '').trim();
}

function asStringList(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(item => asString(item)).filter(Boolean))];
}

function asDate(value) {
    const cleaned = asString(value);
    if (!cleaned) return null;
    const parsed = new Date(cleaned);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function asPositiveInt(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(0, Math.round(numeric));
}

function formatDisplayPath(filePath) {
    const absolute = path.resolve(String(filePath || ''));
    if (!absolute) return '';
    const relative = path.relative(process.cwd(), absolute);
    if (relative && relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)) {
        return relative;
    }
    return absolute;
}

function hasConfiguredApiKeys() {
    return CONFIGURED_API_KEYS.length > 0;
}

function hasAllowedOrigins() {
    return ALLOWED_ORIGINS.length > 0;
}

function usesSqliteStorage() {
    return STORAGE_DRIVER === 'sqlite';
}

function getEntitlementSourceDefinition() {
    return ENTITLEMENT_SOURCE_DEFINITIONS[BACKEND_ENTITLEMENT_SOURCE] || ENTITLEMENT_SOURCE_DEFINITIONS.manual_admin;
}

function hasConfiguredText(value) {
    const text = String(value || '').trim();
    return !!text && !/^replace-with-/i.test(text);
}

function hasPositiveIntegerText(value) {
    return /^[1-9]\d*$/.test(String(value || '').trim());
}

function buildOperationalReadiness() {
    const checks = [
        {
            label: 'Durable storage driver',
            ok: STORAGE_DRIVER === 'sqlite',
            detail: STORAGE_DRIVER === 'sqlite' ? 'sqlite' : (STORAGE_DRIVER || 'missing')
        },
        {
            label: 'SQLite file path',
            ok: STORAGE_DRIVER !== 'sqlite' || hasConfiguredText(SQLITE_FILE),
            detail: STORAGE_DRIVER === 'sqlite' ? (SQLITE_FILE || 'missing') : 'not required for current storage driver'
        },
        {
            label: 'Persistent data directory',
            ok: hasConfiguredText(DATA_DIR) && DATA_DIR !== DEFAULT_DATA_DIR,
            detail: DATA_DIR === DEFAULT_DATA_DIR ? `${formatDisplayPath(DATA_DIR)} (default)` : formatDisplayPath(DATA_DIR)
        },
        {
            label: 'Backup root directory',
            ok: hasConfiguredText(BACKEND_BACKUP_ROOT_DIR),
            detail: BACKEND_BACKUP_ROOT_DIR || 'missing'
        },
        {
            label: 'Backup schedule cron',
            ok: hasConfiguredText(BACKEND_BACKUP_SCHEDULE_CRON),
            detail: BACKEND_BACKUP_SCHEDULE_CRON || 'missing'
        },
        {
            label: 'Backup keep-count',
            ok: hasPositiveIntegerText(BACKEND_BACKUP_KEEP_COUNT),
            detail: BACKEND_BACKUP_KEEP_COUNT || 'missing'
        },
        {
            label: 'Backup keep-days',
            ok: hasPositiveIntegerText(BACKEND_BACKUP_KEEP_DAYS),
            detail: BACKEND_BACKUP_KEEP_DAYS || 'missing'
        },
        {
            label: 'Backup owner',
            ok: hasConfiguredText(BACKEND_BACKUP_OWNER),
            detail: BACKEND_BACKUP_OWNER || 'missing'
        },
        {
            label: 'Backup review channel',
            ok: hasConfiguredText(BACKEND_BACKUP_REVIEW_CHANNEL),
            detail: BACKEND_BACKUP_REVIEW_CHANNEL || 'missing'
        },
        {
            label: 'Restore owner',
            ok: hasConfiguredText(BACKEND_RESTORE_OWNER),
            detail: BACKEND_RESTORE_OWNER || 'missing'
        },
        {
            label: 'Restore drill cadence',
            ok: hasConfiguredText(BACKEND_RESTORE_DRILL_CADENCE),
            detail: BACKEND_RESTORE_DRILL_CADENCE || 'missing'
        },
        {
            label: 'Audit retention days',
            ok: hasPositiveIntegerText(BACKEND_AUDIT_RETENTION_DAYS),
            detail: BACKEND_AUDIT_RETENTION_DAYS || 'missing'
        },
        {
            label: 'Delivery retention days',
            ok: hasPositiveIntegerText(BACKEND_DELIVERY_RETENTION_DAYS),
            detail: BACKEND_DELIVERY_RETENTION_DAYS || 'missing'
        },
        {
            label: 'Approval retention days',
            ok: hasPositiveIntegerText(BACKEND_APPROVAL_RETENTION_DAYS),
            detail: BACKEND_APPROVAL_RETENTION_DAYS || 'missing'
        },
        {
            label: 'Incident owner',
            ok: hasConfiguredText(BACKEND_INCIDENT_OWNER),
            detail: BACKEND_INCIDENT_OWNER || 'missing'
        },
        {
            label: 'Incident channel',
            ok: hasConfiguredText(BACKEND_INCIDENT_CHANNEL),
            detail: BACKEND_INCIDENT_CHANNEL || 'missing'
        },
        {
            label: 'Incident runbook',
            ok: hasConfiguredText(BACKEND_INCIDENT_RUNBOOK_URL),
            detail: BACKEND_INCIDENT_RUNBOOK_URL || 'missing'
        }
    ];

    const passed = checks.filter(item => item.ok).length;
    const score = Math.round((passed / checks.length) * 100);

    return {
        ready: passed === checks.length,
        score,
        checks,
        missing: checks.filter(item => !item.ok).map(item => item.label),
        policy: {
            backupRootDir: BACKEND_BACKUP_ROOT_DIR,
            backupScheduleCron: BACKEND_BACKUP_SCHEDULE_CRON,
            backupKeepCount: BACKEND_BACKUP_KEEP_COUNT,
            backupKeepDays: BACKEND_BACKUP_KEEP_DAYS,
            backupOwner: BACKEND_BACKUP_OWNER,
            backupReviewChannel: BACKEND_BACKUP_REVIEW_CHANNEL,
            restoreOwner: BACKEND_RESTORE_OWNER,
            restoreDrillCadence: BACKEND_RESTORE_DRILL_CADENCE,
            auditRetentionDays: BACKEND_AUDIT_RETENTION_DAYS,
            deliveryRetentionDays: BACKEND_DELIVERY_RETENTION_DAYS,
            approvalRetentionDays: BACKEND_APPROVAL_RETENTION_DAYS,
            incidentOwner: BACKEND_INCIDENT_OWNER,
            incidentChannel: BACKEND_INCIDENT_CHANNEL,
            incidentRunbookUrl: BACKEND_INCIDENT_RUNBOOK_URL
        }
    };
}

function matchesApiKey(candidate, expected) {
    const left = Buffer.from(String(candidate || ''), 'utf8');
    const right = Buffer.from(String(expected || ''), 'utf8');
    if (left.length !== right.length) return false;
    try {
        return crypto.timingSafeEqual(left, right);
    } catch (error) {
        return false;
    }
}

function hashSeatSessionToken(token) {
    return crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

function deriveSeatAccessCodeHash(accessCode, salt) {
    const normalizedCode = String(accessCode || '');
    const normalizedSalt = String(salt || '');
    if (!normalizedCode || !normalizedSalt) return '';
    return crypto.scryptSync(`${normalizedCode}${BACKEND_SEAT_CODE_PEPPER}`, normalizedSalt, 64).toString('hex');
}

function buildSeatSessionAuthFingerprint(seat) {
    const payload = [
        asString(seat?.id),
        asString(seat?.roleKey),
        asString(seat?.stateKey),
        asString(seat?.accessCodeHash || 'no_access_code')
    ].join('|');
    return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

function hashSeatRecoveryCode(code) {
    return crypto.createHash('sha256').update(`${String(code || '')}${BACKEND_RECOVERY_CODE_PEPPER}`, 'utf8').digest('hex');
}

function hashSeatInviteCode(code) {
    return crypto.createHash('sha256').update(`${String(code || '')}${BACKEND_RECOVERY_CODE_PEPPER}`, 'utf8').digest('hex');
}

function buildSignedActionLinkToken(kind, installationKey, targetSeatId, oneTimeCode, expiresAt) {
    const payloadPart = Buffer.from(JSON.stringify({
        version: 1,
        kind: asString(kind),
        installationKey: asString(installationKey),
        targetSeatId: asString(targetSeatId),
        oneTimeCode: asString(oneTimeCode),
        expiresAt: asDate(expiresAt)
    }), 'utf8').toString('base64url');
    const signature = crypto.createHmac('sha256', BACKEND_ACTION_LINK_SECRET).update(payloadPart, 'utf8').digest('base64url');
    return `${payloadPart}.${signature}`;
}

function buildFrontendActionLinkUrl(frontendAppUrl, hashKey, signedLinkToken) {
    const rawUrl = asString(frontendAppUrl);
    const rawToken = asString(signedLinkToken);
    if (!rawUrl || !hashKey || !rawToken) return '';
    try {
        const url = new URL(rawUrl, `http://${HOST}:${PORT}`);
        url.hash = `${hashKey}=${encodeURIComponent(rawToken)}`;
        return url.toString();
    } catch (error) {
        return '';
    }
}

function verifySignedActionLinkToken(token, expectedKind, installationKey) {
    const parts = asString(token).split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link is invalid or malformed.',
            payload: null
        };
    }

    const [payloadPart, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', BACKEND_ACTION_LINK_SECRET).update(payloadPart, 'utf8').digest('base64url');
    if (!matchesApiKey(signature, expectedSignature)) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link could not be verified.',
            payload: null
        };
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    } catch (error) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link payload is not readable.',
            payload: null
        };
    }

    const normalizedPayload = {
        version: Number(payload?.version || 0),
        kind: asString(payload?.kind),
        installationKey: asString(payload?.installationKey),
        targetSeatId: asString(payload?.targetSeatId),
        oneTimeCode: asString(payload?.oneTimeCode),
        expiresAt: asDate(payload?.expiresAt)
    };
    if (normalizedPayload.version !== 1 || normalizedPayload.kind !== asString(expectedKind)) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link is for a different action type.',
            payload: null
        };
    }
    if (normalizedPayload.installationKey !== asString(installationKey)) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link does not match this installation.',
            payload: null
        };
    }
    if (!normalizedPayload.targetSeatId || !normalizedPayload.oneTimeCode || !normalizedPayload.expiresAt) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link payload is incomplete.',
            payload: null
        };
    }
    if (new Date(normalizedPayload.expiresAt).getTime() <= Date.now()) {
        return {
            ok: false,
            status: 401,
            error: 'Signed action link has expired.',
            payload: null
        };
    }

    return {
        ok: true,
        status: 200,
        error: '',
        payload: normalizedPayload
    };
}

function getSeatSignInThrottleKey(req, installationKey, actorSeatId) {
    const remoteAddress = asString(req?.socket?.remoteAddress || req?.headers?.['x-forwarded-for'] || 'unknown_client');
    return `${asString(installationKey)}::${asString(actorSeatId)}::${remoteAddress}`;
}

function cleanupExpiredSeatRecoveryCodes() {
    const now = Date.now();
    for (const [recoveryHash, record] of ACTIVE_SEAT_RECOVERY_CODES.entries()) {
        if (!record || record.expiresAtMs <= now) {
            ACTIVE_SEAT_RECOVERY_CODES.delete(recoveryHash);
        }
    }
}

function cleanupExpiredSeatInvites() {
    const now = Date.now();
    for (const [inviteHash, record] of ACTIVE_SEAT_INVITES.entries()) {
        if (!record || record.expiresAtMs <= now) {
            ACTIVE_SEAT_INVITES.delete(inviteHash);
        }
    }
}

function cleanupSeatSignInThrottle() {
    const now = Date.now();
    for (const [key, record] of FAILED_SEAT_SIGNINS.entries()) {
        if (!record) {
            FAILED_SEAT_SIGNINS.delete(key);
            continue;
        }
        if (record.lockUntilMs && record.lockUntilMs > now) continue;
        if (!record.lastAttemptMs || now - record.lastAttemptMs > SEAT_SIGNIN_WINDOW_MS) {
            FAILED_SEAT_SIGNINS.delete(key);
        }
    }
}

function getSeatSignInThrottleState(key) {
    cleanupSeatSignInThrottle();
    const record = FAILED_SEAT_SIGNINS.get(key);
    if (!record) {
        return {
            attempts: 0,
            remaining: MAX_SEAT_SIGNIN_ATTEMPTS,
            locked: false,
            retryAfterSeconds: 0
        };
    }
    const now = Date.now();
    const locked = !!record.lockUntilMs && record.lockUntilMs > now;
    return {
        attempts: record.attempts || 0,
        remaining: Math.max(0, MAX_SEAT_SIGNIN_ATTEMPTS - (record.attempts || 0)),
        locked,
        retryAfterSeconds: locked ? Math.max(1, Math.ceil((record.lockUntilMs - now) / 1000)) : 0
    };
}

function recordFailedSeatSignIn(key) {
    cleanupSeatSignInThrottle();
    const now = Date.now();
    const current = FAILED_SEAT_SIGNINS.get(key);
    const withinWindow = current && current.lastAttemptMs && (now - current.lastAttemptMs) <= SEAT_SIGNIN_WINDOW_MS;
    const attempts = withinWindow ? (current.attempts || 0) + 1 : 1;
    const lockUntilMs = attempts >= MAX_SEAT_SIGNIN_ATTEMPTS ? now + SEAT_SIGNIN_LOCKOUT_MS : 0;
    const nextRecord = {
        attempts,
        firstAttemptMs: withinWindow ? current.firstAttemptMs : now,
        lastAttemptMs: now,
        lockUntilMs
    };
    FAILED_SEAT_SIGNINS.set(key, nextRecord);
    return {
        attempts,
        remaining: Math.max(0, MAX_SEAT_SIGNIN_ATTEMPTS - attempts),
        locked: !!lockUntilMs,
        retryAfterSeconds: lockUntilMs ? Math.max(1, Math.ceil((lockUntilMs - now) / 1000)) : 0
    };
}

function clearSeatSignInThrottle(key) {
    FAILED_SEAT_SIGNINS.delete(key);
}

function verifySeatAccessCode(seat, accessCode) {
    const expectedHash = asString(seat?.accessCodeHash);
    const salt = asString(seat?.accessCodeSalt);
    const candidate = String(accessCode || '');
    if (!expectedHash || !salt || !candidate) return false;
    const derived = deriveSeatAccessCodeHash(candidate, salt);
    if (!derived) return false;
    const left = Buffer.from(derived, 'utf8');
    const right = Buffer.from(expectedHash, 'utf8');
    if (left.length !== right.length) return false;
    try {
        return crypto.timingSafeEqual(left, right);
    } catch (error) {
        return false;
    }
}

function readJsonFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        return null;
    }
}

function writeJsonFile(filePath, payload) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function parseStoredJsonText(text, fallback) {
    try {
        return JSON.parse(String(text || ''));
    } catch (error) {
        return fallback;
    }
}

function getSqliteDatabase() {
    if (!usesSqliteStorage()) return null;
    if (SQLITE_DB) return SQLITE_DB;

    let DatabaseSync;
    try {
        ({ DatabaseSync } = require('node:sqlite'));
    } catch (error) {
        throw new Error('BACKEND_STORAGE_DRIVER=sqlite requires Node built-in SQLite support. Use Node 22.5+ and, on Node 22.12 or similar, start with --experimental-sqlite.');
    }

    fs.mkdirSync(path.dirname(SQLITE_FILE), { recursive: true });
    SQLITE_DB = new DatabaseSync(SQLITE_FILE);
    SQLITE_DB.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        CREATE TABLE IF NOT EXISTS backend_metadata (
            key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL
        ) STRICT;
        CREATE TABLE IF NOT EXISTS licenses (
            installation_key TEXT PRIMARY KEY,
            payload_json TEXT NOT NULL
        ) STRICT;
        CREATE TABLE IF NOT EXISTS scoped_documents (
            store_key TEXT NOT NULL,
            scope_key TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            PRIMARY KEY (store_key, scope_key)
        ) STRICT;
    `);
    return SQLITE_DB;
}

function runSqliteTransaction(work) {
    const db = getSqliteDatabase();
    db.exec('BEGIN IMMEDIATE');
    try {
        const result = work(db);
        db.exec('COMMIT');
        return result;
    } catch (error) {
        try {
            db.exec('ROLLBACK');
        } catch (rollbackError) {
            // Ignore rollback errors and surface the primary failure.
        }
        throw error;
    }
}

function readSqliteMetadataJson(key, fallback = null) {
    const db = getSqliteDatabase();
    const row = db.prepare('SELECT value_json FROM backend_metadata WHERE key = ?').get(String(key || ''));
    if (!row || typeof row.value_json !== 'string') return fallback;
    return parseStoredJsonText(row.value_json, fallback);
}

function writeSqliteMetadataJson(key, value) {
    const db = getSqliteDatabase();
    db.prepare(`
        INSERT INTO backend_metadata (key, value_json)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
    `).run(String(key || ''), JSON.stringify(value ?? null));
}

function countSqliteLicenses() {
    const db = getSqliteDatabase();
    const row = db.prepare('SELECT COUNT(*) AS count FROM licenses').get();
    return Number(row?.count || 0);
}

function saveSqliteLicenseRecords(records, backendLabel) {
    runSqliteTransaction(db => {
        db.prepare('DELETE FROM licenses').run();
        const insert = db.prepare('INSERT INTO licenses (installation_key, payload_json) VALUES (?, ?)');
        for (const record of Array.isArray(records) ? records : []) {
            if (!record || !record.installationKey) continue;
            insert.run(record.installationKey, JSON.stringify(record));
        }
        writeSqliteMetadataJson('backendLabel', backendLabel || 'PV Premium Sync Reference Server');
    });
}

function ensureSqliteLicenseSeeded() {
    if (countSqliteLicenses() > 0) return;
    const raw = readJsonFile(EXAMPLE_DATA_FILE);
    const records = Array.isArray(raw?.licenses)
        ? raw.licenses.map(normalizeLicenseRecord).filter(Boolean)
        : [];
    saveSqliteLicenseRecords(records, asString(raw?.backendLabel) || 'PV Premium Sync Reference Server');
}

function loadSqliteLicenseStore() {
    ensureSqliteLicenseSeeded();
    const db = getSqliteDatabase();
    const rows = db.prepare('SELECT payload_json FROM licenses ORDER BY installation_key').all();
    const records = rows
        .map(row => normalizeLicenseRecord(parseStoredJsonText(row?.payload_json, null)))
        .filter(Boolean);
    return {
        sourceFile: SQLITE_FILE,
        backendLabel: asString(readSqliteMetadataJson('backendLabel', 'PV Premium Sync Reference Server')) || 'PV Premium Sync Reference Server',
        licenses: records
    };
}

function countSqliteScopedDocuments(storeKey) {
    const db = getSqliteDatabase();
    const row = db.prepare('SELECT COUNT(*) AS count FROM scoped_documents WHERE store_key = ?').get(String(storeKey || ''));
    return Number(row?.count || 0);
}

function saveSqliteScopedStore(storeKey, scopes) {
    runSqliteTransaction(db => {
        db.prepare('DELETE FROM scoped_documents WHERE store_key = ?').run(String(storeKey || ''));
        const insert = db.prepare('INSERT INTO scoped_documents (store_key, scope_key, payload_json) VALUES (?, ?, ?)');
        for (const [scopeKey, payload] of Object.entries(scopes || {})) {
            insert.run(String(storeKey || ''), String(scopeKey || ''), JSON.stringify(payload ?? null));
        }
    });
}

function ensureSqliteScopedStoreSeeded(storeKey, exampleFile) {
    if (countSqliteScopedDocuments(storeKey) > 0) return;
    const raw = readJsonFile(exampleFile);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    saveSqliteScopedStore(storeKey, scopes);
}

function loadSqliteScopedStore(storeKey, exampleFile) {
    ensureSqliteScopedStoreSeeded(storeKey, exampleFile);
    const db = getSqliteDatabase();
    const rows = db.prepare(`
        SELECT scope_key, payload_json
        FROM scoped_documents
        WHERE store_key = ?
        ORDER BY scope_key
    `).all(String(storeKey || ''));
    const scopes = {};
    for (const row of rows) {
        scopes[String(row.scope_key || '')] = parseStoredJsonText(row.payload_json, null);
    }
    return {
        sourceFile: SQLITE_FILE,
        writeFile: SQLITE_FILE,
        scopes
    };
}

function normalizeLicenseRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const installationKey = asString(record.installationKey);
    if (!installationKey) return null;

    return {
        installationKey,
        label: asString(record.label) || installationKey,
        planKey: asString(record.planKey) || 'community',
        grantedCapabilities: asStringList(record.grantedCapabilities),
        status: asString(record.status).toLowerCase() || 'active',
        expiresAt: asDate(record.expiresAt),
        issuedAt: asDate(record.issuedAt),
        offlineGraceDays: asPositiveInt(record.offlineGraceDays, 14),
        note: asString(record.note)
    };
}

function normalizeCompanyProfileRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const label = asString(record.label || record.companyName || 'Company Profile');
    if (!label) return null;

    return {
        id: asString(record.id) || `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        label,
        companyName: asString(record.companyName),
        contactName: asString(record.contactName),
        contactPhone: asString(record.contactPhone),
        contactEmail: asString(record.contactEmail),
        brandAccent: asString(record.brandAccent) || '#2563eb',
        issuerTagline: asString(record.issuerTagline),
        footerNote: asString(record.footerNote),
        brandLogoName: asString(record.brandLogoName),
        brandLogoDataUrl: asString(record.brandLogoDataUrl),
        updatedAt: asDate(record.updatedAt) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function normalizeTeamHandbackRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const projectKey = asString(record.projectKey);
    if (!projectKey) return null;

    return {
        projectKey,
        projectName: asString(record.projectName) || projectKey,
        stageKey: asString(record.stageKey) || 'drafting',
        stageLabel: asString(record.stageLabel) || 'Drafting',
        owner: asString(record.owner),
        reviewDesk: asString(record.reviewDesk),
        handbackTarget: asString(record.handbackTarget),
        dueDate: asString(record.dueDate),
        notes: asString(record.notes),
        locationName: asString(record.locationName),
        audienceMode: asString(record.audienceMode),
        systemType: asString(record.systemType),
        businessProfileLabel: asString(record.businessProfileLabel),
        applianceCount: Number.isFinite(Number(record.applianceCount)) ? Number(record.applianceCount) : 0,
        companyName: asString(record.companyName),
        clientName: asString(record.clientName),
        siteName: asString(record.siteName),
        updatedAt: asDate(record.updatedAt) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function normalizeTeamRosterAdminRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    return {
        coordinator: asString(record.coordinator),
        contact: asString(record.contact),
        updatedAt: asDate(record.updatedAt) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function normalizeTeamRosterEntryRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const label = asString(record.label);
    if (!label) return null;

    return {
        id: asString(record.id) || `team_roster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        label,
        roleKey: asString(record.roleKey) || 'sales_desk',
        roleLabel: asString(record.roleLabel) || 'Sales Desk',
        roleHint: asString(record.roleHint),
        contact: asString(record.contact),
        updatedAt: asDate(record.updatedAt) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function getTeamSeatRoleDefinition(roleKey) {
    return TEAM_SEAT_ROLE_DEFINITIONS[asString(roleKey)] || TEAM_SEAT_ROLE_DEFINITIONS.sales_desk;
}

function getTeamSeatStateDefinition(stateKey) {
    return TEAM_SEAT_STATE_DEFINITIONS[asString(stateKey)] || TEAM_SEAT_STATE_DEFINITIONS.active;
}

function getTeamSeatRecoveryActionDefinition(actionKey) {
    return TEAM_SEAT_RECOVERY_ACTION_DEFINITIONS[asString(actionKey)] || null;
}

function buildTeamSeatPermissions(seat) {
    const roleDefinition = getTeamSeatRoleDefinition(seat?.roleKey);
    const stateDefinition = getTeamSeatStateDefinition(seat?.stateKey);
    const rolePermissions = Array.isArray(roleDefinition.permissions) ? [...roleDefinition.permissions] : [];
    if (stateDefinition.permissionMode === 'blocked') return [];
    if (stateDefinition.permissionMode === 'read_only') {
        return rolePermissions.filter(permission => TEAM_SEAT_READONLY_PERMISSIONS.includes(permission));
    }
    return rolePermissions;
}

function normalizeTeamSeatRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const label = asString(record.label || record.name);
    if (!label) return null;

    const roleKey = asString(record.roleKey) || 'sales_desk';
    const stateKey = asString(record.stateKey) || 'active';
    const roleDefinition = getTeamSeatRoleDefinition(roleKey);
    const stateDefinition = getTeamSeatStateDefinition(stateKey);

    return {
        id: asString(record.id) || `team_seat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        label,
        roleKey: TEAM_SEAT_ROLE_DEFINITIONS[roleKey] ? roleKey : 'sales_desk',
        roleLabel: roleDefinition.label,
        stateKey: TEAM_SEAT_STATE_DEFINITIONS[stateKey] ? stateKey : 'active',
        stateLabel: stateDefinition.label,
        contact: asString(record.contact),
        accessCodeHint: asString(record.accessCodeHint),
        accessCodeSalt: asString(record.accessCodeSalt),
        accessCodeHash: asString(record.accessCodeHash),
        authEnabled: !!(asString(record.accessCodeSalt) && asString(record.accessCodeHash)),
        updatedAt: asDate(record.updatedAt) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function toPublicTeamSeatRecord(seat) {
    const normalized = normalizeTeamSeatRecord(seat);
    if (!normalized) return null;
    return {
        id: normalized.id,
        label: normalized.label,
        roleKey: normalized.roleKey,
        roleLabel: normalized.roleLabel,
        stateKey: normalized.stateKey,
        stateLabel: normalized.stateLabel,
        contact: normalized.contact,
        accessCodeHint: normalized.accessCodeHint,
        authEnabled: !!normalized.authEnabled,
        updatedAt: normalized.updatedAt,
        source: normalized.source
    };
}

function normalizeAuditEvent(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const installationKey = asString(record.installationKey);
    const category = asString(record.category);
    const action = asString(record.action);
    if (!installationKey || !category || !action) return null;

    return {
        id: asString(record.id) || `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        installationKey,
        category,
        action,
        targetLabel: asString(record.targetLabel),
        actorLabel: asString(record.actorLabel),
        deviceLabel: asString(record.deviceLabel),
        note: asString(record.note),
        timestamp: asDate(record.timestamp) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function normalizeAdminActionApprovalRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const installationKey = asString(record.installationKey);
    const actionType = asString(record.actionType);
    const targetSeatId = asString(record.targetSeatId);
    const recoveryAction = asString(record.recoveryAction);
    if (!installationKey || !actionType || !targetSeatId) return null;
    if (actionType === 'team_seat_recovery' && !getTeamSeatRecoveryActionDefinition(recoveryAction)) {
        return null;
    }

    return {
        id: asString(record.id) || `approval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        installationKey,
        actionType,
        recoveryAction,
        targetSeatId,
        targetLabel: asString(record.targetLabel),
        targetRoleKey: asString(record.targetRoleKey),
        requestedBySeatId: asString(record.requestedBySeatId),
        requestedByLabel: asString(record.requestedByLabel),
        requestedAt: asDate(record.requestedAt) || new Date().toISOString(),
        requestNote: asString(record.requestNote),
        status: asString(record.status) || 'pending',
        reviewedBySeatId: asString(record.reviewedBySeatId),
        reviewedByLabel: asString(record.reviewedByLabel),
        reviewedAt: asDate(record.reviewedAt),
        reviewNote: asString(record.reviewNote),
        consumedBySeatId: asString(record.consumedBySeatId),
        consumedByLabel: asString(record.consumedByLabel),
        consumedAt: asDate(record.consumedAt),
        expiresAt: asDate(record.expiresAt) || new Date(Date.now() + ADMIN_ACTION_APPROVAL_TTL_MS).toISOString(),
        source: 'server_sync'
    };
}

function getAdminActionApprovalStatusLabel(status) {
    return {
        pending: 'Pending review',
        approved: 'Approved',
        rejected: 'Rejected',
        consumed: 'Consumed',
        expired: 'Expired'
    }[asString(status)] || 'Pending review';
}

function toPublicAdminActionApprovalRecord(record) {
    const normalized = normalizeAdminActionApprovalRecord(record);
    if (!normalized) return null;
    const recoveryActionDefinition = normalized.actionType === 'team_seat_recovery'
        ? getTeamSeatRecoveryActionDefinition(normalized.recoveryAction)
        : null;
    return {
        id: normalized.id,
        actionType: normalized.actionType,
        recoveryAction: normalized.recoveryAction,
        recoveryActionLabel: recoveryActionDefinition?.label || normalized.recoveryAction,
        targetSeatId: normalized.targetSeatId,
        targetLabel: normalized.targetLabel,
        targetRoleKey: normalized.targetRoleKey,
        requestedBySeatId: normalized.requestedBySeatId,
        requestedByLabel: normalized.requestedByLabel,
        requestedAt: normalized.requestedAt,
        requestNote: normalized.requestNote,
        status: normalized.status,
        statusLabel: getAdminActionApprovalStatusLabel(normalized.status),
        reviewedBySeatId: normalized.reviewedBySeatId,
        reviewedByLabel: normalized.reviewedByLabel,
        reviewedAt: normalized.reviewedAt,
        reviewNote: normalized.reviewNote,
        consumedBySeatId: normalized.consumedBySeatId,
        consumedByLabel: normalized.consumedByLabel,
        consumedAt: normalized.consumedAt,
        expiresAt: normalized.expiresAt,
        source: normalized.source
    };
}

function getAdminDeliveryTypeDefinition(deliveryType) {
    return ADMIN_DELIVERY_TYPE_DEFINITIONS[asString(deliveryType)] || null;
}

function normalizeAdminDeliveryRecord(raw) {
    const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const installationKey = asString(record.installationKey);
    const deliveryType = asString(record.deliveryType);
    const targetSeatId = asString(record.targetSeatId);
    const deliveryChannel = asString(record.deliveryChannel);
    if (!installationKey || !getAdminDeliveryTypeDefinition(deliveryType) || !targetSeatId || !deliveryChannel) {
        return null;
    }

    return {
        id: asString(record.id) || `delivery_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        installationKey,
        deliveryType,
        targetSeatId,
        targetLabel: asString(record.targetLabel),
        deliveryChannel,
        recipient: asString(record.recipient),
        artifactMode: asString(record.artifactMode) || 'signed_link',
        deliveryRefId: asString(record.deliveryRefId),
        actorSeatId: asString(record.actorSeatId),
        actorLabel: asString(record.actorLabel),
        note: asString(record.note),
        acknowledgmentStatus: ['acknowledged', 'pending'].includes(asString(record.acknowledgmentStatus))
            ? asString(record.acknowledgmentStatus)
            : 'pending',
        acknowledgedAt: asDate(record.acknowledgedAt),
        acknowledgedBySeatId: asString(record.acknowledgedBySeatId),
        acknowledgedByLabel: asString(record.acknowledgedByLabel),
        acknowledgmentNote: asString(record.acknowledgmentNote),
        deliveredAt: asDate(record.deliveredAt) || new Date().toISOString(),
        source: 'server_sync'
    };
}

function getAdminDeliveryAcknowledgmentStatusLabel(status) {
    return {
        pending: 'Pending acknowledgment',
        acknowledged: 'Acknowledged'
    }[asString(status)] || 'Pending acknowledgment';
}

function toPublicAdminDeliveryRecord(record) {
    const normalized = normalizeAdminDeliveryRecord(record);
    if (!normalized) return null;
    return {
        id: normalized.id,
        deliveryType: normalized.deliveryType,
        deliveryTypeLabel: getAdminDeliveryTypeDefinition(normalized.deliveryType)?.label || normalized.deliveryType,
        targetSeatId: normalized.targetSeatId,
        targetLabel: normalized.targetLabel,
        deliveryChannel: normalized.deliveryChannel,
        recipient: normalized.recipient,
        artifactMode: normalized.artifactMode,
        deliveryRefId: normalized.deliveryRefId,
        actorSeatId: normalized.actorSeatId,
        actorLabel: normalized.actorLabel,
        note: normalized.note,
        acknowledgmentStatus: normalized.acknowledgmentStatus,
        acknowledgmentStatusLabel: getAdminDeliveryAcknowledgmentStatusLabel(normalized.acknowledgmentStatus),
        acknowledgedAt: normalized.acknowledgedAt,
        acknowledgedBySeatId: normalized.acknowledgedBySeatId,
        acknowledgedByLabel: normalized.acknowledgedByLabel,
        acknowledgmentNote: normalized.acknowledgmentNote,
        deliveredAt: normalized.deliveredAt,
        source: normalized.source
    };
}

function loadLicenseStore() {
    if (usesSqliteStorage()) {
        return loadSqliteLicenseStore();
    }
    const preferredPath = fs.existsSync(PRIMARY_DATA_FILE) ? PRIMARY_DATA_FILE : EXAMPLE_DATA_FILE;
    const raw = readJsonFile(preferredPath);
    const records = Array.isArray(raw?.licenses)
        ? raw.licenses.map(normalizeLicenseRecord).filter(Boolean)
        : [];

    return {
        sourceFile: preferredPath,
        backendLabel: asString(raw?.backendLabel) || 'PV Premium Sync Reference Server',
        licenses: records
    };
}

function loadCompanyProfileStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.companyProfiles, EXAMPLE_PROFILES_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, profiles]) => [
                scopeKey,
                Array.isArray(profiles)
                    ? profiles.map(normalizeCompanyProfileRecord).filter(Boolean)
                    : []
            ])
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_PROFILES_FILE) ? PRIMARY_PROFILES_FILE : EXAMPLE_PROFILES_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, profiles]) => [
            scopeKey,
            Array.isArray(profiles)
                ? profiles.map(normalizeCompanyProfileRecord).filter(Boolean)
                : []
        ])
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_PROFILES_FILE,
        scopes: normalizedScopes
    };
}

function loadTeamHandbackStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.teamHandbacks, EXAMPLE_TEAM_HANDBACKS_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, handbacks]) => [
                scopeKey,
                Array.isArray(handbacks)
                    ? handbacks.map(normalizeTeamHandbackRecord).filter(Boolean)
                    : []
            ])
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_TEAM_HANDBACKS_FILE) ? PRIMARY_TEAM_HANDBACKS_FILE : EXAMPLE_TEAM_HANDBACKS_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, handbacks]) => [
            scopeKey,
            Array.isArray(handbacks)
                ? handbacks.map(normalizeTeamHandbackRecord).filter(Boolean)
                : []
        ])
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_TEAM_HANDBACKS_FILE,
        scopes: normalizedScopes
    };
}

function loadTeamRosterStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.teamRoster, EXAMPLE_TEAM_ROSTER_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, value]) => {
                const scopedValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
                return [
                    scopeKey,
                    {
                        admin: normalizeTeamRosterAdminRecord(scopedValue.admin),
                        roster: Array.isArray(scopedValue.roster)
                            ? scopedValue.roster.map(normalizeTeamRosterEntryRecord).filter(Boolean)
                            : []
                    }
                ];
            })
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_TEAM_ROSTER_FILE) ? PRIMARY_TEAM_ROSTER_FILE : EXAMPLE_TEAM_ROSTER_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, value]) => {
            const scopedValue = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            return [
                scopeKey,
                {
                    admin: normalizeTeamRosterAdminRecord(scopedValue.admin),
                    roster: Array.isArray(scopedValue.roster)
                        ? scopedValue.roster.map(normalizeTeamRosterEntryRecord).filter(Boolean)
                        : []
                }
            ];
        })
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_TEAM_ROSTER_FILE,
        scopes: normalizedScopes
    };
}

function loadTeamSeatStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.teamSeats, EXAMPLE_TEAM_SEATS_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, seats]) => [
                scopeKey,
                Array.isArray(seats)
                    ? seats.map(normalizeTeamSeatRecord).filter(Boolean)
                    : []
            ])
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_TEAM_SEATS_FILE) ? PRIMARY_TEAM_SEATS_FILE : EXAMPLE_TEAM_SEATS_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, seats]) => [
            scopeKey,
            Array.isArray(seats)
                ? seats.map(normalizeTeamSeatRecord).filter(Boolean)
                : []
        ])
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_TEAM_SEATS_FILE,
        scopes: normalizedScopes
    };
}

function loadAuditLogStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.auditLog, EXAMPLE_AUDIT_LOG_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, entries]) => [
                scopeKey,
                Array.isArray(entries)
                    ? entries.map(normalizeAuditEvent).filter(Boolean)
                    : []
            ])
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_AUDIT_LOG_FILE) ? PRIMARY_AUDIT_LOG_FILE : EXAMPLE_AUDIT_LOG_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, entries]) => [
            scopeKey,
            Array.isArray(entries)
                ? entries.map(normalizeAuditEvent).filter(Boolean)
                : []
        ])
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_AUDIT_LOG_FILE,
        scopes: normalizedScopes
    };
}

function loadAdminActionApprovalStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.adminActionApprovals, EXAMPLE_ADMIN_ACTION_APPROVALS_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, approvals]) => [
                scopeKey,
                Array.isArray(approvals)
                    ? approvals.map(normalizeAdminActionApprovalRecord).filter(Boolean)
                    : []
            ])
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_ADMIN_ACTION_APPROVALS_FILE)
        ? PRIMARY_ADMIN_ACTION_APPROVALS_FILE
        : EXAMPLE_ADMIN_ACTION_APPROVALS_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, approvals]) => [
            scopeKey,
            Array.isArray(approvals)
                ? approvals.map(normalizeAdminActionApprovalRecord).filter(Boolean)
                : []
        ])
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_ADMIN_ACTION_APPROVALS_FILE,
        scopes: normalizedScopes
    };
}

function loadAdminDeliveryTrailStore() {
    if (usesSqliteStorage()) {
        const sqliteStore = loadSqliteScopedStore(SQLITE_STORE_KEYS.adminDeliveryTrail, EXAMPLE_ADMIN_DELIVERY_TRAIL_FILE);
        const scopes = sqliteStore.scopes || {};
        const normalizedScopes = Object.fromEntries(
            Object.entries(scopes).map(([scopeKey, entries]) => [
                scopeKey,
                Array.isArray(entries)
                    ? entries.map(normalizeAdminDeliveryRecord).filter(Boolean)
                    : []
            ])
        );

        return {
            sourceFile: sqliteStore.sourceFile,
            writeFile: sqliteStore.writeFile,
            scopes: normalizedScopes
        };
    }
    const preferredPath = fs.existsSync(PRIMARY_ADMIN_DELIVERY_TRAIL_FILE)
        ? PRIMARY_ADMIN_DELIVERY_TRAIL_FILE
        : EXAMPLE_ADMIN_DELIVERY_TRAIL_FILE;
    const raw = readJsonFile(preferredPath);
    const scopes = raw && typeof raw.scopes === 'object' && !Array.isArray(raw.scopes)
        ? raw.scopes
        : {};
    const normalizedScopes = Object.fromEntries(
        Object.entries(scopes).map(([scopeKey, entries]) => [
            scopeKey,
            Array.isArray(entries)
                ? entries.map(normalizeAdminDeliveryRecord).filter(Boolean)
                : []
        ])
    );

    return {
        sourceFile: preferredPath,
        writeFile: PRIMARY_ADMIN_DELIVERY_TRAIL_FILE,
        scopes: normalizedScopes
    };
}

function saveCompanyProfileStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.companyProfiles, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_PROFILES_FILE, {
        scopes: store.scopes || {}
    });
}

function saveTeamHandbackStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.teamHandbacks, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_TEAM_HANDBACKS_FILE, {
        scopes: store.scopes || {}
    });
}

function saveTeamRosterStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.teamRoster, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_TEAM_ROSTER_FILE, {
        scopes: store.scopes || {}
    });
}

function saveTeamSeatStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.teamSeats, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_TEAM_SEATS_FILE, {
        scopes: store.scopes || {}
    });
}

function saveAuditLogStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.auditLog, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_AUDIT_LOG_FILE, {
        scopes: store.scopes || {}
    });
}

function saveAdminActionApprovalStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.adminActionApprovals, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_ADMIN_ACTION_APPROVALS_FILE, {
        scopes: store.scopes || {}
    });
}

function saveAdminDeliveryTrailStore(store) {
    if (usesSqliteStorage()) {
        saveSqliteScopedStore(SQLITE_STORE_KEYS.adminDeliveryTrail, store.scopes || {});
        return;
    }
    writeJsonFile(store.writeFile || PRIMARY_ADMIN_DELIVERY_TRAIL_FILE, {
        scopes: store.scopes || {}
    });
}

function appendAuditEvent(store, rawEvent) {
    const event = normalizeAuditEvent(rawEvent);
    if (!event) return null;

    const scoped = Array.isArray(store.scopes[event.installationKey]) ? [...store.scopes[event.installationKey]] : [];
    scoped.unshift(event);
    store.scopes[event.installationKey] = scoped.slice(0, MAX_AUDIT_EVENTS_PER_INSTALLATION);
    saveAuditLogStore(store);
    return event;
}

function getScopedTeamSeats(store, installationKey) {
    return Array.isArray(store?.scopes?.[installationKey]) ? store.scopes[installationKey] : [];
}

function getScopedAdminActionApprovals(store, installationKey) {
    return Array.isArray(store?.scopes?.[installationKey]) ? store.scopes[installationKey] : [];
}

function getScopedAdminDeliveryTrail(store, installationKey) {
    return Array.isArray(store?.scopes?.[installationKey]) ? store.scopes[installationKey] : [];
}

function getEffectiveAdminActionApprovalStatus(record, nowMs = Date.now()) {
    const explicit = asString(record?.status);
    if (['rejected', 'consumed', 'expired'].includes(explicit)) return explicit;
    const expiresAtMs = Date.parse(asString(record?.expiresAt));
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= nowMs) return 'expired';
    if (explicit === 'approved') return 'approved';
    return 'pending';
}

function refreshAdminActionApprovalsScope(store, installationKey) {
    const scoped = [...getScopedAdminActionApprovals(store, installationKey)];
    let changed = false;
    const refreshed = scoped.map(record => {
        const nextStatus = getEffectiveAdminActionApprovalStatus(record);
        if (nextStatus !== asString(record?.status)) {
            changed = true;
            return {
                ...record,
                status: nextStatus
            };
        }
        return record;
    });
    if (changed) {
        store.scopes[installationKey] = refreshed;
        saveAdminActionApprovalStore(store);
    }
    return refreshed;
}

function buildAdminActionApprovalMatch(record, criteria = {}) {
    if (!record) return false;
    if (criteria.actionType && asString(record.actionType) !== asString(criteria.actionType)) return false;
    if (criteria.recoveryAction && asString(record.recoveryAction) !== asString(criteria.recoveryAction)) return false;
    if (criteria.targetSeatId && asString(record.targetSeatId) !== asString(criteria.targetSeatId)) return false;
    return true;
}

function findMatchingApprovedAdminActionApproval(store, installationKey, criteria = {}) {
    const scoped = refreshAdminActionApprovalsScope(store, installationKey);
    return [...scoped]
        .filter(record => getEffectiveAdminActionApprovalStatus(record) === 'approved' && buildAdminActionApprovalMatch(record, criteria))
        .sort((left, right) => Date.parse(asString(right.reviewedAt || right.requestedAt)) - Date.parse(asString(left.reviewedAt || left.requestedAt)))[0] || null;
}

function listMatchingOpenAdminActionApprovals(store, installationKey, criteria = {}) {
    const scoped = refreshAdminActionApprovalsScope(store, installationKey);
    return scoped
        .filter(record => ['pending', 'approved'].includes(getEffectiveAdminActionApprovalStatus(record)) && buildAdminActionApprovalMatch(record, criteria))
        .sort((left, right) => Date.parse(asString(right.requestedAt)) - Date.parse(asString(left.requestedAt)))
        .map(toPublicAdminActionApprovalRecord)
        .filter(Boolean);
}

function consumeAdminActionApproval(store, installationKey, approvalId, actorSeat) {
    const approvals = [...refreshAdminActionApprovalsScope(store, installationKey)];
    const approvalIndex = approvals.findIndex(record => record.id === asString(approvalId));
    if (approvalIndex < 0) return null;
    const approval = approvals[approvalIndex];
    const nextRecord = {
        ...approval,
        status: 'consumed',
        consumedBySeatId: asString(actorSeat?.id),
        consumedByLabel: asString(actorSeat?.label),
        consumedAt: new Date().toISOString()
    };
    approvals[approvalIndex] = nextRecord;
    store.scopes[installationKey] = approvals;
    saveAdminActionApprovalStore(store);
    return nextRecord;
}

function filterAdminDeliveryTrail(records, filters = {}) {
    const deliveryType = asString(filters.deliveryType).toLowerCase();
    const deliveryChannel = asString(filters.deliveryChannel).toLowerCase();
    const acknowledgmentStatus = asString(filters.acknowledgmentStatus).toLowerCase();
    return (Array.isArray(records) ? records : []).filter(record => {
        if (deliveryType && asString(record?.deliveryType).toLowerCase() !== deliveryType) return false;
        if (deliveryChannel && asString(record?.deliveryChannel).toLowerCase() !== deliveryChannel) return false;
        if (acknowledgmentStatus && asString(record?.acknowledgmentStatus).toLowerCase() !== acknowledgmentStatus) return false;
        return true;
    });
}

function authorizeSeatAction(store, installationKey, actorSeatId, requiredPermission) {
    const seats = getScopedTeamSeats(store, installationKey);
    if (!seats.length) {
        return {
            ok: true,
            bootstrapAllowed: true,
            actorSeat: null
        };
    }

    const resolvedActorSeatId = asString(actorSeatId);
    if (!resolvedActorSeatId) {
        return {
            ok: false,
            status: 403,
            error: 'actorSeatId is required once shared team seats exist for this installation.',
            bootstrapAllowed: false,
            actorSeat: null
        };
    }

    const actorSeat = seats.find(seat => seat.id === resolvedActorSeatId);
    if (!actorSeat) {
        return {
            ok: false,
            status: 403,
            error: `No shared team seat matches actorSeatId "${resolvedActorSeatId}".`,
            bootstrapAllowed: false,
            actorSeat: null
        };
    }

    const permissions = buildTeamSeatPermissions(actorSeat);
    if (!permissions.includes(requiredPermission)) {
        return {
            ok: false,
            status: 403,
            error: `${actorSeat.label} is ${actorSeat.stateLabel || actorSeat.stateKey || 'restricted'} and does not hold ${requiredPermission} permission.`,
            bootstrapAllowed: false,
            actorSeat
        };
    }

    return {
        ok: true,
        status: 200,
        error: '',
        bootstrapAllowed: false,
        actorSeat
    };
}

function cleanupExpiredSeatSessions() {
    const now = Date.now();
    for (const [sessionHash, record] of ACTIVE_SEAT_SESSIONS.entries()) {
        if (!record || record.expiresAtMs <= now) {
            ACTIVE_SEAT_SESSIONS.delete(sessionHash);
        }
    }
}

function issueSeatSessionRecord(installationKey, actorSeat, deviceLabel, authMode = 'api_key') {
    cleanupExpiredSeatSessions();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const issuedAt = new Date().toISOString();
    const expiresAtMs = Date.now() + SEAT_SESSION_TTL_MS;
    const expiresAt = new Date(expiresAtMs).toISOString();
    const record = {
        sessionId: `seat_session_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        sessionHash: hashSeatSessionToken(sessionToken),
        installationKey,
        actorSeatId: actorSeat.id,
        actorLabel: actorSeat.label,
        roleKey: actorSeat.roleKey,
        stateKey: actorSeat.stateKey,
        deviceLabel: asString(deviceLabel),
        authMode: asString(authMode) || 'api_key',
        seatAuthFingerprint: buildSeatSessionAuthFingerprint(actorSeat),
        issuedAt,
        expiresAt,
        expiresAtMs
    };
    ACTIVE_SEAT_SESSIONS.set(record.sessionHash, record);
    return {
        sessionToken,
        ...record
    };
}

function resolveValidSeatSession(req, installationKey = '') {
    cleanupExpiredSeatSessions();
    const candidate = asString(req?.headers?.['x-session-token']);
    if (!candidate) {
        return {
            ok: false,
            reason: 'missing',
            session: null
        };
    }

    const session = ACTIVE_SEAT_SESSIONS.get(hashSeatSessionToken(candidate));
    if (!session) {
        return {
            ok: false,
            reason: 'invalid',
            session: null
        };
    }
    if (session.expiresAtMs <= Date.now()) {
        ACTIVE_SEAT_SESSIONS.delete(session.sessionHash);
        return {
            ok: false,
            reason: 'expired',
            session: null
        };
    }
    if (installationKey && session.installationKey !== installationKey) {
        return {
            ok: false,
            reason: 'installation_mismatch',
            session: null
        };
    }

    return {
        ok: true,
        reason: 'valid',
        session
    };
}

function revokeSeatSessionByToken(token) {
    const candidate = asString(token);
    if (!candidate) return null;
    const sessionHash = hashSeatSessionToken(candidate);
    const session = ACTIVE_SEAT_SESSIONS.get(sessionHash);
    if (session) {
        ACTIVE_SEAT_SESSIONS.delete(sessionHash);
    }
    return session || null;
}

function revokeSeatSessionsForSeat(installationKey, targetSeatId) {
    let revokedCount = 0;
    for (const [sessionHash, record] of ACTIVE_SEAT_SESSIONS.entries()) {
        if (!record) continue;
        if (record.installationKey !== asString(installationKey)) continue;
        if (record.actorSeatId !== asString(targetSeatId)) continue;
        ACTIVE_SEAT_SESSIONS.delete(sessionHash);
        revokedCount += 1;
    }
    return revokedCount;
}

function clearSeatSignInThrottleForSeat(installationKey, targetSeatId) {
    const seatPrefix = `${asString(installationKey)}::${asString(targetSeatId)}::`;
    let clearedCount = 0;
    for (const key of FAILED_SEAT_SIGNINS.keys()) {
        if (!String(key || '').startsWith(seatPrefix)) continue;
        FAILED_SEAT_SIGNINS.delete(key);
        clearedCount += 1;
    }
    return clearedCount;
}

function issueSeatRecoveryCodeRecord(installationKey, actorSeat, targetSeat, deviceLabel, note = '') {
    cleanupExpiredSeatRecoveryCodes();
    revokeSeatRecoveryCodesForSeat(installationKey, targetSeat.id);
    const recoveryCode = crypto.randomBytes(18).toString('base64url');
    const issuedAt = new Date().toISOString();
    const expiresAtMs = Date.now() + SEAT_RECOVERY_CODE_TTL_MS;
    const expiresAt = new Date(expiresAtMs).toISOString();
    const record = {
        deliveryRefId: `seat_recovery_issue_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        recoveryHash: hashSeatRecoveryCode(recoveryCode),
        installationKey,
        actorSeatId: actorSeat.id,
        actorLabel: actorSeat.label,
        targetSeatId: targetSeat.id,
        targetLabel: targetSeat.label,
        roleKey: targetSeat.roleKey,
        stateKey: targetSeat.stateKey,
        deviceLabel: asString(deviceLabel),
        note: asString(note),
        issuedAt,
        expiresAt,
        expiresAtMs
    };
    ACTIVE_SEAT_RECOVERY_CODES.set(record.recoveryHash, record);
    return {
        recoveryCode,
        ...record
    };
}

function findSeatRecoveryRecordByDeliveryRef(installationKey, targetSeatId, deliveryRefId) {
    cleanupExpiredSeatRecoveryCodes();
    const expectedInstallationKey = asString(installationKey);
    const expectedTargetSeatId = asString(targetSeatId);
    const expectedDeliveryRefId = asString(deliveryRefId);
    if (!expectedInstallationKey || !expectedTargetSeatId || !expectedDeliveryRefId) return null;
    for (const record of ACTIVE_SEAT_RECOVERY_CODES.values()) {
        if (!record) continue;
        if (record.installationKey !== expectedInstallationKey) continue;
        if (record.targetSeatId !== expectedTargetSeatId) continue;
        if (record.deliveryRefId !== expectedDeliveryRefId) continue;
        return record;
    }
    return null;
}

function revokeSeatRecoveryCodesForSeat(installationKey, targetSeatId) {
    let revokedCount = 0;
    for (const [recoveryHash, record] of ACTIVE_SEAT_RECOVERY_CODES.entries()) {
        if (!record) continue;
        if (record.installationKey !== asString(installationKey)) continue;
        if (record.targetSeatId !== asString(targetSeatId)) continue;
        ACTIVE_SEAT_RECOVERY_CODES.delete(recoveryHash);
        revokedCount += 1;
    }
    return revokedCount;
}

function lookupSeatRecoveryCodeRecord(installationKey, targetSeatId, recoveryCode) {
    cleanupExpiredSeatRecoveryCodes();
    const recoveryHash = hashSeatRecoveryCode(recoveryCode);
    const record = ACTIVE_SEAT_RECOVERY_CODES.get(recoveryHash);
    if (!record) {
        return {
            ok: false,
            status: 401,
            error: 'Recovery code is invalid, expired, or already used.',
            record: null,
            recoveryHash: ''
        };
    }
    if (record.installationKey !== asString(installationKey) || record.targetSeatId !== asString(targetSeatId)) {
        return {
            ok: false,
            status: 401,
            error: 'Recovery code does not match this installation and target seat.',
            record: null,
            recoveryHash: ''
        };
    }
    return {
        ok: true,
        status: 200,
        error: '',
        record,
        recoveryHash
    };
}

function consumeSeatRecoveryCodeRecord(recoveryHash) {
    ACTIVE_SEAT_RECOVERY_CODES.delete(asString(recoveryHash));
}

function issueSeatInviteRecord(installationKey, actorSeat, targetSeat, deviceLabel, note = '') {
    cleanupExpiredSeatInvites();
    revokeSeatInvitesForSeat(installationKey, targetSeat.id);
    const inviteCode = crypto.randomBytes(18).toString('base64url');
    const issuedAt = new Date().toISOString();
    const expiresAtMs = Date.now() + SEAT_INVITE_CODE_TTL_MS;
    const expiresAt = new Date(expiresAtMs).toISOString();
    const record = {
        deliveryRefId: `seat_invite_issue_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        inviteHash: hashSeatInviteCode(inviteCode),
        installationKey,
        actorSeatId: actorSeat.id,
        actorLabel: actorSeat.label,
        targetSeatId: targetSeat.id,
        targetLabel: targetSeat.label,
        roleKey: targetSeat.roleKey,
        stateKey: targetSeat.stateKey,
        deviceLabel: asString(deviceLabel),
        note: asString(note),
        issuedAt,
        expiresAt,
        expiresAtMs
    };
    ACTIVE_SEAT_INVITES.set(record.inviteHash, record);
    return {
        inviteCode,
        ...record
    };
}

function findSeatInviteRecordByDeliveryRef(installationKey, targetSeatId, deliveryRefId) {
    cleanupExpiredSeatInvites();
    const expectedInstallationKey = asString(installationKey);
    const expectedTargetSeatId = asString(targetSeatId);
    const expectedDeliveryRefId = asString(deliveryRefId);
    if (!expectedInstallationKey || !expectedTargetSeatId || !expectedDeliveryRefId) return null;
    for (const record of ACTIVE_SEAT_INVITES.values()) {
        if (!record) continue;
        if (record.installationKey !== expectedInstallationKey) continue;
        if (record.targetSeatId !== expectedTargetSeatId) continue;
        if (record.deliveryRefId !== expectedDeliveryRefId) continue;
        return record;
    }
    return null;
}

function revokeSeatInvitesForSeat(installationKey, targetSeatId) {
    let revokedCount = 0;
    for (const [inviteHash, record] of ACTIVE_SEAT_INVITES.entries()) {
        if (!record) continue;
        if (record.installationKey !== asString(installationKey)) continue;
        if (record.targetSeatId !== asString(targetSeatId)) continue;
        ACTIVE_SEAT_INVITES.delete(inviteHash);
        revokedCount += 1;
    }
    return revokedCount;
}

function lookupSeatInviteRecord(installationKey, inviteCode) {
    cleanupExpiredSeatInvites();
    const inviteHash = hashSeatInviteCode(inviteCode);
    const record = ACTIVE_SEAT_INVITES.get(inviteHash);
    if (!record) {
        return {
            ok: false,
            status: 401,
            error: 'Seat invite code is invalid, expired, or already used.',
            record: null,
            inviteHash: ''
        };
    }
    if (record.installationKey !== asString(installationKey)) {
        return {
            ok: false,
            status: 401,
            error: 'Seat invite code does not match this installation.',
            record: null,
            inviteHash: ''
        };
    }
    return {
        ok: true,
        status: 200,
        error: '',
        record,
        inviteHash
    };
}

function consumeSeatInviteRecord(inviteHash) {
    ACTIVE_SEAT_INVITES.delete(asString(inviteHash));
}

function countActiveWorkspaceAdmins(seats, excludingSeatId = '') {
    return (Array.isArray(seats) ? seats : []).filter(seat => {
        if (!seat) return false;
        if (excludingSeatId && seat.id === excludingSeatId) return false;
        return asString(seat.roleKey) === 'workspace_admin' && asString(seat.stateKey) === 'active';
    }).length;
}

function requestHasValidProtectedAuth(req) {
    if (!hasConfiguredApiKeys()) return true;
    if (requestHasValidApiKey(req)) return true;
    return resolveValidSeatSession(req).ok;
}

function resolveProtectedInstallationAccess(req, installationKey) {
    if (!hasConfiguredApiKeys()) {
        return {
            ok: true,
            mode: 'dev_open',
            session: null
        };
    }
    if (requestHasValidApiKey(req)) {
        return {
            ok: true,
            mode: 'api_key',
            session: null
        };
    }
    const sessionResult = resolveValidSeatSession(req, installationKey);
    if (sessionResult.ok) {
        const teamSeatStore = loadTeamSeatStore();
        const currentSeat = getScopedTeamSeats(teamSeatStore, installationKey)
            .find(seat => seat.id === sessionResult.session.actorSeatId);
        if (!currentSeat) {
            ACTIVE_SEAT_SESSIONS.delete(sessionResult.session.sessionHash);
            return {
                ok: false,
                status: 401,
                error: 'The active seat session is no longer current for this installation. Sign in again.',
                session: null
            };
        }
        if (buildSeatSessionAuthFingerprint(currentSeat) !== asString(sessionResult.session.seatAuthFingerprint)) {
            ACTIVE_SEAT_SESSIONS.delete(sessionResult.session.sessionHash);
            return {
                ok: false,
                status: 401,
                error: 'The active seat session is no longer current for this seat. Sign in again.',
                session: null
            };
        }
        return {
            ok: true,
            mode: 'session',
            session: sessionResult.session
        };
    }
    return {
        ok: false,
        status: 401,
        error: 'A valid backend API key or short-lived seat session is required for this installation.',
        session: null
    };
}

function resolveAuthorizedSeatAction(req, installationKey, actorSeatId, requiredPermission) {
    const installAuth = resolveProtectedInstallationAccess(req, installationKey);
    if (!installAuth.ok) {
        return {
            ok: false,
            status: installAuth.status || 401,
            error: installAuth.error,
            bootstrapAllowed: false,
            actorSeat: null,
            session: null
        };
    }

    const providedActorSeatId = asString(actorSeatId);
    if (installAuth.session?.actorSeatId && providedActorSeatId && installAuth.session.actorSeatId !== providedActorSeatId) {
        return {
            ok: false,
            status: 403,
            error: 'actorSeatId does not match the active backend seat session.',
            bootstrapAllowed: false,
            actorSeat: null,
            session: installAuth.session
        };
    }

    const teamSeatStore = loadTeamSeatStore();
    const resolvedActorSeatId = installAuth.session?.actorSeatId || providedActorSeatId;
    const auth = authorizeSeatAction(teamSeatStore, installationKey, resolvedActorSeatId, requiredPermission);
    return {
        ...auth,
        session: installAuth.session || null
    };
}

function buildEntitlement(record, nowIso = new Date().toISOString()) {
    return {
        planKey: record.planKey,
        source: 'server_sync',
        entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
        grantedCapabilities: record.grantedCapabilities,
        expiresAt: record.expiresAt,
        offlineGraceDays: record.offlineGraceDays,
        issuedAt: record.issuedAt || nowIso,
        lastVerifiedAt: nowIso,
        note: record.note || `${record.label} entitlement resolved by backend`
    };
}

function buildAdminConsoleCsp() {
    return [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "font-src 'self'",
        "form-action 'self'",
        "base-uri 'none'",
        "frame-ancestors 'none'"
    ].join('; ');
}

function applyResponseSecurityHeaders(req, res) {
    const origin = asString(req?.headers?.origin);
    if (hasAllowedOrigins()) {
        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
        }
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Session-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
}

function requestHasValidApiKey(req) {
    if (!hasConfiguredApiKeys()) return true;
    const candidate = asString(req.headers['x-api-key']);
    if (!candidate) return false;
    return CONFIGURED_API_KEYS.some(expected => matchesApiKey(candidate, expected));
}

function routeRequiresProtectedAuth(pathname) {
    return [
        '/api/entitlement/resolve',
        '/api/company-profiles',
        '/api/team-handbacks',
        '/api/team-roster',
        '/api/team-seats',
        '/api/team-seats/recovery',
        '/api/team-seats/recovery-code/issue',
        '/api/team-seats/invite/issue',
        '/api/audit-log'
    ].includes(pathname);
}

function routeRequiresApiKeyOnly(pathname) {
    return [].includes(pathname);
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, statusCode, contentType, body, extraHeaders = {}) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', contentType);
    Object.entries(extraHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    res.end(body);
}

function serveAdminAsset(res, filePath, contentType) {
    if (!fs.existsSync(filePath)) {
        sendJson(res, 500, {
            ok: false,
            error: `Admin console asset is missing: ${path.relative(process.cwd(), filePath)}`
        });
        return;
    }

    const body = fs.readFileSync(filePath, 'utf8');
    sendText(res, 200, contentType, body, {
        'Content-Security-Policy': buildAdminConsoleCsp(),
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Robots-Tag': 'noindex, nofollow'
    });
}

function buildAdminConsolePosture(store) {
    const warnings = [];
    const operationsReadiness = buildOperationalReadiness();
    if (STORAGE_DRIVER === 'json') {
        warnings.push('Runtime storage is still using JSON file mode. Acceptable for local/dev and controlled beta, but SQLite or Postgres is recommended for public premium deployment.');
    }
    if (!hasConfiguredApiKeys()) {
        warnings.push('Backend API key protection is disabled. Do not expose this backend publicly in this posture.');
    }
    if (!hasAllowedOrigins()) {
        warnings.push('Allowed origins are open. Set BACKEND_ALLOWED_ORIGINS before production use.');
    }
    if (ACTION_LINK_SECRET_SOURCE === 'dev_default') {
        warnings.push('Signed action links still use the development default secret. Set BACKEND_ACTION_LINK_SECRET before production.');
    } else if (ACTION_LINK_SECRET_SOURCE !== 'explicit') {
        warnings.push('Signed action links are using fallback secret material. Prefer an explicit BACKEND_ACTION_LINK_SECRET for production.');
    }
    if (!operationsReadiness.ready) {
        warnings.push(`Operational ownership is incomplete. Missing: ${operationsReadiness.missing.join(', ')}.`);
    }

    return {
        ok: true,
        backendLabel: store.backendLabel,
        adminConsoleRoute: '/admin',
        sameOriginOnly: true,
        entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
        entitlementSourceLabel: getEntitlementSourceDefinition().label,
        storageDriver: STORAGE_DRIVER,
        dataDirectory: DATA_DIR,
        usingCustomDataDirectory: DATA_DIR !== DEFAULT_DATA_DIR,
        sqliteFile: usesSqliteStorage() ? SQLITE_FILE : '',
        apiKeyProtectionEnabled: hasConfiguredApiKeys(),
        allowedOriginsConfigured: hasAllowedOrigins(),
        actionLinkSecretSource: ACTION_LINK_SECRET_SOURCE,
        seatSessionTtlMinutes: Math.round(SEAT_SESSION_TTL_MS / 60000),
        seatRecoveryCodeTtlMinutes: Math.round(SEAT_RECOVERY_CODE_TTL_MS / 60000),
        seatInviteCodeTtlMinutes: Math.round(SEAT_INVITE_CODE_TTL_MS / 60000),
        adminActionApprovalTtlMinutes: Math.round(ADMIN_ACTION_APPROVAL_TTL_MS / 60000),
        operationsReadiness,
        warnings,
        recommendedEnv: [
            'BACKEND_ENTITLEMENT_SOURCE=manual_admin',
            'BACKEND_STORAGE_DRIVER=sqlite',
            'BACKEND_SQLITE_FILE',
            'BACKEND_API_KEY or BACKEND_API_KEYS',
            'BACKEND_ALLOWED_ORIGINS',
            'BACKEND_ACTION_LINK_SECRET',
            'BACKEND_DATA_DIR (for persistent mounted storage)',
            'BACKEND_BACKUP_ROOT_DIR',
            'BACKEND_BACKUP_SCHEDULE_CRON',
            'BACKEND_BACKUP_KEEP_COUNT',
            'BACKEND_BACKUP_KEEP_DAYS',
            'BACKEND_BACKUP_OWNER',
            'BACKEND_BACKUP_REVIEW_CHANNEL',
            'BACKEND_RESTORE_OWNER',
            'BACKEND_RESTORE_DRILL_CADENCE',
            'BACKEND_AUDIT_RETENTION_DAYS',
            'BACKEND_DELIVERY_RETENTION_DAYS',
            'BACKEND_APPROVAL_RETENTION_DAYS',
            'BACKEND_INCIDENT_OWNER',
            'BACKEND_INCIDENT_CHANNEL',
            'BACKEND_INCIDENT_RUNBOOK_URL'
        ],
        availableAdminRoutes: [
            '/admin',
            '/admin/app.js',
            '/admin/app.css',
            '/api/admin/posture',
            '/api/admin/session-context',
            '/api/admin/audit-export',
            '/api/admin/action-approvals',
            '/api/admin/action-approvals/request',
            '/api/admin/action-approvals/review',
            '/api/admin/delivery-trail',
            '/api/admin/delivery-trail/record',
            '/api/admin/delivery-trail/acknowledge',
            '/api/admin/delivery-dispatch/prepare'
        ]
    };
}

function escapeCsvCell(value) {
    const text = String(value ?? '');
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

function resolveCurrentAdminSession(req, installationKey, requiredPermission = 'shared_read') {
    const sessionResult = resolveValidSeatSession(req, installationKey);
    if (!sessionResult.ok || !sessionResult.session) {
        return {
            ok: false,
            status: 401,
            error: 'A valid short-lived backend seat session is required before the admin shell can unlock.'
        };
    }

    const store = loadTeamSeatStore();
    const scopedSeats = getScopedTeamSeats(store, installationKey);
    const actorSeat = scopedSeats.find(seat => seat.id === sessionResult.session.actorSeatId);
    if (!actorSeat) {
        ACTIVE_SEAT_SESSIONS.delete(sessionResult.session.sessionHash);
        return {
            ok: false,
            status: 401,
            error: 'The active seat session is no longer current for this installation. Sign in again.'
        };
    }
    if (buildSeatSessionAuthFingerprint(actorSeat) !== asString(sessionResult.session.seatAuthFingerprint)) {
        ACTIVE_SEAT_SESSIONS.delete(sessionResult.session.sessionHash);
        return {
            ok: false,
            status: 401,
            error: 'The active seat session is no longer current for this seat. Sign in again.'
        };
    }

    const auth = authorizeSeatAction(store, installationKey, actorSeat.id, requiredPermission);
    if (!auth.ok || !auth.actorSeat) {
        return {
            ok: false,
            status: auth.status || 403,
            error: auth.error || 'The active seat session is no longer allowed to perform this admin action.'
        };
    }

    return {
        ok: true,
        status: 200,
        session: sessionResult.session,
        actorSeat: auth.actorSeat,
        permissions: buildTeamSeatPermissions(auth.actorSeat),
        seatCount: scopedSeats.length
    };
}

function buildAdminAuditExportText(context, installationKey, entries, exportedAt, limit, filters = {}) {
    const filterParts = [
        asString(filters.category) ? `category=${asString(filters.category)}` : '',
        asString(filters.action) ? `action=${asString(filters.action)}` : '',
        asString(filters.query) ? `query=${asString(filters.query)}` : ''
    ].filter(Boolean);
    const lines = [
        'PV Premium Admin Audit Snapshot',
        `Installation Key: ${installationKey}`,
        `Exported At: ${exportedAt}`,
        `Operator Seat: ${context.actorSeat.label} (${context.actorSeat.id})`,
        `Role: ${context.actorSeat.roleLabel}`,
        `Auth Mode: ${context.session.authMode}`,
        `Applied Limit: ${limit}`,
        `Active Filters: ${filterParts.length ? filterParts.join(' • ') : 'none'}`,
        `Event Count: ${entries.length}`,
        ''
    ];

    if (!entries.length) {
        lines.push('No audit events matched the current export request.');
        return lines.join('\n');
    }

    entries.forEach((entry, index) => {
        lines.push(`Event ${index + 1}`);
        lines.push(`- Timestamp: ${asString(entry.timestamp) || 'Unknown'}`);
        lines.push(`- Category: ${asString(entry.category) || 'Unknown'}`);
        lines.push(`- Action: ${asString(entry.action) || 'Unknown'}`);
        lines.push(`- Target: ${asString(entry.targetLabel) || 'Unknown'}`);
        lines.push(`- Actor: ${asString(entry.actorLabel) || 'Unknown'}`);
        lines.push(`- Device: ${asString(entry.deviceLabel) || 'Unknown'}`);
        lines.push(`- Note: ${asString(entry.note) || 'No note'}`);
        lines.push('');
    });

    return lines.join('\n').trimEnd();
}

function buildAdminAuditExportCsv(context, installationKey, entries, exportedAt, filters = {}) {
    const header = [
        'installation_key',
        'exported_at',
        'operator_seat_id',
        'operator_seat_label',
        'operator_role',
        'auth_mode',
        'filter_category',
        'filter_action',
        'filter_query',
        'event_index',
        'event_id',
        'event_timestamp',
        'event_category',
        'event_action',
        'event_target_label',
        'event_actor_label',
        'event_device_label',
        'event_note'
    ];
    const rows = [header.join(',')];
    entries.forEach((entry, index) => {
        rows.push([
            installationKey,
            exportedAt,
            context.actorSeat.id,
            context.actorSeat.label,
            context.actorSeat.roleLabel,
            context.session.authMode,
            asString(filters.category),
            asString(filters.action),
            asString(filters.query),
            index + 1,
            asString(entry.id),
            asString(entry.timestamp),
            asString(entry.category),
            asString(entry.action),
            asString(entry.targetLabel),
            asString(entry.actorLabel),
            asString(entry.deviceLabel),
            asString(entry.note)
        ].map(escapeCsvCell).join(','));
    });
    return rows.join('\n');
}

function parseAuditFiltersFromUrl(requestUrl) {
    return {
        category: asString(requestUrl.searchParams.get('category')),
        action: asString(requestUrl.searchParams.get('action')),
        query: asString(requestUrl.searchParams.get('query'))
    };
}

function parseAdminActionApprovalStatusFilter(rawValue) {
    const status = asString(rawValue).toLowerCase();
    if (['all', 'open', 'pending', 'approved', 'rejected', 'consumed', 'expired'].includes(status)) {
        return status;
    }
    return 'open';
}

function filterAdminActionApprovals(records, statusFilter = 'open') {
    const filterKey = parseAdminActionApprovalStatusFilter(statusFilter);
    const approvals = Array.isArray(records) ? records : [];
    if (filterKey === 'all') return approvals;
    if (filterKey === 'open') {
        return approvals.filter(record => ['pending', 'approved'].includes(getEffectiveAdminActionApprovalStatus(record)));
    }
    return approvals.filter(record => getEffectiveAdminActionApprovalStatus(record) === filterKey);
}

function parseAdminDeliveryFiltersFromUrl(requestUrl) {
    return {
        deliveryType: asString(requestUrl.searchParams.get('deliveryType')),
        deliveryChannel: asString(requestUrl.searchParams.get('deliveryChannel')),
        acknowledgmentStatus: asString(requestUrl.searchParams.get('acknowledgmentStatus'))
    };
}

function filterAuditEntries(entries, filters = {}) {
    const category = asString(filters.category).toLowerCase();
    const action = asString(filters.action).toLowerCase();
    const query = asString(filters.query).toLowerCase();
    return (Array.isArray(entries) ? entries : []).filter(entry => {
        if (category && asString(entry?.category).toLowerCase() !== category) return false;
        if (action && asString(entry?.action).toLowerCase() !== action) return false;
        if (!query) return true;
        const haystack = [
            asString(entry?.category),
            asString(entry?.action),
            asString(entry?.targetLabel),
            asString(entry?.actorLabel),
            asString(entry?.deviceLabel),
            asString(entry?.note)
        ].join(' ').toLowerCase();
        return haystack.includes(query);
    });
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let totalBytes = 0;
        req.on('data', chunk => {
            totalBytes += chunk.length;
            if (totalBytes > MAX_BODY_BYTES) {
                reject(new Error(`Request body exceeds the ${MAX_BODY_BYTES}-byte limit.`));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8').trim();
            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(new Error('Request body is not valid JSON.'));
            }
        });
        req.on('error', reject);
    });
}

async function handleResolve(req, res, store) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST for entitlement resolution.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey || body.licenseKey);
    const deviceLabel = asString(body.deviceLabel);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    const installAuth = resolveProtectedInstallationAccess(req, installationKey);
    if (!installAuth.ok) {
        sendJson(res, installAuth.status || 401, { ok: false, error: installAuth.error });
        return;
    }

    const record = store.licenses.find(item => item.installationKey === installationKey);
    if (!record) {
        sendJson(res, 404, { ok: false, error: `No backend entitlement matches installation key "${installationKey}".` });
        return;
    }

    if (record.status !== 'active') {
        sendJson(res, 403, {
            ok: false,
            error: `Entitlement "${record.label}" is marked ${record.status}.`,
            backendLabel: store.backendLabel
        });
        return;
    }

    const syncedAt = new Date().toISOString();
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'entitlement',
        action: 'resolve',
        targetLabel: record.planKey,
        actorLabel: installAuth.session?.actorLabel || deviceLabel || 'Backend runtime',
        deviceLabel,
        note: `Resolved entitlement ${record.label}.`,
        timestamp: syncedAt
    });
    sendJson(res, 200, {
        ok: true,
        message: deviceLabel
            ? `Resolved entitlement for ${deviceLabel}.`
            : 'Resolved entitlement.',
        backendLabel: store.backendLabel,
        entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
        syncedAt,
        entitlement: buildEntitlement(record, syncedAt)
    });
}

function handleExample(res, store) {
    sendJson(res, 200, {
        ok: true,
        backendLabel: store.backendLabel,
        entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
        entitlementSourceLabel: getEntitlementSourceDefinition().label,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            deviceLabel: 'Installer Desk'
        },
        sampleResponseShape: {
            ok: true,
            message: 'Resolved entitlement.',
            backendLabel: store.backendLabel,
            entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
            syncedAt: new Date().toISOString(),
            entitlement: {
                planKey: 'engineering_plus',
                source: 'server_sync',
                entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
                grantedCapabilities: ['formal_study_surface', 'branded_exports'],
                expiresAt: '2026-12-31T00:00:00.000Z',
                offlineGraceDays: 14,
                issuedAt: '2026-03-27T00:00:00.000Z',
                lastVerifiedAt: new Date().toISOString(),
                note: 'Example response'
            }
        }
    });
}

function handleCompanyProfileExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            profile: {
                label: 'Lagos Sales Desk',
                companyName: 'Leebartea Solar',
                contactName: 'Tunde',
                contactPhone: '+234...',
                contactEmail: 'sales@example.com',
                brandAccent: '#2563eb'
            }
        },
        sampleResponseShape: {
            ok: true,
            profile: {
                id: 'profile_demo',
                label: 'Lagos Sales Desk',
                companyName: 'Leebartea Solar',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            }
        }
    });
}

function handleTeamHandbackExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            handback: {
                projectKey: 'adeniran_backup_upgrade',
                projectName: 'Adeniran Backup Upgrade',
                stageKey: 'engineering_review',
                owner: 'Sales Desk - Tunde',
                handbackTarget: 'Installer Ops',
                dueDate: '2026-03-31'
            }
        },
        sampleResponseShape: {
            ok: true,
            handback: {
                projectKey: 'adeniran_backup_upgrade',
                projectName: 'Adeniran Backup Upgrade',
                stageKey: 'engineering_review',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            }
        }
    });
}

function handleTeamRosterExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            admin: {
                coordinator: 'Ada - Ops Coordinator',
                contact: 'ops@example.com'
            },
            rosterEntry: {
                label: 'Engineering Review Desk',
                roleKey: 'engineering_review',
                roleLabel: 'Engineering Review',
                roleHint: 'Validates technical basis before release or procurement.',
                contact: 'Chinedu / +234...'
            }
        },
        sampleResponseShape: {
            ok: true,
            admin: {
                coordinator: 'Ada - Ops Coordinator',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            },
            rosterEntry: {
                id: 'team_roster_demo',
                label: 'Engineering Review Desk',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            }
        }
    });
}

function handleTeamSeatExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            actorSeatId: 'team_seat_admin_demo',
            seatEntry: {
                label: 'Ada - Workspace Admin',
                roleKey: 'workspace_admin',
                stateKey: 'active',
                contact: 'ada@example.com'
            }
        },
        sampleResponseShape: {
            ok: true,
            bootstrapAllowed: false,
            seat: {
                id: 'team_seat_admin_demo',
                label: 'Ada - Workspace Admin',
                roleLabel: 'Workspace Admin',
                stateLabel: 'Active',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            }
        }
    });
}

function handleTeamSeatRecoveryExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            actorSeatId: 'team_seat_admin_demo',
            targetSeatId: 'team_seat_eng_demo',
            recoveryAction: 'rotate_access_code',
            nextAccessCode: 'FreshStudyDesk2026!',
            nextAccessCodeHint: 'Updated study phrase',
            note: 'Operator rotation after engineering desk handover.'
        },
        sampleResponseShape: {
            ok: true,
            recoveryAction: 'rotate_access_code',
            revokedSessionCount: 1,
            clearedLockoutCount: 1,
            seat: {
                id: 'team_seat_eng_demo',
                label: 'Chinedu - Engineering Review',
                authEnabled: true,
                stateLabel: 'Active',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            }
        }
    });
}

function handleTeamSeatRecoveryCodeIssueExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            actorSeatId: 'team_seat_admin_demo',
            targetSeatId: 'team_seat_eng_demo',
            note: 'Engineering desk lost the previous laptop.'
        },
        sampleResponseShape: {
            ok: true,
            targetSeatId: 'team_seat_eng_demo',
            targetLabel: 'Chinedu - Engineering Review',
            deliveryRefId: 'seat_recovery_issue_demo',
            recoveryCode: 'example-one-time-recovery-code',
            recoveryLinkToken: 'example.signed.recovery.link.token',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SEAT_RECOVERY_CODE_TTL_MS).toISOString()
        }
    });
}

function handleTeamSeatRecoveryCodeRedeemExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            recoveryLinkToken: 'example.signed.recovery.link.token',
            nextAccessCode: 'FreshStudyDesk2026!',
            nextAccessCodeHint: 'Updated study phrase',
            deviceLabel: 'Engineering Desk Replacement Laptop'
        },
        sampleResponseShape: {
            ok: true,
            actorSeatId: 'team_seat_eng_demo',
            actorLabel: 'Chinedu - Engineering Review',
            authMode: 'recovery_code',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SEAT_SESSION_TTL_MS).toISOString(),
            sessionToken: 'temporary-session-token'
        }
    });
}

function handleTeamSeatInviteIssueExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            actorSeatId: 'team_seat_admin_demo',
            targetSeatId: 'team_seat_sales_demo',
            note: 'Invite issued for review-desk onboarding.'
        },
        sampleResponseShape: {
            ok: true,
            targetSeatId: 'team_seat_sales_demo',
            targetLabel: 'Tunde - Sales Desk',
            deliveryRefId: 'seat_invite_issue_demo',
            inviteCode: 'example-seat-invite-code',
            inviteLinkToken: 'example.signed.invite.link.token',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SEAT_INVITE_CODE_TTL_MS).toISOString()
        }
    });
}

function handleTeamSeatInviteRedeemExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            inviteLinkToken: 'example.signed.invite.link.token',
            nextAccessCode: 'FreshSalesDesk2026!',
            nextAccessCodeHint: 'Review desk phrase v2',
            deviceLabel: 'Sales Desk Replacement Laptop'
        },
        sampleResponseShape: {
            ok: true,
            actorSeatId: 'team_seat_sales_demo',
            actorLabel: 'Tunde - Sales Desk',
            authMode: 'seat_invite',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SEAT_SESSION_TTL_MS).toISOString(),
            sessionToken: 'temporary-session-token',
            seat: {
                id: 'team_seat_sales_demo',
                label: 'Tunde - Sales Desk',
                authEnabled: true,
                stateLabel: 'Review-only',
                source: 'server_sync',
                updatedAt: new Date().toISOString()
            }
        }
    });
}

function handleSeatSessionExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            actorSeatId: 'team_seat_admin_demo',
            actorSeatCode: 'Ops desk phrase',
            deviceLabel: 'Lagos Ops Laptop'
        },
        sampleResponseShape: {
            ok: true,
            actorSeatId: 'team_seat_admin_demo',
            actorLabel: 'Ada - Workspace Admin',
            authMode: 'seat_code',
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SEAT_SESSION_TTL_MS).toISOString(),
            sessionToken: 'temporary-session-token'
        }
    });
}

function handleAuditLogExample(res) {
    sendJson(res, 200, {
        ok: true,
        sampleRequest: {
            installationKey: 'demo-engineering-plus',
            limit: 12
        },
        sampleResponseShape: {
            ok: true,
            installationKey: 'demo-engineering-plus',
            eventCount: 2,
            entries: [
                {
                    id: 'audit_demo_one',
                    category: 'team_roster',
                    action: 'upsert',
                    targetLabel: 'Engineering Review Desk',
                    actorLabel: 'Ada - Ops Coordinator',
                    deviceLabel: 'Lagos Ops Laptop',
                    timestamp: new Date().toISOString(),
                    source: 'server_sync'
                }
            ]
        }
    });
}

function handleAdminPosture(res, store) {
    sendJson(res, 200, buildAdminConsolePosture(store));
}

async function handleAdminSessionContext(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    if (req.method !== 'GET') {
        sendJson(res, 405, { ok: false, error: 'Use GET for admin session context.' });
        return;
    }

    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'shared_read');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    sendJson(res, 200, {
        ok: true,
        unlocked: true,
        installationKey,
        actorSeatId: context.actorSeat.id,
        actorLabel: context.actorSeat.label,
        actorSeat: toPublicTeamSeatRecord(context.actorSeat),
        authMode: context.session.authMode,
        issuedAt: context.session.issuedAt,
        expiresAt: context.session.expiresAt,
        permissions: context.permissions,
        capabilities: {
            sharedRead: context.permissions.includes('shared_read'),
            auditRead: context.permissions.includes('audit_read'),
            teamSeatPublish: context.permissions.includes('team_seat_publish'),
            teamRosterPublish: context.permissions.includes('team_roster_publish'),
            teamHandbackPublish: context.permissions.includes('team_handback_publish'),
            companyProfilePublish: context.permissions.includes('company_profile_publish')
        },
        seatCount: context.seatCount
    });
}

async function handleAdminAuditExport(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    if (req.method !== 'GET') {
        sendJson(res, 405, { ok: false, error: 'Use GET for admin audit export.' });
        return;
    }

    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));
    const format = asString(requestUrl.searchParams.get('format') || 'txt').toLowerCase();
    const limit = Math.max(1, Math.min(200, Number(requestUrl.searchParams.get('limit') || 25)));
    const filters = parseAuditFiltersFromUrl(requestUrl);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
        return;
    }
    if (!['txt', 'csv'].includes(format)) {
        sendJson(res, 400, { ok: false, error: 'format must be txt or csv.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'audit_read');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const auditStore = loadAuditLogStore();
    const filteredEntries = filterAuditEntries(auditStore.scopes[installationKey], filters);
    const entries = filteredEntries.slice(0, limit);
    const exportedAt = new Date().toISOString();
    const safeInstallationKey = installationKey.replace(/[^A-Za-z0-9_-]+/g, '_') || 'installation';
    if (format === 'csv') {
        sendText(res, 200, 'text/csv; charset=utf-8', buildAdminAuditExportCsv(context, installationKey, entries, exportedAt, filters), {
            'Content-Disposition': `attachment; filename="${safeInstallationKey}_admin_audit_snapshot.csv"`
        });
        return;
    }

    sendText(res, 200, 'text/plain; charset=utf-8', buildAdminAuditExportText(context, installationKey, entries, exportedAt, limit, filters), {
        'Content-Disposition': `attachment; filename="${safeInstallationKey}_admin_audit_snapshot.txt"`
    });
}

async function handleAdminActionApprovals(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'GET') {
        sendJson(res, 405, { ok: false, error: 'Use GET for admin action-approval review.' });
        return;
    }

    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));
    const statusFilter = parseAdminActionApprovalStatusFilter(requestUrl.searchParams.get('status'));
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'team_seat_publish');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const store = loadAdminActionApprovalStore();
    const approvals = filterAdminActionApprovals(refreshAdminActionApprovalsScope(store, installationKey), statusFilter)
        .sort((left, right) => Date.parse(asString(right.requestedAt)) - Date.parse(asString(left.requestedAt)))
        .map(toPublicAdminActionApprovalRecord)
        .filter(Boolean);

    sendJson(res, 200, {
        ok: true,
        installationKey,
        statusFilter,
        approvalCount: approvals.length,
        approvals
    });
}

async function handleAdminActionApprovalRequest(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to request a high-risk admin approval.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const actionType = asString(body.actionType || 'team_seat_recovery');
    const recoveryAction = asString(body.recoveryAction);
    const targetSeatId = asString(body.targetSeatId);
    const requestNote = asString(body.note);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!targetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required.' });
        return;
    }
    if (actionType !== 'team_seat_recovery') {
        sendJson(res, 400, { ok: false, error: 'Only team_seat_recovery approvals are currently supported.' });
        return;
    }
    if (!APPROVAL_GATED_TEAM_SEAT_RECOVERY_ACTIONS.includes(recoveryAction)) {
        sendJson(res, 400, { ok: false, error: `"${recoveryAction}" does not require the high-risk approval queue.` });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'team_seat_publish');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const teamSeatStore = loadTeamSeatStore();
    const scopedSeats = getScopedTeamSeats(teamSeatStore, installationKey);
    const targetSeat = scopedSeats.find(seat => seat.id === targetSeatId);
    if (!targetSeat) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${targetSeatId}".` });
        return;
    }

    const approvalStore = loadAdminActionApprovalStore();
    const existingOpenMatch = listMatchingOpenAdminActionApprovals(approvalStore, installationKey, {
        actionType,
        recoveryAction,
        targetSeatId
    })[0] || null;
    if (existingOpenMatch) {
        sendJson(res, 200, {
            ok: true,
            message: existingOpenMatch.status === 'approved'
                ? `An approved ${existingOpenMatch.recoveryActionLabel || recoveryAction} request already exists for "${targetSeat.label}". Retry the protected action to consume it.`
                : `A pending ${existingOpenMatch.recoveryActionLabel || recoveryAction} request already exists for "${targetSeat.label}".`,
            installationKey,
            approval: existingOpenMatch,
            requiresDistinctApprover: countActiveWorkspaceAdmins(scopedSeats) >= 2
        });
        return;
    }

    const actionDefinition = getTeamSeatRecoveryActionDefinition(recoveryAction);
    const approval = normalizeAdminActionApprovalRecord({
        installationKey,
        actionType,
        recoveryAction,
        targetSeatId: targetSeat.id,
        targetLabel: targetSeat.label,
        targetRoleKey: targetSeat.roleKey,
        requestedBySeatId: context.actorSeat.id,
        requestedByLabel: context.actorSeat.label,
        requestedAt: new Date().toISOString(),
        requestNote,
        status: 'pending',
        expiresAt: new Date(Date.now() + ADMIN_ACTION_APPROVAL_TTL_MS).toISOString()
    });
    if (!approval) {
        sendJson(res, 500, { ok: false, error: 'Could not normalize the requested admin approval.' });
        return;
    }

    const scopedApprovals = [...getScopedAdminActionApprovals(approvalStore, installationKey)];
    scopedApprovals.unshift(approval);
    approvalStore.scopes[installationKey] = scopedApprovals;
    saveAdminActionApprovalStore(approvalStore);

    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'admin_action_approval',
        action: 'request',
        targetLabel: targetSeat.label,
        actorLabel: context.actorSeat.label,
        deviceLabel: context.session.deviceLabel,
        note: `Requested approval for ${actionDefinition?.label || recoveryAction} on "${targetSeat.label}"${requestNote ? ` • ${requestNote}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Queued ${actionDefinition?.label || recoveryAction} for admin approval review.`,
        installationKey,
        approval: toPublicAdminActionApprovalRecord(approval),
        requiresDistinctApprover: countActiveWorkspaceAdmins(scopedSeats) >= 2
    });
}

async function handleAdminActionApprovalReview(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to approve or reject a queued admin action.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const approvalId = asString(body.approvalId);
    const decision = asString(body.decision).toLowerCase();
    const reviewNote = asString(body.note);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!approvalId) {
        sendJson(res, 400, { ok: false, error: 'approvalId is required.' });
        return;
    }
    if (!['approve', 'reject'].includes(decision)) {
        sendJson(res, 400, { ok: false, error: 'decision must be approve or reject.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'team_seat_publish');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const approvalStore = loadAdminActionApprovalStore();
    const approvals = [...refreshAdminActionApprovalsScope(approvalStore, installationKey)];
    const approvalIndex = approvals.findIndex(record => record.id === approvalId);
    if (approvalIndex < 0) {
        sendJson(res, 404, { ok: false, error: `No admin approval matches approvalId "${approvalId}".` });
        return;
    }

    const approval = approvals[approvalIndex];
    const effectiveStatus = getEffectiveAdminActionApprovalStatus(approval);
    if (effectiveStatus !== 'pending') {
        sendJson(res, 409, {
            ok: false,
            error: `This admin approval is already ${getAdminActionApprovalStatusLabel(effectiveStatus).toLowerCase()}.`,
            approval: toPublicAdminActionApprovalRecord({
                ...approval,
                status: effectiveStatus
            })
        });
        return;
    }

    const teamSeatStore = loadTeamSeatStore();
    const scopedSeats = getScopedTeamSeats(teamSeatStore, installationKey);
    if (
        decision === 'approve'
        && countActiveWorkspaceAdmins(scopedSeats) >= 2
        && approval.requestedBySeatId
        && approval.requestedBySeatId === context.actorSeat.id
    ) {
        sendJson(res, 409, {
            ok: false,
            error: 'A different active Workspace Admin must approve this request when the installation has more than one active Workspace Admin seat.'
        });
        return;
    }

    const reviewedApproval = {
        ...approval,
        status: decision === 'approve' ? 'approved' : 'rejected',
        reviewedBySeatId: context.actorSeat.id,
        reviewedByLabel: context.actorSeat.label,
        reviewedAt: new Date().toISOString(),
        reviewNote
    };
    approvals[approvalIndex] = reviewedApproval;
    approvalStore.scopes[installationKey] = approvals;
    saveAdminActionApprovalStore(approvalStore);

    const actionDefinition = reviewedApproval.actionType === 'team_seat_recovery'
        ? getTeamSeatRecoveryActionDefinition(reviewedApproval.recoveryAction)
        : null;
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'admin_action_approval',
        action: decision,
        targetLabel: reviewedApproval.targetLabel,
        actorLabel: context.actorSeat.label,
        deviceLabel: context.session.deviceLabel,
        note: `${decision === 'approve' ? 'Approved' : 'Rejected'} ${actionDefinition?.label || reviewedApproval.recoveryAction} for "${reviewedApproval.targetLabel}"${reviewNote ? ` • ${reviewNote}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `${decision === 'approve' ? 'Approved' : 'Rejected'} ${actionDefinition?.label || reviewedApproval.recoveryAction} for "${reviewedApproval.targetLabel}".`,
        installationKey,
        approval: toPublicAdminActionApprovalRecord(reviewedApproval)
    });
}

async function handleAdminDeliveryTrail(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'GET') {
        sendJson(res, 405, { ok: false, error: 'Use GET for admin delivery-trail review.' });
        return;
    }

    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));
    const limit = Math.max(1, Math.min(50, Number(requestUrl.searchParams.get('limit') || 12)));
    const filters = parseAdminDeliveryFiltersFromUrl(requestUrl);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'audit_read');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const store = loadAdminDeliveryTrailStore();
    const entries = filterAdminDeliveryTrail(getScopedAdminDeliveryTrail(store, installationKey), filters)
        .slice(0, limit)
        .map(toPublicAdminDeliveryRecord)
        .filter(Boolean);

    sendJson(res, 200, {
        ok: true,
        installationKey,
        filters,
        entryCount: entries.length,
        entries
    });
}

async function handleAdminDeliveryTrailRecord(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to record an admin delivery handoff.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const deliveryType = asString(body.deliveryType);
    const targetSeatId = asString(body.targetSeatId);
    const deliveryChannel = asString(body.deliveryChannel);
    const recipient = asString(body.recipient);
    const artifactMode = asString(body.artifactMode || 'signed_link');
    const deliveryRefId = asString(body.deliveryRefId);
    const note = asString(body.note);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!targetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required.' });
        return;
    }
    if (!getAdminDeliveryTypeDefinition(deliveryType)) {
        sendJson(res, 400, { ok: false, error: 'deliveryType must be seat_invite or seat_recovery.' });
        return;
    }
    if (!ADMIN_DELIVERY_CHANNELS.includes(deliveryChannel)) {
        sendJson(res, 400, { ok: false, error: `deliveryChannel must be one of: ${ADMIN_DELIVERY_CHANNELS.join(', ')}.` });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'team_seat_publish');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const teamSeatStore = loadTeamSeatStore();
    const targetSeat = getScopedTeamSeats(teamSeatStore, installationKey).find(seat => seat.id === targetSeatId);
    if (!targetSeat) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${targetSeatId}".` });
        return;
    }

    const deliveryStore = loadAdminDeliveryTrailStore();
    const scopedEntries = [...getScopedAdminDeliveryTrail(deliveryStore, installationKey)];
    const entry = normalizeAdminDeliveryRecord({
        installationKey,
        deliveryType,
        targetSeatId: targetSeat.id,
        targetLabel: targetSeat.label,
        deliveryChannel,
        recipient,
        artifactMode,
        deliveryRefId,
        actorSeatId: context.actorSeat.id,
        actorLabel: context.actorSeat.label,
        note,
        deliveredAt: new Date().toISOString()
    });
    if (!entry) {
        sendJson(res, 500, { ok: false, error: 'Could not normalize the delivery-trail record.' });
        return;
    }

    scopedEntries.unshift(entry);
    deliveryStore.scopes[installationKey] = scopedEntries;
    saveAdminDeliveryTrailStore(deliveryStore);

    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'admin_delivery',
        action: 'record',
        targetLabel: targetSeat.label,
        actorLabel: context.actorSeat.label,
        deviceLabel: context.session.deviceLabel,
        note: `Recorded ${getAdminDeliveryTypeDefinition(deliveryType)?.label || deliveryType} delivery via ${deliveryChannel}${recipient ? ` to ${recipient}` : ''}${artifactMode ? ` • artifact ${artifactMode}` : ''}${note ? ` • ${note}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Recorded ${getAdminDeliveryTypeDefinition(deliveryType)?.label || deliveryType} delivery for "${targetSeat.label}".`,
        installationKey,
        entry: toPublicAdminDeliveryRecord(entry),
        entryCount: scopedEntries.length
    });
}

async function handleAdminDeliveryTrailAcknowledge(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to acknowledge an admin delivery trail entry.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const entryId = asString(body.entryId);
    const acknowledgmentNote = asString(body.acknowledgmentNote);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!entryId) {
        sendJson(res, 400, { ok: false, error: 'entryId is required.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'team_seat_publish');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const deliveryStore = loadAdminDeliveryTrailStore();
    const scopedEntries = [...getScopedAdminDeliveryTrail(deliveryStore, installationKey)];
    const entryIndex = scopedEntries.findIndex(record => asString(record?.id) === entryId);
    if (entryIndex < 0) {
        sendJson(res, 404, { ok: false, error: `No admin delivery entry matches entryId "${entryId}".` });
        return;
    }

    const existingEntry = normalizeAdminDeliveryRecord(scopedEntries[entryIndex]);
    if (!existingEntry) {
        sendJson(res, 500, { ok: false, error: 'Could not read the selected delivery entry.' });
        return;
    }
    if (existingEntry.acknowledgmentStatus === 'acknowledged') {
        sendJson(res, 200, {
            ok: true,
            message: `Delivery for "${existingEntry.targetLabel}" was already acknowledged.`,
            installationKey,
            entry: toPublicAdminDeliveryRecord(existingEntry)
        });
        return;
    }

    const nextEntry = normalizeAdminDeliveryRecord({
        ...existingEntry,
        acknowledgmentStatus: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBySeatId: context.actorSeat.id,
        acknowledgedByLabel: context.actorSeat.label,
        acknowledgmentNote
    });
    if (!nextEntry) {
        sendJson(res, 500, { ok: false, error: 'Could not update the delivery acknowledgment state.' });
        return;
    }

    scopedEntries[entryIndex] = nextEntry;
    deliveryStore.scopes[installationKey] = scopedEntries;
    saveAdminDeliveryTrailStore(deliveryStore);

    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'admin_delivery',
        action: 'acknowledge',
        targetLabel: nextEntry.targetLabel,
        actorLabel: context.actorSeat.label,
        deviceLabel: context.session.deviceLabel,
        note: `Acknowledged ${getAdminDeliveryTypeDefinition(nextEntry.deliveryType)?.label || nextEntry.deliveryType} delivery${acknowledgmentNote ? ` • ${acknowledgmentNote}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Acknowledged delivery for "${nextEntry.targetLabel}".`,
        installationKey,
        entry: toPublicAdminDeliveryRecord(nextEntry)
    });
}

function buildAdminDeliveryDispatchPack(options) {
    const deliveryType = asString(options.deliveryType);
    const definition = getAdminDeliveryTypeDefinition(deliveryType);
    const targetLabel = asString(options.targetLabel);
    const installationKey = asString(options.installationKey);
    const deliveryChannel = asString(options.deliveryChannel) || 'secure_chat';
    const recipient = asString(options.recipient);
    const artifactMode = asString(options.artifactMode) || 'signed_link';
    const deliveryRefId = asString(options.deliveryRefId);
    const oneTimeCode = asString(options.oneTimeCode);
    const frontendActionLink = asString(options.frontendActionLink);
    const issuedAt = asDate(options.issuedAt);
    const expiresAt = asDate(options.expiresAt);
    const operatorNote = asString(options.note);
    const actorLabel = asString(options.actorLabel);

    const includeCode = ['code_only', 'code_plus_link'].includes(artifactMode);
    const includeLink = ['signed_link', 'code_plus_link'].includes(artifactMode);
    const warningLines = [];
    if (includeLink && !frontendActionLink) {
        warningLines.push('Frontend app URL was not available, so a full signed app link could not be generated for this pack.');
    }

    const title = `${definition?.label || deliveryType} Dispatch Pack`;
    const subject = `[PV Premium] ${definition?.label || deliveryType} for ${targetLabel || 'target seat'}`;
    const introLine = deliveryType === 'seat_invite'
        ? `Use this one-time seat invite to enroll or re-enroll "${targetLabel}".`
        : `Use this one-time recovery item to reset sign-in for "${targetLabel}".`;
    const channelLine = `Delivery channel: ${deliveryChannel}${recipient ? ` • Recipient: ${recipient}` : ''}`;
    const artifactLine = `Artifact mode: ${artifactMode}`;
    const guidanceLine = deliveryType === 'seat_invite'
        ? 'The target operator should use the invite once, set a fresh seat access code, and avoid forwarding the item beyond the intended desk owner.'
        : 'The target operator should use the recovery item once, set a fresh seat access code immediately, and avoid forwarding the item beyond the intended desk owner.';

    const bodyLines = [
        introLine,
        '',
        `Installation Key: ${installationKey}`,
        `Target Seat: ${targetLabel}`,
        `Reference: ${deliveryRefId}`,
        channelLine,
        artifactLine,
        issuedAt ? `Issued At: ${issuedAt}` : '',
        expiresAt ? `Expires At: ${expiresAt}` : '',
        actorLabel ? `Issued By: ${actorLabel}` : '',
        ''
    ].filter(Boolean);

    if (includeCode && oneTimeCode) {
        bodyLines.push(`One-Time Code: ${oneTimeCode}`, '');
    }
    if (includeLink) {
        bodyLines.push(frontendActionLink ? `App Link: ${frontendActionLink}` : 'App Link: frontend app URL not configured for this dispatch pack.', '');
    }

    bodyLines.push(guidanceLine);
    if (operatorNote) {
        bodyLines.push('', `Operator Note: ${operatorNote}`);
    }
    if (warningLines.length) {
        bodyLines.push('', ...warningLines.map(item => `Warning: ${item}`));
    }

    const text = [
        title,
        ''.padEnd(title.length, '='),
        '',
        `Subject: ${subject}`,
        '',
        ...bodyLines
    ].join('\n');

    return {
        title,
        subject,
        body: bodyLines.join('\n'),
        text,
        deliveryType,
        deliveryTypeLabel: definition?.label || deliveryType,
        targetLabel,
        deliveryChannel,
        recipient,
        artifactMode,
        deliveryRefId,
        issuedAt,
        expiresAt,
        actorLabel,
        frontendActionLink,
        includeCode,
        includeLink,
        warnings: warningLines
    };
}

async function handleAdminDeliveryDispatchPrepare(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to prepare a delivery dispatch pack.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const deliveryType = asString(body.deliveryType);
    const targetSeatId = asString(body.targetSeatId);
    const deliveryRefId = asString(body.deliveryRefId);
    const deliveryChannel = asString(body.deliveryChannel);
    const artifactMode = asString(body.artifactMode || 'signed_link');
    const recipient = asString(body.recipient);
    const note = asString(body.note);
    const oneTimeCode = asString(body.oneTimeCode);
    const signedLinkToken = asString(body.signedLinkToken);
    const frontendAppUrl = asString(body.frontendAppUrl);

    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!targetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required.' });
        return;
    }
    if (!deliveryRefId) {
        sendJson(res, 400, { ok: false, error: 'deliveryRefId is required.' });
        return;
    }
    if (!getAdminDeliveryTypeDefinition(deliveryType)) {
        sendJson(res, 400, { ok: false, error: 'deliveryType must be seat_invite or seat_recovery.' });
        return;
    }
    if (!ADMIN_DELIVERY_CHANNELS.includes(deliveryChannel)) {
        sendJson(res, 400, { ok: false, error: `deliveryChannel must be one of: ${ADMIN_DELIVERY_CHANNELS.join(', ')}.` });
        return;
    }
    if (!['signed_link', 'code_only', 'code_plus_link', 'operator_note'].includes(artifactMode)) {
        sendJson(res, 400, { ok: false, error: 'artifactMode must be signed_link, code_only, code_plus_link, or operator_note.' });
        return;
    }

    const context = resolveCurrentAdminSession(req, installationKey, 'team_seat_publish');
    if (!context.ok || !context.session || !context.actorSeat) {
        sendJson(res, context.status || 401, {
            ok: false,
            error: context.error
        });
        return;
    }

    const teamSeatStore = loadTeamSeatStore();
    const targetSeat = getScopedTeamSeats(teamSeatStore, installationKey).find(seat => seat.id === targetSeatId);
    if (!targetSeat) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${targetSeatId}".` });
        return;
    }

    const sourceRecord = deliveryType === 'seat_invite'
        ? findSeatInviteRecordByDeliveryRef(installationKey, targetSeatId, deliveryRefId)
        : findSeatRecoveryRecordByDeliveryRef(installationKey, targetSeatId, deliveryRefId);
    if (!sourceRecord) {
        sendJson(res, 404, { ok: false, error: 'No active invite or recovery issue matches this delivery reference. It may have expired, been consumed, or never existed.' });
        return;
    }

    const includeCode = ['code_only', 'code_plus_link'].includes(artifactMode);
    const includeLink = ['signed_link', 'code_plus_link'].includes(artifactMode);
    if (includeCode && !oneTimeCode) {
        sendJson(res, 400, { ok: false, error: 'oneTimeCode is required when the artifact mode includes a code.' });
        return;
    }
    if (includeLink && !signedLinkToken) {
        sendJson(res, 400, { ok: false, error: 'signedLinkToken is required when the artifact mode includes a link.' });
        return;
    }

    if (oneTimeCode) {
        const expectedHash = deliveryType === 'seat_invite'
            ? hashSeatInviteCode(oneTimeCode)
            : hashSeatRecoveryCode(oneTimeCode);
        const actualHash = deliveryType === 'seat_invite'
            ? asString(sourceRecord.inviteHash)
            : asString(sourceRecord.recoveryHash);
        if (!matchesApiKey(expectedHash, actualHash)) {
            sendJson(res, 401, { ok: false, error: 'The supplied one-time code does not match the active issue record.' });
            return;
        }
    }

    let frontendActionLink = '';
    if (signedLinkToken) {
        const expectedKind = deliveryType === 'seat_invite' ? 'seat_invite' : 'seat_recovery';
        const verifiedLink = verifySignedActionLinkToken(signedLinkToken, expectedKind, installationKey);
        if (!verifiedLink.ok || !verifiedLink.payload) {
            sendJson(res, verifiedLink.status || 401, { ok: false, error: verifiedLink.error });
            return;
        }
        if (verifiedLink.payload.targetSeatId !== targetSeatId) {
            sendJson(res, 401, { ok: false, error: 'The supplied signed link does not match the selected target seat.' });
            return;
        }
        frontendActionLink = buildFrontendActionLinkUrl(
            frontendAppUrl,
            deliveryType === 'seat_invite' ? 'pvSeatInviteToken' : 'pvSeatRecoveryToken',
            signedLinkToken
        );
    }

    const dispatch = buildAdminDeliveryDispatchPack({
        installationKey,
        deliveryType,
        targetLabel: targetSeat.label,
        deliveryChannel,
        recipient,
        artifactMode,
        deliveryRefId,
        oneTimeCode,
        frontendActionLink,
        issuedAt: sourceRecord.issuedAt,
        expiresAt: sourceRecord.expiresAt,
        note,
        actorLabel: context.actorSeat.label
    });

    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'admin_delivery',
        action: 'prepare_dispatch',
        targetLabel: targetSeat.label,
        actorLabel: context.actorSeat.label,
        deviceLabel: context.session.deviceLabel,
        note: `Prepared ${dispatch.deliveryTypeLabel} dispatch pack via ${deliveryChannel}${recipient ? ` to ${recipient}` : ''}${artifactMode ? ` • artifact ${artifactMode}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Prepared ${dispatch.deliveryTypeLabel} dispatch pack for "${targetSeat.label}".`,
        installationKey,
        dispatch
    });
}

async function handleCompanyProfiles(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    const store = loadCompanyProfileStore();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));

    if (req.method === 'GET') {
        if (!installationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, installationKey, requestUrl.searchParams.get('actorSeatId'), 'shared_read');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        sendJson(res, 200, {
            ok: true,
            installationKey,
            profileCount: (store.scopes[installationKey] || []).length,
            profiles: store.scopes[installationKey] || []
        });
        return;
    }

    if (req.method === 'POST') {
        let body;
        try {
            body = await parseBody(req);
        } catch (error) {
            sendJson(res, 400, { ok: false, error: error.message });
            return;
        }

        const bodyInstallationKey = asString(body.installationKey);
        if (!bodyInstallationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, bodyInstallationKey, body.actorSeatId, 'company_profile_publish');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const profile = normalizeCompanyProfileRecord(body.profile);
        if (!profile) {
            sendJson(res, 400, { ok: false, error: 'A valid company profile object is required.' });
            return;
        }

        const scopedProfiles = Array.isArray(store.scopes[bodyInstallationKey]) ? [...store.scopes[bodyInstallationKey]] : [];
        const existingIndex = scopedProfiles.findIndex(item => item.id === profile.id || item.label === profile.label);
        if (existingIndex >= 0) {
            scopedProfiles[existingIndex] = profile;
        } else {
            scopedProfiles.push(profile);
        }
        store.scopes[bodyInstallationKey] = scopedProfiles;
        saveCompanyProfileStore(store);
        const auditStore = loadAuditLogStore();
        appendAuditEvent(auditStore, {
            installationKey: bodyInstallationKey,
            category: 'company_profile',
            action: 'upsert',
            targetLabel: profile.label || profile.companyName || 'Company Profile',
            actorLabel: auth.actorSeat?.label || asString(body.deviceLabel) || 'Backend runtime',
            deviceLabel: asString(body.deviceLabel),
            note: `Stored shared company profile "${profile.label || profile.companyName || 'Company Profile'}".`
        });

        sendJson(res, 200, {
            ok: true,
            message: `Stored shared company profile "${profile.label}".`,
            installationKey: bodyInstallationKey,
            profile,
            profileCount: scopedProfiles.length
        });
        return;
    }

    sendJson(res, 405, { ok: false, error: 'Use GET or POST for company profile sync.' });
}

async function handleTeamHandbacks(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    const store = loadTeamHandbackStore();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));
    const projectKey = asString(requestUrl.searchParams.get('projectKey'));

    if (req.method === 'GET') {
        if (!installationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, installationKey, requestUrl.searchParams.get('actorSeatId'), 'shared_read');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const scopedHandbacks = Array.isArray(store.scopes[installationKey]) ? store.scopes[installationKey] : [];
        const filtered = projectKey ? scopedHandbacks.filter(item => item.projectKey === projectKey) : scopedHandbacks;
        sendJson(res, 200, {
            ok: true,
            installationKey,
            projectKey,
            handbackCount: filtered.length,
            handbacks: filtered
        });
        return;
    }

    if (req.method === 'POST') {
        let body;
        try {
            body = await parseBody(req);
        } catch (error) {
            sendJson(res, 400, { ok: false, error: error.message });
            return;
        }

        const bodyInstallationKey = asString(body.installationKey);
        if (!bodyInstallationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, bodyInstallationKey, body.actorSeatId, 'team_handback_publish');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const handback = normalizeTeamHandbackRecord(body.handback);
        if (!handback) {
            sendJson(res, 400, { ok: false, error: 'A valid team handback object is required.' });
            return;
        }

        const scopedHandbacks = Array.isArray(store.scopes[bodyInstallationKey]) ? [...store.scopes[bodyInstallationKey]] : [];
        const existingIndex = scopedHandbacks.findIndex(item => item.projectKey === handback.projectKey);
        if (existingIndex >= 0) {
            scopedHandbacks[existingIndex] = handback;
        } else {
            scopedHandbacks.push(handback);
        }
        store.scopes[bodyInstallationKey] = scopedHandbacks;
        saveTeamHandbackStore(store);
        const auditStore = loadAuditLogStore();
        appendAuditEvent(auditStore, {
            installationKey: bodyInstallationKey,
            category: 'team_handback',
            action: 'upsert',
            targetLabel: handback.projectName,
            actorLabel: auth.actorSeat?.label || asString(body.deviceLabel) || handback.owner || 'Backend runtime',
            deviceLabel: asString(body.deviceLabel),
            note: `Stored shared team handback for "${handback.projectName}".`
        });

        sendJson(res, 200, {
            ok: true,
            message: `Stored shared team handback for "${handback.projectName}".`,
            installationKey: bodyInstallationKey,
            handback,
            handbackCount: scopedHandbacks.length
        });
        return;
    }

    sendJson(res, 405, { ok: false, error: 'Use GET or POST for team handback sync.' });
}

async function handleTeamRoster(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    const store = loadTeamRosterStore();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));

    if (req.method === 'GET') {
        if (!installationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, installationKey, requestUrl.searchParams.get('actorSeatId'), 'shared_read');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const scoped = store.scopes[installationKey] || {
            admin: normalizeTeamRosterAdminRecord({}),
            roster: []
        };
        sendJson(res, 200, {
            ok: true,
            installationKey,
            admin: scoped.admin,
            rosterCount: scoped.roster.length,
            roster: scoped.roster
        });
        return;
    }

    if (req.method === 'POST') {
        let body;
        try {
            body = await parseBody(req);
        } catch (error) {
            sendJson(res, 400, { ok: false, error: error.message });
            return;
        }

        const bodyInstallationKey = asString(body.installationKey);
        if (!bodyInstallationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, bodyInstallationKey, body.actorSeatId, 'team_roster_publish');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const scoped = store.scopes[bodyInstallationKey] || {
            admin: normalizeTeamRosterAdminRecord({}),
            roster: []
        };
        const admin = Object.prototype.hasOwnProperty.call(body, 'admin')
            ? normalizeTeamRosterAdminRecord(body.admin)
            : scoped.admin;
        const rosterEntry = body.rosterEntry ? normalizeTeamRosterEntryRecord(body.rosterEntry) : null;

        if (Object.prototype.hasOwnProperty.call(body, 'rosterEntry') && !rosterEntry) {
            sendJson(res, 400, { ok: false, error: 'A valid team roster entry with a label is required.' });
            return;
        }

        const nextRoster = Array.isArray(scoped.roster) ? [...scoped.roster] : [];
        if (rosterEntry) {
            const existingIndex = nextRoster.findIndex(item => item.id === rosterEntry.id || item.label === rosterEntry.label);
            if (existingIndex >= 0) {
                nextRoster[existingIndex] = rosterEntry;
            } else {
                nextRoster.push(rosterEntry);
            }
        }

        if (!Object.prototype.hasOwnProperty.call(body, 'admin') && !rosterEntry) {
            sendJson(res, 400, { ok: false, error: 'Provide admin metadata, a roster entry, or both.' });
            return;
        }

        store.scopes[bodyInstallationKey] = {
            admin,
            roster: nextRoster
        };
        saveTeamRosterStore(store);
        const auditStore = loadAuditLogStore();
        appendAuditEvent(auditStore, {
            installationKey: bodyInstallationKey,
            category: 'team_roster',
            action: rosterEntry ? 'upsert' : 'admin_update',
            targetLabel: rosterEntry ? rosterEntry.label : 'Workspace admin metadata',
            actorLabel: auth.actorSeat?.label || asString(body.deviceLabel) || admin.coordinator || 'Backend runtime',
            deviceLabel: asString(body.deviceLabel),
            note: rosterEntry
                ? `Stored shared team roster entry "${rosterEntry.label}".`
                : 'Stored shared team admin metadata.'
        });

        sendJson(res, 200, {
            ok: true,
            message: rosterEntry
                ? `Stored shared team roster entry "${rosterEntry.label}".`
                : 'Stored shared team admin metadata.',
            installationKey: bodyInstallationKey,
            admin,
            rosterEntry,
            rosterCount: nextRoster.length,
            roster: nextRoster
        });
        return;
    }

    sendJson(res, 405, { ok: false, error: 'Use GET or POST for team roster sync.' });
}

async function handleTeamSeats(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    const store = loadTeamSeatStore();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));

    if (req.method === 'GET') {
        if (!installationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
            return;
        }
        const auth = resolveAuthorizedSeatAction(req, installationKey, requestUrl.searchParams.get('actorSeatId'), 'shared_read');
        if (!auth.ok) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const seats = getScopedTeamSeats(store, installationKey);
        sendJson(res, 200, {
            ok: true,
            installationKey,
            seatCount: seats.length,
            seats: seats.map(toPublicTeamSeatRecord).filter(Boolean)
        });
        return;
    }

    if (req.method === 'POST') {
        let body;
        try {
            body = await parseBody(req);
        } catch (error) {
            sendJson(res, 400, { ok: false, error: error.message });
            return;
        }

        const bodyInstallationKey = asString(body.installationKey);
        if (!bodyInstallationKey) {
            sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
            return;
        }

        const seat = normalizeTeamSeatRecord(body.seatEntry);
        const accessCode = asString(body.accessCode);
        if (!seat) {
            sendJson(res, 400, { ok: false, error: 'A valid team seat object with a label is required.' });
            return;
        }

        const scopedSeats = getScopedTeamSeats(store, bodyInstallationKey);
        let auth = resolveAuthorizedSeatAction(req, bodyInstallationKey, body.actorSeatId, 'team_seat_publish');
        const bootstrapAllowed = auth.bootstrapAllowed && scopedSeats.length === 0;
        if (bootstrapAllowed && seat.roleKey !== 'workspace_admin') {
            sendJson(res, 403, {
                ok: false,
                error: 'The first shared team seat for an installation must be an active Workspace Admin seat.',
                bootstrapAllowed: true
            });
            return;
        }
        if (bootstrapAllowed && seat.stateKey !== 'active') {
            sendJson(res, 403, {
                ok: false,
                error: 'The first shared team seat for an installation must be active.',
                bootstrapAllowed: true
            });
            return;
        }
        if (!auth.ok && !bootstrapAllowed) {
            sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
            return;
        }

        const nextSeats = [...scopedSeats];
        const existingIndex = nextSeats.findIndex(item => item.id === seat.id || item.label === seat.label);
        const existingSeat = existingIndex >= 0 ? nextSeats[existingIndex] : null;
        const nextSeat = {
            ...seat,
            accessCodeHint: asString(seat.accessCodeHint || existingSeat?.accessCodeHint)
        };
        if (accessCode) {
            nextSeat.accessCodeSalt = `seat_code_${crypto.randomBytes(8).toString('hex')}`;
            nextSeat.accessCodeHash = deriveSeatAccessCodeHash(accessCode, nextSeat.accessCodeSalt);
        } else {
            nextSeat.accessCodeSalt = asString(existingSeat?.accessCodeSalt);
            nextSeat.accessCodeHash = asString(existingSeat?.accessCodeHash);
        }
        nextSeat.authEnabled = !!(nextSeat.accessCodeSalt && nextSeat.accessCodeHash);
        if (existingIndex >= 0) {
            nextSeats[existingIndex] = nextSeat;
        } else {
            nextSeats.push(nextSeat);
        }
        store.scopes[bodyInstallationKey] = nextSeats;
        saveTeamSeatStore(store);
        const auditStore = loadAuditLogStore();
        appendAuditEvent(auditStore, {
            installationKey: bodyInstallationKey,
            category: 'team_seat',
            action: existingIndex >= 0 ? 'update' : 'upsert',
            targetLabel: nextSeat.label,
            actorLabel: auth.actorSeat?.label || asString(body.deviceLabel) || nextSeat.label,
            deviceLabel: asString(body.deviceLabel),
            note: bootstrapAllowed
                ? `Bootstrapped first shared team seat "${nextSeat.label}".`
                : `Stored shared team seat "${nextSeat.label}".${accessCode ? ' Access code posture was updated.' : ''}`
        });

        sendJson(res, 200, {
            ok: true,
            message: bootstrapAllowed
                ? `Bootstrapped the first shared team seat "${nextSeat.label}".`
                : `Stored shared team seat "${nextSeat.label}".`,
            installationKey: bodyInstallationKey,
            seat: toPublicTeamSeatRecord(nextSeat),
            seatCount: nextSeats.length,
            seats: nextSeats.map(toPublicTeamSeatRecord).filter(Boolean),
            bootstrapAllowed
        });
        return;
    }

    sendJson(res, 405, { ok: false, error: 'Use GET or POST for team seat sync.' });
}

async function handleTeamSeatRecovery(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST for team seat recovery actions.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const targetSeatId = asString(body.targetSeatId);
    const recoveryAction = asString(body.recoveryAction);
    const nextAccessCode = asString(body.nextAccessCode);
    const nextAccessCodeHint = asString(body.nextAccessCodeHint);
    const note = asString(body.note);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!targetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required.' });
        return;
    }

    const actionDefinition = getTeamSeatRecoveryActionDefinition(recoveryAction);
    if (!actionDefinition) {
        sendJson(res, 400, { ok: false, error: `Unsupported recoveryAction "${recoveryAction}".` });
        return;
    }
    if (recoveryAction === 'rotate_access_code' && nextAccessCode.length < 6) {
        sendJson(res, 400, { ok: false, error: 'nextAccessCode must be at least 6 characters when rotating shared sign-in.' });
        return;
    }

    const store = loadTeamSeatStore();
    const scopedSeats = [...getScopedTeamSeats(store, installationKey)];
    if (!scopedSeats.length) {
        sendJson(res, 404, { ok: false, error: 'No shared team seats exist for this installation yet.' });
        return;
    }

    const auth = resolveAuthorizedSeatAction(req, installationKey, body.actorSeatId, 'team_seat_publish');
    if (!auth.ok || !auth.actorSeat) {
        sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
        return;
    }

    const targetIndex = scopedSeats.findIndex(seat => seat.id === targetSeatId);
    if (targetIndex < 0) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${targetSeatId}".` });
        return;
    }

    const targetSeat = scopedSeats[targetIndex];
    if (recoveryAction === 'suspend_seat'
        && asString(targetSeat.roleKey) === 'workspace_admin'
        && asString(targetSeat.stateKey) === 'active'
        && countActiveWorkspaceAdmins(scopedSeats, targetSeat.id) === 0) {
        sendJson(res, 403, {
            ok: false,
            error: `Cannot suspend "${targetSeat.label}" because it is the last active Workspace Admin seat for this installation.`
        });
        return;
    }

    let consumedApproval = null;
    if (APPROVAL_GATED_TEAM_SEAT_RECOVERY_ACTIONS.includes(recoveryAction)) {
        const approvalStore = loadAdminActionApprovalStore();
        const approvedRecord = findMatchingApprovedAdminActionApproval(approvalStore, installationKey, {
            actionType: 'team_seat_recovery',
            recoveryAction,
            targetSeatId
        });
        if (!approvedRecord) {
            const matchingApprovals = listMatchingOpenAdminActionApprovals(approvalStore, installationKey, {
                actionType: 'team_seat_recovery',
                recoveryAction,
                targetSeatId
            });
            const hasPendingApproval = matchingApprovals.some(record => record.status === 'pending');
            sendJson(res, 409, {
                ok: false,
                error: hasPendingApproval
                    ? `${actionDefinition.label} still has a pending admin approval review for "${targetSeat.label}". Finish the review in /admin, then retry the action.`
                    : `${actionDefinition.label} requires an approved admin action request first. Request and approve it in /admin, then retry the action.`,
                approvalRequired: true,
                requiredApprovalType: 'team_seat_recovery',
                recoveryAction,
                targetSeatId,
                matchingApprovals
            });
            return;
        }
        consumedApproval = approvedRecord;
    }

    let nextSeat = targetSeat;
    let seatChanged = false;
    if (recoveryAction === 'rotate_access_code') {
        const salt = `seat_code_${crypto.randomBytes(8).toString('hex')}`;
        nextSeat = normalizeTeamSeatRecord({
            ...targetSeat,
            accessCodeHint: nextAccessCodeHint || targetSeat.accessCodeHint,
            accessCodeSalt: salt,
            accessCodeHash: deriveSeatAccessCodeHash(nextAccessCode, salt),
            updatedAt: new Date().toISOString()
        });
        if (!nextSeat) {
            sendJson(res, 500, { ok: false, error: 'Could not normalize the rotated team seat state.' });
            return;
        }
        nextSeat.accessCodeSalt = salt;
        nextSeat.accessCodeHash = deriveSeatAccessCodeHash(nextAccessCode, salt);
        nextSeat.authEnabled = true;
        seatChanged = true;
    } else if (recoveryAction === 'disable_sign_in') {
        nextSeat = normalizeTeamSeatRecord({
            ...targetSeat,
            accessCodeHint: '',
            accessCodeSalt: '',
            accessCodeHash: '',
            updatedAt: new Date().toISOString()
        });
        if (!nextSeat) {
            sendJson(res, 500, { ok: false, error: 'Could not normalize the disabled team seat sign-in posture.' });
            return;
        }
        nextSeat.accessCodeSalt = '';
        nextSeat.accessCodeHash = '';
        nextSeat.authEnabled = false;
        seatChanged = true;
    } else if (recoveryAction === 'suspend_seat' || recoveryAction === 'restore_active') {
        const nextStateKey = recoveryAction === 'suspend_seat' ? 'suspended' : 'active';
        const nextStateDefinition = getTeamSeatStateDefinition(nextStateKey);
        nextSeat = normalizeTeamSeatRecord({
            ...targetSeat,
            stateKey: nextStateKey,
            stateLabel: nextStateDefinition.label,
            updatedAt: new Date().toISOString()
        });
        if (!nextSeat) {
            sendJson(res, 500, { ok: false, error: 'Could not normalize the recovered team seat state.' });
            return;
        }
        seatChanged = true;
    }

    if (seatChanged) {
        scopedSeats[targetIndex] = nextSeat;
        store.scopes[installationKey] = scopedSeats;
        saveTeamSeatStore(store);
    }

    const revokedSessionCount = actionDefinition.invalidatesSessions
        ? revokeSeatSessionsForSeat(installationKey, targetSeat.id)
        : 0;
    const clearedLockoutCount = actionDefinition.clearsLockout
        ? clearSeatSignInThrottleForSeat(installationKey, targetSeat.id)
        : 0;
    if (consumedApproval) {
        const approvalStore = loadAdminActionApprovalStore();
        const consumedRecord = consumeAdminActionApproval(approvalStore, installationKey, consumedApproval.id, auth.actorSeat);
        if (consumedRecord) {
            consumedApproval = consumedRecord;
            const approvalAuditStore = loadAuditLogStore();
            appendAuditEvent(approvalAuditStore, {
                installationKey,
                category: 'admin_action_approval',
                action: 'consume',
                targetLabel: nextSeat.label,
                actorLabel: auth.actorSeat.label,
                deviceLabel: asString(body.deviceLabel),
                note: `Consumed approved ${actionDefinition.label} request for "${nextSeat.label}".`
            });
        }
    }
    const auditStore = loadAuditLogStore();
    const actionParts = [
        `${actionDefinition.label} for "${targetSeat.label}"`,
        revokedSessionCount ? `revoked ${revokedSessionCount} active session${revokedSessionCount === 1 ? '' : 's'}` : '',
        clearedLockoutCount ? `cleared ${clearedLockoutCount} lockout path${clearedLockoutCount === 1 ? '' : 's'}` : '',
        consumedApproval ? `approval ${consumedApproval.id} consumed` : '',
        note ? `note: ${note}` : ''
    ].filter(Boolean);
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_seat_recovery',
        action: recoveryAction,
        targetLabel: nextSeat.label,
        actorLabel: auth.actorSeat.label,
        deviceLabel: asString(body.deviceLabel),
        note: actionParts.join(' • ')
    });

    sendJson(res, 200, {
        ok: true,
        message: `${actionDefinition.label} completed for "${nextSeat.label}".`,
        installationKey,
        recoveryAction,
        seat: toPublicTeamSeatRecord(nextSeat),
        seatCount: scopedSeats.length,
        seats: scopedSeats.map(toPublicTeamSeatRecord).filter(Boolean),
        approval: consumedApproval ? toPublicAdminActionApprovalRecord(consumedApproval) : null,
        revokedSessionCount,
        clearedLockoutCount
    });
}

async function handleTeamSeatRecoveryCodeIssue(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to issue a temporary team-seat recovery code.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const targetSeatId = asString(body.targetSeatId);
    const note = asString(body.note);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!targetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required.' });
        return;
    }

    const store = loadTeamSeatStore();
    const scopedSeats = getScopedTeamSeats(store, installationKey);
    if (!scopedSeats.length) {
        sendJson(res, 404, { ok: false, error: 'No shared team seats exist for this installation yet.' });
        return;
    }

    const auth = resolveAuthorizedSeatAction(req, installationKey, body.actorSeatId, 'team_seat_publish');
    if (!auth.ok || !auth.actorSeat) {
        sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
        return;
    }

    const targetSeat = scopedSeats.find(seat => seat.id === targetSeatId);
    if (!targetSeat) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${targetSeatId}".` });
        return;
    }
    if (asString(targetSeat.stateKey) === 'suspended') {
        sendJson(res, 409, {
            ok: false,
            error: `Restore "${targetSeat.label}" to active or review-only posture before issuing a one-time recovery code.`
        });
        return;
    }

    const issued = issueSeatRecoveryCodeRecord(installationKey, auth.actorSeat, targetSeat, asString(body.deviceLabel), note);
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_seat_recovery_code',
        action: 'issue',
        targetLabel: targetSeat.label,
        actorLabel: auth.actorSeat.label,
        deviceLabel: asString(body.deviceLabel),
        note: `Issued one-time recovery code for "${targetSeat.label}"${note ? ` • ${note}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Issued one-time recovery code for "${targetSeat.label}".`,
        installationKey,
        targetSeatId: targetSeat.id,
        targetLabel: targetSeat.label,
        issuedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
        deliveryRefId: issued.deliveryRefId,
        recoveryCode: issued.recoveryCode,
        recoveryLinkToken: buildSignedActionLinkToken('seat_recovery', installationKey, targetSeat.id, issued.recoveryCode, issued.expiresAt)
    });
}

async function handleTeamSeatRecoveryCodeRedeem(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to redeem a temporary team-seat recovery code.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const recoveryCode = asString(body.recoveryCode);
    const recoveryLinkToken = asString(body.recoveryLinkToken);
    const nextAccessCode = asString(body.nextAccessCode);
    const nextAccessCodeHint = asString(body.nextAccessCodeHint);
    const deviceLabel = asString(body.deviceLabel);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!recoveryCode && !recoveryLinkToken) {
        sendJson(res, 400, { ok: false, error: 'Either recoveryCode or recoveryLinkToken is required.' });
        return;
    }
    if (nextAccessCode.length < 6) {
        sendJson(res, 400, { ok: false, error: 'nextAccessCode must be at least 6 characters when redeeming a recovery code.' });
        return;
    }

    let resolvedTargetSeatId = asString(body.targetSeatId);
    let resolvedRecoveryCode = recoveryCode;
    if (recoveryLinkToken) {
        const linkCheck = verifySignedActionLinkToken(recoveryLinkToken, 'seat_recovery', installationKey);
        if (!linkCheck.ok || !linkCheck.payload) {
            sendJson(res, linkCheck.status || 401, { ok: false, error: linkCheck.error });
            return;
        }
        resolvedTargetSeatId = resolvedTargetSeatId || linkCheck.payload.targetSeatId;
        resolvedRecoveryCode = resolvedRecoveryCode || linkCheck.payload.oneTimeCode;
    }
    if (!resolvedTargetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required unless a valid signed recovery link is provided.' });
        return;
    }

    const recoveryMatch = lookupSeatRecoveryCodeRecord(installationKey, resolvedTargetSeatId, resolvedRecoveryCode);
    if (!recoveryMatch.ok || !recoveryMatch.record) {
        sendJson(res, recoveryMatch.status || 401, { ok: false, error: recoveryMatch.error });
        return;
    }

    const store = loadTeamSeatStore();
    const scopedSeats = [...getScopedTeamSeats(store, installationKey)];
    const targetIndex = scopedSeats.findIndex(seat => seat.id === resolvedTargetSeatId);
    if (targetIndex < 0) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${resolvedTargetSeatId}".` });
        return;
    }

    const targetSeat = scopedSeats[targetIndex];
    if (asString(targetSeat.stateKey) === 'suspended') {
        sendJson(res, 409, {
            ok: false,
            error: `Seat "${targetSeat.label}" is suspended. Restore it before redeeming a one-time recovery code.`
        });
        return;
    }
    const nextSeat = normalizeTeamSeatRecord({
        ...targetSeat,
        accessCodeHint: nextAccessCodeHint || targetSeat.accessCodeHint,
        updatedAt: new Date().toISOString()
    });
    if (!nextSeat) {
        sendJson(res, 500, { ok: false, error: 'Could not normalize the redeemed team seat state.' });
        return;
    }
    const salt = `seat_code_${crypto.randomBytes(8).toString('hex')}`;
    nextSeat.accessCodeSalt = salt;
    nextSeat.accessCodeHash = deriveSeatAccessCodeHash(nextAccessCode, salt);
    nextSeat.authEnabled = true;
    scopedSeats[targetIndex] = nextSeat;
    store.scopes[installationKey] = scopedSeats;
    saveTeamSeatStore(store);

    const access = authorizeSeatAction(store, installationKey, nextSeat.id, 'shared_read');
    if (!access.ok || !access.actorSeat) {
        sendJson(res, access.status || 403, { ok: false, error: access.error || 'This seat cannot sign in through recovery in its current state.' });
        return;
    }

    consumeSeatRecoveryCodeRecord(recoveryMatch.recoveryHash);
    const revokedSessionCount = revokeSeatSessionsForSeat(installationKey, nextSeat.id);
    const clearedLockoutCount = clearSeatSignInThrottleForSeat(installationKey, nextSeat.id);
    const issued = issueSeatSessionRecord(installationKey, access.actorSeat, deviceLabel, 'recovery_code');
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_seat_recovery_code',
        action: 'redeem',
        targetLabel: nextSeat.label,
        actorLabel: nextSeat.label,
        deviceLabel,
        note: `Redeemed one-time recovery code for "${nextSeat.label}"${revokedSessionCount ? ` • revoked ${revokedSessionCount} older session${revokedSessionCount === 1 ? '' : 's'}` : ''}${clearedLockoutCount ? ` • cleared ${clearedLockoutCount} lockout path${clearedLockoutCount === 1 ? '' : 's'}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Recovery code redeemed for "${nextSeat.label}". A fresh short-lived seat session is active.`,
        installationKey,
        actorSeatId: nextSeat.id,
        actorLabel: nextSeat.label,
        authMode: 'recovery_code',
        issuedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
        sessionToken: issued.sessionToken,
        revokedSessionCount,
        clearedLockoutCount,
        seat: toPublicTeamSeatRecord(nextSeat)
    });
}

async function handleTeamSeatInviteIssue(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to issue a temporary seat invite.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const targetSeatId = asString(body.targetSeatId);
    const note = asString(body.note);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!targetSeatId) {
        sendJson(res, 400, { ok: false, error: 'targetSeatId is required.' });
        return;
    }

    const store = loadTeamSeatStore();
    const scopedSeats = getScopedTeamSeats(store, installationKey);
    if (!scopedSeats.length) {
        sendJson(res, 404, { ok: false, error: 'No shared team seats exist for this installation yet.' });
        return;
    }

    const auth = resolveAuthorizedSeatAction(req, installationKey, body.actorSeatId, 'team_seat_publish');
    if (!auth.ok || !auth.actorSeat) {
        sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
        return;
    }

    const targetSeat = scopedSeats.find(seat => seat.id === targetSeatId);
    if (!targetSeat) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches targetSeatId "${targetSeatId}".` });
        return;
    }
    if (asString(targetSeat.stateKey) === 'suspended') {
        sendJson(res, 409, {
            ok: false,
            error: `Restore "${targetSeat.label}" before issuing a seat invite. Suspended seats should not self-enroll.`
        });
        return;
    }

    const issued = issueSeatInviteRecord(installationKey, auth.actorSeat, targetSeat, asString(body.deviceLabel), note);
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_seat_invite',
        action: 'issue',
        targetLabel: targetSeat.label,
        actorLabel: auth.actorSeat.label,
        deviceLabel: asString(body.deviceLabel),
        note: `Issued one-time seat invite for "${targetSeat.label}"${note ? ` • ${note}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Issued one-time seat invite for "${targetSeat.label}".`,
        installationKey,
        targetSeatId: targetSeat.id,
        targetLabel: targetSeat.label,
        issuedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
        deliveryRefId: issued.deliveryRefId,
        inviteCode: issued.inviteCode,
        inviteLinkToken: buildSignedActionLinkToken('seat_invite', installationKey, targetSeat.id, issued.inviteCode, issued.expiresAt)
    });
}

async function handleTeamSeatInviteRedeem(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to redeem a temporary seat invite.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const inviteCode = asString(body.inviteCode);
    const inviteLinkToken = asString(body.inviteLinkToken);
    const nextAccessCode = asString(body.nextAccessCode);
    const nextAccessCodeHint = asString(body.nextAccessCodeHint);
    const deviceLabel = asString(body.deviceLabel);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!inviteCode && !inviteLinkToken) {
        sendJson(res, 400, { ok: false, error: 'Either inviteCode or inviteLinkToken is required.' });
        return;
    }
    if (nextAccessCode.length < 6) {
        sendJson(res, 400, { ok: false, error: 'nextAccessCode must be at least 6 characters when redeeming a seat invite.' });
        return;
    }

    let resolvedInviteCode = inviteCode;
    let resolvedTargetSeatId = '';
    if (inviteLinkToken) {
        const linkCheck = verifySignedActionLinkToken(inviteLinkToken, 'seat_invite', installationKey);
        if (!linkCheck.ok || !linkCheck.payload) {
            sendJson(res, linkCheck.status || 401, { ok: false, error: linkCheck.error });
            return;
        }
        resolvedInviteCode = resolvedInviteCode || linkCheck.payload.oneTimeCode;
        resolvedTargetSeatId = linkCheck.payload.targetSeatId;
    }

    const inviteMatch = lookupSeatInviteRecord(installationKey, resolvedInviteCode);
    if (!inviteMatch.ok || !inviteMatch.record) {
        sendJson(res, inviteMatch.status || 401, { ok: false, error: inviteMatch.error });
        return;
    }

    const store = loadTeamSeatStore();
    const scopedSeats = [...getScopedTeamSeats(store, installationKey)];
    const inviteTargetSeatId = resolvedTargetSeatId || inviteMatch.record.targetSeatId;
    const targetIndex = scopedSeats.findIndex(seat => seat.id === inviteTargetSeatId);
    if (targetIndex < 0) {
        sendJson(res, 404, { ok: false, error: `No shared team seat matches invite target "${inviteTargetSeatId}".` });
        return;
    }

    const targetSeat = scopedSeats[targetIndex];
    if (asString(targetSeat.stateKey) === 'suspended') {
        sendJson(res, 409, {
            ok: false,
            error: `Seat "${targetSeat.label}" is suspended. Restore it before redeeming a seat invite.`
        });
        return;
    }

    const nextSeat = normalizeTeamSeatRecord({
        ...targetSeat,
        accessCodeHint: nextAccessCodeHint || targetSeat.accessCodeHint,
        updatedAt: new Date().toISOString()
    });
    if (!nextSeat) {
        sendJson(res, 500, { ok: false, error: 'Could not normalize the invited team seat state.' });
        return;
    }
    const salt = `seat_code_${crypto.randomBytes(8).toString('hex')}`;
    nextSeat.accessCodeSalt = salt;
    nextSeat.accessCodeHash = deriveSeatAccessCodeHash(nextAccessCode, salt);
    nextSeat.authEnabled = true;
    scopedSeats[targetIndex] = nextSeat;
    store.scopes[installationKey] = scopedSeats;
    saveTeamSeatStore(store);

    const access = authorizeSeatAction(store, installationKey, nextSeat.id, 'shared_read');
    if (!access.ok || !access.actorSeat) {
        sendJson(res, access.status || 403, { ok: false, error: access.error || 'This seat cannot finish invite sign-in in its current state.' });
        return;
    }

    consumeSeatInviteRecord(inviteMatch.inviteHash);
    const revokedSessionCount = revokeSeatSessionsForSeat(installationKey, nextSeat.id);
    const clearedLockoutCount = clearSeatSignInThrottleForSeat(installationKey, nextSeat.id);
    const issued = issueSeatSessionRecord(installationKey, access.actorSeat, deviceLabel, 'seat_invite');
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_seat_invite',
        action: 'redeem',
        targetLabel: nextSeat.label,
        actorLabel: nextSeat.label,
        deviceLabel,
        note: `Redeemed one-time seat invite for "${nextSeat.label}"${revokedSessionCount ? ` • revoked ${revokedSessionCount} older session${revokedSessionCount === 1 ? '' : 's'}` : ''}${clearedLockoutCount ? ` • cleared ${clearedLockoutCount} lockout path${clearedLockoutCount === 1 ? '' : 's'}` : ''}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Seat invite redeemed for "${nextSeat.label}". A fresh short-lived seat session is active.`,
        installationKey,
        actorSeatId: nextSeat.id,
        actorLabel: nextSeat.label,
        authMode: 'seat_invite',
        issuedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
        sessionToken: issued.sessionToken,
        revokedSessionCount,
        clearedLockoutCount,
        seat: toPublicTeamSeatRecord(nextSeat)
    });
}

async function handleAuditLog(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }

    if (req.method !== 'GET') {
        sendJson(res, 405, { ok: false, error: 'Use GET for backend audit log retrieval.' });
        return;
    }

    const store = loadAuditLogStore();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const installationKey = asString(requestUrl.searchParams.get('installationKey'));
    const actorSeatId = asString(requestUrl.searchParams.get('actorSeatId'));
    const limit = Math.max(1, Math.min(50, Number(requestUrl.searchParams.get('limit') || 12)));
    const filters = parseAuditFiltersFromUrl(requestUrl);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey query parameter is required.' });
        return;
    }
    const auth = resolveAuthorizedSeatAction(req, installationKey, actorSeatId, 'audit_read');
    if (!auth.ok) {
        sendJson(res, auth.status || 403, { ok: false, error: auth.error, bootstrapAllowed: auth.bootstrapAllowed });
        return;
    }

    const allEntries = filterAuditEntries(store.scopes[installationKey], filters);
    const entries = allEntries.slice(0, limit);
    sendJson(res, 200, {
        ok: true,
        installationKey,
        filters,
        eventCount: entries.length,
        totalMatched: allEntries.length,
        entries
    });
}

async function handleSeatSessionIssue(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to issue a short-lived seat session.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const actorSeatId = asString(body.actorSeatId);
    const actorSeatCode = asString(body.actorSeatCode);
    const deviceLabel = asString(body.deviceLabel);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }
    if (!actorSeatId) {
        sendJson(res, 400, { ok: false, error: 'actorSeatId is required to issue a short-lived seat session.' });
        return;
    }

    const teamSeatStore = loadTeamSeatStore();
    const scopedSeats = getScopedTeamSeats(teamSeatStore, installationKey);
    if (!scopedSeats.length) {
        sendJson(res, 403, {
            ok: false,
            error: 'Create and publish the shared team-seat library first. Short-lived seat sessions only start after a named shared seat exists.'
        });
        return;
    }

    const auth = authorizeSeatAction(teamSeatStore, installationKey, actorSeatId, 'shared_read');
    if (!auth.ok || !auth.actorSeat) {
        sendJson(res, auth.status || 403, {
            ok: false,
            error: auth.error || 'The selected seat cannot issue a shared-read session.'
        });
        return;
    }

    const validApiKey = requestHasValidApiKey(req);
    const signInThrottleKey = getSeatSignInThrottleKey(req, installationKey, actorSeatId);
    const throttleState = !validApiKey ? getSeatSignInThrottleState(signInThrottleKey) : null;
    if (!validApiKey && throttleState?.locked) {
        const message = `Seat sign-in is temporarily locked for this seat/client path. Retry in about ${throttleState.retryAfterSeconds} seconds or use the backend API bootstrap key.`;
        const auditStore = loadAuditLogStore();
        appendAuditEvent(auditStore, {
            installationKey,
            category: 'team_session',
            action: 'signin_locked',
            targetLabel: auth.actorSeat.label,
            actorLabel: auth.actorSeat.label,
            deviceLabel,
            note: message
        });
        sendJson(res, 429, {
            ok: false,
            error: message
        });
        return;
    }

    const validSeatCode = verifySeatAccessCode(auth.actorSeat, actorSeatCode);
    if (!validApiKey && !validSeatCode) {
        const failed = recordFailedSeatSignIn(signInThrottleKey);
        const auditStore = loadAuditLogStore();
        appendAuditEvent(auditStore, {
            installationKey,
            category: 'team_session',
            action: failed.locked ? 'signin_locked' : 'signin_failed',
            targetLabel: auth.actorSeat.label,
            actorLabel: auth.actorSeat.label,
            deviceLabel,
            note: failed.locked
                ? `Seat sign-in locked after repeated failed attempts for "${auth.actorSeat.label}".`
                : `Seat sign-in failed for "${auth.actorSeat.label}". Remaining attempts before lock: ${failed.remaining}.`
        });
        sendJson(res, failed.locked ? 429 : 401, {
            ok: false,
            error: auth.actorSeat.authEnabled
                ? failed.locked
                    ? `Seat sign-in is temporarily locked for this seat/client path. Retry in about ${failed.retryAfterSeconds} seconds or use the backend API bootstrap key.`
                    : `Provide a valid seat access code or backend API bootstrap key before issuing a seat session. ${failed.remaining} attempt${failed.remaining === 1 ? '' : 's'} left before temporary lock.`
                : 'This seat does not have shared sign-in enabled yet. Use the backend API bootstrap key or publish an access code for the seat first.'
        });
        return;
    }

    if (validSeatCode) {
        clearSeatSignInThrottle(signInThrottleKey);
    }
    const authMode = validSeatCode ? 'seat_code' : 'api_key';
    const issued = issueSeatSessionRecord(installationKey, auth.actorSeat, deviceLabel, authMode);
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_session',
        action: 'issue',
        targetLabel: auth.actorSeat.label,
        actorLabel: auth.actorSeat.label,
        deviceLabel,
        note: `Issued short-lived seat session for "${auth.actorSeat.label}" via ${authMode === 'seat_code' ? 'seat sign-in' : 'API bootstrap'}.`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Issued short-lived seat session for "${auth.actorSeat.label}".`,
        installationKey,
        actorSeatId: auth.actorSeat.id,
        actorLabel: auth.actorSeat.label,
        authMode,
        issuedAt: issued.issuedAt,
        expiresAt: issued.expiresAt,
        sessionToken: issued.sessionToken
    });
}

async function handleSeatSessionRenew(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to renew a short-lived seat session.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const deviceLabel = asString(body.deviceLabel);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }

    const sessionResult = resolveValidSeatSession(req, installationKey);
    if (!sessionResult.ok || !sessionResult.session) {
        sendJson(res, 401, { ok: false, error: 'A valid short-lived backend seat session is required before it can be renewed.' });
        return;
    }

    const teamSeatStore = loadTeamSeatStore();
    const auth = authorizeSeatAction(teamSeatStore, installationKey, sessionResult.session.actorSeatId, 'shared_read');
    if (!auth.ok || !auth.actorSeat) {
        sendJson(res, auth.status || 403, {
            ok: false,
            error: auth.error || 'The seat tied to this session can no longer renew shared-read access.'
        });
        return;
    }
    if (buildSeatSessionAuthFingerprint(auth.actorSeat) !== asString(sessionResult.session.seatAuthFingerprint)) {
        ACTIVE_SEAT_SESSIONS.delete(sessionResult.session.sessionHash);
        sendJson(res, 401, {
            ok: false,
            error: 'The active seat session is no longer current for this seat. Sign in again.'
        });
        return;
    }

    ACTIVE_SEAT_SESSIONS.delete(sessionResult.session.sessionHash);
    const renewed = issueSeatSessionRecord(installationKey, auth.actorSeat, deviceLabel || sessionResult.session.deviceLabel, 'session_renew');
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_session',
        action: 'renew',
        targetLabel: auth.actorSeat.label,
        actorLabel: auth.actorSeat.label,
        deviceLabel: deviceLabel || sessionResult.session.deviceLabel,
        note: `Renewed short-lived seat session for "${auth.actorSeat.label}".`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Renewed short-lived seat session for "${auth.actorSeat.label}".`,
        installationKey,
        actorSeatId: auth.actorSeat.id,
        actorLabel: auth.actorSeat.label,
        authMode: 'session_renew',
        issuedAt: renewed.issuedAt,
        expiresAt: renewed.expiresAt,
        sessionToken: renewed.sessionToken
    });
}

async function handleSeatSessionRevoke(req, res) {
    if (req.method === 'OPTIONS') {
        sendJson(res, 204, { ok: true });
        return;
    }
    if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'Use POST to revoke a short-lived seat session.' });
        return;
    }

    let body;
    try {
        body = await parseBody(req);
    } catch (error) {
        sendJson(res, 400, { ok: false, error: error.message });
        return;
    }

    const installationKey = asString(body.installationKey);
    const deviceLabel = asString(body.deviceLabel);
    if (!installationKey) {
        sendJson(res, 400, { ok: false, error: 'installationKey is required.' });
        return;
    }

    const sessionResult = resolveValidSeatSession(req, installationKey);
    if (!sessionResult.ok || !sessionResult.session) {
        sendJson(res, 401, { ok: false, error: 'A valid short-lived backend seat session is required before it can be revoked.' });
        return;
    }

    const revoked = revokeSeatSessionByToken(req.headers['x-session-token']);
    const auditStore = loadAuditLogStore();
    appendAuditEvent(auditStore, {
        installationKey,
        category: 'team_session',
        action: 'revoke',
        targetLabel: sessionResult.session.actorLabel,
        actorLabel: sessionResult.session.actorLabel,
        deviceLabel: deviceLabel || sessionResult.session.deviceLabel,
        note: `Revoked short-lived seat session for "${sessionResult.session.actorLabel}".`
    });

    sendJson(res, 200, {
        ok: true,
        message: `Revoked short-lived seat session for "${sessionResult.session.actorLabel}".`,
        installationKey,
        actorSeatId: revoked?.actorSeatId || sessionResult.session.actorSeatId,
        actorLabel: revoked?.actorLabel || sessionResult.session.actorLabel
    });
}

async function handleRequest(req, res) {
    const store = loadLicenseStore();
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `${HOST}:${PORT}`}`);

    if (requestUrl.pathname === '/admin' || requestUrl.pathname === '/admin/') {
        serveAdminAsset(res, ADMIN_INDEX_FILE, 'text/html; charset=utf-8');
        return;
    }

    if (requestUrl.pathname === '/admin/app.js') {
        serveAdminAsset(res, ADMIN_APP_JS_FILE, 'application/javascript; charset=utf-8');
        return;
    }

    if (requestUrl.pathname === '/admin/app.css') {
        serveAdminAsset(res, ADMIN_APP_CSS_FILE, 'text/css; charset=utf-8');
        return;
    }

    if (requestUrl.pathname === '/health') {
        const operationsReadiness = buildOperationalReadiness();
        sendJson(res, 200, {
            ok: true,
            backendLabel: store.backendLabel,
            entitlementSource: BACKEND_ENTITLEMENT_SOURCE,
            entitlementSourceLabel: getEntitlementSourceDefinition().label,
            storageDriver: STORAGE_DRIVER,
            sourceFile: formatDisplayPath(store.sourceFile),
            dataDirectory: formatDisplayPath(DATA_DIR),
            sqliteFile: usesSqliteStorage() ? formatDisplayPath(SQLITE_FILE) : '',
            licenseCount: store.licenses.length,
            operationsReadinessReady: operationsReadiness.ready,
            operationsReadinessScore: operationsReadiness.score,
            now: new Date().toISOString()
        });
        return;
    }

    if (requestUrl.pathname === '/api/entitlement/example') {
        handleExample(res, store);
        return;
    }

    if (requestUrl.pathname === '/api/audit-log/example') {
        handleAuditLogExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/posture') {
        handleAdminPosture(res, store);
        return;
    }

    if (requestUrl.pathname === '/api/admin/session-context') {
        await handleAdminSessionContext(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/audit-export') {
        await handleAdminAuditExport(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/action-approvals') {
        await handleAdminActionApprovals(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/action-approvals/request') {
        await handleAdminActionApprovalRequest(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/action-approvals/review') {
        await handleAdminActionApprovalReview(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/delivery-trail') {
        await handleAdminDeliveryTrail(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/delivery-trail/record') {
        await handleAdminDeliveryTrailRecord(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/delivery-trail/acknowledge') {
        await handleAdminDeliveryTrailAcknowledge(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/admin/delivery-dispatch/prepare') {
        await handleAdminDeliveryDispatchPrepare(req, res);
        return;
    }

    if (routeRequiresApiKeyOnly(requestUrl.pathname) && req.method !== 'OPTIONS' && !requestHasValidApiKey(req)) {
        sendJson(res, 401, {
            ok: false,
            error: hasConfiguredApiKeys()
                ? 'Backend API key is missing or invalid for this bootstrap-only route.'
                : 'Backend auth is not configured.'
        });
        return;
    }

    if (routeRequiresProtectedAuth(requestUrl.pathname) && req.method !== 'OPTIONS' && !requestHasValidProtectedAuth(req)) {
        sendJson(res, 401, {
            ok: false,
            error: hasConfiguredApiKeys()
                ? 'A backend API key or valid short-lived seat session is required for this protected premium route.'
                : 'Backend auth is not configured.'
        });
        return;
    }

    if (requestUrl.pathname === '/api/entitlement/resolve') {
        await handleResolve(req, res, store);
        return;
    }

    if (requestUrl.pathname === '/api/company-profiles/example') {
        handleCompanyProfileExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/company-profiles') {
        await handleCompanyProfiles(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-handbacks/example') {
        handleTeamHandbackExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-handbacks') {
        await handleTeamHandbacks(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-roster/example') {
        handleTeamRosterExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-roster') {
        await handleTeamRoster(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/example') {
        handleTeamSeatExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/recovery/example') {
        handleTeamSeatRecoveryExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/recovery-code/issue/example') {
        handleTeamSeatRecoveryCodeIssueExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/recovery-code/redeem/example') {
        handleTeamSeatRecoveryCodeRedeemExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/invite/issue/example') {
        handleTeamSeatInviteIssueExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/invite/redeem/example') {
        handleTeamSeatInviteRedeemExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/seat-session/example') {
        handleSeatSessionExample(res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats') {
        await handleTeamSeats(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/recovery') {
        await handleTeamSeatRecovery(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/recovery-code/issue') {
        await handleTeamSeatRecoveryCodeIssue(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/recovery-code/redeem') {
        await handleTeamSeatRecoveryCodeRedeem(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/invite/issue') {
        await handleTeamSeatInviteIssue(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/team-seats/invite/redeem') {
        await handleTeamSeatInviteRedeem(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/seat-session/issue') {
        await handleSeatSessionIssue(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/seat-session/renew') {
        await handleSeatSessionRenew(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/seat-session/revoke') {
        await handleSeatSessionRevoke(req, res);
        return;
    }

    if (requestUrl.pathname === '/api/audit-log') {
        await handleAuditLog(req, res);
        return;
    }

    sendJson(res, 404, {
        ok: false,
        error: 'Route not found.',
        availableRoutes: ['/admin', '/admin/app.js', '/admin/app.css', '/health', '/api/admin/posture', '/api/admin/session-context', '/api/admin/audit-export', '/api/admin/action-approvals', '/api/admin/action-approvals/request', '/api/admin/action-approvals/review', '/api/admin/delivery-trail', '/api/admin/delivery-trail/record', '/api/admin/delivery-trail/acknowledge', '/api/admin/delivery-dispatch/prepare', '/api/entitlement/example', '/api/entitlement/resolve', '/api/company-profiles/example', '/api/company-profiles', '/api/team-handbacks/example', '/api/team-handbacks', '/api/team-roster/example', '/api/team-roster', '/api/team-seats/example', '/api/team-seats', '/api/team-seats/recovery/example', '/api/team-seats/recovery', '/api/team-seats/recovery-code/issue/example', '/api/team-seats/recovery-code/issue', '/api/team-seats/recovery-code/redeem/example', '/api/team-seats/recovery-code/redeem', '/api/team-seats/invite/issue/example', '/api/team-seats/invite/issue', '/api/team-seats/invite/redeem/example', '/api/team-seats/invite/redeem', '/api/seat-session/example', '/api/seat-session/issue', '/api/seat-session/renew', '/api/seat-session/revoke', '/api/audit-log/example', '/api/audit-log']
    });
}

function runCheck() {
    const store = loadLicenseStore();
    const profileStore = loadCompanyProfileStore();
    const teamHandbackStore = loadTeamHandbackStore();
    const teamRosterStore = loadTeamRosterStore();
    const teamSeatStore = loadTeamSeatStore();
    const auditStore = loadAuditLogStore();
    const approvalStore = loadAdminActionApprovalStore();
    const deliveryStore = loadAdminDeliveryTrailStore();
    const operationsReadiness = buildOperationalReadiness();
    if (!store.licenses.length) {
        throw new Error(`No license records found in ${formatDisplayPath(store.sourceFile)}`);
    }

    console.log('BACKEND CHECK OK');
    console.log(`- source: ${formatDisplayPath(store.sourceFile)}`);
    console.log(`- entitlement source: ${BACKEND_ENTITLEMENT_SOURCE} (${getEntitlementSourceDefinition().label})`);
    console.log(`- storage driver: ${STORAGE_DRIVER}`);
    console.log(`- data directory: ${formatDisplayPath(DATA_DIR)}`);
    console.log(`- custom data directory: ${DATA_DIR !== DEFAULT_DATA_DIR ? 'enabled' : 'disabled'}`);
    if (usesSqliteStorage()) {
        console.log(`- sqlite file: ${formatDisplayPath(SQLITE_FILE)}`);
    }
    console.log(`- backend label: ${store.backendLabel}`);
    console.log(`- licenses: ${store.licenses.length}`);
    console.log(`- API key protection: ${hasConfiguredApiKeys() ? 'enabled' : 'disabled (dev mode)'}`);
    console.log(`- allowed origins: ${hasAllowedOrigins() ? ALLOWED_ORIGINS.join(', ') : '*'}`);
    console.log(`- action-link signing secret: ${ACTION_LINK_SECRET_SOURCE}`);
    console.log(`- premium ops readiness: ${operationsReadiness.score}% (${operationsReadiness.ready ? 'ready' : 'incomplete'})`);
    if (!operationsReadiness.ready) {
        console.log(`- premium ops missing: ${operationsReadiness.missing.join(', ')}`);
    }
    console.log(`- seat session TTL (minutes): ${Math.round(SEAT_SESSION_TTL_MS / 60000)}`);
    console.log(`- seat recovery code TTL (minutes): ${Math.round(SEAT_RECOVERY_CODE_TTL_MS / 60000)}`);
    console.log(`- seat invite code TTL (minutes): ${Math.round(SEAT_INVITE_CODE_TTL_MS / 60000)}`);
    console.log(`- admin action approval TTL (minutes): ${Math.round(ADMIN_ACTION_APPROVAL_TTL_MS / 60000)}`);
    console.log(`- seat sign-in attempts before lock: ${MAX_SEAT_SIGNIN_ATTEMPTS}`);
    console.log(`- seat sign-in window (minutes): ${Math.round(SEAT_SIGNIN_WINDOW_MS / 60000)}`);
    console.log(`- seat sign-in lockout (minutes): ${Math.round(SEAT_SIGNIN_LOCKOUT_MS / 60000)}`);
    console.log(`- shared company profile store: ${formatDisplayPath(profileStore.sourceFile)}`);
    console.log(`- shared team handback store: ${formatDisplayPath(teamHandbackStore.sourceFile)}`);
    console.log(`- shared team roster store: ${formatDisplayPath(teamRosterStore.sourceFile)}`);
    console.log(`- shared team seat store: ${formatDisplayPath(teamSeatStore.sourceFile)}`);
    console.log(`- audit log store: ${formatDisplayPath(auditStore.sourceFile)}`);
    console.log(`- admin action approval store: ${formatDisplayPath(approvalStore.sourceFile)}`);
    console.log(`- admin delivery trail store: ${formatDisplayPath(deliveryStore.sourceFile)}`);
    console.log(`- admin console route: /admin`);
}

if (process.argv.includes('--check')) {
    runCheck();
    process.exit(0);
}

const server = http.createServer((req, res) => {
    applyResponseSecurityHeaders(req, res);
    handleRequest(req, res).catch(error => {
        sendJson(res, 500, {
            ok: false,
            error: error instanceof Error ? error.message : 'Unhandled server error.'
        });
    });
});

server.listen(PORT, HOST, () => {
    const store = loadLicenseStore();
    const profileStore = loadCompanyProfileStore();
    const teamHandbackStore = loadTeamHandbackStore();
    const teamRosterStore = loadTeamRosterStore();
    const teamSeatStore = loadTeamSeatStore();
    const auditStore = loadAuditLogStore();
    const operationsReadiness = buildOperationalReadiness();
    console.log(`PV Premium Sync Reference Server listening on http://${HOST}:${PORT}`);
    console.log(`- data source: ${formatDisplayPath(store.sourceFile)}`);
    console.log(`- entitlement source: ${BACKEND_ENTITLEMENT_SOURCE} (${getEntitlementSourceDefinition().label})`);
    console.log(`- storage driver: ${STORAGE_DRIVER}`);
    console.log(`- data directory: ${formatDisplayPath(DATA_DIR)}`);
    console.log(`- custom data directory: ${DATA_DIR !== DEFAULT_DATA_DIR ? 'enabled' : 'disabled'}`);
    if (usesSqliteStorage()) {
        console.log(`- sqlite file: ${formatDisplayPath(SQLITE_FILE)}`);
    }
    console.log(`- API key protection: ${hasConfiguredApiKeys() ? 'enabled' : 'disabled (dev mode)'}`);
    console.log(`- allowed origins: ${hasAllowedOrigins() ? ALLOWED_ORIGINS.join(', ') : '*'}`);
    console.log(`- action-link signing secret: ${ACTION_LINK_SECRET_SOURCE}`);
    console.log(`- premium ops readiness: ${operationsReadiness.score}% (${operationsReadiness.ready ? 'ready' : 'incomplete'})`);
    if (!operationsReadiness.ready) {
        console.log(`- premium ops missing: ${operationsReadiness.missing.join(', ')}`);
    }
    console.log(`- seat session TTL (minutes): ${Math.round(SEAT_SESSION_TTL_MS / 60000)}`);
    console.log(`- seat recovery code TTL (minutes): ${Math.round(SEAT_RECOVERY_CODE_TTL_MS / 60000)}`);
    console.log(`- seat invite code TTL (minutes): ${Math.round(SEAT_INVITE_CODE_TTL_MS / 60000)}`);
    console.log(`- seat sign-in attempts before lock: ${MAX_SEAT_SIGNIN_ATTEMPTS}`);
    console.log(`- seat sign-in window (minutes): ${Math.round(SEAT_SIGNIN_WINDOW_MS / 60000)}`);
    console.log(`- seat sign-in lockout (minutes): ${Math.round(SEAT_SIGNIN_LOCKOUT_MS / 60000)}`);
    console.log(`- shared profile source: ${formatDisplayPath(profileStore.sourceFile)}`);
    console.log(`- shared handback source: ${formatDisplayPath(teamHandbackStore.sourceFile)}`);
    console.log(`- shared team roster source: ${formatDisplayPath(teamRosterStore.sourceFile)}`);
    console.log(`- shared team seat source: ${formatDisplayPath(teamSeatStore.sourceFile)}`);
    console.log(`- audit log source: ${formatDisplayPath(auditStore.sourceFile)}`);
    console.log(`- admin console route: /admin`);
    console.log(`- routes: /admin, /admin/app.js, /admin/app.css, /health, /api/admin/posture, /api/admin/session-context, /api/admin/audit-export, /api/admin/action-approvals, /api/admin/action-approvals/request, /api/admin/action-approvals/review, /api/admin/delivery-trail, /api/admin/delivery-trail/record, /api/admin/delivery-trail/acknowledge, /api/admin/delivery-dispatch/prepare, /api/entitlement/example, /api/entitlement/resolve, /api/company-profiles/example, /api/company-profiles, /api/team-handbacks/example, /api/team-handbacks, /api/team-roster/example, /api/team-roster, /api/team-seats/example, /api/team-seats, /api/team-seats/recovery/example, /api/team-seats/recovery, /api/team-seats/recovery-code/issue/example, /api/team-seats/recovery-code/issue, /api/team-seats/recovery-code/redeem/example, /api/team-seats/recovery-code/redeem, /api/team-seats/invite/issue/example, /api/team-seats/invite/issue, /api/team-seats/invite/redeem/example, /api/team-seats/invite/redeem, /api/seat-session/example, /api/seat-session/issue, /api/seat-session/renew, /api/seat-session/revoke, /api/audit-log/example, /api/audit-log`);
});
