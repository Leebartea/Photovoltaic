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

const tempFile = '_test_commercial_architecture_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, CommercialArchitectureEngine, LoadEngine, AggregationEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    PVCalculator,
    CommercialArchitectureEngine,
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
    ['audienceMode', 'select', { value: 'installer' }],
    ['location', 'select', { value: 'lagos_ng' }],
    ['inverterMarketOverride', 'select', { value: 'auto' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['businessProfile', 'select', { value: 'filling_station' }],
    ['operatingIntent', 'select', { value: 'hybrid_generator' }],
    ['continuityClass', 'select', { value: 'process_critical' }],
    ['operatingSchedulePreset', 'select', { value: 'business_day' }],
    ['commercialArchitectureMode', 'select', { value: 'auto' }],
    ['generatorSupportMode', 'select', { value: 'none' }],
    ['generatorSizeKVA', 'input', { value: '0' }],
    ['pvFieldLayout', 'select', { value: 'distributed_canopy' }],
    ['mpptGroupingMode', 'select', { value: 'auto' }],
    ['commercialArchitectureHint', 'div', {}],
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
    ['panelTilt', 'select', { value: 'standard' }]
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

assert(addControl('commercialArchitectureMode', 'select').innerHTML.includes('Generator-Assist Hybrid'), 'Architecture options should be populated');
assert(addControl('generatorSupportMode', 'select').innerHTML.includes('Existing Generator Available'), 'Generator support options should be populated');
assert(addControl('generatorSizeKVA', 'input').disabled === true, 'Generator size should be disabled when no generator path is selected');

addControl('generatorSupportMode', 'select').value = 'planned_generator';
PVCalculator.onCommercialArchitectureChange();
assert(addControl('generatorSizeKVA', 'input').disabled === false, 'Generator size should enable when a generator path is selected');

addControl('businessProfile', 'select').value = 'filling_station';
addControl('generatorSupportMode', 'select').value = 'planned_generator';
addControl('generatorSizeKVA', 'input').value = '6';
addControl('pvFieldLayout', 'select').value = 'distributed_canopy';
addControl('mpptGroupingMode', 'select').value = 'auto';
PVCalculator.renderCommercialArchitectureHint();
assert(addControl('commercialArchitectureHint', 'div').innerHTML.includes('Generator-Assist Hybrid'), 'Architecture hint should show the resolved board path');
assert(addControl('commercialArchitectureHint', 'div').innerHTML.includes('Split By PV Field'), 'Architecture hint should show the resolved MPPT grouping');

const config = {
    audienceMode: 'installer',
    location: 'lagos_ng',
    locationProfile: { name: 'Lagos, Nigeria' },
    systemType: 'hybrid',
    businessProfile: 'filling_station',
    operatingIntent: 'hybrid_generator',
    continuityClass: 'process_critical',
    operatingSchedulePreset: 'business_day',
    designMargin: 125,
    phaseType: 'three_phase',
    acVoltage: 400,
    frequency: 50,
    commercialArchitectureMode: 'generator_assist',
    generatorSupportMode: 'planned_generator',
    generatorSizeKVA: 6,
    pvFieldLayout: 'roof_and_ground',
    mpptGroupingMode: 'field_split'
};

const appliances = [
    {
        name: 'Fuel Dispenser Pump A',
        quantity: 1,
        ratedPowerW: 1500,
        loadType: 'motor',
        motorSubType: 'pump_surface',
        efficiency: 0.88,
        powerFactor: 0.85,
        surgeFactor: 3.5,
        dailyUsageHours: 12,
        dutyCycle: 50,
        daytimeRatio: 60,
        isSimultaneous: true,
        phaseAssignment: 'l1',
        loadRole: 'process',
        loadCriticality: 'essential',
        dutyFrequency: 'daily'
    },
    {
        name: 'Fuel Dispenser Pump B',
        quantity: 1,
        ratedPowerW: 1500,
        loadType: 'motor',
        motorSubType: 'pump_surface',
        efficiency: 0.88,
        powerFactor: 0.85,
        surgeFactor: 3.5,
        dailyUsageHours: 12,
        dutyCycle: 50,
        daytimeRatio: 60,
        isSimultaneous: true,
        phaseAssignment: 'l1',
        loadRole: 'process',
        loadCriticality: 'essential',
        dutyFrequency: 'daily'
    },
    {
        name: 'Canopy Lighting',
        quantity: 1,
        ratedPowerW: 800,
        loadType: 'electronic',
        efficiency: 1,
        powerFactor: 0.95,
        surgeFactor: 1,
        dailyUsageHours: 12,
        dutyCycle: 100,
        daytimeRatio: 30,
        isSimultaneous: true,
        phaseAssignment: 'l2',
        loadRole: 'base',
        loadCriticality: 'essential',
        dutyFrequency: 'daily'
    },
    {
        name: 'POS and Controls',
        quantity: 1,
        ratedPowerW: 400,
        loadType: 'electronic',
        efficiency: 1,
        powerFactor: 0.95,
        surgeFactor: 1,
        dailyUsageHours: 24,
        dutyCycle: 100,
        daytimeRatio: 50,
        isSimultaneous: true,
        phaseAssignment: 'l3',
        loadRole: 'base',
        loadCriticality: 'critical',
        dutyFrequency: 'continuous'
    },
    {
        name: 'Borehole Pump',
        quantity: 1,
        ratedPowerW: 2200,
        loadType: 'motor',
        motorSubType: 'pump_deepwell',
        efficiency: 0.82,
        powerFactor: 0.8,
        surgeFactor: 6,
        dailyUsageHours: 2,
        dutyCycle: 50,
        daytimeRatio: 90,
        isSimultaneous: false,
        phaseAssignment: 'l1',
        loadRole: 'operator_peak',
        loadCriticality: 'deferrable',
        dutyFrequency: 'daily'
    }
];

const aggregation = AggregationEngine.calculate(appliances, config);
const inverter = {
    recommendedSizeVA: 40000,
    continuousVARequired: aggregation.designContinuousVA,
    surgeVARequired: aggregation.designSurgeVA,
    dcBusVoltage: 48,
    dcInputCurrentContinuous: 230,
    dcInputCurrentSurge: 360,
    clusterPlan: {
        enabled: true,
        topologyLabel: '2 / 1 / 1',
        statusLabel: 'Review',
        phaseCounts: { l1: 2, l2: 1, l3: 1 },
        totalModuleCount: 4,
        moduleRatedVA: 10000,
        totalClusterVA: 40000,
        worstHeadroomPct: 8,
        worstPhaseLabel: 'L1'
    }
};
const battery = {
    chemistry: 'lifepo4',
    chemistryName: 'LiFePO4',
    usableCapacityWh: 16384,
    totalCapacityAh: 400,
    totalCapacityWh: 20480,
    bankVoltage: 51.2,
    cellsInSeries: 16,
    stringsInParallel: 2,
    totalCells: 32,
    recommendedAhPerCell: 200,
    maxDischargeCurrent: 220,
    maxChargeCurrent: 180,
    isManualOverride: false,
    isLithium: true
};
const pvArray = {
    panelsInSeries: 10,
    stringsInParallel: 5,
    totalPanels: 50,
    arrayWattage: 30000,
    stringVmp: 410,
    stringVoc: 490,
    stringVocCold: 530,
    arrayImp: 67,
    arrayIsc: 70,
    deratedOutput: 25500,
    dailyEnergyWh: 110000
};
const mppt = {
    maxVoltage: 500,
    minVoltage: 120,
    maxOperatingVoltage: 450,
    maxCurrent: 60,
    maxPower: 15000,
    maxChargeCurrent: 180,
    totalMaxChargeCurrent: 180,
    inputCount: 1
};
const multiMPPTResult = {
    recommended: 0,
    distributions: [
        {
            mpptAssignments: [
                { unused: false, panelCount: 50 }
            ]
        }
    ]
};

const architecture = CommercialArchitectureEngine.calculate(
    appliances,
    aggregation,
    inverter,
    battery,
    pvArray,
    mppt,
    config,
    multiMPPTResult
);

assert(architecture.status === 'fail', 'Architecture should fail when battery throughput and PV grouping are unrealistic');
assert(architecture.boardStrategy.resolvedKey === 'generator_assist', 'Architecture should preserve the generator-assist board strategy');
assert(architecture.batteryThroughput.status === 'fail', 'Battery throughput should fail in the stressed commercial scenario');
assert(architecture.generatorSupport.status === 'fail', 'Undersized generator should fail the commercial topology check');
assert(architecture.mpptGrouping.status === 'fail', 'Insufficient MPPT separation should fail for roof-and-ground layouts');

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
PVCalculator.getBatteryUnitVoltage = function() {
    return 51.2;
};
PVCalculator.getBatteryUnitAh = function() {
    return 200;
};
PVCalculator.renderEquipmentReferencePanel = function() {
    return '';
};
PVCalculator.renderCompliancePanel = function() {
    return '<div>Compliance Snapshot</div>';
};
PVCalculator.results = {
    config,
    architecture,
    aggregation,
    battery
};

const loadHtml = PVCalculator.renderLoadTab(aggregation);
assert(loadHtml.includes('Commercial Architecture Snapshot'), 'Load tab should surface the commercial architecture snapshot');
assert(loadHtml.includes('Generator-assist path'), 'Load tab snapshot should include the generator topology gate');

const batteryHtml = PVCalculator.renderBatteryTab(battery);
assert(batteryHtml.includes('Shared battery throughput'), 'Battery tab should render the throughput architecture warning');
assert(batteryHtml.includes('Stress Index'), 'Battery tab should render the throughput stress metrics');

PVCalculator.renderThreePhaseClusterPanel = function() {
    return '<div>Cluster Snapshot</div>';
};

const overviewHtml = PVCalculator.renderOverviewTab({
    config,
    aggregation,
    inverter,
    battery,
    pvArray,
    cables: {
        dcRuns: [
            { name: 'PV to MPPT', marketMm2: 16 },
            { name: 'Battery to Inverter', marketMm2: 70 }
        ],
        acRuns: [
            { marketMm2: 25 }
        ]
    },
    protection: {
        pvSide: [{ name: 'DC Isolator', rating: '80A' }],
        batterySide: [{ name: 'Battery MCCB', rating: '250A' }],
        acSide: [{ name: 'AC MCB', rating: '63A' }]
    },
    losses: {},
    compliance: {},
    architecture
});
assert(overviewHtml.includes('Commercial Architecture Snapshot'), 'Overview tab should surface the commercial architecture snapshot');

console.log('Commercial architecture checks passed');
