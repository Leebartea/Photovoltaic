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
        add(...tokens) { tokens.filter(Boolean).forEach(token => set.add(token)); },
        remove(...tokens) { tokens.filter(Boolean).forEach(token => set.delete(token)); },
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

function matchesSelector(node, selector) {
    if (!node || !selector) return false;
    const selectors = selector.split(',').map(item => item.trim().toUpperCase());
    return selectors.includes(node.tagName);
}

function makeElement(tagName = 'div', id = '') {
    const element = {
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
        innerHTML: '',
        textContent: '',
        children: [],
        parentNode: null,
        classList: makeClassList(),
        appendChild(child) {
            if (!child) return child;
            if (child.parentNode && child.parentNode !== this && typeof child.parentNode.removeChild === 'function') {
                child.parentNode.removeChild(child);
            }
            if (!this.children.includes(child)) this.children.push(child);
            child.parentNode = this;
            return child;
        },
        removeChild(child) {
            this.children = this.children.filter(item => item !== child);
            if (child) child.parentNode = null;
            return child;
        },
        insertBefore(child, reference) {
            if (!child) return child;
            if (!reference || !this.children.includes(reference)) return this.appendChild(child);
            if (child.parentNode && child.parentNode !== this && typeof child.parentNode.removeChild === 'function') {
                child.parentNode.removeChild(child);
            }
            const currentIndex = this.children.indexOf(child);
            if (currentIndex >= 0) this.children.splice(currentIndex, 1);
            const index = this.children.indexOf(reference);
            this.children.splice(index, 0, child);
            child.parentNode = this;
            return child;
        },
        insertAdjacentElement(position, child) {
            if (position !== 'afterend' || !this.parentNode) {
                return this.appendChild(child);
            }
            return this.parentNode.insertBefore(child, this.nextSibling || null);
        },
        addEventListener() {},
        removeEventListener() {},
        setAttribute(name, value) { this[name] = value; },
        getAttribute(name) { return this[name] ?? null; },
        focus() { global.__lastFocused = this.id || this.tagName; },
        blur() {},
        scrollIntoView() { global.__lastScrolled = this.id || this.tagName; },
        querySelectorAll(selector) {
            const matches = [];
            const visit = (node) => {
                (node.children || []).forEach(child => {
                    if (matchesSelector(child, selector)) matches.push(child);
                    visit(child);
                });
            };
            visit(this);
            return matches;
        },
        querySelector(selector) {
            return this.querySelectorAll(selector)[0] || null;
        },
        closest() { return null; }
    };

    Object.defineProperty(element, 'nextSibling', {
        get() {
            if (!this.parentNode) return null;
            const siblings = this.parentNode.children || [];
            const index = siblings.indexOf(this);
            return index >= 0 ? siblings[index + 1] || null : null;
        }
    });

    return element;
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
    body: makeElement('body', 'body'),
    documentElement: makeElement('html', 'html'),
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
global.__lastScrolled = null;
global.__lastFocused = null;
`;

const tempFile = '_test_ui_flow_temp.js';
fs.writeFileSync(tempFile, `${stubCode}\n${extractedCode}\nmodule.exports = { DEFAULTS, PVCalculator, LoadEngine, __elements, __ensureElement, window, document, localStorage };`);

let mod;
try {
    mod = require(`./${tempFile}`);
} finally {
    fs.unlinkSync(tempFile);
}

const {
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

function append(parent, child) {
    parent.appendChild(child);
    return child;
}

function makeCard(id, headerMode = 'plain') {
    const card = addControl(id, 'div', {});
    const header = headerMode === 'inline'
        ? addControl(`${id}Header`, 'div', {})
        : addControl(`${id}Header`, 'h2', {});
    if (headerMode === 'inline') {
        header.classList.add('section-header-inline');
        const title = addControl(`${id}Title`, 'h2', {});
        title.textContent = id;
        append(header, title);
        append(header, addControl(`${id}Badge`, 'span', { textContent: 'Badge' }));
    } else {
        header.textContent = id;
    }
    append(card, header);
    append(card, addControl(`${id}BodyRow`, 'div', { textContent: `${id} content` }));
    append(card, addControl(`${id}BodyRowTwo`, 'div', { textContent: `${id} more content` }));
    return card;
}

[
    ['systemConfigCard', 'plain'],
    ['projectWorkspaceCard', 'inline'],
    ['projectTemplatesCard', 'inline'],
    ['workflowGuideCard', 'inline'],
    ['proposalIdentityCard', 'plain'],
    ['proposalPricingCard', 'plain'],
    ['applianceInputCard', 'plain'],
    ['applianceListCard', 'plain'],
    ['upgradeSimulatorCard', 'plain'],
    ['equipmentSpecsCard', 'plain']
].forEach(([id, mode]) => makeCard(id, mode));

addControl('workflowGuideHint', 'div', {});
addControl('projectWorkspaceStatus', 'div', {});
addControl('projectSyncBadge', 'div', {});
addControl('projectTemplatePreview', 'div', {});
addControl('applianceListContainer', 'div', {});

[
    ['audienceMode', 'select', { value: 'client' }],
    ['location', 'select', { value: 'lagos_ng' }],
    ['systemType', 'select', { value: 'hybrid' }],
    ['phaseType', 'select', { value: 'single' }],
    ['businessProfile', 'select', { value: 'tailoring_studio' }],
    ['operatingIntent', 'select', { value: 'backup_only' }],
    ['continuityClass', 'select', { value: 'business_critical' }],
    ['operatingSchedulePreset', 'select', { value: 'business_day' }],
    ['autonomyDays', 'input', { value: '2' }],
    ['projectName', 'input', { value: 'Tailoring Studio Draft' }],
    ['projectTemplatePreset', 'select', { value: 'tailoring_studio' }],
    ['proposalCompanyName', 'input', { value: '' }],
    ['proposalContactName', 'input', { value: '' }],
    ['proposalContactPhone', 'input', { value: '' }],
    ['proposalContactEmail', 'input', { value: '' }],
    ['proposalClientName', 'input', { value: '' }],
    ['proposalSiteName', 'input', { value: '' }],
    ['proposalQuoteReference', 'input', { value: '' }],
    ['proposalIssueDate', 'input', { value: '2026-03-11' }],
    ['surveyStage', 'select', { value: 'preliminary' }],
    ['surveyMountingType', 'select', { value: 'roof' }],
    ['surveyShadingProfile', 'select', { value: 'unknown' }],
    ['surveyCableRoute', 'select', { value: 'unknown' }],
    ['surveyAccess', 'select', { value: 'standard' }],
    ['surveyNotes', 'textarea', { value: '' }],
    ['surveyStructureConfirmed', 'input', { type: 'checkbox', checked: false }],
    ['surveyCableRouteConfirmed', 'input', { type: 'checkbox', checked: false }],
    ['surveyEarthingConfirmed', 'input', { type: 'checkbox', checked: false }],
    ['surveyExclusionsReviewed', 'input', { type: 'checkbox', checked: false }],
    ['surveyBudgetAligned', 'input', { type: 'checkbox', checked: false }],
    ['surveyUtilityReviewed', 'input', { type: 'checkbox', checked: false }],
    ['pricingProfile', 'select', { value: 'standard' }],
    ['supplierPricePack', 'select', { value: 'west_africa_installer_bench' }],
    ['quoteCurrencyLabel', 'input', { value: 'USD' }],
    ['manualMode', 'input', { type: 'checkbox', checked: false }],
    ['panelLibraryAppliedId', 'input', { value: '' }],
    ['inverterLibraryAppliedId', 'input', { value: '' }],
    ['batteryLibraryAppliedId', 'input', { value: '' }]
].forEach(([id, tagName, props]) => addControl(id, tagName, props));

PVCalculator.renderBusinessContextHint = function() {};
PVCalculator.saveToLocalStorageAuto = function() {};
PVCalculator.refreshRenderedResults = function() {};

PVCalculator.initializeInputSectionFlow();

assert(__ensureElement('applianceInputCard').classList.contains('input-section-recommended'), 'loads section should be recommended before any appliance is added');
assert(__ensureElement('workflowGuideHint').innerHTML.includes('Recommended next move'), 'workflow guide should include a recommended next move banner');
assert(__ensureElement('systemConfigCardSummary').textContent.includes('Client Estimate'), 'system configuration summary should show audience mode');
assert(__ensureElement('workflowGuideHint').innerHTML.includes('Next Section Coach'), 'workflow guide should expose a coach panel by default');

assert(__ensureElement('proposalPricingCard').classList.contains('input-section-collapsed'), 'pricing section should start collapsed before loads are entered');
PVCalculator.toggleInputSection('proposalPricingCard');
assert(!__ensureElement('proposalPricingCard').classList.contains('input-section-collapsed'), 'pricing section should expand when toggled');
assert(!__ensureElement('proposalPricingCardBodyRow').classList.contains('input-section-hidden'), 'pricing section body should reappear when expanded');

PVCalculator.setWorkflowGuideFocus('operatingIntent', 'field');
assert(__ensureElement('workflowGuideHint').innerHTML.includes('Operating Intent'), 'workflow coach should explain the focused field');
assert(__ensureElement('workflowGuideHint').innerHTML.includes('commercial promise'), 'workflow coach should use plain-language field guidance');

LoadEngine.appliances = [{
    name: 'Industrial Sewing Machine',
    quantity: 1,
    ratedPowerW: 550,
    dailyUsageHours: 8,
    dutyCycle: 80,
    loadType: 'motor',
    powerFactor: 0.85,
    surgeFactor: 4,
    daytimeRatio: 90,
    isSimultaneous: true,
    loadRole: 'process',
    loadCriticality: 'important'
}];
__ensureElement('proposalClientName').value = 'Apex Garments';
__ensureElement('proposalSiteName').value = 'Production Floor';
__ensureElement('surveyStage').value = 'remote_reviewed';
PVCalculator.renderApplianceList();
PVCalculator.refreshInputSectionFlow({ preserveState: true });

assert(__ensureElement('applianceListCardSummary').textContent.includes('1 load'), 'load review summary should reflect appliance count');
assert(__ensureElement('proposalPricingCard').classList.contains('input-section-recommended'), 'client mode should point toward pricing after loads and survey identity are set');

__ensureElement('audienceMode').value = 'installer';
__ensureElement('manualMode').checked = true;
PVCalculator.updateAudienceMode();
PVCalculator.refreshInputSectionFlow({ preserveState: true });

assert(__ensureElement('equipmentSpecsCard').classList.contains('input-section-recommended'), 'installer manual mode should recommend equipment review before calculation');
PVCalculator.focusInputSection('equipmentSpecsCard');
assert(global.__lastScrolled === 'equipmentSpecsCard', 'focusInputSection should scroll to the target card');

const outcomeGuideHtml = PVCalculator.renderOutcomeScoreGuide({
    confidence: { score: 78, level: 'Moderate' },
    copingSummary: { manualActive: true, isUndersized: true, score: 68, label: 'Tight' },
    proposalReadiness: { score: 74, label: 'Ready with pending checks' },
    compliance: { completionPct: 62, statusLabel: 'Pending', pathLabel: 'Licensed installer path' },
    submissionPack: { completionPct: 54, statusLabel: 'Pending', label: 'Installer closeout pack' },
    decisionStrategy: { score: 81, label: 'Hybrid with generator assist', status: 'warn' }
});

assert(outcomeGuideHtml.includes('How To Read Outcome Scores'), 'outcome guide should render a summary heading');
assert(outcomeGuideHtml.includes('Coping Score'), 'outcome guide should explain the coping score');
assert(outcomeGuideHtml.includes('Proposal Readiness'), 'outcome guide should explain proposal readiness');

const navigatorHtml = PVCalculator.renderResultsNavigator([
    { id: 'resultsSummarySection', label: 'System Summary', copy: 'Hardware totals.' },
    { id: 'resultsExecutiveSection', label: 'Executive Snapshot', copy: 'Proposal read.' }
], true);
assert(navigatorHtml.includes('Results Navigator'), 'results navigator should render a heading');
assert(navigatorHtml.includes('Executive Snapshot'), 'results navigator should include section pills');

const sectionShellHtml = PVCalculator.renderResultSectionShell({
    id: 'resultsExecutiveSection',
    title: 'Executive Snapshot',
    summary: 'Proposal-first view.',
    body: '<div>Body</div>',
    expanded: false,
    badge: 'Ready'
});
assert(sectionShellHtml.includes('Executive Snapshot'), 'result section shell should render its title');
assert(sectionShellHtml.includes('Expand'), 'collapsed result section should render expand control');

console.log('UI FLOW OK');
