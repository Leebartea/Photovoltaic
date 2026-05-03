/* =============================================================================
   PHASE 1: LOAD ENGINE - Pure calculation functions
   ============================================================================= */

type EngineApplianceInput = import('../types/pv-types').ApplianceInput;
type EngineSystemConfig = import('../types/pv-types').SystemConfig;
type EnginePhaseType = import('../types/pv-types').PhaseType;
type EnginePhaseAssignment = import('../types/pv-types').PhaseAssignment;
type EngineLoadRole = import('../types/pv-types').LoadRole;
type EngineLoadCriticality = import('../types/pv-types').LoadCriticality;
type EngineAggregationResult = import('../types/pv-types').AggregationResult;
type EngineInverterSizingResult = import('../types/pv-types').InverterSizingResult;
type EngineBatterySizingResult = import('../types/pv-types').BatterySizingResult;
type EnginePVArrayResult = import('../types/pv-types').PVArrayResult;
type EngineBatteryModuleMatch = import('../types/pv-types').BatteryModuleMatch;
type EngineBatteryTierSet = import('../types/pv-types').BatteryTierSet;
type EngineBatteryPracticalResult = import('../types/pv-types').BatteryPracticalResult;
type EngineBatteryDesignBasis = import('../types/pv-types').BatteryDesignBasis;
type EngineBatteryCapacityRange = import('../types/pv-types').BatteryCapacityRange;
type EngineOperatingScheduleDefinition = import('../types/pv-types').OperatingScheduleDefinition;
type EnginePhaseAllocationResult = import('../types/pv-types').PhaseAllocationResult;
type EngineDominantMotorSummary = import('../types/pv-types').DominantMotorSummary;
type EngineServoUpgradeAdvice = import('../types/pv-types').ServoUpgradeAdvice;
type EnginePracticalCondition = import('../types/pv-types').PracticalCondition;
type EngineManagedModeResult = import('../types/pv-types').ManagedModeResult;
type EngineRiskIndexResult = import('../types/pv-types').RiskIndexResult;
type EnginePVPracticalResult = import('../types/pv-types').PVPracticalResult;
type EnginePanelSpec = import('../types/pv-types').PanelSpec;
type EngineMPPTInputSpec = import('../types/pv-types').MPPTInputSpec;
type EngineMPPTSpec = import('../types/pv-types').MPPTSpec;
type EnginePanelConfigurationResult = import('../types/pv-types').PanelConfigurationResult;
type EngineNearbyPanelConfiguration = import('../types/pv-types').NearbyPanelConfiguration;
type EngineConfigurationComparisonResult = import('../types/pv-types').ConfigurationComparisonResult;
type EngineMPPTAssignment = import('../types/pv-types').MPPTAssignment;
type EngineMultiMPPTDistributionCandidate = import('../types/pv-types').MultiMPPTDistributionCandidate;
type EngineMultiMPPTDistributionResult = import('../types/pv-types').MultiMPPTDistributionResult;
type EngineCommercialLoadSubsetSummary = import('../types/pv-types').CommercialLoadSubsetSummary;
type EngineCommercialArchitectureModeDefinition = import('../types/pv-types').CommercialArchitectureModeDefinition;
type EngineGeneratorSupportModeDefinition = import('../types/pv-types').GeneratorSupportModeDefinition;
type EnginePVFieldLayoutDefinition = import('../types/pv-types').PVFieldLayoutDefinition;
type EngineMPPTGroupingDefinition = import('../types/pv-types').MPPTGroupingDefinition;
type EngineCommercialArchitectureProfileDefaults = import('../types/pv-types').CommercialArchitectureProfileDefaults;
type EnginePlantScopeModeDefinition = import('../types/pv-types').PlantScopeModeDefinition;
type EngineDistributionTopologyDefinition = import('../types/pv-types').DistributionTopologyDefinition;
type EngineInterconnectionScopeDefinition = import('../types/pv-types').InterconnectionScopeDefinition;
type EnginePlantScopingProfileDefaults = import('../types/pv-types').PlantScopingProfileDefaults;
type EngineBatteryThroughputThresholds = import('../types/pv-types').BatteryThroughputThresholds;
type EngineCommercialBoardStrategyResolution = import('../types/pv-types').CommercialBoardStrategyResolution;
type EngineMPPTGroupingResolution = import('../types/pv-types').MPPTGroupingResolution;
type EngineCommercialArchitectureResult = import('../types/pv-types').CommercialArchitectureResult;
type EnginePlantScopeResolution = import('../types/pv-types').PlantScopeResolution;
type EngineDistributionTopologyResolution = import('../types/pv-types').DistributionTopologyResolution;
type EngineInterconnectionScopeResolution = import('../types/pv-types').InterconnectionScopeResolution;
type EnginePlantScopingPreviewSummary = import('../types/pv-types').PlantScopingPreviewSummary;
type EnginePlantScopingResult = import('../types/pv-types').PlantScopingResult;
type EngineCommercialDecisionDefinition = import('../types/pv-types').CommercialDecisionDefinition;
type EngineCommercialDecisionThresholds = import('../types/pv-types').CommercialDecisionThresholds;
type EngineCommercialDecisionScorecard = import('../types/pv-types').CommercialDecisionScorecard;
type EngineCommercialDecisionResult = import('../types/pv-types').CommercialDecisionResult;
type EngineOperationalProfile = import('../types/pv-types').OperationalProfile;
type EngineSupportSummary = import('../types/pv-types').SupportSummary;
type EngineSupportBucketItem = import('../types/pv-types').SupportBucketItem;
type EngineSystemResults = import('../types/pv-types').SystemResults;
type EnginePlantFeederScheduleSummary = import('../types/pv-types').PlantFeederScheduleSummary;
type EnginePlantFeederScheduleItem = import('../types/pv-types').PlantFeederScheduleItem;

const LoadEngine = {
    appliances: [] as EngineApplianceInput[],

    calculateRealPower(appliance: EngineApplianceInput): number {
        return (appliance.ratedPowerW * appliance.quantity) / appliance.efficiency;
    },

    calculateApparentPowerVA(appliance: EngineApplianceInput): number {
        return this.calculateRealPower(appliance) / appliance.powerFactor;
    },

    calculateStartingVA(appliance: EngineApplianceInput): number {
        return this.calculateApparentPowerVA(appliance) * appliance.surgeFactor;
    },

    calculateDailyEnergyWh(appliance: EngineApplianceInput): number {
        return this.calculateRealPower(appliance) * appliance.dailyUsageHours * (appliance.dutyCycle / 100);
    },

    calculateOperatingCurrent(appliance: EngineApplianceInput, voltage: number): number {
        return this.calculateApparentPowerVA(appliance) / voltage;
    },

    validateAppliance(appliance: EngineApplianceInput): string[] {
        const errors = [];

        if (!appliance.name || appliance.name.trim() === '') {
            errors.push('Appliance name is required');
        }
        if (appliance.ratedPowerW <= 0 || appliance.ratedPowerW > 100000) {
            errors.push('Power must be between 1 and 100,000 watts');
        }
        if (appliance.quantity < 1 || appliance.quantity > 1000) {
            errors.push('Quantity must be between 1 and 1000');
        }
        if (appliance.dailyUsageHours < 0 || appliance.dailyUsageHours > 24) {
            errors.push('Daily hours must be between 0 and 24');
        }
        if (appliance.dutyCycle < 1 || appliance.dutyCycle > 100) {
            errors.push('Duty cycle must be between 1 and 100%');
        }
        if (appliance.surgeFactor < 1 || appliance.surgeFactor > 10) {
            errors.push('Surge factor must be between 1 and 10');
        }
        if (appliance.powerFactor < 0.5 || appliance.powerFactor > 1) {
            errors.push('Power factor must be between 0.5 and 1.0');
        }
        if (appliance.phaseAssignment) {
            const validAssignments = ['auto', 'l1', 'l2', 'l3', 'three_phase'];
            if (!validAssignments.includes(normalizePhaseAssignment(appliance.phaseAssignment, 'three_phase'))) {
                errors.push('Phase assignment is invalid');
            }
        }

        return errors;
    },

    getSummary(): { totalAppliances: number, error?: string, acLoadCount?: number, motorCount?: number, simultaneousCount?: number, nonSimultaneousCount?: number } {
        if (this.appliances.length === 0) {
            return { totalAppliances: 0, error: 'No appliances loaded' };
        }

        const acLoads = this.appliances.filter(a => a.isAC);
        const motorLoads = this.appliances.filter(a => a.loadType === 'motor');
        const simultaneousLoads = this.appliances.filter(a => a.isSimultaneous);

        return {
            totalAppliances: this.appliances.length,
            acLoadCount: acLoads.length,
            motorCount: motorLoads.length,
            simultaneousCount: simultaneousLoads.length,
            nonSimultaneousCount: this.appliances.length - simultaneousLoads.length
        };
    }
};

function roundValue(value: number, decimals = 1): number {
    if (!Number.isFinite(value)) return 0;
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

function normalizePhaseAssignment(assignment: string | null | undefined, phaseType: EnginePhaseType): EnginePhaseAssignment {
    if (phaseType !== 'three_phase') return 'auto';

    const raw = String(assignment || 'auto')
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');

    if (raw === 'l1' || raw === 'phase_l1') return 'l1';
    if (raw === 'l2' || raw === 'phase_l2') return 'l2';
    if (raw === 'l3' || raw === 'phase_l3') return 'l3';
    if (raw === '3_phase' || raw === 'three_phase' || raw === 'threephase') return 'three_phase';
    return 'auto';
}

function getOperatingScheduleDefinition(scheduleKey: string | null | undefined): EngineOperatingScheduleDefinition {
    const schedules = (DEFAULTS.OPERATING_SCHEDULES || {}) as Record<string, EngineOperatingScheduleDefinition>;
    return schedules[scheduleKey] || schedules.business_day || Object.values(schedules)[0] || {
        label: 'Business Hours (8am-6pm)',
        summary: 'Standard daytime operation.',
        operatingDaysPerWeek: 6,
        prefersDaytimeShift: true,
        expectsNightContinuity: false,
        preservationFocus: false
    };
}

function normalizeLoadRole(role: string | null | undefined): EngineLoadRole {
    const validRoles = ['base', 'process', 'refrigeration', 'operator_peak', 'discretionary'] as EngineLoadRole[];
    return validRoles.includes(role as EngineLoadRole) ? role as EngineLoadRole : 'base';
}

function resolveLoadRole(appliance: EngineApplianceInput): EngineLoadRole {
    if (appliance?.loadRole && appliance.loadRole !== 'auto') {
        return normalizeLoadRole(appliance.loadRole);
    }

    const name = String(appliance?.machineProfileLabel || appliance?.name || '').toLowerCase();
    const dailyUsageHours = appliance?.dailyUsageHours || 0;
    const ratedPower = (appliance?.ratedPowerW || 0) * (appliance?.quantity || 1);
    const dutyFrequency = appliance?.dutyFrequency || 'daily';
    const isDaytimeOnly = appliance?.isDaytimeOnly === true || appliance?.isDaytimeOnly === 'yes';
    const isContinuous = dutyFrequency === 'continuous' || dailyUsageHours >= 18;

    if (/cold|freezer|fridge|refrigerator|compressor|evaporator|vaccine|chiller|cold room/.test(name)) {
        return 'refrigeration';
    }
    if (/sewing|tailor|mixer|oven|proof|conveyor|dispenser|pos|boiler iron|pressing iron|process|booster pump|pump/.test(name)) {
        return /welder|grinder|cutter|saw|drill|air compressor|iron|pressing/.test(name) ? 'operator_peak' : 'process';
    }
    if (/welder|grinder|cutter|saw|drill|compressor|iron|pressing|tool/.test(name) || (!appliance?.isSimultaneous && ratedPower >= 800)) {
        return 'operator_peak';
    }
    if (isDaytimeOnly || dutyFrequency === 'weekly' || dutyFrequency === 'rare') {
        return 'discretionary';
    }
    if (/router|modem|light|lighting|cctv|security|alarm|control panel|plc|fan|server|network|office|computer|laptop|tv/.test(name) || isContinuous) {
        return 'base';
    }
    return ratedPower >= 1200 && appliance?.loadType !== 'electronic' ? 'process' : 'base';
}

function normalizeLoadCriticality(criticality: string | null | undefined): EngineLoadCriticality {
    const validLevels = ['critical', 'essential', 'deferrable'] as EngineLoadCriticality[];
    return validLevels.includes(criticality as EngineLoadCriticality) ? criticality as EngineLoadCriticality : 'essential';
}

function resolveLoadCriticality(appliance: EngineApplianceInput, role: EngineLoadRole | string, config: Partial<EngineSystemConfig> = {}): EngineLoadCriticality {
    if (appliance?.loadCriticality && appliance.loadCriticality !== 'auto') {
        return normalizeLoadCriticality(appliance.loadCriticality);
    }

    const resolvedRole = normalizeLoadRole(role || resolveLoadRole(appliance));
    const name = String(appliance?.machineProfileLabel || appliance?.name || '').toLowerCase();
    const continuityClass = config?.continuityClass || 'business_critical';
    const dutyFrequency = appliance?.dutyFrequency || 'daily';

    if (resolvedRole === 'refrigeration' || /vaccine|cold room|control panel|plc/.test(name)) {
        return 'critical';
    }
    if (/router|modem|cctv|security|alarm|server/.test(name)) {
        return continuityClass === 'convenience' ? 'essential' : 'critical';
    }
    if (resolvedRole === 'process') {
        return continuityClass === 'convenience' ? 'essential' : 'essential';
    }
    if (resolvedRole === 'operator_peak') {
        if (/dispenser|pump|mixer|oven/.test(name) && ['process_critical', 'product_loss_critical'].includes(continuityClass)) {
            return 'essential';
        }
        return 'deferrable';
    }
    if (resolvedRole === 'discretionary') {
        return 'deferrable';
    }
    if (dutyFrequency === 'continuous') {
        return continuityClass === 'convenience' ? 'essential' : 'critical';
    }
    return 'essential';
}

function formatPhaseAssignmentLabel(assignment: EnginePhaseAssignment): string {
    return DEFAULTS.PHASE_ASSIGNMENTS?.[assignment]?.label
        || {
            auto: 'Auto-balance',
            l1: 'L1',
            l2: 'L2',
            l3: 'L3',
            three_phase: '3-phase'
        }[assignment]
        || 'Auto-balance';
}

function getPhaseVoltage(acVoltage: number, phaseType: EnginePhaseType): number {
    if (phaseType === 'three_phase') {
        return acVoltage / (DEFAULTS.PHASE_CONFIG?.three_phase?.sqrt3 || 1.732);
    }
    if (phaseType === 'split') {
        return DEFAULTS.PHASE_CONFIG?.split?.legVoltage || acVoltage / 2;
    }
    return acVoltage;
}

const ThreePhaseLoadAllocator = {
    phaseKeys: ['l1', 'l2', 'l3'] as const,

    getEmptyPhase(key) {
        return {
            key,
            label: key.toUpperCase(),
            realPowerW: 0,
            apparentPowerVA: 0,
            dailyEnergyWh: 0,
            simultaneousVA: 0,
            nonSimultaneousLoads: [],
            assignedLoads: [],
            singlePhaseVA: 0,
            threePhaseVA: 0,
            autoAssignedUnits: 0,
            fixedAssignedUnits: 0,
            phaseAssignments: {}
        };
    },

    addContribution(bucket, contribution, meta) {
        bucket.realPowerW += contribution.realPowerW;
        bucket.apparentPowerVA += contribution.apparentPowerVA;
        bucket.dailyEnergyWh += contribution.dailyEnergyWh;

        if (meta.resolvedMode === 'three_phase') {
            bucket.threePhaseVA += contribution.apparentPowerVA;
        } else {
            bucket.singlePhaseVA += contribution.apparentPowerVA;
        }

        if (meta.resolvedMode === 'auto') {
            bucket.autoAssignedUnits += meta.unitCount || 1;
        } else if (meta.resolvedMode === 'fixed') {
            bucket.fixedAssignedUnits += meta.unitCount || 1;
        }

        if (meta.isSimultaneous) {
            bucket.simultaneousVA += contribution.apparentPowerVA;
        } else {
            bucket.nonSimultaneousLoads.push({
                apparentPowerVA: contribution.apparentPowerVA,
                label: meta.name
            });
        }

        bucket.phaseAssignments[meta.name] = (bucket.phaseAssignments[meta.name] || 0) + contribution.apparentPowerVA;
        bucket.assignedLoads.push({
            label: meta.name,
            apparentPowerVA: contribution.apparentPowerVA,
            startingVA: contribution.startingVA || contribution.apparentPowerVA,
            isMotor: meta.isMotor === true,
            isSimultaneous: meta.isSimultaneous === true
        });
    },

    buildResolvedSummary(resolvedCounts, requestedPhase) {
        if (requestedPhase === 'three_phase') {
            return '3-phase across L1/L2/L3';
        }
        const parts = this.phaseKeys
            .filter(key => resolvedCounts[key] > 0)
            .map(key => `${key.toUpperCase()} x${resolvedCounts[key]}`);
        if (parts.length === 0) return formatPhaseAssignmentLabel(requestedPhase);
        if (requestedPhase === 'auto') {
            return `Auto -> ${parts.join(', ')}`;
        }
        return parts.join(', ');
    },

    getImbalanceClassification(imbalancePct) {
        const thresholds = DEFAULTS.THREE_PHASE_IMBALANCE_THRESHOLDS || { balanced: 10, moderate: 20, significant: 30 };
        if (imbalancePct <= thresholds.balanced) {
            return {
                severity: 'balanced',
                label: 'Balanced',
                message: 'Phase loading is well balanced. No redistribution action is currently needed.'
            };
        }
        if (imbalancePct <= thresholds.moderate) {
            return {
                severity: 'moderate',
                label: 'Moderate',
                message: 'Moderate phase imbalance detected. Review heavy loads and keep future additions on the lightest phase.'
            };
        }
        if (imbalancePct <= thresholds.significant) {
            return {
                severity: 'significant',
                label: 'Significant',
                message: 'Significant imbalance detected. The heaviest phase is already becoming the practical limit for equal-leg inverter clusters.'
            };
        }
        return {
            severity: 'critical',
            label: 'Critical',
            message: 'Critical phase imbalance detected. Redistribute fixed single-phase loads before commissioning a three-phase installation.'
        };
    },

    getPhaseStatus(phasePeakVA, averagePhaseVA) {
        if (averagePhaseVA <= 0) return 'ok';
        const ratio = phasePeakVA / averagePhaseVA;
        if (ratio <= 1.1) return 'ok';
        if (ratio <= 1.25) return 'heavy';
        return 'limiting';
    },

    calculate(appliances: EngineApplianceInput[], config: EngineSystemConfig): EnginePhaseAllocationResult | null {
        if (config.phaseType !== 'three_phase' || !Array.isArray(appliances) || appliances.length === 0) {
            return null;
        }

        const phaseVoltage = getPhaseVoltage(config.acVoltage, 'three_phase');
        const designFactor = (config.designMargin || 100) / 100;
        const phases = {
            l1: this.getEmptyPhase('l1'),
            l2: this.getEmptyPhase('l2'),
            l3: this.getEmptyPhase('l3')
        };
        const applianceAssignments = [];
        let autoAssignedUnits = 0;
        let fixedAssignedUnits = 0;
        let threePhaseUnits = 0;

        const assignUnitToLightestPhase = () => {
            return this.phaseKeys.reduce((bestKey, currentKey) => {
                if (!bestKey) return currentKey;
                const bestPhase = phases[bestKey];
                const currentPhase = phases[currentKey];
                if (currentPhase.apparentPowerVA < bestPhase.apparentPowerVA) return currentKey;
                if (currentPhase.apparentPowerVA === bestPhase.apparentPowerVA && currentPhase.realPowerW < bestPhase.realPowerW) return currentKey;
                return bestKey;
            }, null) || 'l1';
        };

        appliances.forEach((appliance, index) => {
            const quantity = Math.max(1, Number(appliance.quantity) || 1);
            const totalRealPowerW = LoadEngine.calculateRealPower(appliance);
            const totalApparentPowerVA = LoadEngine.calculateApparentPowerVA(appliance);
            const totalStartingVA = LoadEngine.calculateStartingVA(appliance);
            const totalDailyEnergyWh = LoadEngine.calculateDailyEnergyWh(appliance);
            const requestedPhase = normalizePhaseAssignment(appliance.phaseAssignment, config.phaseType);
            const perUnitContribution = {
                realPowerW: totalRealPowerW / quantity,
                apparentPowerVA: totalApparentPowerVA / quantity,
                startingVA: totalStartingVA / quantity,
                dailyEnergyWh: totalDailyEnergyWh / quantity
            };
            const resolvedCounts = { l1: 0, l2: 0, l3: 0 };

            if (requestedPhase === 'three_phase') {
                const sharedContribution = {
                    realPowerW: totalRealPowerW / 3,
                    apparentPowerVA: totalApparentPowerVA / 3,
                    startingVA: totalStartingVA / 3,
                    dailyEnergyWh: totalDailyEnergyWh / 3
                };
                this.phaseKeys.forEach(phaseKey => {
                    this.addContribution(phases[phaseKey], sharedContribution, {
                        name: appliance.name,
                        isSimultaneous: appliance.isSimultaneous,
                        isMotor: appliance.loadType === 'motor',
                        resolvedMode: 'three_phase',
                        unitCount: quantity
                    });
                    resolvedCounts[phaseKey] = quantity;
                });
                threePhaseUnits += quantity;
            } else if (requestedPhase === 'l1' || requestedPhase === 'l2' || requestedPhase === 'l3') {
                this.addContribution(phases[requestedPhase], {
                    realPowerW: totalRealPowerW,
                    apparentPowerVA: totalApparentPowerVA,
                    startingVA: totalStartingVA,
                    dailyEnergyWh: totalDailyEnergyWh
                }, {
                    name: appliance.name,
                    isSimultaneous: appliance.isSimultaneous,
                    isMotor: appliance.loadType === 'motor',
                    resolvedMode: 'fixed',
                    unitCount: quantity
                });
                resolvedCounts[requestedPhase] = quantity;
                fixedAssignedUnits += quantity;
            } else {
                for (let unitIndex = 0; unitIndex < quantity; unitIndex++) {
                    const phaseKey = assignUnitToLightestPhase();
                    this.addContribution(phases[phaseKey], perUnitContribution, {
                        name: appliance.name,
                        isSimultaneous: appliance.isSimultaneous,
                        isMotor: appliance.loadType === 'motor',
                        resolvedMode: 'auto',
                        unitCount: 1
                    });
                    resolvedCounts[phaseKey] += 1;
                }
                autoAssignedUnits += quantity;
            }

            applianceAssignments.push({
                index,
                name: appliance.name,
                requestedPhase,
                requestedLabel: formatPhaseAssignmentLabel(requestedPhase),
                resolvedCounts,
                resolvedSummary: this.buildResolvedSummary(resolvedCounts, requestedPhase),
                quantity
            });
        });

        const phaseList = this.phaseKeys.map(key => {
            const bucket = phases[key];
            const nonSimultaneousMaxVA = bucket.nonSimultaneousLoads.length > 0
                ? Math.max(...bucket.nonSimultaneousLoads.map(item => item.apparentPowerVA))
                : 0;
            const peakSimultaneousVA = bucket.simultaneousVA + nonSimultaneousMaxVA;
            const designVA = peakSimultaneousVA * designFactor;
            const currentA = phaseVoltage > 0 ? peakSimultaneousVA / phaseVoltage : 0;
            const designCurrentA = phaseVoltage > 0 ? designVA / phaseVoltage : 0;
            const motorLoads = bucket.assignedLoads.filter(item => item.isMotor);
            const motorSurgeDeltas = motorLoads.map(item => Math.max(0, item.startingVA - item.apparentPowerVA));
            let peakSurgeVA = peakSimultaneousVA;
            if (motorSurgeDeltas.length >= 2) {
                peakSurgeVA += motorSurgeDeltas.reduce((sum, value) => sum + value, 0);
            } else if (motorSurgeDeltas.length === 1) {
                peakSurgeVA += motorSurgeDeltas[0];
            }
            const designSurgeVA = peakSurgeVA * designFactor;
            const surgeCurrentA = phaseVoltage > 0 ? peakSurgeVA / phaseVoltage : 0;
            const designSurgeCurrentA = phaseVoltage > 0 ? designSurgeVA / phaseVoltage : 0;
            const topLoads = Object.entries(bucket.phaseAssignments as Record<string, number>)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, value]) => `${name} (${Math.round(value)}VA)`);

            return {
                key,
                label: key.toUpperCase(),
                realPowerW: roundValue(bucket.realPowerW, 1),
                apparentPowerVA: roundValue(bucket.apparentPowerVA, 1),
                peakSimultaneousVA: roundValue(peakSimultaneousVA, 1),
                designVA: roundValue(designVA, 1),
                peakSurgeVA: roundValue(peakSurgeVA, 1),
                designSurgeVA: roundValue(designSurgeVA, 1),
                currentA: roundValue(currentA, 1),
                designCurrentA: roundValue(designCurrentA, 1),
                surgeCurrentA: roundValue(surgeCurrentA, 1),
                designSurgeCurrentA: roundValue(designSurgeCurrentA, 1),
                dailyEnergyWh: roundValue(bucket.dailyEnergyWh, 1),
                singlePhaseVA: roundValue(bucket.singlePhaseVA, 1),
                threePhaseVA: roundValue(bucket.threePhaseVA, 1),
                nonSimultaneousMaxVA: roundValue(nonSimultaneousMaxVA, 1),
                autoAssignedUnits: bucket.autoAssignedUnits,
                fixedAssignedUnits: bucket.fixedAssignedUnits,
                topLoads
            };
        });

        const totalPeakVA = phaseList.reduce((sum, phase) => sum + phase.peakSimultaneousVA, 0);
        const averagePhaseVA = totalPeakVA / 3;
        phaseList.forEach(phase => {
            phase.sharePct = averagePhaseVA > 0 ? roundValue((phase.peakSimultaneousVA / totalPeakVA) * 100, 1) : 0;
            phase.deviationFromAverageVA = roundValue(phase.peakSimultaneousVA - averagePhaseVA, 1);
            phase.status = this.getPhaseStatus(phase.peakSimultaneousVA, averagePhaseVA);
            phase.statusLabel = phase.status === 'limiting' ? 'Limiting' : phase.status === 'heavy' ? 'Heavy' : 'OK';
        });

        const limitingPhase = phaseList.reduce((max, phase) => phase.peakSimultaneousVA > max.peakSimultaneousVA ? phase : max, phaseList[0]);
        const surgeLimitingPhase = phaseList.reduce((max, phase) => phase.peakSurgeVA > max.peakSurgeVA ? phase : max, phaseList[0]);
        const maxDeviationVA = phaseList.reduce((max, phase) => Math.max(max, Math.abs(phase.peakSimultaneousVA - averagePhaseVA)), 0);
        const imbalancePct = averagePhaseVA > 0 ? (maxDeviationVA / averagePhaseVA) * 100 : 0;
        const classification = this.getImbalanceClassification(imbalancePct);
        const equalLegClusterFloorVA = limitingPhase.designVA * 3;
        const balancedDesignTargetVA = roundValue(averagePhaseVA * designFactor, 1);
        const redistributionPenaltyVA = Math.max(0, equalLegClusterFloorVA - totalPeakVA * designFactor);
        const [iL1, iL2, iL3] = phaseList.map(phase => phase.currentA);
        const neutralCurrentA = Math.sqrt(Math.max(
            0,
            (iL1 ** 2) + (iL2 ** 2) + (iL3 ** 2)
            - (iL1 * iL2) - (iL2 * iL3) - (iL1 * iL3)
        ));

        const warnings = [];
        const recommendations = [];

        if (classification.severity !== 'balanced') {
            warnings.push(`${classification.label} phase imbalance: ${roundValue(imbalancePct, 1)}% with ${limitingPhase.label} as the limiting phase at ${Math.round(limitingPhase.peakSimultaneousVA)}VA (${Math.round(limitingPhase.currentA)}A line current). ${classification.message}`);
        }
        if (redistributionPenaltyVA > 250) {
            warnings.push(`Equal-leg inverter clusters would need about ${Math.round(equalLegClusterFloorVA)}VA total to support the current ${limitingPhase.label} loading pattern. Roughly ${Math.round(redistributionPenaltyVA)}VA of cluster capacity is being lost to imbalance.`);
        }
        if (neutralCurrentA > 0 && limitingPhase.currentA > 0 && neutralCurrentA > (limitingPhase.currentA * 0.5)) {
            warnings.push(`Estimated neutral current is ${roundValue(neutralCurrentA, 1)}A, which is more than 50% of the heaviest phase current. Keep the neutral conductor full-size and review single-phase load placement.`);
        }

        if (classification.severity === 'moderate') {
            recommendations.push('Keep future single-phase additions on the lightest phase and review fixed phase assignments during installation.');
        } else if (classification.severity === 'significant' || classification.severity === 'critical') {
            recommendations.push(`Move one or more fixed single-phase loads away from ${limitingPhase.label} before locking the three-phase distribution board schedule.`);
            recommendations.push(`Target about ${Math.round(balancedDesignTargetVA)}VA design load per phase instead of the current ${Math.round(limitingPhase.designVA)}VA limiting phase requirement.`);
        }
        if (autoAssignedUnits > 0) {
            recommendations.push(`${autoAssignedUnits} appliance unit${autoAssignedUnits === 1 ? '' : 's'} were auto-balanced to keep the three-phase layout practical. Confirm the final circuit schedule on site.`);
        }

        return {
            phaseVoltage: roundValue(phaseVoltage, 1),
            totalPeakVA: roundValue(totalPeakVA, 1),
            averagePhaseVA: roundValue(averagePhaseVA, 1),
            maxDeviationVA: roundValue(maxDeviationVA, 1),
            imbalancePct: roundValue(imbalancePct, 1),
            classification: classification.severity,
            classificationLabel: classification.label,
            classificationMessage: classification.message,
            limitingPhase: limitingPhase.label,
            limitingPhasePeakVA: limitingPhase.peakSimultaneousVA,
            limitingPhaseDesignVA: limitingPhase.designVA,
            limitingPhaseCurrentA: limitingPhase.currentA,
            surgeLimitingPhase: surgeLimitingPhase.label,
            surgeLimitingPhasePeakVA: surgeLimitingPhase.peakSurgeVA,
            surgeLimitingPhaseDesignVA: surgeLimitingPhase.designSurgeVA,
            surgeLimitingPhaseCurrentA: surgeLimitingPhase.surgeCurrentA,
            equalLegClusterFloorVA: roundValue(equalLegClusterFloorVA, 1),
            balancedDesignTargetVA: roundValue(balancedDesignTargetVA, 1),
            redistributionPenaltyVA: roundValue(redistributionPenaltyVA, 1),
            neutralCurrentA: roundValue(neutralCurrentA, 1),
            autoAssignedUnits,
            fixedAssignedUnits,
            threePhaseUnits,
            phases: phaseList,
            warnings,
            recommendations,
            applianceAssignments
        };
    }
};

/* =============================================================================
   PHASE 2: AGGREGATION ENGINE - Aggregate all loads
   ============================================================================= */

const AggregationEngine = {
    calculate(appliances: EngineApplianceInput[], config: EngineSystemConfig): EngineAggregationResult {
        if (appliances.length === 0) {
            throw new Error('No appliances to aggregate');
        }

        // Total power calculations
        let totalRealPower = 0;
        let totalApparentPower = 0;
        let dailyEnergy = 0;
        let daytimeEnergy = 0;
        let nighttimeEnergy = 0;
        let acPower = 0;
        let dcPower = 0;
        let motorPower = 0;
        const operatingSchedule = getOperatingScheduleDefinition(config?.operatingSchedulePreset);
        const energyByRole = {
            base: 0,
            process: 0,
            refrigeration: 0,
            operator_peak: 0,
            discretionary: 0
        };
        const energyByCriticality = {
            critical: 0,
            essential: 0,
            deferrable: 0
        };
        let overnightCriticalWh = 0;
        let overnightEssentialWh = 0;
        let daytimeProcessWh = 0;
        let totalProcessWh = 0;
        let preservationWh = 0;
        let deferrableWh = 0;
        let operatorPeakWh = 0;
        let daytimeShiftableWh = 0;
        let continuousBaseWh = 0;
        const loadBreakdown = [];

        for (const app of appliances) {
            const realPower = LoadEngine.calculateRealPower(app);
            const apparentPower = LoadEngine.calculateApparentPowerVA(app);
            const energy = LoadEngine.calculateDailyEnergyWh(app);
            const daytimeShare = Math.min(Math.max(app.daytimeRatio || 0, 0), 100) / 100;
            const daytimeWh = energy * daytimeShare;
            const nighttimeWh = energy * (1 - daytimeShare);
            const loadRole = resolveLoadRole(app);
            const loadCriticality = resolveLoadCriticality(app, loadRole, config);

            totalRealPower += realPower;
            totalApparentPower += apparentPower;
            dailyEnergy += energy;
            daytimeEnergy += daytimeWh;
            nighttimeEnergy += nighttimeWh;
            energyByRole[loadRole] += energy;
            energyByCriticality[loadCriticality] += energy;

            if (loadCriticality === 'critical') overnightCriticalWh += nighttimeWh;
            if (loadCriticality === 'essential') overnightEssentialWh += nighttimeWh;
            if (loadRole === 'process') {
                totalProcessWh += energy;
                daytimeProcessWh += daytimeWh;
            }
            if (loadRole === 'refrigeration') preservationWh += energy;
            if (loadRole === 'operator_peak') operatorPeakWh += energy;
            if (loadRole === 'discretionary' || loadCriticality === 'deferrable') deferrableWh += energy;
            if (loadRole === 'base' && (app.dutyFrequency === 'continuous' || (app.dailyUsageHours || 0) >= 16)) {
                continuousBaseWh += energy;
            }
            if (app.isDaytimeOnly === true || app.isDaytimeOnly === 'yes' || ['weekly', 'rare'].includes(app.dutyFrequency || 'daily')) {
                daytimeShiftableWh += energy;
            }

            if (app.isAC) {
                acPower += apparentPower;
            } else {
                dcPower += realPower;
            }

            if (app.loadType === 'motor') {
                motorPower += apparentPower;
            }

            loadBreakdown.push({
                index: loadBreakdown.length,
                name: app.name,
                loadRole,
                loadCriticality,
                dailyWh: roundValue(energy, 1),
                daytimeWh: roundValue(daytimeWh, 1),
                nighttimeWh: roundValue(nighttimeWh, 1)
            });
        }

        // Peak simultaneous VA calculation
        const simultaneousApps = appliances.filter(a => a.isSimultaneous);
        const nonSimultaneousApps = appliances.filter(a => !a.isSimultaneous);

        const simultaneousVA = simultaneousApps.reduce((sum, a) => sum + LoadEngine.calculateApparentPowerVA(a), 0);
        const nonSimultaneousMax = nonSimultaneousApps.length > 0
            ? Math.max(...nonSimultaneousApps.map(a => LoadEngine.calculateApparentPowerVA(a)))
            : 0;
        const peakSimultaneous = simultaneousVA + nonSimultaneousMax;

        // Identify motor appliances for surge calculations
        const motorAppliances = appliances.filter(a => a.loadType === 'motor');
        const surges = appliances.map(a => ({
            delta: LoadEngine.calculateStartingVA(a) - LoadEngine.calculateApparentPowerVA(a),
            appliance: a
        }));
        surges.sort((a, b) => b.delta - a.delta);

        // WORST-CASE SURGE: All motors surge simultaneously
        // Conservative assumption — every motor starts at the same instant
        let highestSurge = peakSimultaneous;
        if (motorAppliances.length >= 2) {
            // Sum ALL motor surge deltas (worst-case: all start together)
            const totalMotorSurgeDelta = motorAppliances.reduce((sum, m) => {
                return sum + (LoadEngine.calculateStartingVA(m) - LoadEngine.calculateApparentPowerVA(m));
            }, 0);
            highestSurge = peakSimultaneous + totalMotorSurgeDelta;
        } else if (surges.length > 0) {
            // Single motor or non-motor surges: just add the biggest delta
            highestSurge = peakSimultaneous + surges[0].delta;
        }

        // STAGGERED SURGE: Only the single biggest motor surges at a time
        // Realistic assumption — user staggers motor starts by 30+ seconds
        let staggeredSurge = peakSimultaneous;
        let dominantMotor: EngineDominantMotorSummary | null = null;
        if (motorAppliances.length >= 1) {
            let maxMotorSurgeVA = 0;
            let dominantApp = null;
            for (const m of motorAppliances) {
                const startVA = LoadEngine.calculateStartingVA(m);
                if (startVA > maxMotorSurgeVA) {
                    maxMotorSurgeVA = startVA;
                    dominantApp = m;
                    dominantMotor = { name: m.name, watt: m.ratedPowerW * m.quantity, surgeVA: Math.round(startVA), surgeFactor: m.surgeFactor };
                }
            }
            // Staggered = continuous of everything + only the dominant motor's surge delta
            const dominantDelta = maxMotorSurgeVA - LoadEngine.calculateApparentPowerVA(dominantApp);
            staggeredSurge = peakSimultaneous + dominantDelta;
        }

        // ── Industrial usage detection ──
        // Analyze motor appliances for industrial patterns that affect sizing
        const industrialMotors = motorAppliances.filter(m => m.isIndustrialSewing || m.ratedPowerW > 400);
        const hasIndustrialSewing = motorAppliances.some(m => m.isIndustrialSewing);
        const hasCompressor = motorAppliances.some(m => m.motorSubType === 'compressor');
        const clutchMotors = motorAppliances.filter(m => m.motorSubType === 'clutch');
        const servoMotors = motorAppliances.filter(m => m.motorSubType === 'servo');

        // Compliance risk: how likely the client WON'T follow staggering rules
        // Higher risk = bigger safety margin on recommended tier
        let complianceRisk = 'low'; // low, medium, high
        let complianceNote = '';
        if (hasIndustrialSewing && hasCompressor) {
            // Industrial sewing + freezer/AC = highest risk of simultaneous surge
            complianceRisk = 'high';
            complianceNote = 'Industrial sewing machine + compressor load detected. High risk of simultaneous startup — sizing includes safety buffer.';
        } else if (industrialMotors.length >= 2) {
            complianceRisk = 'high';
            complianceNote = 'Multiple industrial motors detected. Client may not always stagger starts — recommended tier includes compliance buffer.';
        } else if (hasIndustrialSewing || (hasCompressor && motorAppliances.length >= 2)) {
            complianceRisk = 'medium';
            complianceNote = 'Industrial motor load detected. Recommended tier includes moderate buffer for occasional non-compliance.';
        } else if (clutchMotors.length >= 1 && hasCompressor) {
            complianceRisk = 'medium';
            complianceNote = 'Clutch motor + compressor: moderate surge overlap risk. Recommended tier accounts for this.';
        }

        // Servo upgrade opportunity
        let servoUpgradeAdvice: EngineServoUpgradeAdvice | null = null;
        if (clutchMotors.length > 0 && hasIndustrialSewing) {
            const clutchTotalW = clutchMotors.reduce((s, m) => s + m.ratedPowerW * m.quantity, 0);
            const estimatedServoSavings = Math.round(clutchTotalW * 0.40);
            const estimatedSurgeDrop = Math.round(clutchTotalW * 3.5 * 0.65); // clutch 4x → servo 1.5x
            servoUpgradeAdvice = {
                clutchCount: clutchMotors.length,
                clutchTotalW: clutchTotalW,
                estimatedEnergySavingsW: estimatedServoSavings,
                estimatedSurgeReductionVA: estimatedSurgeDrop,
                message: `Upgrade ${clutchMotors.length} clutch motor(s) to servo: Save ~${estimatedServoSavings}W daily draw, reduce peak surge by ~${estimatedSurgeDrop}VA. Inverter can be ~20% smaller. Cost: ~50% more per motor.`
            };
        }

        // Design values with safety margins
        const designMargin = config.designMargin / 100;
        const designContinuous = peakSimultaneous * designMargin;
        const designSurge = highestSurge * designMargin;
        const designStaggeredSurge = staggeredSurge * designMargin;

        const phaseAllocation = config.phaseType === 'three_phase'
            ? ThreePhaseLoadAllocator.calculate(appliances, config)
            : null;

        const aggregationWarnings = [];
        if (phaseAllocation?.warnings?.length > 0) {
            aggregationWarnings.push(...phaseAllocation.warnings);
        }

        return {
            totalRealPowerW: Math.round(totalRealPower * 10) / 10,
            totalApparentPowerVA: Math.round(totalApparentPower * 10) / 10,
            peakSimultaneousVA: Math.round(peakSimultaneous * 10) / 10,
            highestSurgeVA: Math.round(highestSurge * 10) / 10,
            dailyEnergyWh: Math.round(dailyEnergy * 10) / 10,
            daytimeEnergyWh: Math.round(daytimeEnergy * 10) / 10,
            nighttimeEnergyWh: Math.round(nighttimeEnergy * 10) / 10,
            acPowerVA: Math.round(acPower * 10) / 10,
            dcPowerW: Math.round(dcPower * 10) / 10,
            motorPowerVA: Math.round(motorPower * 10) / 10,
            designContinuousVA: Math.round(designContinuous * 10) / 10,
            designSurgeVA: Math.round(designSurge * 10) / 10,
            designStaggeredSurgeVA: Math.round(designStaggeredSurge * 10) / 10,
            motorCount: motorAppliances.length,
            dominantMotor: dominantMotor,
            // Industrial intelligence
            hasIndustrialSewing: hasIndustrialSewing,
            hasCompressor: hasCompressor,
            industrialMotorCount: industrialMotors.length,
            complianceRisk: complianceRisk,
            complianceNote: complianceNote,
            servoUpgradeAdvice: servoUpgradeAdvice,
            clutchMotorCount: clutchMotors.length,
            servoMotorCount: servoMotors.length,
            phaseAllocation: phaseAllocation,
            operationalProfile: {
                scheduleKey: config?.operatingSchedulePreset || 'business_day',
                scheduleLabel: operatingSchedule.label,
                scheduleSummary: operatingSchedule.summary,
                energyByRoleWh: Object.fromEntries(Object.entries(energyByRole).map(([key, value]) => [key, roundValue(value, 1)])),
                energyByCriticalityWh: Object.fromEntries(Object.entries(energyByCriticality).map(([key, value]) => [key, roundValue(value, 1)])),
                overnightCriticalWh: roundValue(overnightCriticalWh, 1),
                overnightEssentialWh: roundValue(overnightEssentialWh, 1),
                daytimeProcessWh: roundValue(daytimeProcessWh, 1),
                totalProcessWh: roundValue(totalProcessWh, 1),
                preservationWh: roundValue(preservationWh, 1),
                deferrableWh: roundValue(deferrableWh, 1),
                operatorPeakWh: roundValue(operatorPeakWh, 1),
                daytimeShiftableWh: roundValue(daytimeShiftableWh, 1),
                continuousBaseWh: roundValue(continuousBaseWh, 1),
                loadBreakdown
            },
            warnings: aggregationWarnings
        };
    }
};

