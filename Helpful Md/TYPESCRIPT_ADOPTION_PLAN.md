# TypeScript Adoption Plan

## Current Position

The project is now serious enough to justify TypeScript, but not a rewrite.

The correct approach is:

- keep the runtime model unchanged
- keep the standalone and hosted build outputs unchanged
- add type safety around the stable domain and calculation core first
- defer the DOM/event controller until later

This is now implemented through `TS-10`.

## TS-0 Scope

Implemented in the current build:

- `tsconfig.json` with `allowJs`, `checkJs`, and `noEmit`
- shared type definitions in `src/scripts/types/pv-types.d.ts`
- JSDoc-backed contracts on:
  - `src/scripts/modules/00-defaults.ts` (native `.ts` after TS-5; originally introduced as JSDoc-typed JS in TS-0)
  - `src/scripts/modules/10-engines.ts` (native `.ts` after TS-6; originally introduced as JSDoc-typed JS in TS-0)
  - `src/scripts/modules/20-reporting.ts` (native `.ts` after TS-4; originally introduced as JSDoc-typed JS in TS-0)
- a regression guard in `_test_typescript_setup.js`

## TS-1 Scope

Implemented in the current build:

- `package-lock.json` and a deterministic local install path via `npm ci`
- a passing `npm run typecheck` against:
  - `src/scripts/modules/00-defaults.ts`
  - `src/scripts/modules/10-engines.ts`
  - `src/scripts/modules/20-reporting.ts`
- tightened shared types so the engine layer is typed around normalized calculation objects rather than loose form-input shapes
- targeted local narrowing where engine code still touches browser state or dynamic lookup tables

## TS-2 Scope

Implemented in the current build:

- expanded shared contracts for:
  - operating schedules
  - phase-allocation results
  - commercial architecture summaries
  - commercial decision summaries
- stronger helper-level JSDoc on the pure calculation core so role, criticality, phase, and commercial helper returns are no longer just loose strings
- typed local defaults inside the commercial architecture and decision engines so the compiler now checks the actual branching logic instead of only the outer shell
- a passing `npm run typecheck` after those stricter contracts were applied

## TS-3 Scope

Implemented in the current build:

- typed domain-definition maps in `00-defaults.ts` for:
  - region profiles
  - business profiles
  - operating intents
  - continuity classes
  - operating schedules
  - commercial architecture and decision definition sets
- typed reporting payload fragments and defense-note results in `20-reporting.ts`
- shared reporting helper coverage so message aggregation is no longer just anonymous array plumbing
- a passing `npm run typecheck` after the domain maps and reporting helpers were tightened

## TS-4 Scope

Implemented in the current build:

- mixed JS/TS source support in `scripts/build_artifacts.js` so native `.ts` modules can be bundled into the browser runtime without changing the delivery model
- first native TypeScript conversion of a stable core module:
  - `src/scripts/modules/20-reporting.ts`
- the remaining stable core modules stayed in JS at that stage; defaults and engines have since moved to `.ts` in later phases
- a passing `npm run typecheck` and generated-artifact rebuild after the first real `.ts` conversion

## TS-5 Scope

Implemented in the current build:

- second native TypeScript conversion of a stable core module:
  - `src/scripts/modules/00-defaults.ts`
- native type-query aliases for the defaults/domain layer instead of JSDoc-only import typedefs
- retained plain-JS engine module at that stage while the last large pure-calculation file was still pending
- a passing `npm run typecheck` and generated-artifact rebuild after the defaults conversion

## TS-6 Scope

Implemented in the current build:

- third native TypeScript conversion of a stable core module:
  - `src/scripts/modules/10-engines.ts`
- native type-query aliases and typed signatures on the major pure-core entry points in load, aggregation, inverter, and helper paths
- targeted inference fixes surfaced by the conversion, including:
  - numeric Set/object inference in configuration search helpers
  - explicit DOM element casts in the few engine-side helper paths that touch the document
  - legacy inverter-market range alias restored in defaults so stricter engine typing did not break fallback behavior
- a passing `npm run typecheck` and generated-artifact rebuild after the engines conversion

## TS-7 Scope

Implemented in the current build:

- tightened normalized-result contracts on the pure core instead of leaving practical/comparison helpers as loose `Object`/`Array` payloads
- added explicit shared types for:
  - managed practical inverter results
  - battery practical results
  - PV practical results
  - risk-index payloads
  - panel configuration comparison and nearby-match outputs
  - multi-MPPT distribution outputs
