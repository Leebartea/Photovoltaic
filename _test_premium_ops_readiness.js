const { spawnSync } = require('child_process');
const path = require('path');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function runWithEnv(extraEnv = {}) {
    return spawnSync(process.execPath, ['scripts/premium_ops_readiness.js', '--strict'], {
        cwd: __dirname,
        env: {
            ...process.env,
            ...extraEnv
        },
        encoding: 'utf8'
    });
}

function run() {
    const strictMissing = runWithEnv({
        BACKEND_STORAGE_DRIVER: '',
        BACKEND_SQLITE_FILE: '',
        BACKEND_DATA_DIR: '',
        BACKEND_API_KEY: '',
        BACKEND_API_KEYS: '',
        BACKEND_ALLOWED_ORIGINS: '',
        BACKEND_ACTION_LINK_SECRET: '',
        BACKEND_BACKUP_ROOT_DIR: '',
        BACKEND_BACKUP_SCHEDULE_CRON: '',
        BACKEND_BACKUP_KEEP_COUNT: '',
        BACKEND_BACKUP_KEEP_DAYS: '',
        BACKEND_BACKUP_OWNER: '',
        BACKEND_BACKUP_REVIEW_CHANNEL: '',
        BACKEND_RESTORE_OWNER: '',
        BACKEND_RESTORE_DRILL_CADENCE: '',
        BACKEND_AUDIT_RETENTION_DAYS: '',
        BACKEND_DELIVERY_RETENTION_DAYS: '',
        BACKEND_APPROVAL_RETENTION_DAYS: '',
        BACKEND_INCIDENT_OWNER: '',
        BACKEND_INCIDENT_CHANNEL: '',
        BACKEND_INCIDENT_RUNBOOK_URL: '',
        BACKEND_ENTITLEMENT_SOURCE: ''
    });

    const missingOutput = `${strictMissing.stdout || ''}${strictMissing.stderr || ''}`;
    assert(strictMissing.status !== 0, 'Strict ops readiness should fail when required premium env vars are missing.');
    assert(missingOutput.includes('PV Premium Operations Readiness'), 'Ops readiness output should include the report header.');
    assert(missingOutput.includes('Entitlement source frozen'), 'Ops readiness output should include entitlement source checks.');
    assert(missingOutput.includes('Backup owner'), 'Ops readiness output should include backup ownership checks.');
    assert(missingOutput.includes('Incident runbook'), 'Ops readiness output should include incident runbook checks.');

    const strictReady = runWithEnv({
        BACKEND_ENTITLEMENT_SOURCE: 'manual_admin',
        BACKEND_STORAGE_DRIVER: 'sqlite',
        BACKEND_SQLITE_FILE: '/var/lib/pv-premium-sync/premium_sync.sqlite',
        BACKEND_DATA_DIR: '/var/lib/pv-premium-sync',
        BACKEND_API_KEY: 'ops-check-secret',
        BACKEND_API_KEYS: '',
        BACKEND_ALLOWED_ORIGINS: 'https://pv.example.com',
        BACKEND_ACTION_LINK_SECRET: 'ops-link-secret',
        BACKEND_BACKUP_ROOT_DIR: '/var/backups/pv-premium-sync',
        BACKEND_BACKUP_SCHEDULE_CRON: '10 2 * * *',
        BACKEND_BACKUP_KEEP_COUNT: '14',
        BACKEND_BACKUP_KEEP_DAYS: '30',
        BACKEND_BACKUP_OWNER: 'Platform Ops',
        BACKEND_BACKUP_REVIEW_CHANNEL: '#pv-premium-ops',
        BACKEND_RESTORE_OWNER: 'Staff Engineer',
        BACKEND_RESTORE_DRILL_CADENCE: 'once-per-release',
        BACKEND_AUDIT_RETENTION_DAYS: '90',
        BACKEND_DELIVERY_RETENTION_DAYS: '90',
        BACKEND_APPROVAL_RETENTION_DAYS: '120',
        BACKEND_INCIDENT_OWNER: 'On-call Lead',
        BACKEND_INCIDENT_CHANNEL: '#pv-incidents',
        BACKEND_INCIDENT_RUNBOOK_URL: 'https://ops.example.com/runbooks/pv-premium'
    });

    const readyOutput = `${strictReady.stdout || ''}${strictReady.stderr || ''}`;
    assert(strictReady.status === 0, `Strict ops readiness should pass when all premium ops env vars are configured. Output: ${readyOutput}`);
    assert(readyOutput.includes('- readiness: 100%'), `Ops readiness should report 100% when fully configured. Output: ${readyOutput}`);
    assert(readyOutput.includes('Operations ownership and retention posture is fully configured.'), 'Ops readiness should report a complete configuration when all checks pass.');
}

run();
