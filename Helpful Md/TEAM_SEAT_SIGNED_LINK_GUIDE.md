# Team Seat Signed Link Guide

## Purpose

This guide explains the signed-link layer that now sits on top of the one-time:

- recovery-code flow
- seat-invite flow

It exists so admins can hand off a cleaner secure link instead of only a raw one-time code.

## What A Signed Link Is

The backend signs a token that includes:

- action type
- installation key
- target seat
- underlying one-time code
- expiry

The browser then turns that token into a hash-fragment link such as:

- `#pvSeatRecoveryToken=...`
- `#pvSeatInviteToken=...`

The app can open or paste that link and import the token directly into the existing redeem flow.

## Why Hash Fragments

The link uses a URL hash instead of a normal query string because:

- hash fragments are not normally sent to the backend in the HTTP request
- they are less likely to leak through normal access logs
- the app can remove the hash after import and keep the token memory-only

This fits the current static/offline-first frontend well.

## Frontend Behavior

Admins can now:

- issue a one-time recovery code
- copy the signed recovery link
- issue a one-time seat invite
- copy the signed seat-invite link

Operators can now:

- paste the raw code
- paste the signed link
- open the signed link directly in the app

When the app detects a supported signed link in the address bar:

- it imports the token into the correct field
- refreshes the preview
- clears the hash from the browser address bar

## Security Posture

Signed links are still bearer credentials for a short period, so they must be treated carefully.

Important rules:

- share them only through a secure channel
- do not put them in project notes or exported documents
- do not leave them sitting in screenshots or chat history longer than necessary

Current guardrails:

- tampering fails backend verification
- expiry is enforced
- successful redeem still consumes the underlying one-time code exactly once
- reusing the same signed link fails after the first successful redeem

## Honest Boundary

This is stronger and cleaner than raw one-time code handoff alone, but it is still not:

- enterprise magic-link auth
- email identity proof
- MFA
- SSO / IdP integration

It is the right premium-stage improvement for the current product because it improves operator handoff without forcing a full auth platform into the repo.

## Related Guides

- `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
- `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
- `Helpful Md/BACKEND_SECURITY_AND_AUDIT_GUIDE.md`