- replaced the remaining broad JSDoc object/array contracts in the engines layer with native TypeScript signatures
- tightened commercial-decision input narrowing and removed the remaining broad cast comments in that path
- kept the controller and DOM event layer out of scope, preserving the same runtime model and output behavior
- a passing `npm run typecheck` and generated-artifact rebuild after those result-shape contracts were hardened

## TS-8 Scope

Implemented in the current build:

- extracted stable controller-adjacent summary builders into native TypeScript:
  - `src/scripts/modules/25-controller-payloads.ts`
- typed the low-risk payload-prep path for:
  - confidence metrics
  - business-context summaries
  - commercial architecture hint summaries
  - operational schedule summaries
  - project snapshot summaries
- left the DOM/event-heavy controller in `src/scripts/modules/30-controller.js`, but rewired those summary methods to call the typed helper module
- added shared summary contracts for the new controller-side payloads in `src/scripts/types/pv-types.d.ts`
- kept the runtime and deployment model unchanged, with the same generated standalone and hosted outputs
- a passing `npm run typecheck` and generated-artifact rebuild after the first controller-side payload extraction

## TS-9 Scope

Implemented in the current build:

- extracted stable controller-adjacent workspace/project state helpers into native TypeScript:
  - `src/scripts/modules/26-controller-state.ts`
- typed the low-risk state-shaping path for:
  - project-name sanitization and slug generation
  - project snapshot creation
  - normalized project snapshot import/migration
- left `src/scripts/modules/30-controller.js` in JS, but rewired the snapshot/state helpers to call the typed state module
- added shared state contracts for:
  - serialized form state
  - project dynamic state
  - project snapshot meta and normalized snapshot payloads
- kept the runtime and deployment model unchanged, with the same generated standalone and hosted outputs
- a passing `npm run typecheck` and generated-artifact rebuild after the controller-state extraction

## TS-10 Scope

Implemented in the current build:

- extracted stable controller-adjacent workflow-guide and input-section helper logic into native TypeScript:
  - `src/scripts/modules/27-controller-guidance.ts`
- typed the low-risk UI-guidance path for:
  - input-section definitions
  - workflow flow-state resolution
  - per-section summary text
  - workflow coach section fallback/focus resolution
  - default section expansion rules
- left `src/scripts/modules/30-controller.js` in JS, but rewired the summary/guidance methods to call the typed guidance module
- added shared guidance contracts for:
  - input section definitions
  - quick-step summaries
  - flow state
  - summary context
  - workflow guide definitions
- kept the runtime and deployment model unchanged, with the same generated standalone and hosted outputs
- a passing `npm run typecheck` and generated-artifact rebuild after the guidance extraction

Intentionally not included yet:

- `src/scripts/modules/30-controller.js`
- `src/scripts/modules/40-init.js`
- a big-bang `.ts` conversion

## Why This Boundary Is Correct

The highest return is in:

- domain constants
- engine input/output contracts
- report/export payload shapes
- support-summary / submission-pack / finance payloads

The lowest return right now is in:

- raw DOM event handlers
- focus management
- section-collapse UI plumbing
- browser-only initialization glue

Those areas change faster and are more coupled to the document structure, so they should come later.

## Shared Type Layer

The shared type file now defines the main cross-engine contracts, including:

- `RegionProfile`
- `SystemConfig`
- `ApplianceInput`
- `AggregationResult`
- `InverterSizingResult`
- `BatterySizingResult`
- `PVArrayResult`
- `AdvisoryItem`
- `SupportSummary`
- `ReportPayload`

This is deliberate. The goal is to stabilize the language between engines before changing file extensions.

## Normalized Result Rule

Every engine should continue moving toward a predictable return shape.

That means:

- warnings stay on `warnings`
- hard stops stay on `blocks`
- installer guidance stays on `suggestions`
- optional advisory sections use stable keys instead of ad hoc property names

TypeScript becomes much more valuable once result objects are normalized.

## Recommended Next TypeScript Steps

### Phase TS-10

- stop the TypeScript track here unless a real product need appears
- keep event wiring, direct element mutation, focus management, and browser-only glue in JS
- only resume if there is a specific defect or reuse case that justifies typing more of `30-controller.js`

## What Not To Do

- do not rewrite the app into TypeScript all at once
- do not start with `30-controller.js`
- do not change the build/distribution model just to adopt typing
- do not let the type layer outrun the normalized result-object discipline

## Final Verdict

TypeScript is justified now.

The current implementation path is the correct one:

- JSDoc first
- shared types first
- stable engines first
- controller later

That keeps the project safer without compromising deployment simplicity.
