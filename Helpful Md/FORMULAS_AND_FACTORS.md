# PV System Calculator -- Formulas & Engineering Factors Reference

> Every formula, constant, and engineering factor extracted from `pv_calculator_ui.html`.
> Line numbers reference the source file for traceability.

---

## 1. Load Analysis Formulas

### 1.1 Real Power (accounting for motor efficiency)
**Line 1632-1634**
```
RealPower_W = (RatedPower_W x Quantity) / Efficiency
```
- Efficiency is 1.0 for resistive and electronic loads
- For motors, efficiency comes from the motor sub-type table (see Section 10)

### 1.2 Apparent Power (VA)
**Line 1639-1641**
```
ApparentPower_VA = RealPower_W / PowerFactor
```
- PowerFactor ranges from 0.5 to 1.0 depending on load type
- Resistive: PF = 1.0, Electronic: PF = 0.95, Motor: PF = 0.65-0.85, Mixed: PF = 0.9

### 1.3 Starting / Surge VA
**Line 1646-1648**
```
StartingVA = ApparentPower_VA x SurgeFactor
```
Surge factors by motor start method (**Lines ~2005-2009**):
| Start Method | Surge Factor |
|--------------|-------------|
| DOL (Direct On Line) | 6.0x |
| Soft Start | 3.0x |
| VFD (Inverter Drive) | 1.5x |

**Adaptive surge:** The `SurgeFactor` above is the base start-method multiplier. In practice, the **motor sub-type** surge factor (Section 10.1) overrides this when a specific sub-type is selected. For example, an inverter compressor uses 2.0x regardless of start method, while a deep well pump uses 6.0x. The adaptive system provides context-aware surge instead of applying a blanket worst-case value.

### 1.4 Daily Energy Consumption
**Line 1653-1655**
```
DailyEnergy_Wh = RealPower_W x DailyUsageHours x (DutyCycle / 100)
```
- DutyCycle is a percentage (1-100%) representing the fraction of time the appliance is actually ON during its operating hours
- Example: Refrigerator runs 24h but thermostat cycles at ~40% duty = 24 x 0.40 effective hours

### 1.5 Operating Current
**Line 1660-1662**
```
OperatingCurrent_A = ApparentPower_VA / Voltage
```

### 1.6 Phase-Aware AC Current (`calculateACCurrent`)
**v3.0.0 addition**

Helper function `calculateACCurrent(powerVA, voltage, phaseType)` computes AC current based on phase type:

**Single-phase:**
```
I = P / V
```

**Split-phase (US 120/240V):**
```
I_total = P / V_line          (V_line = 240V)
I_leg   = P / V_leg           (V_leg = 120V, for per-leg current display)
```

**Three-phase:**
```
I = P / (V × √3)
```
Where `√3 = 1.732` (from `PHASE_CONFIG.three_phase.sqrt3`).

Example: 5000VA at 400V three-phase:
```
I = 5000 / (400 × 1.732) = 7.22A per phase
```

### 1.7 Daytime / Nighttime Energy Split
**Lines 1748-1749**
```
DaytimeEnergy_Wh  = DailyEnergy_Wh x (DaytimeRatio / 100)
NighttimeEnergy_Wh = DailyEnergy_Wh x (1 - DaytimeRatio / 100)
```
- DaytimeRatio: percentage of usage occurring during sun hours (6am-6pm)

---

## 2. Aggregation Formulas

### 2.1 Peak Simultaneous Power
**Lines 1763-1770**
```
SimultaneousVA     = SUM(ApparentPower_VA) for all simultaneous appliances
NonSimultaneousMax = MAX(ApparentPower_VA) among non-simultaneous appliances
PeakSimultaneous   = SimultaneousVA + NonSimultaneousMax
```

### 2.2 Worst-Case Surge (All Motors Start Together)
**Lines 1780-1792**

For 2+ motors:
```
TotalMotorSurgeDelta = SUM(StartingVA_m - ApparentPower_m) for all motors m
HighestSurge = PeakSimultaneous + TotalMotorSurgeDelta
```
For single motor or non-motor surges:
```
HighestSurge = PeakSimultaneous + MAX(StartingVA - ApparentPower) across all appliances
```

### 2.3 Staggered Surge (Only Biggest Motor Surges)
**Lines 1794-1812**
```
DominantMotor      = motor with highest StartingVA
DominantDelta      = StartingVA_dominant - ApparentPower_dominant
StaggeredSurge     = PeakSimultaneous + DominantDelta
```
- Realistic assumption: user staggers motor starts by 30+ seconds
- Only the single biggest motor's surge delta is added; all others at continuous

### 2.4 Design Margins
**Lines 1857-1860**
```
DesignMargin       = config.designMargin / 100   (default: 1.25 = 125%)
DesignContinuous   = PeakSimultaneous x DesignMargin
DesignSurge        = HighestSurge x DesignMargin
DesignStaggered    = StaggeredSurge x DesignMargin
```
- NEC requires 125% for continuous loads (default design margin)

### 2.5 Compliance Risk Assessment
**Lines 1822-1839**

| Condition | Risk Level |
|-----------|-----------|
| Industrial sewing + compressor load | **high** |
| 2+ industrial motors (>400W each) | **high** |
| Industrial sewing OR (compressor + 2+ motors) | **medium** |
| Clutch motor + compressor | **medium** |
| All other combinations | **low** |

### 2.6 Servo Upgrade Savings Estimate
**Lines 1844-1853**
```
EstimatedEnergySavings_W   = ClutchTotalW x 0.40
EstimatedSurgeReduction_VA = ClutchTotalW x 3.5 x 0.65
```
- Clutch (4x surge) to Servo (1.5x surge) reduces surge by ~65%
- Energy consumption drops ~40%

---

## 3. Inverter Sizing Formulas

### 3.1 Continuous Sizing with Derating
**Lines 1941-1945**
```
ContinuousWithDerating = DesignContinuousVA / INVERTER_DERATING
```
- `INVERTER_DERATING = 0.80` (Line 1611) -- inverters are typically derated to 80% of nameplate

### 3.2 Surge Capability Check
**Lines 1951-1959**
```
SurgeCapability = InverterVA x SurgeMultiplier
```
- Default `SurgeMultiplier = 2.0` (user-configurable, Line 770)
- If `DesignSurgeVA > SurgeCapability`, upsize inverter to:
  ```
  LargerSize = NextStandardSize(DesignSurgeVA / SurgeMultiplier)
  ```

### 3.3 Three-Tier Sizing System

**Conservative (worst-case):**
**Line 1948**
```
ConservativeSize = NextStandardSize(ContinuousWithDerating)
```
Then upsized if surge exceeds capability.

**Optimized (staggered starts):**
**Lines 1963-1969**
```
StaggeredSurgeCapNeeded = DesignStaggeredSurge / SurgeMultiplier
StaggeredMinSize = MAX(ContinuousWithDerating, StaggeredSurgeCapNeeded)
OptimizedSize = NextStandardSize(StaggeredMinSize)
```

**Recommended (balanced):**
**Lines 2008-2027**
```
BiasedMidpointSurge = DesignStaggeredSurge + (DesignSurge - DesignStaggeredSurge) x ComplianceSurgeBias
RecommendedFromSurge     = BiasedMidpointSurge / SurgeMultiplier
RecommendedFromContinuous = ContinuousWithDerating x (1 + BufferPct)
RecommendedMinSize = MAX(RecommendedFromSurge, RecommendedFromContinuous, IndustrialMinVA)
RecommendedSize = NextStandardSize(RecommendedMinSize)
```
Clamped: `OptimizedSize <= RecommendedSize <= ConservativeSize`

### 3.4 Motor Buffer Percentage
**Lines 1973-1976**

| Motor Count | Buffer |
|-------------|--------|
| 1 motor | +10% |
| 2 motors | +20% |
| 3+ motors | +30% |

### 3.5 Compliance-Aware Buffer
**Lines 1981-1991**

| Compliance Risk | ComplianceSurgeBias | Min BufferPct | Extra Buffer |
|----------------|--------------------:|-------------:|-------------:|
| high | 0.8 | 35% | +20% |
| medium | 0.6 | 25% | +10% |
| low | 0.5 | (from motor count) | 0% |

### 3.6 Industrial Minimum Floors
**Lines 1995-2006**

| Condition | Minimum VA |
|-----------|-----------|
| Industrial sewing (>400W clutch) | 3000 VA |
| Industrial sewing + compressor | 3500 VA |
| 3+ industrial motors | 5000 VA |

### 3.7 DC Bus Voltage Selection
**Lines 1565-1569, 1923-1930**

| Inverter VA | DC Bus Voltage |
|-------------|---------------|
| <= 1500 | 12V |
| <= 3000 | 24V |
| <= 15000 | 48V |
| > 15000 | 48V (default) |

### 3.8 DC Current Calculations
**Lines 2038-2039**
```
DC_Current_Continuous = DesignContinuousVA / DC_Bus_Voltage
DC_Current_Surge      = DesignSurgeVA / DC_Bus_Voltage
```

### 3.9 Maximum DC Current Limits
**Lines 1572-1576**

| DC Voltage | Max Current |
|-----------|------------|
| 12V | 150A |
| 24V | 200A |
| 48V | 250A |

Hard block if continuous exceeds limit; warning at 80% of limit.

### 3.10 Standard Inverter Sizes
**Line 1538**
```
[300, 500, 600, 800, 1000, 1200, 1500, 2000, 2400, 3000, 3500, 4000, 5000, 6000, 8000, 10000, 12000, 15000] VA
```

### 3.11 Market Range Mapping (Market-Aware)
**Lines 1543-1562**

v3.0.0: `selectInverterSize(va, market)` and `formatMarketRange(va, market)` now select from `INVERTER_MARKET[market].sizes` and `.ranges`. The `activeMarket` property is stored during `calculate()` for render-time fallback. Three markets defined in `INVERTER_MARKET`: `EMERGING_OFFGRID`, `EU_SINGLE_PHASE`, `US_SPLIT_PHASE`.

**Example: EMERGING_OFFGRID market (default for Nigeria, India, etc.):**

| Calculated Size | Market Range |
|----------------|-------------|
| 300 VA | 300-500 VA |
| 500 VA | 500-600 VA |
| 600 VA | 600-800 VA |
| 800 VA | 800-1000 VA |
| 1000 VA | 1000-1200 VA |
| 1200 VA | 1200-1500 VA |
| 1500 VA | 1500-2000 VA |
| 2000 VA | 2000-2400 VA |
| 2400 VA | 2400-2500 VA |
| 3000 VA | 3000-3500 VA |
| 3500 VA | 3500-4000 VA |
| 4000 VA | 4000-5000 VA |
| 5000 VA | 5000-5500 VA |
| 6000 VA | 6000-6500 VA |
| 8000 VA | 8000-10000 VA |
| 10000 VA | 10000-12000 VA |
| 12000 VA | 12000-15000 VA |
| 15000 VA | 15000 VA |

---

## 4. Battery Sizing Formulas

### 4.1 Usable Capacity Required
**Line 2142**
```
UsableCapacity_Wh = (DailyEnergy_Wh x AutonomyDays) / DischargeEfficiency
```

### 4.2 Total Capacity Considering DoD
**Line 2145**
```
TotalCapacity_Wh = UsableCapacity_Wh / MaxDoD
```

### 4.3 Self-Discharge Adjustment
**Lines 2148-2149**
```
SelfDischargeLoss = SelfDischargeDaily x AutonomyDays
TotalCapacity_Wh = TotalCapacity_Wh x (1 + SelfDischargeLoss)
```

### 4.4 Design Margin Application
**Line 2152**
```
TotalCapacity_Wh = TotalCapacity_Wh x (DesignMargin / 100)
```

### 4.5 Capacity in Ah
**Line 2155**
```
TotalCapacity_Ah = TotalCapacity_Wh / BankVoltage
```

### 4.6 Series/Parallel Configuration
**Lines 2158, 2177-2178**
```
CellsInSeries   = round(BankVoltage / CellVoltage)
StringsParallel  = ceil(RequiredAh / UnitAh)
ActualCapacity_Ah = StringsParallel x UnitAh
```

### 4.7 Discharge Rate Validation
**Lines 2161-2173**
```
MaxDischargeCurrent = ActualCapacity_Ah x MaxDischargeRate
```
If `PeakLoadCurrent > MaxDischargeCurrent`:
```
RequiredAh = PeakLoadCurrent / MaxDischargeRate
```
Battery Ah is increased to meet discharge requirement.

### 4.8 Hard Block: Discharge Limit
**Lines 2185-2192**
```
If PeakLoadCurrent > MaxDischargeCurrent x 1.5:
    HARD BLOCK -- Risk of battery damage and fire
```

### 4.9 Chemistry-Specific Parameters
**Lines 1399-1443**

| Parameter | LiFePO4 | AGM | Gel | FLA |
|-----------|---------|-----|-----|-----|
| Max DoD | 0.80 (80%) | 0.50 (50%) | 0.50 (50%) | 0.50 (50%) |
| Cycle Life | 3000 | 600 | 700 | 500 |
| Charge Efficiency | 0.97 | 0.88 | 0.87 | 0.85 |
| Discharge Efficiency | 0.98 | 0.92 | 0.91 | 0.90 |
| Max Charge Rate (C) | 0.50C | 0.15C | 0.10C | 0.10C |
| Max Discharge Rate (C) | 1.00C | 0.25C | 0.20C | 0.20C |
| Self-Discharge/Day | 0.001 (0.1%) | 0.002 (0.2%) | 0.002 (0.2%) | 0.003 (0.3%) |
| Cell Voltage | 3.2V | 2.0V | 2.0V | 2.0V |
| Module Voltage | 51.2V (16S) | — | — | — |
| Cells Per Module | 16 | — | — | — |

