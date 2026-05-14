# PV Estimator — Full Audit Report
**Audit date:** 2026-05-03
**Auditor:** Claude Code (pv-estimation-expert)
**PDFs audited:** PV_System_Design_Lagos__Nigeria_2026-05-01.pdf, PV_System_Design_Lagos__Nigeria_2026-05-02.pdf (live-app PDF generation skipped: no browser/computer-use tool available in audit environment)
**Source inspected:** `src/scripts/app.js` (38,696 lines), `src/template.html`, prior PDFs (2026-05-01, 2026-05-02)

---

## Audit Scope Constraint

**Live-app PDF generation (Phases 1–2)** required a browser/computer-use tool to navigate the live URL, click "Load Sample Data", add appliance rows, switch single/3-phase, and switch Client/Installer views. That tool was not available in this environment. The four PDFs (`client_standard.pdf`, `client_3phase.pdf`, `installer_standard.pdf`, `installer_3phase.pdf`) were **not generated this session**.

What was done instead: a **rigorous source-code audit** of `src/scripts/app.js` against every issue in the prior report and every Phase 3/4 check. Each finding cites `file:line`. Findings are marked **CODE-CONFIRMED** (bug provably present in source) or **NEEDS RUNTIME VERIFICATION**.

---

## Executive Summary

- **Showstopper:** The two pricing bugs (`$/VA` for inverter, `$/Wp` for modules) are CODE-CONFIRMED — zero rate-input validation anywhere in `app.js`. A user typing `6000` into the inverter rate field produces a multi-million-dollar quote with no warning.
- **Physically impossible output:** The "usable > total" battery bug is CODE-CONFIRMED with a **deeper root cause** than the prior report identified: `BatterySizingEngine` returns `usableCapacityWh` as the *demand* (load × autonomy / efficiency) rather than the *supply* (totalCapacityWh × DoD). The manual-override path also fails to rebind the variable.
- **Session bleed:** The AC voltage flip-flop is caused by the **persistence layer** (line 15990) preferring the saved `acVoltage` over the live country profile — not a UI toggle bug. No override badge exists.
- **3-phase gap:** The 3-phase cable schedule omits L1/L2/L3/Neutral as discrete BOM rows. `neutralCurrentA` is computed but never reaches the PDF cable table.
- **Missing features confirmed:** VAT-by-country defaults to 0% for all regions. Currency conversion is label-only (no FX transform). Both gaps prevent use in regulated markets.
- **Text truncation confirmed:** The `..` hard-truncation at line 31243 explains both the advisory text cuts and the "Leeb" vs "Leebartea" installer-name clip — not the advisory renderer.

---

## Fix Log

| Date | Batch | Issues Fixed | Commit |
|---|---|---|---|
| 2026-05-03 | Batch 1 | #3, #4, #6, #9, #10, #14 | 3c8aece |
| 2026-05-03 | Batch 2 | #1, #2, #5 | ea59036 |
| 2026-05-04 | Batch 3 | #11, #12 | 7b9a8d6 |
| 2026-05-04 | Batch 4 | #7, #8, #13, #15 + Batch 3 FX gap | 78cfa10 |
| 2026-05-07 | Batch 5 | #19, #20, #21 | 6ec4a22 |
| 2026-05-07 | Batch 6 | #22, #23 | 4d3e179 |
| 2026-05-07 | Batch 7 | #24 | f0627cf |
| 2026-05-07 | Batch 8 | FX rate companion fields | 7701aa5 |
| 2026-05-07 | Batch 9 | #25a/b/c, #26a/b | 2361b34 |
| 2026-05-07 | Batch 10 | #27, #28a–e | 980ec06 |
| 2026-05-07 | Batch 11 | UX-A, UX-G | 0fd0b54 |
| 2026-05-07 | Batch 12 | UX-H1 (scoped), UX-C | 56393c2 |
| 2026-05-07 | Batch 13 | UX-H2 (autosave silent restore, debounce) | 9912003 |
| 2026-05-07 | Batch 14 | UX-D (collapse advanced fields), UX-E (Pricing section reorder), UX-F (tablet layout) | abc7c21 |
| 2026-05-09 | Hotfix 3 | Finance double-FX in calculateCommercialFinanceSummary (*Local variables removed, energy rates divided by _financeFxScalar) | 1ac47eb |
| 2026-05-09 | Batch 15A | PDF footer double-print fixed (brand stamp moved to footY+3.5, page stamp to post-build only); header company-name fallback suppressed | 97c5450 |
| 2026-05-09 | Batch 15B | #A1 (rate clamp ceiling 5→1.0 USD/kWh, export credit 2→0.5 USD/kWh); #A3 (formatProposalMoney now applies fxRate identical to formatCommercialMoney); #A6 (Payment & Acceptance page decoupled from clientExport flag — now gates on audienceMode==='client' directly) | ce04338 |
| 2026-05-09 | Batch 15C | #A4 (Africa generator_offset rate corrected 0.28→1.00 USD/kWh; per-basis rate fields added: gridTariffRatePerKWhUSD 0.22, blendedRatePerKWhUSD 0.55; applyCommercialDefaultsByLocation now auto-fills basis-matched rate; parseFinanceRate clamp raised 1.0→2.5 USD/kWh) | 1b7ed32 |
| 2026-05-14 | Batch 15D | #A7 (mobile hero @media 480px stacks to 1-column); #A8 (coping score duplicate block deleted from Page 3); #A9 (rounding-noise margin row threshold raised to >2 Wh); #A10 (subsumed by #A11+#A13); #A11 (Inverter Validation: label added at mL); #A13 (MPPT Validation row gated to usesStandaloneMPPT) | 00c1a70 |
| 2026-05-14 | Batch 15E | Verification only — no code changes. #A8/#A9/#A13 confirmed via source + dist audit. #A12 SVG verified functional for 24V Off-Grid and 48V Hybrid cases. New issues #A14/#A15/#A16 logged from engineering audit of May 14 PDFs. | — |
| 2026-05-14 | Batch 16A | #A14 (continuous discharge warning added to BatterySizingEngine); #A15 (disclaimer gate changed to audienceMode !== 'client'); residential_backup.recommendedSchedule fixed to 'evening_overnight'; new evening_overnight schedule added to OPERATING_SCHEDULES | b05b728 |
| 2026-05-14 | Batch 16B | Mobile nav hamburger re-enabled (fixed bottom-right, upward popover, collapses on load); New/Clear project button + clearProject() method; #A16 confidence penalty breakdown added under PDF confidence bar | 0ec81ae |

---

## Audit 2 — Post-fix Runtime Audit (2026-05-09)

PDFs tested: `PV_System_Design_Lagos__Nigeria_2026-05-09 (4).pdf` (client) and `PV_System_Design_Lagos__Nigeria_2026-05-09-2.pdf` (installer), both generated from the live site after all 14 batches + Hotfix 3 deployed.

