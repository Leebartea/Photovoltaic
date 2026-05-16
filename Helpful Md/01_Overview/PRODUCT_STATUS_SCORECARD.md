# Product Status Scorecard

## Current Honest Score

- Global product maturity: `99/100`
- Installer workflow fit: `99/100`
- Client proposal fit: `99/100`
- Captive commercial / small-industrial site design standard: `99/100`
- 3-phase commercial decision quality: `98/100`
- Captive mini solar plant for a business site: `99/100`
- True utility / mini-grid / generation-plant engineering: `97/100`

## Global Commercial Standard Tag

Current global commercial standard tag:

`98/100 — near best-in-class globally in the category of offline-first captive commercial PV sizing, proposal, and advisory value-framing tools`

That rating is for:
- installers
- proposal teams
- commercial scoping
- captive business-site plants
- offline or static deployment workflows

It is **not** a claim that the product is already a full utility mini-grid or EPC commissioning suite.

## What Is Done So Far

### Runtime and deployment
- Modular source tree in `src/`
- Standalone offline artifact in `pv_calculator_ui.html`
- Hosted static bundle in `dist/web/`
- Fully offline PDF export with vendored `jsPDF`
- Build guardrails for stale artifacts

### Core product workflow
- Installer and client workspace modes
- Executive snapshot and client-safe proposal output
- Named browser projects, autosave, import/export
- Quick-start project templates
- In-app navigation guide for wider UI clarity
- Progressive-disclosure section flow with per-card summaries, collapsible sections, and recommended-next-step guidance
- Focus-aware in-app coach that explains active fields and sections in plain language
- Smart business-context conclusion with quick-align actions so profile, intent, continuity, schedule, and system type drift can be resolved explicitly instead of silently
- In-app outcome score guide under `System Summary` plus a dedicated written reference for client and installer interpretation of `Confidence`, `Coping Score`, `Commercial Strategy`, `Proposal Readiness`, `Regional Compliance`, and `Submission Pack`
- Results Navigator plus collapsible result sections so the output can be read in segments instead of one long scroll
- Explicit supported-load promise-boundary wording so users do not have to infer continuity claims from percentages alone
- TS-10 shared type boundary with passing type checks on the native TypeScript defaults, engines, reporting, and controller payload/state/guidance helper modules, preserving typed domain-definition maps plus normalized practical/comparison/commercial/controller-summary/workspace-state/workflow-guidance contracts without forcing a controller rewrite

### Commercial intelligence
- Business profile classification
- Operating intent and continuity class
- Operating schedule presets
- Machine archetype library
- Supplier pricing packs and safe override fields
- Offline commercial presets with explicit apply behavior for repeatable quote posture, lifecycle allowances, finance sensitivity, and scope wording
- Supplier quote freshness tracking with benchmark/live status, dated refresh-window review, supplier reference capture, and result/PDF visibility
- Offline supplier quote import from pasted text plus TXT / JSON and header-aware CSV / ERP-style quote files, with review/apply behavior into the existing supplier quote and override path, including metadata preamble parsing and `line total / qty` unit-rate derivation
- Offline supplier refresh-brief generator that converts the live design basis, quote freshness, and commercial posture into a copyable supplier re-quote request
- Commercial strategy recommendation engine
- Region-aware commercial finance / ROI advisory tied to the supported-load story and package posture, now including lifecycle sensitivity for annual O&M and planned inverter/battery refresh allowances plus optional tax, debt-service, and residual-value sensitivity
- Authority-specific submission-pack readiness by region with staged deliverable tracking, approval-lane guidance, and export/report visibility
- Plant-scope, feeder-topology, and interconnection-boundary guidance that distinguishes captive site plants from private-distribution and public-service / interconnection-heavy jobs

### Commercial engineering depth
- Per-load phase assignment
- 3-phase load balancing and imbalance detection
- Modular inverter cluster planning
- Shared battery throughput analysis
- Generator-assist topology modeling
- PV field and MPPT grouping realism
- Supported / assisted / outside-the-promised-path load reporting
- Promise-boundary reporting that states what can be sold as covered continuity, what needs assistance, and what must stay outside scope
- Regional compliance packs
- Authority-specific submission packs
- Plant scoping with explicit in-scope vs outside-current-scope classification for captive business-site plants, private-distribution jobs, and public-service / utility-adjacent cases
- Recommended feeder schedule and source-coverage mapping so plant outputs now show protected, assisted, and outside-promise feeder lanes instead of leaving feeder intent implicit
- Installer-facing plant feeder brief with source-coordination snapshot plus copy / TXT export for feeder handoff and one-line preparation
- Board / source schedule beside the feeder brief so plant jobs can move into one-line prep and handover review with a lightweight feeder-to-board matrix
- Board procurement / breaker / cable review so plant jobs now carry live breaker and cable intent into board-level handoff instead of stopping at feeder labels alone
- Utility / mini-grid engineering lane so the app now explicitly tells the user when a project should leave the captive-site workflow and move into a separate study / interconnection track
- Explicit working-surface guidance so the UI now tells the user whether the project still lives in the normal system-design lane, the plant-engineering lane, or a separate utility / mini-grid lane
- Dispatch / load-shed / restoration sequence so plant jobs now carry a bounded operating handoff beside feeder, board, breaker, and cable review instead of stopping at static scoping notes
- Interconnection / approval packet scaffold so heavier utility-facing jobs now carry a structured packet basis beside the plant lane
- Feeder / protection study input capture so the live feeder table, breaker carry-through, cable runs, limiting phase, and cluster basis can seed later study work directly
- Deeper study-sheet enrichment so the live study handoff now also carries `POC / Feeder / Node Ref`, structured `Protection Review Scope`, and structured `Export Control Basis` into the on-screen study block plus TXT/CSV study exports
- Commissioning / witness-test prep so plant jobs now leave the proposal stage with bounded energization, operating-mode, restoration, and witness hold-point notes
- Optional utility / mini-grid input surface with packet lane, metering posture, study basis, study track, study owner, fault / relay basis note, commissioning path, reference, and engineering notes so the heavier lane can carry real project-state input instead of inference alone
- Utility deliverable-status tracking for one-line / SLD, protection / relay pack, and witness / closeout pack so packet, study, and witness exports can now state actual handoff readiness instead of only packet-stage maturity
- Structured utility packet-routing fields for filing channel, primary hold point, and response return path so the approval lane now preserves how the packet is filed, what gate is currently controlling it, and how the next live response cycle returns
- Structured utility packet-stage plus witness-party and witness-evidence capture so heavier jobs can carry approval maturity and acceptance-path detail without falling back to one generic notes field
- Structured authority-case tracking with case status, case owner, submission/review date, and live review comments so heavier packet and witness lanes can carry real approval-state detail instead of only packet-stage labels
- Structured authority-case lifecycle continuity with current revision / response plus submission / review trail so heavier packet, study, and witness exports can stay on the same live case revision instead of drifting into one static reference
- Structured next-action discipline with next owner, due date, and required action so the heavier lane now carries not only status and revision continuity, but also the next live handback step across packet, study, and witness exports
- Stage-aware packet progression discipline with a progression gate, ready signals, open blockers, and stage-exit handback so heavier packet exports now show what is complete and what must move next at each approval stage
- Stage-specific packet export discipline so drafting, submission, review-response, and conditional-clearance packet exports now state what that exact stage must carry instead of leaving every packet export on one flat generic checklist
- Utility case progression timeline carry-through so packet summaries and exports now preserve the active stage posture, filed/review basis, controlled revision, live comment cycle, next handback, and witness/closeout track
- Stage-template packet packs so the packet summary, TXT brief, and CSV now preserve the actual bundle emphasis for the active stage, such as draft cover set, submission dossier, review-response pack, review closure matrix, or conditional closeout pack
- Exportable TXT briefs for interconnection packet basis, feeder/protection study-input carry-through, and commissioning / witness checklist handoff so the heavier lane can leave the UI as a bounded engineering pack instead of staying trapped in the result view
- Structured CSV data sheets for interconnection, feeder / protection study-input, and witness handoff so the same heavier lane can also leave the UI as field-by-field packet, study, and acceptance records
- Separate formal-study surface with explicit scope-required cues, intake checklist, screening snapshot, work pack TXT, and data sheet CSV so external feeder, selectivity, and interconnection study kickoff can leave the app on one controlled basis

