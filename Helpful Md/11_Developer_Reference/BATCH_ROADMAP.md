# Fix Batch Roadmap — PV Calculator

This document tracks all planned fix batches in priority order.
Updated after each batch. Last update: 2026-05-14 (post-Batch 15E).

---

## Completed Batches

| Batch | Commit | Date | Scope |
|-------|--------|------|-------|
| Batch 1 | 3c8aece | 2026-05-03 | Rate validation, inverter surge auto-promote, text truncation, coping score |
| Batch 2 | ea59036 | 2026-05-03 | Battery usable Ah fix, AC voltage badge, 3-phase cable BOM |
| Batch 3 | 7b9a8d6 | 2026-05-04 | VAT by country, FX currency conversion |
| Batch 4 | 78cfa10 | 2026-05-04 | Daily energy reconciliation, MPPT cost rationale, FX finance panel, LiFePO4 badge, SVG title, coping bar gate |
| Batch 5 | 6ec4a22 | 2026-05-07 | FX double-multiply removed, battery Ah override, unit-count warning |
| Batch 6 | 4d3e179 | 2026-05-07 | Cloud-day energy formula, inverter DC current cap |
| Batch 7 | f0627cf | 2026-05-07 | Installer-mode currency label |
| Batch 8 | 7701aa5 | 2026-05-07 | FX rate companion fields for energy rates |
| Batch 9 | 2361b34 | 2026-05-07 | Commercial BOM FX, finance arithmetic normalisation, BOM label strings, energy rate cap |
| Batch 10 | 980ec06 | 2026-05-07 | Appliance type label, table truncation, column widths |
| Batch 11 | 0fd0b54 | 2026-05-07 | Audience mode banner, client PDF disclaimer gate, Payment & Acceptance page |
| Batch 12 | 56393c2 | 2026-05-07 | Locale-aware currency, PDF unit auto-scaling |
| Batch 13 | 9912003 | 2026-05-07 | Silent autosave restore, debounced input |
| Batch 14 | abc7c21 | 2026-05-07 | Collapse advanced fields, Pricing section reorder, tablet layout |
| Hotfix 3 | 1ac47eb | 2026-05-09 | Finance double-FX in calculateCommercialFinanceSummary |
| Batch 15A | 97c5450 | 2026-05-09 | PDF footer double-print, header company-name suppression |
| Batch 15B | ce04338 | 2026-05-09 | Rate clamp, formatProposalMoney fxRate, acceptance page gate |
| Batch 15C | 1b7ed32 | 2026-05-09 | Africa generator_offset rate correction, basis-aware auto-fill, clamp raised to 2.5 |
| Batch 15D | 00c1a70 + 9c045f8 | 2026-05-14 | Mobile hero stack, coping score dup, rounding row, inverter validation label, MPPT gate |
| Batch 15E | — (verification) | 2026-05-14 | SVG verified, all 15D fixes confirmed, #A14/#A15/#A16 logged |

---

## Open Batches (Planned)

