# PDF Export Audit — Batch 24 Issue Register

Verification pass on all Batch 23A/23B fixes + new bug sweep.
Audited: 2026-05-17. All approximate line numbers reference `src/scripts/modules/30-controller.js`.

---

## Batch 23 Verification Summary

| ID  | Severity | Description | Status | Notes |
|-----|----------|-------------|--------|-------|
| P1  | CRITICAL | Battery chemistry crash | VERIFIED | `battChemSpecs` lifted at ~21642 with `\|\| DEFAULTS.BATTERY_SPECS.lifepo4`; all 4 downstream accesses use guarded local |
| P2  | CRITICAL | managedMode.conditions crash | VERIFIED | Optional chain `?.length \|\| 0` + `\|\| []` on for-of at ~21617–21620 |
| P3  | HIGH | Local-Build-Up finance zeroed | VERIFIED | `this.calculateCommercialFinanceSummary(this.results, { inputs, totals }, {})` at line 18343 |
| P4  | HIGH | Client mode leaks installer content | VERIFIED | Macro `audienceMode === 'installer'` gate at ~20956 + `includeDetails && audienceMode === 'installer'` at ~21464 — see new bug B3 for one remaining leak on cover page |
| P5  | HIGH | Local-Build-Up orphaned headings | VERIFIED | DOM-read arrays at 18376–18380; four `subTitle` blocks each guarded on `array.length > 0` |
| P6  | MEDIUM | div-zero: agg.dailyEnergyWh | VERIFIED | `agg.dailyEnergyWh > 0 ? ... : 0` at ~21475 |
| P7  | MEDIUM | div-zero: pv.totalPanels | VERIFIED | Both sites guarded with `pv.totalPanels > 0 ? ... : (config.panelWattage \|\| 0)` |
| P8  | MEDIUM | Hard-block rect capped at 60mm | VERIFIED | `Math.min(..., 60)` removed — see new bug B1 for resulting overflow risk |
| P9  | MEDIUM | Multi-MPPT channel table missing | VERIFIED | `R.multiMPPTResult.distributions[recommended].channels` rendered as `drawTable` at ~20831–20849 |
| P10 | MEDIUM | "Override State" misleading in local build-up | VERIFIED | Wrapped in `if (!commercial.isLocalBuildUp)` at ~20520 |
| P11 | MEDIUM | Phase current NaN | VERIFIED | `\|\| 0` guards at ~21140 and ~21159; latent NaN at line 21134 still — see B2 |
| P12 | MEDIUM | Confidence breakdown bleeds margin | VERIFIED | `splitTextToSize(breakdownText, contentW)` + forEach at ~20749–20750 |
| P13 | LOW | SVG selector fragile | VERIFIED | `getElementById('systemDiagramSvg')` at ~20119; `id="systemDiagramSvg"` added to root SVG |
| P14 | LOW | drawTable `/1.85` heuristic | VERIFIED | `doc.getTextWidth()` iterative shrink + ellipsis at ~20366–20371 |
| P15 | LOW | Footer stamp bleeds past mL | VERIFIED | `safeCompanyName = (...).slice(0, 40)` at ~21883; `brandedFooterNote.slice(0, 30)` also bounded |
| P16 | LOW | Blank bullets from undefined strategic note | VERIFIED | Both `decisionStrategy?.detail` and `finance?.strategicNote` guarded (~20532, ~20627) |
| P17 | LOW | Neutral conductor IEC 60364 <16mm² | **PARTIAL** | `recommendedMm2` correctly gated; `marketMm2` and `sizeRangeDisplay` (the user-visible value) still halve at all sizes — see Remaining Issues |
| P18 | LOW | Diacritics in filename | VERIFIED | `normalize('NFD').replace(/\p{Diacritic}/gu, '')` at ~21894 |
| P19 | LOW | Duplicate addPageFooter() call | VERIFIED | Single remaining ref at ~20207 inside `newPage()` — no standalone pre-stamp call |
| P20 | LOW | validityDays singular/plural | VERIFIED | All sites use `=== 1 ? '' : 's'` ternary consistently |

---

## Remaining Issue from Batch 23