/**
 * Phase-aware AC current calculation.
 * Single & split: I = P / V
 * 3-phase: I = P / (V x sqrt(3))
 */
function calculateACCurrent(powerVA: number, voltage: number, phaseType: EnginePhaseType): number {
    if (phaseType === 'three_phase') {
        return powerVA / (voltage * 1.732);
    }
    return powerVA / voltage;
}

/* =============================================================================
   PHASE 3: INVERTER SIZING ENGINE
   ============================================================================= */

const InverterSizingEngine = {
    activeMarket: 'EMERGING_OFFGRID',   // Set during calculate(), used by render calls

    formatMarketRange(sizeVA: number, market?: string): string {
        market = market || this.activeMarket || 'EMERGING_OFFGRID';
        const marketData = DEFAULTS.INVERTER_MARKET[market];
        if (marketData && marketData.marketRange) {
            const range = marketData.marketRange[sizeVA];
            if (range && range[0] !== range[1]) {
                return `${range[0]}–${range[1]} VA`;
            }
        }
        // Fallback to legacy INVERTER_MARKET_RANGE if available
        const legacyRange = DEFAULTS.INVERTER_MARKET_RANGE && DEFAULTS.INVERTER_MARKET_RANGE[sizeVA];
        if (legacyRange && legacyRange[0] !== legacyRange[1]) {
            return `${legacyRange[0]}–${legacyRange[1]} VA`;
        }
        return `${sizeVA} VA`;
    },

    selectInverterSize(requiredVA: number, market?: string): number {
        market = market || 'EMERGING_OFFGRID';
        const marketData = DEFAULTS.INVERTER_MARKET[market];
        const sizes = marketData ? marketData.sizes : DEFAULTS.INVERTER_SIZES;
        for (const size of sizes) {
            if (size >= requiredVA) return size;
        }
        // Fallback: use global sizes
        for (const size of DEFAULTS.INVERTER_SIZES) {
            if (size >= requiredVA) return size;
        }
        return Math.ceil(requiredVA / 1000) * 1000;
    },

    selectDCVoltage(inverterVA: number): number {
        for (const [voltage, maxVA] of Object.entries(DEFAULTS.DC_VOLTAGE_THRESHOLDS).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))) {
            if (inverterVA <= maxVA) {
                return parseInt(voltage);
            }
        }
        return 48;
    },

    calculate(aggregatedLoad: EngineAggregationResult, config: EngineSystemConfig): EngineInverterSizingResult {
        const warnings: string[] = [];
        const blocks: string[] = [];
        const suggestions: string[] = [];
        const market = config.inverterMarket || 'EMERGING_OFFGRID';
        this.activeMarket = market;  // Store for render-time formatMarketRange calls

        // Required continuous capacity with design margin
        const continuousRequired = aggregatedLoad.designContinuousVA;
        const surgeRequired = aggregatedLoad.designSurgeVA;

        // Account for inverter derating
        const continuousWithDerating = continuousRequired / DEFAULTS.INVERTER_DERATING;

        // Find recommended standard size
        let recommendedSize = this.selectInverterSize(continuousWithDerating, market);

        // Validate surge capability
        const surgeCapability = recommendedSize * config.inverterSurgeMultiplier;
        if (surgeRequired > surgeCapability) {
            const largerSize = this.selectInverterSize(surgeRequired / config.inverterSurgeMultiplier, market);
            if (largerSize > recommendedSize) {
                warnings.push(
                    `Inverter upsized from ${recommendedSize}VA to ${largerSize}VA to handle ${Math.round(surgeRequired)}VA surge requirement`
                );
                recommendedSize = largerSize;
            }
        }

        // Staggered motor start sizing (optimized)
        let staggeredSize = recommendedSize;
        if (aggregatedLoad.motorCount >= 2 && aggregatedLoad.designStaggeredSurgeVA) {
            const staggeredSurgeCapNeeded = aggregatedLoad.designStaggeredSurgeVA / config.inverterSurgeMultiplier;
            const continuousNeeded = continuousWithDerating;
            const staggeredMinSize = Math.max(continuousNeeded, staggeredSurgeCapNeeded);
            staggeredSize = this.selectInverterSize(staggeredMinSize, market);
        }

        // Recommended sizing: balanced approach between conservative and staggered
        // Auto-buffer based on motor count AND compliance risk for real-world reliability
        let bufferPct = 0;
        if (aggregatedLoad.motorCount >= 3) bufferPct = 0.30;
        else if (aggregatedLoad.motorCount >= 2) bufferPct = 0.20;
        else if (aggregatedLoad.motorCount >= 1) bufferPct = 0.10;

        // ── Compliance-aware buffer ──
        // For clients unlikely to follow staggering rules, bump the recommended tier
        // toward conservative. This is the "smart balance" — no compromise on reliability.
        const complianceRisk = aggregatedLoad.complianceRisk || 'low';
        let complianceBuffer = 0;
        if (complianceRisk === 'high') {
            // High risk: recommended tier is 80% toward conservative (near-worst-case)
            complianceBuffer = 0.20;
            bufferPct = Math.max(bufferPct, 0.35);
        } else if (complianceRisk === 'medium') {
            // Medium risk: recommended tier is 50% toward conservative
            complianceBuffer = 0.10;
            bufferPct = Math.max(bufferPct, 0.25);
        }

        // Industrial sewing machine specific: if >400W clutch motor detected,
        // ensure minimum recommended is 3000VA (as per expert sizing guidance)
        let industrialMinVA = 0;
        if (aggregatedLoad.hasIndustrialSewing) {
            // Industrial clutch sewing (400-750W) + other loads = 3000VA minimum recommended
            industrialMinVA = 3000;
            if (aggregatedLoad.hasCompressor) {
                // Industrial sewing + freezer/AC = 3500VA minimum (never start together)
                industrialMinVA = 3500;
            }
            if (aggregatedLoad.industrialMotorCount >= 3) {
                industrialMinVA = 5000; // 3+ industrial motors → go big
            }
        }

        // Recommended = midpoint surge sizing + motor buffer + compliance buffer
        const midpointSurge = (surgeRequired + (aggregatedLoad.designStaggeredSurgeVA || surgeRequired)) / 2;
        // For high compliance risk, bias midpoint closer to worst-case
        const complianceSurgeBias = complianceRisk === 'high' ? 0.8 : complianceRisk === 'medium' ? 0.6 : 0.5;
        const biasedMidpointSurge = aggregatedLoad.designStaggeredSurgeVA
            ? aggregatedLoad.designStaggeredSurgeVA + (surgeRequired - aggregatedLoad.designStaggeredSurgeVA) * complianceSurgeBias
            : surgeRequired;
        const recommendedMinFromSurge = biasedMidpointSurge / config.inverterSurgeMultiplier;
        const recommendedMinFromContinuous = continuousWithDerating * (1 + bufferPct);
        let recommendedMinSize = Math.max(recommendedMinFromSurge, recommendedMinFromContinuous);

        // Apply industrial minimum floor
        if (industrialMinVA > 0) {
            recommendedMinSize = Math.max(recommendedMinSize, industrialMinVA);
        }

        let recommendedBalancedSize = this.selectInverterSize(recommendedMinSize, market);
        // Clamp between staggered and conservative
        if (recommendedBalancedSize > recommendedSize) recommendedBalancedSize = recommendedSize;
        if (recommendedBalancedSize < staggeredSize) recommendedBalancedSize = staggeredSize;

        // For industrial loads, don't let recommended drop below industrial floor
        if (industrialMinVA > 0 && recommendedBalancedSize < industrialMinVA) {
            recommendedBalancedSize = this.selectInverterSize(industrialMinVA, market);
        }

        let surgePromotionApplied = false;
        let surgePromotionFromVA: number | null = null;
        const _surgeCap = recommendedBalancedSize * config.inverterSurgeMultiplier;
        if (_surgeCap < surgeRequired * 1.10) {
            const _origBalanced = recommendedBalancedSize;
            const _promoted = this.selectInverterSize(_origBalanced + 1, market);
            if (_promoted * config.inverterSurgeMultiplier >= surgeRequired * 1.10) {
                recommendedBalancedSize = _promoted;
                surgePromotionApplied = true;
                surgePromotionFromVA = _origBalanced;
            }
        }

        // Determine DC bus voltage
        const dcVoltage = this.selectDCVoltage(recommendedSize);

        // Calculate DC currents
        const dcCurrentContinuous = continuousRequired / dcVoltage;
        const dcCurrentSurge = surgeRequired / dcVoltage;

        // DC current warnings
        const maxCurrent = DEFAULTS.MAX_DC_CURRENT[dcVoltage] || 250;

        if (dcCurrentContinuous > maxCurrent) {
            blocks.push(
                `HARD BLOCK: DC continuous current ${dcCurrentContinuous.toFixed(1)}A exceeds ${maxCurrent}A limit for ${dcVoltage}V system.`
            );
            suggestions.push(
                `Consider higher voltage bus (${dcVoltage * 2}V) or multiple inverters to reduce DC current to safe levels.`
            );
        } else if (dcCurrentContinuous > maxCurrent * 0.8) {
            warnings.push(
                `DC continuous current ${dcCurrentContinuous.toFixed(1)}A is high for ${dcVoltage}V system. Consider ${dcVoltage * 2}V bus.`
            );
        }

        if (dcCurrentSurge > maxCurrent * 1.5) {
            warnings.push(
                `DC surge current ${dcCurrentSurge.toFixed(1)}A will stress cables. Ensure adequate cable sizing and battery capacity.`
            );
        }

        // ── Industrial-specific warnings and suggestions ──
        if (aggregatedLoad.hasIndustrialSewing && complianceRisk !== 'low') {
            warnings.push(aggregatedLoad.complianceNote);
        }
        if (aggregatedLoad.servoUpgradeAdvice) {
            const servoUpgradeMessage = String(aggregatedLoad.servoUpgradeAdvice.message || '').trim();
            if (servoUpgradeMessage) suggestions.push(servoUpgradeMessage);
        }
        if (aggregatedLoad.hasIndustrialSewing && aggregatedLoad.hasCompressor) {
            warnings.push(
                'Never start the sewing machine and freezer/AC together — wait 45-60 seconds between motor starts. Freezer surge is the real danger (5-7x for 1-2 seconds).'
            );
            suggestions.push(
                'Run sewing during peak sun (10am-4pm) — draws almost entirely from panels, extending battery life. Freezer runs 24/7 on thermostat cycles.'
            );
        }
        if (aggregatedLoad.hasIndustrialSewing && !aggregatedLoad.hasCompressor && aggregatedLoad.motorCount === 1) {
            suggestions.push(
                'Single industrial sewing machine detected. If adding any other motor (pump, AC, bigger fan) later — go straight to 5kVA inverter.'
            );
        }

        return {
            continuousVARequired: Math.round(continuousRequired * 10) / 10,
            surgeVARequired: Math.round(surgeRequired * 10) / 10,
            recommendedSizeVA: recommendedSize,
            recommendedBalancedSizeVA: recommendedBalancedSize,
            motorBufferPct: Math.round(bufferPct * 100),
            staggeredSizeVA: staggeredSize,
            staggeredSurgeVA: aggregatedLoad.designStaggeredSurgeVA || aggregatedLoad.designSurgeVA,
            motorCount: aggregatedLoad.motorCount || 0,
            dominantMotor: aggregatedLoad.dominantMotor || null,
            dcBusVoltage: dcVoltage,
            dcInputCurrentContinuous: Math.round(dcCurrentContinuous * 10) / 10,
            dcInputCurrentSurge: Math.round(dcCurrentSurge * 10) / 10,
            warnings,
            blocks,
            suggestions,
            // Industrial intelligence passthrough
            complianceRisk: complianceRisk,
            complianceNote: aggregatedLoad.complianceNote || '',
            hasIndustrialSewing: aggregatedLoad.hasIndustrialSewing || false,
            hasCompressor: aggregatedLoad.hasCompressor || false,
            industrialMinVA: industrialMinVA,
            servoUpgradeAdvice: aggregatedLoad.servoUpgradeAdvice || null,
            complianceBuffer: Math.round(complianceBuffer * 100),
            surgePromotionApplied,
            surgePromotionFromVA
        };
    }
};

/* =============================================================================
   PHASE 3A: THREE-PHASE INVERTER CLUSTER PLANNER
   Maps modular inverter capacity to L1/L2/L3 instead of only quoting an
   equal-leg floor. This is used for commercial and multi-module designs.
   ============================================================================= */

const ThreePhaseInverterClusterPlanner = {
    phaseKeys: ['l1', 'l2', 'l3'] as const,

    getDefaultSettings() {
        return DEFAULTS.THREE_PHASE_CLUSTER || {
            minModules: 3,
            readyHeadroomPct: 15,
            maxModules: 24,
            defaultDistributionMode: 'auto'
        };
    },

    getPhaseCountsLabel(phaseCounts: { l1?: number; l2?: number; l3?: number }): string {
        return this.phaseKeys
            .map(key => `${key.toUpperCase()} ${phaseCounts[key] || 0}`)
            .join(' / ');
    },

    normalizePhaseCounts(rawCounts: { l1?: number | string; l2?: number | string; l3?: number | string } = {}) {
        return {
            l1: Math.max(0, parseInt(String(rawCounts.l1 ?? 0), 10) || 0),
            l2: Math.max(0, parseInt(String(rawCounts.l2 ?? 0), 10) || 0),
            l3: Math.max(0, parseInt(String(rawCounts.l3 ?? 0), 10) || 0)
        };
    },

    sumPhaseCounts(phaseCounts: { l1?: number; l2?: number; l3?: number }): number {
        return this.phaseKeys.reduce((sum, key) => sum + (phaseCounts[key] || 0), 0);
    },

    getMinimumPhaseCounts(phaseAllocation, moduleContinuousVA, moduleSurgeVA) {
        const counts = {};
        phaseAllocation.phases.forEach(phase => {
            const continuousCount = moduleContinuousVA > 0 ? Math.ceil((phase.designVA || 0) / moduleContinuousVA) : 0;
            const surgeCount = moduleSurgeVA > 0 ? Math.ceil((phase.designSurgeVA || phase.peakSurgeVA || 0) / moduleSurgeVA) : 0;
            counts[phase.key] = Math.max(1, continuousCount, surgeCount);
        });
        return counts;
    },

    distributeAuto(phaseAllocation, requestedCount, minimumCounts) {
        const counts = { l1: 0, l2: 0, l3: 0 };
        let remaining = Math.max(0, parseInt(requestedCount, 10) || 0);

        if (remaining <= 0) {
            return { ...minimumCounts };
        }

        if (remaining >= 3) {
            this.phaseKeys.forEach(key => {
                counts[key] = 1;
            });
            remaining -= 3;
        }

        while (remaining > 0) {
            const selectedKey = this.phaseKeys.reduce((bestKey, key) => {
                const deficit = (minimumCounts[key] || 0) - (counts[key] || 0);
                if (!bestKey) return key;
                const bestDeficit = (minimumCounts[bestKey] || 0) - (counts[bestKey] || 0);
                const phase = phaseAllocation.phases.find(item => item.key === key);
                const bestPhase = phaseAllocation.phases.find(item => item.key === bestKey);

                if (deficit > bestDeficit) return key;
                if (deficit === bestDeficit && (phase?.designVA || 0) > (bestPhase?.designVA || 0)) return key;
                return bestKey;
            }, null) || 'l1';

            counts[selectedKey] += 1;
            remaining -= 1;
        }

        return counts;
    },

    evaluatePlan(phaseAllocation, phaseCounts, moduleContinuousVA, moduleSurgeVA) {
        const phases = phaseAllocation.phases.map(phase => {
            const moduleCount = phaseCounts[phase.key] || 0;
            const continuousCapacityVA = moduleCount * moduleContinuousVA;
            const surgeRequirementVA = phase.designSurgeVA || phase.peakSurgeVA || phase.designVA || 0;
            const surgeCapacityVA = moduleCount * moduleSurgeVA;
            const continuousHeadroomVA = roundValue(continuousCapacityVA - (phase.designVA || 0), 1);
            const surgeHeadroomVA = roundValue(surgeCapacityVA - surgeRequirementVA, 1);
            const continuousHeadroomPct = phase.designVA > 0 ? roundValue((continuousHeadroomVA / phase.designVA) * 100, 1) : 100;
            const surgeHeadroomPct = surgeRequirementVA > 0 ? roundValue((surgeHeadroomVA / surgeRequirementVA) * 100, 1) : 100;
            const limitingHeadroomPct = roundValue(Math.min(continuousHeadroomPct, surgeHeadroomPct), 1);
            const isAdequate = continuousHeadroomVA >= 0 && surgeHeadroomVA >= 0 && moduleCount > 0;

            return {
                key: phase.key,
                label: phase.label,
                moduleCount,
                designVA: phase.designVA || 0,
                designSurgeVA: surgeRequirementVA,
                continuousCapacityVA: roundValue(continuousCapacityVA, 1),
                surgeCapacityVA: roundValue(surgeCapacityVA, 1),
                continuousHeadroomVA,
                surgeHeadroomVA,
                continuousHeadroomPct,
                surgeHeadroomPct,
                limitingHeadroomPct,
                status: !isAdequate ? 'undersized' : limitingHeadroomPct < (this.getDefaultSettings().readyHeadroomPct || 15) ? 'tight' : 'ready',
                statusLabel: !isAdequate ? 'Undersized' : limitingHeadroomPct < (this.getDefaultSettings().readyHeadroomPct || 15) ? 'Tight' : 'Ready'
            };
        });

        const inadequatePhases = phases.filter(phase => phase.status === 'undersized');
        const worstPhase = phases.reduce((worst, phase) => {
            if (!worst) return phase;
            if (phase.limitingHeadroomPct < worst.limitingHeadroomPct) return phase;
            return worst;
        }, null) || phases[0];
        const worstHeadroomPct = worstPhase ? worstPhase.limitingHeadroomPct : 0;
        const strandedContinuousVA = roundValue(
            phases.reduce((sum, phase) => sum + Math.max(0, phase.continuousHeadroomVA), 0),
            1
        );

        return {
            phases,
            inadequatePhases,
            worstPhase,
            worstHeadroomPct,
            strandedContinuousVA,
            isAdequate: inadequatePhases.length === 0
        };
    },

    calculate(aggregatedLoad, inverter, config) {
        const phaseAllocation = aggregatedLoad?.phaseAllocation;
        const clusterConfig = config?.inverterCluster || {};
        const defaults = this.getDefaultSettings();

        if (config.phaseType !== 'three_phase' || !phaseAllocation || clusterConfig.enabled !== true) {
            return null;
        }

        const warnings = [];
        const blocks = [];
        const suggestions = [];
        const recommendations = [];
        const distributionMode = clusterConfig.distributionMode === 'manual'
            ? 'manual'
            : (defaults.defaultDistributionMode || 'auto');
        const requestedModuleVA = parseFloat(clusterConfig.moduleVA) || 0;
        const requestedModuleCount = Math.max(0, parseInt(clusterConfig.moduleCount, 10) || 0);
        const manualFallbackVA = parseFloat(clusterConfig.manualFallbackVA) || 0;
        const minModuleVAFromLoads = Math.max(
            (phaseAllocation.limitingPhaseDesignVA || 0) / DEFAULTS.INVERTER_DERATING,
            (phaseAllocation.surgeLimitingPhaseDesignVA || phaseAllocation.limitingPhaseDesignVA || 0) / (config.inverterSurgeMultiplier || 2.0)
        );
        const autoModuleVA = InverterSizingEngine.selectInverterSize(Math.max(300, minModuleVAFromLoads), config.inverterMarket);

        let moduleRatedVA = autoModuleVA;
        let sourceLabel = 'Auto-selected from the limiting phase';
        if (requestedModuleVA > 0) {
            moduleRatedVA = requestedModuleVA;
            sourceLabel = 'Planner input';
        } else if (manualFallbackVA > 0) {
            moduleRatedVA = manualFallbackVA;
            sourceLabel = 'Manual inverter size used as module size';
        }

        const moduleContinuousVA = roundValue(moduleRatedVA * DEFAULTS.INVERTER_DERATING, 1);
        const moduleSurgeVA = roundValue(moduleRatedVA * (config.inverterSurgeMultiplier || 2.0), 1);
        const minimumPhaseCounts = this.getMinimumPhaseCounts(phaseAllocation, moduleContinuousVA, moduleSurgeVA);
        const recommendedAutoCount = this.sumPhaseCounts(minimumPhaseCounts);

        let phaseCounts = distributionMode === 'manual'
            ? this.normalizePhaseCounts(clusterConfig.manualPhaseCounts)
            : this.distributeAuto(phaseAllocation, requestedModuleCount, minimumPhaseCounts);

        let totalModuleCount = this.sumPhaseCounts(phaseCounts);
        const maxModules = defaults.maxModules || 24;
        if (totalModuleCount > maxModules) {
            warnings.push(`The current cluster inputs produce ${totalModuleCount} modules. Review the phase allocation or increase module size because the planner is capped at ${maxModules} modules.`);
        }

        const evaluation = this.evaluatePlan(phaseAllocation, phaseCounts, moduleContinuousVA, moduleSurgeVA);
        const isEqualLeg = this.phaseKeys.every(key => phaseCounts[key] === phaseCounts.l1);
        const topology = isEqualLeg ? 'equal_leg' : 'phase_targeted';
        const topologyLabel = isEqualLeg ? 'Equal-leg cluster' : 'Phase-targeted cluster';
        let status = evaluation.isAdequate ? (evaluation.worstHeadroomPct >= (defaults.readyHeadroomPct || 15) ? 'ready' : 'tight') : 'undersized';
        let statusLabel = status === 'ready' ? 'Ready'
            : status === 'tight' ? 'Tight'
            : 'Undersized';
        let statusNote = status === 'ready'
            ? 'Phase capacities cover both continuous and surge requirements with healthy margin.'
            : status === 'tight'
                ? 'The cluster works, but one or more phases have limited headroom.'
                : 'At least one phase is overloaded or missing enough modules.';

        if (requestedModuleCount > 0 && distributionMode === 'auto' && requestedModuleCount < recommendedAutoCount) {
            warnings.push(`Requested ${requestedModuleCount} module${requestedModuleCount === 1 ? '' : 's'}, but the current phase loading needs about ${recommendedAutoCount} modules at ${Math.round(moduleRatedVA)}VA each to stay surge-safe.`);
        }
        if (distributionMode === 'manual' && requestedModuleCount > 0 && totalModuleCount !== requestedModuleCount) {
            warnings.push(`Manual phase counts total ${totalModuleCount}, which does not match the requested module count of ${requestedModuleCount}. The per-phase counts are used for validation.`);
        }
        if (distributionMode === 'manual' && totalModuleCount < (defaults.minModules || 3)) {
            blocks.push(`A 3-phase modular bank needs at least ${defaults.minModules || 3} modules. The current manual schedule only maps ${totalModuleCount}.`);
        }
        if (distributionMode === 'manual' && !isEqualLeg) {
            warnings.push(`Manual cluster uses a phase-targeted schedule (${this.getPhaseCountsLabel(phaseCounts)}). Confirm that the installation really uses independent per-phase inverter modules, not an equal-leg 3-phase stack.`);
        }
        if (isEqualLeg && phaseAllocation.redistributionPenaltyVA > 250) {
            warnings.push(`Equal-leg mapping leaves about ${Math.round(phaseAllocation.redistributionPenaltyVA)}VA of inverter capacity stranded because ${phaseAllocation.limitingPhase} is heavier than the other phases.`);
        }

        if (!evaluation.isAdequate) {
            evaluation.inadequatePhases.forEach(phase => {
                blocks.push(`${phase.label} is undersized in the current cluster plan. Need ${Math.round(phase.designVA)}VA continuous and ${Math.round(phase.designSurgeVA)}VA surge, but the mapped modules only provide ${Math.round(phase.continuousCapacityVA)}VA continuous and ${Math.round(phase.surgeCapacityVA)}VA surge.`);
            });
            const worstPhase = evaluation.worstPhase;
            if (worstPhase) {
                suggestions.push(`Add inverter modules to ${worstPhase.label} or increase module size above ${Math.round(moduleRatedVA)}VA so the worst phase is no longer the limiting leg.`);
            }
            if (recommendedAutoCount > totalModuleCount) {
                suggestions.push(`At ${Math.round(moduleRatedVA)}VA per module, the minimum practical cluster is about ${recommendedAutoCount} modules (${this.getPhaseCountsLabel(minimumPhaseCounts)}).`);
            }
        } else if (status === 'tight') {
            suggestions.push(`The cluster is viable, but the minimum phase headroom is only ${evaluation.worstHeadroomPct}%. Leave future single-phase additions on the lightest phase or add one spare module to the limiting leg.`);
        }

        if (distributionMode === 'auto' && requestedModuleCount === 0) {
            recommendations.push(`Planner chose ${recommendedAutoCount} modules at ${Math.round(moduleRatedVA)}VA each: ${this.getPhaseCountsLabel(minimumPhaseCounts)}.`);
        } else {
            recommendations.push(`Reference minimum at ${Math.round(moduleRatedVA)}VA per module is ${recommendedAutoCount} modules: ${this.getPhaseCountsLabel(minimumPhaseCounts)}.`);
        }

        const totalClusterVA = roundValue(totalModuleCount * moduleRatedVA, 1);
        const totalContinuousCapacityVA = roundValue(totalModuleCount * moduleContinuousVA, 1);
        const totalSurgeCapacityVA = roundValue(totalModuleCount * moduleSurgeVA, 1);
        const requestedCountLabel = requestedModuleCount > 0 ? `${requestedModuleCount}` : 'Auto';

        return {
            enabled: true,
            distributionMode,
            distributionModeLabel: distributionMode === 'manual' ? 'Manual phase map' : 'Auto-balanced map',
            moduleRatedVA: roundValue(moduleRatedVA, 1),
            moduleContinuousVA,
            moduleSurgeVA,
            sourceLabel,
            requestedModuleCount,
            requestedCountLabel,
            totalModuleCount,
            totalClusterVA,
            totalContinuousCapacityVA,
            totalSurgeCapacityVA,
            phaseCounts,
            phaseDistributionLabel: this.getPhaseCountsLabel(phaseCounts),
            recommendedAutoPhaseCounts: minimumPhaseCounts,
            recommendedAutoCount,
            topology,
            topologyLabel,
            isEqualLeg,
            status,
            statusLabel,
            statusNote,
            worstHeadroomPct: evaluation.worstHeadroomPct,
            worstPhaseKey: evaluation.worstPhase?.key || 'l1',
            worstPhaseLabel: evaluation.worstPhase?.label || 'L1',
            strandedContinuousVA: evaluation.strandedContinuousVA,
            phases: evaluation.phases,
            warnings,
            blocks,
            suggestions,
            recommendations
        };
    }
};

/* =============================================================================
   PHASE 3B: MANAGED PRACTICAL INVERTER ENGINE
   Calculates the minimum inverter size when the operator follows load discipline.
   Unlike engineering tiers (all-at-once or staggered), this engine:
   - Excludes rare/weekly loads from peak simultaneous demand
   - Allows only one motor surge at a time (biggest motor only)
   - Classifies loads by behavior (dutyFrequency, canStagger, isDaytimeOnly)
   - Generates explicit operational conditions the user must follow
   ============================================================================= */

const ManagedModeEngine = {
    calculate(
        appliances: EngineApplianceInput[],
        aggregation: EngineAggregationResult,
        inverter: EngineInverterSizingResult,
        config: EngineSystemConfig
    ): EngineManagedModeResult | null {
        if (!appliances || appliances.length === 0) return null;

        const conditions: EnginePracticalCondition[] = [];
        const derating = DEFAULTS.INVERTER_DERATING || 0.8;
        const surgeMultiplier = config.inverterSurgeMultiplier || 2.0;

        // Step 1: Classify appliances by behavior
        const continuous = [];   // 24/7 loads (fridge, security lights)
        const daily = [];        // Used every day (TV, lights, phone charger)
        const weekly = [];       // 1-2x/week (iron, washing machine)
        const rare = [];         // Monthly/seasonal (power tools, heater)
        const daytimeOnly = [];  // Only during sun hours
        const motorApps = [];    // All motor loads
        const staggerableMotors = []; // Motors that can wait 30-60s

        for (const app of appliances) {
            const freq = app.dutyFrequency || 'daily';
            const va = LoadEngine.calculateApparentPowerVA(app);
            const surgeVA = LoadEngine.calculateStartingVA(app);
            const entry = { app, va, surgeVA, surgeDelta: surgeVA - va };

            if (freq === 'continuous') continuous.push(entry);
            else if (freq === 'weekly') weekly.push(entry);
            else if (freq === 'rare') rare.push(entry);
            else daily.push(entry);

            if (app.isDaytimeOnly === true || app.isDaytimeOnly === 'yes') {
                daytimeOnly.push(entry);
            }
            if (app.loadType === 'motor') {
                motorApps.push(entry);
                if (app.canStagger === 'yes') staggerableMotors.push(entry);
            }
        }

        // Step 2: Managed continuous VA — only continuous + daily simultaneous
        // Exclude rare and weekly from peak demand (they won't run during peak hours)
        const continuousVA = continuous.reduce((s, e) => s + (e.app.isSimultaneous ? e.va : 0), 0);
        const dailySimVA = daily.reduce((s, e) => s + (e.app.isSimultaneous ? e.va : 0), 0);
        // Add largest non-simultaneous from continuous+daily (standard peak calc)
        const nonSimEntries = [...continuous, ...daily].filter(e => !e.app.isSimultaneous);
        const largestNonSim = nonSimEntries.length > 0
            ? Math.max(...nonSimEntries.map(e => e.va)) : 0;
        const managedContinuousVA = continuousVA + dailySimVA + largestNonSim;

        // Step 3: Managed surge — continuous base + ONLY biggest single motor surge delta
        // (not all motors at once, just the dominant one surges while others already running)
        let biggestMotorSurgeDelta = 0;
        let biggestMotorName = '';
        for (const m of motorApps) {
            if (m.surgeDelta > biggestMotorSurgeDelta) {
                biggestMotorSurgeDelta = m.surgeDelta;
                biggestMotorName = m.app.name;
            }
        }
        const managedSurgeVA = managedContinuousVA + biggestMotorSurgeDelta;

        // Step 4: Determine minimum inverter size for managed mode
        const managedMinFromContinuous = managedContinuousVA / derating;
        const managedMinFromSurge = managedSurgeVA / surgeMultiplier;
        const managedMinVA = Math.max(managedMinFromContinuous, managedMinFromSurge);
        const managedSizeVA = InverterSizingEngine.selectInverterSize(managedMinVA, config.inverterMarket);

        // Step 5: Generate operational discipline conditions
        if (staggerableMotors.length > 1) {
            const motorNames = staggerableMotors.map(m => m.app.name).join(', ');
            conditions.push({
                type: 'stagger',
                severity: 'critical',
                text: `Stagger motor starts by 30-60 seconds. Never start two motors simultaneously.`,
                detail: `Motors: ${motorNames}. Start the largest motor first, wait for it to reach steady state, then start the next.`
            });
        }
        if (rare.length > 0) {
            const rareNames = rare.map(e => e.app.name).join(', ');
            conditions.push({
                type: 'rare_exclusion',
                severity: 'important',
                text: `Rare-use loads excluded from peak sizing: ${rareNames}`,
                detail: `These loads must NOT run simultaneously with motor loads or other heavy appliances. Schedule them for off-peak times when only base loads are running.`
            });
        }
        if (weekly.length > 0) {
            const weeklyNames = weekly.map(e => e.app.name).join(', ');
            conditions.push({
                type: 'weekly_schedule',
                severity: 'important',
                text: `Weekly loads must not overlap with each other: ${weeklyNames}`,
                detail: `Run only one weekly load at a time. Switch off non-essential loads while running heavy weekly appliances.`
            });
        }
        if (daytimeOnly.length > 0) {
            const dayNames = daytimeOnly.map(e => e.app.name).join(', ');
            conditions.push({
                type: 'daytime_only',
                severity: 'advisory',
                text: `Run these loads only during peak sun hours (10am-4pm): ${dayNames}`,
                detail: `Running these during daytime reduces battery strain and leverages direct solar power.`
            });
        }
        if (biggestMotorSurgeDelta > 0 && motorApps.length >= 1) {
            conditions.push({
                type: 'motor_surge',
                severity: 'critical',
                text: `Biggest surge source: ${biggestMotorName} (~${Math.round(biggestMotorSurgeDelta)}VA surge delta)`,
                detail: `This motor's startup draws the most current. Ensure no other heavy loads are starting when this motor kicks in.`
            });
        }

        // Step 6: Risk assessment (compare managed size to user's inverter if manual override)
        // Inverter technology bonus: transformer-based inverters handle surge better
        const invTech = config.inverterTechnology || 'unknown';
        const techBonus = invTech === 'transformer' ? 0.05 : 0; // 5% favorable shift for transformer
        const techNote = invTech === 'transformer' ? ' (transformer bonus applied)' : '';

        const userVA = inverter.isManualOverride ? inverter.recommendedSizeVA : null;
        let riskLevel = 'GREEN';
        let riskLabel = 'Viable';
        let riskDetail = '';

        if (userVA) {
            const ratio = managedSizeVA / userVA - techBonus;
            if (ratio <= 0.70) {
                riskLevel = 'GREEN';
                riskLabel = 'Comfortable';
                riskDetail = `Your ${userVA}VA has ${Math.round((1 - ratio) * 100)}% headroom above managed requirement.`;
            } else if (ratio <= 0.85) {
                riskLevel = 'YELLOW';
                riskLabel = 'Viable with Discipline';
                riskDetail = `Your ${userVA}VA is adequate but requires consistent load management.`;
            } else if (ratio <= 1.0) {
                riskLevel = 'ORANGE';
                riskLabel = 'Tight — Strict Discipline Required';
                riskDetail = `Your ${userVA}VA barely meets managed requirements. Any deviation from conditions may cause overload.`;
            } else {
                riskLevel = 'RED';
                riskLabel = 'Upgrade Required';
                riskDetail = `Your ${userVA}VA is insufficient even with managed discipline. Minimum: ${managedSizeVA}VA.`;
            }
        }

        // Engineering comparison
        const engineeringVA = inverter.autoSuggestedSizeVA || inverter.recommendedSizeVA;
        const savings = engineeringVA > 0 ? Math.round((1 - managedSizeVA / engineeringVA) * 100) : 0;

        return {
            managedSizeVA,
            managedContinuousVA: Math.round(managedContinuousVA),
            managedSurgeVA: Math.round(managedSurgeVA),
            managedMinVA: Math.round(managedMinVA),
            conditions,
            conditionCount: conditions.length,
            riskLevel,
            riskLabel,
            riskDetail,
            biggestMotorName,
            biggestMotorSurgeDelta: Math.round(biggestMotorSurgeDelta),
            engineeringVA,
            savings,
            // Classification summary
            classification: {
                continuous: continuous.length,
                daily: daily.length,
                weekly: weekly.length,
                rare: rare.length,
                daytimeOnly: daytimeOnly.length,
                motors: motorApps.length,
                staggerableMotors: staggerableMotors.length
            },
            // Inverter technology
            inverterTechnology: invTech,
            techNote,
            // Excluded loads (not counted in managed peak)
            excludedLoads: [...weekly, ...rare].map(e => ({
                name: e.app.name, va: Math.round(e.va), freq: e.app.dutyFrequency
            }))
        };
    },

    /**
     * Get risk color for CSS styling
     */
    getRiskColor(level: string): string {
        switch (level) {
            case 'GREEN': return '#16a34a';
            case 'YELLOW': return '#ca8a04';
            case 'ORANGE': return '#ea580c';
            case 'RED': return '#dc2626';
            default: return '#6b7280';
        }
    },

    /**
     * Get risk background for cards
     */
    getRiskBg(level: string): string {
        switch (level) {
            case 'GREEN': return 'rgba(22,163,74,0.06)';
            case 'YELLOW': return 'rgba(202,138,4,0.06)';
            case 'ORANGE': return 'rgba(234,88,12,0.06)';
            case 'RED': return 'rgba(220,38,38,0.06)';
            default: return 'var(--bg-color)';
        }
    },

    calculateRiskIndex(engineeringValue: number, practicalValue: number): EngineRiskIndexResult {
        if (!engineeringValue || engineeringValue <= 0) {
            return { level: 'GREEN', deviation: 0, badge: '', color: '#16a34a' };
        }
        const deviation = Math.max(0, Math.round((1 - practicalValue / engineeringValue) * 100));
        let level = 'GREEN';
        if (deviation <= 15) level = 'GREEN';
        else if (deviation <= 30) level = 'YELLOW';
        else if (deviation <= 50) level = 'ORANGE';
        else level = 'RED';

        const color = this.getRiskColor(level);
        const badge = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-left:5px;vertical-align:middle;" title="Practical deviation: ${deviation}% (${level})"></span>`;

        return { level, deviation, color, badge };
    }
};

