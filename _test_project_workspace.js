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
const __panelMismatchRows = [];
const __batteryMixedRows = [];
let __lastDownload = null;
let __lastObjectUrlBlob = null;

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
    const el = {
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
        blur() {},
        click() { global.__clickCount = (global.__clickCount || 0) + 1; }
    };
    return el;
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
        if (selector === '#tab-overview svg') return null;
        return null;
    },
    querySelectorAll(selector) {
        if (selector === 'input[id], select[id], textarea[id]') {
            return Object.values(__elements).filter(el => el.id && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));
        }
        if (selector === '.pvMismatchGroupSpec') return __panelMismatchRows;
        if (selector === '#batteryMixedGroupsContainer .batteryMixedGroupRow') return __batteryMixedRows;
        return [];
    },
    createElement(tag) {
        if (tag === 'a') {
            const link = makeElement('a');
            link.click = function() { __lastDownload = { href: this.href, download: this.download, blob: __lastObjectUrlBlob }; };
            return link;
        }
        return makeElement(tag);
    },
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
var Blob = function(parts, opts) { this.parts = parts; this.type = opts?.type || ''; this.content = parts.join('\\n'); };
var Image = function() {};
var XMLSerializer = function() { this.serializeToString = function() { return ''; }; };
var URL = {
    createObjectURL(blob) { __lastObjectUrlBlob = blob; return 'blob:test'; },
    revokeObjectURL() {}
};

global.__elements = __elements;
global.__ensureElement = ensureElement;
global.__alerts = [];
global.__panelMismatchRows = __panelMismatchRows;
global.__batteryMixedRows = __batteryMixedRows;
global.__getLastDownload = function() { return __lastDownload; };
`;

const tempFile = '_test_project_workspace_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, __elements, __ensureElement, window, document, localStorage, __getLastDownload };`);

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
    __ensureElement,
    localStorage,
    __getLastDownload
} = mod;

