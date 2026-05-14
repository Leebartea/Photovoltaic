# Plant Scoping And Mini-Grid Boundary

## Purpose

This guide explains the plant-scoping layer and the honest boundary of the current product.

It exists for one reason:

- many commercial users say "mini solar plant" when they really mean a stronger captive business-site plant or a private multi-feeder distribution job

The calculator now helps separate those cases before the proposal language becomes misleading.

## What The Layer Resolves

The app now derives four advisory views:

- `Plant Scope`
- `Distribution Topology`
- `Interconnection Scope`
- `Recommended Feeder Schedule`

It now also derives two handoff views from the same result:

- `Current Working Surface`
- `Dispatch / Load-Shed / Restoration Sequence`

It now also derives three heavier-lane handoff views from the same result:

- `Interconnection / Approval Packet Scaffold`
- `Feeder / Protection Study Input Capture`
- `Commissioning / Witness-Test Prep`

These are not replacements for final plant studies.

They are boundary controls that improve:

- workflow guidance
- proposal readiness
- executive summary wording
- commercial summary wording
- PDF export honesty
- feeder-lane honesty for protected, assisted, and outside-promise paths

## How To Read The Four Fields

### Plant Scope

This answers:

- is this still a captive business-site plant?
- is it becoming a wider private-distribution plant?
- is it drifting into public-service / utility-adjacent scope?

Typical examples:

- `captive_site`
- `multi_feeder_site`
- `private_microgrid`
- `public_service_microgrid`

### Distribution Topology

This answers:

- how many board or feeder paths the plant is really serving
- whether the job is still a simple board-level quote or a wider private network

Typical examples:

- `single_board`
- `protected_critical_bus`
- `radial_feeders`
- `distributed_nodes`

### Interconnection Scope

This answers:

- whether the project is still self-contained
- whether it now depends on stronger outside-party approval or network interaction

Typical examples:

- `offgrid_islanded`
- `private_distribution`
- `behind_meter_hybrid`
- `public_service_interconnection`

### Recommended Feeder Schedule

This answers:

- which loads belong on the protected continuity lane
- which loads still sit on an assisted feeder
- which loads are outside the sold promise
- what source story each feeder depends on

Typical examples:

- `Protected continuity feeder`
- `Process assist feeder`
- `General support feeder`
- `Outside-promise feeder`

## Why The Feeder Schedule Matters

The plant-scope layer used to answer:

- what kind of site this is
- how many boards or feeder paths it probably has
- whether the interconnection story stays captive or moves into a heavier lane

That was useful, but it still left one practical gap:

- the installer and client could see the boundary, but not the feeder promise

The recommended feeder schedule closes that gap by turning the existing supported-load buckets into feeder lanes with source-path labels:

- `Protected`: what belongs on the continuity promise
- `Assisted`: what still depends on grid, generator, daylight timing, or staged operation
- `Outside promise`: what should not be sold as covered unless scope changes

This is still advisory, but it is materially closer to real plant scoping than a simple site label alone.

The live panel now also exposes an installer-facing feeder brief so the scoping result can move into:

- one-line preparation
- feeder handoff discussion
- source coordination review

The next layer now sits beside that:

- `Board / source schedule`

That table turns each feeder lane into a lightweight board-handover row with:

- promise lane
- source path
- board note
- handover / review note

The next bounded layer now also adds:

- `Board procurement / breaker / cable review`

That keeps the plant handoff tied to the live cable and protection sizing before the job moves into procurement or one-line preparation.

The next lane now also adds:

- `Utility / mini-grid engineering lane`

The next layer now also adds:

- `Current working surface`

That block answers:

- should the user still read the job mainly as a normal system-design workflow?
- has it crossed into a plant-engineering surface inside the same product?
- has it crossed beyond that into a separate utility / mini-grid lane?

The next layer now also adds:

- `Dispatch / load-shed / restoration sequence`

That block answers:

- which feeder lane should energize first
- which feeder lane should be shed first
- how assisted feeders should return after source recovery
- when the app is only giving a bounded handoff and a formal dispatch study is still required

That block answers:

- can this project still stay inside the captive-site workflow?
- does it now need a private-microgrid engineering lane?
- has it crossed into a public-service / utility-facing lane?

The next heavier-lane blocks now also add:

- `Interconnection / approval packet scaffold`
- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`

Those blocks answer:

- what approval lane and packet basis must stay explicit
- what feeder, breaker, cable, phase, and cluster assumptions should seed later studies
- what commissioning and witness-prep items must not be rediscovered from scratch

The live configuration layer now also adds an optional utility input block so those heavier-lane outputs can carry:

- an explicit packet lane
- metering / export posture
- study basis
- commissioning path
- a packet / study reference
- bounded engineering notes

## What The Product Is Strong At

The current build is strong at:

- captive commercial PV sizing
- private business-site plant scoping
- selective-board and multi-feeder business-site proposals
- turning the supported-load story into an explicit feeder map
- three-phase captive-site architecture review
- proposal and submission-prep framing for complex site jobs

## What The Product Still Does Not Claim

The current build does not claim to replace:

- feeder studies
- protection and selectivity studies
- final OEM parallel-rule sign-off
- plant-level dispatch studies
- utility interconnection engineering
- authority-final stamped design responsibility

## Honest Rule Of Thumb

Use the product confidently when the job is:

- a captive site
- a private business plant
- a selective-board or multi-feeder site design
- a commercial proposal that still needs clear engineering boundaries

Escalate to a separate plant-engineering workflow when the job becomes:

- a public-service microgrid
- an interconnection-heavy network design
- a plant-level protection / feeder coordination exercise
- a utility-facing generation project

## Score Impact

This layer improves the product because it prevents overselling and now exposes feeder intent explicitly.

It raises confidence for:

- captive mini solar plant for a business site

It also raises the lower plant-engineering score modestly because feeder intent is no longer hidden behind summary text alone.

It now also lifts the score again modestly because the feeder story can leave the UI as an installer-facing brief.

It now lifts the score again modestly because the feeder story can also be carried as a one-line-ready board / source schedule instead of staying only as prose.

It now lifts the score again modestly because the product no longer leaves the user guessing when a project must leave the captive-site workflow and move into a separate engineering lane.

It now lifts the score again modestly because the working surface and dispatch handoff are explicit instead of being left to installer interpretation.

It now lifts the score again modestly because the heavier engineering lane no longer stops at a label. It also exposes a packet scaffold, study-input basis, and commissioning / witness-prep scaffold from the same plant-scoping object.

It now lifts the score again modestly because those heavier-lane outputs can leave the UI as bounded TXT briefs for packet basis, study-input carry-through, and commissioning / witness preparation instead of staying trapped on-screen.

It now lifts the score again modestly because the utility input surface no longer stops at lane selection alone. It also carries packet stage plus witness-party and witness-evidence structure, so the approval and acceptance path has real maturity and hold-point detail.

It still only modestly raises the utility / mini-grid score because it improves feeder-lane, handoff, and operating-sequence honesty more than it improves true feeder-study, protection, interconnection, or formal dispatch depth.