### 4.10 Standard Battery Ah Ratings
**Line 1791**
```
Generic:   [50, 75, 100, 120, 150, 180, 200, 220, 250, 280, 300] Ah
LiFePO4 cells:   [100, 150, 200, 230, 280, 304, 320] Ah
LiFePO4 merged:  [100, 140, 150, 200, 230, 280, 293, 304, 320, 342, 400] Ah  (cells + module Ah)
```

### 4.10a LiFePO4 Module Library (51.2V Standard)
**Lines 1796-1809**

| Module | Ah | kWh | Note |
|--------|-----|------|------|
| Entry-level | 100 | 5.12 | Single inverter |
| Mid-range | 140 | 7.2 | Felicity, Deye |
| Rack module | 150 | 7.68 | Pylontech, BYD |
| High-capacity | 200 | 10.24 | Various |
| Commercial | ~293 | 15.0 | Stacked modules |
| High-end | ~342 | 17.5 | Stacked 2-3 units |
| Stackable | 400 | 20.48 | Parallel config |

Standard: 51.2V nominal = 16S × 3.2V LiFePO4. Operating range: 44.8V–58.4V.

### 4.10b Required Nominal kWh (Design Basis)
**Lines 2384-2432**

The battery sizing pipeline is **nominal kWh-driven**. The required nominal capacity is computed first, then module matching finds the best physical product:

```
RequiredNominal_kWh = (DailyLoad_Wh × AutonomyDays) / (DoD × DischargeEfficiency) × DesignMargin
```

Where:
- `DailyLoad_Wh` = total daily energy from aggregation
- `AutonomyDays` = user-configured (default 1)
- `DoD` = chemistry max depth of discharge (LiFePO4: 0.80)
- `DischargeEfficiency` = chemistry discharge efficiency (LiFePO4: 0.98)
- `DesignMargin` = user-configured (default 1.25)
- `EffectiveUsableFactor` = `DoD × DischargeEfficiency` (the denominator fraction)

The `calculate()` method returns a **`designBasis`** object with all these parameters plus the computed `requiredNominalKWh`, providing full formula transparency.

### 4.10c Battery Sizing Tiers (Usable-First, No Compound Margin)

Tiers multiply the **raw usable energy** (dailyLoad × autonomy) FIRST, then each tier independently computes its own nominal. This avoids compounding margin-on-margin:

```
BaseUsable = DailyLoad_Wh × AutonomyDays

ECONOMY MATCH:    tierUsable = BaseUsable × 1.0
                  tierNominal = tierUsable / (DoD × Eff) × SelfDischarge × Margin
                  module = matchLithiumModule(tierNominal)

BALANCED DESIGN:  tierUsable = BaseUsable × 1.2
                  tierNominal = tierUsable / (DoD × Eff) × SelfDischarge × Margin
                  module = matchLithiumModule(tierNominal)

EXPANSION READY:  tierUsable = BaseUsable × 1.5
                  tierNominal = tierUsable / (DoD × Eff) × SelfDischarge × Margin
                  module = matchLithiumModule(tierNominal)
```

**Why usable-first?** If you multiply the final nominal (which already has DoD, efficiency, and margin baked in), the tier multiplier compounds those factors. By scaling the raw demand first, then converting to nominal, the math stays clean and each tier's headroom is purely in usable energy terms.

### 4.10d Module Matching and Stacking Preference

`matchLithiumModule(nominalKWh)` finds the smallest module >= required capacity from the `LITHIUM_MODULES` catalog.

**Stacking preference:** For requirements exceeding 10.24 kWh, the engine prefers stacking multiple modules ≤10.24 kWh over selecting a single rare large module. For example:
- 15 kWh needed → 2× 10.24 kWh (preferred) rather than 1× 15 kWh single
- 20 kWh needed → 2× 10.24 kWh (preferred) rather than 1× 20.48 kWh single

This reflects real-world market availability in emerging off-grid markets: 10.24 kWh modules are widely stocked across multiple brands, while 15+ kWh singles are specialty items with limited availability and longer lead times.

### 4.11 C-Rate Current Limits
**Lines 2181-2182**
```
MaxChargeCurrent    = ActualCapacity_Ah x MaxChargeRate
MaxDischargeCurrent = ActualCapacity_Ah x MaxDischargeRate
```

### 4.12 Battery kWh to Ah Conversion
**Lines 4629, 7583**
```
Ah = (kWh x 1000) / BankVoltage
```

### 4.13 Usable Capacity
**Line 5837**
```
UsableCapacity_Wh = TotalCapacity_Wh x MaxDoD
```

### 4.14 Battery Parallel Limits by Chemistry
**Lines 3063-3068**

| Chemistry | Max Parallel Strings |
|-----------|---------------------|
| LiFePO4 | 6 |
| AGM | 4 |
| Gel | 4 |
| FLA | 4 |

### 4.15 Climate Battery Adjustment (v3.0.0)

Applied after design margin, before Ah conversion. Uses `CLIMATE_BATTERY_ADJUST[climate]` factor from the active region profile:

```
ClimateAdjustedCapacity_Wh = TotalCapacity_Wh × (1 + CLIMATE_BATTERY_ADJUST[climate])
```

| Climate Zone | Adjustment | Rationale |
|-------------|-----------|-----------|
| tropical_hot | +7% | High ambient temp accelerates degradation |
| hot_arid | +10% | Extreme heat + dust reduces effective capacity |
| tropical_moderate | +5% | Moderate tropical heat impact |
| cold_temperate | -7% | Cold improves battery longevity (less degradation) |
| mixed | 0% | Baseline, no adjustment |

This adjustment is applied in the `BatterySizingEngine.calculate()` pipeline between the design margin step (4.4) and the Ah conversion step (4.5).

---

## 4A. Phase & Market Constants (v3.0.0)

### 4A.1 PHASE_CONFIG

| Phase Type | Voltages Available | Special Fields |
|-----------|-------------------|---------------|
| single | 220V, 230V, 240V | -- |
| split | 240V | legV = 120V (per-leg voltage) |
| three_phase | 380V, 400V, 415V | sqrt3 = 1.732 |

### 4A.2 INVERTER_MARKET

| Market | Typical Regions | Description |
|--------|----------------|------------|
| EMERGING_OFFGRID | Nigeria, Kenya, Ghana, India, UAE, Brazil | Off-grid focused; brands like Felicity, Must, Growatt |
| EU_SINGLE_PHASE | EU Central, EU South, Australia | Single-phase grid-tie and hybrid; SMA, Fronius, Victron |
| US_SPLIT_PHASE | US South, US North | Split-phase 120/240V; Sol-Ark, Enphase, SolarEdge |

Each market entry carries `sizes` (array of standard VA ratings) and `ranges` (market range mappings similar to the existing INVERTER_MARKET_RANGE).

### 4A.3 3-Phase Imbalance Warning

In `AggregationEngine`, when `phaseType === 'three_phase'`, a warning is issued if any single appliance load exceeds 20% of total three-phase VA:

```
If (applianceVA / totalVA) > 0.20:
    Warning: "Single load [name] is [X]% of total 3-phase VA -- imbalance risk"
```

---

## 5. PV Array Formulas

### 5.1 System Efficiency
**Lines 2233-2238**
```
SystemEfficiency = InverterEfficiency
                 x ChargeEfficiency
                 x (1 - CableLossFactor)
                 x (1 - SoilingLoss)
                 x (1 - MismatchLoss)
```
Default values (**Lines 1607-1619**):
| Factor | Value |
|--------|-------|
| Inverter Efficiency | 0.93 (93%) |
| MPPT Efficiency | 0.98 (98%) |
| Cable Loss Factor | 0.02 (2%) |
| PV Soiling Loss | 0.03 (3%) |
| PV Mismatch Loss | 0.02 (2%) |
| Copper Resistivity | 0.0217 ohm*mm2/m at 75C |
| Continuous Load Factor | 1.25 (125%) |
| DC Voltage Drop Target | 3% |
| AC Voltage Drop Target | 2% |
| Voc Headroom | 3% |

### 5.2 Required PV Energy
**Lines 2241-2258**
```
RequiredPVEnergy = DailyEnergy_Wh / SystemEfficiency
```
If "Size PV for daytime loads" is enabled:
```
DaytimePVWh = DaytimeEnergy_Wh / SystemEfficiency
RequiredPVEnergy += DaytimePVWh
```
Battery recharge component:
```
BatteryRechargeWh = UsableCapacity_Wh / ChargeEfficiency
RequiredPVEnergy += BatteryRechargeWh / AutonomyDays
```
Design margin:
```
RequiredPVEnergy = RequiredPVEnergy x (DesignMargin / 100)
```

### 5.3 Required Array Wattage
**Line 2261**
```
RequiredWattage_Wp = RequiredPVEnergy / PSH
```

### 5.4 Temperature Derating
**Lines 2264-2269**
```
TempDelta = AmbientTempMax - 25   (STC reference)
TempDerating = 1 + (TempCoeffPmax / 100 x TempDelta)
```
If `TempDerating < 1` (i.e., hot climate causes power loss):
```
RequiredWattage_Wp = RequiredWattage_Wp / TempDerating
```
- Default `TempCoeffPmax = -0.35 %/C`
- Cell temperature is approximated as `AmbientTemp + 25C` implicitly through using ambient max directly

### 5.5 Number of Panels
**Line 2272**
```
PanelsRequired = ceil(RequiredWattage_Wp / PanelWattage)
```

### 5.6 Cold Voc Calculation
**Lines 2275-2277**
```
TempDeltaCold = AmbientTempMin - 25
VocTempFactor = 1 + (TempCoeffVoc / 100 x TempDeltaCold)
Voc_cold = Voc_STC x VocTempFactor
```
- Default `TempCoeffVoc = -0.27 %/C`
- Cold temperatures INCREASE Voc (negative coefficient applied to negative delta = positive result)

### 5.7 Maximum Panels in Series
**Lines 2280-2282**
```
MaxSeriesVoc = floor((MPPT_MaxVoltage x (1 - VOC_HEADROOM_PERCENT)) / Voc_cold)
MaxSeriesVmp = floor(MPPT_MaxOperatingVoltage / Vmp)
MaxSeriesForMPPT = MIN(MaxSeriesVoc, MaxSeriesVmp)
```
- `VOC_HEADROOM_PERCENT = 0.03` (3% safety margin, Line 1619)

### 5.8 Minimum Panels in Series
**Lines 2285-2288**
```
MinStringVmpBatt = BankVoltage x 1.2
MinStringVmpMPPT = MPPT_MinVoltage
MinStringVmp     = MAX(MinStringVmpBatt, MinStringVmpMPPT)
MinSeriesForMPPT = MAX(1, ceil(MinStringVmp / Vmp))
```

### 5.9 String and Array Electrical Parameters
**Lines 2330-2337**
```
StringVmp  = Vmp x PanelsInSeries
StringVoc  = Voc x PanelsInSeries
StringVocCold = Voc_cold x PanelsInSeries
ArrayImp   = Imp x StringsInParallel
ArrayIsc   = Isc x StringsInParallel
ArrayWattage = PanelWattage x TotalPanels
DeratedOutput = ArrayWattage x TempDerating x (1 - SoilingLoss)
DailyEnergy  = DeratedOutput x PSH
```

### 5.10 PV Array Health Tiers (Advisory Engine)
**Lines 4116-4162**

| Ratio (ArrayOutput / RequiredEnergy) | Status |
|--------------------------------------|--------|
| > 1.5 | Oversized |
| 1.3 - 1.5 | Well-Sized |
| 1.0 - 1.3 | Tight |
| 0.8 - 1.0 | Undersized |
| < 0.8 | Critical |

### 5.11 Cloudy Day Estimate
**Lines 4112-4114**
```
CloudDayOutput = ArrayWattage x 0.25   (25% of rated on heavy cloud)
CloudDayWh = CloudDayOutput x PSH
CloudCoverage% = (CloudDayWh / DailyEnergy) x 100
```

---

## 6. MPPT Validation Formulas

### 6.1 Voltage Window Validation
**Lines 2340-2351, 2408-2422**
```
StringVocCold <= MPPT_MaxVoltage           (HARD BLOCK if violated)
StringVmp between MPPT_MinVoltage and MPPT_MaxOperatingVoltage
```
Headroom calculation:
```
VoltageHeadroom = (MPPT_MaxVoltage - StringVocCold) / MPPT_MaxVoltage
```
- Warning if headroom < 5%

### 6.2 Current Check
**Lines 2425-2436**
```
Isc_with_NEC_margin = ArrayIsc x 1.25    (NEC continuous factor)
Isc_with_NEC_margin <= MPPT_MaxCurrent     (HARD BLOCK if violated)
```
Current headroom:
```
CurrentHeadroom = (MPPT_MaxCurrent - ArrayIsc) / MPPT_MaxCurrent
```

