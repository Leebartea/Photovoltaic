# Free Static Hosting Quickstart

## Best Default Answer

For this product, the best free low-complication hosting options are:

1. GitHub Pages
2. Netlify

That is true because:

- the app is already static/offline-first
- the hosted bundle is already generated for you
- the free path does not need the backend
- the repo now includes provider-ready starter files

If you want the fewest moving parts, start here before considering Oracle Cloud or any VM.

Use this repo-specific checklist when you choose GitHub Pages:

- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`

## Option 1: GitHub Pages

Use:

- `.github/workflows/deploy-pages.yml`

What is already prepared:

- `dist/web/index.html`
- `dist/web/pv_calculator_ui.html`
- `dist/web/.nojekyll`
- GitHub Pages workflow artifact upload

### Steps

1. Push the repo to GitHub.
2. Keep the workflow file at:
   - `.github/workflows/deploy-pages.yml`
3. Make sure your default branch is the branch you want to publish from.
4. In GitHub Pages settings, use the GitHub Actions publishing source if needed.
5. Push to `main` or run the workflow manually.

For the exact repo-specific path, use:

- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`

### Local verification before push

```bash
npm ci
node scripts/build_artifacts.js
npm run release:gate:free
```

### One-command manual upload bundle

If you want a ready-to-upload folder for manual hosting or handoff:

```bash
npm run bundle:free-static
```

That creates:

- `output/free-static-deploy/`

with:

- `index.html`
- `pv_calculator_ui.html`
- `.nojekyll`
- `assets/`
- `DEPLOYMENT_README.txt`

## Option 2: Netlify

Use:

- `netlify.toml`

What is already prepared:

- build command
- publish directory
- basic static security headers

### Steps

1. Push the repo to GitHub, GitLab, or Bitbucket, or upload manually through Netlify.
2. If Git-connected, let Netlify detect:
   - `netlify.toml`
3. If manual, upload `dist/web/` after running the build locally.

### Local verification before upload

```bash
npm ci
node scripts/build_artifacts.js
npm run release:gate:free
```

Or generate the manual upload bundle directly:

```bash
npm run bundle:free-static
```

## Which One Should You Choose?

Choose GitHub Pages when:

- the repo is already on GitHub
- you want the simplest repo-native free deploy
- you do not need Netlify previews or dashboards
- the rollout is still free/static rather than a paid public SaaS frontend

Choose Netlify when:

- you want a friendlier hosting UI
- you want drag-and-drop deploy as an option
- you want static hosting to feel a bit more productized without running servers

## What Not To Use First

Do not start with Oracle Cloud for the free path unless you truly need a backend.

Why:

- VM setup is more work
- TLS and reverse proxy become your job
- backup and cron become your job
- it is not simpler than Pages or Netlify for this app

## Files To Use

- `.github/workflows/deploy-pages.yml`
- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`
- `netlify.toml`
- `dist/web/index.html`
- `dist/web/pv_calculator_ui.html`
- `dist/web/.nojekyll`
- `output/free-static-deploy/`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/DEPLOYMENT_TEMPLATES_AND_PROVIDER_SETUP_GUIDE.md`
- `Helpful Md/ORACLE_CLOUD_ALWAYS_FREE_BACKEND_GUIDE.md`
