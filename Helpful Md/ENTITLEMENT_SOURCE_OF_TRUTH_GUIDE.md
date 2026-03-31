# Entitlement Source Of Truth Guide

## Purpose

This guide freezes the current premium `v1` entitlement authority so it is explicit.

That matters because a paid rollout should not depend on:

- guesswork
- unwritten admin habit
- an assumed future billing system

## Current Decision

For the current premium `v1` path, the entitlement source of truth is:

- `manual_admin`

Meaning:

- backend-managed license records are the premium authority
- the backend license store decides which installation has which plan and capabilities
- billing is **not** the current live authority in this repo

## Where It Is Enforced

The backend now exposes and checks:

- `BACKEND_ENTITLEMENT_SOURCE=manual_admin`

That value appears in:

- backend posture
- backend health
- entitlement example payloads
- resolved entitlement responses
- backend check output

Unsupported entitlement-source values now fail early instead of silently implying a billing system that does not exist yet.

## Why This Is The Right V1 Decision

It is the cleanest truth-preserving option because:

- the backend already has a trusted license store
- admin-managed rollout is already supported
- billing-backed entitlement is still a separate expansion, not a hidden dependency

This keeps the premium story honest:

- the product is ready for controlled paid rollout
- the entitlement authority is explicit
- self-serve billing is not being faked

## What Changes If Billing Is Added Later

That becomes a deliberate future scope change, not a silent assumption.

At that point, you would add:

- billing-backed entitlement authority
- reconciliation rules
- billing failure posture
- operator override rules

Until then, `manual_admin` is the correct and supported mode.

## Progress Meaning

This change removes one of the last major ambiguity points in premium closeout.

What still remains after this is mostly operational:

- apply the backup scheduler on the real host
- run the premium ops readiness guide on the deployed host and make it pass
- move to Postgres only if multi-instance hosting is chosen
