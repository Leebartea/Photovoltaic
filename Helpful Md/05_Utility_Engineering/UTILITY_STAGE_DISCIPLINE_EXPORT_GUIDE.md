# Utility Stage Discipline Export Guide

This guide explains the new stage-specific export discipline added to the utility packet lane.

The packet brief and packet CSV no longer export one flat generic approval checklist for every case state.

They now adapt the packet handoff to the active packet stage.

## What It Adds

The utility packet export can now carry stage-specific rows such as:

- `Stage drafting discipline`
- `Stage filing controls`
- `Stage submission discipline`
- `Stage response discipline`
- `Stage response controls`
- `Stage closeout discipline`
- `Stage clearance controls`
- `Stage external-control discipline`
- `Stage mirror controls`

Only the rows relevant to the current packet stage are emitted.

## Why It Matters

A packet that is still being drafted should not read like a packet that is already under review.

A packet under review should keep:

- live comments
- revision continuity
- response handback

A conditionally cleared case should keep:

- closeout items
- witness evidence posture
- clearance handback

The export now reflects those differences directly.

## Where It Appears

This stage discipline now appears in:

- the on-screen `Interconnection / approval packet scaffold`
- the `Interconnection / approval packet brief` TXT export
- the `Interconnection data sheet` CSV export

## Honest Boundary

This improves packet-state discipline.

It does not replace:

- document control software
- a utility portal
- formal interconnection forms
- external engineering sign-off
