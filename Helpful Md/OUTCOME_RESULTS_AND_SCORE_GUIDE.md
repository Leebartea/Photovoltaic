# Outcome Results And Score Guide

## Purpose

This guide explains the outcome blocks and rating scores the calculator shows after a design is run.

Use it when you need a clear explanation of:

- `Confidence`
- `Coping Score`
- `Commercial Strategy`
- `Proposal Readiness`
- `Regional Compliance`
- `Submission Pack`
- the other result cards that appear in `System Summary`, `Executive Snapshot`, and `Commercial Estimate`

This guide explains what the scores mean. It does not replace:

- site survey
- OEM installation rules
- final protection coordination
- stamped engineering
- authority approval

## Where Outcome Results Appear

### System Summary

This is the fastest read of the design.

It shows the main hardware totals plus the key rating cards.

This section stays open by default because it is the shortest honest starting point.

### Executive Snapshot

This is the proposal-reading layer.

It explains:

- how ready the proposal is
- what commercial story is honest
- what the site can really support
- what risks still remain open

### Commercial Estimate / Proposal Budget

This is the money and selling layer.

It explains:

- package posture
- commercial strategy
- annual value
- lifecycle allowances
- capital-stack sensitivity
- cash-versus-financed scenario comparison
- supplier quote freshness
- supplier refresh brief availability
- supported-load boundary

### Overview

This is the compact engineering snapshot.

It brings the same outcome story into a more technical installer read.

## Results Navigator And Collapsible Sections

The result page is now segmented on purpose.

Use `Results Navigator` to jump directly to:

- `System Summary`
- `Executive Snapshot`
- `Proposal Budget` or `Commercial Estimate`
- `Warnings` or `Review Notes`
- `Detailed Results`
- `Disclaimer & Important Caveats`
- `Export`

The long sections now collapse so the result does not behave like one endless scroll.

Recommended use:

- keep `System Summary` open
- open one or two deeper sections at a time
- collapse finished sections before moving on

## Recommended Reading Order

### Client Estimate

1. `Executive Snapshot`
2. `System Summary`
3. `Commercial Strategy Recommendation`
4. `Supported Load Story`
5. `Commercial Value Outlook`
6. `Proposal Readiness`

### Installer Design

1. `System Summary`
2. `How To Read Outcome Scores`
3. `Commercial Strategy Recommendation`
4. `Commercial Power Architecture`
5. `Regional Compliance Path`
6. `Submission Pack Readiness`
7. `Overview`, `Load`, `Inverter`, `Battery`, `PV`, `Protection`, and `Cables`

## System Summary Cards

### Daily Energy (Wh)

This is the modeled daily energy demand after appliance quantity, hours, duty cycle, and daytime share are applied.

Read it as:

- a planning total
- not a promise that every hour is evenly loaded

### Peak Load (VA)

This is the simultaneous peak apparent load the inverter path must survive.

Read it as:

- the main driver for inverter and surge sizing
- more important than daily energy when motors or short peaks matter

### Inverter (VA)

This is the recommended inverter capacity for the chosen design path.

If the card shows a wrench icon, manual override is active.

### Battery (Ah)

This is the modeled bank capacity at the chosen battery voltage and chemistry.

If the card shows a wrench icon, manual override is active.

### PV Array (W)

This is the modeled PV nameplate required for the selected load story and operating posture.

### Solar Panels

This is the panel-count expression of the PV array size using the selected panel wattage.

### 3-Phase Cluster

This only appears on clustered three-phase jobs.

It summarizes:

- module count
- module size
- phase distribution
- overall cluster status

Read it as a topology snapshot, not as a replacement for OEM parallel rules.

### Confidence

This is the main technical comfort score.

It is the quickest answer to:

- does the design have headroom?
- is the design workable but assumption-heavy?
- is the design too tight to sell comfortably?

The live meaning is:

- `85-100` = `High`
- `65-84` = `Moderate`
- `45-64` = `Managed`
- `0-44` = `Stress`

How to read it:

- `High`: comfortable modeled headroom; suitable for engineering-grade recommendation
- `Moderate`: workable design, but the proposal must explain practical assumptions
- `Managed`: viable only with active load discipline, timing, or assisted support
- `Stress`: too tight for a comfortable continuity promise without upgrades or a narrower scope

What it is not:

- not an authority approval score
- not a guarantee of perfect field performance
- not a substitute for survey or commissioning

### Coping Score

This is a special score. It does not always appear.

It appears when a manual override creates a tight or undersized path and the app needs to explain how much the selected hardware can practically cope.

Current weighting:

- inverter continuous capacity = `40%`
- surge handling = `25%`
- battery capacity = `35%`

Current label bands:

- `75-100` = `Manageable`
- `50-74` = `Tight`
- `0-49` = `Critical`

How to read it:

