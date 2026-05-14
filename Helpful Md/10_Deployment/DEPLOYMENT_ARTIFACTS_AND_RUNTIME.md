# Deployment Artifacts And Runtime Model

This guide is detailed enough for the build and deployment model.

It is **not** the best first document for a person who is completely new to the bot.

For the actual deployment choice between:

- fully free static deployment
- premium hybrid deployment with backend
- the honest stop-point before public paid `v1`

use:

- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`

For that, start with:

- `Helpful Md/START_HERE_FOR_USERS_AND_MAINTAINERS.md`

## Why There Is Still A Single `pv_calculator_ui.html`

The project is now **multi-file in source**, but it still intentionally ships a **single-file offline artifact**.

That is not duplication by accident. It is the runtime strategy.

The source of truth is now:

- `src/template.html`
- `src/styles/app.css`
- `src/scripts/types/pv-types.d.ts`
- `src/scripts/modules/00-defaults.ts`
- `src/scripts/modules/10-engines.ts`
- `src/scripts/modules/20-reporting.ts`
- `src/scripts/modules/30-controller.js`
- `src/scripts/modules/40-init.js`

Those files are the maintainable development surface.

The build step then regenerates the runtime artifacts:

- `pv_calculator_ui.html`
- `dist/web/pv_calculator_ui.html`
- `dist/web/assets/app.css`
- `dist/web/assets/app.js`
- `dist/web/assets/vendor/jspdf.umd.min.js`

So yes: **every build updates the single-file offline version and the hosted multi-file version together**.

## The Two Runtime Modes

### 1. Standalone offline mode

File:

- `pv_calculator_ui.html`

Use this when you want:

- the easiest handoff
- no server
- no asset folder
- no hosting
- field/offline use
- the ability to copy one file to another machine and run it

What it contains:

- HTML
- CSS inline
- app JavaScript inline
- vendored `jsPDF` inline when available

Practical meaning:

You can double-click the file or open it directly in a browser and the calculator still works.

### 2. Normal hosted web mode

Entry file:

- `dist/web/pv_calculator_ui.html`

Required alongside it:

- `dist/web/assets/app.css`
- `dist/web/assets/app.js`
- `dist/web/assets/vendor/jspdf.umd.min.js`

Use this when you want:

- localhost preview
- Netlify / Vercel / GitHub Pages / nginx hosting
- a normal static deployment layout
- smaller HTML and cleaner browser caching

Practical meaning:

This is the right output for a website or local dev server.

## What The Build Is Actually Doing

The build script does two jobs:

1. Bundles the modular source JS/TS into one browser bundle.
2. Produces both delivery targets from the same source.

That means:

- the standalone file is not manually maintained
- the hosted bundle is not manually maintained
- both are generated from the same source modules

## Exact Update Technique

This is the actual technique used every time the source is changed:

1. Edit only the maintainable source surface in `src/`.
2. Run:

```bash
node scripts/build_artifacts.js
```

3. That script:

- reads `src/template.html`
- reads `src/styles/app.css`
- reads the ordered source modules in `src/scripts/modules/`
- prefers `.ts` over `.js` when a module exists in both forms
- transpiles native TypeScript modules into browser-safe JS
- concatenates the modules into one generated bundle at `src/scripts/app.js`
- injects inline CSS/JS into `pv_calculator_ui.html`
- injects asset references into `dist/web/pv_calculator_ui.html`
- writes `dist/web/assets/app.css`
- writes `dist/web/assets/app.js`
- copies the vendored `jsPDF` asset into `dist/web/assets/vendor/`

4. Validate with:

```bash
node scripts/build_artifacts.js --check
```

If any generated file is stale, the check fails fast.

## What This Means In Practice

When one source edit is made in `src/`, the same rebuild updates:

- the standalone offline runtime
- the hosted multi-file runtime

There is no separate manual update process for the root HTML versus `dist/web/`.

That is why the correct edit rule is always:

- edit `src/`
- rebuild once
- use `pv_calculator_ui.html` for offline handoff
- use `dist/web/` for hosted deployment

This is the right compromise between:

- maintainability for development
- easy deployment for real-world use

## Recommended Mental Model

Treat the repository as:

- `src/` = source code
- `pv_calculator_ui.html` = offline product artifact
- `dist/web/` = hosted product artifact
- `Helpful Md/INSTALLER_UI_GUIDE.md` and `Helpful Md/CLIENT_UI_GUIDE.md` = navigation guides for the two main user audiences
- `Helpful Md/PRODUCT_STATUS_SCORECARD.md` = current honest maturity and remaining-gap tracker

Do **not** treat `pv_calculator_ui.html` as the file to edit anymore.

## When To Use Which Output

Use `pv_calculator_ui.html` when:

- you want to send one file to an installer
- you need offline use on a field laptop
- you want the lowest-friction runtime

Use `dist/web/` when:

- you want browser testing through a local server
- you want public hosting
- you want remote browser access through a tunnel
- you want normal static-site deployment behavior

## Local Running

### Fastest offline run

Open:

- `pv_calculator_ui.html`

### Local hosted preview

Run:

```bash
python3 serve.py --build
```

or, if you want to force a specific port:

```bash
python3 serve.py 9005 --build --no-browser
```

The server serves from `dist/web/`, so what you see locally matches the hosted bundle.

## Cloudflare Tunnel Workflow

Yes, this should be run in a **second terminal**.

Example:

Terminal 1:

```bash
python3 serve.py 9005 --build --no-browser
```

Terminal 2:

```bash
cloudflared tunnel --url http://127.0.0.1:9005
```

Then share the generated `https://...trycloudflare.com` URL.

Important:

- keep both terminals open
- if the server falls back to a different port, tunnel that actual port instead

## Why This Model Is Better Than Choosing Only One

If the project shipped only the hosted multi-file layout:

- offline field handoff gets worse
- copying the app between machines becomes more fragile

If the project stayed source-single-file only:

- development gets harder
- regressions become more likely
- commercial feature growth becomes risky

The current model preserves both:

- modular source for safe engineering growth
- single-file runtime for easy field use

## Optional Backend Hosting Reality

If you stay frontend-only:

- GitHub Pages works
- the standalone file still works
- Netlify / Vercel static hosting still works

If you turn on backend entitlement sync:

- GitHub Pages can still host the frontend
- but GitHub Pages cannot host the backend API
- the backend must be hosted separately on a server-capable platform

That means hosting becomes more involved only for the premium sync adapter, not for the calculator itself.

Recommended split:

- static frontend on GitHub Pages, Netlify, Vercel, or similar
- optional backend on Render, Railway, Fly.io, VPS, or another Node-capable host

Read:

- `Helpful Md/OPTIONAL_BACKEND_FOUNDATION_GUIDE.md`

## Final Rule

There is **one source model** and **two deployment outputs**.

That is intentional, correct, and now the permanent architecture unless there is a later product decision to drop standalone distribution.
