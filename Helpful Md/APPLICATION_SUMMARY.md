# Advanced PV System Calculator -- Complete Application Summary

> Current build note (March 11, 2026): the product is now maintained as a modular source tree in `src/` and generated into two runtime artifacts: standalone `pv_calculator_ui.html` for offline use and hosted `dist/web/` for static deployment. Many lower line references still point to the generated HTML artifact for traceability, but the development model is no longer source-single-file.

**File:** `pv_calculator_ui.html`
**Generated Artifact Lines:** ~26,082
**Version:** 3.0.0 (Global Edition)
**Author:** Leebartea
**License:** MIT
**Generated:** Reference document for developers and engineers

---

## 1. Overview

The Advanced PV System Calculator is an **offline-first, browser-based** PV design and proposal tool built for **global use** with location-driven electrical, climate, pricing, and compliance assumptions. The current build ships both as a standalone single HTML runtime and as a hosted static bundle. It performs a complete engineering design pipeline from appliance and business-load entry through inverter, battery, PV, MPPT, cable, protection, proposal, and PDF output -- all without a required backend server.

**Key characteristics:**

- Modular source in `src/` with generated standalone and hosted runtime artifacts
- Shared TypeScript-ready domain/result definitions in `src/scripts/types/pv-types.d.ts` with a passing TS-10 boundary on the stable core modules, including typed domain-definition maps plus typed commercial, phase-allocation, practical-sizing, configuration-comparison, controller-summary, workspace-state, and workflow-guidance payload contracts, with native `.ts` defaults, engines, reporting, and controller payload/state/guidance helper modules
- Standalone offline artifact: `pv_calculator_ui.html`
- Hosted static artifact: `dist/web/pv_calculator_ui.html` plus `assets/`
- No required backend for sizing, quoting, or PDF export
- Vendored `jsPDF` 2.5.1 bundled locally by default for PDF export
- localStorage for autosave, named browser projects, import/export, and workspace restore
- Dark/light theme toggle with CSS custom properties
- Responsive grid layout (2-column on desktop, single column on mobile)
- Print-optimized styles with `.no-print` class exclusions
- Full client-side computation -- all calculations run in the browser
- Commercial workload features now include business classification, machine archetypes, operating schedules, three-phase allocation, modular clusters, commercial power architecture checks, supplier pricing packs, strategy recommendation, and compliance/proposal layers
- System Configuration now includes a smart business-context conclusion with quick-align actions, so related field choices can be kept coherent without silent auto-overwrite
- Plant-scoping guidance now separates captive business-site plants, private multi-feeder distribution jobs, and public-service / interconnection-heavy cases before a quote is treated like a plant study
- Plant-scoping guidance now also exposes a recommended feeder schedule, turning protected, assisted, and outside-promise load lanes into visible feeder and source-path output for plant jobs
- Plant-scoping output now also includes an installer-facing feeder brief with a source-coordination snapshot and copy / TXT export actions for one-line preparation
- Plant-scoping output now also includes a board / source schedule so feeder lanes can move into lightweight board-handover and one-line preparation without claiming a stamped drawing set
- Plant-scoping output now also includes a board procurement / breaker / cable review block that reuses live cable and protection sizing for bounded plant-handover checks
- Plant-scoping output now also includes a utility / mini-grid engineering lane block that tells the user when the project should leave the captive-site workflow and move into a separate study / interconnection track
- Plant-scoping output now also includes an explicit `Current working surface` block so the UI states whether the project is still a normal system-design job, a plant-engineering handoff, or a separate utility / mini-grid lane
- Plant-scoping output now also includes a bounded `Dispatch / load-shed / restoration sequence` so protected, assisted, and excluded feeder lanes can move into operational handoff notes before commissioning prep
- Plant-scoping output now also includes an `Interconnection / approval packet scaffold` so approval-heavy jobs can carry a real packet basis beside the plant lane
- Plant-scoping output now also includes `Feeder / protection study input capture` so feeder rows, breaker carry-through, cable runs, limiting-phase assumptions, and cluster basis survive into later study prep
- Plant-scoping output now also includes `Commissioning / witness-test prep` so the live feeder and source story can move into bounded energization and witness-prep notes
- System Configuration now also includes an optional utility / mini-grid input surface so packet lane, metering posture, study basis, commissioning path, and engineering references can be captured explicitly without forcing the whole job into a separate app
- That same optional utility surface now also captures packet stage, witness parties, and witness evidence so the approval and acceptance path can stay structured instead of collapsing into one notes field
- That same optional utility surface now also captures authority case status, case owner, submission/review date, and live review comments so the heavier lane can carry real approval-state detail instead of generic notes
- That same optional utility surface now also captures one-line / SLD, protection / relay, and witness / closeout deliverable status so packet, study, and commissioning exports can state actual handoff readiness instead of only packet-stage language
- That same optional utility surface now also captures filing channel, primary hold point, and response return path so packet exports can preserve how the live approval lane is filed, what gate is controlling it, and how the next response cycle returns
- That same optional utility surface now also captures current revision / response plus submission / review trail so heavier packet, study, and witness exports stay aligned to the same live case revision
- That same utility surface now also drives a stage-aware progression gate with ready signals, open blockers, and stage-exit handback so packet exports carry what is complete and what must happen next
- Those three utility-lane blocks now also expose copy / TXT export actions so packet basis, study-input carry-through, and commissioning / witness handoff can leave the UI as bounded engineering briefs
- The utility lane now also exposes structured CSV data sheets for interconnection, feeder / protection study-input, and witness handoff, so heavier jobs can move into engineering or authority prep with field-by-field packet, study, and acceptance records
- The optional utility surface now also captures study track, study owner / consultant, and a short fault / relay basis note, so the study lane can carry real review ownership and protection basis instead of only maturity/status labels
- Vertical starter templates now cover garment workshop, bakery, filling station, cold room, fabrication, and mini-factory workflows in addition to residential, retail, tailoring, clinic, and pump-led jobs
- The UI now includes a dedicated navigation guide so installer and client users can read the wider workflow in the right order instead of guessing at the commercial terms
- The documentation set now includes a scenario playbook that demonstrates how installer and client modes should be used across residential, retail/POS, tailoring, bakery, filling station, cold room, workshop, mini-factory, and plant-engineering jobs
- The result layer now includes an in-app `How To Read Outcome Scores` block and a dedicated written guide so users can interpret `Confidence`, `Coping Score`, `Commercial Strategy`, `Proposal Readiness`, `Regional Compliance`, and `Submission Pack` consistently
- The result layer now also uses a `Results Navigator` plus collapsible result sections so the user can move through the long output in segments instead of one continuous scroll
- Proposal and runtime output now separates `protected`, `assisted`, and `outside-the-promised-path` loads, and now states the continuity promise boundary explicitly so users can see what is covered, assisted, or excluded
- Commercial finance output now includes lifecycle sensitivity with annual O&M plus planned inverter and battery refresh allowances, an optional capital-stack view for debt, tax-benefit, and residual-value sensitivity, and side-by-side cash-versus-financed comparison when financing is modeled, so simple payback is not the only long-run story shown to the user
- Supplier quote freshness is now explicit in the pricing path, with benchmark/live status, quote age, refresh-window logic, and optional supplier reference carried into the results and PDF so commercial traceability is clearer
- Proposal Pricing now also includes an offline supplier quote import assistant for pasted quote lines plus TXT / JSON and header-aware CSV / ERP-style quote files, so installers can review and apply recognized supplier rates without manually retyping every override; metadata rows and `line total / qty` exports are now handled in the same review/apply path
- Proposal Pricing now also includes an offline supplier refresh-brief generator, so aging or stale quotes can be re-requested from the current recommended design and quote-freshness state without retyping the commercial basis
- Proposal Pricing now includes offline commercial presets with explicit apply behavior, so repeatable quote postures can update pricing basis, lifecycle allowances, finance sensitivity, terms, and scope wording without touching the engineering design
- The regression suite now includes locked commercial benchmark projects with both acceptance and constrained references

**Target users:** Solar installers, electrical engineers, proposal teams, and system designers working with off-grid and hybrid PV installations for residential, commercial, and small-industrial captive sites across global markets.

---

## 2. Architecture

### 2.1 Current Runtime Structure

```
src/
  template.html
  styles/app.css
  scripts/modules/00-defaults.ts
  scripts/modules/10-engines.ts
  scripts/modules/20-reporting.ts
  scripts/modules/25-controller-payloads.ts
  scripts/modules/26-controller-state.ts
  scripts/modules/27-controller-guidance.ts
  scripts/modules/30-controller.js
  scripts/modules/40-init.js

Generated outputs:
  pv_calculator_ui.html
  dist/web/pv_calculator_ui.html
  dist/web/assets/app.css
  dist/web/assets/app.js
  dist/web/assets/vendor/jspdf.umd.min.js
```

The lower line references in this document continue to use the generated `pv_calculator_ui.html` artifact because it remains the canonical offline delivery target.

### 2.2 CSS Architecture (Lines 16-696)

- **CSS Custom Properties (Lines 21-54):** Light and dark mode variable sets (`--primary-color`, `--bg-color`, `--card-bg`, `--text-color`, `--border-color`, `--shadow`, `--input-bg`)
- **Dark Mode (Lines 40-97):** Activated via `[data-theme="dark"]` attribute on `<html>`, overriding all variables with dark palette
- **Theme Toggle Button (Lines 100-127):** Fixed-position circular button, top-right corner, z-index 1000, hidden on print
- **Layout (Lines 168-178):** `.main-grid` uses CSS Grid with `1fr 1fr` columns, collapsing to `1fr` below 1024px
- **Form Styles (Lines 202-253):** `.form-row` grid for 2-column layouts, `.form-row.three` for 3-column, responsive to 1-column on mobile
- **Validation States (Lines 524-561):** `.invalid` (red border), `.valid` (green border), `.validation-error`/`.validation-warning`/`.validation-success` message classes
- **Mode Toggle (Lines 562-619):** CSS-only toggle switch for Auto-Suggest / Manual Input mode
- **Collapsible Sections (Lines 621-642):** Max-height transition for expand/collapse behavior
- **Spec Badges (Lines 644-667):** `.spec-badge.match` (green), `.spec-badge.mismatch` (red), `.spec-badge.warning` (amber)
- **Comparison Grid (Lines 679-694):** 3-column grid for side-by-side configuration display
- **Tab System (Lines 432-464):** Horizontal scrollable tabs with bottom-border active indicator
- **Print Styles (Lines 467-481):** Hides `.no-print`, removes card shadows, forces white background
- **Alert System (Lines 356-401):** Four severity levels: `.alert-warning` (amber), `.alert-error` (red), `.alert-success` (green), `.alert-info` (blue); each with left-border accent and icon slot

### 2.3 HTML Structure (Lines 697-1359)

**Left Column (Input Forms):**

1. **System Configuration** (Lines 713-774): Location profile (12 regions via optgroup dropdown), system type, phase type (Single/Split/3-Phase), AC voltage (dropdown from PHASE_CONFIG voltages + Custom), frequency (50Hz/60Hz, auto-set by region), inverter market (Auto/Emerging/EU/US override), PSH, autonomy days, temperature range, design margin, surge multiplier
2. **Add Appliance** (Lines 777-873): Name (with auto-detect), quantity, power, hours, duty cycle, load type, motor sub-type (16 categorized subtypes with optgroups), start method, surge factor, power factor, daytime ratio, simultaneous checkbox
3. **Appliance List** (Lines 876-886): Rendered table with edit/remove buttons, save/load/clear controls
4. **Upgrade Simulator** (Lines 889-918): Simulate adding a new load to current design
5. **Equipment Specifications** (Lines 921-1338): Auto-Suggest/Manual toggle, solar panel specs, MPPT specs (up to 3 inputs), panel count, daytime load checkbox, inverter manual override, battery chemistry/Ah/voltage/unit count/kWh, PV manual config (series/parallel/mismatch), breaker manual input, cable lengths

**Right Column (Results):**

6. **Results Container** (Lines 1348-1356): Populated dynamically by `renderResults()`

### 2.4 JavaScript Engine Architecture

The JavaScript is authored as source modules in `src/scripts/modules/` and concatenated into the generated browser bundle. At runtime, it still follows the same **const object module** pattern in global scope:

| Module | Lines | Purpose |
|--------|-------|---------|
| `DEFAULTS` | ~1965-2110 | All constants, presets, specs (incl. 16 MOTOR_SUBTYPES, adaptive APPLIANCE_PRESETS) |
| `LoadEngine` | ~2116-2215 | Per-appliance power/energy calculations |
| `AggregationEngine` | ~2221-2400 | Totals, surge, compliance risk |
| `InverterSizingEngine` | ~2406-2620 | Three-tier inverter sizing |
| `ManagedModeEngine` | ~2626-2870 | Managed practical inverter sizing with per-appliance behavior, risk assessment, inverter technology modifier |
| `BatterySizingEngine` | ~2876-3100 | Chemistry-aware battery bank, kWh-driven, 3-tier matching |
| `BatteryPracticalEngine` | ~3106-3250 | Practical battery alternative — reduced autonomy, nighttime-essential-only |
| `PVArrayEngine` | ~3256-3450 | Panel/string configuration |
| `PVPracticalEngine` | ~3456-3580 | Practical PV alternative — reduced panel count with daytime load shifting |
| `ChargeControllerValidator` | ~3586-3650 | MPPT voltage/current/power checks |
| `CableSizingEngine` | ~3656-3920 | Ampacity and voltage drop |
| `ProtectionEngine` | ~3926-4200 | Breakers, fuses, SPDs, earthing |
| `SystemLossEngine` | ~4206-4260 | Comprehensive efficiency chain |
| `UpgradeSimulator` | ~4266-4490 | Growth potential analysis |
| `ConfigurationComparisonEngine` | ~4496-4790 | Panel config scoring/validation |
| `MultiMPPTDistributor` | ~4796-5070 | Multi-MPPT panel distribution |
| `SmartAdvisoryEngine` | ~5076-5660 | Practical installer-level advice (incl. coping strategies, grid charging) |
| `OutputGenerator` | ~5666-5710 | Report assembly, warning collection |
| `DefenseNotes` | ~5716-5736 | Hard block aggregation |
| `CommercialArchitectureEngine` | ~8805-9063 | Selective boards, shared battery throughput, generator assist, PV field / MPPT grouping |
| `CommercialDecisionEngine` | current modular source | Strategy scoring across battery-dominant, solar-first, hybrid-assist/grid-assist, and essential-load-only postures |
| `PVCalculator` | ~12160-24400+ | UI controller, rendering, event handlers, workspace logic, multi-page PDF export |

