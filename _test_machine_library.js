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

const tempFile = '_test_machine_library_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    PVCalculator,
    LoadEngine,
    __ensureElement
} = mod;

function addControl(id, tagName, props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

function setFieldParents(id) {
    const node = addControl(id, 'select');
    if (!node.parentElement) node.parentElement = { style: {} };
    if (!node.parentElement.style) node.parentElement.style = {};
    return node;
}

[
    ['businessProfile', 'select', { value: 'tailoring_studio' }],
    ['phaseType', 'select', { value: 'single' }],
    ['appMachinePreset', 'select', { value: '' }],
    ['appMachinePresetPreview', 'div', {}],
    ['appName', 'input', { value: '' }],
    ['appQuantity', 'input', { value: '1' }],
    ['appPower', 'input', { value: '' }],
    ['appHours', 'input', { value: '8' }],
    ['appDutyCycle', 'input', { value: '100' }],
    ['appLoadType', 'select', { value: 'resistive' }],
    ['appSurgeFactor', 'input', { value: '1' }],
    ['appPowerFactor', 'input', { value: '1.0' }],
    ['appDaytimeRatio', 'input', { value: '50' }],
    ['appSimultaneous', 'input', { type: 'checkbox', checked: true }],
    ['appPhaseAssignment', 'select', { value: 'auto' }],
    ['appDutyFrequency', 'select', { value: 'daily' }],
    ['appCanStagger', 'select', { value: 'yes' }],
    ['appDaytimeOnly', 'select', { value: 'no' }],
    ['appAutoHint', 'div', {}],
    ['motorSubTypeHint', 'div', {}],
    ['addApplianceBtn', 'button', { textContent: 'Add Appliance' }],
    ['applianceListContainer', 'div', {}]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

setFieldParents('appStartMethod').value = 'dol';
setFieldParents('appMotorSubType').value = '';

PVCalculator.saveToLocalStorageAuto = function() {
    global.__autosaveCount = (global.__autosaveCount || 0) + 1;
};

PVCalculator.populateBusinessMachineOptions();
assert(addControl('appMachinePreset', 'select').innerHTML.includes('Servo Sewing Machine'), 'Tailoring profile should expose tailoring machine archetypes');
assert(!addControl('appMachinePreset', 'select').innerHTML.includes('Fuel Dispenser Pump'), 'Tailoring profile should not expose filling-station archetypes');

addControl('businessProfile', 'select').value = 'bakery';
PVCalculator.populateBusinessMachineOptions();
addControl('appMachinePreset', 'select').value = 'bakery_spiral_mixer';
PVCalculator.applyBusinessMachinePreset();

assert(addControl('appName', 'input').value === 'Bakery Spiral Mixer', 'Applying a machine archetype should set the appliance name');
assert(addControl('appPower', 'input').value === '2200', 'Bakery spiral mixer should set the expected power');
assert(addControl('appLoadType', 'select').value === 'motor', 'Bakery spiral mixer should remain a motor load');
assert(addControl('appMotorSubType', 'select').value === 'mixer_heavy', 'Bakery spiral mixer should set the correct motor subtype');
assert(addControl('appDutyFrequency', 'select').value === 'daily', 'Bakery spiral mixer should set the duty frequency');
assert(addControl('appDaytimeOnly', 'select').value === 'yes', 'Bakery spiral mixer should default to daytime-first operation');
assert(addControl('appMachinePresetPreview', 'div').innerHTML.includes('Bakery Spiral Mixer'), 'Preview should render the selected machine archetype');

addControl('businessProfile', 'select').value = 'filling_station';
addControl('phaseType', 'select').value = 'three_phase';
PVCalculator.populateBusinessMachineOptions();
addControl('appMachinePreset', 'select').value = 'booster_pump_three_phase';
PVCalculator.applyBusinessMachinePreset();

assert(addControl('appPhaseAssignment', 'select').value === 'three_phase', 'Three-phase booster archetype should map to a true three-phase assignment');
assert(addControl('appMachinePresetPreview', 'div').innerHTML.includes('supports 3-phase load assignment'), 'Three-phase preview should acknowledge compatible topology');

addControl('phaseType', 'select').value = 'single';
PVCalculator.populateBusinessMachineOptions();
addControl('appName', 'input').value = 'Fuel Dispenser Pump';
addControl('appPower', 'input').value = '';
PVCalculator.autoDetectAppliance();

assert(addControl('appMachinePreset', 'select').value === 'dispenser_pump_bank', 'Auto-detect should attach the matching business machine preset');
assert(addControl('appMotorSubType', 'select').value === 'dispenser_pump', 'Auto-detect should set the dispenser motor subtype');
assert(parseFloat(addControl('appSurgeFactor', 'input').value) === 3, 'Auto-detect should preserve the dispenser surge factor');

LoadEngine.appliances = [];
PVCalculator.addAppliance();
assert(LoadEngine.appliances.length === 1, 'Adding an archetyped appliance should append it to the appliance list');
assert(LoadEngine.appliances[0].machineProfileId === 'dispenser_pump_bank', 'Saved appliance should retain the machine profile id');
assert(LoadEngine.appliances[0].machineProfileLabel === 'Fuel Dispenser Pump', 'Saved appliance should retain the machine profile label');
assert(addControl('applianceListContainer', 'div').innerHTML.includes('Fuel Dispenser Pump'), 'Rendered appliance list should show the machine profile label');

PVCalculator.editAppliance(0);
assert(addControl('appMachinePreset', 'select').value === 'dispenser_pump_bank', 'Editing should restore the saved machine preset');
assert(addControl('appMachinePresetPreview', 'div').innerHTML.includes('Fuel Dispenser Pump'), 'Editing should restore the machine preview');

PVCalculator.clearApplianceForm();
assert(addControl('appMachinePreset', 'select').value === '', 'Clearing the appliance form should reset the machine archetype selector');
assert(addControl('appMachinePresetPreview', 'div').innerHTML.includes('Pick a machine archetype'), 'Clearing the form should restore the empty preview state');

console.log('Machine library regression checks passed.');