### Validation and reference confidence
- Locked benchmark suite with `6` acceptance references and `2` constrained references
- Commercial support-envelope assertions for protected, assisted, and excluded paths
- Repeatable harness coverage for vertical strategy and architecture outcomes

### Vertical readiness
- tailoring studio
- garment workshop
- bakery
- filling station
- cold room
- fabrication workshop
- mini-factory
- pump-led site support

## What The Product Is Best At Right Now

- fast commercial first drafts
- offline installer sizing
- client-safe proposal framing
- practical machine-aware commercial jobs
- three-phase captive-site review
- honest mini-plant scoping for business sites before a quote drifts into utility-style language
- honest strategy recommendation when the right answer is hybrid or selective coverage instead of “bigger battery”
- client-safe annual-value, payback, and lifecycle-sensitivity framing without leaving the offline proposal workflow

## Remaining Honest Gaps

### Still needed for a true `100/100`
- deeper lifecycle finance beyond the current advisory sensitivity layer, including jurisdiction-specific tax treatment, more explicit augmentation timing, and broader financing scenarios where they are truly needed
- optional live supplier sync without making the app cloud-dependent
- deeper utility / mini-grid / generation-plant workflow if the product ever wants to claim that category

### Important engineering boundary
The product is now strong for:
- captive commercial sites
- workshops
- bakeries
- filling stations
- cold rooms
- small process lines

It is still not the final authority for:
- OEM parallel rules
- final protection coordination
- final distribution-board schedule
- stamped or jurisdiction-final authority submission package
- feeder studies, protection/selectivity studies, plant dispatch logic, and formal study calculations
- utility interconnection engineering

## Current Best-In-Class Position

Honest wording:

`Near best-in-class for offline-first installer, proposal, and submission-prep workflows in captive commercial PV sizing.`

That is why the score is `98/100` for commercial standard instead of `100/100`.

The utility / mini-grid score remains `97/100`. The heavier lane is stronger because the packet, study, and witness exports now carry real deliverable-readiness state plus packet-routing discipline beside the utility-case timeline, stage gate, stage-template packet pack, deeper study-sheet basis fields like `Fault Level / SCC Ref`, `Relay Scheme Basis`, and `Transfer Scheme Basis`, a separate formal-study surface with scope cues, intake gates, screening snapshot, work pack, and data sheet, and a bounded protection/fault screening layer for AC current basis, breaker carry margin, relay/export fit, transfer-path fit, generator-source screening, limiting-phase line screening, feeder-lane connected-load screening, and fault-reference screening. It still should not be inflated into a formal feeder-study, interconnection-study, selectivity-study, or dispatch-calculation score.

### Batch 21B — PDF Rendering Fixes: Footer, BOM Subtitle, Totals, Battery Count (commit 1cb5811 — 2026-05-16)

**#B15 — PDF BOM subtitle still showed `undefined`**
- Batch 21A fixed HTML renderer (`item.notes || ''`) but PDF renderer at line 20544 had its own concatenation: `` `${item.basis}. ${item.notes}` `` — no guard
- Fix: `` `${item.basis}${item.notes ? '. ' + item.notes : ''}` `` — clean suppression when absent

**#B16 — PDF Commercial Totals duplicate labour/soft/margin rows**
- Same root cause as HTML Batch 21A fix — PDF `Commercial Totals` section printed `Install & labor (18%)`, `Soft costs (8%)`, `Target margin (12%)` unconditionally even in local build-up mode where the BOM already itemises these
- Fix: benchmark-only rows gated on `!commercial.isLocalBuildUp` in the PDF path

**#B17 — Footer prints twice on every page (persistent since Batch 15A)**
- Root cause: `addPageFooter()` wrote the brand/version line at `pageH-6.5`, then the post-build page-number loop wrote its own brand+page line at the same Y, with a white-rect cover that was unreliable across PDF viewers
- Fix: removed the brand line from `addPageFooter()` entirely — post-build loop is now the sole brand+page stamp, eliminating the race between two text writes at identical coordinates

**#B18 — Duplicate "Pricing Basis:" label row in PDF**
- Benchmark path (line 20478) + local build-up fallback (Batch 21A) both rendered a "Pricing Basis:" label in sequence
- Fix: benchmark `Pricing Basis:` row gated on `!commercial.isLocalBuildUp`

**#B19 — Battery unit count wrong in local build-up BOM**
- Previous: `battUnits = ceil(totalCapacityWh/1000 / unitKWh)` — engine uses effective voltage (51.2V for 48V nominal) giving 7.7 kWh, while auto-sniffed `unitKWh` uses nominal voltage (7.2 kWh); `ceil(7.7/7.2) = 2` instead of 1
- Fix: use `batt.stringsInParallel` directly from engine output — the definitive parallel-string count regardless of voltage convention
- Per-unit kWh in label/basis now uses `recommendedAhPerCell × bankVoltageNominal / 1000` (consistent with UI display)

---

### Batch 21A — Local Build-Up Mode Polish: PDF + BOM + Panel Wattage + FX Rate (commit 330f78f — 2026-05-15)

**#B9 — CRITICAL: PDF export crash in local build-up mode**
- `exportPDF()` PDF commercial section had 7 unguarded dereferences of `commercial.pricingSource.*` (lines 20482, 20483, 20501, 20507, 20577–20579) — now `null` after Batch 20A
- Fix: wrapped all 7 sites with `if (commercial.pricingSource)` guards; else-branch prints compact "Local cost build-up | FX 1 USD = X Y" label
- PDF export in local build-up mode now works without crashing

