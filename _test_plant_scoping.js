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

const tempFile = '_test_plant_scoping_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, PlantScopingEngine: typeof PlantScopingEngine !== 'undefined' ? PlantScopingEngine : null, CommercialArchitectureEngine, CommercialDecisionEngine, AggregationEngine, LoadEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    PVCalculator,
    PlantScopingEngine,
    CommercialArchitectureEngine,
    CommercialDecisionEngine,
    AggregationEngine,
    LoadEngine,
    __ensureElement
} = mod;

assert(PlantScopingEngine, 'PlantScopingEngine should be available in the built artifact');

function addControl(id, tagName, props = {}) {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

[
    ['audienceMode', 'select', { value: 'installer' }],
    ['location', 'select', { value: 'lagos_ng' }],
    ['inverterMarketOverride', 'select', { value: 'auto' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['businessProfile', 'select', { value: 'filling_station' }],
    ['operatingIntent', 'select', { value: 'hybrid_generator' }],
    ['continuityClass', 'select', { value: 'process_critical' }],
    ['operatingSchedulePreset', 'select', { value: 'extended_business_day' }],
    ['commercialArchitectureMode', 'select', { value: 'generator_assist' }],
    ['generatorSupportMode', 'select', { value: 'existing_generator' }],
    ['generatorSizeKVA', 'input', { value: '25' }],
    ['pvFieldLayout', 'select', { value: 'distributed_canopy' }],
    ['mpptGroupingMode', 'select', { value: 'field_split' }],
    ['plantScopeMode', 'select', { value: 'auto' }],
    ['distributionTopologyMode', 'select', { value: 'auto' }],
    ['interconnectionScopeMode', 'select', { value: 'auto' }],
    ['utilityPacketMode', 'select', { value: 'captive_handoff_packet' }],
    ['meteringPostureMode', 'select', { value: 'captive_no_meter' }],
    ['studyInputStatusMode', 'select', { value: 'feeder_basis_frozen' }],
    ['studyTrackMode', 'select', { value: 'protection_relay_review' }],
    ['utilityProtectionReviewMode', 'select', { value: 'relay_trip_export_review' }],
    ['utilityExportControlMode', 'select', { value: 'non_export_relay_trip_proof' }],
    ['utilityRelaySchemeMode', 'select', { value: 'non_export_trip_relay' }],
    ['utilityTransferSchemeMode', 'select', { value: 'ats_or_staged_transfer' }],
    ['oneLinePackStatusMode', 'select', { value: 'review_ready' }],
    ['protectionPackStatusMode', 'select', { value: 'issued_or_submitted' }],
    ['witnessPackStatusMode', 'select', { value: 'review_ready' }],
    ['commissioningPathMode', 'select', { value: 'internal_handover' }],
    ['utilityPacketStageMode', 'select', { value: 'submitted_under_review' }],
    ['utilityCaseStatusMode', 'select', { value: 'review_comments_open' }],
    ['utilityFilingChannelMode', 'select', { value: 'portal_or_utility_desk' }],
    ['utilityHoldPointMode', 'select', { value: 'metering_or_export_clearance' }],
    ['utilityResponsePathMode', 'select', { value: 'portal_redline_cycle' }],
    ['witnessPartyMode', 'select', { value: 'client_and_installer' }],
    ['witnessEvidenceMode', 'select', { value: 'staged_transfer_proof' }],
    ['utilityApplicationReference', 'input', { value: 'PLANT-STUDY-REV-B' }],
    ['utilityCaseOwner', 'input', { value: 'IKEDC Embedded Desk' }],
    ['utilityStudyOwner', 'input', { value: 'Protection Consultant / Relay Lead' }],
    ['utilityStudyNodeReference', 'input', { value: 'PCC-1 / Main LV board / Feeder B' }],
    ['utilityFaultLevelReference', 'input', { value: '18kA PCC / SCC Basis Rev 2' }],
    ['utilitySubmissionDate', 'input', { value: '2026-03-12' }],
    ['utilityFaultBasisNote', 'input', { value: '18kA PCC basis / non-export relay proof pending.' }],
    ['utilityRevisionLabel', 'input', { value: 'Rev B / Comment Response 1' }],
    ['utilityNextActionOwner', 'input', { value: 'Installer PM / Protection Consultant' }],
    ['utilityNextActionDueDate', 'input', { value: '2026-03-24' }],
    ['utilityNextAction', 'textarea', { value: 'Issue Rev B one-line and submit non-export relay proof package.' }],
    ['utilityEngineeringNotes', 'textarea', { value: 'Freeze feeder labels before staged restart witness.' }],
    ['utilitySubmissionTrail', 'textarea', { value: 'Filed 2026-03-12, review comments issued 2026-03-18, Rev B resubmitted 2026-03-20.' }],
    ['utilityReviewComments', 'textarea', { value: 'Hold non-export relay proof and signed witness roster before clearance.' }],
    ['commercialArchitectureHint', 'div', {}],
    ['plantScopingHint', 'div', {}],
    ['plantEngineeringSurfaceHint', 'div', {}],
    ['utilityEngineeringHint', 'div', {}],
    ['businessContextHint', 'div', {}],
    ['phaseType', 'select', { value: 'three_phase' }],
    ['acVoltage', 'select', { value: '400' }],
    ['acVoltageCustom', 'input', { value: '' }],
    ['frequency', 'select', { value: '50' }],
    ['avgPSH', 'input', { value: '4.5' }],
    ['autonomyDays', 'input', { value: '1' }],
    ['ambientTempMin', 'input', { value: '20' }],
    ['ambientTempMax', 'input', { value: '35' }],
    ['designMargin', 'input', { value: '125' }],
    ['inverterSurgeMultiplier', 'input', { value: '2.0' }],
    ['inverterTechnology', 'select', { value: 'hybrid' }],
    ['panelOrientation', 'select', { value: 'south' }],
    ['panelTilt', 'select', { value: 'optimal' }]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

PVCalculator.getInverterClusterConfig = function() {
    return { enabled: false };
};
PVCalculator.saveToLocalStorageAuto = function() {};
PVCalculator.getMPPT = function() {
    return {
        maxVoltage: 500,
        minVoltage: 120,
        maxOperatingVoltage: 450,
        maxCurrent: 60,
        maxPower: 18000,
        maxChargeCurrent: 250,
        totalMaxChargeCurrent: 250,
        inputCount: 3
    };
};

PVCalculator.populateBusinessContextOptions();
PVCalculator.populateOperationalModelOptions();
PVCalculator.populateCommercialArchitectureOptions();
PVCalculator.populatePlantScopingOptions();
PVCalculator.populateUtilityEngineeringOptions();
addControl('utilityFilingChannelMode', 'select').value = 'portal_or_utility_desk';
addControl('utilityHoldPointMode', 'select').value = 'metering_or_export_clearance';
addControl('utilityResponsePathMode', 'select').value = 'portal_redline_cycle';

assert(addControl('plantScopeMode', 'select').innerHTML.includes('Multi-Feeder Commercial Site'), 'Plant scope options should be populated');
assert(addControl('distributionTopologyMode', 'select').innerHTML.includes('Protected Critical Bus'), 'Distribution topology options should be populated');
assert(addControl('interconnectionScopeMode', 'select').innerHTML.includes('Behind-The-Meter Hybrid'), 'Interconnection scope options should be populated');
assert(addControl('studyTrackMode', 'select').innerHTML.includes('Protection / Relay Review Pack'), 'Study track options should be populated');
assert(addControl('utilityProtectionReviewMode', 'select').innerHTML.includes('Relay / Export Logic Review'), 'Protection review options should be populated');
assert(addControl('utilityExportControlMode', 'select').innerHTML.includes('Non-Export Relay / Trip Proof'), 'Export-control options should be populated');
assert(addControl('utilityRelaySchemeMode', 'select').innerHTML.includes('Non-Export / Trip Relay'), 'Relay-scheme options should be populated');
assert(addControl('utilityTransferSchemeMode', 'select').innerHTML.includes('ATS / Staged Transfer'), 'Transfer-scheme options should be populated');
assert(PVCalculator.getUtilityDeliverableStatusModes().review_ready.label === 'Review Ready', 'Deliverable status modes should expose the review-ready label');

const config = PVCalculator.getConfig();
assert(config.plantScopeMode === 'auto', 'Config should capture plant scope mode');
assert(config.distributionTopologyMode === 'auto', 'Config should capture topology mode');
assert(config.interconnectionScopeMode === 'auto', 'Config should capture interconnection scope mode');
assert(config.utilityPacketMode === 'captive_handoff_packet', 'Config should capture utility packet mode');
assert(config.studyInputStatusMode === 'feeder_basis_frozen', 'Config should capture study-input mode');
assert(config.studyTrackMode === 'protection_relay_review', 'Config should capture study-track mode');
assert(config.utilityProtectionReviewMode === 'relay_trip_export_review', 'Config should capture the protection-review mode');
assert(config.utilityExportControlMode === 'non_export_relay_trip_proof', 'Config should capture the export-control mode');
assert(config.utilityRelaySchemeMode === 'non_export_trip_relay', 'Config should capture the relay-scheme mode');
assert(config.utilityTransferSchemeMode === 'ats_or_staged_transfer', 'Config should capture the transfer-scheme mode');
assert(config.oneLinePackStatusMode === 'review_ready', 'Config should capture one-line pack status mode');
assert(config.protectionPackStatusMode === 'issued_or_submitted', 'Config should capture protection-pack status mode');
assert(config.witnessPackStatusMode === 'review_ready', 'Config should capture witness-pack status mode');
assert(config.commissioningPathMode === 'internal_handover', 'Config should capture commissioning-path mode');
assert(config.utilityPacketStageMode === 'submitted_under_review', 'Config should capture packet stage mode');
assert(config.utilityCaseStatusMode === 'review_comments_open', 'Config should capture case status mode');
assert(config.utilityFilingChannelMode === 'portal_or_utility_desk', 'Config should capture filing-channel mode');
assert(config.utilityHoldPointMode === 'metering_or_export_clearance', 'Config should capture hold-point mode');
assert(config.utilityResponsePathMode === 'portal_redline_cycle', 'Config should capture response-path mode');
assert(config.witnessPartyMode === 'client_and_installer', 'Config should capture witness party mode');
assert(config.witnessEvidenceMode === 'staged_transfer_proof', 'Config should capture witness evidence mode');
assert(config.utilityApplicationReference === 'PLANT-STUDY-REV-B', 'Config should capture utility packet/study reference');
assert(config.utilityCaseOwner === 'IKEDC Embedded Desk', 'Config should capture case owner');
assert(config.utilityStudyOwner === 'Protection Consultant / Relay Lead', 'Config should capture study owner');
assert(config.utilityStudyNodeReference === 'PCC-1 / Main LV board / Feeder B', 'Config should capture the study node reference');
assert(config.utilityFaultLevelReference === '18kA PCC / SCC Basis Rev 2', 'Config should capture the fault-level reference');
assert(config.utilitySubmissionDate === '2026-03-12', 'Config should capture submission date');
assert(config.utilityFaultBasisNote === '18kA PCC basis / non-export relay proof pending.', 'Config should capture the fault / relay basis note');
assert(config.utilityRevisionLabel === 'Rev B / Comment Response 1', 'Config should capture the current revision label');
assert(config.utilityNextActionOwner === 'Installer PM / Protection Consultant', 'Config should capture the next action owner');
assert(config.utilityNextActionDueDate === '2026-03-24', 'Config should capture the next action due date');
assert(config.utilityNextAction === 'Issue Rev B one-line and submit non-export relay proof package.', 'Config should capture the next required action');
assert(config.utilitySubmissionTrail === 'Filed 2026-03-12, review comments issued 2026-03-18, Rev B resubmitted 2026-03-20.', 'Config should capture the submission trail');
assert(config.utilityReviewComments === 'Hold non-export relay proof and signed witness roster before clearance.', 'Config should capture review comments');
assert(typeof PVCalculator.getUtilityEngineeringInputSummary === 'function', 'Utility engineering summary helper should exist');

PVCalculator.renderPlantScopingHint();
assert(addControl('plantScopingHint', 'div').innerHTML.includes('Multi-Feeder Commercial Site'), 'Plant scoping hint should show the resolved site scope');
assert(addControl('plantScopingHint', 'div').innerHTML.includes('Private Distribution Only'), 'Plant scoping hint should show the resolved interconnection scope');
PVCalculator.renderPlantEngineeringSurfaceHint();
assert(addControl('plantEngineeringSurfaceHint', 'div').innerHTML.includes('Current working surface'), 'Plant engineering surface hint should render the working-surface block');
PVCalculator.renderUtilityEngineeringHint();
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Captive Plant Handoff Pack'), 'Utility engineering hint should show the selected packet lane');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Protection / Relay Review Pack'), 'Utility engineering hint should show the selected study track');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Relay / Export Logic Review'), 'Utility engineering hint should show the protection review scope');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Non-Export Relay / Trip Proof'), 'Utility engineering hint should show the export-control basis');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Non-Export / Trip Relay'), 'Utility engineering hint should show the relay-scheme basis');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('ATS / Staged Transfer'), 'Utility engineering hint should show the transfer-scheme basis');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Submitted / Under Review'), 'Utility engineering hint should show the packet stage');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Review Comments Open'), 'Utility engineering hint should show the case status');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Portal / Utility Desk Filing'), 'Utility engineering hint should show the filing channel');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Metering / Export Clearance'), 'Utility engineering hint should show the primary hold point');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Portal / Redline Response Cycle'), 'Utility engineering hint should show the response return path');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Client + Installer Witness'), 'Utility engineering hint should show the witness parties');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Staged Transfer / Restart Proof'), 'Utility engineering hint should show the witness evidence');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('One-Line / SLD Status'), 'Utility engineering hint should show the one-line deliverable status block');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Issued / Submitted'), 'Utility engineering hint should show the issued deliverable state');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Review Ready'), 'Utility engineering hint should show the review-ready deliverable state');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('PLANT-STUDY-REV-B'), 'Utility engineering hint should show the captured reference');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Protection Consultant / Relay Lead'), 'Utility engineering hint should show the study owner');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('PCC-1 / Main LV board / Feeder B'), 'Utility engineering hint should show the study node reference');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('18kA PCC / SCC Basis Rev 2'), 'Utility engineering hint should show the fault-level reference');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('18kA PCC basis / non-export relay proof pending.'), 'Utility engineering hint should show the fault / relay basis note');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Rev B / Comment Response 1'), 'Utility engineering hint should show the current revision label');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Installer PM / Protection Consultant'), 'Utility engineering hint should show the next action owner');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('2026-03-24'), 'Utility engineering hint should show the next action due date');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Issue Rev B one-line and submit non-export relay proof package.'), 'Utility engineering hint should show the next required action');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('Filed 2026-03-12, review comments issued 2026-03-18, Rev B resubmitted 2026-03-20.'), 'Utility engineering hint should show the submission trail');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('IKEDC Embedded Desk'), 'Utility engineering hint should show the case owner');
assert(addControl('utilityEngineeringHint', 'div').innerHTML.includes('2026-03-12'), 'Utility engineering hint should show the submission date');