| # | Title | Severity | Status |
|---|---|---|---|
| #A1 | Installer-mode energy-rate clamp yields absurd payback (USD 5/kWh ceiling → 0.3yr payback on $7.7K system) | CRITICAL | **FIXED — Batch 15B (ce04338)** |
| #A2 | PDF footer double-printed every page (original + white-rect override overlap) | CRITICAL | **FIXED — Batch 15A (97c5450)** |
| #A3 | formatProposalMoney ignores fxRate — HTML finance panel shows USD magnitudes labeled NGN | HIGH | **FIXED — Batch 15B (ce04338)** |
| #A4 | Africa generator_offset rate = USD 0.28/kWh (utility tariff magnitude, not diesel cost) | MEDIUM | **FIXED — Batch 15C (1b7ed32)** |
| #A5 | PDF header prints company name fallback twice when companyName unset | MEDIUM | **FIXED — Batch 15A (97c5450)** |
| #A6 | Payment & Acceptance page gated by !includeDetails — suppressed on most client exports | MEDIUM | **FIXED — Batch 15B (ce04338)** |
| #A7 | Mobile "Why this package" popup not full-width at 375px | MEDIUM | **FIXED — Batch 15D (00c1a70)** |
| #A8 | Coping Score block printed twice in installer PDF | LOW | **FIXED — Batch 15D (00c1a70)** |
| #A9 | Appliance reconciliation "+1 Wh" rounding-noise row not suppressed | LOW | **FIXED — Batch 15D (00c1a70)** |
| #A10 | Duplicate hybrid-topology advisory bullet from two list-builders | LOW | **FIXED — Batch 15D (00c1a70) — subsumed by #A11+#A13** |
| #A11 | "Validation: MEETS requirements" stranded under Auto-Rec row | LOW | **FIXED — Batch 15D (00c1a70)** |
| #A12 | SVG system diagram visual verify (installer PDF) | INFO | **VERIFIED — Batch 15E** — SVG functional for Off-Grid (24V/800Ah) and Hybrid (48V/280Ah). Silent text-fallback fires when Overview tab DOM not rendered before export. No structural rendering error found. |
| #A13 | MPPT validation label shown even in auto-sized path | INFO | **FIXED — Batch 15D (00c1a70)** |
| #A14 | BatterySizingEngine missing continuous-discharge current check — surge check exists but sustained draw (e.g. 177A continuous vs 140A 0.5C limit) is not warned | MEDIUM | **FIXED — Batch 16A (b05b728)** |
| #A15 | Disclaimer guard edge case: client mode + includeDetails=true still shows MANAGED PRACTICAL DISCLAIMER (gate is `!clientExport` not `audienceMode !== 'client'`) | LOW | **FIXED — Batch 16A (b05b728)** |
| #A16 | Confidence score (e.g. 36% Stress) not itemised in PDF — installers cannot audit which penalty components drove the score | INFO | **FIXED — Batch 16B (0ec81ae)** |
| #R1 | Product policy: 24V bus not auto-escalated to 48V when bank Ah > ~500Ah — produces unusually large-format cells (400Ah) and borderline DC current paths | INFO — Product policy | **Open — Opus design dive before implementation** |
| Feature | Panel/battery wattage auto-select scales with array size (≥5kWp → 550–600Wp, small → 100–200Wp) | Enhancement | Open — needs Opus dive |

---

## Severity Summary Table (updated after Batch 15E, 2026-05-14)

