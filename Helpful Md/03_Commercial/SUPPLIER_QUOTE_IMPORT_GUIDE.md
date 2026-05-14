# Supplier Quote Import Guide

## Purpose

This guide explains the offline `Import supplier quote` tool inside `Proposal Pricing`.

Use it when a supplier sends pricing as:

- pasted email text
- WhatsApp message lines
- copied spreadsheet rows
- TXT quote files
- CSV quote files
- ERP-style CSV exports with metadata rows and table headers
- structured JSON quote files

The importer is designed to reduce retyping. It does not replace review.

## What It Can Import

### Metadata

- supplier quote reference
- supplier quote date
- currency label
- supplier refresh window days

### Component rates

- PV modules
- inverter
- battery
- MPPT / charge controller
- mounting / BOS
- protection
- cable
- monitoring / commissioning

## Best Input Formats

The cleanest format is one line per item, for example:

```text
Quote Ref: SUP-449
Quote Date: 2026-03-19
Currency: USD
PV Modules: 0.41 /Wp
Inverter: 0.12 /VA
Battery: 310 /kWh
Protection: 0.03 /Wp
```

It can also work with simple copied rows from a sheet as long as each line still contains:

- a recognizable component label
- a usable unit-rate number

It can also read structured JSON such as:

```json
{
  "quoteReference": "SUP-449",
  "quoteDate": "2026-03-19",
  "currency": "USD",
  "rates": {
    "pvPerWp": 0.41,
    "inverterPerVA": 0.12,
    "batteryPerKWh": 310
  }
}
```

It can also read header-aware CSV / ERP-style exports such as:

```csv
Quote Reference,SUP-ERP-991
Quote Date,2026-03-16
Currency,USD
Refresh Window Days,30
Item Code,Description,Qty,UOM,Line Total,Currency
PV-550,PV Modules,72,Wp,29.52,USD
INV-3P,Hybrid Inverter,1,ea,0.14,USD
BAT-STACK,Lithium Battery,45,kWh,13050,USD
```

In this shape, the importer can:

- detect quote metadata from preamble rows
- find the real table header even when it is not the first line
- recognize common ERP-style columns like `Description`, `Qty`, `Unit Price`, `Line Total`, and `Currency`
- derive a unit rate from `line total / qty` when a supplier exports totals instead of explicit unit prices

## Recommended Workflow

1. Paste the supplier text into `Supplier Quote Paste`, or use `Load Quote File`.
2. Review the `Import Review` card.
3. Check:
   - matched components
   - recommended quote status
   - detected date
   - detected reference
4. Click `Apply Imported Quote`.
5. Review the main supplier quote fields and the pricing preview.

## What Apply Does

Apply writes into the existing controls:

- `Supplier Quote Status`
- `Supplier Quote Date`
- `Supplier Quote Reference`
- `Quote Currency Label`
- recognized supplier override fields

It does not:

- change the appliance list
- change the engineering design
- fetch live supplier data
- bypass review

## Recommended Status Logic

The importer recommends a quote status based on how much of the imported quote was recognized.

In general:

- a few lines -> `Partial Live Quotes`
- several major lines -> `Major Lines Locked`
- near-complete match -> `Full Quote Locked`

Treat this as guidance, not automatic truth.

## Good Use Cases

- the supplier sends quick pricing by chat
- the installer copies a few rows from a spreadsheet
- the supplier sends a lightweight CSV export
- the supplier exports a small ERP-style CSV with metadata rows above the item table
- the installer has a structured JSON quote handoff from another internal tool
- the quote is still offline but needs stronger traceability

## Poor Use Cases

- full PDF procurement documents with complex tables
- mixed currencies without clear labels
- total-price-only lines with no unit rate
- text that does not identify the component clearly
- CSV exports where the component description is too vague to map into a known commercial rate bucket

## Review Rules

- if the preview looks wrong, do not apply it
- if a critical component line was ignored, enter it manually
- if the quote date is missing, add it before treating the quote as commercially fresh
- if the quote is old, refresh it even if the rates were imported correctly

## Relationship To Supplier Quote Freshness

Import helps fill the fields.

Freshness evaluates whether the resulting quote path is:

- benchmark-only
- fresh
- aging
- stale

Use both together.
