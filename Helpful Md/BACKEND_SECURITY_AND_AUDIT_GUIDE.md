# Backend Security And Audit Guide

## Purpose

This guide explains the secure-by-default posture of the optional premium backend.

The goal is not to turn the calculator into a server app.

The goal is to keep:

- core sizing offline-first
- static hosting viable
- trust-sensitive premium sync guarded better than plain browser state

## What Is Now In Place

The backend path now supports:

- optional API-key protection via `X-API-Key`
- short-lived seat sessions via `X-Session-Token`
- seat sign-in via shared seat access code
- seat sign-in throttling / temporary lockout
- session invalidation when seat auth posture changes
- admin-grade team-seat recovery actions for lockout clear, forced session revoke, access-code rotation, sign-in disable, and suspend/restore posture
- admin-issued one-time seat recovery codes with single-use redeem flow
- admin-issued one-time seat invites with single-use redeem flow
- signed hash-fragment recovery / invite links with backend verification
- server-side invite / recovery delivery-trail recording tied to backend-issued delivery references
- server-generated dispatch packs for active invite / recovery items, validated against the active hashed issue record
- explicit delivery acknowledgment so handoff can move from pending to acknowledged inside the backend trace
- request body size limits
- response security headers for the JSON API
- optional origin allowlisting
- server-side audit logging for premium sync actions
- a same-origin hosted `/admin` console that reuses the existing protected routes instead of inventing a weaker admin-only auth path, and now unlocks operator controls only from a valid short-lived seat session
- a session-backed admin audit export surface for TXT / CSV handoff
- shared team-seat sync
- server-side seat-aware permission checks on protected shared premium writes once a shared seat library exists

The frontend runtime now supports:

- an in-session API key input for bootstrap
- memory-only seat access code input
- memory-only one-time recovery-code redeem inputs
- short-lived seat-session issue / renew / revoke / clear controls
- backend audit pull
- explicit preview of authenticated vs dev-open backend posture
- explicit admin recovery controls tied to a named active admin seat

The backend now also exposes a hosted admin surface for operators who should not have to drive every sensitive seat action from inside the main calculator UI.

## Important Security Rule

Do **not** treat browser code as secret.

People being able to inspect frontend code in DevTools is normal.

That is not the real problem.

The real problem is putting trusted secrets or authorization logic in browser-delivered code.

That is why:

- the calculator math stays frontend-side
- license authority lives server-side when backend sync is enabled
- API keys should be injected at runtime or replaced by real authenticated sessions
- true secrets should not be committed or shipped in the static bundle

## API Key Posture

The reference backend now supports API-key protection through environment variables:

- `BACKEND_API_KEY`
- or `BACKEND_API_KEYS` as a comma-separated list

If no key is configured, the backend stays in dev-open mode.

That is acceptable only for:

- local testing
- trusted internal demos
- temporary staging where you understand the risk

It is **not** the recommended posture for real premium deployments.

## Frontend Handling Of API Keys

The runtime input field allows an API key for the current browser session.

It is intentionally **not** persisted in browser local storage when backend config is saved.

That keeps the security posture cleaner than treating local storage as a secret store.

It is now also intentionally treated as a bootstrap credential.

Once the active team seat issues a short-lived backend seat session, protected premium sync should prefer that seat session instead of the raw API key.

The preferred production progression is now:

1. shared seat access code
2. short-lived seat session
3. API key only as bootstrap or break-glass path

Preferred production patterns are:

1. runtime injection through `window.__PV_BACKEND_CONFIG__`
2. short-lived seat-session flow from seat sign-in or a real backend auth layer
3. installation or seat auth beyond static browser-held secrets

## Audit Log Coverage

The reference backend now records audit events for:

- entitlement resolve
- shared company-profile writes
- shared team handback writes
- shared team roster/admin writes
- shared team-seat writes
- admin delivery-trail writes

The API route is:

- `GET /api/audit-log?installationKey=...&limit=12`

The frontend `Pull Audit Log` action reads that route and shows the recent shared activity.

This is not a full compliance-grade audit system yet.

It is a practical premium-stage trace layer.

The admin shell now also supports:

- `GET /api/admin/audit-export`
- `GET /api/admin/delivery-trail`
- `POST /api/admin/delivery-trail/record`

That export route is stricter than the posture route:

- it requires a valid short-lived seat session
- it requires `audit_read`
- it returns server-generated TXT or CSV instead of trusting browser-side reconstruction

The admin timeline now also supports server-side filtering by:

- category
- action
- free-text query

That same filter set carries through into the admin export surface, so operators can export the exact filtered audit slice they are reviewing.

The delivery trail is intentionally adjacent to that audit story:

- it stores operator-claimed invite / recovery handoff details
- it writes audit events under `admin_delivery`
- it keeps the handoff record tied to a named admin seat session

That gives premium operations a stronger trace without pretending the backend controls the external mail, chat, or phone system itself.

The dispatch-pack layer stays separate from that storage model:

- it prepares a provider-ready handoff pack for the current active item
- it validates the supplied one-time code or signed link against the active issue record
- it does not create a persistent raw-secret store just to support handoff copy

## Team Seats And Role Guards

The backend now has a bounded role-aware control layer.

Once shared team seats exist for an installation:

- shared writes require `actorSeatId`
- the backend resolves the seat server-side
- the backend derives allowed actions from role + state
- blocked or read-only seats cannot publish protected shared records

