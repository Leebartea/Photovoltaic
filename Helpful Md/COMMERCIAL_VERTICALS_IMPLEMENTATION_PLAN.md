# Commercial Verticals Implementation Plan

## Purpose

This document turns the calculator from a strong general PV sizing tool into a stronger **practical commercial design assistant** for real business loads across global markets, with the selected location profile driving region-specific voltage, frequency, climate, compliance, and pricing assumptions.

The target is not abstract "commercial mode".

The target is practical sizing for:

- filling stations
- bakeries
- tailoring shops and garment workshops
- cold rooms
- workshops and fabrication shops
- light mini-factory loads

## Current Honest Position

The calculator is already strong in these areas:

- single-phase and split-phase sizing
- three-phase load assignment
- three-phase imbalance detection
- modular inverter cluster planning
- commercial proposal and supplier benchmark logic
- commercial strategy recommendation across off-grid, solar-first, hybrid-assist, and essential-load-only site stories
- advisory commercial finance / ROI tied to the current support story and package posture
- regional compliance packs plus authority-specific submission-pack readiness
- tailoring-adjacent motor logic and surge-aware load modeling

It is not yet complete for heavier commercial field work because the remaining gap is not basic sizing math. The remaining gap is now **lifecycle-finance depth beyond the current advisory ROI layer**, **optional supplier/live-data layers** beyond the current offline heuristics, and any future move from captive-site scoping into true utility / mini-grid engineering.

## Design Principle

Do not build a separate "industrial app".

Extend the current engine with a **commercial workload layer** that:

- identifies the business type
- understands machine behavior
- maps loads to realistic operating schedules
- distinguishes true three-phase loads from multiple single-phase loads
- understands when the right answer is battery-heavy, solar-heavy, or hybrid-with-generator

This commercial layer should stay globally portable.

- Business logic should remain market-agnostic by default.
- The existing location profile should continue to provide regional assumptions such as nominal voltage, grid frequency, climate factors, pricing region, and compliance framing.
- A bakery in Lagos and a bakery in Texas can share the same machine logic while still inheriting different electrical and commercial assumptions from location.

## Critical Engineering View By Business Type

### Filling station

Usually the hardest part is not daily energy. It is topology and operating continuity.

Typical load classes:

- dispenser motors
- canopy lighting
- POS and office electronics
- compressor
- borehole / transfer pump
- small AC loads

Typical engineering issues:

- three-phase service is common
- loads are often unbalanced across phases
- generator integration is common
- autonomy is often short and strategic, not long and deep
- battery throughput matters more than raw kWh headline

### Bakery

A bakery can be either moderate or very difficult depending on the oven.

Typical load classes:

- dough mixers
- proofers
- freezers
- fridge
- lighting
- sealing / small appliance loads
- oven

Critical discriminator:

- whether the oven is gas-assisted, diesel-assisted, or fully electric
- whether the oven is single-phase or three-phase

If the oven is fully electric and three-phase, battery-only design can become commercially weak very quickly.

### Tailoring shop / garment workshop

This should absolutely be a supported vertical.

Tailoring is often **not** three-phase by default.

Typical cases:

- small tailoring studio: usually single-phase
- medium tailoring shop with multiple industrial machines: still often single-phase or split across circuits
- garment workshop with compressors, pressing, cutting, and many clutch machines: can justify three-phase review

Critical discriminator:

- servo machine versus clutch motor machine
- ironing / pressing heat loads
- compressor use
- total simultaneous machine count

This vertical belongs in the app because the calculator already contains useful sewing-related surge logic. It should be formalized instead of left as a hidden strength.

### Cold room

This is a high-value vertical.

Typical load classes:

- compressor rack
- evaporator fans
- control electronics
- defrost heaters
- lighting

Critical issues:

- compressor startup
- high duty cycle
- nighttime continuity
- product-loss risk

This is not just a sizing problem. It is a runtime-priority and resilience problem.

