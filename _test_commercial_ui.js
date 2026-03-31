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
function makeElement(id) {
    const el = {
        id,
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
        removeChild() {},
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
    return el;
}
function ensureElement(id) {
    if (!__elements[id]) __elements[id] = makeElement(id);
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
var navigator = { userAgent: 'test', clipboard: { writeText(value) { global.__copiedText = value; return Promise.resolve(); } } };
var document = {
    getElementById(id) { return ensureElement(id); },
    querySelector(selector) {
        if (selector === '#tab-overview svg') return null;
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
var confirm = function() { return false; };
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
global.__copiedText = '';
`;

const tempFile = '_test_commercial_ui_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, OutputGenerator, DefenseNotes, LoadEngine, __elements, __ensureElement, window, document };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    DEFAULTS,
    PVCalculator,
    OutputGenerator,
    DefenseNotes,
    LoadEngine,
    __ensureElement,
    window,
    document
} = mod;

function el(id, props = {}) {
    const node = __ensureElement(id);
    Object.assign(node, props);
    return node;
}

[
    'audienceMode',
    'audienceModeHint',
    'installerElectricalConfigRow',
    'installerTemperatureRow',
    'installerEngineeringRow',
    'installerApplianceBehaviorSection',
    'upgradeSimulatorCard',
    'equipmentSpecsCard',
    'manualMode',
    'expertMode',
    'expertModeSection',
    'batteryManualIndicator',
    'pdfIncludeDetails',
    'commercialPresetSelect',
    'commercialPresetAppliedId',
    'commercialPresetPreview',
    'applyCommercialPresetBtn',
    'quoteCurrencyLabel',
    'pricingProfile',
    'supplierPricePack',
    'supplierPackPreview',
    'supplierQuoteStatus',
    'supplierQuoteDate',
    'supplierQuoteReference',
    'supplierRefreshWindowDays',
    'supplierQuoteFreshnessPreview',
    'supplierRefreshRequestPreview',
    'copySupplierRefreshRequestBtn',
    'supplierQuoteImportText',
    'supplierQuoteImportFile',
    'supplierQuoteImportPreview',
    'applySupplierQuoteImportBtn',
    'supplierPvPerWp',
    'supplierInverterPerVA',
    'supplierBatteryPerKWh',
    'supplierMpptPerW',
    'supplierMountingPerWp',
    'supplierProtectionPerWp',
    'supplierCablePerKg',
    'supplierMonitoringFlat',
    'regionalPriceFactor',
    'laborPct',
    'softCostPct',
    'proposalMarginPct',
    'proposalTaxPct',
    'proposalDepositPct',
    'proposalValidityDays',
    'proposalInstallWindowDays',
    'proposalIncludedScope',
    'proposalExclusions',
    'proposalNextSteps',
    'proposalCompanyName',
    'proposalContactName',
    'proposalQuoteReference',
    'proposalClientName',
    'proposalSiteName',
    'proposalIssueDate',
    'proposalContactPhone',
    'proposalContactEmail',
    'surveyStage',
    'surveyMountingType',
    'surveyShadingProfile',
    'surveyCableRoute',
    'surveyAccess',
    'surveyNotes',
    'surveyStructureConfirmed',
    'surveyCableRouteConfirmed',
    'surveyEarthingConfirmed',
    'surveyExclusionsReviewed',
    'surveyBudgetAligned',
    'surveyUtilityReviewed',
    'resultsContainer',
    'pdfSpinnerOverlay',
    'location',
    'systemType',
    'batteryChemistry',
    'gridMaxChargeA',
    'gridInputVoltageRange',
    'themeToggleBtn'
].forEach(id => el(id));

PVCalculator.toggleManualMode = function() {};
PVCalculator.announceResults = function() {};
PVCalculator.renderOverviewTab = function() { return '<div>overview</div>'; };
PVCalculator.renderLoadTab = function() { return '<div>load</div>'; };
PVCalculator.renderInverterTab = function() { return '<div>inverter</div>'; };
PVCalculator.renderBatteryTab = function() { return '<div>battery</div>'; };
PVCalculator.renderBatteryConfigTab = function() { return '<div>batt-config</div>'; };
PVCalculator.renderPVTab = function() { return '<div>pv</div>'; };
PVCalculator.renderConfigTab = function() { return '<div>pv-config</div>'; };
PVCalculator.renderCablesTab = function() { return '<div>cables</div>'; };
PVCalculator.renderProtectionTab = function() { return '<div>protection</div>'; };
PVCalculator.renderLossesTab = function() { return '<div>losses</div>'; };
PVCalculator.renderUpgradeTab = function() { return '<div>upgrade</div>'; };
PVCalculator.renderAdvisoryTab = function() { return '<div>advisory</div>'; };
PVCalculator.getPanel = function() { return { wattage: 400, vmp: 41, voc: 49, imp: 9.76, isc: 10.36 }; };
PVCalculator.getMPPT = function() { return { totalMaxPower: 4000, maxPower: 4000 }; };

LoadEngine.appliances = [
    { name: 'Fridge', loadType: 'motor', ratedPowerW: 150, quantity: 1, surgeFactor: 4 },
    { name: 'Lights', loadType: 'resistive', ratedPowerW: 120, quantity: 1, surgeFactor: 1 }
];

el('quoteCurrencyLabel', { value: 'USD' });
el('commercialPresetSelect', { value: '' });
el('commercialPresetAppliedId', { value: '' });
el('pricingProfile', { value: 'standard' });
el('supplierPricePack', { value: 'west_africa_import' });
el('supplierQuoteStatus', { value: 'benchmark_only' });
el('supplierQuoteDate', { value: '' });
el('supplierQuoteReference', { value: '' });
el('supplierRefreshWindowDays', { value: '14' });
el('supplierQuoteImportText', { value: '' });
el('supplierPvPerWp', { value: '' });
el('supplierInverterPerVA', { value: '' });
el('supplierBatteryPerKWh', { value: '' });
el('supplierMpptPerW', { value: '' });
el('supplierMountingPerWp', { value: '' });
el('supplierProtectionPerWp', { value: '' });
el('supplierCablePerKg', { value: '' });
el('supplierMonitoringFlat', { value: '' });
el('regionalPriceFactor', { value: '1.04' });
el('laborPct', { value: '18' });
el('softCostPct', { value: '8' });
el('proposalMarginPct', { value: '12' });
el('proposalTaxPct', { value: '0' });
el('proposalDepositPct', { value: '60' });
el('proposalValidityDays', { value: '14' });
el('proposalInstallWindowDays', { value: '7' });
el('proposalIncludedScope', { value: 'Supply and sizing of PV modules, inverter, battery storage, BOS, and protection devices.\nStandard installation, commissioning, labeling, and client handover for the recommended system.' });
el('proposalExclusions', { value: 'Structural roof repairs and major civil works.\nUtility approvals and permit fees unless added separately.' });
el('proposalNextSteps', { value: 'Confirm site-survey measurements.\nLock equipment brands and supplier pricing.' });
el('proposalCompanyName', { value: 'Leebartea Energy Systems' });
el('proposalContactName', { value: 'Tunde Adebayo' });
el('proposalQuoteReference', { value: 'PV-2026-014' });
el('proposalClientName', { value: 'Adeniran Family' });
el('proposalSiteName', { value: 'Lekki Residence Upgrade' });
el('proposalIssueDate', { value: '2026-03-08' });
el('proposalContactPhone', { value: '+234 803 000 0000' });
el('proposalContactEmail', { value: 'sales@leebartea.example' });
el('surveyStage', { value: 'onsite_complete' });
el('surveyMountingType', { value: 'roof' });
el('surveyShadingProfile', { value: 'clear' });
el('surveyCableRoute', { value: 'simple' });
el('surveyAccess', { value: 'standard' });
el('surveyNotes', { value: 'Roof space and DB location confirmed during site walk.' });
el('surveyStructureConfirmed', { checked: true });
el('surveyCableRouteConfirmed', { checked: true });
el('surveyEarthingConfirmed', { checked: true });
el('surveyExclusionsReviewed', { checked: true });
el('surveyBudgetAligned', { checked: true });
el('surveyUtilityReviewed', { checked: true });
el('location', { value: 'lagos_ng' });
el('systemType', { value: 'hybrid' });
el('batteryChemistry', { value: 'lifepo4' });
el('audienceMode', { value: 'installer' });
el('pdfIncludeDetails', { checked: true });
el('gridMaxChargeA', { value: '0' });
el('gridInputVoltageRange', { value: '' });
el('expertMode', { checked: false });

function buildResults(audienceMode) {
    return {
        config: {
            audienceMode,
            systemType: 'hybrid',
            phaseType: 'single',
            acVoltage: 230,
            frequency: 50,
            avgPSH: 5.2,
            ambientTempMin: 22,
            ambientTempMax: 34,
            autonomyDays: 1,
            designMargin: 125,
            inverterMarket: 'EMERGING_OFFGRID',
            inverterSurgeMultiplier: 2.0,
            location: 'lagos_ng',
            locationProfile: { name: 'Lagos, Nigeria' },
            panelOrientation: 'south',
            panelTilt: 'optimal',
            orientationFactor: 1,
            tiltFactor: 1
        },
        aggregation: {
            dailyEnergyWh: 6500,
            peakSimultaneousVA: 2400,
            designContinuousVA: 2200,
            highestSurgeVA: 4200,
            designSurgeVA: 4200,
            totalRealPowerW: 2000,
            totalApparentPowerVA: 2400,
            daytimeEnergyWh: 3600,
            nighttimeEnergyWh: 2900
        },
        inverter: {
            recommendedSizeVA: 3000,
            recommendedBalancedSizeVA: 3000,
            staggeredSizeVA: 2500,
            dcBusVoltage: 48,
            dcInputCurrentContinuous: 50,
            dcInputCurrentSurge: 90,
            motorBufferPct: 15,
            warnings: ['Cable sizing needs site length confirmation.'],
            managedMode: {
                engineeringVA: 3000,
                managedSizeVA: 2700,
                riskLevel: 'Low',
                riskLabel: 'Stable',
                conditions: [],
                conditionCount: 0,
                savings: 10
            }
        },
        battery: {
            totalCapacityAh: 280,
            totalCapacityWh: 14336,
            usableCapacityWh: 11468,
            chemistry: 'lifepo4',
            chemistryName: 'LiFePO4',
            bankVoltage: 51.2,
            cellsInSeries: 1,
            stringsInParallel: 1,
            totalCells: 1,
            recommendedAhPerCell: 280,
            maxDischargeCurrent: 280,
            maxChargeCurrent: 140,
            practical: {
                savings: 6,
                engineeringAh: 280,
                practicalAh: 250
            }
        },
        pvArray: {
            arrayWattage: 3600,
            totalPanels: 9,
            panelsInSeries: 3,
            stringsInParallel: 3,
            stringVocCold: 150,
            arrayIsc: 28,
            dailyEnergyWh: 14400,
            combinedPVFactor: 1.0,
            practical: {
                savings: 7,
                engineeringPanels: 9,
                practicalPanels: 8
            }
        },
        mpptValidation: {
            isValid: true,
            warnings: [],
            blocks: []
        },
        cables: {
            estimatedCopperKg: 22.5,
            dcRuns: [
                { name: 'PV to MPPT', recommendedMm2: 10, marketMm2: 10, current: 28.4, actualVoltageDropPercent: 1.2, voltageDropOK: true, ampacityOK: true, sizeRangeDisplay: '10-16mm²' },
                { name: 'Battery to Inverter', recommendedMm2: 35, marketMm2: 35, current: 62.5, actualVoltageDropPercent: 1.5, voltageDropOK: true, ampacityOK: true, sizeRangeDisplay: '35-50mm²' }
            ],
            acRuns: [
                { name: 'Inverter to Load DB', recommendedMm2: 6, marketMm2: 6, current: 12.1, actualVoltageDropPercent: 0.8, voltageDropOK: true, ampacityOK: true, sizeRangeDisplay: '6-10mm²' }
            ]
        },
        protection: {
            pvSide: [{ name: 'DC Isolator', rating: '32A' }],
            batterySide: [{ name: 'DC MCCB', rating: '125A' }],
            acSide: [{ name: 'AC MCB', rating: '20A' }]
        },
        losses: {
            overallSystemEfficiency: 81,
            pvTempDerating: 7,
            pvSoilingLoss: 3,
            pvMismatchLoss: 2,
            dcCableLoss: 1,
            mpptEfficiency: 98,
            batteryRoundTripEfficiency: 96,
            inverterEfficiency: 92,
            acCableLoss: 1,
            netAvailableEnergyDaily: 11664,
            energyMarginPercent: 22
        },
        configComparison: {},
        advisories: [
            {
                category: 'Load Management',
                severity: 'info',
                title: 'Shift daytime loads',
                message: 'Use workshop and pumping loads during solar hours.'
            }
        ],
        upgradePaths: [
            {
                category: 'PV Array',
                current: '3.6 kWp',
                options: [
                    {
                        feasible: true,
                        label: 'Add 3 panels',
                        detail: 'Existing inverter headroom can accept roughly 1.2 kWp more.',
                        impact: 'Daily solar yield +4.8 kWh'
                    }
                ]
            }
        ]
    };
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

const baseResults = buildResults('installer');
const readinessReady = PVCalculator.calculateProposalReadiness(baseResults, { hasBlocks: false }, { score: 88, level: 'High' });
assert(readinessReady.label === 'Proposal-ready', 'fully confirmed survey and proposal context should be proposal-ready');
assert(readinessReady.score >= 88, 'proposal-ready state should maintain a high readiness score');

el('surveyStage', { value: 'preliminary' });
el('surveyBudgetAligned', { checked: false });
const readinessPreliminary = PVCalculator.calculateProposalReadiness(baseResults, { hasBlocks: false }, { score: 88, level: 'High' });
assert(readinessPreliminary.score < readinessReady.score, 'preliminary survey state should reduce readiness score');
assert(readinessPreliminary.label !== 'Proposal-ready', 'preliminary survey state should not be proposal-ready');
el('surveyStage', { value: 'onsite_complete' });
el('surveyBudgetAligned', { checked: true });

const commercialBase = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialBase.items.length >= 8, 'commercial estimate should build BOM items');
assert(commercialBase.totals.finalQuote > commercialBase.totals.equipmentSubtotal, 'final quote should exceed equipment subtotal');
assert(commercialBase.paymentPlan.depositPct === 60, 'default deposit percentage should be applied');
assert(commercialBase.terms.validityDays === 14, 'default quote validity should be applied');
assert(commercialBase.scopeIncluded.length >= 2, 'included scope list should be parsed');
assert(commercialBase.exclusions.length >= 2, 'exclusions list should be parsed');
assert(commercialBase.options.length === 3, 'commercial estimate should expose three package options');
assert(commercialBase.options.some(option => option.isCurrent && option.key === 'standard'), 'selected pricing basis should be marked as current');
assert(commercialBase.options.some(option => option.isRecommended && option.key === 'standard'), 'standard package should remain the recommended default');
assert(commercialBase.pricingSource.packId === 'west_africa_import', 'commercial estimate should resolve the selected supplier price pack');
assert(commercialBase.pricingSource.hasOverrides === false, 'supplier pricing should default to the base pack when no overrides are entered');
assert(commercialBase.pricingSource.quoteFreshness.status === 'warn', 'benchmark-only quote freshness should warn by default');
assert(commercialBase.notes.some(note => note.includes('West Africa Import Benchmark')), 'commercial notes should mention the supplier source');
PVCalculator.renderSupplierQuoteFreshnessPreview();
assert(el('supplierQuoteFreshnessPreview').innerHTML.includes('Benchmark-only'), 'supplier quote freshness preview should render the default benchmark-only state');

PVCalculator.populateCommercialPresetOptions();
el('commercialPresetSelect', { value: 'process_continuity_hybrid' });
PVCalculator.renderCommercialPresetPreview();
assert(el('commercialPresetPreview').innerHTML.includes('Process Continuity Hybrid'), 'preset preview should render the selected preset');
PVCalculator.applySelectedCommercialPreset();
assert(el('commercialPresetAppliedId').value === 'process_continuity_hybrid', 'applied preset id should be stored separately from the preview selector');
assert(el('pricingProfile').value === 'premium', 'applying a preset should update the pricing profile');
assert(el('financeValueBasis').value === 'generator_energy_offset', 'applying a preset should update the finance value basis');
assert(el('proposalDepositPct').value === '65', 'applying a preset should update proposal terms');
assert(el('proposalIncludedScope').value.includes('protected process loads'), 'applying a preset should rewrite the included scope list');
const commercialPreset = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialPreset.preset && commercialPreset.preset.id === 'process_continuity_hybrid', 'commercial estimate should carry the applied preset metadata');
assert(commercialPreset.notes.some(note => note.includes('Process Continuity Hybrid')), 'commercial notes should mention the applied preset');
assert(el('commercialPresetPreview').innerHTML.includes('Applied to the current proposal'), 'preset preview should show applied state after the preset is applied');

const today = new Date().toISOString().slice(0, 10);
el('supplierQuoteStatus', { value: 'major_lines_locked' });
el('supplierQuoteDate', { value: today });
el('supplierQuoteReference', { value: 'SUP-449' });
el('supplierRefreshWindowDays', { value: '14' });
const commercialFreshQuote = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialFreshQuote.pricingSource.quoteFreshness.status === 'pass', 'fresh live supplier quote should pass freshness review');
assert(commercialFreshQuote.pricingSource.quoteFreshness.quoteReference === 'SUP-449', 'supplier quote reference should be preserved in quote freshness metadata');
PVCalculator.results = deepClone(baseResults);
PVCalculator.results.commercial = PVCalculator.calculateCommercialEstimate(PVCalculator.results);
PVCalculator.renderSupplierQuoteFreshnessPreview();
assert(el('supplierQuoteFreshnessPreview').innerHTML.includes('Fresh live quote'), 'supplier quote freshness preview should show a fresh live quote state');
PVCalculator.renderSupplierRefreshRequestPreview();
assert(el('supplierRefreshRequestPreview').innerHTML.includes('Supplier refresh brief ready'), 'supplier refresh brief should render when a current design exists');
assert(el('supplierRefreshRequestPreview').innerHTML.includes('Solar modules'), 'supplier refresh brief should summarize requested supplier line items');
PVCalculator.copySupplierRefreshRequest();
assert(global.__copiedText.includes('Supplier Quote Refresh Request'), 'supplier refresh brief copy should place the generated brief on the clipboard');
assert(global.__copiedText.includes('Solar modules:'), 'supplier refresh brief copy should include the line-item request summary');

el('supplierQuoteImportText', {
    value: [
        'Quote Ref: SUP-778',
        'Quote Date: 2026-03-18',
        'Currency: USD',
        'PV Modules: 0.43 /Wp',
        'Inverter: 0.13 /VA',
        'Battery: 295 /kWh',
        'Protection: 0.03 /Wp'
    ].join('\n')
});
PVCalculator.renderSupplierQuoteImportPreview();
assert(el('supplierQuoteImportPreview').innerHTML.includes('Recommended status: Major Lines Locked'), 'supplier quote import preview should recommend a stronger quote status for major matched lines');
assert(el('applySupplierQuoteImportBtn').disabled === false, 'supplier quote import apply button should enable when quote data is recognized');
PVCalculator.applySupplierQuoteImport();
assert(el('supplierQuoteStatus').value === 'major_lines_locked', 'supplier quote import should update the live supplier quote status');
assert(el('supplierQuoteDate').value === '2026-03-18', 'supplier quote import should extract and apply the supplier quote date');
assert(el('supplierQuoteReference').value === 'SUP-778', 'supplier quote import should extract and apply the supplier quote reference');
assert(el('supplierProtectionPerWp').value === '0.03', 'supplier quote import should populate recognized override fields');
const commercialImportedQuote = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialImportedQuote.pricingSource.quoteFreshness.quoteReference === 'SUP-778', 'commercial estimate should carry imported supplier quote metadata');
assert(commercialImportedQuote.pricingSource.overrideLabels.includes('Protection'), 'commercial estimate should treat imported component lines as live manual overrides');
el('supplierPvPerWp', { value: '' });
el('supplierInverterPerVA', { value: '' });
el('supplierBatteryPerKWh', { value: '' });
el('supplierProtectionPerWp', { value: '' });

el('supplierQuoteImportText', {
    value: JSON.stringify({
    quoteReference: 'JSON-220',
    quoteDate: '2026-03-17',
    currency: 'USD',
    refreshWindowDays: 21,
    rates: {
        pvPerWp: 0.39,
        inverterPerVA: 0.11,
        batteryPerKWh: 280,
        mountingPerWp: 0.07
    }
})
});
el('supplierQuoteImportText').dataset.importSourceName = 'supplier-structured.json';
PVCalculator.renderSupplierQuoteImportPreview();
assert(el('supplierQuoteImportPreview').innerHTML.includes('Source: supplier-structured.json'), 'structured quote import preview should show the loaded file name');
assert(el('supplierQuoteImportPreview').innerHTML.includes('Recommended status: Major Lines Locked'), 'structured quote import preview should classify a multi-line structured quote');
PVCalculator.applySupplierQuoteImport();
assert(el('supplierQuoteReference').value === 'JSON-220', 'structured quote import should apply the supplier quote reference');
assert(el('supplierQuoteDate').value === '2026-03-17', 'structured quote import should apply the supplier quote date');
assert(el('supplierRefreshWindowDays').value === '21', 'structured quote import should apply the refresh window when provided');
assert(el('supplierMountingPerWp').value === '0.07', 'structured quote import should map structured rates into override fields');
const commercialStructuredImport = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialStructuredImport.pricingSource.quoteFreshness.quoteReference === 'JSON-220', 'commercial estimate should carry structured import metadata');
assert(commercialStructuredImport.pricingSource.overrideLabels.includes('Mounting'), 'structured quote import should register mounting as an active override');
PVCalculator.clearSupplierQuoteImport();
assert(el('supplierQuoteImportText').value === '', 'clearSupplierQuoteImport should reset the import textarea');
assert(el('supplierQuoteImportFile').value === '', 'clearSupplierQuoteImport should reset the hidden file input');
el('supplierPvPerWp', { value: '' });
el('supplierInverterPerVA', { value: '' });
el('supplierBatteryPerKWh', { value: '' });
el('supplierMountingPerWp', { value: '' });

el('supplierQuoteImportText', {
    value: [
        'Quote Reference,SUP-ERP-991',
        'Quote Date,2026-03-16',
        'Currency,USD',
        'Refresh Window Days,30',
        'Item Code,Description,Qty,UOM,Line Total,Currency',
        'PV-550,PV Modules,72,Wp,29.52,USD',
        'INV-3P,Hybrid Inverter,1,ea,0.14,USD',
        'BAT-STACK,Lithium Battery,45,kWh,13050,USD'
    ].join('\n')
});
el('supplierQuoteImportText').dataset.importSourceName = 'supplier-erp.csv';
PVCalculator.renderSupplierQuoteImportPreview();
assert(el('supplierQuoteImportPreview').innerHTML.includes('Source: supplier-erp.csv'), 'ERP-style CSV preview should show the loaded file name');
assert(el('supplierQuoteImportPreview').innerHTML.includes('Recommended status: Major Lines Locked'), 'ERP-style CSV import should classify recognized major lines');
PVCalculator.applySupplierQuoteImport();
assert(el('supplierQuoteReference').value === 'SUP-ERP-991', 'ERP-style CSV import should extract preamble quote reference metadata');
assert(el('supplierQuoteDate').value === '2026-03-16', 'ERP-style CSV import should extract preamble quote date metadata');
assert(el('supplierRefreshWindowDays').value === '30', 'ERP-style CSV import should extract preamble refresh window metadata');
assert(el('supplierPvPerWp').value === '0.41', 'ERP-style CSV import should derive PV unit rate from line total and quantity');
assert(el('supplierBatteryPerKWh').value === '290', 'ERP-style CSV import should derive battery unit rate from line total and quantity');
const commercialErpImport = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialErpImport.pricingSource.quoteFreshness.quoteReference === 'SUP-ERP-991', 'commercial estimate should carry ERP-style CSV quote metadata');
assert(commercialErpImport.pricingSource.overrideLabels.includes('Modules'), 'ERP-style CSV import should register derived PV module pricing as an active override');
assert(commercialErpImport.pricingSource.overrideLabels.includes('Battery'), 'ERP-style CSV import should register derived battery pricing as an active override');
PVCalculator.clearSupplierQuoteImport();
el('supplierPvPerWp', { value: '' });
el('supplierInverterPerVA', { value: '' });
el('supplierBatteryPerKWh', { value: '' });

el('pricingProfile', { value: 'premium' });
el('proposalMarginPct', { value: '18' });
const commercialPremium = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialPremium.totals.finalQuote > commercialBase.totals.finalQuote, 'premium pricing inputs should increase quote');
assert(commercialPremium.options.find(option => option.key === 'premium').isCurrent, 'premium pricing selection should move the current package marker');
PVCalculator.applyPricingProfile('value');
assert(el('pricingProfile').value === 'value', 'applyPricingProfile should switch the pricing profile selector');
const commercialValue = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialValue.options.find(option => option.key === 'value').isCurrent, 'value pricing selection should move the current package marker');

el('pricingProfile', { value: 'standard' });
el('proposalMarginPct', { value: '12' });
el('supplierPricePack', { value: 'asia_value_supply' });
const commercialAsiaPack = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialAsiaPack.pricingSource.packId === 'asia_value_supply', 'commercial estimate should allow switching supplier packs');
assert(commercialAsiaPack.totals.finalQuote < commercialBase.totals.finalQuote, 'lower supplier benchmark pack should reduce the reference quote');

el('supplierPricePack', { value: 'west_africa_import' });
el('supplierPvPerWp', { value: '0.41' });
el('supplierBatteryPerKWh', { value: '310' });
const commercialOverrides = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialOverrides.pricingSource.hasOverrides === true, 'manual supplier overrides should be detected');
assert(commercialOverrides.pricingSource.overrideCount === 2, 'manual supplier overrides should count the affected line items');
assert(commercialOverrides.pricingSource.overrideLabels.includes('Modules'), 'manual PV override should be labeled in the supplier source summary');
assert(commercialOverrides.pricingSource.overrideLabels.includes('Battery'), 'manual battery override should be labeled in the supplier source summary');
assert(commercialOverrides.totals.finalQuote > commercialBase.totals.finalQuote, 'manual supplier overrides should change the commercial total');
PVCalculator.renderSupplierPricingPreview();
assert(el('supplierPackPreview').innerHTML.includes('override'), 'supplier pricing preview should reflect active overrides');

el('supplierPvPerWp', { value: '' });
el('supplierBatteryPerKWh', { value: '' });
el('proposalDepositPct', { value: '50' });
const commercialDeposit = PVCalculator.calculateCommercialEstimate(baseResults);
assert(commercialDeposit.paymentPlan.depositPct === 50, 'custom deposit percentage should be preserved');
assert(Math.round(commercialDeposit.paymentPlan.deposit) === Math.round(commercialDeposit.totals.finalQuote * 0.5), 'deposit amount should follow the configured deposit percentage');

el('proposalDepositPct', { value: '60' });

el('audienceMode', { value: 'client' });
PVCalculator.updateAudienceMode();
[
    'installerElectricalConfigRow',
    'installerTemperatureRow',
    'installerEngineeringRow',
    'installerApplianceBehaviorSection',
    'upgradeSimulatorCard',
    'equipmentSpecsCard'
].forEach(id => {
    assert(el(id).classList.contains('hidden'), `${id} should be hidden in client mode`);
});
assert(el('manualMode').disabled === true, 'manual mode should be disabled in client mode');
assert(el('pdfIncludeDetails').checked === false, 'client mode should default PDF appendix off');
assert(document.body['data-audience-mode'] === 'client', 'body should reflect client audience mode');

el('audienceMode', { value: 'installer' });
PVCalculator.updateAudienceMode();
[
    'installerElectricalConfigRow',
    'installerTemperatureRow',
    'installerEngineeringRow',
    'installerApplianceBehaviorSection',
    'upgradeSimulatorCard',
    'equipmentSpecsCard'
].forEach(id => {
    assert(!el(id).classList.contains('hidden'), `${id} should be visible in installer mode`);
});
assert(el('manualMode').disabled === false, 'manual mode should be enabled in installer mode');
assert(el('pdfIncludeDetails').checked === true, 'installer mode should default PDF appendix on');
assert(document.body['data-audience-mode'] === 'installer', 'body should reflect installer audience mode');

const clientResults = buildResults('client');
clientResults.commercial = PVCalculator.calculateCommercialEstimate(clientResults);
PVCalculator.results = clientResults;
el('audienceMode', { value: 'client' });
const clientReport = OutputGenerator.generateReport(clientResults);
PVCalculator.renderResults(clientReport, DefenseNotes.checkForBlocks(clientResults));
const clientHtml = el('resultsContainer').innerHTML;
assert(clientHtml.includes('Proposal Budget'), 'client results should include proposal budget card');
assert(clientHtml.includes('Package Options'), 'client results should include package comparison');
assert(clientHtml.includes('Value Install'), 'client results should include value package option');
assert(clientHtml.includes('Premium Install'), 'client results should include premium package option');
assert(clientHtml.includes('Use This Basis'), 'client results should include package selection actions');
assert(clientHtml.includes('Active Basis'), 'client results should indicate the current active package');
assert(clientHtml.includes('Recommended Proposal Path'), 'client results should include the proposal hero');
assert(clientHtml.includes('Quote Structure'), 'client results should include grouped quote structure');
assert(clientHtml.includes('Commercial Terms'), 'client results should include commercial terms');
assert(clientHtml.includes('Proposal Identity'), 'client results should include proposal identity panel');
assert(clientHtml.includes('Supplier Pricing Source'), 'client results should include supplier pricing source panel');
assert(clientHtml.includes('Supplier quote freshness'), 'client results should expose supplier quote freshness');
assert(clientHtml.includes('West Africa Import Benchmark'), 'client results should show the active supplier benchmark pack');
assert(clientHtml.includes('Readiness Gates'), 'client results should include readiness gates');
assert(clientHtml.includes('Leebartea Energy Systems'), 'client results should include installer identity details');
assert(clientHtml.includes('Included Scope'), 'client results should include scope panel');
assert(clientHtml.includes('Installer Design View'), 'client results should show installer handoff note');
assert(clientHtml.includes('Commercial promise boundary'), 'client results should include the promise boundary panel');
assert(!clientHtml.includes('Line Item'), 'client results should hide the line-item BOM table');
assert(!clientHtml.includes('Detailed Results'), 'client results should hide detailed tabs');

const installerResults = buildResults('installer');
installerResults.commercial = PVCalculator.calculateCommercialEstimate(installerResults);
PVCalculator.results = installerResults;
el('audienceMode', { value: 'installer' });
const installerReport = OutputGenerator.generateReport(installerResults);
PVCalculator.renderResults(installerReport, DefenseNotes.checkForBlocks(installerResults));
const installerHtml = el('resultsContainer').innerHTML;
assert(installerHtml.includes('Commercial Estimate'), 'installer results should include commercial estimate card');
assert(installerHtml.includes('Pricing Basis Comparison'), 'installer results should include pricing basis comparison');
assert(installerHtml.includes('Proposal Identity'), 'installer results should include proposal identity panel');
assert(installerHtml.includes('Resolved Cost Rates'), 'installer results should include resolved supplier rate cards');
assert(installerHtml.includes('Supplier Quote Freshness'), 'installer results should include supplier quote freshness metadata');
assert(installerHtml.includes('Commercial promise boundary'), 'installer results should include the promise boundary panel');
assert(installerHtml.includes('Line Item'), 'installer results should keep the line-item BOM table');
assert(installerHtml.includes('Detailed Results'), 'installer results should keep detailed tabs');

let lastPdf = null;
class FakePDF {
    constructor() {
        this.pages = [{ texts: [] }];
        this.currentPage = 0;
        this.savedName = null;
        this.internal = {
            pageSize: {
                getWidth() { return 210; },
                getHeight() { return 297; }
            }
        };
        lastPdf = this;
    }
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    setDrawColor() {}
    setFillColor() {}
    setLineWidth() {}
    roundedRect() {}
    rect() {}
    line() {}
    addImage() {}
    text(value) {
        const text = Array.isArray(value) ? value.join('\\n') : String(value);
        this.pages[this.currentPage].texts.push(text);
    }
    splitTextToSize(value) {
        return [String(value)];
    }
    addPage() {
        this.pages.push({ texts: [] });
        this.currentPage = this.pages.length - 1;
    }
    getNumberOfPages() {
        return this.pages.length;
    }
    setPage(pageNo) {
        this.currentPage = Math.max(0, pageNo - 1);
    }
    save(name) {
        this.savedName = name;
    }
}
window.jspdf = { jsPDF: FakePDF };

async function verifyPdf(results, audienceMode, includeDetails) {
    const copy = deepClone(results);
    copy.config.audienceMode = audienceMode;
    copy.commercial = PVCalculator.calculateCommercialEstimate(copy);
    PVCalculator.results = copy;
    el('audienceMode', { value: audienceMode });
    el('pdfIncludeDetails', { checked: includeDetails });
    await PVCalculator.exportPDF();
    const text = lastPdf.pages.flatMap(page => page.texts).join('\n');
    return { text, fileName: lastPdf.savedName, pageCount: lastPdf.getNumberOfPages() };
}

(async () => {
    const clientPdf = await verifyPdf(buildResults('client'), 'client', false);
    assert(clientPdf.fileName.startsWith('PV_Client_Estimate_'), 'client export should use client estimate filename');
    assert(clientPdf.text.includes('Proposal Budget'), 'client PDF should include proposal budget section');
    assert(clientPdf.text.includes('Client Summary'), 'client PDF should include client summary');
    assert(clientPdf.text.includes('Package Comparison'), 'client PDF should include package comparison table');
    assert(clientPdf.text.includes('Quote Structure'), 'client PDF should include grouped quote structure');
    assert(clientPdf.text.includes('Commercial Terms'), 'client PDF should include commercial terms');
    assert(clientPdf.text.includes('Proposal Control'), 'client PDF should include proposal control section');
    assert(clientPdf.text.includes('Supplier Source:'), 'client PDF should include supplier source metadata');
    assert(clientPdf.text.includes('Supplier Quote Freshness:'), 'client PDF should include supplier quote freshness metadata');
    assert(clientPdf.text.includes('West Africa Import Benchmark'), 'client PDF should include the supplier pack label');
    assert(clientPdf.text.includes('Leebartea Energy Systems'), 'client PDF should include installer identity');
    assert(clientPdf.text.includes('Adeniran Family'), 'client PDF should include client identity');
    assert(clientPdf.text.includes('Exclusions'), 'client PDF should include exclusions section');
    assert(!clientPdf.text.includes('Reference BOM Snapshot'), 'client PDF should avoid the client-side BOM snapshot');
    assert(!clientPdf.text.includes('System Overview Diagram'), 'client PDF should skip installer overview page when appendix is off');

    const installerPdf = await verifyPdf(buildResults('installer'), 'installer', false);
    assert(installerPdf.fileName.startsWith('PV_System_Design_'), 'installer export should use system design filename');
    assert(installerPdf.text.includes('Commercial Estimate'), 'installer PDF should include commercial estimate section');
    assert(installerPdf.text.includes('Pricing Basis Comparison'), 'installer PDF should include pricing basis comparison');
    assert(installerPdf.text.includes('Override State:'), 'installer PDF should include supplier override state');
    assert(installerPdf.text.includes('Supplier Quote Freshness:'), 'installer PDF should include supplier quote freshness metadata');
    assert(installerPdf.text.includes('West Africa Import Benchmark'), 'installer PDF should include supplier pack metadata');
    assert(installerPdf.text.includes('Reference BOM'), 'installer PDF should keep the detailed BOM section');
    assert(installerPdf.text.includes('System Overview Diagram'), 'installer PDF should still include the overview page');
    assert(installerPdf.pageCount >= clientPdf.pageCount, 'installer PDF should be at least as long as client PDF');

    console.log('COMMERCIAL UI HARNESS OK');
})();
