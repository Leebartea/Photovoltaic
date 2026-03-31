/**
 * PV Calculator v3.0.0 (Global Edition) — Multi-Region Verification Suite
 * Extracts engine code from HTML and tests in isolation
 */
const fs = require("fs");
const html = fs.readFileSync("pv_calculator_ui.html", "utf8");

let passed = 0, failed = 0, total = 0;

function assert(condition, testName) {
    total++;
    if (condition) { passed++; console.log(`  ✅ ${testName}`); }
    else { failed++; console.log(`  ❌ FAIL: ${testName}`); }
}
function assertApprox(actual, expected, tolerance, testName) {
    total++;
    if (Math.abs(actual - expected) <= tolerance) { passed++; console.log(`  ✅ ${testName} (${actual})`); }
    else { failed++; console.log(`  ❌ FAIL: ${testName} — got ${actual}, expected ~${expected}`); }
}

// ── Extract the main inline application script from the HTML ──
const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(([, code]) => code)
    .filter(code => code.trim().length > 0);

const scriptCode = inlineScripts.find(code => code.includes("const PVCalculator = {"));
if (!scriptCode) {
    console.log("❌ Engine extraction failed: main inline application script not found");
    process.exit(1);
}

// Build a self-contained module:
// 1. Stub DOM/window
// 2. Inject script code up to init() call
// 3. Export what we need
const stubCode = `
// DOM/window stubs
var window = { matchMedia:()=>({matches:false,addEventListener(){}}), addEventListener(){}, innerWidth:1024, innerHeight:768, scrollTo(){}, location:{hash:''}, localStorage:{getItem(){return null;},setItem(){},removeItem(){}}, requestAnimationFrame(cb){}, getComputedStyle(){return{};}, atob: globalThis.atob ? globalThis.atob.bind(globalThis) : (() => ''), btoa: globalThis.btoa ? globalThis.btoa.bind(globalThis) : (() => '') };
var navigator = { userAgent:'test', clipboard:{writeText(){}} };
var document = {
    getElementById(id) { return { value:'', checked:false, style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, addEventListener(){}, innerHTML:'', textContent:'', querySelector(){return null;}, querySelectorAll(){return[];}, options:[], selectedIndex:0, appendChild(){}, removeChild(){}, insertAdjacentHTML(){}, setAttribute(){}, getAttribute(){return null;}, children:[], closest(){return null;}, parentElement:null, dataset:{} }; },
    querySelector() { return { style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, addEventListener(){}, innerHTML:'', querySelectorAll(){return[];}, querySelector(){return null;}, children:[], getAttribute(){return null;}, setAttribute(){}, closest(){return null;} }; },
    querySelectorAll() { return []; },
    createElement(tag) { return { style:{}, classList:{add(){},remove(){},toggle(){},contains(){return false;}}, appendChild(){return this;}, innerHTML:'', textContent:'', setAttribute(){}, getAttribute(){return null;}, addEventListener(){}, options:[], querySelectorAll(){return[];}, children:[], cloneNode(){return this;}, remove(){} }; },
    createElementNS() { return { setAttribute(){}, appendChild(){}, style:{}, querySelectorAll(){return[];} }; },
    head: { querySelector(){return null;} },
    addEventListener() {},
    body: { classList:{toggle(){},add(){},remove(){},contains(){return false;}}, appendChild(){} },
    title: ''
};
var alert = function(){};
var confirm = function(){return true;};
var setTimeout = function(cb,t){};
var setInterval = function(){return 0;};
var clearInterval = function(){};
var clearTimeout = function(){};
var fetch = function(){return Promise.resolve({ok:true,json(){return Promise.resolve({});}});};
var MutationObserver = function(){return{observe(){},disconnect(){}};};
var IntersectionObserver = function(){return{observe(){},disconnect(){},unobserve(){}};};
var ResizeObserver = function(){return{observe(){},disconnect(){}};};
var HTMLElement = function(){};
var customElements = {define(){}};
var jspdf = { jsPDF:function(){return{setFont(){},setFontSize(){},setTextColor(){},setDrawColor(){},setFillColor(){},text(){},line(){},rect(){},addPage(){},save(){},internal:{pageSize:{getWidth(){return 210;},getHeight(){return 297;}}},getTextWidth(){return 50;},splitTextToSize(){return[];}};}};
`;

