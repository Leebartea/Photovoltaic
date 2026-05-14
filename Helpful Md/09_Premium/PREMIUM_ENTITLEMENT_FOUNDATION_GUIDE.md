# Premium Entitlement Foundation Guide

## Purpose

This guide explains the first real premium-capability implementation layer.

It is intentionally small, local, and offline-first.

The goal is to prepare the product for paid capability without mixing billing logic into the calculator itself.

## What Exists Now

The premium foundation now has three layers:

1. capability catalog in `src/scripts/modules/00-defaults.ts`
2. shared contracts in `src/scripts/types/pv-types.d.ts`
3. entitlement resolver in `src/scripts/modules/28-entitlements.ts`

The controller reads that resolver and uses it only for quiet premium posture hints right now.

There is still no hard gating in the live workflow.

## Does This Introduce A Backend?

Not by default.

The current entitlement layer is still backend-safe and offline-first.

It resolves in this order:

1. explicit raw entitlement passed into the resolver
2. `window.__PV_PREMIUM_ENTITLEMENT__`
3. local storage key `pvCalculatorPremiumEntitlementV1`
4. community fallback

That means the product can keep working offline and still understand premium posture without needing a live service call.

The repo now also includes an optional backend adapter layer:

1. `src/scripts/modules/29-backend.ts`
2. optional workspace runtime fields for API base URL and installation key
3. reference Node server at `backend/server.js`

That adapter is only for trusted sync. It does not replace the offline resolver.

## Current Runtime Behavior

The resolver currently supports these entitlement sources:

- `community`
- `trial`
- `local_license`
- `server_sync`

It also supports these states:

- `active`
- `grace`
- `expired`

If a premium entitlement expires:

- community capabilities stay available
- premium capabilities can drop back safely
- project recall and safety-critical warnings stay untouched

## Where The Passive UI Shows Up

The current release uses the entitlement layer only for quiet posture notes in places that are likely future paid lanes:

- commercial workflow preview
- formal-study surface
- export section branded-export posture note

It also adds an optional local entitlement panel in the project workspace so offline trials or local license JSON can be loaded without backend dependency.

It now also adds an optional backend-sync panel in the project workspace so a separately hosted API can refresh the local entitlement on this device when that is actually useful.

It now also applies the first soft action-level gating:

- formal study work-pack export
- formal study data-sheet export
- team handback TXT export
- company-profile save/load library actions
- local logo import / clear and branded proposal-pack export actions
- company-scoped release-template save / apply / delete actions
- proposal release TXT export

The live formal-study result stays visible.

The live team handback preview also stays visible.

Only the dedicated handoff exports are softly gated.

That is deliberate.

It proves the entitlement seam works without polluting the whole UI with upgrade noise.

## Branded Export Behavior

Base PDF export remains available in community mode.

The premium layer now only adds a branded issuer treatment when `branded_exports` is granted:

- issuer-forward header badge
- company-first footer identity
- branded export line in proposal control
- optional brand accent, issuer tagline, and footer note carried from the proposal identity block
- optional lightweight local logo carried into the branded PDF header when available

This keeps the free PDF useful while reserving higher-polish presentation for the premium lane.

## Why This Fits The Existing Structure

This keeps the current architecture clean because:

- engine math still knows nothing about billing
- offline use is still first-class
- controller rendering asks one resolver for capability posture
- future checkout or sync adapters can be added later without rewriting the calculator

## When Backend Becomes Worthwhile

Backend becomes useful when the product needs:

- subscription state across devices
- company seats
- admin controls
- invoice or contract status
- CRM / ERP / distributor sync
- shared company-brand libraries across devices
- trusted entitlement enforcement that should not live only in browser code

That backend should feed the entitlement layer.

It should not become a dependency inside sizing, warnings, or engineering screening.

## Maintainer Rule

If a future feature needs premium behavior:

1. add or confirm the capability in the catalog
2. resolve entitlement through `28-entitlements.ts`
3. let the controller decide the UI behavior
4. do not add billing-specific checks inside calculation code

## Build Reminder

Source of truth stays in `src/`.

After editing, rebuild both runtime targets with:

```bash
node scripts/build_artifacts.js
node scripts/build_artifacts.js --check
```

If you want to check the optional reference backend too:

```bash
npm run backend:check
```