/* =============================================================================
   PHASE 4: BATTERY SIZING ENGINE
   ============================================================================= */

const BatterySizingEngine = {
    /**
     * Select appropriate cell Ah rating (generic — lead acid and fallback)
     */
    selectCellAh(requiredAh) {
        for (const ah of DEFAULTS.STANDARD_AH_RATINGS) {
            if (ah >= requiredAh) {
                return ah;
            }
        }
        return Math.ceil(requiredAh / 100) * 100;
    },

    /**
     * Select LiFePO4 cell Ah from standard ratings
     */
    selectLithiumCellAh(requiredAh) {
        // Merge cell ratings + module Ah values for comprehensive matching
        const allAh = [...new Set([
            ...DEFAULTS.LIFEPO4_CELL_RATINGS,
            ...DEFAULTS.LITHIUM_MODULES.catalog.map(m => m.ah)
        ])].sort((a, b) => a - b);
        // Pick smallest that covers the requirement
        for (const ah of allAh) {
            if (ah >= requiredAh) return ah;
        }
        // Beyond max — return largest, caller uses parallel strings
        return allAh[allAh.length - 1];
    },

    /**
     * Match closest lithium module from catalog
     */
    /**
     * Match lithium module from catalog based on required NOMINAL kWh.
     * Prefers stacking common modules (5.12, 7.68, 10.24 kWh) over rare large singles.
     * @param {number} nominalKWh - Required nominal capacity (after DoD, efficiency, autonomy)
     * @returns {BatteryModuleMatch}
     */
    matchLithiumModule(nominalKWh) {
        const catalog = DEFAULTS.LITHIUM_MODULES.catalog;
        // Stackable base units — these are the most available rack modules in the market
        const stackBases = catalog.filter(m => m.kWh <= 10.24);

        // 1. Try single module match (smallest module >= required nominal)
        let singleMatch = null;
        for (const mod of catalog) {
            if (mod.kWh >= nominalKWh * 0.97) {   // 3% tolerance for rounding
                singleMatch = mod;
                break;
            }
        }

        // If single module fits and is <= 10.24 kWh, use it directly (common market unit)
        if (singleMatch && singleMatch.kWh <= 10.24) {
            return { ...singleMatch, stackCount: 1 };
        }

        // 2. For > 10.24 kWh: prefer stacking common modules
        // Find the best stacking option (fewest units, closest fit)
        let bestStack = null;
        for (const base of stackBases) {
            if (base.kWh < 5) continue;  // Skip tiny modules for stacking
            const units = Math.ceil(nominalKWh / base.kWh);
            const totalKWh = Math.round(base.kWh * units * 100) / 100;
            const waste = totalKWh - nominalKWh;
            if (!bestStack || units < bestStack.units || (units === bestStack.units && waste < bestStack.waste)) {
                bestStack = { base, units, totalKWh, waste };
            }
        }

        // If stacking works (2-6 units), prefer it over rare large single module
        if (bestStack && bestStack.units <= 6) {
            const b = bestStack.base;
            return {
                kWh: bestStack.totalKWh,
                ah: Math.round(b.ah * bestStack.units),
                label: bestStack.units === 1
                    ? b.label
                    : `${bestStack.totalKWh} kWh (${bestStack.units}\u00D7 ${b.label})`,
                note: bestStack.units === 1
                    ? b.note
                    : `${bestStack.units} units stacked/parallel, each ${b.kWh} kWh`,
                stackCount: bestStack.units,
                stackUnit: b
            };
        }

        // 3. Fallback: if a large single module exists, use it
        if (singleMatch) {
            return { ...singleMatch, stackCount: 1 };
        }

        // 4. Very large requirement: stack largest available
        const largest = catalog[catalog.length - 1];
        const unitsNeeded = Math.ceil(nominalKWh / largest.kWh);
        return {
            kWh: Math.round(largest.kWh * unitsNeeded * 100) / 100,
            ah: largest.ah * unitsNeeded,
            label: `${Math.round(largest.kWh * unitsNeeded * 10) / 10} kWh (${unitsNeeded}\u00D7 ${largest.label})`,
            note: `${unitsNeeded} units stacked/parallel, each ${largest.kWh} kWh`,
            stackCount: unitsNeeded,
            stackUnit: largest
        };
    },

    /**
     * Build tiered recommendations from RAW usable energy.
     * Tiers multiply the usable demand FIRST, then each tier independently
     * computes its own nominal via: tierNominal = (usable × multiplier) / (DoD × efficiency)
     * This avoids compounding margin-on-margin.
     *
     * @param {number} usableEnergyWh - Raw energy demand (dailyLoad × autonomy), before DoD/eff
     * @param {number} bankVoltage    - Effective bank voltage (51.2V for LiFePO4)
     * @param {object} specs          - Battery chemistry specs (DoD, efficiency, etc.)
     * @param {string} chemistry      - Chemistry key
     * @param {number} designMarginPct - Design margin as percentage (e.g. 125)
     * @returns {BatteryTierSet}
     */
    buildTiers(usableEnergyWh, bankVoltage, specs, chemistry, designMarginPct) {
        const isLithium = chemistry === 'lifepo4';
        const tiers = {} as EngineBatteryTierSet;
        const dod = specs.maxDoD;
        const eff = specs.dischargeEfficiency;
        const margin = (designMarginPct || 100) / 100;
        const selfDischargeFactor = 1 + (specs.selfDischargeDaily * (usableEnergyWh > 0 ? 1 : 0));

        // Helper: build a tier by scaling USABLE energy, then computing nominal
        const makeTier = (label, multiplier, note) => {
            // 1. Scale the usable energy demand
            const tierUsableWh = usableEnergyWh * multiplier;
            // 2. Convert to nominal: usable / (DoD × eff) × self-discharge × design margin
            const tierNominalWh = (tierUsableWh / eff / dod) * selfDischargeFactor * margin;
            const tierNominalKWh = Math.round(tierNominalWh / 100) / 10;
            // 3. Convert to Ah at bank voltage for cell-level sizing
            const targetAh = tierNominalWh / bankVoltage;
            const cellAh = isLithium ? this.selectLithiumCellAh(targetAh) : this.selectCellAh(targetAh);
            const strings = Math.ceil(targetAh / cellAh);
            const actualAh = strings * cellAh;
            const actualKWh = Math.round(actualAh * bankVoltage / 100) / 10;
            // 4. Module match based on tier's nominal kWh
            const module = isLithium ? this.matchLithiumModule(tierNominalKWh) : null;
            return {
                label,
                ah: cellAh,
                kWh: actualKWh,
                strings,
                nominalKWh: tierNominalKWh,
                note: strings > 1 ? `${note} — ${strings}P \u00D7 ${cellAh}Ah` : note,
                module
            };
        };

        tiers.economy = makeTier('ECONOMY MATCH', 1.0,
            'Meets computed requirement (DoD + efficiency + margin applied)');
        tiers.balanced = makeTier('BALANCED DESIGN', 1.20,
            '+20% usable headroom for degradation & real-world cycling');
        tiers.expansion = makeTier('EXPANSION READY', 1.50,
            '+50% usable headroom — absorbs load growth without upgrade');

        return tiers;
    },

    /**
     * Calculate battery bank requirements
     * @param {AggregationResult} aggregatedLoad
     * @param {InverterSizingResult} inverterReq
     * @param {SystemConfig} config
     * @param {string} chemistry
     * @returns {BatterySizingResult}
     */
    calculate(aggregatedLoad, inverterReq, config, chemistry) {
        const warnings = [];
        const blocks = [];
        const suggestions = [];

        const specs = DEFAULTS.BATTERY_SPECS[chemistry];
        const bankVoltage = inverterReq.dcBusVoltage;
        const cellVoltage = specs.cellVoltage;
        const isLithium = chemistry === 'lifepo4';

        // For LiFePO4: use 51.2V (16S) standard when bank voltage is 48V
        const effectiveCellsInSeries = isLithium && bankVoltage >= 48
            ? (specs.cellsPerModule || 16)
            : Math.round(bankVoltage / cellVoltage);
        const effectiveBankVoltage = isLithium && bankVoltage >= 48
            ? (specs.moduleVoltage || 51.2)
            : bankVoltage;

        // Calculate usable capacity needed
        const usableCapacityWh = (aggregatedLoad.dailyEnergyWh * config.autonomyDays) / specs.dischargeEfficiency;

        // Total capacity considering DoD
        let totalCapacityWh = usableCapacityWh / specs.maxDoD;

        // Add margin for self-discharge during autonomy
        const selfDischargeLoss = specs.selfDischargeDaily * config.autonomyDays;
        totalCapacityWh *= (1 + selfDischargeLoss);

        // Apply design margin
        totalCapacityWh *= (config.designMargin / 100);

        // Climate adjustment (after margin, before Ah — preserves locked battery flow)
        let climateNote = null;
        const climateAdj = DEFAULTS.CLIMATE_BATTERY_ADJUST[config.climate || 'mixed'];
        if (climateAdj && climateAdj.buffer !== 0) {
            totalCapacityWh *= (1 + climateAdj.buffer);
            climateNote = climateAdj.label;
        }

        // Calculate Ah at bank voltage (use effective voltage for lithium)
        let totalCapacityAh = totalCapacityWh / effectiveBankVoltage;

        // Series/parallel configuration
        const cellsInSeries = effectiveCellsInSeries;

        // Check discharge rate
        const peakLoadCurrent = inverterReq.dcInputCurrentSurge;
        let maxDischargeCurrent = totalCapacityAh * specs.maxDischargeRate;

        if (peakLoadCurrent > maxDischargeCurrent) {
            const requiredAh = peakLoadCurrent / specs.maxDischargeRate;
            if (requiredAh > totalCapacityAh) {
                warnings.push(
                    `Battery Ah increased from ${Math.round(totalCapacityAh)}Ah to ${Math.round(requiredAh)}Ah to support ${peakLoadCurrent.toFixed(1)}A discharge`
                );
                totalCapacityAh = requiredAh;
                totalCapacityWh = totalCapacityAh * effectiveBankVoltage;
            }
        }

        // Select cell Ah rating and parallel strings
        const recommendedAh = isLithium ? this.selectLithiumCellAh(totalCapacityAh) : this.selectCellAh(totalCapacityAh);
        const stringsParallel = Math.ceil(totalCapacityAh / recommendedAh);
        const actualCapacityAh = stringsParallel * recommendedAh;

        // Recalculate actual current ratings
        maxDischargeCurrent = actualCapacityAh * specs.maxDischargeRate;
        const maxChargeCurrent = actualCapacityAh * specs.maxChargeRate;

        // Hard blocks for current violations
        if (peakLoadCurrent > maxDischargeCurrent * 1.5) {
            blocks.push(
                `HARD BLOCK: Peak load current ${peakLoadCurrent.toFixed(1)}A exceeds safe discharge limit of ${(maxDischargeCurrent * 1.5).toFixed(1)}A (150% of max). Risk of battery damage and fire.`
            );
            suggestions.push(
                `Increase battery capacity to at least ${Math.round(peakLoadCurrent / specs.maxDischargeRate)}Ah or reduce peak load by using soft-start motors.`
            );
        }

        const totalCells = cellsInSeries * stringsParallel;

        // Required nominal kWh — the engineering basis for module selection
        // This is totalCapacityWh BEFORE cell rounding, representing the true requirement
        const requiredNominalKWh = Math.round(totalCapacityWh / 100) / 10;

        // Design basis for transparency
        const designBasis: EngineBatteryDesignBasis = {
            dailyLoadWh: Math.round(aggregatedLoad.dailyEnergyWh),
            autonomyDays: config.autonomyDays,
            dod: specs.maxDoD,
            dischargeEfficiency: specs.dischargeEfficiency,
            designMargin: config.designMargin,
            effectiveUsableFactor: Math.round(specs.maxDoD * specs.dischargeEfficiency * 1000) / 1000,
            requiredNominalKWh,
            climateNote: climateNote
        };

        // Build tiered recommendations — tiers scale USABLE energy, then each computes its own nominal
        const baseUsableEnergyWh = aggregatedLoad.dailyEnergyWh * config.autonomyDays;
        const tiers = this.buildTiers(baseUsableEnergyWh, effectiveBankVoltage, specs, chemistry, config.designMargin);

        // Capacity range for display
        const capacityRange: EngineBatteryCapacityRange = {
            min: tiers.economy.ah,
            balanced: tiers.balanced.ah,
            max: tiers.expansion.strings * tiers.expansion.ah,
            minKWh: tiers.economy.kWh,
            balancedKWh: tiers.balanced.kWh,
            maxKWh: tiers.expansion.kWh
        };

        // Lithium module recommendation — based on required nominal kWh (not rounded cell Ah)
        const moduleMatch = isLithium ? this.matchLithiumModule(requiredNominalKWh) : null;

        // Note about 51.2V standard
        if (isLithium && bankVoltage >= 48) {
            suggestions.push(
                `LiFePO4 standard: 51.2V nominal (16S × 3.2V). Modern rack batteries (Pylontech, Felicity, BYD, Deye) use this standard. Actual terminal voltage: 44.8V–58.4V operating range.`
            );
        }

        return {
            chemistry,
            chemistryName: specs.name,
            usableCapacityWh: Math.round(usableCapacityWh * 10) / 10,
            totalCapacityWh: Math.round(actualCapacityAh * effectiveBankVoltage * 10) / 10,
            totalCapacityAh: Math.round(actualCapacityAh * 10) / 10,
            bankVoltage: effectiveBankVoltage,
            bankVoltageNominal: bankVoltage,
            cellsInSeries,
            stringsInParallel: stringsParallel,
            totalCells,
            maxDischargeCurrent: Math.round(maxDischargeCurrent * 10) / 10,
            maxChargeCurrent: Math.round(maxChargeCurrent * 10) / 10,
            peakLoadCurrent: Math.round(peakLoadCurrent * 10) / 10,
            recommendedAhPerCell: recommendedAh,
            // Engineering basis + tiered recommendations
            requiredNominalKWh,
            designBasis,
            tiers,
            capacityRange,
            moduleMatch,
            isLithium,
            effectiveBankVoltage,
            warnings,
            blocks,
            suggestions
        };
    }
};

/* =============================================================================
   PHASE 4B: BATTERY PRACTICAL ENGINE
   Calculates reduced-autonomy battery sizing with load-shifting discipline.
   Engineering sizing assumes full autonomy (all loads, all hours).
   Practical sizing: heavy/weekly/rare loads run daytime only (solar-powered),
   battery handles only nighttime continuous + daily essential loads.
   ============================================================================= */

const BatteryPracticalEngine = {
    calculate(
        appliances: EngineApplianceInput[],
        battery: EngineBatterySizingResult,
        aggregation: EngineAggregationResult,
        config: EngineSystemConfig
    ): EngineBatteryPracticalResult | null {
        if (!appliances || appliances.length === 0 || !battery) return null;

        const conditions: EnginePracticalCondition[] = [];
        const autonomyDays = config.autonomyDays || 1;

        // Classify loads by behavior
        let nighttimeEssentialWh = 0;  // Must run at night (fridge, security, lights)
        let daytimeHeavyWh = 0;        // Can be shifted to daytime (iron, washing machine, tools)
        let totalDailyWh = 0;

        for (const app of appliances) {
            const dailyWh = LoadEngine.calculateDailyEnergyWh(app);
            totalDailyWh += dailyWh;
            const freq = app.dutyFrequency || 'daily';
            const isDaytime = app.isDaytimeOnly === true || app.isDaytimeOnly === 'yes';
            const loadRole = resolveLoadRole(app);
            const loadCriticality = resolveLoadCriticality(app, loadRole, config);

            if (isDaytime || freq === 'weekly' || freq === 'rare' || loadCriticality === 'deferrable') {
                // These loads run during sun hours — powered directly by PV, minimal battery draw
                daytimeHeavyWh += dailyWh;
            } else {
                // Continuous + daily non-daytime loads: battery must handle overnight portion
                // Use existing daytimeRatio to estimate nighttime draw
                const nightFraction = 1 - (app.daytimeRatio || 50) / 100;
                nighttimeEssentialWh += dailyWh * nightFraction;
            }
        }

        // Practical autonomy: reduced from engineering standard
        // Engineering uses full autonomyDays; practical uses half (minimum 0.5 day)
        const practicalAutonomy = Math.max(0.5, autonomyDays * 0.5);

        // Practical energy requirement: only nighttime essentials for reduced autonomy
        const practicalEnergyWh = nighttimeEssentialWh * practicalAutonomy;
        const engineeringEnergyWh = totalDailyWh * autonomyDays;

        // Calculate practical battery Ah
        const specs = DEFAULTS.BATTERY_SPECS?.[battery.chemistry] || DEFAULTS.BATTERY_SPECS?.lifepo4 || { maxDoD: 0.8, dischargeEfficiency: 0.95 };
        const usableFactor = specs.maxDoD * specs.dischargeEfficiency;
        const bankVoltage = battery.bankVoltage || battery.effectiveBankVoltage || 48;
        const practicalNominalWh = practicalEnergyWh / usableFactor;
        const practicalAh = Math.round(practicalNominalWh / bankVoltage);

        const engineeringAh = battery.totalCapacityAh || 0;
        const savings = engineeringAh > 0 ? Math.round((1 - practicalAh / engineeringAh) * 100) : 0;

        // Generate conditions
        if (daytimeHeavyWh > 0) {
            conditions.push({
                type: 'load_shifting',
                severity: 'critical',
                text: `Run heavy loads during peak sun hours (10am-4pm) — powered directly by PV`,
                detail: `${Math.round(daytimeHeavyWh)}Wh of daily load shifted to daytime. Battery only handles ${Math.round(nighttimeEssentialWh)}Wh overnight.`
            });
        }
        if (practicalAutonomy < autonomyDays) {
            conditions.push({
                type: 'reduced_autonomy',
                severity: 'important',
                text: `Autonomy reduced from ${autonomyDays} to ${practicalAutonomy} day${practicalAutonomy !== 1 ? 's' : ''}`,
                detail: `During extended outages or cloudy days, non-essential loads must be switched off to preserve battery.`
            });
        }
        conditions.push({
            type: 'essential_only',
            severity: 'advisory',
            text: `During backup (no sun): only run continuous loads (fridge, security)`,
            detail: `Daily loads (TV, lights) can run but on reduced schedule. Weekly/rare loads must wait for sun.`
        });

        // Risk assessment
        let riskLevel = 'GREEN';
        let riskLabel = 'Comfortable';
        const deviation = engineeringAh > 0 ? (1 - practicalAh / engineeringAh) : 0;
        if (deviation <= 0.15) {
            riskLevel = 'GREEN'; riskLabel = 'Minimal Risk';
        } else if (deviation <= 0.30) {
            riskLevel = 'YELLOW'; riskLabel = 'Manageable with Discipline';
        } else if (deviation <= 0.50) {
            riskLevel = 'ORANGE'; riskLabel = 'Strict Discipline Required';
        } else {
            riskLevel = 'RED'; riskLabel = 'Significant Compromise';
        }

        return {
            practicalAh,
            practicalWh: Math.round(practicalNominalWh),
            practicalAutonomy,
            nighttimeEssentialWh: Math.round(nighttimeEssentialWh),
            daytimeHeavyWh: Math.round(daytimeHeavyWh),
            engineeringAh,
            engineeringWh: Math.round(engineeringEnergyWh),
            savings,
            conditions,
            conditionCount: conditions.length,
            riskLevel,
            riskLabel,
            bankVoltage
        };
    }
};

/* =============================================================================
   PHASE 4C: COMMERCIAL POWER ARCHITECTURE ENGINE
   Adds board-strategy realism, shared-battery throughput analysis,
   generator-assist checks, and PV field / MPPT grouping guidance.
   ============================================================================= */

const CommercialArchitectureEngine = {
    getDefinitions(key, fallback = {}) {
        return DEFAULTS[key] || fallback;
    },

    /**
     * @returns {Record<string, CommercialArchitectureModeDefinition>}
     */
    getBoardDefinitions() {
        return this.getDefinitions('COMMERCIAL_ARCHITECTURE_MODES');
    },

    /**
     * @returns {Record<string, GeneratorSupportModeDefinition>}
     */
    getGeneratorDefinitions() {
        return this.getDefinitions('GENERATOR_SUPPORT_MODES');
    },

    /**
     * @returns {Record<string, PVFieldLayoutDefinition>}
     */
    getFieldLayoutDefinitions() {
        return this.getDefinitions('PV_FIELD_LAYOUTS');
    },

    /**
     * @returns {Record<string, MPPTGroupingDefinition>}
     */
    getGroupingDefinitions() {
        return this.getDefinitions('MPPT_GROUPING_MODES');
    },

    /**
     * @returns {BatteryThroughputThresholds}
     */
    getThresholds() {
        return DEFAULTS.BATTERY_THROUGHPUT_THRESHOLDS || {
            readyUtilizationPct: 70,
            tightUtilizationPct: 85,
            failUtilizationPct: 100,
            emergencySurgeFactor: 1.5,
            tightStressIndex: 75,
            failStressIndex: 95
        };
    },

    /**
     * @param {string} profileKey
     * @param {string} operatingIntentKey
     * @returns {CommercialArchitectureProfileDefaults}
     */
    getProfileDefaults(profileKey, operatingIntentKey) {
        const defaults = /** @type {Record<string, CommercialArchitectureProfileDefaults>} */ (DEFAULTS.COMMERCIAL_ARCHITECTURE_PROFILE_DEFAULTS || {});
        const base = defaults[profileKey] || defaults.custom_mixed_site || {
            boardStrategy: 'full_site_board',
            pvFieldLayout: 'single_field',
            mpptGrouping: 'auto'
        };
        let boardStrategy = base.boardStrategy || 'full_site_board';
        if (operatingIntentKey === 'essential_loads_only') {
            boardStrategy = 'essential_subboard';
        } else if (operatingIntentKey === 'hybrid_generator') {
            boardStrategy = 'generator_assist';
        }
        return {
            boardStrategy,
            generatorSupportMode: operatingIntentKey === 'hybrid_generator' ? 'planned_generator' : 'none',
            pvFieldLayout: base.pvFieldLayout || 'single_field',
            mpptGrouping: base.mpptGrouping || 'auto'
        };
    },

    /**
     * @param {SystemConfig} config
     * @returns {CommercialBoardStrategyResolution}
     */
    resolveBoardStrategy(config, metrics = {}) {
        const definitions = this.getBoardDefinitions();
        const selectedKey = config?.commercialArchitectureMode || 'auto';
        const defaults = this.getProfileDefaults(config?.businessProfile || 'custom_mixed_site', config?.operatingIntent || 'backup_only');
        let resolvedKey = selectedKey;

        if (selectedKey === 'auto') {
            if (config?.operatingIntent === 'essential_loads_only') {
                resolvedKey = 'essential_subboard';
            } else if ((config?.generatorSupportMode && config.generatorSupportMode !== 'none') || config?.operatingIntent === 'hybrid_generator') {
                resolvedKey = 'generator_assist';
            } else if (
                config?.phaseType === 'three_phase'
                && ['process_critical', 'product_loss_critical'].includes(config?.continuityClass)
            ) {
                resolvedKey = defaults.boardStrategy || 'process_split_board';
            } else {
                resolvedKey = defaults.boardStrategy || 'full_site_board';
            }
        }

        return {
            selectedKey,
            selectedDefinition: definitions[selectedKey] || definitions.auto,
            resolvedKey,
            definition: definitions[resolvedKey] || definitions.full_site_board
        };
    },

    /**
     * @param {SystemConfig} config
     * @param {{ inputCount?: number | string }} [mppt]
     * @returns {MPPTGroupingResolution}
     */
    resolveMPPTGrouping(config, mppt) {
        const definitions = this.getGroupingDefinitions();
        const selectedKey = config?.mpptGroupingMode || 'auto';
        const fieldLayout = config?.pvFieldLayout || this.getProfileDefaults(config?.businessProfile, config?.operatingIntent).pvFieldLayout || 'single_field';
        const trackerCount = Math.max(1, Number(mppt?.inputCount) || 1);
        let resolvedKey = selectedKey;

        if (selectedKey === 'auto') {
            if (trackerCount <= 1) {
                resolvedKey = 'grouped_single_field';
            } else if (fieldLayout === 'mixed_orientation') {
                resolvedKey = 'orientation_split';
            } else if (['roof_and_ground', 'distributed_canopy', 'dual_roof'].includes(fieldLayout)) {
                resolvedKey = 'field_split';
            } else {
                resolvedKey = 'grouped_single_field';
            }
        }

        return {
            selectedKey,
            selectedDefinition: definitions[selectedKey] || definitions.auto,
            resolvedKey,
            definition: definitions[resolvedKey] || definitions.grouped_single_field
        };
    },

    /**
     * @param {SystemConfig} config
     * @param {{ inputCount?: number | string }} [mppt]
     * @returns {{ resolvedBoardStrategy: CommercialArchitectureModeDefinition, resolvedBoardStrategyKey: string, resolvedMPPTGrouping: MPPTGroupingDefinition, resolvedMPPTGroupingKey: string }}
     */
    resolvePreview(config, mppt) {
        const board = this.resolveBoardStrategy(config, {});
        const grouping = this.resolveMPPTGrouping(config, mppt);
        return {
            resolvedBoardStrategy: board.definition,
            resolvedBoardStrategyKey: board.resolvedKey,
            resolvedMPPTGrouping: grouping.definition,
            resolvedMPPTGroupingKey: grouping.resolvedKey
        };
    },

    /**
     * @param {ApplianceInput[]} appliances
     * @param {SystemConfig} config
     * @param {(appliance: ApplianceInput) => boolean} predicate
     * @returns {CommercialLoadSubsetSummary}
     */
    summarizeSubset(appliances, config, predicate) {
        const subset = (appliances || []).filter(predicate);
        if (subset.length === 0) {
            return {
                count: 0,
                dailyWh: 0,
                peakVA: 0,
                surgeVA: 0
            };
        }

        const dailyWh = subset.reduce((sum, app) => sum + LoadEngine.calculateDailyEnergyWh(app), 0);
        const simultaneousApps = subset.filter(app => app.isSimultaneous !== false);
        const nonSimApps = subset.filter(app => app.isSimultaneous === false);
        const simultaneousVA = simultaneousApps.reduce((sum, app) => sum + LoadEngine.calculateApparentPowerVA(app), 0);
        const nonSimMax = nonSimApps.length > 0
            ? Math.max(...nonSimApps.map(app => LoadEngine.calculateApparentPowerVA(app)))
            : 0;
        const peakVA = simultaneousVA + nonSimMax;
        const motorApps = subset.filter(app => app.loadType === 'motor');
        let surgeVA = peakVA;
        if (motorApps.length >= 2) {
            const totalMotorSurgeDelta = motorApps.reduce((sum, app) => {
                return sum + (LoadEngine.calculateStartingVA(app) - LoadEngine.calculateApparentPowerVA(app));
            }, 0);
            surgeVA += totalMotorSurgeDelta;
        } else if (motorApps.length === 1) {
            const motor = motorApps[0];
            surgeVA += LoadEngine.calculateStartingVA(motor) - LoadEngine.calculateApparentPowerVA(motor);
        } else if (subset.length > 0) {
            const highestDelta = Math.max(...subset.map(app => LoadEngine.calculateStartingVA(app) - LoadEngine.calculateApparentPowerVA(app)));
            surgeVA += Math.max(0, highestDelta);
        }

        return {
            count: subset.length,
            dailyWh: roundValue(dailyWh, 1),
            peakVA: roundValue(peakVA, 1),
            surgeVA: roundValue(surgeVA, 1)
        };
    },

    /**
     * @param {ApplianceInput[]} appliances
     * @param {AggregationResult} aggregation
     * @param {InverterSizingResult} inverter
     * @param {BatterySizingResult} battery
     * @param {PVArrayResult} pvArray
     * @param {{ inputCount?: number | string, totalMaxChargeCurrent?: number, maxChargeCurrent?: number }} mppt
     * @param {SystemConfig} config
     * @param {{ recommended?: number, distributions?: Array<{ mpptAssignments?: Array<{ unused?: boolean, panelCount?: number }> }> }} [multiMPPTResult]
     * @returns {CommercialArchitectureResult}
     */
    calculate(appliances, aggregation, inverter, battery, pvArray, mppt, config, multiMPPTResult) {
        const warnings = [];
        const blocks = [];
        const suggestions = [];
        const addUnique = (list, item) => {
            if (item && !list.includes(item)) list.push(item);
        };

        const dailyWh = aggregation?.dailyEnergyWh || 0;
        const thresholds = this.getThresholds();
        const boardStrategy = this.resolveBoardStrategy(config, { aggregation, inverter, battery });
        const generatorDefinitions = this.getGeneratorDefinitions();
        const fieldDefinitions = this.getFieldLayoutDefinitions();
        const fieldLayoutKey = config?.pvFieldLayout || this.getProfileDefaults(config?.businessProfile, config?.operatingIntent).pvFieldLayout || 'single_field';
        const fieldLayout = fieldDefinitions[fieldLayoutKey] || fieldDefinitions.single_field;
        const mpptGrouping = this.resolveMPPTGrouping(config, mppt);
        const generatorKey = config?.generatorSupportMode || 'none';
        const generatorDefinition = generatorDefinitions[generatorKey] || generatorDefinitions.none;
        const protectedLoads = this.summarizeSubset(appliances, config, app => {
            const role = resolveLoadRole(app);
            const criticality = resolveLoadCriticality(app, role, config);
            return criticality !== 'deferrable';
        });
        const criticalLoads = this.summarizeSubset(appliances, config, app => {
            const role = resolveLoadRole(app);
            const criticality = resolveLoadCriticality(app, role, config);
            return criticality === 'critical';
        });
        const deferrableLoads = this.summarizeSubset(appliances, config, app => {
            const role = resolveLoadRole(app);
            const criticality = resolveLoadCriticality(app, role, config);
            return criticality === 'deferrable';
        });
        const protectedEnergySharePct = dailyWh > 0 ? roundValue((protectedLoads.dailyWh / dailyWh) * 100, 1) : 0;
        const protectedPeakSharePct = aggregation?.peakSimultaneousVA > 0 ? roundValue((protectedLoads.peakVA / aggregation.peakSimultaneousVA) * 100, 1) : 0;
        const deferrableEnergySharePct = dailyWh > 0 ? roundValue((deferrableLoads.dailyWh / dailyWh) * 100, 1) : 0;

        /** @type {StatusLevel} */
        let boardStatus = 'pass';
        let boardDetail = `${boardStrategy.definition.label} is the active commercial board strategy.`;
        let boardRisk = '';

        if (boardStrategy.resolvedKey === 'full_site_board') {
            if (deferrableEnergySharePct >= 20 || (protectedPeakSharePct > 0 && protectedPeakSharePct <= 85)) {
                boardStatus = 'warn';
                boardDetail = `Full-board support is possible, but only ${protectedPeakSharePct}% of peak load is actually critical or essential and ${deferrableEnergySharePct}% of daily energy is deferrable.`;
                boardRisk = 'A full-board quote may overstate continuity compared with a selective protected-board design.';
                addUnique(suggestions, 'Consider an essential-load or process-split board so the quoted battery and inverter serve the highest-value circuits first.');
            }
        } else if (boardStrategy.resolvedKey === 'essential_subboard') {
            if (protectedPeakSharePct >= 95) {
                boardStatus = 'warn';
                boardDetail = `Essential-load board is selected, but ${protectedPeakSharePct}% of peak load is already tagged as protected. The selective-board benefit is limited unless deferrable loads are retagged.`;
            } else {
                boardDetail = `Selective-board strategy protects about ${Math.round(protectedLoads.peakVA).toLocaleString()}VA of peak demand (${protectedPeakSharePct}% of the full board) and ${protectedEnergySharePct}% of daily energy.`;
            }
        } else if (boardStrategy.resolvedKey === 'process_split_board') {
            if (config?.phaseType !== 'three_phase' && deferrableEnergySharePct < 15) {
                boardStatus = 'warn';
                boardDetail = 'Process-split board is selected, but the current machine list does not yet show much separable deferrable energy or a locked 3-phase process schedule.';
            } else {
                boardDetail = `Process-split strategy is justified by the current machine mix, with ${deferrableEnergySharePct}% of daily energy available for staged or deferred operation.`;
            }
        } else if (boardStrategy.resolvedKey === 'generator_assist') {
            boardDetail = `${boardStrategy.definition.label} is active. The commercial story assumes PV and battery bridge normal duty while generator support remains part of the operating topology.`;
            if (generatorKey === 'none') {
                boardStatus = 'warn';
                boardDetail = 'Generator-assist board strategy is active, but no generator path is configured yet.';
                boardRisk = 'Commercial continuity claims are incomplete until the generator path is sized or removed from the strategy.';
                addUnique(suggestions, 'Enter the real or planned generator size so the assist topology can be checked against the protected board path.');
            }
        }

        const bankAh = battery?.totalCapacityAh || 0;
        const maxDischargeCurrent = battery?.maxDischargeCurrent || 0;
        const maxChargeCurrent = battery?.maxChargeCurrent || 0;
        const continuousCurrentA = inverter?.dcInputCurrentContinuous || 0;
        const surgeCurrentA = inverter?.dcInputCurrentSurge || 0;
        const batteryVoltage = battery?.bankVoltage || battery?.effectiveBankVoltage || inverter?.dcBusVoltage || 48;
        const chargeCurrentA = Math.min(
            mppt?.totalMaxChargeCurrent || mppt?.maxChargeCurrent || 0,
            batteryVoltage > 0 ? ((pvArray?.arrayWattage || 0) / batteryVoltage) : 0
        );
        const emergencySurgeLimitA = maxDischargeCurrent * (thresholds.emergencySurgeFactor || 1.5);
        const continuousUtilizationPct = maxDischargeCurrent > 0 ? roundValue((continuousCurrentA / maxDischargeCurrent) * 100, 1) : 0;
        const surgeUtilizationPct = emergencySurgeLimitA > 0 ? roundValue((surgeCurrentA / emergencySurgeLimitA) * 100, 1) : 0;
        const chargeUtilizationPct = maxChargeCurrent > 0 ? roundValue((chargeCurrentA / maxChargeCurrent) * 100, 1) : 0;
        const continuousCRate = bankAh > 0 ? roundValue(continuousCurrentA / bankAh, 2) : 0;
        const surgeCRate = bankAh > 0 ? roundValue(surgeCurrentA / bankAh, 2) : 0;
        const chargeCRate = bankAh > 0 ? roundValue(chargeCurrentA / bankAh, 2) : 0;
        const cRateStressIndex = roundValue(
            (continuousUtilizationPct * 0.5) + (Math.max(surgeUtilizationPct, chargeUtilizationPct) * 0.5),
            1
        );

        /** @type {StatusLevel} */
        let throughputStatus = 'pass';
        let throughputDetail = `Shared battery throughput is comfortable at ${continuousUtilizationPct}% continuous discharge utilization with a ${continuousCRate}C working discharge rate.`;
        if (
            continuousUtilizationPct > (thresholds.failUtilizationPct || 100)
            || chargeUtilizationPct > (thresholds.failUtilizationPct || 100)
            || surgeUtilizationPct > (thresholds.failUtilizationPct || 100)
        ) {
            throughputStatus = 'fail';
            throughputDetail = `Shared battery throughput is overloaded: ${continuousUtilizationPct}% continuous discharge utilization, ${surgeUtilizationPct}% short-duration surge utilization, and ${chargeUtilizationPct}% charge utilization.`;
            addUnique(suggestions, 'Increase battery Ah or narrow the protected-load scope before final sign-off.');
        } else if (
            cRateStressIndex >= (thresholds.failStressIndex || 95)
            || continuousUtilizationPct >= (thresholds.tightUtilizationPct || 85)
            || surgeUtilizationPct >= (thresholds.tightUtilizationPct || 85)
            || chargeUtilizationPct >= (thresholds.tightUtilizationPct || 85)
        ) {
            throughputStatus = 'warn';
            throughputDetail = `Shared battery throughput is tight: ${continuousUtilizationPct}% continuous discharge utilization, ${surgeUtilizationPct}% surge assist utilization, ${chargeUtilizationPct}% charge utilization, and a ${cRateStressIndex}% stress index.`;
            addUnique(suggestions, 'Keep process peaks on sun or generator-assist windows so the shared battery bank is not treated like a deep industrial surge source.');
        }

        const generatorKVA = Math.max(0, Number(config?.generatorSizeKVA) || 0);
        const generatorVA = roundValue(generatorKVA * 1000, 1);
        const generatorTargetVA = boardStrategy.resolvedKey === 'essential_subboard'
            ? Math.max(protectedLoads.peakVA || 0, criticalLoads.peakVA || 0)
            : aggregation?.designContinuousVA || aggregation?.peakSimultaneousVA || 0;
        const generatorCoveragePct = generatorTargetVA > 0 ? roundValue((generatorVA / generatorTargetVA) * 100, 1) : 0;
        /** @type {StatusLevel} */
        let generatorStatus = 'pass';
        let generatorDetail = generatorKey === 'none'
            ? 'No generator path is currently assumed in the commercial topology.'
            : `${generatorDefinition.label} is active for a ${Math.round(generatorTargetVA).toLocaleString()}VA target board path.`;

        if (generatorKey === 'none') {
            if (config?.operatingIntent === 'hybrid_generator' || throughputStatus === 'fail' || boardStrategy.resolvedKey === 'generator_assist') {
                generatorStatus = 'warn';
                generatorDetail = 'The operating strategy points toward generator support, but no generator size is captured yet.';
                addUnique(suggestions, 'Capture the real generator size or switch the strategy away from generator-assist before the quote is treated as final.');
            }
        } else if (generatorKVA <= 0) {
            generatorStatus = generatorKey === 'existing_generator' ? 'fail' : 'warn';
            generatorDetail = `${generatorDefinition.label} is selected, but the generator kVA is still missing.`;
        } else if (generatorCoveragePct >= 100) {
            generatorDetail = `${generatorKVA.toFixed(1)}kVA generator covers about ${generatorCoveragePct}% of the active target board path (${Math.round(generatorTargetVA).toLocaleString()}VA).`;
        } else if (generatorCoveragePct >= 80) {
            generatorStatus = 'warn';
            generatorDetail = `${generatorKVA.toFixed(1)}kVA generator covers only about ${generatorCoveragePct}% of the active target board path (${Math.round(generatorTargetVA).toLocaleString()}VA).`;
            addUnique(suggestions, 'Review whether the generator is meant to cover the full board path or only a tighter protected-load schedule.');
        } else {
            generatorStatus = 'fail';
            generatorDetail = `${generatorKVA.toFixed(1)}kVA generator covers only about ${generatorCoveragePct}% of the active target board path (${Math.round(generatorTargetVA).toLocaleString()}VA).`;
            addUnique(suggestions, 'Increase the generator size or narrow the protected-load scope if generator-assist is part of the promised commercial continuity.');
        }

        if (config?.phaseType === 'three_phase' && aggregation?.phaseAllocation?.limitingPhaseDesignVA && generatorKVA > 0) {
            const perPhaseGeneratorVA = generatorVA / 3;
            if (perPhaseGeneratorVA < aggregation.phaseAllocation.limitingPhaseDesignVA) {
                generatorStatus = generatorStatus === 'fail' ? 'fail' : 'warn';
                addUnique(warnings, `${config.phaseType === 'three_phase' ? '3-phase' : 'Site'} generator support only gives about ${Math.round(perPhaseGeneratorVA).toLocaleString()}VA per phase, while ${aggregation.phaseAllocation.limitingPhase} needs ${Math.round(aggregation.phaseAllocation.limitingPhaseDesignVA).toLocaleString()}VA.`);
            }
        }

        const trackerCount = Math.max(1, Number(mppt?.inputCount) || 1);
        const recommendedGroups = fieldLayoutKey === 'single_field'
            ? 1
            : fieldLayoutKey === 'distributed_canopy'
                ? Math.min(3, trackerCount > 2 ? 3 : 2)
                : 2;
        const usedTrackers = multiMPPTResult?.recommended >= 0
            ? (multiMPPTResult.distributions[multiMPPTResult.recommended]?.mpptAssignments || []).filter(item => !item.unused && item.panelCount > 0).length
            : trackerCount > 1 ? Math.min(trackerCount, recommendedGroups) : 1;
        /** @type {StatusLevel} */
        let groupingStatus = 'pass';
        let groupingDetail = `${fieldLayout.label} with ${trackerCount} tracker${trackerCount === 1 ? '' : 's'} resolves to ${mpptGrouping.definition.label.toLowerCase()}.`;

        if (recommendedGroups > trackerCount && fieldLayoutKey !== 'single_field') {
            groupingStatus = trackerCount === 1 ? 'fail' : 'warn';
            groupingDetail = `${fieldLayout.label} really wants about ${recommendedGroups} tracker groups, but only ${trackerCount} MPPT input${trackerCount === 1 ? '' : 's'} are available.`;
            addUnique(suggestions, 'Increase MPPT separation or simplify the PV field arrangement so unlike roof zones are not forced onto the same tracker behavior.');
        } else if (mpptGrouping.resolvedKey === 'orientation_split' && trackerCount < 2) {
            groupingStatus = 'fail';
            groupingDetail = 'Orientation-split grouping is selected, but only one MPPT input is available.';
        } else if (mpptGrouping.resolvedKey === 'independent_trackers' && trackerCount < 2 && fieldLayoutKey !== 'single_field') {
            groupingStatus = 'warn';
            groupingDetail = 'Independent tracker banks are requested, but the current MPPT count is still too low to isolate the PV fields cleanly.';
        } else if (trackerCount > 1 && usedTrackers < Math.min(trackerCount, recommendedGroups)) {
            groupingStatus = 'warn';
            groupingDetail = `${usedTrackers} of ${trackerCount} MPPT inputs are currently carrying panels in the modeled distribution. Recheck field routing before locking the PV wiring plan.`;
        }

        /** @type {StatusLevel} */
        const overallStatus = [boardStatus, throughputStatus, generatorStatus, groupingStatus].includes('fail')
            ? 'fail'
            : [boardStatus, throughputStatus, generatorStatus, groupingStatus].includes('warn')
                ? 'warn'
                : 'pass';
        const summary = overallStatus === 'fail'
            ? 'Commercial architecture needs rework before the continuity story is safe.'
            : overallStatus === 'warn'
                ? 'Commercial architecture is workable, but one or more topology assumptions still need installer review.'
                : 'Commercial architecture is aligned with the current board, battery, generator, and PV field assumptions.';

        if (boardRisk) addUnique(warnings, boardRisk);

        return {
            status: overallStatus,
            summary,
            warnings,
            blocks,
            suggestions,
            boardStrategy: {
                ...boardStrategy,
                status: boardStatus,
                detail: boardDetail,
                protectedPeakVA: protectedLoads.peakVA,
                protectedDailyWh: protectedLoads.dailyWh,
                protectedPeakSharePct,
                protectedEnergySharePct,
                criticalPeakVA: criticalLoads.peakVA,
                criticalDailyWh: criticalLoads.dailyWh,
                deferrablePeakVA: deferrableLoads.peakVA,
                deferrableDailyWh: deferrableLoads.dailyWh,
                deferrableEnergySharePct,
                risk: boardRisk
            },
            batteryThroughput: {
                status: throughputStatus,
                detail: throughputDetail,
                continuousCurrentA: roundValue(continuousCurrentA, 1),
                surgeCurrentA: roundValue(surgeCurrentA, 1),
                chargeCurrentA: roundValue(chargeCurrentA, 1),
                maxDischargeCurrentA: roundValue(maxDischargeCurrent, 1),
                maxChargeCurrentA: roundValue(maxChargeCurrent, 1),
                continuousUtilizationPct,
                surgeUtilizationPct,
                chargeUtilizationPct,
                continuousCRate,
                surgeCRate,
                chargeCRate,
                cRateStressIndex,
                sharedBankLabel: config?.phaseType === 'three_phase'
                    ? 'Shared DC battery bank across the 3-phase inverter path'
                    : 'Shared DC battery bank for the current inverter path'
            },
            generatorSupport: {
                key: generatorKey,
                definition: generatorDefinition,
                status: generatorStatus,
                detail: generatorDetail,
                generatorKVA: roundValue(generatorKVA, 1),
                generatorVA,
                targetVA: roundValue(generatorTargetVA, 1),
                coveragePct: generatorCoveragePct
            },
            mpptGrouping: {
                ...mpptGrouping,
                fieldLayoutKey,
                fieldLayout,
                status: groupingStatus,
                detail: groupingDetail,
                availableTrackers: trackerCount,
                recommendedGroups,
                usedTrackers
            }
        };
    }
};

