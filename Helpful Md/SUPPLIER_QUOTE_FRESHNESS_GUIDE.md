# Supplier Quote Freshness Guide

## Purpose

This guide explains the `Supplier Quote Freshness` feature in `Proposal Pricing` and in the commercial result.

Use it when you need to know whether the proposal is still:

- benchmark-led
- backed by a fresh supplier quote
- drifting into an aging quote
- already too stale to present as commercially current

This feature improves commercial honesty. It does not change the engineering sizing.

## Where It Appears

- `Proposal Pricing`
- `Supplier Pricing Source`
- `Commercial Estimate` / `Proposal Budget`
- `Proposal Readiness`
- PDF export

## Input Fields

### Supplier Quote Status

This tells the app what kind of commercial sourcing path exists right now.

Current options:

- `Benchmark Only`
- `Partial Live Quotes`
- `Major Lines Locked`
- `Full Quote Locked`

### Supplier Quote Date

This is the date of the supplier quote being relied on.

If this is blank, the app will not treat the pricing as fully current even if the status says live.

### Refresh Window (Days)

This is the acceptable quote-age window.

Default behavior:

- inside the window = fresh
- beyond the window = aging
- far beyond the window = stale

### Supplier Quote Reference

This is the supplier's quote ID, reference code, or document tag.

Use it so the quote can be traced later.

## How The Engine Reads It

The engine combines:

- quote status
- quote date
- current date
- refresh window

It then classifies the commercial pricing path as one of these:

- `Benchmark-only`
- `Live quote date missing`
- `Partially live and fresh`
- `Fresh live quote`
- `Aging supplier quote`
- `Stale supplier quote`

## Meaning Of Each State

### Benchmark-only

Use for:

- early budget scoping
- quick proposal framing
- pre-supplier commercial discussion

Do not treat it as proof that current supplier pricing is already locked.

### Live quote date missing

This means someone selected a live quote path but did not enter the quote date.

The app treats that as incomplete because freshness cannot be defended without a date.

### Partially live and fresh

This means the main supplier story is current, but some items are still benchmarked.

Use it when:

- core equipment is quoted
- some BOS or smaller line items still rely on benchmark allowances

### Fresh live quote

This means the supplier quote is inside the configured refresh window.

This is the strongest commercial state available in the current offline workflow.

### Aging supplier quote

This means the quote is older than the preferred refresh window but not yet fully stale.

Treat it as usable with caution.

### Stale supplier quote

This means the quote is too old to be treated as commercially current.

At that point:

- refresh the supplier pricing
- shorten the proposal promise
- or downgrade the quote to benchmark/scoping language

## How It Affects Proposal Readiness

`Supplier Quote Freshness` is one of the readiness gates.

That means:

- fresh quote paths help readiness
- benchmark-only or undated paths reduce readiness
- stale quote paths create open commercial actions and risk flags

It is intentionally separate from engineering confidence.

## Best Installer Workflow

1. Start with `Benchmark Only` during early scoping.
2. Move to `Partial Live Quotes` when only major components are quoted.
3. Use `Major Lines Locked` or `Full Quote Locked` only when the supplier quote date is actually entered.
4. Keep the refresh window realistic for your market speed.
5. Enter the supplier reference before sending a serious proposal.

## Best Client Interpretation

- strong technical design + weak quote freshness = good scoping design, but not a locked commercial offer
- strong technical design + fresh quote freshness = better proposal discipline
- stale quote freshness = ask for refreshed pricing before treating the budget as final
- the app now includes a supplier refresh brief so aging or stale quotes can be re-requested from the live design basis without rebuilding the supplier ask manually

## What This Feature Does Not Do

- it does not fetch live supplier data
- it does not prove stock availability
- it does not guarantee shipping lead time
- it does not replace formal procurement

It is an offline commercial honesty layer, not a live ERP integration.