### 6.3 Power Check
**Lines 2439-2445**
```
ArrayWattage <= MPPT_MaxPower x 1.3        (warning if exceeded)
```
- MPPT will clip at its rated power; oversizing up to 130% is common practice

### 6.4 Isc Tolerance for Configuration Validation
**Lines 3301, 3784**
```
Isc_tolerance = Isc x 1.04                (+4% for real-world panel tolerance)
```

### 6.5 MPPT Presets by Inverter VA
**Lines 1521-1535**

| Inverter VA | Max Voc (V) | Max Current (A) | Max Power (W) | Min Startup (V) | Max Operating (V) | Max Charge (A) |
|-------------|------------|-----------------|---------------|-----------------|-------------------|---------------|
| 1000 | 145 | 18 | 1500 | 30 | 130 | 30 |
| 1500 | 145 | 18 | 2000 | 30 | 130 | 40 |
| 2000 | 145 | 18 | 2600 | 30 | 130 | 50 |
| 2400 | 250 | 18 | 3000 | 60 | 230 | 60 |
| 3000 | 450 | 18 | 4500 | 60 | 420 | 80 |
| 3500 | 450 | 22 | 5200 | 60 | 420 | 80 |
| 4000 | 450 | 22 | 5500 | 60 | 420 | 100 |
| 5000 | 500 | 27 | 7500 | 95 | 450 | 120 |
| 6000 | 500 | 30 | 8000 | 95 | 450 | 120 |
| 8000 | 500 | 36 | 10400 | 95 | 450 | 150 |
| 10000 | 500 | 42 | 13000 | 120 | 450 | 180 |
| 12000 | 500 | 50 | 15600 | 120 | 450 | 200 |
| 15000 | 500 | 60 | 19500 | 120 | 450 | 250 |

---

## 7. Cable Sizing Formulas

### 7.1 Minimum Cross-Section for Voltage Drop
**Line 2513**
```
MinArea_mm2 = (Current x CopperResistivity x Length x 2) / AllowedDrop_V
```
Where:
```
AllowedDrop_V = Voltage x MaxDropPercent
```
- `CopperResistivity = 0.0217 ohm*mm2/m` at 75C (Line 1608)
- Factor of 2 accounts for both positive and negative conductors (round trip)

### 7.2 Actual Voltage Drop
**Lines 2562-2564**
```
ActualResistance = CopperResistivity x Length x 2 / EffectiveMm2
ActualDrop_V = Current x ActualResistance
ActualDrop%  = ActualDrop_V / Voltage
```

### 7.3 Voltage Drop Targets
**Lines 1614-1615**

| Circuit Type | Max Voltage Drop |
|-------------|-----------------|
| DC circuits | 3% |
| AC circuits | 2% |
| MPPT-to-Battery | 1.5% (3% x 0.5) |
| Battery-to-Inverter | 1.5% (3% x 0.5) |

### 7.4 NEC 125% Continuous Current Factor
Applied to all cable sizing currents (**Lines 2643, 2654, 2663, 2677, 2686**):
```
DesignCurrent = OperatingCurrent x 1.25
```

### 7.5 Specific Cable Run Currents

| Cable Run | Current Formula | Line |
|-----------|----------------|------|
| PV String Cable | `Isc x 1.25` | 2643 |
| PV Array to MPPT | `ArrayIsc x 1.25` | 2654 |
| MPPT to Battery | `MIN(MPPT_MaxCharge, BattMaxCharge) x 1.25` | 2663 |
| Battery to Inverter | `DC_Surge_Current x 1.25` | 2677 |
| Inverter AC Output | `(ContinuousVA / AC_Voltage) x 1.25` | 2686 |

### 7.6 Copper Weight Estimate
**Line 2715**
```
CopperKg = TotalMm2_x_Length x 0.00894
```
Where `TotalMm2_x_Length = SUM(Mm2 x Length x 2 x ParallelCables)` for all runs.

### 7.7 Metric Cable Sizes (mm2)
**Line 1595**
```
[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240]
```

### 7.8 Metric Cable Ampacity (Copper, PVC, 30C, IEC 60364)
**Lines 1598-1602**

| mm2 | Ampacity (A) |
|-----|-------------|
| 1.5 | 14 |
| 2.5 | 21 |
| 4 | 28 |
| 6 | 36 |
| 10 | 50 |
| 16 | 68 |
| 25 | 89 |
| 35 | 110 |
| 50 | 133 |
| 70 | 171 |
| 95 | 207 |
| 120 | 239 |
| 150 | 272 |
| 185 | 310 |
| 240 | 364 |

### 7.9 AWG Data (Cross-Section, Ampacity)
**Lines 1579-1592**

| AWG | mm2 | Free Air (A) | Conduit (A) |
|-----|-----|-------------|------------|
| 14 | 2.08 | 25 | 20 |
| 12 | 3.31 | 30 | 25 |
| 10 | 5.26 | 40 | 35 |
| 8 | 8.37 | 55 | 50 |
| 6 | 13.30 | 75 | 65 |
| 4 | 21.15 | 95 | 85 |
| 2 | 33.62 | 130 | 115 |
| 1 | 42.41 | 150 | 130 |
| 1/0 | 53.49 | 170 | 150 |
| 2/0 | 67.43 | 195 | 175 |
| 3/0 | 85.01 | 225 | 200 |
| 4/0 | 107.22 | 260 | 230 |

---

## 8. Protection Formulas

### 8.1 Standard Protection Device Sizes
**Lines 2735-2739**

| Device Type | Standard Sizes (A) |
|-------------|-------------------|
| MCCB | 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400 |
| MCB | 6, 10, 16, 20, 25, 32, 40, 50, 63 |
| DC Fuse (Class T/ANL) | 30, 40, 50, 60, 80, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600 |

### 8.2 PV String Fuse
**Line 2786**
```
StringFuseRating = ceil(ArrayIsc / StringsInParallel x 1.56 / 5) x 5
```
- Per NEC 690.9: fuse rating = 1.56 x Isc per string
- Rounded up to next multiple of 5A
- Required only when parallel strings > 1

### 8.3 PV DC Isolator / Breaker
**Lines 2798-2799**
```
PV_Isolator_MinCurrent = ArrayIsc x 1.25
PV_Isolator_Rating     = NextStandardMCB(PV_Isolator_MinCurrent)
PV_Voltage_Rating      = StringVocCold + 50V
```

### 8.4 PV DC SPD (Surge Protection Device)
**Lines 2833-2835**
```
SPD_Rating = Type 2 / (StringVocCold x 1.2) VDC
```

### 8.5 Battery DC MCCB
**Lines 2856-2857**
```
BattMCCB_MinCurrent = MaxDischargeCurrent x 1.25
BattMCCB_Rating     = NextStandardMCCB(BattMCCB_MinCurrent)
```

### 8.6 Battery Backup Fuse
**Lines 2888-2889**
```
BattFuseCalc  = BattMCCB_Rating x 1.5
BattFuseRating = NextStandardDCFuse(BattFuseCalc)
```

### 8.7 AC Output MCB
**Lines 2914-2915**
```
AC_MCB_MinCurrent = (ContinuousVA / AC_Voltage) x 1.25
AC_MCB_Rating     = NextStandardMCB(AC_MCB_MinCurrent)
```

### 8.8 Automatic Voltage Regulator (AVR) Sizing
**Lines 2957-2958**
```
AVR_Required = ContinuousVA x 1.2   (20% margin)
AVR_Rating   = NextStandardAVRSize(AVR_Required)
```
Standard AVR sizes: 1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000 VA

### 8.9 Earthing Requirements
**Lines 2974-2990**
- Equipment earth: 6mm2 minimum copper (green/yellow)
- Earth electrode: Copper-bonded steel rod, minimum 1.5m
- Target impedance: < 10 ohm

---

## 9. System Losses Formulas

### 9.1 Component Efficiencies
**Lines 3007-3021**
```
InverterEfficiency       = 0.93  (93%)
BatteryRoundTrip         = ChargeEfficiency x DischargeEfficiency
MPPT_Efficiency          = 0.98  (98%)
PV_TempDerating          = |TempCoeffPmax / 100 x (AmbientTempMax - 25)|
PV_SoilingLoss           = 0.03  (3%)
PV_MismatchLoss          = 0.02  (2%)
DC_CableLoss             = 0.02  (2%)
AC_CableLoss             = 0.01  (1%, = CableLossFactor / 2)
```

### 9.2 Total Loss Aggregation
**Lines 3023-3027**
```
TotalDCLosses = PV_TempDerating + SoilingLoss + MismatchLoss + DC_CableLoss
TotalACLosses = AC_CableLoss + (1 - InverterEfficiency)

OverallEfficiency = (1 - TotalDCLosses) x BatteryRoundTrip x InverterEfficiency x (1 - AC_CableLoss)
```

### 9.3 Energy Margin
**Lines 3030-3033**
```
GrossPVEnergy    = DeratedOutput x PSH
NetAvailableEnergy = GrossPVEnergy x OverallEfficiency
EnergyMargin%    = ((NetAvailableEnergy - DailyLoadRequirement) / DailyLoadRequirement) x 100
```

---

## 10. Motor-Specific Factors

### 10.1 Adaptive Surge Multiplier — Motor Sub-Types (16 Categorized)
**Lines ~2011-2030**

Context-aware surge factors replacing the previous flat 6-type system with blind worst-case oversizing. Organized in 4 categories:

**Sewing Machine:**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| clutch | 0.60 (60%) | 4.0x | 0.70 | DOL |
| servo | 0.90 (90%) | 1.5x | 0.85 | VFD |

**Compressor (Fridge/Freezer/AC):**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| compressor_inverter | 0.92 (92%) | **2.0x** | 0.85 | VFD |
| compressor_modern | 0.85 (85%) | **3.5x** | 0.75 | DOL |
| compressor_old | 0.75 (75%) | **5.0x** | 0.65 | DOL |
| compressor_unknown | 0.80 (80%) | **4.0x** | 0.70 | DOL |

**Pump:**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| pump_softstart | 0.85 (85%) | **2.5x** | 0.80 | Soft Start |
| pump_surface | 0.80 (80%) | **3.5x** | 0.75 | DOL |
| pump_submersible | 0.78 (78%) | **5.0x** | 0.70 | DOL |
| pump_deepwell | 0.75 (75%) | **6.0x** | 0.65 | DOL |
| pump_unknown | 0.78 (78%) | **5.0x** | 0.70 | DOL |

**Other Motors:**

| Sub-Type | Efficiency | Surge Factor | Power Factor | Start Method |
|----------|-----------|-------------|-------------|-------------|
| fan | 0.85 (85%) | **2.5x** | 0.70 | DOL |
| washing_machine | 0.80 (80%) | **3.5x** | 0.65 | DOL |
| blender | 0.80 (80%) | **4.0x** | 0.70 | DOL |
| general | 0.85 (85%) | **4.0x** | 0.70 | DOL |

**Surge severity color coding** (used in UI hints and appliance table):
- Green: ≤2.0x (inverter compressors, servo motors, soft-start pumps)
- Yellow: ≤3.5x (modern compressors, surface pumps, washing machines)
- Orange: ≤4.0x (unknown motors, blenders, general)
- Red: >4.0x (old compressors, submersible/deep well pumps)

### 10.2 Load Type Defaults
**Lines ~1997-2002**

| Load Type | Default Surge Factor | Default Power Factor |
|-----------|---------------------|---------------------|
| Resistive | 1.0 | 1.0 |
| Electronic | 1.2 | 0.95 |
| Motor | **4.0** (changed from 6.0 — sensible unknown default, not worst-case) | 0.80 |
| Mixed | 2.0 | 0.90 |

### 10.3 Industrial Detection
**Lines 1816-1819, 5401-5407**
```
IndustrialMotor = motor with RatedPowerW > 400
IndustrialSewing = sewing machine with RatedPowerW > 400
```
Industrial detection affects: compliance risk, minimum inverter floors, buffer percentages, servo upgrade advice.

---

## 11. Charge Time & PV Split Formulas

### 11.1 Charge Time (with daytime loads)
**Lines 4000-4014**
```
PeakPVOutput   = ArrayWattage x 0.80     (realistic derating)
AvgDaytimeLoadW = DaytimeEnergy_Wh / PSH
NetChargePower  = MAX(PeakPVOutput - AvgDaytimeLoadW, 0)
ChargeCurrent   = NetChargePower / BankVoltage
EffectiveChargeCurrent = MIN(ChargeCurrent, MaxChargeCurrent)
ChargeEfficiency = 0.92
FullChargeHours = TotalCapacity_Ah / (EffectiveChargeCurrent x ChargeEfficiency)
```

### 11.2 Daily Charge from PV
**Lines 4013-4015**
```
DailyChargeWh    = NetChargePower x PSH x ChargeEfficiency
DailyChargePercent = (DailyChargeWh / UsableCapacity_Wh) x 100
```

### 11.3 Charge Time (battery-only PV sizing)
**Lines 4031-4036**
```
ChargeOnlyCurrent = PeakPVOutput / BankVoltage
ChargeOnlyTime    = TotalCapacity_Ah / (ChargeOnlyCurrent x 0.92)

NetIfLoadsRun     = MAX(PeakPVOutput - AvgDaytimeLoadW, 0)
ActualChargeTime  = TotalCapacity_Ah / ((NetIfLoadsRun / BankVoltage) x 0.92)
```

