# Team Workspace Approval And Handoff Guide

## Purpose

This guide explains the new team-workflow layer in `Project Workspace`.

It is intentionally small, local, and offline-first first.

The goal is to let a draft move cleanly between desks without forcing backend, user accounts, or a shared database into the product before they are actually worth it.

## What The Workspace Block Does

The `Team handback & approval flow (optional)` block captures:

- workflow stage
- current owner / desk
- review or approval desk
- next handback target
- next due date
- release conditions / notes
- saved desk roster entries
- named team seats with role/state posture
- installation-level workspace admin / coordinator metadata

It then turns that into a live handback preview.

It now also supports an optional backend-assisted sync path:

- `Publish Admin & Desk`
- `Import Shared Roster`
- `Publish Current To Backend`
- `Pull Latest For Project`

That path is still scoped and honest. It syncs the current desk roster/admin state and the current project handback state for the active installation key. It is not yet a full seat/auth system.

It now also includes a stronger premium/backend posture:

- a named active team seat on the current device
- shared team-seat sync
- server-side role/state checks on protected shared writes once shared seats exist

## Why It Fits The Existing Structure

This sits well inside the current architecture because:

- it reuses the existing project workspace surface
- it is stored inside the same local project snapshot as normal form state
- it does not touch sizing, warnings, or engineering math
- it still does not require backend or account state for normal use

The optional backend path exists only to move the same handback state between browsers or desks more cleanly when shared follow-through is actually needed.

That is the right boundary.

## Free Vs Paid Behavior

Visible in every tier:

- the team workflow fields
- the live handback preview
- the owner / target / due-date posture
- the desk roster/admin preview
- the live active-seat posture preview

Soft-gated in the `Studio Team` lane:

- `Save Desk`
- `Apply To Owner`
- `Apply To Review`
- `Delete`
- `Publish Admin & Desk`
- `Import Shared Roster`
- `Save Seat`
- `Set Active`
- `Delete`
- `Publish Current To Backend` for team seats
- `Import Shared Seats`
- `Copy handback brief`
- `Download TXT`

This means the product never hides the workflow state itself.

It only reserves the dedicated team-handoff export for the higher workflow tier.

The shared backend sync actions are also aligned to the `team_workspace` lane.

## Recommended Use

Use the block when:

- sales is shaping the quote and engineering must review it
- engineering is clearing the project for installer operations
- installer operations is preparing a client-ready release
- a draft needs a named next owner and due date instead of chat-only follow-up
- the same installation needs a reusable desk roster and coordinator line across browsers or desks
- the same installation now also needs a named operator seat so shared backend actions and audit traces do not collapse into a generic browser/device label

Do not use it as:

- a replacement for project save/load
- a replacement for the formal utility packet lane
- a replacement for a real multi-user backend

The current backend sync path is a good cross-device bridge, but it is still not the same thing as:

- user authentication
- seat management
- permissioned workflow control
- audit-grade admin history

The new team-seat layer improves that posture, but it is still a bounded bridge, not final enterprise auth.

## Export Content

When the entitlement allows it, the handback TXT includes:

- project name
- current stage
- owner / desk
- review desk
- next handback target
- due date
- audience mode, system type, and business profile
- location and appliance count
- installer / client / site references when present
- release conditions
- open follow-through items

## Maintainer Rule

If this lane expands later:

1. keep the live preview visible even when export is gated
2. keep storage inside the normal project snapshot unless true multi-user sync is introduced
3. keep premium checks in the controller entitlement seam
4. do not push team-workflow rules into sizing or engineering calculations