const appliances = [
    { name: 'Fuel Dispenser Pump A', quantity: 1, ratedPowerW: 1500, efficiency: 0.84, powerFactor: 0.78, surgeFactor: 3, dailyUsageHours: 12, dutyCycle: 50, loadType: 'motor', startMethod: 'soft_start', isAC: true, isSimultaneous: true, daytimeRatio: 65, phaseAssignment: 'l1', loadRole: 'process', loadCriticality: 'essential' },
    { name: 'Fuel Dispenser Pump B', quantity: 1, ratedPowerW: 1500, efficiency: 0.84, powerFactor: 0.78, surgeFactor: 3, dailyUsageHours: 12, dutyCycle: 50, loadType: 'motor', startMethod: 'soft_start', isAC: true, isSimultaneous: true, daytimeRatio: 65, phaseAssignment: 'l2', loadRole: 'process', loadCriticality: 'essential' },
    { name: 'Booster Pump', quantity: 1, ratedPowerW: 5500, efficiency: 0.85, powerFactor: 0.8, surgeFactor: 3, dailyUsageHours: 2, dutyCycle: 45, loadType: 'motor', startMethod: 'soft_start', isAC: true, isSimultaneous: false, daytimeRatio: 85, phaseAssignment: 'three_phase', loadRole: 'operator_peak', loadCriticality: 'essential' },
    { name: 'POS + Control Room', quantity: 1, ratedPowerW: 450, efficiency: 1, powerFactor: 0.95, surgeFactor: 1.1, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', isAC: true, isSimultaneous: true, daytimeRatio: 55, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'critical' }
];

LoadEngine.appliances = appliances;

const aggregation = AggregationEngine.calculate(appliances, {
    ...config,
    acVoltage: 400,
    phaseType: 'three_phase',
    designMargin: 125
});

const inverter = {
    recommendedSizeVA: 40000,
    continuousVARequired: aggregation.designContinuousVA,
    surgeVARequired: aggregation.designSurgeVA,
    dcInputCurrentContinuous: 610,
    dcInputCurrentSurge: 880,
    dcBusVoltage: 192
};
const battery = {
    chemistryName: 'LiFePO4',
    usableCapacityWh: 45000,
    totalCapacityWh: 56000,
    totalCapacityAh: 900,
    bankVoltage: 51.2,
    maxDischargeCurrent: 900,
    maxChargeCurrent: 500
};
const pvArray = {
    arrayWattage: 30000,
    dailyEnergyWh: 110000,
    totalPanels: 55,
    panelsInSeries: 11,
    stringsInParallel: 5,
    stringVmp: 410,
    stringVocCold: 490,
    arrayIsc: 51.8
};
const mppt = {
    maxVoltage: 500,
    minVoltage: 120,
    maxOperatingVoltage: 450,
    maxCurrent: 60,
    maxPower: 18000,
    maxChargeCurrent: 250,
    totalMaxChargeCurrent: 250,
    inputCount: 3
};

const architecture = CommercialArchitectureEngine.calculate(appliances, aggregation, inverter, battery, pvArray, mppt, config, null);
const decision = CommercialDecisionEngine.evaluate({
    config,
    aggregation,
    inverter,
    battery,
    pvArray,
    architecture
});
const supportSummary = PVCalculator.getCommercialSupportSummary({
    appliances,
    aggregation,
    battery,
    architecture,
    decisionStrategy: decision,
    config
});
const scoping = PlantScopingEngine.calculate(appliances, aggregation, architecture, decision, supportSummary, config);
const cables = {
    dcRuns: [
        { name: 'PV Array to MPPT', recommendedMm2: 16, marketMetricMm2: 16, parallelCables: 1, ampacityOK: true, voltageDropOK: true },
        { name: 'Battery to Inverter', recommendedMm2: 120, marketMetricMm2: 120, parallelCables: 2, ampacityOK: false, voltageDropOK: true }
    ],
    acRuns: [
        { name: 'Inverter AC Output', recommendedMm2: 25, marketMetricMm2: 25, parallelCables: 1, ampacityOK: true, voltageDropOK: true }
    ],
    blocks: ['Battery to Inverter: Current 880A exceeds cable ampacity'],
    warnings: ['Battery to Inverter: Requires 2 parallel cables']
};
const protection = {
    pvSide: [
        { name: 'PV DC Isolator / Breaker', rating: '50A / 650VDC' }
    ],
    batterySide: [
        { name: 'DC MCCB (Battery-Inverter)', rating: '250A / 51.2VDC' },
        { name: 'Battery Fuse (Backup)', rating: '400A / 51.2VDC' }
    ],
    acSide: [
        { name: 'Inverter Output MCB', rating: '63A / 400VAC' }
    ],
    warnings: ['Battery DC MCCB (200A) is undersized. Recommended standard size: 250A.']
};

assert(scoping.plantScope.resolvedKey === 'multi_feeder_site', 'Filling station should resolve to a multi-feeder site');
assert(scoping.distributionTopology.resolvedKey === 'radial_feeders', 'Filling station should resolve to radial feeders');
assert(scoping.interconnectionScope.resolvedKey === 'private_distribution', 'Filling station should resolve to private distribution');
assert(scoping.status !== 'fail', 'Normal captive commercial plant scoping should not hard-fail');
assert(scoping.feederSchedule.items.length >= 2, 'Plant scoping should expose multiple feeder lanes for the filling-station case');
assert(scoping.feederSchedule.items.some(item => item.supportBucketKey === 'protected'), 'Plant scoping should expose a protected feeder lane');
assert(scoping.feederSchedule.items.some(item => /feeder/i.test(item.sourcePathLabel)), 'Plant scoping should explain the source path for each feeder lane');

PVCalculator.results = {
    config,
    aggregation,
    battery,
    pvArray,
    mpptValidation: { mppt },
    architecture,
    decisionStrategy: decision,
    supportSummary,
    plantScoping: scoping,
    cables,
    protection
};

const panelHtml = PVCalculator.renderPlantScopingPanel(scoping);
assert(panelHtml.includes('Recommended feeder schedule'), 'Plant scoping panel should render the feeder schedule block');
assert(panelHtml.includes('Protected continuity feeder') || panelHtml.includes('Main protected board'), 'Plant scoping panel should render the protected feeder label');
assert(panelHtml.includes('Source coordination snapshot'), 'Plant scoping panel should render the source coordination snapshot block');
assert(panelHtml.includes('Board / source schedule'), 'Plant scoping panel should render the board / source schedule block');
assert(panelHtml.includes('connected-load basis'), 'Plant scoping panel should render board/source current-screen detail');
assert(panelHtml.includes('SRC-GEN-ASSIST') || panelHtml.includes('SRC-PV-BATT'), 'Plant scoping panel should render board/source carry tags');
assert(panelHtml.includes('Board procurement / breaker / cable review'), 'Plant scoping panel should render the procurement review block');
assert(panelHtml.includes('Utility / mini-grid engineering lane'), 'Plant scoping panel should render the utility / mini-grid engineering lane block');
assert(panelHtml.includes('Current working surface'), 'Plant scoping panel should render the working surface block');
assert(panelHtml.includes('Dispatch / load-shed / restoration sequence'), 'Plant scoping panel should render the dispatch sequence block');
assert(panelHtml.includes('Interconnection / approval packet scaffold'), 'Plant scoping panel should render the interconnection packet scaffold block');
assert(panelHtml.includes('Feeder / protection study input capture'), 'Plant scoping panel should render the study input block');
assert(panelHtml.includes('Commissioning / witness-test prep'), 'Plant scoping panel should render the commissioning prep block');
assert(panelHtml.includes('Copy feeder brief'), 'Plant scoping panel should expose the feeder brief action');
assert(panelHtml.includes('Copy packet brief'), 'Plant scoping panel should expose the interconnection packet export action');
assert(panelHtml.includes('Copy packet data sheet'), 'Plant scoping panel should expose the interconnection data-sheet export action');
assert(panelHtml.includes('Copy study sheet'), 'Plant scoping panel should expose the study-sheet export action');
assert(panelHtml.includes('Copy study data sheet'), 'Plant scoping panel should expose the study data-sheet export action');
assert(panelHtml.includes('Copy formal study work pack'), 'Plant scoping panel should expose the formal-study work-pack action');
assert(panelHtml.includes('Copy formal study data sheet'), 'Plant scoping panel should expose the formal-study data-sheet action');
assert(panelHtml.includes('Formal study intake checklist'), 'Plant scoping panel should render the formal-study intake checklist block');
assert(panelHtml.includes('Formal study screening snapshot'), 'Plant scoping panel should render the formal-study screening snapshot block');
assert(panelHtml.includes('Copy checklist'), 'Plant scoping panel should expose the commissioning checklist export action');
assert(panelHtml.includes('Copy witness data sheet'), 'Plant scoping panel should expose the witness data-sheet export action');
assert(panelHtml.includes('Feeder protection / handover review'), 'Plant scoping panel should render the source-handover review block');
assert(panelHtml.includes('Battery DC cabling') || panelHtml.includes('Battery DC protection'), 'Plant scoping panel should surface breaker or cable procurement prompts');

const feederBrief = PVCalculator.getPlantFeederBriefPayload();
assert(feederBrief.ready === true, 'Plant feeder brief should be available once scoping and support data exist');
assert(/PLANT FEEDER BRIEF/.test(feederBrief.text), 'Plant feeder brief should produce a titled export payload');
assert(/Recommended feeder schedule:/i.test(feederBrief.text), 'Plant feeder brief should include the feeder schedule section');
assert(/Board \/ source schedule:/i.test(feederBrief.text), 'Plant feeder brief should include the board / source schedule section');
assert(/Current screen:/i.test(feederBrief.text), 'Plant feeder brief should include board/source current-screen lines');
assert(/Carry tags:/i.test(feederBrief.text), 'Plant feeder brief should include board/source carry tags');
assert(/Board procurement \/ breaker \/ cable review:/i.test(feederBrief.text), 'Plant feeder brief should include the procurement review section');
assert(/Utility \/ mini-grid engineering lane:/i.test(feederBrief.text), 'Plant feeder brief should include the utility / mini-grid engineering lane section');
assert(/Formal study scope required:/i.test(feederBrief.text), 'Plant feeder brief should include the formal study scope section');
assert(/Working surface:/i.test(feederBrief.text), 'Plant feeder brief should include the working surface line');
assert(/Dispatch \/ load-shed \/ restoration sequence:/i.test(feederBrief.text), 'Plant feeder brief should include the dispatch sequence section');
assert(/Interconnection \/ approval packet scaffold:/i.test(feederBrief.text), 'Plant feeder brief should include the interconnection packet scaffold section');
assert(/Feeder \/ protection study input capture:/i.test(feederBrief.text), 'Plant feeder brief should include the study input section');
assert(/Commissioning \/ witness-test prep:/i.test(feederBrief.text), 'Plant feeder brief should include the commissioning prep section');
assert(/Source detail:/i.test(feederBrief.text), 'Plant feeder brief should include source coordination detail');
const boardSourceMatrix = PVCalculator.getPlantBoardSourceMatrix(scoping);
assert(boardSourceMatrix.rows.some(row => /Protected|Assisted|Outside promise/i.test(row.promiseLane)), 'Plant board / source matrix should classify feeder promise lanes');
assert(boardSourceMatrix.rows.some(row => /changeover|anti-backfeed|staged|Outside sold continuity/i.test(row.handoverNote)), 'Plant board / source matrix should explain the source handover or boundary note');
assert(boardSourceMatrix.rows.some(row => /connected-load basis/i.test(row.currentScreenSummary || '')), 'Plant board / source matrix should carry lane-level current screening');
assert(boardSourceMatrix.rows.some(row => /SRC-|XFER-|AC-FDR|NO-PROTECTED-BREAKER/i.test(`${row.sourceCarryTag} ${row.breakerCarryTag} ${row.transferCarryTag}`)), 'Plant board / source matrix should carry one-line-ready source, breaker, and transfer tags');
const procurementReview = PVCalculator.getPlantProcurementReviewSummary(scoping);
assert(procurementReview.items.some(item => /Battery DC protection|Battery DC cabling|AC feeder cabling/i.test(item.label)), 'Plant procurement review should expose cable or breaker carry-through prompts');
assert(procurementReview.items.some(item => /parallel runs|MCCB|MCB|ampacity|per conductor/i.test(item.detail)), 'Plant procurement review should include concrete procurement detail');
const utilityLane = PVCalculator.getUtilityEngineeringLaneSummary(scoping);
assert(utilityLane.items.some(item => /one-line|breaker tags|Three-phase feeder validation/i.test(item.label + ' ' + item.detail)), 'Plant utility lane should expose the next engineering carry-through for captive plant jobs');
const formalStudyScope = PVCalculator.getFormalStudyScopeRequiredSummary(scoping, config);
assert(formalStudyScope.items.some(item => /Feeder fault \/ SCC study|Protection selectivity \/ coordination study|Interconnection \/ export proof pack/.test(item.label)), 'Formal study scope should expose the external study handoff items');
const formalStudyIntake = PVCalculator.getFormalStudyIntakeChecklistSummary(config, scoping);
assert(formalStudyIntake.items.some(item => /Reference \/ trace discipline|Study ownership \/ node basis|Deliverable pack readiness|Next handback control/.test(item.label)), 'Formal study intake checklist should expose the kickoff gates');
const formalStudyScreening = PVCalculator.getFormalStudyScreeningSnapshotSummary(config, scoping);
assert(formalStudyScreening.items.some(item => /Fault reference screening|AC breaker carry margin|Generator source screening|PV DC window screening/.test(item.label)), 'Formal study screening snapshot should expose key live screening rows');
const formalStudyWorkPack = PVCalculator.getFormalStudyWorkPackPayload(scoping);
assert(formalStudyWorkPack.ready === true, 'Formal study work pack should be available once formal-study scope is active');
assert(/FORMAL STUDY WORK PACK/.test(formalStudyWorkPack.text), 'Formal study work pack should produce a titled export payload');
assert(/Formal study scope summary:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the formal study scope summary line');
assert(/Feeder fault \/ SCC study:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the feeder fault / SCC line');
assert(/Protection selectivity \/ coordination study:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the selectivity / coordination line');
assert(/Interconnection \/ export proof pack:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the interconnection / export-proof line');
assert(/Engineer-of-record handoff:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the engineer-of-record handoff line');
assert(/Formal study intake checklist:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the intake-checklist section');
assert(/Reference \/ trace discipline:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the reference / trace intake line');
assert(/Formal study screening snapshot:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the screening-snapshot section');
assert(/Fault reference screening:/i.test(formalStudyWorkPack.text), 'Formal study work pack should include the fault-reference screening line');
assert(/Key bounded study rows carried from the app:/i.test(formalStudyWorkPack.text), 'Formal study work pack should carry the bounded study rows section');
const formalStudyDataSheet = PVCalculator.getFormalStudyDataSheetPayload(scoping);
assert(formalStudyDataSheet.ready === true, 'Formal study data sheet should be available once formal-study scope is active');
assert(/^section,field,value,status/m.test(formalStudyDataSheet.text), 'Formal study data sheet should export CSV headers');
assert(/formal_scope,Formal study scope summary,.*final study.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the formal study scope summary row');
assert(/intake_check,Formal study intake summary,.*kickoff.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the intake summary row');
assert(/screening_snapshot,Formal study screening summary,.*screening row.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the screening summary row');
assert(/intake_check,Reference \/ trace discipline,.*,(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the reference / trace intake row');
assert(/screening_snapshot,Fault reference screening,.*formal fault or protection study.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the fault-reference screening row');
assert(/formal_scope,Feeder fault \/ SCC study,.*fault study.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the feeder fault / SCC row');
assert(/formal_scope,Protection selectivity \/ coordination study,.*selectivity logic.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the selectivity / coordination row');
assert(/formal_scope,Interconnection \/ export proof pack,.*interconnection.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include the interconnection / export-proof row');
assert(/bounded_carry,PV string-fuse screening,.*per-string.*(pass|warn|fail)/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include bounded carried study rows');
assert(/board_row,.*Protected \|/i.test(formalStudyDataSheet.text), 'Formal study data sheet should include board / source rows');
const workingSurface = PVCalculator.getPlantEngineeringSurfaceSummary(scoping, config);
assert(workingSurface.label === 'Plant Engineering Surface', 'Filling-station plant scoping should resolve to the plant-engineering surface');
const dispatchSequence = PVCalculator.getPlantDispatchSequenceSummary(scoping);
assert(dispatchSequence.items.some(item => /Base energization order|Load-shed order|Restoration sequence/.test(item.label)), 'Plant dispatch summary should expose the operating sequence for feeder handoff');
assert(dispatchSequence.items.some(item => /protected feeders|outside-promise|assisted/i.test(item.detail)), 'Plant dispatch summary should carry the protected, assisted, and excluded feeder story into operations');
const interconnectionPacket = PVCalculator.getUtilityInterconnectionPacketSummary(scoping);
assert(interconnectionPacket.items.some(item => /Selected packet posture|Active packet lane|Core deliverable scaffold/.test(item.label)), 'Interconnection packet summary should expose the packet scaffold');
assert(interconnectionPacket.items.some(item => /Packet stage/.test(item.label)), 'Interconnection packet summary should expose the packet stage');
assert(interconnectionPacket.items.some(item => /Filing channel|Primary hold point|Response return path/.test(item.label)), 'Interconnection packet summary should expose packet routing fields');
assert(interconnectionPacket.items.some(item => /Packet progression gate|Stage-ready signals|Open stage blockers|Stage-exit handback/.test(item.label)), 'Interconnection packet summary should expose stage progression discipline');
assert(interconnectionPacket.items.some(item => /Stage response discipline|Stage response controls|Stage submission discipline|Stage closeout discipline/.test(item.label)), 'Interconnection packet summary should expose stage-specific packet discipline');
assert(/Case progression posture|Filed \/ review basis|Current controlled revision|Next controlled handback/.test(JSON.stringify(interconnectionPacket.items)), 'Interconnection packet summary should expose case timeline discipline');
assert(interconnectionPacket.items.some(item => /Review-response pack|Review closure matrix|Submission cover pack|Conditional clearance closeout pack/.test(item.label)), 'Interconnection packet summary should expose stage-template packet packs');
assert(interconnectionPacket.items.some(item => /Authority case status|Captured case owner|Current review comments/.test(item.label)), 'Interconnection packet summary should expose the authority case trail');
assert(interconnectionPacket.items.some(item => /codeFamily|review authority|anti-backfeed|approval/i.test(JSON.stringify(item.detail) + JSON.stringify(item.label))), 'Interconnection packet summary should expose authority or approval detail');
assert(interconnectionPacket.items.some(item => /PLANT-STUDY-REV-B/.test(item.detail)), 'Interconnection packet summary should carry the captured packet/study reference');
const interconnectionPacketPayload = PVCalculator.getUtilityInterconnectionPacketPayload(scoping);
assert(interconnectionPacketPayload.ready === true, 'Interconnection packet brief should be available when the packet scaffold exists');
assert(/INTERCONNECTION \/ APPROVAL PACKET BRIEF/.test(interconnectionPacketPayload.text), 'Interconnection packet brief should produce a titled export payload');
assert(/Packet lane:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the packet lane line');
assert(/Packet stage:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the packet stage line');
assert(/Progression gate:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the progression gate line');
assert(/Authority case status:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the case status line');
assert(/Filing channel:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the filing-channel line');
assert(/Primary hold point:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the hold-point line');
assert(/Response return path:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the response-path line');
assert(/Case owner \/ desk:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the case owner line');
assert(/Submission \/ review date:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the submission date line');
assert(/Current revision \/ response:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the current revision line');
assert(/Next action owner \/ handover:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the next action owner line');
assert(/Next action due date:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the next action due date line');
assert(/Next required action:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the next action line');
assert(/Submission \/ review trail:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the submission trail line');
assert(/Open stage blockers:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the stage blockers line');
assert(/Stage-exit handback:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the stage-exit handback line');
assert(/Stage-specific packet discipline:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the stage-discipline section');
assert(/Stage response discipline:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the stage response discipline line');
assert(/Stage response controls:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the stage response controls line');
assert(/Case progression timeline:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the case-timeline section');
assert(/Case progression posture:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the case progression posture line');
assert(/Next controlled handback:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the next controlled handback line');
assert(/Stage template pack:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the stage-template section');
assert(/Review-response pack:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the review-response pack line');
assert(/Review closure matrix:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the review-closure matrix line');
assert(/Review comments:/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the review comments line');
assert(/PLANT-STUDY-REV-B/i.test(interconnectionPacketPayload.text), 'Interconnection packet brief should include the captured reference');
const interconnectionDataSheetPayload = PVCalculator.getUtilityInterconnectionDataSheetPayload(scoping);
assert(interconnectionDataSheetPayload.ready === true, 'Interconnection data sheet should be available when the packet scaffold exists');
assert(/^section,field,value,status/m.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should export CSV headers');
assert(/packet,Packet lane,Captive Plant Handoff Pack,pass/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the packet lane row');
assert(/packet,Packet stage,Submitted \/ Under Review,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the packet stage row');
assert(/packet,Progression gate,Review Gate,fail/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the progression-gate row');
assert(/packet,Case status,Review Comments Open,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the case-status row');
assert(/packet,Filing channel,Portal \/ Utility Desk Filing,pass/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the filing-channel row');
assert(/packet,Primary hold point,Metering \/ Export Clearance,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the hold-point row');
assert(/packet,Response return path,Portal \/ Redline Response Cycle,pass/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the response-path row');
assert(/packet,One-line \/ SLD status,Review Ready,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the one-line deliverable row');
assert(/packet,Protection \/ relay pack,Issued \/ Submitted,pass/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the protection-pack deliverable row');
assert(/packet,Witness \/ closeout pack,Review Ready,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the witness-pack deliverable row');
assert(/packet,Case owner,IKEDC Embedded Desk,info/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the case-owner row');
assert(/packet,Submission \/ review date,2026-03-12,info/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the submission-date row');
assert(/packet,Revision \/ response,Rev B \/ Comment Response 1,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the revision row');
assert(/packet,Next action owner \/ handover,Installer PM \/ Protection Consultant,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the next-action-owner row');
assert(/packet,Next action due date,2026-03-24,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the next-action-due row');
assert(/packet,Next required action,Issue Rev B one-line and submit non-export relay proof package\.,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the next-action row');
assert(/packet,Submission \/ review trail,/i.test(interconnectionDataSheetPayload.text) && /Rev B resubmitted 2026-03-20/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the submission-trail row');
assert(/packet,Open stage blockers,/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the stage-blockers row');
assert(/packet,Stage-exit handback,Issue Rev B one-line and submit non-export relay proof package\.,fail/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the stage-exit row');
assert(/stage_discipline,Stage response discipline,/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the stage response discipline row');
assert(/stage_discipline,Stage response controls,The response pack should move as one controlled handback\..*Issue Rev B one-line and submit non-export relay proof package\..*,fail/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the stage response controls row');
assert(/timeline,Case progression posture,Submitted \/ Under Review .* Review Comments Open .* Review Gate/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the case progression posture row');
assert(/timeline,Next controlled handback,Issue Rev B one-line and submit non-export relay proof package\..*Installer PM \/ Protection Consultant.*2026-03-24/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the next controlled handback row');
assert(/stage_template,Review-response pack,/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the review-response pack row');
assert(/stage_template,Review closure matrix,/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the review-closure matrix row');
assert(/packet,Review comments,Hold non-export relay proof and signed witness roster before clearance\.,warn/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the review-comments row');
assert(/PLANT-STUDY-REV-B/i.test(interconnectionDataSheetPayload.text), 'Interconnection data sheet should include the captured reference');
const studyInputs = PVCalculator.getPlantStudyInputSummary(scoping);
assert(studyInputs.items.some(item => /Captured study status|Captured study track|Feeder inventory basis|Breaker study basis|Cable study basis/.test(item.label)), 'Plant study input summary should expose feeder, breaker, cable, or study-track inputs');
assert(studyInputs.items.some(item => /Study owner \/ consultant|POC \/ feeder \/ node reference|Fault level \/ SCC reference|Fault \/ relay basis/.test(item.label)), 'Plant study input summary should expose the study owner, node reference, fault-level reference, and fault / relay basis');
assert(studyInputs.items.some(item => /Protection review scope|Export control basis|Relay scheme basis|Transfer scheme basis/.test(item.label)), 'Plant study input summary should expose the protection, export, relay, and transfer basis fields');
assert(studyInputs.items.some(item => /Study deliverable readiness/.test(item.label)), 'Plant study input summary should expose the deliverable readiness summary');
assert(studyInputs.items.some(item => /Protected-board path screening/.test(item.label)), 'Plant study input summary should expose the protected-board path screening row');
assert(studyInputs.items.some(item => /Shared battery throughput screening/.test(item.label)), 'Plant study input summary should expose the shared battery throughput screening row');
assert(studyInputs.items.some(item => /Battery DC protection screening/.test(item.label)), 'Plant study input summary should expose the battery DC protection screening row');
assert(studyInputs.items.some(item => /Battery DC cable-path screening/.test(item.label)), 'Plant study input summary should expose the battery DC cable-path screening row');
assert(studyInputs.items.some(item => /AC feeder cable-path screening/.test(item.label)), 'Plant study input summary should expose the AC feeder cable-path screening row');
assert(studyInputs.items.some(item => /PV DC window screening/.test(item.label)), 'Plant study input summary should expose the PV DC window screening row');
assert(studyInputs.items.some(item => /PV source isolation screening/.test(item.label)), 'Plant study input summary should expose the PV source isolation screening row');
assert(studyInputs.items.some(item => /PV string-fuse screening/.test(item.label)), 'Plant study input summary should expose the PV string-fuse screening row');
assert(studyInputs.items.some(item => /MPPT charge-path screening/.test(item.label)), 'Plant study input summary should expose the MPPT charge-path screening row');
assert(studyInputs.items.some(item => /Generator board-coverage screening/.test(item.label)), 'Plant study input summary should expose the generator board-coverage screening row');
assert(studyInputs.items.some(item => /Generator limiting-phase screening/.test(item.label)), 'Plant study input summary should expose the generator limiting-phase screening row');
assert(studyInputs.items.some(item => /PV field \/ MPPT grouping screening/.test(item.label)), 'Plant study input summary should expose the PV field / MPPT grouping screening row');
assert(studyInputs.items.some(item => /Modeled AC current basis|Modeled surge AC current basis|Staggered surge relief screening|AC breaker carry margin|AC breaker surge screening|Fault reference screening|Relay \/ export screening|Transfer path screening|Generator source screening|Generator surge-source screening|Generator staggered-surge screening|Limiting-phase line screening|Surge limiting-phase screening|Neutral current screening|Equal-leg cluster penalty screening|Feeder-lane connected-load screening/.test(item.label)), 'Plant study input summary should expose the bounded protection, phase, and feeder screening rows');
assert(studyInputs.items.some(item => /limiting phase|parallel run|board schedule|cluster/i.test(item.detail)), 'Plant study input summary should expose concrete study-input detail');
assert(studyInputs.items.some(item => /23\.7A|63A \/ 400VAC|18\.0kA|Non-Export \/ Trip Relay|25kVA generator|connected-load basis/i.test(item.detail)), 'Plant study input summary should expose concrete current, breaker, fault, relay, generator, and feeder screening detail');
const studySheetPayload = PVCalculator.getPlantStudyInputPayload(scoping);
assert(studySheetPayload.ready === true, 'Study input sheet should be available when study input capture exists');
assert(/FEEDER \/ PROTECTION STUDY INPUT SHEET/.test(studySheetPayload.text), 'Study input sheet should produce a titled export payload');
assert(/Board \/ source rows carried into this study basis:/i.test(studySheetPayload.text), 'Study input sheet should carry the board/source rows');
assert(/Captured study track:/i.test(studySheetPayload.text), 'Study input sheet should include the study-track line');
assert(/Protection review scope:/i.test(studySheetPayload.text), 'Study input sheet should include the protection-review line');
assert(/Export control basis:/i.test(studySheetPayload.text), 'Study input sheet should include the export-control line');
assert(/Relay scheme basis:/i.test(studySheetPayload.text), 'Study input sheet should include the relay-scheme line');
assert(/Transfer scheme basis:/i.test(studySheetPayload.text), 'Study input sheet should include the transfer-scheme line');
assert(/One-line \/ SLD status:/i.test(studySheetPayload.text), 'Study input sheet should include the one-line deliverable line');
assert(/Protection \/ relay pack:/i.test(studySheetPayload.text), 'Study input sheet should include the protection-pack deliverable line');
assert(/Study owner \/ consultant:/i.test(studySheetPayload.text), 'Study input sheet should include the study-owner line');
assert(/POC \/ feeder \/ node ref:/i.test(studySheetPayload.text), 'Study input sheet should include the study node reference line');
assert(/Fault level \/ SCC ref:/i.test(studySheetPayload.text), 'Study input sheet should include the fault-level reference line');
assert(/Fault \/ relay basis:/i.test(studySheetPayload.text), 'Study input sheet should include the fault / relay basis line');
assert(/Current revision \/ response:/i.test(studySheetPayload.text), 'Study input sheet should include the current revision line');
assert(/Next action owner \/ handover:/i.test(studySheetPayload.text), 'Study input sheet should include the next action owner line');
assert(/Next action due date:/i.test(studySheetPayload.text), 'Study input sheet should include the next action due date line');
assert(/Next required action:/i.test(studySheetPayload.text), 'Study input sheet should include the next action line');
assert(/Submission \/ review trail:/i.test(studySheetPayload.text), 'Study input sheet should include the submission-trail line');
assert(/Protected-board path screening:/i.test(studySheetPayload.text), 'Study input sheet should include the protected-board path screening line');
assert(/Shared battery throughput screening:/i.test(studySheetPayload.text), 'Study input sheet should include the shared battery throughput screening line');
assert(/Battery DC protection screening:/i.test(studySheetPayload.text), 'Study input sheet should include the battery DC protection screening line');
assert(/Battery DC cable-path screening:/i.test(studySheetPayload.text), 'Study input sheet should include the battery DC cable-path screening line');
assert(/AC feeder cable-path screening:/i.test(studySheetPayload.text), 'Study input sheet should include the AC feeder cable-path screening line');
assert(/PV DC window screening:/i.test(studySheetPayload.text), 'Study input sheet should include the PV DC window screening line');
assert(/PV source isolation screening:/i.test(studySheetPayload.text), 'Study input sheet should include the PV source isolation screening line');
assert(/PV string-fuse screening:/i.test(studySheetPayload.text), 'Study input sheet should include the PV string-fuse screening line');
assert(/MPPT charge-path screening:/i.test(studySheetPayload.text), 'Study input sheet should include the MPPT charge-path screening line');
assert(/Generator board-coverage screening:/i.test(studySheetPayload.text), 'Study input sheet should include the generator board-coverage screening line');
assert(/Generator limiting-phase screening:/i.test(studySheetPayload.text), 'Study input sheet should include the generator limiting-phase screening line');
assert(/PV field \/ MPPT grouping screening:/i.test(studySheetPayload.text), 'Study input sheet should include the PV field / MPPT grouping screening line');
assert(/Modeled AC current basis:/i.test(studySheetPayload.text), 'Study input sheet should include the modeled AC current basis line');
assert(/Modeled surge AC current basis:/i.test(studySheetPayload.text), 'Study input sheet should include the modeled surge AC current basis line');
assert(/Staggered surge relief screening:/i.test(studySheetPayload.text), 'Study input sheet should include the staggered-surge relief line');
assert(/AC breaker carry margin:/i.test(studySheetPayload.text), 'Study input sheet should include the AC breaker carry-margin line');
assert(/AC breaker surge screening:/i.test(studySheetPayload.text), 'Study input sheet should include the AC breaker surge-screening line');
assert(/Fault reference screening:/i.test(studySheetPayload.text), 'Study input sheet should include the fault reference screening line');
assert(/Relay \/ export screening:/i.test(studySheetPayload.text), 'Study input sheet should include the relay/export screening line');
assert(/Transfer path screening:/i.test(studySheetPayload.text), 'Study input sheet should include the transfer-path screening line');
assert(/Generator source screening:/i.test(studySheetPayload.text), 'Study input sheet should include the generator screening line');
assert(/Generator surge-source screening:/i.test(studySheetPayload.text), 'Study input sheet should include the generator surge-source screening line');
assert(/Generator staggered-surge screening:/i.test(studySheetPayload.text), 'Study input sheet should include the generator staggered-surge screening line');
assert(/Limiting-phase line screening:/i.test(studySheetPayload.text), 'Study input sheet should include the limiting-phase screening line');
assert(/Surge limiting-phase screening:/i.test(studySheetPayload.text), 'Study input sheet should include the surge limiting-phase screening line');
assert(/Neutral current screening:/i.test(studySheetPayload.text), 'Study input sheet should include the neutral-current screening line');
assert(/Equal-leg cluster penalty screening:/i.test(studySheetPayload.text), 'Study input sheet should include the equal-leg cluster-penalty line');
assert(/Feeder-lane connected-load screening:/i.test(studySheetPayload.text), 'Study input sheet should include the feeder-lane screening line');
assert(/Formal study scope required:/i.test(studySheetPayload.text), 'Study input sheet should include the formal study scope section');
assert(/Feeder fault \/ SCC study:/i.test(studySheetPayload.text), 'Study input sheet should include the feeder fault / SCC formal-study line');
assert(/Protection selectivity \/ coordination study:/i.test(studySheetPayload.text), 'Study input sheet should include the protection selectivity formal-study line');
const studyDataSheetPayload = PVCalculator.getPlantStudyDataSheetPayload(scoping);
assert(studyDataSheetPayload.ready === true, 'Study data sheet should be available when study input capture exists');
assert(/^section,field,value,status/m.test(studyDataSheetPayload.text), 'Study data sheet should export CSV headers');
assert(/study,Study basis,Feeder Basis Frozen,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the study-basis row');
assert(/study,Study track,Protection \/ Relay Review Pack,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the study-track row');
assert(/study,Protection review scope,Relay \/ Export Logic Review,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the protection-review row');
assert(/study,Export control basis,Non-Export Relay \/ Trip Proof,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the export-control row');
assert(/study,Relay scheme basis,Non-Export \/ Trip Relay,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the relay-scheme row');
assert(/study,Transfer scheme basis,ATS \/ Staged Transfer,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the transfer-scheme row');
assert(/study_item,Study deliverable readiness,/i.test(studyDataSheetPayload.text), 'Study data sheet should include the deliverable-readiness row');
assert(/study_item,Protected-board path screening,.*protected path.*daily energy.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the protected-board path screening row');
assert(/study_item,Shared battery throughput screening,.*Captured DC path:.*stress index.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the shared battery throughput screening row');
assert(/study_item,Battery DC protection screening,.*DC MCCB.*Fuse.*continuous.*surge.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the battery DC protection screening row');
assert(/study_item,Battery DC cable-path screening,.*Battery to Inverter.*parallel runs.*continuous.*surge.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the battery DC cable-path screening row');
assert(/study_item,AC feeder cable-path screening,.*Inverter AC Output.*continuous.*surge.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the AC feeder cable-path screening row');
assert(/study_item,PV DC window screening,.*Voc\(cold\).*Vmp.*Isc\(\+4% tol\).*array power.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the PV DC window screening row');
assert(/study_item,PV source isolation screening,.*PV DC Isolator.*Voc\(cold\).*per-string fuse.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the PV source isolation screening row');
assert(/study_item,PV string-fuse screening,.*per-string fuse basis.*multi-string ready.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the PV string-fuse screening row');
assert(/study_item,MPPT charge-path screening,.*PV charge path.*captured MPPT charge path.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the MPPT charge-path screening row');
assert(/study_item,Generator board-coverage screening,.*generator path.*coverage.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the generator board-coverage screening row');
assert(/study_item,Generator limiting-phase screening,.*per phase.*limiting-phase coverage.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the generator limiting-phase screening row');
assert(/study_item,PV field \/ MPPT grouping screening,.*tracker.*carrying panels.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the PV field / MPPT grouping screening row');
assert(/Review Ready/i.test(studyDataSheetPayload.text) && /Issued \/ Submitted/i.test(studyDataSheetPayload.text), 'Study data sheet should carry the selected deliverable statuses');
assert(/study_trace,Packet stage,Submitted \/ Under Review,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the packet-stage row');
assert(/study_trace,Case status,Review Comments Open,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the case-status row');
assert(/study_trace,Reference,PLANT-STUDY-REV-B,info/i.test(studyDataSheetPayload.text), 'Study data sheet should include the reference row');
assert(/study_trace,Study owner \/ consultant,Protection Consultant \/ Relay Lead,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the study-owner row');
assert(/study_trace,POC \/ feeder \/ node ref,PCC-1 \/ Main LV board \/ Feeder B,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the study-node-reference row');
assert(/study_trace,Fault level \/ SCC ref,18kA PCC \/ SCC Basis Rev 2,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the fault-level reference row');
assert(/study_trace,Fault \/ relay basis,18kA PCC basis \/ non-export relay proof pending\.,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the fault / relay basis row');
assert(/study_trace,Revision \/ response,Rev B \/ Comment Response 1,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the revision row');
assert(/study_trace,Next action owner \/ handover,Installer PM \/ Protection Consultant,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the next-action-owner row');
assert(/study_trace,Next action due date,2026-03-24,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the next-action-due row');
assert(/study_trace,Next required action,Issue Rev B one-line and submit non-export relay proof package\.,warn/i.test(studyDataSheetPayload.text), 'Study data sheet should include the next-action row');
assert(/formal_scope,Formal study scope summary,.*final study.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the formal study scope summary row');
assert(/formal_scope,Feeder fault \/ SCC study,.*fault study.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the feeder fault / SCC formal-study row');
assert(/formal_scope,Protection selectivity \/ coordination study,.*selectivity logic.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the protection coordination formal-study row');
assert(/study_item,Phase \/ limiting-leg basis,/i.test(studyDataSheetPayload.text), 'Study data sheet should include the phase-basis row');
assert(/study_item,Modeled AC current basis,.*23\.7A.*,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the modeled AC current screening row');
assert(/study_item,Modeled surge AC current basis,.*surge basis.*A.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the modeled surge AC current screening row');
assert(/study_item,Staggered surge relief screening,.*Controlled sequencing.*% relief.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the staggered-surge relief screening row');
assert(/study_item,AC breaker carry margin,.*63A \/ 400VAC.*carry margin.*,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the AC breaker carry-margin row');
assert(/study_item,AC breaker surge screening,.*63A \/ 400VAC.*surge path.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the AC breaker surge-screening row');
assert(/study_item,Fault reference screening,.*18\.0kA.*formal fault or protection study.*,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the fault-reference screening row');
assert(/study_item,Relay \/ export screening,.*Non-Export Relay \/ Trip Proof.*Non-Export \/ Trip Relay.*,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the relay/export screening row');
assert(/study_item,Transfer path screening,.*ATS \/ Staged Transfer.*25kVA generator.*,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the transfer-path screening row');
assert(/study_item,Generator source screening,.*25kVA generator.*23\.7A.*,pass/i.test(studyDataSheetPayload.text), 'Study data sheet should include the generator-source screening row');
assert(/study_item,Generator surge-source screening,.*25kVA generator.*surge path.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the generator surge-source screening row');
assert(/study_item,Generator staggered-surge screening,.*25kVA generator.*staged surge path.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the generator staggered-surge screening row');
assert(/study_item,Limiting-phase line screening,.*L1.*23\.7A.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the limiting-phase line screening row');
assert(/study_item,Surge limiting-phase screening,.*surge path.*A.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the surge limiting-phase screening row');
assert(/study_item,Neutral current screening,.*neutral current.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the neutral-current screening row');
assert(/study_item,Equal-leg cluster penalty screening,.*cluster capacity.*(pass|warn|fail)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the equal-leg cluster penalty row');
assert(/study_item,Feeder-lane connected-load screening,.*connected-load basis.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the feeder-lane connected-load screening row');
assert(/board_row,.*Protected \|/i.test(studyDataSheetPayload.text), 'Study data sheet should include the board/source schedule rows');
assert(/board_current,.*connected-load basis.*(pass|warn)/i.test(studyDataSheetPayload.text), 'Study data sheet should include the board/source current-screen rows');
assert(/board_carry,.*SRC-|board_carry,.*AC-FDR|board_carry,.*XFER-/i.test(studyDataSheetPayload.text), 'Study data sheet should include the board/source carry-tag rows');
const commissioningPrep = PVCalculator.getPlantCommissioningPrepSummary(scoping);
assert(commissioningPrep.items.some(item => /Captured commissioning path|Pre-energization review|Operating-mode record|Restoration walk-through/.test(item.label)), 'Commissioning prep should expose the commissioning sequence');
assert(commissioningPrep.items.some(item => /Witness parties|Witness evidence pack/.test(item.label)), 'Commissioning prep should expose witness parties and witness evidence');
assert(commissioningPrep.items.some(item => /Witness \/ closeout pack status/.test(item.label)), 'Commissioning prep should expose the witness-pack status');
assert(commissioningPrep.items.some(item => /Authority case posture|Authority \/ review comments/.test(item.label)), 'Commissioning prep should expose the authority case trail');
assert(commissioningPrep.items.some(item => /protected feeders|transfer|commissioning|witness/i.test(item.detail)), 'Commissioning prep should expose real commissioning or witness detail');
assert(commissioningPrep.items.some(item => /Freeze feeder labels before staged restart witness|PLANT-STUDY-REV-B/.test(item.detail)), 'Commissioning prep should carry the captured commissioning note or reference');
const commissioningChecklistPayload = PVCalculator.getPlantCommissioningChecklistPayload(scoping);
assert(commissioningChecklistPayload.ready === true, 'Commissioning checklist should be available when commissioning prep exists');
assert(/COMMISSIONING \/ WITNESS CHECKLIST/.test(commissioningChecklistPayload.text), 'Commissioning checklist should produce a titled export payload');
assert(/Witness parties:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the witness parties line');
assert(/Witness evidence:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the witness evidence line');
assert(/Witness \/ closeout pack:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the witness-pack line');
assert(/Case status:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the case status line');
assert(/Current revision \/ response:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the current revision line');
assert(/Next action owner \/ handover:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the next action owner line');
assert(/Next action due date:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the next action due date line');
assert(/Next required action:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the next action line');
assert(/Submission \/ review trail:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should include the submission-trail line');
assert(/Dispatch \/ restoration sequence carried into commissioning:/i.test(commissioningChecklistPayload.text), 'Commissioning checklist should carry the dispatch/restoration section');
const witnessDataSheetPayload = PVCalculator.getPlantWitnessDataSheetPayload(scoping);
assert(witnessDataSheetPayload.ready === true, 'Witness data sheet should be available when commissioning prep exists');
assert(/^section,field,value,status/m.test(witnessDataSheetPayload.text), 'Witness data sheet should export CSV headers');
assert(/witness,Case status,Review Comments Open,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the case-status row');
assert(/witness,Witness parties,Client \+ Installer Witness,pass/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the witness-party row');
assert(/witness,Witness evidence,Staged Transfer \/ Restart Proof,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the witness-evidence row');
assert(/witness,Witness \/ closeout pack,Review Ready,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the witness-pack row');
assert(/witness,Case owner,IKEDC Embedded Desk,info/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the case-owner row');
assert(/witness,Submission \/ review date,2026-03-12,info/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the submission-date row');
assert(/witness,Revision \/ response,Rev B \/ Comment Response 1,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the revision row');
assert(/witness,Next action owner \/ handover,Installer PM \/ Protection Consultant,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the next-action-owner row');
assert(/witness,Next action due date,2026-03-24,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the next-action-due row');
assert(/witness,Next required action,Issue Rev B one-line and submit non-export relay proof package\.,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the next-action row');
assert(/witness,Submission \/ review trail,/i.test(witnessDataSheetPayload.text) && /Rev B resubmitted 2026-03-20/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the submission-trail row');
assert(/witness,Review comments,Hold non-export relay proof and signed witness roster before clearance\.,warn/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include the review-comments row');
assert(/dispatch,Base energization order/i.test(witnessDataSheetPayload.text), 'Witness data sheet should include dispatch/restoration rows');
const sourceReview = PVCalculator.getPlantSourceReviewSummary(scoping);
assert(sourceReview.items.some(item => /generator breaker|changeover/i.test(item)), 'Plant source review should warn about generator handover for assisted filling-station feeders');

const publicScope = PlantScopingEngine.calculate(
    appliances,
    aggregation,
    architecture,
    decision,
    supportSummary,
    {
        ...config,
        plantScopeMode: 'public_service_microgrid',
        interconnectionScopeMode: 'public_service_interconnection'
    }
);

assert(publicScope.status === 'fail', 'Public-service scope should fail the honest boundary check');
assert(publicScope.studyBoundary.outsideCurrentScope === true, 'Public-service scope should be marked outside current product scope');
const publicUtilityLane = PVCalculator.getUtilityEngineeringLaneSummary(publicScope);
assert(publicUtilityLane.status === 'fail', 'Public-service scope should force the separate utility / mini-grid engineering lane');
assert(publicUtilityLane.items.some(item => /interconnection|protection|dispatch|witness/i.test(item.detail)), 'Public-service utility lane should surface authority and study requirements');
const publicPacket = PVCalculator.getUtilityInterconnectionPacketSummary(publicScope);
assert(publicPacket.items.some(item => /Formal interconnection basis|Active packet lane/.test(item.label)), 'Public-service scope should force the formal interconnection packet scaffold');
const publicCommissioning = PVCalculator.getPlantCommissioningPrepSummary(publicScope);
assert(publicCommissioning.items.some(item => /Witness \/ authority hold point/.test(item.label)), 'Public-service scope should require witness-test preparation');

console.log('Plant scoping tests passed');