### Workshop / fabrication

Typical load classes:

- welders
- air compressors
- grinders
- saws
- drills
- lighting
- office support

Critical issues:

- peaky use
- intermittent heavy current
- poor power factor
- low diversity confidence

This vertical needs strong surge and demand-window treatment.

### Mini-factory

This is a general container for:

- conveyors
- motors
- heaters
- controls
- compressors
- mixed single-phase and three-phase loads

Critical issues:

- process sequencing
- shift operation
- load classes with very different runtime behavior
- the possibility that full solar-battery independence is the wrong business answer

## Product Goal

The calculator should answer three questions better than it does today:

1. What is the technically sound system size?
2. What business operating strategy does that system actually support?
3. Is the result commercially honest, or is hybrid support still required?

## Implementation Strategy

Build this in phases. Do not jump directly to "more formulas".

### Phase 1: Commercial Load Classification Layer

Objective:

Teach the calculator what kind of business it is sizing.

Status:

- Implemented in the current build as a guidance layer, not a topology-forcing layer.
- The app now carries `Business Profile`, `Operating Intent`, and `Business Continuity Class` through UI, autosave/project state, sample-load behavior, readiness scoring, proposal framing, and PDF output.
- The current implementation intentionally does **not** auto-switch the project into three-phase. It changes guidance, warnings, and sample posture first.

Implementation:

- Add `Business Profile` selector near system configuration.
- Add profiles for:
  - residential backup
  - retail shop
  - tailoring studio
  - garment workshop
  - bakery
  - filling station
  - cold room
  - fabrication workshop
  - light mini-factory
- Add `Operating Intent`:
  - full off-grid
  - daytime solar offset
  - backup only
  - hybrid with generator
  - hybrid with grid
- Add `Business Continuity Class`:
  - convenience
  - business-critical
  - process-critical
  - product-loss critical
- Attach each business profile to:
  - topology stance
  - phase guidance
  - recommended operating intent
  - recommended continuity class
  - optional starter template for sample loads

Why this matters:

- the same kWh can imply very different system recommendations depending on business continuity needs
- a cold room and a tailoring shop should not be treated as the same type of problem

Acceptance criteria:

- the selected business profile changes helper text, sample templates, and advisory framing
- proposal output reflects the chosen business class

Phase 1 practical notes:

- `single_default` means the vertical normally starts single-phase unless the machine list proves otherwise
- `conditional_3phase` means three-phase may be justified, but it is not category-forced
- `review_3phase` means three-phase review is strongly justified, yet an essential-load sub-design can still remain single-phase if that is the real brief

Phase 1.5 next step:

- Add more vertical starter templates so bakery, filling station, cold room, fabrication, and mini-factory jobs have curated first drafts instead of only advisory classification

### Phase 2: Practical Machine Library

Objective:

Move from generic appliances to commercial equipment primitives.

Status:

- Core machine-archetype support is now implemented in the current build.
- The app now exposes a business-aware `Machine Archetype` selector in the appliance form, with preview cards and topology notes.
- Auto-detection can now map names like bakery mixers, fuel dispenser pumps, cold-room compressors, welders, conveyors, and control panels into curated machine defaults.
- The archetype state now survives add/edit/list flows so the installer can see which loads were intentionally classified.
- This still needs follow-on work in later phases for richer schedule modeling and deeper vertical starter templates.

Implementation:

- Extend the equipment/load library with business equipment categories:
  - industrial sewing machine, servo
  - industrial sewing machine, clutch
  - overlock / interlock machine
  - pressing iron / boiler iron
  - bakery spiral mixer
  - planetary mixer
  - proofing cabinet
  - electric oven, single-phase
  - electric oven, three-phase
  - gas oven support loads
  - cold-room compressor
  - evaporator fan bank
  - dispenser pump
  - borehole pump
  - air compressor
  - welder
  - cutter / saw / grinder
