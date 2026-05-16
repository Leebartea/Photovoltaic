# Fix Batch Roadmap — PV Calculator

This document tracks all planned fix batches in priority order.
Updated after each batch. Last update: 2026-05-14 (post-Batch 18).

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
| Batch 16A | b05b728 | 2026-05-14 | Continuous discharge safety check, disclaimer gate fix, residential_backup schedule, evening_overnight schedule |
| Batch 16B | 0ec81ae | 2026-05-14 | Mobile nav hamburger (fixed bottom-right popover), New/Clear project button, #A16 confidence score PDF breakdown |
| Batch 17  | 572261c | 2026-05-14 | Local Cost Build-Up pricing mode — per-unit prices (panel/inverter/battery), logistics, permits, flat/% labour, profit margin, FX-safe, client PDF toggle |
| Batch 18  | f9ef5f4 | 2026-05-14 | 24V bus advisory (BatterySizingEngine warning when >500Ah at 24V); renderBatteryTab warnings loop; New Project button rename + tooltip + footer reset CTA |
| Batch 19  | 00a5038 | 2026-05-14 | Fix local build-up crash (options undefined in renderCommercialSummary); battery kWh→Ah display uses correct voltage; auto-sniff battery kWh on mode switch; hide duplicate labour/margin fields; New Project in hamburger nav |
| Batch 20A | 11e7cc3 | 2026-05-14 | Fix local build-up paymentPlan null crash (inline-construct depositPct/deposit/completion); add band.spreadPct; fix pricingSource string blocking renderer fallback; add ⚡ Calculate shortcut to hamburger nav |
| Batch 21A | 330f78f | 2026-05-15 | PDF packLabel crash (guard commercial.pricingSource in PDF path, 7 sites); undefined BOM subtitle (item.notes || ''); duplicate labour rows (conditional totalRows for isLocalBuildUp); panel shows 400Wp (wrong DOM ID 'panelWatts' → config.panelWattage/'panelWattage'); zero Resolved Cost Rates (pricingSourceHtml gated on isLocalBuildUp); FX rate reverts to default (add !fxEl.value guard in applyCommercialDefaultsByLocation) |
| Batch 21B | 1cb5811 | 2026-05-16 | PDF BOM subtitle undefined (item.basis + item.notes guard); PDF Commercial Totals duplicate labour/soft/margin rows gated on isLocalBuildUp; footer single-print (remove brand line from addPageFooter, post-build loop now sole brand+page stamp); duplicate Pricing Basis row gated on !isLocalBuildUp; battery unit count uses batt.stringsInParallel + nominal-voltage per-unit kWh |
| Batch 21C | cdf4a35 | 2026-05-16 | Battery BOM kWh uses actual Ah/unit on manual override (recommendedAhPerCell stale post-override → use totalCapacityAh/stringsInParallel); Modeled Adders PDF row shows local build-up rates (laborPercent/profitMarginPct) when isLocalBuildUp, not global benchmark fields |
| Batch 22A | 37cd111 | 2026-05-16 | Transformer advisory escalation: critical severity at ≥2 motors OR complianceRisk=high (was: warning at ≥1 motor); inverter.warnings rendered inline in inverter tab (bus-voltage warnings previously invisible to user) |
| Batch 22B | 7475f12 | 2026-05-16 | V1: falsy-zero ambientTempMin fix (|| → ??) at 5 engine sites; V2: VOC_HEADROOM_PERCENT 0.03→0.05 + 90% soft-warn tier in validateUserConfig; V3: pvArray.blocks[]/warnings[] resynced after desiredCount/auto-sync/multi-MPPT mutations |
| Batch 22C | 0dfcaf4 | 2026-05-16 | Results nav in hamburger: updateHamburgerResultNav() injects 12 tab links (installer) or single Results link (client) after calculate; auto-collapses nav on mobile |
| Batch 22D | 075a473 | 2026-05-16 | Effective PSH advisory: read-only display below PSH field showing effective PSH after orientation+tilt derate; updates live on input, initialised on page load |
| Enh 1     | b3ae61f | 2026-05-16 | Panel wattage auto-suggest: PANEL_WATTAGE_TIERS buckets (<3kWp→250Wp, 3–10→450Wp, ≥10→580Wp); hint + Apply link shown below panelWattage field after calculate; no forced override, no feedback loop |
| Enh 2     | 498ea2f | 2026-05-16 | Hamburger result nav two-tier hierarchy: section links (Executive Snapshot, Commercial Estimate, Warnings[conditional], Detailed Results, Disclaimer, Export) + indented tab sub-links under Detailed Results; adds navigateToResultSection(sectionId) helper |
| Batch 22B V4+V5 | 8c373e6 | 2026-05-16 | V4: info advisory when all MPPT fields at HTML defaults (500V/27A/7500W); V5: getConfig ambientTempMin/Max falsy-zero fix (|| → isNaN guard) |
| Enh 3     | fb3f6d8 | 2026-05-16 | Collapsible Detailed Results sub-nav in hamburger: ▾/▸ caret toggles 12 tab sub-links without navigating; adds toggleDetailResultNav() method |

---

## Open Batches (Planned)

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
- Every code commit must include ALL of these (recurring pattern — do not skip any):
  ```
  git add src/... dist/web/assets/app.js dist/web/assets/app.css dist/web/index.html dist/web/pv_calculator_ui.html src/scripts/app.js pv_calculator_ui.html
  ```
- Build must pass (`npm run build` exit 0) before any commit
- After committing, run `git log origin/main..HEAD --oneline` — if any lines appear, those commits are NOT pushed. Run `git push origin main`.

*Last updated: 2026-05-16 (post-Enh 3 — collapsible Detailed Results sub-nav)*
