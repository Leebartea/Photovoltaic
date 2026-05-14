# Team Seat Invite And Enrollment Guide

## Purpose

This guide explains the one-time seat-invite path for the optional premium backend.

Use it when a saved shared seat needs:

- first-time onboarding on a browser
- clean re-enrollment after browser replacement
- a fresh seat sign-in without handing over the bootstrap API key

## What The Invite Flow Does

An active admin seat can issue a one-time invite for a selected saved seat.

The target operator then redeems that invite with:

- the one-time invite code
- a fresh seat access code
- an optional public access-code hint

Redeem immediately:

- sets the new seat sign-in
- revokes older sessions for that seat
- clears stale sign-in lockout state for that seat
- returns a fresh short-lived backend session for that seat

## Frontend Controls

The `Project Workspace` backend block now includes:

- `Seat Invite Code or Link`
- `Seat Invite Access Code`
- `Seat Invite Access Hint`
- `Redeem Seat Invite`
- `Copy Seat Invite Link`
- `Clear Invite Draft`
- `Seat Invite Preview`

The `Saved Team Seats` sync block now also includes:

- `Issue Seat Invite`

Important browser rule:

- invite code input is memory-only
- fresh access-code input is memory-only
- both are excluded from autosave and project export
- the signed invite link imported from the browser address bar is also memory-only and the app clears the hash after import

## Backend Routes

The reference backend now supports:

- `POST /api/team-seats/invite/issue`
- `POST /api/team-seats/invite/redeem`

Issue requires:

- protected backend auth
- a seat with `team_seat_publish`
- a non-suspended target seat

Redeem requires:

- `installationKey`
- valid one-time `inviteCode` or `inviteLinkToken`
- fresh `nextAccessCode` of at least 6 characters

Redeem does not require an existing session because it is the onboarding path itself.

## Recommended Flow

1. Admin activates a `Workspace Admin` seat.
2. Admin selects the saved target seat in `Saved Team Seats`.
3. Admin runs `Issue Seat Invite`.
4. Admin shares the signed link or one-time code through a secure channel.
5. Target operator pastes the invite into `Seat Invite Code or Link` or opens the signed link directly.
6. Target operator sets a fresh seat access code.
7. Target operator runs `Redeem Seat Invite`.
8. The browser receives a fresh short-lived seat session for that seat.

## Security Guardrails

- one-time invite codes expire automatically
- one-time invite codes are single-use
- signed invite links are verified server-side and fail if tampered with
- suspended seats cannot issue or redeem invites
- the backend stores only derived access-code hash and salt
- invite issue and redeem are written to audit
- old sessions are revoked when redeem succeeds

## Honest Boundary

This is the right premium-stage onboarding posture for the current architecture.

It is not yet:

- email-delivered magic links
- enterprise IAM
- MFA
- external identity provider integration

It is a secure, practical bridge between:

- browser-local team-seat drafts
- server-enforced shared-seat posture

## Related Guides

- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
- `Helpful Md/BACKEND_SECURITY_AND_AUDIT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`
