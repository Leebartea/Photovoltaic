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

const tempFile = '_test_business_context_temp.js';
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
    LoadEngine,
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
    ['commercialArchitectureMode', 'select', { value: 'auto' }],
    ['generatorSupportMode', 'select', { value: 'none' }],
    ['generatorSizeKVA', 'input', { value: '0' }],
    ['pvFieldLayout', 'select', { value: 'single_field' }],
    ['mpptGroupingMode', 'select', { value: 'auto' }],
    ['commercialArchitectureHint', 'div', {}],
    ['plantScopeMode', 'select', { value: 'auto' }],
    ['distributionTopologyMode', 'select', { value: 'auto' }],
    ['interconnectionScopeMode', 'select', { value: 'auto' }],
    ['plantScopingHint', 'div', {}],
    ['plantEngineeringSurfaceHint', 'div', {}],
    ['location', 'select', { value: 'lagos_ng' }],
    ['inverterMarketOverride', 'select', { value: 'auto' }],
    ['systemType', 'select', { value: 'off_grid' }],
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
    ['projectTemplatePreset', 'select', { value: 'tailoring_studio' }],
    ['projectTemplatePreview', 'div', {}],
    ['proposalCompanyName', 'input', { value: 'Leebartea Energy Systems' }],
    ['proposalContactName', 'input', { value: 'Tunde Adebayo' }],
    ['proposalContactPhone', 'input', { value: '+2348000000000' }],
    ['proposalContactEmail', 'input', { value: 'sales@leebartea.example' }],
    ['proposalClientName', 'input', { value: 'Demo Client' }],
    ['proposalSiteName', 'input', { value: 'Demo Site' }],
    ['proposalQuoteReference', 'input', { value: 'BC-001' }],
    ['proposalIssueDate', 'input', { value: '2026-03-10' }],
    ['surveyStage', 'select', { value: 'onsite_complete' }],
    ['surveyMountingType', 'select', { value: 'roof' }],
    ['surveyShadingProfile', 'select', { value: 'clear' }],
    ['surveyCableRoute', 'select', { value: 'simple' }],
    ['surveyAccess', 'select', { value: 'standard' }],
    ['surveyNotes', 'textarea', { value: '' }],
    ['surveyStructureConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyCableRouteConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyEarthingConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyExclusionsReviewed', 'input', { type: 'checkbox', checked: true }],
    ['surveyBudgetAligned', 'input', { type: 'checkbox', checked: true }],
    ['surveyUtilityReviewed', 'input', { type: 'checkbox', checked: true }]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

PVCalculator.getInverterClusterConfig = function() { return { enabled: false }; };
PVCalculator.saveToLocalStorageAuto = function() {
    global.__autosaveCount = (global.__autosaveCount || 0) + 1;
};

PVCalculator.populateBusinessContextOptions();
assert(addControl('businessProfile', 'select').value === 'custom_mixed_site', 'Business profile should default to custom / mixed site');
assert(addControl('operatingIntent', 'select').value === 'backup_only', 'Operating intent should default to backup-only');
assert(addControl('continuityClass', 'select').value === 'business_critical', 'Continuity class should default to business-critical');
assert(addControl('businessContextHint', 'div').innerHTML.includes('Custom / Mixed Site'), 'Business hint should render the default profile');

addControl('businessProfile', 'select').value = 'filling_station';
PVCalculator.onBusinessContextChange('profile');
assert(addControl('operatingIntent', 'select').value === 'hybrid_generator', 'Filling station should recommend generator-assisted hybrid intent');
assert(addControl('continuityClass', 'select').value === 'process_critical', 'Filling station should recommend process-critical continuity');
assert(addControl('businessContextHint', 'div').innerHTML.includes('3-phase review is strongly justified'), 'Business hint should explain the stronger 3-phase review stance');
assert(addControl('commercialArchitectureHint', 'div').innerHTML.includes('Commercial power architecture'), 'Commercial architecture hint should render when business context changes');
assert(addControl('plantEngineeringSurfaceHint', 'div').innerHTML.includes('Current working surface'), 'Plant engineering surface hint should render when plant scoping refreshes');

const fillingStationConfig = PVCalculator.getConfig();
assert(fillingStationConfig.businessProfile === 'filling_station', 'Config should include the selected business profile');
assert(fillingStationConfig.businessContext.phaseFit.status === 'warn', 'Single-phase filling station should surface a topology warning');

addControl('businessProfile', 'select').value = 'residential_backup';
PVCalculator.onBusinessContextChange('profile');
addControl('operatingIntent', 'select').value = 'daytime_solar_first';
addControl('operatingSchedulePreset', 'select').value = 'twenty_four_seven';
PVCalculator.onBusinessContextChange('schedule');
const mismatchHtml = addControl('businessContextHint', 'div').innerHTML;
assert(mismatchHtml.includes('Current configuration is usable'), 'Business hint should surface the smart configuration conclusion when fields drift');
assert(mismatchHtml.includes('Apply profile defaults'), 'Business hint should expose the quick-align action for profile defaults');
PVCalculator.applyBusinessContextSmartAction('profile_defaults');
assert(addControl('operatingIntent', 'select').value === 'backup_only', 'Profile default action should restore the recommended operating intent');
assert(addControl('operatingSchedulePreset', 'select').value === 'business_day', 'Profile default action should restore the recommended operating schedule');

addControl('operatingIntent', 'select').value = 'hybrid_grid';
addControl('systemType', 'select').value = 'off_grid';
PVCalculator.onBusinessContextChange('intent');
const systemMismatchHtml = addControl('businessContextHint', 'div').innerHTML;
assert(systemMismatchHtml.includes('Align system type'), 'Business hint should expose the smart system-type alignment action');
PVCalculator.applyBusinessContextSmartAction('align_system_type');
assert(addControl('systemType', 'select').value === 'hybrid', 'System-type alignment should switch to the first preferred operating path');