const PlantScopingEngine = {
    getScopeDefinitions(): Record<string, EnginePlantScopeModeDefinition> {
        return DEFAULTS.PLANT_SCOPE_MODES || {};
    },

    getTopologyDefinitions(): Record<string, EngineDistributionTopologyDefinition> {
        return DEFAULTS.DISTRIBUTION_TOPOLOGY_MODES || {};
    },

    getInterconnectionDefinitions(): Record<string, EngineInterconnectionScopeDefinition> {
        return DEFAULTS.INTERCONNECTION_SCOPE_MODES || {};
    },

    getProfileDefaults(profileKey?: string, operatingIntentKey?: string, systemType?: string): EnginePlantScopingProfileDefaults {
        const defaults = DEFAULTS.PLANT_SCOPING_PROFILE_DEFAULTS || {};
        const base = defaults[profileKey || 'custom_mixed_site'] || defaults.custom_mixed_site || {
            plantScope: 'captive_site',
            distributionTopology: 'single_board',
            interconnectionScope: 'offgrid_islanded'
        };
        let interconnectionScope = base.interconnectionScope || 'offgrid_islanded';

        if (systemType === 'grid_tie' || operatingIntentKey === 'hybrid_grid') {
            interconnectionScope = 'behind_meter_hybrid';
        } else if ((base.plantScope && base.plantScope !== 'captive_site') || systemType === 'hybrid') {
            interconnectionScope = 'private_distribution';
        }

        return {
            plantScope: base.plantScope || 'captive_site',
            distributionTopology: operatingIntentKey === 'essential_loads_only'
                ? 'protected_critical_bus'
                : (base.distributionTopology || 'single_board'),
            interconnectionScope
        };
    },

    resolvePlantScope(config: Partial<EngineSystemConfig>, architecture?: Partial<EngineCommercialArchitectureResult>): EnginePlantScopeResolution {
        const definitions = this.getScopeDefinitions();
        const selectedKey = config?.plantScopeMode || 'auto';
        const defaults = this.getProfileDefaults(config?.businessProfile as string, config?.operatingIntent as string, config?.systemType as string);
        const boardKey = architecture?.boardStrategy?.resolvedKey
            || CommercialArchitectureEngine.resolveBoardStrategy(config as EngineSystemConfig).resolvedKey;
        const phaseType = config?.phaseType || 'single';
        const businessProfile = config?.businessProfile || 'custom_mixed_site';
        const generatorKey = architecture?.generatorSupport?.key || config?.generatorSupportMode || 'none';
        const hasGeneratorPath = generatorKey !== 'none';
        const heavierProcessProfile = ['filling_station', 'cold_room', 'fabrication_workshop', 'garment_workshop'].includes(businessProfile);
        const structuredProcessProfile = ['bakery', 'mini_factory'].includes(businessProfile);
        let resolvedKey = selectedKey;

        if (selectedKey === 'auto') {
            if (
                businessProfile === 'mini_factory'
                && phaseType === 'three_phase'
                && ['process_split_board', 'generator_assist'].includes(boardKey)
            ) {
                resolvedKey = 'private_microgrid';
            } else if (
                phaseType === 'three_phase'
                && ['process_split_board', 'generator_assist'].includes(boardKey)
            ) {
                resolvedKey = 'multi_feeder_site';
            } else if (
                hasGeneratorPath
                && (heavierProcessProfile || structuredProcessProfile)
            ) {
                resolvedKey = 'multi_feeder_site';
            } else if (
                structuredProcessProfile
                && boardKey !== 'full_site_board'
            ) {
                resolvedKey = 'multi_feeder_site';
            } else {
                resolvedKey = defaults.plantScope || 'captive_site';
            }
        }

        return {
            selectedKey,
            selectedDefinition: definitions[selectedKey] || definitions.auto,
            resolvedKey,
            definition: definitions[resolvedKey] || definitions.captive_site
        };
    },

    resolveDistributionTopology(
        config: Partial<EngineSystemConfig>,
        plantScope: EnginePlantScopeResolution,
        architecture?: Partial<EngineCommercialArchitectureResult>
    ): EngineDistributionTopologyResolution {
        const definitions = this.getTopologyDefinitions();
        const selectedKey = config?.distributionTopologyMode || 'auto';
        const defaults = this.getProfileDefaults(config?.businessProfile as string, config?.operatingIntent as string, config?.systemType as string);
        const boardKey = architecture?.boardStrategy?.resolvedKey
            || CommercialArchitectureEngine.resolveBoardStrategy(config as EngineSystemConfig).resolvedKey;
        let resolvedKey = selectedKey;

        if (selectedKey === 'auto') {
            if (boardKey === 'essential_subboard') {
                resolvedKey = 'protected_critical_bus';
            } else if (plantScope.resolvedKey === 'private_microgrid') {
                resolvedKey = 'distributed_nodes';
            } else if (
                plantScope.resolvedKey === 'multi_feeder_site'
                || ['process_split_board', 'generator_assist'].includes(boardKey)
                || config?.phaseType === 'three_phase'
            ) {
                resolvedKey = 'radial_feeders';
            } else {
                resolvedKey = defaults.distributionTopology || 'single_board';
            }
        }

        return {
            selectedKey,
            selectedDefinition: definitions[selectedKey] || definitions.auto,
            resolvedKey,
            definition: definitions[resolvedKey] || definitions.single_board
        };
    },

    resolveInterconnectionScope(
        config: Partial<EngineSystemConfig>,
        plantScope: EnginePlantScopeResolution,
        topology: EngineDistributionTopologyResolution
    ): EngineInterconnectionScopeResolution {
        const definitions = this.getInterconnectionDefinitions();
        const selectedKey = config?.interconnectionScopeMode || 'auto';
        const defaults = this.getProfileDefaults(config?.businessProfile as string, config?.operatingIntent as string, config?.systemType as string);
        let resolvedKey = selectedKey;

        if (selectedKey === 'auto') {
            if (config?.systemType === 'grid_tie' || config?.operatingIntent === 'hybrid_grid') {
                resolvedKey = 'behind_meter_hybrid';
            } else if (plantScope.resolvedKey === 'public_service_microgrid') {
                resolvedKey = 'public_service_interconnection';
            } else if (
                plantScope.resolvedKey === 'private_microgrid'
                || plantScope.resolvedKey === 'multi_feeder_site'
                || topology.resolvedKey !== 'single_board'
            ) {
                resolvedKey = 'private_distribution';
            } else {
                resolvedKey = defaults.interconnectionScope || 'offgrid_islanded';
            }
        }

        return {
            selectedKey,
            selectedDefinition: definitions[selectedKey] || definitions.auto,
            resolvedKey,
            definition: definitions[resolvedKey] || definitions.offgrid_islanded
        };
    },

    estimateFeederCount(
        config: Partial<EngineSystemConfig>,
        topologyKey: string,
        boardKey: string
    ): number {
        if (topologyKey === 'single_board') return 1;
        if (topologyKey === 'protected_critical_bus') return 2;
        if (topologyKey === 'distributed_nodes') {
            return config?.phaseType === 'three_phase' ? 4 : 3;
        }
        if (boardKey === 'process_split_board') {
            return config?.phaseType === 'three_phase' ? 3 : 2;
        }
        return config?.phaseType === 'three_phase' ? 3 : 2;
    },

    buildBoundarySummary(
        plantScopeKey: string,
        topologyKey: string,
        interconnectionKey: string
    ) {
        if (plantScopeKey === 'public_service_microgrid' || interconnectionKey === 'public_service_interconnection') {
            return {
                status: 'fail' as const,
                label: 'Outside current honest boundary',
                detail: 'This calculator can still help with early load and equipment scoping, but public-service microgrid or utility-facing interconnection work needs feeder studies, protection grading, dispatch rules, and authority engineering outside the current product scope.',
                outsideCurrentScope: true
            };
        }

        if (plantScopeKey === 'private_microgrid' || topologyKey === 'distributed_nodes') {
            return {
                status: 'warn' as const,
                label: 'Inside scoping boundary, outside final plant-study boundary',
                detail: 'The calculator is suitable for internal plant scoping, feeder planning, and proposal boundary setting here, but final sign-off still needs one-line, source coordination, protection/selectivity, and commissioning studies outside the current product scope.',
                outsideCurrentScope: false
            };
        }

        return {
            status: 'pass' as const,
            label: 'Inside current captive-site scoping boundary',
            detail: interconnectionKey === 'behind_meter_hybrid'
                ? 'The project stays inside a normal behind-the-meter captive-site lane. Final permit, settings, and protection review are still manual, but the current product scope is appropriate for serious scoping and proposal work.'
                : 'The project stays inside the current captive-site plant-scoping boundary. Final one-line, protection, and commissioning review still remain installer tasks, but the scoping lane is honest.',
            outsideCurrentScope: false
        };
    },

    resolveFeederSourcePath(
        bucketKey: 'protected' | 'assisted' | 'excluded',
        interconnectionKey: string,
        generatorKey: string,
        decisionKey: string
    ) {
        if (bucketKey === 'excluded') {
            return {
                label: 'Outside promised backup path',
                detail: 'Keep these loads outside the sold continuity promise unless the design and source strategy change materially.'
            };
        }

        if (bucketKey === 'protected') {
            if (interconnectionKey === 'behind_meter_hybrid' && decisionKey === 'hybrid_grid_support') {
                return {
                    label: 'PV + battery protected bus with grid assist',
                    detail: 'Protected continuity should stay on the battery-backed path first, with grid participation treated as the recovery or extended-support source.'
                };
            }
            if (generatorKey !== 'none' && decisionKey === 'hybrid_generator_assist') {
                return {
                    label: 'PV + battery protected bus with generator recovery',
                    detail: 'Protected continuity should ride the battery-backed path first, while generator support remains the extended-duty recovery source.'
                };
            }
            return {
                label: 'PV + battery protected continuity path',
                detail: 'This feeder should stay on the explicitly protected source path that the client is being sold as covered continuity.'
            };
        }

        if (generatorKey !== 'none' || decisionKey === 'hybrid_generator_assist') {
            return {
                label: 'Generator-assisted feeder',
                detail: 'This feeder can be energized, but it should be sold as needing generator support, staged operation, or both.'
            };
        }

        if (interconnectionKey === 'behind_meter_hybrid') {
            return {
                label: 'Grid-assisted feeder',
                detail: 'This feeder depends on a behind-the-meter utility path or selective operator control rather than the protected battery-backed bus alone.'
            };
        }

        return {
            label: 'Managed / staged support feeder',
            detail: 'This feeder can be kept in scope only with operator discipline, staged duty, or selective running windows.'
        };
    },

    buildFeederSchedule(
        supportSummary: Partial<EngineSupportSummary> | null,
        topologyKey: string,
        interconnectionKey: string,
        generatorKey: string,
        decisionKey: string
    ): EnginePlantFeederScheduleSummary {
        type FeederBucketRollup = {
            count: number;
            dailyWh: number;
            connectedLoadW: number;
            maxSurgeFactor: number;
            roleLabels: string[];
            items: EngineSupportBucketItem[];
            energySharePct: number;
        };
        const safeRound = (value: number, decimals = 1) => roundValue(Number(value) || 0, decimals);
        const items = supportSummary?.buckets || null;
        if (!items) {
            return {
                status: 'warn',
                headline: 'Feeder schedule still needs a calculated support story.',
                detail: 'Run the full design first so the plant-scoping layer can build a recommended feeder schedule from the protected, assisted, and excluded load buckets.',
                items: []
            };
        }

        const summarizeItems = (
            rawItems: EngineSupportBucketItem[] | undefined,
            fallbackEnergySharePct = 0
        ): FeederBucketRollup => {
            const list = Array.isArray(rawItems) ? rawItems : [];
            const roleLabels = Array.from(new Set(list.map(item => item.loadRoleLabel).filter(Boolean)));
            const connectedLoadW = list.reduce((sum, item) => sum + (Number(item.ratedPowerW) || 0), 0);
            const maxSurgeFactor = list.reduce((max, item) => Math.max(max, Number(item.surgeFactor) || 1), 1);
            const dailyWh = list.reduce((sum, item) => sum + (Number(item.dailyWh) || 0), 0);
            return {
                count: list.length,
                dailyWh: safeRound(dailyWh, 1),
                connectedLoadW: safeRound(connectedLoadW, 1),
                maxSurgeFactor: safeRound(maxSurgeFactor, 1),
                roleLabels,
                items: list,
                energySharePct: safeRound(fallbackEnergySharePct, 1)
            };
        };

        const protectedItems = summarizeItems(items.protected?.items, items.protected?.energySharePct || 0);
        const assistedAll = Array.isArray(items.assisted?.items) ? items.assisted.items : [];
        const assistedProcessList = assistedAll.filter(item => ['process', 'operator_peak', 'refrigeration'].includes(item.loadRole));
        const assistedGeneralList = assistedAll.filter(item => !['process', 'operator_peak', 'refrigeration'].includes(item.loadRole));
        const assistedProcessDailyWh = assistedProcessList.reduce((sum, item) => sum + (Number(item.dailyWh) || 0), 0);
        const assistedGeneralDailyWh = assistedGeneralList.reduce((sum, item) => sum + (Number(item.dailyWh) || 0), 0);
        const assistedTotalDailyWh = assistedProcessDailyWh + assistedGeneralDailyWh;
        const assistedBucketEnergyShare = Number(items.assisted?.energySharePct) || 0;
        const assistedProcessItems = summarizeItems(
            assistedProcessList,
            assistedTotalDailyWh > 0 ? (assistedProcessDailyWh / assistedTotalDailyWh) * assistedBucketEnergyShare : 0
        );
        const assistedGeneralItems = summarizeItems(
            assistedGeneralList,
            assistedTotalDailyWh > 0 ? (assistedGeneralDailyWh / assistedTotalDailyWh) * assistedBucketEnergyShare : 0
        );
        const excludedItems = summarizeItems(items.excluded?.items, items.excluded?.energySharePct || 0);

        const buildItem = (
            key: string,
            label: string,
            bucketKey: 'protected' | 'assisted' | 'excluded',
            summary: FeederBucketRollup
        ): EnginePlantFeederScheduleItem => {
            const source = this.resolveFeederSourcePath(bucketKey, interconnectionKey, generatorKey, decisionKey);
            return {
                key,
                label,
                supportBucketKey: bucketKey,
                sourcePathLabel: source.label,
                sourcePathDetail: source.detail,
                count: summary.count,
                dailyWh: summary.dailyWh,
                energySharePct: summary.energySharePct,
                connectedLoadW: summary.connectedLoadW,
                maxSurgeFactor: summary.maxSurgeFactor,
                roleLabels: summary.roleLabels
            };
        };

        const feederItems: EnginePlantFeederScheduleItem[] = [];
        if (protectedItems.count > 0) {
            feederItems.push(buildItem(
                topologyKey === 'single_board' ? 'main_protected_board' : 'protected_continuity_feeder',
                topologyKey === 'single_board' ? 'Main protected board' : 'Protected continuity feeder',
                'protected',
                protectedItems
            ));
        }
        if (assistedProcessItems.count > 0) {
            feederItems.push(buildItem(
                'process_assist_feeder',
                topologyKey === 'single_board' ? 'Managed process feeder' : 'Process assist feeder',
                'assisted',
                assistedProcessItems
            ));
        }
        if (assistedGeneralItems.count > 0) {
            feederItems.push(buildItem(
                'general_support_feeder',
                topologyKey === 'single_board' ? 'General support feeder' : 'General support feeder',
                'assisted',
                assistedGeneralItems
            ));
        }
        if (excludedItems.count > 0) {
            feederItems.push(buildItem(
                'outside_promise_feeder',
                'Outside-promise feeder',
                'excluded',
                excludedItems
            ));
        }

        let status: 'pass' | 'warn' | 'fail' = 'pass';
        let headline = 'Recommended feeder schedule aligns with the current protected and assisted source story.';
        let detail = `The current result suggests ${feederItems.length || 1} feeder bucket${feederItems.length === 1 ? '' : 's'} so the plant promise matches the modeled protected, assisted, and excluded load paths.`;

        if (interconnectionKey === 'public_service_interconnection') {
            status = 'fail';
            headline = 'Feeder schedule is still useful, but public-service work sits outside the current plant-engineering boundary.';
            detail = 'Use the feeder schedule only for early scoping. Final source coordination, protection, and interconnection engineering need a separate utility-grade workflow.';
        } else if (topologyKey === 'single_board' && feederItems.length > 2) {
            status = 'warn';
            headline = 'The feeder schedule shows more than one real operating path even though the topology still reads like one board.';
            detail = 'Capture a feeder schedule or protected-board split before treating the current plant story as final, because the supported-load logic already behaves like several distinct feeder lanes.';
        } else if (excludedItems.count > 0 || assistedProcessItems.count > 0) {
            status = 'warn';
            headline = 'The feeder schedule is useful, but at least one feeder still depends on assisted or excluded operation.';
            detail = 'Keep the protected feeder promise narrow and state clearly which process or discretionary feeders still rely on generator, grid, or staged operation.';
        }

        return {
            status,
            headline,
            detail,
            items: feederItems
        };
    },

    resolvePreview(
        config: Partial<EngineSystemConfig>,
        architecture?: Partial<EngineCommercialArchitectureResult>
    ): EnginePlantScopingPreviewSummary {
        const plantScope = this.resolvePlantScope(config, architecture);
        const topology = this.resolveDistributionTopology(config, plantScope, architecture);
        const interconnection = this.resolveInterconnectionScope(config, plantScope, topology);
        const boundary = this.buildBoundarySummary(plantScope.resolvedKey, topology.resolvedKey, interconnection.resolvedKey);

        return {
            resolvedPlantScope: plantScope.definition,
            resolvedPlantScopeKey: plantScope.resolvedKey,
            resolvedDistributionTopology: topology.definition,
            resolvedDistributionTopologyKey: topology.resolvedKey,
            resolvedInterconnectionScope: interconnection.definition,
            resolvedInterconnectionScopeKey: interconnection.resolvedKey,
            boundaryHeadline: boundary.label,
            boundaryDetail: boundary.detail
        };
    },

    calculate(
        appliances: EngineApplianceInput[],
        aggregation: Partial<EngineAggregationResult>,
        architecture: Partial<EngineCommercialArchitectureResult>,
        decision: Partial<EngineCommercialDecisionResult>,
        supportSummary: Partial<EngineSupportSummary> | null,
        config: Partial<EngineSystemConfig>
    ): EnginePlantScopingResult {
        const warnings: string[] = [];
        const blocks: string[] = [];
        const suggestions: string[] = [];
        const openItems: string[] = [];
        const risks: string[] = [];
        const addUnique = (list: string[], item?: string | null) => {
            if (item && !list.includes(item)) list.push(item);
        };

        const plantScope = this.resolvePlantScope(config, architecture);
        const topology = this.resolveDistributionTopology(config, plantScope, architecture);
        const interconnection = this.resolveInterconnectionScope(config, plantScope, topology);
        const boardKey = architecture?.boardStrategy?.resolvedKey
            || CommercialArchitectureEngine.resolveBoardStrategy(config as EngineSystemConfig).resolvedKey;
        const generatorKey = architecture?.generatorSupport?.key || config?.generatorSupportMode || 'none';
        const phaseImbalancePct = aggregation?.phaseAllocation?.imbalancePct || 0;
        const protectedPeakSharePct = architecture?.boardStrategy?.protectedPeakSharePct ?? 100;
        const feederCountEstimate = this.estimateFeederCount(config, topology.resolvedKey, boardKey);
        const boundary = this.buildBoundarySummary(plantScope.resolvedKey, topology.resolvedKey, interconnection.resolvedKey);
        const feederSchedule = this.buildFeederSchedule(
            supportSummary,
            topology.resolvedKey,
            interconnection.resolvedKey,
            generatorKey,
            (decision?.key as string) || 'essential_load_only_backup'
        );

        let plantScopeStatus: 'pass' | 'warn' | 'fail' = 'pass';
        let plantScopeDetail = `${plantScope.definition.label} is the active site scope. The current machine mix behaves like about ${feederCountEstimate} meaningful feeder path${feederCountEstimate === 1 ? '' : 's'} inside one client-controlled site.`;

        if (plantScope.resolvedKey === 'public_service_microgrid') {
            plantScopeStatus = 'fail';
            plantScopeDetail = 'Public-service microgrid scope is outside the current product boundary. This tool can still help with early load and equipment scoping, but it does not replace interconnection, protection, and operating-study work.';
            addUnique(openItems, 'Move this project into a utility / public-service engineering workflow before treating the result as a final design basis.');
            addUnique(risks, 'Public-service microgrid mode needs authority, dispatch, protection, and interconnection work beyond the current calculator.');
        } else if (plantScope.resolvedKey === 'private_microgrid') {
            plantScopeDetail = `Private microgrid scope is active. The current project already looks more like an internal plant with about ${feederCountEstimate} feeder or node paths than a simple single-board captive site.`;
            if (config?.phaseType !== 'three_phase' && boardKey === 'full_site_board') {
                plantScopeStatus = 'warn';
                plantScopeDetail = 'Private microgrid scope is selected, but the current configuration still looks closer to a simple single-board captive site. Confirm the real feeder map before keeping this heavier label.';
                addUnique(openItems, 'Confirm the actual feeder or zone map before keeping the project in a private-microgrid posture.');
            }
        } else if (plantScope.resolvedKey === 'multi_feeder_site') {
            plantScopeDetail = `Multi-feeder commercial site scope is active. The current project justifies more than one meaningful feeder or board path, especially around ${boardKey === 'essential_subboard' ? 'protected continuity coverage' : 'process and support separation'}.`;
            if (boardKey === 'full_site_board' && config?.phaseType !== 'three_phase') {
                plantScopeStatus = 'warn';
                plantScopeDetail = 'Multi-feeder site scope is selected, but the current inputs still look close to a simple captive-site board. Confirm whether the real site truly needs feeder-level separation.';
                addUnique(openItems, 'Confirm whether the site really has multiple protected or staged feeder paths before finalizing the site-scope story.');
            }
        } else if (
            config?.phaseType === 'three_phase'
            && ['process_split_board', 'generator_assist'].includes(boardKey)
        ) {
            plantScopeStatus = 'warn';
            plantScopeDetail = 'Captive-site scope is selected, but the current board and phase posture already behave more like a multi-feeder commercial site.';
            addUnique(suggestions, 'Promote the site scope to a multi-feeder commercial site if the real project has staged or feeder-level operating rules.');
        }

        let topologyStatus: 'pass' | 'warn' | 'fail' = 'pass';
        let topologyDetail = `${topology.definition.label} is the active feeder topology with about ${feederCountEstimate} meaningful board or feeder path${feederCountEstimate === 1 ? '' : 's'}.`;

        if (topology.resolvedKey === 'single_board') {
            if (
                plantScope.resolvedKey === 'private_microgrid'
                || ['process_split_board', 'generator_assist'].includes(boardKey)
                || (config?.phaseType === 'three_phase' && protectedPeakSharePct < 95)
            ) {
                topologyStatus = plantScope.resolvedKey === 'private_microgrid' ? 'fail' : 'warn';
                topologyDetail = 'Single-board topology is too simple for the current feeder or protected-load story. The project already behaves like it needs staged feeder or protected-bus treatment.';
                addUnique(openItems, 'Confirm the actual feeder schedule and protected-board boundary before keeping a single-board topology.');
                addUnique(suggestions, 'Use radial feeders or a protected critical bus so the promised operating path matches the real site behavior.');
            }
        } else if (topology.resolvedKey === 'protected_critical_bus') {
            topologyDetail = `Protected critical bus is active. About ${Math.round(protectedPeakSharePct)}% of peak demand sits on the protected path, which fits a selective continuity story better than a whole-board promise.`;
            if (protectedPeakSharePct >= 95 && boardKey === 'full_site_board') {
                topologyStatus = 'warn';
                topologyDetail = 'Protected critical bus is selected, but nearly the whole board is still being treated as protected. Confirm whether the selective-bus posture is real or just nominal.';
                addUnique(openItems, 'Retag the truly protected circuits so the critical-bus story is not diluted by whole-board assumptions.');
            }
        } else if (topology.resolvedKey === 'radial_feeders') {
            topologyDetail = `Radial feeder topology is active. The current site behaves like about ${feederCountEstimate} feeder branches that should keep clear operating and protection boundaries.`;
        } else if (topology.resolvedKey === 'distributed_nodes') {
            topologyDetail = `Distributed-node topology is active. The project behaves more like an internal plant or multi-zone site than one protected board.`;
            if (plantScope.resolvedKey === 'captive_site') {
                topologyStatus = 'warn';
                topologyDetail = 'Distributed-node topology is selected, but the current site scope still says captive single-premises. Confirm the real node separation before keeping this topology.';
                addUnique(openItems, 'Confirm whether the site truly has multiple plant nodes or just several feeder branches.');
            }
        }

        let interconnectionStatus: 'pass' | 'warn' | 'fail' = 'pass';
        let interconnectionDetail = `${interconnection.definition.label} is the active source and interconnection scope.`;

        if (interconnection.resolvedKey === 'public_service_interconnection') {
            interconnectionStatus = 'fail';
            interconnectionDetail = 'Public-service interconnection is outside the current product boundary. Early scoping is still useful, but final interconnection and protection studies are not performed here.';
            addUnique(openItems, 'Move the job into an authority or utility interconnection workflow before using it as a final basis.');
            addUnique(risks, 'Utility-facing interconnection expectations exceed the current calculator boundary.');
        } else if (interconnection.resolvedKey === 'behind_meter_hybrid') {
            interconnectionDetail = 'Behind-the-meter hybrid scope is active. Utility interaction stays in the project story, but the site still remains a captive customer-side installation.';
            if (config?.systemType === 'off_grid') {
                interconnectionStatus = 'warn';
                interconnectionDetail = 'Behind-the-meter hybrid scope is selected, but the main system type is still off-grid. Confirm whether the utility really remains part of the operating story.';
                addUnique(openItems, 'Reconfirm whether this job is truly behind-the-meter or actually islanded from the utility side.');
            }
        } else if (interconnection.resolvedKey === 'offgrid_islanded') {
            interconnectionDetail = generatorKey !== 'none'
                ? 'Islanded scope is active. Generator support may still exist, but the site is being treated as a captive non-exporting system without an external interconnection path.'
                : 'Islanded scope is active. The site is being treated as a captive non-exporting system without an external interconnection path.';
            if (config?.systemType === 'grid_tie' || config?.operatingIntent === 'hybrid_grid') {
                interconnectionStatus = 'fail';
                interconnectionDetail = 'Islanded scope is selected, but the system posture still expects utility participation. The source scope needs to match the real service arrangement.';
                addUnique(openItems, 'Switch the interconnection scope to behind-the-meter hybrid if the grid remains part of the design.');
            }
        } else if (interconnection.resolvedKey === 'private_distribution') {
            interconnectionDetail = `Private-distribution scope is active. Source coordination stays inside the client-controlled site across about ${feederCountEstimate} feeder path${feederCountEstimate === 1 ? '' : 's'}.`;
            if (plantScope.resolvedKey === 'captive_site' && topology.resolvedKey === 'single_board') {
                interconnectionStatus = 'warn';
                interconnectionDetail = 'Private-distribution scope is selected, but the current board story still looks like one captive board. Confirm whether the internal feeder complexity is real.';
                addUnique(openItems, 'Confirm whether this site really needs private-distribution scoping or whether a simpler captive-site scope is more honest.');
            }
        }

        if (phaseImbalancePct > 20 && topology.resolvedKey === 'single_board' && config?.phaseType === 'three_phase') {
            topologyStatus = topologyStatus === 'fail' ? 'fail' : 'warn';
            addUnique(warnings, `Three-phase imbalance is ${phaseImbalancePct}%, which makes a single-board plant story harder to defend without feeder or load segregation.`);
        }

        if (decision?.key === 'essential_load_only_backup' && topology.resolvedKey === 'single_board' && protectedPeakSharePct > 85) {
            topologyStatus = topologyStatus === 'fail' ? 'fail' : 'warn';
            addUnique(warnings, 'The commercial strategy is selective backup, but the current topology still behaves close to a whole-board support claim.');
        }

        const status: 'pass' | 'warn' | 'fail' = [plantScopeStatus, topologyStatus, interconnectionStatus, boundary.status].includes('fail')
            ? 'fail'
            : [plantScopeStatus, topologyStatus, interconnectionStatus, boundary.status].includes('warn')
                ? 'warn'
                : 'pass';

        const summary = status === 'fail'
            ? 'Plant or mini-grid scoping has moved outside the current honest boundary or still needs a material scope reset.'
            : status === 'warn'
                ? 'Plant scoping is useful, but feeder or source assumptions still need installer review before the story is treated as final.'
                : 'Plant scoping is aligned with the current captive-site, feeder, and interconnection assumptions.';

        if (boundary.status === 'warn') {
            addUnique(suggestions, 'Keep the current result for scoping and proposal discipline, but close the one-line, feeder, and protection review outside the calculator before final sign-off.');
        } else if (boundary.status === 'fail') {
            addUnique(suggestions, 'Use the current result only for early budgeting and load conversations, not for authority or utility-grade final engineering.');
        }

        if (topology.resolvedKey === 'radial_feeders' || topology.resolvedKey === 'distributed_nodes') {
            addUnique(openItems, 'Capture a feeder schedule or single-line before final commissioning or procurement.');
        }

        return {
            status,
            summary,
            warnings,
            blocks,
            suggestions,
            openItems,
            risks,
            plantScope: {
                ...plantScope,
                status: plantScopeStatus,
                detail: plantScopeDetail,
                feederCountEstimate
            },
            distributionTopology: {
                ...topology,
                status: topologyStatus,
                detail: topologyDetail,
                feederCountEstimate,
                criticalBusRecommended: topology.resolvedKey === 'protected_critical_bus' || boardKey === 'essential_subboard'
            },
            interconnectionScope: {
                ...interconnection,
                status: interconnectionStatus,
                detail: interconnectionDetail
            },
            studyBoundary: boundary,
            feederSchedule
        };
    }
};

