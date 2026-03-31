const fs = require('fs');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function read(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

const netlify = read('netlify.toml');
const render = read('render.yaml');
const workflow = read('.github/workflows/deploy-pages.yml');
const guide = read('Helpful Md/DEPLOYMENT_TEMPLATES_AND_PROVIDER_SETUP_GUIDE.md');
const pagesChecklist = read('Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md');
const hostingGuide = read('Helpful Md/HOSTING_RECOMMENDATION_AND_REMOTE_DEPLOYMENT_GUIDE.md');
const oracleGuide = read('Helpful Md/ORACLE_CLOUD_ALWAYS_FREE_BACKEND_GUIDE.md');
const closeoutGuide = read('Helpful Md/PREMIUM_V1_CLOSEOUT_CHECKLIST.md');
const oracleService = read('deploy/oracle/systemd/pv-premium-sync.service');
const oracleNginx = read('deploy/oracle/nginx/pv-premium-sync.conf');
const oracleCron = read('deploy/oracle/cron/pv-premium-sync.cron');
const oracleEnv = read('deploy/oracle/backend.env.example');

assert(netlify.includes('publish = "dist/web"'), 'Netlify config should publish dist/web.');
assert(netlify.includes('node scripts/build_artifacts.js'), 'Netlify config should build artifacts.');
assert(netlify.includes('npm run release:gate:free'), 'Netlify config should run the free release gate.');

assert(render.includes('type: static'), 'Render blueprint should include a static frontend service.');
assert(render.includes('type: web'), 'Render blueprint should include a web backend service.');
assert(render.includes('healthCheckPath: /health'), 'Render blueprint should expose the backend health check path.');
assert(render.includes('mountPath: /var/data'), 'Render blueprint should mount persistent backend storage.');
assert(render.includes('BACKEND_STORAGE_DRIVER'), 'Render blueprint should include backend storage env vars.');
assert(render.includes('BACKEND_ACTION_LINK_SECRET'), 'Render blueprint should include generated backend signing secret env.');

assert(workflow.includes('actions/configure-pages@v5'), 'GitHub Pages workflow should configure Pages.');
assert(workflow.includes('actions/upload-pages-artifact@v4'), 'GitHub Pages workflow should upload the Pages artifact.');
assert(workflow.includes('actions/deploy-pages@v4'), 'GitHub Pages workflow should deploy the Pages artifact.');
assert(workflow.includes('path: dist/web'), 'GitHub Pages workflow should publish dist/web.');
assert(workflow.includes('npm run release:gate:free'), 'GitHub Pages workflow should run the free release gate.');

assert(guide.includes('render.yaml'), 'Deployment templates guide should document the Render blueprint.');
assert(guide.includes('netlify.toml'), 'Deployment templates guide should document the Netlify config.');
assert(guide.includes('.github/workflows/deploy-pages.yml'), 'Deployment templates guide should document the GitHub Pages workflow.');
assert(guide.includes('dist/web/index.html'), 'Deployment templates guide should mention the hosted index alias.');
assert(guide.includes('deploy/oracle/backend.env.example'), 'Deployment templates guide should document the Oracle backend env example.');
assert(guide.includes('Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md'), 'Deployment templates guide should point to the dedicated GitHub Pages checklist.');

assert(pagesChecklist.includes('.github/workflows/deploy-pages.yml'), 'GitHub Pages checklist should reference the Pages workflow.');
assert(pagesChecklist.includes('npm run release:gate:free'), 'GitHub Pages checklist should require the free release gate.');
assert(pagesChecklist.includes('GitHub Actions'), 'GitHub Pages checklist should use the GitHub Actions publishing source.');
assert(pagesChecklist.includes('public paid SaaS-style frontend'), 'GitHub Pages checklist should state the commercial boundary honestly.');

assert(hostingGuide.includes('As of March 31, 2026'), 'Hosting guide should freeze the dated recommendation.');
assert(hostingGuide.includes('GitHub Pages'), 'Hosting guide should recommend GitHub Pages for the current free frontend.');
assert(hostingGuide.includes('Oracle Cloud Always Free'), 'Hosting guide should document Oracle as the low-cash backend option.');
assert(hostingGuide.includes('Cloudflare Pages + Workers'), 'Hosting guide should document the Cloudflare alternative.');
assert(hostingGuide.includes('What I Need To Push And Deploy Remotely For You'), 'Hosting guide should document remote deployment requirements.');

assert(closeoutGuide.includes('public paid premium `v1` closeout is now:'), 'Closeout checklist should state the repo closeout status.');
assert(closeoutGuide.includes('`100%`'), 'Closeout checklist should mark repo closeout as complete.');
assert(closeoutGuide.includes('live deployment execution'), 'Closeout checklist should distinguish repo closeout from host rollout.');

assert(oracleGuide.includes('GitHub Pages'), 'Oracle backend guide should explain keeping GitHub Pages for the frontend.');
assert(oracleGuide.includes('deploy/oracle/systemd/pv-premium-sync.service'), 'Oracle backend guide should reference the systemd starter file.');
assert(oracleGuide.includes('deploy/oracle/backend.env.example'), 'Oracle backend guide should reference the Oracle backend env example.');
assert(oracleService.includes('EnvironmentFile=/etc/pv-premium-sync/backend.env'), 'Oracle systemd unit should use the backend env file.');
assert(oracleService.includes('--experimental-sqlite backend/server.js'), 'Oracle systemd unit should start the sqlite-backed backend.');
assert(oracleNginx.includes('location /api/'), 'Oracle nginx config should proxy the API routes.');
assert(oracleNginx.includes('location /admin'), 'Oracle nginx config should proxy the admin routes.');
assert(oracleCron.includes('scripts/backend_backup.js'), 'Oracle cron file should schedule backend backups.');
assert(oracleCron.includes('scripts/backend_backup_prune.js'), 'Oracle cron file should schedule backend backup pruning.');
assert(oracleEnv.includes('HOST=127.0.0.1'), 'Oracle backend env example should bind the backend locally behind nginx.');
assert(oracleEnv.includes('BACKEND_ALLOWED_ORIGINS=https://your-user.github.io/your-repo'), 'Oracle backend env example should show the GitHub Pages origin placeholder.');

console.log('DEPLOYMENT TEMPLATES OK');
