# Oracle Cloud Always Free Backend Guide

## Purpose

Use this guide when you want to keep the frontend on:

- GitHub Pages
- or Netlify

and add the premium backend later on Oracle Cloud Always Free.

This is the right interpretation of the current architecture:

- static frontend stays static
- Oracle hosts only the trusted backend lane

## Best Use Case

Choose this path when:

- frontend cost should stay at zero
- backend cost should also stay near zero
- you are comfortable owning Linux VM operations

Do **not** choose this path if your main goal is simplicity.

For simplicity, keep using:

- GitHub Pages for frontend-only
- or Netlify for frontend-only

## What Lives Where

### GitHub Pages or Netlify

Keep hosting:

- `dist/web/index.html`
- `dist/web/pv_calculator_ui.html`
- `dist/web/assets/`

### Oracle Cloud VM

Host:

- `backend/server.js`
- `deploy/oracle/backend.env.example` copied to a real env file
- sqlite database
- backup / prune jobs
- nginx reverse proxy

## Starter Files Included In This Repo

- `deploy/oracle/systemd/pv-premium-sync.service`
- `deploy/oracle/nginx/pv-premium-sync.conf`
- `deploy/oracle/cron/pv-premium-sync.cron`
- `deploy/oracle/backend.env.example`

These are starter files, not blind production defaults.

## Recommended Layout On The Oracle Host

- app checkout: `/srv/pv-premium`
- backend env: `/etc/pv-premium-sync/backend.env`
- sqlite/data root: `/var/lib/pv-premium-sync`
- backups: `/var/backups/pv-premium-sync`

## High-Level Setup Flow

1. Create the Oracle VM in your home region.
2. Install:
   - Node 22
   - nginx
   - git
3. Copy the repo to:
   - `/srv/pv-premium`
4. Copy `deploy/oracle/backend.env.example` to:
   - `/etc/pv-premium-sync/backend.env`
5. Replace placeholder values, especially:
   - `BACKEND_ALLOWED_ORIGINS`
   - `BACKEND_API_KEY`
   - `BACKEND_ACTION_LINK_SECRET`
   - ops ownership values
6. Install the systemd unit:
   - `deploy/oracle/systemd/pv-premium-sync.service`
7. Install the nginx site:
   - `deploy/oracle/nginx/pv-premium-sync.conf`
8. Install the cron file:
   - `deploy/oracle/cron/pv-premium-sync.cron`
9. Run:
   - `npm run ops:check:premium:strict`

## Why The Oracle Env Example Is Different

`deploy/oracle/backend.env.example` is the better starting point for this path because it already assumes:

- backend binds to `127.0.0.1`
- nginx fronts public traffic
- sqlite and backup paths live under `/var`
- `BACKEND_ALLOWED_ORIGINS` is set up for a GitHub Pages frontend placeholder

That makes it a better fit than the generic backend env example when you are following the "GitHub Pages now, Oracle later" layout.

## Important Frontend Note

Your frontend can stay on GitHub Pages.

You do **not** need to move the frontend to Oracle just because the backend moves there.

That is one of the main benefits of the current hybrid design.

## Honest Tradeoff

This path saves cash, but it adds work:

- VM patching
- TLS certificate setup
- nginx maintenance
- process supervision
- firewall posture
- cron ownership
- disk / restore ownership

That is why Oracle is a good free backend option, but not the least complicated option.

## Related Files

- `Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md`
- `deploy/oracle/systemd/pv-premium-sync.service`
- `deploy/oracle/nginx/pv-premium-sync.conf`
- `deploy/oracle/cron/pv-premium-sync.cron`
- `deploy/oracle/backend.env.example`