### 2.5 localStorage Keys

| Key | Purpose | Written By |
|-----|---------|------------|
| `pv-theme` | `"light"` or `"dark"` | `toggleTheme()` |
| `pvCalculatorData` | Full form state + appliances (manual save) | `saveToLocalStorage()` |
| `pvCalculatorAutoSave` | Appliances array (auto-save on every add) | `saveToLocalStorageAuto()` |

**v3.0.0 localStorage migration:** On first load, old keys are migrated to new format. Config objects now include `locationProfile`, `phaseType`, `frequency`, and `inverterMarket` fields. Old `location` values are mapped to the corresponding REGION_PROFILES key.

### 2.6 External Dependencies

- **jsPDF 2.5.1** (vendored locally in `vendor/jspdf.umd.min.js`, copied to `dist/web/assets/vendor/`, and inlined into the standalone artifact) -- Used exclusively for PDF export. The build now prefers the local vendored copy so fully offline PDF export works by default.

---

## 3. User Interface Structure

### 3.1 Tab-Based Results Layout

After clicking "Calculate System Design", the right column renders 12 tabs:

| Tab | Render Method | Lines | Content |
|-----|---------------|-------|---------|
| Overview | `renderOverviewTab()` | 6262-6813 | Full SVG system diagram + component spec sheets |
| Load | `renderLoadTab()` | 6814-6856 | Power/energy breakdown, daytime/nighttime split |
| Inverter | `renderInverterTab()` | 6857-7187 | Three-tier sizing (Conservative/Recommended/Optimized), stagger option, market range, manual tier verification |
| Battery | `renderBatteryTab()` | 7188-7246 | Capacity, chemistry, charge/discharge rates, kWh |
| Batt Config | `renderBatteryConfigTab()` | 7247-7483 | Visual SVG battery bank layout, series/parallel wiring |
| PV Array | `renderPVTab()` | 7708-7848 | Panel count, string config, voltage/current, derating |
| PV Config | `renderConfigTab()` | 7996-8177 | Configuration comparison table, scoring, pros/cons, multi-MPPT distribution |
| Cables | `renderCablesTab()` | 7849-7928 | DC and AC cable runs with AWG, mm2, ampacity, voltage drop |
| Protection | `renderProtectionTab()` | 8425-8462 | PV side, battery side, AC side, earthing devices |
| Losses | `renderLossesTab()` | 8463-8541 | Efficiency chain breakdown, energy margin |
| Upgrade | `renderUpgradeTab()` | 8343-8388 | Battery, PV, inverter, cable/breaker, load growth paths |
| Advisory | `renderAdvisoryTab()` | 8389-8424 | Dynamic severity advisories (critical/warning/info) |

### 3.2 Appliance Entry Form

**Input fields:** Name, Quantity, Power (W), Daily Hours, Duty Cycle (%), Load Type (resistive/electronic/motor/mixed), Motor Sub-Type (16 categorized subtypes in 4 optgroups — see Section 5.1), Motor Start Method (DOL/soft-start/VFD), Surge Factor, Power Factor, Daytime Usage (%), Simultaneous checkbox.

**Auto-detection:** Typing an appliance name triggers `autoDetectAppliance()` (Line 5269) which regex-matches against `APPLIANCE_PRESETS` and auto-fills all fields including motor sub-type. A styled hint box shows detection results.

**Edit mode:** Clicking "Edit" on an existing appliance populates the form and changes the button to "Update Appliance" (amber). The `editingIndex` property tracks which appliance is being edited.

### 3.3 Equipment Specifications Section

**Mode Toggle (Line 929):** Switches between Auto-Suggest (panel specs auto-filled from wattage presets, MPPT specs auto-filled from inverter VA) and Manual Input (user enters all specs, calculator validates against requirements).

**Panel Validation (Line 4416):** Real-time check that `Vmp * Imp` equals rated wattage within 3% tolerance, `Vmp < Voc`, `Imp < Isc`, ratio sanity checks.

**Multi-MPPT Support (Lines 1017-1097):** Up to 3 MPPT inputs with independent specs per input. Additional MPPT sections shown/hidden via `toggleMultiMPPT()`.

### 3.4 SVG System Overview

The Overview tab (Line 6262) renders a **dynamically sized SVG diagram** showing:

- Full panel grid with individual panels, series wires, parallel bus bars, string labels
- PV DC Isolator breaker
- MPPT controller (or hybrid inverter with built-in MPPT sub-boxes)
- Battery bank with every individual battery unit, series/parallel wiring, terminal symbols
- Battery DC MCCB and AC MCB breakers
- AC loads box
- Wire labels with cable sizes (mm2)
- Voltage, current, and power annotations at every junction

Two rendering paths: **off-grid** (separate MPPT + inverter boxes) and **hybrid** (combined inverter with MPPT sub-box). Battery rendering adapts dimensions when `parallelStrings > 3` for compact display.

**Mixed battery bank grid:** When `battery.isMixedBank && battery.mixedBankData`, the SVG Overview uses `battGridCols = mixedBankData.totalUnits` and `battGridRows = 1` (single row with all units). Each battery box shows its individual Ah with group-specific fill colors. Both hybrid and off-grid rendering paths support this layout.

---

## 4. Calculation Pipeline (12-Phase Design Process)

### Phase 0: Configuration (`DEFAULTS` constant, Lines 1365-1620)

**What it does:** Defines all system constants, specifications, and presets used throughout the calculation pipeline.

**Key data structures:**

- `REGION_PROFILES` (Lines 1367-1396): 12 regional profiles (lagos_ng, nairobi_ke, accra_gh, us_south, us_north, brazil, eu_central, eu_south, india, uae, australia, generic) with acVoltage, frequency, phaseType, inverterMarket, avgPSH, temps, climate, regulatoryNote, optional gridNote
- `BATTERY_SPECS` (Lines 1399-1444): Chemistry-specific specs for LiFePO4, AGM, Gel, FLA -- including maxDoD, cycleLife, charge/discharge efficiency, max charge/discharge rate (C-rate), self-discharge, cell voltage
- `LOAD_TYPES` (Lines 1447-1452): Default surge factor and power factor per load type. Motor default changed from 6.0x to **4.0x** (sensible unknown default, not worst-case)
- `MOTOR_START_SURGE` (Lines 1455-1459): DOL=6.0x, Soft-start=3.0x, VFD=1.5x
- `MOTOR_SUBTYPES` (Lines 2011-2030): **16 categorized motor subtypes** (expanded from original 6) with per-type efficiency, surge factor, power factor, start method, and descriptive hint. Categories: **Sewing** (clutch, servo), **Compressor** (compressor_inverter, compressor_modern, compressor_old, compressor_unknown), **Pump** (pump_softstart, pump_surface, pump_submersible, pump_deepwell, pump_unknown), **Other** (fan, washing_machine, blender, general). Surge factors range from 1.5x (servo) to 6.0x (deep well pump)
- `APPLIANCE_PRESETS` (Lines 2034-2064): Regex-keyed auto-detection presets with wattage, load type, start method, surge, PF, duty cycle, hours, **motorSubType**, and detailed hint text. **Variant-specific patterns** placed before generic patterns (first-match-wins): inverter fridge (2.0x), old fridge (5.0x), generic fridge (4.0x), submersible pump (5.0x), deep well pump (6.0x), surface pump (3.5x), soft-start pump (2.5x), and more. Covers sewing machines (servo/industrial/domestic), refrigerator variants, freezer variants, AC (conventional + inverter), pump variants, washing machine, fan, blender, LED/lights, TV, laptop, charger, router, decoder, iron, kettle, microwave, toaster, heater
- `PANEL_PRESETS` (Lines 1501-1518): Electrical specs (Vmp, Voc, Imp, Isc, tempCoeff) for 50W through 700W panels
- `MPPT_PRESETS` (Lines 1521-1535): MPPT specs keyed by inverter VA rating (1000VA through 15000VA)
- `INVERTER_SIZES` (Line 1538): Standard sizes array: 300 through 15000 VA
- `INVERTER_MARKET_RANGE` (Lines 1543-1562): Maps calculated size to [min, max] VA range (market-aware via `INVERTER_MARKET` constant)
- `DC_VOLTAGE_THRESHOLDS` (Lines 1565-1569): 12V up to 1500VA, 24V up to 3000VA, 48V up to 15000VA
- `MAX_DC_CURRENT` (Lines 1572-1576): Safety limits per bus voltage (12V=150A, 24V=200A, 48V=250A)
- `AWG_DATA` (Lines 1579-1592): AWG 14 through 4/0 with mm2 cross-section and ampacity (free air / conduit)
- `METRIC_CABLE_SIZES` (Line 1595): 1.5mm2 through 240mm2
- `METRIC_CABLE_AMPACITY` (Lines 1598-1602): IEC 60364 ampacity per metric size
- System constants (Lines 1607-1619): Copper resistivity (0.0217), STC temp (25C), NEC factor (1.25), inverter derating (0.80), efficiency (0.93), MPPT efficiency (0.98), voltage drop targets (DC 3%, AC 2%), soiling loss (3%), mismatch loss (2%), cable loss (2%), Voc headroom (3%). Note: `NEC_CONTINUOUS_FACTOR` renamed to `CONTINUOUS_LOAD_FACTOR` (value unchanged 1.25)

---

### Phase 1: Load Engine (`LoadEngine`, Lines 1626-1715)

**What it does:** Performs per-appliance electrical calculations. Stateless math functions operating on individual appliance objects.

**Key methods:**

| Method | Inputs | Output | Formula |
|--------|--------|--------|---------|
| `calculateRealPower()` | appliance | Watts | `(ratedPowerW * quantity) / efficiency` |
| `calculateApparentPowerVA()` | appliance | VA | `realPower / powerFactor` |
| `calculateStartingVA()` | appliance | VA | `apparentPower * surgeFactor` |
| `calculateDailyEnergyWh()` | appliance | Wh | `realPower * hours * (dutyCycle / 100)` |
| `calculateOperatingCurrent()` | appliance, voltage | Amps | `apparentPower / voltage` |
| `validateAppliance()` | appliance | error[] | Range checks on all fields |
| `getSummary()` | -- | object | Count of total, AC, motor, simultaneous loads |

**Data store:** `LoadEngine.appliances` array holds all user-entered appliances. Modified by `addAppliance()`, `removeAppliance()`, `clearAllAppliances()`, and `loadSampleAppliances()`.

---

### Phase 2: Aggregation Engine (`AggregationEngine`, Lines 1721-1889)

**What it does:** Aggregates all appliance data into system-level totals. Performs two distinct surge calculations (worst-case and staggered), detects industrial usage patterns, assesses compliance risk, and generates servo upgrade advice.

**Key inputs:** `LoadEngine.appliances` array, `config` object.

**Key outputs:**

- `totalRealPowerW`, `totalApparentPowerVA`, `dailyEnergyWh`
- `daytimeEnergyWh`, `nighttimeEnergyWh` (split by `daytimeRatio`)
- `peakSimultaneousVA` (simultaneous + largest non-simultaneous)
- `highestSurgeVA` (worst-case: ALL motors surge simultaneously)
- `designStaggeredSurgeVA` (staggered: only dominant motor surges)
- `dominantMotor` (name, watt, surgeVA, surgeFactor of the largest motor)
- `complianceRisk` ("low" / "medium" / "high") with `complianceNote`
- `servoUpgradeAdvice` (estimated energy savings and surge reduction from clutch-to-servo upgrade)
- `hasIndustrialSewing`, `hasCompressor`, `industrialMotorCount`, `clutchMotorCount`, `servoMotorCount`

**Compliance risk logic (Lines 1823-1839):**

- **High:** Industrial sewing + compressor, or 2+ industrial motors
- **Medium:** Industrial sewing alone, or compressor + 2+ motors, or clutch + compressor
- **Low:** Everything else

**Industrial detection:** Motor appliances with `isIndustrialSewing` flag (set when sewing machine >400W) or `ratedPowerW > 400`.

**Servo upgrade advice (Lines 1842-1854):** When clutch motors + industrial sewing detected, estimates 40% energy savings and 65% surge reduction from switching to servo motors, with Naira cost indication.

---

### Phase 3: Inverter Sizing Engine (`InverterSizingEngine`, Lines 1895-2110)

