# Plant Board / Source Schedule Guide

## Purpose

This guide explains the new `Board / source schedule` block shown in the plant-scoping result.

It is a lightweight handoff layer that sits between:

- feeder-level scoping
- one-line preparation
- breaker / source-handover review

It does **not** replace a final drawing set or protection study.

## What It Shows

For each modeled feeder or board lane, the schedule shows:

- feeder / board label
- promise lane (`Protected`, `Assisted`, or `Outside promise`)
- source path
- lane-level current screen
- one-line-ready carry tags
- board note
- handover / review note

That means the installer can see, in one place:

- what belongs on the protected continuity side
- what still depends on generator, grid, or staged daylight behavior
- what must stay outside the sold continuity promise

## Why It Matters

The feeder schedule already made the support story visible.

The board / source schedule closes the next practical gap:

- what should the installer carry into the board schedule and one-line prep?

This is especially useful for:

- filling stations
- bakeries
- cold rooms
- workshops
- multi-feeder captive sites

## Carry Tags

The schedule now also carries compact tags for:

- source carry
- breaker carry
- transfer carry

Examples:

- `SRC-PV-BATT`
- `SRC-GEN-ASSIST`
- `AC-FDR 63A / 400VAC | PROTECTED`
- `XFER-ATS-STAGED-TRANSFER`

These are not stamped drawing tags.

They are shorthand carry markers so the one-line draft, board schedule, and handoff notes all preserve the same live source story.

## How To Read It

### Promise Lane

- `Protected` means this feeder belongs inside the sold continuity promise.
- `Assisted` means the feeder still relies on another source path or staged operation.
- `Outside promise` means the feeder should not be sold as covered unless the scope changes.

### Source Path

This is the live source story already modeled by the plant result.

Examples:

- solar + battery continuity lane
- generator-assisted continuity lane
- grid-assisted support lane
- staged daylight operation

### Board Note

This tells the installer what to preserve in the board schedule.

Examples:

- keep this lane on the protected board
- keep this on a managed feeder
- keep this outside the protected promise lane

### Handover / Review

This tells the installer which handoff is still important.

Examples:

- generator breaker / changeover review
- anti-backfeed / grid handover review
- staged daylight expectation
- outside-promise boundary confirmation

## Honest Boundary

Use this output for:

- site coordination
- installer handoff
- one-line preparation
- feeder naming discipline
- promise-boundary discipline

Do not use it as:

- final protection coordination
- selectivity study
- stamped one-line drawing
- utility interconnection study
