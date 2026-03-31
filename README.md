# Advanced PV System Calculator

Advanced off-grid, hybrid, and proposal-oriented PV sizing for installers and clients, with global regional presets, plant-engineering handoff depth, and offline-first operation.

Current product status: `v3.0.0 Global Edition`

## Start Here

If you are new to the bot or the repo, do not start with the deepest technical docs first.

Use:

- `Helpful Md/START_HERE_FOR_USERS_AND_MAINTAINERS.md`

Then branch into the role-specific and system-specific guides from there.

For premium / paid capability planning, also use:

- `Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md`
- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`
- `Helpful Md/HOSTING_RECOMMENDATION_AND_REMOTE_DEPLOYMENT_GUIDE.md`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/DEPLOYMENT_TEMPLATES_AND_PROVIDER_SETUP_GUIDE.md`
- `Helpful Md/ORACLE_CLOUD_ALWAYS_FREE_BACKEND_GUIDE.md`
- `Helpful Md/PREMIUM_CAPABILITY_ROADMAP.md`
- `Helpful Md/PREMIUM_V1_CLOSEOUT_CHECKLIST.md`
- `Helpful Md/ENTITLEMENT_SOURCE_OF_TRUTH_GUIDE.md`
- `Helpful Md/PREMIUM_ENTITLEMENT_FOUNDATION_GUIDE.md`
- `Helpful Md/OPTIONAL_BACKEND_FOUNDATION_GUIDE.md`
- `Helpful Md/BACKEND_SQLITE_STORAGE_GUIDE.md`
- `Helpful Md/BACKEND_BACKUP_AND_RESTORE_GUIDE.md`
- `Helpful Md/BACKEND_BACKUP_RETENTION_AND_SCHEDULING_GUIDE.md`
- `Helpful Md/PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md`
- `Helpful Md/BACKEND_SECURITY_AND_AUDIT_GUIDE.md`
- `Helpful Md/BACKEND_ADMIN_CONSOLE_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_DISPATCH_PACK_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_ACKNOWLEDGMENT_GUIDE.md`
- `Helpful Md/BACKEND_SEAT_SESSION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/TEAM_SEATS_AND_ROLE_POSTURE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/ADMIN_ACTION_APPROVAL_WORKFLOW_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`

## What This Repo Optimizes For

- Easy local running
- Safe edits without touching a 15k-line generated file
- Easy deployment as either one standalone HTML file or a normal static web bundle
- No required backend for core sizing, quoting, or PDF export
- No required backend for the current premium entitlement layer either; backend is optional and now introduced only as a separate sync adapter for trusted entitlement, shared brand libraries, seats, and billing
- The first soft premium gating now applies only to formal-study work-pack and data-sheet export actions; live study visibility remains available
- Base PDF export remains available; the premium layer now only adds branded issuer treatment when entitlement grants it
- Team handback preview now stays visible in Project Workspace for every tier, while the dedicated internal handback TXT is staged as the first Studio Team workflow export
- Proposal identity now also has a local company-profile library, brand asset slots, lightweight local logo / letterhead support, company-scoped release templates, and release-control preview; save/load profile actions plus branded pack export stay aligned to branded workflow while release-template convenience and release TXT stay aligned to Studio Team
- The premium workspace now also includes an optional backend sync block; static hosting can stay on GitHub Pages while a separate API handles trusted entitlement refresh, shared company-profile sync, shared desk-roster/admin sync, shared team-seat sync, shared project handback sync, short-lived seat sessions, seat-aware shared writes, and backend audit pull
- Shared premium/backend posture now also supports seat access-code sign-in, session renew, and session revoke, so browser-held API keys can stay bootstrap-only instead of being the normal operating secret
- Shared team-seat administration now also includes explicit backend recovery actions for session revoke, lockout clear, access-code rotation, sign-in disable, and suspend/restore posture, all tied to a named admin seat and backend audit trace
- Shared team-seat recovery now also supports admin-issued one-time recovery codes that let the target seat set a fresh sign-in and receive a short-lived backend session without exposing a long-lived bootstrap secret
- Shared team-seat onboarding now also supports admin-issued one-time seat invites that let a saved seat claim or re-enroll its own sign-in cleanly without exposing a long-lived bootstrap secret
- Recovery and invite handoff now also support signed hash-fragment links, so admins can share a cleaner secure handoff link while keeping tokens out of normal server logs and browser autosave
- The optional backend now also serves a minimal same-origin `/admin` console for posture review, seat-session bootstrap, and a session-locked admin shell for shared-seat inspection, invite/recovery delivery, filtered audit timeline review, and server-generated audit TXT/CSV export without introducing a second calculator surface
- High-risk shared-seat actions now also sit behind a backend approval queue for `Rotate Access Code`, `Disable Shared Sign-In`, and `Suspend Seat`, so premium trust-sensitive posture changes can be explicitly requested, reviewed, audited, and then consumed on the existing recovery route
- The hosted admin shell now also includes a backend delivery trail for invite and recovery handoff, so issuance, delivery channel, recipient, and operator note can be recorded server-side instead of living only in operator memory
- The hosted admin shell now also includes a server-generated provider-ready dispatch pack for active invite and recovery items, so operators can copy or download a consistent handoff message without persisting raw one-time secrets at rest
- The hosted admin shell now also includes delivery acknowledgment, so invite/recovery handoff can be recorded as pending vs acknowledged instead of stopping at dispatch or delivery logging only

