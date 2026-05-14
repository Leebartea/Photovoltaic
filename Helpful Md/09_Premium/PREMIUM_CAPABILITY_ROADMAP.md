# Premium Capability Roadmap

## Purpose

This guide lays out the safest path for introducing paid capability into the product without weakening the current offline-first structure.

The goal is not to bolt billing onto random buttons.

The goal is to add a clean capability layer that can later drive:

- packaging
- entitlement checks
- workspace-level limits
- export-level limits
- branding options
- heavier engineering workflow access

## Why The Product Is Ready Now

The product is now strong enough that premium value can be attached to workflow depth rather than artificial limitation.

That matters.

If the product is monetized too early, the result is usually one of these bad outcomes:

- core sizing trust is damaged
- safety or engineering warnings are hidden behind payment
- the free experience becomes hostile
- the codebase gets entitlement checks scattered across the controller

We should avoid all four.

## Product Principles

These principles should stay fixed:

1. Core sizing stays trustworthy.
   Core calculator logic, saved-project continuity, and safety-critical warnings should remain available in the base product.

2. Paid capability should gate leverage, not honesty.
   Good gates are branding, advanced exports, team workflow, approval lanes, plant handoff depth, and integrations.

3. Billing must never live inside calculation math.
   The sizing engine should not care whether the user is free, paid, offline, or enterprise.

4. Entitlements should be capability-based, not page-based.
   A single capability registry should decide what is available.

5. Offline-first must survive.
   The paid model should support a signed local entitlement fallback for field use, installer laptops, and no-internet environments.

## Does This Introduce A Backend?

Not for the calculator itself.

The current premium foundation and the next entitlement phase can stay frontend-only and offline-first.

What exists now or can be added next without backend:

- capability catalog
- tier catalog
- local entitlement resolver
- passive premium badges and upgrade guidance
- offline grace behavior

What now also exists as an optional adapter:

- backend runtime client in `src/scripts/modules/29-backend.ts`
- reference sync server in `backend/server.js`
- optional workspace backend-sync block for device entitlement refresh

Backend only becomes useful later for:

- checkout and subscription status
- seat management
- company or team admin
- CRM / ERP / distributor sync
- entitlement refresh across devices

That backend should remain an adapter around the entitlement layer, not part of the sizing or engineering logic.

## Recommended Packaging Model

Use a four-layer model:

### 1. Free core

Keep free:

- core sizing
- project save/load
- core reports and result explanation
- warning and blocker visibility
- basic proposal generation
- basic plant-scope honesty

Do not gate:

- safety warnings
- hard blocks
- confidence / coping explanation
- project recall

### 2. Solo paid tier

Best first monetization tier:

- commercial presets
- richer finance sensitivity
- supplier quote import and freshness workflow
- branded exports
- richer PDF/report polish
- authority / submission pack visibility

This is the best first paid lane because it monetizes time savings and presentation quality without damaging trust in the free calculator.

### 3. Team / business tier

Best second monetization tier:

- multi-user project ownership
- approval handback
- role-based review checkpoints
- company profile / team branding
- branch / status workflow for projects

This tier sells workflow control, not raw calculation access.

### 4. Engineering / enterprise tier

Best advanced tier:

- plant engineering handoff depth
- formal study surface
- advanced study exports
- API / connector workflows
- enterprise branding / admin / seat control

This is where higher-value monetization belongs.

## Capability Catalog

The clean foundation is now a capability catalog in:

- `src/scripts/modules/00-defaults.ts`
- `src/scripts/types/pv-types.d.ts`

That catalog should remain the source of truth for:

- capability features
- tier definitions
- rollout principles

The controller can then read that catalog through:

- `getPremiumCapabilityProgram()`
- `getPremiumCapabilityFeatures()`
- `getPremiumCapabilityTiers()`
- `getPremiumCapabilityTierDefinition()`

## Recommended Tiers

These are good working tiers for the current product:

### Community

Use for:

- learning
- scoping
- early installer use

Keep included:

- core design workflow
- saved projects / workspace continuity