// Find where init() or DOMContentLoaded is called — we don't want to execute that
// We'll cut the code before the init() execution
const initCallIdx = scriptCode.indexOf("document.addEventListener('DOMContentLoaded'");
const initCallIdx2 = scriptCode.indexOf('document.addEventListener("DOMContentLoaded"');
const cutIdx = Math.max(initCallIdx, initCallIdx2);
let extractedCode = cutIdx > 0 ? scriptCode.substring(0, cutIdx) : scriptCode;

// Also cut any trailing IIFE or function calls
// Write temp module
const tempFile = "_test_v3_temp.js";
fs.writeFileSync(tempFile, stubCode + "\n" + extractedCode + `
// Exports
if (typeof module !== 'undefined') {
    module.exports = { DEFAULTS, calculateACCurrent, InverterSizingEngine, BatterySizingEngine, PremiumEntitlements };
}
`);

let DEFAULTS, calculateACCurrent, InverterSizingEngine, BatterySizingEngine, PremiumEntitlements;
try {
    const mod = require("./" + tempFile);
    DEFAULTS = mod.DEFAULTS;
    calculateACCurrent = mod.calculateACCurrent;
    InverterSizingEngine = mod.InverterSizingEngine;
    BatterySizingEngine = mod.BatterySizingEngine;
    PremiumEntitlements = mod.PremiumEntitlements;
    console.log("✅ Engine extraction successful\n");
} catch(e) {
    console.log("❌ Engine extraction failed:", e.message);
    console.log("   Stack:", e.stack?.split("\n").slice(0,5).join("\n"));
    try { fs.unlinkSync(tempFile); } catch(x){}
    process.exit(1);
}

// ════════════════════════════════════════════════════════════════
// TEST 1: REGION PROFILES
// ════════════════════════════════════════════════════════════════
console.log("═══ TEST 1: REGION PROFILES ═══");

const profiles = DEFAULTS.REGION_PROFILES;
const expectedProfiles = ['lagos_ng', 'nairobi_ke', 'accra_gh', 'us_south', 'us_north', 'brazil', 'eu_central', 'eu_south', 'india', 'uae', 'australia', 'generic'];

assert(profiles !== undefined, "REGION_PROFILES exists");
for (const key of expectedProfiles) {
    assert(profiles[key] !== undefined, `Profile '${key}' exists`);
}
assert(Object.keys(profiles).length === expectedProfiles.length, `Exactly ${expectedProfiles.length} profiles`);

// Spot-check profiles
assert(profiles.lagos_ng.acVoltage === 230 && profiles.lagos_ng.frequency === 50 && profiles.lagos_ng.phaseType === 'single', "Lagos: 230V/50Hz/single");
assert(profiles.lagos_ng.inverterMarket === 'EMERGING_OFFGRID', "Lagos: EMERGING market");
assert(profiles.lagos_ng.climate === 'tropical_hot', "Lagos: tropical_hot");

assert(profiles.us_south.acVoltage === 240 && profiles.us_south.frequency === 60 && profiles.us_south.phaseType === 'split', "US South: 240V/60Hz/split");
assert(profiles.us_south.inverterMarket === 'US_SPLIT_PHASE', "US South: US_SPLIT_PHASE market");
assert(profiles.us_south.climate === 'hot_arid', "US South: hot_arid");

assert(profiles.eu_central.acVoltage === 230 && profiles.eu_central.frequency === 50 && profiles.eu_central.phaseType === 'single', "EU Central: 230V/50Hz/single");
assert(profiles.eu_central.inverterMarket === 'EU_SINGLE_PHASE', "EU Central: EU market");
assert(profiles.eu_central.climate === 'cold_temperate', "EU Central: cold_temperate");