- For each machine store:
  - phase class
  - typical power factor
  - startup behavior
  - duty pattern
  - whether load is continuous, batch, or operator-triggered
  - whether staggering is realistic

Why this matters:

- the math is only as good as the load archetypes
- commercial users think in machines, not generic watts

Acceptance criteria:

- adding a bakery mixer or clutch machine should prefill sane defaults
- industrial machines should produce realistic surge and runtime behavior

### Phase 3: Operational Schedule Model

Objective:

Make the calculator understand business time windows, not just daily totals.

Status:

- Core schedule modeling is now implemented in the current build.
- The app now supports project-level operating schedule presets and per-load role / criticality tagging.
- Aggregation, battery/PV practical logic, readiness scoring, executive summary, commercial summary, and the load analysis tab now use this operating context.
- The current implementation still needs later phases for deeper strategy automation and more vertical-specific starter workflows.

Implementation:

- Add schedule presets:
  - 8am-6pm
  - 24/7
  - two-shift
  - intermittent production
  - night preservation load
- Split loads into:
  - base load
  - process load
  - refrigeration/preservation load
  - operator-triggered peak load
  - discretionary load
- Add `Critical / Essential / Deferrable` tags per load.

Why this matters:

- daily Wh alone hides the actual design problem
- many commercial sites fail because the peak operational window is mis-modeled

Acceptance criteria:

- the report can distinguish daytime process demand from overnight continuity demand
- the app can recommend "battery for critical loads only" where appropriate

### Phase 4: Commercial Power Architecture Layer

Objective:

Upgrade from simple three-phase awareness to realistic commercial topology decisions.

Status:

- Core commercial architecture modeling is now implemented in the current build.
- The app now carries board-strategy selection, generator-support posture, shared battery throughput checks, and PV-field / MPPT grouping into calculation, readiness scoring, executive summary, commercial summary, overview tab, load tab, battery tab, and PDF output.
- The current implementation still leaves the next phase open: strategy recommendation logic that decides when the right answer is battery-dominant, solar-dominant, essential-load-only, or explicitly hybrid.

Implementation:

- Extend the existing three-phase planner to support:
  - equal-leg clusters
  - phase-targeted clusters
  - explicit spare-module strategies
  - generator-assist topology
  - essential-load sub-board strategy
- Add shared battery throughput checks:
  - continuous discharge current
  - short-duration surge assist
  - C-rate stress index
- Add MPPT-bank grouping:
  - independent controllers
  - grouped PV fields
  - rooftop versus ground-array separation

Why this matters:

- a commercial system fails in practice when topology assumptions are wrong, even if the kWh math is fine

Acceptance criteria:

- the app can represent a `4-module` three-phase bank as `2/1/1`
- the app can warn when a true balanced three-phase load is being fed by an imbalanced cluster assumption
- the app can flag battery throughput shortfalls even when battery kWh looks adequate

Phase 4 delivered now:

- `Commercial power architecture` installer controls in system configuration
- auto-resolved board strategy preview from business context
- selective-board vs full-board protected-load share analysis
- shared battery throughput calculations using discharge current, surge assist, charge current, and composite stress index
- generator-assist coverage checks against the active board path, including per-phase warning logic
- PV field layout and MPPT grouping realism checks
- architecture-driven readiness gates and confidence penalties
- architecture output in executive summary, commercial summary, overview, load analysis, battery analysis, and PDF exports

### Phase 5: Commercial Decision Engine

Objective:

Teach the calculator to decide when a site should not be treated as pure solar-battery.

Status:

- Implemented in the current build.
- The app now scores and recommends the least misleading operating posture across:
  - battery-dominant off-grid
  - solar-dominant daytime bridge
  - hybrid with generator assist
  - hybrid with grid support
  - essential-load-only backup
- The recommendation now feeds confidence scoring, proposal readiness, executive summary, commercial estimate summary, overview snapshot, warning aggregation, and PDF export.

