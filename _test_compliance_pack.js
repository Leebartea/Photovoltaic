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

const tempFile = '_test_compliance_pack_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, __ensureElement };`);

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

function setOptions(id, values, selected) {
    const node = el(id, 'select');
    node.options = values.map(value => ({ value: String(value) }));
    node.value = selected || String(values[0] || '');
    return node;
}

function setContext(overrides = {}) {
    const defaults = {
        proposalCompanyName: '',
        proposalContactName: '',
        proposalContactPhone: '',
        proposalContactEmail: '',
        proposalClientName: '',
        proposalSiteName: '',
        proposalQuoteReference: '',
        proposalIssueDate: '2026-03-09',
        surveyStage: 'preliminary',
        surveyMountingType: 'roof',
        surveyShadingProfile: 'unknown',
        surveyCableRoute: 'unknown',
        surveyAccess: 'standard',
        surveyNotes: '',
        surveyStructureConfirmed: false,
        surveyCableRouteConfirmed: false,
        surveyEarthingConfirmed: false,
        surveyExclusionsReviewed: false,
        surveyBudgetAligned: false,
        surveyUtilityReviewed: false
    };
    const state = { ...defaults, ...overrides };

    el('proposalCompanyName', 'input', { value: state.proposalCompanyName });
    el('proposalContactName', 'input', { value: state.proposalContactName });
    el('proposalContactPhone', 'input', { value: state.proposalContactPhone });
    el('proposalContactEmail', 'input', { value: state.proposalContactEmail });
    el('proposalClientName', 'input', { value: state.proposalClientName });
    el('proposalSiteName', 'input', { value: state.proposalSiteName });
    el('proposalQuoteReference', 'input', { value: state.proposalQuoteReference });
    el('proposalIssueDate', 'input', { value: state.proposalIssueDate });
    setOptions('surveyStage', ['preliminary', 'remote_reviewed', 'onsite_complete'], state.surveyStage);
    setOptions('surveyMountingType', ['roof', 'ground', 'unknown'], state.surveyMountingType);
    setOptions('surveyShadingProfile', ['clear', 'moderate', 'severe', 'unknown'], state.surveyShadingProfile);
    setOptions('surveyCableRoute', ['simple', 'moderate', 'complex', 'unknown'], state.surveyCableRoute);
    setOptions('surveyAccess', ['standard', 'restricted', 'difficult', 'unknown'], state.surveyAccess);
    el('surveyNotes', 'textarea', { value: state.surveyNotes });
    el('surveyStructureConfirmed', 'input', { checked: !!state.surveyStructureConfirmed });
    el('surveyCableRouteConfirmed', 'input', { checked: !!state.surveyCableRouteConfirmed });
    el('surveyEarthingConfirmed', 'input', { checked: !!state.surveyEarthingConfirmed });
    el('surveyExclusionsReviewed', 'input', { checked: !!state.surveyExclusionsReviewed });
    el('surveyBudgetAligned', 'input', { checked: !!state.surveyBudgetAligned });
    el('surveyUtilityReviewed', 'input', { checked: !!state.surveyUtilityReviewed });
}

function makeCommercial() {
    return {
        profileLabel: 'Standard Install',
        profileHeadline: 'Balanced package for a mainstream installer quote.',
        profileNote: 'Commercial assumptions are still reference values until procurement is locked.',
        band: { low: 10000, high: 12000, spreadPct: 18 },
        totals: {
            finalQuote: 11250,
            equipmentSubtotal: 7100,
            laborCost: 1420,
            softCost: 710,
            marginAmount: 2020,
            taxAmount: 0
        },
        paymentPlan: {
            deposit: 5625,
            depositPct: 50,
            completion: 5625,
            completionPct: 50
        },
        inputs: {
            currencyLabel: 'USD',
            taxPct: 0,
            laborPct: 20,
            softCostPct: 10,
            marginPct: 18,
            regionalMultiplier: 1.15
        },
        terms: {
            validityDays: 14,
            installWindowLabel: '4 working days'
        },
        options: [
            {
                key: 'standard',
                label: 'Standard',
                badge: 'Recommended',
                headline: 'Balanced allowance level',
                totals: { finalQuote: 11250, equipmentSubtotal: 7100 },
                band: { low: 10000, high: 12000 },
                paymentPlan: { depositPct: 50, deposit: 5625 },
                isCurrent: true,
                isRecommended: true,
                note: 'Balanced package for most projects.'
            }
        ],
        notes: ['Labor, soft costs, and margin are still modeled assumptions.'],
        items: [
            { label: 'Inverter and battery package', notes: 'Reference hardware allowance', basis: '1 lot', amount: 5200 },
            { label: 'PV modules and BOS', notes: 'Reference array, structure, and protection allowance', basis: '1 lot', amount: 1900 }
        ],
        scopeIncluded: ['Supply and install the recommended PV and storage system.'],
        exclusions: ['Permit and interconnection fees are excluded unless priced explicitly.'],
        nextSteps: ['Confirm site survey evidence and utility path before final contract.'],
        usesStandaloneMPPT: false
    };
}