---

## 12. Panel Specification Validation

### 12.1 Power Validation (Vmp x Imp check)
**Lines 4437-4443**
```
CalculatedPower = Vmp x Imp
Tolerance       = 3%     (0.03)
PercentDiff     = |CalculatedPower - RatedWattage| / RatedWattage
```
Fails if `PercentDiff > 0.03`

### 12.2 Ratio Checks (Warnings)
**Lines 4456-4463**
```
Voc/Vmp ratio: typical 1.15-1.25 (warning if outside 1.10-1.35)
Isc/Imp ratio: typical 1.05-1.10 (warning if outside 1.02-1.15)
```

### 12.3 Panel Spec Presets by Wattage (STC)
**Lines 1501-1518**

| Wattage (Wp) | Vmp (V) | Voc (V) | Imp (A) | Isc (A) | TempCoeff Pmax (%/C) | TempCoeff Voc (%/C) |
|------|---------|---------|---------|---------|---------------------|---------------------|
| 50 | 18.2 | 22.0 | 2.75 | 2.95 | -0.40 | -0.30 |
| 100 | 18.4 | 22.5 | 5.43 | 5.75 | -0.39 | -0.29 |
| 150 | 18.6 | 23.0 | 8.06 | 8.55 | -0.38 | -0.28 |
| 200 | 24.5 | 30.2 | 8.16 | 8.68 | -0.37 | -0.28 |
| 250 | 30.5 | 37.0 | 8.20 | 8.72 | -0.37 | -0.28 |
| 300 | 32.8 | 39.8 | 9.15 | 9.72 | -0.36 | -0.27 |
| 330 | 34.0 | 41.2 | 9.71 | 10.30 | -0.36 | -0.27 |
| 350 | 35.2 | 42.5 | 9.94 | 10.55 | -0.35 | -0.27 |
| 370 | 35.8 | 43.5 | 10.34 | 10.95 | -0.35 | -0.27 |
| 400 | 41.0 | 49.0 | 9.76 | 10.36 | -0.35 | -0.27 |
| 450 | 41.5 | 49.8 | 10.84 | 11.50 | -0.34 | -0.27 |
| 500 | 42.0 | 50.5 | 11.90 | 12.65 | -0.34 | -0.26 |
| 540 | 42.5 | 51.2 | 12.71 | 13.48 | -0.34 | -0.26 |
| 550 | 42.8 | 51.5 | 12.85 | 13.63 | -0.34 | -0.26 |
| 600 | 43.5 | 52.5 | 13.79 | 14.60 | -0.33 | -0.26 |
| 700 | 44.0 | 53.5 | 15.91 | 16.85 | -0.33 | -0.25 |

### 12.4 Auto-Interpolation for Non-Standard Wattages
**Lines 4947-4959**
```
ratio = (Wattage - LowerPreset) / (UpperPreset - LowerPreset)
Vmp = LowerVmp + ratio x (UpperVmp - LowerVmp)
Voc = LowerVoc + ratio x (UpperVoc - LowerVoc)
Imp = Wattage / Vmp
Isc = Imp x 1.06
```

---

## 13. Configuration Comparison Scoring

### 13.1 Configuration Score Formula
**Lines 3349-3351**
```
Score = VocMargin x 0.3
      + CurrentMargin x 0.3
      + (100 - |PowerUtilization% - 70|) x 0.2
      - ExtraPanelPenalty
```
Where:
```
VocMargin      = (1 - StringVocCold / MPPT_MaxVoltage) x 100
CurrentMargin  = (1 - ArrayIscTol / MPPT_MaxCurrent) x 100
PowerUtilization = TotalPower / MPPT_MaxPower x 100
ExtraPanelPenalty = |ActualPanels - RequestedPanels| x 10
```
- Optimal power utilization is ~70% of MPPT capacity
- Higher Voc and current margins are preferred (0.3 weight each)

### 13.2 Multi-MPPT Distribution Scoring
**Lines 3667-3676**
```
TotalScore = SUM(individual MPPT scores) - PanelDeviation x 5
PanelDeviation = |TotalActualPanels - RequestedPanels|
```

---

## 14. Panel Mismatch Analysis

### 14.1 Mismatch Spread Calculation
**Lines 4698-4701**
```
MinW = MIN(all panel wattages)
MaxW = MAX(all panel wattages)
AvgW = SUM(all wattages) / count
Spread% = ((MaxW - MinW) / AvgW) x 100
```

### 14.2 Mismatch Tolerance Tiers
**Lines 4711-4716**

| Spread | Status | Expected Energy Loss |
|--------|--------|---------------------|
| <= 5% | Acceptable | < 3% |
| 5-10% | Marginal | 5-8% |
| > 10% | Excessive | 10-20% |

---

## 15. Location / Region Profiles (REGION_PROFILES)
**Lines 1367-1396**

v3.0.0 replaced the 4-entry `LOCATIONS` constant with a 12-entry `REGION_PROFILES` constant. Each profile carries: `acVoltage`, `frequency`, `phaseType`, `inverterMarket`, `avgPSH`, `temps` (min/max), `climate`, `regulatoryNote`, optional `gridNote`.

| Profile Key | Region | PSH | Temp Min (C) | Temp Max (C) | AC Voltage | Freq | Phase | Market | Climate |
|-------------|--------|-----|-------------|-------------|-----------|------|-------|--------|---------|
| lagos_ng | Lagos, Nigeria | 4.5 | 20 | 35 | 230V | 50Hz | single | EMERGING_OFFGRID | tropical_hot |
| nairobi_ke | Nairobi, Kenya | 5.5 | 10 | 28 | 240V | 50Hz | single | EMERGING_OFFGRID | tropical_moderate |
| accra_gh | Accra, Ghana | 4.8 | 22 | 33 | 230V | 50Hz | single | EMERGING_OFFGRID | tropical_hot |
| us_south | US South | 5.5 | 0 | 40 | 240V | 60Hz | split | US_SPLIT_PHASE | hot_arid |
| us_north | US North | 4.0 | -15 | 35 | 240V | 60Hz | split | US_SPLIT_PHASE | cold_temperate |
| brazil | Brazil | 5.0 | 15 | 38 | 220V | 60Hz | single | EMERGING_OFFGRID | tropical_hot |
| eu_central | EU Central | 3.5 | -10 | 30 | 230V | 50Hz | single | EU_SINGLE_PHASE | cold_temperate |
| eu_south | EU South | 5.0 | 0 | 40 | 230V | 50Hz | single | EU_SINGLE_PHASE | mixed |
| india | India | 5.5 | 10 | 45 | 230V | 50Hz | single | EMERGING_OFFGRID | hot_arid |
| uae | UAE | 6.5 | 15 | 50 | 220V | 50Hz | single | EMERGING_OFFGRID | hot_arid |
| australia | Australia | 5.5 | 5 | 42 | 230V | 50Hz | single | EU_SINGLE_PHASE | mixed |
| generic | Generic (Global) | 4.5 | -10 | 45 | 230V | 50Hz | single | EMERGING_OFFGRID | mixed |

---

## 16. Appliance Auto-Detection Presets (Adaptive Surge)
**Lines ~2034-2064**

Variant-specific patterns are listed **before** generic patterns — first match wins. New `motorSubType` field drives the adaptive surge system.

**Motor Appliances (with adaptive surge — motorSubType field):**

| Pattern (regex) | Watt | Motor SubType | Surge | PF | Duty% | Hours |
|----------------|------|--------------|-------|-----|-------|-------|
| sewing.*servo | 250 | servo | 1.5x | 0.85 | 60 | 8 |
| industrial.*sew | 550 | clutch | 4.0x | 0.70 | 60 | 8 |
| sewing (generic) | 250 | clutch | 4.0x | 0.70 | 60 | 8 |
| **inverter fridge/freezer** | 150 | **compressor_inverter** | **2.0x** | 0.85 | 40 | 24 |
| **old fridge/freezer** | 150 | **compressor_old** | **5.0x** | 0.65 | 40 | 24 |
| fridge/refrigerator (generic) | 150 | **compressor_unknown** | **4.0x** | 0.70 | 40 | 24 |
| freezer (generic) | 200 | **compressor_unknown** | **4.0x** | 0.70 | 45 | 24 |
| inverter AC | 1200 | **compressor_inverter** | **2.0x** | 0.90 | 60 | 10 |
| air conditioner (generic) | 1500 | **compressor_unknown** | **4.0x** | 0.75 | 65 | 10 |
| **submersible pump** | 750 | **pump_submersible** | **5.0x** | 0.70 | 100 | 4 |
| **borehole/deep well pump** | 1100 | **pump_deepwell** | **6.0x** | 0.65 | 100 | 6 |
| **surface/booster pump** | 550 | **pump_surface** | **3.5x** | 0.75 | 100 | 4 |
| **soft start/VFD pump** | 750 | **pump_softstart** | **2.5x** | 0.80 | 100 | 4 |
| water pump (generic) | 750 | **pump_unknown** | **5.0x** | 0.70 | 100 | 4 |
| washing machine | 500 | **washing_machine** | **3.5x** | 0.65 | 80 | 2 |
| ceiling fan | 75 | **fan** | **2.5x** | 0.70 | 100 | 10 |
| blender/grinder | 500 | **blender** | **4.0x** | 0.70 | 50 | 0.5 |

**Non-Motor Appliances (unchanged):**

| Pattern (regex) | Watt | Type | Surge | PF | Duty% | Hours |
|----------------|------|------|-------|-----|-------|-------|
| LED/light/bulb | 10 | electronic | 1.2x | 0.90 | 100 | 6 |
| TV | 100 | electronic | 1.3x | 0.95 | 100 | 5 |
| laptop/computer | 80 | electronic | 1.2x | 0.95 | 100 | 8 |
| phone charger | 20 | electronic | 1.0x | 0.90 | 100 | 3 |
| router/modem | 15 | electronic | 1.0x | 0.95 | 100 | 24 |
| decoder/DSTV | 25 | electronic | 1.1x | 0.90 | 100 | 8 |
| iron/pressing | 1200 | resistive | 1.0x | 1.00 | 50 | 2 |
| kettle/boiler | 2000 | resistive | 1.0x | 1.00 | 100 | 0.5 |
| microwave | 1000 | mixed | 2.0x | 0.90 | 100 | 0.5 |
| toaster | 800 | resistive | 1.0x | 1.00 | 100 | 0.3 |
| heater | 1500 | resistive | 1.0x | 1.00 | 100 | 6 |

---

## 17. Seasonal & Weather Performance Factors
**Lines 4181-4190**

v3.0.0: Seasonal text is now climate-aware, adapting terminology to the region profile's climate zone.

| Condition | Output Factor | Climate Context |
|-----------|--------------|----------------|
| Clear day | 100% (rated PSH x derated array) | All climates |
| Hazy/Dust (Harmattan, sandstorm, smog) | 60% | tropical_hot, hot_arid |
| Winter low-angle sun | 60% | cold_temperate |
| Heavy cloud/rain | 25% | All climates |

---

## 18. Constants Summary

All system constants from **Lines 1607-1619**:

| Constant | Symbol | Value | Unit |
|----------|--------|-------|------|
| Copper Resistivity (75C) | COPPER_RESISTIVITY | 0.0217 | ohm*mm2/m |
| STC Temperature | STC_TEMP | 25 | C |
| Continuous Load Factor | CONTINUOUS_LOAD_FACTOR | 1.25 | - (renamed from NEC_CONTINUOUS_FACTOR in v3.0.0) |
| Inverter Derating | INVERTER_DERATING | 0.80 | - |
| Inverter Efficiency | INVERTER_EFFICIENCY | 0.93 | - |
| MPPT Efficiency | MPPT_EFFICIENCY | 0.98 | - |
| DC Voltage Drop Target | DC_VOLTAGE_DROP_TARGET | 0.03 | (3%) |
| AC Voltage Drop Target | AC_VOLTAGE_DROP_TARGET | 0.02 | (2%) |
| PV Soiling Loss | PV_SOILING_LOSS | 0.03 | (3%) |
| PV Mismatch Loss | PV_MISMATCH_LOSS | 0.02 | (2%) |
| Cable Loss Factor | CABLE_LOSS_FACTOR | 0.02 | (2%) |
| Voc Headroom | VOC_HEADROOM_PERCENT | 0.03 | (3%) |

---

## 19. Upgrade Simulator Load Growth Analysis
**Lines 3257-3277**

For each candidate new load:
```
NewDailyWh = CurrentDailyWh + (NewLoadW x NewLoadHours)
NewPeakVA  = CurrentPeakVA + (NewLoadW x NewLoadSurgeFactor)
```
Feasibility checks:
```
InverterOK = NewPeakVA <= InverterVA x SurgeMultiplier
BatteryOK  = NewDailyWh <= TotalCapacity_Wh x MaxDoD
PV_OK      = NewDailyWh <= PV_DailyEnergy x 0.90
```

---

## 20. Coping Score (Undersized Equipment Assessment)

When manual override is active and equipment is undersized, a weighted score is computed:

```
InvUsableW    = ManualInverterVA × INVERTER_DERATING (0.8)
ContNeeded    = designContinuousVA (or peakSimultaneousVA)
InvRatio      = min(InvUsableW / ContNeeded, 1.0)

SurgeNeeded   = highestSurgeVA (or designSurgeVA)
SurgeCap      = ManualInverterVA × SurgeMultiplier (default 2.0)
SurgeRatio    = min(SurgeCap / SurgeNeeded, 1.0)

AutoAh        = autoSuggestedAh (or current totalCapacityAh if not overridden)
BattRatio     = min(totalCapacityAh / AutoAh, 1.0)

CopingScore   = (InvRatio × 0.40 + SurgeRatio × 0.25 + BattRatio × 0.35) × 100
```

**Interpretation:**
- >= 95%: Not shown (equipment is adequate)
- 75-94%: Green "Manageable" — works with careful load management
- 50-74%: Orange "Tight" — significant scheduling needed
- < 50%: Red "Critical" — severely undersized

---

## 21. Grid Charging Calculations

```
GridChargeW     = GridMaxChargeA × BankVoltage
GridChargeHours = TotalCapacityAh / (GridMaxChargeA × 0.92)
SafeChargeA     = min(GridMaxChargeA, TotalCapacityAh × 0.3)
```

The 0.92 factor accounts for charging efficiency losses. SafeChargeA recommendation limits charge rate to 0.3C for battery longevity.

---

---

## 19. Mixed Panel Wattage Correction (v3.1.0)

### 19.1 Array Wattage with Mismatch

When mixed panel wattages are enabled, the array wattage is the **actual sum** of all individual panel wattages, not `totalPanels * singleWattage`:

```
ArrayWattage = Sum(Wi)  for i = 1..N panels
```

Previously: `ArrayWattage = N * Wpanel` (homogeneous assumption). This is now corrected when `mismatchData.totalW` is available.

### 19.2 Mismatch Spread
```
Spread% = ((MaxW - MinW) / AvgW) * 100
```
- <=5%: Acceptable (industry standard, <3% energy loss)
- 5-10%: Marginal (5-8% energy loss)
- >10%: Excessive (10-20% energy loss, separate strings recommended)

---

## 20. Mixed Battery Bank Topology (v3.1.0)

### 20.1 Parallel Group Ah

Batteries of the same voltage are paralleled to increase capacity:
```
ParallelGroupAh = Sum(Ahi * Qtyi)  for all batteries at voltage V
```

### 20.2 Series Chain — Effective Bank

Multiple voltage groups are connected in series to achieve target bank voltage:
```
EffectiveBankVoltage = Sum(Vgroup_j)  for j = 1..M voltage groups
EffectiveBankAh = Min(ParallelGroupAh_j)  for j = 1..M groups
```

The effective Ah is limited by the **smallest parallel group** in the series chain — the weakest link principle. Excess capacity in larger groups is wasted.

### 20.3 Battery Series Strings (Manual Display)
```
SeriesCount = BankVoltage / UnitVoltage
```
Example: 24V bank / 12V unit = 2 batteries in series per string.

### 20.4 Battery Age Advisory Thresholds

| Condition | Advisory Level | Reason |
|---|---|---|
| Age difference > 2 years | WARNING | Internal resistance mismatch → uneven charge/discharge |
| Any battery > 3 years | ADVISORY | Lead-acid loses 10-20% capacity/year after year 3 |
| Chemistry mismatch | WARNING/CRITICAL | Different charge profiles, gassing behavior, float voltages |

### 20.5 Chemistry Charge Voltage Incompatibility

| Chemistry | Absorption Voltage (12V) | Float Voltage (12V) |
|---|---|---|
| Flooded | 14.4 - 14.8V | 13.2 - 13.5V |
| AGM | 14.4 - 14.7V | 13.4 - 13.6V |
| Gel | 14.1 - 14.4V | 13.5 - 13.8V |
| LiFePO4 | 14.4 - 14.6V (CC/CV) | No float (disconnect at full) |

Mixing chemistries with different voltage profiles causes one type to be chronically over/undercharged, leading to premature failure.

---

*Document generated from `pv_calculator_ui.html`. All formulas verified against source code. Updated for v3.1.0 features (mixed panel wattage correction, dynamic grouped panel input, mixed battery bank topology analysis, battery chemistry/age advisory system, PDF advisory limit removal) Round 3 additions (adaptive surge, inverter technology, SVG overflow, battery mixed bank fixes), and Round 4 additions (panel orientation/tilt correction factors, system confidence score, PV orientation advisory).*

---

## Round 2 Formulas: Managed Practical Engines

### Managed Practical Inverter Sizing

```
ManagedContinuousVA = sum(continuous_simultaneous_VA) + sum(daily_simultaneous_VA) + max(non_simultaneous_VA)
  — Excludes weekly and rare loads from peak demand

ManagedSurgeVA = ManagedContinuousVA + max_single_motor_surge_delta
  — Only one motor surges at a time (operator staggers starts)

ManagedMinVA = max(ManagedContinuousVA / INVERTER_DERATING, ManagedSurgeVA / SURGE_MULTIPLIER)
ManagedSizeVA = selectInverterSize(ManagedMinVA)
```

### Risk Assessment (Managed vs User's Inverter)

```
techBonus = (inverterTechnology === 'transformer') ? 0.05 : 0
ratio = (ManagedSizeVA / UserVA) - techBonus
GREEN:  ratio ≤ 0.70  (30%+ headroom — comfortable)
YELLOW: ratio ≤ 0.85  (adequate with discipline)
ORANGE: ratio ≤ 1.00  (tight — strict discipline required)
RED:    ratio > 1.00  (upgrade required)
```

**Inverter Technology Modifier:** Transformer-based (low-frequency) inverters handle surge better due to transformer mass. The 5% favorable shift means a transformer inverter at the same VA rating gets a slightly better risk classification than a transformerless (high-frequency) inverter.

### Inverter Technology Surge Tolerance

```
InverterSurgeCapacity = InverterVA × SurgeMultiplier
```

| Technology | Surge Multiplier | Description |
|-----------|-----------------|-------------|
| Unknown / Default | 2.0x | Conservative assumption |
| Transformer-based / LF | **2.5x** | Better surge handling |
| Transformerless / HF | 2.0x | Standard surge handling |

Selecting inverter technology auto-sets the surge multiplier field in the UI.

### Inverter Technology — Output-Layer Rendering

The selected technology is surfaced in 3 output locations (render-layer only, no engine changes):

**1. Inverter Tab (~line 11235):**
```
invTechVal = config.inverterTechnology || 'unknown'
invTechSurge = (invTechVal === 'transformer') ? '2.5' : '2.0'
```
Renders: technology label, surge tolerance factor, contextual note. Color: green (transformer), amber (transformerless), grey (unknown).

**2. Managed Practical Section (~line 11148):**
```
managedTech = managed.inverterTechnology || config.inverterTechnology || 'unknown'
managedMotorCount = managed.classification?.motors || 0
// Only renders when managedMotorCount > 0
```
- Transformer: green tag — "Managed option valid — 2.5x surge tolerance"
- Transformerless: amber warning — "Higher probability of overload during motor start"
- Unknown: grey prompt to select technology

**3. SmartAdvisoryEngine (~line 5807):**
```
totalMotorCount = appliances.filter(a => a.loadType === 'motor').length
// Only generates advisory when totalMotorCount >= 1
```
| Technology | Severity | Title |
|-----------|----------|-------|
| Transformer | info | Good Motor Surge Handling |
| Transformerless | warning | Tighter Overload Tolerance |
| Unknown | info | Inverter Technology Not Specified |

Each advisory message reports the motor count and provides actionable guidance specific to the technology type.

### Risk Index (Universal — Engineering vs Practical)

```
deviation = max(0, 1 - practicalValue / engineeringValue) × 100%
GREEN:  deviation ≤ 15%
YELLOW: deviation 15-30%
ORANGE: deviation 30-50%
RED:    deviation > 50%
```

### Battery Practical Sizing

```
NighttimeEssentialWh = sum(continuous_and_daily_loads × nightFraction)
  where nightFraction = 1 - (daytimeRatio / 100)

PracticalAutonomy = max(0.5, engineeringAutonomy × 0.5)

PracticalEnergyWh = NighttimeEssentialWh × PracticalAutonomy
PracticalNominalWh = PracticalEnergyWh / (DoD × DischargeEfficiency)
PracticalAh = PracticalNominalWh / BankVoltage

Savings% = (1 - PracticalAh / EngineeringAh) × 100
```

### PV Practical Sizing

```
DaytimeDirectWh = sum(daytime_only + weekly + rare loads daily Wh)
                + sum(continuous/daily loads × daytimeFraction)

NighttimeViaBatteryWh = sum(continuous/daily loads × nightFraction)

BattRechargeWh = PracticalBatteryWh / ChargeEfficiency

PracticalPVEnergyWh = (DaytimeDirectWh + NighttimeViaBatteryWh) / SystemEfficiency
                    + BattRechargeWh / AutonomyDays
                    × DesignMargin%

PracticalWp = PracticalPVEnergyWh / PSH / TempDerating
PracticalPanels = ceil(PracticalWp / PanelWattage)

Savings% = (1 - PracticalPanels / EngineeringPanels) × 100
```

### Per-Appliance Behavior Classification

| Attribute | Values | Used By |
|-----------|--------|---------|
| dutyFrequency | continuous, daily, weekly, rare | ManagedModeEngine, BatteryPracticalEngine, PVPracticalEngine |
| canStagger | yes, no, na | ManagedModeEngine (motor start sequencing) |
| isDaytimeOnly | yes, no | All practical engines (load shifting) |

---

## Round 3 Formulas: Adaptive Surge & Battery Mixed Rendering

### Adaptive Surge Factor Selection

The surge factor for a motor appliance is determined by a priority chain:

```
1. If motorSubType is set and exists in MOTOR_SUBTYPES:
     SurgeFactor = MOTOR_SUBTYPES[motorSubType].surgeFactor

2. Else if APPLIANCE_PRESETS matched (first-match-wins regex):
     SurgeFactor = preset.surgeFactor
     motorSubType = preset.motorSubType (if present)

3. Else fallback to LOAD_TYPE_DEFAULTS:
     SurgeFactor = LOAD_TYPE_DEFAULTS.motor.surgeFactor = 4.0  (was 6.0)
```

**Example: "inverter fridge" vs "fridge"**
```
"inverter fridge" → regex: /inverter\s*(fridge|freezer|refrigerator)/i
  → motorSubType: compressor_inverter
  → surgeFactor: 2.0x  (3x less than old blanket 6.0x)

"fridge" → regex: /refrigerator|fridge/i
  → motorSubType: compressor_unknown
  → surgeFactor: 4.0x  (33% less than old blanket 6.0x)
```

### Battery Mixed Bank — Rendering Grid Layout

When `battery.isMixedBank && battery.mixedBankData`:

```
totalBatteries = mixedBankData.totalUnits  (NOT batteriesInSeries × parallelStrings)

battGridCols = mixedBankData.totalUnits  (all units in single row)
battGridRows = 1

perBattUnits[] = flatten(mixedBankData.groups.map(g =>
    repeat(g.qty times, { ah: g.ah, voltage: g.voltage, fill: colorByAh })
))
```

**Property note:** Battery groups from `analyzeMixedBattery()` use `.qty` for unit count. Panel mismatch groups use `.count`. The defensive pattern `(g.qty || g.count || 1)` is used where data source may vary.

### Dynamic Inverter Technology Recalculation

When user changes the `inverterTechnology` dropdown and results already exist:
```
onchange handler:
  1. Set inverterSurgeMultiplier (2.5 for transformer, 2.0 for others)
  2. If PVCalculator.results exists → PVCalculator.calculate()
     → Full recalculation triggers, updating:
       - Coping Score (surgeRatio uses config.inverterSurgeMultiplier)
       - Advisory Tab (SmartAdvisoryEngine reads config.inverterTechnology)
       - Inverter Tab technology display
       - Managed Practical tech constraint tag
       - PDF data (all technology-aware sections refresh)
```

### PDF Inverter Technology Integration

```
Inverter Detail Section:
  labelValue('Inverter Technology:', pdfInvTechLabel + ' — Surge Tolerance: ' + pdfInvTechSurge)

Managed Practical Section (when motors > 0 and tech ≠ unknown):
  labelValue('Inverter Tech:', techImpact)
  — transformer: "2.5x surge tolerance, 5% favorable risk shift applied"
  — transformerless: "2.0x surge tolerance, strict load staggering essential"

Coping Score Section (when tech ≠ unknown):
  mutedText: technology label + surge tolerance + operational note
```

### SVG Overview Overflow Prevention

```
Battery title (mixed bank): Split into 2 lines
  Line 1: "Battery Bank — [chemistry]" (font-size 10, bold)
  Line 2: "[mixedDesc] = [voltage]V/[Ah]Ah" (font-size 8.5)

Inverter box: rightColWPre increased 220→260, clipPath added
  Font sizes reduced: 9→8.5, 8.5→8, 8→7.5

PV box: clipPath added, title font adaptive (11 for short, 9 for >55 chars)
  Spec text font sizes reduced: 9→8.5, 8→7.5
```

---

## Round 4 Formulas (Implemented): Orientation, Tilt, System Confidence

### Panel Orientation Correction Factor

```
ORIENTATION_FACTORS = {
    south:    1.00,   // Optimal — directly faces equatorial sun
    se_sw:    0.95,   // 5% loss — acceptable compromise
    east_west: 0.90,  // 10% loss — common in Nigeria urban rooftops
    flat:     0.92,   // 8% loss — no tilt, self-cleaning issues
    unknown:  0.93    // Conservative assumption
}

AdjustedRequiredWp = RequiredWp / orientationFactor
```

