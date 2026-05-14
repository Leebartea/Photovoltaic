# Optional Backend Foundation Guide

## Purpose

This guide explains the cleanest backend introduction path for this product.

The short version is:

- the calculator should stay offline-first
- the backend should stay optional
- only trust-sensitive premium workflow should move there first

## Honest Hosting Answer

### Can GitHub Pages still be used?

Yes, for the frontend.

GitHub Pages can still host:

- `dist/web/`
- the generated static app
- the normal calculator UI

GitHub Pages cannot host:

- a Node backend
- dynamic entitlement lookup
- team seat logic
- seat access-code sign-in
- short-lived seat-session issuance
- secure server-side license enforcement

So if you turn on backend sync, hosting becomes a two-part setup:

1. static frontend host
2. separate backend host

That is more involved than pure static hosting, but only for the premium sync layer.

## Honest Security Answer

### Is frontend-only a security risk because users can inspect the code in DevTools?

Seeing frontend code is normal.

That alone is not the real risk.

The real rule is:

- anything in browser code should be treated as visible
- anything in browser code should be treated as user-controllable

So frontend-only is fine for:

- transparent sizing formulas
- normal UI behavior
- offline field use
- community and demo workflows

Frontend-only is **not** enough for:

- secrets
- trusted license enforcement
- billing state
- company seat control
- private shared datasets
- proprietary premium logic you do not want exposed

## Best Recommendation

Use a hybrid model.

### Keep frontend-only for:

- core sizing
- project recall
- PDF export
- honest blockers and warnings
- most proposal workflow
- offline installer use

### Use backend for:

- premium entitlement sync
- short-lived seat sessions
- seat / admin / team control
- approval-gated high-risk seat posture changes
- shared company-brand libraries across devices
- durable premium runtime state through sqlite when you are ready to leave JSON file mode
- billing or subscription status
- CRM / ERP / distributor integrations
- future proprietary formal-study engines, if you choose to protect that logic

## Current Backend Shape In This Repo

The current introduction is intentionally small:

1. `src/scripts/modules/28-entitlements.ts`
   Local entitlement resolver and offline fallback.
2. `src/scripts/modules/29-backend.ts`
   Optional backend runtime client.
3. `backend/server.js`
   Reference Node backend for entitlement resolution.
4. `backend/data/licenses.example.json`
   Example license store for local testing.
5. `backend/data/company_profiles.example.json`
   Example shared company-profile store for local testing.
6. `backend/data/team_handbacks.example.json`
   Example shared team-handback store for local testing.
7. `backend/data/team_seats.example.json`
   Example shared team-seat store for local testing.
8. `backend/data/admin_action_approvals.example.json`
   Example high-risk admin approval queue for local testing.
9. `backend/data/admin_delivery_trail.example.json`
   Example invite / recovery handoff trail for local testing.
10. `Helpful Md/BACKEND_SQLITE_STORAGE_GUIDE.md`
   Durable single-node storage path for premium deployment.

The frontend can now:

- stay fully usable without backend
- save backend config locally on a device
- sync entitlement from a backend when configured
- publish a company profile to a shared backend library
- import shared company profiles from that backend library
- publish a named team seat to a shared backend library
- import shared team seats from that backend library
- issue a short-lived seat session for the active shared team seat
- renew or revoke the short-lived seat session
- issue a one-time seat invite for the selected saved seat
- redeem a one-time seat invite into a fresh seat sign-in and short-lived seat session
- share signed hash-fragment recovery / invite links for cleaner one-time onboarding and reset handoff
- use a minimal same-origin `/admin` console for posture review, seat-session bootstrap, approval-queue review, shared-seat inspection, invite/recovery delivery, and audit pull
- use that same `/admin` console to record invite / recovery delivery trail entries so handoff is server-traced instead of staying only in operator memory
- use that same `/admin` console to prepare provider-ready dispatch packs for active invite / recovery items without creating a second persistent raw-secret store
- use that same `/admin` console to acknowledge when the handoff actually closes, so the premium operator loop does not stop at raw delivery record
- run explicit team-seat recovery actions for lockout clear, session sweep, access-code rotation, sign-in disable, and suspend / restore posture
- require backend approval review before the highest-risk seat recovery actions can execute
- publish a project handback to a shared backend library
- pull the latest shared handback for the current project key
- fall back safely to local entitlement and community posture