addControl('businessProfile', 'select').value = 'filling_station';
addControl('operatingIntent', 'select').value = 'hybrid_generator';
addControl('systemType', 'select').value = 'hybrid';
addControl('commercialArchitectureMode', 'select').value = 'full_site_board';
addControl('generatorSupportMode', 'select').value = 'none';
addControl('pvFieldLayout', 'select').value = 'single_field';
addControl('mpptGroupingMode', 'select').value = 'auto';
PVCalculator.renderCommercialArchitectureHint();
assert(addControl('commercialArchitectureHint', 'div').innerHTML.includes('Apply architecture defaults'), 'Commercial architecture hint should expose a smart alignment action');
PVCalculator.applyCommercialArchitectureSmartAction('apply_architecture_defaults');
assert(addControl('commercialArchitectureMode', 'select').value === 'generator_assist', 'Architecture default action should restore the recommended board strategy');
assert(addControl('pvFieldLayout', 'select').value === 'distributed_canopy', 'Architecture default action should restore the recommended PV layout');

addControl('plantScopeMode', 'select').value = 'captive_site';
addControl('distributionTopologyMode', 'select').value = 'single_board';
addControl('interconnectionScopeMode', 'select').value = 'offgrid_islanded';
PVCalculator.renderPlantScopingHint();
assert(addControl('plantScopingHint', 'div').innerHTML.includes('Apply plant defaults'), 'Plant scoping hint should expose a smart scoping alignment action');
PVCalculator.applyPlantScopingSmartAction('apply_plant_scope_defaults');
assert(addControl('plantScopeMode', 'select').value === 'multi_feeder_site', 'Plant default action should restore the recommended plant scope');
assert(addControl('distributionTopologyMode', 'select').value === 'radial_feeders', 'Plant default action should restore the recommended topology');
assert(addControl('interconnectionScopeMode', 'select').value === 'private_distribution', 'Plant default action should restore the recommended interconnection scope');

LoadEngine.appliances = [];
addControl('businessProfile', 'select').value = 'tailoring_studio';
PVCalculator.onBusinessContextChange('profile');
PVCalculator.loadSampleAppliances();
assert(LoadEngine.appliances.length === DEFAULTS.PROJECT_TEMPLATES.tailoring_studio.appliances.length, 'Tailoring profile should load tailoring template appliances');
assert(LoadEngine.appliances[0].name === DEFAULTS.PROJECT_TEMPLATES.tailoring_studio.appliances[0].name, 'Tailoring sample loads should come from the tailoring template');

addControl('projectTemplatePreset', 'select').value = 'tailoring_studio';
PVCalculator.renderProjectTemplatePreview();
const previewHtml = addControl('projectTemplatePreview', 'div').innerHTML;
assert(previewHtml.includes('Tailoring Studio'), 'Template preview should include the template label');
assert(previewHtml.includes('Daytime Solar-First'), 'Template preview should include the operating intent label');
assert(previewHtml.includes('Business Critical'), 'Template preview should include the continuity label');

addControl('businessProfile', 'select').value = 'filling_station';
PVCalculator.onBusinessContextChange('profile');
const readinessWarn = PVCalculator.calculateProposalReadiness({
    config: PVCalculator.getConfig(),
    compliance: {
        status: 'ready',
        statusLabel: 'Ready',
        completionPct: 100,
        pathLabel: 'Off-grid electrical path',
        pathNote: 'Ready for off-grid review.',
        codeFamily: 'IEC',
        authority: 'Installer review',
        reviewBadge: 'Closed',
        openItems: [],
        notes: [],
        tone: 'green'
    },
    aggregation: {},
    inverter: {},
    battery: {},
    pvArray: {}
}, { hasBlocks: false }, { score: 90 });

const businessGateWarn = readinessWarn.gates.find(gate => gate.label === 'Business topology fit');
assert(businessGateWarn && businessGateWarn.status === 'warn', 'Readiness should warn when a filling station is still modeled as single-phase');
assert(readinessWarn.openItems.some(item => item.includes('machine schedule') || item.includes('service arrangement')), 'Readiness should ask for a phase review on filling-station jobs');

addControl('phaseType', 'select').value = 'three_phase';
const readinessPass = PVCalculator.calculateProposalReadiness({
    config: PVCalculator.getConfig(),
    compliance: {
        status: 'ready',
        statusLabel: 'Ready',
        completionPct: 100,
        pathLabel: 'Off-grid electrical path',
        pathNote: 'Ready for off-grid review.',
        codeFamily: 'IEC',
        authority: 'Installer review',
        reviewBadge: 'Closed',
        openItems: [],
        notes: [],
        tone: 'green'
    },
    aggregation: {
        phaseAllocation: {
            imbalancePct: 8,
            classificationLabel: 'Balanced',
            limitingPhase: 'L2',
            phaseVoltage: 230,
            equalLegClusterFloorVA: 12000
        }
    },
    inverter: {
        clusterPlan: {
            enabled: true,
            status: 'ready',
            topologyLabel: 'Phase-targeted inverter bank',
            phaseDistributionLabel: 'L1 1 / L2 1 / L3 1',
            worstHeadroomPct: 24,
            worstPhaseLabel: 'L2',
            moduleRatedVA: 5000
        }
    },
    battery: {},
    pvArray: {}
}, { hasBlocks: false }, { score: 90 });

const businessGatePass = readinessPass.gates.find(gate => gate.label === 'Business topology fit');
assert(businessGatePass && businessGatePass.status === 'pass', 'Readiness should pass the business topology gate once the filling station is modeled as 3-phase');

console.log('Business context tests passed');