## Edit Model

Do not treat `pv_calculator_ui.html` as the source file anymore.

Edit these instead:

- `src/template.html`
- `src/styles/app.css`
- `src/scripts/modules/00-defaults.ts`
- `src/scripts/modules/10-engines.ts`
- `src/scripts/modules/20-reporting.ts`
- `src/scripts/modules/25-controller-payloads.ts`
- `src/scripts/modules/26-controller-state.ts`
- `src/scripts/modules/27-controller-guidance.ts`
- `src/scripts/modules/28-entitlements.ts`
- `src/scripts/modules/29-backend.ts`
- `src/scripts/modules/30-controller.js`
- `src/scripts/modules/40-init.js`

`src/scripts/app.js` is generated from those modules and should not be edited directly.

Then rebuild artifacts:

```bash
node scripts/build_artifacts.js
```

That command generates:

- `src/scripts/app.js` — generated concatenated browser bundle from the source modules
- `pv_calculator_ui.html` — standalone offline artifact
- `dist/web/pv_calculator_ui.html` — hosted static HTML entry
- `dist/web/assets/app.css`
- `dist/web/assets/app.js`

The build also vendors PDF export support into the standalone file and copies it to `dist/web/assets/vendor/`.

One rebuild updates both runtime targets from the same source:

- the standalone offline file at `pv_calculator_ui.html`
- the hosted multi-file bundle in `dist/web/`

The exact update technique is documented in `Helpful Md/DEPLOYMENT_ARTIFACTS_AND_RUNTIME.md`.

## Running

### Fastest local option

Open `pv_calculator_ui.html` directly in a browser.

### Local server

```bash
python3 serve.py --build
```

The server prefers `dist/web` when it exists, so local preview matches the hosted bundle.

### npm shortcuts

```bash
npm run build
npm run serve
npm run backend:serve
```

The backend script is optional. Use it only when you want server-backed entitlement sync or later shared premium state.

Release gates are also available now:

```bash
npm run release:gate:free
npm run release:gate:free:full
npm run bundle:free-static
npm run release:gate:premium
npm run release:gate:premium:full
npm run ops:check:premium
npm run ops:check:premium:strict
npm run test:backend-sqlite
npm run test:backend-backup
npm run test:backend-retention
npm run test:premium-ops
```

For the secure premium backend posture, also read:

- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/BACKEND_SQLITE_STORAGE_GUIDE.md`
- `Helpful Md/BACKEND_BACKUP_AND_RESTORE_GUIDE.md`
- `Helpful Md/PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md`
- `Helpful Md/BACKEND_SECURITY_AND_AUDIT_GUIDE.md`
- `Helpful Md/BACKEND_ADMIN_CONSOLE_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_DISPATCH_PACK_GUIDE.md`
- `Helpful Md/BACKEND_SEAT_SESSION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/TEAM_SEATS_AND_ROLE_POSTURE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`

After TS-10, rebuilding from source requires `npm ci` once in a fresh checkout so the local TypeScript compiler is available for native `.ts` source modules. Opening the generated runtime artifacts still does not require npm.

## Deployment

### Standalone distribution

Ship `pv_calculator_ui.html` by itself when you want the easiest offline handoff.

### Static hosting

Deploy `dist/web/` to any static host:

- GitHub Pages
- Netlify
- Vercel
- nginx / Apache
- any object-storage static site

The hosted bundle now includes both `dist/web/pv_calculator_ui.html` and `dist/web/index.html`, so a standard static host can open the app at `/` without adding a custom rewrite first.

For the lowest-friction repo-native free launch path, use:

- `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`

If you enable the optional premium backend sync, the static frontend can still stay on those hosts. You then host the API separately on a server-capable platform such as Render, Railway, Fly.io, a VPS, or a Node-capable PaaS.

For the exact deployment recommendation and stop-point rules, use:

- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/PREMIUM_V1_CLOSEOUT_CHECKLIST.md`

## Testing

```bash
npm run typecheck
npm run test:build
npm run test:free-bundle
npm run test:deploy-templates
npm run test:syntax
npm run test:global
npm run test:backend-admin
npm run test:backend-security
npm run test:premium-ops
npm run test:commercial
npm run test:finance
npm run test:decision
npm run test:architecture
npm run test:projects
npm run test:business
npm run test:ux
npm run test:templates
npm run test:schedules
npm run test:machines
npm run test:equipment
npm run test:threephase
npm run test:clusters
npm run test:plantscope
npm run test:compliance
npm run test:ts-setup
```

`npm run test:build` checks the generated standalone and hosted outputs.

`npm run test:syntax` also checks that build artifacts are current, so stale generated files fail fast.

`npm run typecheck` is now active for the stable calculation/reporting modules plus the typed controller payload/state helpers. Use `npm ci` to install the local compiler from `package-lock.json` before running it in a fresh checkout.

For UI inspection, these maintainer scripts are also available:

```bash
node _ui_height_debug.js
node _ui_visual_audit.js
```

`_ui_height_debug.js` measures the initial loaded page. `_ui_visual_audit.js` now reports both the initial height and the post-walkthrough height after the scripted interactions, so UI summaries do not mix the two states.

## Project Structure

```text
Advance Estimation/
├── src/
│   ├── template.html
│   ├── styles/
│   │   └── app.css
│   └── scripts/
│       ├── app.js
│       └── modules/
│           ├── 00-defaults.ts
│           ├── 10-engines.ts
│           ├── 20-reporting.ts
│           ├── 30-controller.js
│           └── 40-init.js
├── scripts/
│   └── build_artifacts.js
├── vendor/
│   └── README.md
├── dist/
│   └── web/
│       ├── pv_calculator_ui.html
│       └── assets/
│           ├── app.css
│           └── app.js
├── pv_calculator_ui.html
├── serve.py
├── _test_syntax.js
├── _test_v3_global.js
├── _test_commercial_ui.js
├── _test_finance_roi.js
├── _test_project_workspace.js
├── _test_ui_flow.js
├── _test_equipment_library.js
├── _test_three_phase_ui.js
└── Helpful Md/
```

## Product Scope

The calculator currently includes:

