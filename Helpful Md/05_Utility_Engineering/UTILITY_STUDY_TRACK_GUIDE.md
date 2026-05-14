# Utility Study Track Guide

This guide explains the bounded study-discipline fields inside the optional `Utility / mini-grid inputs` block.

## What These Fields Do

They make the study lane more explicit without pretending the app already performs the full feeder or protection study.

The fields are:

- `Study Track`
- `Study Owner / Consultant`
- `POC / Feeder / Node Ref`
- `Fault Level / SCC Ref`
- `Protection Review Scope`
- `Export Control Basis`
- `Relay Scheme Basis`
- `Transfer Scheme Basis`
- `Fault / Relay Basis Note`

## Study Track

Use `Study Track` to show what kind of study handoff is actually active:

- `One-Line / Feeder Basis Pack`
- `Breaker / Cable Review Pack`
- `Protection / Relay Review Pack`
- `External Study / Utility Pack`

This is different from `Study Basis`.

- `Study Basis` says how mature the handoff is
- `Study Track` says what kind of engineering pack it has become

## Study Owner / Consultant

Use this when a real engineer, consultant, or EPC lead now owns the study carry-through.

Examples:

- protection consultant
- EPC study lead
- utility interface engineer
- relay review desk

## POC / Feeder / Node Ref

Use this to anchor the study handoff to the actual point of connection, feeder, or internal node being reviewed.

Good examples:

- `PCC-1 / Main LV board / Feeder B`
- `Node 3 / Process bus`
- `Utility incomer / export PCC`

## Fault Level / SCC Ref

Use this to keep the study lane tied to the actual fault-level or short-circuit reference.

Good examples:

- `18kA at PCC`
- `25kA switchboard basis`
- `SCC basis rev 2`

## Protection Review Scope

Use this to show how deep the active protection carry-through already is.

Typical levels:

- `Breaker / Cable Carry-Through`
- `Feeder / Breaker Coordination`
- `Relay / Export Logic Review`
- `External Selectivity / Protection Study`

## Export Control Basis

Use this to preserve how the metering/export posture is actually controlled or proven.

Typical meanings:

- `Captive / No-Export Declaration`
- `Reverse Power / Zero-Export Control`
- `Non-Export Relay / Trip Proof`
- `Limited-Export Control`
- `Utility Dispatch / Metered Export`

## Relay Scheme Basis

Use this to show what protection logic the current study lane already depends on.

Typical meanings:

- `Breaker / Interlock Only`
- `Plant Protection Relay`
- `Non-Export / Trip Relay`
- `Utility-Interface Protection`
- `External Relay Study Pack`

## Transfer Scheme Basis

Use this to show how the source-transfer or energization story is actually being carried.

Typical meanings:

- `Manual / Local Changeover`
- `ATS / Staged Transfer`
- `Closed Transition / Sync`
- `Utility-Controlled Energization`
- `External Switching Study`

## Fault / Relay Basis Note

Use this for the short protection assumption that must survive the handoff.

Good examples:

- `18kA PCC basis`
- `Non-export relay proof pending`
- `Utility fault basis not yet confirmed`
- `Export limit tied to relay logic rev B`

## Best Use

Use these fields when the job is no longer only a simple feeder-label or one-line-prep story.

They are most useful when:

- breaker and cable review is already active
- protection or relay review has started
- the job has moved into an external study pack
- the utility lane is now real

## Honest Boundary

These fields improve study handoff quality.

They now also feed bounded study-lane screening rows for current basis, breaker carry margin, fault-reference screening, relay/export fit, transfer-path fit, and generator-source screening.

They do not replace:

- the feeder study
- the protection study
- selectivity calculations
- final relay settings
- stamped engineering