function makeDetails(config, compliance) {
    return {
        config,
        aggregation: {
            dailyEnergyWh: 6200,
            peakSimultaneousVA: 3800
        },
        inverter: {
            recommendedSizeVA: 5000,
            continuousVARequired: 3800,
            surgeVARequired: 6500,
            dcBusVoltage: 48,
            dcInputCurrentContinuous: 79.2,
            dcInputCurrentSurge: 135.4,
            warnings: [],
            blocks: [],
            suggestions: [],
            clusterPlan: null
        },
        battery: {
            chemistry: 'lifepo4',
            chemistryName: 'LiFePO4',
            bankVoltage: 48,
            totalCapacityAh: 200,
            totalCapacityWh: 9600,
            usableCapacityWh: 7680,
            maxChargeCurrent: 100,
            maxDischargeCurrent: 200,
            stringsInParallel: 1,
            isMixedBank: false
        },
        pvArray: {
            arrayWattage: 3600,
            totalPanels: 6,
            dailyEnergyWh: 7200,
            panelsInSeries: 3,
            stringsInParallel: 2,
            stringVmp: 123,
            stringVoc: 147,
            stringVocCold: 160,
            arrayImp: 19.5,
            arrayIsc: 20.7,
            deratedOutput: 3000,
            warnings: [],
            blocks: [],
            suggestions: []
        },
        mpptValidation: { warnings: [], blocks: [], suggestions: [] },
        cables: {
            dcRuns: [],
            acRuns: [],
            totalCopperLengthM: 28,
            estimatedCopperKg: 7.5
        },
        protection: {
            pvSide: [],
            batterySide: [],
            acSide: [],
            earthing: []
        },
        losses: {
            inverterEfficiency: 93,
            batteryRoundTripEfficiency: 92,
            mpptEfficiency: 98,
            pvTempDerating: 90,
            overallSystemEfficiency: 79
        },
        equipmentLibrary: { hasSelections: false },
        confidenceScore: 92,
        confidenceLevel: 'High',
        confidenceColor: '#16a34a',
        commercial: makeCommercial(),
        compliance
    };
}

setOptions('location', ['lagos_ng', 'us_south', 'australia', 'generic'], 'lagos_ng');
setOptions('systemType', ['off_grid', 'hybrid', 'grid_tie'], 'off_grid');
setOptions('phaseType', ['single', 'split', 'three_phase'], 'single');
setOptions('acVoltage', ['230', '240', '400'], '230');
setOptions('frequency', ['50', '60'], '50');
setOptions('inverterMarketOverride', ['auto', 'EMERGING_OFFGRID', 'US_SPLIT_PHASE', 'EU_SINGLE_PHASE'], 'auto');
el('avgPSH', 'input', { value: '4.5' });
el('autonomyDays', 'input', { value: '1' });
el('ambientTempMin', 'input', { value: '20' });
el('ambientTempMax', 'input', { value: '35' });
el('designMargin', 'input', { value: '125' });
el('inverterSurgeMultiplier', 'input', { value: '2.0' });
setOptions('inverterTechnology', ['unknown', 'transformerless'], 'unknown');
setOptions('panelOrientation', ['south', 'unknown'], 'south');
setOptions('panelTilt', ['optimal', 'unknown'], 'optimal');

LoadEngine.appliances = [];
PVCalculator.getPanel = () => ({ wattage: 600, vmp: 41, voc: 49, imp: 14.6, isc: 15.4, tempCoeffPmax: -0.35 });
PVCalculator.getMPPT = () => ({ maxVoltage: 500, minVoltage: 95, maxOperatingVoltage: 450, maxCurrent: 27, maxPower: 7500, maxChargeCurrent: 120, inputCount: 1 });
PVCalculator.getBatteryUnitVoltage = () => 48;
PVCalculator.getBatteryUnitAh = () => 200;

