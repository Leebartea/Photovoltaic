# PDF Export Audit — Batch 23 Issue Register

Findings from Opus deep-dive of `exportPDF()` and the full PDF generation path.
Audited: 2026-05-17. All approximate line numbers reference `src/scripts/modules/30-controller.js`
unless otherwise noted.

Split into two implementation rounds:
- **Batch 23A** — CRITICAL + HIGH (5 issues): crash risk and wrong output to user
- **Batch 23B** — MEDIUM + LOW (15 issues): edge-case correctness and cosmetics

---

## Batch 23A — CRITICAL + HIGH

### #P1 — CRITICAL — Battery chemistry crash (lines ~21607–21615)

**Symptom:** `TypeError: Cannot read properties of undefined` when `batt.chemistry` is empty,
null, or an unmapped key — crashes the entire PDF export.

**Root cause:** Four consecutive property accesses with no null guard:
```js
DEFAULTS.BATTERY_SPECS[batt.chemistry].maxDoD
DEFAULTS.BATTERY_SPECS[batt.chemistry].maxDischargeRate
DEFAULTS.BATTERY_SPECS[batt.chemistry].maxChargeRate
DEFAULTS.BATTERY_SPECS[batt.chemistry].cycleLife
```
Elsewhere in the file (line ~24410) the same lookup already has a fallback:
`DEFAULTS.BATTERY_SPECS[batt.chemistry] || DEFAULTS.BATTERY_SPECS.lifepo4`

**Fix:** Before those four lines, lift into a guarded local:
```js
const battChemSpecs = DEFAULTS.BATTERY_SPECS[batt.chemistry] || DEFAULTS.BATTERY_SPECS.lifepo4;
```
Then replace each `DEFAULTS.BATTERY_SPECS[batt.chemistry].xxx` reference with `battChemSpecs.xxx`.

---

### #P2 — CRITICAL — managedMode.conditions iteration crash (lines ~21582–21585)

**Symptom:** `TypeError` when `pdfManaged` is truthy but `conditions` property is absent
(legacy or simplified managedMode path). Crash on `pdfManaged.conditions.length` before
the `for...of` loop.

**Root cause:**
```js
if (pdfManaged.conditions.length > 0) {           // line ~21582
    for (const cond of pdfManaged.conditions) {    // line ~21585
```
No optional-chain guard on `conditions`.

**Fix:** Replace with:
```js
if ((pdfManaged.conditions?.length || 0) > 0) {
    for (const cond of (pdfManaged.conditions || [])) {
```

---

### #P3 — HIGH — Local-Cost-Build-Up finance summary called with wrong argument shape (line ~18343)

**Symptom:** In Local Cost Build-Up mode the entire Finance section of the PDF shows
`annualSavings = 0`, `payback = null` (renders as "Strategic / verify"), and all
`*NetAfter*` values are garbage. The Commercial Value Outlook section is meaningless.

**Root cause:** `calculateCommercialFinanceSummary` signature is `(results, estimate, context)`.
The call in `_buildLocalBuildUpEstimate` is:
```js
this.calculateCommercialFinanceSummary(totals, inputs)
```
`totals` is passed as `results` (so `results.config`, `results.aggregation`, etc. are all
`undefined`). `inputs` is passed as `estimate` (so `estimate.totals` is `undefined` →
`finalQuote = 0`).

**Fix:** Change the call to:
```js
this.calculateCommercialFinanceSummary(this.results, { inputs, totals }, {})
```
This matches the argument shape used by the benchmark path and gives the finance engine the
live engine results plus the local-build-up totals.

---

### #P4 — HIGH — Client mode + "Include Details" leaks full installer engineering content (lines ~21089–21729)

**Symptom:** `clientExport = audienceMode === 'client' && !includeDetails`. The default
checkbox `pdfIncludeDetails` is **checked** on page load (~line 19947). So a client PDF
with the default export options ticked includes: raw DC currents, Voc(cold), Isc, MPPT
max V/A/W, protection-device ampere ratings, compliance risk level, and cable sizing
details — all inside a report header that says "PV Client Estimate".

**Root cause:** Sections gated on `if (!clientExport)` are only private when the user
explicitly unticks "Include Details". With the default checked, `clientExport = false`
even in client mode.

**Affected section gates (search for `!clientExport` in exportPDF):**
- Cable sizing table (~21089)
- Warnings / hard-blocks section (~21185)
- Full installer appendix block (~21429)
- Inverter sizing detail (~21508)
- Battery chemistry detail (~21602)
- PV array detail (~21670)
- Protection devices (~21703)
- System losses (~21729)

**Fix:** For each of those `if (!clientExport)` gates, change to:
```js
if (audienceMode !== 'client' && !clientExport)
// OR more simply:
if (audienceMode === 'installer')
```
This ensures technical sections are suppressed in client mode regardless of the "Include
Details" checkbox. The `includeDetails` flag should only control optional appendix content
within installer-mode exports.

---

### #P5 — HIGH — Local-Cost-Build-Up PDF: empty Package Comparison + orphaned section headings (lines ~20465, 20594, 20656)