- Global regional presets across Africa, Americas, Europe, Asia, Middle East, and Oceania
- Installer and client workspaces
- Named browser projects with full-project autosave, save-copy, import, and export
- Quick-start project templates for residential backup, retail, tailoring, clinic, and pump-led jobs
- Business profile, operating intent, and continuity classification for business categories like tailoring, bakery, filling station, workshop, cold room, and mini-factory jobs
- Business starter templates for garment workshop, bakery, filling station, cold room, fabrication, and mini-factory scoping, plus grouped quick-start browsing by business type
- Business-aware machine archetype library for tailoring, bakery, filling station, refrigeration, workshop, and mini-factory equipment
- Smart business-context conclusion and quick-align actions so profile, operating intent, continuity class, schedule, and system type can be kept coherent without silent auto-overrides
- Smart plant-scoping and commercial-architecture conclusions with explicit quick-align actions, so heavier board, feeder, and interconnection stories stay reviewable instead of silently mutating
- Operating schedule presets plus per-load role and criticality modeling so daytime process demand, overnight preservation demand, and deferrable loads are not treated as the same problem
- Offline equipment reference library for normalized panel, inverter, and battery presets
- Offline supplier pricing packs with installer-safe manual override fields
- Supplier quote freshness tracking with benchmark/live status, quote date, refresh-window control, and supplier reference capture so benchmark pricing and live supplier-backed pricing are clearly separated
- Offline supplier quote import assistant for pasted email / chat text plus TXT, JSON, and header-aware CSV / ERP-style quote files, with preview/apply flow into the existing supplier quote and override fields
- Offline supplier refresh-brief generator that turns the current recommended design and quote-freshness state into a copyable supplier-facing refresh request without changing the engineering design
- Offline commercial presets with explicit apply workflow so proposal terms, lifecycle allowances, finance sensitivity, and scope wording can start from a reusable quote posture without changing the engineering design
- Guided section flow with collapsible cards, per-section summaries, and recommended-next-step navigation so the wider interface stays easier to read
- Focus-aware workflow coach that explains key commercial and technical terms in plain language while the user works
- Semantic help-popover buttons with hover, focus, tap, outside-click, and Escape-close behavior, so dense field guidance stays accessible without keeping all help text permanently visible
- Results Navigator plus collapsible result sections so the long output can be read in segments instead of one endless scroll
- TS-10 type boundary with shared domain/result typedefs, native TypeScript defaults, engines, reporting, and controller payload/state/guidance helper modules, typed domain-definition maps, normalized practical/comparison result contracts, and passing type checks on the stable core plus selected summary, workspace-state, and workflow-guidance builders, while keeping the DOM/event-heavy controller flow in plain JS for now