**What it does:** Computes a **three-tier inverter recommendation** -- Conservative (worst-case surge), Recommended (compliance-aware balanced), and Optimized (staggered motor starts) -- with market range formatting and industrial floor enforcement.

**Three-tier system:**

1. **Conservative (`recommendedSizeVA`):** Based on `designContinuousVA / INVERTER_DERATING`, upsized if worst-case surge exceeds `size * surgeMultiplier`
2. **Recommended (`recommendedBalancedSizeVA`):** Midpoint surge with compliance buffer. For high compliance risk, biases 80% toward conservative. Applies `industrialMinVA` floor (3000VA for industrial sewing, 3500VA with compressor, 5000VA for 3+ industrial motors)
3. **Optimized (`staggeredSizeVA`):** Assumes user staggers motor starts by 30+ seconds. Uses only the dominant motor's surge delta

**Market range formatting (Line 1900):** `formatMarketRange(va, market)` is now market-aware. Uses `activeMarket` fallback when no market argument is provided. Returns VA range reflecting store availability for the active inverter market (Emerging, EU, US).

**DC bus voltage selection (Lines 1923-1930):** Automatic based on inverter VA using `DC_VOLTAGE_THRESHOLDS`. Warns when DC current exceeds 80% of bus limit.

**Manual override support (Lines 5750-5818):** In manual mode, user can specify inverter VA and DC voltage. Calculator validates against requirements and warns on undersizing, surge capability issues, and impractical voltage/size combinations (e.g., 12V with 5000VA).

**Compliance-aware buffer (Lines 1973-1991):**

| Motor Count | Base Buffer | Compliance Risk High | Compliance Risk Medium |
|-------------|-------------|---------------------|----------------------|
| 0 motors | 0% | -- | -- |
| 1 motor | 10% | 35% | 25% |
| 2 motors | 20% | 35% | 25% |
| 3+ motors | 30% | 35% | 25% |

---

### Phase 4: Battery Sizing Engine (`BatterySizingEngine`, Lines 2116-2215)

**What it does:** Calculates battery bank capacity, series/parallel configuration, and validates discharge rates -- all chemistry-aware.

**Capacity calculation flow:**

1. `usableCapacityWh = (dailyEnergyWh * autonomyDays) / dischargeEfficiency`
2. `totalCapacityWh = usableCapacityWh / maxDoD`
3. Apply self-discharge loss for autonomy period
4. Apply design margin (default 125%)
5. Convert to Ah at bank voltage: `totalCapacityAh = totalCapacityWh / bankVoltage`
6. Check C-rate: if `peakLoadCurrent > totalCapacityAh * maxDischargeRate`, increase Ah
7. Select nearest standard Ah from `STANDARD_AH_RATINGS`
8. Calculate parallel strings: `ceil(totalCapacityAh / selectedAh)`

**Chemistry-specific DoD and C-rates:**

| Chemistry | Max DoD | Max Charge Rate | Max Discharge Rate | Charge Eff | Discharge Eff |
|-----------|---------|-----------------|--------------------|-----------|--------------|
| LiFePO4 | 80% | 0.50C | 1.00C | 97% | 98% |
| AGM | 50% | 0.15C | 0.25C | 88% | 92% |
| Gel | 50% | 0.10C | 0.20C | 87% | 91% |
| FLA | 50% | 0.10C | 0.20C | 85% | 90% |

**Battery unit count override (Lines 5824-5860):** User can specify exact number of battery units. Calculator adjusts total capacity, discharge/charge currents, and warns if undersized vs auto-suggestion.

**kWh input (Lines 1206-1217):** Optional kWh field for lithium batteries auto-converts to Ah based on bank voltage.

---

### Phase 5: PV Array Engine (`PVArrayEngine`, Lines 2221-2392)

**What it does:** Calculates required panel count, series/parallel configuration, cold-temperature Voc, power derating, and daily energy production. Optionally accounts for daytime load power.

**Panel count calculation:**

1. `requiredPVEnergy = dailyEnergyWh / systemEfficiency`
2. If "Size PV for daytime loads" checked: add `daytimeEnergyWh / systemEfficiency`
3. Add battery recharge energy: `usableCapacityWh / chargeEfficiency / autonomyDays`
4. Apply design margin
5. `requiredWattage = requiredPVEnergy / avgPSH`
6. Apply temperature derating: `requiredWattage /= (1 + tempCoeffPmax/100 * (Tmax - 25))`
7. `panelsRequired = ceil(requiredWattage / panelWattage)`

**String configuration:**

- Cold Voc: `vocCold = panel.voc * (1 + tempCoeffVoc/100 * (Tmin - 25))`
- Max series (Voc limit): `floor((mppt.maxVoltage * 0.97) / vocCold)`
- Max series (Vmp limit): `floor(mppt.maxOperatingVoltage / panel.vmp)`
- Min series: `max(1, ceil(max(bankVoltage * 1.2, mppt.minVoltage) / panel.vmp))`
- Hard block if `maxSeries < minSeries`
- Optimal series: `min(maxSeries, max(minSeries, floor(sqrt(panelsRequired))))`
- Parallel strings: `ceil(panelsRequired / panelsInSeries)`
- Current validation: if `arrayIsc > mppt.maxCurrent`, reduce parallel strings

**Daytime load analysis (Lines 2244-2251):** When enabled, PV array is sized to simultaneously power daytime loads AND charge battery. The checkbox at Line 1116 controls this.

---

### Phase 6: MPPT Validation (`ChargeControllerValidator`, Lines 2398-2459)

**What it does:** Validates the final PV array configuration against MPPT controller limits. Issues hard blocks for safety-critical violations and warnings for marginal headroom.

**Validation checks:**

| Check | Pass Condition | Hard Block Threshold | Warning Threshold |
|-------|---------------|---------------------|-------------------|
| Voltage | `stringVocCold <= mppt.maxVoltage` | Exceeds max | <5% headroom |
| Current | `arrayIsc * 1.25 <= mppt.maxCurrent` | Exceeds max (with NEC factor) | -- |
| Power | `arrayWattage <= mppt.maxPower * 1.3` | -- | Exceeds 130% of max |

**Outputs:** `isValid` boolean, individual check results, voltage/current headroom percentages.

---

### Phase 7: Cable Sizing Engine (`CableSizingEngine`, Lines 2465-2727)

**What it does:** Sizes all DC and AC cable runs for both voltage drop compliance and ampacity rating. Provides AWG, metric mm2, and market-standard metric equivalents.

**Cable runs calculated:**

1. **PV String Cable** (per string): `Isc * 1.25`, string Vmp, DC 3% drop target
2. **PV Array to MPPT**: `arrayIsc * 1.25`, string Vmp, DC 3% drop target
3. **MPPT to Battery**: `min(mppt.maxChargeCurrent, battery.maxChargeCurrent) * 1.25`, bank voltage, DC 1.5% drop target
4. **Battery to Inverter**: `dcInputCurrentSurge * 1.25`, bus voltage, DC 1.5% drop target
5. **Inverter AC Output**: `continuousVA / acVoltage * 1.25`, AC voltage, AC 2% drop target

**Voltage drop formula:** `minAreaMm2 = (current * 0.0217 * length * 2) / allowedDropV`

**Cable selection process:**

1. Calculate minimum mm2 from voltage drop
2. Find AWG that meets both voltage drop and ampacity
3. If none sufficient, calculate parallel cable runs
4. Map to nearest standard metric size via `findMarketMetricSize()`
5. Verify metric cable ampacity, upsize if needed
6. Calculate actual voltage drop with selected cable
7. Provide `sizeRangeDisplay` string (e.g., "6 - 10mm2")

**Market metric sizing (Lines 2469-2501):** Maps computed mm2 to the next available market standard size and finds closest AWG equivalent for cross-reference.

---

### Phase 8: Protection Engine (`ProtectionEngine`, Lines 2733-2994)

**What it does:** Designs complete protection scheme for PV side, battery side, AC side, and earthing per IEC/NEC standards.

**Standard device sizes:**

- MCCB: 16 through 400A (15 standard sizes)
- MCB: 6 through 63A (9 standard sizes)
- DC Fuse (Class T/ANL): 30 through 600A (16 standard sizes)

**PV Side Protection:**

- **String Fuses** (required when parallel strings > 1): `ceil(arrayIsc/strings * 1.56 / 5) * 5`
- **PV DC Isolator**: `ceil(arrayIsc * 1.25)` rounded to next MCB size, rated for `Voc(cold) + 50V`
- **PV DC SPD**: Type 2, rated for `Voc(cold) * 1.2`
- **Combiner Box**: Required when parallel strings > 2

**Battery Side Protection:**

- **DC MCCB**: `maxDischargeCurrent * 1.25` rounded to next MCCB size
- **Battery Fuse (backup)**: `MCCB rating * 1.5` rounded to next DC fuse size (Class T/ANL)
- **BMS**: Required for LiFePO4, with capacity and cell count specification

**AC Side Protection:**

- **Inverter Output MCB**: `continuousVA / acVoltage * 1.25` rounded to next MCB size
- **AC SPD**: Type 2
- **AVR**: Sized at `continuousVA * 1.2`, selected from standard AVR sizes (1kVA through 30kVA)

**Earthing:**

- Equipment earth: 6mm2 minimum copper to all metallic enclosures
- Earth electrode: Copper-bonded steel rod, target <10 ohm

**Manual breaker support (Lines 2803-2943):** When user enters manual breaker ratings, calculator validates against computed minimums and warns on undersizing or oversizing (>200% of recommended).

---

### Phase 9: System Losses (`SystemLossEngine`, Lines 3000-3053)

**What it does:** Calculates comprehensive efficiency chain from PV array to AC loads.

**Loss components:**

| Component | Source | Typical Value |
|-----------|--------|--------------|
| PV Temperature Derating | `abs(tempCoeffPmax/100 * (Tmax - 25))` | 3.5% (Lagos) |
| PV Soiling Loss | `DEFAULTS.PV_SOILING_LOSS` | 3% |
| PV Mismatch Loss | `DEFAULTS.PV_MISMATCH_LOSS` | 2% |
| DC Cable Loss | `DEFAULTS.CABLE_LOSS_FACTOR` | 2% |
| MPPT Efficiency | `DEFAULTS.MPPT_EFFICIENCY` | 98% |
| Battery Round-Trip | `chargeEff * dischargeEff` | 95% (LiFePO4), 81% (AGM) |
| Inverter Efficiency | `DEFAULTS.INVERTER_EFFICIENCY` | 93% |
| AC Cable Loss | `CABLE_LOSS_FACTOR / 2` | 1% |

**Overall system efficiency:** `(1 - totalDCLosses) * batteryRoundTrip * inverterEff * (1 - acCableLoss)`

**Energy margin:** `((netAvailableEnergy - loadRequirement) / loadRequirement) * 100`

---

### Phase 10: Upgrade Path Engine (`UpgradeSimulator`, Lines 3061-3282)

**What it does:** Generates comprehensive upgrade analysis across 5 categories, with feasibility assessment and specific recommendations.

**Categories analyzed:**

1. **Battery Expansion (Lines 3079-3118):** Shows how many parallel strings can be added (chemistry-limited: LiFePO4 max 6, lead-acid max 4). Calculates new Ah, kWh, usable kWh, and autonomy hours for each addition level.

2. **PV Array Expansion (Lines 3120-3172):** Calculates remaining MPPT capacity, suggests panel additions within current MPPT limits. Uses `ConfigurationComparisonEngine.compare()` to find best config for each expansion level. Suggests adding external MPPT when approaching limits.

3. **Inverter Capacity (Lines 3174-3205):** Shows current utilization percentage, recommends upgrades when >70% utilized, lists available upgrade sizes with new utilization and headroom.

4. **Cables and Protection (Lines 3207-3238):** Assesses whether cable and breaker upgrades are needed for each expansion scenario.

5. **Load Growth Scenarios (Lines 3240-3278):** Simulates adding common appliances (AC, iron, washing machine, microwave, desktop). Checks inverter surge, battery sufficiency, and PV adequacy for each.

**Battery parallel limits:**

| Chemistry | Max Parallel | Reason |
|-----------|-------------|--------|
| LiFePO4 | 6 | BMS synchronization limit |
| AGM | 4 | Current imbalance risk |
| Gel | 4 | Overcharge sensitivity |
| FLA | 4 | Maintenance impracticality |

**Upgrade Simulator UI (Lines 889-918, 5020-5087):** Interactive form for user-defined load simulation. Calls `UpgradeSimulator.simulateLoadAddition()` and displays whether the current system can accommodate the new load or what upgrades are required.

---

### Phase 11: Output Generation (`OutputGenerator`, Lines 4299-4343)

**What it does:** Assembles the complete system report object and collects all warnings and hard blocks from every phase.

**Report structure:**

```javascript
{
  meta: { generatedAt, version: '2.0.0' },
  summary: { totalDailyEnergy, peakLoad, inverterSize, batteryCapacity, pvArraySize, totalPanels },
  details: { /* all phase results */ },
  warnings: [ /* aggregated from all phases */ ],
  blocks: [ /* aggregated hard blocks */ ]
}
```

**Warning aggregation:** Collects from `inverter.warnings`, `battery.warnings`, `pvArray.warnings`, `mpptValidation.warnings`, `cables.warnings`, `protection.warnings`.

**Block aggregation:** Collects from `inverter.blocks`, `battery.blocks`, `pvArray.blocks`, `mpptValidation.blocks`, `cables.blocks`.

---

### Phase 12: Defense Notes (`DefenseNotes`, Lines 4349-4369)