### P17 (PARTIAL) — Neutral conductor sizeRangeDisplay still halved for ≤16mm²

**Location:** `src/scripts/modules/30-controller.js` lines ~21155–21180 (3-phase neutral block).

**What is still wrong:**
`recommendedMm2` was correctly fixed with the ≤16mm² gate.  
But `marketMm2` and `sizeRangeDisplay` (the column that actually prints in the PDF cable table) still use the unconditional `* 0.5`:
```js
marketMm2: neutralUpsize
    ? (acRun?.marketMm2 || 0)
    : Math.max(2.5, (acRun?.marketMm2 || 0) * 0.5),   // ← still wrong
sizeRangeDisplay: neutralUpsize
    ? (acRun?.sizeRangeDisplay || `...`)
    : `${Math.max(2.5, (acRun?.marketMm2 || 0) * 0.5)}mm² (reduced)`,  // ← still wrong
```
Because the PDF table cell uses `r.sizeRangeDisplay || r.recommendedMm2`, `sizeRangeDisplay` wins and the printed cable size remains non-compliant.

**Complete fix (replace the neutral block):**
```js
const phaseRecMm2 = acRun?.recommendedMm2 || 0;
const phaseMktMm2 = acRun?.marketMm2 || 0;
const reduceNeutral = !neutralUpsize && phaseRecMm2 > 16;
const neutralRec = reduceNeutral ? Math.max(16, phaseRecMm2 * 0.5) : phaseRecMm2;
const neutralMkt = reduceNeutral ? Math.max(16, phaseMktMm2 * 0.5) : phaseMktMm2;
// then in the row object:
recommendedMm2: neutralRec,
marketMm2:      neutralMkt,
sizeRangeDisplay: neutralUpsize
    ? (acRun?.sizeRangeDisplay || `${phaseRecMm2}mm²`)
    : reduceNeutral
        ? `${neutralMkt}mm² (reduced — IEC 60364-5-52 §524.2)`
        : `${neutralMkt}mm² (equal to phase — IEC 60364-5-52 §524.2)`,
```

---

## New Bugs Found

### B1 — MEDIUM — Hard-block red rect can overflow page (unintended consequence of P8 fix)

**Location:** ~line 21224–21234.

**Symptom:** After P8 removed the 60mm cap, `allBlocks.length * 14 + 6` is drawn at the current `y`. If the rect height + current y exceeds `pageH - mB`, the rect bleeds into the footer and page bottom. Bullets with their own `checkSpace` calls push onto a new page where the red background is absent — some bullets appear without highlight.  
Additionally, the 14mm per-block estimate under-allocates when a block's text wraps to 2+ lines.

**Fix:** Pre-measure wrapped line count; if rect won't fit, start on a new page:
```js
doc.setFontSize(8);
doc.setFont('helvetica', 'bold');
let totalLines = 0;
allBlocks.forEach(b => {
    totalLines += doc.splitTextToSize('• ' + b, contentW - 8).length;
});
const rectH = totalLines * LH + 6;
if (y + rectH > pageH - mB - 5) newPage();
setFillColor(RED_BG);
doc.roundedRect(mL, y - 2, contentW, rectH, 2, 2, 'F');
```

---

### B2 — LOW — `maxPhaseI` still NaN-vulnerable (~line 21134)

**Symptom:** `Math.max(...phases.map(p => Number(p.currentA)))` — if any phase has `currentA` undefined, `NaN` propagates. `neutralUpsize` comparison returns false (NaN > anything = false), silently suppressing the neutral oversizing warning.

**Fix:** `Math.max(...phaseAllocation.phases.map(p => Number(p.currentA) || 0))`

---

### B3 — MEDIUM — Multi-MPPT distribution table leaks in client mode (cover page)

**Location:** ~lines 20829–20849 (cover page System Configuration section, outside any audience gate).

**Symptom:** When `audienceMode === 'client'` and `commercial?.usesStandaloneMPPT && R.mpptValidation` are truthy, the client cover page still renders the full Multi-MPPT channel distribution table (`Voc(cold)`, `Isc`, per-channel power) — installer engineering data. P4 gated the dedicated installer pages but missed this cover-page block.