Implementation:

- Add strategy outcomes:
  - battery-dominant off-grid
  - solar-dominant daytime with battery bridge
  - hybrid with generator assist
  - hybrid with grid support
  - essential-load-only backup
- Add business risk advisories:
  - oven load too large for battery-economical design
  - refrigeration runtime is dominating autonomy
  - compressor overlap risk is too high
  - phase imbalance is making one leg the real bottleneck

Why this matters:

- the best answer is not always "bigger inverter, bigger battery, more panels"
- credibility improves when the tool says "this should be hybrid"

Acceptance criteria:

- bakery and filling-station scenarios can produce different recommended strategies even at similar energy totals

Phase 5 delivered now:

- scorecard-based commercial decision engine tied to PV coverage, battery bridge depth, overnight protected burden, process-day alignment, deferrable share, board strategy, generator coverage, and battery throughput
- current-posture alignment checks against the chosen operating intent and system type
- installer-facing strategy panel in executive summary, commercial summary, and overview
- strategy-aware readiness gate and confidence penalty
- strategy-aware PDF reporting and warning aggregation

### Phase 6: Vertical-Specific Templates

Objective:

Turn business categories into fast, practical workflows.

Status:

- Implemented in the current build.
- The app now ships curated vertical starter templates for:
  - garment workshop
  - bakery daytime production
  - bakery 3-phase oven line
  - filling station hybrid
  - cold room preservation
  - fabrication workshop
  - mini-factory process line
- The earlier templates for residential backup, retail, tailoring studio, clinic critical loads, and pump-led jobs remain available.
- Templates now preload machine lists, commercial posture, likely exclusions, next steps, and workflow guidance instead of only dropping a sample appliance list into the draft.
- The UI now also includes a dedicated in-app navigation guide so installers and client-facing users can read the wider interface in the right order.

Implementation:

- Add expert templates for:
  - tailoring studio
  - garment workshop
  - bakery
  - filling station
  - cold room
  - fabrication workshop
  - light factory
- Each template should preload:
  - machine defaults
  - operating schedule
  - commercial assumptions
  - likely exclusions
  - likely risk warnings

Why this matters:

- installers should not rebuild common businesses from scratch each time

Acceptance criteria:

- loading a vertical template produces a usable first draft, not just a sample appliance list

### Phase 7: Proposal And Reporting Upgrade

Objective:

Make commercial reports technically honest and commercially usable.

Status:

- Implemented in the current build.
- The app now includes:
  - executive snapshot
  - commercial strategy recommendation
  - regional compliance path
  - commercial architecture summary
  - supported-load story reporting across protected, assisted, and outside-the-promised-path loads
  - runtime expectation language by business condition
  - vertical-specific support-envelope notes for bakery, filling station, cold room, tailoring/garment, workshop, and mini-factory jobs
  - client-safe proposal output
  - installer-safe PDF appendix
  - supplier pricing source traceability
  - region-aware commercial finance / ROI advisory with annual value, simple payback, 5-year / 10-year value outlook, and lifecycle allowances tied to the selected support story
- Remaining adjacent work:
  - deeper cashflow, financing, tax, and residual-value sensitivity beyond the current allowance model

Implementation:

- Add business-specific report sections:
  - operating strategy
  - critical loads covered
  - unsupported loads
  - generator/grid dependency note
  - runtime expectation under business conditions
  - phase map and cluster summary
  - risk register
- For client mode, avoid overexposing raw engineering tables unless needed.
- For installer mode, include:
  - phase distribution table
  - cluster adequacy table
  - battery throughput warnings
  - MPPT grouping summary

Why this matters:

- commercial users need decision-grade outputs, not only engineering-grade outputs

Acceptance criteria:

- a bakery proposal can state clearly whether the oven is fully covered, partially covered, or excluded from battery support
- a filling-station or cold-room proposal can distinguish the protected continuity path from the assisted generator-backed path without overselling whole-site autonomy

