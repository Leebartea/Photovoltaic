# Audit — Batch 25 Issue Register

Batch 24 verification pass + Feature-completeness audit (grid-tie, 3-phase, dual/triple MPPT, commercial scale, battery chemistry).
Audited: 2026-05-17. All approximate line numbers reference `src/scripts/modules/30-controller.js` unless noted.

---

## Batch 24 Verification Summary

| ID | Status | Line(s) | Notes |
|----|--------|---------|-------|
| P17 (complete) | VERIFIED | 21157–21177 | Helper vars `phaseRecMm2 / phaseMktMm2 / reduceNeutral / neutralMkt`; `sizeRangeDisplay` branches three ways; IEC 60364-5-52 §524.2 cited |
| B1  | VERIFIED | 21235–21240 | `blockLines` via `allBlocks.reduce(splitTextToSize)`, `rectH = blockLines*5+8`, overflow guard before `roundedRect` |
| B2  | VERIFIED | 21136     | `Number(p.currentA) \|\| 0` inside `.map()` |
| B3  | VERIFIED | 20834     | Channel `drawTable` wrapped in `if (audienceMode === 'installer')` |
| B4  | VERIFIED | 21477–21496 | `if (audienceMode === 'client') { clientBlocks / clientWarnings }` before installer block |
| B5  | VERIFIED | 20126     | `const locKey = config.location \|\| 'lagos'` — no DOM read |
| B6  | VERIFIED | 20132     | `audienceMode === 'client' ? 'PV Client Estimate' : 'PV System Design Report'` |
| B7  | VERIFIED | 21571–21575 | Sign-aware branches: `> 2` = allowance, `< -2` = rounding adjustment |
| B8  | VERIFIED | 21635     | `if (pdfManaged)` — dead `audienceMode !== 'client'` removed |
| B9  | VERIFIED | 20883     | `config.expertMode ?? (document.getElementById('expertMode')?.checked \|\| false)` |
| B10 | VERIFIED | 21549–21566 | `pdfAppliances = R.appliances.length > 0 ? R.appliances : LoadEngine.appliances`; forEach iterates snapshot |

All 11 items **VERIFIED**. Codebase is clean post-Batch 24.

---

## Feature-Completeness Audit

### F1 — Grid-Tied Mode (`systemType === 'grid_tie'`)

#### What IS wired (working correctly)
- `getConfig` propagates `systemType` from DOM
- Recommendation engine applies `hybridGrid` bonus for `grid_tie`
- `usesStandaloneMPPT = systemType === 'off_grid'` — correctly excludes grid-tie from standalone MPPT hardware
- Export energy accounting recognises `['hybrid', 'grid_tie']` on controller ~17639
- Cover page system-type label map handles `grid_tie: 'Grid-Tie'`
- Inverter label discriminates `'Grid-tie'` vs `'Hybrid'` vs `'Off-grid'`

#### BROKEN / MISSING

##### F1-a — HIGH — SVG diagram shows off-grid topology for grid-tie

**Symptom:** `renderSystemDiagram` has no branch on `systemType`. Grid-tie PDFs show panels → MPPT → inverter → battery → loads, with no grid connection symbol, no bidirectional meter, no export arrow.

**Fix (renderSystemDiagram, ~lines 19000–19800):**
```js
const systemType = config.systemType || 'off_grid';
const showGrid = systemType === 'grid_tie' || systemType === 'hybrid';
const showBattery = systemType !== 'grid_tie';
// Render grid node (utility pole SVG group) + bidirectional meter when showGrid
// Suppress or grey Battery node when !showBattery
// Add "Export →" arrow from inverter → grid when exportWh > 0
```

##### F1-b — MEDIUM — Cover page renders backup-hours line for grid-tie (meaningless)

**Location:** ~line 20898.

**Symptom:** `backupHoursPdf = batt.usableCapacityWh / avgLoadPdf` is computed and printed without checking `systemType`. For pure grid-tie (no battery) this is 0 or NaN.