## Why This Is The Right First Backend

This backend is worth introducing now because it solves a real trust problem:

- premium/license state should not rely only on editable browser code

It does **not** force a backend into:

- sizing math
- engineering checks
- report generation
- local field workflow

That is the key architectural boundary.

## Recommended Hosting Pattern

### Simple static-only deployment

- host `dist/web/` on GitHub Pages, Netlify, Vercel, or similar
- do not configure backend sync

### Hybrid deployment

- host `dist/web/` on a static host
- host `backend/server.js` on a server-capable platform
- set `window.__PV_BACKEND_CONFIG__` or local backend runtime fields in the app

Good backend host candidates:

- Render
- Railway
- Fly.io
- a VPS
- a Node-capable PaaS

For the actual step-by-step deployment plan, use:

- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
- `Helpful Md/BACKEND_SQLITE_STORAGE_GUIDE.md`

## Persistent Storage Note

The backend now supports:

- `BACKEND_DATA_DIR`

Use that to move runtime JSON state onto a mounted disk or server-owned writable path.

That keeps:

- `backend/data/*.example.json` as repo-side reference seed files
- active production writes outside the source checkout when needed

This is still not the final durable-database answer for public paid `v1`, but it is the correct intermediate deployment hardening step.

## Reference Backend Behavior

The reference server currently exposes:

- `GET /admin`
- `GET /admin/app.js`
- `GET /admin/app.css`
- `GET /health`
- `GET /api/admin/posture`
- `GET /api/admin/delivery-trail`
- `POST /api/admin/delivery-trail/record`
- `POST /api/admin/delivery-trail/acknowledge`
- `POST /api/admin/delivery-dispatch/prepare`
- `GET /api/entitlement/example`
- `POST /api/entitlement/resolve`
- `GET /api/company-profiles/example`
- `GET /api/company-profiles`
- `POST /api/company-profiles`
- `GET /api/team-handbacks/example`
- `GET /api/team-handbacks`
- `POST /api/team-handbacks`
- `GET /api/team-roster/example`
- `GET /api/team-roster`
- `POST /api/team-roster`
- `GET /api/team-seats/example`
- `GET /api/team-seats`
- `POST /api/team-seats`
- `GET /api/team-seats/recovery/example`
- `POST /api/team-seats/recovery`
- `GET /api/team-seats/recovery-code/issue/example`
- `POST /api/team-seats/recovery-code/issue`
- `GET /api/team-seats/recovery-code/redeem/example`
- `POST /api/team-seats/recovery-code/redeem`
- `GET /api/team-seats/invite/issue/example`
- `POST /api/team-seats/invite/issue`
- `GET /api/team-seats/invite/redeem/example`
- `POST /api/team-seats/invite/redeem`
- `GET /api/seat-session/example`
- `POST /api/seat-session/issue`
- `POST /api/seat-session/renew`
- `POST /api/seat-session/revoke`
- `GET /api/audit-log/example`
- `GET /api/audit-log`

For the secure production posture, also use:

- `Helpful Md/BACKEND_SECURITY_AND_AUDIT_GUIDE.md`
- `Helpful Md/BACKEND_ADMIN_CONSOLE_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_DISPATCH_PACK_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_ACKNOWLEDGMENT_GUIDE.md`
- `Helpful Md/BACKEND_SEAT_SESSION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`

Run it locally with:

```bash
npm run backend:serve
```

Check the data/config with:

```bash
npm run backend:check
```

## What Should Not Move To Backend Yet

Do not move these just because a backend now exists:

- basic load math
- ordinary panel/battery/inverter sizing
- free warnings and blockers
- core proposal generation
- offline project editing

That would add complexity before it adds enough value.

## Future Backend Roadmap

The safest sequence is:

1. entitlement sync
2. team seats, role posture, and admin controls
3. seat sign-in plus short-lived seat sessions
4. shared brand and company profile libraries
5. shared team desk-roster and admin sync
6. shared team handback sync
7. paid billing integration
8. private study engines or protected proprietary workflows

That sequence fits the current structure well and does not compromise the existing static/offline product.