**What it does:** Aggregates all hard blocks and their associated suggestions into a single defense report. Hard blocks are displayed prominently at the top of the results as red alert boxes.

**Hard block sources:**

- DC current exceeding bus voltage limits
- Cold Voc exceeding MPPT maximum voltage
- Array Isc exceeding MPPT maximum current
- Battery discharge current exceeding safe limits
- Incompatible string configuration (min series > max series)
- Manual inverter undersized below continuous load

---

## 5. Key Features

### 5.1 Adaptive Surge Multiplier System (Lines ~2011-2030)

**16 categorized motor sub-types** organized in 4 optgroups with context-aware, justified surge factors. Replaces the previous flat 6-type system with blind worst-case oversizing.

**Design philosophy:** Motors determine inverter size. Energy determines battery & PV. Surge is contextual, not fixed. Accuracy > blind oversizing.

**Sewing Machine:**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| Clutch | 60% | 4.0x | 0.70 | DOL |
| Servo | 90% | 1.5x | 0.85 | VFD |

**Compressor (Fridge/Freezer/AC):**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| Compressor — Inverter | 92% | 2.0x | 0.85 | VFD |
| Compressor — Modern ≤7yr | 85% | 3.5x | 0.75 | DOL |
| Compressor — Old >7yr | 75% | 5.0x | 0.65 | DOL |
| Compressor — Unknown Age | 80% | 4.0x | 0.70 | DOL |

**Pump:**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| Pump — Soft Start/VFD | 85% | 2.5x | 0.80 | Soft Start |
| Pump — Surface ≤1HP | 80% | 3.5x | 0.75 | DOL |
| Pump — Submersible | 78% | 5.0x | 0.70 | DOL |
| Pump — Deep Well/Borehole | 75% | 6.0x | 0.65 | DOL |
| Pump — Unknown | 78% | 5.0x | 0.70 | DOL |

**Other Motors:**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| Fan/Blower | 85% | 2.5x | 0.70 | DOL |
| Washing Machine | 80% | 3.5x | 0.65 | DOL |
| Blender/Mixer | 80% | 4.0x | 0.70 | DOL |
| General Motor | 85% | 4.0x | 0.70 | DOL |

Motor sub-type is **required** for motor loads. The form blocks submission without it.

**Surge severity color coding** in both the dropdown hint and appliance table:
- Green (≤2.0x): Low surge — smooth start (inverter compressors, servo motors)
- Yellow (≤3.5x): Moderate surge (modern compressors, surface pumps, washing machines)
- Orange (≤4.0x): High surge (unknown motors, blenders, general)
- Red (>4.0x): Very high surge (old compressors, submersible/deep well pumps)

**Motor sub-type dropdown** uses `<optgroup>` elements for organized selection with surge multiplier visible in each option label (e.g., "Compressor — Inverter (2.0x surge)").

### 5.1a Inverter Technology Modifier

New select field `inverterTechnology` in the inverter configuration area:

| Technology | Surge Tolerance | Description |
|-----------|----------------|-------------|
| Unknown / Default | 2.0x | Conservative assumption |
| Transformer-based / Low-frequency | 2.5x | Better surge handling due to transformer mass |
| Transformerless / High-frequency | 2.0x | Standard surge handling |

**Integration:**
- Selecting transformer automatically sets surge multiplier to 2.5x; others set 2.0x
- In `getConfig()`: reads `inverterTechnology` field
- In `ManagedModeEngine`: transformer-based inverters get a 5% favorable risk shift (`techBonus = 0.05` applied to managed-vs-user ratio)
- Return object includes `inverterTechnology` and `techNote` fields

**Output-Layer Visibility (3 locations):**

The inverter technology selection is surfaced in 3 output areas so the user sees their selection's impact:

1. **Inverter Tab** (~line 11235): Shows selected technology label and surge tolerance factor with color-coded border. Transformer = green ("More tolerant to motor start"), Transformerless = amber ("Tighter overload window"), Unknown = grey ("Select your inverter type for accurate surge tolerance").

2. **Managed Practical Section** (~line 11148): Motor-conditional technology constraint tag. Only renders when `managedMotorCount > 0`. Transformer = green tag ("Managed option valid — 2.5x surge tolerance"), Transformerless = amber warning ("Higher probability of overload during motor start. Avoid simultaneous pump + compressor start"), Unknown = grey prompt to select technology.

3. **Advisory Tab** (~line 5807 in SmartAdvisoryEngine): Motor-conditional advisory only generated when `totalMotorCount >= 1`. Category: "Inverter Technology". Transformer = severity 'info' ("Good Motor Surge Handling"), Transformerless = severity 'warning' ("Tighter Overload Tolerance"), Unknown = severity 'info' ("Inverter Technology Not Specified"). Motor count is reported in each message.

### 5.2 Industrial Sewing Machine Detection (Lines 5401-5407)

Appliances matching `/sew/i` with `ratedPowerW > 400` are flagged as `isIndustrialSewing`. This triggers:

- Higher compliance risk assessment
- Industrial minimum inverter floors (3000-5000 VA)
- Servo upgrade advice in Aggregation Engine
- Specific warnings about stagger timing with compressors

### 5.3 Compliance Risk Assessment (Lines 1822-1839)

Three levels: low, medium, high. Affects the compliance buffer added to the Recommended inverter tier. High risk (industrial sewing + compressor) adds 20% compliance buffer and biases midpoint surge 80% toward worst-case.

### 5.4 Appliance Auto-Detection with Adaptive Surge (Lines ~2034-2064, ~9028-9050)

Regex-based matching against `APPLIANCE_PRESETS`. The preset system uses regex patterns as keys (e.g., `'sewing.*servo|servo.*sewing|servo.*machine'`). Order matters -- **variant-specific patterns are listed before generic patterns** (first-match-wins). When matched, all form fields are populated including the new `motorSubType` field, and a styled hint box shows detection details.

**Adaptive surge detection examples:**
- Typing "inverter fridge" → matches `compressor_inverter` → 2.0x surge (green)
- Typing "fridge" → matches `compressor_unknown` → 4.0x surge (orange)
- Typing "old fridge" → matches `compressor_old` → 5.0x surge (red)
- Typing "deep well pump" → matches `pump_deepwell` → 6.0x surge (red)
- Typing "pump" → matches `pump_unknown` → 5.0x surge (red)

The `autoDetectAppliance()` function reads `bestMatch.motorSubType` from the preset and sets the dropdown accordingly, triggering `onMotorSubTypeChange()` to display a contextual hint with surge-severity color coding and tips.

### 5.5 Battery Unit Count Override (Lines 1196-1204, 5824-5860)

User can manually specify the number of battery units (e.g., "1" for a single 200Ah unit, "2" for two in parallel). Calculator adjusts total capacity, recalculates discharge/charge limits, and warns if undersized vs auto-suggestion.

### 5.6 PV Array 5-Tier Advisory (Lines 4107-4162)

Dynamic advisory based on `pvToLoad` ratio (array wattage vs required wattage):

| Ratio | Severity | Label |
|-------|----------|-------|
| >1.5 | info | Oversized by X% |
| 1.3-1.5 | info | Well-Sized (+X% headroom) |
| 1.0-1.3 | warning | Tight (+X% headroom) |
| 0.8-1.0 | warning | Undersized (X% short) |
| <0.8 | critical | Critically Undersized |

Each tier includes cloudy day resilience estimate (25% output), expansion headroom, and actionable recommendations.

### 5.7 MPPT Clipping Advisory (Lines 4164-4178)

When `arrayWattage > mppt.maxPower`, calculates clipped wattage and percentage. Below 15% clipping is noted as beneficial (better low-light performance). Above 15% warns about wasted capacity.

### 5.8 Daytime Load Analysis (Lines 3999-4054)

Two modes based on "Size PV for daytime loads" checkbox:

- **Enabled:** Shows PV power split between daytime loads and battery charging. Calculates net charge power, effective charge current, and whether battery can fully recharge in one sunny day.
- **Disabled:** Shows theoretical best-case (no loads) vs reality (loads steal PV power). Warns if loads consume most PV output during sunshine.

### 5.9 Market-Aware Inverter Sizing (Lines 1543-1562, 1900-1906)

`InverterSizingEngine.selectInverterSize(va, market)` and `formatMarketRange(va, market)` are now market-aware, selecting from the `INVERTER_MARKET` constant (EMERGING_OFFGRID, EU_SINGLE_PHASE, US_SPLIT_PHASE) with sizes and market ranges appropriate to each. `activeMarket` is stored during `calculate()` for render-time calls. Example: in Emerging market, 2400VA maps to "2400-2500 VA"; in EU market, different size ranges apply.

### 5.10 Manual Mode Tier Verification (Lines 6857-7187, Inverter Tab)

In manual mode, the Inverter tab shows the user's selected size compared against all three auto-calculated tiers with tick/cross indicators showing whether the manual selection meets each tier's requirements.

### 5.11 Stagger Motor Starts Option (Lines 5904-5911, 5729-5742)

When 2+ motors present, UI offers a "Stagger Motor Starts" checkbox. When checked, the calculator uses the optimized (staggered) inverter tier instead of conservative, reduces required surge VA, and recalculates DC currents accordingly.

### 5.12 Servo Upgrade Advice (Lines 1842-1854, 2067-2069)

When clutch motors are detected alongside industrial sewing, generates specific advice: estimated energy savings (40%), surge reduction (65%), and approximate Naira cost.

### 5.13 Configuration Comparison Engine (Lines 3289-3579)

Generates and scores ALL valid panel configurations (series x parallel) for a given panel count. Each configuration is scored based on:

- Voc headroom (30% weight)
- Current headroom (30% weight)
- Power utilization proximity to 70% sweet spot (20% weight)
- Panel count deviation penalty (10 points per extra/missing panel)

Also includes `findNearbyValidConfig()` (Lines 3429-3523) that searches nearby panel counts when no valid config exists for the exact count requested.

### 5.14 Multi-MPPT Panel Distribution (Lines 3586-3859)

For systems with 2-3 MPPT inputs, `MultiMPPTDistributor` generates candidate distributions:

- Even split across MPPTs
- Weighted by MPPT power capacity
- Maximum on primary, rest on secondary
- Offset variations (+/- 1-3 panels between MPPTs)

Each distribution is scored, and the best valid configuration per MPPT is found independently.

### 5.15 Smart Advisory Engine (Lines 3866-4293)

Generates practical, installer-level advice across categories:

- **Load Management:** Multiple motor warnings, heavy motor scheduling, heavy load stagger advice
- **Heating Appliances:** Electric cooker prohibition on solar, iron/heater peak-sun-only rules, heavy resistive load warnings
- **Battery:** Limited storage guidance, operation guide, DoD guidance, chemistry-specific advice (AGM heat/sulfation, Gel voltage sensitivity, FLA maintenance, LiFePO4 low maintenance)
- **Charge Time:** Dynamic estimate based on daytime load checkbox, shows PV power split between loads and charging
- **W vs VA Explanation:** When watts differ significantly from VA, explains reactive power for non-technical users
- **PV Array:** 5-tier sizing advisory, MPPT clipping, seasonal/weather performance, panel mismatch
- **Daily Routine:** Generates time-specific schedule based on detected heavy loads (AC, pump, washing machine, iron)
- **Sun Weakening:** 4:00pm cutoff warning for heavy loads

### 5.16 Panel Mismatch Analysis (Lines 4684-4732)

When "Mixed Panel Wattages" is enabled in manual mode, user enters comma-separated wattages. Calculator computes spread percentage and classifies:

- <=5%: Acceptable (industry standard)
- 5-10%: Marginal (5-8% energy loss expected)
- >10%: Excessive (recommends separate strings or dual MPPT)

### 5.17 Dark Mode (Lines 40-97, 4382-4410)

Toggle between light and dark themes. Saved to localStorage as `pv-theme`. Affects all CSS variables, alert backgrounds, header gradient, and input styling. Toggle button shows moon/sun icon.

### 5.18 Export Options

- **Print** (Line 6249): `window.print()` with `.no-print` elements hidden
- **PDF** (Lines 5092-5172): Uses jsPDF to generate downloadable PDF with system summary, configuration, and top 5 warnings
- **JSON** (Lines 8561-8579): Full report object as downloadable JSON file

---

## 6. Constants and Configuration

### 6.1 DEFAULTS Object (Lines 1365-1620)

Comprehensive constant repository. All values are referenced by their full path (e.g., `DEFAULTS.BATTERY_SPECS.lifepo4.maxDoD`).

**Key constant groups:**