TypeScript stop point for now:
- the stable core and low-risk controller-adjacent helpers are typed
- the remaining DOM/event-heavy controller flow should stay in JS until there is a clear product reason to touch it
- Load aggregation with surge-aware appliance modeling
- Three-phase load assignment, auto-balancing, imbalance detection, and neutral-current estimation
- Three-phase modular inverter-cluster planning with per-phase module mapping, surge-aware adequacy checks, and installer/PDF reporting
- Commercial power architecture modeling for selective boards, shared battery throughput stress, generator-assist realism, and PV-field / MPPT grouping checks
- Commercial decision engine that recommends the least misleading site posture across battery-dominant off-grid, daytime solar-first bridge, hybrid generator/grid support, and essential-load-only backup
- Plant-scoping guidance that separates captive business-site plants, private multi-feeder distribution, and public-service / interconnection-heavy cases before a quote is treated like a plant study
- Recommended feeder-schedule guidance that turns the supported-load story into protected, assisted, and outside-promise feeder lanes with explicit source-path labels for plant and mini-plant jobs
- Installer-facing plant feeder brief export with source-coordination snapshot plus copy / TXT download actions for feeder and one-line preparation
- Utility / plant study handoff screening that now carries protected-board path share, shared battery throughput, battery DC protection fit, battery DC cable-path fit, AC feeder cable-path fit, PV DC window fit, PV source isolation fit, PV string-fuse fit, MPPT charge-path fit, generator board coverage and limiting-phase coverage, PV field / MPPT grouping, modeled AC current, modeled surge current, staggered-surge relief, breaker carry and surge screening, relay / export posture, transfer posture, generator carry plus surge and staggered-surge screening, limiting-phase and surge-limiting line current, neutral-current basis, equal-leg cluster penalty, and feeder-lane connected-load screening into the live result and study exports
- Board / source schedule output that turns feeder lanes into a lightweight board-handover table for one-line prep, source handover review, and promise-boundary discipline
- That board / source schedule now also carries lane-level current and source-basis screening so one-line prep can preserve feeder/source carry checks beside the promise lane
- It now also carries compact source, breaker, and transfer carry tags so the one-line draft can preserve the same live feeder/source story without inventing new shorthand later
- Structured study-handoff fields for `POC / Feeder / Node Ref`, `Fault Level / SCC Ref`, `Relay Scheme Basis`, `Transfer Scheme Basis`, `Protection Review Scope`, and `Export Control Basis`, carried into the live hint plus TXT/CSV study exports
- Board procurement / breaker / cable review output that reuses live cable and protection sizing so plant jobs can carry board, breaker, and cable intent into procurement and one-line prep
- Utility / mini-grid engineering lane output that tells the user when the project should leave the captive-site workflow and move into a separate study / interconnection track
- Formal study scope required scaffold that now makes the external feeder-fault, selectivity, interconnection/export-proof, acceptance-evidence, and engineer-of-record handoff explicit instead of silently implying the app already completed those studies
- Formal study work pack export that now groups the formal-study scope, live packet/study basis, key carried study rows, and board/source carry-through into one dedicated external-engineering handoff TXT
- Formal study data sheet export that now carries the same formal-study scope, trace rows, bounded carried study rows, and board/source carry tags as structured CSV for external engineering trackers
- Formal study intake checklist that now turns missing reference, owner, node/fault basis, deliverable-pack, and next-handback prerequisites into one visible kickoff gate
- Formal study screening snapshot that now pins the most important live duty, breaker, source, DC-window, and cable-path screening rows into the separate formal-study surface instead of making teams dig through the full study sheet
- Team handback and approval-flow preview in Project Workspace, with current owner, review desk, next handback target, due date, and release conditions kept visible without backend dependency
- Named team seats, seat state, and active operator posture for shared premium/backend actions, with server-side seat-aware guards now protecting shared writes once a shared seat library exists
- Admin-grade seat recovery and rotation workflow for shared seats, including backend-forced session revoke, temporary sign-in lockout clear, controlled access-code rotation, sign-in disable, and seat suspend/restore posture
- Admin-issued one-time recovery-code flow that lets a target shared seat set a fresh sign-in and receive a short-lived backend session without relying on a long-lived bootstrap key
- Explicit working-surface guidance that now tells the user whether the job still belongs to the normal system-design lane, the plant-engineering lane, or a separate utility / mini-grid lane
- Dispatch / load-shed / restoration sequence output that turns the protected, assisted, and excluded feeder story into a bounded operating handoff for plant jobs
- Interconnection / approval packet scaffold output that keeps the approval lane, deliverable basis, and formal interconnection escalation explicit for heavier utility-facing jobs
- Feeder / protection study input capture output that preserves feeder rows, breaker carry-through, cable runs, limiting-phase assumptions, cluster basis, POC / feeder / node references, protection-review scope, and export-control basis for later study prep
- That same study handoff now also includes bounded AC current, breaker carry, relay/export, transfer-path, generator-source, limiting-phase, feeder-lane, and fault-reference screening so the heavier lane gains real screening depth before it leaves the app
- Commissioning / witness-test prep output that carries a bounded energization and witness-prep scaffold beside the plant handoff
- Optional utility / mini-grid input surface that captures packet lane, metering posture, study basis, study track, protection-review scope, export-control basis, study owner, POC / feeder / node reference, fault / relay basis note, commissioning path, reference, and bounded engineering notes with a live smart-alignment advisor instead of silent auto-overwrite
- Utility deliverable-status tracking for `One-Line / SLD`, `Protection / Relay Pack`, and `Witness / Closeout Pack`, so packet, study, and commissioning exports carry real handoff readiness instead of only case-stage language
- Structured utility packet-routing fields for `Filing Channel`, `Primary Hold Point`, and `Response Return Path`, so packet exports can now preserve how the case is filed, what gate is controlling it, and how responses return through the live approval lane
- Structured utility packet-stage plus witness-party and witness-evidence inputs so heavier jobs can carry review maturity and acceptance detail without leaving the same workflow
- Structured authority-case lifecycle continuity with current revision / response plus submission / review trail, so packet, study, and witness exports stay aligned to the same live case revision
- Stage-aware packet progression discipline with progression gate, ready signals, blockers, and stage-exit handback, so heavier packet exports state what is complete and what moves next
- Stage-specific packet export discipline, so drafting, submission, review-response, and conditional-clearance packet exports each carry the right handoff emphasis instead of one flat generic checklist
- Utility case progression timeline carry-through, so packet summaries and exports now preserve the active stage posture, filed/review basis, controlled revision, open comment cycle, next handback, and witness/closeout track
- Stage-template packet packs, so packet summaries and exports now preserve the right bundle emphasis for draft, submission, review-response, and conditional-clearance stages
- Exportable utility-lane TXT briefs for packet basis, study-input carry-through, and commissioning / witness handoff, all generated from the same live plant object
- Structured utility-lane CSV data sheets for interconnection, feeder / protection study-input, and witness handoff, so the heavier lane can also leave the UI as field-by-field packet, study, and acceptance records instead of only narrative briefs
- Supported-load story reporting that separates protected, assisted, and outside-the-promised-path loads across results, proposal summaries, overview output, and PDF export
- Explicit promise-boundary wording so the quote now states what can be sold as protected continuity, what still depends on assist, and what must remain outside the promise
- In-app `How To Read Outcome Scores` guide under `System Summary` so users can interpret confidence, coping, strategy fit, readiness, compliance, and submission scores without guessing
- Region-aware commercial finance / ROI advisory with avoided-energy value basis, annual value, simple payback, 5-year / 10-year gross-value outlook, lifecycle sensitivity for annual O&M plus inverter/battery refresh allowances, a collapsed optional capital-stack view for tax benefit, debt service, and residual-value sensitivity, and side-by-side cash-versus-financed comparison when financing is modeled
- Locked benchmark/reference suite with both acceptance and constrained commercial scenarios for tailoring, garment work, bakery, filling station, cold room, fabrication, and mini-factory jobs
- Offline regional compliance packs with path-specific closeout guidance, required deliverables, and proposal/PDF reporting
- Authority-specific submission packs with staged deliverable tracking, approval-lane guidance, and handover readiness reporting
- Scenario playbook guides for installer/client use across residential backup, retail/POS, tailoring, bakery, filling station, cold room, workshop, mini-factory, and plant-engineering jobs
- Inverter, battery, PV array, MPPT, cable, and protection sizing
- Confidence scoring and proposal-readiness framing
- Commercial estimate, supplier-source traceability, package comparison, and proposal terms
- SVG system overview and PDF export
- In-app navigation guide and workflow hints so client and installer users can read the wider interface in the right order

