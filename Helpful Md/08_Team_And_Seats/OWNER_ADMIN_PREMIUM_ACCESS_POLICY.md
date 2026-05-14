# Owner And Admin Premium Access Policy

## Purpose

This guide makes one important product rule explicit:

- how owner/admin premium access works today
- what is already supported
- what is **not** the current entitlement model

## Current Rule

The current premium entitlement model is:

- installation-level
- backend-managed
- `manual_admin` as the premium source of truth

That means premium access is controlled by the installation license record, not by a billing portal and not by a per-seat subscription engine.

## What This Means For The Product Owner

If the owner/admin wants to use premium features freely on their own deployment, that is already possible.

How:

- assign the installation a premium plan in the backend-managed license store
- typical example:
  - `engineering_plus`

This is already compatible with the current `v1` model because:

- premium authority is admin-managed
- billing is not the source of truth in the repo
- the owner can consciously grant premium posture to their own installation

## Important Boundary

This is **not** the same thing as per-seat premium exemption.

Today the repo does **not** implement:

- one seat is free while another seat in the same installation is paid
- billing-aware seat-by-seat premium purchase
- owner seat bypass while the rest of the installation remains community

The current premium model is installation-wide.

## Admin Seat Vs Premium Access

Do not confuse:

- seat role
- entitlement plan

`Workspace Admin` controls:

- administration
- recovery
- approval
- shared premium/backend operations

It does **not** by itself mean the seat automatically gets a higher paid feature tier.

Premium features still come from the installation entitlement record.

## Recommended Use

Use the current model like this:

1. keep entitlement authority under `manual_admin`
2. assign your own installation the premium tier you want
3. use `Workspace Admin` seats for secure operations and control
4. do not pretend this is already a per-seat billing model

## If You Want Seat-Level Commercial Rules Later

That is a future scope expansion.

It would need:

- per-seat entitlement records
- seat-level billing or override rules
- mixed-tier installation policy
- clearer UX around which features follow installation vs seat

That is not the current `v1` entitlement model.

## Related Files

- `Helpful Md/ENTITLEMENT_SOURCE_OF_TRUTH_GUIDE.md`
- `Helpful Md/PREMIUM_ENTITLEMENT_FOUNDATION_GUIDE.md`
- `Helpful Md/TEAM_SEATS_AND_ROLE_POSTURE_GUIDE.md`
- `Helpful Md/PREMIUM_V1_CLOSEOUT_CHECKLIST.md`
