# Deployment Playbook: Free And Premium

## Purpose

This is the practical deployment plan for this product.

Use it when you want to answer:

- what is the easiest totally free way to ship the app
- what is the right premium deployment shape
- when a backend is actually required
- what the clean stop-point is before this turns into endless infrastructure work

## Short Recommendation

### If you want the easiest totally free deployment

Use one of these:

1. No hosting at all:
   - ship `pv_calculator_ui.html`
   - best for offline field use, demos, USB/WhatsApp/email handoff, and zero infrastructure
2. Static hosting:
   - deploy `dist/web/`
   - recommended default: GitHub Pages
   - good alternatives: Netlify static deploy or Cloudflare Pages

This path keeps:

- core calculator
- proposal workflow
- PDF export
- project saves in browser
- offline-first behavior

This path does **not** include trusted premium backend sync.

### If you want premium trusted workflow

Use a hybrid deployment:

1. static frontend host for `dist/web/`
2. Node backend host for `backend/server.js`
3. persistent writable storage for backend runtime data

Recommended default:

- frontend: GitHub Pages or Netlify
- backend: Render web service
- backend storage: mounted persistent disk

This is the cleanest way to keep the calculator static/offline-first while moving only trust-sensitive premium workflow server-side.

### Where Oracle Cloud fits

Oracle Cloud Always Free is a legitimate option when you want:

- a genuinely free backend host
- one small premium backend instance
- full control over cron, sqlite files, backups, and reverse-proxy posture

It is **not** the least complicated option.

Compared with GitHub Pages or Netlify static hosting, Oracle adds:

- VM setup
- firewall and port posture
- process supervision
- TLS / reverse-proxy handling
- disk layout and backup scripting
- more operator responsibility

So the honest recommendation is:

- for free static/frontend-only hosting: GitHub Pages or Netlify is simpler
- for free backend hosting with more ops tolerance: Oracle Cloud Always Free is strong
- for premium hybrid with less ops friction: Render is still the cleaner default

## Honest Platform Answer

### Can GitHub Pages still be used?

Yes, for the frontend.

GitHub Pages is still a valid home for:

- `dist/web/pv_calculator_ui.html`
- `dist/web/assets/app.css`
- `dist/web/assets/app.js`
- the normal static calculator runtime

GitHub Pages is **not** a Node host, so it cannot run:

- `backend/server.js`
- shared seat sessions
- entitlement sync
- shared company-profile sync
- admin console routes
- audit/export/delivery routes

So the moment premium backend sync is turned on, hosting becomes:

1. static frontend host
2. separate backend host

That is the correct tradeoff, not a mistake in the architecture.

## Deployment Modes

## Mode 1: Offline File Only

Use this when:

- you want zero hosting
- you want the easiest field handoff
- you want a no-account/no-server path

Steps:

1. Build once:

```bash
node scripts/build_artifacts.js
```

2. Verify:

```bash
npm run typecheck
node scripts/build_artifacts.js --check
```

3. Distribute:

- `pv_calculator_ui.html`

This is the most friction-free path in the whole product.

## Mode 2: Totally Free Static Deployment

This is the best answer when you want a public web link without paying for backend hosting.

The repo now also includes concrete starter files for this path:

- `.github/workflows/deploy-pages.yml`
- `netlify.toml`

### Recommended default: GitHub Pages

Why:

- it cleanly fits `dist/web/`
- it is officially available on GitHub Free for public repositories
- it matches the current static artifact layout well

Steps:

1. Install dependencies once in a fresh checkout:

```bash
npm ci
```

2. Build artifacts:

```bash
node scripts/build_artifacts.js
```

3. Run the free release gate:

```bash
npm run release:gate:free
```

Use the broader pass when you want the fuller regression set:

```bash
npm run release:gate:free:full
```

4. Publish the contents of `dist/web/` to a static host.

The hosted bundle now includes both:

- `dist/web/pv_calculator_ui.html`
- `dist/web/index.html`

so a plain static host can open the app at `/` without a custom rewrite.

For GitHub Pages, use the official Pages workflow documented by GitHub.

