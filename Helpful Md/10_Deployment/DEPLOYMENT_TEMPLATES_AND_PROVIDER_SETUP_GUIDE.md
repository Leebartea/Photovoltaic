# Deployment Templates And Provider Setup Guide

## Purpose

This guide explains the concrete deployment templates now included in the repo.

Use it when you want the fastest path from:

- "the app is ready"
- to "the app is actually hosted"

without inventing platform files from scratch.

## Included Templates

### 1. GitHub Pages workflow

File:

- `.github/workflows/deploy-pages.yml`

Use this for:

- totally free static deployment
- repo-driven publish on push to `main`
- public frontend-only hosting

What it does:

- checks out the repo
- installs dependencies
- builds `dist/web/`
- runs `npm run release:gate:free`
- uploads `dist/web/`
- deploys it to GitHub Pages

Important note:

- the hosted bundle now also writes `dist/web/index.html`, so generic static hosts can open the app at `/` without requiring a custom rewrite to `pv_calculator_ui.html`
- the exact repo-specific runbook now lives in `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`

### 2. Netlify static config

File:

- `netlify.toml`

Use this for:

- easy static deployment on Netlify
- Git-connected or manual static hosting

What it does:

- runs `npm ci`
- builds artifacts
- runs `npm run release:gate:free`
- publishes `dist/web`
- sets basic static security headers

### 3. Render premium blueprint

File:

- `render.yaml`

Use this for:

- premium hybrid deployment
- one static frontend plus one backend web service
- persistent single-node sqlite storage

What it defines:

- a static site for `dist/web`
- a Node backend for `backend/server.js`
- a persistent disk mounted at `/var/data`
- generated secrets for key backend security fields
- the current premium `manual_admin` entitlement source
- starter ops ownership / retention env fields

## What You Still Must Edit Before Production

Do not deploy the Render blueprint or backend env as-is without changing at least:

- `BACKEND_ALLOWED_ORIGINS`
- `BACKEND_BACKUP_OWNER`
- `BACKEND_BACKUP_REVIEW_CHANNEL`
- `BACKEND_RESTORE_OWNER`
- `BACKEND_INCIDENT_OWNER`
- `BACKEND_INCIDENT_CHANNEL`
- `BACKEND_INCIDENT_RUNBOOK_URL`

Those values are starter placeholders so the deployment shape is visible in code.

## Recommended Use By Scenario

### Free public link

Choose one:

- GitHub Pages workflow
- Netlify static config

These are the best free low-complication options for this repo because the app already ships as a static bundle.

If you choose GitHub Pages, use:

- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`

### Premium trusted workflow

Choose:

- static frontend on Pages or Netlify
- backend on Render

or, if you want the simplest single-provider premium trial:

- use the Render blueprint for both static frontend and backend

### Lowest-cash premium backend

Choose:

- GitHub Pages or Netlify for the frontend
- Oracle Cloud Always Free for the backend

Use this only if zero-or-near-zero backend cost matters more than simplicity.

That path is viable, but it is more manual because you must own:

- VM setup
- reverse proxy and TLS
- process management
- cron scheduling
- backup path management
- firewall posture

The repo now includes an Oracle-specific backend env starter at:

- `deploy/oracle/backend.env.example`

Use that file instead of the generic backend env example when you are keeping the frontend on GitHub Pages or Netlify and hosting only the premium backend on Oracle.

Important note:

- GitHub Pages is the best free host for the current static rollout
- if the frontend later becomes a public paid SaaS-style surface, move that frontend to a normal static host instead of treating Pages as the forever commercial frontend

## Validation Path

Before shipping:

```bash
npm run release:gate:free
npm run release:gate:premium
```

On the deployed premium backend host:

```bash
npm run ops:check:premium:strict
```

## Related Files

- `scripts/build_artifacts.js`
- `scripts/release_gate.js`
- `scripts/premium_ops_readiness.js`
- `render.yaml`
- `netlify.toml`
- `.github/workflows/deploy-pages.yml`
- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`
- `deploy/oracle/backend.env.example`
- `Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md`
- `Helpful Md/ORACLE_CLOUD_ALWAYS_FREE_BACKEND_GUIDE.md`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md`