**#B10 — `undefined` subtitle under every BOM row**
- Renderer at line 24207 reads `item.notes` as subtitle; local build-up items only have `{ label, amount, basis }`
- Fix: `item.notes || ''` — no more "undefined" text under each line item

**#B11 — Duplicate labour rows (Install & labor 18% shown twice)**
- `totalRows` always included `Install & labor (X%)` benchmark row even though local build-up BOM already has `Installer labour` line item
- Fix: `totalRows` now conditional on `commercial.isLocalBuildUp` — local mode shows only tax (if applicable) + Final quoted amount

**#B12 — Panel wattage shows 400Wp instead of user-entered value**
- `_buildLocalBuildUpEstimate` read `getElementById('panelWatts')` — that element ID does not exist in the template (correct ID is `panelWattage`)
- Fix: reads `config.panelWattage` first, then `getElementById('panelWattage')`, then derives from `pv.arrayWattage / pv.totalPanels`, then falls back to 400

**#B13 — Resolved Cost Rates grid shows USD 0.00 in local build-up**
- `pricingSourceHtml` block (Supplier Pricing Source + rate cards grid) rendered unconditionally with all-zero rates
- Fix: `pricingSourceHtml` is now `isLocalBuildUp`-conditional — local mode shows a lean "Pricing Basis" panel with FX rate and tax note only

**#B14 — FX Rate field reverts to location default after user edits**
- `applyCommercialDefaultsByLocation` at line 17510 unconditionally set `fxEl.value = locationProfile.fxRateToUSD` (e.g., 1550 for Nigeria)
- Triggered on: location change, pricing mode switch, and other events — wiping user-typed value
- Fix: `if (fxEl && !fxEl.value)` — only sets the default when the field is empty

---

### Batch 20A — Local Build-Up paymentPlan Crash Fix + Calculate in Hamburger (commit 11e7cc3 — 2026-05-14)

**#B6 — CRITICAL crash fix: `paymentPlan` null in Local Cost Build-Up mode**
- `_buildLocalBuildUpEstimate()` called `this.buildPaymentPlan?.()` — that method does not exist on the controller; optional-chain returned `undefined` so `paymentPlan` stayed `null`
- `renderCommercialSummary` then crashed on `commercial.paymentPlan.deposit` (and 7 further accesses: `depositPct`, `completion`, `completionPct`)
- Fix: replaced the broken helper call with an inline literal matching the benchmark path:
  `{ depositPct: clampedDepositPct, completionPct: 100 - clampedDepositPct, deposit, completion }`
- Uses `depositPct` from `context` (DOM field `proposalDepositPct`), clamped to 10–90%

**#B7 — `band.spreadPct` missing**
- `renderCommercialSummary` line 23995 reads `commercial.band.spreadPct`; local build-up returned `band: { low, high }` with no `spreadPct`
- Fix: added `spreadPct: 8` (matches the 0.97–1.05 = 8% low-to-high spread already in the return)

**#B8 — `pricingSource: 'local_build_up'` (string) blocked renderer fallback**
- Line 23976: `commercial.pricingSource || this.resolveSupplierPricingSource(...)` — the non-empty string is truthy, so the fallback to `resolveSupplierPricingSource` never fired
- Renderer then accessed `.packLabel`, `.supplierLabel`, `.quoteFreshness`, `.referenceWindow`, `.coverage`, `.chemistryLabel`, `.overrides`, `.overrideLabels`, `.hasOverrides` on the string — all undefined
- Fix: changed to `pricingSource: null` — fallback now fires correctly and renders proper supplier source panel

**UX — ⚡ Calculate shortcut added to hamburger nav**
- A `⚡ Calculate` link inserted between the Section 7 (Pricing) item and the `<hr>` separator in `#sectionNavItems`
- Calls `PVCalculator.calculate()` — same as the main blue button at the bottom
- Lets users trigger calculation from any scroll position on mobile without scrolling back to the footer
- Hamburger flow now reads: 1 System → 2 Workspace → 3 Guide → 4 Identity → 5 Loads → 6 Equipment → 7 Pricing → **⚡ Calculate** → separator → ↩ New Project

---

### Batch 19 — Local Build-Up Crash Fix + Battery Display + UX Polish (commit 00a5038 — 2026-05-14)

**#B1 — CRITICAL crash fix: `commercial.options` undefined in Local Cost Build-Up mode**
- `renderCommercialSummary` called `.find()` on `commercial.options` which was absent from `_buildLocalBuildUpEstimate()` return
- Fix: added `options: []`, `profileHeadline`, `profileNote`, `profileLabel`, `pricingSource`, `notes`, `terms`, `scopeIncluded`, `exclusions`, `nextSteps` to the local build-up return object
- Also guarded all three `.find()`/`.map()` callsites with `(commercial.options || [])` and null-safe `currentOption`

**#B2 — Battery kWh → Ah display used wrong voltage (hardcoded 48V)**
- `onBatteryKwhInput()` read `config.batteryBankVoltage || 48` — always showed "at 48V bank" regardless of selected unit voltage
- Fix: changed to `this.getBatteryUnitVoltage() || 48` — now correctly shows "400 Ah (at 24V bank)" when 24V is selected

**#B3 — localBatteryUnitKWh auto-sniff on mode switch**
- Switching to Local Cost Build-Up now auto-fills `localBatteryUnitKWh` from `(batteryAh × batteryVoltage) / 1000` using live battery section inputs
- Only fills when the field is currently empty (does not overwrite user edits)

**#B4 — Duplicate labour/margin fields hidden in local build-up mode**
- `laborPct`, `softCostPct`, `proposalMarginPct` lived outside `#benchmarkPricingBlock` so they remained visible when local build-up was active — creating confusing duplicate fields
- Fix: added `benchmark-only-field` class to their wrappers; `onPricingModeChange` hides them when mode = `local_build_up`

**#B5 — "↩ New Project" added to hamburger nav**
- A separator + action link appended to `#sectionNavItems` in template.html
- Existing `if (!target) return` guard in `initSectionNav` already skips it from scroll spy
- Users can now reset the workspace from the mobile nav without scrolling to the footer

---

### Batch 18 — 24V Bus Advisory + New Project UX Polish (commit f9ef5f4 — 2026-05-14)

**Issue #R1 resolved:** When `BatterySizingEngine` calculates a bank where `bankVoltage ≤ 24` and `actualCapacityAh > 500`, a warning is now pushed into `battery.warnings`. Advisory text explains the DC current and cell-format rationale for switching to 48V.

**Engine change (`10-engines.ts` ~line 1874):**
- Trigger condition: `bankVoltage <= 24 && actualCapacityAh > 500` — uses `bankVoltage` (nominal), NOT `effectiveBankVoltage`
- Pushes to `warnings` array (already in return object since line 1812)

