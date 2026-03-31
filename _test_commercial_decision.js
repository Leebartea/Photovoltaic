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
        if (selector === '#tab-overview svg') return null;
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

const tempFile = '_test_commercial_decision_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, CommercialDecisionEngine, OutputGenerator, LoadEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    DEFAULTS,
    PVCalculator,
    CommercialDecisionEngine,
    OutputGenerator,
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
    ['manualMode', 'input', { checked: false, disabled: false }],
    ['pdfIncludeDetails', 'input', { checked: true }],
    ['proposalCompanyName', 'input', { value: 'Leebartea Energy Systems' }],
    ['proposalContactName', 'input', { value: 'Tunde Adebayo' }],
    ['proposalContactPhone', 'input', { value: '+2348000000000' }],
    ['proposalContactEmail', 'input', { value: 'sales@leebartea.example' }],
    ['proposalClientName', 'input', { value: 'Demo Client' }],
    ['proposalSiteName', 'input', { value: 'Demo Commercial Site' }],
    ['proposalQuoteReference', 'input', { value: 'COM-001' }],
    ['proposalIssueDate', 'input', { value: '2026-03-11' }],
    ['surveyStage', 'select', { value: 'onsite_complete' }],
    ['surveyMountingType', 'select', { value: 'roof' }],
    ['surveyShadingProfile', 'select', { value: 'clear' }],
    ['surveyCableRoute', 'select', { value: 'simple' }],
    ['surveyAccess', 'select', { value: 'standard' }],
    ['surveyNotes', 'textarea', { value: 'Commercial walkthrough completed.' }],
    ['surveyStructureConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyCableRouteConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyEarthingConfirmed', 'input', { type: 'checkbox', checked: true }],
    ['surveyExclusionsReviewed', 'input', { type: 'checkbox', checked: true }],
    ['surveyBudgetAligned', 'input', { type: 'checkbox', checked: true }],
    ['surveyUtilityReviewed', 'input', { type: 'checkbox', checked: true }],
    ['quoteCurrencyLabel', 'input', { value: 'USD' }],
    ['pricingProfile', 'select', { value: 'standard' }],
    ['supplierPricePack', 'select', { value: 'west_africa_import' }],
    ['supplierPackPreview', 'div', {}],
    ['supplierPvPerWp', 'input', { value: '' }],
    ['supplierInverterPerVA', 'input', { value: '' }],
    ['supplierBatteryPerKWh', 'input', { value: '' }],
    ['supplierMpptPerW', 'input', { value: '' }],
    ['supplierMountingPerWp', 'input', { value: '' }],
    ['supplierProtectionPerWp', 'input', { value: '' }],
    ['supplierCablePerKg', 'input', { value: '' }],
    ['supplierMonitoringFlat', 'input', { value: '' }],
    ['regionalPriceFactor', 'input', { value: '1.04' }],
    ['laborPct', 'input', { value: '18' }],
    ['softCostPct', 'input', { value: '8' }],
    ['proposalMarginPct', 'input', { value: '12' }],
    ['proposalTaxPct', 'input', { value: '0' }],
    ['proposalDepositPct', 'input', { value: '60' }],
    ['proposalValidityDays', 'input', { value: '14' }],
    ['proposalInstallWindowDays', 'input', { value: '7' }],
    ['proposalIncludedScope', 'textarea', { value: 'Supply and installation of the recommended PV system.\nCommissioning, labeling, and operator handover.' }],
    ['proposalExclusions', 'textarea', { value: 'Major civil works and utility fees.\nBrand upgrades not yet locked into the quote.' }],
    ['proposalNextSteps', 'textarea', { value: 'Confirm final machine list.\nLock supplier quotes and site logistics.' }],
    ['location', 'select', { value: 'lagos_ng' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['batteryChemistry', 'select', { value: 'lifepo4' }],
    ['expertMode', 'input', { checked: false }]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

PVCalculator.saveToLocalStorageAuto = function() {};
PVCalculator.renderEquipmentReferencePanel = function() { return ''; };
PVCalculator.renderCompliancePanel = function() { return '<div>Regional Compliance Path</div>'; };
PVCalculator.renderThreePhaseBalancePanel = function() { return '<div>3-Phase Allocation Snapshot</div>'; };
PVCalculator.renderThreePhaseClusterPanel = function() { return '<div>3-Phase Cluster Snapshot</div>'; };
PVCalculator.getPanel = function() {
    return {
        wattage: 550,
        vmp: 41,
        voc: 49,
        imp: 13.41,
        isc: 14,
        tempCoeffPmax: -0.35
    };
};
PVCalculator.getMPPT = function() {
    return {
        maxVoltage: 500,
        minVoltage: 120,
        maxOperatingVoltage: 450,
        maxCurrent: 60,
        maxPower: 18000,
        maxChargeCurrent: 250,
        totalMaxPower: 18000,
        inputCount: 3
    };
};
PVCalculator.getBatteryUnitVoltage = function() { return 51.2; };
PVCalculator.getBatteryUnitAh = function() { return 200; };

LoadEngine.appliances = [
    { name: 'Mixer Motor', loadType: 'motor', ratedPowerW: 2200, quantity: 1, surgeFactor: 3.5 },
    { name: 'Compressor', loadType: 'motor', ratedPowerW: 1800, quantity: 1, surgeFactor: 6 }
];

function makeBusinessContext({
    profileKey,
    operatingIntentKey,
    continuityKey,
    scheduleKey,
    phaseType,
    systemType,
    phaseFitStatus = 'pass',
    phaseFitDetail = 'Topology fits the current machine list.',
    phaseFitOpenItem = '',
    phaseFitRisk = '',
    phaseFitPenalty = 0,
    systemFitStatus = 'pass',
    systemFitDetail = 'Operating intent fits the current electrical path.',
    systemFitOpenItem = '',
    systemFitRisk = '',
    systemFitPenalty = 0
}) {
    const profile = DEFAULTS.BUSINESS_PROFILES[profileKey];
    const operatingIntent = DEFAULTS.BUSINESS_OPERATING_INTENTS[operatingIntentKey];
    const continuityClass = DEFAULTS.BUSINESS_CONTINUITY_CLASSES[continuityKey];
    const operatingSchedule = DEFAULTS.OPERATING_SCHEDULES[scheduleKey];
    const systemTypeLabel = { off_grid: 'off-grid', hybrid: 'hybrid', grid_tie: 'grid-tie' }[systemType] || systemType;
    const phaseLabel = { single: 'single-phase', split: 'split-phase', three_phase: '3-phase' }[phaseType] || phaseType;
    return {
        profileKey,
        operatingIntentKey,
        continuityKey,
        operatingScheduleKey: scheduleKey,
        profile,
        operatingIntent,
        continuityClass,
        operatingSchedule,
        phaseType,
        phaseLabel,
        systemType,
        systemTypeLabel,
        preferredSystemTypes: operatingIntent.preferredSystemTypes || [],
        preferredSystemLabel: (operatingIntent.preferredSystemTypes || []).join(' / '),
        phaseFit: {
            status: phaseFitStatus,
            penalty: phaseFitPenalty,
            detail: phaseFitDetail,
            openItem: phaseFitOpenItem,
            risk: phaseFitRisk
        },
        systemFit: {
            status: systemFitStatus,
            penalty: systemFitPenalty,
            detail: systemFitDetail,
            openItem: systemFitOpenItem,
            risk: systemFitRisk
        },
        recommendedIntentMatches: operatingIntentKey === profile.recommendedIntent,
        recommendedContinuityMatches: continuityKey === profile.recommendedContinuity,
        recommendedScheduleMatches: scheduleKey === profile.recommendedSchedule,
        identityLine: `${profile.label} · ${operatingIntent.label} · ${continuityClass.label}`
    };
}

function makeOperationalProfile({
    overnightCriticalWh,
    overnightEssentialWh,
    totalProcessWh,
    daytimeProcessWh,
    deferrableWh,
    daytimeShiftableWh,
    preservationWh,
    dailyWh
}) {
    return {
        overnightCriticalWh,
        overnightEssentialWh,
        totalProcessWh,
        daytimeProcessWh,
        deferrableWh,
        daytimeShiftableWh,
        preservationWh,
        energyByRoleWh: {
            base: Math.max(0, dailyWh - totalProcessWh - deferrableWh),
            process: totalProcessWh,
            refrigeration: preservationWh,
            operator_peak: Math.round(totalProcessWh * 0.2),
            discretionary: deferrableWh
        },
        energyByCriticalityWh: {
            critical: overnightCriticalWh + preservationWh,
            essential: overnightEssentialWh + Math.max(0, totalProcessWh - preservationWh),
            deferrable: deferrableWh
        }
    };
}

function baseResults() {
    return {
        config: {
            audienceMode: 'installer',
            location: 'lagos_ng',
            locationProfile: { name: 'Lagos, Nigeria' },
            systemType: 'hybrid',
            phaseType: 'single',
            acVoltage: 230,
            frequency: 50,
            avgPSH: 4.8,
            autonomyDays: 1,
            ambientTempMin: 22,
            ambientTempMax: 34,
            designMargin: 125,
            inverterMarket: 'EMERGING_OFFGRID',
            inverterSurgeMultiplier: 2.0,
            panelOrientation: 'south',
            panelTilt: 'optimal',
            orientationFactor: 1,
            tiltFactor: 1
        },
        aggregation: {
            dailyEnergyWh: 10000,
            peakSimultaneousVA: 4200,
            phaseAllocation: null
        },
        inverter: {
            recommendedSizeVA: 5000,
            continuousVARequired: 4200,
            surgeVARequired: 7200,
            dcBusVoltage: 48,
            dcInputCurrentContinuous: 90,
            dcInputCurrentSurge: 150
        },
        battery: {
            chemistry: 'lifepo4',
            chemistryName: 'LiFePO4',
            usableCapacityWh: 8000,
            totalCapacityAh: 280,
            totalCapacityWh: 14336,
            bankVoltage: 51.2,
            cellsInSeries: 1,
            stringsInParallel: 1,
            totalCells: 1,
            recommendedAhPerCell: 280,
            maxDischargeCurrent: 220,
            maxChargeCurrent: 140,
            isLithium: true
        },
        pvArray: {
            panelsInSeries: 5,
            stringsInParallel: 4,
            totalPanels: 20,
            arrayWattage: 11000,
            stringVmp: 205,
            stringVoc: 245,
            stringVocCold: 262,
            arrayImp: 53.6,
            arrayIsc: 56,
            deratedOutput: 9300,
            dailyEnergyWh: 13000
        },
        cables: {
            dcRuns: [
                { name: 'PV to MPPT', marketMm2: 16 },
                { name: 'Battery to Inverter', marketMm2: 50 }
            ],
            acRuns: [
                { marketMm2: 10 }
            ],
            warnings: [],
            blocks: [],
            suggestions: []
        },
        protection: {
            pvSide: [{ name: 'DC Isolator', rating: '80A' }],
            batterySide: [{ name: 'Battery MCCB', rating: '250A' }],
            acSide: [{ name: 'AC MCB', rating: '40A' }],
            warnings: []
        },
        mpptValidation: {
            warnings: [],
            blocks: [],
            suggestions: []
        },
        losses: {
            overallSystemEfficiency: 81
        },
        compliance: {
            status: 'ready',
            statusLabel: 'Ready',
            completionPct: 100,
            pathLabel: 'Off-grid electrical path',
            pathNote: 'Ready for installer review.',
            tone: 'green',
            codeFamily: 'IEC / local utility advisory',
            authority: 'Installer / AHJ review',
            openItems: [],
            regionalChecks: [],
            notes: []
        },
        advisories: []
    };
}

function buildSolarBridgeResults() {
    const results = baseResults();
    const dailyWh = 12000;
    results.config.systemType = 'hybrid';
    results.config.phaseType = 'single';
    results.config.operatingIntent = 'daytime_solar_first';
    results.config.continuityClass = 'business_critical';
    results.config.operatingSchedulePreset = 'business_day';
    results.config.businessProfile = 'tailoring_studio';
    results.config.businessContext = makeBusinessContext({
        profileKey: 'tailoring_studio',
        operatingIntentKey: 'daytime_solar_first',
        continuityKey: 'business_critical',
        scheduleKey: 'business_day',
        phaseType: 'single',
        systemType: 'hybrid',
        phaseFitDetail: 'Tailoring studios normally stay single-phase, and the current layout fits that machine list.',
        systemFitDetail: 'Daytime solar-first fits the current hybrid path cleanly.'
    });
    results.aggregation = {
        dailyEnergyWh: dailyWh,
        peakSimultaneousVA: 3600,
        operationalProfile: makeOperationalProfile({
            overnightCriticalWh: 700,
            overnightEssentialWh: 500,
            totalProcessWh: 7600,
            daytimeProcessWh: 6800,
            deferrableWh: 2600,
            daytimeShiftableWh: 2200,
            preservationWh: 0,
            dailyWh
        })
    };
    results.battery.usableCapacityWh = 6000;
    results.pvArray.dailyEnergyWh = 15000;
    results.architecture = {
        status: 'pass',
        summary: 'Full-board solar-first support is credible for the current site scope.',
        warnings: [],
        suggestions: ['Keep ironing and pressing loads inside solar hours.'],
        boardStrategy: {
            resolvedKey: 'full_site_board',
            protectedPeakSharePct: 100,
            protectedPeakVA: 3600,
            protectedDailyWh: dailyWh,
            protectedEnergySharePct: 100,
            deferrablePeakVA: 900,
            deferrableDailyWh: 2600,
            deferrableEnergySharePct: 22,
            detail: 'Full-site board support is still reasonable for this lighter production site.',
            definition: { label: 'Full Site Board' },
            status: 'pass'
        },
        batteryThroughput: {
            status: 'pass',
            detail: 'Battery throughput is comfortable for daytime bridging duty.',
            continuousUtilizationPct: 55,
            cRateStressIndex: 36
        },
        generatorSupport: {
            key: 'none',
            status: 'pass',
            detail: 'No generator dependency is required in the modeled operating posture.',
            definition: { label: 'No Generator Path' },
            coveragePct: 0
        },
        mpptGrouping: {
            status: 'pass',
            detail: 'Single-field PV grouping matches the current roof plan.',
            definition: { label: 'Grouped Single Field' },
            fieldLayout: { label: 'Single Roof / Single Field' }
        }
    };
    return results;
}

function buildHybridGeneratorResults() {
    const results = baseResults();
    const dailyWh = 36000;
    results.config.systemType = 'hybrid';
    results.config.phaseType = 'three_phase';
    results.config.acVoltage = 400;
    results.config.operatingIntent = 'hybrid_generator';
    results.config.continuityClass = 'process_critical';
    results.config.operatingSchedulePreset = 'extended_business_day';
    results.config.businessProfile = 'filling_station';
    results.config.businessContext = makeBusinessContext({
        profileKey: 'filling_station',
        operatingIntentKey: 'hybrid_generator',
        continuityKey: 'process_critical',
        scheduleKey: 'extended_business_day',
        phaseType: 'three_phase',
        systemType: 'hybrid',
        phaseFitDetail: 'Three-phase review is justified and the current site is already on a 3-phase path.',
        systemFitDetail: 'Generator-assisted hybrid operation fits the present operating story.'
    });
    results.aggregation = {
        dailyEnergyWh: dailyWh,
        peakSimultaneousVA: 26500,
        phaseAllocation: {
            imbalancePct: 18,
            limitingPhase: 'L1',
            limitingPhasePeakVA: 11800,
            phaseVoltage: 230,
            classificationLabel: 'Moderate',
            phases: [
                { label: 'L1', peakSimultaneousVA: 11800, currentA: 51.3, topLoads: ['Pump Bank', 'Booster Controls'] },
                { label: 'L2', peakSimultaneousVA: 8200, currentA: 35.7, topLoads: ['Canopy Lighting', 'POS'] },
                { label: 'L3', peakSimultaneousVA: 6500, currentA: 28.3, topLoads: ['Office AC', 'Control Room'] }
            ],
            neutralCurrentA: 12,
            equalLegClusterFloorVA: 12000
        },
        operationalProfile: makeOperationalProfile({
            overnightCriticalWh: 5200,
            overnightEssentialWh: 3600,
            totalProcessWh: 21000,
            daytimeProcessWh: 9200,
            deferrableWh: 3400,
            daytimeShiftableWh: 1400,
            preservationWh: 3800,
            dailyWh
        })
    };
    results.inverter = {
        recommendedSizeVA: 40000,
        continuousVARequired: 30000,
        surgeVARequired: 48000,
        dcBusVoltage: 48,
        dcInputCurrentContinuous: 260,
        dcInputCurrentSurge: 420,
        clusterPlan: {
            enabled: true,
            topologyLabel: '2 / 1 / 1',
            phaseDistributionLabel: 'L1 2 / L2 1 / L3 1',
            statusLabel: 'Review',
            phaseCounts: { l1: 2, l2: 1, l3: 1 },
            totalModuleCount: 4,
            moduleRatedVA: 10000,
            worstHeadroomPct: 8,
            worstPhaseLabel: 'L1',
            status: 'tight'
        }
    };
    results.battery.usableCapacityWh = 12000;
    results.battery.maxDischargeCurrent = 180;
    results.pvArray.dailyEnergyWh = 30500;
    results.pvArray.totalPanels = 60;
    results.pvArray.arrayWattage = 33000;
    results.architecture = {
        status: 'warn',
        summary: 'The site is workable as a generator-assisted commercial hybrid, but the assisted path still needs explicit sizing discipline.',
        warnings: ['Generator coverage is lean for the protected process path.'],
        suggestions: ['Capture the real generator duty and transfer logic before final sign-off.'],
        boardStrategy: {
            resolvedKey: 'generator_assist',
            protectedPeakSharePct: 82,
            protectedPeakVA: 21800,
            protectedDailyWh: 29800,
            protectedEnergySharePct: 83,
            deferrablePeakVA: 4700,
            deferrableDailyWh: 6200,
            deferrableEnergySharePct: 17,
            detail: 'Generator-assist board strategy keeps core pumps and controls protected while discretionary loads can drop out.',
            definition: { label: 'Generator-Assist Hybrid' },
            status: 'pass'
        },
        batteryThroughput: {
            status: 'fail',
            detail: 'Battery current duty is overloaded for a full battery-dominant site story.',
            continuousUtilizationPct: 118,
            cRateStressIndex: 142
        },
        generatorSupport: {
            key: 'planned_generator',
            status: 'warn',
            detail: 'The generator path exists, but the captured size only partly covers the protected process board.',
            definition: { label: 'Planned Generator Support' },
            coveragePct: 68
        },
        mpptGrouping: {
            status: 'pass',
            detail: 'PV field grouping is acceptable for the current canopy and roof split.',
            definition: { label: 'Split By PV Field' },
            fieldLayout: { label: 'Distributed Canopy' }
        }
    };
    return results;
}

function buildEssentialBackupResults() {
    const results = baseResults();
    const dailyWh = 18000;
    results.config.systemType = 'hybrid';
    results.config.phaseType = 'single';
    results.config.operatingIntent = 'backup_only';
    results.config.continuityClass = 'business_critical';
    results.config.operatingSchedulePreset = 'extended_business_day';
    results.config.businessProfile = 'retail_shop';
    results.config.businessContext = makeBusinessContext({
        profileKey: 'retail_shop',
        operatingIntentKey: 'backup_only',
        continuityKey: 'business_critical',
        scheduleKey: 'extended_business_day',
        phaseType: 'single',
        systemType: 'hybrid',
        phaseFitDetail: 'Single-phase remains the right topology for the current protected retail board.',
        systemFitDetail: 'Backup-only resilience fits the current hybrid path.'
    });
    results.aggregation = {
        dailyEnergyWh: dailyWh,
        peakSimultaneousVA: 7200,
        operationalProfile: makeOperationalProfile({
            overnightCriticalWh: 2600,
            overnightEssentialWh: 2000,
            totalProcessWh: 8000,
            daytimeProcessWh: 4300,
            deferrableWh: 5200,
            daytimeShiftableWh: 3400,
            preservationWh: 1200,
            dailyWh
        })
    };
    results.battery.usableCapacityWh = 4500;
    results.pvArray.dailyEnergyWh = 9800;
    results.architecture = {
        status: 'warn',
        summary: 'Selective protected-board backup is the more honest site posture because full-board continuity is too aggressive.',
        warnings: ['Battery throughput is tight for full-board claims.'],
        suggestions: ['Keep refrigeration, POS, and lighting on the protected board only.'],
        boardStrategy: {
            resolvedKey: 'essential_subboard',
            protectedPeakSharePct: 55,
            protectedPeakVA: 3900,
            protectedDailyWh: 10100,
            protectedEnergySharePct: 56,
            deferrablePeakVA: 3300,
            deferrableDailyWh: 7900,
            deferrableEnergySharePct: 44,
            detail: 'Protected-board coverage is already selective enough to support an essential-loads-only story.',
            definition: { label: 'Essential-Load Sub-Board' },
            status: 'pass'
        },
        batteryThroughput: {
            status: 'warn',
            detail: 'Battery duty is acceptable for protected circuits but tight for whole-site claims.',
            continuousUtilizationPct: 86,
            cRateStressIndex: 91
        },
        generatorSupport: {
            key: 'none',
            status: 'pass',
            detail: 'No generator path is required for the selective protected-board posture.',
            definition: { label: 'No Generator Path' },
            coveragePct: 0
        },
        mpptGrouping: {
            status: 'pass',
            detail: 'Single-roof PV grouping is adequate.',
            definition: { label: 'Grouped Single Field' },
            fieldLayout: { label: 'Single Roof / Single Field' }
        }
    };
    return results;
}

const solarBridgeResults = buildSolarBridgeResults();
const solarBridgeDecision = CommercialDecisionEngine.evaluate(solarBridgeResults);
assert(solarBridgeDecision.key === 'solar_dominant_daytime_bridge', 'Tailoring solar-first scenario should recommend daytime solar bridge');
assert(solarBridgeDecision.score >= 75, 'Tailoring solar-first scenario should score strongly');

const hybridGeneratorResults = buildHybridGeneratorResults();
const hybridGeneratorDecision = CommercialDecisionEngine.evaluate(hybridGeneratorResults);
assert(hybridGeneratorDecision.key === 'hybrid_generator_assist', 'Filling-station scenario should recommend generator-assisted hybrid');
assert(hybridGeneratorDecision.reasons.some(item => item.includes('generator')), 'Generator-assisted scenario should explain the generator rationale');

const essentialBackupResults = buildEssentialBackupResults();
const essentialBackupDecision = CommercialDecisionEngine.evaluate(essentialBackupResults);
assert(essentialBackupDecision.key === 'essential_load_only_backup', 'Selective-board backup scenario should recommend essential-load-only backup');
assert(essentialBackupDecision.score >= 70, 'Essential backup scenario should have a viable fit score');

hybridGeneratorResults.decisionStrategy = hybridGeneratorDecision;
const executiveHtml = PVCalculator.renderExecutiveSummary(
    hybridGeneratorResults,
    { hasBlocks: false },
    { score: 78, level: 'Moderate' }
);
assert(executiveHtml.includes('Commercial Strategy Recommendation'), 'Executive summary should render the commercial strategy panel');
assert(executiveHtml.includes('Hybrid With Generator Support'), 'Executive summary should include the recommended strategy label');

const commercialHtml = PVCalculator.renderCommercialSummary(hybridGeneratorResults, false);
assert(commercialHtml.includes('Commercial Strategy Recommendation'), 'Commercial summary should render the strategy panel');
assert(commercialHtml.includes('Recommended strategy:'), 'Commercial summary should call out the recommended strategy in the readiness panel');
assert(commercialHtml.includes('Hybrid With Generator Support'), 'Commercial summary should include the strategy label');

const overviewHtml = PVCalculator.renderOverviewTab(hybridGeneratorResults);
assert(overviewHtml.includes('Commercial Strategy Snapshot'), 'Overview tab should surface the commercial strategy snapshot');
assert(overviewHtml.includes('Hybrid With Generator Support'), 'Overview strategy snapshot should include the strategy label');

const mismatchResults = buildEssentialBackupResults();
mismatchResults.config.operatingIntent = 'full_offgrid';
mismatchResults.config.businessContext = makeBusinessContext({
    profileKey: 'retail_shop',
    operatingIntentKey: 'full_offgrid',
    continuityKey: 'business_critical',
    scheduleKey: 'extended_business_day',
    phaseType: 'single',
    systemType: 'hybrid',
    systemFitStatus: 'warn',
    systemFitPenalty: 6,
    systemFitDetail: 'Full off-grid operation is more aggressive than the current hybrid retail path.',
    systemFitOpenItem: 'Reconfirm whether this site should be sold as full off-grid or as selective backup.'
});
mismatchResults.decisionStrategy = CommercialDecisionEngine.evaluate(mismatchResults);
const warnings = OutputGenerator.collectAllWarnings(mismatchResults);
assert(warnings.some(item => item.includes('Current intent')), 'Decision-engine warnings should be merged into the output warning stream');

console.log('Commercial decision checks passed');
