# Premium V1 Closeout Checklist

## Purpose

This file exists to stop the premium/backend lane from turning into an endless loop.

It separates:

- what is already good enough
- what is still necessary before calling premium/backend `v1` closed
- what is optional after that

## Current State

The repo already has:

- offline-first core calculator
- optional premium entitlement seam
- optional backend sync seam
- shared company profile sync
- shared team roster and seat sync
- short-lived seat sessions
- seat sign-in, recovery, invite, and signed links
- high-risk admin approval queue
- hosted same-origin admin console
- audit timeline and audit export
- delivery trail
- provider-ready dispatch packs
- delivery acknowledgment

That means the product is no longer missing major trust-boundary primitives.

## Repo Closeout Status

For the repo itself, public paid premium `v1` closeout is now:

- `100%`

That statement is now honest because the remaining work is no longer missing repo capability.

The remaining work is live deployment execution:

- real provider account setup
- real secret values
- real allowed origins
- real host scheduler install
- real live-host validation

So from this point forward, distinguish:

- repo closeout: complete
- live public paid launch execution: still requires host/account rollout

## What Is Already Sufficient For A Controlled Premium Beta

For:

- internal teams
- trusted pilot customers
- low-seat-count rollout
- manual billing or manual entitlement assignment

the premium/backend lane is already functionally sufficient if you also do:

1. set real env vars
2. deploy the backend behind TLS
3. keep regular backups of the backend data directory

In other words:

- no more mandatory product-surface features are required for a controlled beta

## What Is Still Necessary Before Calling Live Public Paid V1 Operationally Closed

These are the remaining necessary items for a real public paid launch on an actual host.

### 1. Production deployment hardening

Must have:

- real `BACKEND_API_KEY` or `BACKEND_API_KEYS`
- real `BACKEND_ALLOWED_ORIGINS`
- real `BACKEND_ACTION_LINK_SECRET`
- real `BACKEND_DATA_DIR` on persistent writable storage
- TLS / HTTPS termination
- reverse-proxy or platform-level rate limiting

Why it is necessary:

- without this, the backend posture is still dev-open or incomplete

### 2. Durable datastore

Single-node durable storage now has a real path:

- SQLite

This repo now supports that path directly.

For public paid `v1`, what still matters is the deployment choice:

- use SQLite for one backend instance
- use Postgres only if multi-instance hosting is expected

Why it is still on the checklist:

- the feature now exists, but production still needs an actual deployed persistent-store decision

### 3. Backup and retention policy

The tooling layer now exists:

- `scripts/backend_backup.js`
- `scripts/backend_restore.js`
- `scripts/backend_backup_prune.js`
- `_test_backend_backup_restore.js`
- `_test_backend_backup_prune.js`

What still must be defined and enforced for public paid `v1`:

- audit retention window
- delivery-trail retention window
- approval retention window
- backup frequency
- restore test procedure

The schedule/pruning guide now lives at:

- `Helpful Md/BACKEND_BACKUP_RETENTION_AND_SCHEDULING_GUIDE.md`
- `Helpful Md/PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md`

Why it is necessary:

- premium trust is not just about auth; it is also about recoverability

### 4. Commercial entitlement source of truth

The repo now freezes the current `v1` choice as:

- `manual_admin`

Meaning:

- backend-managed license records are the current premium authority
- billing-backed authority is not assumed in this repo today

If self-serve billing is planned later, that becomes a deliberate scope expansion.

See:

- `Helpful Md/ENTITLEMENT_SOURCE_OF_TRUTH_GUIDE.md`

### 5. Operational release checklist

Create and use a release gate that checks:

- backend posture endpoint
- seat session flow
- invite flow
- recovery flow
- approval queue flow
- delivery trail flow
- dispatch pack flow
- acknowledgment flow
- audit export flow

This repo now includes the first practical gate:

- `scripts/release_gate.js`
- `npm run release:gate:free`
- `npm run release:gate:premium`
- `scripts/premium_ops_readiness.js`
- `npm run ops:check:premium`
- `npm run ops:check:premium:strict`

For the full deployment path, use:

- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`

Why it is necessary:

- this prevents regressions in the trust-sensitive path

## What Is Explicitly Optional After V1

These should not block `v1` closeout unless you deliberately raise the scope:

- email/SMS/chat provider integration
- SSO / enterprise identity provider
- multi-factor auth
- billing portal polish
- CRM / ERP integrations
- analytics dashboards
- advanced admin notifications
- mobile push or webhook delivery
- server-side calculator math
- private formal-study engine

These are expansion items, not closeout blockers.

## Recommended Stop Rule

Use this rule:

Premium/backend `v1` is closed when:

1. controlled beta is already working
2. the five public-launch necessities above are completed or consciously deferred with a written decision
3. no new feature is added unless it clearly maps to one of those five necessities

If a proposed feature does not map to those necessities, treat it as `post-v1 optional`.

## Best Recommendation

From here, the cleanest path is:

1. finish production hardening
2. deploy the durable sqlite path or consciously choose Postgres
3. define backup frequency, retention, restore cadence, and named ops ownership on the real host
4. run `npm run ops:check:premium:strict` on the real host and make it pass
5. keep `manual_admin` as the live authority unless billing-backed entitlement is deliberately added as a new scope
6. stop

That is the right place to call the premium/backend lane complete without compromise and without turning it into an endless loop.
