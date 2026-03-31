# Commercial Finance And ROI Guide

## Purpose

This layer gives the calculator an **advisory commercial value view** for captive commercial and small-industrial PV jobs.

It is built to answer:

- what site energy cost is being displaced
- what annual avoided-energy value the current design can support
- how long simple payback looks under the current assumptions
- how annual O&M and planned refresh allowances affect the medium-term story
- how an optional capital-stack view changes the medium-term story once debt, tax benefit, and residual value are introduced
- how the result changes across `Value`, `Standard`, and `Premium` package posture

It is **not** a bankability model, lender model, or full project-finance / tax model.

## Where It Shows Up

The current build now surfaces finance / ROI in:

- executive snapshot
- commercial estimate / proposal budget
- overview snapshot
- package comparison cards
- PDF export

## Inputs

The finance layer reads these fields from `Proposal Pricing`:

- `Value Basis`
- `Energy Rate (/kWh)`
- `Export Credit (/kWh)`
- `Operating Days / Week`
- `Annual Escalation (%)`
- `Annual O&M Allowance (%)`
- `Inverter Refresh Allowance (%)`
- `Battery Refresh Allowance (%)`

Optional collapsed finance-sensitivity inputs:

- `Tax Benefit / Incentive (%)`
- `Debt Share (%)`
- `Debt APR (%)`
- `Debt Term (years)`
- `Residual Equipment Value (%)`

Those inputs are region-aware by default. The selected location profile still drives the baseline pricing region, while the business profile and operating schedule keep the value story tied to the real supported-load posture.

## Value Basis Modes

### Grid Tariff Offset

Use this when the site mainly displaces purchased grid electricity.

Best fit:

- stable-grid commercial sites
- grid-tie and light hybrid jobs

### Generator Energy Offset

Use this when the site mostly displaces diesel or gas generation cost.

Best fit:

- weak-grid sites
- filling stations
- bakeries with generator support
- commercial hybrids where fuel cost is the real avoided-energy driver

### Blended Site Energy

Use this when the site alternates between grid, generator, and other expensive replacement energy sources.

Best fit:

- mixed-source business sites
- sites where one blended kWh cost is more honest than pretending everything is pure grid or pure generator

## Core Interpretation

The finance layer uses the current:

- technical sizing result
- operating schedule
- supported-load story
- selected system type
- battery chemistry efficiency

It then estimates:

- annual self-consumed PV value
- annual export-credit value where the selected path can export
- simple payback
- 5-year gross value
- 10-year gross value
- 5-year and 10-year net-after-quote view
- 5-year and 10-year lifecycle allowance totals
- 5-year and 10-year net-after-lifecycle view
- financed amount and equity contribution
- annual debt service and total modeled interest
- first-year net after debt service
- 5-year and 10-year net-after-finance view
- residual-value sensitivity at the end of the 10-year horizon

## What It Intentionally Includes Now

The current lifecycle-sensitive advisory layer now includes:

- annual O&M allowance as a percent of the modeled quote
- inverter refresh allowance using the current inverter line cost
- battery refresh / augmentation allowance using the current battery line cost
- chemistry-aware battery refresh timing
- optional tax-benefit sensitivity
- optional debt-service sensitivity
- optional residual-value sensitivity on the equipment subtotal

## Scenario Comparison

When a debt share is active, the finance panel now compares:

- `Cash purchase`
- `Financed purchase`

This is meant to answer:

- what the up-front owner commitment looks like in each case
- what the first operating year feels like
- whether the financed structure is only helping short-term cash or still holds up across 5 years and 10 years

It is still an advisory owner-cash view. It is not a discounted project-finance model.

## What It Still Does Not Include

The current finance layer still does **not** include:

- lender-approved borrowing structure
- jurisdiction-specific tax treatment or depreciation schedules
- bank-grade cashflow waterfall modeling
- avoided spoilage or downtime monetization
- OEM-specific warranty or service-contract schedules
- lease, refinancing, or lender-specific covenant modeling

That last point matters. For:

- cold rooms
- bakeries
- filling stations
- process-critical mini-factory work

energy-only payback may **understate** the real business value because outage avoidance is often a major part of the economic case.

## Practical Reading Rule

Treat the finance panel as:

- `strong selling support` when the annual value is healthy and payback is short enough for the market
- `decision support` when the project is mainly about resilience or process continuity
- `advisory only` when the displaced energy rate is still uncertain

Do not let a low or medium ROI reading erase a strong resilience case. Also do not let a good ROI headline hide a weak supported-load story.

## Current Honest Standard

Current capability:

- strong for offline-first captive commercial proposal work
- good for generator-heavy markets and mixed-source sites
- good for comparing package posture against one supported technical design
- stronger medium-term proposal honesty because lifecycle allowances now sit beside the simple payback story
- better commercial framing because the user can now compare cash purchase and financed purchase without rerunning the full project
- better capital-stack realism because optional debt, tax-benefit, and residual-value sensitivity now sits beside the lifecycle view without replacing it

Current boundary:

- not a utility-scale finance tool
- not a lender-grade model
- not a full lifecycle EPC cash-flow suite

## Best Practice

Before sending a final quote:

1. confirm the real displaced-energy rate with the client
2. confirm whether export credit is truly available
3. confirm the real operating days per week
4. keep the supported-load story honest
5. explain when resilience value matters more than pure energy payback
6. keep lifecycle allowances honest instead of using them as hidden contingency padding
7. keep tax, debt, and residual assumptions conservative unless the client has a real financing path to anchor them
