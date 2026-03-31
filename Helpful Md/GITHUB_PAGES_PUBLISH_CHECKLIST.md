# GitHub Pages Publish Checklist

## Best Use

Use this guide when:

- you want the app live at zero cost
- the frontend is still static/offline-first
- you want the simplest repo-native deployment path

This is the default recommendation for the current free rollout.

## Important Boundary

GitHub Pages is the right host for the current free static product surface.

It is **not** the best long-term home for a public paid SaaS-style frontend.

If the product later becomes a paid/public premium web service with account-driven commercial workflow, move the frontend to a normal static host such as:

- Netlify
- Render static hosting
- another standard static host you control

Keep GitHub Pages for the free/non-commercial static phase.

## Repo Files Already Prepared

- `.github/workflows/deploy-pages.yml`
- `dist/web/index.html`
- `dist/web/pv_calculator_ui.html`
- `dist/web/.nojekyll`
- `scripts/build_artifacts.js`
- `scripts/release_gate.js`

## Exact Local Prep

Run:

```bash
npm ci
node scripts/build_artifacts.js
npm run release:gate:free
```

If you want a manual upload bundle too, run:

```bash
npm run bundle:free-static
```

That creates:

- `output/free-static-deploy/`

## GitHub Repo Setup

1. Push this repo to GitHub.
2. Make sure the publish branch in `.github/workflows/deploy-pages.yml` matches the branch you will deploy from.
3. The current workflow is already set to deploy on pushes to:
   - `main`
4. Make sure GitHub Actions is enabled for the repository.
5. Make sure the repository visibility and your GitHub plan fit GitHub Pages for your use case.

## GitHub Pages Settings

In the repository:

1. Open `Settings`.
2. Open `Pages`.
3. Under `Build and deployment`, set `Source` to:
   - `GitHub Actions`

You do not need to configure a `gh-pages` branch for this repo because the workflow already uploads `dist/web` directly.

## Publish Flow

Choose one:

1. Push to `main`
2. Or run the workflow manually from the `Actions` tab

Workflow file:

- `.github/workflows/deploy-pages.yml`

What it already does:

- checks out the repo
- installs dependencies
- builds hosted artifacts
- runs `npm run release:gate:free`
- uploads `dist/web`
- deploys to GitHub Pages

## Expected URL Shape

Most likely project-site URL:

- `https://<your-user>.github.io/<your-repo>/`

If this is a user or organization Pages repo, the URL shape can differ.

## First Post-Deploy Checks

After the Pages deployment finishes:

1. Open the site URL.
2. Confirm the app loads from `/`.
3. Confirm the app also opens at:
   - `/pv_calculator_ui.html`
4. Confirm main flows still work:
   - sizing
   - proposal/report output
   - PDF export
5. Confirm no backend-only premium sync features are expected on this free host path.

## If You Later Add Premium Backend

You can keep the free frontend static while you trial a separate backend.

For the clean low-cash path:

- keep the frontend static for now
- use Oracle Cloud only for `backend/server.js`

But if the product crosses into a real public paid premium web service, prefer moving the frontend off GitHub Pages at that point.

## Clean Decision Rule

Use GitHub Pages when:

- the goal is free hosting now
- the app is still a static product surface
- the rollout is free, internal, pilot, or non-commercial public access

Do not treat GitHub Pages as the forever home when:

- the frontend becomes a public paid SaaS surface
- commercial account flows become central
- you want one provider to own normal web-app hosting posture

## Related Files

- `Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/DEPLOYMENT_TEMPLATES_AND_PROVIDER_SETUP_GUIDE.md`
- `Helpful Md/ORACLE_CLOUD_ALWAYS_FREE_BACKEND_GUIDE.md`
- `.github/workflows/deploy-pages.yml`