### Tilt Correction Factor

```
TILT_FACTORS = {
    optimal:  1.00,   // Latitude-matched tilt (e.g., ~7° for Lagos, ~10° for Abuja)
    low:      0.95,   // <10° — common on flat roofs with minimal racking
    high:     0.97,   // >40° — steep pitch roofs, slight efficiency loss
    unknown:  0.97    // Conservative assumption
}

CombinedPVFactor = orientationFactor × tiltFactor
FinalRequiredWp = BasePV / CombinedPVFactor
```

**Application point:** After temperature derating, before `panelsRequired = ceil(requiredWattage / panel.wattage)`

### System Confidence Score (Aggregate)

```
// Collect per-component risk deviations (0-100%)
invDeviation  = max(0, 1 - practicalInvVA / engineeringInvVA) × 100
battDeviation = max(0, 1 - practicalBattAh / engineeringBattAh) × 100
pvDeviation   = max(0, 1 - practicalPanels / engineeringPanels) × 100

// Weighted aggregate (inverter most critical, then battery, then PV)
weightedDeviation = invDeviation × 0.40 + battDeviation × 0.35 + pvDeviation × 0.25

// Convert to confidence (100% = perfect match, 0% = total mismatch)
confidenceScore = max(0, 100 - weightedDeviation)

// Classification
HIGH:      confidenceScore ≥ 85  (all components within 15% of engineering)
MODERATE:  confidenceScore ≥ 65  (some practical compromises)
MANAGED:   confidenceScore ≥ 45  (requires active load management)
STRESS:    confidenceScore < 45  (significant risk — recommend upgrades)
```

**Display locations:** Summary grid card, SVG Overview pill badge (top-right), PDF page 1 colored banner.

**Normalization consistency:** All three deviations use the same `calculateRiskIndex()` function (`deviation = max(0, round((1 - practical/engineering) × 100))`), ensuring uniform scale.

### PV Orientation/Tilt Advisory

```
pvCombinedFactor = orientationFactor × tiltFactor
lossPct = round((1 - pvCombinedFactor) × 100)
extraPanelsPct = round((1 / pvCombinedFactor - 1) × 100)

// Advisory generated when pvCombinedFactor < 1.0
severity = lossPct >= 10 ? 'warning' : 'info'
category = 'PV Orientation'
```

Context-specific tips:
- East/West: "Consider split-array with morning/afternoon coverage"
- Flat: "Periodic panel cleaning recommended"

### Application Order in PVArrayEngine

```
1. requiredPVEnergy = dailyEnergyWh / systemEfficiency    (base)
2. requiredPVEnergy += batteryRechargeWh / autonomyDays    (recharge)
3. requiredPVEnergy *= designMargin / 100                  (margin)
4. requiredWattage = requiredPVEnergy / PSH                (convert to Wp)
5. requiredWattage /= tempDerating                         (temperature)
6. requiredWattage /= combinedPVFactor                     (orientation + tilt)  ← NEW
7. panelsRequired = ceil(requiredWattage / panelWattage)   (final)
```

---

## Round 5: Cable Type Advisory System

### Cable Type Selection Principle

Cable type (construction) is determined by application context, independent of cable size calculations:

```
Cable Type = f(circuit type, current level, environment, termination method)
Cable Size  = f(current, voltage drop, ampacity, length)
```

These are orthogonal concerns. The bot calculates **size** (Phase 7: CableSizingEngine) and advises on **type** (output layer: renderCablesTab).

### Per-Run Cable Type Advisory Logic

```
getCableTypeAdvisory(run):
  if run.isDC:
    if name contains 'battery' AND 'inverter':
      → "Flexible fine-strand copper, crimped lugs, keep short"
    if name contains 'mppt' AND 'battery':
      → "Flexible copper, short direct routing"
    if name contains 'pv':
      → "UV-resistant solar cable (PV1-F / H1Z2Z2-K)"
    else:
      → "Flexible copper with appropriate DC voltage rating"
  else (AC):
    → "Standard installation-grade cable, sized for phase current, in conduit/trunking"
```

### Engineering Basis

| Circuit | Cable Type | Why |
|---------|-----------|-----|
| PV string | UV-resistant double-insulated solar cable | Outdoor exposure, temperature cycling |
| MPPT → Battery | Flexible fine-strand copper | High charge current, short run, termination stress |
| Battery → Inverter | Flexible fine-strand copper | Highest DC current in system, vibration tolerance, crimp quality critical |
| Inverter → Load | Standard installation cable (solid/stranded) | Fixed routing, lower current (higher voltage), conduit-mounted |

### Global Principle
Cable selection is determined by: current level, voltage rating, insulation class, and installation conditions — not merely AC or DC designation.

---

## Round 6: Commercial Power Architecture Layer

**Source area:** `CommercialArchitectureEngine` in generated `pv_calculator_ui.html` (~Line 8805) plus architecture rendering in `renderCommercialArchitecturePanel()` (~Line 14938), `renderOverviewTab()` (~Line 21253), `renderLoadTab()` (~Line 21999), and `renderBatteryTab()` (~Line 22596).

### Board Strategy Share Formulas

Protected and deferrable board shares are derived from the machine list after load-role and criticality resolution:

```
ProtectedEnergySharePct = (ProtectedLoads_DailyWh / TotalDailyWh) x 100
ProtectedPeakSharePct   = (ProtectedLoads_PeakVA / TotalPeakVA) x 100
DeferrableEnergySharePct = (DeferrableLoads_DailyWh / TotalDailyWh) x 100
```

Where:

- `ProtectedLoads` = all loads not tagged `deferrable`
- `CriticalLoads` = only loads tagged `critical`
- `DeferrableLoads` = loads tagged `deferrable`

These ratios drive the selective-board vs full-board warning logic.

### Auto-Resolved Commercial Board Strategy

When the installer leaves board strategy on `auto`, the resolver uses business context:

```
if OperatingIntent == essential_loads_only:
    BoardStrategy = essential_subboard
else if GeneratorSupportMode != none OR OperatingIntent == hybrid_generator:
    BoardStrategy = generator_assist
else if PhaseType == three_phase AND ContinuityClass in {process_critical, product_loss_critical}:
    BoardStrategy = ProfileDefaultBoardStrategy
else:
    BoardStrategy = ProfileDefaultBoardStrategy or full_site_board
```

This is not a code rule set. It is a commercial-topology guidance rule set.

### Shared Battery Throughput Formulas

The commercial layer checks current stress, not only battery kWh.

```
ChargeCurrent_A = MIN(MPPT_TotalMaxChargeCurrent, PV_ArrayWattage / BatteryVoltage)
EmergencySurgeLimit_A = BatteryMaxDischargeCurrent x EmergencySurgeFactor

ContinuousUtilizationPct = (InverterDCCurrent_Continuous / BatteryMaxDischargeCurrent) x 100
SurgeUtilizationPct      = (InverterDCCurrent_Surge / EmergencySurgeLimit_A) x 100
ChargeUtilizationPct     = (ChargeCurrent_A / BatteryMaxChargeCurrent) x 100
```

Default thresholds:

| Parameter | Value |
|-----------|------:|
| Ready utilization threshold | 70% |
| Tight utilization threshold | 85% |
| Fail utilization threshold | 100% |
| Emergency surge factor | 1.5x |
| Tight stress index | 75% |
| Fail stress index | 95% |

### C-Rate Formulas

The throughput layer also expresses current as C-rate against the total shared battery Ah:

```
ContinuousCRate = InverterDCCurrent_Continuous / BatteryBankAh
SurgeCRate      = InverterDCCurrent_Surge / BatteryBankAh
ChargeCRate     = ChargeCurrent_A / BatteryBankAh
```

Composite stress index:

```
CRateStressIndex =
    (ContinuousUtilizationPct x 0.5)
  + (MAX(SurgeUtilizationPct, ChargeUtilizationPct) x 0.5)
```

Interpretation:

- low index = battery current path is comfortable
- tight index = battery kWh may be adequate, but current throughput is commercially tight
- fail index = the battery bank is being asked to behave like a deeper industrial DC source than it safely supports

### Generator Coverage Formula

Generator assist is evaluated against the active board path, not blindly against inverter headline size:

```
GeneratorVA = GeneratorSize_kVA x 1000

GeneratorTargetVA =
  if BoardStrategy == essential_subboard:
      MAX(ProtectedLoads_PeakVA, CriticalLoads_PeakVA)
  else:
      DesignContinuousVA or PeakSimultaneousVA

GeneratorCoveragePct = (GeneratorVA / GeneratorTargetVA) x 100
```

Three-phase guardrail:

```
PerPhaseGeneratorVA = GeneratorVA / 3
Warn if PerPhaseGeneratorVA < LimitingPhaseDesignVA
```

This keeps a nominally "large" generator from being accepted when the limiting phase still cannot carry its side of the board.

### PV Field / MPPT Grouping Heuristic

The architecture layer turns site field layout into a tracker-group expectation:

```
if FieldLayout == single_field:
    RecommendedGroups = 1
else if FieldLayout == distributed_canopy:
    RecommendedGroups = MIN(3, TrackerCount > 2 ? 3 : 2)
else:
    RecommendedGroups = 2
```

Auto grouping resolution:

```
if SelectedGrouping == auto:
    if TrackerCount <= 1:
        ResolvedGrouping = grouped_single_field
    else if FieldLayout == mixed_orientation:
        ResolvedGrouping = orientation_split
    else if FieldLayout in {roof_and_ground, distributed_canopy, dual_roof}:
        ResolvedGrouping = field_split
    else:
        ResolvedGrouping = grouped_single_field
```

Key validation rules:

```
if RecommendedGroups > TrackerCount AND FieldLayout != single_field:
    status = fail or warn

if ResolvedGrouping == orientation_split AND TrackerCount < 2:
    status = fail

if UsedTrackers < MIN(TrackerCount, RecommendedGroups):
    status = warn
```

### Commercial Architecture Summary Logic

The overall architecture status is a reduction of four commercial gates:

```
OverallArchitectureStatus =
  fail if any(BoardStrategy, BatteryThroughput, GeneratorSupport, MPPTGrouping) == fail
  warn if none fail and any(...) == warn
  pass otherwise
```

This status now feeds:

- proposal readiness
- confidence scoring penalty
- executive summary
- commercial estimate summary
- overview, load, and battery tabs

*Version note: Round 6 adds commercial power architecture modeling, including selective-board reasoning, shared battery throughput checks, generator-assist coverage, and PV-field / MPPT grouping realism. Generated `pv_calculator_ui.html` line count is now ~24,553.*

---

## Round 7: Commercial Decision Engine

**Source area:** `CommercialDecisionEngine` in generated `pv_calculator_ui.html` (current modular source: `src/scripts/modules/10-engines.ts`) plus strategy rendering in `renderCommercialDecisionPanel()` and strategy-aware proposal/PDF logic in `src/scripts/modules/30-controller.js`.

### Core Decision Metrics

The decision layer compares operating postures using the current business context, operational load profile, PV yield, battery bridge depth, and commercial architecture status.

```
SolarCoveragePct = (PV_DailyWh / DailyLoadWh) x 100
AverageBackupHours = BatteryUsableWh / (DailyLoadWh / 24)
OvernightCriticalCoveragePct = (BatteryUsableWh / OvernightCriticalWh) x 100
OvernightProtectedCoveragePct = (BatteryUsableWh / OvernightProtectedWh) x 100
DaytimeProcessSharePct = (DaytimeProcessWh / TotalProcessWh) x 100
DeferrableSharePct = (DeferrableWh / DailyLoadWh) x 100
ShiftableSharePct = (DaytimeShiftableWh / DailyLoadWh) x 100
PreservationSharePct = (PreservationWh / DailyLoadWh) x 100
ProtectedPeakSharePct = ProtectedBoardPeakVA / TotalPeakVA x 100
```

Where:

- `OvernightProtectedWh = OvernightCriticalWh + OvernightEssentialWh`
- `DailyLoadWh / 24` is the modeled average site power used to express battery bridge depth in hours

### Strategy Scorecard Model

Each supported operating posture gets a scorecard:

```
StrategyScore = BaseReasons - BaseGaps
RecommendedStrategy = argmax(StrategyScore)
NormalizedScore = clamp(StrategyScore, 0, 100)
```

The current build evaluates:

- `battery_dominant_offgrid`
- `solar_dominant_daytime_bridge`
- `hybrid_generator_assist`
- `hybrid_grid_support`
- `essential_load_only_backup`

The engine is intentionally heuristic, not a time-series simulator. It converts the calculated site shape into the least misleading commercial posture.

### Decision Thresholds

Default guidance thresholds in the current build:

| Metric | Working | Ready |
|--------|--------:|------:|
| Solar coverage | 85% | 105% |
| Average-load backup | 4h | 10h |
| Overnight protected coverage | 85% | 120% |
| Daytime process alignment | 50% | 65% |
| Deferrable share | 18% | n/a |
| Shiftable share | 15% | n/a |
| Preservation-dominant share | 30% | n/a |
| Protected selective-board threshold | 80% peak | n/a |
| Generator coverage | 70% | 90% |

Interpretation:

- `Working` means the strategy can be justified with active installer explanation.
- `Ready` means the strategy is naturally supported by the modeled site shape.

### Alignment Logic

After choosing the best-fit strategy, the engine compares it to the current project posture:

```
IntentAligned = RecommendedStrategy.preferredIntents includes CurrentOperatingIntent
SystemTypeAligned = RecommendedStrategy.preferredSystemTypes includes CurrentSystemType
```

If either alignment check fails:

- proposal readiness is reduced
- confidence scoring takes an additional penalty
- strategy warnings and open items are generated

This keeps the bot from quietly endorsing a misleading commercial story when the raw hardware math alone still "works."

### Output Reduction Logic

```
DecisionStatus =
  fail if RecommendedScore < 60
  fail or warn if strategy misalignment combines with hard architecture failure
  warn if score < 75 or architecture is tight
  pass otherwise
```

This decision status now feeds:

- commercial summary and executive summary panels
- overview snapshot
- proposal readiness gate: `Commercial recommendation`
- confidence penalty
- PDF proposal control and commercial estimate sections
- warning aggregation

---

## Round 8: Proposal Readiness Gate

**Source area:** `calculateProposalReadiness()` in `src/scripts/modules/30-controller.js`.

The proposal-readiness layer is a weighted gate model that starts from `100` and subtracts penalties when the engineering, survey, commercial, or compliance story is still weak.

### Base Model

```
ProposalReadinessScore = 100 - Σ(Penalties)
ProposalReadinessScore = clamp(ProposalReadinessScore, 0, 100)
```

### Core Penalty Gates

Engineering confidence:

```
if HardBlocksPresent:
  score = min(score, 20)
else if ConfidenceScore >= 85:
  no penalty
else if ConfidenceScore >= 65:
  score -= 12
else:
  score -= 24
```

Three-phase balance:

```
if ImbalancePct <= 10:
  no penalty
else if ImbalancePct <= 20:
  score -= 6
else if ImbalancePct <= 30:
  score -= 10
else:
  score -= 16
```

Three-phase cluster plan:

```
if ClusterPlanMissing:
  score -= 4
else if ClusterPlanStatus == "tight":
  score -= 8
else if ClusterPlanStatus == "undersized":
  score -= 18
```

Business-fit penalties:

```
score -= BusinessPhaseFitPenalty
score -= BusinessSystemFitPenalty
score -= OperationalSchedulePenalty
```

Commercial-decision penalty:

```
if DecisionStatus == "warn":
  score -= 6
if DecisionStatus == "fail":
  score -= 10
```

---

## Round 9: Supported-Load Story And Runtime Envelope

**Source area:** `getCommercialSupportSummary()` in `src/scripts/modules/30-controller.js`.

This layer translates raw engineering results into a commercial support envelope. It does not resize hardware. It classifies each load into a promised operating path so proposal language stays aligned with the architecture and strategy layers.

### Support Bucket Classification

For each load:

```
Bucket ∈ { protected, assisted, excluded }
```

The bucket starts from:

- strategy recommendation
- board strategy
- load role
- load criticality
- basic heaviness heuristics

High-level rule set:

```
if critical or refrigeration:
  prefer protected
else if deferrable or discretionary:
  prefer excluded
else if process or operator_peak:
  prefer assisted
else:
  follow the current decision posture
```

Board-strategy correction:

```
if board == essential_subboard:
  only critical / refrigeration / true essential base loads stay protected

if board in { process_split_board, generator_assist }:
  non-critical process and operator_peak loads are pushed to assisted
```

### Protected Runtime Metrics

Protected backup hours:

```
ProtectedAverageLoadW = ProtectedDailyWh / 24
ProtectedBackupHours = UsableBatteryWh / ProtectedAverageLoadW
```

Overnight protected coverage:

```
OvernightProtectedCoveragePct = (UsableBatteryWh / ProtectedNighttimeWh) * 100
```

Generator coverage is inherited from commercial architecture:

```
GeneratorCoveragePct = GeneratorVA / TargetBoardVA * 100
```

### Support Story Status

```
status = fail if any critical load is excluded
status = warn if:
  any critical load is only assisted
  any essential load is excluded
  overnight protected coverage < 85%
  assisted path exists
  excluded path exists
status = pass otherwise
```

This status now feeds:

- executive summary
- commercial summary
- overview and load tabs
- PDF commercial/export notes
- warning aggregation

### Why This Matters

The app no longer stops at “system size.” It now expresses:

- what is truly protected
- what still depends on generator, grid, or timing discipline
- what is outside the promised continuity story

That is the layer that keeps a bakery oven, filling-station booster pump, or cold-room convenience load from being misrepresented in a proposal.

---

## Round 10: Benchmark Reference Classes

**Source area:** `DEFAULTS.BENCHMARK_PROJECTS` in `src/scripts/modules/00-defaults.ts` and `_test_benchmark_projects.js`.

The benchmark suite now uses two locked classes:

### Acceptance Reference

```
benchmarkClass = acceptance
```

Meaning:

- the reference should stay out of architecture fail status
- the protected-load story should remain commercially usable
- the site is viable as a repeatable reference baseline

### Constrained Reference

```
benchmarkClass = constrained
```

Meaning:

- the reference is intentionally tight or overstated
- the tool is expected to fail the architecture or support story in a known way
- the reference proves the product does not silently bless an unsafe commercial promise

Locked failure signals can include:

```
battery_throughput
phase_generator_coverage
```

This is important because a trustworthy commercial tool needs both:

- green references that prove repeatability
- red references that prove honesty

Commercial architecture penalties:

```
BoardStrategy:        warn = -5,  fail = -10
BatteryThroughput:    warn = -6,  fail = -12
GeneratorPath:        warn = -4,  fail = -8
MPPT / FieldGrouping: warn = -4,  fail = -8
```

Proposal control penalties:

```
Missing proposal identity fields     = -14
Remote / partial survey only         = -12
No meaningful site survey            = -20
Commercial sign-off incomplete       = -10
Compliance path pending              = -8
Compliance path open                 = -14
```

Survey uncertainty penalties:

```
Unknown mounting type    = -4
Unknown shading          = -6
Moderate shading         = -8
Severe shading           = -15
Unknown cable route      = -4
Complex cable route      = -8
Restricted access        = -4
Difficult access         = -8
Unknown access           = -3
```

### Readiness Labels

```
if HardBlocksPresent:
  "Blocked by engineering"
else if score >= 88 and survey/commercial/compliance controls are fully closed:
  "Proposal-ready"
else if score >= 72:
  "Ready with pending checks"
else if score >= 55:
  "Installer review required"
else:
  "Preliminary estimate only"
```

This keeps the product from calling a quote “ready” just because the component math passed.

---

## Round 9: Vertical Template And Workflow Layer

**Source area:** `DEFAULTS.PROJECT_TEMPLATES` in `src/scripts/modules/00-defaults.ts` plus `renderProjectTemplatePreview()` and `renderWorkflowGuide()` in `src/scripts/modules/30-controller.js`.

This layer is not a sizing formula. It is a controlled workflow scaffold that improves commercial realism before the calculation engine runs.

### Vertical Template Payload

Each template can preload:

```
BusinessProfile
OperatingIntent
ContinuityClass
OperatingSchedulePreset
AudienceMode
SystemType
PhaseType
AutonomyDays
BatteryChemistry
CommercialArchitectureMode
GeneratorSupportMode
PVFieldLayout
MPPTGroupingMode
ApplianceList[]
IncludedScope[]
Exclusions[]
NextSteps[]
```

### Workflow Rule

```
ApplyTemplate:
  preserve current location profile
  preserve installer identity
  clear client-specific quote fields
  replace appliance list
  start a new unsaved draft
```

This is deliberate. The template layer is meant to speed up honest scoping without leaking one client’s proposal state into another project.

### Current Vertical Starter Coverage

- residential backup
- retail shop
- tailoring studio
- garment workshop
- bakery daytime production
- bakery 3-phase oven line
- filling station hybrid
- clinic critical loads
- cold room preservation
- fabrication workshop
- mini-factory process line
- pump-led support site

---

## Round 11: Commercial Finance And ROI Advisory Layer

**Source area:** `calculateCommercialFinanceSummary()` in `src/scripts/modules/30-controller.js` plus the finance inputs in `Proposal Pricing`.

This layer is intentionally an **advisory commercial-value model**, not a lender-grade project-finance model.

### Finance Inputs

The current implementation reads:

```text
ValueBasis
EnergyRatePerKWh
ExportCreditPerKWh
OperatingDaysPerWeek
AnnualEscalationPct
```

The default basis comes from the selected pricing region:

```text
Africa   -> generator_energy_offset
Americas -> grid_tariff_offset
Europe   -> grid_tariff_offset
Asia     -> blended_site_energy
Oceania  -> grid_tariff_offset
Global   -> blended_site_energy
```

### Operating-Year Conversion

```text
OperatingDaysPerYear = round((OperatingDaysPerWeek / 7) * 365)
```

### Core Energy-Value Model

Definitions:

```text
DailyWh           = aggregation.dailyEnergyWh
DaytimeWh         = aggregation.daytimeEnergyWh
PVDailyWh         = pvArray.dailyEnergyWh
ProtectedNightWh  = supportSummary.buckets.protected.nighttimeWh
BatteryRoundTrip  = chargeEfficiency * dischargeEfficiency
```

Direct daytime solar use:

```text
DirectSolarWh = min(DaytimeWh, PVDailyWh)
```

Remaining solar after direct daytime use:

```text
RemainingSolarWh = max(0, PVDailyWh - DirectSolarWh)
```

Solar energy that can be shifted through the battery into protected night duty:

```text
StorageInputWh = min(RemainingSolarWh, ProtectedNightWh / BatteryRoundTrip)
BatteryShiftDeliveredWh = min(ProtectedNightWh, StorageInputWh * BatteryRoundTrip)
```

Modeled onsite delivered value:

```text
SelfConsumedWh = min(DailyWh, DirectSolarWh + BatteryShiftDeliveredWh)
CapturedSolarWh = min(PVDailyWh, DirectSolarWh + StorageInputWh)
```

Export allowance only applies to hybrid and grid-tie postures:

```text
if SystemType in {hybrid, grid_tie}:
    ExportWh = max(0, PVDailyWh - CapturedSolarWh)
else:
    ExportWh = 0
```

### Annualized Commercial Value

```text
AnnualSelfConsumedKWh = (SelfConsumedWh / 1000) * OperatingDaysPerYear
AnnualExportKWh       = (ExportWh / 1000) * OperatingDaysPerYear

AnnualSavings =
    (AnnualSelfConsumedKWh * EnergyRatePerKWh)
  + (AnnualExportKWh * ExportCreditPerKWh)
```

### Payback And Value Outlook

Simple payback:

```text
if AnnualSavings > 0:
    SimplePaybackYears = FinalQuote / AnnualSavings
else:
    SimplePaybackYears = null
```

Escalated annual value for year `n`:

```text
AnnualValue(year_n) = AnnualSavings * (1 + AnnualEscalationPct / 100)^(n - 1)
```

Multi-year gross value:

```text
FiveYearGrossValue = sum(AnnualValue(year_1..year_5))
TenYearGrossValue  = sum(AnnualValue(year_1..year_10))
```

Net-after-quote view:

```text
FiveYearNetAfterQuote = FiveYearGrossValue - FinalQuote
TenYearNetAfterQuote  = TenYearGrossValue - FinalQuote
```

### Coverage Metrics

These are commercial interpretation metrics, not equipment-sizing metrics:

```text
LoadOffsetPct    = SelfConsumedWh / DailyWh * 100
OnsiteSolarUsePct = CapturedSolarWh / PVDailyWh * 100
ExportPct         = ExportWh / PVDailyWh * 100
```

### Finance Status Interpretation

```text
if AnnualSavings <= 0:
    status = fail
else if SimplePaybackYears <= 4:
    status = pass
else if SimplePaybackYears <= 7:
    status = pass
else if SimplePaybackYears <= 10:
    status = warn
else:
    status = warn
```

This is paired with strategy-aware notes:

- generator-assist jobs remind the installer to use real generator kWh cost, not a fake grid tariff
- daytime-solar bridge jobs remind the installer that process timing matters
- process-critical and product-loss-critical jobs warn that energy-only ROI understates outage-avoidance value

### What The Current ROI Layer Does Not Model

Still not included:

- debt service / financing interest
- tax / depreciation effects
- avoided spoilage or downtime monetization
- residual equipment value
- OEM-specific service-contract timing

That boundary is deliberate. The current layer is meant to improve proposal honesty and selling clarity without pretending to be a full project-finance engine.

## Round 12: Authority Submission Pack Readiness

The submission-pack layer extends the compliance model into a staged closeout workflow.

### Stage Model

The current submission pack is evaluated as four stages:

```text
1. SurveyAndIntake
2. TechnicalDossier
3. ApprovalLane
4. CloseoutAndHandover
```

### Intake Stage

Inputs used:

```text
AdministrativeReady =
    HasInstallerIdentity
  and HasLeadContact
  and HasClientIdentity
  and HasQuoteControl

IntakeReady = AdministrativeReady and PartialSurveyReady
```

### Technical Dossier Stage

Inputs used:

```text
GeneratedDesignReady =
    HasAggregation
  and HasInverter
  and HasBattery
  and HasPVArray

TechnicalReady = GeneratedDesignReady and SurveyReady
```

