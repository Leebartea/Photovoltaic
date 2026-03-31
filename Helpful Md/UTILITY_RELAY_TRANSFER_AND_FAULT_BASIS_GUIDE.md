# Utility Relay, Transfer, And Fault Basis Guide

This guide explains the deeper study-handoff fields now available in the optional `Utility / mini-grid inputs` block.

They are:

- `Fault Level / SCC Ref`
- `Relay Scheme Basis`
- `Transfer Scheme Basis`

These fields do not perform the study.

They preserve the exact study basis that later packet, study-sheet, and commissioning exports should keep attached to the live design.

## Fault Level / SCC Ref

Use this to capture the short-circuit or fault-level reference the study lane is actually working from.

Good examples:

- `18kA at PCC`
- `25kA switchboard basis`
- `SCC basis rev 2`
- `Fault level pending utility confirmation`

This matters because a relay or protection handoff should not float without the fault basis it depends on.

## Relay Scheme Basis

Use this to show what protection logic the current handoff already depends on.

Typical levels are:

- `Breaker / Interlock Only`
- `Plant Protection Relay`
- `Non-Export / Trip Relay`
- `Utility-Interface Protection`
- `External Relay Study Pack`

This keeps the study lane honest about whether the job is still light breaker carry-through or has already moved into real relay behavior.

## Transfer Scheme Basis

Use this to show how the source-transfer or energization story is actually being carried.

Typical levels are:

- `Manual / Local Changeover`
- `ATS / Staged Transfer`
- `Closed Transition / Sync`
- `Utility-Controlled Energization`
- `External Switching Study`

This matters because the study and commissioning handoff should preserve how sources are transferred or released, not just what feeders exist.

## Where These Fields Now Appear

They now feed:

- the live utility-engineering hint
- `Feeder / protection study input capture`
- the TXT study brief
- the CSV study data sheet

## Honest Boundary

These fields improve study-handoff fidelity.

They do not replace:

- feeder studies
- protection/selectivity studies
- final relay settings
- final switching philosophy documents
- stamped interconnection engineering
