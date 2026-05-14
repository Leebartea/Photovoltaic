# Proposal Branding And Release Control Guide

## Purpose

This guide explains the optional branding and release block inside `Proposal Identity & Site Survey`.

It adds local workflow layers first, and now also supports an optional backend-backed shared profile sync path:

- a browser-saved company profile library
- optional branded asset slots for accent, issuer tagline, and footer note
- lightweight local logo / letterhead support for branded preview and PDF header treatment
- a company-scoped release-template library plus proposal release-control preview and TXT brief
- optional shared company-profile sync when backend runtime is configured

## Why It Fits The Product

This is a clean upgrade because:

- manual proposal identity fields still work without premium
- the new layer sits beside the existing proposal workflow instead of inside sizing math
- local use still works without backend
- all state stays local to the browser unless the user explicitly uses the optional backend sync path

## Company Profile Library

The company profile library lets the user:

- label a company profile
- save the current issuer/contact details to the browser
- carry optional brand accent, issuer tagline, and footer note with that saved profile
- load a saved profile into the live proposal fields
- delete an old saved profile

The live proposal identity fields stay editable in every tier.

The saved-profile library actions are softly aligned to `branded_exports`.

That is deliberate:

- manual honesty stays free
- brand convenience becomes premium

## Brand Asset Slots

The same block now also carries optional branded asset fields:

- brand accent
- issuer tagline
- footer note
- local logo upload for lightweight letterhead use

These fields stay visible and editable in every tier.

The premium rule is narrower:

- branded PDF treatment only uses these extras when `branded_exports` is granted
- save/load convenience still belongs to the local company-profile library
- the dedicated branded proposal-pack TXT also stays aligned to `branded_exports`

That keeps the free proposal identity honest without silently turning presentation polish into a hard blocker.

## Logo / Letterhead Support

The branding block now also accepts a lightweight local PNG or JPEG logo.

This is intentionally small-scale:

- it stays in browser storage
- it is meant for local branded letterhead polish, not central asset management
- it is capped so project and profile storage do not become unstable

That is why backend is still not required for the normal proposal workflow.

If later you need:

- cross-device logo sync
- seat-based brand control
- central asset governance
- approval over shared brand packs

then that is the point where backend becomes justified.

That point is now partially reached for shared company-profile sync:

- the live fields are still local and editable
- the local browser library still works
- but a team can now publish the current company profile to the backend library and import shared profiles back into a browser later

This keeps the boundary clean:

- browser-first for ordinary use
- backend only for cross-device shared convenience

## Company-Scoped Release Templates

The release block now also supports company-scoped release templates.

This lets a desk:

- inspect built-in default release templates
- save the current release state + note as a company-scoped template
- apply a saved template into the live release fields
- delete an old company-scoped template

The save/apply/delete actions are softly aligned to `team_workspace`.

The live release state and notes stay editable in every tier.

## Proposal Release Control

The release-control block lets the user capture:

- working draft
- internal review
- ready for client
- issued to client
- frozen for delivery

It also keeps a short release note plus a live preview of open release checks.

That preview stays visible in every tier.

The dedicated release TXT is softly aligned to `team_workspace`.

If a release template is selected, the live release preview also shows that link so the operator can see whether the live state is coming from a reusable template or from manual entry.

## Branded Proposal Pack

The block now also produces a branded proposal-pack TXT.

It carries:

- installer identity
- quote control
- client / site identity
- release state
- selected release template
- survey posture
- brand accent, tagline, footer note
- local logo presence

This is a branded issue-control summary that can travel beside the main PDF without introducing backend dependency.

## What The Release Preview Checks

The current release preview warns when:

- a client-ready state has no client name
- a client-facing state has no quote reference
- a client-issued state is still only on a preliminary survey footing
- a frozen-for-delivery state still has no named team handback target

This keeps the release posture honest without pretending the app has become a full approval backend.

## Maintainer Rule

If this block expands later:

1. keep manual proposal identity free and visible
2. keep release posture visible even when TXT export is gated
3. keep saved-profile logic local until true sync requirements exist
   Note: shared profile sync now exists as an optional adapter, but the local browser library remains the base behavior.
4. keep company-scoped release-template logic local until true sync requirements exist
5. keep lightweight logo handling local until shared asset control is truly needed
6. keep premium checks in the controller entitlement seam, never in sizing logic
