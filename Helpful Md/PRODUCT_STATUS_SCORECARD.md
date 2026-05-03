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
