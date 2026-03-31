# Utility Export Briefs Guide

The plant result now exposes three bounded utility-lane exports when the live scope justifies them:

- `Copy packet brief` / `Download TXT`
- `Copy study sheet` / `Download TXT`
- `Copy checklist` / `Download TXT`
- `Copy packet data sheet` / `Download CSV`
- `Copy study data sheet` / `Download CSV`
- `Copy witness data sheet` / `Download CSV`

These exports are generated from the same live plant-scoping object used by:

- `Interconnection / approval packet scaffold`
- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`

That matters because the export path does not invent a second engineering model.

The brief exports stay narrative.

The new data-sheet exports stay structured and field-based.

## Interconnection / approval packet brief

Use this when the job needs a bounded packet-lane handoff.

It carries:

- packet posture
- metering / export posture
- source / interconnection scope
- active approval lane
- deliverable scaffold
- captured packet reference
- bounded engineering note

It is useful for:

- installer-to-engineer packet alignment
- early authority / utility preparation
- internal approval handoff

It is not:

- a formal utility form
- a stamped interconnection application

## Feeder / protection study input sheet

Use this when the live feeder and hardware assumptions need to survive into later study work.

It carries:

- study basis
- feeder / board rows
- breaker basis
- cable basis
- phase / limiting-leg basis
- cluster / source basis
- procurement carry-through prompts

It is useful for:

- one-line preparation
- feeder study input capture
- protection review preparation

It is not:

- a completed feeder study
- a completed selectivity study

## Feeder / protection study data sheet

Use this when the same study-input basis needs to leave the UI as structured CSV instead of a narrative TXT brief.

It carries:

- project identity
- working surface
- study basis
- packet stage and case status
- reference, revision, and next handback trace
- study summary rows
- board / source rows
- board notes
- handover notes

It is useful for:

- spreadsheet carry-through
- EPC tracker rows
- later feeder / protection study prep
- structured engineering review

It is not:

- a completed feeder study
- a completed protection / selectivity study

## Commissioning / witness checklist

Use this when the plant handoff is moving toward energization or witness review.

It carries:

- commissioning path
- pre-energization review
- operating-mode record
- restoration walk-through
- witness / authority hold point where relevant
- dispatch / restoration sequence carried into commissioning

It is useful for:

- internal commissioning handoff
- client witness preparation
- authority-facing witness preparation

It is not:

- a full commissioning procedure
- a final witness-test script

## Honest Boundary

These exports improve handoff quality and reduce rediscovery.

They do not replace:

- feeder studies
- protection/selectivity studies
- formal interconnection engineering
- final commissioning procedures
- stamped utility or EPC documents
