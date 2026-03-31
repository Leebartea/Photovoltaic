const fs = require('fs');

const html = fs.readFileSync('pv_calculator_ui.html', 'utf8');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, code]) => code)
    .filter(code => code.trim().length > 0);

const pvScriptIndex = inlineScripts.findIndex(code => code.includes('const PVCalculator = {'));
if (pvScriptIndex < 0) {
    throw new Error('Main inline application script not found');
}

const scriptCode = inlineScripts.slice(0, pvScriptIndex + 1).join('\n');
const initCallIdx = scriptCode.indexOf("document.addEventListener('DOMContentLoaded'");
const initCallIdx2 = scriptCode.indexOf('document.addEventListener("DOMContentLoaded"');
const cutIdx = Math.max(initCallIdx, initCallIdx2);
const extractedCode = cutIdx > 0 ? scriptCode.substring(0, cutIdx) : scriptCode;

const stubCode = `
const __elements = {};
function makeClassList() {
    const set = new Set();
    return {
        add(...tokens) { tokens.forEach(token => set.add(token)); },
        remove(...tokens) { tokens.forEach(token => set.delete(token)); },
        toggle(token, force) {
            if (force === true) { set.add(token); return true; }
            if (force === false) { set.delete(token); return false; }
            if (set.has(token)) { set.delete(token); return false; }
            set.add(token);
            return true;
        },
        contains(token) { return set.has(token); },
        toString() { return Array.from(set).join('\\n'); }
    };
}
function makeElement(tagName = 'div', id = '') {
    return {
        id,
        tagName: String(tagName || 'div').toUpperCase(),
        type: '',
        value: '',
        checked: false,
        disabled: false,
        hidden: false,
        style: {},
        dataset: {},
        options: [],
        selectedIndex: 0,
        children: [],
        innerHTML: '',
        textContent: '',
        classList: makeClassList(),
        appendChild(child) { this.children.push(child); return child; },
        removeChild(child) {
            this.children = this.children.filter(item => item !== child);
            return child;
        },
        insertAdjacentHTML() {},
        addEventListener() {},
        removeEventListener() {},
        setAttribute(name, value) { this[name] = value; },
        getAttribute(name) { return this[name] ?? null; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
        closest() { return null; },
        focus() {},
        blur() {}
    };
}
function ensureElement(id, tagName = 'div') {
    if (!__elements[id]) __elements[id] = makeElement(tagName, id);
    return __elements[id];
}
const localStorage = {
    _data: {},
    getItem(key) { return Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : null; },
    setItem(key, value) { this._data[key] = String(value); },
    removeItem(key) { delete this._data[key]; }
};
var window = {
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {},
    innerWidth: 1440,
    innerHeight: 900,
    scrollTo() {},
    location: { hash: '' },
    localStorage,
    requestAnimationFrame(cb) { if (cb) cb(); },
    getComputedStyle() { return { getPropertyValue() { return ''; } }; },
    atob: globalThis.atob ? globalThis.atob.bind(globalThis) : (() => ''),
    btoa: globalThis.btoa ? globalThis.btoa.bind(globalThis) : (() => ''),
    jspdf: null
};
var navigator = { userAgent: 'test' };
var document = {
    getElementById(id) { return ensureElement(id); },
    querySelector(selector) {
        if (selector === 'meta[name="version"]') {
            return { getAttribute(name) { return name === 'content' ? '3.0.0' : null; } };
        }
        return null;
    },
    querySelectorAll(selector) {
        if (selector === 'input[id], select[id], textarea[id]') {
            return Object.values(__elements).filter(el => el.id && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));
        }
        return [];
    },
    createElement(tag) { return makeElement(tag); },
    createElementNS() { return makeElement('ns'); },
    head: { querySelector() { return null; } },
    body: makeElement('body'),
    documentElement: makeElement('html'),
    addEventListener() {},
    title: ''
};
document.body.setAttribute = function(name, value) { this[name] = value; };
document.body.getAttribute = function(name) { return this[name] ?? null; };
document.documentElement.setAttribute = function(name, value) { this[name] = value; };
document.documentElement.getAttribute = function(name) { return this[name] ?? null; };
var alert = function(msg) { global.__alerts.push(msg); };
var confirm = function() { return true; };
var setTimeout = function(cb) { if (typeof cb === 'function') cb(); return 1; };
var clearTimeout = function() {};
var setInterval = function() { return 0; };
var clearInterval = function() {};
var fetch = function() { return Promise.resolve({ ok: true, json() { return Promise.resolve({}); } }); };
var MutationObserver = function() { return { observe() {}, disconnect() {} }; };
var IntersectionObserver = function() { return { observe() {}, disconnect() {}, unobserve() {} }; };
var ResizeObserver = function() { return { observe() {}, disconnect() {} }; };
var HTMLElement = function() {};
var customElements = { define() {} };
var Blob = function() {};
var Image = function() {};
var XMLSerializer = function() { this.serializeToString = function() { return ''; }; };
var URL = { createObjectURL() { return ''; }, revokeObjectURL() {} };
global.__elements = __elements;
global.__ensureElement = ensureElement;
global.__alerts = [];
`;