const CommercialDecisionEngine = {
    /**
     * @returns {Record<string, CommercialDecisionDefinition>}
     */
    getDefinitions() {
        return DEFAULTS.COMMERCIAL_DECISION_STRATEGIES || {};
    },

    /**
     * @returns {CommercialDecisionThresholds}
     */
    getThresholds() {
        return DEFAULTS.COMMERCIAL_DECISION_THRESHOLDS || {
            solarCoverageReadyPct: 105,
            solarCoverageWorkingPct: 85,
            averageBackupReadyHours: 10,
            averageBackupBridgeHours: 4,
            overnightCriticalReadyCoveragePct: 120,
            overnightProtectedWorkingCoveragePct: 85,
            daytimeProcessReadyPct: 65,
            daytimeProcessWorkingPct: 50,
            deferrableSelectivePct: 18,
            shiftableUsefulPct: 15,
            preservationDominantPct: 30,
            protectedPeakSelectivePct: 80,
            generatorCoverageReadyPct: 90,
            generatorCoverageWorkingPct: 70
        };
    },

    createScorecard(key: string, definition: EngineCommercialDecisionDefinition): EngineCommercialDecisionScorecard {
        return {
            key,
            label: definition?.label || key,
            definition,
            score: 0,
            reasons: [],
            gaps: []
        };
    },

    addReason(card: EngineCommercialDecisionScorecard, points: number, message: string): void {
        card.score += points;
        if (message && !card.reasons.includes(message)) {
            card.reasons.push(message);
        }
    },

    addGap(card: EngineCommercialDecisionScorecard, points: number, message: string): void {
        card.score -= points;
        if (message && !card.gaps.includes(message)) {
            card.gaps.push(message);
        }
    },

    normalizeScore(card: EngineCommercialDecisionScorecard): EngineCommercialDecisionScorecard {
        card.score = Math.max(0, Math.min(100, Math.round(card.score)));
        return card;
    },

    evaluate(results: EngineSystemResults): EngineCommercialDecisionResult {
        const definitions = this.getDefinitions();
        const thresholds = this.getThresholds();
        const config: Partial<EngineSystemConfig> = results?.config || {};
        const aggregation: Partial<EngineAggregationResult> = results?.aggregation || {};
        const battery: Partial<EngineBatterySizingResult> = results?.battery || {};
        const pvArray: Partial<EnginePVArrayResult> = results?.pvArray || {};
        const architecture: Partial<EngineCommercialArchitectureResult> = results?.architecture || {};
        const businessContext = (config.businessContext || {}) as NonNullable<EngineSystemConfig['businessContext']>;
        const operational: Partial<EngineOperationalProfile> = aggregation.operationalProfile || {};
        const continuityKey = businessContext.continuityKey || config.continuityClass || 'business_critical';
        const operatingIntentKey = businessContext.operatingIntentKey || config.operatingIntent || 'backup_only';
        const systemType = config.systemType || 'off_grid';
        const phaseType = config.phaseType || 'single';

        const dailyWh = aggregation.dailyEnergyWh || 0;
        const pvDailyWh = pvArray.dailyEnergyWh || 0;
        const usableBatteryWh = battery.usableCapacityWh || 0;
        const averageLoadW = dailyWh > 0 ? dailyWh / 24 : 0;
        const averageBackupHours = averageLoadW > 0 ? usableBatteryWh / averageLoadW : 0;
        const solarCoveragePct = dailyWh > 0 ? roundValue((pvDailyWh / dailyWh) * 100, 1) : 0;
        const overnightCriticalWh = operational.overnightCriticalWh || 0;
        const overnightProtectedWh = (operational.overnightCriticalWh || 0) + (operational.overnightEssentialWh || 0);
        const overnightCriticalCoveragePct = overnightCriticalWh > 0 ? roundValue((usableBatteryWh / overnightCriticalWh) * 100, 1) : 200;
        const overnightProtectedCoveragePct = overnightProtectedWh > 0 ? roundValue((usableBatteryWh / overnightProtectedWh) * 100, 1) : 200;
        const daytimeProcessSharePct = (operational.totalProcessWh || 0) > 0
            ? roundValue(((operational.daytimeProcessWh || 0) / operational.totalProcessWh) * 100, 1)
            : 0;
        const deferrableSharePct = dailyWh > 0 ? roundValue(((operational.deferrableWh || 0) / dailyWh) * 100, 1) : 0;
        const shiftableSharePct = dailyWh > 0 ? roundValue(((operational.daytimeShiftableWh || 0) / dailyWh) * 100, 1) : 0;
        const preservationSharePct = dailyWh > 0 ? roundValue(((operational.preservationWh || 0) / dailyWh) * 100, 1) : 0;
        const protectedPeakSharePct = architecture.boardStrategy?.protectedPeakSharePct ?? 100;
        const throughputStatus = architecture.batteryThroughput?.status || 'pass';
        const generatorStatus = architecture.generatorSupport?.status || 'pass';
        const generatorKey = architecture.generatorSupport?.key || config.generatorSupportMode || 'none';
        const generatorCoveragePct = architecture.generatorSupport?.coveragePct ?? 0;
        const boardKey = architecture.boardStrategy?.resolvedKey || config.commercialArchitectureMode || 'full_site_board';
        const phaseImbalancePct = aggregation.phaseAllocation?.imbalancePct || 0;

        const cards = Object.fromEntries(
            Object.entries(definitions).map(([key, definition]) => [key, this.createScorecard(key, definition)])
        ) as Record<string, EngineCommercialDecisionScorecard>;

        const batteryOffgrid = cards.battery_dominant_offgrid;
        if (systemType === 'off_grid') this.addReason(batteryOffgrid, 24, 'The current electrical topology is already off-grid.');
        if (operatingIntentKey === 'full_offgrid') this.addReason(batteryOffgrid, 26, 'The selected operating intent expects full off-grid operation.');
        if (operatingIntentKey === 'backup_only') this.addReason(batteryOffgrid, 10, 'The current intent still allows a battery-led resilience posture.');
        if (solarCoveragePct >= thresholds.solarCoverageReadyPct) this.addReason(batteryOffgrid, 16, `Modeled solar yield covers about ${solarCoveragePct}% of daily demand.`);
        else if (solarCoveragePct >= thresholds.solarCoverageWorkingPct) this.addReason(batteryOffgrid, 8, `Modeled solar yield covers about ${solarCoveragePct}% of daily demand, but there is not much headroom.`);
        else this.addGap(batteryOffgrid, 18, `Modeled solar yield covers only about ${solarCoveragePct}% of daily demand, which is lean for a battery-dominant off-grid story.`);
        if (averageBackupHours >= thresholds.averageBackupReadyHours) this.addReason(batteryOffgrid, 14, `Average-load backup is about ${roundValue(averageBackupHours, 1)} hours.`);
        else if (averageBackupHours >= thresholds.averageBackupBridgeHours) this.addReason(batteryOffgrid, 6, `Average-load backup is about ${roundValue(averageBackupHours, 1)} hours, which is usable but not deep.`);
        else this.addGap(batteryOffgrid, 14, `Average-load backup is only about ${roundValue(averageBackupHours, 1)} hours.`);
        if (overnightProtectedCoveragePct >= thresholds.overnightCriticalReadyCoveragePct) this.addReason(batteryOffgrid, 12, `The usable battery covers about ${overnightProtectedCoveragePct}% of the modeled overnight protected load.`);
        else if (overnightProtectedCoveragePct >= thresholds.overnightProtectedWorkingCoveragePct) this.addReason(batteryOffgrid, 5, `The usable battery covers about ${overnightProtectedCoveragePct}% of the modeled overnight protected load, but the overnight margin is tight.`);
        else this.addGap(batteryOffgrid, 15, `The usable battery covers only about ${overnightProtectedCoveragePct}% of the modeled overnight protected load.`);
        if (throughputStatus === 'pass') this.addReason(batteryOffgrid, 10, 'Battery current throughput is comfortable for the current duty.');
        else if (throughputStatus === 'warn') this.addGap(batteryOffgrid, 8, 'Battery current throughput is already tight for a battery-dominant site story.');
        else this.addGap(batteryOffgrid, 18, 'Battery current throughput is overloaded for an honest battery-dominant off-grid story.');
        if (generatorKey === 'none') this.addReason(batteryOffgrid, 6, 'No generator path is being relied on in the present topology.');
        if (boardKey === 'full_site_board') this.addReason(batteryOffgrid, 6, 'The current architecture still points toward whole-board support.');
        if (phaseType === 'three_phase' && phaseImbalancePct > 20) this.addGap(batteryOffgrid, 8, `Phase imbalance is ${phaseImbalancePct}%, which weakens a clean full-site off-grid story.`);

        const solarBridge = cards.solar_dominant_daytime_bridge;
        if (operatingIntentKey === 'daytime_solar_first') this.addReason(solarBridge, 26, 'The selected operating intent already targets daytime solar-first operation.');
        if (systemType === 'hybrid' || systemType === 'off_grid') this.addReason(solarBridge, 12, 'The current system type can support a solar-first operating rhythm.');
        if (daytimeProcessSharePct >= thresholds.daytimeProcessReadyPct) this.addReason(solarBridge, 18, `${daytimeProcessSharePct}% of the modeled process energy already sits in daytime hours.`);
        else if (daytimeProcessSharePct >= thresholds.daytimeProcessWorkingPct) this.addReason(solarBridge, 10, `${daytimeProcessSharePct}% of the modeled process energy already sits in daytime hours.`);
        else this.addGap(solarBridge, 10, `Only ${daytimeProcessSharePct}% of the modeled process energy is aligned to daytime operation.`);
        if (shiftableSharePct >= thresholds.shiftableUsefulPct || deferrableSharePct >= thresholds.deferrableSelectivePct) {
            this.addReason(solarBridge, 12, `${Math.max(shiftableSharePct, deferrableSharePct)}% of daily energy is shiftable or deferrable.`);
        }
        if (solarCoveragePct >= thresholds.solarCoverageWorkingPct) this.addReason(solarBridge, 12, `Modeled solar yield covers about ${solarCoveragePct}% of daily demand.`);
        else this.addGap(solarBridge, 8, `Modeled solar yield is only about ${solarCoveragePct}% of daily demand.`);
        if (averageBackupHours >= thresholds.averageBackupBridgeHours) this.addReason(solarBridge, 8, `Battery storage still provides about ${roundValue(averageBackupHours, 1)} hours of average-load bridging.`);
        if (throughputStatus !== 'fail') this.addReason(solarBridge, 8, 'The current battery path can still support bridging duty.');
        else this.addGap(solarBridge, 12, 'Battery current throughput is overloaded, so the bridge window is not yet comfortable.');
        if (preservationSharePct >= thresholds.preservationDominantPct) this.addGap(solarBridge, 12, `Preservation and overnight continuity already consume about ${preservationSharePct}% of daily energy.`);
        if (continuityKey === 'product_loss_critical' && overnightCriticalCoveragePct < thresholds.overnightCriticalReadyCoveragePct) {
            this.addGap(solarBridge, 10, 'Product-loss continuity still needs stronger night coverage than a simple bridge posture normally offers.');
        }

        const hybridGenerator = cards.hybrid_generator_assist;
        if (operatingIntentKey === 'hybrid_generator') this.addReason(hybridGenerator, 28, 'The selected operating intent already expects generator-assisted operation.');
        if (boardKey === 'generator_assist') this.addReason(hybridGenerator, 18, 'The active commercial board strategy is already generator-assist.');
        if (generatorKey !== 'none') this.addReason(hybridGenerator, 16, 'A generator path is already part of the topology.');
        else this.addReason(hybridGenerator, 6, 'The machine mix points toward generator support even though the path is not fully captured yet.');
        if (continuityKey === 'process_critical' || continuityKey === 'product_loss_critical') this.addReason(hybridGenerator, 14, 'The continuity class is high enough to justify an assisted topology.');
        if (throughputStatus === 'warn' || throughputStatus === 'fail') this.addReason(hybridGenerator, 12, 'Battery throughput is tight enough that generator support improves commercial honesty.');
        if (phaseType === 'three_phase') this.addReason(hybridGenerator, 8, 'The project is already in a 3-phase context, which often benefits from assisted support for peaks or outages.');
        if (preservationSharePct >= thresholds.preservationDominantPct || daytimeProcessSharePct >= thresholds.daytimeProcessWorkingPct) this.addReason(hybridGenerator, 8, 'The business still has meaningful process or preservation duty outside a simple daytime-shift story.');
        if (generatorCoveragePct >= thresholds.generatorCoverageReadyPct) this.addReason(hybridGenerator, 8, `Captured generator size covers about ${generatorCoveragePct}% of the active board path.`);
        else if (generatorKey !== 'none' && generatorCoveragePct >= thresholds.generatorCoverageWorkingPct) this.addReason(hybridGenerator, 4, `Captured generator size covers about ${generatorCoveragePct}% of the active board path.`);
        else if (generatorKey !== 'none') this.addGap(hybridGenerator, 8, `Captured generator size covers only about ${generatorCoveragePct}% of the active board path.`);

        const hybridGrid = cards.hybrid_grid_support;
        if (operatingIntentKey === 'hybrid_grid') this.addReason(hybridGrid, 30, 'The selected operating intent already expects grid-supported hybrid operation.');
        if (systemType === 'hybrid' || systemType === 'grid_tie') this.addReason(hybridGrid, 18, 'The current electrical topology already supports grid-assisted operation.');
        if (generatorKey === 'none') this.addReason(hybridGrid, 8, 'No generator path is being centered in the design, which keeps the grid-assisted story cleaner.');
        if (solarCoveragePct >= thresholds.solarCoverageWorkingPct) this.addReason(hybridGrid, 12, `Modeled solar yield covers about ${solarCoveragePct}% of daily demand, which suits a hybrid offset story.`);
        if (continuityKey === 'convenience' || continuityKey === 'business_critical') this.addReason(hybridGrid, 10, 'The continuity target can often be handled honestly with hybrid grid support.');
        if (phaseType === 'three_phase' && continuityKey === 'process_critical' && generatorKey === 'none') this.addGap(hybridGrid, 10, 'Process-critical 3-phase duty often needs more explicit assisted support than a generic grid-hybrid story.');
        if (generatorKey !== 'none' && operatingIntentKey !== 'hybrid_grid') this.addGap(hybridGrid, 6, 'The present topology already leans toward generator dependence rather than a clean grid-hybrid posture.');

        const essentialBackup = cards.essential_load_only_backup;
        if (operatingIntentKey === 'essential_loads_only') this.addReason(essentialBackup, 30, 'The selected operating intent already targets only essential circuits.');
        if (operatingIntentKey === 'backup_only') this.addReason(essentialBackup, 10, 'Backup-only jobs often become more honest when the protected scope stays selective.');
        if (boardKey === 'essential_subboard') this.addReason(essentialBackup, 20, 'The active board strategy already isolates essential circuits.');
        if (protectedPeakSharePct <= thresholds.protectedPeakSelectivePct) this.addReason(essentialBackup, 16, `Only about ${protectedPeakSharePct}% of peak demand sits on the protected path.`);
        else if (protectedPeakSharePct >= 95) this.addGap(essentialBackup, 10, `About ${protectedPeakSharePct}% of peak demand is still being treated as protected, so the selective-board benefit is limited.`);
        if (deferrableSharePct >= thresholds.deferrableSelectivePct) this.addReason(essentialBackup, 14, `${deferrableSharePct}% of daily energy is already deferrable.`);
        if (throughputStatus === 'warn' || throughputStatus === 'fail') this.addReason(essentialBackup, 12, 'Selective coverage is more honest because the current battery path is already tight.');
        if (averageBackupHours < thresholds.averageBackupReadyHours) this.addReason(essentialBackup, 8, `Average-load backup is only about ${roundValue(averageBackupHours, 1)} hours, so full-site continuity may be too aggressive.`);
        if (phaseType !== 'three_phase' && (continuityKey === 'process_critical' || continuityKey === 'product_loss_critical')) this.addReason(essentialBackup, 6, 'Selective coverage can still be commercially honest while the heavier topology review is being closed.');
        if (operatingIntentKey === 'full_offgrid') this.addGap(essentialBackup, 8, 'The selected intent still expects wider off-grid coverage than a selective essential-only package.');

        const scorecards = Object.values(cards).map(card => this.normalizeScore(card)).sort((a, b) => b.score - a.score);
        const recommended = scorecards[0];
        const definition = recommended?.definition || definitions.essential_load_only_backup;
        const isIntentAligned = Array.isArray(definition?.preferredIntents) && definition.preferredIntents.includes(operatingIntentKey);
        const isSystemTypeAligned = Array.isArray(definition?.preferredSystemTypes) && definition.preferredSystemTypes.includes(systemType);

        const warnings = [];
        const suggestions = [];
        const risks = [];
        const openItems = [];

        const addUnique = (list, item) => {
            if (item && !list.includes(item)) list.push(item);
        };

        if (!isIntentAligned) {
            addUnique(warnings, `Current intent is ${businessContext.operatingIntent?.label || operatingIntentKey}, but the modeled site fits ${definition.label} more honestly.`);
            addUnique(openItems, `Reconfirm whether the project should be framed as ${definition.label.toLowerCase()} instead of ${businessContext.operatingIntent?.label?.toLowerCase() || operatingIntentKey}.`);
        }
        if (!isSystemTypeAligned) {
            addUnique(warnings, `${definition.label} usually fits ${definition.preferredSystemTypes.join(' / ')} delivery better than the current ${businessContext.systemTypeLabel || systemType} path.`);
            addUnique(openItems, `Review whether the ${businessContext.systemTypeLabel || systemType} topology is the right delivery path for ${definition.label.toLowerCase()}.`);
        }
        if (recommended.key === 'hybrid_generator_assist' && generatorKey === 'none') {
            addUnique(warnings, 'The recommended posture depends on generator support, but no generator path is captured yet.');
            addUnique(openItems, 'Capture the real or planned generator size before treating the hybrid-assist recommendation as final.');
            addUnique(risks, 'Continuity claims are optimistic until the generator path is sized and documented.');
        }
        if (recommended.key === 'essential_load_only_backup' && boardKey !== 'essential_subboard') {
            addUnique(openItems, 'Move the quote to a selective protected-board story instead of promising full-facility continuity.');
        }
        if (recommended.key === 'battery_dominant_offgrid' && (throughputStatus === 'fail' || overnightProtectedCoveragePct < thresholds.overnightProtectedWorkingCoveragePct)) {
            addUnique(risks, 'The current battery bank still looks lean for a commercially honest battery-dominant off-grid story.');
        }
        if (recommended.key === 'solar_dominant_daytime_bridge' && daytimeProcessSharePct < thresholds.daytimeProcessWorkingPct) {
            addUnique(openItems, 'Move more productive duty into solar hours if this site is to be sold as a solar-first daytime operation.');
        }
        if (recommended.key === 'hybrid_grid_support' && (continuityKey === 'process_critical' || continuityKey === 'product_loss_critical')) {
            addUnique(risks, 'High-criticality production or product-loss sites may still need a clearer contingency path than generic grid-hybrid language suggests.');
        }
        scorecards.slice(1, 3).forEach(card => {
            addUnique(suggestions, `${card.label} remains a viable alternate posture at ${card.score}% fit if the commercial brief changes.`);
        });
        recommended.gaps.slice(0, 2).forEach(item => addUnique(risks, item));
        recommended.reasons.slice(0, 2).forEach(item => addUnique(suggestions, item));

        let status: EngineCommercialDecisionResult['status'] = 'pass';
        let tone: EngineCommercialDecisionResult['tone'] = 'green';
        if (recommended.score < 60) {
            status = 'fail';
            tone = 'red';
        } else if (!isIntentAligned || !isSystemTypeAligned || generatorStatus === 'fail' || throughputStatus === 'fail' || architecture.status === 'fail') {
            status = recommended.key === 'hybrid_generator_assist' && generatorStatus === 'fail' ? 'fail' : 'warn';
            tone = status === 'fail' ? 'red' : 'amber';
        } else if (recommended.score < 75 || throughputStatus === 'warn' || generatorStatus === 'warn' || architecture.status === 'warn') {
            status = 'warn';
            tone = 'amber';
        }

        const currentIntentLabel = businessContext.operatingIntent?.label || operatingIntentKey;
        const currentSystemTypeLabel = businessContext.systemTypeLabel || systemType;
        const headline = status === 'pass'
            ? `Recommended operating posture: ${definition.label}.`
            : status === 'warn'
                ? `The current site metrics point more honestly to ${definition.label}.`
                : `${definition.label} is the least risky current posture, but the business story still needs tighter scope or support.`;
        const detail = status === 'pass'
            ? `${definition.summary} The current project posture is aligned with that recommendation.`
            : `${definition.summary} The current project posture (${currentIntentLabel} on ${currentSystemTypeLabel}) is not yet the cleanest commercial story.`;
        const note = recommended.reasons[0]
            || definition.summary;

        return {
            key: recommended.key,
            label: definition.label,
            definition,
            badge: definition.badge,
            status,
            tone,
            score: recommended.score,
            headline,
            detail,
            note,
            currentIntentKey: operatingIntentKey,
            currentIntentLabel,
            currentSystemType: systemType,
            currentSystemTypeLabel,
            isIntentAligned,
            isSystemTypeAligned,
            reasons: recommended.reasons.slice(0, 4),
            gaps: recommended.gaps.slice(0, 4),
            warnings,
            suggestions,
            openItems,
            risks,
            alternates: scorecards.slice(1, 3).map(card => ({
                key: card.key,
                label: card.label,
                score: card.score,
                summary: card.definition?.summary || ''
            })),
            metrics: {
                solarCoveragePct,
                averageBackupHours: roundValue(averageBackupHours, 1),
                overnightCriticalCoveragePct,
                overnightProtectedCoveragePct,
                daytimeProcessSharePct,
                deferrableSharePct,
                shiftableSharePct,
                preservationSharePct,
                protectedPeakSharePct
            },
            scorecards: scorecards.map(card => ({
                key: card.key,
                label: card.label,
                score: card.score,
                reasons: card.reasons.slice(0, 3),
                gaps: card.gaps.slice(0, 3)
            }))
        };
    }
};

/* =============================================================================
   PHASE 5: PV ARRAY ENGINE
   ============================================================================= */

const PVArrayEngine = {
    /**
     * Calculate PV array design
     * @param {AggregationResult} aggregatedLoad
     * @param {BatterySizingResult} batteryReq
     * @param {SystemConfig} config
     * @param {{ wattage: number, vmp: number, voc: number, imp: number, isc: number, tempCoeffPmax?: number, tempCoeffVoc: number }} panel
     * @param {{ maxVoltage: number, maxOperatingVoltage?: number, minVoltage?: number, maxCurrent: number, maxPower: number }} mppt
     * @returns {PVArrayResult}
     */
    calculate(aggregatedLoad, batteryReq, config, panel, mppt) {
        const warnings = [];
        const blocks = [];
        const suggestions = [];

        const batterySpecs = DEFAULTS.BATTERY_SPECS[batteryReq.chemistry];

        // System efficiency
        const systemEfficiency =
            DEFAULTS.INVERTER_EFFICIENCY *
            batterySpecs.chargeEfficiency *
            (1 - DEFAULTS.CABLE_LOSS_FACTOR) *
            (1 - DEFAULTS.PV_SOILING_LOSS) *
            (1 - DEFAULTS.PV_MISMATCH_LOSS);

        // Required PV energy
        let requiredPVEnergy = aggregatedLoad.dailyEnergyWh / systemEfficiency;

        // Optionally add daytime load power to PV requirement
        // This ensures panels can simultaneously power daytime loads AND charge batteries
        const pvAccountForDaytimeLoadInput = document.getElementById('pvAccountForDaytimeLoad') as HTMLInputElement | null;
        const pvAccountForDaytimeLoad = pvAccountForDaytimeLoadInput?.checked !== false;
        const daytimeLoadWh = aggregatedLoad.daytimeEnergyWh || 0;
        if (pvAccountForDaytimeLoad && daytimeLoadWh > 0) {
            // Daytime load needs to be directly powered by PV during sun hours
            const daytimePVWh = daytimeLoadWh / systemEfficiency;
            requiredPVEnergy += daytimePVWh;
        }

        // Add energy to replenish battery
        const batteryRechargeWh = batteryReq.usableCapacityWh / batterySpecs.chargeEfficiency;
        requiredPVEnergy += batteryRechargeWh / config.autonomyDays;

        // Apply design margin
        requiredPVEnergy *= (config.designMargin / 100);

        // Calculate required array wattage
        let requiredWattage = requiredPVEnergy / config.avgPSH;

        // Temperature derating
        const tempDelta = config.ambientTempMax - DEFAULTS.STC_TEMP;
        const tempCoeffPmax = panel.tempCoeffPmax || -0.35;  // From panel specs or default
        const tempDerating = 1 + (tempCoeffPmax / 100 * tempDelta);
        if (tempDerating < 1) {
            requiredWattage /= tempDerating;
        }

        // Orientation and tilt correction
        const orientationFactor = config.orientationFactor || 0.93;
        const tiltFactor = config.tiltFactor || 0.97;
        const combinedPVFactor = orientationFactor * tiltFactor;
        if (combinedPVFactor < 1.0) {
            requiredWattage /= combinedPVFactor;
        }

        // Number of panels needed
        const panelsRequired = Math.ceil(requiredWattage / panel.wattage);

        // Voc at coldest temperature
        const tempDeltaCold = config.ambientTempMin - DEFAULTS.STC_TEMP;
        const vocTempFactor = 1 + (panel.tempCoeffVoc / 100 * tempDeltaCold);
        const vocCold = panel.voc * vocTempFactor;

        // Maximum panels in series based on cold Voc limit AND max operating voltage
        const maxSeriesVoc = Math.floor((mppt.maxVoltage * (1 - DEFAULTS.VOC_HEADROOM_PERCENT)) / vocCold);
        const maxSeriesVmp = mppt.maxOperatingVoltage ? Math.floor(mppt.maxOperatingVoltage / panel.vmp) : maxSeriesVoc;
        const maxSeriesForMPPT = Math.min(maxSeriesVoc, maxSeriesVmp);

        // Minimum panels in series: must exceed MPPT min voltage AND battery voltage * 1.2
        const minStringVmpBatt = batteryReq.bankVoltage * 1.2;
        const minStringVmpMPPT = mppt.minVoltage || 60;
        const minStringVmp = Math.max(minStringVmpBatt, minStringVmpMPPT);
        const minSeriesForMPPT = Math.max(1, Math.ceil(minStringVmp / panel.vmp));

        if (maxSeriesForMPPT < minSeriesForMPPT) {
            blocks.push(
                `HARD BLOCK: Cannot configure viable string. Min series for efficiency: ${minSeriesForMPPT}, Max series for MPPT voltage limit: ${maxSeriesForMPPT}. Need different panel or MPPT.`
            );
            suggestions.push(
                `Use an MPPT with higher voltage rating (>${Math.round(vocCold * minSeriesForMPPT)}V) or panels with lower Voc.`
            );
        }

        // Find optimal series count
        let panelsInSeries = Math.min(
            maxSeriesForMPPT,
            Math.max(minSeriesForMPPT, Math.floor(Math.sqrt(panelsRequired)))
        );

        // Calculate parallel strings
        let stringsParallel = Math.ceil(panelsRequired / panelsInSeries);

        // Validate MPPT current limit
        let arrayIsc = panel.isc * stringsParallel;
        if (arrayIsc > mppt.maxCurrent) {
            const maxParallel = Math.floor(mppt.maxCurrent / panel.isc);
            if (maxParallel < 1) {
                blocks.push(
                    `HARD BLOCK: Single string Isc (${panel.isc}A) exceeds MPPT max current (${mppt.maxCurrent}A)`
                );
                suggestions.push(
                    `Use an MPPT with higher current rating (>${panel.isc}A) or panels with lower Isc.`
                );
            } else {
                panelsInSeries = Math.ceil(panelsRequired / maxParallel);
                stringsParallel = maxParallel;
                warnings.push(
                    `Parallel strings limited to ${maxParallel} due to MPPT current limit`
                );
            }
        }

        // Final configuration
        const totalPanels = panelsInSeries * stringsParallel;
        const stringVmp = panel.vmp * panelsInSeries;
        const stringVoc = panel.voc * panelsInSeries;
        const stringVocCold = vocCold * panelsInSeries;
        const arrayImp = panel.imp * stringsParallel;
        arrayIsc = panel.isc * stringsParallel;
        const arrayWattage = panel.wattage * totalPanels;
        const deratedOutput = arrayWattage * tempDerating * (1 - DEFAULTS.PV_SOILING_LOSS);
        const dailyEnergy = deratedOutput * config.avgPSH;

        // Validation checks
        if (stringVocCold > mppt.maxVoltage) {
            blocks.push(
                `HARD BLOCK: Cold Voc (${stringVocCold.toFixed(1)}V) exceeds MPPT max voltage (${mppt.maxVoltage}V). Risk of MPPT damage!`
            );
            suggestions.push(
                `Reduce panels in series to ${Math.floor(mppt.maxVoltage / vocCold)} or less, or use an MPPT rated for ${Math.round(stringVocCold)}V+.`
            );
        } else if (stringVocCold > mppt.maxVoltage * 0.9) {
            warnings.push(
                `Cold Voc (${stringVocCold.toFixed(1)}V) is within 10% of MPPT limit. Consider reducing panels in series.`
            );
        }

        if (arrayWattage > mppt.maxPower) {
            warnings.push(
                `Array power (${arrayWattage}W) exceeds MPPT rating (${mppt.maxPower}W). MPPT will limit output to its rated power.`
            );
        }

        // Check string Vmp vs max operating voltage
        if (mppt.maxOperatingVoltage && stringVmp > mppt.maxOperatingVoltage) {
            warnings.push(
                `String Vmp (${stringVmp.toFixed(1)}V) exceeds MPPT max operating voltage (${mppt.maxOperatingVoltage}V). MPPT may not track efficiently. Consider fewer panels in series.`
            );
        }

        // Check string Vmp vs min startup voltage
        if (mppt.minVoltage && stringVmp < mppt.minVoltage) {
            warnings.push(
                `String Vmp (${stringVmp.toFixed(1)}V) is below MPPT min startup voltage (${mppt.minVoltage}V). System may not start in low-light conditions.`
            );
        }

        return {
            panelsInSeries,
            stringsInParallel: stringsParallel,
            totalPanels,
            stringVmp: Math.round(stringVmp * 10) / 10,
            stringVoc: Math.round(stringVoc * 10) / 10,
            stringVocCold: Math.round(stringVocCold * 10) / 10,
            arrayImp: Math.round(arrayImp * 100) / 100,
            arrayIsc: Math.round(arrayIsc * 100) / 100,
            arrayWattage: Math.round(arrayWattage * 10) / 10,
            deratedOutput: Math.round(deratedOutput * 10) / 10,
            dailyEnergyWh: Math.round(dailyEnergy * 10) / 10,
            pvAccountForDaytimeLoad: pvAccountForDaytimeLoad,
            daytimeLoadWh: Math.round(daytimeLoadWh),
            orientationFactor,
            tiltFactor,
            combinedPVFactor: Math.round(combinedPVFactor * 1000) / 1000,
            warnings,
            blocks,
            suggestions
        };
    }
};

/* =============================================================================
   PHASE 6: CHARGE CONTROLLER VALIDATION
   ============================================================================= */

const ChargeControllerValidator = {
    /**
     * Validate charge controller against array configuration
     */
    validate(pvDesign, mppt) {
        const warnings = [];
        const blocks = [];
        const suggestions = [];

        // Voltage validation
        const maxPVVoltageOK = pvDesign.stringVocCold <= mppt.maxVoltage;
        const voltageHeadroom = (mppt.maxVoltage - pvDesign.stringVocCold) / mppt.maxVoltage;

        if (!maxPVVoltageOK) {
            blocks.push(
                `HARD BLOCK: String Voc (cold) ${pvDesign.stringVocCold.toFixed(1)}V EXCEEDS MPPT maximum ${mppt.maxVoltage}V. IMMEDIATE RISK OF EQUIPMENT DAMAGE AND FIRE.`
            );
            suggestions.push(
                `Increase MPPT voltage rating to at least ${Math.round(pvDesign.stringVocCold * 1.1)}V or reduce panels in series.`
            );
        } else if (voltageHeadroom < 0.05) {
            warnings.push(
                `CRITICAL: Only ${(voltageHeadroom * 100).toFixed(1)}% voltage headroom. Temperature excursions may cause overvoltage damage.`
            );
        }

        // Current validation
        const iscWithMargin = pvDesign.arrayIsc * DEFAULTS.CONTINUOUS_LOAD_FACTOR;
        const maxPVCurrentOK = iscWithMargin <= mppt.maxCurrent;
        const currentHeadroom = (mppt.maxCurrent - pvDesign.arrayIsc) / mppt.maxCurrent;

        if (!maxPVCurrentOK) {
            blocks.push(
                `HARD BLOCK: Array Isc with NEC margin (${iscWithMargin.toFixed(1)}A) EXCEEDS MPPT maximum ${mppt.maxCurrent}A.`
            );
            suggestions.push(
                `Increase MPPT current rating to at least ${Math.round(iscWithMargin)}A or reduce parallel strings.`
            );
        }

        // Power validation
        const maxPowerOK = pvDesign.arrayWattage <= mppt.maxPower * 1.3;

        if (pvDesign.arrayWattage > mppt.maxPower * 1.3) {
            warnings.push(
                `Array significantly oversized (${pvDesign.arrayWattage}W vs ${mppt.maxPower}W MPPT). Consider multiple MPPTs.`
            );
        }

        return {
            isValid: maxPVVoltageOK && maxPVCurrentOK && maxPowerOK,
            maxPVVoltageOK,
            maxPVCurrentOK,
            maxPowerOK,
            voltageHeadroomPercent: Math.round(voltageHeadroom * 1000) / 10,
            currentHeadroomPercent: Math.round(currentHeadroom * 1000) / 10,
            warnings,
            blocks,
            suggestions
        };
    }
};

/* =============================================================================
   PHASE 5B: PV PRACTICAL ENGINE
   Calculates reduced PV array when heavy loads are daytime-only and battery is smaller.
   Engineering PV sizes for worst-case (all loads 24/7 + full battery recharge).
   Practical PV: heavy daytime loads powered in real-time by panels,
   smaller battery means less recharge energy needed.
   ============================================================================= */