| Group | Lines | Entries | Purpose |
|-------|-------|---------|---------|
| `REGION_PROFILES` | 1367-1396 | 12 profiles | Regional climate, voltage, phase, market presets |
| `BATTERY_SPECS` | 1399-1444 | 4 chemistries | Full battery characteristics |
| `LOAD_TYPES` | ~1997-2002 | 4 types | Default surge/PF (motor default 4.0x) |
| `MOTOR_START_SURGE` | ~2005-2009 | 3 methods | DOL/soft-start/VFD multipliers |
| `MOTOR_SUBTYPES` | ~2011-2030 | **16 types** | Categorized motor subtypes with adaptive surge (1.5x-6.0x) |
| `APPLIANCE_PRESETS` | ~2034-2064 | **35+ patterns** | Auto-detection presets with motorSubType, variant-specific patterns |
| `PANEL_PRESETS` | 1501-1518 | 17 wattages | 50W-700W panel specs |
| `MPPT_PRESETS` | 1521-1535 | 13 sizes | 1kVA-15kVA MPPT specs |
| `INVERTER_SIZES` | 1538 | 18 sizes | Standard VA ratings |
| `INVERTER_MARKET_RANGE` | 1543-1562 | 18 mappings | Market-aware VA ranges |
| `DC_VOLTAGE_THRESHOLDS` | 1565-1569 | 3 voltages | Auto bus voltage selection |
| `MAX_DC_CURRENT` | 1572-1576 | 3 limits | Safety current limits |
| `AWG_DATA` | 1579-1592 | 12 gauges | AWG 14 to 4/0 specs |
| `METRIC_CABLE_SIZES` | 1595 | 15 sizes | 1.5-240mm2 |
| `METRIC_CABLE_AMPACITY` | 1598-1602 | 15 ratings | IEC 60364 ampacity |
| `STANDARD_AH_RATINGS` | 1605 | 11 sizes | 50-300Ah |
| System constants | 1607-1619 | 13 values | Engineering constants |

---

## 7. Data Flow

```
User adds appliances
    |
    v
LoadEngine.appliances[] (per-appliance data store)
    |
    v
AggregationEngine.calculate() --> aggregation object
    |                                 (totals, surge, compliance risk)
    v
InverterSizingEngine.calculate() --> inverter object
    |                                   (3-tier sizing, DC voltage, current)
    v
BatterySizingEngine.calculate() --> battery object
    |                                  (chemistry-aware Ah, series/parallel)
    v
PVArrayEngine.calculate() --> pvArray object
    |                            (panel count, string config, daily energy)
    |
    +--> ConfigurationComparisonEngine.compare() --> configComparison
    |        (all valid S*P configs scored)
    |
    +--> MultiMPPTDistributor.distribute() --> multiMPPTResult
    |        (panel distribution across MPPTs, if >1 input)
    |
    v
ChargeControllerValidator.validate() --> mpptValidation
    |                                       (voltage/current/power checks)
    v
CableSizingEngine.calculate() --> cables object
    |                                (5 cable runs, AWG, mm2, drops)
    v
ProtectionEngine.design() --> protection object
    |                            (breakers, fuses, SPDs, earthing)
    v
SystemLossEngine.calculate() --> losses object
    |                               (efficiency chain, energy margin)
    v
SmartAdvisoryEngine.generate() --> advisories array
    |                                 (load mgmt, battery, PV, daily routine,
    |                                  coping strategies, grid charging)
    v
UpgradeSimulator.analyzeUpgradePaths() --> upgradePaths array
    |                                         (5 expansion categories)
    v
OutputGenerator.generateReport() --> report object
DefenseNotes.checkForBlocks() --> defense object
    |
    v
PVCalculator.renderResults() --> HTML injection into #resultsContainer
```

---

## 7A. Recent Feature Additions (v2.1.0)

### 7A.1 Multi-Page PDF Export (`exportPDF()`)

The basic 1-page PDF was replaced with a comprehensive multi-page professional report:

- **Page 1 (Cover):** System summary cards, branding banner, location-aware title, date, system configuration details. When manual override is active, shows BOTH user input and auto-recommended inverter with validation status.
- **Page 2 (Diagram):** Text-based system block diagram (Solar Panels -> MPPT -> Battery/Inverter -> AC Loads) plus cable summary table.
- **Page 3 (Warnings):** Hard blocks (red), warnings (severity-coded yellow/orange), and suggestions.
- **Page 4 (Advisory):** All advisory tips grouped by category with severity badges. Category order: Coping Strategies, Daily Routine, Load Management, Heating Appliances, Battery, Grid Charging, PV Array, General.
- **Page 5 (Upgrades):** Upgrade paths with feasibility icons.
- **Pages 6-10 (Detail, conditional):** Controlled by "Include detailed breakdown in PDF" checkbox. Includes load table, inverter 3-tier comparison, battery specs, PV array details, protection devices, losses chain.
- **Final:** Disclaimer section.
- **File naming:** `PV_System_Design_${locationName}_${date}.pdf`

Helper functions: `addPageHeader()`, `addPageFooter()`, `newPage()`, `checkSpace()`, `sectionTitle()`, `subTitle()`, `bodyText()`, `mutedText()`, `labelValue()`, `bulletItem()`, `summaryCard()`, `drawTable()`, `stripHTML()`.

### 7A.2 Coping Strategies (SmartAdvisoryEngine)

When undersized equipment is detected (manual override with insufficient inverter/battery), the advisory engine generates:

- **"Managing With Undersized Equipment"** advisory (severity: warning) with:
  - Inverter capacity analysis (usable W vs needed VA, shortfall amount)
  - Surge capacity analysis (motor surge vs inverter surge rating)
  - Battery capacity comparison (actual vs recommended Ah)
  - Auto-categorized load priority tiers from user's appliance list:
    - Tier 1 (Always On): fridge, freezer, router, lights, fan
    - Tier 2 (Daytime Only): heavy loads >500W not in Tier 1
    - Tier 3 (Occasional): light loads <=500W
  - 5 survival rules for operating with undersized equipment
  - Upgrade recommendation with auto-calculated inverter size

- **"Safe Load Combinations"** advisory (severity: info) with:
  - Maximum simultaneous load calculation (inverter usable × 0.85)
  - Dynamically built safe combination from actual appliances (greedy algorithm, lightest first)
  - Unsafe combination example (two heaviest loads)

### 7A.3 Grid/Utility Charging Parameters

- **HTML form section** (`#gridChargingSection`, hidden by default): Three input fields for hybrid inverters:
  - Max Grid Charge Current (A)
  - Min Adjustable Current (A)
  - Input Voltage Range (VAC)
- **Visibility control:** `onSystemTypeChange()` shows section for `hybrid` and `grid_tie` system types, hides for `off_grid`.
- **Advisory integration:** When gridMaxChargeA > 0, generates "Grid Charging" category advisory with:
  - Charge power calculation (A × bank voltage)
  - Full charge time estimate (Ah / A × 0.92 efficiency)
  - Lagos-specific grid strategy (nighttime charging, AVR recommendation, charge rate limiting, 80/20 grid-solar split)

### 7A.4 Coping Score (UI Summary Grid + Interactive Modal)

When manual override is active and equipment is undersized (score < 95%), a 7th summary card appears:

- **Weighted scoring:** Inverter continuous ratio (40%) + Surge ratio (25%) + Battery ratio (35%)
- **Color-coded display:**
  - Green (>=75%): "Manageable" — system can work with careful load management
  - Orange (50-74%): "Tight" — significant load scheduling required
  - Red (<50%): "Critical" — system is severely undersized

**Interactivity (v2.2.0):**
- **CSS Tooltip on hover:** Shows quick breakdown — inverter %, surge %, battery % with pass/fail icons
- **JS Modal on click** (`openCopingModal()`): Full-screen modal overlay with:
  - Visual score bar (animated fill, color-coded)
  - Component breakdown table (inverter continuous, surge capacity, battery capacity — with actual vs needed values)
  - Weighted formula display (40% + 25% + 35%)
  - Load Priority Tiers with colored badges (Tier 1 green = critical always-on, Tier 2 amber = daytime heavy, Tier 3 grey = occasional light)
  - Safe Load Combinations (greedy algorithm, lightest-first fit against 85% of inverter usable capacity)
  - Dangerous combinations highlighted in red
  - 5 survival rules numbered list
  - Upgrade path recommendation with specific inverter/battery sizes
- **CSS classes:** `.coping-card`, `.coping-tooltip`, `.coping-modal-overlay`, `.coping-modal`, `.tier-badge`, `.combo-safe`, `.combo-danger`, `.score-bar`

### 7A.5 SVG Diagram Embedded in PDF (v2.2.0)

The PDF Page 2 now embeds the actual SVG system overview diagram from the UI Overview tab:

- **Capture pipeline:** `captureSvgAsImage()` async helper:
  1. Clones the SVG from `#tab-overview svg` (non-destructive)
  2. Resolves all CSS variables (`var(--bg-color)` etc.) to concrete color values via `getComputedStyle()`
  3. Forces light theme background for print (`#f8fafc`)
  4. Sets explicit `xmlns`, `width`, `height` attributes
  5. Inlines `font-family: Arial, Helvetica, sans-serif` on all `<text>` elements for canvas compatibility
  6. Serializes via `XMLSerializer` → `Blob` → `ObjectURL`
  7. Renders to `<canvas>` at 2x resolution for sharpness
  8. Exports as PNG data URL

- **PDF integration:**
  - Image centered on Page 2, proportionally scaled to fit page width
  - If image height exceeds available space, both dimensions scale down proportionally
  - Caption below: "Full system diagram — shows every panel and battery unit..."
  - **Graceful fallback:** If SVG capture fails (CORS, browser limitations), the original text-based block diagram renders instead
  - Cable Sizing Summary table always appears below regardless of diagram type

- **`exportPDF()` is now `async`** to support the canvas render promise chain

### 7A.6 Expert Mode (v2.1.0)

When manual mode is active, an "Expert Mode" checkbox appears:
- Suppresses inverter sizing hard block, converting it to a warning prefixed with "EXPERT OVERRIDE:"
- PV/MPPT safety blocks remain enforced (equipment damage risk)
- Triggers recalculation on toggle

### 7A.7 Cold Voc Fix (v2.1.0)

Fixed stale block propagation: when manual PV override is active, `pvArray.blocks`, `pvArray.warnings`, and `pvArray.suggestions` are now **replaced** (not merged) with the user config validation results, preventing auto-calculated blocks from incorrectly blocking valid user configurations.

### 7A.8 PDF Polish & Export Spinner (v2.3.0)

- **Coping Score Bar (PDF Page 4):** Visual progress bar at top of Advisory page — green/orange/red fill with percentage and label, background track in slate grey
- **Load Growth Colors (PDF Page 5):** Upgrade path options now show colored badges (`OK` green, `Upgrade` red), detail text in orange for non-feasible items, bold colored impact lines
- **Expert Mode Badge (PDF Page 1):** Amber warning banner reads "Expert Mode Active — Auto-rec hard blocks suppressed" when expert mode is toggled on
- **PDF Export Spinner:** Full-screen overlay with spinning ring and "Generating PDF..." text, shown during async PDF generation, auto-dismissed in `finally` block

### 7A.9 LiFePO4 Battery Sizing Enhancement (v2.3.0 → Nominal kWh-Driven)

**Constants added:**
- `LIFEPO4_CELL_RATINGS`: Standard LiFePO4 cell sizes [100, 150, 200, 230, 280, 304, 320] Ah
- `LITHIUM_MODULES`: 51.2V module catalog with 7 market sizes: 5.12 kWh (100Ah), 7.2 kWh (140Ah), 7.68 kWh (150Ah), 10.24 kWh (200Ah), 15 kWh (~293Ah), 17.5 kWh (~342Ah), 20.48 kWh (400Ah) — each with label and note (brand hints: Felicity, Pylontech, BYD, Deye)
- `BATTERY_SPECS.lifepo4.moduleVoltage` (51.2V) and `cellsPerModule` (16) — industry standard 16S module

**BatterySizingEngine enhancements (nominal kWh-driven approach):**

The sizing pipeline now starts from **nominal kWh** rather than cell Ah. The core formula computes the required nominal capacity first, then module matching finds the best physical product:

```
RequiredNominal_kWh = (DailyLoad_Wh × AutonomyDays) / (DoD × DischargeEfficiency) × DesignMargin
```

- `calculate()` now returns a **`designBasis`** object containing: `dailyLoadWh`, `autonomyDays`, `dod`, `dischargeEfficiency`, `designMargin`, `effectiveUsableFactor`, and **`requiredNominalKWh`** — providing full formula transparency
- `calculate()` also returns **`requiredNominalKWh`** as a top-level field for quick access
- `matchLithiumModule(nominalKWh)`: Now takes **nominal kWh** (not Ah). Finds the smallest module >= required capacity. **Stacking preference:** prefers stacking modules ≤10.24 kWh over rare large singles (e.g., 2×10.24 kWh over 1×20.48 kWh) for better market availability and serviceability
- `buildTiers()`: Computes **nominalKWh per tier** from the base required nominal, then passes to `matchLithiumModule`:
  - **ECONOMY MATCH:** 1.0× requiredNominalKWh — minimum viable
  - **BALANCED DESIGN:** 1.2× requiredNominalKWh — headroom for degradation, temp losses, real-world cycling
  - **EXPANSION READY:** 1.5× requiredNominalKWh — future-proof for load growth without upgrade
- **51.2V default:** When LiFePO4 is selected with 48V bus, engine uses 51.2V nominal (16S × 3.2V) — matching modern rack battery standard
- **New return fields:** `tiers`, `capacityRange`, `moduleMatch`, `isLithium`, `effectiveBankVoltage`, `requiredNominalKWh`, `designBasis`
- **Module coverage verified:** All 7 catalog modules are reachable by both bot auto-select and user manual selection at all load levels (1.5 kWh through 30+ kWh daily)