Keep it clearly useful.

### Installer Pro

Use for:

- solo installers
- proposal-heavy users
- small commercial shops

Good premium bundle:

- commercial workflow
- branded exports
- authority submission lane

This should probably be the first live paid tier.

### Studio Team

Use for:

- sales + installer teams
- internal approval flow
- branch-level operations

Good premium bundle:

- team workspace
- branded exports
- commercial workflow
- approval handback controls

### Engineering Plus

Use for:

- plant handoff teams
- protection consultants
- commercial engineering desks

Good premium bundle:

- plant engineering handoff
- formal study surface
- authority / submission lane

### Enterprise

Use for:

- EPC platforms
- distributors
- enterprise operations

Good premium bundle:

- integrations
- team admin
- enterprise branding
- structured policy control

## What Should Be Premium First

Recommended first gated items:

- branded PDF/report exports
- premium commercial presets
- advanced finance sensitivity
- supplier quote import assistant
- supplier quote freshness / refresh pack
- richer authority submission packs

Recommended second wave:

- team workflow
- approval handback
- shared workspace controls
- installer-company identity templates

Recommended later wave:

- plant engineering surface
- formal study surface
- enterprise connectors

## What Should Not Be Premium First

Avoid gating these early:

- load entry
- core sizing
- project save/load
- blocker visibility
- protection warnings
- confidence or coping explanation
- plant boundary honesty

If those get gated, the product starts feeling manipulative instead of premium.

## Architecture Roadmap

### Phase 0: Foundation

Status:

- capability catalog defined in `DEFAULTS`
- tier catalog defined in `DEFAULTS`
- shared types added
- controller getters added

Rules:

- no runtime gating yet
- no billing dependency yet
- no UI noise yet

This is the correct current stop point.

### Phase 1: Soft entitlement layer

Add:

- a single entitlement object
- a capability resolver
- a passive UI state for locked-but-visible premium features

Recommended object shape:

```js
{
  planKey: 'installer_pro',
  grantedCapabilities: ['commercial_workflow', 'branded_exports'],
  source: 'local_license' | 'server_sync' | 'trial' | 'community',
  expiresAt: '2026-06-30',
  offlineGraceDays: 14
}
```

Implementation rule:

- do not query billing state directly from rendering logic
- always ask one resolver whether a capability is granted

Status now:

- `src/scripts/modules/28-entitlements.ts` added as the backend-free entitlement resolver
- controller reads one resolved entitlement instead of spreading tier logic through rendering
- passive posture notes now appear in the commercial workflow and formal-study surface
- optional local entitlement workspace panel now supports offline trial or local-license loading
- branded export posture is now visible while base PDF remains available
- formal-study work-pack and data-sheet exports now use soft action-level gating
- team handback posture is now visible in Project Workspace while the dedicated TXT handback export is staged for Studio Team
- proposal identity now has a local company-profile library plus release-control preview, with profile save/load staged for branded workflow and release TXT staged for Studio Team
- proposal identity now also carries local brand asset slots plus company-scoped release templates, while the save/apply/delete template actions stay aligned to Studio Team and the branded issuer treatment stays aligned to branded exports
- proposal identity now also supports lightweight local logo / letterhead storage plus a branded proposal-pack export, still without requiring backend asset sync
- no hard gating on core sizing, warnings, or result visibility
- no billing dependency yet

### Phase 2: Safe UI gating

Gate only:

- branded exports
- premium preset application
- advanced finance panels
- supplier quote import / refresh pack
- advanced handoff exports

UX rule:

- show the feature
- explain what it does
- show why it is premium
- never hide core state or results the feature depends on

### Phase 3: Team workflow monetization

Add:

- company profiles
- project ownership
- role-level checkpoints
- approval handback
- proposal release states

Current footing:

- local owner / review desk / handback target / due-date capture now lives in Project Workspace
- the live preview remains visible in every tier
- the first dedicated team workflow export is now softly aligned to `team_workspace`
- proposal identity now has a local company-profile library and release-control preview without backend dependency
- the company-profile save/load library is now softly aligned to `branded_exports`
- the proposal release TXT is now softly aligned to `team_workspace`

