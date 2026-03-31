#!/usr/bin/env node

function asText(value) {
    return String(value || '').trim();
}

function hasConfiguredText(value) {
    const text = asText(value);
    return !!text && !/^replace-with-/i.test(text);
}

function hasPositiveIntegerText(value) {
    return /^[1-9]\d*$/.test(asText(value));
}

function readConfiguredApiKeys() {
    return Array.from(new Set(
        asText(process.env.BACKEND_API_KEYS || process.env.BACKEND_API_KEY)
            .split(',')
            .map(value => value.trim())
            .filter(Boolean)
    ));
}

function buildChecks() {
    const storageDriver = asText(process.env.BACKEND_STORAGE_DRIVER || 'json').toLowerCase();
    const configuredApiKeys = readConfiguredApiKeys();
    const allowedOrigins = asText(process.env.BACKEND_ALLOWED_ORIGINS);
    const actionLinkSecret = asText(process.env.BACKEND_ACTION_LINK_SECRET);
    const entitlementSource = asText(process.env.BACKEND_ENTITLEMENT_SOURCE || 'manual_admin').toLowerCase();

    return [
        {
            label: 'Entitlement source frozen',
            ok: entitlementSource === 'manual_admin',
            detail: entitlementSource || 'missing',
            fix: 'Set BACKEND_ENTITLEMENT_SOURCE=manual_admin.'
        },
        {
            label: 'Durable storage driver',
            ok: storageDriver === 'sqlite',
            detail: storageDriver || 'missing',
            fix: 'Use BACKEND_STORAGE_DRIVER=sqlite for the current single-node premium v1 path.'
        },
        {
            label: 'SQLite file path',
            ok: storageDriver !== 'sqlite' || hasConfiguredText(process.env.BACKEND_SQLITE_FILE),
            detail: storageDriver === 'sqlite' ? (asText(process.env.BACKEND_SQLITE_FILE) || 'missing') : 'not required',
            fix: 'Set BACKEND_SQLITE_FILE to the persistent sqlite file on the host.'
        },
        {
            label: 'Persistent data directory',
            ok: hasConfiguredText(process.env.BACKEND_DATA_DIR),
            detail: asText(process.env.BACKEND_DATA_DIR) || 'missing',
            fix: 'Set BACKEND_DATA_DIR to a persistent writable directory.'
        },
        {
            label: 'API bootstrap protection',
            ok: configuredApiKeys.length > 0 && configuredApiKeys.every(hasConfiguredText),
            detail: configuredApiKeys.length ? `${configuredApiKeys.length} configured` : 'missing',
            fix: 'Set BACKEND_API_KEY or BACKEND_API_KEYS.'
        },
        {
            label: 'Allowed frontend origins',
            ok: hasConfiguredText(allowedOrigins) && allowedOrigins !== '*',
            detail: allowedOrigins || 'missing',
            fix: 'Set BACKEND_ALLOWED_ORIGINS to the real static frontend origins.'
        },
        {
            label: 'Signed-link secret',
            ok: hasConfiguredText(actionLinkSecret),
            detail: actionLinkSecret ? 'configured' : 'missing',
            fix: 'Set BACKEND_ACTION_LINK_SECRET to a long random value.'
        },
        {
            label: 'Backup root directory',
            ok: hasConfiguredText(process.env.BACKEND_BACKUP_ROOT_DIR),
            detail: asText(process.env.BACKEND_BACKUP_ROOT_DIR) || 'missing',
            fix: 'Set BACKEND_BACKUP_ROOT_DIR to the host backup path.'
        },
        {
            label: 'Backup schedule cron',
            ok: hasConfiguredText(process.env.BACKEND_BACKUP_SCHEDULE_CRON),
            detail: asText(process.env.BACKEND_BACKUP_SCHEDULE_CRON) || 'missing',
            fix: 'Record the host backup cron or scheduler expression in BACKEND_BACKUP_SCHEDULE_CRON.'
        },
        {
            label: 'Backup keep-count',
            ok: hasPositiveIntegerText(process.env.BACKEND_BACKUP_KEEP_COUNT),
            detail: asText(process.env.BACKEND_BACKUP_KEEP_COUNT) || 'missing',
            fix: 'Set BACKEND_BACKUP_KEEP_COUNT to a positive integer.'
        },
        {
            label: 'Backup keep-days',
            ok: hasPositiveIntegerText(process.env.BACKEND_BACKUP_KEEP_DAYS),
            detail: asText(process.env.BACKEND_BACKUP_KEEP_DAYS) || 'missing',
            fix: 'Set BACKEND_BACKUP_KEEP_DAYS to a positive integer.'
        },
        {
            label: 'Backup owner',
            ok: hasConfiguredText(process.env.BACKEND_BACKUP_OWNER),
            detail: asText(process.env.BACKEND_BACKUP_OWNER) || 'missing',
            fix: 'Set BACKEND_BACKUP_OWNER to the named owner for scheduled backups.'
        },
        {
            label: 'Backup review channel',
            ok: hasConfiguredText(process.env.BACKEND_BACKUP_REVIEW_CHANNEL),
            detail: asText(process.env.BACKEND_BACKUP_REVIEW_CHANNEL) || 'missing',
            fix: 'Set BACKEND_BACKUP_REVIEW_CHANNEL to the alert or review destination.'
        },
        {
            label: 'Restore owner',
            ok: hasConfiguredText(process.env.BACKEND_RESTORE_OWNER),
            detail: asText(process.env.BACKEND_RESTORE_OWNER) || 'missing',
            fix: 'Set BACKEND_RESTORE_OWNER to the named restore owner.'
        },
        {
            label: 'Restore drill cadence',
            ok: hasConfiguredText(process.env.BACKEND_RESTORE_DRILL_CADENCE),
            detail: asText(process.env.BACKEND_RESTORE_DRILL_CADENCE) || 'missing',
            fix: 'Set BACKEND_RESTORE_DRILL_CADENCE to the agreed restore-test frequency.'
        },
        {
            label: 'Audit retention days',
            ok: hasPositiveIntegerText(process.env.BACKEND_AUDIT_RETENTION_DAYS),
            detail: asText(process.env.BACKEND_AUDIT_RETENTION_DAYS) || 'missing',
            fix: 'Set BACKEND_AUDIT_RETENTION_DAYS to a positive integer.'
        },
        {
            label: 'Delivery retention days',
            ok: hasPositiveIntegerText(process.env.BACKEND_DELIVERY_RETENTION_DAYS),
            detail: asText(process.env.BACKEND_DELIVERY_RETENTION_DAYS) || 'missing',
            fix: 'Set BACKEND_DELIVERY_RETENTION_DAYS to a positive integer.'
        },
        {
            label: 'Approval retention days',
            ok: hasPositiveIntegerText(process.env.BACKEND_APPROVAL_RETENTION_DAYS),
            detail: asText(process.env.BACKEND_APPROVAL_RETENTION_DAYS) || 'missing',
            fix: 'Set BACKEND_APPROVAL_RETENTION_DAYS to a positive integer.'
        },
        {
            label: 'Incident owner',
            ok: hasConfiguredText(process.env.BACKEND_INCIDENT_OWNER),
            detail: asText(process.env.BACKEND_INCIDENT_OWNER) || 'missing',
            fix: 'Set BACKEND_INCIDENT_OWNER to the incident-response owner.'
        },
        {
            label: 'Incident channel',
            ok: hasConfiguredText(process.env.BACKEND_INCIDENT_CHANNEL),
            detail: asText(process.env.BACKEND_INCIDENT_CHANNEL) || 'missing',
            fix: 'Set BACKEND_INCIDENT_CHANNEL to the escalation destination.'
        },
        {
            label: 'Incident runbook',
            ok: hasConfiguredText(process.env.BACKEND_INCIDENT_RUNBOOK_URL),
            detail: asText(process.env.BACKEND_INCIDENT_RUNBOOK_URL) || 'missing',
            fix: 'Set BACKEND_INCIDENT_RUNBOOK_URL to the live incident/runbook reference.'
        }
    ];
}

function printSummary(checks, strict) {
    const passed = checks.filter(item => item.ok).length;
    const score = Math.round((passed / checks.length) * 100);
    const missing = checks.filter(item => !item.ok);

    console.log('PV Premium Operations Readiness');
    console.log(`- mode: ${strict ? 'strict' : 'advisory'}`);
    console.log(`- readiness: ${score}%`);
    console.log(`- passed: ${passed}/${checks.length}`);

    checks.forEach(item => {
        const mark = item.ok ? '[x]' : '[ ]';
        console.log(`${mark} ${item.label} :: ${item.detail}`);
    });

    if (missing.length) {
        console.log('\nMissing items:');
        missing.forEach(item => {
            console.log(`- ${item.label}: ${item.fix}`);
        });
    } else {
        console.log('\nOperations ownership and retention posture is fully configured.');
    }

    return {
        score,
        complete: missing.length === 0
    };
}

const strict = process.argv.includes('--strict');
const checks = buildChecks();
const summary = printSummary(checks, strict);

if (strict && !summary.complete) {
    process.exit(1);
}