| Severity | Open | Fixed / Verified |
|---|---|---|
| CRITICAL | 0 | 6 (#1–6 original + #A1–A3 Audit 2) |
| MEDIUM | 2 (#A14, #A14-battery continuous check; one residual from original audit) | All others fixed |
| LOW | 1 (#A15 disclaimer edge case) | All others fixed |
| INFO | 3 (#A16, #R1, panel-wattage feature) | #A12 verified |
| POST-AUDIT (Audit 2) | 0 open | #A1–A13 all fixed or verified |

---

## Batch 15E — Engineering Verification Findings (2026-05-14)

PDFs audited: `Potential Bug/May 14th/Installer mode/PV_System_Design_Lagos__Nigeria_2026-05-14.pdf` (Off-Grid, 17pp) and `Potential Bug/May 14th/client mode/PV_System_Design_Lagos__Nigeria_2026-05-14.pdf` (Hybrid, 17pp).

### #A12 — SVG System Diagram — VERIFIED

- SVG renderer at `30-controller.js:24100+` confirmed functional for both Off-Grid (24V/800Ah/3000VA) and Hybrid (48V/280Ah/8000VA) system types.
- 24V case: 8S2P = 16 cells → compact layout, text readable, no structural rendering error.
- 48V case: 16S1P = 16 cells → compact layout, no structural rendering error.
- **Known risk:** If `exportPDF()` is called before the Overview tab DOM has been rendered, `document.querySelector('#tab-overview svg')` returns `null` and the code silently falls back to a text-based diagram. No user-visible warning is shown. Recommend a forced pre-render call before SVG capture, or an explicit fallback message.

### #A14 — Missing Continuous-Discharge Current Check (MEDIUM — Safety Relevant)

**Section affected:** Battery Sizing Engine
**Source:** `src/scripts/modules/10-engines.ts` lines 1857–1888 (`BatterySizingEngine.calculate`)
**Severity:** MEDIUM
**Status:** Open — Batch 16A

The engine checks whether **surge** DC current can be sustained (1.5× margin), but does not verify whether **continuous** DC current exceeds the battery's 0.5C sustained discharge limit.

Observed in Hybrid PDF: 280Ah LiFePO4 bank at 48V, 8000VA inverter.
- Continuous DC load = 8000W ÷ 48V ÷ 0.94 ≈ **177A**
- Battery 0.5C continuous limit = 280Ah × 0.5 = **140A**
- Gap: 177A > 140A — engine does not warn

**Fix:** Add continuous check after the surge check at line 1888:
```ts
const continuousLoadCurrent = inverterReq.dcInputCurrentContinuous;
if (continuousLoadCurrent > totalCapacityAh * specs.maxDischargeRate) {
    warnings.push(
        `Continuous DC current ${Math.round(continuousLoadCurrent)}A exceeds battery 0.5C sustained limit of ${Math.round(totalCapacityAh * specs.maxDischargeRate)}A. Increase bank size or reduce inverter VA.`
    );
}
```

### #A15 — Disclaimer Guard Edge Case (LOW)

**Section affected:** PDF Export — MANAGED PRACTICAL DISCLAIMER
**Source:** `src/scripts/modules/30-controller.js` line 21313
**Severity:** LOW
**Status:** Open — Batch 16A

Current gate: `if (pdfManaged && !clientExport)` where `clientExport = audienceMode === 'client' && !includeDetails`.
When `audienceMode === 'client'` AND `includeDetails === true` (checkbox ticked), `clientExport = false` → disclaimer renders.

A client who receives a "full detail" export still sees the MANAGED PRACTICAL DISCLAIMER which is installer-internal language.

**Fix:** Change gate from `!clientExport` to `audienceMode !== 'client'`:
```js
if (pdfManaged && audienceMode !== 'client') {
```

### #A16 — Confidence Score Not Auditable from PDF (INFO)

**Section affected:** PDF cover page confidence bar
**Source:** `src/scripts/modules/25-controller-payloads.ts` lines 47–117 (`computeConfidenceMetrics`)
**Severity:** INFO
**Status:** Open — Batch 16B

The confidence score (e.g. "36% — Stress") is a composite of architecture penalties, strategy penalties, and managed-mode deviation. The PDF shows only the final score — installers in the field cannot identify which component drove it down without access to the source code.

May 14 PDFs show 36% (installer, Off-Grid) and 23% (client, Hybrid). Opus audit confirmed these are not calculation errors — they reflect intent misalignment (Backup-Only vs Battery-Dominant Off-Grid) and architecture/throughput penalties, compounded with 0% proposal readiness.

**Fix:** Add a compact penalty-breakdown block under the confidence bar on the PDF cover page, listing the contributing penalty points (architecture, strategy, managed-mode deviation) in 7pt muted text. This makes the score auditable and defensible without changing the formula.

**Batch 3 FX gap — RESOLVED (Batch 4):** All `formatProposalMoney` and `formatCommercialUnitRate` calls in `renderCommercialFinancePanel` now pass `fxRate`. All three call sites pass `fxRate: commercial.inputs.effectiveFxRate || 1`. Direct calls at `capitalStackSummary` and `comparisonDetail` also updated.

**Batch 5 FX root fix — RESOLVED (Batch 5, 2026-05-07):** The `× fxRate` multiplication has been removed from both `formatProposalMoney` (line 17498) and `formatCommercialUnitRate` (line 17510). Finance engine outputs are already in the user's entered-rate currency; the multiply was inflating client-mode values by the full NGN/USD exchange rate (~1386×). fxRate parameters preserved for call-site compatibility.

---

## Post-Audit Issues (discovered 2026-05-07 from live PDF review)

### #19 — ~~CRITICAL~~ FIXED (2026-05-07 Batch 5): FX double-multiply in finance formatters inflates client-mode annual savings by ×1386

**Section affected:** Commercial Finance / PDF
**Source:** `30-controller.js` — `formatProposalMoney` and `formatCommercialUnitRate`
**Severity:** CRITICAL
**Status:** FIXED

`formatProposalMoney` multiplied every finance value by `effectiveFxRate` (e.g., 1386 NGN/USD). The finance engine does not internally normalize to USD — `annualSavings = kWh × energyRatePerKWh` outputs in whatever currency the rate was entered in. The double-multiply caused client-mode PDFs to show ₦794,062/year when the correct value for the given rate was ₦573/year (a 1386× inflation). Installer-mode PDFs showed the correct raw value with a wrong currency label.

**Fix:** Removed `* fxRate` from both formatters. fxRate parameters retained for backward compatibility.

---

### #20 — ~~HIGH~~ FIXED (2026-05-07 Batch 5): Battery "Ah per Unit" shows auto-recommended value when user overrides battery size

**Section affected:** PDF Battery Detail + HTML Battery Panel
**Source:** `30-controller.js` lines 21354, 25488
**Severity:** HIGH
**Status:** FIXED

The PDF battery detail and HTML result panel both printed `batt.recommendedAhPerCell` (the auto-engine's per-unit Ah, e.g., 400Ah) regardless of what the user actually selected. When the user overrides to 150Ah, the field still showed 400Ah. Fixed at both sites: when `isManualOverride || isUnitCountOverride`, Ah per Unit is now derived as `round(totalCapacityAh / max(1, stringsInParallel))`.

---

### #21 — ~~MEDIUM~~ FIXED (2026-05-07 Batch 5): Battery unit-count warning quotes stale Ah before manual-Ah override settles

**Section affected:** Warnings panel / PDF
**Source:** `30-controller.js` lines 22622–22626 (emission), 22682 (re-emit fix)
**Severity:** MEDIUM
**Status:** FIXED

The unit-count override path emitted its warning using `battery.totalCapacityAh` before the manual-Ah override path ran. If both overrides were active, the warning said "You selected 1 battery unit(s) (400Ah)" when the actual bank was 150Ah. Fixed by inserting a re-emit block after both override paths settle (before the mixed-bank analysis at line 22683): the stale warning is filtered out and replaced with the final Ah value.

---

### #22 — ~~HIGH~~ FIXED (2026-05-07 Batch 6): Heavy cloud/rain energy shows array wattage (Wh) instead of 25% of clear-day yield

**Section affected:** Advisory / Seasonal Performance
**Source:** `10-engines.ts` line 5562
**Severity:** HIGH
**Status:** FIXED

`cloudDayWh = arrayWattage × 0.25 × PSH`. When PSH ≈ 4 and arrayWattage = 4640W, this evaluates to 4640 Wh — the array nameplate in watts. Correct formula: `cloudDayWh = pv.dailyEnergyWh × 0.25`. With a clear-day yield of 30,466 Wh, the correct heavy-cloud value is 7,617 Wh, not 4,640 Wh.

---

### #23 — ~~HIGH~~ FIXED (2026-05-07 Batch 6): Battery-to-Inverter cable sized for load-side surge, not actual inverter capability

**Section affected:** Cable Sizing / BOM
**Source:** `30-controller.js` lines 22568–22575
**Severity:** HIGH
**Status:** FIXED

When the user selects a 6000VA inverter, `dcInputCurrentSurge` is still set from the load-side `surgeVARequired` (12,160VA), producing 316.6A. A 6000VA inverter at 48V can deliver at most ~150–170A on surge. Cable is over-specified by ~2×. Fix: cap `dcInputCurrentSurge` at `(manualVA × surgeMultiplier) / dcVoltage` unconditionally after the manual-VA override is applied.

---

### #24 — ~~MEDIUM~~ FIXED (2026-05-07 Batch 7): Installer-mode PDF shows USD-magnitude values with NGN currency label

**Section affected:** All money outputs in installer-mode PDF
**Source:** `30-controller.js` — 6 display-function groups (~lines 16861, 17730, 17848, 19735, 23518, 23708)
**Severity:** MEDIUM
**Status:** FIXED

In installer mode `effectiveFxRate = 1.0`, so all money values stay at their raw USD-denominated magnitudes. The currency label (user-chosen, e.g., "NGN") is applied unchanged. The PDF shows "NGN 8,724" for a system that is actually $8,724 USD — the label is wrong. Fix: derive `displayCurrencyLabel = effectiveFxRate > 1 ? userLabel : 'USD'` and use it at all money-output call sites.

---

### #25a — ~~CRITICAL~~ FIXED (2026-05-07 Batch 9): Commercial BOM and quote not FX-converted in client mode

**Section affected:** Commercial Estimate / PDF / HTML summary
**Source:** `30-controller.js` — `formatProposalMoney` (line ~17503), `formatPdfMoney` closure (line ~19760), `money` closure in `renderCommercialSummary` (line ~23733)
**Severity:** CRITICAL
**Status:** FIXED

Batch 5 removed `* fxRate` from `formatProposalMoney` to fix the finance double-multiply. This correctly stopped NGN finance values from being inflated. But commercial BOM amounts (module costs, inverter costs, final quote) are computed in USD and must be multiplied by fxRate before client-mode display. Effect: client PDF showed NGN 12,599 instead of ~NGN 17.4 million for Nigeria.

**Fix:** Added `formatCommercialMoney(valueUSD, currencyLabel, fxRate)` — a new formatter that multiplies USD inputs by fxRate before display. `formatPdfMoney` and the `money` closure in `renderCommercialSummary` now use this formatter. `formatProposalMoney` is now used exclusively for finance outputs that are already in local currency.

---

### #25b — ~~CRITICAL~~ FIXED (2026-05-07 Batch 9): Finance summary mixes USD and local-currency arithmetic

**Section affected:** Commercial Finance summary (payback, lifecycle, debt service)
**Source:** `30-controller.js` lines ~17562–17648 (`calculateCommercialFinanceSummary`)
**Severity:** CRITICAL
**Status:** FIXED

`finalQuote`, `inverterCost`, `batteryCost`, and `equipmentSubtotal` (all USD) were used directly in arithmetic with `annualSavings` and gross values that are in local currency after Batch 8 made `energyRatePerKWh` local. Result: `fiveYearNetAfterQuote = NGN_value - USD_value`, `annualMaintenanceCost = USD * pct`, etc. — all currency-scrambled.

**Fix:** Added `fxRate = inputs.effectiveFxRate` at the top of the function and derived `finalQuoteLocal`, `inverterCostLocal`, `batteryCostLocal`, `equipmentSubtotalLocal`. All downstream arithmetic now uses the local-currency versions.

---

### #25c — ~~HIGH~~ FIXED (2026-05-07 Batch 9): BOM description strings show USD rates with NGN label

**Section affected:** BOM line item descriptions in PDF and HTML
**Source:** `30-controller.js` lines ~17922, 20279, 16866, 23821
**Severity:** HIGH
**Status:** FIXED

`describeRateBasis` and supplier rate card renders were using `displayCurrencyLabel` (e.g. NGN) for the supplier rate label, producing strings like "NGN 0.29/Wp supplier rate" — the rate is a USD procurement value. Fixed by hardcoding `'USD'` at all four supplier rate display call sites.

---

### #26a — ~~CRITICAL~~ FIXED (2026-05-07 Batch 9): parseFinanceRate max:5 cap destroys NGN energy rate

**Section affected:** Finance calculation engine
**Source:** `30-controller.js` line ~17379 (`getProposalPricingInputs`)
**Severity:** CRITICAL
**Status:** FIXED

`parseFinanceRate` used `max: 5` — designed for USD (0–5 USD/kWh). After Batch 8, Nigeria energy rate = 434 NGN/kWh, which was hard-capped to 5.00, causing annual savings to show ~NGN 10,238/yr instead of ~NGN 914,766/yr.

**Fix:** Added `fxScalar` IIFE before `return {` in `getProposalPricingInputs`. Bounds are now `Math.max(5, 5 * fxScalar)` for energy rate and `Math.max(2, 2 * fxScalar)` for export credit — scales with the active FX rate so USD-range guard is preserved in installer mode.

---

### #26b — ~~CRITICAL~~ FIXED (2026-05-07 Batch 9): parseFinanceRate max:2 cap clamps NGN export credit

**Section affected:** Finance calculation engine
**Source:** `30-controller.js` line ~17380
**Severity:** CRITICAL
**Status:** FIXED

Same root cause as #26a. Nigeria export credit = 0.02 × 1385 = 27.7 NGN/kWh, capped at 2. Fixed with the same `fxScalar` pattern.

---

### #27 — ~~HIGH~~ FIXED (2026-05-07 Batch 10): Appliance table Type column shows raw "electr" abbreviation

**Section affected:** PDF Load Analysis / Appliance Breakdown table
**Source:** `30-controller.js` line ~21262
**Severity:** HIGH
**Status:** FIXED

`a.loadType.substring(0, 6)` hard-truncated internal classification strings: `electronic` → `electr`, `resistive` → `resist`. Fixed with a label map `{ motor: 'Motor', electronic: 'Electronic', resistive: 'Resistive' }`. Phase-mode appliance table Type column widened from 18mm to 24mm to accommodate the longer label.

---

### #28a–e — ~~MEDIUM/HIGH~~ FIXED (2026-05-07 Batch 10): PDF table column truncation across multiple tables

**Section affected:** PDF protection devices, pricing comparison, inverter sizing, battery sizing tables
**Source:** `30-controller.js` lines ~20123, 20229, 21295, 21416, 21490–21495
**Severity:** HIGH (#28a protection devices), MEDIUM (others)
**Status:** FIXED

- **drawTable divisor** (line 20123): `/2.2` → `/1.85` globally, raising effective character cap by ~20% across all tables.
- **Pricing comparison** (line 20229): Package column 34→44mm — "Standard Install" (16 chars) no longer clips.
- **Inverter sizing Basis** (line 21295): Basis column 68→100mm — full basis descriptions now visible.
- **Battery tier Module/Config** (line 21416): Config column 56→84mm — module labels no longer clipped.
- **Protection devices** (lines 21490–21495): Removed double-truncation (pre-clip substrings at 25/38/34 chars eliminated). Type/Rating column 60→78mm. All three columns now let drawTable handle overflow with its own ellipsis at the corrected threshold.

---

**Issue #29 — UX-A: No audience mode indicator (Batch 11)**
- **Severity:** HIGH
- **Symptom:** Users set NGN rates in Client mode but forget they are in Client
  mode when returning to the app. No persistent visual cue exists.
- **Root cause:** Audience mode selector is a plain `<select>` with no persistent
  status indicator. `data-audience-mode` body attribute was set but not used by CSS.
- **Fix (commit 0fd0b54):**
  - Added `<div id="audienceModeBanner">` between `<header>` and `<nav>` in template.html.
  - `updateAudienceMode()` now populates the banner text ("Installer Mode" / "Client Mode")
    and sets `data-mode` attribute after every mode change.
  - Installer-appendix PDF checkbox (`pdfIncludeDetails`) auto-disabled when mode is client.
  - CSS: `.mode-banner` styled green for Installer, blue for Client; sticky top-0 z-50;
    dark-mode variants included. Disabled-checkbox opacity/cursor rule added.

---

**Issue #30 — UX-G: Client PDF quality gaps (Batch 11)**
- **Severity:** HIGH
- **Symptom:** (a) MANAGED PRACTICAL DISCLAIMER could still appear in client PDFs
  if the installer-appendix checkbox was re-enabled. (b) No payment schedule or
  signature section in client PDFs — clients received an incomplete document.
- **Root cause:** Disclaimer was gated only by `if (pdfManaged)`, not by `!clientExport`.
  No acceptance section existed in exportPDF.
- **Fix (commit 0fd0b54):**
  - `if (pdfManaged)` changed to `if (pdfManaged && !clientExport)` at the disclaimer block.
  - New `if (clientExport && commercial?.paymentPlan)` block added before the final
    disclaimer loop: renders a Payment Schedule page (quote total, deposit, completion
    amounts, validity, install window, currency label) followed by an Acceptance section
    (client name, site, quote reference, date, two signature lines).
  - All required variables (`formatPdfMoney`, `proposalContext`, `proposalDisplay`,
    `displayCurrencyLabel`) confirmed in scope at insertion point.

---

**Issue #31 — UX-H1: toLocaleString() not locale-aware (Batch 12, scoped)**
- **Severity:** HIGH (affects European/Brazilian users; comma-vs-period decimal separator)
- **Symptom:** Currency amounts formatted with bare `.toLocaleString()` use the
  browser's OS locale, not the app's selected region. A German user sees "1,500.00"
  instead of "1.500,00".
- **Root cause:** No `currencyLocale` field existed in REGION_PROFILES. All 64
  `.toLocaleString()` calls passed no locale argument.
- **Fix (commit 56393c2, scoped to currency helpers):**
  - Added `currencyLocale?: string` to `RegionProfile` / `DefaultsRegionProfile` TypeScript interface.
  - Added `currencyLocale` BCP-47 string to all 12 REGION_PROFILES entries
    (en-NG, en-KE, en-GH, en-US × 3, pt-BR, de-DE, es-ES, en-IN, en-AE, en-AU).
  - New standalone `getDisplayLocale()` reads `#location` select and returns the
    profile's `currencyLocale` (fallback: `'en-US'`).
  - `formatProposalMoney`, `formatCommercialMoney`, `formatSupplierRate` now call
    `.toLocaleString(getDisplayLocale())` — all currency amounts use the correct locale.
  - `getConfig()` now attaches `config.currencyLocale = getDisplayLocale()` for
    downstream use. The remaining ~61 engineering-number inline calls (VA, Wh cycle counts)
    are deferred to a later pass.

---

**Issue #32 — UX-C: Raw Wh/VA/Wp values in PDF (Batch 12)**
- **Severity:** MEDIUM
- **Symptom:** PDF shows "14336 Wh", "8500 VA", "4000 Wp" — unscaled values that
  are hard to read, especially for non-technical clients.
- **Root cause:** No unit-scaling helpers existed. Every value was written to PDF
  as raw integer + unit string.
- **Fix (commit 56393c2):**
  - Five one-liner closures added inside `exportPDF()` after the existing helper block:
    `fmtEnergy(wh)`, `fmtApparent(va)`, `fmtPower(w)`, `fmtWp(wp)`, `fmtAh(ah)`.
    Each promotes to the kilo-unit at ≥ 1000 with 1 decimal place (e.g. 14336 → 14.3 kWh).
  - 23 PDF expressions in `labelValue`, `bulletItem`, and `bodyText` calls replaced:
    energy (Wh→kWh): 13 sites; apparent power (VA→kVA): 7 sites; peak watts (Wp→kWp): 4 sites;
    real power (W→kW): 1 site.
  - `drawTable` data arrays deliberately left unchanged (column header/cell unit
    consistency would require dynamic header rewriting — deferred).
  - Per-panel Wp line (≈ 400 Wp, never scales) left unchanged.

---

## Issues

### #1 — ~~CRITICAL~~ FIXED (2026-05-03 Batch 2): `usableCapacityWh` is the demand, not the supply — and is never recomputed on manual battery override

**Section affected:** Sizing
**Source:** `src/scripts/app.js:5549,5551,5627` (`BatterySizingEngine.calculate`); `src/scripts/app.js:33680–33701` (manual override path); `src/scripts/app.js:33653–33654, 33767` (override branches that DO recompute it)
**Severity:** CRITICAL
**Status:** CODE-CONFIRMED

Two independent defects compound:

**(a) Conceptual error in the engine.** Line 5549 sets:
```js
usableCapacityWh = (dailyEnergyWh * autonomyDays) / dischargeEfficiency
```
That is the *required usable energy* (demand), not the *available* energy from the as-built bank. It is returned as `usableCapacityWh` (line 5627) and consumed throughout the app and PDF as if it represented bank-side usable. When the bank is downsized below demand, `usableCapacityWh > totalCapacityWh` is reachable.

**(b) Manual-override branch fails to recompute.** At lines 33684–33701, the code updates `totalCapacityAh`, `totalCapacityWh`, `maxDischargeCurrent`, `maxChargeCurrent` — but never assigns `battery.usableCapacityWh`. Compare with the unit-count override (line 33654) and mixed-bank branch (line 33767), which both DO recompute it. The omission is specific to the manual-Ah branch.

**Fix:**
- Rename engine output to `usableEnergyDemandWh` and add a separate `usableCapacityAvailableWh = totalCapacityWh × maxDoD × dischargeEfficiency`.
- In line 33701, add: `battery.usableCapacityWh = Math.round(battery.totalCapacityWh * specs.maxDoD * 10) / 10;`
- All consumers (PDF label at line 32399, SVG labels at 35445/35579, HTML at 36492/35756, backup-hours calc at 31704) must read the supply-side variable.

---

### #2 — ~~CRITICAL~~ FIXED (2026-05-03 Batch 2): AC voltage is persisted to project state and not re-bound when country changes

**Section affected:** Sizing / Persistence
**Source:** `src/scripts/app.js:15990–15991`
**Severity:** CRITICAL
**Status:** CODE-CONFIRMED

```js
acVoltage: { value: String(data?.config?.acVoltage || DEFAULTS.REGION_PROFILES[location]?.acVoltage || 230) },
```

The OR-chain prefers the saved value. A project saved once with a custom `230V` (or `220V`) keeps that voltage forever, even when the country profile changes. No override badge exists in the UI or PDF. This is the mechanism behind the 220↔230 flip across two PDFs of the same Lagos project.

Note: source defines Nigeria as **230V** (`DEFAULTS.REGION_PROFILES.lagos_ng.acVoltage = 230`, line 492). The bug is the **silent persistence**, not the chosen value.

**Fix:** Compare `data.config.acVoltage` against the active region profile's `acVoltage`. If they differ, show a "Custom — Region default 230V" pill in both UI and PDF. Provide a "Reset to region default" action.

---

### #3 — ~~CRITICAL~~ FIXED (2026-05-03): Inverter pricing applied as $/VA with no input sanity check

**Section affected:** Pricing
**Source:** `src/scripts/app.js:29086` (apply); lines 1279–1427 (default rates 0.12–1.36 USD/VA); line 28563 (free-form input)
**Severity:** CRITICAL
**Status:** CODE-CONFIRMED

```js
(inv.recommendedSizeVA || 0) * effectiveRates.inverterPerVA * multiplier
```

`supplierInverterPerVA` (line 28563) reads any positive number via `parseOptionalRate` with no validation. A user typing `6000` (intending "USD 6,000 per unit") yields `recommendedSizeVA × 6000` — exactly the $33M outcome in PDF 1. Grep for `rateValidation|priceValidation|validateRate|rateBenchmark` returns nothing.

**Fix:** Validate each rate field against a benchmark band (inverter: USD 0.10–0.25/VA). Show red/amber/green inline. Block PDF generation if any rate is red. Alternatively, store inverter cost as `$/unit` with VA as metadata.

---

### #4 — ~~CRITICAL~~ FIXED (2026-05-03): Module pricing has the same $/Wp pattern with no validation

**Section affected:** Pricing
**Source:** `src/scripts/app.js:29074` (apply); `pvPerWp` rate key definitions
**Severity:** CRITICAL
**Status:** CODE-CONFIRMED

```js
(pv.arrayWattage || 0) * effectiveRates.pvPerWp * multiplier
```

A `0.55` value entered as `550` gives a 1,000× error. Same root cause as #3.

**Benchmark ranges to implement:**
| Component | Range (USD) |
|---|---|
| Modules | 0.20–0.55 /Wp |
| Inverter | 0.10–0.25 /VA |
| Battery | 180–350 /kWh |
| MPPT | 0.03–0.08 /W |
| Mounting | 0.08–0.14 /Wp |
| Protection | 0.06–0.12 /Wp |

---

### #5 — ~~CRITICAL~~ FIXED (2026-05-03 Batch 2): 3-phase cable schedule omits L1/L2/L3 and Neutral as discrete BOM rows

**Section affected:** Installer BOM / 3-Phase
**Source:** `src/scripts/app.js:31934–31942` (cable headers + rows); lines 4393–4404, 4436 (neutral current computed but not added); line 18296 (neutral current in HTML panel only)
**Severity:** CRITICAL
**Status:** CODE-CONFIRMED

The PDF "Cable Sizing Summary" table iterates `cables.dcRuns` and `cables.acRuns` generically. `phaseAllocation.neutralCurrentA` is computed at line 4393 and shown in the HTML phase-balance panel (line 18296) — but never reaches the cable BOM table. An installer producing a 3-phase quote from this PDF does not get a sized neutral conductor row.

**Fix:** When `config.phaseType === 'three_phase'`, append four rows to `allCableRuns`: `AC L1`, `AC L2`, `AC L3`, `AC Neutral` using `phaseAllocation.phaseCurrents` and `phaseAllocation.neutralCurrentA`. Size neutral to ≥ heaviest phase when `neutralCurrent > 0.5 × maxPhase` (already triggers a warning at line 4404).

---

### #6 — ~~CRITICAL~~ FIXED (2026-05-03): Inverter recommendation does not auto-promote when surge headroom < 10%

**Section affected:** Sizing
**Source:** `src/scripts/app.js:4814–4836` (`InverterSizingEngine` recommended-balanced selection)
**Severity:** CRITICAL
**Status:** CODE-CONFIRMED

`recommendedBalancedSize = selectInverterSize(recommendedMinSize, market)` picks the smallest catalog tier ≥ `recommendedMinSize`. There is no post-selection check that `recommendedBalancedSize × surgeMultiplier ≥ surgeRequired × 1.10`. A 5,000VA tier with surge 12,500VA against a 12,160VA requirement leaves only 340VA (2.7%) headroom — unsafe for cold motor start variance.

**Fix:** After tier selection, if `recommendedBalancedSize × inverterSurgeMultiplier < surgeRequired × 1.10`, call `selectInverterSize(recommendedBalancedSize + 1, market)` to promote. Append note: "Upgraded to provide ≥10% surge headroom for motor-heavy load profile."

---

### #7 — ~~MEDIUM~~ FIXED (2026-05-04 Batch 4): Daily energy total has unexplained ~8–12% gap from appliance subtotal

**Section affected:** Sizing / Reporting
**Source:** `src/scripts/app.js` — `AggregationEngine.calculate` (line 33518) applies `designMargin` (default 125%) and upstream `efficiency` factor; appliance table PDF (line 32289) shows per-appliance pre-margin values; headline `agg.dailyEnergyWh` (line 31919) is post-margin/derating
**Severity:** MEDIUM
**Status:** CODE-CONFIRMED

The two values are computed at different points with different inputs, so they will never reconcile without an explicit bridge row.

**Fix:** Add a reconciliation triplet under the appliance table:
```
Appliance subtotal:      X Wh
+ Design margin (125%):  +Y Wh
+ System derating (Z%):  adjusted upstream
= Daily energy total:    agg.dailyEnergyWh
```

---

### #8 — ~~MEDIUM~~ FIXED (2026-05-04 Batch 4): MPPT priced on controller rating, not array Wp, with no client-facing rationale

**Section affected:** Pricing
**Source:** `src/scripts/app.js:29101–29121` (`mpptBasisW = max(arrayWattage, controllerW)`)
**Severity:** MEDIUM
**Status:** CODE-CONFIRMED

```js
usesStandaloneMPPT ? mpptBasisW * effectiveRates.mpptPerW * multiplier : ...
```

When the user picks a 7,500W controller for a 4,400Wp array (e.g., future expansion), they are billed for 7,500W with the line item silently labelled `7,500W` — array size is not shown. The cost rationale is invisible.

**Fix:** Show both numbers: `4,400Wp array | 7,500W controller (oversized for future expansion)`. The `mpptBasisW` comparison is already computed at line 29105 — just expose it in `describeRateBasis`.

---

### #9 — ~~MEDIUM~~ FIXED (2026-05-03): Coping score formula computed but never printed

**Section affected:** Reporting / Advisory
**Source:** `src/scripts/app.js:32013, 32059` (formula); `src/scripts/app.js:32025, 32075` (only the percentage prints)
**Severity:** MEDIUM
**Status:** CODE-CONFIRMED

Formula: `(invRatio × 0.40 + surgeRatio × 0.25 + battRatio × 0.35) × 100`. The PDF shows only the final number and a label (Manageable/Tight/Critical). The component ratios are in scope but suppressed.

**Fix:** After the score bar, add three muted micro-rows:
- `Inverter sizing fit: X% (40% weight)`
- `Surge headroom: Y% (25% weight)`
- `Battery autonomy fit: Z% (35% weight)`

---

### #10 — ~~MEDIUM~~ FIXED (2026-05-03): Hard table-cell truncation silently cuts strings with `..` (two dots)

**Section affected:** Text/layout / Installer BOM
**Source:** `src/scripts/app.js:31242–31245`
**Severity:** MEDIUM
**Status:** CODE-CONFIRMED

```js
const truncated = cellText.length > Math.floor(colWidths[i] / 2.2)
  ? cellText.substring(0, Math.floor(colWidths[i] / 2.2)) + '..'
  : cellText;
```

The `2.2` divisor is a heuristic character-width estimate. Installer names in narrow columns get clipped. This is the most likely mechanism for "Leebartea" → "Leeb" and for advisory text ending mid-word. The terminal `..` (two dots, not three) is non-standard.

**Fix:** Use `doc.splitTextToSize` and increase row height when wrapping is needed. Use `…` (U+2026) for single-line truncation. Never truncate the installer label or company name.

---

### #11 — ~~MEDIUM~~ FIXED (2026-05-04 Batch 3): No country→VAT mapping; all region groups default `taxPct: 0`

**Section affected:** Pricing / Compliance
**Source:** `src/scripts/app.js:1261–1266`
**Severity:** MEDIUM
**Status:** CODE-CONFIRMED (missing feature)

```js
africa:   { ..., taxPct: 0, ... },
americas: { ..., taxPct: 0, ... },
europe:   { ..., taxPct: 0, ... },
```

Expected automatic rates (Nigeria 7.5% / South Africa 15% / Kenya 16% / France 20%) cannot be applied — there is no per-country mapping. The installer must enter VAT manually in `proposalTaxPct` (line 16015).

**Fix:** Move VAT into `REGION_PROFILES` per country: `lagos_ng: { ..., vatPct: 7.5 }`, `cape_town_za: { ..., vatPct: 15 }`, `nairobi_ke: { ..., vatPct: 16 }`, `eu_central: { ..., vatPct: 19–25 by sub-country }`.

---

### #12 — ~~MEDIUM~~ FIXED (2026-05-04 Batch 3): No client/installer currency split; both PDFs share `currencyLabel: 'USD'`

**Section affected:** Pricing / Reporting
**Source:** `src/scripts/app.js:1261–1266` (currencyLabel defaults to USD); line 16002 (saved value pass-through, no FX step)
**Severity:** MEDIUM
**Status:** CODE-CONFIRMED (missing feature)

Setting `quoteCurrencyLabel` to `NGN` changes the **label only** — values remain in USD-denominated rates without transformation. There is no `fxRateUSD` table or `displayMoney(usd, country)` conversion.

**Fix:** Add `fxRateUSD` per region. Compute `displayMoney(usd, country) = usd × fxRate[country]`. Provide a daily-refreshed default and an installer override field.

---

### #13 — ~~LOW~~ FIXED (2026-05-04 Batch 4): Battery diagram uses `batt.bankVoltage` (correct) but catalog labels hard-code "48V" for LiFePO4 products

**Section affected:** Diagram / BOM labels
**Source:** `src/scripts/app.js:35388, 35529` (SVG uses `batt.bankVoltage` — correct); lines 3669, 3727, 3741, 3744, 3761, 3779, 3797, 3818, 3827 (catalog product name strings hard-coded "48V")
**Severity:** LOW
**Status:** PARTIALLY CONFIRMED

The prior report's claim that the diagram renders "48V" (hardcoded) is **not confirmed** in the rendering code — `batt.bankVoltage` is used correctly at lines 35388 and 35529, which would show 51.2V for a LiFePO4 bank. However, 9 catalog product label strings hard-code "48V" in names like "5kVA / 48V Hybrid Inverter" for products that are 51.2V LiFePO4. These labels appear in the BOM.

**Fix:** Use `${specs.moduleVoltage}V` interpolation in catalog labels rather than hard-coded "48V" strings.

---

### #14 — ~~LOW~~ FIXED (2026-05-03 Batch 1): Appliance name hard-truncated to 20 characters in PDF table

**Section affected:** Reporting
**Source:** `src/scripts/app.js:32290`
**Severity:** LOW
**Status:** CODE-CONFIRMED

```js
a.name.substring(0, 20)
```

Hard cut without ellipsis. Same pattern at lines 32509–32511 (protection device names).

**Fix:** Use `doc.splitTextToSize` or increase column width. Add `…` when truncation is unavoidable.

---

### #15 — ~~LOW~~ FIXED (2026-05-04 Batch 4): SVG title fields hard-capped at 40/45 characters

**Section affected:** Reporting
**Source:** `src/scripts/app.js:35178, 35234, 37150`
**Severity:** LOW
**Status:** CODE-CONFIRMED

Cosmetic but consistent with the pattern of silently mutilating user input. Adds up to a perception that the tool is unreliable.

---

### #16 — INFO: `inverterPerVA` default rate of 1.357143 USD/VA exceeds recommended band

**Section affected:** Pricing / Defaults
**Source:** `src/scripts/app.js:1427`
**Severity:** INFO
**Status:** CODE-CONFIRMED

`inverterPerVA: 1.357143` exceeds the 0.10–0.25 USD/VA band. Presumably the "premium-imported / oceania-remote" pack but this is undocumented in the rate pack metadata. A 5,000VA × $1.36 = $6,785 line item is plausible but should carry a comment explaining the market context.

---

### #17 — INFO: Coping score `battRatio` uses `autoSuggestedAh` denominator that may be undefined in non-override sessions

**Section affected:** Reporting
**Source:** `src/scripts/app.js:32011, 32057`
**Severity:** INFO
**Status:** CODE-CONFIRMED

```js
const autoAh_pdf = batt.autoSuggestedAh || batt.totalCapacityAh;
const battRatio_pdf = autoAh_pdf > 0 ? Math.min(batt.totalCapacityAh / autoAh_pdf, 1.0) : 1.0;
```

When `autoSuggestedAh` is undefined (pure-auto session), fallback equals `totalCapacityAh`, giving `battRatio = 1.0`. The same formula runs on the always-shown advisory page (line 32057) without the override guard — so auto-design sessions always score `battRatio = 100%`, making coping score lean optimistic.

**Fix:** Compute `battRatio` against `usableEnergyDemandWh` from issue #1 rather than `autoSuggestedAh`.

---

### #18 — INFO: PDF 2 inverter BOM has a ~$31 (3.5%) rounding discrepancy — likely a hidden regional multiplier

**Section affected:** Pricing
**Source:** `src/scripts/app.js:29086` (apply formula); ~line 29080 (`describeRateBasis`)
**Severity:** INFO
**Status:** NEEDS RUNTIME VERIFICATION

Formula shown in PDF: `6,000VA × USD 0.14/VA × 1.00 × 1.04 = USD 905`. Manual calculation: `6,000 × 0.14 × 1.04 = USD 873.60`. Difference: $31 (3.5%). The 1.04 Africa regional multiplier (line 1261) may be applied to the cost but omitted from the basis string in `describeRateBasis`. Needs a live PDF run to confirm which multipliers are included in the display string.

---

## UI/UX Improvement Suggestions

### UX-1: Live rate-input sanity badges (HIGH PRIORITY)
Bind every rate input (`supplierInverterPerVA`, `supplierPvPerWp`, etc., line 16033 onward) to a benchmark band. Color the input red/amber/green. Show tooltip: "Typical range: USD 0.10–0.25/VA." Block PDF generation when any input is red.

### UX-2: Expert Mode override badge propagation to PDF
Flags (`battery.isManualOverride`, `inverter.isManualOverride`, etc.) exist but PDF rendering is inconsistent. Standardize a "MANUAL" pill rendered next to every overridden value in both the config header and the BOM rows.

### UX-3: Appliance table reconciliation rows
Add: Appliance subtotal → Design margin → System derating → Daily energy total. Same transparency as a financial statement.

### UX-4: Confidence and coping-score breakdowns printed in PDF
Show the three component ratios (`invRatio`, `surgeRatio`, `battRatio`) as muted footnote rows under the score bar. See issue #9.

### UX-5: Replace `..` truncation with `…` and use wrapping draw helper
All 20+ truncation sites in the PDF renderer should use `doc.splitTextToSize` for wrapping, and `…` (U+2026) when a single-line clip is unavoidable. See issue #10.

### UX-6: Region-aware VAT and FX as first-class fields
Auto-populate VAT from `REGION_PROFILES` per country. Add `fxRateUSD` and a daily-refresh mechanism. Show client PDF in local currency, installer PDF in base currency (USD). See issues #11 and #12.

### UX-7: Pricing tier differentiators in the proposal
The Conservative / Recommended / Optimized tiers differ only by sizing logic. Add per-tier component grade (Tier-1 vs. generic), labor scope, warranty length to make the price difference legible to clients. Major sales opportunity currently missed.

### UX-8: Session ID and input snapshot reference in PDF footer
Enables deterministic programmatic comparison between PDF versions. Prevents ambiguity when matching PDFs to source sessions. Required for any automated audit agent.

### UX-9: 3-phase cable BOM rows (L1/L2/L3/Neutral)
When `config.phaseType === 'three_phase'`, enumerate each AC conductor as a discrete BOM row with current, size, and voltage-drop. See issue #5.

### UX-10: Replace "48V" hard-coded catalog labels with interpolated voltage
Use `${specs.moduleVoltage}V` in product names for LiFePO4 catalog entries. See issue #13.

---

## Fix Priority Order

| Priority | Issue | Impact |
|---|---|---|
| 1 | #3 — Inverter rate $/VA, no validation | Million-dollar quotes from one typo |
| 2 | #4 — Module rate $/Wp, no validation | Same root cause, same blast radius |
| 3 | #1 — `usableCapacityWh` is demand not supply; override path broken | Physically impossible value reaches client |
| 4 | #2 — AC voltage persisted, no override badge | Same project shows two voltages across sessions |
| 5 | #5 — 3-phase cable schedule lacks neutral row | Installer BOM incomplete for 3-phase jobs |
| 6 | #6 — Inverter recommendation no surge auto-promote | Motor-heavy loads under-provisioned |
| 7 | #10 — Table-cell `..` truncation | Silent mutilation of installer name and BOM rows |
| 8 | #9 — Coping score breakdown not printed | Trust gap in scoring |
| 9 | #11 — No country VAT mapping | Cannot serve regulated markets |
| 10 | #12 — No FX / currency split | Same |
| 11 | #7 — Daily energy reconciliation gap | Trust gap in headline number |
| 12 | #8 — MPPT cost rationale hidden | Avoidable client confusion on oversized controller |
| 13 | #14, #15 — Other text truncations | Polish |
| 14 | #13 — LiFePO4 catalog labels | Polish |
| 15 | #16, #17, #18 — Defaults, rounding, score denominator | Cleanup |

---

## Verification Status of Prior Report Issues

| Prior # | Title | New Status | Notes |
|---|---|---|---|
| #1 | Battery usable capacity formula wrong | **CONFIRMED + EXPANDED** | Two compounding root causes, not one. See new #1. |
| #2 | AC voltage inconsistent same-country | **CONFIRMED** | Root cause is persistence layer line 15990, not UI toggle. Nigeria source value is 230V, not 220V. |
| #3 | Battery detail Ah uses auto-rec, not user input | **CONFIRMED** | Same root cause as new #1. Hardcoded "48V" in diagram is NOT confirmed — diagram correctly uses `batt.bankVoltage`. See new #13. |
| #4 | Inverter recommendation contradicts override | **CONFIRMED** | No auto-promotion logic at lines 4814–4836. See new #6. |
| #5 | Daily energy total not reconcilable | **CONFIRMED** | See new #7. |
| #6 | MPPT priced 7,500W vs 4,400Wp array | **CONFIRMED** | `mpptBasisW = max(...)` is intentional but undisclosed. See new #8. |
| #7 | Coping score has no derivation | **CONFIRMED** | Formula computed but suppressed. See new #9. |
| #P1 | Inverter rate $/VA error | **CONFIRMED** | Zero validation in source. See new #3. |
| #P2 | Module rate $/Wp error | **CONFIRMED** | Same architecture. See new #4. |
| #P3 | $31 rounding discrepancy | **NEEDS RUNTIME VERIFICATION** | Likely hidden regional multiplier in `describeRateBasis`. See new #18. |
| #P4 | Finance view derived from pricing bug | **CONFIRMED (derivative)** | Resolves automatically once #3 and #4 are fixed. |
| #B1 | Usable > total | **CONFIRMED** | Duplicate of #1. |
| #B2 | Ah per Unit shows auto-rec | **CONFIRMED** | Duplicate of #1 / prior #3. |
| #B3 | Advisory text truncated mid-sentence | **PARTIALLY CONFIRMED** | Advisory PDF renderer (lines 32114–32123) wraps and flows correctly. Truncation is most likely the `..` table-cell mechanism at line 31243. Needs live PDF to confirm exact surface. See new #10. |
| UX-1 | Rate input sanity badges | **NOT IMPLEMENTED** | Confirmed via grep — no rate validation code exists. |
| UX-2 | Override visual treatment in PDF | **PARTIALLY IMPLEMENTED** | Override flags exist; PDF rendering is inconsistent. |
| UX-3 to UX-8 | All polish items | **NOT IMPLEMENTED** | Confirmed via grep. |

---

## What a Runtime Browser Audit Would Add

If the four PDFs had been generated via the live app, the following would additionally be confirmed:
- Whether the live UI 3-phase toggle actually flips `config.phaseType → 'three_phase'` and unlocks the cluster planner.
- Whether `client_3phase.pdf` renders L1/L2/L3 imbalance metrics and how they compare to `installer_3phase.pdf` cable schedule.
- The exact string that produced "...for full r" — whether it came from the table truncator (#10) or another surface.
- Whether "Load Sample Data" applies a Lagos-Nigeria default and whether the advisory page survives the resulting load mix without overflow.
- The current installer-name display field to confirm which truncation site clipped "Leebartea" → "Leeb".
- 2–4 additional UI-only issues (form validation UX, dark-mode contrast, mobile layout) not visible from source alone.

---

## Files Referenced

- `src/scripts/app.js` — primary source (38,696 lines)
- `Potential Bug/PV_System_Design_Lagos__Nigeria_2026-05-01.pdf` — PDF 1 (800Ah / 24V / 18 panels)
- `Potential Bug/PV_System_Design_Lagos__Nigeria_2026-05-02.pdf` — PDF 2 (150Ah / 51.2V / 8 panels)
- Prior `Potential Bug/DISCREPANCY_REPORT_PV_2026.md` — 13 issues from manual comparison, all verified above

---

*Generated: 2026-05-03 | Auditor: Claude Code (pv-estimation-expert) | Method: Source-code audit + prior PDF comparison*
*Next step: Share issue numbers with your development agent using `/pv-fix #N` to begin fixes. Start with #3 and #4 (pricing validation) as they are zero-effort-to-trigger showstoppers.*
