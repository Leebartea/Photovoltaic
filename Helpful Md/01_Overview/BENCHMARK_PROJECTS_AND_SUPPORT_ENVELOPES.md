# Benchmark Projects And Support Envelopes

## Purpose

This document explains two related product layers:

- the locked benchmark/reference suite
- the supported-load envelope reported to installers and clients

These layers exist to keep the commercial story honest. The app should not only calculate hardware. It should also make it explicit which loads are truly protected, which loads still depend on generator/grid/timing discipline, and which loads sit outside the promised continuity path.

The current build now makes that boundary explicit in plain language:

- what can be sold as covered continuity
- what must be described as assisted support
- what must remain outside the continuity promise unless scope changes

## Benchmark Classes

The benchmark registry lives in `src/scripts/modules/00-defaults.ts` under `DEFAULTS.BENCHMARK_PROJECTS`.

Each reference is tagged as one of two classes.

### Acceptance Reference

Use this when the scenario is a repeatable, commercially valid baseline.

Expected behavior:

- phase type is stable
- strategy recommendation is stable
- board strategy is stable
- architecture remains `warn` or `pass`, not `fail`
- support story remains commercially usable

Current acceptance references:

- Tailoring Studio Reference
- Garment Workshop Reference
- Bakery Daytime Production Reference
- Cold Room Preservation Reference
- Fabrication Workshop Reference
- Mini-Factory Process Reference

### Constrained Reference

Use this when the scenario is intentionally tight and should trigger a known warning or failure pattern.

Expected behavior:

- architecture is expected to `fail` or remain clearly non-ready
- support story is expected to stay `warn` or `fail`
- failure signals are locked so the product proves it catches over-promised commercial claims

Current constrained references:

- Bakery 3-Phase Oven Reference
- Filling Station Hybrid Reference

These are deliberate. They prove the app does not silently bless:

- overloaded shared battery throughput
- weak per-phase generator support
- overstated production continuity promises

## Support Envelope

The support envelope is generated from:

- load role
- load criticality
- recommended commercial strategy
- selected board strategy
- business context

Every load is classified into one of three buckets.

### Protected Path

Meaning:

- the proposal is allowed to present these loads as part of the main continuity promise
- this is the battery-backed or primary protected operating path

Typical loads:

- critical controls
- refrigeration preservation loads
- essential base circuits
- selected high-value support circuits

### Assisted Path

Meaning:

- the load is part of the broader site story
- but it still depends on generator, grid, or disciplined daytime/process operation

Typical loads:

- bakery process equipment
- filling-station booster pumps
- workshop peaks
- process machines that are commercially important but not clean battery-continuity loads

### Outside The Promised Path

Meaning:

- the load should not be sold as part of the protected continuity promise
- it must be clearly excluded or separately qualified in the quote

Typical loads:

- discretionary comfort loads
- staged or occasional peaks
- convenience circuits
- loads that would distort the continuity promise if included casually

## Promise Boundary Language

The support envelope now derives a separate `promise boundary` layer from the same underlying support-summary object.

This is deliberate.

The bucket math answers:

- where each load sits
- what energy share sits in each path
- how much protected runtime is realistically modeled

The promise boundary answers:

- what can honestly be sold as protected continuity
- what still depends on assisted support
- what must be excluded or separately qualified

This keeps the UI and PDF from forcing users to infer the commercial promise from percentages alone.

## Runtime Metrics

The support envelope currently reports:

- protected load count
- assisted load count
- excluded load count
- protected energy share
- assisted energy share
- excluded energy share
- protected backup hours
- overnight protected coverage
- generator coverage
- protected-board peak share

These metrics appear in:

- executive summary
- commercial summary
- overview tab
- load tab
- PDF export

## Vertical Interpretation

The same math is interpreted differently by business type.

Examples:

- Bakery: ovens and heavy mixers usually belong on the assisted path unless the production-support promise is explicitly backed by generator and board scope.
- Filling station: dispensers and controls may be protected, while booster pumps often belong on the assisted path.
- Cold room: compressor, fan, and controls dominate the protected story; defrost or convenience loads should not dilute preservation logic.
- Tailoring / garment work: servo or clutch mix, compressor overlap, and ironing duty should determine whether the job stays solar-first or becomes a staged support case.
- Workshop / fabrication: peaky tools should be staged or generator-backed rather than presented as casual battery loads.

## Why This Matters

Without these layers, a calculator can still be mathematically correct while the proposal is commercially misleading.

This product now uses the benchmark suite and support envelope together to prove:

- what works as a repeatable reference
- what must still be framed as assisted support
- what should be excluded from the promise

That is a major reason the commercial standard rating is high even though the product still does not claim to be a utility-grade EPC or mini-grid engineering suite.
