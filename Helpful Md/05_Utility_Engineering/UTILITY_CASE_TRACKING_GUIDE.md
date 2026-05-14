# Utility Case Tracking Guide

The utility lane now carries a real authority-case layer, not only packet lane, packet stage, and witness structure.

It captures:

- `Authority Case Status`
- `Case Owner / Desk`
- `Submission / Review Date`
- `Current Revision / Response`
- `Submission / Review Trail`
- `Authority / Review Comments`

## Why This Matters

Packet stage tells you how mature the packet is.

Case status tells you what is happening in the real approval lane.

Those are related, but they are not the same thing.

Examples:

- a packet can be `Submitted / Under Review`, but still only be waiting in queue
- another can already have review comments open
- another can be conditionally cleared
- another can be accepted but still awaiting witness

The new fields keep those states visible.

## Best Use

Use these fields when the job has genuinely left internal planning and now has a live authority, utility, EPC, or review-desk trail.

Typical triggers:

- the application has been filed
- a desk or named reviewer now owns the case
- comments have been issued
- conditional clearance exists
- witness or acceptance has become the main blocker

## Field Meaning

### Authority Case Status

Use this to distinguish:

- internal preparation
- ready for filing
- submitted / awaiting review
- review comments open
- conditional clearance open
- accepted pending witness
- externally closed

### Case Owner / Desk

Use the actual role, person, or desk carrying the current case.

### Submission / Review Date

Use the real filing or review date that anchors the current case state.

### Current Revision / Response

Use the active packet revision or comment-response label.

Examples:

- `Rev B`
- `Comment Response 1`
- `Witness Pack Rev A`

### Submission / Review Trail

Use this for the short lifecycle trail, such as:

- filed
- comments issued
- revision resubmitted
- witness pending
- conditional clearance open

### Authority / Review Comments

Use this for active review feedback or closeout conditions only.

Do not use it for generic engineering notes.

## Where It Flows

This case-state layer now carries into:

- the utility hint under `System Configuration`
- `Interconnection / approval packet scaffold`
- `Commissioning / witness-test prep`
- the packet TXT brief
- the packet CSV data sheet
- the witness CSV data sheet

That means the heavier lane can now preserve not only the current status, but also which revision is active and how the case got there.

## Honest Boundary

This improves case traceability.

It does not turn the app into:

- a utility case-management platform
- a full interconnection submission system
- a formal authority correspondence tracker
