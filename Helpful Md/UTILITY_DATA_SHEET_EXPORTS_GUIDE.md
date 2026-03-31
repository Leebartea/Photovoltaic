# Utility Data Sheet Exports Guide

The utility lane now exposes three structured data-sheet exports in addition to the existing TXT briefs:

- `Copy packet data sheet` / `Download CSV`
- `Copy study data sheet` / `Download CSV`
- `Copy witness data sheet` / `Download CSV`

These exports are generated from the same live plant-scoping, compliance, packet, and commissioning objects already used by the result view. They do not create a second hidden engineering model.

## Why These Data Sheets Exist

The TXT briefs are good for human handoff.

The CSV data sheets are better when the next step needs:

- field-by-field engineering review
- approval-packet carry-through
- structured witness-prep notes
- spreadsheet-based authority or EPC prep
- cleaner import into internal tracking sheets

## Interconnection Data Sheet

Use this when the job has a real approval lane and you want a structured record of:

- project identity
- working surface
- source / interconnection scope
- packet lane
- packet stage
- progression gate
- authority case status
- filing channel
- primary hold point
- response return path
- metering / export posture
- one-line / SLD status
- protection / relay pack status
- witness / closeout pack status
- authority / code-family basis
- case owner
- submission / review date
- current revision / response
- next action owner / handover
- next action due date
- next required action
- submission / review trail
- open stage blockers
- stage-exit handback
- stage-specific packet discipline rows
- case-timeline rows
- stage-template rows
- review comments
- focus deliverables
- open submission actions
- packet reference
- bounded engineering note

It is useful for:

- internal approval tracking
- interconnection packet prep
- engineering review meetings
- authority-facing checklist preparation
- stage-specific packet handback discipline by export state
- revision and review-state continuity across the packet life cycle
- stage-specific packet bundle drafting without losing the live case context

It is not:

- a final stamped interconnection form
- a utility-submitted application pack

## Witness Data Sheet

Use this when the job has moved into commissioning or witness preparation and you want a structured record of:

- commissioning path
- authority case status
- witness parties
- witness evidence posture
- witness / closeout pack status
- case owner
- submission / review date
- current revision / response
- next action owner / handover
- next action due date
- next required action
- submission / review trail
- review comments
- packet / study reference
- engineering note
- commissioning hold points
- dispatch / restoration steps carried into energization

It is useful for:

- commissioning planning
- witness-party alignment
- acceptance evidence planning
- internal plant handoff

It is not:

- a completed commissioning method statement
- a formal witness-test script

## Study Data Sheet

Use this when the feeder / protection study-input basis needs to move into spreadsheet-style engineering carry-through.

It captures:

- project identity
- working surface
- study basis
- study track
- protection review scope
- export control basis
- relay scheme basis
- transfer scheme basis
- study deliverable readiness
- packet stage and case status
- one-line / SLD status
- protection / relay pack status
- study owner / consultant
- POC / feeder / node ref
- fault level / SCC ref
- fault / relay basis note
- reference, revision, and next-action trace
- study summary rows
- board / source rows
- board notes
- handover notes

It is useful for:

- feeder study preparation
- protection review preparation
- internal EPC tracking sheets
- structured engineering carry-through

It is not:

- a completed feeder study
- a completed protection / selectivity study

## Best Use Pattern

Use the exports this way:

1. Read the plant result first.
2. Confirm the `Current working surface`.
3. Use the TXT brief when humans need a readable handoff.
4. Use the CSV data sheet when the next step needs structured tracking or spreadsheet carry-through.

## Honest Boundary

These data sheets improve engineering traceability.

They do not replace:

- feeder studies
- protection/selectivity studies
- formal interconnection engineering
- final authority forms
- utility-grade commissioning procedures
