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
var alert = function() {};
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
`;

const tempFile = '_test_three_phase_cluster_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { AggregationEngine, InverterSizingEngine, ThreePhaseInverterClusterPlanner: typeof ThreePhaseInverterClusterPlanner !== 'undefined' ? ThreePhaseInverterClusterPlanner : null, PVCalculator, __ensureElement };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    AggregationEngine,
    InverterSizingEngine,
    ThreePhaseInverterClusterPlanner,
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
el('location', 'select', { value: 'generic' });
el('systemType', 'select', { value: 'off_grid' });
el('acVoltage', 'select', { value: '400' });
el('frequency', 'select', { value: '50' });
el('inverterMarketOverride', 'select', { value: 'EMERGING_OFFGRID' });
el('avgPSH', 'input', { value: '4.5' });
el('autonomyDays', 'input', { value: '2' });
el('ambientTempMin', 'input', { value: '20' });
el('ambientTempMax', 'input', { value: '35' });
el('designMargin', 'input', { value: '125' });
el('inverterSurgeMultiplier', 'input', { value: '2.5' });
el('inverterTechnology', 'select', { value: 'transformer' });
el('panelOrientation', 'select', { value: 'unknown' });
el('panelTilt', 'select', { value: 'unknown' });
el('threePhaseClusterEnabled', 'input', { checked: true });
el('threePhaseClusterDistributionMode', 'select', { value: 'auto' });
el('threePhaseClusterModuleVA', 'input', { value: '3000' });
el('threePhaseClusterModuleCount', 'input', { value: '' });
el('threePhaseClusterL1', 'input', { value: '1' });
el('threePhaseClusterL2', 'input', { value: '1' });
el('threePhaseClusterL3', 'input', { value: '1' });
el('inverterManualVA', 'input', { value: '' });

const threePhaseConfig = {
    phaseType: 'three_phase',
    acVoltage: 400,
    designMargin: 125,
    inverterMarket: 'EMERGING_OFFGRID',
    inverterSurgeMultiplier: 2.5,
    inverterCluster: {
        enabled: true,
        distributionMode: 'auto',
        moduleVA: 3000,
        moduleCount: 0,
        manualPhaseCounts: { l1: 0, l2: 0, l3: 0 },
        manualFallbackVA: 0
    }
};

const imbalancedLoads = [
    { name: 'Borehole Pump', quantity: 1, ratedPowerW: 3000, dailyUsageHours: 2, dutyCycle: 100, loadType: 'motor', surgeFactor: 5, powerFactor: 0.82, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 0.88, phaseAssignment: 'l1' },
    { name: 'Cold Room Feed', quantity: 1, ratedPowerW: 900, dailyUsageHours: 10, dutyCycle: 100, loadType: 'motor', surgeFactor: 3.5, powerFactor: 0.82, daytimeRatio: 55, isSimultaneous: true, isAC: true, efficiency: 0.88, phaseAssignment: 'l1' },
    { name: 'Office Lighting', quantity: 1, ratedPowerW: 450, dailyUsageHours: 10, dutyCycle: 100, loadType: 'electronic', surgeFactor: 1, powerFactor: 0.96, daytimeRatio: 65, isSimultaneous: true, isAC: true, efficiency: 1.0, phaseAssignment: 'l2' },
    { name: 'POS and Routers', quantity: 1, ratedPowerW: 300, dailyUsageHours: 12, dutyCycle: 100, loadType: 'electronic', surgeFactor: 1, powerFactor: 0.96, daytimeRatio: 60, isSimultaneous: true, isAC: true, efficiency: 1.0, phaseAssignment: 'l3' }
];

const aggregation = AggregationEngine.calculate(imbalancedLoads, threePhaseConfig);
const inverter = InverterSizingEngine.calculate(aggregation, threePhaseConfig);
const autoPlan = ThreePhaseInverterClusterPlanner.calculate(aggregation, inverter, threePhaseConfig);

assert(!!autoPlan, '3-phase cluster planner returns a plan when enabled');
assert(autoPlan.totalModuleCount === 7, `auto plan sizes seven modules for the imbalanced case (got ${autoPlan.totalModuleCount})`);
assert(autoPlan.phaseCounts.l1 === 5 && autoPlan.phaseCounts.l2 === 1 && autoPlan.phaseCounts.l3 === 1, `auto plan maps modules to the limiting phase first (${JSON.stringify(autoPlan.phaseCounts)})`);
assert(autoPlan.status === 'ready', `auto plan should be ready with seven modules (got ${autoPlan.status})`);
assert(autoPlan.phases.find(phase => phase.key === 'l1').surgeCapacityVA >= autoPlan.phases.find(phase => phase.key === 'l1').designSurgeVA, 'limiting phase surge capacity is covered in the auto plan');

const manualPlan = ThreePhaseInverterClusterPlanner.calculate(aggregation, inverter, {
    ...threePhaseConfig,
    inverterCluster: {
        enabled: true,
        distributionMode: 'manual',
        moduleVA: 3000,
        moduleCount: 4,
        manualPhaseCounts: { l1: 2, l2: 1, l3: 1 },
        manualFallbackVA: 0
    }
});

assert(manualPlan.status === 'undersized', `manual undersized cluster is flagged correctly (got ${manualPlan.status})`);
assert(manualPlan.blocks.some(block => /L1 is undersized/i.test(block)), 'manual plan emits a hard block for the overloaded phase');
assert(manualPlan.suggestions.some(item => /minimum practical cluster is about 7 modules/i.test(item)), 'manual plan suggests the minimum viable cluster count');

const renderedPlan = PVCalculator.renderThreePhaseClusterPanel(autoPlan, { title: '3-Phase Inverter Cluster Plan' });
assert(/3-Phase Inverter Cluster Plan/.test(renderedPlan), 'cluster plan renderer includes the requested title');
assert(/L1 5 \/ L2 1 \/ L3 1/.test(renderedPlan), 'cluster renderer exposes the phase distribution');
assert(/Ready/.test(renderedPlan), 'cluster renderer surfaces the readiness status');

const inverterHtml = PVCalculator.renderInverterTab({ ...inverter, clusterPlan: autoPlan });
assert(/cluster-plan-shell/.test(inverterHtml) || /L1 5 \/ L2 1 \/ L3 1/.test(inverterHtml), 'inverter tab embeds the modular cluster plan');
assert(/7 × 3,000/.test(inverterHtml) || /7 × 3000/.test(inverterHtml), 'inverter tab surfaces the module count and rating');

console.log('3-phase cluster tests passed');
