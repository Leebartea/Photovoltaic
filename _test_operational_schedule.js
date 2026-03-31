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
        parentElement: { style: {} },
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
        blur() {},
        scrollIntoView() {}
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

const tempFile = '_test_operational_schedule_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, AggregationEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    PVCalculator,
    AggregationEngine,
    __ensureElement
} = mod;

function addControl(id, tagName, props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

[
    ['businessProfile', 'select', { value: 'custom_mixed_site' }],
    ['operatingIntent', 'select', { value: 'backup_only' }],
    ['continuityClass', 'select', { value: 'business_critical' }],
    ['operatingSchedulePreset', 'select', { value: 'business_day' }],
    ['businessContextHint', 'div', {}],
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
    ['panelTilt', 'select', { value: 'unknown' }],
    ['appMachinePreset', 'select', { value: '' }],
    ['appMachinePresetPreview', 'div', {}],
    ['appName', 'input', { value: '' }],
    ['appQuantity', 'input', { value: '1' }],
    ['appPower', 'input', { value: '' }],
    ['appHours', 'input', { value: '8' }],
    ['appDutyCycle', 'input', { value: '100' }],
    ['appLoadType', 'select', { value: 'resistive' }],
    ['appStartMethod', 'select', { value: 'dol', parentElement: { style: {} } }],
    ['appMotorSubType', 'select', { value: '', parentElement: { style: {} } }],
    ['appSurgeFactor', 'input', { value: '1' }],
    ['appPowerFactor', 'input', { value: '1.0' }],
    ['appDaytimeRatio', 'input', { value: '50' }],
    ['appDutyFrequency', 'select', { value: 'daily' }],
    ['appCanStagger', 'select', { value: 'yes' }],
    ['appDaytimeOnly', 'select', { value: 'no' }],
    ['appLoadRole', 'select', { value: 'auto' }],
    ['appLoadCriticality', 'select', { value: 'auto' }],
    ['appSimultaneous', 'input', { type: 'checkbox', checked: true }],
    ['appPhaseAssignment', 'select', { value: 'auto' }],
    ['appAutoHint', 'div', {}],
    ['motorSubTypeHint', 'div', {}]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

PVCalculator.saveToLocalStorageAuto = function() {};

PVCalculator.populateBusinessContextOptions();
PVCalculator.populateOperationalModelOptions();
assert(addControl('operatingSchedulePreset', 'select').innerHTML.includes('24/7 Continuous Operation'), 'Schedule options should be populated');
assert(addControl('appLoadRole', 'select').innerHTML.includes('Base Load'), 'Load role options should be populated');
assert(addControl('appLoadCriticality', 'select').innerHTML.includes('Critical'), 'Load criticality options should be populated');

addControl('businessProfile', 'select').value = 'bakery';
PVCalculator.onBusinessContextChange('profile');
assert(addControl('operatingSchedulePreset', 'select').value === 'intermittent_production', 'Bakery profile should recommend the intermittent-production schedule');
assert(addControl('businessContextHint', 'div').innerHTML.includes('Operating Schedule'), 'Business hint should render the operating schedule context');

addControl('appMachinePreset', 'select').value = 'bakery_spiral_mixer';
PVCalculator.applyBusinessMachinePreset();
assert(addControl('appLoadRole', 'select').value === 'process', 'Bakery spiral mixer should resolve to a process load role');
assert(addControl('appLoadCriticality', 'select').value === 'essential', 'Bakery spiral mixer should resolve to an essential load priority');

const config = {
    operatingSchedulePreset: 'intermittent_production',
    operatingScheduleDefinition: PVCalculator.getOperatingScheduleDefinition('intermittent_production'),
    continuityClass: 'process_critical',
    phaseType: 'single',
    designMargin: 125
};

const appliances = [
    {
        name: 'Bakery Spiral Mixer',
        quantity: 1,
        ratedPowerW: 2200,
        dailyUsageHours: 2.5,
        dutyCycle: 70,
        loadType: 'motor',
        startMethod: 'dol',
        surgeFactor: 4.5,
        powerFactor: 0.78,
        daytimeRatio: 100,
        isSimultaneous: false,
        isAC: true,
        efficiency: 0.82,
        motorSubType: 'mixer_heavy',
        dutyFrequency: 'daily',
        canStagger: 'yes',
        isDaytimeOnly: true
    },
    {
        name: 'Cold Room Compressor',
        quantity: 1,
        ratedPowerW: 3000,
        dailyUsageHours: 24,
        dutyCycle: 55,
        loadType: 'motor',
        startMethod: 'dol',
        surgeFactor: 4.5,
        powerFactor: 0.78,
        daytimeRatio: 50,
        isSimultaneous: true,
        isAC: true,
        efficiency: 0.82,
        motorSubType: 'compressor_coldroom',
        dutyFrequency: 'continuous',
        canStagger: 'no',
        isDaytimeOnly: false
    },
    {
        name: 'Control Panel / PLC',
        quantity: 1,
        ratedPowerW: 250,
        dailyUsageHours: 24,
        dutyCycle: 100,
        loadType: 'electronic',
        startMethod: 'vfd',
        surgeFactor: 1.2,
        powerFactor: 0.95,
        daytimeRatio: 50,
        isSimultaneous: true,
        isAC: true,
        efficiency: 1.0,
        dutyFrequency: 'continuous',
        canStagger: 'na',
        isDaytimeOnly: false
    }
];

const aggregation = AggregationEngine.calculate(appliances, config);
assert(aggregation.operationalProfile.scheduleKey === 'intermittent_production', 'Aggregation should preserve the selected operating schedule');
assert(aggregation.operationalProfile.energyByRoleWh.process > 0, 'Operational profile should track process energy');
assert(aggregation.operationalProfile.energyByRoleWh.refrigeration > 0, 'Operational profile should track refrigeration energy');
assert(aggregation.operationalProfile.energyByCriticalityWh.critical > 0, 'Operational profile should track critical energy');

const summary = PVCalculator.getOperationalScheduleSummary(aggregation, config);
assert(summary.status === 'warn' || summary.status === 'fail', 'Intermittent production should warn when overnight critical burden is too high');
assert(summary.overnightCriticalWh > 0, 'Operational summary should expose overnight critical energy');
assert(summary.roleRows.some(row => row.key === 'process'), 'Operational summary should include a process role row');

PVCalculator.results = { config };
const loadTabHtml = PVCalculator.renderLoadTab(aggregation);
assert(loadTabHtml.includes('Intermittent Production'), 'Load tab should display the selected operating schedule');
assert(loadTabHtml.includes('Overnight Critical'), 'Load tab should show overnight critical energy');
assert(loadTabHtml.includes('Energy By Load Role'), 'Load tab should expose role breakdown tables');

console.log('Operational schedule regression checks passed.');