## Design Principles

- Offline-first for core workflow
- Client-safe proposal output without hiding installer detail
- Transparent assumptions instead of black-box recommendations
- Curated offline equipment references instead of brittle live catalog dependencies
- Offline supplier benchmark packs keep pricing explainable even before distributor quotes are locked
- Supplier quote freshness should stay explicit and date-based so benchmark, fresh, aging, and stale pricing are not presented as the same commercial truth
- Supplier quote import should remain a reviewable assist layer that fills existing pricing controls, not a hidden pricing engine
- Commercial presets should stay explicit, editable starting points rather than silent automation or hidden pricing logic
- Feeder schedules should stay tied to the same supported-load and plant-scoping objects so protected, assisted, and excluded source paths never drift into a second hidden plant model
- Field smartness should stay explainable and reviewable. The app can recommend alignment and apply explicit quick actions, but it should not silently overwrite the real client brief.
- Regional compliance guidance stays offline and advisory, so safer field use does not depend on cloud services
- Submission-pack guidance should stay structured and region-aware without pretending to replace stamped engineering responsibility or local authority judgment
- Static deployment simplicity preserved even as source becomes modular
- Fast template-based starts without risking accidental overwrite of named browser projects
- Global-first product intent with the selected location profile driving region-specific voltage, frequency, climate, compliance, and pricing assumptions
- Business classification should steer defaults, sample loads, readiness, and proposal framing without silently forcing three-phase topology
- Operating schedules and load priority should sharpen the business recommendation without mutating the installer's machine list behind the scenes
- Machine archetypes should improve commercial realism without replacing installer judgment on final wiring, protection, and OEM parallel rules
- Progressive disclosure should reduce UI load without hiding expert controls from installer mode
- Commercial architecture checks should expose board strategy, battery-current stress, generator dependency, and MPPT grouping assumptions before a quote is treated as field-safe
- Commercial decision logic should recommend the most honest operating posture for the site instead of only rewarding larger hardware
- Plant-scope guidance should distinguish captive site plants, private-distribution jobs, and public-service / interconnection-heavy cases without pretending to replace final feeder, selectivity, or utility studies
- Working-surface guidance should stay explicit, so the user always knows whether they are still reading a normal site design, a plant-engineering handoff, or an out-of-scope utility lane
- Dispatch guidance should stay bounded and operationally useful without pretending the app already completed a formal dispatch study
- Utility-lane packet, study-input, and commissioning blocks should stay tied to the same plant-scoping object so heavier engineering handoff does not drift into a second hidden plant model
- Utility-lane inputs should stay optional, explicit, and scoped so normal captive-site jobs do not get buried under unnecessary engineering controls
- Commercial finance should stay advisory, strategy-aware, and offline-first rather than pretending to be a bankability, debt, or tax-optimization engine
- Benchmark references should prove both clean acceptance cases and deliberate over-promise failures so the product stays honest under real commercial pressure

