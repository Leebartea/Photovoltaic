# Plant Study Inputs And Commissioning Guide

## Purpose

This guide explains the two bounded plant handoff blocks now shown in the plant result:

- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`

They exist to keep later study and energization work tied to the live design result instead of being rebuilt from memory.

## Feeder / Protection Study Input Capture

This block is the study-input seed, not the study itself.

The result now also sits beside a separate `Formal study scope required` block whenever the project has genuinely crossed beyond bounded app screening and into external feeder-fault, selectivity, interconnection, or acceptance work.

It can carry:

- feeder / board rows
- breaker carry-through
- cable run basis
- protected-board path screening
- limiting-phase assumptions
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
- inverter-cluster or source basis
- procurement-review carry-through
- bounded current / breaker / relay / transfer / fault screening

Use it to seed:

- one-line drafting
- protection review prep
- feeder review prep
- cable / breaker coordination notes

The optional utility input block can now also push the explicit study-basis status, one-line / SLD status, protection / relay pack status, and packet / study reference into this scaffold.
It can also push the active study track, named study owner / consultant, and the short fault / relay basis note into the same study lane.
It now also pushes three deeper study-handoff fields:

- `POC / Feeder / Node Ref`
- `Protection Review Scope`
- `Export Control Basis`
- `Fault Level / SCC Ref`
- `Relay Scheme Basis`
- `Transfer Scheme Basis`

Those fields make the study sheet more useful for real relay/export/protection carry-through because the handoff now preserves:

- which feeder or node is actually being reviewed
- what fault-level / SCC basis is attached to that study lane
- how deep the protection review already is
- how the declared export posture is expected to be controlled or proven
- what relay logic the handoff already depends on
- how the source-transfer or energization story is actually being carried

The study block now also turns those captured fields into bounded screening rows:

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

The PV/DC side of the same study lane now also keeps two bounded PV-specific screens visible:

- `PV DC window screening`
- `Battery DC protection screening`
- `Battery DC cable-path screening`
- `AC feeder cable-path screening`
- `PV source isolation screening`
- `PV string-fuse screening`
- `MPPT charge-path screening`

Those rows preserve:

- cold-Voc fit against the captured MPPT maximum voltage
- operating-voltage fit against the captured MPPT window
- captured string-current fit against the MPPT current limit
- captured array-power fit against the MPPT power basis
- whether the carried battery MCCB and backup fuse are actually large enough for the live continuous and surge DC path
- whether the carried battery cable run still matches the live continuous and surge DC path
- whether the carried AC output cable run still matches the live continuous and surge AC path
- whether the named PV DC isolator and multi-string protection path are actually carried through for the present field
- whether the carried per-string fuse basis is actually credible for the live multi-string PV field
- whether the raw PV-side charge-current basis is wider than the present MPPT charge path

When the next step needs structured spreadsheet carry-through instead of only narrative prose, use the `study data sheet` export from the same result block.

When the project has already crossed beyond bounded study-input carry-through, use the companion `Formal study scope required` block to identify what must leave the app for external engineering instead of treating the study sheet as the final study.

## Commissioning / Witness-Test Prep

This block is the bounded energization and witness-prep layer.

It can carry:

- pre-energization freeze items
- operating-mode record prompts
- restoration walk-through notes
- internal commissioning-pack prompts
- witness / authority hold points for heavier utility-facing jobs
- witness parties
- witness evidence pack

Use it to keep the handoff explicit before energization.

The optional utility input block can now also push the explicit commissioning path, witness parties, witness evidence, witness / closeout pack status, reference, and bounded note into this scaffold.
It now also pushes authority case status, case owner, submission/review date, and current review comments into the commissioning side when the witness lane is already live.

When the witness lane needs a field-by-field handoff instead of only prose, use the `witness data sheet` export from the same result block.

## What These Blocks Do Not Replace

They do not replace:

- formal protection studies
- feeder studies
- full commissioning procedures
- authority witness protocols
- utility interconnection engineering

## Honest Boundary

These blocks make the engineering lane more usable and more disciplined.

They do not turn the app into a full EPC study or commissioning suite by themselves.
