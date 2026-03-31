# Backend Backup Retention And Scheduling Guide

## Purpose

This guide closes the next operational gap after backup and restore tooling:

- backup retention
- scheduled execution

The repo now has both the backup/restore layer and the pruning layer.

## What Exists Now

The repo now includes:

- `scripts/backend_backup.js`
- `scripts/backend_restore.js`
- `scripts/backend_backup_prune.js`
- `_test_backend_backup_restore.js`
- `_test_backend_backup_prune.js`

## Recommended Premium V1 Policy

For a single-node premium deployment:

- nightly scheduled backup
- pre-release manual backup
- pre-maintenance manual backup
- retention pruning after each scheduled backup
- restore smoke on a non-production copy at least once per release cycle

Recommended minimum retention:

- keep at least 14 newest scheduled backups
- also prune anything older than 30 days
- keep pre-release snapshots outside the normal rolling directory until the next stable release is accepted

## Prune Command

Example:

```bash
node scripts/backend_backup_prune.js /var/backups/pv-premium-sync --keep-count=14 --keep-days=30
```

Dry run:

```bash
node scripts/backend_backup_prune.js /var/backups/pv-premium-sync --keep-count=14 --keep-days=30 --dry-run
```

The command:

- discovers backup folders with a `manifest.json`
- keeps the newest `keep-count`
- prunes older entries once they are past `keep-days`

## Example Cron Flow

Example nightly backup at 02:10 and prune at 02:20:

```cron
10 2 * * * cd /srv/pv-premium && BACKEND_STORAGE_DRIVER=sqlite BACKEND_SQLITE_FILE=/var/lib/pv-premium-sync/premium_sync.sqlite BACKEND_DATA_DIR=/var/lib/pv-premium-sync node scripts/backend_backup.js /var/backups/pv-premium-sync/backend-backup-$(date +\%F)
20 2 * * * cd /srv/pv-premium && node scripts/backend_backup_prune.js /var/backups/pv-premium-sync --keep-count=14 --keep-days=30
```

If you use another scheduler, keep the same operational order:

1. backup
2. prune

## Release Gate Coverage

The premium release gate now checks:

- sqlite persistence
- backup/restore rollback
- backup-retention pruning

That means the repo now has regression coverage for the core single-node operations path, not just the product routes.

## What Still Remains

After this guide and tooling, the remaining closeout work is narrower:

- use a real scheduler on the deployed host
- run the premium ops readiness guide on the real host and freeze named owners
- move to Postgres only if you decide to run multiple backend instances
