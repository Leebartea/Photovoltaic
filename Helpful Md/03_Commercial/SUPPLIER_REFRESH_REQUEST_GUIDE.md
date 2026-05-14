# Supplier Refresh Request Guide

## Purpose

This guide explains the offline `Supplier Refresh Brief` block inside `Proposal Pricing`.

Use it when:

- the current supplier quote is aging
- the current supplier quote is stale
- you want to reconfirm live supplier pricing from the current recommended design
- you need a clean supplier-facing request without retyping the system basis

## What It Uses

The refresh brief is generated from the current live project state:

- current recommended design
- current quote freshness state
- current pricing posture
- project / site identity
- client and installer context

It does not:

- fetch live supplier data
- change engineering sizing
- overwrite pricing fields
- replace procurement review

## What The Brief Contains

The copied brief includes:

- project / site
- client
- installer
- location profile
- system basis
- commercial package
- commercial strategy
- current quote freshness state
- current supplier reference if one is already captured
- requested currency

It also asks for refreshed unit pricing on the current design basis, for example:

- solar modules
- inverter
- battery
- MPPT / PV electronics
- mounting / BOS
- protection / BOS
- cable / terminations
- commissioning / monitoring

## Workflow

1. Calculate the current design first.
2. Review `Supplier Quote Freshness`.
3. Open `Request refreshed supplier quote (optional)`.
4. Review the generated supplier line items.
5. Click `Copy Refresh Brief`.
6. Paste the brief into email, WhatsApp, or the supplier’s quote-request channel.
7. When the supplier replies, use the import tools or enter the refreshed rates manually.

## Best Use Cases

- aging quote, but the design is still valid
- stale quote that needs fresh pricing before issue
- multi-line commercial jobs where retyping is error-prone
- proposals that need better sourcing discipline without cloud integration

## Practical Boundary

The refresh brief is a sourcing helper.

It is not:

- a purchase order
- an ERP sync
- an approval workflow
- a final procurement comparison sheet

Use it to speed up supplier refresh, then still review the returned quote before locking commercial assumptions.