**Fix:**
```js
if (audienceMode !== 'client' || systemTypeValue !== 'grid_tie') {
    // existing backup hours line
}
if (systemTypeValue === 'grid_tie') {
    labelValue('Daily export (est.):', `${fmtEnergy(exportWh)} kWh`);
}
```

##### F1-c — MEDIUM — `usesStandaloneMPPT` gate conflates hardware and electrical validation

**Location:** ~line 20829.

**Symptom:** The cover-page MPPT Validation row is gated on `commercial?.usesStandaloneMPPT && R.mpptValidation`. For grid-tie, `usesStandaloneMPPT = false`, so string Voc/Isc validation never appears in client PDFs — but grid-tie inverters DO have MPPT input windows that need Voc/Isc validation.

**Fix:** Decouple validation from hardware flag:
```js
// Cover page MPPT validation row
if (R.mpptValidation) {           // always show when validation exists
    labelValue('MPPT Validation:', ...)
}
// Cover page "Standalone MPPT Controller" hardware line
if (commercial?.usesStandaloneMPPT) {
    labelValue('Standalone MPPT:', ...)
}
```

##### F1-d — LOW — Grid-tie export-credit finance flow not verified

Grep returned no hits for `netMetering`, `feedInTariff`, or `exportCredit` in the finance path. Finance summary may calculate the same payback logic regardless of `systemType`. Verify that `calculateCommercialFinanceSummary` uses `exportWh × exportCreditPerKWh` as a revenue stream when `systemType === 'grid_tie'` (not just battery offset savings).

---

### F2 — 3-Phase Mode

#### What IS wired (working correctly)
- `CableEngine` produces L1, L2, L3, Neutral rows in 3-phase mode
- PDF cable table renders all 4 rows
- Phase imbalance table + recommendations render in detail section
- Neutral IEC 60364 sizing rules applied (Batch 23B P17 + Batch 24 P17)
- Cluster plan for 3-phase inverters surfaced in cover and detail pages

#### BROKEN / MISSING

##### F2-a — HIGH — SVG diagram has no 3-phase indicator

**Symptom:** Same single-conductor AC output symbol regardless of phase count. A 3-phase installation should show L1/L2/L3 + N conductors or a "3φ 400/230V" badge on the inverter AC output.

**Fix (renderSystemDiagram):**
```js
const is3Phase = !!(R.phaseAllocation?.phases?.length === 3);
// When is3Phase:
// - Draw three conductors (brown L1, black L2, grey L3, blue N) from inverter to busbar
// - Add "3φ 400/230V" label above the AC output busbar
// When !is3Phase:
// - Existing single-conductor output
```

##### F2-b — MEDIUM — `getConfig` phase pickup needs verification

Grep shows no `phases` / `phaseCount` key in the controller's `getConfig` block. If `phases` is not read from DOM and passed to the engine, 3-phase calculation may not be triggered by user selection.

**Action:** Verify `getConfig` (controller ~14500–15000) reads `parseInt(document.getElementById('phases')?.value) || 1` and that the engine branches on `config.phases === 3`.

##### F2-c — LOW — Phase-imbalance warning not confirmed in `allWarnings`

The warning is shown in the detail tab but may not flow into `allWarnings` / page 3 warnings list. Verify `LoadBalancingEngine` pushes an imbalance warning when `imbalancePct > 10%`.

---

### F3 — Dual MPPT (2 inputs) — USER-REPORTED BUG

**User report: "when I select dual MPPT, it shows fields but does not show in the SVG."**

#### What IS wired
- Engine produces `R.multiMPPTResult.distributions[recommended].channels`
- PDF installer cover page renders channel distribution table (B3 fix, Batch 24)
- PDF installer appendix renders full multi-MPPT table (P9 fix, Batch 23B)

#### BROKEN / MISSING

##### F3-a — HIGH — SVG diagram does not show dual MPPT string split (confirmed user report)

**Symptom:** `renderSystemDiagram` has zero references to `multiMPPTResult`, `mpptCount`, or multiple string groups. The diagram always shows one MPPT controller block regardless of how many MPPT inputs are configured.