**UI enhancements:**
- **Required Nominal kWh** shown prominently with full formula breakdown: `(DailyLoad × Autonomy) / (DoD × Efficiency) × Margin`
- Battery tab shows 3-column tier grid (Economy/Balanced/Expansion) with module matches per tier
- Each tier shows its **Nominal kWh** value and the **Module/Config** column displays stacking info (e.g., "2× 10.24 kWh")
- Capacity range bar with gradient fill showing Economy → Balanced → Expansion range
- Closest market module callout for lithium chemistry
- **Module Quick-Pick row** (lithium only): 7 clickable module buttons showing kWh + Ah. Click auto-sets both Ah and 51.2V voltage
- **Merged Ah buttons** (lithium): 11 buttons combining cell ratings + module Ah values [100, 140, 150, 200, 230, 280, 293, 304, 320, 342, 400] — all 7 modules have direct buttons
- Voltage buttons for lithium: [12V, 24V, 48V, 51.2V] + custom
- Custom Ah input (10-2000) for any non-standard size

**PDF enhancements:**
- **Design Basis section** at top of battery detail: shows the full formula with each parameter value, then the computed `requiredNominalKWh`
- Tier comparison table includes **Nominal** column and **Module/Config** column showing stacking (e.g., "2× 10.24 kWh" instead of a single 20.48 kWh module)

### 7A.10 v3.0.0 Global Edition

**Overview:** The calculator is de-regionalized from a Nigeria-specific tool to a global PV design tool with first-class support for 12 regions. All Nigeria-specific text replaced with universal language; grid advisory and seasonal text are now climate-aware and driven by profile data.

**New Constants:**

- **`REGION_PROFILES`** -- 12 regional profiles, each carrying: `acVoltage`, `frequency`, `phaseType`, `inverterMarket`, `avgPSH`, `temps` (min/max), `climate`, `regulatoryNote`, and optional `gridNote`. Profiles: `lagos_ng`, `nairobi_ke`, `accra_gh`, `us_south`, `us_north`, `brazil`, `eu_central`, `eu_south`, `india`, `uae`, `australia`, `generic`.

- **`PHASE_CONFIG`** -- Phase type configurations:
  - `single`: voltages 220/230/240V
  - `split`: voltage 240V, legV=120V
  - `three_phase`: voltages 380/400/415V, sqrt3 factor = 1.732

- **`INVERTER_MARKET`** -- Market-specific inverter size lists and ranges:
  - `EMERGING_OFFGRID`: Common in Africa/India off-grid market
  - `EU_SINGLE_PHASE`: European single-phase market
  - `US_SPLIT_PHASE`: North American split-phase market

- **`CLIMATE_BATTERY_ADJUST`** -- Battery capacity adjustment factors by climate zone:
  - `tropical_hot`: +7%
  - `hot_arid`: +10%
  - `tropical_moderate`: +5%
  - `cold_temperate`: -7%
  - `mixed`: 0%

- **Renamed constant:** `NEC_CONTINUOUS_FACTOR` renamed to `CONTINUOUS_LOAD_FACTOR` (value unchanged: 1.25)

**Engine Changes:**

- **`getConfig()`** now returns additional fields: `locationProfile`, `phaseType`, `frequency`, `inverterMarket`, `climate`
- **`applyLocationDefaults()`** rewritten to populate all form controls from `REGION_PROFILES` (phase, voltage, frequency, market, PSH, temps)
- **`calculateACCurrent(powerVA, voltage, phaseType)`** -- New phase-aware AC current helper:
  - Single-phase: `I = P / V`
  - Split-phase: `I = P / V` (total), with per-leg display `I_leg = P / 120`
  - Three-phase: `I = P / (V x sqrt3)`
- **`InverterSizingEngine.selectInverterSize(va, market)`** -- Market-aware size selection from `INVERTER_MARKET[market].sizes`
- **`InverterSizingEngine.formatMarketRange(va, market)`** -- Market-aware range formatting with `activeMarket` fallback
- **`InverterSizingEngine.activeMarket`** -- Stored during `calculate()` so render-time calls do not need explicit market argument
- **3-phase imbalance warning** in `AggregationEngine`: warns when any single load exceeds 20% of total 3-phase VA (imbalance risk)
- **Battery climate adjustment**: Applied after design margin, before Ah conversion. Uses `CLIMATE_BATTERY_ADJUST[climate]` factor
- **Split-phase per-leg current display**: Shows current per 120V leg in cable and protection tabs
- **Custom battery module input**: Users can enter custom kWh, Ah, and voltage for non-catalog battery modules

**UI Changes:**

- **Location dropdown**: `<optgroup>`-organized by continent/region, populated from `REGION_PROFILES`
- **Phase type selector**: Single-Phase / Split-Phase / Three-Phase radio or dropdown
- **AC Voltage**: Dropdown populated from `PHASE_CONFIG[phaseType].voltages` plus a "Custom" option for manual entry
- **Frequency**: 50Hz / 60Hz display, auto-set from region profile on location change
- **Inverter Market**: Auto (from profile) / Emerging Off-Grid / EU Single-Phase / US Split-Phase override selector
- **Custom module input**: New fields in battery config for user-specified kWh, Ah, and voltage

**Text De-regionalization:**

- All Nigeria-specific text (Naira references, "Nigerian store", "Harmattan" as default, "Lagos-specific" advice) replaced with universal language
- Grid advisory text now uses `profile.gridNote` when present
- Seasonal performance text is climate-aware (e.g., "Harmattan/dust" for tropical, "winter low-angle" for temperate)
- Regulatory notes pulled from `profile.regulatoryNote`

**localStorage Migration:**

On first load after upgrade, the init routine detects old-format saved data and migrates:
- Old `location` string values mapped to corresponding `REGION_PROFILES` key
- New fields (`phaseType`, `frequency`, `inverterMarket`) populated with defaults from the matched profile
- Existing appliance data and panel specs preserved without modification

---

## 8. Display and Rendering

### 8.1 Tab System

`PVCalculator.showTab(tabName)` (Lines 8543-8556) removes `.active` from all tabs and tab contents, then activates the selected one. Tabs are rendered as `<div class="tab">` elements with `onclick` handlers.

### 8.2 SVG System Overview (Lines 6262-6813)

The `renderOverviewTab()` method generates a complete SVG diagram dynamically:

- **Panel grid:** Individual rectangles with cell lines, series wires, parallel bus bars, string labels
- **MPPT/Inverter:** Separate boxes for off-grid, combined with sub-boxes for hybrid
- **Battery bank:** Individual battery rectangles with voltage/Ah labels, terminal symbols (red +, blue -), series wires, parallel bus bars
- **Breakers:** PV DC Isolator, Battery DC MCCB, AC MCB -- each as labeled rectangles
- **AC Loads:** Box representing connected load
- **Wires:** Colored lines (red=DC, purple=AC) with cable size annotations
- **Dimensions:** SVG width adapts to content (`max(900, panelGrid + 120, twoColumnLayout)`)

Two rendering paths exist (Lines 6395-6498 for hybrid, remainder for off-grid) with different component arrangements.

### 8.3 Battery Config SVG (Lines ~11953+)

`renderBatteryConfigSVG()` generates a standalone SVG showing the battery bank wiring diagram with:

- Individual battery units in a grid
- Series connections (horizontal amber lines)
- Parallel bus bars (vertical red/blue lines)
- String labels
- Terminal symbols

**Mixed battery bank support:** When `mixedBankData` parameter is provided with multiple groups, the SVG renders per-battery Ah labels with group-specific fill colors (derived from `battAhColors` map). Mixed banks render all units in a single row (`displayCols = actualTotalBatteries, displayRows = 1`). The title truncates to 30 chars with "..." for long mixed descriptions. The "Each box represents" text shows mixed format (e.g., "mixed: 100Ah x 2, 200Ah x 1").

### 8.4 PV Config SVG (Lines 7929-7995)

`renderPVConfigSVG()` generates an SVG for individual panel configurations showing:

- Panel grid with series/parallel arrangement
- Voltage and current annotations
- Highlighted border for recommended or user configs

### 8.5 Component Specification Tables

Each render method generates HTML tables with result rows (`<div class="result-row">`) containing label-value pairs. Key render methods:

- `renderLoadTab()`: Power breakdown, energy split, motor/electronic/resistive categorization
- `renderInverterTab()`: Three-tier comparison with market ranges, stagger option, compliance risk indicator
- `renderBatteryTab()`: Capacity, chemistry, kWh, charge/discharge limits
- `renderCablesTab()`: Cable runs table with AWG, mm2, ampacity, voltage drop, pass/fail indicators
- `renderProtectionTab()`: Grouped device lists (PV, Battery, AC, Earthing) with ratings, locations, purposes
- `renderLossesTab()`: Efficiency chain table with individual and cumulative loss percentages

### 8.6 Advisory Engine Display (Lines 8389-8424)

`renderAdvisoryTab()` groups advisories by category and maps severity to alert classes:

| Severity | CSS Class | Icon |
|----------|-----------|------|
| critical | `alert-error` | Warning triangle |
| warning | `alert-warning` | Warning triangle |
| info | `alert-info` | Info circle |

---

## 9. Auto-Save and Restore

### 9.1 Auto-Save (Lines 5546-5556)

`saveToLocalStorageAuto()` is called every time an appliance is added. Silently writes to `pvCalculatorAutoSave` with:

```javascript
{ appliances: [...], savedAt: ISO string }
```

### 9.2 Auto-Restore (Lines 5561-5577)

`checkAutoSave()` runs on `DOMContentLoaded`. If `pvCalculatorAutoSave` exists with appliances, prompts user with confirm dialog showing saved timestamp and appliance count.

### 9.3 Manual Save/Load (Lines 4844-4899)

`saveToLocalStorage()` writes to `pvCalculatorData` with full form state:

```javascript
{
  appliances: [...],
  config: { location, systemType, acVoltage, avgPSH, autonomyDays, ... },
  panel: { wattage, vmp, voc, imp, isc, tempCoeffPmax, tempCoeffVoc },
  mppt: { maxVoltage, maxCurrent, maxPower, minVoltage, ... },
  cableLengths: { pvToMPPT, mpptToBatt, battToInv, invToLoad },
  batteryChemistry: "lifepo4",
  savedAt: ISO string
}
```

`loadFromLocalStorage()` restores all form fields and validates panel specs.

### 9.4 Theme Persistence (Lines 4391-4410)

Theme preference saved to `pv-theme` on toggle, restored on page load via `initTheme()`.

---

## 10. Footer and Metadata

### 10.1 Footer (Lines 8621-8654)

- Dynamic copyright year via `document.getElementById('footerYear').textContent = new Date().getFullYear()`
- Application title: "Advanced Photovoltaic Estimation"
- Version: v1.0.0
- Author: Leebartea
- License: MIT (linked to `LICENSE.txt`)
- Engineering disclaimer: Estimation only, requires qualified solar engineer validation, no liability assumed

### 10.2 HTML Meta Tags (Lines 3-11)

- `charset`: UTF-8
- `viewport`: Width=device-width, initial-scale=1.0
- `description`: Professional off-grid solar sizing tool for global use
- `author`: Leebartea
- `version`: 1.0.0
- `og:title`: Advanced PV System Calculator
- `og:description`: Professional off-grid solar system design tool with motor surge analysis
- `og:type`: website

### 10.3 Favicon (Line 13)

Inline SVG data URI: Blue rounded rectangle with white "PV" text.

### 10.4 Page Initialization (Lines 8582-8617)

On `DOMContentLoaded`:

1. `initTheme()` -- Restore dark/light mode
2. `applyLocationDefaults()` -- Set defaults from REGION_PROFILES (Lagos default)
3. `updateLoadTypeDefaults()` -- Initialize motor field visibility
4. `validatePanelSpecs()` -- Validate default panel values
5. `checkAutoSave()` -- Prompt for auto-saved data
6. `onSystemTypeChange()` -- Set hybrid/off-grid label
7. `onBatteryChemistryChange()` -- Show/hide lithium kWh input
8. Add real-time numeric input validation listeners to all `<input type="number">` elements

---

## Appendix: Line Number Index

