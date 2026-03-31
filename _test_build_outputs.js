const fs = require('fs');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const standaloneHtml = fs.readFileSync('pv_calculator_ui.html', 'utf8');
const webHtml = fs.readFileSync('dist/web/pv_calculator_ui.html', 'utf8');
const webIndexHtml = fs.readFileSync('dist/web/index.html', 'utf8');
const webNoJekyllExists = fs.existsSync('dist/web/.nojekyll');
const webCss = fs.readFileSync('dist/web/assets/app.css', 'utf8');
const webJs = fs.readFileSync('dist/web/assets/app.js', 'utf8');
const vendorExists = fs.existsSync('vendor/jspdf.umd.min.js');
const webVendorExists = fs.existsSync('dist/web/assets/vendor/jspdf.umd.min.js');

assert(!standaloneHtml.includes('{{APP_STYLE_TAG}}'), 'standalone build should not contain style placeholder');
assert(!standaloneHtml.includes('{{APP_SCRIPT_TAG}}'), 'standalone build should not contain script placeholder');
assert(!standaloneHtml.includes('{{JSPDF_SCRIPT_TAG}}'), 'standalone build should not contain jsPDF placeholder');
assert(standaloneHtml.includes('<style>'), 'standalone build should inline CSS');
assert(standaloneHtml.includes('const ControllerPayloads = {'), 'standalone build should inline controller payload helpers before the app controller');
assert(standaloneHtml.includes('const ControllerState = {'), 'standalone build should inline controller state helpers before the app controller');
assert(standaloneHtml.includes('const ControllerGuidance = {'), 'standalone build should inline controller guidance helpers before the app controller');
assert(standaloneHtml.includes('const PremiumEntitlements = {'), 'standalone build should inline premium entitlement helpers before the app controller');
assert(standaloneHtml.includes('const BackendRuntime = {'), 'standalone build should inline backend runtime helpers before the app controller');
assert(standaloneHtml.includes('const PVCalculator = {'), 'standalone build should inline the app script');
assert(standaloneHtml.includes('window.PVCalculator = PVCalculator;'), 'standalone build should expose PVCalculator on window for inline handlers');

assert(!webHtml.includes('{{APP_STYLE_TAG}}'), 'web build should not contain style placeholder');
assert(!webHtml.includes('{{APP_SCRIPT_TAG}}'), 'web build should not contain script placeholder');
assert(!webHtml.includes('{{JSPDF_SCRIPT_TAG}}'), 'web build should not contain jsPDF placeholder');
assert(webHtml.includes('<link rel="stylesheet" href="./assets/app.css">'), 'web build should reference app.css');
assert(webHtml.includes('<script src="./assets/app.js"></script>'), 'web build should reference app.js');
assert(webIndexHtml === webHtml, 'dist/web/index.html should mirror the hosted pv_calculator_ui.html entry for simple static hosting');
assert(webNoJekyllExists, 'dist/web/.nojekyll should exist so GitHub Pages serves the static bundle without Jekyll processing');