Bootstrap rule:

- if no shared seats exist yet, the first published seat must be an active `Workspace Admin`

This keeps first-time setup possible while still moving authorization away from the browser.

## Seat Session Posture

The reference backend now supports:

- `POST /api/seat-session/issue`

This route is no longer API-key-only.

The backend now supports:

- API-key bootstrap
- seat access-code sign-in
- one-time recovery-code issue and redeem
- short-lived session renew
- short-lived session revoke
- temporary lockout after repeated bad seat-code attempts
- automatic rejection of old sessions after seat-code rotation
- explicit team-seat recovery actions through `POST /api/team-seats/recovery`

After that:

- protected premium routes can accept `X-Session-Token`
- the browser can stop relying on the raw API key for ordinary premium sync
- the session remains memory-only in the browser and in-memory on the reference backend

This is still not full enterprise auth.

It is the right next step above browser-held API keys without moving the calculator itself server-side.

## High-Risk Action Approval Posture

The backend now also treats a small set of shared-seat actions as approval-gated:

- `rotate_access_code`
- `disable_sign_in`
- `suspend_seat`

Those actions now require a server-side approval record before `POST /api/team-seats/recovery` will execute them.

The approval flow is:

- `POST /api/admin/action-approvals/request`
- `POST /api/admin/action-approvals/review`
- `POST /api/team-seats/recovery`

Important boundary choices:

- the approval queue stores metadata, not the fresh access code itself
- the actual posture change still happens on the existing recovery route
- approved requests are consumed when execution succeeds
- the whole lifecycle is audited under `admin_action_approval`

If the installation has two or more active `Workspace Admin` seats, a different active admin must approve the request.

If the installation has only one active admin, the same admin can request and approve, but only as two explicit backend steps.

## Recovery-Code Posture

The backend now supports a one-time recovery-code lane:

- `POST /api/team-seats/recovery-code/issue`
- `POST /api/team-seats/recovery-code/redeem`

This is the preferred admin recovery path when you do not want the admin to directly choose or communicate a long-lived bootstrap secret.

Key guardrails:

- issue requires protected auth plus `team_seat_publish`
- issue is blocked for suspended target seats
- redeem consumes the code exactly once
- redeem rotates the target seat sign-in
- redeem revokes older sessions for that seat
- redeem clears stale lockout state for that seat
- both issue and redeem are written to audit

## Seat-Invite Posture

The backend now also supports a one-time seat-invite lane:

- `POST /api/team-seats/invite/issue`
- `POST /api/team-seats/invite/redeem`

This is the preferred admin onboarding or clean re-enrollment path when a saved seat needs to claim a fresh sign-in without using the bootstrap API key directly.

Key guardrails:

- issue requires protected auth plus `team_seat_publish`
- issue is blocked for suspended target seats
- redeem consumes the code exactly once
- redeem rotates the target seat sign-in
- redeem revokes older sessions for that seat
- redeem clears stale lockout state for that seat
- both issue and redeem are written to audit
- the browser keeps invite code and fresh access-code input in memory only

## Signed-Link Posture

The browser and backend now also support signed one-time links for both recovery and invite flows.

The backend signs a token that carries:

- action type
- installation key
- target seat
- one-time underlying code
- expiry

The frontend then wraps that token in a hash-fragment link such as:

- `#pvSeatRecoveryToken=...`
- `#pvSeatInviteToken=...`

Why this is better:

- the token can be opened directly in the static app
- hash fragments are not normally sent to the backend as part of HTTP requests
- the browser can import the token, clear the address bar, and keep the credential memory-only

Guardrails:

- tampered link tokens fail backend verification
- expired link tokens fail
- successful redeem still consumes the underlying one-time code exactly once
- reusing the link fails after the first successful redeem

## Optional Origin Control

You can restrict cross-origin use with:

- `BACKEND_ALLOWED_ORIGINS`

Use a comma-separated list of exact origins.

If not set, the reference server allows any origin for easier local development.

For premium production use, set this explicitly.

## Admin Console Posture

The backend now serves:

- `GET /admin`
- `GET /api/admin/posture`

The console is intentionally narrow:

- posture review
- seat-session bootstrap
- shared-seat inspection
- one-time invite issue
- one-time recovery issue
- audit pull

It is safer than treating the main app as the only operator surface because:

- it stays same-origin with the backend
- it does not persist secrets to local storage
- it does not invent a second permission model
- it still relies on the same protected backend routes and seat/session checks

For the operating details, use:

- `Helpful Md/BACKEND_ADMIN_CONSOLE_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`

## What This Still Does Not Replace

This is still not:

- real user authentication
- seat management
- permissioned workflow control
- signed requests
- cryptographic proof of client integrity
- a full compliance or enterprise audit platform

What it is:

- a stronger premium-stage trust boundary than frontend-only gating
- a server-enforced posture for protected shared writes

## Recommended Production Direction

If premium deployment becomes customer-facing and multi-user:

1. keep the core calculator static/offline-first
2. keep premium sync in the backend seam
3. move from API key to authenticated seat/session flow
4. keep audit events server-side
5. add role-based access around shared premium actions

For the detailed seat-sign-in flow, also use:

- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`
- `Helpful Md/BACKEND_ADMIN_CONSOLE_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`

That path fits the current architecture without compromising the product.
