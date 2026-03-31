# Utility Packet Progression Guide

This guide explains the new stage-aware packet progression layer in the utility lane.

It adds four things to the packet handoff:

- `Progression Gate`
- `Stage-Ready Signals`
- `Open Stage Blockers`
- `Stage-Exit Handback`

## Why It Exists

Packet lane, packet stage, and case status are useful, but they still describe the case only as a snapshot.

Real approval-heavy jobs also need to answer:

- what stage gate are we actually in?
- what is already ready?
- what is still blocking the stage?
- what is the exact next handback step?

That is what this layer now adds.

## What Each Part Means

### Progression Gate

This is the stage conclusion for the current packet.

Examples:

- `Drafting Gate`
- `Submission Gate`
- `Review Gate`
- `Conditional Clearance Gate`
- `External Control Gate`

### Stage-Ready Signals

These are the facts already captured strongly enough to support the current stage.

Examples:

- reference locked
- owner / desk captured
- submission date captured
- revision label captured
- next handback captured

### Open Stage Blockers

These are the missing or still-open items preventing a clean stage handoff.

If the case is already in a live review or conditional-clearance state, the blocker list can stay open even when the comments are captured correctly. That is intentional: captured comments are a record, not evidence that the gate has been cleared.

Examples:

- missing revision label
- missing review comments
- live review comments still open
- conditional clearance items still open
- missing next action owner
- missing next action due date

### Stage-Exit Handback

This is the plain-language next move that should push the case out of the current stage.

Examples:

- file the packet
- respond to review comments
- close conditional items
- prepare witness / acceptance evidence

## Where It Flows

This progression layer now appears in:

- the utility packet scaffold
- the packet TXT brief
- the packet CSV data sheet
- the feeder brief through the packet scaffold carry-through

When the packet export needs to state what that exact stage must carry, use it together with the stage-specific contract described in `UTILITY_STAGE_DISCIPLINE_EXPORT_GUIDE.md`.

## Honest Boundary

This improves stage discipline.

It does not replace:

- a formal approval tracker
- a utility portal
- document control software
- a full correspondence-management system