Named equipment references improve the pack and remain a recommended closeout item, but they are not the sole hard gate for the technical stage.

### Approval Lane Stage

For off-grid projects:

```text
ApprovalReady = EarthingReady and SurveyReady
```

For hybrid and grid-tie projects:

```text
ApprovalReady = UtilityReady and EarthingReady and SurveyReady
```

The governing approval lane is selected from the location profile and system type.

### Closeout / Handover Stage

```text
CommercialReady = ExclusionsReviewed and BudgetAligned

CloseoutReady =
    ComplianceStatus == ready
  and CommercialReady
  and GeneratedDesignReady
```

### Submission Completion Score

```text
ClosedSubmissionStages = count(StageStatus == pass)
SubmissionCompletionPct = ClosedSubmissionStages / 4 * 100
```

### Submission Status Interpretation

```text
if all stages == pass:
    SubmissionStatus = ready
else if fail stages >= 2 and pass stages == 0:
    SubmissionStatus = open
else:
    SubmissionStatus = pending
```

### Relationship To Proposal Readiness

Proposal readiness now treats the submission pack as a separate gate from the regional compliance path.

This is deliberate:

- `Compliance` answers whether the electrical / regulatory path is conceptually aligned
- `Submission Pack` answers whether the project is structurally prepared for formal review or handover

This prevents a project from looking “ready” purely because the compliance path is understood while the paperwork and closeout path are still loose.

## Round 13: Guided UI Section Flow

No engineering sizing formulas changed in this round.

This round changes:

- input navigation
- progressive disclosure
- per-section summary rendering
- recommended-next-step guidance
- focus-aware plain-language coaching for active fields and sections

The calculation engines, readiness penalties, commercial math, and technical outputs remain unchanged.

## Round 14: Promise-Boundary Reporting

No hardware-sizing formulas changed in this round.

This round changes how the existing supported-load envelope is expressed to the user.

The support-summary object now derives:

```text
PromiseBoundaryHeadline = sellability verdict from support status
PromiseBoundaryDetail   = protected promise + assisted dependency + excluded scope rule
```

Where:

- `Protected Path` remains the only load bucket that can be sold as covered continuity
- `Assisted Path` remains dependent on generator, grid, daylight timing, staged use, or other operating discipline depending on the recommended strategy
- `Outside The Promised Path` remains excluded from the continuity promise unless the scope changes

This round does not change:

- bucket assignment
- energy-share percentages
- runtime math
- commercial strategy scoring

It changes the reporting layer so UI and PDF output state the continuity boundary explicitly instead of making the user infer it from percentages and load lists alone.

## Round 15: TypeScript TS-10 Boundary

No engineering or commercial formulas changed in this round.

This round adds:

- `tsconfig.json` with `allowJs`, `checkJs`, and `noEmit`
- shared typedefs in `src/scripts/types/pv-types.d.ts`
- native TypeScript defaults, engines, reporting, and controller payload/state/guidance helper modules on the stable pure core and low-risk summary/state/guidance path
- typed domain-definition maps in the stable defaults layer
- typed commercial and phase-allocation payload contracts so the compiler checks more of the real decision/output path
- normalized practical-sizing, risk-index, configuration-comparison, and multi-MPPT distribution result contracts instead of loose object payloads
- typed controller-adjacent summary payloads for confidence, business context, commercial architecture hints, schedule summaries, and project snapshot summaries
- typed controller-adjacent state contracts for project-name sanitization, snapshot creation, and normalized project import/export migration
- typed controller-adjacent workflow guidance contracts for input-section flow, per-section summaries, workflow coach fallback, and default expansion rules
- mixed JS/TS browser-bundle support in the build so native `.ts` source modules can ship without changing the runtime model
- a passing `npm run typecheck` against the stable core modules

This round does not change:

- load aggregation math
- inverter sizing math
- battery sizing math
- PV sizing math
- commercial strategy scoring
- proposal readiness scoring

The purpose is maintainability and contract clarity, not a calculation change.

## Round 16: Plant Scoping And Mini-Grid Boundary

No electrical sizing formulas changed in this round.

This round adds a scoping layer that resolves three advisory classifications before a commercial job is presented like a plant study:

- `plant scope`
- `distribution topology`
- `interconnection scope`

The scoping engine uses existing project inputs and commercial architecture context such as:

- business profile
- operating intent
- system type
- board strategy
- generator-support posture
- phase basis

The purpose is not to replace feeder studies, protection studies, or utility interconnection engineering.

The purpose is to improve boundary honesty by separating:

- captive business-site plants
- private multi-feeder / private-distribution jobs
- public-service or interconnection-heavy cases that should be treated as outside the current product boundary

This round changes:

- workflow guidance
- proposal readiness
- executive and commercial summaries
- overview output
- PDF scoping language

This round does not change:

- load aggregation math
- inverter sizing math
- battery sizing math
- PV sizing math
- commercial strategy scoring
- proposal budget math

## Round 17: Lifecycle Finance Sensitivity

No electrical sizing formulas changed in this round.

This round extends the commercial finance layer with:

- annual O&M allowance
- inverter refresh reserve
- battery refresh / augmentation reserve
- 5-year and 10-year lifecycle allowance totals
- 5-year and 10-year net-after-lifecycle view

The lifecycle layer uses:

- the existing avoided-energy model
- the current commercial quote total
- the current inverter line cost
- the current battery line cost
- chemistry-aware battery refresh timing

The purpose is to improve proposal honesty for medium-term commercial decision making.

This round does not change:

- load aggregation math
- inverter sizing math
- battery sizing math
- PV sizing math
- commercial strategy scoring
- support-envelope math

It remains advisory. It does not replace debt, tax, residual-value, or lender-grade project-finance analysis.

## Round 18: Outcome Result Interpretation Surface

No engineering or commercial formulas changed in this round.

This round adds a clearer user-facing interpretation layer for the scores already produced by the engine:

- `Confidence`
- `Coping Score`
- `Commercial Strategy`
- `Proposal Readiness`
- `Regional Compliance`
- `Submission Pack`

This round changes:

- `System Summary` reporting
- scorecard interpretation in the live UI
- written guidance for client and installer reading order

This round does not change:

- sizing math
- strategy math
- readiness math
- compliance math
- submission-pack math

For the plain-language meaning of those scores, see `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md`.

## Round 19: Results Navigation And Segmentation

No engineering or commercial formulas changed in this round.

This round changes:

- result-page navigation
- segmented section reading
- collapsible result blocks
- client and installer guidance for long output

This round does not change:

- sizing math
- score math
- readiness logic
- compliance logic
- finance logic

The purpose is to reduce result-page fatigue and keep the output readable as the product depth grows.

## Round 20: Advanced Finance Sensitivity

No core electrical sizing formulas changed in this round.

This round extends the advisory commercial-finance layer with optional capital-stack sensitivity:

- `taxBenefitAmount = finalQuote x (taxBenefitPct / 100)`
- `financedAmount = finalQuote x (debtSharePct / 100)`
- `equityContribution = finalQuote - financedAmount`
- if `debtAprPct > 0`:
  - `annualDebtService = financedAmount x r / (1 - (1 + r)^(-debtTermYears))`
  - where `r = debtAprPct / 100`
- else:
  - `annualDebtService = financedAmount / debtTermYears`
- `totalDebtService = annualDebtService x debtTermYears`
- `totalInterest = totalDebtService - financedAmount`
- `firstYearNetAfterDebt = annualSavings - annualMaintenanceCost - annualDebtService`
- `residualValueAmount = equipmentSubtotal x (residualValuePct / 100)`
- `fiveYearNetAfterFinance = fiveYearGrossValue - fiveYearLifecycleCost - equityContribution - fiveYearDebtService + taxBenefitAmount`
- `tenYearNetAfterFinance = tenYearGrossValue - tenYearLifecycleCost - equityContribution - tenYearDebtService + taxBenefitAmount + residualValueAmount`

This round changes:

- commercial finance interpretation
- finance panel output
- PDF commercial-value output
- optional proposal-pricing inputs

This round does not change:

- inverter sizing math
- battery sizing math
- PV sizing math
- support-envelope logic
- commercial strategy scoring

It remains advisory. It is not a lender-grade finance or tax model.

## Round 21: Finance Scenario Comparison

No core electrical sizing formulas changed in this round.

This round adds side-by-side owner-cash comparison when financing is active:

- `cashFirstYearNet = annualSavings - annualMaintenanceCost`
- `cashFiveYearNet = fiveYearGrossValue - finalQuote - fiveYearLifecycleCost + taxBenefitAmount`
- `cashTenYearNet = tenYearGrossValue - finalQuote - tenYearLifecycleCost + taxBenefitAmount + residualValueAmount`
- `fiveYearDelta = fiveYearNetAfterFinance - cashFiveYearNet`
- `tenYearDelta = tenYearNetAfterFinance - cashTenYearNet`

This round changes:

- finance-panel interpretation
- PDF commercial-value interpretation
- finance regression coverage

This round does not change:

- inverter sizing math
- battery sizing math
- PV sizing math
- readiness logic
- support-envelope logic

It remains advisory. It is a comparison aid, not a discounted cashflow model.

## Round 22: Supplier Quote Freshness And Quote Refresh Control

No electrical sizing formulas changed in this round.

This round adds a commercial traceability layer to the pricing path.

The logic uses:

- `supplierQuoteStatus`
- `supplierQuoteDate`
- `supplierRefreshWindowDays`
- `supplierQuoteReference`

Derived values:

- `ageDays = floor((today - quoteDate) / 86400000)` when a valid date exists
- `withinWindow = ageDays <= refreshWindowDays`
- `withinDoubleWindow = ageDays <= refreshWindowDays x 2`

Outcome classification:

- if status is benchmark-only:
  - `quoteFreshness = Benchmark-only`
- else if no valid quote date exists:
  - `quoteFreshness = Live quote date missing`
- else if inside refresh window:
  - `quoteFreshness = Fresh live quote`
  - or `Partially live and fresh` when the quote status is only partially live
- else if inside double refresh window:
  - `quoteFreshness = Aging supplier quote`
- else:
  - `quoteFreshness = Stale supplier quote`

This round changes:

- proposal-pricing interpretation
- supplier-pricing preview
- proposal-readiness gating
- commercial summary / proposal budget output
- PDF commercial traceability wording

This round does not change:

- inverter sizing math
- battery sizing math
- PV sizing math
- support-envelope logic
- commercial strategy scoring

It remains an offline honesty layer. It does not fetch live pricing or replace procurement.

## Round 23: Offline Supplier Quote Import

No electrical sizing formulas changed in this round.

This round adds an offline parsing layer for pasted supplier quote text and lightweight quote files.

The importer reads:

- freeform pasted lines
- simple copied spreadsheet rows
- basic quote metadata lines
- TXT quote files
- CSV quote files, including header-aware ERP-style exports where unit rate can be derived as `line total / qty`
- structured JSON quote files

Recognized metadata:

- quote reference
- quote date
- currency label

Recognized component mappings:

- PV modules
- inverter
- battery
- MPPT / charge controller
- mounting / BOS
- protection
- cable
- monitoring / commissioning

The importer extracts the last recognizable numeric token from a matched component line and writes it into the existing manual override field for that component.

Status recommendation logic:

- no matched lines -> `benchmark_only`
- light matched set -> `partial_live_quotes`
- several major component matches -> `major_lines_locked`
- near-complete matched set -> `full_quote_locked`

This round changes:

- proposal-pricing workflow
- supplier quote review UI
- manual-override entry speed

This round does not change:

- inverter sizing math
- battery sizing math
- PV sizing math
- readiness scoring formula
- commercial strategy formula

It remains an offline assist layer. It does not fetch live data, interpret PDFs, or replace supplier review.

## Plant Feeder Schedule Aggregation

The plant feeder schedule is derived from the same supported-load buckets already used in the commercial support story.

Core aggregation:

- `feeder_daily_wh = sum(item.dailyWh)`
- `feeder_connected_load_w = sum(item.ratedPowerW)`
- `feeder_max_surge_factor = max(item.surgeFactor)`
- `feeder_role_labels = unique(item.loadRoleLabel)`

Energy-share handling:

- protected feeder share uses the protected support-bucket share
- excluded feeder share uses the excluded support-bucket share
- assisted process and assisted general feeders split the assisted support-bucket share in proportion to their own daily energy

In practical terms:

- `assisted_process_share = (assisted_process_daily_wh / total_assisted_daily_wh) * assisted_bucket_share`
- `assisted_general_share = (assisted_general_daily_wh / total_assisted_daily_wh) * assisted_bucket_share`

Source-path mapping is rule-based rather than numeric:

- protected lane -> protected PV/battery path, with generator or grid recovery labels when the strategy requires it
- assisted lane -> generator-assisted, grid-assisted, or managed/staged support label
- excluded lane -> outside promised backup path

This round changes:

- plant-scoping output depth
- plant / mini-plant outcome interpretation
- feeder-lane honesty in results and PDF export
- board / source handoff clarity
- bounded procurement prompts by reusing live cable and protection sizing
- utility / mini-grid lane handoff clarity by reusing the same plant-scoping boundary result

This round does not change:

- inverter sizing math
- battery sizing math
- PV sizing math
- compliance scoring formula
- utility-grade feeder-study or protection calculations
