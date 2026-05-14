# Premium Operations Ownership And Readiness Guide

## Purpose

This guide closes the next real public-paid gap after:

- durable storage
- backup / restore tooling
- backup retention tooling
- entitlement source-of-truth freeze

It exists to answer:

- why the repo could honestly be `beta-ready` before public paid `v1` was fully closed
- who owns premium backup, restore, and incident response
- which deployment values must be present before calling premium operations `ready`
- which command should be run on the actual premium host

## Why `Beta Readiness` Was Already Honest

`Controlled premium beta readiness` meant:

- the premium feature surface existed
- the trust boundary existed
- the backend security primitives existed
- the recovery, invite, approval, audit, and delivery flows existed
- trusted teams could operate the system safely with manual ops discipline

It did **not** mean public paid operations were fully closed.

Public paid `v1` still needed:

- named ownership
- fixed retention windows
- a declared scheduler cadence
- an incident runbook reference
- a real host-level readiness check

That is the difference between:

- `100% beta-ready`
- and `not yet 100% public-paid closeout`

## Current Premium V1 Ops Policy Fields

The backend now recognizes these deployment fields:

- `BACKEND_BACKUP_ROOT_DIR`
- `BACKEND_BACKUP_SCHEDULE_CRON`
- `BACKEND_BACKUP_KEEP_COUNT`
- `BACKEND_BACKUP_KEEP_DAYS`
- `BACKEND_BACKUP_OWNER`
- `BACKEND_BACKUP_REVIEW_CHANNEL`
- `BACKEND_RESTORE_OWNER`
- `BACKEND_RESTORE_DRILL_CADENCE`
- `BACKEND_AUDIT_RETENTION_DAYS`
- `BACKEND_DELIVERY_RETENTION_DAYS`
- `BACKEND_APPROVAL_RETENTION_DAYS`
- `BACKEND_INCIDENT_OWNER`
- `BACKEND_INCIDENT_CHANNEL`
- `BACKEND_INCIDENT_RUNBOOK_URL`

These sit beside the already-required premium security fields:

- `BACKEND_ENTITLEMENT_SOURCE=manual_admin`
- `BACKEND_STORAGE_DRIVER=sqlite`
- `BACKEND_SQLITE_FILE`
- `BACKEND_DATA_DIR`
- `BACKEND_API_KEY` or `BACKEND_API_KEYS`
- `BACKEND_ALLOWED_ORIGINS`
- `BACKEND_ACTION_LINK_SECRET`

## Required Host Check

Run this on the actual premium backend host after env vars are set:

```bash
npm run ops:check:premium:strict
```

Use the softer preview first if you just want the current score without failing:

```bash
npm run ops:check:premium
```

What the check verifies:

- entitlement source is frozen to `manual_admin`
- storage is using the durable sqlite path
- premium security env is present
- backup root and schedule are declared
- retention windows are declared
- backup review ownership is declared
- restore ownership and drill cadence are declared
- incident ownership and runbook reference are declared

## Example Premium Host Values

```env
BACKEND_ENTITLEMENT_SOURCE=manual_admin
BACKEND_STORAGE_DRIVER=sqlite
BACKEND_SQLITE_FILE=/var/lib/pv-premium-sync/premium_sync.sqlite
BACKEND_DATA_DIR=/var/lib/pv-premium-sync
BACKEND_API_KEY=replace-with-a-long-random-value
BACKEND_ALLOWED_ORIGINS=https://pv.example.com
BACKEND_ACTION_LINK_SECRET=replace-with-a-long-random-value
BACKEND_BACKUP_ROOT_DIR=/var/backups/pv-premium-sync
BACKEND_BACKUP_SCHEDULE_CRON="10 2 * * *"
BACKEND_BACKUP_KEEP_COUNT=14
BACKEND_BACKUP_KEEP_DAYS=30
BACKEND_BACKUP_OWNER="Platform Ops"
BACKEND_BACKUP_REVIEW_CHANNEL="#pv-premium-ops"
BACKEND_RESTORE_OWNER="Staff Engineer"
BACKEND_RESTORE_DRILL_CADENCE=once-per-release
BACKEND_AUDIT_RETENTION_DAYS=90
BACKEND_DELIVERY_RETENTION_DAYS=90
BACKEND_APPROVAL_RETENTION_DAYS=120
BACKEND_INCIDENT_OWNER="On-call Lead"
BACKEND_INCIDENT_CHANNEL="#pv-incidents"
BACKEND_INCIDENT_RUNBOOK_URL=https://ops.example.com/runbooks/pv-premium
```

## Honest Stop Point

From a repo and product perspective, premium public-paid closeout is effectively complete when:

1. the backend runs on durable storage
2. backup / restore / prune tooling is present
3. `npm run ops:check:premium:strict` passes on the real host
4. the host scheduler is actually applied

After that, remaining work is operational execution, not more feature invention.

## Related Files

- `scripts/premium_ops_readiness.js`
- `_test_premium_ops_readiness.js`
- `backend/.env.example`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/PREMIUM_V1_CLOSEOUT_CHECKLIST.md`
- `Helpful Md/BACKEND_BACKUP_AND_RESTORE_GUIDE.md`
- `Helpful Md/BACKEND_BACKUP_RETENTION_AND_SCHEDULING_GUIDE.md`