function addControl(id, tagName, props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

[
    ['projectName', 'input', { value: 'Clinic Backup Proposal' }],
    ['projectWorkspaceStatus', 'div', {}],
    ['projectSyncBadge', 'div', {}],
    ['savedProjectsContainer', 'div', {}],
    ['projectTemplatePreset', 'select', { value: '' }],
    ['projectTemplatePreview', 'div', {}],
    ['location', 'select', { value: 'lagos_ng' }],
    ['audienceMode', 'select', { value: 'client' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['phaseType', 'select', { value: 'single' }],
    ['acVoltage', 'select', { value: '230', options: [{ value: '220' }, { value: '230' }, { value: 'custom' }] }],
    ['acVoltageCustom', 'input', { value: '' }],
    ['frequency', 'select', { value: '50' }],
    ['autonomyDays', 'input', { value: '2' }],
    ['quoteCurrencyLabel', 'input', { value: 'NGN' }],
    ['pricingProfile', 'select', { value: 'premium' }],
    ['regionalPriceFactor', 'input', { value: '1.25' }],
    ['proposalDepositPct', 'input', { value: '70' }],
    ['proposalIncludedScope', 'textarea', { value: 'Old included scope' }],
    ['proposalExclusions', 'textarea', { value: 'Old exclusions' }],
    ['proposalNextSteps', 'textarea', { value: 'Old next steps' }],
    ['proposalCompanyName', 'input', { value: 'Leebartea Energy Systems' }],
    ['proposalContactName', 'input', { value: 'Tunde Adebayo' }],
    ['proposalContactPhone', 'input', { value: '+2348000000000' }],
    ['proposalContactEmail', 'input', { value: 'sales@leebartea.example' }],
    ['proposalClientName', 'input', { value: 'Existing Client' }],
    ['proposalSiteName', 'input', { value: 'Existing Site' }],
    ['proposalQuoteReference', 'input', { value: 'OLD-QUOTE-1' }],
    ['proposalIssueDate', 'input', { value: '2026-03-08' }],
    ['surveyStage', 'select', { value: 'onsite_complete' }],
    ['surveyMountingType', 'select', { value: 'roof' }],
    ['surveyShadingProfile', 'select', { value: 'clear' }],
    ['surveyCableRoute', 'select', { value: 'simple' }],
    ['surveyAccess', 'select', { value: 'standard' }],
    ['surveyNotes', 'textarea', { value: 'Old survey note' }],
    ['surveyStructureConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyCableRouteConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyEarthingConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyExclusionsReviewed', 'input', { type: 'checkbox', checked: true }],
    ['surveyBudgetAligned', 'input', { type: 'checkbox', checked: true }],
    ['surveyUtilityReviewed', 'input', { type: 'checkbox', checked: true }],
    ['batteryChemistry', 'select', { value: 'lifepo4' }],
    ['manualMode', 'input', { type: 'checkbox', checked: true }],
    ['pdfIncludeDetails', 'input', { type: 'checkbox', checked: false }],
    ['batteryMixedToggle', 'select', { value: 'no' }],
    ['batteryMixedShorthand', 'input', { value: '' }],
    ['projectImportInput', 'input', { type: 'file', value: '' }]
].forEach(([id, tag, props]) => addControl(id, tag, props));

PVCalculator.toggleMultiMPPT = function() {};
PVCalculator.updateAudienceMode = function() {};
PVCalculator.toggleManualMode = function() {};
PVCalculator.onSystemTypeChange = function() {};
PVCalculator.onBatteryChemistryChange = function() {};
PVCalculator.applyPanelMismatchState = function() {};
PVCalculator.applyBatteryMixedState = function() {};
PVCalculator.renderApplianceList = function() { global.__renderApplianceCalls = (global.__renderApplianceCalls || 0) + 1; };
PVCalculator.validatePanelSpecs = function() { return { valid: true }; };
PVCalculator.calculate = function() { global.__calculateCalls = (global.__calculateCalls || 0) + 1; };
PVCalculator.onPhaseTypeChange = function() {};

LoadEngine.appliances = [
    { name: 'Fridge', quantity: 1, ratedPowerW: 150, surgeFactor: 4 },
    { name: 'Lights', quantity: 6, ratedPowerW: 12, surgeFactor: 1.2 }
];

const savedProject = PVCalculator.saveProjectToBrowser({ showAlert: false });
assert(savedProject.meta.name === 'Clinic Backup Proposal', 'Project name should be saved');

const storedProjects = JSON.parse(localStorage.getItem('pvCalculatorProjects'));
assert(Array.isArray(storedProjects) && storedProjects.length === 1, 'Browser project library should contain one saved project');
assert(storedProjects[0].formState.location.value === 'lagos_ng', 'Saved project should persist location');
assert(storedProjects[0].formState.audienceMode.value === 'client', 'Saved project should persist workspace mode');
assert(PVCalculator.currentProjectId === storedProjects[0].meta.id, 'Current project id should track the saved project');

addControl('projectName', 'input').value = 'Temporary Draft';
addControl('location', 'select').value = 'generic';
addControl('audienceMode', 'select').value = 'installer';
LoadEngine.appliances = [];

PVCalculator.loadProjectById(savedProject.meta.id, { showAlert: false });

assert(addControl('projectName', 'input').value === 'Clinic Backup Proposal', 'Loading a project should restore the project name');
assert(addControl('location', 'select').value === 'lagos_ng', 'Loading a project should restore the saved location');
assert(addControl('audienceMode', 'select').value === 'client', 'Loading a project should restore the saved workspace mode');
assert(LoadEngine.appliances.length === 2, 'Loading a project should restore appliances');

PVCalculator.saveToLocalStorageAuto();
const autosave = JSON.parse(localStorage.getItem('pvCalculatorAutoSaveV2'));
assert(autosave.formState.projectName.value === 'Clinic Backup Proposal', 'Autosave should persist the current project name');
assert(autosave.formState.quoteCurrencyLabel.value === 'NGN', 'Autosave should persist commercial inputs');
assert(Array.isArray(autosave.appliances) && autosave.appliances.length === 2, 'Autosave should persist appliances');

PVCalculator.exportProjectById(savedProject.meta.id);
const download = __getLastDownload();
assert(download && download.download === 'clinic_backup_proposal.pvcalc.json', 'Project export should use a portable pvcalc filename');
assert(download.blob.content.includes('"name": "Clinic Backup Proposal"'), 'Exported project file should contain the saved project name');

localStorage.removeItem('pvCalculatorProjects');
localStorage.removeItem('pvCalculatorCurrentProject');
localStorage.setItem('pvCalculatorData', JSON.stringify({
    savedAt: '2026-03-07T09:15:00.000Z',
    appliances: [{ name: 'Pump', quantity: 1, ratedPowerW: 750 }],
    config: {
        location: 'lagos',
        audienceMode: 'installer',
        systemType: 'off_grid',
        acVoltage: 230,
        phaseType: 'single',
        frequency: 50
    },
    proposalPricing: { currencyLabel: 'USD' },
    panel: { wattage: 400 },
    batteryChemistry: 'agm'
}));

PVCalculator.migrateLegacyProjectStorage();
const migratedProjects = PVCalculator.getStoredProjects();
assert(migratedProjects.length === 1, 'Legacy browser save should migrate into the project library');
assert(migratedProjects[0].formState.location.value === 'lagos_ng', 'Legacy migration should normalize old location keys');
assert(migratedProjects[0].formState.batteryChemistry.value === 'agm', 'Legacy migration should preserve battery chemistry');

PVCalculator.populateProjectTemplateOptions();
assert(addControl('projectTemplatePreset', 'select').value === 'residential_backup', 'Template dropdown should default to the first registered template');
assert(addControl('projectTemplatePreview', 'div').innerHTML.includes('Residential Backup'), 'Template preview should describe the active template');

addControl('projectTemplatePreset', 'select').value = 'tailoring_studio';
PVCalculator.onProjectTemplateChange();
assert(addControl('projectTemplatePreview', 'div').innerHTML.includes('Tailoring Studio'), 'Template preview should update when the selected template changes');

const calculateCallsBeforeTemplate = global.__calculateCalls || 0;
PVCalculator.currentProjectId = savedProject.meta.id;
localStorage.setItem('pvCalculatorCurrentProject', savedProject.meta.id);
PVCalculator.applyProjectTemplate();

assert(addControl('projectName', 'input').value === 'Tailoring Studio Solar Draft', 'Applying a template should replace the project name with the template draft name');
assert(addControl('audienceMode', 'select').value === 'installer', 'Applying a template should switch the workspace mode');
assert(addControl('pricingProfile', 'select').value === 'standard', 'Applying a template should set the commercial posture');
assert(addControl('proposalClientName', 'input').value === '', 'Applying a template should clear client-specific identity fields');
assert(addControl('proposalQuoteReference', 'input').value === '', 'Applying a template should clear the old quote reference');
assert(addControl('proposalCompanyName', 'input').value === 'Leebartea Energy Systems', 'Applying a template should preserve installer identity');
assert(addControl('surveyStage', 'select').value === 'preliminary', 'Applying a template should reset survey state back to preliminary');
assert(addControl('surveyStructureConfirmed', 'input').checked === false, 'Applying a template should clear survey confirmations');
assert(LoadEngine.appliances.length === DEFAULTS.PROJECT_TEMPLATES.tailoring_studio.appliances.length, 'Applying a template should replace the load list with the template appliances');
assert(PVCalculator.currentProjectId === null, 'Applying a template should detach the current named project to avoid accidental overwrite');
assert(localStorage.getItem('pvCalculatorCurrentProject') === null, 'Applying a template should clear the current browser-project pointer');
assert((global.__calculateCalls || 0) > calculateCallsBeforeTemplate, 'Applying a template should trigger a recalculation for the new draft');
assert(addControl('projectWorkspaceStatus', 'div').textContent.includes('Applied "Tailoring Studio"'), 'Applying a template should leave a draft-safe workspace status message');

console.log('project workspace tests passed');
