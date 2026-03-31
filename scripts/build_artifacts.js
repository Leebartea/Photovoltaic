#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const TEMPLATE_PATH = path.join(SRC_DIR, 'template.html');
const STYLE_PATH = path.join(SRC_DIR, 'styles', 'app.css');
const SCRIPT_MODULE_DIR = path.join(SRC_DIR, 'scripts', 'modules');
const SCRIPT_BUNDLE_OUTPUT = path.join(SRC_DIR, 'scripts', 'app.js');
const VENDOR_JSPDF_PATH = path.join(ROOT, 'vendor', 'jspdf.umd.min.js');

const ROOT_OUTPUT = path.join(ROOT, 'pv_calculator_ui.html');
const DIST_WEB_HTML_OUTPUT = path.join(ROOT, 'dist', 'web', 'pv_calculator_ui.html');
const DIST_WEB_INDEX_OUTPUT = path.join(ROOT, 'dist', 'web', 'index.html');
const DIST_WEB_NOJEKYLL_OUTPUT = path.join(ROOT, 'dist', 'web', '.nojekyll');
const DIST_WEB_STYLE_OUTPUT = path.join(ROOT, 'dist', 'web', 'assets', 'app.css');
const DIST_WEB_SCRIPT_OUTPUT = path.join(ROOT, 'dist', 'web', 'assets', 'app.js');
const DIST_WEB_VENDOR_OUTPUT = path.join(ROOT, 'dist', 'web', 'assets', 'vendor', 'jspdf.umd.min.js');

const MODULE_FILES = [
    '00-defaults',
    '10-engines',
    '20-reporting',
    '25-controller-payloads',
    '26-controller-state',
    '27-controller-guidance',
    '28-entitlements',
    '29-backend',
    '30-controller',
    '40-init'
];

const GENERATED_HTML_BANNER = '<!-- GENERATED FILE: edit src/template.html, src/styles/app.css, and src/scripts/modules/*.{js,ts}, then run node scripts/build_artifacts.js -->';
const GENERATED_JS_BANNER = '/* GENERATED FILE: edit src/scripts/modules/*.{js,ts}, then run node scripts/build_artifacts.js */';
const CDN_JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
let typescriptCompiler = null;

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function removeFileIfExists(filePath) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function resolveModulePath(moduleName) {
    for (const extension of ['.ts', '.js']) {
        const filePath = path.join(SCRIPT_MODULE_DIR, `${moduleName}${extension}`);
        if (fs.existsSync(filePath)) return filePath;
    }
    throw new Error(`Missing script module: src/scripts/modules/${moduleName}.{js,ts}`);
}

function getTypeScriptCompiler() {
    if (typescriptCompiler) return typescriptCompiler;

    try {
        typescriptCompiler = require('typescript');
        return typescriptCompiler;
    } catch (error) {
        throw new Error('TypeScript source modules require the local compiler. Run: npm ci');
    }
}

function readScriptModule(filePath) {
    const content = readFile(filePath).trim();
    if (!filePath.endsWith('.ts')) return content;

    const ts = getTypeScriptCompiler();
    return ts.transpileModule(content, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2021,
            module: ts.ModuleKind.None,
            removeComments: false
        },
        fileName: path.basename(filePath)
    }).outputText.trim();
}

function ensurePlaceholders(template) {
    if (!template.includes('{{JSPDF_SCRIPT_TAG}}')) {
        throw new Error('Missing {{JSPDF_SCRIPT_TAG}} placeholder in src/template.html');
    }
    if (!template.includes('{{APP_STYLE_TAG}}')) {
        throw new Error('Missing {{APP_STYLE_TAG}} placeholder in src/template.html');
    }
    if (!template.includes('{{APP_SCRIPT_TAG}}')) {
        throw new Error('Missing {{APP_SCRIPT_TAG}} placeholder in src/template.html');
    }
}