assert(profiles.australia.inverterMarket === 'EU_SINGLE_PHASE', "Australia: EU market (AS/NZS standard)");
assert(profiles.india.inverterMarket === 'EMERGING_OFFGRID', "India: EMERGING market");
assert(profiles.brazil.frequency === 60, "Brazil: 60Hz");

// Required fields on every profile
const reqFields = ['name', 'acVoltage', 'frequency', 'phaseType', 'inverterMarket', 'avgPSH', 'climate', 'regulatoryNote'];
for (const [key, p] of Object.entries(profiles)) {
    for (const f of reqFields) {
        assert(p[f] !== undefined, `${key}.${f} present`);
    }
}

// ════════════════════════════════════════════════════════════════
// TEST 2: PHASE CONFIGURATION
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 2: PHASE CONFIGURATION ═══");

const phases = DEFAULTS.PHASE_CONFIG;
assert(phases.single && phases.split && phases.three_phase, "All 3 phase configs exist");
assert(JSON.stringify(phases.single.voltages) === '[220,230,240]', "Single: [220,230,240]V");
assert(JSON.stringify(phases.split.voltages) === '[240]', "Split: [240]V");
assert(phases.split.legVoltage === 120, "Split: legVoltage=120");
assert(JSON.stringify(phases.three_phase.voltages) === '[380,400,415]', "3-Phase: [380,400,415]V");
assert(phases.three_phase.sqrt3 === 1.732, "3-Phase: sqrt3=1.732");

// ════════════════════════════════════════════════════════════════
// TEST 3: calculateACCurrent — PHASE MATH
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 3: calculateACCurrent ═══");

assertApprox(calculateACCurrent(5000, 230, 'single'), 21.739, 0.01, "Single: 5000VA/230V = 21.74A");
assertApprox(calculateACCurrent(7600, 240, 'split'), 31.667, 0.01, "Split: 7600VA/240V = 31.67A");
assertApprox(calculateACCurrent(10000, 400, 'three_phase'), 14.434, 0.1, "3-Phase: 10000/(400×1.732) = 14.43A");

// 3-phase gives lower current than single at same VA
assert(calculateACCurrent(10000, 400, 'three_phase') < calculateACCurrent(10000, 400, 'single'), "3-phase < single current");

// ════════════════════════════════════════════════════════════════
// TEST 4: INVERTER MARKET SIZING
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 4: INVERTER MARKET SIZING ═══");

const mkts = DEFAULTS.INVERTER_MARKET;
assert(mkts.EMERGING_OFFGRID && mkts.EU_SINGLE_PHASE && mkts.US_SPLIT_PHASE, "All 3 markets exist");

// ════════════════════════════════════════════════════════════════
// TEST 4A: OPTIONAL BACKEND RUNTIME DEFAULTS
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 4A: OPTIONAL BACKEND RUNTIME DEFAULTS ═══");

