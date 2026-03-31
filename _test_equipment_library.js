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

const tempFile = '_test_equipment_library_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, __elements, __ensureElement, document, window };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    DEFAULTS,
    PVCalculator,
    LoadEngine,
    __ensureElement
} = mod;

function el(id, tagName = 'div', props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

function setOptions(id, values) {
    const node = el(id, 'select');
    node.options = values.map(value => ({ value: String(value) }));
    if (!node.value && values.length > 0) node.value = String(values[0]);
    return node;
}

[
    ['equipmentLibraryPreview', 'div'],
    ['equipmentLibraryStatus', 'div'],
    ['panelLibraryAppliedId', 'input'],
    ['inverterLibraryAppliedId', 'input'],
    ['batteryLibraryAppliedId', 'input'],
    ['manualMode', 'input', { type: 'checkbox', checked: false }],
    ['panelWattage', 'input', { value: '400' }],
    ['panelVmp', 'input', { value: '41' }],
    ['panelVoc', 'input', { value: '49' }],
    ['panelImp', 'input', { value: '9.76' }],
    ['panelIsc', 'input', { value: '10.36' }],
    ['panelTempCoeffPmax', 'input', { value: '-0.35' }],
    ['panelTempCoeffVoc', 'input', { value: '-0.27' }],
    ['panelValidationBadge', 'div'],
    ['panelValidationMsg', 'div'],
    ['systemType', 'select', { value: 'off_grid' }],
    ['phaseType', 'select', { value: 'single' }],
    ['acVoltageCustom', 'input', { value: '' }],
    ['inverterMarketOverride', 'select', { value: 'auto' }],
    ['inverterManualVA', 'input', { value: '' }],
    ['inverterManualVoltage', 'select', { value: 'auto' }],
    ['inverterHasBuiltinMPPT', 'select', { value: 'no' }],
    ['inverterTechnology', 'select', { value: 'unknown' }],
    ['inverterSurgeMultiplier', 'input', { value: '2.0' }],
    ['mpptInputCount', 'select', { value: '1' }],
    ['mpptMaxVoltage', 'input', { value: '500' }],
    ['mpptMaxCurrent', 'input', { value: '27' }],
    ['mpptMaxPower', 'input', { value: '7500' }],
    ['mpptMinVoltage', 'input', { value: '95' }],
    ['mpptMaxOperatingVoltage', 'input', { value: '450' }],
    ['mpptMaxChargeCurrent', 'input', { value: '120' }],
    ['mppt2MaxVoltage', 'input', { value: '500' }],
    ['mppt2MaxCurrent', 'input', { value: '18' }],
    ['mppt2MaxPower', 'input', { value: '3000' }],
    ['mppt2MinVoltage', 'input', { value: '60' }],
    ['mppt2MaxOperatingVoltage', 'input', { value: '450' }],
    ['mppt2MaxChargeCurrent', 'input', { value: '60' }],
    ['mppt3MaxVoltage', 'input', { value: '500' }],
    ['mppt3MaxCurrent', 'input', { value: '18' }],
    ['mppt3MaxPower', 'input', { value: '3000' }],
    ['mppt3MinVoltage', 'input', { value: '60' }],
    ['mppt3MaxOperatingVoltage', 'input', { value: '450' }],
    ['mppt3MaxChargeCurrent', 'input', { value: '60' }],
    ['batteryChemistry', 'select', { value: 'agm' }],
    ['batteryMixedToggle', 'select', { value: 'no' }],
    ['batteryMixedShorthand', 'input', { value: '' }],
    ['batteryMixedTopologyResult', 'div'],
    ['batteryUnitCount', 'input', { value: '' }],
    ['batteryUnitVoltageCustom', 'input', { value: '', style: { display: 'none' } }],
    ['batteryUnitAhCustom', 'input', { value: '', style: { display: 'none' } }],
    ['batteryKwhInput', 'input', { value: '' }],
    ['batteryKwhToAhResult', 'div', { textContent: '\u2014' }],
    ['lithiumKwhSection', 'div', { style: { display: 'none' } }],
    ['batteryUniformAhInput', 'div', { style: { display: '' } }],
    ['batteryMixedAhInput', 'div', { style: { display: 'none' } }],
    ['batteryMixedGroupsSection', 'div', { classList: { add() {}, remove() {} } }],
    ['batteryAhHelpText', 'div', { textContent: '' }],
    ['batteryMixedEnabled', 'select', { value: 'no' }]
].forEach(([id, tagName, props]) => el(id, tagName, props || {}));

setOptions('panelLibraryPreset', ['']);
setOptions('inverterLibraryPreset', ['']);
setOptions('batteryLibraryPreset', ['']);
setOptions('systemType', ['off_grid', 'hybrid']);
setOptions('phaseType', ['single', 'split']);
setOptions('acVoltage', ['230', '240', 'custom']);
setOptions('inverterMarketOverride', ['auto', 'EMERGING_OFFGRID', 'US_SPLIT_PHASE']);
setOptions('inverterManualVoltage', ['auto', '12', '24', '48']);
setOptions('inverterHasBuiltinMPPT', ['no', 'yes']);
setOptions('inverterTechnology', ['unknown', 'transformerless', 'transformer']);
setOptions('mpptInputCount', ['1', '2', '3']);
setOptions('batteryChemistry', ['lifepo4', 'agm', 'gel', 'fla']);
setOptions('batteryMixedToggle', ['no', 'yes']);
setOptions('batteryMixedEnabled', ['no', 'yes']);
setOptions('batteryUnitVoltage', ['12', '24', '48', 'custom']);
setOptions('batteryUnitAh', ['auto', '100', '150', '200', '220', '230', '1000', 'custom']);

LoadEngine.appliances = [];
PVCalculator.saveToLocalStorageAuto = function() { global.__autosaved = true; };
PVCalculator.calculate = function() { global.__calculated = true; };
PVCalculator.validatePanelSpecs = function() { return { valid: true, warnings: [] }; };
PVCalculator.toggleManualMode = function() {};
PVCalculator.onSystemTypeChange = function() {};
PVCalculator.onPhaseTypeChange = function() {};
PVCalculator.toggleMPPTSection = function() {};
PVCalculator.toggleMultiMPPT = function() {};

PVCalculator.populateEquipmentLibraryOptions();
assert(el('panelLibraryPreset').innerHTML.includes('400Wp Mono Half-Cell'), 'Panel library options should include the mono 400Wp preset');
assert(el('inverterLibraryPreset').innerHTML.includes('11.4kW / 48V Split-Phase Hybrid'), 'Inverter library options should include the split-phase preset');
assert(el('batteryLibraryPreset').innerHTML.includes('5.12kWh Rack Module'), 'Battery library options should include the 5.12kWh rack preset');

el('panelLibraryPreset').value = 'mono_550_commercial';
PVCalculator.applyEquipmentPreset('panel');
assert(el('panelLibraryAppliedId').value === 'mono_550_commercial', 'Applying a panel preset should persist the applied panel preset id');
assert(el('panelWattage').value === '550', 'Panel preset should update the panel wattage');
assert(el('panelVmp').value === '42.8', 'Panel preset should update the panel Vmp');
assert(el('equipmentLibraryStatus').textContent.includes('Applied 550Wp Commercial Mono'), 'Status should acknowledge the applied panel reference');

el('inverterLibraryPreset').value = 'split_11k_48_dual';
PVCalculator.applyEquipmentPreset('inverter');
assert(el('inverterLibraryAppliedId').value === 'split_11k_48_dual', 'Applying an inverter preset should persist the applied inverter preset id');
assert(el('manualMode').checked === true, 'Inverter presets should force manual equipment mode for validation');
assert(el('phaseType').value === 'split', 'Split-phase inverter preset should update the phase type');
assert(el('acVoltage').value === '240', 'Split-phase inverter preset should align the AC voltage');
assert(el('inverterManualVA').value === '11400', 'Inverter preset should update the manual inverter VA field');
assert(el('mpptInputCount').value === '2', 'Inverter preset should update the MPPT input count');
assert(el('mppt2MaxPower').value === '6500', 'Dual-MPPT inverter preset should populate the secondary MPPT power');

el('batteryLibraryPreset').value = 'lifepo4_5kwh_rack';
PVCalculator.applyEquipmentPreset('battery');
assert(el('batteryLibraryAppliedId').value === 'lifepo4_5kwh_rack', 'Applying a battery preset should persist the applied battery preset id');
assert(el('batteryChemistry').value === 'lifepo4', 'Battery preset should update the chemistry');
assert(el('batteryUnitVoltage').value === 'custom', '51.2V battery preset should use the custom voltage path');
assert(String(el('batteryUnitVoltageCustom').value) === '51.2', 'Battery preset should populate the custom unit voltage');
assert(el('batteryUnitAh').value === '100', 'Battery preset should update the battery unit Ah reference');
assert(el('batteryKwhToAhResult').textContent.includes('100 Ah per reference module'), 'Battery preset should update the module reference helper text');

const appliedDetails = PVCalculator.getEquipmentPresetDetails(true);
assert(appliedDetails.hasSelections === true, 'Applied equipment details should report active selections');
assert(appliedDetails.inverter.label === '11.4kW / 48V Split-Phase Hybrid', 'Applied inverter detail should match the selected preset');

const referenceLines = PVCalculator.getEquipmentReferenceLines();
assert(referenceLines.length === 3, 'Reference lines should include panel, inverter, and battery references after applying all three presets');
assert(referenceLines.some(line => line.includes('550Wp Commercial Mono')), 'Reference lines should mention the applied panel preset');

const referencePanelHtml = PVCalculator.renderEquipmentReferencePanel();
assert(referencePanelHtml.includes('Reference Equipment'), 'Reference equipment panel should render a title');
assert(referencePanelHtml.includes('Battery reference: 5.12kWh Rack Module'), 'Reference equipment panel should include the battery preset label');

el('panelLibraryPreset').value = '';
PVCalculator.applyEquipmentPreset('panel');
assert(el('panelLibraryAppliedId').value === '', 'Applying an empty panel selection should clear the applied panel reference');
assert(PVCalculator.getEquipmentReferenceLines().length === 2, 'Clearing one applied preset should remove it from the reference output');

console.log('Equipment library regression checks passed.');