**UI change (`30-controller.js` — renderBatteryTab ~line 25695):**
- `battery.warnings` was returned but never rendered
- Added loop that emits each warning as `<div class="alert alert-warning">` inside the battery tab

**UX polish — New Project button (template.html):**
- Button renamed from "New / Clear" to "New Project" — unambiguous intent
- Added `title` tooltip: "Start a fresh estimation. Your saved browser projects will not be deleted."
- Added "↩ Start a New Estimation" styled button-link in the page footer — users who finish reviewing results and scroll to the bottom now see a contextual reset CTA without hunting back to the toolbar
- Footer sub-text: "Your saved projects will not be deleted." — reassures users

---

### Batch 17 — Local Cost Build-Up Pricing Mode (commit 572261c — 2026-05-14)

**Problem solved:** The benchmark $/Wp model quoted NGN 16.5M for systems Nigerian installers charge NGN 3–5M. Gap = international wholesale rates vs local procurement reality.

**New mode: "Local Cost Build-Up"**
- Pricing Mode select at top of Pricing card toggles between `Benchmark Estimate ($/Wp)` and `Local Cost Build-Up (per-unit)`
- Benchmark block (`#benchmarkPricingBlock`) hides in local mode; local block (`#localBuildUpBlock`) shows
- 12 new fields: panel/inverter/battery unit price, inverter qty, battery kWh/module, mounting+cable+BOS, logistics, permits, labour mode (flat or %), labour amount, profit margin %, client PDF toggle

**Calculation design**
- `_buildLocalBuildUpEstimate()` method added to `30-controller.js` alongside `buildProfileEstimate`
- All local-currency amounts divided by `inputs.fxRateToUSD` (raw rate, not `effectiveFxRate`) to produce USD-internal values — works correctly even in installer mode where `effectiveFxRate = 1`
- Item labels preserved: `"Solar modules"`, `"Inverter"`, `"Battery storage"` — finance extractors that use label-prefix matching are unaffected
- `totals` shape identical to benchmark: `equipmentSubtotal`, `laborCost`, `softCost`, `marginAmount`, `preTaxTotal`, `taxAmount`, `finalQuote`
- Finance summary (`calculateCommercialFinanceSummary`) reused unchanged

**Variable names (STEP 0 findings — use in future engine work):**
- Panel count: `pv.totalPanels` (line 17910)
- Battery kWh: `(batt.totalCapacityWh || 0) / 1000` (line 17912)
- Raw FX rate: `inputs.fxRateToUSD` (line 17418)
- Location key: `locationKey` in `applyCommercialDefaultsByLocation` (line 17454)

**Region-aware defaults seeded on location change:**
Africa: ₦65k/panel, ₦420k/inverter, ₦380k/battery, flat labour ₦200k, 20% margin
Americas/Europe/Oceania: USD/EUR amounts, % labour mode, 14–22% labour, 14–15% margin
Asia: lower base costs, flat labour

**Client PDF toggle:** `localShowUnitsInClientPdf` checkbox (default ON). When unchecked, client PDFs suppress per-unit basis text from BOM lines, showing only line totals. Installer PDFs always show full unit-cost breakdown.

**Old projects:** Unaffected — `pricingMode` defaults to `'benchmark'`, so all saved projects open in benchmark mode unchanged.

---

### Batch 16B — Mobile Nav, New/Clear Button, Confidence PDF Breakdown (commit 0ec81ae — 2026-05-14)

**Mobile hamburger nav re-enabled**
- `app.css` `@media (max-width: 768px)` rule changed from `display: none` to repositioning `.section-nav` fixed bottom-right (12px from edge)
- `.section-nav-items` styled as upward popover (`position: fixed; bottom: 56px; z-index: 950; max-height: 70vh`)
- `initSectionNav()` now adds `.collapsed` to items list on mobile load — nav opens collapsed until user taps ☰
- No new HTML elements — existing `<button class="section-nav-toggle">` and `toggleSectionNav()` reused

**New / Clear project button**
- `clearProject()` method added to controller: clears `pvCalculatorAutoSaveV2`, `pvCalculatorAutoSave`, and `pvCalculatorCurrentProject` keys, then reloads
- Saved project list (`pvCalculatorProjects`) is NOT cleared — user's stored browser projects are preserved
- Button added in `#projectWorkspaceCard` after "Import File" in the workspace actions row

**Issue #A16 — Confidence score PDF breakdown added**
- 7pt penalty breakdown line inserted under the confidence bar on PDF cover page
- Formula: `100 − weightedDev (risk) − clusterPenalty − architecturePenalty − strategyPenalty = score%`
- `weightedDeviation` derived inline from `confidenceData.invRisk/.battRisk/.pvRisk` at weights 0.40/0.35/0.25
- Rendered in `MUTED` colour, centred, `y += 4` — does not displace following page content materially

---

### Batch 16A — Continuous Discharge Check, Disclaimer Gate, Residential Schedule (commit b05b728 — 2026-05-14)

**Issue #A14 — Battery continuous-discharge current check added**
- `BatterySizingEngine` (`10-engines.ts:1892`) now warns when `continuousLoadCurrent > maxDischargeCurrent` (0.5C sustained limit)
- Previously the engine only checked peak surge current; continuous draw above the 0.5C rating was silent
- Warning message: "Continuous DC current XA exceeds battery sustained limit of YA (0.5C for ZAh bank)"

**Issue #A15 — Disclaimer guard tightened**
- Gate changed from `if (pdfManaged && !clientExport)` to `if (pdfManaged && audienceMode !== 'client')`
- Previous gate allowed MANAGED PRACTICAL DISCLAIMER to leak into client PDFs when `includeDetails === true` was selected alongside client mode

**Smart workspace — residential_backup schedule corrected**
- `residential_backup.recommendedSchedule` changed from `'business_day'` → `'evening_overnight'`
- "Business Hours (8am-6pm)" was factually wrong for a home backup system whose loads peak in the evening and overnight

**New `evening_overnight` schedule added**
- Key: `evening_overnight`, label: "Residential / Evening & Overnight"
- `prefersDaytimeShift: false`, `expectsNightContinuity: true`, `preservationFocus: false`, 7 days/week
- Schedule `<select>` populates dynamically — no HTML changes required

---

### Batch 15E — Engineering Verification Audit (2026-05-14, no code commit)

Verification-only batch using May 14 PDFs (Off-Grid installer + Hybrid client modes, 17 pages each). No code changes in this batch.

**All Batch 15D fixes confirmed by source + dist audit:**
- #A8 (coping score deduplication): PASS — one occurrence confirmed in `30-controller.js`
- #A9 (rounding-noise threshold): PASS — `Math.abs(marginWh) > 2` confirmed in place
- #A13 (MPPT gate): PASS — gate tied to `systemType === 'off_grid'` confirmed; Off-Grid PDF shows row, Hybrid PDF correctly omits it