**Fix (renderSystemDiagram, ~lines 19000–19800):**
```js
const channels = R.multiMPPTResult?.distributions?.[R.multiMPPTResult?.recommended]?.channels || [];
const mpptCount = channels.length || config.mpptCount || 1;

if (mpptCount >= 2) {
    // Draw mpptCount separate PV string groups → mpptCount input ports on inverter
    // Label each channel: "MPPT 1 — {stringsInChannel}S {vmpCalc}V {impCalc}A"
    // Use channels[i].stringsCount, channels[i].vocCold, channels[i].iscSingle
} else {
    // existing single-input path
}
```

##### F3-b — MEDIUM — Field-to-engine pipe for mpptCount not verified

The UI shows dual-MPPT fields when selected, but it is not confirmed that `config.mpptCount` (or equivalent) is read from `getConfig` and reaches `MultiMPPTEngine`. 

**Action:**
```bash
grep -n "mpptCount\|inputsPerInverter\|numMPPT\|mpptInputs" src/scripts/modules/30-controller.js
```
If no result, add `mpptCount: parseInt(document.getElementById('mpptCount')?.value) || 1` to `getConfig`.

---

### F4 — Triple MPPT (3 inputs)

#### Same SVG gap as F3 (F4-a)

All notes from F3-a apply with `mpptCount === 3`.

#### BROKEN / MISSING (additional)

##### F4-b — MEDIUM — Engine 3-input support not verified

**Action:**
```bash
grep -n "channels.length\|<= 2\|=== 2\|maxMPPT\|mpptCount" src/scripts/modules/10-engines.ts
```
If a `channels.length <= 2` or `=== 2` clamp exists, raise it to `<= 4` (residential) or `<= 12` (commercial string combiner).

##### F4-c — LOW — DOM select may not allow value 3

Verify the `mpptCount` field allows `{1, 2, 3}` or `{1, 2, 3, 4}` option values in the template.

---

### F5 — Commercial / Utility Plant Mode

#### What IS wired
- `PlantScopingEngine` branches on `businessProfile` + `plantScope` (engines ~2604)
- `R.commercial.usesStandaloneMPPT` correctly set
- Plant feeder/board/breaker/cable review sections already exist in the UI

#### BROKEN / MISSING

##### F5-a — MEDIUM — No `commercial` / `utility` systemType enum

**Symptom:** `systemType` select only offers `off_grid | hybrid | grid_tie`. There is no `commercial_grid_tie` or `utility_export` value. Commercial-scale is implied from load size + businessProfile, not an explicit mode.

**Recommended fix (additive):**
Add `installationScale: 'residential' | 'commercial' | 'utility'` field. Auto-derive from `pv.arrayWattage`:
```js
const installationScale = pv.arrayWattage >= 500_000 ? 'utility'
    : pv.arrayWattage >= 50_000 ? 'commercial'
    : 'residential';
```
Branch PDF and SVG sections on `installationScale`.

##### F5-b — MEDIUM — No commercial-scale PDF section

**Symptom:** A 500 kWp commercial plant gets the same "Practical Usage Tips" and "Coping Score" as a 5 kWp home. Commercial installs need: MV/LV transformer sizing, string combiner counts, SCADA monitoring points, G99/G98/IEEE 1547 interconnection compliance.

**Fix (exportPDF):**
```js
if (pv.arrayWattage >= 50_000) {
    newPage();
    sectionTitle('Commercial Plant Engineering');
    labelValue('Transformer sizing:', `${Math.ceil(pv.arrayWattage / 0.85 / 1000)} kVA (est. 85% derating)`);
    labelValue('String combiner boxes:', `${Math.ceil(pv.totalPanels / 16)} (est. 16 strings/combiner)`);
    labelValue('Monitoring / SCADA:', 'IEC 61724-1 logger + remote SCADA recommended');
    // + grid code reference by region
}
```

##### F5-c — LOW — SVG diagram does not scale for multi-string commercial

For arrays > ~20 strings, the diagram should show string combiner groups rather than individual strings. No fix defined yet — needs UI/UX decision on representation.