const PVPracticalEngine = {
    calculate(
        appliances: EngineApplianceInput[],
        pvArray: EnginePVArrayResult,
        batteryPractical: EngineBatteryPracticalResult | null,
        aggregation: EngineAggregationResult,
        config: EngineSystemConfig,
        panel: EnginePanelSpec
    ): EnginePVPracticalResult | null {
        if (!appliances || appliances.length === 0 || !pvArray) return null;

        const conditions: EnginePracticalCondition[] = [];
        const psh = config.avgPSH || 4.5;

        // Total engineering energy requirement (from PV engine)
        const engineeringPanels = pvArray.totalPanels || 0;
        const engineeringWp = pvArray.arrayWattage || 0;

        // Practical approach: PV only needs to cover:
        // 1. Real-time daytime loads (heavy loads during sun hours)
        // 2. Nighttime essentials via smaller battery recharge
        // 3. NOT full battery recharge for worst-case autonomy

        // Calculate daytime-shifted load power (direct from PV, not via battery)
        let daytimeDirectWh = 0;
        let nighttimeViasBattery = 0;

        for (const app of appliances) {
            const dailyWh = LoadEngine.calculateDailyEnergyWh(app);
            const freq = app.dutyFrequency || 'daily';
            const isDaytime = app.isDaytimeOnly === true || app.isDaytimeOnly === 'yes';
            const loadRole = resolveLoadRole(app);
            const loadCriticality = resolveLoadCriticality(app, loadRole, config);

            if (isDaytime || freq === 'weekly' || freq === 'rare' || loadCriticality === 'deferrable') {
                daytimeDirectWh += dailyWh;
            } else {
                const nightFraction = 1 - (app.daytimeRatio || 50) / 100;
                nighttimeViasBattery += dailyWh * nightFraction;
                daytimeDirectWh += dailyWh * ((app.daytimeRatio || 50) / 100);
            }
        }

        // System efficiency chain
        const batterySpecs = DEFAULTS.BATTERY_SPECS?.[config.batteryChemistry || 'lifepo4'] || DEFAULTS.BATTERY_SPECS?.lifepo4;
        const sysEff = DEFAULTS.INVERTER_EFFICIENCY *
            (batterySpecs?.chargeEfficiency || 0.95) *
            (1 - (DEFAULTS.CABLE_LOSS_FACTOR || 0.02)) *
            (1 - (DEFAULTS.PV_SOILING_LOSS || 0.03)) *
            (1 - (DEFAULTS.PV_MISMATCH_LOSS || 0.02));

        // Practical PV energy = daytime direct + nighttime battery recharge
        // Battery recharge: only enough for nighttime essentials (not full autonomy)
        const battRechargeWh = batteryPractical
            ? batteryPractical.practicalWh / (batterySpecs?.chargeEfficiency || 0.95)
            : nighttimeViasBattery / (batterySpecs?.chargeEfficiency || 0.95);

        let practicalPVEnergyWh = (daytimeDirectWh + nighttimeViasBattery) / sysEff;
        practicalPVEnergyWh += battRechargeWh / (config.autonomyDays || 1);
        practicalPVEnergyWh *= (config.designMargin || 110) / 100;

        // Temperature derating
        const tempDelta = (config.ambientTempMax || 35) - (DEFAULTS.STC_TEMP || 25);
        const tempCoeff = panel.tempCoeffPmax || -0.35;
        const tempDerating = 1 + (tempCoeff / 100 * tempDelta);
        let practicalWp = practicalPVEnergyWh / psh;
        if (tempDerating < 1) practicalWp /= tempDerating;

        // Orientation and tilt correction (same as PVArrayEngine)
        const orientFactor = config.orientationFactor || 0.93;
        const tiltFact = config.tiltFactor || 0.97;
        const combinedPVFact = orientFactor * tiltFact;
        if (combinedPVFact < 1.0) practicalWp /= combinedPVFact;

        const practicalPanels = Math.ceil(practicalWp / (panel.wattage || 200));
        const practicalArrayWp = practicalPanels * (panel.wattage || 200);

        const savings = engineeringPanels > 0
            ? Math.round((1 - practicalPanels / engineeringPanels) * 100) : 0;

        // Conditions
        conditions.push({
            type: 'daytime_heavy',
            severity: 'critical',
            text: `Run heavy loads during peak sun hours (10am-4pm)`,
            detail: `${Math.round(daytimeDirectWh)}Wh powered directly by panels during sun hours. PV sized for real-time daytime demand + nighttime battery recharge.`
        });
        if (batteryPractical && batteryPractical.savings > 5) {
            conditions.push({
                type: 'smaller_battery',
                severity: 'important',
                text: `Matched to practical battery (${batteryPractical.practicalAh}Ah) — less recharge energy needed`,
                detail: `Engineering battery (${batteryPractical.engineeringAh}Ah) would require more PV to recharge. Practical battery needs only ${Math.round(battRechargeWh)}Wh daily recharge.`
            });
        }

        // Risk level
        let riskLevel = 'GREEN';
        let riskLabel = 'Minimal Risk';
        const deviation = engineeringPanels > 0 ? (1 - practicalPanels / engineeringPanels) : 0;
        if (deviation <= 0.15) { riskLevel = 'GREEN'; riskLabel = 'Minimal Risk'; }
        else if (deviation <= 0.30) { riskLevel = 'YELLOW'; riskLabel = 'Manageable'; }
        else if (deviation <= 0.50) { riskLevel = 'ORANGE'; riskLabel = 'Requires Discipline'; }
        else { riskLevel = 'RED'; riskLabel = 'Significant Compromise'; }

        return {
            practicalPanels,
            practicalArrayWp,
            engineeringPanels,
            engineeringWp,
            savings,
            conditions,
            conditionCount: conditions.length,
            riskLevel,
            riskLabel,
            daytimeDirectWh: Math.round(daytimeDirectWh),
            nighttimeViasBattery: Math.round(nighttimeViasBattery)
        };
    }
};

/* =============================================================================
   PHASE 7: CABLE SIZING ENGINE
   ============================================================================= */

const CableSizingEngine = {
    /**
     * Find next standard metric cable size >= given mm2
     */
    findMarketMetricSize(mm2) {
        for (const size of DEFAULTS.METRIC_CABLE_SIZES) {
            if (size >= mm2) return size;
        }
        return DEFAULTS.METRIC_CABLE_SIZES[DEFAULTS.METRIC_CABLE_SIZES.length - 1];
    },

    /**
     * Find closest AWG equivalent for a given mm2 value
     */
    findClosestAWG(mm2) {
        const awgKeys = Object.keys(DEFAULTS.AWG_DATA).map(Number).sort((a, b) => b - a);
        let closest = null;
        let closestDiff = Infinity;
        for (const awg of awgKeys) {
            const diff = Math.abs(DEFAULTS.AWG_DATA[awg].mm2 - mm2);
            if (diff < closestDiff) {
                closestDiff = diff;
                closest = awg;
            }
        }
        if (closest === 0) return '1/0';
        if (closest === -1) return '2/0';
        if (closest === -2) return '3/0';
        if (closest === -3) return '4/0';
        return closest.toString();
    },

    /**
     * Get metric cable ampacity for a given standard metric size
     */
    getMetricAmpacity(mm2) {
        return DEFAULTS.METRIC_CABLE_AMPACITY[mm2] || 0;
    },

    /**
     * Size individual cable run
     */
    sizeCable(name, current, voltage, length, isDC, maxDrop) {
        const warnings = [];
        let parallelCables = 1;

        // Calculate minimum cross-section for voltage drop
        const allowedDropV = voltage * maxDrop;
        const minAreaVdrop = (current * DEFAULTS.COPPER_RESISTIVITY * length * 2) / allowedDropV;

        // Find AWG that meets both voltage drop and ampacity
        let selectedAWG = null;
        let selectedMm2 = 0;
        let selectedAmpacity = 0;

        const awgKeys = Object.keys(DEFAULTS.AWG_DATA).map(Number).sort((a, b) => b - a);

        for (const awg of awgKeys) {
            const data = DEFAULTS.AWG_DATA[awg];
            if (data.mm2 >= minAreaVdrop && data.ampConduit >= current) {
                selectedAWG = awg;
                selectedMm2 = data.mm2;
                selectedAmpacity = data.ampConduit;
                break;
            }
        }

        if (selectedAWG === null) {
            // Need parallel runs or larger conductor
            const maxPracticalMm2 = 107.22;
            if (minAreaVdrop > maxPracticalMm2) {
                parallelCables = Math.ceil(minAreaVdrop / maxPracticalMm2);
                selectedMm2 = maxPracticalMm2;
                selectedAWG = -3;
                selectedAmpacity = DEFAULTS.AWG_DATA['-3'].ampConduit * parallelCables;
                warnings.push(
                    `Requires ${parallelCables}x 4/0 AWG (${maxPracticalMm2.toFixed(1)}mm2) cables in parallel`
                );
            } else {
                // Find closest metric size
                for (const mm2 of DEFAULTS.METRIC_CABLE_SIZES) {
                    if (mm2 >= minAreaVdrop) {
                        selectedMm2 = mm2;
                        break;
                    }
                }
                if (selectedMm2 === 0) {
                    selectedMm2 = DEFAULTS.METRIC_CABLE_SIZES[DEFAULTS.METRIC_CABLE_SIZES.length - 1];
                }
                selectedAWG = -3;
                selectedAmpacity = DEFAULTS.AWG_DATA['-3'].ampConduit;
                warnings.push(`Use ${selectedMm2.toFixed(1)}mm2 metric cable`);
            }
        }

        // Calculate actual voltage drop
        const effectiveMm2 = selectedMm2 * parallelCables;
        const actualResistance = DEFAULTS.COPPER_RESISTIVITY * length * 2 / effectiveMm2;
        const actualDropV = current * actualResistance;
        const actualDropPercent = actualDropV / voltage;

        // Check ampacity
        if (selectedAmpacity < current) {
            const parallelNeeded = Math.ceil(current / selectedAmpacity);
            if (parallelNeeded > parallelCables) {
                parallelCables = parallelNeeded;
                warnings.push(`Ampacity requires ${parallelCables} parallel cables`);
                selectedAmpacity *= parallelCables;
            }
        }

        // AWG label
        let awgLabel = selectedAWG.toString();
        if (selectedAWG === 0) awgLabel = '1/0';
        else if (selectedAWG === -1) awgLabel = '2/0';
        else if (selectedAWG === -2) awgLabel = '3/0';
        else if (selectedAWG === -3) awgLabel = '4/0';

        // Market-standard metric cable sizing
        const computedMm2 = Math.round(selectedMm2 * 100) / 100;
        const marketMm2 = this.findMarketMetricSize(computedMm2);
        const marketAmpacity = this.getMetricAmpacity(marketMm2);
        const marketAWGEquiv = this.findClosestAWG(marketMm2);

        // Check if market cable meets ampacity for the current
        let marketAmpacityOK = marketAmpacity >= current || parallelCables > 1;
        let finalMarketMm2 = marketMm2;
        if (!marketAmpacityOK && parallelCables <= 1) {
            // Upsize market cable to meet ampacity
            for (const size of DEFAULTS.METRIC_CABLE_SIZES) {
                if (size >= computedMm2 && (DEFAULTS.METRIC_CABLE_AMPACITY[size] || 0) >= current) {
                    finalMarketMm2 = size;
                    marketAmpacityOK = true;
                    break;
                }
            }
        }

        // Build display strings
        const isSameSize = computedMm2 === finalMarketMm2;
        const sizeRangeDisplay = isSameSize
            ? `${finalMarketMm2}mm²`
            : `${computedMm2} – ${finalMarketMm2}mm²`;

        return {
            name,
            current: Math.round(current * 10) / 10,
            voltage: Math.round(voltage * 10) / 10,
            lengthM: length,
            isDC,
            recommendedAWG: awgLabel,
            recommendedMm2: computedMm2,
            marketMm2: finalMarketMm2,
            marketAWGEquiv,
            marketAmpacity: DEFAULTS.METRIC_CABLE_AMPACITY[finalMarketMm2] || 0,
            sizeRangeDisplay,
            actualVoltageDropPercent: Math.round(actualDropPercent * 10000) / 100,
            ampacityRating: selectedAmpacity,
            ampacityOK: selectedAmpacity >= current,
            voltageDropOK: actualDropPercent <= maxDrop,
            parallelCables,
            warnings
        };
    },

    /**
     * Calculate all cable sizes
     */
    calculate(inverterReq, batteryReq, pvDesign, config, cableLengths, panel, mppt) {
        const warnings = [];
        const blocks = [];
        const suggestions = [];
        const dcRuns = [];
        const acRuns = [];

        // 1. PV String cables
        const pvStringRun = this.sizeCable(
            'PV String Cable (per string)',
            panel.isc * DEFAULTS.CONTINUOUS_LOAD_FACTOR,
            pvDesign.stringVmp,
            cableLengths.pvToMPPT,
            true,
            DEFAULTS.DC_VOLTAGE_DROP_TARGET
        );
        dcRuns.push(pvStringRun);

        // 2. PV Array to MPPT
        const pvArrayRun = this.sizeCable(
            'PV Array to MPPT',
            pvDesign.arrayIsc * DEFAULTS.CONTINUOUS_LOAD_FACTOR,
            pvDesign.stringVmp,
            cableLengths.pvToMPPT,
            true,
            DEFAULTS.DC_VOLTAGE_DROP_TARGET
        );
        dcRuns.push(pvArrayRun);

        // 3. MPPT to Battery
        const chargeCurrent = Math.min(mppt.maxChargeCurrent || 60, batteryReq.maxChargeCurrent) * DEFAULTS.CONTINUOUS_LOAD_FACTOR;
        const mpptBatteryRun = this.sizeCable(
            'MPPT to Battery',
            chargeCurrent,
            batteryReq.bankVoltage,
            cableLengths.mpptToBatt,
            true,
            DEFAULTS.DC_VOLTAGE_DROP_TARGET * 0.5
        );
        dcRuns.push(mpptBatteryRun);

        // 4. Battery to Inverter
        const batteryInverterRun = this.sizeCable(
            'Battery to Inverter',
            inverterReq.dcInputCurrentSurge * DEFAULTS.CONTINUOUS_LOAD_FACTOR,
            inverterReq.dcBusVoltage,
            cableLengths.battToInv,
            true,
            DEFAULTS.DC_VOLTAGE_DROP_TARGET * 0.5
        );
        dcRuns.push(batteryInverterRun);

        // 5. Inverter AC Output
        const acCurrent = calculateACCurrent(inverterReq.continuousVARequired, config.acVoltage, config.phaseType) * DEFAULTS.CONTINUOUS_LOAD_FACTOR;
        const inverterOutputRun = this.sizeCable(
            'Inverter AC Output',
            acCurrent,
            config.acVoltage,
            cableLengths.invToLoad,
            false,
            DEFAULTS.AC_VOLTAGE_DROP_TARGET
        );
        acRuns.push(inverterOutputRun);

        // Aggregate warnings
        for (const run of [...dcRuns, ...acRuns]) {
            if (!run.ampacityOK) {
                blocks.push(`${run.name}: Current ${run.current}A exceeds cable ampacity`);
                suggestions.push(`${run.name}: Use parallel cables or increase cable size`);
            }
            if (!run.voltageDropOK) {
                warnings.push(`${run.name}: Voltage drop ${run.actualVoltageDropPercent.toFixed(2)}% exceeds target`);
            }
            if (run.parallelCables > 1) {
                warnings.push(`${run.name}: Requires ${run.parallelCables} parallel cables`);
            }
            warnings.push(...run.warnings);
        }

        // Calculate total copper
        const totalLength = [...dcRuns, ...acRuns].reduce((sum, r) => sum + r.lengthM * 2 * r.parallelCables, 0);
        const totalMm2 = [...dcRuns, ...acRuns].reduce((sum, r) => sum + r.recommendedMm2 * r.lengthM * 2 * r.parallelCables, 0);
        const copperKg = totalMm2 * 0.00894;

        return {
            dcRuns,
            acRuns,
            totalCopperLengthM: Math.round(totalLength * 10) / 10,
            estimatedCopperKg: Math.round(copperKg * 100) / 100,
            warnings,
            blocks,
            suggestions
        };
    }
};

/* =============================================================================
   PHASE 8: PROTECTION ENGINE
   ============================================================================= */

const ProtectionEngine = {
    // Standard MCCB sizes (Amps)
    MCCB_SIZES: [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400],
    // Standard MCB sizes (Amps)
    MCB_SIZES: [6, 10, 16, 20, 25, 32, 40, 50, 63],
    // Standard DC fuse sizes — Class T / ANL (Amps)
    DC_FUSE_SIZES: [30, 40, 50, 60, 80, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600],

    /**
     * Select next standard MCCB size above required amps
     */
    selectMCCB(requiredAmps) {
        for (const size of this.MCCB_SIZES) {
            if (size >= requiredAmps) return size;
        }
        return Math.ceil(requiredAmps / 50) * 50;
    },

    /**
     * Select next standard MCB size above required amps
     */
    selectMCB(requiredAmps) {
        for (const size of this.MCB_SIZES) {
            if (size >= requiredAmps) return size;
        }
        return Math.ceil(requiredAmps / 10) * 10;
    },

    /**
     * Select next standard DC fuse size above required amps
     */
    selectDCFuse(requiredAmps) {
        for (const size of this.DC_FUSE_SIZES) {
            if (size >= requiredAmps) return size;
        }
        return Math.ceil(requiredAmps / 100) * 100;
    },

    /**
     * Design complete protection scheme
     */
    design(inverterReq, batteryReq, pvDesign, config, manualBreakers) {
        const warnings = [];
        const pvSide = [];
        const batterySide = [];
        const acSide = [];
        const earthing = [];
        manualBreakers = manualBreakers || {};

        // ---- PV SIDE PROTECTION ----

        // String Fuses (required when >1 parallel string)
        if (pvDesign.stringsInParallel > 1) {
            const stringFuseRating = Math.ceil(pvDesign.arrayIsc / pvDesign.stringsInParallel * 1.56 / 5) * 5;
            pvSide.push({
                name: 'String Fuse (per string)',
                type: 'DC Fuse',
                rating: `${stringFuseRating}A / ${Math.round(pvDesign.stringVocCold + 50)}VDC`,
                location: 'In each string positive conductor',
                purpose: 'Protect against reverse current from parallel strings',
                mandatory: true
            });
        }

        // PV DC Isolator / Breaker
        const pvIsolatorCalc = Math.ceil(pvDesign.arrayIsc * 1.25);
        const pvIsolatorRating = this.selectMCB(pvIsolatorCalc);
        const pvVoltageRating = Math.round(pvDesign.stringVocCold + 50);

        // Check if user provided manual PV breaker
        if (manualBreakers.pvDC > 0) {
            const manualPV = manualBreakers.pvDC;
            pvSide.push({
                name: 'PV DC Isolator / Breaker',
                type: 'DC Disconnect Switch',
                rating: `${manualPV}A / ${pvVoltageRating}VDC`,
                location: 'Before MPPT/inverter PV input',
                purpose: 'Safe isolation for maintenance',
                mandatory: true,
                isManual: true,
                autoSuggested: pvIsolatorRating
            });
            if (manualPV < pvIsolatorCalc) {
                warnings.push(`PV DC breaker (${manualPV}A) is undersized. Min required: ${pvIsolatorCalc}A (Isc x 1.25). Recommended: ${pvIsolatorRating}A standard size.`);
            } else if (manualPV > pvIsolatorRating * 2) {
                warnings.push(`PV DC breaker (${manualPV}A) is oversized. May not trip on fault. Recommended: ${pvIsolatorRating}A.`);
            }
        } else {
            pvSide.push({
                name: 'PV DC Isolator / Breaker',
                type: 'DC Disconnect Switch',
                rating: `${pvIsolatorRating}A / ${pvVoltageRating}VDC`,
                location: 'Before MPPT/inverter PV input',
                purpose: 'Safe isolation for maintenance',
                mandatory: true
            });
        }

        // PV DC SPD
        pvSide.push({
            name: 'PV DC SPD',
            type: 'Surge Protection Device (Type 2)',
            rating: `Type 2 / ${Math.round(pvDesign.stringVocCold * 1.2)}VDC`,
            location: 'At combiner box or MPPT input',
            purpose: 'Lightning and surge protection',
            mandatory: false
        });

        // Combiner box for larger arrays
        if (pvDesign.stringsInParallel > 2) {
            pvSide.push({
                name: 'PV Combiner Box',
                type: 'Junction Box with fuses',
                rating: `${pvDesign.stringsInParallel} string inputs`,
                location: 'Near PV array, before cable run to inverter',
                purpose: 'Combine parallel strings with individual fuse protection',
                mandatory: true
            });
        }

        // ---- BATTERY SIDE PROTECTION ----

        // DC MCCB (Battery-Inverter) — the primary DC protection device
        const battMCCBCalc = batteryReq.maxDischargeCurrent * 1.25;
        const battMCCBRating = this.selectMCCB(battMCCBCalc);

        if (manualBreakers.battDC > 0) {
            const manualBatt = manualBreakers.battDC;
            batterySide.push({
                name: 'DC MCCB (Battery-Inverter)',
                type: 'DC Moulded Case Circuit Breaker',
                rating: `${manualBatt}A / ${batteryReq.bankVoltage}VDC`,
                location: 'Between battery bank positive terminal and inverter DC input',
                purpose: 'Main DC overcurrent protection and isolation for battery-inverter link',
                mandatory: true,
                isManual: true,
                autoSuggested: battMCCBRating
            });
            if (manualBatt < Math.ceil(battMCCBCalc)) {
                warnings.push(`Battery DC MCCB (${manualBatt}A) is undersized. Min required: ${Math.ceil(battMCCBCalc)}A (max discharge x 1.25). Recommended standard size: ${battMCCBRating}A.`);
            } else if (manualBatt > battMCCBRating * 2) {
                warnings.push(`Battery DC MCCB (${manualBatt}A) is oversized. May not trip on fault. Recommended: ${battMCCBRating}A.`);
            }
        } else {
            batterySide.push({
                name: 'DC MCCB (Battery-Inverter)',
                type: 'DC Moulded Case Circuit Breaker',
                rating: `${battMCCBRating}A / ${batteryReq.bankVoltage}VDC`,
                location: 'Between battery bank positive terminal and inverter DC input',
                purpose: 'Main DC overcurrent protection and isolation for battery-inverter link',
                mandatory: true
            });
        }

        // Battery Fuse (backup short-circuit protection)
        const battFuseCalc = battMCCBRating * 1.5;
        const battFuseRating = this.selectDCFuse(battFuseCalc);
        batterySide.push({
            name: 'Battery Fuse (Backup)',
            type: 'DC Fuse (Class T / ANL)',
            rating: `${battFuseRating}A / ${batteryReq.bankVoltage}VDC`,
            location: 'Between battery positive terminal and DC MCCB',
            purpose: 'Backup short-circuit protection — trips faster than MCCB on dead short',
            mandatory: true
        });

        // BMS for LiFePO4
        if (batteryReq.chemistry === 'lifepo4') {
            batterySide.push({
                name: 'Battery Management System (BMS)',
                type: 'BMS',
                rating: `${batteryReq.totalCapacityAh}Ah / ${batteryReq.cellsInSeries}S`,
                location: 'Integrated with battery bank',
                purpose: 'Cell balancing, over/under voltage, temperature, short-circuit protection',
                mandatory: true
            });
            warnings.push('LiFePO4 REQUIRES proper BMS — do not operate without! Ensure BMS communication (CAN/RS485) is connected to inverter if supported.');
        }

        // ---- AC SIDE PROTECTION ----

        const acBreakerCalc = calculateACCurrent(inverterReq.continuousVARequired, config.acVoltage, config.phaseType) * 1.25;
        const acBreakerRating = this.selectMCB(acBreakerCalc);

        if (manualBreakers.ac > 0) {
            const manualAC = manualBreakers.ac;
            acSide.push({
                name: 'Inverter Output MCB',
                type: 'AC Miniature Circuit Breaker',
                rating: `${manualAC}A / ${config.acVoltage}VAC`,
                location: 'Inverter AC output to distribution board',
                purpose: 'AC overcurrent protection',
                mandatory: true,
                isManual: true,
                autoSuggested: acBreakerRating
            });
            if (manualAC < Math.ceil(acBreakerCalc)) {
                warnings.push(`AC MCB (${manualAC}A) is undersized. Min required: ${Math.ceil(acBreakerCalc)}A. Recommended: ${acBreakerRating}A.`);
            } else if (manualAC > acBreakerRating * 2) {
                warnings.push(`AC MCB (${manualAC}A) is oversized. May not protect wiring. Recommended: ${acBreakerRating}A.`);
            }
        } else {
            acSide.push({
                name: 'Inverter Output MCB',
                type: 'AC Miniature Circuit Breaker',
                rating: `${acBreakerRating}A / ${config.acVoltage}VAC`,
                location: 'Inverter AC output to distribution board',
                purpose: 'AC overcurrent protection',
                mandatory: true
            });
        }

        acSide.push({
            name: 'AC SPD',
            type: 'Surge Protection Device (Type 2)',
            rating: `Type 2 / ${config.acVoltage}VAC`,
            location: 'Main AC distribution board',
            purpose: 'Surge protection for connected loads',
            mandatory: false
        });

        // AVR (Automatic Voltage Regulator)
        // Standard AVR sizes: 1kVA, 2kVA, 3kVA, 5kVA, 8kVA, 10kVA, 15kVA, 20kVA, 30kVA
        const avrSizes = [1000, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000];
        const avrRequired = inverterReq.continuousVARequired * 1.2; // 20% margin over continuous load
        let avrRating = avrSizes.find(s => s >= avrRequired) || Math.ceil(avrRequired / 5000) * 5000;

        acSide.push({
            name: 'Automatic Voltage Regulator (AVR)',
            type: 'Servo Motor / Relay-type AVR',
            rating: `${(avrRating / 1000).toFixed(avrRating >= 1000 ? 0 : 1)}kVA / ${config.acVoltage}VAC`,
            location: 'Between utility/grid input and transfer switch (or inverter AC input if grid-tied/hybrid)',
            purpose: 'Stabilizes incoming AC voltage to protect equipment from under/over voltage. Critical in areas with unstable grid supply.',
            mandatory: false,
            notes: inverterReq.continuousVARequired > 5000 ?
                'For loads above 5kVA, use a servo-motor type AVR for better regulation accuracy (±2-3%). Relay-type AVRs have wider tolerance (±5-8%).' :
                'Relay-type AVR is sufficient for this load range. Consider servo-motor type if voltage fluctuations exceed ±15%.'
        });

        // ---- EARTHING ----

        earthing.push({
            name: 'Equipment Earth',
            type: 'Earth Conductor',
            rating: '6mm2 minimum copper (green/yellow)',
            location: 'All metallic enclosures — inverter, panels frame, battery rack, combiner',
            purpose: 'Equipment fault protection per IEC 62109',
            mandatory: true
        });

        earthing.push({
            name: 'Earth Electrode',
            type: 'Earth Rod (Copper-bonded steel, min 1.5m)',
            rating: 'Target < 10 ohm impedance',
            location: 'Near array/inverter location, driven into ground',
            purpose: 'Fault current path to ground',
            mandatory: true
        });

        return { pvSide, batterySide, acSide, earthing, warnings };
    }
};

/* =============================================================================
   PHASE 9: SYSTEM LOSSES ENGINE
   ============================================================================= */

const SystemLossEngine = {
    /**
     * Calculate comprehensive system losses
     */
    calculate(aggregatedLoad, batteryReq, pvDesign, cableSizing, config) {
        const batterySpecs = DEFAULTS.BATTERY_SPECS[batteryReq.chemistry];

        // Component efficiencies
        const inverterEff = DEFAULTS.INVERTER_EFFICIENCY;
        const batteryRoundTrip = batterySpecs.chargeEfficiency * batterySpecs.dischargeEfficiency;
        const mpptEff = DEFAULTS.MPPT_EFFICIENCY;

        // PV losses
        const tempDelta = config.ambientTempMax - DEFAULTS.STC_TEMP;
        const pvTempDerating = Math.abs(-0.35 / 100 * tempDelta);
        const pvSoilingLoss = DEFAULTS.PV_SOILING_LOSS;
        const pvMismatchLoss = DEFAULTS.PV_MISMATCH_LOSS;

        // Cable losses (estimate from sizing results)
        const dcCableLoss = DEFAULTS.CABLE_LOSS_FACTOR;
        const acCableLoss = DEFAULTS.CABLE_LOSS_FACTOR / 2;

        // Total losses
        const totalDCLosses = pvTempDerating + pvSoilingLoss + pvMismatchLoss + dcCableLoss;
        const totalACLosses = acCableLoss + (1 - inverterEff);

        // Overall system efficiency
        const overallEfficiency = (1 - totalDCLosses) * batteryRoundTrip * inverterEff * (1 - acCableLoss);

        // Energy analysis
        const grossPVEnergy = pvDesign.dailyEnergyWh;
        const netAvailableEnergy = grossPVEnergy * overallEfficiency;
        const loadRequirement = aggregatedLoad.dailyEnergyWh;
        const energyMargin = ((netAvailableEnergy - loadRequirement) / loadRequirement) * 100;

        return {
            inverterEfficiency: Math.round(inverterEff * 1000) / 10,
            batteryRoundTripEfficiency: Math.round(batteryRoundTrip * 1000) / 10,
            mpptEfficiency: Math.round(mpptEff * 1000) / 10,
            pvTempDerating: Math.round(pvTempDerating * 1000) / 10,
            pvSoilingLoss: Math.round(pvSoilingLoss * 1000) / 10,
            pvMismatchLoss: Math.round(pvMismatchLoss * 1000) / 10,
            dcCableLoss: Math.round(dcCableLoss * 1000) / 10,
            acCableLoss: Math.round(acCableLoss * 1000) / 10,
            totalDCLosses: Math.round(totalDCLosses * 1000) / 10,
            totalACLosses: Math.round(totalACLosses * 1000) / 10,
            overallSystemEfficiency: Math.round(overallEfficiency * 1000) / 10,
            grossPVEnergyDaily: Math.round(grossPVEnergy),
            netAvailableEnergyDaily: Math.round(netAvailableEnergy),
            loadRequirementDaily: Math.round(loadRequirement),
            energyMarginPercent: Math.round(energyMargin * 10) / 10
        };
    }
};

/* =============================================================================
   PHASE 10: UPGRADE PATH ENGINE
   Comprehensive upgrade analysis with battery limits, MPPT expansion,
   cable/breaker reassessment, and load growth simulation
   ============================================================================= */

const UpgradeSimulator = {
    // Battery parallel limits by chemistry (manufacturer typical maximums)
    BATTERY_PARALLEL_LIMITS: {
        lifepo4: { maxParallel: 6, reason: 'LiFePO4 BMS synchronization limit — most manufacturers allow up to 6 units in parallel with CAN/RS485 communication' },
        agm: { maxParallel: 4, reason: 'AGM lead-acid — more than 4 parallel strings causes uneven charging and shortened lifespan due to current imbalance' },
        gel: { maxParallel: 4, reason: 'Gel batteries are sensitive to overcharge — more than 4 parallel strings makes balanced charging very difficult' },
        fla: { maxParallel: 4, reason: 'Flooded lead-acid — parallel strings must be identical age and capacity. More than 4 strings is impractical to maintain' }
    },

    /**
     * Generate comprehensive upgrade analysis for the current system design
     */
    analyzeUpgradePaths(results, panel, mppt, config) {
        const paths = [];
        const batteryChemistry = results.battery.chemistry;
        const battSpec = DEFAULTS.BATTERY_SPECS[batteryChemistry];
        const parallelLimit = this.BATTERY_PARALLEL_LIMITS[batteryChemistry] || { maxParallel: 4, reason: 'General safety limit' };

        // ---- 1. BATTERY EXPANSION ----
        const currentAh = results.battery.totalCapacityAh;
        const bankVoltage = results.battery.bankVoltage;
        const singleBattAh = results.battery.batteryAh || currentAh;
        const currentParallelStrings = results.battery.parallelStrings || 1;
        const maxAdditionalStrings = parallelLimit.maxParallel - currentParallelStrings;

        const batteryPath = {
            category: 'Battery Expansion',
            icon: '&#128267;',
            current: `${currentAh}Ah @ ${bankVoltage}V (${currentParallelStrings} parallel string${currentParallelStrings > 1 ? 's' : ''})`,
            options: []
        };

        if (maxAdditionalStrings > 0) {
            for (let add = 1; add <= Math.min(maxAdditionalStrings, 3); add++) {
                const newTotal = currentParallelStrings + add;
                const newAh = Math.round(singleBattAh * newTotal);
                const newKwh = Math.round(newAh * bankVoltage / 100) / 10;
                const usableKwh = Math.round(newKwh * battSpec.maxDoD * 10) / 10;
                const autonomyHrs = Math.round(usableKwh * 1000 / (results.aggregation.dailyEnergyWh / 24) * 10) / 10;

                batteryPath.options.push({
                    label: `Add ${add} battery string${add > 1 ? 's' : ''} (${newTotal} total)`,
                    detail: `${newAh}Ah / ${newKwh}kWh total (${usableKwh}kWh usable at ${battSpec.maxDoD * 100}% DoD)`,
                    impact: `Autonomy: ~${autonomyHrs} hours at current load`,
                    feasible: true,
                    notes: add === maxAdditionalStrings ? `This is the maximum for ${batteryChemistry.toUpperCase()} — ${parallelLimit.reason}` : null
                });
            }
        } else {
            batteryPath.options.push({
                label: 'Maximum parallel strings reached',
                detail: `${currentParallelStrings} of ${parallelLimit.maxParallel} parallel strings already in use`,
                impact: parallelLimit.reason,
                feasible: false,
                notes: `To increase capacity further: (1) Upgrade to higher Ah individual batteries, or (2) Switch to a ${bankVoltage === 48 ? 'higher voltage battery system' : '48V bank'} with larger per-unit capacity`
            });
        }
        paths.push(batteryPath);

        // ---- 2. PV ARRAY / PANEL EXPANSION ----
        const currentPanels = results.pvArray.totalPanels;
        const currentWatts = results.pvArray.arrayWattage;
        const pvPath = {
            category: 'PV Array Expansion',
            icon: '&#9728;',
            current: `${currentPanels} × ${panel.wattage}W = ${currentWatts}W`,
            options: []
        };

        // Check how many more panels the current MPPT can handle
        const tempDeltaCold = (config.ambientTempMin || 20) - DEFAULTS.STC_TEMP;
        const vocTempFactor = 1 + (panel.tempCoeffVoc / 100 * tempDeltaCold);
        const vocCold = panel.voc * vocTempFactor;
        const maxSeriesPerMPPT = Math.floor(mppt.maxVoltage / vocCold);
        const maxPanelsByPower = Math.floor(mppt.maxPower / panel.wattage);
        const maxPanelsByCurrent = Math.floor(mppt.maxCurrent / (panel.isc * 1.04));
        const maxPanelsOnCurrentMPPT = Math.min(maxSeriesPerMPPT * maxPanelsByCurrent, maxPanelsByPower);

        const roomOnCurrentMPPT = maxPanelsOnCurrentMPPT - currentPanels;

        if (roomOnCurrentMPPT > 0) {
            const addPanels = Math.min(roomOnCurrentMPPT, currentPanels); // up to doubling
            for (const addCount of [Math.min(2, roomOnCurrentMPPT), Math.min(4, roomOnCurrentMPPT), Math.min(roomOnCurrentMPPT, 8)].filter((v, i, a) => v > 0 && a.indexOf(v) === i)) {
                const newTotal = currentPanels + addCount;
                const newWatts = newTotal * panel.wattage;
                // Find best config for new total
                const bestCfg = ConfigurationComparisonEngine.compare(newTotal, panel, mppt, config);
                const rec = bestCfg.recommended >= 0 ? bestCfg.configurations[bestCfg.recommended] : null;

                pvPath.options.push({
                    label: `Add ${addCount} panels (${newTotal} total, ${newWatts}W)`,
                    detail: rec ? `Best config: ${rec.label} — Voc(cold): ${rec.stringVocCold}V, Isc: ${rec.arrayIsc}A` : 'No valid single-MPPT config found — add another MPPT',
                    impact: `+${Math.round(addCount * panel.wattage * config.avgPSH)}Wh/day estimated additional energy`,
                    feasible: rec !== null,
                    notes: rec ? null : 'Exceeds single MPPT capacity — requires additional MPPT controller'
                });
            }
        }

        // Suggest adding MPPT for larger expansions
        if (roomOnCurrentMPPT <= 2 || currentPanels >= maxPanelsOnCurrentMPPT * 0.8) {
            const additionalMPPTCapacity = 3000; // typical external MPPT
            const extraPanels = Math.floor(additionalMPPTCapacity / panel.wattage);
            pvPath.options.push({
                label: `Add external MPPT controller + ${extraPanels} panels`,
                detail: `New MPPT (e.g., 3000W / 60A / 150V) handling ${extraPanels} × ${panel.wattage}W = ${extraPanels * panel.wattage}W separately`,
                impact: `Total system: ${currentWatts + extraPanels * panel.wattage}W. Each MPPT tracks independently for maximum harvest.`,
                feasible: true,
                notes: 'Requires separate PV DC breaker and cabling for the new MPPT input. Both MPPTs charge the same battery bank.'
            });
        }
        paths.push(pvPath);

        // ---- 3. INVERTER UPGRADE ----
        const currentInvVA = results.inverter.recommendedSizeVA;
        const loadUtilization = Math.round(results.aggregation.designContinuousVA / currentInvVA * 100);
        const inverterPath = {
            category: 'Inverter Capacity',
            icon: '&#9889;',
            current: `${currentInvVA}VA (${loadUtilization}% utilized)`,
            options: []
        };

        if (loadUtilization > 70) {
            const sizes = [5000, 6000, 8000, 10000, 12000, 15000].filter(s => s > currentInvVA);
            sizes.slice(0, 2).forEach(size => {
                const newUtil = Math.round(results.aggregation.designContinuousVA / size * 100);
                inverterPath.options.push({
                    label: `Upgrade to ${size}VA inverter`,
                    detail: `Load utilization drops to ${newUtil}%. Surge capacity: ${Math.round(size * (config.inverterSurgeMultiplier || 2))}VA`,
                    impact: `Can add ~${Math.round((size - results.aggregation.designContinuousVA) * 0.8)}VA more loads before next upgrade`,
                    feasible: true,
                    notes: size > 5000 && bankVoltage < 48 ? 'Inverters above 5kVA typically require 48V DC bus' : null
                });
            });
        } else {
            inverterPath.options.push({
                label: 'No inverter upgrade needed currently',
                detail: `Running at ${loadUtilization}% — plenty of headroom`,
                impact: `Can add ~${Math.round((currentInvVA - results.aggregation.designContinuousVA) * 0.8)}VA more loads on current inverter`,
                feasible: true,
                notes: null
            });
        }
        paths.push(inverterPath);

        // ---- 4. CABLE & BREAKER REASSESSMENT ----
        const protectionPath = {
            category: 'Cables & Protection',
            icon: '&#128268;',
            current: 'Sized for current system',
            options: []
        };

        // If panels expand, PV cable may need upgrade
        if (roomOnCurrentMPPT > 0) {
            const futureIsc = (currentPanels + Math.min(roomOnCurrentMPPT, 4)) * panel.isc * 1.04 / maxSeriesPerMPPT;
            protectionPath.options.push({
                label: 'PV DC Cable & Breaker',
                detail: `Current array Isc: ${results.pvArray.arrayIsc}A. After adding panels: up to ${futureIsc.toFixed(1)}A`,
                impact: futureIsc > results.pvArray.arrayIsc * 1.3 ? 'May need thicker PV DC cable and larger breaker' : 'Current cabling should be sufficient',
                feasible: true,
                notes: 'Always verify cable ampacity after adding panels. String fuses required when parallel strings > 1.'
            });
        }

        // Battery cable with more parallel strings
        if (maxAdditionalStrings > 0) {
            const futureDischarge = (currentParallelStrings + 1) * singleBattAh * (battSpec.maxDischargeRate || 0.5);
            protectionPath.options.push({
                label: 'Battery DC Cable & MCCB',
                detail: `Adding battery strings increases max discharge current to ~${Math.round(futureDischarge)}A`,
                impact: futureDischarge > results.battery.maxDischargeCurrent * 1.2 ? 'Battery MCCB and cables will need upgrading' : 'Current battery protection should handle one additional string',
                feasible: true,
                notes: 'Each parallel battery string should have its own fuse. Battery MCCB must be rated for total bank discharge current.'
            });
        }
        paths.push(protectionPath);

        // ---- 5. LOAD GROWTH SCENARIOS ----
        const loadGrowthPath = {
            category: 'Load Growth Scenarios',
            icon: '&#128200;',
            current: `${Math.round(results.aggregation.dailyEnergyWh)}Wh/day, ${Math.round(results.aggregation.peakSimultaneousVA)}VA peak`,
            options: []
        };

        // Common load additions
        const commonAdditions = [
            { name: 'Air Conditioner (1HP)', watts: 1000, hours: 6, surge: 3 },
            { name: 'Electric Iron (2kW)', watts: 2000, hours: 0.5, surge: 1 },
            { name: 'Washing Machine', watts: 500, hours: 1, surge: 3 },
            { name: 'Microwave Oven', watts: 1200, hours: 0.5, surge: 1.2 },
            { name: 'Desktop Computer + Monitor', watts: 350, hours: 8, surge: 1.5 }
        ];

        for (const load of commonAdditions) {
            const addedWh = load.watts * load.hours;
            const newDailyWh = results.aggregation.dailyEnergyWh + addedWh;
            const newPeakVA = results.aggregation.peakSimultaneousVA + load.watts * load.surge;
            const invOk = newPeakVA <= currentInvVA * (config.inverterSurgeMultiplier || 2);
            const battOk = newDailyWh <= results.battery.totalCapacityWh * battSpec.maxDoD;
            const pvOk = newDailyWh <= results.pvArray.dailyEnergyWh * 0.9;

            const issues = [];
            if (!invOk) issues.push('Inverter surge capacity exceeded');
            if (!battOk) issues.push('Battery storage insufficient for autonomy');
            if (!pvOk) issues.push('PV array undersized for new daily energy');

            loadGrowthPath.options.push({
                label: `Add ${load.name} (${load.watts}W, ${load.hours}h/day)`,
                detail: `New daily energy: ${Math.round(newDailyWh)}Wh (+${Math.round(addedWh)}Wh). Peak VA with surge: ${Math.round(newPeakVA)}VA`,
                impact: issues.length === 0 ? 'System can handle this addition without upgrades' : `Requires upgrades: ${issues.join(', ')}`,
                feasible: issues.length === 0,
                notes: null
            });
        }
        paths.push(loadGrowthPath);

        return paths;
    }
};