### Phase 8: Validation And Benchmarking

Objective:

Make the commercial engine trustworthy.

Implementation:

- Add golden reference projects for:
  - tailoring studio, single-phase
  - garment workshop, multi-machine
  - bakery with gas oven support loads
  - bakery with electric three-phase oven
  - filling station with phase-targeted cluster
  - cold room with overnight preservation priority
  - fabrication workshop with compressor and welder
- Add acceptance tests for:
  - phase map correctness
  - cluster adequacy
  - battery throughput blocks
  - strategy recommendation changes by business profile
- Classify reference projects into:
  - acceptance references
  - constrained references that must fail in a known way

Why this matters:

- commercial mistakes are expensive
- the tool needs scenario confidence, not just general unit tests

Status:

- Implemented in the current build.
- The benchmark suite now includes `6` acceptance references and `2` constrained references.
- Constrained references are intentional. They prove the bot flags over-promised bakery and filling-station continuity stories instead of silently letting them pass.
- The benchmark harness now locks:
  - phase type
  - strategy recommendation
  - board strategy
  - architecture status
  - MPPT validity
  - protected-path generation
  - vertical-specific support-envelope behavior

Acceptance criteria:

- benchmark references remain stable across rebuilds
- constrained references fail for the expected reasons
- proposal and runtime reporting stay aligned with the benchmark support envelope

### Phase 9: Authority Submission Pack Upgrade

Objective:

Turn the compliance layer into a real staged submission and handover-preparation workflow.

Status:

- Implemented in the current build.
- The app now adds:
  - authority-specific submission-pack families by region
  - staged submission readiness for intake, technical dossier, approval lane, and handover
  - approval-lane switching by off-grid vs hybrid / grid-tie path
  - focused deliverables and open submission actions
  - submission-pack visibility in executive summary, commercial summary, overview, readiness scoring, and PDF export

Why this matters:

- serious commercial jobs need a cleaner bridge from quote logic to formal closeout logic
- “compliance guidance” alone is too vague once authority review, utility review, or structured handover becomes real

Acceptance criteria:

- the same project can expose both a compliance-path status and a submission-pack status without conflicting messages
- off-grid jobs track installer sign-off lanes while hybrid / grid-tie jobs track authority-facing lanes
- export and on-screen summaries stay aligned on submission readiness and open actions

## Phase 12: Plant Scoping And Honest Mini-Grid Boundary

Status:

- Implemented in the current build.
- The app now carries a compact plant-scoping layer that resolves:
  - plant scope
  - feeder / distribution topology
  - interconnection scope
- The app now also exposes a recommended feeder schedule so those plant outputs resolve into protected, assisted, and outside-promise feeder lanes with source-path labels.
- The current implementation is intentionally advisory. It improves the honesty of mini-plant and multi-feeder business-site jobs without pretending to replace feeder studies, protection studies, or utility interconnection engineering.

What changed:

- installer mode now exposes `Plant Scope`, `Distribution Topology`, and `Interconnection Scope`
- installer mode now also exposes `Recommended Feeder Schedule`
- installer mode now also exposes a copyable / downloadable feeder brief for one-line preparation and source-coordination follow-through
- the app can distinguish:
  - captive business-site plants
  - private multi-feeder / private-distribution jobs
  - public-service / interconnection-heavy cases that should be treated as outside the current product boundary
- plant-scoping guidance now feeds:
  - guided workflow hints
  - proposal readiness
  - executive summary
  - commercial summary
  - overview output
  - PDF export
  - explicit feeder-lane mapping in the live plant-scope panel

Why this matters:

- many “mini solar plant” requests are really captive-site power-distribution jobs, not utility mini-grid jobs
- the product needed a better way to separate those cases without forking the workflow or overselling its engineering authority
- the next necessary plant-level step was to show which feeder lanes are truly protected, which remain assisted, and which are outside the sold promise