**Symptom:** In Local Cost Build-Up mode, `commercial.options`, `commercial.notes`,
`commercial.scopeIncluded`, `exclusions`, `nextSteps` are all `[]`. The PDF still renders:
- A blue-header Package Comparison table row with no body rows
- `subTitle('Pricing Assumptions')` with no bullets below
- `subTitle('Scope Included')` with no bullets below
- `subTitle('Exclusions')` with no bullets below
- `subTitle('Next Steps')` with no bullets below
Result looks unfinished / orphaned headings with blank space.

**Root cause:** `_buildLocalBuildUpEstimate` initialises all four as empty arrays (line ~18371):
```js
options: [], notes: [], scopeIncluded: [], exclusions: [], nextSteps: []
```
But the proposal-context fields (`proposalIncludedScope`, `proposalExclusions`,
`proposalNextSteps`, `proposalNotes`) are filled by the user.

**Fix (two-part):**
1. In `_buildLocalBuildUpEstimate`, populate the four arrays from the same DOM fields the
   benchmark branch reads. Example:
   ```js
   const parseProposalList = (id) =>
       (document.getElementById(id)?.value || '').split('\n').map(s=>s.trim()).filter(Boolean);
   notes:        parseProposalList('proposalNotes'),
   scopeIncluded: parseProposalList('proposalIncludedScope'),
   exclusions:   parseProposalList('proposalExclusions'),
   nextSteps:    parseProposalList('proposalNextSteps'),
   ```
2. In the PDF path, gate each `drawTable` / `subTitle` block on `array.length > 0`:
   ```js
   if (commercial.scopeIncluded?.length > 0) { subTitle(...); ... }
   ```
   so even if the fields are empty the headings don't orphan.

---

## Batch 23B — MEDIUM

### #P6 — MEDIUM — Division by zero: `agg.dailyEnergyWh` (line ~21440)

```js
Math.round((agg.daytimeEnergyWh || 0) / agg.dailyEnergyWh * 100)
```
If load list is 0W, `dailyEnergyWh` = 0 → `NaN%` printed in PDF.
**Fix:** `agg.dailyEnergyWh > 0 ? Math.round((agg.daytimeEnergyWh||0)/agg.dailyEnergyWh*100) : 0`

---

### #P7 — MEDIUM — Division by zero: `pv.totalPanels` (lines ~20980, ~21673)

```js
Math.round(pv.arrayWattage / pv.totalPanels)
```
When `pv.totalPanels === 0` → `Infinity Wp` printed.
**Fix:** `pv.totalPanels > 0 ? Math.round(pv.arrayWattage / pv.totalPanels) : (config.panelWattage || 0)`

---

### #P8 — MEDIUM — Hard-block highlight box capped at 60mm (line ~21193)

```js
doc.roundedRect(mL, y - 2, contentW, Math.min(allBlocks.length * 14 + 6, 60), ...)
```
More than ~4 hard blocks → later bullet text renders outside the red background.
**Fix:** Remove `Math.min(..., 60)`. Allow rect height to match actual block count.

---

### #P9 — MEDIUM — Multi-MPPT distribution not shown in PDF

`R.multiMPPTResult` (channel distribution when user sets 2–3 MPPT inputs) is computed and
stored in results but never rendered in the PDF — only the primary single MPPT validation
row appears (~20813).
**Fix:** In the installer appendix, after the MPPT Validation labelValue row, add a loop
over `R.multiMPPTResult?.distributions?.[R.multiMPPTResult?.recommended]?.channels` (or
the equivalent array) and render a small `drawTable` with per-channel string counts and
voltage/current figures.

---

### #P10 — MEDIUM — "Override State: No manual overrides" misleading in Local Build-Up (line ~20514)

```js
labelValue('Override State:', commercial.pricingSource?.hasOverrides ? ... : 'No manual component overrides')
```
`pricingSource` is `null` in local build-up → always prints "No manual overrides", which
implies the calculator fell back to a benchmark.
**Fix:** Gate on `!commercial.isLocalBuildUp`:
```js
if (!commercial.isLocalBuildUp) {
    labelValue('Override State:', ...)
}
```

---

### #P11 — MEDIUM — Phase-row current `NaN` when `currentA` undefined (line ~21157)

```js
current: Number(p.currentA)   // → NaN if undefined
...
r.current.toFixed(1)           // → 'NaN'
```
**Fix:** `Number(p.currentA) || 0` and `Number(p.neutralCurrentA) || 0` at both sites.

---

### #P12 — MEDIUM — Confidence breakdown text has no `maxWidth` (lines ~20732–20733)

Long breakdown string rendered via `doc.text(str, pageW/2, y, {align:'center'})` with no
width limit — bleeds off margins at full-penalty values.
**Fix:**
```js
const breakdownLines = doc.splitTextToSize(breakdownText, contentW);
breakdownLines.forEach(line => { doc.text(line, pageW/2, y, {align:'center'}); y += 4; });
```

---

## Batch 23B — LOW

### #P13 — LOW — SVG captured by fragile CSS selector (line ~20119)