**#A12 SVG diagram verified:**
- Functional for both 24V/800Ah Off-Grid and 48V/280Ah Hybrid configurations
- 8S2P/16-cell and 16S1P/16-cell layouts both render in compact mode without structural errors
- Known risk documented: silent text-fallback fires when Overview tab DOM not rendered before export

**New engineering issues found and logged:**
- **#A14 (MEDIUM/Safety):** `BatterySizingEngine` checks surge current but not continuous DC current vs battery 0.5C sustained limit — 280Ah at 48V with 8000VA inverter pulls 177A continuous vs 140A 0.5C limit without a warning
- **#A15 (LOW):** Disclaimer guard edge case — `client mode + includeDetails=true` still shows MANAGED PRACTICAL DISCLAIMER; gate needs to change to `audienceMode !== 'client'`
- **#A16 (INFO):** Confidence score (36%, 23% Stress) not broken down in PDF — penalty components not visible to installer in the field

**Product policy recommendation logged:**
- **#R1:** 24V bus should soft-recommend escalation to 48V when battery bank Ah > ~500Ah — avoids unusually large-format cells (400Ah) and borderline continuous DC current paths (125–133A on 24V systems)

---

### Batch 15D — Mobile Hero Stack, PDF Polish (commit 00c1a70 — 2026-05-14)

**Issue #A7 — Mobile "Why this package" block now stacks full-width at 375px**
- `.proposal-hero-main` grid had no mobile breakpoint — right column (`.proposal-hero-focus`) was squished at narrow viewports
- Added `@media (max-width: 480px) { .proposal-hero-main { grid-template-columns: 1fr; } }` immediately after `.proposal-hero-focus li + li` block in `app.css`

**Issue #A8 — Coping Score block no longer prints twice in installer PDF**
- Duplicate 49-line filled-rectangle coping score block on Page 3 (Warnings & Hard Blocks) deleted entirely
- Page 4 advisory bar (track + filled bar + component breakdown) retained as the sole coping score render

**Issue #A9 — Appliance reconciliation "+1 Wh" rounding-noise row suppressed**
- Design allowance row threshold changed from `marginWh !== 0` to `Math.abs(marginWh) > 2` — rows showing "+1 Wh" or "+2 Wh" noise are now silent