const readyContext = {
    surveyStage: 'onsite_complete',
    structureConfirmed: true,
    cableRouteConfirmed: true,
    earthingConfirmed: true,
    utilityReviewed: true
};

const lagosConfig = {
    location: 'lagos_ng',
    locationProfile: DEFAULTS.REGION_PROFILES.lagos_ng,
    systemType: 'off_grid',
    phaseType: 'single',
    acVoltage: 230,
    frequency: 50,
    avgPSH: 4.5,
    autonomyDays: 1,
    ambientTempMin: 20,
    ambientTempMax: 35,
    designMargin: 125,
    inverterSurgeMultiplier: 2,
    inverterMarket: 'EMERGING_OFFGRID',
    panelOrientation: 'south',
    panelTilt: 'optimal',
    orientationFactor: 1,
    tiltFactor: 1
};

const lagosCompliance = PVCalculator.getCompliancePack(lagosConfig, readyContext, {
    aggregation: {},
    inverter: {},
    battery: {},
    pvArray: {},
    equipmentLibrary: { hasSelections: true }
});
assert(/NEIS/i.test(lagosCompliance.codeFamily), 'Lagos compliance pack uses the NEIS code family');
assert(lagosCompliance.utilityRequired === false, 'off-grid Lagos path does not require utility review');
assert(lagosCompliance.status === 'ready', `ready off-grid Lagos path should be install-ready (got ${lagosCompliance.status})`);
assert(lagosCompliance.submissionPack && /Licensed installer closeout pack/i.test(lagosCompliance.submissionPack.label), 'Lagos compliance pack exposes the licensed-installer submission profile');

const lagosSubmissionReady = PVCalculator.getCompliancePack(lagosConfig, {
    ...readyContext,
    companyName: 'Field Solar',
    contactName: 'Ada Installer',
    contactPhone: '+234-555-0100',
    clientName: 'Demo Client',
    siteName: 'Main Street Shop',
    quoteReference: 'PV-001',
    issueDate: '2026-03-09',
    exclusionsReviewed: true,
    budgetAligned: true
}, {
    aggregation: {},
    inverter: {},
    battery: {},
    pvArray: {},
    equipmentLibrary: { hasSelections: true }
});
assert(lagosSubmissionReady.submissionPack.status === 'ready', `Lagos off-grid submission pack should be ready when identity, survey, and closeout controls are set (got ${lagosSubmissionReady.submissionPack.status})`);

const usContext = {
    surveyStage: 'onsite_complete',
    structureConfirmed: true,
    cableRouteConfirmed: true,
    earthingConfirmed: true,
    utilityReviewed: false
};

const usConfig = {
    location: 'us_south',
    locationProfile: DEFAULTS.REGION_PROFILES.us_south,
    systemType: 'grid_tie',
    phaseType: 'split',
    acVoltage: 240,
    frequency: 60,
    avgPSH: 5.5,
    autonomyDays: 1,
    ambientTempMin: -5,
    ambientTempMax: 42,
    designMargin: 125,
    inverterSurgeMultiplier: 2,
    inverterMarket: 'US_SPLIT_PHASE',
    panelOrientation: 'south',
    panelTilt: 'optimal',
    orientationFactor: 1,
    tiltFactor: 1
};

const usCompliance = PVCalculator.getCompliancePack(usConfig, usContext, {
    aggregation: {},
    inverter: {},
    battery: {},
    pvArray: {},
    equipmentLibrary: { hasSelections: false }
});
assert(usCompliance.utilityRequired === true, 'US grid-tie path requires utility review');
assert(usCompliance.status === 'pending', `US grid-tie path without utility review should stay pending (got ${usCompliance.status})`);
assert(usCompliance.openItems.some(item => /authority or utility/i.test(item)), 'US grid-tie path exposes a utility closeout action');
assert(usCompliance.submissionPack.status === 'pending', `US grid-tie submission pack without utility review should stay pending (got ${usCompliance.submissionPack.status})`);
assert(/AHJ permit and interconnection pack/i.test(usCompliance.submissionPack.label), 'US submission pack exposes the AHJ/interconnection pack label');
assert(usCompliance.submissionPack.openItems.some(item => /approval trail|utility/i.test(item)), 'US submission pack carries an approval-path closeout action');

