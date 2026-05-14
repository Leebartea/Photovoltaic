# Utility Study Handoff Enrichment Guide

## Purpose

This guide explains the newer study-handoff fields added to the optional `Utility / mini-grid inputs` block.

They exist to make the `Feeder / protection study input capture` layer more useful without pretending the app is already performing the external protection or selectivity study.

## New Structured Fields

### `POC / Feeder / Node Ref`

Use this to preserve the exact point of connection, feeder, or internal node label the study handoff is following.

Examples:

- `PCC-1 / Main LV board / Feeder B`
- `Node 3 / Process bus`
- `Export PCC / Utility incomer`

### `Protection Review Scope`

Use this to state how deep the live protection carry-through already is.

Typical meanings:

- `Breaker / Cable Carry-Through`
- `Feeder / Breaker Coordination`
- `Relay / Export Logic Review`
- `External Selectivity / Protection Study`

### `Export Control Basis`

Use this to preserve how the declared metering/export posture is actually controlled or proven.

Typical meanings:

- `Captive / No-Export Declaration`
- `Reverse Power / Zero-Export Control`
- `Non-Export Relay / Trip Proof`
- `Limited-Export Control`
- `Utility Dispatch / Metered Export`

## Why These Fields Matter

The older study handoff already carried:

- study basis
- study track
- study owner
- fault / relay basis note
- revision and next action continuity

The newer fields make that handoff more field-ready by answering three extra questions:

1. Which feeder or node is actually under review?
2. How deep is the active protection review?
3. What proof or control path supports the export posture?

## Where They Now Flow

These fields now flow into:

- the in-app `Utility / mini-grid inputs` hint
- `Feeder / protection study input capture`
- the TXT `study sheet`
- the CSV `study data sheet`

## Honest Boundary

These fields improve study carry-through and export discipline.

They do not replace:

- feeder studies
- protection / selectivity studies
- relay setting sheets
- authority or utility interconnection calculations