assert(DEFAULTS.BACKEND_RUNTIME !== undefined, "BACKEND_RUNTIME defaults exist");
assert(DEFAULTS.BACKEND_RUNTIME.storageKey === 'pvCalculatorBackendRuntimeV1', "Backend runtime storage key matches");
assert(DEFAULTS.BACKEND_RUNTIME.requestTimeoutMs === 6000, "Backend runtime timeout matches");
assert(DEFAULTS.BACKEND_RUNTIME.resolveEndpoint === '/api/entitlement/resolve', "Backend runtime resolve endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.companyProfilesEndpoint === '/api/company-profiles', "Backend runtime company profile endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamHandbacksEndpoint === '/api/team-handbacks', "Backend runtime team handback endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamRosterEndpoint === '/api/team-roster', "Backend runtime team roster endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamSeatsEndpoint === '/api/team-seats', "Backend runtime team seat endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamSeatRecoveryEndpoint === '/api/team-seats/recovery', "Backend runtime team seat recovery endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamSeatRecoveryCodeIssueEndpoint === '/api/team-seats/recovery-code/issue', "Backend runtime team seat recovery-code issue endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamSeatRecoveryCodeRedeemEndpoint === '/api/team-seats/recovery-code/redeem', "Backend runtime team seat recovery-code redeem endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamSeatInviteIssueEndpoint === '/api/team-seats/invite/issue', "Backend runtime team seat invite issue endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.teamSeatInviteRedeemEndpoint === '/api/team-seats/invite/redeem', "Backend runtime team seat invite redeem endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.seatSessionEndpoint === '/api/seat-session/issue', "Backend runtime seat session endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.seatSessionRenewEndpoint === '/api/seat-session/renew', "Backend runtime seat session renew endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.seatSessionRevokeEndpoint === '/api/seat-session/revoke', "Backend runtime seat session revoke endpoint matches");
assert(DEFAULTS.BACKEND_RUNTIME.auditLogEndpoint === '/api/audit-log', "Backend runtime audit log endpoint matches");
assert(DEFAULTS.TEAM_WORKSPACE.rosterRoles.sales_desk.label === 'Sales Desk', "Team roster roles include sales desk");
assert(DEFAULTS.TEAM_WORKSPACE.rosterRoles.engineering_review.defaultHint === 'Validates technical basis before release or procurement.', "Team roster roles include engineering review hints");
assert(DEFAULTS.TEAM_WORKSPACE.rosterRoles.workspace_admin.permissions.includes('team_seat_publish'), "Workspace admin role includes team seat publish permission");
assert(DEFAULTS.TEAM_WORKSPACE.seatStates.review_only.permissionMode === 'read_only', "Team seat states include review-only mode");
assert(DEFAULTS.TEAM_WORKSPACE.seatRecoveryActions.rotate_access_code.requiresAccessCode === true, "Team seat recovery actions include rotate-access-code posture");

// selectInverterSize per market
assert(InverterSizingEngine.selectInverterSize(4000, 'EMERGING_OFFGRID') === 5000, "Emerging: 4kVA→5kVA");
assert(InverterSizingEngine.selectInverterSize(5500, 'EMERGING_OFFGRID') === 6000, "Emerging: 5.5kVA→6kVA");
assert(InverterSizingEngine.selectInverterSize(5500, 'EU_SINGLE_PHASE') === 8000, "EU: 5.5kVA→8kVA (no 6kVA)");
assert(InverterSizingEngine.selectInverterSize(5000, 'US_SPLIT_PHASE') === 7600, "US: 5kVA→7.6kVA");
assert(InverterSizingEngine.selectInverterSize(8000, 'US_SPLIT_PHASE') === 11400, "US: 8kVA→11.4kVA");

// Cross-market: same VA → different sizes
const em6 = InverterSizingEngine.selectInverterSize(6000, 'EMERGING_OFFGRID');
const eu6 = InverterSizingEngine.selectInverterSize(6000, 'EU_SINGLE_PHASE');
const us6 = InverterSizingEngine.selectInverterSize(6000, 'US_SPLIT_PHASE');
assert(em6 === 6000 && eu6 === 8000 && us6 === 7600, `Cross-market 6kVA: EM=${em6}, EU=${eu6}, US=${us6}`);

// formatMarketRange
assert(InverterSizingEngine.formatMarketRange(5000, 'EMERGING_OFFGRID') === '5000–5500 VA', "Emerging 5kVA range");
assert(InverterSizingEngine.formatMarketRange(8000, 'EU_SINGLE_PHASE') === '8000–10000 VA', "EU 8kVA range");
assert(InverterSizingEngine.formatMarketRange(7600, 'US_SPLIT_PHASE') === '7600–8000 VA', "US 7.6kVA range");
assert(InverterSizingEngine.formatMarketRange(20000, 'EMERGING_OFFGRID') === '20000 VA', "Exact size (no range)");

