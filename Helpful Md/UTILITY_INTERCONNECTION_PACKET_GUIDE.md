# Utility Interconnection Packet Guide

## Purpose

This guide explains the `Interconnection / approval packet scaffold` block shown in the plant result.

It is a bounded packet scaffold for heavier approval or utility-facing jobs.

It is not a claim that the app has completed a final interconnection package.

## What It Shows

The block can carry:

- the active approval lane
- the current packet stage
- the governing code / authority path
- current focus deliverables
- open approval items
- hybrid anti-backfeed / non-export notes
- formal interconnection escalation when the job leaves the captive-site lane

## How To Use It

Read it as:

- the packet lane that should now lead the next workflow
- the first deliverables that must stay visible
- the open approval items that should not disappear into general notes

Use it to keep utility or approval-heavy jobs from being handed off with only generic compliance wording.

The optional utility input block in `System Configuration` can now push explicit packet lane, packet stage, metering posture, reference, and note details into this scaffold.
It now also carries authority case status, case owner, submission/review date, and current review comments when the approval lane is already live.
It now also carries filing channel, primary hold point, and response return path so the packet export preserves how the case is filed, what gate is controlling it, and how the next response cycle returns.
It now also carries a stage-aware progression gate, ready signals, open stage blockers, and stage-exit handback, so the packet brief does not stop at static status labels.
It now also carries stage-specific packet discipline, so a drafting packet, submission packet, review-response packet, and conditional-clearance packet each state what that stage must carry instead of exporting one flat generic brief.
It now also carries a case progression timeline, so the packet export preserves the active stage posture, review basis, controlled revision, live comment cycle, next handback, and witness/closeout track.
It now also carries a stage template pack, so each stage exports the right packet bundle emphasis such as draft packet cover set, submission dossier, review-response pack, review closure matrix, or conditional closeout pack.

When a structured field-by-field packet handoff is needed, use the utility-lane `packet data sheet` export instead of relying on the narrative brief alone.

## What It Does Not Replace

It does not replace:

- a stamped interconnection package
- final authority submission review
- metering design
- export-limit engineering
- protection or feeder studies

## Honest Boundary

If this block starts surfacing a formal interconnection basis, the job has already moved beyond the normal captive-site quote lane.
