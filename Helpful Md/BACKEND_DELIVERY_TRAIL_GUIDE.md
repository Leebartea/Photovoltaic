# Backend Delivery Trail Guide

## Purpose

This guide explains the backend delivery-trail layer for one-time seat invite and seat recovery handoff.

The goal is simple:

- do not just issue sensitive one-time items
- also record how they were handed off
- keep that record on the backend, tied to a named admin seat

This supports a stronger premium operations posture without turning the calculator into a backend app.

## What Is Recorded

The delivery trail now stores entries for:

- `seat_invite`
- `seat_recovery`

Each entry can carry:

- installation key
- delivery type
- target seat id and label
- delivery channel
- recipient
- artifact mode
- delivery reference id
- actor seat id and actor label
- operator note
- delivered timestamp

The delivery reference id comes from the backend issue step itself.

That means the trail can be tied back to the specific one-time invite or recovery issuance event instead of being a loose note with no server-side reference.

## Routes

The backend now exposes:

- `GET /api/admin/delivery-trail`
- `POST /api/admin/delivery-trail/record`

Those routes are intentionally admin-scoped.

They are not public runtime routes for the normal calculator experience.

## Read Posture

`GET /api/admin/delivery-trail` requires:

- a valid short-lived seat session
- admin session context
- `audit_read`

Supported filters:

- `installationKey`
- `deliveryType`
- `deliveryChannel`
- `limit`

This keeps trail review inside the same trust boundary as audit review.

## Write Posture

`POST /api/admin/delivery-trail/record` requires:

- a valid short-lived seat session
- admin session context
- `team_seat_publish`

Required input:

- `installationKey`
- `deliveryType`
- `targetSeatId`
- `deliveryChannel`

Optional but recommended input:

- `recipient`
- `artifactMode`
- `deliveryRefId`
- `note`

The backend also verifies that the target seat exists in the installation before writing the record.

## Admin Console Surface

The hosted `/admin` shell now includes:

- a `Invite & Recovery Handoff Log` panel
- operator capture for delivery channel, recipient, artifact mode, and note
- `Record invite delivery`
- `Record recovery delivery`
- filtered server-side trail review

This is designed to work after the operator already issued a one-time invite or recovery item.

The normal operator flow is:

1. load seats
2. select the target seat
3. issue invite or recovery
4. hand it off through the real channel
5. record that handoff in the delivery trail
6. pull the filtered trail back from the backend if needed

## Suggested Delivery Channels

The current backend allows:

- `secure_chat`
- `email`
- `sms`
- `phone`
- `in_person`
- `other`

Use these as operational tags, not as security claims.

For example:

- `secure_chat` means your desk used its approved secure chat workflow
- it does not mean the backend itself verified that external chat system

## Artifact Modes

Artifact mode is intentionally lightweight.

It describes what the admin actually handed over, such as:

- `signed_link`
- `code_only`
- `code_plus_link`
- `operator_note`

This is useful because invite and recovery handoff is not always done the same way.

## Audit Relationship

Recording a delivery-trail entry also writes an audit event under:

- category: `admin_delivery`
- action: `record`

That means the delivery trail is both:

- its own readable handoff list
- part of the broader backend audit story

## Example Use Cases

### Seat invite

- admin issues a one-time invite for a new sales desk seat
- admin sends the invite through email
- admin records the recipient alias and note
- later the admin shell can prove that the invite was issued and how it was handed off

### Seat recovery

- admin issues a one-time recovery link for an engineering seat
- admin shares it through secure chat after identity confirmation
- admin records the delivery channel and who acknowledged receipt
- the audit layer now has both the issuance event and the delivery record

## Honest Boundary

This is not a compliance-grade external messaging ledger.

The backend records what the operator says they delivered.

That is still valuable.

It gives the premium workflow:

- stronger operational traceability
- named admin accountability
- better support for desk handoff review

without pretending the backend controls or verifies the external mail/chat/phone system itself.

## Next Step In The Same Workflow

If you want the handoff loop to close explicitly, continue with:

- `Helpful Md/BACKEND_DELIVERY_ACKNOWLEDGMENT_GUIDE.md`

That guide covers the transition from:

- delivery recorded

to:

- delivery acknowledged
