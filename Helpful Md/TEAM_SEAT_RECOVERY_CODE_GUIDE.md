# Team Seat Recovery Code Guide

## Purpose

This guide explains the admin-issued one-time recovery-code flow for shared team seats.

Use it when a seat needs a clean recovery path without falling back to a long-lived bootstrap secret.

Typical cases:

- the desk lost access to its previous seat code
- the laptop changed hands and the old session should not survive
- an admin wants a one-time reset path instead of directly choosing the new long-lived code for the operator

## Frontend Flow

The flow uses two surfaces:

### 1. Admin issue surface

Inside the shared team-seat recovery block:

- choose `Recovery Target Seat`
- add optional `Recovery Note`
- click `Issue Recovery Code`

What happens:

- the backend verifies the active admin-grade seat
- the backend issues a short-lived one-time code for the selected target seat
- the code is kept in browser memory only
- the browser also stages a signed recovery link that can be copied as a hash-fragment handoff
- the browser preview shows the issued code, signed-link posture, and expiry so it can be shared through a secure channel

### 2. Operator redeem surface

Inside `Backend entitlement sync (optional)`:

- paste `Recovery Code` or open / paste the signed recovery link
- enter `New Seat Access Code`
- optionally enter `New Access Code Hint`
- click `Redeem Recovery Code`

What happens:

- the backend validates the one-time code
- the backend stores only the new derived seat-code hash
- old sessions for that seat are invalidated
- temporary sign-in lockout is cleared
- a fresh short-lived backend seat session is issued immediately

## Important Browser Rules

These fields are memory-only in the browser:

- `Recovery Code`
- `New Seat Access Code`
- the last issued one-time code shown in the preview

They are intentionally excluded from:

- browser autosave snapshots
- project export
- backend runtime local-storage persistence

## Backend Routes

The reference backend exposes:

- `GET /api/team-seats/recovery-code/issue/example`
- `POST /api/team-seats/recovery-code/issue`
- `GET /api/team-seats/recovery-code/redeem/example`
- `POST /api/team-seats/recovery-code/redeem`

Issue requires:

- protected backend auth
- a named seat with `team_seat_publish`
- a non-suspended target seat

Redeem requires:

- `installationKey`
- `targetSeatId` unless a valid signed recovery link is used
- `recoveryCode` or `recoveryLinkToken`
- `nextAccessCode`
- optional `nextAccessCodeHint`

Redeem does not require an existing session because the recovery code itself is the temporary proof.

## Security Posture

This flow is intentionally stricter than normal sign-in:

- the one-time code has a short TTL
- the backend stores only a recovery-code hash
- the signed recovery link is verified server-side before the underlying one-time code is accepted
- the code is consumed exactly once
- the target seat cannot redeem while suspended
- older live sessions are revoked when redeem succeeds
- stale sign-in lockout is cleared on successful redeem
- the event is written to backend audit

## Recommended Operating Pattern

Use this order:

1. Admin verifies that the target seat should remain valid.
2. Admin issues a one-time recovery code.
3. Admin shares it through a secure channel.
4. Operator redeems it with a fresh seat access code.
5. Operator confirms the fresh short-lived session is active.
6. Admin or operator clears the staged code from the browser once the handoff is complete.

## Honest Boundary

This is a strong premium-stage recovery path, but it is still not enterprise IAM.

It is not:

- MFA
- email-based password reset
- federated identity recovery
- compliance-grade privileged-access management

It is the right next step for the current product because it improves trust and recovery hygiene without forcing the calculator itself into a server-only product.

For the signed-link variant of the same flow, also use:

- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`
