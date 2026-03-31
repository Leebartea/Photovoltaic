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

const tempFile = '_test_benchmark_projects_temp.js';
fs.writeFileSync(
    tempFile,
    `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, AggregationEngine, InverterSizingEngine, BatterySizingEngine, PVArrayEngine, ChargeControllerValidator, CommercialArchitectureEngine, CommercialDecisionEngine, MultiMPPTDistributor, __elements, __ensureElement, window, document, localStorage };`
);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
    DEFAULTS,
    PVCalculator,
    AggregationEngine,
    InverterSizingEngine,
    BatterySizingEngine,
    PVArrayEngine,
    ChargeControllerValidator,
    CommercialArchitectureEngine,
    CommercialDecisionEngine,
    MultiMPPTDistributor
} = mod;

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function buildBenchmarkConfig(benchmark) {
    const template = DEFAULTS.PROJECT_TEMPLATES[benchmark.templateKey];
    assert(template, `Missing template ${benchmark.templateKey}`);
    const locationProfile = DEFAULTS.REGION_PROFILES[benchmark.locationKey] || DEFAULTS.REGION_PROFILES.generic;
    const businessProfile = template.businessProfile || 'custom_mixed_site';
    const operatingIntent = template.operatingIntent || 'backup_only';
    const continuityClass = template.continuityClass || 'business_critical';
    const operatingSchedulePreset = template.operatingSchedulePreset || 'business_day';
    const architectureDefaults = PVCalculator.getCommercialArchitectureProfileDefaults(businessProfile, operatingIntent);
    const phaseType = template.phaseType || locationProfile.phaseType || 'single';
    const config = {
        location: benchmark.locationKey,
        locationProfile,
        systemType: template.systemType || 'off_grid',
        audienceMode: template.audienceMode || 'installer',
        businessProfile,
        businessProfileDefinition: PVCalculator.getBusinessProfileDefinition(businessProfile),
        operatingIntent,
        operatingIntentDefinition: PVCalculator.getBusinessOperatingIntentDefinition(operatingIntent),
        continuityClass,
        continuityClassDefinition: PVCalculator.getBusinessContinuityClassDefinition(continuityClass),
        operatingSchedulePreset,
        operatingScheduleDefinition: PVCalculator.getOperatingScheduleDefinition(operatingSchedulePreset),
        commercialArchitectureMode: template.commercialArchitectureMode || architectureDefaults.boardStrategy,
        generatorSupportMode: template.generatorSupportMode || architectureDefaults.generatorSupportMode || 'none',
        generatorSizeKVA: Number(template.generatorSizeKVA) || 0,
        pvFieldLayout: template.pvFieldLayout || architectureDefaults.pvFieldLayout || 'single_field',
        mpptGroupingMode: template.mpptGroupingMode || architectureDefaults.mpptGrouping || 'auto',
        phaseType,
        acVoltage: phaseType === 'three_phase' ? 400 : Number(template.acVoltage) || Number(locationProfile.acVoltage) || 230,
        frequency: Number(locationProfile.frequency) || 50,
        avgPSH: Number(template.avgPSH) || Number(locationProfile.avgPSH) || 4.5,
        autonomyDays: Number(template.autonomyDays) || 1,
        ambientTempMin: Number(template.ambientTempMin) || Number(locationProfile.ambientTempMin) || 20,
        ambientTempMax: Number(template.ambientTempMax) || Number(locationProfile.ambientTempMax) || 35,
        climate: locationProfile.climate || 'mixed',
        inverterMarket: locationProfile.inverterMarket || 'EMERGING_OFFGRID',
        batteryChemistry: template.batteryChemistry || 'lifepo4',
        designMargin: 125,
        inverterSurgeMultiplier: 2.0,
        manualMode: false,
        inverterCluster: phaseType === 'three_phase'
            ? {
                enabled: true,
                distributionMode: 'auto',
                moduleVA: 0,
                moduleCount: 0,
                manualPhaseCounts: { l1: 0, l2: 0, l3: 0 },
                manualFallbackVA: 0
            }
            : { enabled: false }
    };
    config.businessContext = PVCalculator.getBusinessContextSummary(config);
    return { template, config };
}

function buildPanel() {
    const wattage = 550;
    return {
        wattage,
        ...DEFAULTS.PANEL_PRESETS[wattage]
    };
}

function buildMppt(config) {
    const count = config.pvFieldLayout === 'distributed_canopy'
        ? 3
        : ['dual_roof', 'roof_and_ground', 'mixed_orientation'].includes(config.pvFieldLayout)
            ? 2
            : 1;
    const allMPPTs = Array.from({ length: count }, (_, index) => ({
        maxVoltage: 500,
        minVoltage: 95,
        maxOperatingVoltage: 450,
        maxCurrent: 220,
        maxPower: 50000,
        maxChargeCurrent: 800,
        label: `MPPT ${index + 1}`
    }));
    const primary = {
        ...allMPPTs[0],
        inputCount: count,
        allMPPTs
    };
    primary.totalMaxPower = allMPPTs.reduce((sum, item) => sum + item.maxPower, 0);
    primary.totalMaxCurrent = allMPPTs.reduce((sum, item) => sum + item.maxCurrent, 0);
    primary.totalMaxChargeCurrent = allMPPTs.reduce((sum, item) => sum + item.maxChargeCurrent, 0);
    return primary;
}