**Fix:** Wrap the channel distribution `drawTable` in `if (audienceMode !== 'client') { ... }`. A simple `MPPT: PASS` labelValue may remain visible to clients for transparency.

---

### B4 — MEDIUM — Hard Blocks & Warnings completely hidden from client PDFs (safety issue)

**Location:** Line ~20956 — the macro `if (audienceMode === 'installer')` gate wraps the entire Page 3 including hard blocks and warnings alongside installer-only technical content.

**Symptom:** Client PDFs contain zero mention of hard blocks or warnings. Clients need to know when safety-critical issues exist (e.g., "Voc(cold) exceeds inverter rating", "Battery undersized — risk of equipment damage") before signing acceptance.

**Fix:** Move the Hard Blocks and Warnings sections out of the installer-only gate. Render a plain-language summary in client mode:
```js
// Client mode: plain-language safety summary
if (audienceMode === 'client' && allBlocks.length > 0) {
    sectionTitle('Action Required Before Installation');
    allBlocks.forEach(b => bulletItem(b, 'critical', 2));
}
if (audienceMode === 'client' && allWarnings.length > 0) {
    sectionTitle('Design Notices');
    allWarnings.forEach(w => bulletItem(w.message || w, 'warning', 2));
}
```

---

### B5 — LOW — Location drift: cover page reads DOM, disclaimer reads config (~lines 20126, 21850)

**Symptom:** If user changes the location dropdown after Calculate but before Export, cover page shows the new region name while disclaimer regulatoryNote reflects the old engine run.

**Fix:** At line 20126, replace `document.getElementById('location').value` with `config.location || 'lagos'`.

---

### B6 — LOW — Report title incorrect when `audienceMode === 'client'` with `includeDetails = true`

**Location:** Lines 19949, 20132.

**Symptom:** `clientExport = audienceMode === 'client' && !includeDetails`. Default `includeDetails = true` → `clientExport = false` → title = "PV System Design Report" while content is actually client-only (installer pages suppressed). Confusing mismatch.

**Fix:** Decouple title from `clientExport`:
```js
const reportTitle = audienceMode === 'client' ? 'PV Client Estimate' : 'PV System Design Report';
```

---

### B7 — LOW — Negative margin displayed as positive "+ Design allowance" (~lines 21533–21537)

**Symptom:** When per-appliance rounding pushes `appSubtotalWh > agg.dailyEnergyWh`, `marginWh` is negative. `Math.abs(marginWh)` displays "+X Wh Design allowance", which is numerically misleading.

**Fix:**
```js
if (marginWh > 2)       labelValue('+ Design allowance:', `+${fmtEnergy(marginWh)}`);
else if (marginWh < -2) labelValue('Rounding adjustment:', `−${fmtEnergy(-marginWh)}`);
```

---

### B8 — LOW — Dead condition inside installer-only block (~line 21597)

`if (pdfManaged && audienceMode !== 'client')` — inside `if (includeDetails && audienceMode === 'installer')`, so `!== 'client'` is always true. Remove for clarity.

---

### B9 — LOW — `expertMode` read from live DOM at PDF time (~line 20881)

**Symptom:** Expert-mode badge can appear/disappear based on checkbox state at export time rather than calculation time. The engine results were computed under a different expert-mode value.

**Fix:** Snapshot `expertMode` into `config` at calculation time; read `config.expertMode` in exportPDF.

---

### B10 — LOW — `LoadEngine.appliances` live state drift (~line 21515)

Same class as B9 — load table uses `LoadEngine.appliances` (live) rather than a snapshot in `R`. If appliances are modified between Calculate and Export, table and aggregate stats diverge.

**Fix:** Snapshot `R.appliances` at calculate time; consume from `R` in exportPDF.

---

## Batch Assignment