Acceptance criteria:

- filling-station, cold-room, workshop, bakery, and mini-factory jobs can be scoped as captive or private-distribution plants without being mislabeled as utility-grade mini-grid work
- public-service or heavy interconnection cases are flagged as outside the current honest product boundary
- the same plant-scope message stays aligned across UI, readiness, and PDF export
- the feeder schedule now shows protected, assisted, and outside-promise lanes with explicit source-path wording
- the feeder story can now leave the UI as an installer-facing text brief without inventing a separate plant model

## Phase 13: Lifecycle Finance Sensitivity

Status:

- Implemented in the current build.
- The app now extends the earlier ROI layer with lifecycle allowances for:
  - annual O&M
  - inverter refresh reserve
  - battery refresh / augmentation reserve
- The current implementation is still advisory. It improves long-run quote honesty without pretending to be a lender-grade project-finance model.

What changed:

- proposal pricing now exposes annual O&M plus inverter and battery refresh allowances
- the finance summary now shows:
  - 5-year and 10-year lifecycle allowance totals
  - 5-year and 10-year net-after-lifecycle values
  - chemistry-aware battery refresh timing
- UI, overview, executive summary, commercial summary, and PDF export now carry the same lifecycle finance story

Why this matters:

- simple payback alone can overstate the long-run commercial story on battery-heavy projects
- the product needed a better medium-term honesty layer before it could claim near-best-in-class proposal discipline

Acceptance criteria:

- finance output remains one integrated summary object rather than a second parallel subsystem
- the same lifecycle wording appears across on-screen and PDF commercial views
- the model stays advisory and does not pretend to replace debt, tax, or residual-value analysis

## Recommended Build Order

Do the work in this order:

1. Commercial load classification layer
2. Practical machine library
3. Operational schedule model
4. Commercial power architecture layer
5. Commercial decision engine
6. Vertical templates
7. Proposal/reporting upgrade
8. Validation and benchmarking

This order is deliberate.

If the app jumps straight to proposal polish before business logic, the commercial layer will look more advanced than it really is.

## Tailoring-Specific Judgment

Tailoring deserves first-class treatment.

Why:

- it is common in the target market
- the current engine already has relevant motor logic
- clutch versus servo behavior is materially different
- many shops are not fully residential but not heavy industrial either

Recommended tailoring split:

- `Tailoring Studio`
  - mostly single-phase
  - servo machines common
  - lower surge, higher runtime diversity
- `Garment Workshop`
  - can become three-phase review territory
  - multiple clutch machines, irons, compressor, cutting table, lighting, office loads

This gives practical range without falsely forcing tailoring into three-phase by default.

## What Should Not Be Done

- Do not assume every business load needs three-phase.
- Do not size ovens and heaters the same way as motor-dominant loads.
- Do not hide generator/grid dependence when the business case still needs it.
- Do not treat large battery kWh as proof of adequate discharge capability.
- Do not let proposal polish outrun engineering truth.

## Final Verdict

The calculator is already on the right path.

What it needs now is not generic complexity. It needs the remaining layers of **commercial specialization**.

The right next evolution is:

