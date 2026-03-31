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
        removeChild(child) { this.children = this.children.filter(item => item !== child); return child; },
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
var navigator = { userAgent: 'test', clipboard: { writeText() { return Promise.resolve(); } } };
var document = {
    getElementById(id) { return ensureElement(id); },
    querySelector(selector) {
        if (selector === '#tab-overview svg') return null;
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

const tempFile = '_test_finance_roi_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, OutputGenerator, DefenseNotes, LoadEngine, __elements, __ensureElement, window, document };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    PVCalculator,
    OutputGenerator,
    DefenseNotes,
    LoadEngine,
    __ensureElement,
    window,
    document
} = mod;

function el(id, props = {}, tagName = 'div') {
    const node = __ensureElement(id, tagName);
    node.tagName = tagName.toUpperCase();
    Object.assign(node, props);
    return node;
}

[
    ['audienceMode', 'select', { value: 'installer' }],
    ['location', 'select', { value: 'lagos_ng' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['batteryChemistry', 'select', { value: 'lifepo4' }],
    ['operatingSchedulePreset', 'select', { value: 'extended_business_day' }],
    ['businessProfile', 'select', { value: 'bakery' }],
    ['operatingIntent', 'select', { value: 'hybrid_generator' }],
    ['continuityClass', 'select', { value: 'process_critical' }],
    ['quoteCurrencyLabel', 'input', { value: 'USD' }],
    ['pricingProfile', 'select', { value: 'standard' }],
    ['supplierPricePack', 'select', { value: 'west_africa_import' }],
    ['regionalPriceFactor', 'input', { value: '1.04' }],
    ['laborPct', 'input', { value: '18' }],
    ['softCostPct', 'input', { value: '8' }],
    ['proposalMarginPct', 'input', { value: '12' }],
    ['proposalTaxPct', 'input', { value: '0' }],
    ['financeValueBasis', 'select', { value: 'generator_energy_offset' }],
    ['financeEnergyRatePerKWh', 'input', { value: '0.32' }],
    ['financeExportCreditPerKWh', 'input', { value: '0.03' }],
    ['financeOperatingDaysPerWeek', 'input', { value: '6' }],
    ['financeAnnualEscalationPct', 'input', { value: '6' }],
    ['financeAnnualMaintenancePct', 'input', { value: '1.8' }],
    ['financeInverterRefreshPct', 'input', { value: '35' }],
    ['financeBatteryRefreshPct', 'input', { value: '30' }],
    ['financeTaxBenefitPct', 'input', { value: '5' }],
    ['financeDebtSharePct', 'input', { value: '40' }],
    ['financeDebtAprPct', 'input', { value: '10' }],
    ['financeDebtTermYears', 'input', { value: '5' }],
    ['financeResidualValuePct', 'input', { value: '8' }],
    ['proposalDepositPct', 'input', { value: '55' }],
    ['proposalValidityDays', 'input', { value: '14' }],
    ['proposalInstallWindowDays', 'input', { value: '9' }],
    ['supplierPvPerWp', 'input', { value: '' }],
    ['supplierInverterPerVA', 'input', { value: '' }],
    ['supplierBatteryPerKWh', 'input', { value: '' }],
    ['supplierMpptPerW', 'input', { value: '' }],
    ['supplierMountingPerWp', 'input', { value: '' }],
    ['supplierProtectionPerWp', 'input', { value: '' }],
    ['supplierCablePerKg', 'input', { value: '' }],
    ['supplierMonitoringFlat', 'input', { value: '' }],
    ['proposalIncludedScope', 'textarea', { value: 'Supply and installation of the recommended PV system.\nCommissioning and operator handover.' }],
    ['proposalExclusions', 'textarea', { value: 'Civil works and utility fees unless added separately.' }],
    ['proposalNextSteps', 'textarea', { value: 'Confirm site survey.\nLock final equipment models.' }],
    ['proposalCompanyName', 'input', { value: 'Leebartea Energy Systems' }],
    ['proposalContactName', 'input', { value: 'Tunde Adebayo' }],
    ['proposalQuoteReference', 'input', { value: 'ROI-2026-002' }],
    ['proposalClientName', 'input', { value: 'Prime Crust Bakery' }],
    ['proposalSiteName', 'input', { value: 'Ikeja Production Site' }],
    ['proposalIssueDate', 'input', { value: '2026-03-11' }],
    ['proposalContactPhone', 'input', { value: '+234 803 000 0000' }],
    ['proposalContactEmail', 'input', { value: 'sales@leebartea.example' }],
    ['surveyStage', 'select', { value: 'onsite_complete' }],
    ['surveyMountingType', 'select', { value: 'roof' }],
    ['surveyShadingProfile', 'select', { value: 'light' }],
    ['surveyCableRoute', 'select', { value: 'moderate' }],
    ['surveyAccess', 'select', { value: 'standard' }],
    ['surveyNotes', 'textarea', { value: 'Bakery survey complete.' }],
    ['surveyStructureConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyCableRouteConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyEarthingConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyExclusionsReviewed', 'input', { type: 'checkbox', checked: true }],
    ['surveyBudgetAligned', 'input', { type: 'checkbox', checked: true }],
    ['surveyUtilityReviewed', 'input', { type: 'checkbox', checked: true }],
    ['supplierPackPreview', 'div', {}],
    ['resultsContainer', 'div', {}],
    ['pdfSpinnerOverlay', 'div', {}],
    ['pdfIncludeDetails', 'input', { checked: true }],
    ['gridMaxChargeA', 'input', { value: '0' }],
    ['gridInputVoltageRange', 'input', { value: '' }],
    ['themeToggleBtn', 'button', {}],
    ['manualMode', 'input', { checked: false }],
    ['expertMode', 'input', { checked: false }]
].forEach(([id, tagName, props]) => el(id, props, tagName));

[
    'audienceModeHint',
    'installerElectricalConfigRow',
    'installerTemperatureRow',
    'installerEngineeringRow',
    'installerApplianceBehaviorSection',
    'upgradeSimulatorCard',
    'equipmentSpecsCard'
].forEach(id => el(id, {}, 'div'));

PVCalculator.toggleManualMode = function() {};
PVCalculator.announceResults = function() {};
PVCalculator.getPanel = function() { return { wattage: 550, vmp: 41, voc: 49, imp: 13.4, isc: 14.2 }; };
PVCalculator.getMPPT = function() { return { totalMaxPower: 12000, maxPower: 12000 }; };

LoadEngine.appliances = [
    { name: 'Bakery Mixer 1', ratedPowerW: 1200, quantity: 1, dailyUsageHours: 2, daytimeRatio: 90, loadRole: 'process', loadCriticality: 'essential', loadType: 'motor', surgeFactor: 3.5, isSimultaneous: false, isAC: true, powerFactor: 0.82 },
    { name: 'Bakery Mixer 2', ratedPowerW: 1200, quantity: 1, dailyUsageHours: 2, daytimeRatio: 90, loadRole: 'process', loadCriticality: 'essential', loadType: 'motor', surgeFactor: 3.5, isSimultaneous: false, isAC: true, powerFactor: 0.82 },
    { name: 'Proofing Fridge', ratedPowerW: 350, quantity: 1, dailyUsageHours: 24, dutyCycle: 45, daytimeRatio: 50, loadRole: 'refrigeration', loadCriticality: 'critical', loadType: 'motor', surgeFactor: 4, isSimultaneous: true, isAC: true, powerFactor: 0.7 },
    { name: 'Lights', ratedPowerW: 300, quantity: 1, dailyUsageHours: 10, daytimeRatio: 60, loadRole: 'base', loadCriticality: 'essential', loadType: 'electronic', surgeFactor: 1.1, isSimultaneous: true, isAC: true, powerFactor: 0.95 }
];

function buildResults() {
    const config = {
        audienceMode: 'installer',
        systemType: 'hybrid',
        phaseType: 'single',
        acVoltage: 230,
        frequency: 50,
        avgPSH: 5.1,
        ambientTempMin: 23,
        ambientTempMax: 34,
        autonomyDays: 1,
        designMargin: 125,
        inverterMarket: 'EMERGING_OFFGRID',
        inverterSurgeMultiplier: 2.0,
        location: 'lagos_ng',
        locationProfile: { name: 'Lagos, Nigeria', region: 'africa' },
        panelOrientation: 'south',
        panelTilt: 'optimal',
        orientationFactor: 1,
        tiltFactor: 1,
        businessProfile: 'bakery',
        operatingIntent: 'hybrid_generator',
        continuityClass: 'process_critical',
        operatingSchedulePreset: 'extended_business_day'
    };
    config.operatingScheduleDefinition = PVCalculator.getOperatingScheduleDefinition(config.operatingSchedulePreset);
    config.businessContext = PVCalculator.getBusinessContextSummary(config);

    return {
        config,
        aggregation: {
            dailyEnergyWh: 28500,
            peakSimultaneousVA: 11200,
            designContinuousVA: 9800,
            highestSurgeVA: 16800,
            designSurgeVA: 16800,
            totalRealPowerW: 9300,
            totalApparentPowerVA: 11200,
            daytimeEnergyWh: 19800,
            nighttimeEnergyWh: 8700,
            operationalProfile: {
                overnightCriticalWh: 3200,
                overnightEssentialWh: 1800,
                daytimeProcessWh: 13800,
                totalProcessWh: 15600,
                preservationWh: 4600,
                deferrableWh: 2400,
                daytimeShiftableWh: 9200,
                energyByRoleWh: {
                    base: 5100,
                    process: 15600,
                    refrigeration: 4600,
                    operator_peak: 800,
                    discretionary: 2400
                },
                energyByCriticalityWh: {
                    critical: 4600,
                    essential: 21500,
                    deferrable: 2400
                }
            }
        },
        inverter: {
            recommendedSizeVA: 15000,
            recommendedBalancedSizeVA: 15000,
            staggeredSizeVA: 13500,
            dcBusVoltage: 48,
            dcInputCurrentContinuous: 200,
            dcInputCurrentSurge: 350,
            motorBufferPct: 18,
            warnings: [],
            managedMode: {
                engineeringVA: 15000,
                managedSizeVA: 13500,
                riskLevel: 'Moderate',
                riskLabel: 'Managed',
                conditions: [],
                conditionCount: 0,
                savings: 10
            }
        },
        battery: {
            totalCapacityAh: 800,
            totalCapacityWh: 40960,
            usableCapacityWh: 32768,
            chemistry: 'lifepo4',
            chemistryName: 'LiFePO4',
            bankVoltage: 51.2,
            cellsInSeries: 1,
            stringsInParallel: 4,
            totalCells: 4,
            recommendedAhPerCell: 200,
            maxDischargeCurrent: 400,
            maxChargeCurrent: 200
        },
        pvArray: {
            arrayWattage: 18000,
            totalPanels: 33,
            panelsInSeries: 3,
            stringsInParallel: 11,
            stringVocCold: 147,
            arrayIsc: 46,
            dailyEnergyWh: 57600,
            combinedPVFactor: 1.0
        },
        mpptValidation: {
            isValid: true,
            warnings: [],
            blocks: []
        },
        cables: {
            estimatedCopperKg: 46.5,
            dcRuns: [
                { name: 'PV to MPPT', recommendedMm2: 16, marketMm2: 16, current: 46, actualVoltageDropPercent: 1.4, voltageDropOK: true, ampacityOK: true, sizeRangeDisplay: '16-25mm²' },
                { name: 'Battery to Inverter', recommendedMm2: 95, marketMm2: 95, current: 200, actualVoltageDropPercent: 1.1, voltageDropOK: true, ampacityOK: true, sizeRangeDisplay: '95-120mm²' }
            ],
            acRuns: [
                { name: 'Inverter to Production DB', recommendedMm2: 16, marketMm2: 16, current: 65, actualVoltageDropPercent: 0.9, voltageDropOK: true, ampacityOK: true, sizeRangeDisplay: '16-25mm²' }
            ]
        },
        protection: {
            pvSide: [{ name: 'DC Isolator', rating: '63A' }],
            batterySide: [{ name: 'DC MCCB', rating: '250A' }],
            acSide: [{ name: 'AC MCCB', rating: '80A' }]
        },
        losses: {
            overallSystemEfficiency: 82,
            pvTempDerating: 8,
            pvSoilingLoss: 3,
            pvMismatchLoss: 2,
            dcCableLoss: 1,
            mpptEfficiency: 98,
            batteryRoundTripEfficiency: 95,
            inverterEfficiency: 93,
            acCableLoss: 1,
            netAvailableEnergyDaily: 47232,
            energyMarginPercent: 18
        },
        decisionStrategy: {
            key: 'hybrid_generator_assist',
            label: 'Hybrid Generator Assist',
            badge: 'Assist',
            headline: 'Best sold as a hybrid bakery system with protected production support and generator-backed process peaks.',
            detail: 'The bakery has a meaningful process burden and overnight preservation load, so a hybrid generator-assist posture is the most honest operating story.',
            note: 'Use the battery path for high-value continuity and let heavier production peaks ride on the assisted generator path.',
            score: 89,
            tone: 'blue',
            status: 'pass',
            isIntentAligned: true,
            isSystemTypeAligned: true,
            currentIntentLabel: 'Hybrid Generator Assist',
            currentSystemTypeLabel: 'Hybrid',
            reasons: [
                'Protected continuity covers the refrigeration and baseline business loads.',
                'Heavy production peaks still belong on an assisted path.'
            ],
            warnings: [],
            openItems: [],
            risks: [],
            alternates: [],
            metrics: {
                solarCoveragePct: 202,
                averageBackupHours: 27.6,
                overnightProtectedCoveragePct: 100,
                daytimeProcessSharePct: 88
            }
        },
        supportSummary: {
            label: 'Assisted continuity',
            headline: 'Protected load story is usable, but the assisted production path still needs explicit commercial language.',
            detail: 'Protected path covers 62% of daily energy across baseline and refrigeration loads, while bakery production peaks stay on the assisted path.',
            runtimeLabel: 'Assisted continuity',
            runtimeExpectation: 'Protected loads average about 26.4 hrs of battery-backed bridging, while deep production continuity still depends on the assisted path.',
            verticalNote: 'Bakery production peaks should not be sold as casual battery loads. Keep ovens and simultaneous mixer peaks on the assisted path unless the client buys deeper continuity.',
            promiseBoundary: {
                headline: 'Sell only the protected path as covered continuity and qualify everything else explicitly.',
                detail: 'Promise only the protected path as covered continuity. Assisted loads still depend on generator support, staged duty, or both, and excluded loads must stay outside the quote unless the scope changes.'
            },
            status: 'warn',
            tone: 'amber',
            warnings: [],
            openItems: [],
            risks: [],
            metrics: {
                protectedBackupHours: 26.4,
                overnightProtectedCoveragePct: 100,
                generatorCoveragePct: 84,
                protectedPeakSharePct: 58
            },
            buckets: {
                protected: { count: 4, energySharePct: 62, nighttimeWh: 3600, dailyWh: 17670, topItems: [] },
                assisted: { count: 2, energySharePct: 28, nighttimeWh: 600, dailyWh: 7980, topItems: [] },
                excluded: { count: 1, energySharePct: 10, nighttimeWh: 200, dailyWh: 2850, topItems: [] }
            }
        },
        compliance: {
            status: 'ready',
            tone: 'green',
            statusLabel: 'Install-ready path',
            completionPct: 100,
            pathLabel: 'Hybrid electrical review',
            codeFamily: 'IEC / local utility path',
            authority: 'Qualified installer / electrician',
            reviewBadge: '3/3 core checks closed',
            pathNote: 'Hybrid path is aligned for the selected region subject to final installer sign-off.',
            headline: 'Hybrid compliance path is aligned for the selected region.',
            coreChecks: [
                { label: 'Survey closeout', status: 'pass', detail: 'Closed.' },
                { label: 'Earthing and bonding path', status: 'pass', detail: 'Closed.' },
                { label: 'Utility / authority review', status: 'pass', detail: 'Closed.' }
            ],
            requiredDocuments: ['Single-line diagram', 'Datasheets', 'Survey photos'],
            regionalChecks: [],
            openItems: [],
            notes: [],
            commercialNotes: []
        }
    };
}

const results = buildResults();
const commercial = PVCalculator.calculateCommercialEstimate(results);
results.commercial = commercial;

assert(commercial.finance, 'commercial estimate should include finance summary');
assert(commercial.finance.annualSavings > 0, 'finance summary should model positive annual savings for the reference case');
assert(Number.isFinite(commercial.finance.simplePaybackYears), 'finance summary should model a finite simple payback');
assert(commercial.finance.fiveYearGrossValue > commercial.finance.annualSavings, 'five-year gross value should exceed one-year savings');
assert(commercial.finance.tenYearLifecycleCost > commercial.finance.fiveYearLifecycleCost, '10-year lifecycle allowance should exceed five-year allowance');
assert(Number.isFinite(commercial.finance.tenYearNetAfterLifecycle), 'finance summary should expose lifecycle-adjusted ten-year value');
assert(Number.isFinite(commercial.finance.annualDebtService), 'finance summary should expose annual debt service');
assert(commercial.finance.financedAmount > 0, 'finance summary should expose a financed amount when debt share is set');
assert(commercial.finance.equityContribution > 0, 'finance summary should expose the remaining equity contribution');
assert(commercial.finance.taxBenefitAmount > 0, 'finance summary should expose the modeled tax benefit');
assert(commercial.finance.residualValueAmount > 0, 'finance summary should expose the modeled residual value');
assert(Number.isFinite(commercial.finance.firstYearNetAfterDebt), 'finance summary should expose first-year net after debt');
assert(Number.isFinite(commercial.finance.tenYearNetAfterFinance), 'finance summary should expose finance-adjusted ten-year value');
assert(commercial.finance.scenarioComparison && commercial.finance.scenarioComparison.enabled, 'finance summary should expose a scenario comparison when debt is modeled');
assert(Number.isFinite(commercial.finance.scenarioComparison.cashPurchase.tenYearNet), 'cash purchase scenario should expose a ten-year net view');
assert(Number.isFinite(commercial.finance.scenarioComparison.financedPurchase.tenYearNet), 'financed purchase scenario should expose a ten-year net view');
assert(commercial.options.every(option => option.finance && option.finance.annualSavings > 0), 'every package option should include a finance summary');

const financePanelHtml = PVCalculator.renderCommercialFinancePanel(commercial.finance, {
    compact: true,
    currencyLabel: commercial.inputs.currencyLabel
});
assert(financePanelHtml.includes('Commercial Value Outlook'), 'finance panel should render the commercial value heading');
assert(financePanelHtml.includes('Simple Payback'), 'finance panel should render payback');
assert(financePanelHtml.includes('Lifecycle allowances'), 'finance panel should render lifecycle allowance language');
assert(financePanelHtml.includes('10Y Net After Finance'), 'finance panel should render finance-adjusted value');
assert(financePanelHtml.includes('Capital stack'), 'finance panel should render capital-stack guidance');
assert(financePanelHtml.includes('First-year net after debt'), 'finance panel should render debt-service sensitivity');
assert(financePanelHtml.includes('Scenario comparison'), 'finance panel should render scenario comparison');
assert(financePanelHtml.includes('Cash purchase'), 'finance panel should render the cash purchase scenario');
assert(financePanelHtml.includes('Financed purchase'), 'finance panel should render the financed purchase scenario');

const executiveHtml = PVCalculator.renderExecutiveSummary(results, { hasBlocks: false, blockingIssues: [] }, { score: 89, level: 'High' });
assert(executiveHtml.includes('Commercial Value Outlook'), 'executive summary should include the finance panel');
assert(executiveHtml.includes('generator'), 'executive finance text should preserve the selected generator-energy basis');

const installerCommercialHtml = PVCalculator.renderCommercialSummary(results, false);
assert(installerCommercialHtml.includes('Commercial Value Outlook'), 'installer commercial summary should include the finance panel');
assert(installerCommercialHtml.includes('Annual value'), 'installer commercial summary should include annual value stat');
assert(installerCommercialHtml.includes('Simple payback'), 'installer commercial summary should include payback stat');
assert(installerCommercialHtml.includes('Lifecycle allowances'), 'installer commercial summary should include lifecycle sensitivity');

const overviewHtml = PVCalculator.renderOverviewTab(results);
assert(overviewHtml.includes('Commercial Value Snapshot'), 'overview tab should include the finance snapshot');

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

(async () => {
    PVCalculator.results = results;
    await PVCalculator.exportPDF();
    const pdfText = lastPdf.pages.flatMap(page => page.texts).join('\n');
    assert(pdfText.includes('Commercial Value:'), 'PDF should include commercial value summary metadata');
    assert(pdfText.includes('Commercial Value Outlook'), 'PDF should include the commercial value section');
    assert(pdfText.includes('Simple payback:'), 'PDF should include payback wording');
    assert(pdfText.includes('Lifecycle'), 'PDF should include lifecycle wording');
    assert(pdfText.includes('Scenario comparison:'), 'PDF should include the finance scenario comparison');
    console.log('Finance ROI tests passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