| ID  | Severity | Description | Batch |
|-----|----------|-------------|-------|
| P17 remaining | LOW | `sizeRangeDisplay` / `marketMm2` still halved ≤16mm² | 24A |
| B1  | MEDIUM | Hard-block rect overflow after P8 cap removal | 24A |
| B2  | LOW | `maxPhaseI` NaN guard missing | 24A |
| B3  | MEDIUM | Multi-MPPT cover-page table leaks in client mode | 24A |
| B4  | MEDIUM | Hard Blocks + Warnings hidden from client PDF | 24A |
| B5  | LOW | Location key drift DOM vs config | 24B |
| B6  | LOW | Report title wrong when client + includeDetails | 24B |
| B7  | LOW | Negative margin shown as positive allowance | 24B |
| B8  | LOW | Dead `!== 'client'` inside installer block | 24B |
| B9  | LOW | expertMode DOM read at export time | 24B |
| B10 | LOW | LoadEngine.appliances live state drift | 24B |

---

## Improvement Recommendations (ranked by impact)

1. **Client-safe Safety Findings page** (MEDIUM effort / HIGH impact) — Always render a plain-language hard-block + warning count in client PDFs. Protects installer from liability. See B4 fix direction.

2. **IEC 61724-1 PR and Specific Yield KPIs** (MEDIUM effort / HIGH impact) — Add Performance Ratio (PR = E_AC / G_POA × A × η_STC) and Specific Yield (kWh/kWp/yr = agg.dailyEnergyWh × 365 / pv.arrayWattage) to cover page or a dedicated KPI row. These are the two universally recognized PV KPIs that AHJs and EPCs look for first.

3. **IEC/NEC standard citations beside engineering sections** (LOW effort / MEDIUM impact) — Append applicable clause to each section header, e.g., "Cable Sizing Summary (IEC 60364-5-52 §523)" and "Protection Devices (IEC 62548 §6 / NEC Art. 690.9)". Signals engineering credibility to AHJ reviewers.

4. **Voc(cold) PASS/FAIL badge vs inverter max DC voltage** (LOW effort / MEDIUM impact) — Surface `String Voc (cold)` vs `inv.maxDCInputVoltage` as an explicit PASS/FAIL row with the IEC 62548 §7.3.5 citation. Most common cause of failed AHJ submittals globally.

5. **Module / inverter brand and model on cover page** (LOW effort / MEDIUM impact) — Real EPC proposals always identify equipment brand. If `R.equipmentLibrary` has model fields, surface the top-line model strings; otherwise add Reference Equipment placeholder rows.

6. **Assumptions ledger page** (LOW effort / MEDIUM impact) — Single-page table of every assumption the engine made (`Soiling: 5%`, `Module temp coef: −0.35%/°C`, `Battery DoD: 90%`, `Inverter EU efficiency: 96.8%`, `VD limit: 3%`, etc.). Eliminates "where did this come from?" objections.

7. **Monthly energy yield bar chart** (MEDIUM effort / MEDIUM impact) — 12-month synthetic seasonal bar drawn with `doc.rect` — no new libs needed. Engineers globally expect seasonality visibility; a single PSH average does not show rainy-season dips.

8. **Annual kWh roll-up on cover / finance section** (LOW effort / LOW impact) — `agg.dailyEnergyWh × 365` converted to annual kWh. Many clients prefer annual framing for offset/payback narratives.

9. **CO₂-avoided estimate** (LOW effort / LOW impact) — `annual kWh × regional gridCO2Factor`. Add one `gridCO2Factor` field to each REGION_PROFILE. Widely appreciated by procurement and ESG-driven buyers.

10. **Document revision history block** (LOW effort / LOW impact) — Small auto-populated table at end: `Rev | Date | Author | Notes`. Signals professional document control.

11. **Embed Unicode-capable font or ISO currency codes** (MEDIUM effort / LOW impact) — Currencies like ₦, ₹, ﷼ won't render with default helvetica. Map to ISO codes (NGN, INR, SAR) or load a fallback font for currency glyphs.

12. **"Next steps / commissioning checklist" in client PDF** (LOW effort / LOW impact) — 5-bullet plain-language list: pre-energization visual check, polarity test, IR ≥ 1 MΩ (IEC 62446-1), OC voltage measurement, first-day production sanity check. Useful for site handover.

13. **Warn when no regulatory note for selected region** (LOW effort / LOW impact) — If `regProfile.regulatoryNote` is missing, print: "Regulatory note not yet curated for this region — consult local AHJ." More credible than silent omission.

---

*Documented: 2026-05-17 — Opus verification + new sweep, Batch 24A/B planning*