assert(webCss.includes(':root {'), 'web CSS asset should contain app styles');
assert(webJs.includes('const ControllerPayloads = {'), 'web JS asset should contain controller payload helpers');
assert(webJs.includes('const ControllerState = {'), 'web JS asset should contain controller state helpers');
assert(webJs.includes('const ControllerGuidance = {'), 'web JS asset should contain controller guidance helpers');
assert(webJs.includes('const PremiumEntitlements = {'), 'web JS asset should contain premium entitlement helpers');
assert(webJs.includes('const BackendRuntime = {'), 'web JS asset should contain backend runtime helpers');
assert(webJs.includes('const PVCalculator = {'), 'web JS asset should contain app controller');
assert(webJs.includes('window.PVCalculator = PVCalculator;'), 'web JS asset should expose PVCalculator on window for inline handlers');
assert(webJs.includes('/* GENERATED FILE:'), 'web JS asset should indicate it is generated');
assert(standaloneHtml.includes('How To Read Outcome Scores'), 'standalone build should include the outcome score guide strings');
assert(webJs.includes('How To Read Outcome Scores'), 'web JS asset should include the outcome score guide');
assert(standaloneHtml.includes('Results Navigator'), 'standalone build should include the results navigator');
assert(webJs.includes('renderResultsNavigator'), 'web JS asset should include the results navigator helper');
assert(standaloneHtml.includes('<button type="button" class="field-help-icon"'), 'standalone build should use real button elements for field-help triggers');
assert(!standaloneHtml.includes('<span class="field-help-icon"'), 'standalone build should not leave legacy span-based field-help triggers');
assert(webHtml.includes('<button type="button" class="field-help-icon"'), 'web build should use real button elements for field-help triggers');
assert(!webHtml.includes('<span class="field-help-icon"'), 'web build should not leave legacy span-based field-help triggers');
assert(webJs.includes('Native buttons keep cleaner semantics'), 'web JS asset should preserve native-button field-help wiring');
assert(webJs.includes('pvCalculatorPremiumEntitlementV1'), 'web JS asset should carry the local premium entitlement storage key');
assert(webJs.includes('Packaging preview'), 'web JS asset should include passive premium packaging guidance');
assert(webJs.includes('The dedicated TXT handoff pack is the first Engineering Plus export candidate.'), 'web JS asset should include soft gating guidance for formal study work-pack export');
assert(webJs.includes('The structured CSV handoff is the first Engineering Plus data export candidate.'), 'web JS asset should include soft gating guidance for formal study data-sheet export');
assert(webHtml.includes('Premium entitlement runtime (optional)'), 'web build should include the premium entitlement workspace block');
assert(webHtml.includes('Backend entitlement sync (optional)'), 'web build should include the backend entitlement sync workspace block');
assert(webHtml.includes('Sync Entitlement'), 'web build should include the backend sync action');
assert(webHtml.includes('Backend API Key'), 'web build should include the backend API key field');
assert(webHtml.includes('Seat Access Code'), 'web build should include the backend seat access code field');
assert(webHtml.includes('Issue Seat Session'), 'web build should include the backend seat-session issue action');
assert(webHtml.includes('Renew Seat Session'), 'web build should include the backend seat-session renew action');
assert(webHtml.includes('Revoke Backend Session'), 'web build should include the backend seat-session revoke action');
assert(webHtml.includes('Clear Local Session'), 'web build should include the backend seat-session clear action');
assert(webHtml.includes('Recovery Code or Link'), 'web build should include the backend recovery code/link field');
assert(webHtml.includes('Redeem Recovery Code'), 'web build should include the backend recovery-code redeem action');
assert(webHtml.includes('Copy Recovery Link'), 'web build should include the backend recovery-link copy action');
assert(webHtml.includes('Recovery Code Preview'), 'web build should include the backend recovery-code preview');
assert(webHtml.includes('Seat Invite Code or Link'), 'web build should include the backend seat-invite code/link field');
assert(webHtml.includes('Redeem Seat Invite'), 'web build should include the backend seat-invite redeem action');
assert(webHtml.includes('Copy Seat Invite Link'), 'web build should include the backend seat-invite link copy action');
assert(webHtml.includes('Seat Invite Preview'), 'web build should include the backend seat-invite preview');
assert(webHtml.includes('Pull Audit Log'), 'web build should include the backend audit pull action');
assert(webHtml.includes('Load Installer Pro Trial'), 'web build should include the local premium trial actions');
assert(webHtml.includes('Team handback &amp; approval flow (optional)'), 'web build should include the team workflow workspace block');
assert(webHtml.includes('Copy handback brief'), 'web build should include the team handback export action');
assert(webHtml.includes('Publish Current To Backend'), 'web build should include the team handback backend publish action');
assert(webHtml.includes('Pull Latest For Project'), 'web build should include the team handback backend pull action');
assert(webHtml.includes('Saved Desk Roster'), 'web build should include the team roster library controls');
assert(webHtml.includes('Publish Admin &amp; Desk'), 'web build should include the team roster backend publish action');
assert(webHtml.includes('Import Shared Roster'), 'web build should include the team roster backend import action');
assert(webHtml.includes('Saved Team Seats'), 'web build should include the team seat library controls');
assert(webHtml.includes('Set Active'), 'web build should include the team seat activation action');
assert(webHtml.includes('Shared Seat Access Code'), 'web build should include the shared seat access code field');
assert(webHtml.includes('Import Shared Seats'), 'web build should include the team seat backend import action');
assert(webHtml.includes('Issue Seat Invite'), 'web build should include the team seat invite issue action');
assert(webHtml.includes('Recovery Target Seat'), 'web build should include the team-seat recovery target controls');
assert(webHtml.includes('Issue Recovery Code'), 'web build should include the team-seat recovery-code issue action');
assert(webHtml.includes('Run Recovery Action'), 'web build should include the team-seat recovery action trigger');
assert(webHtml.includes('Seat Recovery Preview'), 'web build should include the team-seat recovery preview');
assert(webHtml.includes('Brand profile &amp; release control (optional)'), 'web build should include the proposal branding and release block');
assert(webHtml.includes('Save Current'), 'web build should include the company profile library actions');
assert(webHtml.includes('Publish Current To Backend'), 'web build should include shared company-profile publish action');
assert(webHtml.includes('Import Shared From Backend'), 'web build should include shared company-profile import action');
assert(webHtml.includes('Brand Accent'), 'web build should include branded asset slots');
assert(webHtml.includes('Brand Logo'), 'web build should include local brand logo input');
assert(webHtml.includes('Saved Release Templates'), 'web build should include the release template library controls');
assert(webHtml.includes('Save Current Template'), 'web build should include the release template actions');
assert(webHtml.includes('Copy brand pack'), 'web build should include branded proposal pack export actions');
assert(webHtml.includes('Copy release brief'), 'web build should include the proposal release export action');
assert(webJs.includes('Base PDF export remains available.'), 'web JS asset should include branded export posture guidance');
assert(webJs.includes('Branded issuer export'), 'web JS asset should include the premium branded PDF marker');
assert(webJs.includes('Shared ownership, approval checkpoints, and controlled handback are the first Studio Team workflow actions.'), 'web JS asset should include the team workspace premium guidance');
assert(webJs.includes('Named desk roster presets, role hints, and shared admin metadata are part of the team-workspace lane.'), 'web JS asset should include the team roster premium guidance');
assert(webJs.includes('Shared roster sync is ready for installation key'), 'web JS asset should include shared team roster sync guidance');
assert(webJs.includes('No shared seats exist yet. A Workspace Admin draft can bootstrap the secured shared seat library.'), 'web JS asset should include team seat bootstrap guidance');
assert(webJs.includes('Activated team seat'), 'web JS asset should include team seat activation workflow');
assert(webJs.includes('Run team-seat recovery'), 'web JS asset should include the team-seat recovery workflow');
assert(webJs.includes('/api/team-seats/recovery'), 'web JS asset should carry the team-seat recovery backend route');
assert(webJs.includes('/api/team-seats/recovery-code/issue'), 'web JS asset should carry the team-seat recovery-code issue backend route');
assert(webJs.includes('/api/team-seats/recovery-code/redeem'), 'web JS asset should carry the team-seat recovery-code redeem backend route');
assert(webJs.includes('Recovery code redeemed'), 'web JS asset should include recovery-code redeem posture');
assert(webJs.includes('pvSeatRecoveryToken'), 'web JS asset should carry the signed recovery-link hash key');
assert(webJs.includes('/api/team-seats/invite/issue'), 'web JS asset should carry the team-seat invite issue backend route');
assert(webJs.includes('/api/team-seats/invite/redeem'), 'web JS asset should carry the team-seat invite redeem backend route');
assert(webJs.includes('Seat invite redeemed'), 'web JS asset should include seat-invite redeem posture');
assert(webJs.includes('pvSeatInviteToken'), 'web JS asset should carry the signed seat-invite hash key');
assert(webJs.includes('Signed recovery link'), 'web JS asset should include signed recovery-link posture');
assert(webJs.includes('Signed seat-invite link'), 'web JS asset should include signed seat-invite posture');
assert(webJs.includes('Saved company profiles and one-click issuer loading are the first branded-workflow conveniences.'), 'web JS asset should include the company profile premium guidance');
assert(webJs.includes('Local logo / letterhead polish and the dedicated branded proposal pack export are part of the branded-exports lane.'), 'web JS asset should include the branded proposal pack premium guidance');
assert(webJs.includes('Custom release templates and one-click release-note injection are reserved for the Studio Team workflow lane.'), 'web JS asset should include the release template premium guidance');
assert(webJs.includes('Proposal release states and the dedicated release brief are part of the team-workflow lane.'), 'web JS asset should include the proposal release premium guidance');
assert(webJs.includes('Backend sync is ready against'), 'web JS asset should include backend sync posture guidance');
assert(webJs.includes('Issue a short-lived backend seat session'), 'web JS asset should include backend seat-session guidance');
assert(webJs.includes('Add either the seat access code for the active shared seat or the backend API bootstrap key before issuing a short-lived session.'), 'web JS asset should include seat sign-in issue guidance');
assert(webJs.includes('No backend API key or seat session is currently active.'), 'web JS asset should include unauthenticated backend posture guidance');
assert(webJs.includes('Authenticated backend audit is available through the active short-lived seat session.'), 'web JS asset should include backend audit security guidance');
assert(webJs.includes('Short-lived backend seat session is active'), 'web JS asset should include active session guidance');
assert(webJs.includes('Seat sign-in'), 'web JS asset should include seat sign-in auth mode guidance');
assert(webJs.includes('Access code enabled'), 'web JS asset should include shared seat auth posture guidance');
assert(webJs.includes('Shared company-profile sync is ready for installation key'), 'web JS asset should include shared company-profile sync guidance');
assert(webJs.includes('Shared handback sync is ready for project key'), 'web JS asset should include shared team handback sync guidance');

if (vendorExists) {
    assert(!standaloneHtml.includes('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'), 'standalone build should inline jsPDF when vendor asset exists');
    assert(standaloneHtml.includes('Version 2.5.1 Built on 2022-01-28T15:37:57.789Z'), 'standalone build should inline the vendored jsPDF asset');
    assert(webHtml.includes('<script src="./assets/vendor/jspdf.umd.min.js"></script>'), 'web build should reference the local jsPDF vendor asset');
    assert(webVendorExists, 'web build should copy the vendored jsPDF asset');
} else {
    assert(webHtml.includes('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'), 'web build should fall back to CDN jsPDF when vendor asset is absent');
}

console.log('BUILD OUTPUTS OK');