function withHtmlBanner(html) {
    if (!html.startsWith('<!DOCTYPE html>')) return `${GENERATED_HTML_BANNER}\n${html}`;
    return html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${GENERATED_HTML_BANNER}`);
}

function buildScriptBundle() {
    const parts = MODULE_FILES.map(moduleName => {
        const filePath = resolveModulePath(moduleName);
        return readScriptModule(filePath);
    });

    return `${GENERATED_JS_BANNER}\n\n${parts.join('\n\n')}\n`;
}

function buildJsPdfScriptTag(mode, vendorCode) {
    if (mode === 'standalone') {
        if (vendorCode) {
            return `<script>\n${vendorCode.trimEnd()}\n    </script>`;
        }
        return `<script src="${CDN_JSPDF_URL}"></script>`;
    }

    if (vendorCode) {
        return `<script src="./assets/vendor/jspdf.umd.min.js"></script>\n    <script>if(!window.jspdf){document.write('<script src="${CDN_JSPDF_URL}"><\\\\/script>');}</script>`;
    }

    return `<script src="${CDN_JSPDF_URL}"></script>`;
}

function buildOutputs() {
    const template = readFile(TEMPLATE_PATH);
    const css = readFile(STYLE_PATH).trimEnd();
    const js = buildScriptBundle().trimEnd();
    const vendorCode = fs.existsSync(VENDOR_JSPDF_PATH) ? readFile(VENDOR_JSPDF_PATH).trimEnd() : null;

    ensurePlaceholders(template);

    const standaloneHtml = withHtmlBanner(
        template
            .replace('{{JSPDF_SCRIPT_TAG}}', buildJsPdfScriptTag('standalone', vendorCode))
            .replace('{{APP_STYLE_TAG}}', `<style>\n${css}\n    </style>`)
            .replace('{{APP_SCRIPT_TAG}}', `<script>\n${js}\n    </script>`)
    );

    const webHtml = withHtmlBanner(
        template
            .replace('{{JSPDF_SCRIPT_TAG}}', buildJsPdfScriptTag('web', vendorCode))
            .replace('{{APP_STYLE_TAG}}', '<link rel="stylesheet" href="./assets/app.css">')
            .replace('{{APP_SCRIPT_TAG}}', '<script src="./assets/app.js"></script>')
    );

    return {
        standaloneHtml,
        webHtml,
        css: `${css}\n`,
        js: `${js}\n`,
        vendorCode: vendorCode ? `${vendorCode}\n` : null
    };
}

function outputsAreCurrent(outputs) {
    const expected = [
        [SCRIPT_BUNDLE_OUTPUT, outputs.js],
        [ROOT_OUTPUT, outputs.standaloneHtml],
        [DIST_WEB_HTML_OUTPUT, outputs.webHtml],
        [DIST_WEB_INDEX_OUTPUT, outputs.webHtml],
        [DIST_WEB_NOJEKYLL_OUTPUT, ''],
        [DIST_WEB_STYLE_OUTPUT, outputs.css],
        [DIST_WEB_SCRIPT_OUTPUT, outputs.js]
    ];

    const baseMatch = expected.every(([filePath, content]) => {
        if (!fs.existsSync(filePath)) return false;
        return readFile(filePath) === content;
    });

    if (!baseMatch) return false;

    if (outputs.vendorCode) {
        return fs.existsSync(DIST_WEB_VENDOR_OUTPUT) && readFile(DIST_WEB_VENDOR_OUTPUT) === outputs.vendorCode;
    }

    return !fs.existsSync(DIST_WEB_VENDOR_OUTPUT);
}

function writeOutputs(outputs) {
    writeFile(SCRIPT_BUNDLE_OUTPUT, outputs.js);
    writeFile(ROOT_OUTPUT, outputs.standaloneHtml);
    writeFile(DIST_WEB_HTML_OUTPUT, outputs.webHtml);
    writeFile(DIST_WEB_INDEX_OUTPUT, outputs.webHtml);
    writeFile(DIST_WEB_NOJEKYLL_OUTPUT, '');
    writeFile(DIST_WEB_STYLE_OUTPUT, outputs.css);
    writeFile(DIST_WEB_SCRIPT_OUTPUT, outputs.js);
    removeFileIfExists(path.join(ROOT, 'dist', 'pv_calculator_ui.html'));

    if (outputs.vendorCode) {
        writeFile(DIST_WEB_VENDOR_OUTPUT, outputs.vendorCode);
    } else {
        removeFileIfExists(DIST_WEB_VENDOR_OUTPUT);
    }
}

function main() {
    const checkOnly = process.argv.includes('--check');
    const outputs = buildOutputs();

    if (checkOnly) {
        if (!outputsAreCurrent(outputs)) {
            console.error('Build artifacts are out of date. Run: node scripts/build_artifacts.js');
            process.exit(1);
        }
        console.log('BUILD CHECK OK');
        return;
    }

    writeOutputs(outputs);

    console.log('Build complete');
    console.log(`- ${path.relative(ROOT, SCRIPT_BUNDLE_OUTPUT)}`);
    console.log(`- ${path.relative(ROOT, ROOT_OUTPUT)}`);
    console.log(`- ${path.relative(ROOT, DIST_WEB_HTML_OUTPUT)}`);
    console.log(`- ${path.relative(ROOT, DIST_WEB_INDEX_OUTPUT)}`);
    console.log(`- ${path.relative(ROOT, DIST_WEB_NOJEKYLL_OUTPUT)}`);
    console.log(`- ${path.relative(ROOT, DIST_WEB_STYLE_OUTPUT)}`);
    console.log(`- ${path.relative(ROOT, DIST_WEB_SCRIPT_OUTPUT)}`);
    if (outputs.vendorCode) {
        console.log(`- ${path.relative(ROOT, DIST_WEB_VENDOR_OUTPUT)}`);
    }
}

main();