// ════════════════════════════════════════════════════════════════
// TEST 5: CLIMATE BATTERY ADJUSTMENT
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 5: CLIMATE BATTERY ADJUSTMENT ═══");

const clim = DEFAULTS.CLIMATE_BATTERY_ADJUST;
assert(clim.tropical_hot.buffer === 0.07, "tropical_hot: +7%");
assert(clim.hot_arid.buffer === 0.10, "hot_arid: +10%");
assert(clim.tropical_moderate.buffer === 0.05, "tropical_moderate: +5%");
assert(clim.cold_temperate.buffer === -0.07, "cold_temperate: -7%");
assert(clim.mixed.buffer === 0.00, "mixed: 0%");

// ════════════════════════════════════════════════════════════════
// TEST 6: TIER SCALING — NO MARGIN COMPOUNDING
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 6: BATTERY TIER SCALING ═══");

const specs = DEFAULTS.BATTERY_SPECS.lifepo4;
const usableWh = 10000;
const tiers = BatterySizingEngine.buildTiers(usableWh, 51.2, specs, 'lifepo4', 125);

assert(tiers.economy && tiers.balanced && tiers.expansion, "All 3 tiers built");

// Manual formula: nominal = usable / eff / DoD * selfDischarge * margin
const econNom = (usableWh / specs.dischargeEfficiency / specs.maxDoD) * (1 + specs.selfDischargeDaily) * 1.25;
const econKwh = Math.round(econNom / 100) / 10;
assertApprox(tiers.economy.nominalKWh, econKwh, 0.2, `Economy nominal: ${econKwh} kWh`);

// CRITICAL: Tier ratios must be exactly 1.2 and 1.5 (no compounding)
const ratio12 = tiers.balanced.nominalKWh / tiers.economy.nominalKWh;
const ratio15 = tiers.expansion.nominalKWh / tiers.economy.nominalKWh;
assertApprox(ratio12, 1.2, 0.05, `Balanced/Economy ratio: ${ratio12.toFixed(3)} (expect 1.200)`);
assertApprox(ratio15, 1.5, 0.05, `Expansion/Economy ratio: ${ratio15.toFixed(3)} (expect 1.500)`);

console.log(`  ℹ Tiers: Economy=${tiers.economy.nominalKWh}kWh, Balanced=${tiers.balanced.nominalKWh}kWh, Expansion=${tiers.expansion.nominalKWh}kWh`);

// ════════════════════════════════════════════════════════════════
// TEST 7: RENAMED CONSTANT
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 7: CONTINUOUS_LOAD_FACTOR ═══");

assert(DEFAULTS.CONTINUOUS_LOAD_FACTOR === 1.25, "CONTINUOUS_LOAD_FACTOR = 1.25");

// ════════════════════════════════════════════════════════════════
// TEST 8: CROSS-PROFILE CONSISTENCY
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 8: CROSS-PROFILE CONSISTENCY ═══");

for (const [key, p] of Object.entries(profiles)) {
    const ph = DEFAULTS.PHASE_CONFIG[p.phaseType];
    assert(ph !== undefined, `${key}: phase '${p.phaseType}' valid`);
    assert(ph.voltages.includes(p.acVoltage), `${key}: ${p.acVoltage}V valid for ${p.phaseType}`);
    assert(mkts[p.inverterMarket] !== undefined, `${key}: market '${p.inverterMarket}' valid`);
    assert(clim[p.climate] !== undefined, `${key}: climate '${p.climate}' valid`);
    assert(p.frequency === 50 || p.frequency === 60, `${key}: freq ${p.frequency}Hz valid`);
}

// ════════════════════════════════════════════════════════════════
// TEST 9: VERSION & TEXT DE-REGIONALIZATION
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 9: VERSION & TEXT ═══");

