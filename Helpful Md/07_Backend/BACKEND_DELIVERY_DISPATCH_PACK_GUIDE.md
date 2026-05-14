# Backend Delivery Dispatch Pack Guide

## Purpose

This guide explains the provider-ready dispatch-pack layer in the hosted backend admin console.

It sits on top of:

- one-time seat invite issue
- one-time seat recovery issue
- the admin delivery trail

The purpose is to give operators a clean handoff pack for email, secure chat, SMS, or similar delivery channels without improvising the message each time.

## What It Does

The admin shell can now prepare a dispatch pack for:

- `seat_invite`
- `seat_recovery`

The pack is generated from:

- the current active backend issue record
- the selected delivery channel
- the chosen artifact mode
- the optional recipient
- the optional operator note
- the optional frontend app URL

The result is a server-generated package with:

- title
- subject
- body
- full TXT snapshot
- delivery metadata
- warnings when the selected artifact mode cannot be fully satisfied

## Security Posture

This feature is intentionally designed to avoid a weaker secret model.

Important choices:

- the backend does not persist raw invite or recovery codes at rest for this feature
- the admin shell sends the currently issued one-time code or signed token from memory only
- the backend validates those values against the active hashed issue record
- the backend returns the prepared pack but does not create a second long-lived secret store

That means the pack is useful while the item is still active, but it does not try to turn the backend into a permanent vault for raw one-time codes.

## Route

The route is:

- `POST /api/admin/delivery-dispatch/prepare`

It requires:

- a valid short-lived admin seat session
- a seat with `team_seat_publish`

## Required Inputs

The route expects:

- `installationKey`
- `deliveryType`
- `targetSeatId`
- `deliveryRefId`
- `deliveryChannel`
- `artifactMode`

It may also use:

- `recipient`
- `note`
- `frontendAppUrl`
- `oneTimeCode`
- `signedLinkToken`

## Artifact Modes

Supported artifact modes:

- `signed_link`
- `code_only`
- `code_plus_link`
- `operator_note`

Interpretation:

- `signed_link`: prepare a link-led handoff
- `code_only`: prepare a code-led handoff
- `code_plus_link`: include both
- `operator_note`: produce a note-based pack without embedding a live secret

If the artifact mode requires a link and the frontend app URL is missing, the pack is still generated but includes a warning instead of pretending the link exists.

## Validation Rules

The backend verifies the dispatch request against the active issue record.

That means:

- `deliveryRefId` must match the active issue
- the target seat must match
- a provided one-time code must hash to the active issue record
- a provided signed link token must verify and match the target seat

If any of those checks fail, the request is rejected.

## Admin Console Flow

Recommended operator flow:

1. issue the invite or recovery item
2. choose the intended delivery channel
3. set recipient and artifact mode
4. prepare the dispatch pack
5. copy the subject or full body, or download the TXT pack
6. complete the real handoff
7. record the delivery in the delivery trail

This order matters.

Prepare the pack while the current one-time item is still active and still in the shell’s memory.

## Relationship To Delivery Trail

The dispatch pack is not the same thing as the delivery trail.

The dispatch pack is:

- the operator-facing copy package
- used before or during handoff

The delivery trail is:

- the server-side record of how handoff actually happened
- used after or alongside handoff

Both are useful, and they solve different parts of the workflow.

## Honest Boundary

This is not full third-party delivery automation yet.

It is a provider-ready handoff pack:

- strong enough for real operator workflow
- safe enough to fit the current backend posture
- ready for future email/chat/SMS provider integration

It does not claim that the backend has already delivered the message to an external provider.

## Next Step In The Same Workflow

After actual handoff, use:

- `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`
- `Helpful Md/BACKEND_DELIVERY_ACKNOWLEDGMENT_GUIDE.md`

so the provider-ready pack is followed by:

- delivery recording
- delivery acknowledgment
