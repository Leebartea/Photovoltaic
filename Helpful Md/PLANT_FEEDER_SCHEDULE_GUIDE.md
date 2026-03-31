# Plant Feeder Schedule Guide

## Purpose

This guide explains the `Recommended Feeder Schedule` output in the plant and mini-plant workflow.

It is not a replacement for a final one-line or feeder study.

It is an honesty layer that answers:

- what sits on the protected continuity lane
- what still needs assist
- what is outside the sold promise
- what source path each feeder depends on

## Where It Comes From

The feeder schedule is derived from the same live objects already used elsewhere:

- `Supported Load Story`
- `Commercial Power Architecture`
- `Commercial Strategy`
- `Plant Scope`
- `Distribution Topology`
- `Interconnection Scope`

That matters because it avoids a second hidden plant model.

The feeder schedule uses the same protected, assisted, and excluded load buckets that the support-story layer already calculates.

## What The Output Shows

Each feeder card shows:

- feeder label
- source path label
- source path detail
- number of loads
- modeled daily energy
- energy share
- connected load
- dominant load roles

The live plant panel now also shows a `Source coordination snapshot` and exposes:

- `Copy feeder brief`
- `Download TXT`

Those actions produce an installer-facing feeder brief from the same live plant-scoping object.

## How To Read The Lane Types

### Protected

This is the continuity promise.

Typical examples:

- controls
- refrigeration preservation loads
- essential lighting
- selected business baseline circuits

This is the feeder lane the quote can honestly sell as covered continuity.

### Assisted

This lane is still part of the operating story, but not as unconditional protected continuity.

It may depend on:

- generator support
- grid support
- daylight timing
- staged duty
- operator discipline

This lane should be sold carefully.

### Outside Promise

These loads are not covered by the current continuity promise.

They should stay:

- excluded from the quote
- separately qualified
- or moved back into scope only after the design changes materially

## Typical Source Path Labels

- `PV + battery protected continuity path`
- `PV + battery protected bus with generator recovery`
- `PV + battery protected bus with grid assist`
- `Generator-assisted feeder`
- `Grid-assisted feeder`
- `Managed / staged support feeder`
- `Outside promised backup path`

Read the source label as the real operating dependency, not just a component description.

## Why This Matters For Plant Jobs

This is especially important when users say:

- mini solar plant
- plant backup system
- three-phase site plant
- private mini-grid

Those jobs often fail commercially because the proposal talks like one whole plant is protected, while the real result is:

- one protected lane
- one or more assisted lanes
- some excluded process loads

The feeder schedule makes that visible.

## What It Does Not Replace

This output does not replace:

- final feeder schedule drawings
- one-line diagrams
- breaker coordination
- protection/selectivity study
- OEM parallel approval
- authority submission
- utility interconnection study

## Honest Sales Rule

Use the feeder schedule to help say:

- what is truly protected
- what is supported only under conditions
- what is outside the current promise

Do not use it to imply that a full plant engineering study has already been completed.

## Feeder Brief Export

The feeder brief is meant for:

- installer internal notes
- one-line preparation
- feeder handoff discussion
- source coordination review

It includes:

- plant scope
- distribution topology
- interconnection scope
- current boundary note
- feeder lane summary
- source detail per feeder
- dominant roles per feeder
- open scoping items

It is intentionally text-first and lightweight.

That is the correct scope for this product stage:

- better than leaving feeder intent trapped inside the UI
- lighter and more honest than pretending the app already emits a full stamped one-line package