---

### F6 — Battery Chemistry Variants

#### What IS wired
- `batt.chemistryName` renders on cover page (lines 20820, 20826)
- Batch 23A P1 fix: `battChemSpecs = DEFAULTS.BATTERY_SPECS[batt.chemistry] || DEFAULTS.BATTERY_SPECS.lifepo4` guard in PDF path

#### Needs verification (could not re-read source in this session)

##### F6-a — Enumerate chemistry keys

```bash
grep -n "BATTERY_SPECS" src/scripts/modules/00-data.ts src/scripts/modules/10-engines.ts
```
Expected: `lifepo4`, `lithium_ncm` (or `nca`), `agm`, `gel`, `flooded`. Confirm DOM `<select id="batteryChemistry">` has matching `value` attributes.

##### F6-b — Confirm battChemSpecs guard at ALL access sites

```bash
grep -n "BATTERY_SPECS\[" src/scripts/modules/10-engines.ts src/scripts/modules/30-controller.js
```
Any bare `DEFAULTS.BATTERY_SPECS[batt.chemistry].xxx` (no `|| DEFAULTS.BATTERY_SPECS.lifepo4` fallback) is a crash bug for unknown chemistry values. The P1 fix was applied in the PDF path; verify the engine path (10-engines.ts) is also guarded.

##### F6-c — chemistryName label fallback

Confirm `BatteryEngine` sets `chemistryName` from a label map with a fallback (`'Lithium (assumed)'`), not from a bare property access that returns `undefined` for unknown keys.

---

## Batch Assignment

| ID | Severity | Description | Batch |
|----|----------|-------------|-------|
| F3-a | HIGH | SVG dual/triple MPPT split missing — confirmed user report | 25A |
| F2-a | HIGH | SVG 3-phase output indicator missing | 25A |
| F1-a | HIGH | SVG grid-tie topology missing (no grid node / meter / export arrow) | 25A |
| F1-b | MEDIUM | Cover page backup-hours meaningless for grid-tie | 25B |
| F1-c | MEDIUM | `usesStandaloneMPPT` conflates hardware vs validation gate | 25B |
| F2-b | MEDIUM | `getConfig` phase pickup not verified — may silently skip 3-phase | 25B |
| F3-b | MEDIUM | `mpptCount` field-to-engine pipe not verified | 25B |
| F4-b | MEDIUM | Engine 3-MPPT input limit unknown | 25B |
| F5-a | MEDIUM | No commercial/utility systemType enum or installationScale field | 25C |
| F5-b | MEDIUM | No commercial-scale PDF section (transformer, combiner, SCADA) | 25C |
| F6-a | LOW | Battery chemistry keys — enumerate and verify DOM options | 25B |
| F6-b | LOW | battChemSpecs guard: verify all access sites in 10-engines.ts | 25B |
| F1-d | LOW | Grid-tie finance export-credit flow not verified | 25B |
| F2-c | LOW | Phase-imbalance warning not confirmed in allWarnings | 25B |
| F4-c | LOW | DOM mpptCount select max value | 25B |
| F5-c | LOW | SVG string combiner scaling for commercial | 25C |
| F6-c | LOW | chemistryName undefined fallback | 25B |

---

## Improvement Recommendations (carry-forward from Batch 24)

These are still open from the Batch 24 Opus sweep. Rank them after Batch 25 is done.

1. IEC 61724-1 PR and Specific Yield KPIs on cover page
2. IEC/NEC standard citations beside section headers
3. Voc(cold) PASS/FAIL badge vs inverter max DC voltage
4. Module / inverter brand on cover page
5. Assumptions ledger page
6. Monthly energy yield bar chart
7. Annual kWh roll-up
8. CO₂-avoided estimate
9. Document revision history block
10. Embed Unicode-capable font or ISO currency codes
11. "Next steps / commissioning checklist" in client PDF
12. Warn when no regulatory note for selected region

---

*Documented: 2026-05-17 — Opus Batch 24 verification + feature-completeness audit, Batch 25 planning*