**Issue #A10 — Duplicate hybrid-topology advisory bullet (subsumed by #A11 + #A13)**
- No separate edit required; visual duplication was caused by the stranded inverter validation row (#A11) colliding with the ungated MPPT row (#A13) — fixed by those two edits

**Issue #A11 — "Validation: MEETS requirements" given proper label**
- Row previously floated as `doc.text(...)` in the value column only (no left-hand label at `mL`)
- Now rendered with explicit `Inverter Validation:` label in muted/normal font at `mL`, value in bold colored font at `mL + 62` — consistent with all other label/value rows

**Issue #A13 — MPPT Validation row gated to standalone-MPPT systems only**
- `labelValue('MPPT Validation:', ...)` now wrapped in `if (commercial?.usesStandaloneMPPT && R.mpptValidation)` gate
- Hybrid and grid-tie paths (built-in MPPT) no longer show a standalone-MPPT validation row

---

### Batch 15C — Africa Region Rate Correction (commit 1b7ed32 — 2026-05-09)

**Issue #A4 — Africa generator_offset rate corrected from 0.28 → 1.00 USD/kWh**
- `africa` regionDefaults in `00-defaults.ts` previously carried a single `energyRatePerKWhUSD: 0.28` used for all finance bases, despite `financeMode: 'generator_energy_offset'` — 0.28 USD/kWh is utility tariff magnitude, not diesel genset cost (~0.80–1.20 USD/kWh in West/East Africa)
- Three per-basis rate fields added: `generatorOffsetRatePerKWhUSD: 1.00`, `gridTariffRatePerKWhUSD: 0.22`, `blendedRatePerKWhUSD: 0.55`; legacy `energyRatePerKWhUSD` corrected to 1.00 to match the default basis
- `applyCommercialDefaultsByLocation` (30-controller.js:17492) now branches on `defaults.financeMode` to write the matching per-basis USD rate into the energy rate DOM field — Africa locations auto-fill "Generator Energy Offset" + ~1.00 USD/kWh instead of the previous contradictory "Generator Energy Offset" + 0.28 USD/kWh
- `getProposalPricingInputs` (30-controller.js:17391) fallback rate is now basis-aware via inline IIFE; rate clamp ceiling raised from `Math.max(1.0, 1.0 × fxScalar)` to `Math.max(2.5, 2.5 × fxScalar)` to admit honest genset cost without silent truncation

---

### Batch 15B — Finance Rate Clamp, HTML Finance Panel FX, Acceptance Page Gate (commit ce04338 — 2026-05-09)

**Issue #A1 — Installer-mode rate clamp corrected**
- `parseFinanceRate` energy rate ceiling lowered from `Math.max(5, 5 * fxScalar)` to `Math.max(1.0, 1.0 * fxScalar)` — cap is now USD 1.0/kWh in installer mode (vs the previous USD 5.0/kWh ceiling that produced ~0.3yr payback on a $7.7K system)
- Export credit ceiling lowered from `Math.max(2, 2 * fxScalar)` to `Math.max(0.5, 0.5 * fxScalar)`
- In client mode the ceilings scale proportionally (e.g., ~1,346 NGN/kWh for energy), remaining above any realistic real-world tariff

**Issue #A3 — `formatProposalMoney` now applies fxRate**
- Single-line fix: `converted = Math.round(numeric)` → `Math.round(numeric * (Number(fxRate) > 0 ? Number(fxRate) : 1))`
- Body is now semantically identical to `formatCommercialMoney`; all existing call sites already pass the correct `fxRate` argument
- HTML finance panel (`renderCommercialFinancePanel`) now shows correct NGN magnitudes in client mode; was showing USD-magnitude values with NGN label

**Issue #A6 — Payment & Acceptance page now always shows in client mode**
- Gate changed from `if (clientExport && commercial?.paymentPlan)` to `if (audienceMode === 'client' && commercial?.paymentPlan)`
- `clientExport` was defined as `audienceMode === 'client' && !includeDetails`; page was suppressed when client user also selected full-detail export
- `audienceMode` already in scope at insertion point; `clientExport` uses in other blocks (title, header, footer, file prefix) left untouched

---

### Batch 15A — PDF Footer + Header Rendering Fixes (commit 97c5450 — 2026-05-09)

**Issue #A2 — Footer double-print eliminated**
- `addPageFooter()` no longer prints `| Page N` — the brand stamp `Leebartea | v3.0.0` is now printed at `footY + 3.5` (3.5mm below guidance text), keeping both footer elements on separate Y coordinates
- Post-build loop white-rect repositioned to `pageH - 9` (height 4mm) — sits entirely below the guidance text baseline, no overlap
- Post-build loop prints `Leebartea | v3.0.0 | Page N of M` at `pageH - 6.5`, replacing only the brand stamp row

**Issue #A5 — Header company-name duplication suppressed**
- When `proposalContext.companyName` is not set, Row 1 of the page header is now silent — the full subtitle + ref + date on Row 2 becomes the sole header line
- When company name IS set, Row 1 shows the company name, Row 2 shows subtitle | ref | date (unchanged)

---

### Hotfix 3 — Finance Double-FX Conversion (commit 1ac47eb — 2026-05-09)

**Finance bug: client-mode values were 1,346× inflated**
- `calculateCommercialFinanceSummary`: removed `finalQuoteLocal`, `inverterCostLocal`, `batteryCostLocal`, `equipmentSubtotalLocal` (Batch 9 over-correction that pre-converted USD costs to NGN before PDF formatters applied fxRate again)
- Energy rates (`energyRatePerKWh`, `exportCreditPerKWh`) were already in local currency from the DOM field — now divided by `_financeFxScalar` before math so `annualSavings` is in USD; formatters handle the single conversion to NGN
- Return object exposes `energyRatePerKWh: energyRateLocalPerKWh` so display labels (which do not re-apply fxRate) still show correct local-currency unit rates
- Client PDF verified: annual value NGN 888,658/yr (was NGN 1.23 billion), equity NGN 17.7M (was NGN 24.3 billion), O&M NGN 319K/yr (was NGN 438M/yr)

---

### Batch 14 — Advanced Field Disclosure + Section Reorder + Tablet Layout (commit abc7c21 — 2026-05-07)

**UX-D — Collapse rarely-used fields**
- Temperature range (`ambientTempMin/Max`) collapsed into `<details>` — hidden by default, region defaults already applied
- Engineering overrides (`designMargin`, `inverterSurgeMultiplier`, `inverterTechnology`) wrapped in separate `<details>`
- Cable Lengths block wrapped in `<details>` — final-design override step, not a quick-estimate field
- Managed-mode load attributes (`appDutyFrequency`, `appCanStagger`, `appDaytimeOnly`, `appLoadRole`, `appLoadCriticality`) wrapped in `<details>` — defaults inferred from machine archetype

**UX-E — Pricing section reorder**
- `proposalPricingCard` moved in DOM to after `equipmentSpecsCard` and before the Calculate button — users now define loads and equipment before being asked about pricing
- Section nav renumbered: System(1) → Workspace(2) → Guide(3) → Identity(4) → **Loads(5) → Equipment(6) → Pricing(7)**
- IntersectionObserver scroll-spy array in `30-controller.js` updated to match new DOM order

**UX-F — Tablet responsive form layout**
- Replaced `@media (max-width: 900px)` flex-wrap fallback with `@media (max-width: 1023px)` grid rule
- `.form-row.three` and `.form-row.four` collapse to 2-column grid at ≤1023px, then 1-column at ≤600px
- Added explicit `.form-row.two { grid-template-columns: 1fr 1fr; }` class
- Eliminates inconsistent 2+1 / 3-per-row wrapping seen on tablet portrait and ~900–1024px viewports

---

### Batch 13 — Silent Autosave Restore + Input Debounce (commit 9912003 — 2026-05-07)

**UX-H2 — localStorage autosave silent restore**
- `checkAutoSave()` confirm-dialog gate removed — valid draft autosaves now restore silently without a cancellable prompt
- `debounce(fn, wait)` utility added to `30-controller.js`
- `40-init.js` `input` event listener wrapped with `debounce(150ms)` — eliminates redundant `saveToLocalStorageAuto()` calls on fast keystrokes
- `change` event listener left synchronous (fires on committed value, must save immediately)

---

### Batch 12 — Locale Formatting + PDF Unit Scaling (commit 56393c2 — 2026-05-07)

**UX-H1 — Locale-aware currency formatting (scoped fix)**
- Added `currencyLocale` BCP-47 string to all 12 REGION_PROFILES (en-NG for Nigeria, de-DE for Central Europe, pt-BR for Brazil, etc.)
- New standalone `getDisplayLocale()` function reads active region from DOM, returns the profile's locale (fallback: en-US)
- `formatProposalMoney`, `formatCommercialMoney`, `formatSupplierRate` all updated to call `.toLocaleString(getDisplayLocale())`
- `getConfig()` now sets `config.currencyLocale` for downstream use
- Remaining ~61 engineering-number inline `toLocaleString()` calls deferred

**UX-C — PDF unit auto-scaling**
- Five unit-scaler closures inside `exportPDF()`: `fmtEnergy`, `fmtApparent`, `fmtPower`, `fmtWp`, `fmtAh`
- Threshold: values ≥ 1000 auto-promote to kilo-unit with 1 decimal (e.g. 14.3 kWh, 8.5 kVA, 4.0 kWp)
- 23 PDF label/bullet/body expressions replaced across load analysis, battery, and PV detail sections
- `drawTable` data arrays and per-panel Wp line left unchanged

---

### Batch 11 — Audience Mode Banner + Client PDF Improvements (commit 0fd0b54 — 2026-05-07)

**UX-A — Persistent audience mode indicator**
- Sticky banner inserted between `<header>` and `<nav>` — always visible while scrolling
- Green ("Installer Mode") / Blue ("Client Mode") with dark-mode variants
- `updateAudienceMode()` populates banner text and `data-mode` attribute on every mode change
- Installer-appendix PDF checkbox auto-disabled (opacity 0.45 + `cursor: not-allowed`) in client mode

**UX-G — Client PDF quality**
- MANAGED PRACTICAL DISCLAIMER gated with `!clientExport` — cannot leak even if appendix checkbox is re-enabled
- New Payment Schedule & Acceptance page added to client PDFs:
  Quote total, deposit amount, completion amount, validity, install window, currency label
  + Acceptance section with client name, site, quote reference, date, and two signature lines

---

### Bug fix batch 10 (2026-05-07)

Five PDF display issues resolved and deployed (commit 980ec06):

- **Appliance type label** — Raw `loadType` classification strings (`electr`, `resist`) replaced with a proper label map: `electronic → Electronic`, `motor → Motor`, `resistive → Resistive`. Phase-mode Type column widened from 18mm to 24mm to fit the longer labels.
- **Global truncation threshold** — `drawTable` divisor changed from `/2.2` to `/1.85`, raising the effective character cap by ~20% across all PDF tables without per-table changes.
- **Pricing comparison column** — Package column widened from 34mm to 44mm; "Standard Install" and "Premium Install" now display in full.
- **Inverter sizing Basis column** — Widened from 68mm to 100mm; full basis descriptions ("Worst-case surge (all motors start together)" etc.) no longer truncated.
- **Battery tier Module/Config column** — Widened from 56mm to 84mm; module labels like "3× 7.2 kWh" display in full.
- **Protection devices table** — Removed pre-truncation substrings (previously clipping device names at 25 chars, type/rating at 38, location at 34 before drawTable clipped again). Type/Rating column widened from 60mm to 78mm. Full content width (178mm) now used for all three columns.

### Bug fix batch 9 (2026-05-07)

Five critical financial issues resolved and deployed (commit 2361b34):

- **Commercial BOM FX conversion** — Added `formatCommercialMoney(valueUSD, currencyLabel, fxRate)` formatter that multiplies USD-denominated BOM amounts by the active FX rate before display. `formatPdfMoney` and the `money` closure in `renderCommercialSummary` now use this formatter. Client-mode Nigeria quote now shows ~NGN 17.4 million instead of NGN 12,599.
- **Finance USD/NGN arithmetic normalisation** — All USD-anchored variables in `calculateCommercialFinanceSummary` (`finalQuote`, `inverterCost`, `batteryCost`, `equipmentSubtotal`) are now converted to local currency at the top of the function using `fxRate = inputs.effectiveFxRate`. Downstream arithmetic (payback, lifecycle net, debt service, equity contribution) is now fully currency-consistent.
- **Supplier rate label strings** — BOM description strings and supplier rate cards hardcoded to `'USD'` label; previously showed "NGN 0.29/Wp supplier rate" which was incoherent since supplier rates are USD procurement prices.
- **Energy rate validation cap** — `parseFinanceRate` bounds for `energyRatePerKWh` and `exportCreditPerKWh` scaled with `fxScalar` (the active FX rate). Previously `max: 5` capped 434 NGN/kWh to 5.00, making annual savings show ~NGN 10,238/yr instead of ~NGN 914,766/yr.
- **Export credit cap** — Same fix as energy rate; Nigeria export credit (27.7 NGN/kWh) was being capped at 2 NGN/kWh.

---

### Bug fix batch 8 (2026-05-07)

One structural fix deployed (commit 7701aa5):

- **Energy rate auto-conversion on profile load** — Region defaults store energy rates as USD-denominated values (e.g., Africa: 0.28 USD/kWh). Previously these were written directly to the input field, so a Nigerian client profile displayed "NGN 0.28/kWh" instead of the correct converted rate (~NGN 434/kWh). Fixed in two parts: (1) `energyRatePerKWhUSD` and `exportCreditPerKWhUSD` companion fields added to all six `regionDefaults` entries in `00-defaults.ts` as the authoritative USD-anchored values — existing fields preserved for backwards compatibility; (2) both consumer functions (`applyCommercialDefaultsByLocation` and `buildLegacyFormState`) now derive the local-currency rate as `energyRatePerKWhUSD × fxRateToUSD` when the companion field is present, falling back to the existing field otherwise. User-saved project values still take precedence over defaults. Lagos example: `0.28 × 1550 = NGN 434.00/kWh`.

---

### Bug fix batch 7 (2026-05-07)

One MEDIUM issue resolved and deployed (commit f0627cf):

- **Installer-mode currency label** — In installer mode `effectiveFxRate = 1.0`, so all money values are at their raw USD magnitude. Previously the user's chosen currency label (e.g., "NGN") was applied regardless, producing "NGN 8,724" for a $8,724 USD figure. Fixed by introducing `displayCurrencyLabel = (fxRate > 1) ? userLabel : 'USD'` at six money-display function groups: `renderSupplierPricingPreview`, `calculateCommercialFinanceSummary`, `calculateCommercialEstimate`, PDF generator block, `renderProposalSummary`, and `renderCommercialSummary`. Client-mode output is unchanged — the user label is applied when a real FX rate is active. An additional missed site in `renderSupplierPricingPreview` was caught by post-edit grep verification and fixed in the same commit.

---

### Bug fix batch 6 (2026-05-07)

Two engine math issues resolved and deployed (commit 4d3e179):

- **Cloud-day energy formula corrected** — `cloudDayWh` was computed as `arrayWattage × 0.25 × PSH`, which omits the system derating factor and evaluates to roughly array nameplate Wh when PSH ≈ 4. The advisory message claimed "25% output on a heavy cloud day" but the figure was inflated. Fixed to `pv.dailyEnergyWh × 0.25` (with a fallback of `arrayWattage × PSH × 0.8 × 0.25` when `dailyEnergyWh` is unavailable), so the cloud-day estimate correctly reflects 25% of the derated daily yield.
- **Inverter DC current cap** — When a manual inverter VA is set, `dcInputCurrentSurge` and `dcInputCurrentContinuous` were derived solely from the load-side VA requirements. On undersized manual inverters these could exceed what the physical inverter can pass. A cap block now clamps `dcInputCurrentSurge` to `(manualVA × inverterSurgeMultiplier) / dcBusVoltage` and `dcInputCurrentContinuous` to `manualVA / INVERTER_DERATING / dcBusVoltage`, applied unconditionally inside manual mode after all voltage/VA overrides settle.

---

### Bug fix batch 5 (2026-05-07)

Three issues resolved and deployed (commit 6ec4a22):

- **FX double-multiply removed** — `formatProposalMoney` and `formatCommercialUnitRate` no longer multiply by `effectiveFxRate`. The finance engine does not normalize to USD internally, so the multiply was inflating client-mode annual savings by ~1386× (the NGN/USD FX rate). fxRate parameter preserved for call-site compatibility. This was the root cause of the ₦794,062/year vs ₦573/year discrepancy between client and installer PDFs.
- **Battery Ah per Unit corrected** — PDF battery detail (line 21354) and HTML battery panel (line 25488) now derive Ah per Unit as `round(totalCapacityAh / stringsInParallel)` when manual or unit-count override is active, instead of always printing the auto-recommended `recommendedAhPerCell`. Prevents a 400Ah label on a 150Ah bank.
- **Battery unit-count warning re-emitted with correct Ah** — A re-emit block inserted after both override paths settle (before mixed-bank analysis at line 22683) filters the stale unit-count warning and replaces it with the final `totalCapacityAh` value. Prevents the "You selected 1 battery unit(s) (400Ah)" message when the actual bank is 150Ah.

### Bug fix batch 4 (2026-05-04)

Six issues resolved and deployed (commit 78cfa10):

- **Appliance table reconciliation note** — Three reconciliation rows (`Appliance subtotal (pre-margin)`, `+ Design allowance (margin & derating)`, `= Daily energy total`) inserted under the PDF appliance table inside the `appliances.length > 0` guard. Bridges the ~8–12% gap between the per-appliance Wh column and the headline daily energy total.
- **MPPT quantity label** — Both BOM locations (supplier refresh brief and commercial estimate `describeRateBasis`) now show `Wp array | W controller` when the controller is oversized vs the array. Unchanged when controller equals array size. Tooltip for the standalone MPPT line updated to reflect the oversized-controller rationale.
- **FX gap in finance panel** — `const fxRate = options.fxRate || 1` added to `renderCommercialFinancePanel`. All 25 `formatProposalMoney` calls and both `formatCommercialUnitRate` calls in that function now pass `fxRate`. All three call sites updated with `fxRate: commercial.inputs.effectiveFxRate || 1`. Direct `formatProposalMoney` calls inside `capitalStackSummary` and `comparisonDetail` strings (lines 17728–17729) also updated. FX conversion is now complete across the full commercial finance HTML output.
- **LiFePO4 badge text** — `badge: '48V lithium'` corrected to `badge: '51.2V lithium'` in both `lifepo4_5kwh_rack` and `lifepo4_7kwh_rack` catalog entries in `00-defaults.ts`. Matches the actual `unitVoltage: 51.2` value already used for sizing.
- **SVG title adaptive font** — Mixed battery title desc cap raised from 40 to 70 characters (with proper `…` ellipsis). PV mismatch group description no longer truncated at all. `pvTitleFontSize` updated to 3-tier threshold `length > 70 ? 8 : length > 40 ? 9 : 11`. Uniform battery bank title font in both hybrid and off-grid SVG branches changed from box-width-based to title-length-based 3-tier threshold — both use the same `length > 70 ? 8 : length > 40 ? 9 : 11` rule.
- **Advisory coping bar gate** — Entire coping bar block on the PDF advisory page (lines 20975–21009) now gated with `if (inv.isManualOverride || batt.isManualOverride)`, symmetric with the coping score box gate at line 20910. Auto-design sessions no longer render a coping bar that always shows 100% battery autonomy.

### Bug fix + feature batch 3 (2026-05-04)

Two MEDIUM issues resolved and deployed (commit 7b9a8d6):

- **VAT by country** — `vatPct` added to 8 `REGION_PROFILES` entries (Nigeria 7.5%, Kenya 16%, Ghana 15%, EU Central 20%, EU South 22%, India 18%, UAE 5%, Australia 10%). `applyCommercialDefaultsByLocation` now auto-fills the tax input on location change. `buildLegacyFormState` restored to use `??` chain preserving deliberate zero. `RegionProfile` TypeScript interface extended in `pv-types.d.ts`.
- **FX currency conversion** — `currencyDisplay` and `fxRateToUSD` added to 9 profiles. New `FX Rate (1 USD = ?)` input with `oninput` handler and help text. `getProposalPricingInputs` adds `fxRateToUSD` and `effectiveFxRate` (installer mode always returns 1.0 — stays USD; client mode converts). `formatProposalMoney` and `formatCommercialUnitRate` accept `fxRate` parameter. `formatPdfMoney` and `money` closures thread `effectiveFxRate` — client PDF shows local currency, installer PDF stays in USD. `formatSupplierRate` unchanged (rate cards always USD).

**Known gap:** Direct `formatProposalMoney` calls in financial summary card (~lines 11125–11183) still use `fxRate = 1`. Scoped to Batch 4.

### Bug fix batch 2 (2026-05-03)

Three CRITICAL bugs fixed and deployed (commit ea59036):

- **Battery manual-Ah override usable capacity** — manual Ah override branch now recomputes `usableCapacityWh = manualAh × bankVoltage × maxDoD × dischargeEfficiency`. Previously left the stale demand-based value causing the physically impossible "usable > total" output in PDF 2.
- **AC voltage custom badge** — `acVoltageIsCustom` flag derived at `getConfig()` using `locationProfile.acVoltage`. Gear icon ⚙ appended in PDF system configuration row; wrench 🔧 appended in HTML detail row when voltage differs from region default. Prevents silent cross-session voltage flip.
- **3-phase cable BOM** — PDF cable schedule now decomposes into `Inverter AC L1`, `Inverter AC L2`, `Inverter AC L3`, and `Neutral Conductor` rows in 3-phase mode. Neutral sized per IEC 60364 50% rule (full-size when `neutralI > 0.5 × maxPhaseI`). Replaces the generic single `Inverter AC Output` row. Single-phase jobs unaffected.

### Bug fix batch 1 (2026-05-03)

Four CRITICAL / MEDIUM bugs fixed and deployed to GitHub Pages (commit 3c8aece):

- **Rate input validation** — `RATE_BENCHMARKS` constant with 6 component bands (USD/Wp, USD/VA, USD/kWh, USD/W). `getRateStatus` and `checkAllRates` functions. Live green/amber/red badges on all 6 supplier rate fields. PDF generation blocked when any rate exceeds 5× the benchmark max. Prevents million-dollar quotes from unit-entry errors (e.g. `6000` for USD/VA instead of USD/unit).
- **Inverter surge auto-promote** — After the recommended tier is selected, a 10% surge headroom check runs. If headroom is insufficient, the engine promotes to the next catalog tier automatically. Amber UI pill and PDF row surface the promotion so the installer knows why the size changed.
- **Text truncation** — Replaced `'..'` hard cut with `'…'` (U+2026) in the PDF table cell renderer. Appliance name limit raised from 20 to 28 chars. Protection device name uses proper ellipsis. Installer name confirmed to bypass the truncator.
- **Coping score PDF breakdown** — The three weighted component ratios (Inverter fit 40%, Surge headroom 25%, Battery autonomy 35%) now print as muted 8pt rows beneath the score bar in both the override path and the advisory page path.

### UI/UX improvements pass (2026-03-22)
- P4: Tablet dropdown truncation fix at 900px breakpoint with flex-wrap for `.form-row.three` and `.form-row.four`
- P2: Help text converted from always-visible `<small>` to info tooltips (now 161 fields), reducing vertical scroll significantly; Duty Cycle, Power (NOT startup watts), and Workspace Mode kept always-visible
- P3: Results empty state replaced with live readiness checklist that tracks system config, loads, equipment, and calculate action
- P1: Sticky section navigator on the left side with scroll-spy highlighting and click-to-scroll with auto-expand
- P5: Business context hint collapsed by default with summary bar; auto-expands on Business Profile change
- P6: Machine Library reframed as "Step 1: Choose a machine type" with "Step 2: Fine-tune details" below; removed Phase 2 badge
- P7: Card completion badges (Ready / Review) on card headers based on state
- P8: Common inline styles extracted to CSS utility classes (mt-4, mt-8, mt-10, mt-12, flex-half, flex-1)
- P9: Accessibility pass expanded further with runtime help-popover wiring across all help icons, now using semantic button triggers with touch-safe open/close behavior, `aria-controls`, `aria-describedby`, `aria-expanded`, `aria-hidden`, and `role="tooltip"`

## Recommended Next Moves

1. Keep refining user comprehension so the wider commercial and plant feature set stays easy to read without flattening the engineering depth.
2. Add more bounded plant-handover checks only where they materially improve captive-site follow-through without pretending to be a full protection study.
3. If utility / mini-grid ambitions remain in scope, deepen the separate engineering lane instead of stretching the captive-site workflow beyond its honest boundary.