This is likely the strongest recurring-value tier after solo paid.

### Phase 4: Engineering lane monetization

Add premium access around:

- plant engineering handoff depth
- formal study work pack
- formal study data sheet
- formal study surface extensions

Important:

Do not gate simple boundary honesty.

The free product should still be allowed to say:

- this is outside current scope
- this needs plant review
- this needs formal study

What becomes paid is the structured workflow around that lane.

### Phase 5: Enterprise and connectors

Only after the earlier layers are stable:

- CRM sync
- ERP / quote sync
- distributor catalog sync
- entitlement admin
- seat management
- audit trail
- white-label / reseller model

## Billing and Entitlement Strategy

Use a two-layer approach:

### Billing provider

External service should handle:

- checkout
- subscription state
- invoices
- renewals

Examples later could be Stripe, Paddle, or a distributor-managed contract layer.

### Product entitlement adapter

The app should only consume:

- plan key
- capability grants
- expiry / grace state

This separation protects the codebase from billing-specific sprawl.

## Offline-First Entitlement Strategy

The product should support three states:

### Online verified

- pull latest entitlement
- refresh local signed token

### Offline valid

- use cached signed entitlement
- allow grace window

### Offline expired

- keep core free workflow available
- degrade only premium extras
- never block project retrieval or safety warnings

This is critical for installer trust.

## Recommended File Boundaries

Keep monetization logic out of engine math.

Good file ownership:

- `src/scripts/modules/00-defaults.ts`
  - capability and tier catalog

- `src/scripts/types/pv-types.d.ts`
  - entitlement and premium-capability contracts

- `src/scripts/modules/28-entitlements.ts`
  - capability resolver
  - local entitlement parsing
  - grace-window logic

- `src/scripts/modules/30-controller.js`
  - UI decisions only
  - premium badges
  - upgrade prompts
  - safe gating for actions

- `src/template.html`
  - premium markers and upgrade affordances only where needed

## UX Rules For Paid Capability

1. Locked features should still explain their value.
2. Upgrade prompts should appear at decision points, not everywhere.
3. Do not spam upgrade banners across the free workflow.
4. Use quiet badges and contextual upgrade actions.
5. Respect current user mode:
   - client mode should get less technical upgrade language
   - installer mode can see deeper workflow value

## Rollout Sequence

Recommended live order:

1. Installer Pro
2. Studio Team
3. Engineering Plus
4. Enterprise

That sequence matches the current product strength.

## Pricing Testing Strategy

Do not hard-code final pricing too early.

Instead:

- keep tier names and capability bundles stable
- test monthly and annual anchors
- observe which bundles users actually value
- avoid pricing engineering depth too cheaply

Recommended first experiments:

- Installer Pro monthly vs annual
- Engineering Plus as a higher-value add-on
- team workspace as a seat-based or workspace-based plan

## Documentation Plan

When premium work starts for real, update:

- `README.md`
- `Helpful Md/START_HERE_FOR_USERS_AND_MAINTAINERS.md`
- installer/client guides where locked features appear
- release notes or migration notes for new tiers

Also add one future operations guide:

- `Helpful Md/PREMIUM_CAPABILITY_OPERATIONS_GUIDE.md`

That guide should explain:

- how entitlements are issued
- how offline grace works
- how support handles expired premium state

## Recommended Immediate Next Steps

1. Keep the new capability catalog as the only source of truth.
2. Keep the entitlement resolver as the only capability-check seam before any UI gating expands.
3. Start with `Installer Pro` because it monetizes convenience and proposal power without harming trust.
4. Delay enterprise connectors until the local capability model is stable.
5. Keep the free core clearly useful forever.

## Bottom Line

The product is ready for premium capability.

But the correct path is:

- capability catalog first
- entitlement resolver second
- soft UI gating third
- team and engineering workflow monetization after that

That sequence fits the existing structure, preserves the offline-first value, and keeps the codebase coherent.
