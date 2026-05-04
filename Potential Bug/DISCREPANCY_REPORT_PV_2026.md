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

---

## Severity Summary Table

| Severity | Open | Fixed |
|---|---|---|
| CRITICAL | 0 | 6 (#1, #2, #3, #4, #5, #6) |
| MEDIUM | 0 | 6 (#7, #8, #9, #10, #11, #12) |
| LOW | 0 | 3 (#13, #14, #15) |
| INFO | 3 | — (#16, #17, #18 remain open) |

**Batch 3 FX gap — RESOLVED (Batch 4):** All `formatProposalMoney` and `formatCommercialUnitRate` calls in `renderCommercialFinancePanel` now pass `fxRate`. All three call sites pass `fxRate: commercial.inputs.effectiveFxRate || 1`. Direct calls at `capitalStackSummary` and `comparisonDetail` also updated. FX conversion is now complete across the full commercial finance output.

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