const tempFile = '_test_vertical_templates_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    DEFAULTS,
    PVCalculator,
    __ensureElement
} = mod;

function addControl(id, tagName, props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

[
    ['audienceMode', 'select', { value: 'installer' }],
    ['businessProfile', 'select', { value: '' }],
    ['operatingIntent', 'select', { value: '' }],
    ['continuityClass', 'select', { value: '' }],
    ['operatingSchedulePreset', 'select', { value: '' }],
    ['businessContextHint', 'div', {}],
    ['workflowGuideHint', 'div', {}],
    ['projectTemplatePreset', 'select', { value: '' }],
    ['projectTemplatePreview', 'div', {}],
    ['location', 'select', { value: 'lagos_ng' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['phaseType', 'select', { value: 'single' }],
    ['acVoltage', 'select', { value: '230' }],
    ['acVoltageCustom', 'input', { value: '' }],
    ['frequency', 'select', { value: '50' }],
    ['avgPSH', 'input', { value: '4.5' }],
    ['autonomyDays', 'input', { value: '1' }],
    ['ambientTempMin', 'input', { value: '20' }],
    ['ambientTempMax', 'input', { value: '35' }],
    ['designMargin', 'input', { value: '125' }],
    ['inverterSurgeMultiplier', 'input', { value: '2.0' }],
    ['inverterTechnology', 'select', { value: 'unknown' }],
    ['panelOrientation', 'select', { value: 'unknown' }],
    ['panelTilt', 'select', { value: 'unknown' }]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

PVCalculator.getInverterClusterConfig = function() { return { enabled: false }; };
PVCalculator.saveToLocalStorageAuto = function() {};

[
    'garment_workshop',
    'bakery_daytime_production',
    'bakery_three_phase_oven',
    'filling_station_hybrid',
    'cold_room_preservation',
    'fabrication_workshop',
    'mini_factory_process'
].forEach(key => {
    assert(DEFAULTS.PROJECT_TEMPLATES[key], `Expected project template "${key}" to exist`);
});

assert(DEFAULTS.BUSINESS_PROFILES.bakery.sampleTemplateId === 'bakery_daytime_production', 'Bakery profile should resolve to the bakery daytime template');
assert(DEFAULTS.BUSINESS_PROFILES.filling_station.sampleTemplateId === 'filling_station_hybrid', 'Filling station profile should resolve to the filling-station template');
assert(DEFAULTS.BUSINESS_PROFILES.mini_factory.sampleTemplateId === 'mini_factory_process', 'Mini-factory profile should resolve to the mini-factory template');

PVCalculator.populateBusinessContextOptions();
PVCalculator.populateProjectTemplateOptions();

const templateHtml = addControl('projectTemplatePreset', 'select').innerHTML;
assert(templateHtml.includes('<optgroup'), 'Project templates should render grouped optgroups');
assert(templateHtml.includes('Filling Station Hybrid'), 'The filling-station template option should be rendered');

addControl('projectTemplatePreset', 'select').value = 'filling_station_hybrid';
addControl('businessProfile', 'select').value = 'filling_station';
addControl('operatingIntent', 'select').value = 'hybrid_generator';
addControl('continuityClass', 'select').value = 'process_critical';
addControl('operatingSchedulePreset', 'select').value = 'extended_business_day';
addControl('phaseType', 'select').value = 'three_phase';

PVCalculator.renderProjectTemplatePreview();
const previewHtml = addControl('projectTemplatePreview', 'div').innerHTML;
assert(previewHtml.includes('Filling Station Hybrid'), 'Template preview should include the selected template title');
assert(previewHtml.includes('Template phase baseline'), 'Template preview should include the phase baseline row');
assert(previewHtml.includes('Template family'), 'Template preview should include the template family field');
assert(previewHtml.includes('Survey focus'), 'Template preview should include survey focus guidance');

PVCalculator.renderWorkflowGuide();
let workflowHtml = addControl('workflowGuideHint', 'div').innerHTML;
assert(workflowHtml.includes('Installer Design workflow'), 'Workflow guide should explain installer workflow in installer mode');
assert(workflowHtml.includes('Commercial Strategy Recommendation'), 'Workflow guide should include the glossary for commercial strategy');
assert(workflowHtml.includes('Board Strategy'), 'Workflow guide should explain board strategy');

addControl('audienceMode', 'select').value = 'client';
PVCalculator.renderWorkflowGuide();
workflowHtml = addControl('workflowGuideHint', 'div').innerHTML;
assert(workflowHtml.includes('Client Estimate workflow'), 'Workflow guide should switch to client wording in client mode');
assert(workflowHtml.includes('Executive Snapshot'), 'Client workflow guide should point users to the client-facing result sections');

console.log('Vertical template workflow checks passed.');
