#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST_WEB_DIR = path.join(ROOT, 'dist', 'web');
const OUTPUT_DIR = path.join(ROOT, 'output', 'free-static-deploy');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'DEPLOYMENT_README.txt');

function ensureBuildArtifacts() {
    const result = spawnSync(process.execPath, [path.join(__dirname, 'build_artifacts.js')], {
        cwd: ROOT,
        stdio: 'inherit'
    });
    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function removeDirectoryIfExists(targetPath) {
    fs.rmSync(targetPath, { recursive: true, force: true });
}

function writeManifest() {
    const content = [
        'PV Free Static Deploy Bundle',
        '',
        `Generated: ${new Date().toISOString()}`,
        '',
        'What this folder is:',
        '- a ready-to-upload copy of dist/web/',
        '- suitable for GitHub Pages, Netlify manual deploy, or any normal static host',
        '',
        'Recommended use:',
        '1. Upload the contents of this folder to a static host.',
        '2. Open index.html at the site root.',
        '3. If using GitHub Pages, keep .nojekyll in place.',
        '',
        'Included key files:',
        '- index.html',
        '- pv_calculator_ui.html',
        '- .nojekyll',
        '- assets/app.css',
        '- assets/app.js',
        '',
        'For fuller instructions, read:',
        '- Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md',
        '- Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md',
        ''
    ].join('\n');

    fs.writeFileSync(MANIFEST_PATH, content, 'utf8');
}

function main() {
    ensureBuildArtifacts();

    if (!fs.existsSync(DIST_WEB_DIR)) {
        throw new Error('dist/web is missing after build. Cannot export free static bundle.');
    }

    removeDirectoryIfExists(OUTPUT_DIR);
    fs.mkdirSync(path.dirname(OUTPUT_DIR), { recursive: true });
    fs.cpSync(DIST_WEB_DIR, OUTPUT_DIR, { recursive: true });
    writeManifest();

    console.log('Free static deploy bundle ready');
    console.log(`- ${path.relative(ROOT, OUTPUT_DIR)}`);
    console.log(`- ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main();