const australiaCompliance = PVCalculator.getCompliancePack({
    ...lagosConfig,
    location: 'australia',
    locationProfile: DEFAULTS.REGION_PROFILES.australia,
    systemType: 'hybrid',
    inverterMarket: 'EU_SINGLE_PHASE'
}, readyContext, {
    aggregation: {},
    inverter: {},
    battery: {},
    pvArray: {},
    equipmentLibrary: { hasSelections: true }
});
assert(/AS\/NZS 5033/i.test(australiaCompliance.codeFamily), 'Australia compliance pack exposes the AS/NZS code family');

setContext({
    proposalCompanyName: 'Field Solar',
    proposalContactName: 'Ada Installer',
    proposalContactPhone: '+1-555-0100',
    proposalClientName: 'Demo Client',
    proposalSiteName: 'Main Street Shop',
    proposalQuoteReference: 'PV-001',
    proposalIssueDate: '2026-03-09',
    surveyStage: 'onsite_complete',
    surveyMountingType: 'roof',
    surveyShadingProfile: 'clear',
    surveyCableRoute: 'simple',
    surveyAccess: 'standard',
    surveyStructureConfirmed: true,
    surveyCableRouteConfirmed: true,
    surveyEarthingConfirmed: true,
    surveyExclusionsReviewed: true,
    surveyBudgetAligned: true,
    surveyUtilityReviewed: false
});

const usDetails = makeDetails(usConfig, usCompliance);
const readiness = PVCalculator.calculateProposalReadiness(usDetails, { hasBlocks: false }, { score: 92, level: 'High' });
assert(readiness.gates.some(gate => gate.label === 'Regional compliance path'), 'proposal readiness adds a dedicated regional compliance gate');
assert(readiness.openItems.some(item => /authority or utility/i.test(item)), 'proposal readiness carries the compliance closeout action');

const compliancePanelHtml = PVCalculator.renderCompliancePanel(usCompliance, { compact: true, title: 'Regional Compliance Path' });
assert(/Regional Compliance Path/.test(compliancePanelHtml), 'compliance panel renderer includes the supplied title');
assert(/AHJ permit office and utility interconnection team/.test(compliancePanelHtml), 'compliance panel renders the authority');

const submissionPanelHtml = PVCalculator.renderSubmissionPackPanel(usCompliance.submissionPack, { compact: true, title: 'Submission Pack Readiness' });
assert(/Submission Pack Readiness/.test(submissionPanelHtml), 'submission pack panel renderer includes the supplied title');
assert(/AHJ \/ utility approval pack/.test(submissionPanelHtml), 'submission pack panel renders the approval lane');

const executiveHtml = PVCalculator.renderExecutiveSummary(usDetails, { hasBlocks: false }, { score: 92, level: 'High' });
assert(/Regional Compliance Path/.test(executiveHtml), 'executive summary embeds the compliance panel');
assert(/NEC 690 \/ 705 with local AHJ enforcement/.test(executiveHtml), 'executive summary surfaces the regional code family');
assert(/Submission Pack Readiness/.test(executiveHtml), 'executive summary embeds the submission pack panel');

const commercialHtml = PVCalculator.renderCommercialSummary(usDetails, false);
assert(/Regional Compliance Path/.test(commercialHtml), 'commercial summary embeds the compliance panel');
assert(/Permit, interconnection, labeling, and inspection fees should remain visible in the quote or exclusions\./.test(commercialHtml), 'commercial summary carries the pack-specific commercial note');
assert(/Submission Pack Readiness/.test(commercialHtml), 'commercial summary embeds the submission pack panel');

const overviewHtml = PVCalculator.renderOverviewTab(usDetails);
assert(/Regional Compliance Snapshot/.test(overviewHtml), 'overview tab renders a compact compliance snapshot');
assert(/Compliance Path/.test(overviewHtml), 'overview tab includes the compliance environment rows');
assert(/Required Deliverables/.test(overviewHtml), 'overview tab includes required deliverables');
assert(/Submission Pack Snapshot/.test(overviewHtml), 'overview tab renders a compact submission snapshot');
assert(/Submission Pack/.test(overviewHtml), 'overview tab includes submission pack environment rows');

console.log('compliance pack tests passed');
