# Plant Study Data Sheet Guide

This guide explains the structured CSV export for the `Feeder / protection study input capture` block.

## What It Is

The study data sheet is the structured companion to the narrative TXT study brief.

It exports the live study-input basis as CSV so the same handoff can move into:

- engineering review sheets
- internal EPC trackers
- spreadsheet carry-through
- later feeder / protection study prep

## What It Carries

The CSV can include:

- project identity
- working surface
- study basis
- study track
- protected-board path screening
- shared battery throughput screening
- battery DC protection screening
- battery DC cable-path screening
- AC feeder cable-path screening
- PV DC window screening
- PV source isolation screening
- PV string-fuse screening
- MPPT charge-path screening
- generator board-coverage screening
- generator limiting-phase screening
- PV field / MPPT grouping screening
- protection review scope
- export control basis
- relay scheme basis
- transfer scheme basis
- modeled AC current basis
- modeled surge AC current basis
- staggered surge relief screening
- AC breaker carry margin
- AC breaker surge screening
- fault-reference screening
- relay/export screening
- transfer-path screening
- generator-source screening
- generator surge-source screening
- generator staggered-surge screening
- limiting-phase line screening
- surge limiting-phase screening
- neutral-current screening
- equal-leg cluster penalty screening
- feeder-lane connected-load screening
- packet stage and case status
- reference, POC / feeder / node ref, fault level / SCC ref, revision, and next handback trace
- study summary rows
- formal study scope rows
- board / source rows
- board notes
- handover notes

## Best Use

Use the TXT brief when a person needs a readable study handoff.

Use the CSV when the next step needs structured rows instead of narrative prose.

When the project has already crossed beyond bounded app screening, the same CSV now also carries `formal_scope` rows so downstream engineers can see which items must leave the app for external study work.

## Honest Boundary

This is still a study-input export.

It does not replace:

- the feeder study
- the protection study
- selectivity calculations
- final stamped engineering