assert(html.includes('v3.0.0'), "Version v3.0.0 present");
assert(html.includes('Global Edition'), "'Global Edition' present");
assert(!html.includes('Lagos tailoring shops'), "No 'Lagos tailoring shops'");
assert(!html.includes('₦50k+'), "No '₦50k+'");

// Check calculateACCurrent used in multiple code paths
const acCallCount = (scriptCode.match(/calculateACCurrent\(/g) || []).length;
assert(acCallCount >= 3, `calculateACCurrent used ${acCallCount}x (cable, protection, display)`);

// ════════════════════════════════════════════════════════════════
// TEST 10: BATTERY ENGINE LOCKED
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 10: BATTERY ENGINE LOCKED ═══");

assert(specs.maxDoD === 0.80, "LiFePO4 DoD: 0.80");
assert(specs.dischargeEfficiency === 0.98, "LiFePO4 eff: 0.98");
assert(specs.selfDischargeDaily === 0.001, "LiFePO4 self-discharge: 0.001");
assert(specs.moduleVoltage === 51.2, "LiFePO4 module: 51.2V");
assert(DEFAULTS.BATTERY_SPECS.agm !== undefined, "AGM chemistry present");

// ════════════════════════════════════════════════════════════════
// TEST 11: PREMIUM CAPABILITY FOUNDATION
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 11: PREMIUM CAPABILITY FOUNDATION ═══");

assert(DEFAULTS.PREMIUM_CAPABILITIES !== undefined, "PREMIUM_CAPABILITIES exists");
assert(DEFAULTS.PREMIUM_CAPABILITIES.features !== undefined, "Premium capability features exist");
assert(DEFAULTS.PREMIUM_CAPABILITIES.tiers !== undefined, "Premium capability tiers exist");
assert(DEFAULTS.PREMIUM_CAPABILITIES.features.core_design !== undefined, "Core design feature exists");
assert(DEFAULTS.PREMIUM_CAPABILITIES.features.formal_study_surface !== undefined, "Formal study surface feature exists");
assert(DEFAULTS.PREMIUM_CAPABILITIES.tiers.community !== undefined, "Community tier exists");
assert(DEFAULTS.PREMIUM_CAPABILITIES.tiers.installer_pro !== undefined, "Installer Pro tier exists");
assert(DEFAULTS.PREMIUM_CAPABILITIES.tiers.engineering_plus !== undefined, "Engineering Plus tier exists");
assert((DEFAULTS.PREMIUM_CAPABILITIES.rolloutPrinciples || []).length >= 3, "Premium rollout principles captured");
assert(DEFAULTS.PREMIUM_CAPABILITIES.tiers.community.gatingRule.includes('Never gate core sizing'), "Community tier preserves the ungated core rule");
assert(DEFAULTS.PROPOSAL_IDENTITY.releaseStates.working_draft.label === 'Working Draft', "Proposal release states exist");
assert(DEFAULTS.PROPOSAL_IDENTITY.releaseStates.ready_for_client.label === 'Ready For Client', "Proposal release states include client-ready posture");
assert(DEFAULTS.PROPOSAL_IDENTITY.brandDefaults.accent === '#2563eb', "Proposal brand defaults exist");
assert(DEFAULTS.PROPOSAL_IDENTITY.brandDefaults.maxLogoBytes === 180000, "Proposal brand logo storage limit exists");
assert(DEFAULTS.PROPOSAL_IDENTITY.releaseTemplates.client_issue_standard.releaseState === 'ready_for_client', "Proposal release templates include client issue posture");

// ════════════════════════════════════════════════════════════════
// TEST 12: PREMIUM ENTITLEMENT RESOLVER
// ════════════════════════════════════════════════════════════════
console.log("\n═══ TEST 12: PREMIUM ENTITLEMENT RESOLVER ═══");

assert(typeof PremiumEntitlements === 'object', "PremiumEntitlements exported");
assert(typeof PremiumEntitlements.resolveEntitlement === 'function', "Premium entitlement resolver exists");
assert(typeof PremiumEntitlements.getCapabilityAccess === 'function', "Premium capability access helper exists");

const communityEntitlement = PremiumEntitlements.resolveEntitlement();
assert(communityEntitlement.effectivePlanKey === 'community', "Default entitlement falls back to community");
assert(communityEntitlement.state === 'active', "Default community entitlement stays active");
assert(PremiumEntitlements.hasCapability('core_design', communityEntitlement), "Community keeps core design capability");
assert(!PremiumEntitlements.hasCapability('formal_study_surface', communityEntitlement), "Community does not silently grant formal study surface");

const trialEntitlement = PremiumEntitlements.resolveEntitlement({
    rawEntitlement: {
        planKey: 'installer_pro',
        source: 'trial',
        grantedCapabilities: [],
        expiresAt: '2099-06-30'
    }
});
assert(trialEntitlement.state === 'active', "Future-dated installer trial resolves active");
assert(PremiumEntitlements.hasCapability('commercial_workflow', trialEntitlement), "Installer Pro trial grants commercial workflow");
assert(!PremiumEntitlements.hasCapability('team_workspace', trialEntitlement), "Installer Pro trial does not silently grant team workspace");

const studioTeamTrial = PremiumEntitlements.createTrialEntitlement({
    planKey: 'studio_team',
    days: 7,
    now: '2026-03-27T00:00:00.000Z',
    program: DEFAULTS.PREMIUM_CAPABILITIES
});
assert((studioTeamTrial.grantedCapabilities || []).includes('team_workspace'), "Studio Team trial includes team workspace capability");

const generatedEngineeringTrial = PremiumEntitlements.createTrialEntitlement({
    planKey: 'engineering_plus',
    days: 7,
    now: '2026-03-27T00:00:00.000Z',
    program: DEFAULTS.PREMIUM_CAPABILITIES
});
assert(generatedEngineeringTrial.planKey === 'engineering_plus', "Trial builder keeps requested Engineering Plus tier");
assert(generatedEngineeringTrial.source === 'trial', "Trial builder uses trial source");
assert((generatedEngineeringTrial.grantedCapabilities || []).includes('formal_study_surface'), "Engineering Plus trial includes formal study surface");

const graceEntitlement = PremiumEntitlements.resolveEntitlement({
    rawEntitlement: {
        planKey: 'engineering_plus',
        source: 'local_license',
        expiresAt: '2026-03-20',
        offlineGraceDays: 14
    },
    now: '2026-03-27T00:00:00.000Z'
});
assert(graceEntitlement.state === 'grace', "Expired premium entitlement enters offline grace when still inside grace window");
assert(PremiumEntitlements.hasCapability('formal_study_surface', graceEntitlement), "Offline grace keeps formal study surface capability");

const formalStudyAccess = PremiumEntitlements.getCapabilityAccess('formal_study_surface', communityEntitlement);
assert(formalStudyAccess.requiredTierKey === 'engineering_plus', "Formal study surface maps to Engineering Plus");
assert(formalStudyAccess.availabilityLabel.includes('Planned for Engineering Plus'), "Formal study access exposes planned tier guidance");

const teamWorkspaceAccess = PremiumEntitlements.getCapabilityAccess('team_workspace', communityEntitlement);
assert(teamWorkspaceAccess.requiredTierKey === 'studio_team', "Team workspace maps to Studio Team");
assert(teamWorkspaceAccess.availabilityLabel.includes('Planned for Studio Team'), "Team workspace access exposes planned tier guidance");

// ════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(60));
console.log(`RESULTS: ${passed}/${total} passed, ${failed} failed`);
if (failed === 0) {
    console.log("🎯 ALL TESTS PASSED — v3.0.0 Global Edition VERIFIED");
} else {
    console.log(`⚠ ${failed} test(s) FAILED — review needed`);
}
console.log("═".repeat(60));

// Cleanup
try { fs.unlinkSync(tempFile); } catch(e) {}
process.exit(failed > 0 ? 1 : 0);
