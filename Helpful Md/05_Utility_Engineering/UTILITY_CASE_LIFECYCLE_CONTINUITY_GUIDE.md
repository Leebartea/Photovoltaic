# Utility Case Lifecycle Continuity Guide

This guide explains the new lifecycle-continuity fields in the optional utility lane.

They are:

- `Current Revision / Response`
- `Next Action Owner / Handover`
- `Next Action Due Date`
- `Next Required Action`
- `Submission / Review Trail`

## Why They Exist

An application reference alone is not enough once a case starts moving.

Real utility or authority jobs often pass through:

- first filing
- review comments
- revision or response submission
- conditional clearance
- witness preparation

The calculator already carried packet posture and case status.

These new fields now carry the missing continuity:

- which revision is current
- who owns the next live handback
- when the next handback is due
- what the next handback actually is
- how the case moved into that state

## Best Use

Use `Current Revision / Response` for the active label that should appear on the live packet, study, and witness handoff.

Use `Submission / Review Trail` for the short lifecycle story.

Good examples:

- `Filed 2026-03-12; comments issued 2026-03-18; Rev B resubmitted 2026-03-20.`
- `Conditional clearance issued; non-export proof submitted; witness pending.`

## Where It Flows

These fields now carry into:

- the utility input hint
- the interconnection / approval packet scaffold
- the feeder / protection study-input sheet
- the commissioning / witness checklist
- the packet CSV data sheet
- the witness CSV data sheet

## Honest Boundary

This improves revision continuity.

It does not turn the app into:

- a document-control system
- a formal utility portal
- a full correspondence tracker