Object.entries(DEFAULTS.BENCHMARK_PROJECTS).forEach(([benchmarkKey, benchmark]) => {
    const { template, config } = buildBenchmarkConfig(benchmark);
    const appliances = clone(template.appliances || []);
    const panel = buildPanel();
    const mppt = buildMppt(config);
    const aggregation = AggregationEngine.calculate(appliances, config);
    const inverter = InverterSizingEngine.calculate(aggregation, config);
    const battery = BatterySizingEngine.calculate(aggregation, inverter, config, config.batteryChemistry);
    const pvArray = PVArrayEngine.calculate(aggregation, battery, config, panel, mppt);
    const mpptValidation = ChargeControllerValidator.validate(pvArray, mppt);
    const multiMPPTResult = MultiMPPTDistributor.distribute(pvArray.totalPanels, panel, mppt, config);
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
    const decision = CommercialDecisionEngine.evaluate({
        config,
        aggregation,
        inverter,
        battery,
        pvArray,
        architecture
    });
    const supportSummary = PVCalculator.getCommercialSupportSummary({
        config,
        aggregation,
        battery,
        architecture,
        decisionStrategy: decision,
        appliances
    });
    const benchmarkClass = benchmark.benchmarkClass || 'acceptance';

    assert(config.phaseType === benchmark.expectedPhaseType, `${benchmarkKey}: expected phase ${benchmark.expectedPhaseType}, got ${config.phaseType}`);
    assert(decision.key === benchmark.expectedStrategyKey, `${benchmarkKey}: expected strategy ${benchmark.expectedStrategyKey}, got ${decision.key}`);
    assert(architecture.boardStrategy.resolvedKey === benchmark.expectedBoardStrategyKey, `${benchmarkKey}: expected board ${benchmark.expectedBoardStrategyKey}, got ${architecture.boardStrategy.resolvedKey}`);
    assert(architecture.status === benchmark.expectedArchitectureStatus, `${benchmarkKey}: expected architecture status ${benchmark.expectedArchitectureStatus}, got ${architecture.status}`);
    assert(mpptValidation.isValid, `${benchmarkKey}: MPPT validation should pass for the benchmark baseline`);
    assert((pvArray.totalPanels || 0) > 0, `${benchmarkKey}: benchmark should yield a non-zero panel count`);
    assert((inverter.recommendedSizeVA || 0) > 0, `${benchmarkKey}: benchmark should yield a non-zero inverter size`);
    assert(supportSummary, `${benchmarkKey}: support summary should be generated`);
    assert(supportSummary.buckets.protected.count > 0, `${benchmarkKey}: protected path should not be empty`);
    assert(supportSummary.detail && supportSummary.detail.includes('Protected path covers'), `${benchmarkKey}: support summary detail should be descriptive`);
    assert(supportSummary.promiseBoundary, `${benchmarkKey}: promise boundary should be generated`);
    assert(supportSummary.promiseBoundary.detail.includes('Promise only the protected path'), `${benchmarkKey}: promise boundary detail should be explicit`);
    assert(['acceptance', 'constrained'].includes(benchmarkClass), `${benchmarkKey}: benchmark class must be acceptance or constrained`);

    if (benchmarkClass === 'acceptance') {
        assert(
            architecture.status !== 'fail',
            `${benchmarkKey}: acceptance references must stay out of architecture fail status`
        );
        assert(
            supportSummary.status !== 'fail',
            `${benchmarkKey}: acceptance references must not push critical loads outside the protected story`
        );
    } else {
        assert(
            architecture.status === 'fail',
            `${benchmarkKey}: constrained references must remain in fail status so the product proves it catches over-promised commercial stories`
        );
        assert(
            supportSummary.status === 'warn' || supportSummary.status === 'fail',
            `${benchmarkKey}: constrained references should surface a non-pass supported-load story`
        );
        assert(
            supportSummary.buckets.assisted.count > 0 || supportSummary.buckets.excluded.count > 0,
            `${benchmarkKey}: constrained references should have an assisted or excluded path`
        );
    }

    (benchmark.expectedFailureSignals || []).forEach(signal => {
        if (signal === 'battery_throughput') {
            assert(
                architecture.batteryThroughput?.status === 'fail',
                `${benchmarkKey}: expected battery throughput failure signal`
            );
        } else if (signal === 'phase_generator_coverage') {
            const phaseWarning = (architecture.warnings || []).some(item => item.toLowerCase().includes('per phase'));
            assert(
                phaseWarning,
                `${benchmarkKey}: expected a per-phase generator coverage warning`
            );
        }
    });

    if (config.businessProfile === 'cold_room') {
        assert(
            supportSummary.buckets.protected.items.some(item => item.loadRole === 'refrigeration'),
            `${benchmarkKey}: cold-room benchmark should keep refrigeration on the protected path`
        );
    }
    if (config.businessProfile === 'filling_station') {
        assert(
            supportSummary.buckets.assisted.items.some(item => item.name.includes('Booster') || item.loadRole === 'operator_peak'),
            `${benchmarkKey}: filling-station benchmark should leave the booster or operator-peak duty on the assisted path`
        );
    }
});

const acceptanceCount = Object.values(DEFAULTS.BENCHMARK_PROJECTS).filter(item => (item.benchmarkClass || 'acceptance') === 'acceptance').length;
const constrainedCount = Object.values(DEFAULTS.BENCHMARK_PROJECTS).filter(item => (item.benchmarkClass || 'acceptance') === 'constrained').length;
console.log(`BENCHMARK PROJECTS OK (${acceptanceCount} acceptance / ${constrainedCount} constrained)`);