- `Manageable`: the site can still run, but staged use matters
- `Tight`: the quote is survival-oriented, not comfort-oriented
- `Critical`: the selected override is too aggressive for a stable continuity promise

If no coping card is shown:

- it usually means no manual-override survival check is needed
- it does not mean the design has infinite headroom

### Commercial Strategy

This score answers a different question from `Confidence`.

It asks whether the commercial story matches the math.

Examples:

- battery-dominant off-grid
- daytime solar-first bridge
- hybrid generator assist
- hybrid grid support
- essential-load-only backup

Read the percentage as a `fit` score:

- high fit = the recommended operating posture matches the real site story
- medium fit = the story works, but the proposal wording needs care
- low fit = the current sales story should be reframed

Read the status text this way:

- `Aligned` = safe to use as the main commercial story
- `Review` = explain the assumptions and limitations
- `Reframe` = the current story is too aggressive

### Supplier Quote Freshness

This is not a sizing score. It is a commercial traceability signal.

It answers:

- is this quote still benchmark-only?
- is there a live supplier quote behind it?
- how old is that supplier quote?
- should the quote still be treated as commercially current?

Current live states:

- `Benchmark-only`
- `Live quote date missing`
- `Partially live and fresh`
- `Fresh live quote`
- `Aging supplier quote`
- `Stale supplier quote`

How to read it:

- `Benchmark-only`: good for early scoping, not strong enough for a final commercial promise
- `Live quote date missing`: a live supplier path is claimed, but the quote is not dated well enough to defend freshness
- `Partially live and fresh`: the main supplier lines are fresh, but some quote items are still benchmarked
- `Fresh live quote`: the quote is still inside the configured refresh window
- `Aging supplier quote`: still usable with caution, but refresh is due
- `Stale supplier quote`: the quote is too old to present as commercially current without update

Read the supporting badge as:

- quote age in days
- benchmark-only / undated
- optional supplier reference

What it is not:

- not a hardware safety score
- not a technical approval
- not a guarantee that supplier stock still exists

### Regional Compliance

This shows how closed the regional code and authority path is for the selected location profile.

The percentage is a path-closure score, not a permit issue guarantee.

Read it as:

- are the right code family and authority path understood?
- are the major compliance actions already known?

It is not:

- stamped engineering
- final permit approval
- legal sign-off

### Submission Pack

This shows how complete the formal pack is for survey, dossier, approval, and handover.

Read it as:

- a document-control and handover readiness score
- not the same thing as pure engineering adequacy

It helps answer:

- is the survey pack strong enough?
- is the technical dossier mature enough?
- is the approval lane clear enough?
- is the closeout / handover set disciplined enough?

## Executive Snapshot Outcome Panels

### Proposal Readiness

This is the main commercial control score.

It blends:

- confidence
- survey stage
- business continuity pressure
- architecture realism
- compliance
- submission-pack closure
- quote identity and commercial controls
- supplier quote freshness

Current result bands:

- `Blocked by engineering`
- `Proposal-ready`
- `Ready with pending checks`
- `Installer review required`
- `Preliminary estimate only`

How to read it:

- `Proposal-ready`: serious installer-client proposal posture
- `Ready with pending checks`: good draft, but close the remaining survey or scope items first
- `Installer review required`: useful for technical review, not yet a polished final quote
- `Preliminary estimate only`: still early scoping
- `Blocked by engineering`: the commercial story must pause until the hard block is resolved

### Supported Load Story

This tells the client what the quote is really promising.

Read the three buckets separately:

- `Protected Path`: what the proposal treats as covered continuity
- `Assisted Path`: what still needs grid, generator, daylight timing, or staged use
- `Outside The Promised Path`: what is not honestly covered unless scope changes

This is one of the most important honesty layers in the product.

### Commercial Power Architecture

This explains the delivery structure behind the quote.

It can include:

- board strategy
- shared battery throughput stress
- generator posture
- PV field layout
- MPPT grouping realism

Read it before assuming the system is a simple whole-site plant.

### Plant / Mini-Grid Scope

This explains whether the project is still:

- a normal captive site plant
- a private-distribution / multi-feeder case
- an interconnection-heavy or public-service case

This is a boundary-control result, not a utility-study replacement.

### Recommended Feeder Schedule

This explains how the plant story should be read in operating lanes, not just in one summary sentence.

It can include:

- protected continuity feeder
- process assist feeder
- general support feeder
- outside-promise feeder

Read it as:

- what is honestly protected
- what still depends on assist
- what must stay outside the sold promise

This is one of the most useful outputs for mini-plant and multi-feeder commercial jobs because it turns the protected / assisted / excluded load story into a visible feeder map.

The live plant result now also includes:

- `Current working surface`
- `Source coordination snapshot`
- `Board / source schedule`
- `Board procurement / breaker / cable review`
- `Dispatch / load-shed / restoration sequence`
- `Utility / mini-grid engineering lane`
- `Interconnection / approval packet scaffold`
- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`
- feeder-brief export actions
- packet-brief, study-sheet, and commissioning-checklist export actions

Those three heavier-lane blocks now also listen to the optional utility input surface in `System Configuration`, so explicit packet, metering, study, reference, and commissioning inputs can flow through the result instead of leaving everything inferred.

That utility input surface now also carries:

- packet stage
- progression gate
- authority case status
- witness parties
- witness evidence
- case owner / desk
- submission / review date
- current revision / response
- next action owner / handover
- next action due date
- next required action
- submission / review trail
- authority / review comments

So the result can now distinguish:

- a planning-stage packet from one already under review
- an installer-only handoff from a client, authority, or multi-party witness lane
- a light startup proof pack from staged-transfer, non-export, or authority-acceptance evidence

When populated, they now also let the installer export:

- an interconnection / approval packet brief
- an interconnection data sheet
- a feeder / protection study-input sheet
- a commissioning / witness checklist
- a witness data sheet

Those exports are bounded handoff documents and structured data sheets, not formal utility forms or final study reports.

Use those when the installer needs to move from:

- outcome reading

to:

- feeder handoff
- one-line preparation
- site coordination notes

### Current Working Surface

This is the result layer’s explicit answer to:

- is the normal system-design view still the main working surface?
- has the project crossed into a plant-engineering handoff?
- has it crossed further into a separate utility / mini-grid lane?

Read it before the rest of the plant blocks because it tells you which lane should lead the next decision.

### Dispatch / Load-Shed / Restoration Sequence

This is a bounded operations handoff derived from the same protected, assisted, and outside-promise feeder story.

Use it to read:

- what should energize first
- what should be shed first
- how assisted feeders should return
- when the app is telling you that a formal dispatch study is still required

### Interconnection / Approval Packet Scaffold

This is the approval-lane summary for heavier utility-facing or approval-heavy jobs.

Read it as:

- what packet lane is active
- which deliverables need to stay visible
- whether the job now needs a formal interconnection basis outside the normal captive-site quote lane

### Feeder / Protection Study Input Capture

This is not the study itself. It is the live study-input seed.

Read it as:

- which feeder rows must carry through
- which breaker and cable assumptions are already live
- whether limiting-phase or cluster assumptions need to stay visible in later study work

### Commissioning / Witness-Test Prep

This is the bounded energization and witness-prep layer.

Read it as:

- what must be frozen before energization
- what operating-mode and restoration story must be recorded
- whether the job now needs an internal commissioning pack or a formal witness / authority hold point

### Commercial Value Outlook

This is the money story in two layers plus two optional comparison layers:

- short sales layer: annual value and simple payback
- lifecycle layer: annual maintenance plus planned inverter and battery refresh allowances
- capital-stack layer: equity, debt service, tax benefit, and residual-value sensitivity when the optional advanced-finance block is used
- scenario layer: cash purchase versus financed purchase when debt share is active

Use both together.

A strong simple-payback headline can still need a more careful lifecycle explanation.

The capital-stack layer answers a different question:

- does the project still make commercial sense once the client finances part of it?

That layer is advisory. It is not a bank-approved finance result.

The scenario layer answers a simpler sales question:

- is the financed structure only improving the early cash story, or does it still hold up against cash purchase over time?

## How To Explain The Scores To A Client

- `Confidence` explains comfort and technical headroom.
- `Coping Score` explains how well a manual-override shortcut can survive.
- `Commercial Strategy` explains the most honest system story.
- `Supplier Quote Freshness` explains how current the commercial pricing path really is.
- `Proposal Readiness` explains how close the draft is to a serious quote.
- `Regional Compliance` explains how closed the regional path is.
- `Submission Pack` explains how mature the survey-to-handover package is.

## Common Misreadings To Avoid

- `100%` on a score does not remove the need for a survey.
- No `Coping Score` card does not mean the design can carry any future load.
- `Proposal Readiness` is not the same as permit approval.
- `Compliance` is not the same as legal sign-off.
- `Submission Pack` is not the same as electrical adequacy.
- `Commercial Strategy` is not a sales preference score; it is an honesty score.
- `Supplier Quote Freshness` is not a technical adequacy score; it is a quote-traceability signal.

## Related Guides

- `Helpful Md/CLIENT_UI_GUIDE.md`
- `Helpful Md/INSTALLER_UI_GUIDE.md`
- `Helpful Md/COMMERCIAL_FINANCE_AND_ROI_GUIDE.md`
- `Helpful Md/AUTHORITY_SUBMISSION_PACKS_GUIDE.md`
- `Helpful Md/PLANT_SCOPING_AND_MINIGRID_BOUNDARY.md`
- `Helpful Md/SUPPLIER_QUOTE_FRESHNESS_GUIDE.md`
- `Helpful Md/FORMULAS_AND_FACTORS.md`
