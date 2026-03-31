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
        if (selector === '#tab-overview svg') return null;
        if (selector === 'meta[name="version"]') {
            return { getAttribute(name) { return name === 'content' ? '3.0.0' : null; } };
        }
        return null;
    },
    querySelectorAll() { return []; },
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

const tempFile = '_test_three_phase_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, LoadEngine, AggregationEngine, OutputGenerator, PVCalculator, __ensureElement };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    LoadEngine,
    AggregationEngine,
    OutputGenerator,
    PVCalculator,
    __ensureElement
} = mod;

function el(id, tagName = 'div', props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

el('phaseType', 'select', { value: 'three_phase' });
el('resultsContainer', 'div');

const threePhaseConfig = {
    phaseType: 'three_phase',
    acVoltage: 400,
    designMargin: 125
};

const balancedAutoLoads = [
    { name: 'Tailoring Lights', quantity: 6, ratedPowerW: 100, dailyUsageHours: 8, dutyCycle: 100, loadType: 'electronic', surgeFactor: 1, powerFactor: 0.98, daytimeRatio: 60, isSimultaneous: true, isAC: true, efficiency: 1.0, phaseAssignment: 'auto' },
    { name: 'Servo Machines', quantity: 3, ratedPowerW: 450, dailyUsageHours: 8, dutyCycle: 100, loadType: 'motor', surgeFactor: 1.5, powerFactor: 0.9, daytimeRatio: 80, isSimultaneous: true, isAC: true, efficiency: 0.9, phaseAssignment: 'auto' },
    { name: '3-Phase Compressor', quantity: 1, ratedPowerW: 1800, dailyUsageHours: 4, dutyCycle: 100, loadType: 'motor', surgeFactor: 2.5, powerFactor: 0.88, daytimeRatio: 70, isSimultaneous: false, isAC: true, efficiency: 0.9, phaseAssignment: 'three_phase' }
];

const balancedAggregation = AggregationEngine.calculate(balancedAutoLoads, threePhaseConfig);
const balancedPhase = balancedAggregation.phaseAllocation;

assert(!!balancedPhase, '3-phase aggregation returns phase allocation data');
assert(balancedPhase.phases.length === 3, 'phase allocation returns exactly three phase rows');
assert(balancedPhase.autoAssignedUnits === 9, 'auto-assigned unit count reflects the single-phase loads');
assert(balancedPhase.threePhaseUnits === 1, '3-phase appliance count is tracked separately');
assert(balancedPhase.applianceAssignments[2].resolvedSummary === '3-phase across L1/L2/L3', 'inherently 3-phase load resolves across all phases');
assert(balancedPhase.imbalancePct <= 10, `auto-balanced case stays within balanced threshold (${balancedPhase.imbalancePct}%)`);

const imbalancedFixedLoads = [
    { name: 'Borehole Pump', quantity: 1, ratedPowerW: 3000, dailyUsageHours: 2, dutyCycle: 100, loadType: 'motor', surgeFactor: 5, powerFactor: 0.82, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 0.88, phaseAssignment: 'l1' },
    { name: 'Cold Room Feed', quantity: 1, ratedPowerW: 900, dailyUsageHours: 10, dutyCycle: 100, loadType: 'motor', surgeFactor: 3.5, powerFactor: 0.82, daytimeRatio: 55, isSimultaneous: true, isAC: true, efficiency: 0.88, phaseAssignment: 'l1' },
    { name: 'Office Lighting', quantity: 1, ratedPowerW: 450, dailyUsageHours: 10, dutyCycle: 100, loadType: 'electronic', surgeFactor: 1, powerFactor: 0.96, daytimeRatio: 65, isSimultaneous: true, isAC: true, efficiency: 1.0, phaseAssignment: 'l2' },
    { name: 'POS and Routers', quantity: 1, ratedPowerW: 300, dailyUsageHours: 12, dutyCycle: 100, loadType: 'electronic', surgeFactor: 1, powerFactor: 0.96, daytimeRatio: 60, isSimultaneous: true, isAC: true, efficiency: 1.0, phaseAssignment: 'l3' }
];

const imbalancedAggregation = AggregationEngine.calculate(imbalancedFixedLoads, threePhaseConfig);
const imbalancedPhase = imbalancedAggregation.phaseAllocation;

assert(imbalancedPhase.classification === 'critical', `large fixed single-phase loads are classified as critical imbalance (${imbalancedPhase.imbalancePct}%)`);
assert(imbalancedPhase.limitingPhase === 'L1', 'heaviest fixed phase is detected as the limiting phase');
assert(imbalancedPhase.redistributionPenaltyVA > 0, 'imbalance penalty is quantified for equal-leg clusters');
assert(imbalancedPhase.warnings.some(w => /Equal-leg inverter clusters/i.test(w)), 'cluster-capacity warning is emitted for imbalanced layouts');

const report = OutputGenerator.generateReport({
    aggregation: imbalancedAggregation,
    inverter: { warnings: [], blocks: [] },
    battery: { warnings: [], blocks: [] },
    pvArray: { warnings: [], blocks: [] },
    mpptValidation: { warnings: [], blocks: [], isValid: true },
    cables: { warnings: [], blocks: [] },
    protection: { warnings: [], blocks: [] }
});
assert(report.warnings.some(w => /phase imbalance/i.test(w)), 'phase imbalance warnings flow into the report warning list');

const loadTabHtml = PVCalculator.renderLoadTab(imbalancedAggregation);
assert(/3-Phase Load Allocation/.test(loadTabHtml), 'load tab renders the dedicated 3-phase allocation section');
assert(/Neutral Current/.test(loadTabHtml), 'load tab exposes the neutral current estimate');
assert(/L1/.test(loadTabHtml) && /L2/.test(loadTabHtml) && /L3/.test(loadTabHtml), 'load tab includes all three phase labels');

console.log('3-phase UI tests passed');