| Section | Start Line | End Line |
|---------|-----------|---------|
| HTML Head / Meta | 1 | 15 |
| CSS Styles | 16 | 696 |
| CSS: Root Variables (Light) | 21 | 35 |
| CSS: Dark Mode Variables | 40 | 97 |
| CSS: Theme Toggle | 100 | 127 |
| CSS: Layout / Grid | 168 | 178 |
| CSS: Forms | 202 | 253 |
| CSS: Buttons | 255 | 291 |
| CSS: Appliance Table | 294 | 325 |
| CSS: Alerts | 356 | 401 |
| CSS: Summary Cards | 404 | 429 |
| CSS: Tabs | 432 | 464 |
| CSS: Print Styles | 467 | 481 |
| CSS: Validation States | 524 | 561 |
| CSS: Mode Toggle | 562 | 619 |
| CSS: Spec Badges | 644 | 694 |
| HTML Body Start | 697 | 700 |
| HTML: System Configuration Card | 713 | 774 |
| HTML: Add Appliance Card | 777 | 873 |
| HTML: Appliance List Card | 876 | 886 |
| HTML: Upgrade Simulator Card | 889 | 918 |
| HTML: Equipment Specs Card | 921 | 1338 |
| HTML: Panel Specs | 936 | 974 |
| HTML: MPPT Specs (Primary) | 977 | 1025 |
| HTML: MPPT 2 / MPPT 3 | 1027 | 1097 |
| HTML: Panel Count / Daytime Load | 1101 | 1123 |
| HTML: Inverter Manual | 1126 | 1151 |
| HTML: Battery Config | 1153 | 1250 |
| HTML: PV Manual Config | 1252 | 1292 |
| HTML: Breaker Manual | 1294 | 1315 |
| HTML: Cable Lengths | 1317 | 1338 |
| HTML: Calculate Button | 1340 | 1346 |
| HTML: Results Container | 1348 | 1359 |
| JS: DEFAULTS Constants | 1365 | 1620 |
| JS: Phase 1 - LoadEngine | 1626 | 1715 |
| JS: Phase 2 - AggregationEngine | 1721 | 1889 |
| JS: Phase 3 - InverterSizingEngine | 1895 | 2110 |
| JS: Phase 4 - BatterySizingEngine | 2116 | 2215 |
| JS: Phase 5 - PVArrayEngine | 2221 | 2392 |
| JS: Phase 6 - ChargeControllerValidator | 2398 | 2459 |
| JS: Phase 7 - CableSizingEngine | 2465 | 2727 |
| JS: Phase 8 - ProtectionEngine | 2733 | 2994 |
| JS: Phase 9 - SystemLossEngine | 3000 | 3053 |
| JS: Phase 10 - UpgradeSimulator | 3061 | 3282 |
| JS: ConfigurationComparisonEngine | 3289 | 3579 |
| JS: MultiMPPTDistributor | 3586 | 3859 |
| JS: SmartAdvisoryEngine | 3884 | ~4447 |
| JS: SmartAdvisoryEngine - Coping Strategies | ~4251 | ~4356 |
| JS: SmartAdvisoryEngine - Grid Charging | ~4421 | ~4443 |
| JS: Phase 11 - OutputGenerator | ~4453 | ~4497 |
| JS: Phase 12 - DefenseNotes | ~4503 | ~4523 |
| JS: PVCalculator (UI Controller) | ~4529 | ~9600 |
| JS: PVCalculator.exportPDF (multi-page) | ~5092 | ~5920 |
| JS: PVCalculator.renderResults (+ Coping Score) | ~7030 | ~7170 |
| JS: PVCalculator.renderOverviewTab | ~7210 | ~7900 |
| JS: PVCalculator.onSystemTypeChange | ~4928 | ~4945 |
| JS: DOMContentLoaded init | ~9530 | ~9600 |
| HTML: Grid Charging Section | 1317 | 1338 |
| HTML: Footer | ~9620 | ~9637 |

**Note:** Line numbers are approximate (~) due to ongoing feature additions. Use the section header comments (e.g., `/* ===== SMART ADVISORY ENGINE ===== */`) for reliable navigation.

---

## 7B. Recent Feature Additions (v3.1.0)

### 7B.1 Battery Section UI Cleanup (Manual Mode)

**Problem fixed:** When LiFePO4 chemistry was selected AND manual mode was active, two duplicate sets of kWh/Ah fields were visible — `lithiumKwhSection` (convenience converter) and `batteryManualSection` (manual override). Users saw confusing duplicate inputs.

**Changes:**
- `toggleManualMode()`: Now hides `lithiumKwhSection` when manual mode is active, restoring it based on chemistry when auto mode is re-enabled
- `onBatteryChemistryChange()`: Now checks `manualMode.checked` before showing `lithiumKwhSection` — only displays when LiFePO4 AND not in manual mode
- **Series Strings display added**: Manual battery section now shows a read-only "Series Strings" field alongside the editable "Parallel Strings", auto-calculated as `bankVoltage / unitVoltage`. New function `updateManualSeriesDisplay()` updates this in real-time when bank voltage or unit voltage changes
- **`batteryManualStrings` wired into calculation**: The Parallel Strings field was previously dead (never read). Now it overrides `battery.stringsInParallel` in the calculate pipeline, and the rendering functions respect stored `stringsInParallel` when `isParallelOverride`, `isUnitCountOverride`, or `isMixedBank` flags are set

**Bug fix:** `renderBatteryConfigTab()` and SVG overview rendering previously recalculated `parallelStrings = Math.ceil(totalCapacityAh / selectedAh)`, ignoring any manual or unit count override. Now checks for override flags and uses stored `battery.stringsInParallel` directly. This fixes the bug where entering 3 battery units showed only 2 in the output (when the Ah picker was set to a different value than `recommendedAhPerCell`).

### 7B.2 Dynamic Mixed Panel Wattage Input

**Problem fixed:** The comma-separated mismatch input worked for analysis but: (1) didn't generate structured per-group input fields, and (2) the calculated `pvArray.arrayWattage` always used `totalPanels * panel.wattage` (single homogeneous wattage) instead of the actual mismatch total.

**Changes:**
- `analyzePanelMismatch()` now generates interactive per-group input fields below the analysis area. Each group shows wattage, quantity, and subtotal. Edits sync back to the comma-separated input via `onMismatchGroupChange()`
- New `pvMismatchGroups` container div added to HTML
- New `onMismatchGroupChange()` function: rebuilds the comma-separated wattage list from group inputs, updates panel count field, and re-triggers analysis
- **Array wattage correction**: After mismatch analysis (in calculate pipeline), `pvArray.arrayWattage` is now set to `mismatchData.totalW` when mismatch is active. This ensures the system uses 1730W (actual) instead of 1800W (9 * 200W homogeneous) for example
- `mismatchData` (including `groups` property) is now stored in `this.results` and flows to PDF export

### 7B.3 Dynamic Mixed Battery Bank Configuration

**New feature:** Supports real-world mixed battery scenarios where clients have different battery sizes or types.

**HTML elements:**
- `batteryMixedSection`: Container shown in manual mode
- `batteryMixedEnabled`: Toggle dropdown (Yes/No)
- `batteryMixedInputs`: Dynamic group input area
- `batteryMixedGroupsList`: Container for group rows
- `batteryMixedAnalysis`: Real-time topology analysis display

**New functions:**
- `toggleMixedBattery()`: Shows/hides mixed battery inputs, auto-adds 2 default groups
- `addBatteryGroup()`: Dynamically adds a battery group row with fields: Ah, Voltage, Quantity, Age (years), Chemistry
- `analyzeMixedBattery()`: Core topology analysis engine:
  - Groups batteries by voltage (same-voltage units paralleled)
  - Detects parallel-then-series topology (e.g., 2x100Ah@12V parallel → 200Ah, series with 1x200Ah@12V → 24V/200Ah)
  - Effective bank Ah = minimum of paralleled-group Ah values in series chain
  - Returns: `{groups, totalUnits, effectiveBankAh, effectiveBankVoltage, effectiveBankWh, parallelStrings, topologyDesc, warnings, hasErrors}`

**Professional advisory warnings (SmartAdvisoryEngine):**
- **Chemistry mismatch**: Specific warnings for LiFePO4 + lead-acid (CC/CV vs 3-stage profile conflict), Gel + Flooded (charge voltage mismatch: 14.1V vs 14.8V), AGM + Flooded (sealed vs vented incompatibility)
- **Age mismatch**: Warns when batteries differ by >2 years (internal resistance disparity) and when any battery exceeds 3 years (capacity degradation accelerates)
- **Ah mismatch in series**: Warns that the smallest parallel group limits the entire string capacity, with wasted capacity calculation
- **Voltage mismatch**: Warns when effective bank voltage doesn't match target

**Integration**: When mixed battery mode is active in calculate pipeline, overrides `battery.totalCapacityAh`, `battery.bankVoltage`, `battery.totalCapacityWh`, and `battery.stringsInParallel` with mixed bank analysis results.

### 7B.4 PDF Generation Improvements

**Changes:**
- **Advisory limit removed**: Previously capped at 18 advisories with 350-character message truncation. Now all advisories are included in full. The existing `checkSpace()` pagination handles page breaks automatically
- **Mixed panel mismatch detail**: Added to PDF after advisory section — shows per-group wattage breakdown when mismatch data is available
- **Mixed battery bank detail**: Added to PDF — shows topology description, effective bank specs, and per-group details (Ah, voltage, chemistry, age)
- Both new sections are positioned after advisories and before upgrade paths, always included regardless of `pdfIncludeDetails` checkbox

### 7B.5 New HTML Elements Added

| Element ID | Type | Section | Purpose |
|---|---|---|---|
| `batteryManualSeriesDisplay` | div (read-only) | Battery Manual | Shows auto-calculated series string count |
| `pvMismatchGroups` | div container | PV Manual | Dynamic per-group panel input fields |
| `batteryMixedSection` | div section | Battery | Mixed battery bank toggle and inputs |
| `batteryMixedEnabled` | select | Battery | Mixed bank toggle (Yes/No) |
| `batteryMixedInputs` | div container | Battery | Group input area |
| `batteryMixedGroupsList` | div container | Battery | Dynamic group rows |
| `batteryMixedAnalysis` | div container | Battery | Topology analysis display |

### 7B.6 New JavaScript Functions

| Function | Purpose |
|---|---|
| `updateManualSeriesDisplay()` | Computes and displays series string count from bank/unit voltage |
| `toggleMixedBattery()` | Shows/hides mixed battery inputs |
| `addBatteryGroup()` | Adds a battery group input row dynamically |
| `analyzeMixedBattery()` | Analyzes mixed battery topology, returns effective bank specs and warnings |
| `onMismatchGroupChange()` | Syncs panel group edits back to comma-separated input |

---

## Round 2 Additions (Managed Practical Engine & UX Overhaul)

### New Engines

| Module | Purpose |
|--------|---------|
| `ManagedModeEngine` | Managed practical inverter sizing — classifies loads by behavior (dutyFrequency, canStagger, isDaytimeOnly), calculates managed continuous/surge VA excluding rare/weekly loads from peak, generates operational conditions, risk assessment (GREEN/YELLOW/ORANGE/RED), **inverter technology modifier** (transformer-based gets 5% favorable risk shift) |
| `BatteryPracticalEngine` | Practical battery alternative — reduced autonomy, load shifting (heavy loads to daytime solar), nighttime-essential-only battery sizing |
| `PVPracticalEngine` | Practical PV alternative — reduced panel count when heavy loads are daytime-only and battery is smaller, real-time daytime load powering |

### New Per-Appliance Behavior Attributes

Three new fields added to every appliance object:
- **dutyFrequency** (`continuous`/`daily`/`weekly`/`rare`): How often the load runs
- **canStagger** (`yes`/`no`/`na`): Whether motor start can be delayed 30-60s
- **isDaytimeOnly** (`yes`/`no`): Whether load only runs during sun hours (6am-6pm)

These are auto-detected from `APPLIANCE_PRESETS` and shown in the appliance list table (3 new columns).

### Panel Mismatch UX Overhaul

- Mismatch toggle moved BEFORE panel spec fields
- New shorthand input format: `190x5, 180x1, 200x3` (also accepts plain comma-separated)
- Per-group spec fields generated with auto-fill from `PANEL_PRESETS`
- Each wattage group gets its own Vmp/Voc/Imp/Isc fields
- Dominant group specs used in calculation pipeline

### Battery Mixed Input UX Overhaul

- "Mixed?" toggle integrated inline with battery Ah field
- Shorthand input: `100x2, 200x1` format (same as panels)
- Per-group rows with Voltage/Chemistry/Age fields
- Series strings: interactive dropdown (Auto/1/2/4/6/8) replacing read-only display

### SVG Overview Mismatch-Aware Rendering

- PV Array title shows grouped description when mismatch active (e.g., "5×190W + 1×180W + 3×200W")
- Per-panel boxes show actual wattage with color-coding by wattage group
- Battery bank SVG shows per-battery Ah from mixed bank data with color-coding by Ah group
- Battery title shows grouped description when mixed bank active

### Risk Index System

- `ManagedModeEngine.calculateRiskIndex()` utility computes deviation % and risk level
- GREEN (≤15%), YELLOW (15-30%), ORANGE (30-50%), RED (>50%)
- Colored dot badges appear on Inverter, Battery, PV Array tab headers
- Risk badges in each practical section header

### Dual-Tier UI Structure

Each major section (Inverter, Battery, PV) shows:
1. **Engineering Standard** — Conservative/Recommended/Optimized tiers (unchanged)
2. **Managed Practical Alternative** — Reduced sizing with explicit operational conditions

Trade-off disclosure and safety disclaimers included in every practical section.

### PDF Export Additions

- Managed Practical inverter section with conditions list and disclaimer
- Battery Practical alternative with reduced autonomy details
- PV Practical alternative with panel count reduction

### Advisory Engine Updates

New advisory patterns added to `SmartAdvisoryEngine`:
- Managed mode viability with condition count
- Motor start sequence (largest first, stagger order)
- Battery practical alternative (load shifting details)
- PV practical alternative (panel reduction)
- **Inverter technology advisory** (motor-conditional): generated only when `totalMotorCount >= 1`. Reports motor count, technology type, surge tolerance, and actionable recommendations. Transformer = 'info' severity, Transformerless = 'warning' severity, Unknown = 'info' severity with prompt to select technology

---

## Round 3 Additions (Adaptive Surge Multiplier System & Battery Mixed Bank Fixes)

### Adaptive Surge Multiplier System

**Problem solved:** The calculator defaulted to fixed 5-6x surge factors for all motors. In reality, surge varies dramatically by appliance type: an inverter fridge draws only 2.0x, while a deep well pump draws 6.0x. The adaptive system provides context-aware, justified surge factors instead of blind worst-case oversizing.

**Changes summary:**

