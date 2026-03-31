/* =============================================================================
   PHASE TS-8: CONTROLLER PAYLOAD HELPERS
   Stable controller-adjacent summary builders extracted from 30-controller.js.
   These stay pure and typed so the UI/event layer can remain plain JS for now.
   ============================================================================= */

type ControllerSystemResults = import('../types/pv-types').SystemResults;
type ControllerRiskIndexResult = import('../types/pv-types').RiskIndexResult;
type ControllerConfidenceMetricsSummary = import('../types/pv-types').ConfidenceMetricsSummary;
type ControllerSystemConfig = import('../types/pv-types').SystemConfig;
type ControllerBusinessProfileDefinition = import('../types/pv-types').BusinessProfileDefinition;
type ControllerOperatingIntentDefinition = import('../types/pv-types').OperatingIntentDefinition;
type ControllerContinuityClassDefinition = import('../types/pv-types').ContinuityClassDefinition;
type ControllerOperatingScheduleDefinition = import('../types/pv-types').OperatingScheduleDefinition;
type ControllerBusinessContextEvaluationSummary = import('../types/pv-types').BusinessContextEvaluationSummary;
type ControllerBusinessFitSummary = import('../types/pv-types').BusinessFitSummary;
type ControllerAggregationResult = import('../types/pv-types').AggregationResult;
type ControllerOperationalScheduleSummaryPayload = import('../types/pv-types').OperationalScheduleSummaryPayload;
type ControllerSummaryShareRow = import('../types/pv-types').SummaryShareRow;
type ControllerCommercialArchitecturePreviewSummary = import('../types/pv-types').CommercialArchitecturePreviewSummary;
type ControllerCommercialArchitectureHintSummary = import('../types/pv-types').CommercialArchitectureHintSummary;
type ControllerCommercialArchitectureModeDefinition = import('../types/pv-types').CommercialArchitectureModeDefinition;
type ControllerGeneratorSupportModeDefinition = import('../types/pv-types').GeneratorSupportModeDefinition;
type ControllerPVFieldLayoutDefinition = import('../types/pv-types').PVFieldLayoutDefinition;
type ControllerMPPTGroupingDefinition = import('../types/pv-types').MPPTGroupingDefinition;
type ControllerRegionProfile = import('../types/pv-types').RegionProfile;
type ControllerProjectSnapshotSummary = import('../types/pv-types').ProjectSnapshotSummary;
type ControllerOperationalProfile = import('../types/pv-types').OperationalProfile;

type ControllerRiskCalculator = (engineeringValue: number, practicalValue: number) => ControllerRiskIndexResult;

interface ControllerProjectSnapshotInput {
    normalizedSnapshot: {
        formState?: Record<string, { value?: string }>;
        appliances?: unknown[];
    };
    regionProfiles: Record<string, ControllerRegionProfile>;
    businessProfileLabel: string;
}

function roundControllerValue(value: number, decimals = 1): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

