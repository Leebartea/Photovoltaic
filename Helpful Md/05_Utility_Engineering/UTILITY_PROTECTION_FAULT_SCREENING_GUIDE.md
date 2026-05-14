# Utility Protection And Fault Screening Guide

## Purpose

This guide explains the bounded protection and fault screening rows now attached to the `Feeder / protection study input capture` block.

They improve study handoff depth without pretending the app already ran a formal protection or interconnection study.

## What The Screening Covers

The study block can now screen:

- `Protected-board path screening`
- `Shared battery throughput screening`
- `Battery DC protection screening`
- `Battery DC cable-path screening`
- `AC feeder cable-path screening`
- `PV DC window screening`
- `PV source isolation screening`
- `PV string-fuse screening`
- `MPPT charge-path screening`
- `Generator board-coverage screening`
- `Generator limiting-phase screening`
- `PV field / MPPT grouping screening`
- `Modeled AC current basis`
- `Modeled surge AC current basis`
- `Staggered surge relief screening`
- `AC breaker carry margin`
- `AC breaker surge screening`
- `Fault reference screening`
- `Relay / export screening`
- `Transfer path screening`
- `Generator source screening`
- `Generator surge-source screening`
- `Generator staggered-surge screening`
- `Limiting-phase line screening`
- `Surge limiting-phase screening`
- `Neutral current screening`
- `Equal-leg cluster penalty screening`
- `Feeder-lane connected-load screening`

## What Those Rows Mean

`Protected-board path screening` carries the live protected-board result into the study lane so the handoff keeps the actual promised protected path and energy share visible.

`Shared battery throughput screening` carries the live battery-throughput result into the study lane so the handoff keeps the DC current, surge assist, charge path, and stress index visible.

`Battery DC protection screening` compares the carried battery MCCB and backup fuse against the live continuous and surge battery-path currents so the study handoff keeps DC protection drift visible before the one-line or procurement list is frozen.

`Battery DC cable-path screening` compares the carried battery cable run against the same live continuous and surge battery-path currents so the study handoff keeps cable-path drift visible before breaker, lug, busbar, and one-line assumptions are frozen.

`AC feeder cable-path screening` compares the carried AC output cable run against the live continuous and surge AC basis so the study handoff keeps feeder-cable drift visible beside the breaker and feeder-lane screens.

`PV DC window screening` carries the live PV string basis into the study lane so the handoff keeps cold-Voc, operating-voltage window, captured array current, and MPPT power fit visible before the one-line or string plan is frozen.

`PV source isolation screening` carries the live PV-side protection basis into the study lane so the handoff keeps the DC isolator, per-string fuse carry-through, and combiner carry-through aligned to the captured cold-Voc and array-current basis.

`PV string-fuse screening` checks the carried per-string fuse against the modeled per-string Isc basis and cold-Voc path so the study handoff stays honest when a multi-string PV field depends on a real string-fuse basis instead of a generic combiner note.

`MPPT charge-path screening` compares the raw PV-side charge-current basis against the captured MPPT charge-current path so the study handoff keeps charger bottlenecks visible instead of assuming the PV field can fully charge through the present MPPT path.

`Generator board-coverage screening` carries the live generator-support result into the study lane so the handoff keeps the actual board target and generator coverage visible.

`Generator limiting-phase screening` carries the same generator result into a 3-phase line-basis screen so the handoff can show whether the limiting phase is still the real constraint.

`PV field / MPPT grouping screening` carries the live field-layout and tracker-grouping result into the study lane so the handoff keeps roof/canopy separation and tracker sufficiency visible.

`Modeled AC current basis` turns the live inverter and phase configuration into a current basis for the carried study lane.

`Modeled surge AC current basis` does the same for the live surge path so the study handoff does not silently ignore starting or transfer stress.

`Staggered surge relief screening` shows how much the surge path drops if the job depends on controlled motor sequencing instead of worst-case simultaneous starts.

`AC breaker carry margin` compares the named AC breaker rating already in the design against that modeled current basis.

`AC breaker surge screening` checks the same named AC breaker against the modeled surge path so nuisance-trip risk stays visible before the surge path is frozen.

`Fault reference screening` compares the captured `Fault Level / SCC Ref` against the modeled AC basis as a simple screening ratio.

`Relay / export screening` checks whether the chosen `Relay Scheme Basis` is strong enough for the active `Export Control Basis`.

`Transfer path screening` checks whether the chosen `Transfer Scheme Basis` matches the actual working surface and feeder/source complexity.

`Generator source screening` checks the captured generator kVA against the modeled AC basis so the handoff stays honest about assisted-source limits.

`Generator surge-source screening` checks the captured generator kVA against the modeled surge path so assisted-source surge expectations do not drift above the captured generator basis.

`Generator staggered-surge screening` checks the same generator against the staged surge path so the handoff can be honest when the surge story only works if the operating team really sequences starts.

`Limiting-phase line screening` checks the tightest three-phase leg against the modeled inverter line basis and any captured generator line basis.

`Surge limiting-phase screening` checks the tightest surge leg against the modeled surge line basis before a surge-path breaker or transfer assumption is treated as settled.

`Neutral current screening` checks the estimated neutral current against the heaviest phase line current so the study handoff does not quietly ignore a stressed neutral path.

`Equal-leg cluster penalty screening` checks how much cluster capacity is being lost to imbalance before a three-phase equal-leg cluster or board schedule is frozen.

`Feeder-lane connected-load screening` turns the carried feeder lanes into approximate connected-load current screens against the declared source path.

## Where The Inputs Come From

The screening reuses fields that already exist in the live workflow:

- protected-board strategy result
- battery throughput result
- battery-side protection result
- battery-side cable result
- AC-side cable result
- PV stringing / array result
- MPPT result
- PV-side protection result
- generator-support result
- PV field / MPPT grouping result
- inverter sizing result
- AC protection result
- `Fault Level / SCC Ref`
- `Export Control Basis`
- `Relay Scheme Basis`
- `Transfer Scheme Basis`
- generator size
- phase type and AC voltage

That is why the screening shows up consistently in:

- the plant result
- the TXT study brief
- the CSV study data sheet

## Best Use

Use this layer to catch drift before the project leaves the app:

- breaker too tight for the carried AC basis
- relay scheme lighter than the declared export posture
- transfer scheme lighter than the actual plant/utility lane
- generator support being read too optimistically
- generator surge support being assumed without a bounded current screen
- staged-start dependence being left implicit instead of explicit in the study handoff
- breaker naming being frozen without checking the surge path
- surge-path assumptions being frozen without a line-current screen
- neutral current being treated as an afterthought on a three-phase board
- equal-leg cluster capacity being lost to phase imbalance before the one-line is frozen
- missing or weak fault-level reference on a heavier study lane

## Honest Boundary

This is still bounded screening only.

It does not replace:

- a formal fault study
- a protection/selectivity study
- final relay settings
- final interconnection engineering
- stamped engineering review