For the exact repo-specific GitHub Pages launch path and the dated host recommendation, also use:

- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`
- `Helpful Md/HOSTING_RECOMMENDATION_AND_REMOTE_DEPLOYMENT_GUIDE.md`

### Other good static options

- Netlify:
  - good when you want fast drag-and-drop or Git-connected static deploys
- Cloudflare Pages:
  - good when you want direct upload or Git integration on a static edge host

For this product shape, GitHub Pages and Netlify are the best low-complication free options.

Why:

- the app is static/offline-first by design
- `dist/web/` now includes `index.html`
- no backend is needed for the free path
- both platforms remove server maintenance entirely

These are still frontend-only/static solutions in this product.

## Mode 3: Premium Hybrid Deployment

This is the right path when you want:

- trusted premium entitlement sync
- shared brand/profile libraries
- shared handbacks
- team seats and sessions
- admin console
- audit/export/delivery workflow

The repo now also includes a concrete starter file for this path:

- `render.yaml`

### Recommended default shape

- frontend: GitHub Pages or Netlify
- backend: Render web service
- backend storage: persistent disk mounted to a writable path

### Lower-cash but higher-ops alternative

- frontend: GitHub Pages or Netlify
- backend: Oracle Cloud Always Free VM
- backend storage: VM-attached persistent disk

Choose this only when:

- monthly cost must stay as close to zero as possible
- you are comfortable running and securing a Linux VM
- you are willing to own cron, process restart, disk care, and network posture yourself

Why this is the clean default:

- frontend stays cheap and static
- backend only carries trust-sensitive premium workflow
- Render cleanly supports Node web services
- Render explicitly requires public web services to bind on `0.0.0.0`
- Render persistent disks preserve filesystem changes across deploys and restarts

### Premium deployment steps

1. Build and verify the frontend:

```bash
npm ci
node scripts/build_artifacts.js
npm run release:gate:premium
```

Use the broader pass when you want the fuller frontend regression set too:

```bash
npm run release:gate:premium:full
```

2. Deploy the frontend:

- publish `dist/web/` on a static host

3. Prepare the backend environment:

- start from `backend/.env.example`
- set a real public-facing backend environment, not dev defaults

Minimum production env:

- `HOST=0.0.0.0`
- `PORT=<platform port or default>`
- `BACKEND_STORAGE_DRIVER=sqlite`
- `BACKEND_SQLITE_FILE`
- `BACKEND_API_KEY` or `BACKEND_API_KEYS`
- `BACKEND_ALLOWED_ORIGINS`
- `BACKEND_ACTION_LINK_SECRET`
- `BACKEND_DATA_DIR`

Recommended security env:

- `BACKEND_SEAT_CODE_PEPPER`
- `BACKEND_RECOVERY_CODE_PEPPER`

Required premium ops ownership env:

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

4. Put backend runtime data on persistent writable storage:

Example:

```bash
BACKEND_STORAGE_DRIVER=sqlite
BACKEND_SQLITE_FILE=/var/lib/pv-premium-sync/premium_sync.sqlite
BACKEND_DATA_DIR=/var/lib/pv-premium-sync
```

In this repo:

- `BACKEND_SQLITE_FILE` is the durable single-node database path
- `BACKEND_DATA_DIR` remains the JSON-mode data root and the default parent path for sqlite storage

The durable sqlite layer now persists:

- licenses
- shared profiles
- team handbacks
- team roster
- team seats
- audit log
- admin approvals
- delivery trail

The bundled example files remain in `backend/data/*.example.json` and are used only as the seed/fallback reference layer.

5. Start the backend:

```bash
node --experimental-sqlite backend/server.js
```

With the current local Node `22.12.x`, the sqlite driver still requires the experimental flag.

On a newer Node runtime where `node:sqlite` no longer needs that flag, the normal command is:

```bash
node backend/server.js
```

6. Run the deployment-host ops gate:

```bash
npm run ops:check:premium
npm run ops:check:premium:strict
```

The strict pass is the honest public-paid readiness check for the deployed backend host.

7. Point the frontend at the backend:

- use the existing backend runtime config surface in the app
- or inject runtime config for your hosted frontend if you add that later

8. Verify posture after deploy:

```bash
node backend/server.js --check
```

Review:

- API key protection
- allowed origins
- action-link signing secret source
- data directory
- shared store paths

## What Is Actually Required For Public Paid V1

These are the remaining necessary actions before the premium lane is honestly closed for a public paid launch:

1. Apply the real env vars and TLS on the deployed host
2. Run on persistent writable storage
3. Apply the real host scheduler for backup/prune
4. Pass `npm run ops:check:premium:strict` on that host

Everything else should be treated as optional unless it maps directly to those items.

## Honest Security Answer

### Is frontend-only unsafe because users can inspect it in DevTools?

Not by itself.

Frontend code being visible is normal.

The real rule is:

- anything in frontend code is visible
- anything in frontend code is user-controllable

So frontend-only is acceptable for:

- transparent calculator formulas
- UI behavior
- offline workflow
- community or demo posture

Frontend-only is **not** where trusted secrets should live:

- API keys
- license authority
- team seat trust
- approval decisions
- private shared premium state

That is why the current recommendation is hybrid, not backend-for-everything and not frontend-for-secrets.

## Release Gate

This repo now has a practical release gate:

- `npm run release:gate:free`
- `npm run release:gate:free:full`
- `npm run release:gate:premium`
- `npm run release:gate:premium:full`
- `npm run ops:check:premium`
- `npm run ops:check:premium:strict`

Use:

- `free` for standalone/static deployment
- `premium` for any deployment that includes the backend premium lane

List the exact executed steps with:

```bash
node scripts/release_gate.js free --list
node scripts/release_gate.js premium --list
```

## Best Recommendation By Scenario

### Scenario A: I want the easiest zero-cost path

Choose:

- `pv_calculator_ui.html` for no-host offline distribution
- GitHub Pages for a free public static link

Stop there unless you truly need shared premium trust features.

### Scenario B: I want branded/team/premium workflow but low operational complexity

Choose:

- static frontend host
- one Render backend service
- one persistent disk
- one admin-managed entitlement flow

This is the cleanest premium `v1` shape.

### Scenario C: I want public paid self-serve subscriptions

Do not stop at JSON-on-disk.

Before that launch, add:

- durable database
- billing entitlement source of truth
- backup and restore process
- release/smoke gate in your deployment pipeline

## Related Internal Docs

- [README](../README.md)
- [Deployment Artifacts And Runtime](DEPLOYMENT_ARTIFACTS_AND_RUNTIME.md)
- [Deployment Templates And Provider Setup Guide](DEPLOYMENT_TEMPLATES_AND_PROVIDER_SETUP_GUIDE.md)
- [Optional Backend Foundation Guide](OPTIONAL_BACKEND_FOUNDATION_GUIDE.md)
- [Backend SQLite Storage Guide](BACKEND_SQLITE_STORAGE_GUIDE.md)
- [Backend Backup And Restore Guide](BACKEND_BACKUP_AND_RESTORE_GUIDE.md)
- [Backend Backup Retention And Scheduling Guide](BACKEND_BACKUP_RETENTION_AND_SCHEDULING_GUIDE.md)
- [Premium Operations Ownership And Readiness Guide](PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md)
- [Premium V1 Closeout Checklist](PREMIUM_V1_CLOSEOUT_CHECKLIST.md)
- [Backend Security And Audit Guide](BACKEND_SECURITY_AND_AUDIT_GUIDE.md)

## Official Hosting References

- GitHub Pages quickstart: [docs.github.com/en/pages/quickstart](https://docs.github.com/en/pages/quickstart)
- Netlify getting started: [docs.netlify.com/start/overview](https://docs.netlify.com/start/overview/)
- Cloudflare Pages getting started: [developers.cloudflare.com/pages/get-started](https://developers.cloudflare.com/pages/get-started/)
- Render web services: [render.com/docs/web-services](https://render.com/docs/web-services)
- Render persistent disks: [render.com/docs/disks](https://render.com/docs/disks)