/* =============================================================================
   CONFIGURATION COMPARISON ENGINE
   Generates and scores all valid panel configurations
   ============================================================================= */

const ConfigurationComparisonEngine = {
    /**
     * Generate all valid configurations for given panel count + MPPT specs
     */
    compare(
        numPanels: number,
        panel: EnginePanelSpec,
        mppt: EngineMPPTSpec,
        config: EngineSystemConfig
    ): EngineConfigurationComparisonResult {
        const configs: EnginePanelConfigurationResult[] = [];
        const seen = new Set<string>(); // track unique S×P combos to avoid duplicates
        const tempDeltaCold = (config.ambientTempMin || 20) - DEFAULTS.STC_TEMP;
        const vocTempFactor = 1 + (panel.tempCoeffVoc / 100 * tempDeltaCold);
        const vocCold = panel.voc * vocTempFactor;

        // Isc with tolerance (typical +4% for real panels)
        const iscTolerance = panel.isc * 1.04;

        // Determine feasible series range — use actual limits, not reduced
        const absMaxSeries = Math.floor(mppt.maxVoltage / vocCold);
        const absMinSeries = Math.max(1, Math.ceil((mppt.minVoltage || 60) / panel.vmp));

        // Try both ceil and floor for parallel count to find configs using
        // exact, fewer, or slightly more panels than requested
        const parallelCandidates = (s: number): number[] => {
            const candidates = new Set<number>();
            const pCeil = Math.ceil(numPanels / s);
            const pFloor = Math.floor(numPanels / s);
            if (pCeil >= 1) candidates.add(pCeil);
            if (pFloor >= 1) candidates.add(pFloor);
            candidates.add(1); // always try single string
            return [...candidates];
        };

        for (let s = absMinSeries; s <= Math.min(absMaxSeries, numPanels); s++) {
            for (const p of parallelCandidates(s)) {
            const key = `${s}x${p}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const actualPanels = s * p;

            const stringVmp = Math.round(s * panel.vmp * 100) / 100;
            const stringVoc = Math.round(s * panel.voc * 100) / 100;
            const stringVocCold = Math.round(s * vocCold * 100) / 100;
            const arrayImp = Math.round(p * panel.imp * 100) / 100;
            const arrayIsc = Math.round(p * panel.isc * 100) / 100;
            const arrayIscTol = Math.round(p * iscTolerance * 100) / 100;
            const totalPower = actualPanels * panel.wattage;

            // All checks
            const vocOk = stringVocCold < mppt.maxVoltage;
            const vmpMaxOk = stringVmp <= (mppt.maxOperatingVoltage || mppt.maxVoltage * 0.9);
            const vmpMinOk = stringVmp >= (mppt.minVoltage || 60);
            const currentOk = arrayIscTol <= mppt.maxCurrent;
            const powerOk = totalPower <= mppt.maxPower;
            const startupOk = stringVmp >= (mppt.minVoltage || 60);
            const valid = vocOk && vmpMaxOk && vmpMinOk && currentOk && powerOk && startupOk;

            // Score (higher = better, only for valid configs)
            const vocMargin = vocOk ? Math.round((1 - stringVocCold / mppt.maxVoltage) * 1000) / 10 : 0;
            const currentMargin = currentOk ? Math.round((1 - arrayIscTol / mppt.maxCurrent) * 1000) / 10 : 0;
            const powerUtil = Math.round(totalPower / mppt.maxPower * 1000) / 10;
            const extraPanelPenalty = Math.abs(actualPanels - numPanels) * 10;

            let score = 0;
            if (valid) {
                score = vocMargin * 0.3 + currentMargin * 0.3 + (100 - Math.abs(powerUtil - 70)) * 0.2 - extraPanelPenalty;
            }

            // Generate pros/cons
            const pros = [];
            const cons = [];

            if (p === 1) {
                pros.push('Simpler wiring - single string, no combiner needed');
                pros.push('Lower current - easier on cables and connectors');
                cons.push('No redundancy - shading one panel affects entire string');
            } else if (p === 2) {
                pros.push('Redundancy - if one string is shaded, other still produces');
                cons.push('Higher total current - needs thicker cables');
                if (currentMargin < 15) cons.push('Current very close to input limit');
            } else {
                pros.push('Good redundancy across multiple strings');
                cons.push('Complex wiring - combiner box recommended');
                cons.push('Higher current requires attention to cable sizing');
            }

            if (vocMargin > 20) pros.push(`Good voltage headroom (${vocMargin}% below Voc limit)`);
            else if (vocMargin < 10 && vocOk) cons.push(`Tight voltage headroom (only ${vocMargin}%)`);

            if (stringVmp > 200) pros.push('Higher string voltage = lower current losses in cables');
            if (actualPanels > numPanels) cons.push(`Needs ${actualPanels - numPanels} extra panel(s) to fill configuration`);
            if (actualPanels === numPanels) pros.push('Uses exact panel count - no waste');
            if (!currentOk) cons.push(`FAILS: Array Isc ${arrayIscTol}A exceeds ${mppt.maxCurrent}A max input`);
            if (!vocOk) cons.push(`FAILS: String Voc(cold) ${stringVocCold}V exceeds ${mppt.maxVoltage}V limit`);
            if (!vmpMaxOk) cons.push(`FAILS: String Vmp ${stringVmp}V exceeds ${mppt.maxOperatingVoltage}V operating max`);
            if (!powerOk) cons.push(`FAILS: Total ${totalPower}W exceeds ${mppt.maxPower}W max input`);

            configs.push({
                label: `${s}S x ${p}P`,
                series: s,
                parallel: p,
                totalPanels: actualPanels,
                stringVmp, stringVoc, stringVocCold,
                arrayImp, arrayIsc, arrayIscTol, totalPower,
                valid, score,
                checks: { vocOk, vmpMaxOk, vmpMinOk, currentOk, powerOk, startupOk },
                margins: { vocMargin, currentMargin, powerUtil },
                pros, cons
            });
            } // end inner for (parallelCandidates)
        } // end outer for (series)

        // Sort: valid first (by score desc), then invalid
        configs.sort((a, b) => {
            if (a.valid && !b.valid) return -1;
            if (!a.valid && b.valid) return 1;
            return b.score - a.score;
        });

        // Mark recommended
        if (configs.length > 0 && configs[0].valid) {
            configs[0].recommended = true;
        }

        // If no valid config found for this panel count, search nearby counts
        let nearbyValid: EngineNearbyPanelConfiguration[] | null = null;
        if (!configs.some(c => c.valid)) {
            nearbyValid = this.findNearbyValidConfig(numPanels, panel, mppt, config);
        }

        return {
            configurations: configs,
            recommended: configs.findIndex(c => c.recommended),
            userConfig: null,
            nearbyValid
        };
    },

    /**
     * Search nearby panel counts to find valid configurations
     * when the exact count yields nothing valid.
     * Uses dynamic range based on panel count to handle large arrays.
     */
    findNearbyValidConfig(
        numPanels: number,
        panel: EnginePanelSpec,
        mppt: EngineMPPTSpec,
        config: EngineSystemConfig
    ): EngineNearbyPanelConfiguration[] | null {
        const tempDeltaCold = (config.ambientTempMin || 20) - DEFAULTS.STC_TEMP;
        const vocTempFactor = 1 + (panel.tempCoeffVoc / 100 * tempDeltaCold);
        const vocCold = panel.voc * vocTempFactor;
        const iscTolerance = panel.isc * 1.04;
        const results: EngineNearbyPanelConfiguration[] = [];
        const seen = new Set<string>();

        // Dynamic range: search far enough to always find valid configs
        // For large panel counts, the nearest valid config may be far away
        const searchRange = Math.max(20, numPanels);

        for (let delta = -searchRange; delta <= searchRange; delta++) {
            if (delta === 0) continue;
            const tryCount = numPanels + delta;
            if (tryCount < 1) continue;

            const absMaxSeries = Math.floor(mppt.maxVoltage / vocCold);
            const absMinSeries = Math.max(1, Math.ceil((mppt.minVoltage || 60) / panel.vmp));

            for (let s = absMinSeries; s <= Math.min(absMaxSeries, tryCount); s++) {
                // Try both ceil and floor for parallel, plus single string
                const pCeil = Math.ceil(tryCount / s);
                const pFloor = Math.floor(tryCount / s);
                const pCandidates = new Set<number>();
                if (pCeil >= 1) pCandidates.add(pCeil);
                if (pFloor >= 1) pCandidates.add(pFloor);
                pCandidates.add(1);

                for (const p of pCandidates) {
                    const key = `${s}x${p}`;
                    if (seen.has(key)) continue;
                    seen.add(key);

                    const actualPanels = s * p;
                    const actualDelta = actualPanels - numPanels;

                    const stringVmp = Math.round(s * panel.vmp * 100) / 100;
                    const stringVocCold = Math.round(s * vocCold * 100) / 100;
                    const arrayIscTol = Math.round(p * iscTolerance * 100) / 100;
                    const totalPower = actualPanels * panel.wattage;

                    const vocOk = stringVocCold < mppt.maxVoltage;
                    const vmpMaxOk = stringVmp <= (mppt.maxOperatingVoltage || mppt.maxVoltage * 0.9);
                    const vmpMinOk = stringVmp >= (mppt.minVoltage || 60);
                    const currentOk = arrayIscTol <= mppt.maxCurrent;
                    const powerOk = totalPower <= mppt.maxPower;
                    const valid = vocOk && vmpMaxOk && vmpMinOk && currentOk && powerOk;

                    if (valid) {
                        const vocMargin = Math.round((1 - stringVocCold / mppt.maxVoltage) * 1000) / 10;
                        const currentMargin = Math.round((1 - arrayIscTol / mppt.maxCurrent) * 1000) / 10;
                        results.push({
                            label: `${s}S x ${p}P`,
                            series: s,
                            parallel: p,
                            totalPanels: actualPanels,
                            requestedPanels: tryCount,
                            delta: actualDelta,
                            stringVmp,
                            stringVocCold,
                            arrayIscTol,
                            totalPower,
                            vocMargin,
                            currentMargin,
                            powerUtil: Math.round(totalPower / mppt.maxPower * 1000) / 10
                        });
                    }
                }
            }
        }

        if (results.length === 0) return null;

        // Sort by: closest to target panel count, then by best margins
        results.sort((a, b) => {
            const aDist = Math.abs(a.delta);
            const bDist = Math.abs(b.delta);
            if (aDist !== bDist) return aDist - bDist;
            return (b.vocMargin + b.currentMargin) - (a.vocMargin + a.currentMargin);
        });

        // Deduplicate by totalPanels (keep best margin per panel count)
        const seenCounts = new Set<number>();
        const deduped: EngineNearbyPanelConfiguration[] = [];
        for (const r of results) {
            if (!seenCounts.has(r.totalPanels)) {
                seenCounts.add(r.totalPanels);
                deduped.push(r);
            }
            if (deduped.length >= 5) break;
        }

        return deduped;
    },

    /**
     * Validate a specific user-chosen configuration
     */
    validateUserConfig(
        series: number,
        parallel: number,
        numPanels: number,
        panel: EnginePanelSpec,
        mppt: EngineMPPTSpec,
        config: EngineSystemConfig
    ): EnginePanelConfigurationResult {
        const tempDeltaCold = (config.ambientTempMin || 20) - DEFAULTS.STC_TEMP;
        const vocTempFactor = 1 + (panel.tempCoeffVoc / 100 * tempDeltaCold);
        const vocCold = panel.voc * vocTempFactor;
        const iscTolerance = panel.isc * 1.04;

        const actualPanels = series * parallel;
        const stringVmp = Math.round(series * panel.vmp * 100) / 100;
        const stringVoc = Math.round(series * panel.voc * 100) / 100;
        const stringVocCold = Math.round(series * vocCold * 100) / 100;
        const arrayImp = Math.round(parallel * panel.imp * 100) / 100;
        const arrayIsc = Math.round(parallel * panel.isc * 100) / 100;
        const arrayIscTol = Math.round(parallel * iscTolerance * 100) / 100;
        const totalPower = actualPanels * panel.wattage;

        const checks = {
            vocOk: stringVocCold < mppt.maxVoltage,
            vmpMaxOk: stringVmp <= (mppt.maxOperatingVoltage || mppt.maxVoltage * 0.9),
            vmpMinOk: stringVmp >= (mppt.minVoltage || 60),
            currentOk: arrayIscTol <= mppt.maxCurrent,
            powerOk: totalPower <= mppt.maxPower,
            startupOk: stringVmp >= (mppt.minVoltage || 60),
            panelCountOk: actualPanels >= numPanels
        };

        const valid = checks.vocOk && checks.vmpMaxOk && checks.vmpMinOk && checks.currentOk && checks.powerOk && checks.startupOk;

        const warnings = [];
        const blocks = [];

        if (!checks.vocOk) blocks.push(`HARD BLOCK: String Voc(cold) = ${stringVocCold}V EXCEEDS ${mppt.maxVoltage}V max. Risk of equipment damage.`);
        if (!checks.currentOk) blocks.push(`HARD BLOCK: Array Isc (with tolerance) = ${arrayIscTol}A EXCEEDS ${mppt.maxCurrent}A max input current.`);
        if (!checks.vmpMaxOk) blocks.push(`String Vmp = ${stringVmp}V exceeds MPPT operating max ${mppt.maxOperatingVoltage}V. MPPT cannot track properly.`);
        if (!checks.vmpMinOk) warnings.push(`String Vmp = ${stringVmp}V is below min startup voltage ${mppt.minVoltage}V. System may not start in low light.`);
        if (!checks.powerOk) warnings.push(`Total array power ${totalPower}W exceeds max input ${mppt.maxPower}W. Inverter will clip — not dangerous but wastes panels.`);
        if (actualPanels > numPanels) warnings.push(`Configuration uses ${actualPanels} panels but you specified ${numPanels}. You need ${actualPanels - numPanels} additional panel(s).`);
        if (actualPanels < numPanels) warnings.push(`Configuration uses ${actualPanels} of ${numPanels} panels. ${numPanels - actualPanels} panel(s) unused.`);

        const vocMargin = checks.vocOk ? Math.round((1 - stringVocCold / mppt.maxVoltage) * 1000) / 10 : 0;
        const currentMargin = checks.currentOk ? Math.round((1 - arrayIscTol / mppt.maxCurrent) * 1000) / 10 : 0;
        const powerUtil = Math.round(totalPower / mppt.maxPower * 1000) / 10;
        const score = valid
            ? vocMargin * 0.3 + currentMargin * 0.3 + (100 - Math.abs(powerUtil - 70)) * 0.2 - Math.abs(actualPanels - numPanels) * 10
            : 0;

        return {
            label: `${series}S x ${parallel}P`,
            series, parallel, totalPanels: actualPanels,
            stringVmp, stringVoc, stringVocCold,
            arrayImp, arrayIsc, arrayIscTol, totalPower,
            valid, score, checks,
            margins: { vocMargin, currentMargin, powerUtil },
            vocMargin, currentMargin, powerUtil,
            warnings, blocks
        };
    }
};

/* =============================================================================
   MULTI-MPPT PANEL DISTRIBUTION ENGINE
   Intelligently distributes panels across multiple MPPT inputs
   ============================================================================= */

const MultiMPPTDistributor = {
    /**
     * Distribute numPanels across multiple MPPTs, finding the best valid config per MPPT.
     * Returns null if only 1 MPPT (handled by normal ConfigurationComparisonEngine).
     *
     * Strategy:
     * 1. Try to split panels evenly across MPPTs
     * 2. If uneven, give more to the MPPT with higher power capacity
     * 3. For each MPPT, find the best valid S×P configuration
     * 4. Score the overall distribution and return top options
     */
    distribute(
        numPanels: number,
        panel: EnginePanelSpec,
        mppt: EngineMPPTSpec,
        config: EngineSystemConfig
    ): EngineMultiMPPTDistributionResult | null {
        if (!mppt.allMPPTs || mppt.allMPPTs.length <= 1) return null;

        const allMPPTs = mppt.allMPPTs;
        const mpptCount = allMPPTs.length;
        const results: EngineMultiMPPTDistributionCandidate[] = [];

        // Generate candidate distributions
        const distributions = this.generateDistributions(numPanels, mpptCount, allMPPTs, panel);

        for (const dist of distributions) {
            const mpptAssignments: EngineMPPTAssignment[] = [];
            let allValid = true;
            let totalScore = 0;
            let totalActualPanels = 0;

            for (let i = 0; i < mpptCount; i++) {
                const panelsForThisMPPT = dist[i];
                if (panelsForThisMPPT === 0) {
                    mpptAssignments.push({
                        mpptLabel: allMPPTs[i].label,
                        mpptIndex: i,
                        panels: 0,
                        series: 0,
                        parallel: 0,
                        config: null,
                        valid: true,
                        unused: true
                    });
                    continue;
                }

                // Find best valid config for this MPPT with its own limits
                const bestConfig = this.findBestConfigForMPPT(panelsForThisMPPT, panel, allMPPTs[i], config);

                if (bestConfig && bestConfig.valid) {
                    mpptAssignments.push({
                        mpptLabel: allMPPTs[i].label,
                        mpptIndex: i,
                        panels: bestConfig.totalPanels,
                        requestedPanels: panelsForThisMPPT,
                        series: bestConfig.series,
                        parallel: bestConfig.parallel,
                        config: bestConfig,
                        valid: true,
                        unused: false
                    });
                    totalScore += bestConfig.score;
                    totalActualPanels += bestConfig.totalPanels;
                } else {
                    // Find the least-invalid config
                    const leastBad = this.findBestConfigForMPPT(panelsForThisMPPT, panel, allMPPTs[i], config, true);
                    mpptAssignments.push({
                        mpptLabel: allMPPTs[i].label,
                        mpptIndex: i,
                        panels: panelsForThisMPPT,
                        requestedPanels: panelsForThisMPPT,
                        series: leastBad ? leastBad.series : 0,
                        parallel: leastBad ? leastBad.parallel : 0,
                        config: leastBad,
                        valid: false,
                        unused: false,
                        violations: leastBad ? leastBad.violations : ['No valid configuration possible']
                    });
                    allValid = false;
                    totalActualPanels += panelsForThisMPPT;
                }
            }

            // Penalize for deviation from requested panel count
            const panelDeviation = Math.abs(totalActualPanels - numPanels);

            results.push({
                distribution: dist,
                mpptAssignments,
                allValid,
                totalActualPanels,
                requestedPanels: numPanels,
                panelDeviation,
                totalScore: allValid ? totalScore - panelDeviation * 5 : -1000,
                label: mpptAssignments.map(a => a.unused ? `${a.mpptLabel}: unused` : `${a.mpptLabel}: ${a.series}S×${a.parallel}P (${a.panels})`).join(' | ')
            });
        }

        // Sort: all-valid first, then by score desc
        results.sort((a, b) => {
            if (a.allValid && !b.allValid) return -1;
            if (!a.allValid && b.allValid) return 1;
            return b.totalScore - a.totalScore;
        });

        // Mark best as recommended
        if (results.length > 0 && results[0].allValid) {
            results[0].recommended = true;
        }

        return {
            distributions: results.slice(0, 6),
            recommended: results[0] && results[0].allValid ? 0 : -1,
            mpptCount,
            totalPanelsRequested: numPanels
        };
    },

    /**
     * Generate candidate panel distributions across MPPTs.
     * Tries: even split, weighted by power capacity, and various offsets.
     */
    generateDistributions(
        numPanels: number,
        mpptCount: number,
        allMPPTs: EngineMPPTInputSpec[],
        panel: EnginePanelSpec
    ): number[][] {
        const distributions: number[][] = [];
        const seen = new Set<string>();

        const addDist = (d: number[]) => {
            const key = d.join(',');
            if (!seen.has(key) && d.every(v => v >= 0)) {
                seen.add(key);
                distributions.push([...d]);
            }
        };

        // Even split
        const basePerMPPT = Math.floor(numPanels / mpptCount);
        const remainder = numPanels % mpptCount;
        const evenDist = Array(mpptCount).fill(basePerMPPT);
        for (let r = 0; r < remainder; r++) evenDist[r]++;
        addDist(evenDist);

        // Reverse even (give remainder to last MPPTs)
        const evenDist2 = Array(mpptCount).fill(basePerMPPT);
        for (let r = 0; r < remainder; r++) evenDist2[mpptCount - 1 - r]++;
        addDist(evenDist2);

        // Weighted by max power capacity
        const totalPower = allMPPTs.reduce((s, m) => s + m.maxPower, 0);
        const weightedDist = allMPPTs.map(m => Math.round(numPanels * m.maxPower / totalPower));
        const wSum = weightedDist.reduce((s, v) => s + v, 0);
        if (wSum !== numPanels) weightedDist[0] += (numPanels - wSum);
        addDist(weightedDist);

        // Try all panels on primary, rest on secondary, etc.
        for (let i = 0; i < mpptCount; i++) {
            // Put maximum on one MPPT, distribute rest
            const maxPanelsForI = Math.floor(allMPPTs[i].maxPower / panel.wattage);
            const forI = Math.min(numPanels, maxPanelsForI);
            const rest = numPanels - forI;

            if (mpptCount === 2) {
                const d = [0, 0];
                d[i] = forI;
                d[1 - i] = rest;
                addDist(d);
            } else if (mpptCount === 3) {
                // Split rest evenly among other two
                const others = [0, 1, 2].filter(j => j !== i);
                const halfRest = Math.floor(rest / 2);
                const d = [0, 0, 0];
                d[i] = forI;
                d[others[0]] = halfRest;
                d[others[1]] = rest - halfRest;
                addDist(d);
            }
        }

        // Try offsets: move 1-3 panels between MPPTs
        for (let offset = 1; offset <= Math.min(3, basePerMPPT); offset++) {
            for (let from = 0; from < mpptCount; from++) {
                for (let to = 0; to < mpptCount; to++) {
                    if (from === to) continue;
                    const d = [...evenDist];
                    d[from] -= offset;
                    d[to] += offset;
                    if (d[from] >= 0) addDist(d);
                }
            }
        }

        return distributions;
    },

    /**
     * Find the best valid S×P configuration for a given number of panels on a single MPPT.
     * If includeBest is true, returns the least-invalid config when none are valid.
     */
    findBestConfigForMPPT(
        numPanels: number,
        panel: EnginePanelSpec,
        mpptSpec: EngineMPPTInputSpec,
        config: EngineSystemConfig,
        includeBest = false
    ): EnginePanelConfigurationResult | null {
        const tempDeltaCold = (config.ambientTempMin || 20) - DEFAULTS.STC_TEMP;
        const vocTempFactor = 1 + (panel.tempCoeffVoc / 100 * tempDeltaCold);
        const vocCold = panel.voc * vocTempFactor;
        const iscTolerance = panel.isc * 1.04;

        const absMaxSeries = Math.floor(mpptSpec.maxVoltage / vocCold);
        const absMinSeries = Math.max(1, Math.ceil((mpptSpec.minVoltage || 60) / panel.vmp));

        let bestValid: EnginePanelConfigurationResult | null = null;
        let bestInvalid: EnginePanelConfigurationResult | null = null;
        let bestValidScore = -Infinity;
        let leastViolations = Infinity;

        for (let s = absMinSeries; s <= Math.min(absMaxSeries, numPanels); s++) {
            // Try both ceil and floor for parallel
            const pCandidates = new Set<number>();
            pCandidates.add(Math.ceil(numPanels / s));
            const pf = Math.floor(numPanels / s);
            if (pf >= 1) pCandidates.add(pf);
            pCandidates.add(1);

            for (const p of pCandidates) {
                const actualPanels = s * p;
                const stringVmp = Math.round(s * panel.vmp * 100) / 100;
                const stringVocCold = Math.round(s * vocCold * 100) / 100;
                const arrayIscTol = Math.round(p * iscTolerance * 100) / 100;
                const totalPower = actualPanels * panel.wattage;

                const vocOk = stringVocCold < mpptSpec.maxVoltage;
                const vmpMaxOk = stringVmp <= (mpptSpec.maxOperatingVoltage || mpptSpec.maxVoltage * 0.9);
                const vmpMinOk = stringVmp >= (mpptSpec.minVoltage || 60);
                const currentOk = arrayIscTol <= mpptSpec.maxCurrent;
                const powerOk = totalPower <= mpptSpec.maxPower;
                const valid = vocOk && vmpMaxOk && vmpMinOk && currentOk && powerOk;

                const vocMargin = vocOk ? Math.round((1 - stringVocCold / mpptSpec.maxVoltage) * 1000) / 10 : 0;
                const currentMargin = currentOk ? Math.round((1 - arrayIscTol / mpptSpec.maxCurrent) * 1000) / 10 : 0;
                const panelDev = Math.abs(actualPanels - numPanels);

                const score = valid ?
                    vocMargin * 0.3 + currentMargin * 0.3 + (100 - Math.abs(totalPower / mpptSpec.maxPower * 100 - 70)) * 0.2 - panelDev * 10
                    : 0;

                if (valid && score > bestValidScore) {
                    bestValidScore = score;
                    bestValid = {
                        series: s, parallel: p, totalPanels: actualPanels,
                        stringVmp, stringVocCold, arrayIscTol, totalPower,
                        valid: true, score, vocMargin, currentMargin,
                        label: `${s}S×${p}P`,
                        powerUtil: Math.round(totalPower / mpptSpec.maxPower * 1000) / 10
                    };
                }

                if (!valid && includeBest) {
                    const violations = [];
                    if (!vocOk) violations.push(`Voc(cold) ${stringVocCold}V > ${mpptSpec.maxVoltage}V`);
                    if (!vmpMaxOk) violations.push(`Vmp ${stringVmp}V > ${mpptSpec.maxOperatingVoltage}V`);
                    if (!vmpMinOk) violations.push(`Vmp ${stringVmp}V < ${mpptSpec.minVoltage}V`);
                    if (!currentOk) violations.push(`Isc ${arrayIscTol}A > ${mpptSpec.maxCurrent}A`);
                    if (!powerOk) violations.push(`Power ${totalPower}W > ${mpptSpec.maxPower}W`);

                    if (violations.length < leastViolations || (violations.length === leastViolations && panelDev < Math.abs((bestInvalid ? bestInvalid.totalPanels : 0) - numPanels))) {
                        leastViolations = violations.length;
                        bestInvalid = {
                            series: s, parallel: p, totalPanels: actualPanels,
                            stringVmp, stringVocCold, arrayIscTol, totalPower,
                            valid: false, score: -1000, vocMargin: 0, currentMargin: 0,
                            label: `${s}S×${p}P`, violations,
                            powerUtil: Math.round(totalPower / mpptSpec.maxPower * 1000) / 10
                        };
                    }
                }
            }
        }

        return bestValid || (includeBest ? bestInvalid : null);
    }
};

/* =============================================================================
   SMART ADVISORY ENGINE
   Practical, installer-level advice grounded in real-world experience
   ============================================================================= */

const SmartAdvisoryEngine = {
    generate(results) {
        const advisories = [];
        const appliances = LoadEngine.appliances || [];
        const agg = results.aggregation;
        const inv = results.inverter;
        const batt = results.battery;
        const pv = results.pvArray;
        const config = results.config;
        const mppt = results.mpptValidation;

        // ---- LOAD MANAGEMENT ----

        // Identify load categories
        const heavyLoads = appliances.filter(a => a.ratedPowerW * a.quantity > 800);
        const motorLoads = appliances.filter(a => a.loadType === 'motor');
        const resistiveLoads = appliances.filter(a => a.loadType === 'resistive' && a.ratedPowerW * a.quantity >= 1000);
        const cookerLoads = appliances.filter(a => a.loadType === 'resistive' && a.ratedPowerW * a.quantity >= 1500 &&
            /cook|stove|hot\s*plate|oven|ring/i.test(a.name));
        const ironHeaterLoads = appliances.filter(a => a.loadType === 'resistive' && a.ratedPowerW * a.quantity >= 1000 &&
            /iron|heater|heat/i.test(a.name) && !/cook|stove|hot\s*plate|oven/i.test(a.name));

        // Simultaneous motor warning
        if (motorLoads.length >= 2) {
            const combinedSurge = motorLoads.reduce((sum, m) => sum + m.ratedPowerW * m.quantity * m.surgeFactor, 0);
            advisories.push({
                category: 'Load Management',
                severity: 'warning',
                title: 'Multiple Motors Detected',
                message: `You have ${motorLoads.length} motor loads (${motorLoads.map(m => m.name).join(', ')}). Combined startup surge is ${Math.round(combinedSurge)}VA. Do NOT start them at the same time — stagger startup by at least 30 seconds to avoid tripping the inverter.`
            });
        }

        // Individual heavy motor warning
        motorLoads.forEach(m => {
            const motorVA = m.ratedPowerW * m.quantity;
            const pctOfInverter = Math.round(motorVA / inv.continuousVARequired * 100);
            if (pctOfInverter > 30) {
                advisories.push({
                    category: 'Load Management',
                    severity: 'info',
                    title: `Heavy Motor: ${m.name}`,
                    message: `${m.name} (${motorVA}W) uses ${pctOfInverter}% of your continuous load capacity. Run ONLY during peak sun hours (10am-3pm). Turn off by 4:00pm at the latest to preserve battery for evening.`
                });
            }
        });

        // ---- HEATING / COOKING APPLIANCE WARNINGS ----

        // Cooker — absolute prohibition on solar
        cookerLoads.forEach(c => {
            const watts = c.ratedPowerW * c.quantity;
            advisories.push({
                category: 'Heating Appliances',
                severity: 'critical',
                title: `Electric Cooker: ${c.name} (${watts}W)`,
                message: `Electric cookers, hot plates, and ovens draw ${watts}W+ continuously for long periods. This is NOT practical on solar — even at peak sun, cooking drains the battery faster than panels can replenish. STRONGLY ADVISED: Use gas for cooking. This single change can reduce your daily energy consumption by 30-50% and dramatically extend battery life.`
            });
        });

        // Iron / Heater — rare use at peak sun only
        ironHeaterLoads.forEach(r => {
            const watts = r.ratedPowerW * r.quantity;
            advisories.push({
                category: 'Heating Appliances',
                severity: 'warning',
                title: `${r.name} (${watts}W) — Peak Sun Only`,
                message: `Use ${r.name} ONLY between 11am-1pm when solar output peaks. Keep sessions under 30 minutes. Turn off ALL other heavy loads (AC, pump, washing machine) while ironing/heating. Never use on cloudy days or after 2pm. This is a rare-use appliance on solar, not daily.`
            });
        });

        // Other resistive loads (kettle, etc.)
        resistiveLoads.filter(r =>
            !cookerLoads.includes(r) && !ironHeaterLoads.includes(r)
        ).forEach(r => {
            const watts = r.ratedPowerW * r.quantity;
            if (watts >= 2000) {
                advisories.push({
                    category: 'Heating Appliances',
                    severity: 'critical',
                    title: `Heavy Resistive Load: ${r.name} (${watts}W)`,
                    message: `${r.name} draws ${watts}W — nearly as much as a cooker. Use only briefly during peak sun (11am-1pm) and never with other heavy loads. Consider alternatives: gas kettle, solar water heater, etc.`
                });
            } else {
                advisories.push({
                    category: 'Heating Appliances',
                    severity: 'warning',
                    title: `Heating Appliance: ${r.name} (${watts}W)`,
                    message: `Schedule ${r.name} during daytime (10am-2pm) when panels are generating. Never run simultaneously with AC, pump, or washing machine.`
                });
            }
        });

        // ---- BATTERY GUIDANCE ----

        const batteryWh = batt.totalCapacityWh || (batt.totalCapacityAh * batt.bankVoltage);
        const usableBatteryWh = Math.round(batteryWh * (DEFAULTS.BATTERY_SPECS[batt.chemistry || 'lifepo4'].maxDoD));
        const dailyEnergy = agg.dailyEnergyWh;
        const batteryRatio = usableBatteryWh / dailyEnergy;
        const chemistry = batt.chemistry || 'lifepo4';
        const specs = DEFAULTS.BATTERY_SPECS[chemistry] || DEFAULTS.BATTERY_SPECS.lifepo4;

        if (batteryRatio < 0.6) {
            advisories.push({
                category: 'Battery',
                severity: 'warning',
                title: 'Limited Battery Storage',
                message: `Your battery stores ~${usableBatteryWh}Wh usable (${Math.round(batteryRatio * 100)}% of your ${dailyEnergy.toFixed(0)}Wh daily usage). Treat the battery as overnight bridge power: (1) Run ALL heavy loads during sun hours only, (2) After 5pm, use only lights, fan, TV, phone charging, (3) Never run AC overnight. This will keep the battery healthy and get you through to morning.`
            });
        } else if (batteryRatio < 1.0) {
            advisories.push({
                category: 'Battery',
                severity: 'info',
                title: 'Battery Operation Guide',
                message: `Your ${batt.totalCapacityAh}Ah battery provides ~${usableBatteryWh}Wh usable energy. Comfortable operation: (1) Run pump and AC during peak sun (10am-3pm) only, (2) Never run two heavy appliances together, (3) After 4:30pm, switch to light loads only. Your ${pv.totalPanels} panels (${pv.arrayWattage}W) can charge the battery AND power loads simultaneously during sun hours.`
            });
        } else {
            advisories.push({
                category: 'Battery',
                severity: 'info',
                title: 'Good Battery Capacity',
                message: `Your ${batt.totalCapacityAh}Ah battery provides ~${usableBatteryWh}Wh usable — ${Math.round(batteryRatio * 100)}% of daily usage. You have solid overnight capacity. Still best to run heavy loads during sun hours to maximize battery lifespan.`
            });
        }

        // DoD guidance
        advisories.push({
            category: 'Battery',
            severity: 'info',
            title: 'Depth of Discharge',
            message: `Your ${specs.name} battery should not regularly discharge below ${Math.round(specs.maxDoD * 100)}% DoD. The system is designed with this limit. For longest life (${specs.cycleLife}+ cycles), aim for ${Math.round(specs.maxDoD * 80)}% daily discharge or less.`
        });

        // ---- CHARGE TIME ESTIMATE (dynamic based on daytime load checkbox) ----
        const peakPVOutput = pv.arrayWattage * 0.8; // realistic peak (derating, temp, etc.)
        const psh = config.avgPSH || 4.5;
        const pvAccountForDaytimeLoad = pv.pvAccountForDaytimeLoad !== false;
        const daytimeLoadWh = agg.daytimeEnergyWh || 0;
        const avgDaytimeLoadW = daytimeLoadWh / psh;
        const chargeEffAdv = 0.92;

        if (pvAccountForDaytimeLoad && daytimeLoadWh > 0) {
            // PV sized for loads + charging — show the split
            const netChargePower = Math.max(peakPVOutput - avgDaytimeLoadW, 0);
            const chargeCurrentFromPV = netChargePower / batt.bankVoltage;
            const effectiveChargeCurrent = Math.min(chargeCurrentFromPV, batt.maxChargeCurrent || chargeCurrentFromPV);
            const fullChargeHours = effectiveChargeCurrent > 0 ? batt.totalCapacityAh / (effectiveChargeCurrent * chargeEffAdv) : 999;
            const dailyChargeWh = netChargePower * psh * chargeEffAdv;
            const usableBattWh = batt.usableCapacityWh || (batt.totalCapacityAh * batt.bankVoltage * 0.5);
            const dailyChargePercent = Math.round(dailyChargeWh / usableBattWh * 100);

            advisories.push({
                category: 'Battery',
                severity: fullChargeHours <= psh ? 'info' : 'warning',
                title: 'Charge Time — PV Powers Loads + Charges Battery',
                message: `Your panels produce ~${Math.round(peakPVOutput)}W during peak sun. Of this, ~${Math.round(avgDaytimeLoadW)}W powers daytime loads, leaving ~<strong>${Math.round(netChargePower)}W</strong> for battery charging (${Math.round(effectiveChargeCurrent)}A at ${batt.bankVoltage}V).<br><br>`
                    + `<strong>From empty → full:</strong> ${fullChargeHours > 100 ? '10+ hours' : fullChargeHours.toFixed(1) + ' hours'} of peak sun needed. `
                    + `With ${psh}h peak sun daily: ${fullChargeHours <= psh
                        ? '<strong style="color: green;">Battery can fully recharge in a single sunny day.</strong> Array is well-sized for simultaneous load + charging.'
                        : `<strong style="color: #d97706;">May need ${Math.ceil(fullChargeHours / psh)} sunny days</strong> for full recharge. Daily charge: ~${Math.round(dailyChargeWh)}Wh (${dailyChargePercent}% of usable capacity). Keep heavy loads off until battery exceeds 60%.`}`
                    + `<br><br><em>This estimate assumes all daytime loads run during peak sun. Actual charging is faster on days with lighter load usage.</em>`
            });
        } else {
            // PV sized for charging only — but loads WILL run and steal power
            const chargeOnlyPowerW = peakPVOutput;
            const chargeOnlyCurrent = chargeOnlyPowerW / batt.bankVoltage;
            const chargeOnlyTime = batt.totalCapacityAh / (chargeOnlyCurrent * chargeEffAdv);

            const netIfLoadsRun = Math.max(chargeOnlyPowerW - avgDaytimeLoadW, 0);
            const netCurrentIfLoads = netIfLoadsRun / batt.bankVoltage;
            const actualChargeTime = netCurrentIfLoads > 0 ? batt.totalCapacityAh / (netCurrentIfLoads * chargeEffAdv) : 999;

            const severity = actualChargeTime > psh * 2 ? 'critical' : actualChargeTime > psh ? 'warning' : 'info';

            advisories.push({
                category: 'Battery',
                severity: severity,
                title: 'Charge Time — PV Sized for Battery Only',
                message: `<strong>Daytime load sizing is OFF.</strong> Panels produce ~${Math.round(peakPVOutput)}W — all intended for battery charging.<br><br>`
                    + `<strong>Best case (no loads):</strong> Full charge in ${chargeOnlyTime.toFixed(1)} hours (${Math.round(chargeOnlyCurrent)}A at ${batt.bankVoltage}V). ${chargeOnlyTime <= psh ? 'Achievable in 1 sunny day.' : `Needs ${Math.ceil(chargeOnlyTime / psh)} sunny days.`}<br>`
                    + `<strong>Reality (loads running):</strong> Daytime loads draw ~${Math.round(avgDaytimeLoadW)}W from PV, leaving only ~${Math.round(netIfLoadsRun)}W for charging. `
                    + `Actual charge time: <strong>${actualChargeTime > 100 ? '10+ hours' : actualChargeTime.toFixed(1) + ' hours'}</strong>. `
                    + (avgDaytimeLoadW > peakPVOutput * 0.8
                        ? '<strong style="color: #dc2626;">DANGER: Loads consume most of the PV output — battery may drain even during sunshine! Enable "Size PV for daytime loads" or add more panels urgently.</strong>'
                        : actualChargeTime > psh * 1.5
                            ? '<strong style="color: #d97706;">Battery will not fully recharge in one day if loads run during sun hours. Enable "Size PV for daytime loads" for reliable operation.</strong>'
                            : 'Charging is adequate if loads are kept light during sun hours.')
            });
        }

        // ---- CHEMISTRY-SPECIFIC ADVICE ----
        if (chemistry === 'agm') {
            advisories.push({
                category: 'Battery',
                severity: 'warning',
                title: 'AGM Battery — Heat & Sulfation Warning',
                message: 'AGM batteries are sensitive to heat and sulfation. In hot climates (above 30°C ambient): (1) Keep batteries in a ventilated, shaded area — never in direct sun or enclosed hot rooms, (2) Avoid leaving batteries at partial charge for extended periods — sulfation builds up and permanently reduces capacity, (3) Ensure the charge controller completes full absorption charge daily, (4) Expect 2-3 year lifespan in tropical heat vs 4-5 years in temperate climate. Water loss is sealed but heat accelerates degradation.'
            });
            advisories.push({
                category: 'Battery',
                severity: 'info',
                title: 'AGM Charging Profile',
                message: `AGM batteries must not be fast-charged — max charge rate is ${Math.round(specs.maxChargeRate * 100)}% of capacity (${Math.round(batt.totalCapacityAh * specs.maxChargeRate)}A for your ${batt.totalCapacityAh}Ah bank). Ensure your charge controller is set to AGM profile, not flooded or lithium. Overcharging causes gas venting and permanent damage.`
            });
        } else if (chemistry === 'gel') {
            advisories.push({
                category: 'Battery',
                severity: 'warning',
                title: 'Gel Battery — Charge Voltage Critical',
                message: 'Gel batteries are very sensitive to charge voltage. Even slightly high voltage causes irreversible gel drying. (1) Set charge voltage to exactly manufacturer spec (typically 14.1-14.4V per 12V unit), (2) Never use "flooded" or "AGM" charge profile — gel requires lower voltage, (3) Heat derating: reduce charge voltage by 3mV/°C above 25°C, (4) Place batteries in the coolest location available.'
            });
        } else if (chemistry === 'fla') {
            advisories.push({
                category: 'Battery',
                severity: 'warning',
                title: 'Flooded Lead Acid — Maintenance Required',
                message: 'Flooded batteries require regular maintenance: (1) Check electrolyte levels every 2-4 weeks — top up with distilled water only, (2) Ensure periodic equalization charge (monthly) to prevent stratification, (3) Battery room MUST be ventilated — hydrogen gas is explosive, (4) Clean terminals with baking soda solution quarterly to prevent corrosion. Neglecting maintenance can halve battery life.'
            });
        } else if (chemistry === 'lifepo4') {
            advisories.push({
                category: 'Battery',
                severity: 'info',
                title: 'LiFePO4 — Low Maintenance',
                message: `LiFePO4 is the most forgiving chemistry for solar. No maintenance needed, handles partial charge well, and ${specs.cycleLife}+ cycle life. Key points: (1) Built-in BMS handles cell balancing — do not bypass, (2) Avoid charging below 0°C (most BMS will block this automatically), (3) If stored long-term, keep at 50-60% charge. Your battery should last 8-10 years with normal use.`
            });
        }

        // ---- W vs VA EXPLANATION ----
        const totalWatts = agg.totalWatts || agg.designContinuousVA * 0.85;
        const totalVA = agg.designContinuousVA;
        const powerFactor = totalWatts / totalVA;

        if (Math.abs(totalWatts - totalVA) > 50) {
            advisories.push({
                category: 'General',
                severity: 'info',
                title: 'Understanding W vs VA',
                message: `Your loads total ${Math.round(totalWatts)}W (real power) but the inverter sees ${Math.round(totalVA)}VA (apparent power). The difference is because motors (AC, pump, fan) draw extra reactive current. Your inverter is sized at ${inv.recommendedSizeVA || inv.continuousVARequired}VA to handle this apparent power. Think of it this way: Watts = actual energy consumed, VA = what the inverter must be rated to deliver. Both numbers are correct — they measure different things.`
            });
        }

        // ---- PV ARRAY GUIDANCE (dynamic, multi-scenario) ----
        const pvToLoad = pv.arrayWattage / (dailyEnergy / (config.avgPSH || 4.5));
        const pvDeratedW = pv.arrayWattage * 0.80;
        const requiredPVW = dailyEnergy / (config.avgPSH || 4.5);
        const overproductionPct = Math.round((pvToLoad - 1) * 100);
        const cloudDayOutput = pv.arrayWattage * 0.25; // ~25% on heavy cloud
        const cloudDayWh = cloudDayOutput * (config.avgPSH || 4.5);
        const cloudCoverage = Math.round(cloudDayWh / dailyEnergy * 100);

        if (pvToLoad > 1.5) {
            advisories.push({
                category: 'PV Array',
                severity: 'info',
                title: `Array Oversized by ${overproductionPct}%`,
                message: `Your ${pv.arrayWattage}W array produces ~${overproductionPct}% more than the minimum ${Math.round(requiredPVW)}W needed for your ${dailyEnergy.toFixed(0)}Wh daily load. `
                    + `<strong>Benefits:</strong> faster battery charging, comfortable daytime load capacity, better performance in haze/dust conditions. `
                    + `On a cloudy day (~25% output), you'd still get ~${Math.round(cloudDayWh)}Wh — ${cloudCoverage >= 80 ? 'enough to cover most loads.' : cloudCoverage >= 50 ? 'covering about half your needs. Battery handles the rest.' : 'you will rely heavily on battery.'} `
                    + `<br><em>Expansion headroom: You can add ~${Math.round((pvDeratedW - requiredPVW) * (config.avgPSH || 4.5))}Wh of daily load before needing more panels.</em>`
            });
        } else if (pvToLoad > 1.3) {
            advisories.push({
                category: 'PV Array',
                severity: 'info',
                title: `Well-Sized Array (+${overproductionPct}% headroom)`,
                message: `Your ${pv.arrayWattage}W array has ${overproductionPct}% headroom over the minimum ${Math.round(requiredPVW)}W needed. Faster battery charging and comfortable daytime operation. `
                    + `Cloudy day resilience: ~${cloudCoverage}% of daily needs covered at 25% output. `
                    + `Room to add ~${Math.round((pvDeratedW - requiredPVW) * (config.avgPSH || 4.5))}Wh of extra daily load.`
            });
        } else if (pvToLoad >= 1.0) {
            advisories.push({
                category: 'PV Array',
                severity: 'warning',
                title: `Tight Array (+${overproductionPct}% headroom)`,
                message: `Your ${pv.arrayWattage}W array meets the ${Math.round(requiredPVW)}W requirement with only ${overproductionPct}% margin. `
                    + `This works on clear days, but on cloudy/hazy days (~25% output), you'd only get ~${Math.round(cloudDayWh)}Wh — just ${cloudCoverage}% of your ${dailyEnergy.toFixed(0)}Wh need. Battery will drain. `
                    + `<br><strong>Recommendation:</strong> Add 1-2 more panels for reliable all-weather operation. Dust/haze season can reduce output 20-40%.`
            });
        } else if (pvToLoad >= 0.8) {
            advisories.push({
                category: 'PV Array',
                severity: 'warning',
                title: `Array Undersized (${Math.abs(overproductionPct)}% short)`,
                message: `Your ${pv.arrayWattage}W array is ${Math.abs(overproductionPct)}% below the ${Math.round(requiredPVW)}W needed for your ${dailyEnergy.toFixed(0)}Wh daily load. `
                    + `Battery will not fully recharge on a typical day, leading to progressive discharge over consecutive cloudy days. `
                    + `<br><strong>Action needed:</strong> Add at least ${Math.ceil((requiredPVW - pv.arrayWattage) / (config.panelWattage || 400))} more panel(s) or reduce daily energy consumption by ${Math.round(dailyEnergy * (1 - pvToLoad))}Wh.`
            });
        } else {
            advisories.push({
                category: 'PV Array',
                severity: 'critical',
                title: `Array Critically Undersized (${Math.abs(overproductionPct)}% short)`,
                message: `Your ${pv.arrayWattage}W array produces only ${Math.round(pvToLoad * 100)}% of what your ${dailyEnergy.toFixed(0)}Wh load requires. `
                    + `Battery will discharge deeply every day, destroying cycle life rapidly. `
                    + `<strong>You need at least ${Math.round(requiredPVW)}W of panels (${Math.ceil(requiredPVW / (config.panelWattage || 400))} panels) minimum, preferably ${Math.round(requiredPVW * 1.3)}W+ for reliable operation.</strong>`
            });
        }

        // MPPT clipping advisory (if array oversized vs MPPT capacity)
        if (mppt && mppt.maxPower && pv.arrayWattage > mppt.maxPower) {
            const clippedW = pv.arrayWattage - mppt.maxPower;
            const clippedPct = Math.round(clippedW / pv.arrayWattage * 100);
            advisories.push({
                category: 'PV Array',
                severity: clippedPct > 15 ? 'warning' : 'info',
                title: `MPPT Clipping: ${clippedPct}% of Array Power`,
                message: `Your ${pv.arrayWattage}W array exceeds the MPPT's ${mppt.maxPower}W capacity by ${clippedW}W. `
                    + `During peak sun, the MPPT will clip at ${mppt.maxPower}W — the excess ${clippedW}W is safely discarded as heat. `
                    + (clippedPct <= 15
                        ? `This is common practice (${clippedPct}% oversize). Benefits: better low-light and morning/evening performance. No harm to equipment.`
                        : `At ${clippedPct}%, you're wasting significant panel capacity. Consider a higher-rated MPPT controller or dual-MPPT inverter.`)
            });
        }

        // Seasonal/weather variation advisory
        advisories.push({
            category: 'PV Array',
            severity: 'info',
            title: 'Seasonal & Weather Performance',
            message: `<strong>Clear day:</strong> ~${Math.round(pv.dailyEnergyWh || pv.arrayWattage * (config.avgPSH || 4.5) * 0.8)}Wh production (${config.avgPSH || 4.5}h peak sun). `
                + `<strong>Hazy/dusty:</strong> ~${Math.round((pv.dailyEnergyWh || pv.arrayWattage * (config.avgPSH || 4.5) * 0.8) * 0.6)}Wh (60%). `
                + `<strong>Heavy cloud/rain:</strong> ~${Math.round(cloudDayWh)}Wh (25%). `
                + `<br>During extended cloudy or wet-season periods, expect 2-3 consecutive low-production days — battery autonomy of ${config.autonomyDays || 1} day(s) must cover this. `
                + `Clean panels monthly — dust/bird droppings can reduce output 5-15%.`
        });

        // ---- PANEL MISMATCH ADVISORY ----
        const mismatchData = results.mismatchData;
        if (mismatchData) {
            if (mismatchData.spread <= 5) {
                advisories.push({
                    category: 'PV Array',
                    severity: 'info',
                    title: `Panel Mismatch: ${mismatchData.spread.toFixed(1)}% — Acceptable`,
                    message: `Your mixed panels (${mismatchData.count} panels, ${mismatchData.totalW}W total) have a ${mismatchData.spread.toFixed(1)}% wattage spread. This is within the industry-accepted 5% tolerance. Energy loss from mismatch will be under 3%. No action needed.`
                });
            } else if (mismatchData.spread <= 10) {
                advisories.push({
                    category: 'PV Array',
                    severity: 'warning',
                    title: `Panel Mismatch: ${mismatchData.spread.toFixed(1)}% — Marginal`,
                    message: `Your panels have a ${mismatchData.spread.toFixed(1)}% wattage spread (${mismatchData.count} panels, ${mismatchData.totalW}W). This exceeds ideal 5% but is workable. Expected 5-8% energy loss. Best practice: group similar wattages into the same series string. Different strings can have different wattages when wired in parallel.`
                });
            } else {
                advisories.push({
                    category: 'PV Array',
                    severity: 'critical',
                    title: `Panel Mismatch: ${mismatchData.spread.toFixed(1)}% — Excessive`,
                    message: `Your panels have a ${mismatchData.spread.toFixed(1)}% wattage spread — too high for a single series string. The weakest panel will bottleneck the entire string, wasting 10-20% of the stronger panels' capacity. Solution: separate panels by wattage into different parallel strings, or use a dual-MPPT inverter with each group on a separate input.`
                });
            }
        }

        // ---- PV ORIENTATION / TILT ADVISORY ----
        const pvOrient = config.panelOrientation || 'unknown';
        const pvTilt = config.panelTilt || 'unknown';
        const pvOrientFactor = config.orientationFactor || 0.93;
        const pvTiltFactor = config.tiltFactor || 0.97;
        const pvCombinedFactor = pvOrientFactor * pvTiltFactor;
        if (pvCombinedFactor < 1.0) {
            const lossPct = Math.round((1 - pvCombinedFactor) * 100);
            const extraPanelsPct = Math.round((1 / pvCombinedFactor - 1) * 100);
            const orientName = {south:'South',se_sw:'South-East/South-West',east_west:'East/West',flat:'Flat roof',unknown:'Unknown'}[pvOrient] || 'Unknown';
            const tiltName = {optimal:'latitude-matched',low:'low (<10\u00B0)',high:'high (>40\u00B0)',unknown:'unknown'}[pvTilt] || 'unknown';
            const sev = lossPct >= 10 ? 'warning' : 'info';
            advisories.push({
                category: 'PV Orientation',
                severity: sev,
                title: `Panel Positioning: ${orientName} orientation, ${tiltName} tilt (${Math.round(pvCombinedFactor * 100)}% effective)`,
                message: `${orientName} orientation with ${tiltName} tilt reduces effective PV output by ~${lossPct}%. Panel count has been adjusted +${extraPanelsPct}% to compensate. ${pvOrient === 'east_west' ? 'East/West is common on urban rooftops — consider split-array with morning/afternoon coverage.' : pvOrient === 'flat' ? 'Flat mounting reduces self-cleaning from rain — periodic panel cleaning recommended.' : ''}`
            });
        }

        // ---- MIXED BATTERY BANK ADVISORY ----
        if (batt.isMixedBank && batt.mixedBankData) {
            const mb = batt.mixedBankData;

            // Push all mixed bank warnings as advisories
            if (mb.warnings && mb.warnings.length > 0) {
                mb.warnings.forEach(w => {
                    const isCritical = w.startsWith('CRITICAL');
                    const isWarning = w.startsWith('WARNING');
                    advisories.push({
                        category: 'Battery',
                        severity: isCritical ? 'critical' : isWarning ? 'warning' : 'info',
                        title: isCritical ? 'Mixed Battery: Critical Safety Issue' : isWarning ? 'Mixed Battery: Configuration Warning' : 'Mixed Battery: Note',
                        message: w
                    });
                });
            }

            // General mixed bank advisory
            advisories.push({
                category: 'Battery',
                severity: 'info',
                title: 'Mixed Battery Bank Topology',
                message: `Your bank uses ${mb.totalUnits} batteries in a mixed configuration: ${mb.topologyDesc}. Effective capacity: ${mb.effectiveBankAh}Ah at ${mb.effectiveBankVoltage}V (${(mb.effectiveBankWh / 1000).toFixed(2)} kWh). For best results: use identical batteries whenever possible. When mixing is unavoidable, ensure all batteries are charged to the same state-of-charge before first connection, use individual string fuses, and monitor the bank regularly for voltage imbalance.`
            });
        }

        // ---- SUN WEAKENING & TIME-BASED GUIDANCE ----

        advisories.push({
            category: 'Load Management',
            severity: 'warning',
            title: 'Sun Weakening After 4:00pm',
            message: `Solar output drops significantly after 4:00pm and becomes negligible by 5:30-6:00pm. Turn off AC, pumping machine, and all heavy loads by 4:00pm at the latest. From 4:00pm onward, your system runs primarily on battery. Keeping heavy loads on past this time drains the battery before nightfall and shortens battery life.`
        });

        // ---- COPING STRATEGIES FOR UNDERSIZED EQUIPMENT ----
        const invUsableVA = (inv.recommendedSizeVA || 0) * DEFAULTS.INVERTER_DERATING;
        const invIsUndersize = inv.isManualOverride && invUsableVA < (agg.designContinuousVA || agg.peakSimultaneousVA);
        const invIsSurgeShort = inv.isManualOverride && (inv.recommendedSizeVA || 0) * (config.inverterSurgeMultiplier || 2) < (agg.highestSurgeVA || agg.designSurgeVA || 0);
        const battIsUndersize = batt.isManualOverride && (batt.autoSuggestedAh || 0) > batt.totalCapacityAh * 1.2;
        const battUnitUndersize = batt.isUnitCountOverride && (batt.autoSuggestedStrings || 0) > (batt.stringsInParallel || 1);

        if (invIsUndersize || invIsSurgeShort || battIsUndersize || battUnitUndersize) {
            // Build load priority tiers from appliances
            const allApps = [...appliances].sort((a, b) => (b.ratedPowerW * b.quantity) - (a.ratedPowerW * a.quantity));
            const criticalLoads = appliances.filter(a => /fridge|freezer|router|modem|light|fan/i.test(a.name));
            const heavyNonCrit = appliances.filter(a =>
                a.ratedPowerW * a.quantity > 500 && !criticalLoads.includes(a)
            );
            const lightLoads = appliances.filter(a =>
                a.ratedPowerW * a.quantity <= 500 && !criticalLoads.includes(a)
            );

            let copeMsg = '';

            if (invIsUndersize) {
                const usable = Math.round(invUsableVA);
                const needed = Math.round(agg.designContinuousVA || agg.peakSimultaneousVA);
                const deficit = needed - usable;
                copeMsg += `<strong>Inverter Capacity:</strong> Your ${inv.recommendedSizeVA}VA inverter provides ~${usable}W usable (after 80% derating). Your loads need ${needed}VA continuous — a ${Math.round(deficit)}VA shortfall. `;
                copeMsg += `You CANNOT run all loads simultaneously. `;
            }

            if (invIsSurgeShort) {
                copeMsg += `<strong>Surge:</strong> Motor startup surges (${Math.round(agg.highestSurgeVA || agg.designSurgeVA)}VA worst-case) exceed your inverter's ${Math.round((inv.recommendedSizeVA || 0) * (config.inverterSurgeMultiplier || 2))}VA surge rating. NEVER start two motors at the same time — the inverter will trip or shut down. `;
            }

            if (battIsUndersize || battUnitUndersize) {
                const autoAh = batt.autoSuggestedAh || (batt.autoSuggestedStrings ? batt.autoSuggestedStrings * batt.recommendedAhPerCell : 0);
                copeMsg += `<strong>Battery:</strong> Your ${Math.round(batt.totalCapacityAh)}Ah is smaller than the recommended ${Math.round(autoAh)}Ah. Expect reduced autonomy and faster cycling — avoid deep discharge. `;
            }

            // Priority tier list
            copeMsg += '<br><br><strong>Load Priority Tiers (run in order of importance):</strong><br>';
            copeMsg += '<strong>Tier 1 — Always On (Critical):</strong> ';
            copeMsg += criticalLoads.length > 0
                ? criticalLoads.map(a => `${a.name} (${a.ratedPowerW * a.quantity}W)`).join(', ')
                : 'Lights, fan, fridge, router';
            copeMsg += '<br><strong>Tier 2 — Daytime Only (Heavy):</strong> ';
            copeMsg += heavyNonCrit.length > 0
                ? heavyNonCrit.map(a => `${a.name} (${a.ratedPowerW * a.quantity}W)`).join(', ')
                : 'AC, pump, washing machine';
            copeMsg += ' — run ONE at a time during peak sun (10am-3pm)<br>';
            copeMsg += '<strong>Tier 3 — Occasional (Light):</strong> ';
            copeMsg += lightLoads.length > 0
                ? lightLoads.map(a => `${a.name} (${a.ratedPowerW * a.quantity}W)`).join(', ')
                : 'TV, laptop, chargers';

            // Specific rules
            copeMsg += '<br><br><strong>Survival Rules:</strong><br>';
            copeMsg += '1. NEVER run more than ONE Tier 2 appliance at a time<br>';
            copeMsg += '2. Turn off ALL Tier 2 loads by 4:00pm — battery only after sunset<br>';
            copeMsg += '3. If inverter trips: turn off the last appliance started, wait 30 seconds, restart<br>';
            copeMsg += '4. On cloudy days: Tier 1 loads only — no heavy loads at all<br>';
            copeMsg += '5. After 6pm: Tier 1 + Tier 3 only (lights, fan, TV, phone charging)';

            copeMsg += '<br><br><em>This is a temporary coping strategy. For reliable, safe operation with your full load list, upgrade to the recommended inverter (' + (inv.autoSuggestedSizeVA || 'see auto-calculation') + 'VA) and battery size.</em>';

            advisories.push({
                category: 'Coping Strategies',
                severity: 'warning',
                title: 'Managing With Undersized Equipment',
                message: copeMsg
            });

            // Max simultaneous load estimate
            if (invIsUndersize) {
                const safeSimultaneousW = Math.round(invUsableVA * 0.85);
                let comboMsg = `Your inverter can safely handle ~${safeSimultaneousW}W of simultaneous load. `;
                comboMsg += 'Safe combinations (examples):<br>';

                // Build safe combos from actual appliances
                const sortedByW = [...appliances].sort((a, b) => a.ratedPowerW * a.quantity - b.ratedPowerW * b.quantity);
                let comboW = 0;
                const safeCombo = /** @type {string[]} */ ([]);
                for (const app of sortedByW) {
                    const w = app.ratedPowerW * app.quantity;
                    if (comboW + w <= safeSimultaneousW) {
                        safeCombo.push(`${app.name} (${w}W)`);
                        comboW += w;
                    }
                }
                if (safeCombo.length > 0) {
                    comboMsg += `• ${safeCombo.join(' + ')} = ${comboW}W [SAFE]<br>`;
                }

                // Unsafe combo example (two heaviest)
                if (heavyNonCrit.length >= 2) {
                    const h1 = heavyNonCrit[0], h2 = heavyNonCrit[1];
                    const unsafeW = h1.ratedPowerW * h1.quantity + h2.ratedPowerW * h2.quantity;
                    comboMsg += `• ${h1.name} + ${h2.name} = ${unsafeW}W [DANGER — exceeds capacity]`;
                }

                advisories.push({
                    category: 'Coping Strategies',
                    severity: 'info',
                    title: 'Safe Load Combinations',
                    message: comboMsg
                });
            }
        }

        // ---- DAYTIME SELF-SUFFICIENCY (with W vs VA context) ----
        const peakPVPower = pv.arrayWattage * 0.8;
        const peakLoadVA = agg.peakSimultaneousVA || agg.designContinuousVA;
        const peakLoadW = peakLoadVA * (powerFactor || 0.85);

        if (peakPVPower > peakLoadW * 1.2) {
            const surplus = Math.round(peakPVPower - peakLoadW);
            advisories.push({
                category: 'General',
                severity: 'info',
                title: 'Daytime Self-Sufficiency',
                message: `During peak sun (10am-2pm), your panels produce ~${Math.round(peakPVPower)}W. Your loads draw ~${Math.round(peakLoadW)}W real power (${Math.round(peakLoadVA)}VA apparent). That leaves ~${surplus}W surplus going directly to battery charging. You can comfortably run appliances during these hours while the battery charges simultaneously.`
            });
        }

        // ---- DAILY ROUTINE SUGGESTION ----
        if (heavyLoads.length > 0) {
            // Build a practical daily schedule
            let schedule = '';
            const acLoad = appliances.find(a => /air\s*con|a\.?c\.?|split\s*unit|cooling/i.test(a.name));
            const pumpLoad = appliances.find(a => /pump|bore\s*hole|water/i.test(a.name) && a.loadType === 'motor');
            const washLoad = appliances.find(a => /wash|laundry/i.test(a.name));
            const ironLoad = appliances.find(a => /iron/i.test(a.name));

            schedule += '<br><strong>Suggested Daily Routine:</strong><br>';
            schedule += '<span style="font-family: monospace; font-size: 0.85rem; line-height: 1.8;">';
            schedule += '6:00am - 9:00am &nbsp; Lights, fan, TV, phone charging (light loads)<br>';

            if (pumpLoad) {
                schedule += '9:30am - 10:30am &nbsp; Pumping machine (sun is building up)<br>';
            }
            if (washLoad) {
                schedule += '10:00am - 11:30am &nbsp; Washing machine (good sun, battery charging)<br>';
            }
            if (ironLoad) {
                schedule += '11:00am - 11:30am &nbsp; Ironing (peak sun ONLY, nothing else heavy)<br>';
            }
            if (acLoad) {
                schedule += '11:00am - 3:30pm &nbsp; AC (peak sun hours — turn off by 3:30pm)<br>';
            }
            schedule += '4:00pm onward &nbsp;&nbsp;&nbsp; Light loads ONLY (lights, fan, TV, phone)<br>';
            schedule += '6:00pm - 6:00am &nbsp; Battery powers essentials overnight<br>';
            schedule += '</span>';
            schedule += '<br><em>Key rule: Never run two heavy loads at the same time. Stagger everything.</em>';

            advisories.push({
                category: 'Daily Routine',
                severity: 'info',
                title: 'Recommended Daily Load Schedule',
                message: `To get the best out of your battery and panels, follow this schedule. Your panels produce power from ~7am to ~5:30pm, with peak output between 10am-3pm. Heavy loads should ONLY run during peak sun.${schedule}`
            });
        }

        // Combined heavy load scheduling (if 3+)
        if (heavyLoads.length >= 3) {
            advisories.push({
                category: 'Load Management',
                severity: 'warning',
                title: 'Heavy Load Scheduling',
                message: `You have ${heavyLoads.length} heavy loads (${heavyLoads.map(h => h.name + ' ' + (h.ratedPowerW * h.quantity) + 'W').join(', ')}). NEVER run more than one heavy load at the same time. Stagger each by at least 30 minutes. Your inverter can handle one at a time while panels charge the battery.`
            });
        }

        // ---- GRID/UTILITY CHARGING ADVISORY ----
        const gridMaxChargeInput = document.getElementById('gridMaxChargeA') as HTMLInputElement | null;
        const gridInputRangeInput = document.getElementById('gridInputVoltageRange') as HTMLInputElement | HTMLSelectElement | null;
        const systemTypeInput = document.getElementById('systemType') as HTMLSelectElement | null;
        const gridMaxChargeA = parseFloat(gridMaxChargeInput?.value || '') || 0;
        const gridInputRange = gridInputRangeInput?.value || '';
        const sysType = systemTypeInput?.value || '';

        if (gridMaxChargeA > 0 && (sysType === 'hybrid' || sysType === 'grid_tie')) {
            const gridChargeW = gridMaxChargeA * batt.bankVoltage;
            const gridChargeHours = batt.totalCapacityAh / (gridMaxChargeA * 0.92);

            advisories.push({
                category: 'Grid Charging',
                severity: 'info',
                title: `Grid/Utility Charging: ${gridMaxChargeA}A Available`,
                message: `Your hybrid inverter can charge at up to ${gridMaxChargeA}A from the grid (~${Math.round(gridChargeW)}W). `
                    + `Full charge from empty: ~${gridChargeHours.toFixed(1)} hours. `
                    + `Grid input range: ${gridInputRange || 'not specified'}VAC. `
                    + `<br><br><strong>Grid Charging Strategy:</strong> `
                    + `(1) Set grid charging to off-peak hours when utility supply is most stable. `
                    + (config.locationProfile?.gridNote ? `(2) ${config.locationProfile.gridNote} ` : `(2) Verify grid voltage stability before connecting charger. `)
                    + `(3) Set charge current to ${Math.min(gridMaxChargeA, Math.round(batt.totalCapacityAh * 0.3))}A or lower for battery longevity — fast charging reduces cycle life. `
                    + `(4) During prolonged grid availability, let grid charge to 80% then switch to solar for the remaining 20% — gentler on ${batt.chemistryName} cells.`
            });
        }

        // ---- MANAGED PRACTICAL ADVISORIES ----
        const managed = inv.managedMode;
        if (managed) {
            if (managed.riskLevel !== 'RED' && managed.conditionCount > 0 && inv.isManualOverride) {
                advisories.push({
                    category: 'Managed Practical',
                    severity: managed.riskLevel === 'GREEN' ? 'info' : managed.riskLevel === 'YELLOW' ? 'warning' : 'critical',
                    title: `Inverter Viable in Managed Mode (${managed.conditionCount} conditions)`,
                    message: `Your ${inv.recommendedSizeVA}VA inverter can work with managed load discipline. `
                        + `Managed continuous: ${managed.managedContinuousVA}VA, managed surge: ${managed.managedSurgeVA}VA. `
                        + `Risk level: ${managed.riskLevel} — ${managed.riskLabel}. `
                        + managed.conditions.map(c => c.text).join(' | ')
                });
            }
            if (managed.riskLevel === 'RED' && inv.isManualOverride) {
                advisories.push({
                    category: 'Managed Practical',
                    severity: 'critical',
                    title: `Inverter Insufficient Even in Managed Mode`,
                    message: `Your ${inv.recommendedSizeVA}VA inverter cannot handle the load even with strict discipline. `
                        + `Managed minimum: ${managed.managedSizeVA}VA. ${managed.riskDetail}`
                });
            }
            // Stagger-specific advisory with appliance order
            if (managed.classification.staggerableMotors >= 2) {
                const staggerMotors = appliances
                    .filter(a => a.loadType === 'motor' && a.canStagger === 'yes')
                    .sort((a, b) => (b.ratedPowerW * b.quantity) - (a.ratedPowerW * a.quantity));
                if (staggerMotors.length >= 2) {
                    const order = staggerMotors.map((m, i) => `${i + 1}. ${m.name} (${m.ratedPowerW * m.quantity}W)`).join(', ');
                    advisories.push({
                        category: 'Managed Practical',
                        severity: 'warning',
                        title: `Motor Start Sequence`,
                        message: `Start motors in this order (largest first, 30-60s between each): ${order}. `
                            + `This ensures the biggest surge happens when other motors are already at steady-state current.`
                    });
                }
            }
        }

        // Inverter technology advisory — only when motors exist
        const invTechnology = config.inverterTechnology || 'unknown';
        const totalMotorCount = appliances.filter(a => a.loadType === 'motor').length;
        if (totalMotorCount >= 1) {
            if (invTechnology === 'transformer') {
                advisories.push({
                    category: 'Inverter Technology',
                    severity: 'info',
                    title: 'Transformer-Based Inverter — Good Motor Surge Handling',
                    message: `${totalMotorCount} motor load${totalMotorCount > 1 ? 's' : ''} detected. `
                        + `Transformer-based (low-frequency) inverter provides 2.5x surge tolerance and better stability during motor starts. `
                        + `Heavier copper windings absorb inrush current more gracefully than transformerless designs.`
                });
            } else if (invTechnology === 'transformerless') {
                advisories.push({
                    category: 'Inverter Technology',
                    severity: 'warning',
                    title: 'Transformerless Inverter — Tighter Overload Tolerance',
                    message: `${totalMotorCount} motor load${totalMotorCount > 1 ? 's' : ''} detected. `
                        + `Transformerless (high-frequency) inverter has 2.0x surge tolerance with a tighter overload window. `
                        + `Strict load management recommended — avoid starting two heavy motors simultaneously. `
                        + `Consider upgrading to transformer-based inverter if frequent motor trips occur.`
                });
            } else {
                advisories.push({
                    category: 'Inverter Technology',
                    severity: 'info',
                    title: 'Inverter Technology Not Specified',
                    message: `${totalMotorCount} motor load${totalMotorCount > 1 ? 's' : ''} detected. `
                        + `Select your inverter technology (Transformer-Based or Transformerless) in System Configuration for accurate surge tolerance assessment. `
                        + `Transformer-based inverters handle motor surge better (2.5x vs 2.0x tolerance).`
                });
            }
        }

        // Battery practical advisory
        const battPractical = batt.practical;
        if (battPractical && battPractical.savings > 5) {
            advisories.push({
                category: 'Managed Practical',
                severity: battPractical.riskLevel === 'GREEN' ? 'info' : 'warning',
                title: `Battery: Practical Alternative Available (${battPractical.savings}% smaller)`,
                message: `Engineering: ${battPractical.engineeringAh}Ah. Practical: ${battPractical.practicalAh}Ah `
                    + `(${battPractical.practicalAutonomy} day autonomy, nighttime essentials only: ${battPractical.nighttimeEssentialWh}Wh). `
                    + `Heavy loads (${battPractical.daytimeHeavyWh}Wh) shifted to solar-powered daytime hours.`
            });
        }

        // PV practical advisory
        const pvPractical = pv.practical;
        if (pvPractical && pvPractical.savings > 5) {
            advisories.push({
                category: 'Managed Practical',
                severity: pvPractical.riskLevel === 'GREEN' ? 'info' : 'warning',
                title: `PV Array: Practical Alternative (${pvPractical.savings}% fewer panels)`,
                message: `Engineering: ${pvPractical.engineeringPanels} panels (${pvPractical.engineeringWp}Wp). `
                    + `Practical: ${pvPractical.practicalPanels} panels (${pvPractical.practicalArrayWp}Wp). `
                    + `Daytime-direct: ${pvPractical.daytimeDirectWh}Wh. Nighttime battery: ${pvPractical.nighttimeViasBattery}Wh.`
            });
        }

        return advisories;
    }
};
