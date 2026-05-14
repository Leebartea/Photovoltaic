# Backend Backup And Restore Guide

## Purpose

This guide covers the new operational backup and restore path for the premium backend.

It is the next closeout layer after:

- deployment hardening
- durable storage

## What Exists Now

The repo now includes:

- `scripts/backend_backup.js`
- `scripts/backend_restore.js`
- `scripts/backend_backup_prune.js`
- `_test_backend_backup_restore.js`
- `_test_backend_backup_prune.js`

The scripts support both runtime storage modes:

- `json`
- `sqlite`

The restore smoke test currently proves the premium sqlite path end to end.

## Operational Rule

For restore:

- stop the backend first

Do not restore into a live-running backend process.

For backup:

- backup is safest when the backend is stopped
- sqlite mode is the main production path this guide assumes

## Backup Command

Example:

```bash
BACKEND_STORAGE_DRIVER=sqlite \
BACKEND_SQLITE_FILE=/var/lib/pv-premium-sync/premium_sync.sqlite \
BACKEND_DATA_DIR=/var/lib/pv-premium-sync \
node scripts/backend_backup.js /var/backups/pv-premium-sync/manual-2026-03-29
```

What it writes:

- backup directory
- `manifest.json`
- copied runtime files inside `files/`

In sqlite mode it captures:

- the sqlite database file
- `-wal` if present
- `-shm` if present

In json mode it captures the runtime JSON files.

## Restore Command

Example:

```bash
BACKEND_STORAGE_DRIVER=sqlite \
BACKEND_SQLITE_FILE=/var/lib/pv-premium-sync/premium_sync.sqlite \
BACKEND_DATA_DIR=/var/lib/pv-premium-sync \
node scripts/backend_restore.js /var/backups/pv-premium-sync/manual-2026-03-29
```

What it does:

- reads `manifest.json`
- restores the captured files back into the active runtime path
- replaces the current sqlite runtime files in sqlite mode

## Recommended Backup Policy For Premium V1

For a single-node premium deployment:

- daily scheduled backup
- pre-release manual backup
- pre-maintenance manual backup
- explicit restore smoke test on a non-production copy at least once per release cycle

Minimum retention recommendation:

- daily backups: 7 to 14 days
- weekly backups: 4 to 8 weeks
- pre-release snapshots: keep until the next stable release is accepted

For the actual pruning and scheduler examples, use:

- `Helpful Md/BACKEND_BACKUP_RETENTION_AND_SCHEDULING_GUIDE.md`

## Recommended Restore Test Procedure

1. stop backend
2. take backup
3. mutate or advance runtime state
4. stop backend
5. restore backup
6. start backend
7. verify the expected pre-mutation state is back

That exact pattern is now exercised by:

```bash
node --experimental-sqlite _test_backend_backup_restore.js
```

## Release Gate Coverage

The premium release gate now includes:

- sqlite smoke
- backup/restore smoke

That means the premium gate now verifies:

- backend posture
- admin routes
- security flow
- sqlite persistence
- restore rollback behavior

## What Still Remains After This

This closes the backup/restore tooling gap.

The remaining real closeout items are now:

- actual scheduler on the host
- entitlement source-of-truth decision
- Postgres only if you choose multi-instance hosting