const ControllerPayloads = {
    computeConfidenceMetrics(
        details: Partial<ControllerSystemResults> | null | undefined,
        calculateRiskIndex: ControllerRiskCalculator
    ): ControllerConfidenceMetricsSummary {
        const invManaged = details?.inverter?.managedMode || null;
        const battPractical = details?.battery?.practical || null;
        const pvPractical = details?.pvArray?.practical || null;
        const clusterPlan = details?.inverter?.clusterPlan || null;
        const architecture = details?.architecture;
        const decisionStrategy = details?.decisionStrategy;

        const invRisk = invManaged
            ? calculateRiskIndex(invManaged.engineeringVA, invManaged.managedSizeVA)
            : null;
        const battRisk = battPractical && battPractical.savings > 5
            ? calculateRiskIndex(battPractical.engineeringAh, battPractical.practicalAh)
            : null;
        const pvRisk = pvPractical && pvPractical.savings > 5
            ? calculateRiskIndex(pvPractical.engineeringPanels, pvPractical.practicalPanels)
            : null;

        const invDev = invRisk ? invRisk.deviation : 0;
        const battDev = battRisk ? battRisk.deviation : 0;
        const pvDev = pvRisk ? pvRisk.deviation : 0;
        const weightedDev = invDev * 0.40 + battDev * 0.35 + pvDev * 0.25;

        let clusterPenalty = 0;
        if (clusterPlan?.enabled) {
            if (clusterPlan.status === 'tight') clusterPenalty += 8;
            else if (clusterPlan.status === 'undersized') clusterPenalty += 22;
            if ((clusterPlan.worstHeadroomPct || 0) < 0) {
                clusterPenalty += Math.min(18, Math.abs(clusterPlan.worstHeadroomPct) * 0.35);
            }
        }

        let architecturePenalty = 0;
        if (architecture) {
            if (architecture.status === 'warn') architecturePenalty += 5;
            else if (architecture.status === 'fail') architecturePenalty += 12;
            if (architecture.batteryThroughput?.status === 'warn') architecturePenalty += 4;
            else if (architecture.batteryThroughput?.status === 'fail') architecturePenalty += 10;
            if (architecture.mpptGrouping?.status === 'warn') architecturePenalty += 2;
            else if (architecture.mpptGrouping?.status === 'fail') architecturePenalty += 6;
        }

        let strategyPenalty = 0;
        if (decisionStrategy) {
            if (decisionStrategy.status === 'warn') strategyPenalty += 4;
            else if (decisionStrategy.status === 'fail') strategyPenalty += 10;
            if (!decisionStrategy.isIntentAligned) strategyPenalty += 3;
            if (!decisionStrategy.isSystemTypeAligned) strategyPenalty += 3;
        }

        const score = Math.max(0, Math.round(100 - weightedDev - clusterPenalty - architecturePenalty - strategyPenalty));
        const level = score >= 85 ? 'High' : score >= 65 ? 'Moderate' : score >= 45 ? 'Managed' : 'Stress';
        const color = score >= 85 ? '#16a34a' : score >= 65 ? '#3b82f6' : score >= 45 ? '#d97706' : '#dc2626';
        const bg = score >= 85 ? 'rgba(22,163,74,0.06)' : score >= 65 ? 'rgba(59,130,246,0.06)' : score >= 45 ? 'rgba(217,119,6,0.06)' : 'rgba(220,38,38,0.06)';

        return {
            score,
            level,
            color,
            bg,
            invRisk,
            battRisk,
            pvRisk,
            clusterPenalty: roundControllerValue(clusterPenalty, 1),
            architecturePenalty: roundControllerValue(architecturePenalty, 1),
            strategyPenalty: roundControllerValue(strategyPenalty, 1)
        };
    },

    summarizeCommercialArchitecture(
        preview: ControllerCommercialArchitecturePreviewSummary,
        config: Partial<ControllerSystemConfig>,
        definitions: {
            architectureModeDefinition?: ControllerCommercialArchitectureModeDefinition;
            generatorSupportDefinition?: ControllerGeneratorSupportModeDefinition;
            pvFieldLayoutDefinition?: ControllerPVFieldLayoutDefinition;
            mpptGroupingDefinition?: ControllerMPPTGroupingDefinition;
        }
    ): ControllerCommercialArchitectureHintSummary {
        return {
            ...preview,
            architectureModeDefinition: definitions.architectureModeDefinition || {
                label: config.commercialArchitectureMode || 'Auto',
                summary: ''
            },
            generatorSupportDefinition: definitions.generatorSupportDefinition || {
                label: config.generatorSupportMode || 'None',
                summary: ''
            },
            pvFieldLayoutDefinition: definitions.pvFieldLayoutDefinition || {
                label: config.pvFieldLayout || 'Single Field',
                summary: ''
            },
            mpptGroupingDefinition: definitions.mpptGroupingDefinition || {
                label: config.mpptGroupingMode || 'Auto',
                summary: ''
            }
        };
    },

    summarizeBusinessContext(input: {
        config: Partial<ControllerSystemConfig>;
        profile?: ControllerBusinessProfileDefinition;
        operatingIntent?: ControllerOperatingIntentDefinition;
        continuityClass?: ControllerContinuityClassDefinition;
        operatingSchedule?: ControllerOperatingScheduleDefinition;
    }): ControllerBusinessContextEvaluationSummary {
        const { config, profile, operatingIntent, continuityClass, operatingSchedule } = input;
        const profileKey = config.businessProfile || 'custom_mixed_site';
        const operatingIntentKey = config.operatingIntent || 'backup_only';
        const continuityKey = config.continuityClass || 'business_critical';
        const operatingScheduleKey = config.operatingSchedulePreset || 'business_day';
        const phaseType = config.phaseType || 'single';
        const systemType = config.systemType || 'off_grid';
        const autonomyDays = Number(config.autonomyDays) || 0;

        const phaseLabel = {
            single: 'single-phase',
            split: 'split-phase',
            three_phase: '3-phase'
        }[phaseType] || 'single-phase';
        const systemTypeLabel = {
            off_grid: 'off-grid',
            hybrid: 'hybrid',
            grid_tie: 'grid-tie'
        }[systemType] || 'off-grid';
        const phaseStanceLabel = {
            neutral: 'Topology follows the measured load mix',
            single_default: 'Single-phase is the normal starting point',
            conditional_3phase: '3-phase depends on the final machine schedule',
            review_3phase: '3-phase review is strongly justified'
        }[profile?.phaseStance || 'neutral'] || 'Topology follows the measured load mix';

        const preferredSystemTypes = operatingIntent?.preferredSystemTypes || [];
        const preferredSystemLabel = preferredSystemTypes
            .map(type => ({
                off_grid: 'off-grid',
                hybrid: 'hybrid',
                grid_tie: 'grid-tie'
            }[type] || type))
            .join(' or ');

        const phaseFit: ControllerBusinessFitSummary = {
            status: 'pass',
            penalty: 0,
            detail: `${profile?.phaseGuidance || 'Confirm phase arrangement from the actual load schedule.'} Current plan: ${phaseLabel}.`,
            openItem: '',
            risk: ''
        };

        if (profile?.phaseStance === 'single_default' && phaseType === 'three_phase') {
            phaseFit.status = 'warn';
            phaseFit.penalty = 4;
            phaseFit.detail = `${profile.label} normally starts as single-phase. Keep the current 3-phase layout only if the real machine list and service arrangement justify it.`;
            phaseFit.openItem = 'Reconfirm that the selected 3-phase topology is justified by the actual machine list and service arrangement.';
        } else if (profile?.phaseStance === 'conditional_3phase') {
            phaseFit.detail = phaseType === 'three_phase'
                ? `${profile.label} can justify 3-phase, and the current plan already assumes it. Keep validating against the real machine schedule.`
                : `${profile.phaseGuidance} The current plan stays ${phaseLabel} until the machine list proves that a 3-phase design is worth it.`;
        } else if (profile?.phaseStance === 'review_3phase') {
            if (phaseType === 'three_phase') {
                phaseFit.detail = `${profile.label} usually needs 3-phase review, and the current topology aligns with that expectation.`;
            } else {
                phaseFit.status = 'warn';
                phaseFit.penalty = 8;
                phaseFit.detail = `${profile?.phaseGuidance} The current ${phaseLabel} selection is acceptable only as a selective-load or early scoping path until the phase review is closed.`;
                phaseFit.openItem = 'Review the machine schedule and service arrangement to confirm whether this job needs a full 3-phase design or only selected critical-load coverage.';
                phaseFit.risk = `${profile?.label} sites often become phase-limited if the topology is left unreviewed.`;
            }
        }

        const systemFit: ControllerBusinessFitSummary = {
            status: 'pass',
            penalty: 0,
            detail: preferredSystemTypes.length > 0 && preferredSystemTypes.includes(systemType)
                ? `${operatingIntent?.label || 'Operating intent'} fits the selected ${systemTypeLabel} path.`
                : `${operatingIntent?.label || 'Operating intent'} typically fits ${preferredSystemLabel || 'the selected path'}, so reconfirm whether ${systemTypeLabel} is the right delivery model.`,
            openItem: '',
            risk: ''
        };

        if (preferredSystemTypes.length > 0 && !preferredSystemTypes.includes(systemType)) {
            systemFit.status = 'warn';
            systemFit.penalty = 6;
            systemFit.openItem = 'Reconfirm whether the selected system type matches the stated operating intent before the quote is finalized.';
        }

        if (operatingIntentKey === 'full_offgrid' && ['process_critical', 'product_loss_critical'].includes(continuityKey) && autonomyDays < 1.5) {
            systemFit.status = 'warn';
            systemFit.penalty = Math.max(systemFit.penalty, 6);
            systemFit.detail = `${operatingIntent?.label || 'Operating intent'} for a ${(continuityClass?.label || 'business critical').toLowerCase()} site usually needs deeper autonomy, redundancy, or assisted backup than the current ${autonomyDays} day target suggests.`;
            systemFit.openItem = 'Increase autonomy or document the assisted-backup path if the site truly expects full off-grid continuity.';
            systemFit.risk = 'High-criticality sites should not depend on a lean autonomy target without a clear contingency plan.';
        }

        return {
            profileKey,
            operatingIntentKey,
            continuityKey,
            profile,
            operatingIntent,
            continuityClass,
            operatingScheduleKey,
            operatingSchedule,
            phaseType,
            phaseLabel,
            systemType,
            systemTypeLabel,
            phaseStanceLabel,
            preferredSystemTypes,
            preferredSystemLabel,
            phaseFit,
            systemFit,
            recommendedIntentMatches: operatingIntentKey === profile?.recommendedIntent,
            recommendedContinuityMatches: continuityKey === profile?.recommendedContinuity,
            recommendedScheduleMatches: operatingScheduleKey === profile?.recommendedSchedule,
            identityLine: `${profile?.label || 'Custom / Mixed Site'} · ${operatingIntent?.label || 'Backup-Only Resilience'} · ${continuityClass?.label || 'Business Critical'}`
        };
    },

    summarizeOperationalSchedule(input: {
        config: Partial<ControllerSystemConfig>;
        aggregation: Partial<ControllerAggregationResult>;
        schedule?: ControllerOperatingScheduleDefinition;
        roleDefinitions: Record<string, { label: string; summary: string }>;
        criticalityDefinitions: Record<string, { label: string; summary: string }>;
    }): ControllerOperationalScheduleSummaryPayload {
        const { config, aggregation, schedule, roleDefinitions, criticalityDefinitions } = input;
        const resolvedSchedule = schedule || {
            label: 'Business Hours (8am-6pm)',
            summary: '',
            operatingDaysPerWeek: 6,
            prefersDaytimeShift: true,
            expectsNightContinuity: false,
            preservationFocus: false
        };
        const profile: Partial<ControllerOperationalProfile> = aggregation.operationalProfile || {};
        const dailyWh = aggregation.dailyEnergyWh || 0;
        const pct = (value: number) => dailyWh > 0 ? Math.round((value / dailyWh) * 100) : 0;
        const overnightCriticalShare = pct(profile.overnightCriticalWh || 0);
        const overnightEssentialShare = pct(profile.overnightEssentialWh || 0);
        const daytimeProcessShare = (profile.totalProcessWh || 0) > 0
            ? Math.round(((profile.daytimeProcessWh || 0) / profile.totalProcessWh) * 100)
            : 0;
        const preservationShare = pct(profile.preservationWh || 0);
        const deferrableShare = pct(profile.deferrableWh || 0);
        const shiftableShare = pct(profile.daytimeShiftableWh || 0);

        let status: ControllerOperationalScheduleSummaryPayload['status'] = 'pass';
        let penalty = 0;
        let detail = `${resolvedSchedule.label} fits the current load mix without a major schedule contradiction.`;
        let openItem = '';
        let risk = '';

        if (resolvedSchedule.prefersDaytimeShift && (profile.totalProcessWh || 0) > 0 && daytimeProcessShare < 60) {
            status = 'warn';
            penalty = Math.max(penalty, 8);
            detail = `${resolvedSchedule.label} expects more process work in solar hours, but only ${daytimeProcessShare}% of process energy is currently modeled in daytime windows.`;
            openItem = 'Move more process equipment into sun hours or change the operating schedule to match the real production pattern.';
            risk = 'The current schedule posture overstates how much of the process demand can be carried directly by PV.';
        }

        if (!resolvedSchedule.expectsNightContinuity && overnightCriticalShare > 35) {
            status = overnightCriticalShare > 50 ? 'fail' : 'warn';
            penalty = Math.max(penalty, overnightCriticalShare > 50 ? 12 : 8);
            detail = `${resolvedSchedule.label} is daytime-led, but ${overnightCriticalShare}% of daily energy still lands in critical overnight duty.`;
            openItem = 'Review whether the site really behaves as a daytime-led operation or whether continuity loads need a stronger night-support design.';
            risk = 'Night burden is high enough to weaken a solar-first or business-hours-only operating story.';
        } else if (resolvedSchedule.preservationFocus && preservationShare < 15) {
            status = 'warn';
            penalty = Math.max(penalty, 4);
            detail = `${resolvedSchedule.label} was selected, but only ${preservationShare}% of daily energy is tagged as refrigeration or preservation load.`;
            openItem = 'Confirm whether the chosen schedule is correct or retag the refrigeration and preservation loads more precisely.';
        } else if (resolvedSchedule.expectsNightContinuity && overnightCriticalShare >= 15) {
            detail = `${resolvedSchedule.label} matches the current overnight continuity burden (${overnightCriticalShare}% critical, ${overnightEssentialShare}% essential overnight energy).`;
        } else if (resolvedSchedule.prefersDaytimeShift && shiftableShare >= 25) {
            detail = `${resolvedSchedule.label} aligns well: about ${shiftableShare}% of daily energy is already modeled as shiftable or daytime-only demand.`;
        }

        const roleRows: ControllerSummaryShareRow[] = Object.entries(roleDefinitions)
            .map(([key, definition]) => ({
                key,
                label: definition.label,
                valueWh: profile.energyByRoleWh?.[key] || 0,
                sharePct: pct(profile.energyByRoleWh?.[key] || 0),
                summary: definition.summary
            }))
            .filter(row => row.valueWh > 0);

        const criticalityRows: ControllerSummaryShareRow[] = Object.entries(criticalityDefinitions)
            .map(([key, definition]) => ({
                key,
                label: definition.label,
                valueWh: profile.energyByCriticalityWh?.[key] || 0,
                sharePct: pct(profile.energyByCriticalityWh?.[key] || 0),
                summary: definition.summary
            }))
            .filter(row => row.valueWh > 0);

        const fitLabel = status === 'fail' ? 'Schedule mismatch' : status === 'warn' ? 'Needs schedule review' : 'Schedule aligned';
        const highlight = status === 'fail'
            ? `Overnight critical burden is ${overnightCriticalShare}% of daily energy.`
            : status === 'warn'
                ? `${daytimeProcessShare}% of process energy is modeled in daytime windows.`
                : `${shiftableShare}% of daily energy is already positioned for daytime shifting.`;

        return {
            scheduleKey: config.operatingSchedulePreset || 'business_day',
            schedule: resolvedSchedule,
            status,
            fitLabel,
            penalty,
            detail,
            openItem,
            risk,
            highlight,
            overnightCriticalWh: profile.overnightCriticalWh || 0,
            overnightCriticalShare,
            overnightEssentialWh: profile.overnightEssentialWh || 0,
            overnightEssentialShare,
            daytimeProcessWh: profile.daytimeProcessWh || 0,
            daytimeProcessShare,
            preservationWh: profile.preservationWh || 0,
            preservationShare,
            deferrableWh: profile.deferrableWh || 0,
            deferrableShare,
            shiftableWh: profile.daytimeShiftableWh || 0,
            shiftableShare,
            roleRows,
            criticalityRows,
            loadBreakdown: profile.loadBreakdown || []
        };
    },

    summarizeProjectSnapshot(input: ControllerProjectSnapshotInput): ControllerProjectSnapshotSummary {
        const { normalizedSnapshot, regionProfiles, businessProfileLabel } = input;
        const formState = normalizedSnapshot.formState || {};
        const locationKey = formState.location?.value || 'generic';
        const locationName = regionProfiles[locationKey]?.name || 'Custom';
        const audienceMode = formState.audienceMode?.value === 'client' ? 'Client Estimate' : 'Installer Design';
        const systemTypeLabels: Record<string, string> = {
            off_grid: 'Off-Grid',
            hybrid: 'Hybrid',
            grid_tie: 'Grid-Tie'
        };
        const systemType = systemTypeLabels[formState.systemType?.value || 'off_grid'] || 'Off-Grid';

        return {
            locationName,
            audienceMode,
            systemType,
            businessProfileLabel,
            applianceCount: Array.isArray(normalizedSnapshot.appliances) ? normalizedSnapshot.appliances.length : 0
        };
    }
};
