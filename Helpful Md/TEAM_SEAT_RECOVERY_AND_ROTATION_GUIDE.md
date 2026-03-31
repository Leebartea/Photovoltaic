# Team Seat Recovery And Rotation Guide

## Purpose

This guide explains the new admin-grade recovery lane for shared team seats.

It exists for the moments when normal seat sign-in is no longer enough:

- a desk is locked out after repeated bad sign-in attempts
- an operator laptop changes hands
- a seat session must be force-revoked
- a shared sign-in code must be rotated
- a seat should be suspended or restored without editing raw backend data

The design goal is simple:

- keep the calculator offline-first
- keep normal premium sync readable and usable
- move trust-sensitive recovery to explicit backend actions with audit trace

## Frontend Controls

Inside `Project Workspace` under the shared team-seat area, the UI now includes:

- `Recovery Target Seat`
- `Recovery Action`
- `Recovery Note`
- `Next Access Code Hint`
- `Next Access Code`
- `Run Recovery Action`
- `Clear Draft`
- `Seat Recovery Preview`

Important browser rule:

- `Next Access Code` is memory-only
- it is excluded from autosave and project export
- it is cleared after the recovery request runs

## Recovery Actions

The current recovery actions are:

- `Revoke Active Sessions`
- `Clear Sign-In Lockout`
- `Rotate Access Code`
- `Disable Shared Sign-In`
- `Suspend Seat`
- `Restore Active`

The recovery lane now also includes a separate one-time code path:

- `Issue Recovery Code`
- backend redeem controls in the backend-runtime block

What they do:

- `Revoke Active Sessions`
  - removes live short-lived backend sessions for the target seat
  - does not change the saved seat record

- `Clear Sign-In Lockout`
  - removes the temporary backend lockout for the target seat
  - does not change the saved seat record

- `Rotate Access Code`
  - stores a new derived access-code hash server-side
  - invalidates older sessions for that seat
  - clears stale lockout state for that seat

- `Disable Shared Sign-In`
  - removes the stored seat access-code posture
  - invalidates seat sessions that depended on that posture
  - clears stale lockout state

- `Suspend Seat`
  - changes the seat state to `suspended`
  - invalidates live sessions for that seat
  - clears stale lockout state

- `Restore Active`
  - changes the seat state back to `active`
  - does not silently issue a new session

## Backend Route

The reference backend now exposes:

- `GET /api/team-seats/recovery/example`
- `POST /api/team-seats/recovery`

And for the one-time reset path:

- `GET /api/team-seats/recovery-code/issue/example`
- `POST /api/team-seats/recovery-code/issue`
- `GET /api/team-seats/recovery-code/redeem/example`
- `POST /api/team-seats/recovery-code/redeem`

The recovery route expects:

- `installationKey`
- `actorSeatId`
- `targetSeatId`
- `recoveryAction`
- optional `nextAccessCode`
- optional `nextAccessCodeHint`
- optional `note`

## Security Posture

Recovery is intentionally stricter than normal viewing.

It requires:

- backend sync configured
- a valid short-lived backend seat session or valid bootstrap API key
- a seat with `team_seat_publish` authority

In normal product posture that means:

- active `Workspace Admin` seat

The backend also keeps guardrails in place:

- recovery actions are audited
- access codes are still stored only as derived hash + salt
- old sessions are rejected after auth posture changes
- the last active `Workspace Admin` seat cannot be suspended through the recovery route
- one-time recovery codes are hashed server-side, expire quickly, and can be redeemed only once

## Audit Coverage

Recovery actions are written to backend audit as category:

- `team_seat_recovery`

Typical actions include:

- `revoke_active_sessions`
- `clear_signin_lockout`
- `rotate_access_code`
- `disable_sign_in`
- `suspend_seat`
- `restore_active`

Each event keeps:

- installation key
- target seat label
- actor label
- device label when provided
- operational note when provided

## Recommended Operating Pattern

Use recovery in this order of preference:

1. `Clear Sign-In Lockout` when the seat is still valid and only the retry budget was exhausted.
2. `Revoke Active Sessions` when a browser or desk should lose access immediately.
3. `Rotate Access Code` when the operator identity is still valid but the sign-in secret should change.
4. `Suspend Seat` when the seat should stop operating until an admin reviews it.
5. `Restore Active` only after the desk posture is verified again.

Use `Disable Shared Sign-In` when you want the seat to remain in the library but stop authenticating through seat-code sign-in.

Use the one-time recovery-code path when:

- the desk should choose its own new seat code
- the admin should not disclose or set the new long-lived code directly
- you want the target seat to end recovery with a fresh short-lived session already issued

For that dedicated flow, also use:

- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`

## Honest Boundary

This is a strong premium-stage recovery workflow, but it is still not full enterprise IAM.

It is not yet:

- MFA
- identity provider federation
- distributed session revocation across multiple backend nodes
- full user directory lifecycle
- policy engines or compliance-grade access review

It is the right recovery layer for the current architecture because it raises trust and operability without forcing the calculator core into a server product.
