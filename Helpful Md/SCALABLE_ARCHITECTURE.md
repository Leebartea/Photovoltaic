# Scalable Architecture — Implemented And Remaining Growth Path

## Advanced PV System Calculator v3.0.0 Global Edition

**Purpose:** This document captures the engineering design notes, math foundations, and implementation strategy for scaling the calculator from its original residential/light-commercial core into stronger commercial three-phase territory and beyond. Some capabilities described here are now implemented, while later sections still describe the next growth path.

**Current baseline:** modular source in `src/`, generated standalone and hosted artifacts, shared TS-10 domain/result typedefs with passing type checks on the full stable core plus native `.ts` defaults, engines, reporting, and controller payload/state/guidance helper modules, normalized practical-sizing, configuration-comparison, controller-summary, workspace-state, and workflow-guidance result contracts, global location profiles, single/split/three-phase support, per-load phase assignment, imbalance detection, modular inverter clusters, shared battery throughput checks, PV field / MPPT grouping realism, supplier pricing packs, commercial strategy recommendation, supported-load envelopes, advisory commercial finance / ROI with lifecycle allowances, proposal/compliance layers, plant-scope boundary guidance, and vertical starter templates for tailoring, bakery, filling station, cold room, workshop, and mini-factory jobs.

---

## Table of Contents

