# Team Seat Sign-In And Session Lifecycle Guide

## Purpose

This guide explains the secure premium path for the optional backend:

- shared team seat with a public hint
- server-stored derived access-code hash
- admin-issued one-time seat invite for onboarding or clean re-enrollment
- short-lived seat session issue
- short-lived seat session renew
- short-lived seat session revoke

The goal is to keep the browser usable and offline-first while moving the real trust edge to the backend.

## What Changed

The backend seat-session flow no longer needs to rely only on a browser-held API key.

The preferred path is now:

1. publish a shared team seat with an access code
2. optionally issue a one-time seat invite when a new desk or replacement browser needs to claim that seat cleanly
3. activate that seat locally in the browser
4. issue a short-lived session with the seat access code
5. renew the session when it is close to expiry
6. revoke the session when the desk or browser should lose access
7. re-sign-in if a Workspace Admin rotates the seat access code

The API key still exists, but only as a bootstrap fallback.

## Frontend Controls

The `Project Workspace` backend block now includes:

- `Seat Access Code`
- `Seat Invite Code`
- `Seat Invite Access Code`
- `Issue Seat Session`
- `Renew Seat Session`
- `Revoke Backend Session`
- `Clear Local Session`
- `Copy Recovery Link`
- `Copy Seat Invite Link`

The `Saved Team Seats` block now also includes:

- `Access Code Hint`
- `Shared Seat Access Code`
- `Recovery Target Seat`
- `Recovery Action`
- `Run Recovery Action`
- `Issue Seat Invite`

Important browser rule:

- both access-code inputs are memory-only
- they are excluded from autosave and project export
- they are cleared after successful issue or publish flows

## Backend Rules

Shared team seats now expose only public auth posture to the frontend:

- `authEnabled`
- `accessCodeHint`

The backend does **not** return:

- raw access codes
- salts
- stored hashes

The backend stores only:

- derived access-code hash
- salt
- public hint

It now also enforces:

- temporary sign-in lockout after repeated bad seat-code attempts
- immediate rejection of older sessions after seat-code rotation
- explicit admin recovery actions for lockout clear, forced session revoke, sign-in disable, and seat suspend/restore posture

## Session Routes

The reference backend now supports:

- `POST /api/team-seats/invite/issue`
- `POST /api/team-seats/invite/redeem`
- `POST /api/seat-session/issue`
- `POST /api/seat-session/renew`
- `POST /api/seat-session/revoke`
- `POST /api/team-seats/recovery`

Issue accepts either:

- valid `X-API-Key`
- or valid seat access code for the named seat

Renew and revoke require:

- valid `X-Session-Token`

## Auth Modes

The UI now shows the backend session auth mode:

- `API bootstrap`
- `Seat sign-in`
- `Seat invite`
- `Session renew`

That keeps the operator honest about whether the session came from a stronger sign-in path or from a temporary bootstrap secret.

## Recommended Operating Pattern

For production-style premium use:

1. bootstrap shared seats as `Workspace Admin`
2. publish seat access codes from an admin seat
3. let desks sign in with seat access code
4. keep API key usage limited to setup or emergency recovery
5. renew sessions instead of keeping long-lived secrets active
6. revoke sessions when seats rotate or desks change
7. use the explicit admin recovery lane when a seat needs lockout clear, session sweep, or controlled suspension

## Abuse Resistance

Seat access-code sign-in is now temporarily locked after repeated failed attempts for the same installation / seat / client path.

That means:

- normal operators get a bounded retry budget
- brute-force pressure is slowed down
- API bootstrap can still be used as controlled recovery by an admin path

## Honest Boundary

This is a strong premium-stage improvement, but it is still not full enterprise identity.

It is not yet:

- identity provider integration
- MFA
- signed browser clients
- central revocation across multiple backend nodes
- full RBAC directory management

It is the right next trust step for this product structure.

For the admin recovery workflow, also use:

- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`