```js
document.querySelector('#tab-overview svg')
```
First SVG inside the tab, not by ID. Future SVGs added to Overview tab break this silently.
**Fix:** Add `id="systemDiagramSvg"` to the root `<svg>` tag in `renderSystemDiagram`
(search for the SVG string that opens the system diagram), then change selector to
`document.getElementById('systemDiagramSvg')`.

---

### #P14 — LOW — drawTable truncation heuristic `/1.85` (lines ~20365–20367)

Fixed-ratio truncation over-clips narrow chars and under-clips uppercase.
**Fix:** Use `doc.getTextWidth(cellText) > colWidths[i] - 4` and apply ellipsis only then.

---

### #P15 — LOW — Footer right-side stamp can bleed left (line ~21855)

Long `companyName + footerNote + version + page-of-N` string, right-aligned with no
`maxWidth`, can extend past `mL` and overlap the guidance footer on the left.
**Fix:** Truncate `companyName` to a safe max before concatenation, e.g., `(companyName || '').slice(0, 40)`.

---

### #P16 — LOW — Empty `decisionStrategy.detail` / `finance.strategicNote` renders blank bullet (lines ~20524, 20617)

```js
mutedText(decisionStrategy.detail, 2)
bulletItem(finance.strategicNote, 'info', 2)
```
If value is undefined or empty string, a blank line still consumes vertical space.
**Fix:** `if (decisionStrategy?.detail) mutedText(...)` and `if (finance?.strategicNote) bulletItem(...)`.

---

### #P17 — LOW — Neutral conductor halved for phases <16mm² — violates IEC 60364-5-52 §524.2 (lines ~21129–21136)

```js
Math.max(2.5, (acRun?.recommendedMm2 || 0) * 0.5)
```
Neutral reduction is only permitted above 16mm² Cu per IEC 60364. For smaller phases the
neutral must equal the phase conductor.
**Fix:**
```js
const phaseMm2 = acRun?.recommendedMm2 || 0;
const neutralMm2 = phaseMm2 > 16 ? Math.max(16, phaseMm2 * 0.5) : phaseMm2;
```

---

### #P18 — LOW — Diacritics in region name corrupt filename (line ~21860)

`.replace(/[^a-zA-Z0-9]/g, '_')` strips diacritics silently (e.g. Côte d'Ivoire → `C_te_d_Ivoire`).
**Fix:** Normalise before stripping:
```js
locName.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z0-9]/g, '_')
```

---

### #P19 — LOW — `addPageFooter()` still called explicitly before the page-stamp loop (line ~21846)

`addPageFooter()` is called once before the post-build page-of-N stamp loop. The loop
is supposed to be the sole stamp owner (Batch 21B). Dual-write risk if either path
is edited in future.
**Fix:** Remove the explicit `addPageFooter()` call at line ~21846 — the page-stamp loop
already handles every page.

---

### #P20 — LOW — `validityDays` singular/plural inconsistent across two render sites (lines ~20522, 20622)

One site uses a ternary for singular/plural; the other hardcodes "day" (always plural form).
**Fix:** Extract `const pluralDays = n => `${n} day${n === 1 ? '' : 's'}`;` and use at
both sites.

---

## Batch Assignment Summary

| ID  | Severity | Description                                      | Batch |
|-----|----------|--------------------------------------------------|-------|
| P1  | CRITICAL | Battery chemistry crash on unguarded spec lookup | 23A   |
| P2  | CRITICAL | managedMode.conditions crash (no optional chain) | 23A   |
| P3  | HIGH     | Local-Build-Up finance wrong arg shape → zeroed  | 23A   |
| P4  | HIGH     | Client mode leaks installer content (8+ sites)   | 23A   |
| P5  | HIGH     | Local-Build-Up empty BOM arrays → orphan heads  | 23A   |
| P6  | MEDIUM   | Division by zero: agg.dailyEnergyWh             | 23B   |
| P7  | MEDIUM   | Division by zero: pv.totalPanels                | 23B   |
| P8  | MEDIUM   | Hard-block red box capped at 60mm               | 23B   |
| P9  | MEDIUM   | Multi-MPPT distribution missing from PDF        | 23B   |
| P10 | MEDIUM   | "Override State" misleading in local build-up   | 23B   |
| P11 | MEDIUM   | Phase current NaN when currentA undefined       | 23B   |
| P12 | MEDIUM   | Confidence breakdown text bleeds off margin     | 23B   |
| P13 | LOW      | SVG selector fragile (CSS not ID)               | 23B   |
| P14 | LOW      | drawTable truncation heuristic (/1.85)          | 23B   |
| P15 | LOW      | Footer right stamp bleeds past mL               | 23B   |
| P16 | LOW      | Blank bullets from undefined strategic note     | 23B   |
| P17 | LOW      | Neutral conductor undersized <16mm² (IEC 60364) | 23B   |
| P18 | LOW      | Diacritics in filename corrupted                | 23B   |
| P19 | LOW      | addPageFooter() double-call (Batch 21B risk)    | 23B   |
| P20 | LOW      | validityDays singular/plural inconsistent       | 23B   |

*Documented: 2026-05-17 — Opus PDF audit, Batch 23A/B planning*
