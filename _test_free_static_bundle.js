const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const ROOT = __dirname;
const OUTPUT_DIR = path.join(ROOT, 'output', 'free-static-deploy');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'DEPLOYMENT_README.txt');

fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });

const result = spawnSync(process.execPath, ['scripts/export_free_static_bundle.js'], {
    cwd: ROOT,
    encoding: 'utf8'
});

assert(result.status === 0, `Free static bundle export should succeed. Output: ${result.stdout}\n${result.stderr}`);
assert(fs.existsSync(path.join(OUTPUT_DIR, 'index.html')), 'Free static bundle should include index.html.');
assert(fs.existsSync(path.join(OUTPUT_DIR, 'pv_calculator_ui.html')), 'Free static bundle should include pv_calculator_ui.html.');
assert(fs.existsSync(path.join(OUTPUT_DIR, '.nojekyll')), 'Free static bundle should include .nojekyll.');
assert(fs.existsSync(path.join(OUTPUT_DIR, 'assets', 'app.css')), 'Free static bundle should include app.css.');
assert(fs.existsSync(path.join(OUTPUT_DIR, 'assets', 'app.js')), 'Free static bundle should include app.js.');
assert(fs.existsSync(MANIFEST_PATH), 'Free static bundle should include a deployment readme.');

const manifest = fs.readFileSync(MANIFEST_PATH, 'utf8');
assert(manifest.includes('PV Free Static Deploy Bundle'), 'Deployment manifest should include the bundle title.');
assert(manifest.includes('Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md'), 'Deployment manifest should point to the free static quickstart.');

console.log('FREE STATIC BUNDLE OK');