## PDF Dependency

Core sizing and quoting remain backend-free.

PDF export is now bundled locally by default through:

- `vendor/jspdf.umd.min.js`
- inline inclusion in standalone builds
- local asset inclusion in hosted builds

If that file is ever removed, the build falls back to the CDN path and the app now fails with a direct PDF-specific message instead of a generic crash when the library is unavailable.

## Reference Docs

- `Helpful Md/APPLICATION_SUMMARY.md`
- `Helpful Md/BENCHMARK_PROJECTS_AND_SUPPORT_ENVELOPES.md`
- `Helpful Md/CLIENT_UI_GUIDE.md`
- `Helpful Md/TEAM_SEATS_AND_ROLE_POSTURE_GUIDE.md`
- `Helpful Md/DEPLOYMENT_ARTIFACTS_AND_RUNTIME.md`
- `Helpful Md/FORMULAS_AND_FACTORS.md`
- `Helpful Md/INSTALLER_UI_GUIDE.md`
- `Helpful Md/COMMERCIAL_VERTICALS_IMPLEMENTATION_PLAN.md`
- `Helpful Md/COMMERCIAL_FINANCE_AND_ROI_GUIDE.md`
- `Helpful Md/AUTHORITY_SUBMISSION_PACKS_GUIDE.md`
- `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md`
- `Helpful Md/PLANT_SCOPING_AND_MINIGRID_BOUNDARY.md`
- `Helpful Md/PLANT_ENGINEERING_SURFACE_GUIDE.md`
- `Helpful Md/PLANT_DISPATCH_AND_RESTORATION_SEQUENCE_GUIDE.md`
- `Helpful Md/PRODUCT_STATUS_SCORECARD.md`
- `Helpful Md/SCALABLE_ARCHITECTURE.md`
- `Helpful Md/SUPPLIER_QUOTE_FRESHNESS_GUIDE.md`
- `Helpful Md/SUPPLIER_QUOTE_IMPORT_GUIDE.md`

## License

[MIT](LICENSE.txt) © 2026 Leebartea