1. [Current Architecture Summary](#1-current-architecture-summary)
2. [Scalability Principles](#2-scalability-principles)
3. [Tier Model — Residential vs Commercial Mode](#3-tier-model)
4. [Three-Phase Load Allocation Engine](#4-three-phase-load-allocation-engine)
5. [Phase Imbalance Detection & Math](#5-phase-imbalance-detection--math)
6. [Modular Inverter Cluster Mapping](#6-modular-inverter-cluster-mapping)
7. [Shared Battery Bank Throughput Model](#7-shared-battery-bank-throughput-model)
8. [Distributed Solar Input Architecture](#8-distributed-solar-input-architecture)
9. [Energy Strategy Framework](#9-energy-strategy-framework)
10. [System Behavior Simulation Layer](#10-system-behavior-simulation-layer)
11. [SVG Topology Upgrade — Commercial Layout](#11-svg-topology-upgrade)
12. [PDF Report Structure — Commercial Tier](#12-pdf-report-structure)
13. [Cable Advisory Enhancement — DC vs AC Type Guidance](#13-cable-advisory-enhancement)
14. [Environment Adaptation Presets](#14-environment-adaptation-presets)
15. [Implementation Priority & Sequencing](#15-implementation-priority--sequencing)
16. [What NOT to Build](#16-what-not-to-build)

---

## 1. Current Architecture Summary

The calculator follows a **12-phase sequential pipeline** where each engine receives a shared `config` object and returns results consumed by downstream engines:

```
Phase 1:  LoadEngine            — Per-appliance power/energy with duty cycle, PF, surge
Phase 2:  AggregationEngine     — Sum loads, diversity, simultaneous vs non-simultaneous
Phase 3:  InverterSizingEngine  — Three-tier sizing (Conservative/Recommended/Optimized)
          ManagedModeEngine     — Budget-constrained alternative with risk index
Phase 4:  BatterySizingEngine   — Chemistry-aware kWh design with DoD limits
          BatteryPracticalEngine— Reduced autonomy alternative
Phase 5:  PVArrayEngine         — Panel count with temp derating, orientation/tilt correction
Phase 6:  ChargeControllerValid — MPPT voltage/current validation, cold Voc check
          PVPracticalEngine     — Reduced panel count with daytime load shifting
Phase 7:  CableSizingEngine     — NEC/IEC ampacity, voltage drop, AWG + metric sizing
Phase 8:  ProtectionEngine      — Breakers, fuses, SPDs, isolators, earthing
Phase 9:  SystemLossEngine      — DC + AC loss chain, round-trip efficiency
Phase 10: UpgradePathEngine     — Future expansion headroom analysis
Phase 11: OutputGeneration      — HTML tabs, SVG overview, PDF export
Phase 12: DefenseNotes          — Hard blocks for dangerous configurations
```

**Key data objects:**
- `DEFAULTS` (~line 1731): All constants, regional profiles, cable tables, motor subtypes
- `config` (built by `getConfig()` ~line 9437): User inputs normalized into calculation-ready form
- `report` (built by `PVCalculator.calculate()`): Accumulated results from all engines

**Rendering layer:**
- `renderResults()` → builds 12 HTML tabs + SVG overview
- `exportPDF()` → jsPDF multi-page professional report
- `SmartAdvisoryEngine` → context-aware installer guidance

**Current three-phase support:** The app now models per-load phase assignment, auto-balancing, phase imbalance warnings, modular inverter clusters, commercial architecture checks, strategy recommendation, supported-load envelopes, advisory finance / ROI with lifecycle allowances, authority-specific submission-pack readiness, plant-scope boundary guidance, and locked benchmark references. The remaining gap is no longer basic three-phase awareness. The remaining gap is deeper cashflow and plant-engineering workflows.

---

## 2. Scalability Principles

All future additions must follow these rules:

1. **Mode separation** — Commercial/three-phase features must live behind a mode toggle, not mixed into residential logic. The existing single-phase pipeline must remain untouched for its current user base.

2. **Same architecture pattern** — New engines follow the same `const XEngine = { calculate(config) { ... return results; } }` pattern. No framework changes.

3. **Progressive disclosure** — UI complexity only appears when the user selects commercial mode. Residential users see exactly what they see today.

4. **Advisory over regulation** — The bot provides engineering guidance, not code-specific compliance. Cable type recommendations, not IEC table lookups. Phase balance warnings, not mandatory redistribution.

5. **Runtime simplicity without source lock-in** — The delivered product must remain easy to run offline as a single HTML artifact, but the source may stay modular and build back into that artifact plus a hosted static bundle.

6. **Calculation pipeline order** — New engines slot into the existing 12-phase sequence. Phase load allocation would run between Phase 2 (Aggregation) and Phase 3 (Inverter Sizing).

---

## 3. Tier Model

The bot should operate in two distinct modes:

### Residential / Light-Commercial (Current — Default)
- Single-phase or split-phase
- One inverter unit
- One battery bank
- One or more MPPT inputs
- All current features unchanged

### Commercial / Three-Phase (Future — Behind Toggle)
- Three-phase output (415V / 400V / 380V line-to-line)
- Modular inverter cluster (N modules mapped to 3 phases)
- Shared battery bank with throughput constraint
- Multiple MPPT charge controllers as independent solar inputs
- Per-phase load allocation with imbalance detection
- Motor-aware surge distribution across phases

**UI toggle:** A single "System Mode" selector at the top of the form:
- `residential` (default) — current behavior, no changes
- `commercial_3phase` — enables the commercial input section and calculation path

**When commercial mode is active:**
- Phase load allocation UI appears (assign loads to L1/L2/L3 or auto-balance)
- Inverter module count + per-module VA input replaces single inverter sizing
- Battery throughput constraint added alongside capacity
- Additional advisory rules activate
- SVG overview switches to commercial topology layout

---

## 4. Three-Phase Load Allocation Engine

**Purpose:** Distribute user-defined loads across L1, L2, L3 and detect imbalance.

### Input Requirements
Each appliance in the load table needs an optional "Phase" column:
- `auto` (default) — engine distributes for balance
- `L1`, `L2`, `L3` — user-assigned to specific phase
- `3-phase` — load is inherently three-phase (e.g., 3-phase motor, large AC unit)

### Calculation Logic

```
For each appliance:
  if phase === '3-phase':
    phaseLoad[L1] += watts / 3
    phaseLoad[L2] += watts / 3
    phaseLoad[L3] += watts / 3
  else if phase === 'L1'|'L2'|'L3':
    phaseLoad[assigned] += watts
  else (auto):
    assign to phase with lowest current total

Per-phase current:
  I_phase = phaseLoad[Lx] / V_phase_neutral
  where V_phase_neutral = V_line / sqrt(3)  (e.g., 415 / 1.732 = 239.6V)

Total system:
  totalVA = (phaseLoad[L1] + phaseLoad[L2] + phaseLoad[L3])
  — or equivalently: totalVA = sqrt(3) × V_line × I_line (for balanced)
```

### Per-Phase Output Table
| Phase | Load (W) | Current (A) | % of Total | Status |
|-------|----------|-------------|------------|--------|
| L1    | computed | computed    | computed   | OK / Heavy / Overloaded |
| L2    | computed | computed    | computed   | OK / Heavy / Overloaded |
| L3    | computed | computed    | computed   | OK / Heavy / Overloaded |

### Where It Fits in Pipeline
Between Phase 2 (AggregationEngine) and Phase 3 (InverterSizingEngine). The phase allocation results feed into inverter sizing to determine per-phase capacity requirements.

---

## 5. Phase Imbalance Detection & Math

### Imbalance Percentage Formula

```
averageLoad = (L1 + L2 + L3) / 3
maxDeviation = max(|L1 - avg|, |L2 - avg|, |L3 - avg|)
imbalancePct = (maxDeviation / averageLoad) * 100
```

### Thresholds and Advisories

| Imbalance % | Classification | Advisory |
|-------------|---------------|----------|
| 0-10%       | Balanced      | "Phase loading is well balanced. No action needed." |
| 10-20%      | Moderate      | "Moderate phase imbalance detected. Consider redistributing loads for optimal efficiency." |
| 20-30%      | Significant   | "Significant imbalance. The heaviest phase limits system capacity. Redistribution recommended." |
| >30%        | Critical      | "Critical imbalance. System operates at the capacity of the weakest phase. Redistribution required before commissioning." |

### Limiting Phase Concept
The phase with the highest load determines the minimum per-phase inverter capacity. If L1 carries 60% of total load in a system with equal per-phase inverter modules, L1 becomes the bottleneck. The advisory should identify the limiting phase and quantify the capacity waste on underloaded phases.

### Neutral Current Warning (Future)
In unbalanced three-phase systems, neutral current is non-zero:
```
I_neutral = sqrt(I_L1² + I_L2² + I_L3² - I_L1×I_L2 - I_L2×I_L3 - I_L1×I_L3)
```
This affects neutral cable sizing and should generate a warning when I_neutral > 50% of phase current.

---

## 6. Modular Inverter Cluster Mapping

### Core Principle
**Inverter module count is independent of phase count.** A three-phase system can have 3, 4, 5, or more inverter modules. Modules are assigned to phases, with multiple modules per phase operating in parallel.

### Input Fields (Commercial Mode)
- **Module count:** Number of physical inverter units (e.g., 4)
- **Module VA rating:** Per-unit capacity (e.g., 10,000 VA)
- **Phase mapping:** How modules are distributed across phases

### Phase Mapping Options
1. **Auto-balanced:** Distribute modules evenly across 3 phases. If count isn't divisible by 3, extra module(s) go to the heaviest loaded phase.
2. **Manual assignment:** User specifies how many modules per phase.

### Example Configurations

| Modules | Mapping | Per-Phase Capacity | Total |
|---------|---------|-------------------|-------|
| 3 × 10kVA | 1-1-1 | 10kVA per phase | 30kVA |
| 4 × 10kVA | 2-1-1 | L1=20kVA, L2=10kVA, L3=10kVA | 40kVA |
| 6 × 8kVA  | 2-2-2 | 16kVA per phase | 48kVA |
| 4 × 10kVA | 1-1-2 | L1=10kVA, L2=10kVA, L3=20kVA | 40kVA |

### Validation Rules
- Per-phase load must not exceed per-phase inverter capacity
- Total load must not exceed total installed inverter capacity
- If phase mapping is uneven, the advisory must explain why and confirm the heaviest phase has adequate capacity
- Surge capacity per phase = module count on that phase × module surge rating

### Interaction with Existing Inverter Engine
The current `InverterSizingEngine` sizes a single inverter unit. In commercial mode, it would be bypassed — the user defines module count and VA directly. The engine's role shifts from "what size inverter do you need?" to "is your chosen cluster configuration adequate for your loads?"

---

## 7. Shared Battery Bank Throughput Model

### Architecture
Commercial systems use a centralized battery bank that feeds all inverter modules through a shared DC bus. The battery bank is not split per phase.

### Key Constraint: Throughput vs Capacity
- **Capacity** (kWh) determines runtime/autonomy
- **Throughput** (kW discharge rate) determines how fast energy can be delivered
- A 45kWh battery can store plenty of energy but may only discharge at 30kW continuous

### Sizing Logic
```
batteryCapacityKWh = (daily energy × autonomy days) / DoD
batteryThroughputKW = totalInverterVA / 1000 × 0.9  (90% efficiency assumption)

If batteryThroughputKW > battery max discharge rate:
  WARNING: "Battery discharge rate limits system output to X kW even though
            inverter capacity is Y kVA. Add battery modules or accept reduced
            peak output."
```

### Commercial Battery Assessment

| Ratio (Battery kWh : Inverter kVA) | Assessment |
|-------------------------------------|------------|
| < 0.5:1 | Insufficient — stabilization buffer only, no meaningful autonomy |
| 0.5-0.8:1 | Stabilization-focused — grid-supplement / UPS-style operation |
| 0.8-1.2:1 | Balanced commercial design — standard for hybrid installations |
| 1.2-2.0:1 | Autonomy-oriented — extended backup capability |
| > 2.0:1 | Over-provisioned — likely off-grid or generator-reduction strategy |

### Interaction with Existing Battery Engine
Current `BatterySizingEngine` calculates capacity from daily energy and autonomy. In commercial mode, it would additionally check throughput constraint against total inverter VA and generate appropriate advisories.

---

## 8. Distributed Solar Input Architecture

### Architecture
Commercial systems typically use multiple MPPT charge controllers, each handling a separate PV sub-array. All controllers feed the shared DC bus / battery bank.

### Current State
The bot already supports multi-MPPT distribution in `ConfigurationComparisonEngine` (~line 4664). It calculates panels per MPPT input and validates voltage/current per string. This is a solid foundation.

### Future Enhancement
- **Per-controller PV capacity tracking:** Each MPPT input has its own panel count, orientation, and string configuration
- **Aggregated solar generation:** Total PV = sum of all controller outputs
- **Independent MPPT validation:** Each controller's Voc, Isc, and string count validated independently (already partially done)

### Solar Integration Ratio

| PV kWp : Inverter kVA | Assessment |
|------------------------|------------|
| < 0.5:1 | Underfed — inverter capacity underutilized by solar |
| 0.5-0.8:1 | Standard hybrid — grid supplements solar shortfall |
| 0.8-1.2:1 | Balanced — good solar-to-inverter match |
| > 1.2:1 | Solar-heavy — may curtail excess unless battery can absorb |

---

## 9. Energy Strategy Framework

### Purpose
This layer is now implemented as a **commercial decision engine**. It converts the solved site into the least misleading operating posture rather than only repeating the user's initial intent. The math still comes from the main sizing engines; the strategy layer interprets the result commercially.

### Implemented Strategies

| Strategy | Description | Advisory Emphasis |
|----------|-------------|-------------------|
| `battery_dominant_offgrid` | Whole-site battery-led off-grid posture | PV coverage, backup hours, overnight protected burden, battery throughput |
| `solar_dominant_daytime_bridge` | Solar-first daytime operation with battery bridge | Daytime process alignment, shiftable loads, bridging depth |
| `hybrid_generator_assist` | PV + battery with explicit generator support | Process continuity, assisted topology, battery throughput relief |
| `hybrid_grid_support` | PV + storage with grid-backed support | Bill offset, lighter continuity expectations, clean hybrid posture |
| `essential_load_only_backup` | Selective protected-board backup | Deferrable share, protected-board fraction, honest selective coverage |

### Current Implementation
- `CommercialDecisionEngine` evaluates the current results object after architecture checks.
- It scores each supported strategy from the modeled site shape instead of blindly trusting the selected operating intent.
- It compares the recommended posture with the chosen operating intent and system type.
- Its status now feeds proposal readiness, confidence scoring, executive/commercial rendering, overview snapshots, warning aggregation, and PDF output.

### Remaining Future Work
- lifecycle finance sensitivity tied to the recommended strategy, including maintenance, replacement, and financing effects
- deeper stamped-submission or jurisdiction-specific submission outputs tied to the recommended strategy and location profile
- heavier simulation for mini-grid or generation-plant style operating studies

---

## 10. System Behavior Simulation Layer

### Purpose
Provide rule-based operational predictions for common scenarios. NOT time-series simulation — simple state-based descriptions of what happens under each condition.

### Simulated Operating States

| State | Trigger Condition | Description |
|-------|-------------------|-------------|
| Grid present + solar | Default daytime | Solar charges battery and supplements grid. Inverter in bypass or grid-tie mode. |
| Grid present, no solar | Night / cloudy | Grid powers loads. Battery on standby or trickle charge. |
| Grid outage + solar | Daytime outage | Solar powers loads directly. Excess charges battery. Inverter in island mode. |
| Grid outage, no solar | Night outage | Battery powers loads through inverter. Runtime limited by battery capacity and load. |
| Motor start event | Large motor energized | Surge drawn from battery + inverter. Phase with motor may see voltage dip. Other phases unaffected if balanced. |
| Phase overload | One phase > capacity | Inverter on overloaded phase may trip or throttle. Other phases continue. Load shedding advisory generated. |
| Battery depletion | SoC below threshold | Inverter shuts down or switches to grid-only. Loads may drop if grid absent. |

### Output Format
A summary card or table showing each state with a stability indicator (Stable / At Risk / Critical) and a one-line operational description. This is informational — no calculations, just rule-based logic.

### Implementation Approach
- Build after all calculation engines are complete
- Read from existing results (inverter VA, battery kWh, PV kWp, motor surge data)
- Generate HTML summary in a new "Operational Profile" tab or as a section within the Advisory tab

---

## 11. SVG Topology Upgrade

### Current State
The SVG Overview renders: PV panel grid → MPPT → Battery bank → Inverter → Load panel. Single inverter box, single path.

### Commercial Topology Requirements
- **Inverter modules grouped by phase:** Visual cluster showing L1/L2/L3 columns with module boxes stacked per phase
- **Parallel modules:** Multiple boxes on one phase shown as stacked/adjacent
- **Shared battery bank:** Central battery block with DC bus lines to all inverter modules
- **Aggregated solar inputs:** Multiple MPPT boxes feeding the shared DC bus
- **AC distribution point:** Three-phase output bus with L1/L2/L3 labeled

### Layout Concept
```
[PV Array 1] → [MPPT 1] ─┐
[PV Array 2] → [MPPT 2] ─┤── [DC Bus] ── [Battery Bank]
[PV Array 3] → [MPPT 3] ─┘       │
                                   ├── [Inv 1] ── L1 ─┐
                                   ├── [Inv 2] ── L1 ─┤── [AC Distribution]
                                   ├── [Inv 3] ── L2 ─┤    [3-Phase Output]
                                   └── [Inv 4] ── L3 ─┘
```

### Implementation Notes
- Reuse existing SVG generation pattern (string concatenation)
- Phase-color coding: L1 = red/brown, L2 = yellow/black, L3 = blue
- Module boxes smaller than current single inverter box
- DC bus as a thick horizontal line connecting all modules to battery

---

## 12. PDF Report Structure — Commercial Tier

### Additional Sections (Beyond Current Residential Report)
1. **System Architecture Overview** — Module count, phase mapping, topology description
2. **Phase Capacity Distribution** — Per-phase load vs capacity table with imbalance %
3. **Inverter Cluster Detail** — Module-by-module assignment and per-phase surge capacity
4. **Battery Throughput Analysis** — Capacity vs discharge rate, throughput constraint check
5. **Solar Integration Summary** — Per-MPPT input breakdown, aggregated generation
6. **Operational Profile** — State-based behavior descriptions (from simulation layer)

### System Description Convention
The PDF should describe the system by electrical behavior, not by business type:
- "Three-phase balanced hybrid system with stabilization priority"
- NOT "Filling station power system" or "Commercial installation"

This ensures the report is universally applicable regardless of industry.

---

## 13. Cable Advisory Enhancement — DC vs AC Type Guidance

**Status: IMPLEMENTED in v3.0.0**

The Cables tab now includes cable type advisories:
- **DC runs** (PV→MPPT, MPPT→Battery, Battery→Inverter): Advisory recommends high-current flexible fine-strand copper cable with appropriate voltage rating
- **AC runs** (Inverter→Load): Advisory recommends standard installation-grade cable sized by phase current

### Engineering Basis
- DC battery/inverter connections carry high current at low voltage, requiring flexible conductors for termination quality and mechanical stress tolerance
- AC distribution operates at higher voltage / lower current with fixed routing, suitable for standard installation cable
- Cable **type** (flexible vs solid/stranded) is determined by application, not merely AC/DC designation
- Cable **size** is determined by current, voltage drop, and ampacity — already calculated by CableSizingEngine

### Global Principle
Cable selection is determined by: current level, voltage rating, insulation class, and installation conditions. The bot provides principle-based guidance, not jurisdiction-specific regulatory tables.

---

## 14. Environment Adaptation Presets

### Current State
The bot has 12 regional profiles in `DEFAULTS.REGION_PROFILES` that auto-configure: AC voltage, frequency, phase type, inverter market, PSH, temperature range, climate zone, and regulatory notes.

### Future Enhancement
Add operational environment factors that influence advisories:

| Factor | Values | Impact |
|--------|--------|--------|
| Grid stability | Stable / Unstable / Frequent outage | Affects battery sizing emphasis and stabilization advisories |
| Generator coexistence | None / Backup / Primary | Affects autonomy recommendations and charging strategy |
| Motor load density | Low / Medium / High | Affects surge advisory severity and inverter technology recommendations |
| Ambient temperature | Derived from regional profile | Already influences battery chemistry warnings and PV temp derating |

### Implementation
- Extend `REGION_PROFILES` with default environment factors per region
- Allow user override via optional dropdowns in commercial mode
- `SmartAdvisoryEngine` reads environment factors and adjusts advisory severity

### Example
Lagos profile: `gridStability: 'frequent_outage'` → advisories emphasize battery autonomy, generator coexistence, and surge protection. UAE profile: `gridStability: 'stable'` → advisories emphasize solar optimization and peak shaving.

---

## 15. Implementation Priority & Sequencing

### Phase A — Quick Wins (Minimal Code, High Value)
These can be added to the current residential pipeline with no structural changes:

| # | Feature | Effort | Value |
|---|---------|--------|-------|
| A1 | Cable type advisory (DC flexible / AC installation) | ~20 lines | High — installer guidance |
| A2 | Three-phase voltage awareness in existing inverter engine | ~15 lines | Medium — correct VA calculation for 3-phase |
| A3 | Modular inverter count as optional input | ~30 lines | Medium — "I have 4 × 10kVA" scenario |

### Phase B — Commercial Mode Foundation
Requires mode toggle and new UI section:

| # | Feature | Dependency |
|---|---------|------------|
| B1 | System mode toggle (residential / commercial) | None |
| B2 | Phase load allocation engine | B1 |
| B3 | Phase imbalance detection | B2 |
| B4 | Modular cluster mapping with phase assignment | B1 |
| B5 | Shared battery throughput check | B4 |

### Phase C — Intelligence Layer
Requires Phase B complete:

| # | Feature | Dependency |
|---|---------|------------|
| C1 | Energy strategy framework | B1 |
| C2 | Environment adaptation presets | B1 |
| C3 | Commercial SVG topology | B4 |
| C4 | Commercial PDF report sections | B2, B4, B5 |

### Phase D — Simulation
Requires Phase B + C complete:

| # | Feature | Dependency |
|---|---------|------------|
| D1 | System behavior simulation layer | B2, B4, B5 |
| D2 | Operational profile output tab | D1 |

### Estimated Codebase Growth
- Phase A: +50-80 lines (13,400 → ~13,480)
- Phase B: +800-1,200 lines (→ ~14,600)
- Phase C: +600-900 lines (→ ~15,400)
- Phase D: +300-500 lines (→ ~15,900)

---

## 16. What NOT to Build

These are explicitly out of scope to prevent feature creep:

| Excluded Feature | Reason |
|------------------|--------|
| Solar geometry / sun path calculation | Complexity explosion. Use correction factors instead (already implemented). |
| Hourly generation curves | Time-series simulation is a different product category. |
| IEC/NEC cable sizing regulatory tables | Jurisdiction-specific. The bot provides principle-based guidance. |
| Automatic panel layout / roof mapping | Requires CAD-level functionality. Out of scope for a sizing tool. |
| Grid-tie feed-in tariff calculation | Financial modeling is a separate domain. |
| Battery degradation modeling over time | Requires electrochemical simulation. Use cycle life estimates instead. |
| Real-time monitoring / IoT integration | Requires backend server. Breaks single-file constraint. |
| Automatic load scheduling / demand response | Requires real-time control. This is a sizing tool, not a SCADA system. |
| Full harmonic analysis for motor loads | Power quality engineering. Outside residential/commercial sizing scope. |
| Regulatory compliance certification | The bot is an estimation tool with engineering disclaimers, not a compliance engine. |

---

*Document created: February 2026*
*Applies to: pv_calculator_ui.html v3.0.0 Global Edition*
*Architecture baseline: 12-phase pipeline, ~13,400 lines, single-file HTML/CSS/JS*

## 17. Current UX Architecture Note

The live product now uses a controller-driven progressive-disclosure layer on top of the underlying calculation pipeline.

That means:

- the engineering engines stay unchanged
- the input surface can collapse or expand by task
- each major section can expose a short summary line
- the guide layer can recommend the next section without mutating the actual project data

This is the correct architecture choice for a wide tool:

- the calculator keeps its full commercial depth
- the UI becomes easier to read
- the deployment model stays static and offline-capable
