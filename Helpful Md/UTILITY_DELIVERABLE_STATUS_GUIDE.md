# Utility Deliverable Status Guide

This guide explains the bounded deliverable-status fields inside the optional `Utility / mini-grid inputs` block.

## What These Fields Do

They keep the packet, study, and witness lanes tied to a real deliverable posture instead of only a narrative stage or case status.

The fields are:

- `One-Line / SLD Status`
- `Protection / Relay Pack Status`
- `Witness / Closeout Pack Status`

## Why They Matter

These fields answer a different question from packet stage or case status.

- packet stage = where the approval lane sits
- case status = where the authority or desk posture sits
- deliverable status = how far each actual handoff pack has progressed

That distinction matters because a job can be:

- submitted and under review, while the one-line is only review-ready
- already running protection review, while the witness pack is still draft-only
- waiting for witness, while the witness pack is already review-ready

## Typical Meanings

### Draft Only

The pack exists only as an internal basis.

Use this when:

- the one-line is still being cleaned up
- the relay basis has not left internal review
- the witness pack is still a prep note

### Review Ready

The pack is organized enough for internal or consultant review, but it is not yet issued.

Use this when:

- the one-line can move into controlled review
- the protection pack is ready for consultant or relay review
- the witness pack can be checked before authority or client hold points

### Issued / Submitted

The pack has moved beyond internal preparation.

Use this when:

- the one-line has been issued as part of the study or packet lane
- the protection / relay pack has been sent for formal review
- the witness / closeout pack has been issued into the acceptance path

### Externally Controlled

The pack is now managed outside the app.

Use this when:

- a third-party consultant owns the active one-line package
- the protection pack is controlled in an external study environment
- the witness pack is controlled by authority, EPC, or commissioning management outside the app

## Where These Statuses Flow

They now carry into:

- the utility hint in `System Configuration`
- `Interconnection / approval packet scaffold`
- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`
- packet TXT and CSV exports
- study TXT and CSV exports
- witness TXT and CSV exports

## Best Use Pattern

Use them once the job is beyond simple proposal stage.

Good pattern:

1. let plant scope and working surface resolve first
2. set packet stage and case status
3. set study track and commissioning path
4. then set the three deliverable statuses honestly

That keeps maturity, desk state, and real pack readiness from being mixed together.

## Honest Boundary

These statuses improve handoff discipline.

They do not mean:

- the feeder study is complete
- the protection study is complete
- the witness procedure is fully written
- final stamped engineering is finished