1. **MOTOR_SUBTYPES expanded** from 6 flat types to **16 categorized subtypes** organized in 4 optgroups (Sewing Machine, Compressor, Pump, Other Motors). Each subtype has specific efficiency, surge factor, power factor, start method, and descriptive hint
2. **Motor default surge** changed from 6.0x to **4.0x** (sensible unknown default)
3. **APPLIANCE_PRESETS** updated with variant-specific patterns containing `motorSubType` field. Specific patterns (e.g., "inverter fridge") placed before generic patterns (e.g., "fridge") for first-match-wins auto-detection
4. **Motor subtype dropdown** now uses `<optgroup>` elements with surge multiplier visible in each option label
5. **autoDetectAppliance()** reads `bestMatch.motorSubType` from preset and sets dropdown accordingly
6. **onMotorSubTypeChange()** displays surge-severity colored hints (green ≤2.0x, yellow ≤3.5x, orange ≤4.0x, red >4.0x) with contextual tips
7. **Appliance table** shows color-coded surge factor per motor appliance
8. **Inverter Technology Modifier** — new `inverterTechnology` select field (unknown/transformer/transformerless) that auto-sets surge multiplier and provides 5% favorable risk shift for transformer-based inverters in ManagedModeEngine
9. **Inverter Technology Output Surfacing** — technology selection rendered in 3 output locations:
   - **Inverter Tab**: color-coded technology label + surge tolerance factor with contextual note
   - **Managed Practical Section**: motor-conditional constraint tag (green/amber/grey) with operational guidance
   - **Advisory Tab**: motor-conditional advisory in SmartAdvisoryEngine (only when motor loads ≥ 1)
10. **Dynamic Inverter Technology Recalculation** — changing `inverterTechnology` dropdown auto-triggers full recalculation when results exist, updating cope score, advisory, all output tabs, and PDF data in real-time
11. **PDF Inverter Technology Integration** — technology label + surge tolerance in inverter detail section, managed practical tech impact line, and coping score tech note
12. **Coping Modal Technology Context** — component breakdown includes inverter technology badge with color-coded label when technology is specified
13. **PDF `marginX` Fix** — replaced undefined `marginX` variable with correct `mL`/`contentW` constants in managed practical disclaimer text
14. **SVG Overview Overflow Fixes** — battery title split into 2 lines for mixed banks, inverter box widened to 260px with clipPath, PV box gets clipPath + adaptive title font, all spec text font sizes reduced to prevent overflow

### Battery Mixed Bank Rendering Fixes

**Bugs fixed:**

1. **totalBatteries count** in `renderBatteryConfigTab()`: Was `batteriesInSeries * parallelStrings` (2 for 100x2,200x1). Now uses `battery.mixedBankData.totalUnits` (3) when mixed bank is active
2. **Per-battery Ah in Battery Config SVG**: Was showing uniform `unitAh` for all boxes. Now builds `perBattUnits` array from `mixedBankData.groups` with per-unit Ah and group-specific fill colors
3. **"Each box represents" text**: Was showing "one XX Ah battery" uniformly. Now shows "mixed: 100Ah x 2, 200Ah x 1" format
4. **SVG Overview battery grid**: Loop count was wrong (used `totalBatteries` = 2 instead of actual 3). Now uses `battGridCols = mixedBankData.totalUnits` with `battGridRows = 1` (single row layout for mixed banks). Both hybrid and off-grid rendering paths fixed
5. **Old standalone `batteryMixedSection`**: Was still visible alongside new integrated toggle. Now hidden via `style="display:none !important;"` and removed from `toggleManualMode()` sections array
6. **SVG title overflow**: Long mixed descriptions truncated to 30 chars with "..." suffix
7. **Battery group property**: Fixed `.count` → `.qty` mismatch across 5+ locations (battery groups from `analyzeMixedBattery()` use `.qty`, panel mismatch groups use `.count`)

### Key Code Locations (Post-Changes)

| Feature | Approximate Lines |
|---------|------------------|
| MOTOR_SUBTYPES (16 types) | ~2011-2030 |
| APPLIANCE_PRESETS (variant patterns) | ~2034-2064 |
| appMotorSubType dropdown (optgroups) | ~1018-1043 |
| inverterTechnology HTML | ~959-966 |
| autoDetectAppliance() (motorSubType) | ~9028-9050 |
| onMotorSubTypeChange() (hints) | ~8916-8974 |
| ManagedModeEngine techBonus | ~2853-2863 |
| renderBatteryConfigTab (totalBatteries fix) | ~11547 |
| renderBatteryConfigSVG (per-battery Ah) | ~11953+ |
| SVG Overview battGridCols/battGridRows | ~10290-10301 |
| batteryMixedSection hidden | ~1538 |
| Inverter Tab tech visibility | ~11235 |
| Managed Practical tech tag | ~11148 |
| SmartAdvisoryEngine tech advisory | ~5807 |
| inverterTechnology auto-recalc onchange | ~960 |
| PDF inverter technology label | ~8572 |
| PDF managed tech impact | ~8593 |
| PDF coping tech note | ~8319 |
| Coping modal tech context | ~6283 |
| SVG PV clipPath + adaptive font | ~10362 |
| SVG inverter clipPath + font reduction | ~10625 |
| SVG battery 2-line title (hybrid) | ~10511 |
| SVG battery 2-line title (off-grid) | ~10647 |

---

## Round 4 Plan: Orientation Correction + System Confidence Score

### Feature Audit (Pre-Implementation)

Before Round 4, a comprehensive codebase audit confirmed the following features are **already fully implemented** and require no work:

| Feature | Status | Evidence |
|---------|--------|----------|
| Battery chemistry modeling (4 types, DoD 50-80%) | DONE | BATTERY_SPECS ~1945-1993 |
| Voltage stress awareness (12/24/48V, DC current hard blocks) | DONE | Lines 2651-2671, 9636-9664 |
| Load diversity logic (simultaneous, managed exclusions, stagger) | DONE | Lines 2330-2350, 2777-2812 |
| Installer advisory auto-text (pump timing, stagger, soft start) | DONE | SmartAdvisoryEngine ~5076-5660 |
| Risk Index per component (GREEN/YELLOW/ORANGE/RED) | DONE | calculateRiskIndex() ~2948-2968 |
| Coping Score (weighted 40/25/35 with modal breakdown) | DONE | Lines 6228-6345, 10065-10108 |
| Temperature derating (Pmax + Voc coefficients) | DONE | Lines 3457-3470 |

### Round 4 Additions (Implemented)

**R4-A: Panel Orientation Correction Factor**
- HTML: `panelOrientation` dropdown in System Configuration with 5 options (South/SE-SW/East-West/Flat/Unknown)
- Data: `DEFAULTS.ORIENTATION_FACTORS` — {south: 1.00, se_sw: 0.95, east_west: 0.90, flat: 0.92, unknown: 0.93}
- Engine: applied in PVArrayEngine after tempDerating — `requiredWattage /= combinedPVFactor`
- Also applied in PVPracticalEngine at the same calculation point
- getConfig(): reads `panelOrientation`, computes `orientationFactor` from lookup
- Output: PV tab shows color-coded correction badge, SVG Overview subtitle, PDF PV section
- Auto-recalculate onchange when results exist

**R4-B: Tilt Correction Factor**
- HTML: `panelTilt` dropdown with 4 options (Optimal/Low <10°/High >40°/Unknown)
- Data: `DEFAULTS.TILT_FACTORS` — {optimal: 1.00, low: 0.95, high: 0.97, unknown: 0.97}
- Combined: `combinedPVFactor = orientationFactor * tiltFactor` — single division in both engines
- Return object: `orientationFactor`, `tiltFactor`, `combinedPVFactor` available to output layer

**R4-C: System Confidence Score**
- Formula: `confidence = 100 - (invDeviation × 0.40 + battDeviation × 0.35 + pvDeviation × 0.25)`
- Uses normalized deviations from existing `calculateRiskIndex()` (consistent normalization guaranteed)
- Classification: High (≥85%) / Moderate (≥65%) / Managed (≥45%) / Stress (<45%)
- Colors: green / blue / amber / red
- Display locations:
  - Summary grid: prominent card with score, level, and contextual description
  - SVG Overview: pill badge in title area (top-right corner)
  - PDF page 1: colored banner between summary cards and detail rows
- Stored on `report.confidenceScore`, `report.confidenceLevel`, `report.confidenceColor` for cross-component access

**R4-D: PV Orientation/Tilt Advisory**
- SmartAdvisoryEngine: generated when `combinedPVFactor < 1.0`
- Category: 'PV Orientation'
- Severity: 'warning' when loss ≥10%, 'info' otherwise
- Factual tone: "East/West orientation with low tilt reduces effective PV output by ~14%. Panel count adjusted +16% to compensate."
- Context-specific tips: East/West gets split-array suggestion, Flat gets cleaning recommendation

### Key Code Locations (Round 4)

| Feature | Approximate Lines |
|---------|------------------|
| panelOrientation HTML | ~947-958 |
| panelTilt HTML | ~959-968 |
| ORIENTATION_FACTORS | ~2034-2040 |
| TILT_FACTORS | ~2042-2048 |
| getConfig orientation/tilt | ~9437-9440 |
| PVArrayEngine correction | ~3505-3510 |
| PVPracticalEngine correction | ~3793-3798 |
| PV Tab orientation display | ~12322-12334 |
| PDF PV orientation | ~8782-8788 |
| SVG Overview orient subtitle | ~10482-10486 |
| System Confidence calculation | ~10249-10260 |
| Summary grid confidence card | ~10225-10228 |
| SVG confidence badge | ~10887-10890 |
| PDF confidence banner | ~8066-8074 |
| SmartAdvisory PV Orientation | ~5593-5612 |

---

## Round 5: Cable Type Advisory + Bug Fixes + Scalable Architecture

### Round 5 Additions (Implemented)

1. **Cable Type Advisory per Run** — Each cable run in the Cables tab now displays a "Cable Type" row with engineering-grade guidance:
   - PV string cables: UV-resistant solar cable (PV1-F / H1Z2Z2-K or equivalent)
   - Battery-to-Inverter / MPPT-to-Battery: High-current flexible fine-strand copper cable
   - AC output: Standard installation-grade cable in conduit/trunking
   - Function `getCableTypeAdvisory(run)` inside `renderCablesTab()` provides context-specific text per run

2. **DC vs AC Cable Type Guidance Section** — New summary panel in the Cables tab with side-by-side DC/AC guidance cards explaining cable construction type selection principles (flexible vs solid/stranded, UV resistance, DC/AC separation)

3. **PDF Cable Type Guidance** — Cable type advisory added after the cable sizing table in PDF export (DC and AC guidance lines)

4. **Bug Fix: `battMixedTitleDesc` scoping** — Variable moved from `var` inside `if (isMixedBank)` block to `let battMixedTitleDesc = ''` declared before the conditional. Prevents potential undefined access in SVG rendering.

5. **Bug Fix: `inverterTechnology` onchange null guard** — Added `if(el){...}` guard around `el.value` assignments in the inline event handler. Also simplified redundant branches.

6. **Scalable Architecture Document** — Created `Helpful Md/SCALABLE_ARCHITECTURE.md` documenting the future growth path: three-phase load allocation, phase imbalance math, modular inverter cluster mapping, shared battery throughput model, energy strategy framework, simulation layer, commercial SVG topology, and implementation priority sequencing.

### Key Code Locations (Round 5)

| Feature | Approximate Lines |
|---------|------------------|
| getCableTypeAdvisory() | ~12571-12588 |
| Cable Type row per run | ~12617-12620 |
| DC/AC Guidance section | ~12641-12670 |
| PDF cable type guidance | ~8343-8351 |
| battMixedTitleDesc init | ~10437 |
| inverterTechnology null guard | ~984 |

---

## Current Commercial Expansion Summary (Rounds 6-12)

The current build is now materially beyond the original residential/light-commercial scope.

### Commercial workflow layers now implemented

- business profile, operating intent, and continuity classification
- business-aware machine library for tailoring, bakery, filling station, cold room, workshop, and mini-factory jobs
- operating schedule presets plus per-load role and criticality modeling
- guided section flow with per-card summaries, collapsible sections, and recommended-next-step navigation
- three-phase load assignment, imbalance detection, and modular inverter-cluster planning
- commercial power architecture checks for protected boards, shared battery throughput, generator-assist realism, and PV field / MPPT grouping
- commercial decision engine that recommends the least misleading site posture
- supported-load story that separates protected, assisted, and outside-the-promised-path loads
- recommended feeder schedule that maps those protected, assisted, and outside-promise loads into explicit feeder lanes with source-path labels
- locked benchmark suite with both acceptance and constrained references
- regional compliance packs
- authority-specific submission-pack readiness with staged deliverables and approval-lane guidance
- package comparison and supplier-pricing traceability
- advisory commercial finance / ROI layer with annual value, simple payback, 5-year / 10-year gross-value outlook, and lifecycle allowances

### What the finance / ROI layer currently does

It reads:

- value basis
- displaced energy rate
- export credit
- operating days per week
- annual escalation
- annual O&M allowance
- inverter refresh allowance
- battery refresh allowance

It then estimates:

- annual self-consumed energy value
- annual export-credit value
- simple payback
- 5-year gross value
- 10-year gross value
- 5-year / 10-year net-after-quote view
- 5-year / 10-year lifecycle allowance totals
- 5-year / 10-year net-after-lifecycle view

Important boundary:

- this is advisory commercial value framing
- it is not a lender-grade project-finance, tax, or debt-model engine

### Current honest product position

Strongest current use:

- offline-first installer sizing
- captive commercial and small-industrial PV proposals
- three-phase captive-site scoping
- business-specific early design and honest continuity framing

Still outside current final-authority scope:

- OEM parallel approval rules
- final protection coordination and selectivity
- stamped or jurisdiction-final authority submission packages
- utility interconnection engineering
- true mini-grid / generation-plant studies