- deeper cashflow and financing sensitivity built on the now-stable lifecycle allowance layer
- supplier quote freshness, quote-refresh control, and offline pasted / file-based quote import are now implemented, including header-aware CSV / ERP-style quote parsing; future work should focus on optional live supplier-sync or API-backed supplier refresh without making the core workflow cloud-dependent
- an offline supplier refresh-brief generator is now implemented so aging or stale quotes can be re-requested from the current design basis before any live sync layer exists
- richer commercial quote presets are now implemented as explicit offline commercial presets with manual apply behavior; future work should focus on optional supplier-sync / quote refresh without weakening the engineering boundary
- system-configuration smartness is now implemented as a live coherence conclusion with quick-align actions, so business profile, operating intent, continuity, schedule, and system type can be reconciled explicitly without hidden auto-fill side effects
- plant-scoping now includes both a feeder brief and a board / source schedule, so captive-site plant jobs can move into one-line preparation and source-handover review more cleanly without pretending the product completed a full protection study
- plant-scoping now also includes bounded board procurement / breaker / cable review prompts, so live cable and protection sizing can survive handoff into procurement and one-line preparation without creating a second plant engine
- plant-scoping now also includes a separate utility / mini-grid engineering lane, so private-microgrid and public-service jobs can be handed into the right next workflow without pretending the captive-site calculator already completed those studies
- plant-scoping now also includes an explicit working-surface conclusion plus a bounded dispatch / load-shed / restoration sequence, so plant jobs can move from scoping into operational handoff without silently blending back into the normal site-design story
- plant-scoping now also includes an interconnection / approval packet scaffold, feeder / protection study input capture, and commissioning / witness-test prep, so heavier utility-lane jobs now carry a bounded packet, study-input, and energization scaffold without creating a duplicate plant engine
- plant-scoping now also includes an optional utility-lane input surface, so packet lane, metering posture, study basis, commissioning path, reference, and engineering notes can be captured explicitly inside the same workflow instead of remaining inference-only
- the utility-lane input surface now also carries packet stage plus witness-party and witness-evidence structure, so approval maturity and acceptance detail are no longer trapped in a single free-form note
- plant-scoping now also exposes exportable TXT briefs for interconnection packet basis, feeder/protection study-input carry-through, and commissioning / witness preparation, so the heavier lane can leave the UI as a bounded handoff pack
- the heavier utility lane now also exposes structured CSV data sheets for interconnection and witness handoff, so packet and acceptance detail can move into engineering prep as field-by-field records instead of only narrative briefs
- the heavier utility lane now also carries current revision / response plus submission / review trail, so packet, study, and witness exports stay aligned to the same live case revision instead of one static reference
- a separate true plant-engineering lane if the product ever wants to go beyond captive-site plant scoping into utility / mini-grid engineering

That will make the tool materially better for the exact use cases that matter in the field, rather than merely making it bigger.

## Phase 10: Guided UX Simplification Layer

Status:

- Implemented in the current build.

What changed:

- the left-column workflow is now progressive instead of fully flat
- each major section now carries a short summary line
- the guide card now exposes a recommended next move
- the guide card now explains the focused field or active section in plain language
- major cards can be collapsed so the user can keep only the active work area open
- installer and client modes now push the user toward different next sections without changing the calculation engine

Why this matters:

- the product had reached a point where feature depth could outpace first-use clarity
- the correct fix was not removing engineering depth; it was reducing cognitive load
- this keeps the calculator usable for both installer-grade and proposal-grade work without forking the app

Acceptance criteria:

- client and installer users can see the next logical section without guessing
- wide sections no longer need to stay open all at once
- the guide language matches the actual input workflow rather than only describing concepts

## Phase 11: Explicit Promise-Boundary Reporting

Status:

- Implemented in the current build.

What changed:

- the supported-load story now derives a separate promise-boundary layer from the same support-summary object
- the UI now states what can be sold as protected continuity, what still depends on assist, and what must stay outside scope
- the PDF export now carries the same promise-boundary language instead of forcing the reader to infer it from percentages alone
- the benchmark and commercial regression harnesses now assert that the promise-boundary wording exists

Why this matters:

- the engine already knew which loads were protected, assisted, or excluded
- the real gap was that users still had to interpret percentages and load lists into sales language
- this closes that gap without adding a parallel subsystem or weakening the engineering truth

Acceptance criteria:

- support-summary remains the single source of truth for protected, assisted, and excluded loads
- UI and PDF output both expose the commercial promise boundary explicitly
- constrained benchmark cases keep proving that the product refuses overstated continuity claims
