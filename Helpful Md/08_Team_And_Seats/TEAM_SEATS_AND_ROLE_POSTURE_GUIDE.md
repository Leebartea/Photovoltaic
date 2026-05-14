# Team Seats And Role Posture Guide

## Purpose

This guide explains the new `team seat` layer in the premium/backend workflow.

It exists so shared premium actions can carry a named operator seat instead of a vague browser/device label.

The goal is to improve trust and auditability without moving the calculator core to the backend.

## What A Team Seat Is

A team seat is a named operator identity for the current installation, for example:

- `Ada - Workspace Admin`
- `Chinedu - Engineering Review`
- `Tunde - Sales Desk`

Each seat now carries:

- `Seat Role`
- `Seat State`
- optional contact line
- optional public access-code hint
- optional shared sign-in posture
- effective shared permissions derived from role + state

## Role And State Model

The current role catalog reuses the team-workspace organizational roles and adds one explicit admin role:

- `Sales Desk`
- `Commercial Review`
- `Engineering Review`
- `Installer Ops`
- `Client Delivery`
- `Management Sign-off`
- `Workspace Admin`

The current seat states are:

- `Active`
- `Review-only`
- `Suspended`

Permission logic is intentionally simple:

- `Active` keeps the full role permission set
- `Review-only` is reduced to read/audit posture
- `Suspended` is blocked from shared backend actions

## What It Guards

This layer now matters for shared premium/backend actions such as:

- shared company-profile publish
- shared team-roster/admin publish
- shared team-handback publish
- backend audit pull
- shared team-seat publish

The live previews still stay visible.

The guard is on the shared action itself, not on the calculator math.

## Bootstrap Rule

The first shared team seat for an installation is special.

There is no existing seat yet, so the backend allows a bootstrap path:

- the first shared seat must be `Workspace Admin`
- it must be in `Active` state
- after that first seat exists, shared writes require a valid `actorSeatId`

This keeps first-time setup possible without weakening the steady-state permission model.

## Local-First Behavior

The team-seat library is still local-first.

The browser can:

- save named seats locally
- set one saved seat as the current active seat
- work without backend sync

The active seat is treated as workspace/runtime posture, not proposal math.

## Backend Routes

The optional reference backend now includes:

- `GET /api/team-seats/example`
- `GET /api/team-seats?installationKey=...`
- `POST /api/team-seats`

Public seat sync now returns:

- `authEnabled`
- `accessCodeHint`

It does not return:

- access-code hash
- access-code salt
- the raw sign-in code

Once shared seats exist for an installation:

- shared writes require a valid `actorSeatId`
- audit reads also require a seat that holds `audit_read`

## Security Boundary

This is stronger than frontend-only gating, but it is still not full authentication.

Honest boundary:

- server now enforces role/state posture for protected shared writes
- frontend no longer acts like the security boundary
- API key plus server-side seat checks protect the premium sync surface better

Still not included yet:

- real user login
- cryptographic identity proof per user
- identity-provider-backed seat sign-in
- enterprise RBAC

The backend now does support short-lived seat sessions and seat access-code sign-in, but this is still a bounded product-layer auth model, not a full enterprise IAM stack.

The seat layer now also includes an explicit admin recovery lane for:

- forced revoke of active seat sessions
- temporary sign-in lockout clear
- controlled access-code rotation
- shared sign-in disable
- suspend / restore posture
- one-time onboarding / re-enrollment invite issue

## Recommended Production Direction

Use this layer as the bridge to a fuller auth model, not as the final destination.

Recommended next steps for a production premium deployment:

1. keep calculator math frontend/offline-first
2. keep shared premium writes behind the backend seam
3. move from raw API key posture to authenticated seat/session flow
4. retain server-side audit logging
5. expand role checks only around shared premium actions, not sizing math

For the seat sign-in and session lifecycle details, also read:

- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