### Batch 16A — Engineering Safety + Smart Workspace Defaults
**Priority: HIGH — safety-relevant (#A14) + data correctness (#A15)**
**Files:** `src/scripts/modules/10-engines.ts`, `src/scripts/modules/00-defaults.ts`, `src/scripts/modules/30-controller.js`

| Issue | Fix | File |
|-------|-----|------|
| **#A14** — BatterySizingEngine missing continuous-discharge current check | Add warning when `ContinuousLoadCurrent > TotalCapacityAh × 0.5C` | `10-engines.ts` ~line 1888 |
| **#A15** — Disclaimer guard edge case (client + includeDetails=true) | Change gate from `!clientExport` to `audienceMode !== 'client'` | `30-controller.js` ~line 21313 |
| **residential_backup schedule wrong** | Change `recommendedSchedule: 'business_day'` → `'evening_overnight'` | `00-defaults.ts` line 1590 |
| **New `evening_overnight` schedule** | Add schedule: label "Residential / Evening & Overnight", `expectsNightContinuity: true`, `prefersDaytimeShift: false`, 7 days | `00-defaults.ts` ~line 1806 |

**No HTML or CSS changes required.** Schedule select populates dynamically from `DEFAULTS.OPERATING_SCHEDULES`.

**Needs Opus pre-dive:** No — all 4 changes are well-specified above.
**Implementer note:** Rebuild `dist/web/assets/app.js`, `pv_calculator_ui.html` after edits.

---

### Batch 16B — Mobile Navigation + New Project UX
**Priority: MEDIUM — UX quality**
**Files:** `src/styles/app.css`, `src/template.html`, `src/scripts/modules/30-controller.js`

| Issue | Fix | File |
|-------|-----|------|
| Mobile hamburger nav missing | Change `@media (max-width: 768px) { .section-nav { display: none } }` to position toggle button fixed bottom-right instead of hiding; style items panel as upward popover | `app.css` ~line 3878 |
| No "New / Clear" project button | Add `clearProject()` method; add button in Project Workspace card after Import File button | `30-controller.js` (new method), `template.html` ~line 567 |

**Needs Opus pre-dive:** Recommended for the hamburger implementation (positioning math and popover CSS need precision to not break desktop nav).

---

### Batch 16C — Confidence Score PDF Breakdown
**Priority: LOW — auditability improvement**
**Files:** `src/scripts/modules/30-controller.js` (PDF export section)

| Issue | Fix |
|-------|-----|
| **#A16** — Confidence score not itemised in PDF | Add compact penalty breakdown in 7pt text under the confidence bar on PDF cover page, listing architecture/strategy/managed-mode penalty components |

**Needs Opus pre-dive:** No — the penalty values are already in scope at PDF export time; it's a formatting addition only.

---

### Batch 17 — Local Market Pricing Engine
**Priority: HIGH value — installer usability**
**Scope:** New "Local Cost Build-Up" pricing mode alongside the existing $/Wp model.

**Why this matters:** The current model uses international wholesale USD rates (e.g. $0.29/Wp panels, $0.14/VA inverter, $245/kWh battery). Nigerian installers buying locally pay significantly different amounts per unit. The app quotes NGN 16.5M for systems that real installers charge NGN 3–5M.

**Proposed features:**
- Per-unit actual prices (e.g. ₦65,000/panel, ₦420,000 for the specific inverter model)
- Fixed cost fields: logistics, transport, permit, documentation
- Installer labor charge (flat fee OR % of material cost)
- Installer profit margin
- The existing $/Wp model stays as "Benchmark Estimate" mode

**Needs Opus design dive:** YES — before any code. The data structure for per-unit costs, how they interact with the existing BOM, and how the UI switch works all need careful design.

---

### Batch 18 — 24V Bus Auto-Escalation Recommendation (#R1)
**Priority: LOW — product policy improvement**
**Scope:** When the engine calculates a battery bank > ~500Ah at 24V, add a soft advisory recommending the user switch to 48V.

**Engineering basis:**
- 800Ah at 24V requires 400Ah cells (uncommon)
- Continuous DC at 24V for 3kVA = ~133A (borderline for many 24V components)
- 48V halves DC current and uses commodity 100–200Ah rack modules

**Files:** `src/scripts/modules/10-engines.ts` (BatterySizingEngine — add advisory), possibly `src/scripts/modules/30-controller.js` (UI badge)

**Needs Opus pre-dive:** Brief one — to confirm which engine outputs the advisory and whether the HTML panel shows it.

---

### Enhancement — Panel/Battery Wattage Auto-Select
**Priority: MEDIUM — UX quality**
**Scope:** Auto-select panel wattage tier based on array size (small: 200–300Wp, medium: 400–450Wp, large: 550–600Wp).

**Needs Opus dive:** YES — into `PVArrayEngine` to understand how panel wattage feeds into panel count and whether auto-selection creates feedback loops.

---

### Enhancement — Local Market Pricing Engine (see Batch 17 above)

---

## Workflow Protocol (Reference)

| Role | Tool | Responsibility |
|------|------|---------------|
| **Opus (pv-estimation-expert)** | Pre-dive agent | Deep code audit, exact line numbers, exact old/new strings, engineering verification |
| **Sonnet 4.6** | Planner + Reviewer | Coordinates dive, writes execution prompt, verifies findings, updates all docs |
| **Sonnet Max** | Implementer | Applies edits in other terminal, runs `npm run build`, commits |

**Commit rules:**
- No `Co-Authored-By` line in any commit
- Code commit first (Sonnet Max), then docs commit (Sonnet 4.6)
- Every code commit must include: `git add src/... dist/web/assets/app.js dist/web/assets/app.css pv_calculator_ui.html`
- Build must pass (`npm run build` exit 0) before any commit

*Last updated: 2026-05-14*
