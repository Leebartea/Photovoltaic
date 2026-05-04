export type PhaseType = 'single' | 'split' | 'three_phase';
export type PhaseAssignment = 'auto' | 'l1' | 'l2' | 'l3' | 'three_phase';
export type LoadRole = 'base' | 'process' | 'refrigeration' | 'operator_peak' | 'discretionary';
export type LoadCriticality = 'critical' | 'essential' | 'deferrable';
export type StatusLevel = 'pass' | 'warn' | 'fail';
export type ToneLevel = 'green' | 'amber' | 'red';
export type PhaseStatus = 'ok' | 'heavy' | 'limiting';

export interface WarningBlockCarrier {
    warnings?: string[];
    blocks?: string[];
    suggestions?: string[];
}

export interface LabeledSummaryDefinition {
    label: string;
    summary: string;
}

export interface BusinessProfileDefinition extends LabeledSummaryDefinition {
    badge: string;
    phaseStance: string;
    phaseGuidance: string;
    recommendedIntent: string;
    recommendedContinuity: string;
    recommendedSchedule: string;
    sampleTemplateId?: string;
}

export interface OperatingIntentDefinition extends LabeledSummaryDefinition {
    preferredSystemTypes: string[];
}

export interface ContinuityClassDefinition extends LabeledSummaryDefinition {}
export type TeamSeatPermission =
    | 'shared_read'
    | 'audit_read'
    | 'company_profile_publish'
    | 'team_handback_publish'
    | 'team_roster_publish'
    | 'team_seat_publish';

export interface TeamRosterRoleDefinition extends LabeledSummaryDefinition {
    defaultHint: string;
    permissions?: TeamSeatPermission[];
}

export interface TeamSeatStateDefinition extends LabeledSummaryDefinition {
    permissionMode: 'full' | 'read_only' | 'blocked';
}

export interface TeamSeatRecoveryActionDefinition extends LabeledSummaryDefinition {
    requiresAccessCode?: boolean;
    requiresApproval?: boolean;
    clearsLockout?: boolean;
    invalidatesSessions?: boolean;
}

export interface OperatingScheduleDefinition extends LabeledSummaryDefinition {
    operatingDaysPerWeek: number;
    prefersDaytimeShift: boolean;
    expectsNightContinuity: boolean;
    preservationFocus: boolean;
}

export interface CommercialArchitectureModeDefinition extends LabeledSummaryDefinition {}

export interface GeneratorSupportModeDefinition extends LabeledSummaryDefinition {}

export interface PVFieldLayoutDefinition extends LabeledSummaryDefinition {}

export interface MPPTGroupingDefinition extends LabeledSummaryDefinition {}

export interface PlantScopeModeDefinition extends LabeledSummaryDefinition {}

export interface DistributionTopologyDefinition extends LabeledSummaryDefinition {}

export interface InterconnectionScopeDefinition extends LabeledSummaryDefinition {}

export interface CommercialArchitectureProfileDefaults {
    boardStrategy: string;
    generatorSupportMode?: string;
    pvFieldLayout: string;
    mpptGrouping: string;
}

export interface PlantScopingProfileDefaults {
    plantScope: string;
    distributionTopology: string;
    interconnectionScope: string;
}

export interface BatteryThroughputThresholds {
    readyUtilizationPct: number;
    tightUtilizationPct: number;
    failUtilizationPct: number;
    emergencySurgeFactor: number;
    tightStressIndex: number;
    failStressIndex: number;
}

export interface CommercialDecisionDefinition extends LabeledSummaryDefinition {
    badge: string;
    preferredSystemTypes: string[];
    preferredIntents: string[];
}

export interface CommercialDecisionThresholds {
    solarCoverageReadyPct: number;
    solarCoverageWorkingPct: number;
    averageBackupReadyHours: number;
    averageBackupBridgeHours: number;
    overnightCriticalReadyCoveragePct: number;
    overnightProtectedWorkingCoveragePct: number;
    daytimeProcessReadyPct: number;
    daytimeProcessWorkingPct: number;
    deferrableSelectivePct: number;
    shiftableUsefulPct: number;
    preservationDominantPct: number;
    protectedPeakSelectivePct: number;
    generatorCoverageReadyPct: number;
    generatorCoverageWorkingPct: number;
}

export type PremiumCapabilityCategory =
    | 'core'
    | 'commercial'
    | 'workspace'
    | 'branding'
    | 'authority'
    | 'plant'
    | 'integrations';

export interface PremiumCapabilityFeature extends LabeledSummaryDefinition {
    category: PremiumCapabilityCategory;
}

export interface PremiumCapabilityTier extends LabeledSummaryDefinition {
    badge: string;
    audience: string[];
    monthlyAnchor: string;
    annualAnchor: string;
    keyFeatures: string[];
    rolloutPhase: string;
    gatingRule: string;
}

export type PremiumEntitlementSource = 'community' | 'trial' | 'local_license' | 'server_sync';
export type PremiumEntitlementState = 'active' | 'grace' | 'expired';
export type BackendRuntimeSource = 'disabled' | 'explicit' | 'window_config' | 'local_storage';

export interface PremiumEntitlementRecord {
    planKey: string;
    source: PremiumEntitlementSource;
    grantedCapabilities: string[];
    expiresAt?: string | null;
    offlineGraceDays?: number;
    issuedAt?: string | null;
    lastVerifiedAt?: string | null;
    note?: string;
}

export interface PremiumEntitlementResolution extends PremiumEntitlementRecord {
    effectivePlanKey: string;
    effectiveCapabilities: string[];
    graceEndsAt: string | null;
    state: PremiumEntitlementState;
    isPremium: boolean;
    statusLabel: string;
    summary: string;
}

export interface PremiumCapabilityAccess {
    featureKey: string;
    feature: PremiumCapabilityFeature | null;
    requiredTierKey: string;
    requiredTier: PremiumCapabilityTier | null;
    granted: boolean;
    source: PremiumEntitlementSource;
    state: PremiumEntitlementState;
    availabilityLabel: string;
    summary: string;
    upgradeSummary: string;
}

export interface BackendRuntimeConfig {
    enabled?: boolean;
    apiBaseUrl?: string;
    installationKey?: string;
    deviceLabel?: string;
    apiKey?: string;
    sessionToken?: string;
    requestTimeoutMs?: number;
    companyProfilesEndpoint?: string;
    teamHandbacksEndpoint?: string;
    teamRosterEndpoint?: string;
    teamSeatsEndpoint?: string;
    teamSeatRecoveryEndpoint?: string;
    teamSeatRecoveryCodeIssueEndpoint?: string;
    teamSeatRecoveryCodeRedeemEndpoint?: string;
    teamSeatInviteIssueEndpoint?: string;
    teamSeatInviteRedeemEndpoint?: string;
    seatSessionEndpoint?: string;
    seatSessionRenewEndpoint?: string;
    seatSessionRevokeEndpoint?: string;
    auditLogEndpoint?: string;
    note?: string;
}

export interface BackendRuntimeResolution extends BackendRuntimeConfig {
    enabled: boolean;
    apiBaseUrl: string;
    installationKey: string;
    deviceLabel: string;
    apiKey?: string;
    sessionToken?: string;
    requestTimeoutMs: number;
    storageKey: string;
    source: BackendRuntimeSource;
    statusLabel: string;
    summary: string;
    canSync: boolean;
    resolveEndpoint: string;
    healthEndpoint: string;
    companyProfilesEndpoint: string;
    teamHandbacksEndpoint: string;
    teamRosterEndpoint: string;
    teamSeatsEndpoint: string;
    teamSeatRecoveryEndpoint: string;
    teamSeatRecoveryCodeIssueEndpoint: string;
    teamSeatRecoveryCodeRedeemEndpoint: string;
    teamSeatInviteIssueEndpoint: string;
    teamSeatInviteRedeemEndpoint: string;
    seatSessionEndpoint: string;
    seatSessionRenewEndpoint: string;
    seatSessionRevokeEndpoint: string;
    auditLogEndpoint: string;
}

export interface BackendEntitlementSyncResult {
    ok: boolean;
    status: number;
    message: string;
    entitlement?: PremiumEntitlementRecord | null;
    syncedAt?: string | null;
    backendLabel?: string;
    raw?: Record<string, unknown> | null;
}

export interface ResolvedDefinition<TDefinition extends LabeledSummaryDefinition = LabeledSummaryDefinition> {
    selectedKey: string;
    selectedDefinition: TDefinition;
    resolvedKey: string;
    definition: TDefinition;
}

export interface CommercialBoardStrategyResolution extends ResolvedDefinition<CommercialArchitectureModeDefinition> {}

export interface MPPTGroupingResolution extends ResolvedDefinition<MPPTGroupingDefinition> {}

export interface PlantScopeResolution extends ResolvedDefinition<PlantScopeModeDefinition> {}

export interface DistributionTopologyResolution extends ResolvedDefinition<DistributionTopologyDefinition> {}

export interface InterconnectionScopeResolution extends ResolvedDefinition<InterconnectionScopeDefinition> {}

export interface SubmissionProfile {
    label: string;
    summary: string;
    intakeLabel: string;
    technicalLabel: string;
    offGridApprovalLabel: string;
    utilityApprovalLabel: string;
    closeoutLabel: string;
    intakeDeliverables: string[];
    technicalDeliverables: string[];
    offGridApprovalDeliverables: string[];
    utilityApprovalDeliverables: string[];
    closeoutDeliverables: string[];
    notes: string[];
}

export type SubmissionProfileOptions = Partial<SubmissionProfile>;

export interface InverterMarketProfile {
    label: string;
    sizes: number[];
    marketRange: Record<number, [number, number]>;
}

export interface BatteryChemistrySpec {
    name: string;
    maxDoD: number;
    cycleLife: number;
    chargeEfficiency: number;
    dischargeEfficiency: number;
    maxChargeRate: number;
    maxDischargeRate: number;
    selfDischargeDaily: number;
    cellVoltage: number;
    moduleVoltage?: number;
    cellsPerModule?: number;
}

export interface BatteryModuleCatalogEntry {
    kWh: number;
    ah: number;
    label: string;
    note: string;
}

export interface BatteryModuleCatalog {
    nominalVoltage: number;
    cellsPerModule: number;
    cellVoltage: number;
    catalog: BatteryModuleCatalogEntry[];
}

export interface RegionProfile {
    name: string;
    region: string;
    acVoltage: number;
    frequency: number;
    phaseType: PhaseType;
    inverterMarket: string;
    avgPSH: number;
    ambientTempMin: number;
    ambientTempMax: number;
    climate: string;
    regulatoryNote: string;
    gridNote?: string;
    vatPct?: number;
    currencyDisplay?: string;
    fxRateToUSD?: number;
}

export interface BusinessContextIntentSummary {
    label?: string;
    summary?: string;
    preferredSystemTypes?: string[];
}

export interface BusinessContextSummary {
    continuityKey?: string;
    continuityLabel?: string;
    operatingIntentKey?: string;
    operatingIntent?: BusinessContextIntentSummary;
    operatingIntentLabel?: string;
    businessProfileKey?: string;
    businessProfileLabel?: string;
    operatingScheduleKey?: string;
    operatingScheduleLabel?: string;
    systemTypeLabel?: string;
    topologyStance?: string;
    topologyGuidance?: string;
    phaseRecommendation?: string;
    continuitySummary?: string;
    intentSummary?: string;
}

export interface LocationProfileSummary {
    name?: string;
    region?: string;
    gridNote?: string;
    regulatoryNote?: string;
    climate?: string;
    phaseType?: PhaseType;
    acVoltage?: number;
    frequency?: number;
    inverterMarket?: string;
    avgPSH?: number;
}

export interface SystemConfig {
    location?: string;
    acVoltage: number;
    frequency: number;
    phaseType: PhaseType;
    inverterMarket: string;
    avgPSH: number;
    ambientTempMin: number;
    ambientTempMax: number;
    climate?: string;
    designMargin: number;
    autonomyDays: number;
    inverterSurgeMultiplier: number;
    inverterTechnology?: string;
    batteryChemistry?: string;
    continuityClass?: string;
    businessProfile?: string;
    operatingSchedulePreset?: string;
    systemType?: string;
    operatingIntent?: string;
    commercialArchitectureMode?: string;
    generatorSupportMode?: string;
    pvFieldLayout?: string;
    mpptGroupingMode?: string;
    plantScopeMode?: string;
    distributionTopologyMode?: string;
    interconnectionScopeMode?: string;
    utilityPacketMode?: string;
    meteringPostureMode?: string;
    studyInputStatusMode?: string;
    studyTrackMode?: string;
    commissioningPathMode?: string;
    utilityPacketStageMode?: string;
    utilityCaseStatusMode?: string;
    utilityFilingChannelMode?: string;
    utilityHoldPointMode?: string;
    utilityResponsePathMode?: string;
    utilityProtectionReviewMode?: string;
    utilityExportControlMode?: string;
    utilityRelaySchemeMode?: string;
    utilityTransferSchemeMode?: string;
    oneLinePackStatusMode?: string;
    protectionPackStatusMode?: string;
    witnessPackStatusMode?: string;
    witnessPartyMode?: string;
    witnessEvidenceMode?: string;
    utilityApplicationReference?: string;
    utilityCaseOwner?: string;
    utilityStudyOwner?: string;
    utilityStudyNodeReference?: string;
    utilityFaultLevelReference?: string;
    utilitySubmissionDate?: string;
    utilityFaultBasisNote?: string;
    utilityRevisionLabel?: string;
    utilityNextActionOwner?: string;
    utilityNextActionDueDate?: string;
    utilityNextAction?: string;
    utilitySubmissionTrail?: string;
    utilityEngineeringNotes?: string;
    utilityReviewComments?: string;
    generatorSizeKVA?: number | string;
    businessContext?: BusinessContextSummary;
    locationProfile?: LocationProfileSummary;
    orientationFactor?: number;
    tiltFactor?: number;
    [key: string]: unknown;
}

export interface ApplianceInput {
    name: string;
    quantity: number;
    ratedPowerW: number;
    efficiency: number;
    powerFactor: number;
    surgeFactor: number;
    dailyUsageHours: number;
    dutyCycle: number;
    loadType: string;
    phaseAssignment?: PhaseAssignment | string;
    isAC?: boolean;
    isSimultaneous?: boolean;
    daytimeRatio?: number;
    dutyFrequency?: string;
    isDaytimeOnly?: boolean | string;
    machinePresetId?: string;
    machineProfileLabel?: string;
    loadRole?: LoadRole | string;
    loadCriticality?: LoadCriticality | string;
    motorSubType?: string;
    canStagger?: string;
    isIndustrialSewing?: boolean;
    [key: string]: unknown;
}

export interface OperationalLoadBreakdownItem {
    index: number;
    name: string;
    loadRole: string;
    loadCriticality: string;
    dailyWh: number;
    daytimeWh: number;
    nighttimeWh: number;
}

export interface OperationalProfile {
    scheduleKey: string;
    scheduleLabel: string;
    scheduleSummary: string;
    energyByRoleWh: Record<string, number>;
    energyByCriticalityWh: Record<string, number>;
    overnightCriticalWh: number;
    overnightEssentialWh: number;
    daytimeProcessWh: number;
    totalProcessWh: number;
    preservationWh: number;
    deferrableWh: number;
    operatorPeakWh: number;
    daytimeShiftableWh: number;
    continuousBaseWh: number;
    loadBreakdown: OperationalLoadBreakdownItem[];
}

export interface PhaseNonSimultaneousLoad {
    apparentPowerVA: number;
    label: string;
}

export interface PhaseAssignedLoad {
    label: string;
    apparentPowerVA: number;
    startingVA: number;
    isMotor: boolean;
    isSimultaneous: boolean;
}

export interface PhaseBucketSummary {
    key: string;
    label: string;
    realPowerW: number;
    apparentPowerVA: number;
    peakSimultaneousVA: number;
    designVA: number;
    peakSurgeVA: number;
    designSurgeVA: number;
    currentA: number;
    designCurrentA: number;
    surgeCurrentA: number;
    designSurgeCurrentA: number;
    dailyEnergyWh: number;
    singlePhaseVA: number;
    threePhaseVA: number;
    nonSimultaneousMaxVA: number;
    autoAssignedUnits: number;
    fixedAssignedUnits: number;
    topLoads: string[];
    sharePct: number;
    deviationFromAverageVA: number;
    status: PhaseStatus;
    statusLabel: string;
}

export interface PhaseApplianceAssignment {
    index: number;
    name: string;
    requestedPhase: PhaseAssignment;
    requestedLabel: string;
    resolvedCounts: Record<'l1' | 'l2' | 'l3', number>;
    resolvedSummary: string;
    quantity: number;
}

export interface PhaseAllocationResult extends WarningBlockCarrier {
    phaseVoltage: number;
    totalPeakVA: number;
    averagePhaseVA: number;
    maxDeviationVA: number;
    imbalancePct: number;
    classification: string;
    classificationLabel: string;
    classificationMessage: string;
    limitingPhase: string;
    limitingPhasePeakVA: number;
    limitingPhaseDesignVA: number;
    limitingPhaseCurrentA: number;
    surgeLimitingPhase: string;
    surgeLimitingPhasePeakVA: number;
    surgeLimitingPhaseDesignVA: number;
    surgeLimitingPhaseCurrentA: number;
    equalLegClusterFloorVA: number;
    balancedDesignTargetVA: number;
    redistributionPenaltyVA: number;
    neutralCurrentA: number;
    autoAssignedUnits: number;
    fixedAssignedUnits: number;
    threePhaseUnits: number;
    phases: PhaseBucketSummary[];
    recommendations: string[];
    applianceAssignments: PhaseApplianceAssignment[];
}

export interface DominantMotorSummary {
    name: string;
    watt: number;
    surgeVA: number;
    surgeFactor: number;
}

export interface ServoUpgradeAdvice {
    clutchCount: number;
    clutchTotalW: number;
    estimatedEnergySavingsW: number;
    estimatedSurgeReductionVA: number;
    message: string;
}

export interface AggregationResult extends WarningBlockCarrier {
    totalRealPowerW: number;
    totalApparentPowerVA: number;
    peakSimultaneousVA: number;
    highestSurgeVA: number;
    dailyEnergyWh: number;
    daytimeEnergyWh: number;
    nighttimeEnergyWh: number;
    acPowerVA: number;
    dcPowerW: number;
    motorPowerVA: number;
    designContinuousVA: number;
    designSurgeVA: number;
    designStaggeredSurgeVA: number;
    motorCount: number;
    complianceRisk?: string;
    complianceNote?: string;
    hasIndustrialSewing?: boolean;
    hasCompressor?: boolean;
    industrialMotorCount?: number;
    dominantMotor?: DominantMotorSummary | null;
    servoUpgradeAdvice?: ServoUpgradeAdvice | null;
    clutchMotorCount?: number;
    servoMotorCount?: number;
    phaseAllocation?: PhaseAllocationResult | null;
    operationalProfile?: OperationalProfile;
    [key: string]: unknown;
}

export interface InverterSizingResult extends WarningBlockCarrier {
    continuousVARequired: number;
    surgeVARequired: number;
    recommendedSizeVA: number;
    autoSuggestedSizeVA?: number;
    recommendedBalancedSizeVA?: number;
    motorBufferPct?: number;
    staggeredSizeVA?: number;
    staggeredSurgeVA?: number;
    motorCount?: number;
    dominantMotor?: DominantMotorSummary | null;
    dcBusVoltage: number;
    dcInputCurrentContinuous: number;
    dcInputCurrentSurge: number;
    complianceRisk?: string;
    complianceNote?: string;
    hasIndustrialSewing?: boolean;
    hasCompressor?: boolean;
    industrialMinVA?: number;
    servoUpgradeAdvice?: ServoUpgradeAdvice | null;
    complianceBuffer?: number;
    managedMode?: ManagedModeResult | null;
    clusterPlan?: ThreePhaseClusterPlanResult | null;
    [key: string]: unknown;
}

export interface BatteryModuleMatch {
    kWh: number;
    ah: number;
    label: string;
    note: string;
    stackCount: number;
    stackUnit?: BatteryModuleCatalogEntry;
}

export interface BatteryTier {
    label: string;
    ah: number;
    kWh: number;
    strings: number;
    nominalKWh: number;
    note: string;
    module: BatteryModuleMatch | null;
}

export interface BatteryTierSet {
    economy: BatteryTier;
    balanced: BatteryTier;
    expansion: BatteryTier;
}

export interface BatteryDesignBasis {
    dailyLoadWh: number;
    autonomyDays: number;
    dod: number;
    dischargeEfficiency: number;
    designMargin: number;
    effectiveUsableFactor: number;
    requiredNominalKWh: number;
    climateNote: string | null;
}

export interface BatteryCapacityRange {
    min: number;
    balanced: number;
    max: number;
    minKWh: number;
    balancedKWh: number;
    maxKWh: number;
}

export interface BatterySizingResult extends WarningBlockCarrier {
    chemistry: string;
    chemistryName: string;
    usableCapacityWh: number;
    totalCapacityWh: number;
    totalCapacityAh: number;
    bankVoltage: number;
    bankVoltageNominal?: number;
    cellsInSeries?: number;
    stringsInParallel?: number;
    totalCells?: number;
    maxDischargeCurrent?: number;
    maxChargeCurrent?: number;
    peakLoadCurrent?: number;
    recommendedAhPerCell?: number;
    requiredNominalKWh?: number;
    designBasis?: BatteryDesignBasis;
    tiers?: BatteryTierSet;
    capacityRange?: BatteryCapacityRange;
    moduleMatch?: BatteryModuleMatch | null;
    isLithium?: boolean;
    effectiveBankVoltage?: number;
    practical?: BatteryPracticalResult | null;
    [key: string]: unknown;
}

export interface PVArrayResult extends WarningBlockCarrier {
    panelsInSeries: number;
    stringsInParallel: number;
    totalPanels: number;
    stringVmp: number;
    stringVoc: number;
    stringVocCold: number;
    arrayImp: number;
    arrayIsc: number;
    arrayWattage: number;
    deratedOutput: number;
    dailyEnergyWh: number;
    pvAccountForDaytimeLoad?: boolean;
    daytimeLoadWh?: number;
    orientationFactor?: number;
    tiltFactor?: number;
    combinedPVFactor?: number;
    practical?: PVPracticalResult | null;
    [key: string]: unknown;
}

export interface PracticalCondition {
    type: string;
    severity: string;
    text: string;
    detail: string;
}

export interface ManagedLoadClassification {
    continuous: number;
    daily: number;
    weekly: number;
    rare: number;
    daytimeOnly: number;
    motors: number;
    staggerableMotors: number;
}

export interface ManagedExcludedLoad {
    name: string;
    va: number;
    freq?: string;
}

export interface ManagedModeResult {
    managedSizeVA: number;
    managedContinuousVA: number;
    managedSurgeVA: number;
    managedMinVA: number;
    conditions: PracticalCondition[];
    conditionCount: number;
    riskLevel: string;
    riskLabel: string;
    riskDetail: string;
    biggestMotorName: string;
    biggestMotorSurgeDelta: number;
    engineeringVA: number;
    savings: number;
    classification: ManagedLoadClassification;
    inverterTechnology: string;
    techNote: string;
    excludedLoads: ManagedExcludedLoad[];
}

export interface RiskIndexResult {
    level: string;
    deviation: number;
    badge: string;
    color: string;
}

export interface BatteryPracticalResult {
    practicalAh: number;
    practicalWh: number;
    practicalAutonomy: number;
    nighttimeEssentialWh: number;
    daytimeHeavyWh: number;
    engineeringAh: number;
    engineeringWh: number;
    savings: number;
    conditions: PracticalCondition[];
    conditionCount: number;
    riskLevel: string;
    riskLabel: string;
    bankVoltage: number;
}

export interface PVPracticalResult {
    practicalPanels: number;
    practicalArrayWp: number;
    engineeringPanels: number;
    engineeringWp: number;
    savings: number;
    conditions: PracticalCondition[];
    conditionCount: number;
    riskLevel: string;
    riskLabel: string;
    daytimeDirectWh: number;
    nighttimeViasBattery: number;
}

export interface ThreePhaseClusterPhaseSummary {
    key: string;
    label: string;
    moduleCount: number;
    designVA: number;
    designSurgeVA: number;
    continuousCapacityVA: number;
    surgeCapacityVA: number;
    continuousHeadroomVA: number;
    surgeHeadroomVA: number;
    continuousHeadroomPct: number;
    surgeHeadroomPct: number;
    limitingHeadroomPct: number;
    status: string;
    statusLabel: string;
}

export interface ThreePhaseClusterPlanResult extends WarningBlockCarrier {
    enabled: boolean;
    distributionMode: string;
    distributionModeLabel: string;
    moduleRatedVA: number;
    moduleContinuousVA: number;
    moduleSurgeVA: number;
    sourceLabel: string;
    requestedModuleCount: number;
    requestedCountLabel: string;
    totalModuleCount: number;
    totalClusterVA: number;
    totalContinuousCapacityVA: number;
    totalSurgeCapacityVA: number;
    phaseCounts: Record<'l1' | 'l2' | 'l3', number>;
    phaseDistributionLabel: string;
    recommendedAutoPhaseCounts: Record<'l1' | 'l2' | 'l3', number>;
    recommendedAutoCount: number;
    topology: string;
    topologyLabel: string;
    isEqualLeg: boolean;
    status: string;
    statusLabel: string;
    statusNote: string;
    worstHeadroomPct: number;
    worstPhaseKey: string;
    worstPhaseLabel: string;
    strandedContinuousVA: number;
    phases: ThreePhaseClusterPhaseSummary[];
    recommendations: string[];
}

export interface PanelSpec {
    wattage: number;
    vmp: number;
    voc: number;
    imp: number;
    isc: number;
    tempCoeffVoc: number;
    tempCoeffPmax?: number;
}

export interface MPPTInputSpec {
    label: string;
    maxVoltage: number;
    maxOperatingVoltage?: number;
    minVoltage?: number;
    maxCurrent: number;
    maxPower: number;
}

export interface MPPTSpec extends MPPTInputSpec {
    maxChargeCurrent?: number;
    allMPPTs?: MPPTInputSpec[];
}

export interface AdvisoryItem {
    severity?: string;
    title?: string;
    message?: string;
    detail?: string;
    [key: string]: unknown;
}

export interface SupportBucketItem {
    id: number;
    name: string;
    loadRole: string;
    loadRoleLabel: string;
    loadCriticality: string;
    loadCriticalityLabel: string;
    dailyWh: number;
    daytimeWh: number;
    nighttimeWh: number;
    supportBucket: 'protected' | 'assisted' | 'excluded';
    [key: string]: unknown;
}

export interface SupportBucketSummary {
    key: 'protected' | 'assisted' | 'excluded';
    label: string;
    items: SupportBucketItem[];
    count: number;
    criticalCount: number;
    essentialCount: number;
    dailyWh: number;
    daytimeWh: number;
    nighttimeWh: number;
    energySharePct: number;
    daytimeSharePct: number;
    topItems: SupportBucketItem[];
}

export interface PromiseBoundarySummary {
    headline: string;
    detail: string;
    assistDependencyLabel: string;
    bucketLines: {
        protected: string;
        assisted: string;
        excluded: string;
    };
}

export interface SupportSummary {
    key: string;
    label: string;
    status: 'pass' | 'warn' | 'fail';
    tone: string;
    headline: string;
    detail: string;
    runtimeLabel: string;
    runtimeExpectation: string;
    verticalNote: string;
    promiseBoundary: PromiseBoundarySummary;
    warnings: string[];
    openItems: string[];
    risks: string[];
    metrics: {
        protectedBackupHours: number;
        overnightProtectedCoveragePct: number;
        generatorCoveragePct: number;
        protectedPeakSharePct: number;
    };
    buckets: {
        protected: SupportBucketSummary;
        assisted: SupportBucketSummary;
        excluded: SupportBucketSummary;
    };
}

export interface CommercialLoadSubsetSummary {
    count: number;
    dailyWh: number;
    peakVA: number;
    surgeVA: number;
}

export interface CommercialBoardStrategyResult extends CommercialBoardStrategyResolution {
    status: StatusLevel;
    detail: string;
    protectedPeakVA: number;
    protectedDailyWh: number;
    protectedPeakSharePct: number;
    protectedEnergySharePct: number;
    criticalPeakVA: number;
    criticalDailyWh: number;
    deferrablePeakVA: number;
    deferrableDailyWh: number;
    deferrableEnergySharePct: number;
    risk: string;
}

export interface BatteryThroughputSummary {
    status: StatusLevel;
    detail: string;
    continuousCurrentA: number;
    surgeCurrentA: number;
    chargeCurrentA: number;
    maxDischargeCurrentA: number;
    maxChargeCurrentA: number;
    continuousUtilizationPct: number;
    surgeUtilizationPct: number;
    chargeUtilizationPct: number;
    continuousCRate: number;
    surgeCRate: number;
    chargeCRate: number;
    cRateStressIndex: number;
    sharedBankLabel: string;
}

export interface GeneratorSupportSummary {
    key: string;
    definition: GeneratorSupportModeDefinition;
    status: StatusLevel;
    detail: string;
    generatorKVA: number;
    generatorVA: number;
    targetVA: number;
    coveragePct: number;
}

export interface MPPTGroupingSummary extends MPPTGroupingResolution {
    fieldLayoutKey: string;
    fieldLayout: PVFieldLayoutDefinition;
    status: StatusLevel;
    detail: string;
    availableTrackers: number;
    recommendedGroups: number;
    usedTrackers: number;
}

export interface CommercialArchitectureResult extends WarningBlockCarrier {
    status: StatusLevel;
    summary: string;
    boardStrategy: CommercialBoardStrategyResult;
    batteryThroughput: BatteryThroughputSummary;
    generatorSupport: GeneratorSupportSummary;
    mpptGrouping: MPPTGroupingSummary;
}

export interface CommercialArchitecturePreviewSummary {
    resolvedBoardStrategy: CommercialArchitectureModeDefinition;
    resolvedBoardStrategyKey: string;
    resolvedMPPTGrouping: MPPTGroupingDefinition;
    resolvedMPPTGroupingKey: string;
}

export interface CommercialArchitectureHintSummary extends CommercialArchitecturePreviewSummary {
    architectureModeDefinition: CommercialArchitectureModeDefinition;
    generatorSupportDefinition: GeneratorSupportModeDefinition;
    pvFieldLayoutDefinition: PVFieldLayoutDefinition;
    mpptGroupingDefinition: MPPTGroupingDefinition;
}

export interface PlantScopingPreviewSummary {
    resolvedPlantScope: PlantScopeModeDefinition;
    resolvedPlantScopeKey: string;
    resolvedDistributionTopology: DistributionTopologyDefinition;
    resolvedDistributionTopologyKey: string;
    resolvedInterconnectionScope: InterconnectionScopeDefinition;
    resolvedInterconnectionScopeKey: string;
    boundaryHeadline: string;
    boundaryDetail: string;
}

export interface PlantScopingHintSummary extends PlantScopingPreviewSummary {
    plantScopeModeDefinition: PlantScopeModeDefinition;
    distributionTopologyDefinition: DistributionTopologyDefinition;
    interconnectionScopeDefinition: InterconnectionScopeDefinition;
}

export interface PlantScopeSummary extends PlantScopeResolution {
    status: StatusLevel;
    detail: string;
    feederCountEstimate: number;
}

export interface DistributionTopologySummary extends DistributionTopologyResolution {
    status: StatusLevel;
    detail: string;
    feederCountEstimate: number;
    criticalBusRecommended: boolean;
}

export interface InterconnectionScopeSummary extends InterconnectionScopeResolution {
    status: StatusLevel;
    detail: string;
}

export interface PlantStudyBoundarySummary {
    status: StatusLevel;
    label: string;
    detail: string;
    outsideCurrentScope: boolean;
}

export interface PlantFeederScheduleItem {
    key: string;
    label: string;
    supportBucketKey: 'protected' | 'assisted' | 'excluded';
    sourcePathLabel: string;
    sourcePathDetail: string;
    count: number;
    dailyWh: number;
    energySharePct: number;
    connectedLoadW: number;
    maxSurgeFactor: number;
    roleLabels: string[];
}

export interface PlantFeederScheduleSummary {
    status: StatusLevel;
    headline: string;
    detail: string;
    items: PlantFeederScheduleItem[];
}

export interface PlantScopingResult extends WarningBlockCarrier {
    status: StatusLevel;
    summary: string;
    openItems: string[];
    risks: string[];
    plantScope: PlantScopeSummary;
    distributionTopology: DistributionTopologySummary;
    interconnectionScope: InterconnectionScopeSummary;
    studyBoundary: PlantStudyBoundarySummary;
    feederSchedule: PlantFeederScheduleSummary;
}

export interface CommercialDecisionAlternate {
    key: string;
    label: string;
    score: number;
    summary: string;
}

export interface CommercialDecisionScorecard {
    key: string;
    label: string;
    definition?: CommercialDecisionDefinition;
    score: number;
    reasons: string[];
    gaps: string[];
}

export interface CommercialDecisionMetrics {
    solarCoveragePct: number;
    averageBackupHours: number;
    overnightCriticalCoveragePct: number;
    overnightProtectedCoveragePct: number;
    daytimeProcessSharePct: number;
    deferrableSharePct: number;
    shiftableSharePct: number;
    preservationSharePct: number;
    protectedPeakSharePct: number;
}

export interface CommercialDecisionResult extends WarningBlockCarrier {
    key: string;
    label: string;
    definition: CommercialDecisionDefinition;
    badge: string;
    status: StatusLevel;
    tone: ToneLevel;
    score: number;
    headline: string;
    detail: string;
    note: string;
    currentIntentKey: string;
    currentIntentLabel: string;
    currentSystemType: string;
    currentSystemTypeLabel: string;
    isIntentAligned: boolean;
    isSystemTypeAligned: boolean;
    reasons: string[];
    gaps: string[];
    openItems: string[];
    risks: string[];
    alternates: CommercialDecisionAlternate[];
    metrics: CommercialDecisionMetrics;
    scorecards: CommercialDecisionScorecard[];
}

export interface ConfidenceMetricsSummary {
    score: number;
    level: string;
    color: string;
    bg: string;
    invRisk: RiskIndexResult | null;
    battRisk: RiskIndexResult | null;
    pvRisk: RiskIndexResult | null;
    clusterPenalty: number;
    architecturePenalty: number;
    strategyPenalty: number;
}

export interface BusinessFitSummary {
    status: StatusLevel;
    penalty: number;
    detail: string;
    openItem: string;
    risk: string;
}

export interface BusinessContextEvaluationSummary {
    profileKey: string;
    operatingIntentKey: string;
    continuityKey: string;
    profile?: BusinessProfileDefinition;
    operatingIntent?: OperatingIntentDefinition;
    continuityClass?: ContinuityClassDefinition;
    operatingScheduleKey: string;
    operatingSchedule?: OperatingScheduleDefinition;
    phaseType: PhaseType;
    phaseLabel: string;
    systemType: string;
    systemTypeLabel: string;
    phaseStanceLabel: string;
    preferredSystemTypes: string[];
    preferredSystemLabel: string;
    phaseFit: BusinessFitSummary;
    systemFit: BusinessFitSummary;
    recommendedIntentMatches: boolean;
    recommendedContinuityMatches: boolean;
    recommendedScheduleMatches: boolean;
    identityLine: string;
}

export interface SummaryShareRow {
    key: string;
    label: string;
    valueWh: number;
    sharePct: number;
    summary: string;
}

export interface OperationalScheduleSummaryPayload {
    scheduleKey: string;
    schedule?: OperatingScheduleDefinition;
    status: StatusLevel;
    fitLabel: string;
    penalty: number;
    detail: string;
    openItem: string;
    risk: string;
    highlight: string;
    overnightCriticalWh: number;
    overnightCriticalShare: number;
    overnightEssentialWh: number;
    overnightEssentialShare: number;
    daytimeProcessWh: number;
    daytimeProcessShare: number;
    preservationWh: number;
    preservationShare: number;
    deferrableWh: number;
    deferrableShare: number;
    shiftableWh: number;
    shiftableShare: number;
    roleRows: SummaryShareRow[];
    criticalityRows: SummaryShareRow[];
    loadBreakdown: OperationalLoadBreakdownItem[];
}

export interface ProjectSnapshotSummary {
    locationName: string;
    audienceMode: string;
    systemType: string;
    businessProfileLabel: string;
    applianceCount: number;
}

export interface SerializedFormStateEntry {
    value?: string;
    checked?: boolean;
}

export type SerializedFormState = Record<string, SerializedFormStateEntry>;

export interface PanelMismatchGroupState {
    wattage: number;
    vmp: string;
    voc: string;
    imp: string;
    isc: string;
}

export interface PanelMismatchDynamicState {
    enabled: string;
    input: string;
    groupSpecs: PanelMismatchGroupState[];
}

export interface BatteryMixedGroupState {
    index: number;
    voltage: string;
    chemistry: string;
    ageYears: string;
}

export interface BatteryMixedDynamicState {
    toggle: string;
    shorthand: string;
    groups: BatteryMixedGroupState[];
}

export interface ProjectDynamicState {
    panelMismatch?: PanelMismatchDynamicState | null;
    batteryMixed?: BatteryMixedDynamicState | null;
    [key: string]: unknown;
}

export interface ProjectSnapshotMeta {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    appVersion: string;
    source: string;
}

export interface ProjectSnapshot {
    formatVersion: string;
    meta: ProjectSnapshotMeta;
    appliances: ApplianceInput[];
    formState: SerializedFormState;
    dynamicState: ProjectDynamicState;
}

export interface ProposalFlowContext {
    companyName?: string;
    clientName?: string;
    siteName?: string;
    surveyStage?: string;
}

export interface InputSectionDefinition {
    id: string;
    label: string;
    stepLabel: string;
    shortHelp: string;
}

export interface InputSectionQuickStep {
    label: string;
    cardId: string;
    summary: string;
}

export interface InputSectionFlowState {
    isClientMode: boolean;
    proposal: ProposalFlowContext;
    hasAppliances: boolean;
    hasIdentity: boolean;
    hasResults: boolean;
    manualMode: boolean;
    pricingProfile: string;
    supplierPack: string;
    quickSteps: InputSectionQuickStep[];
    nextSectionId: string;
    nextStepCopy: string;
}

export interface InputSectionSummaryContext {
    locationName: string;
    audienceLabel: string;
    systemTypeLabel: string;
    phaseLabel: string;
    businessLabel: string;
    workflowSurfaceLabel: string;
    templateLabel: string;
    projectName: string;
    surveyStageLabel: string;
    pricingLabel: string;
    quoteCurrencyLabel: string;
    equipmentMode: string;
    referenceCount: number;
    applianceCount: number;
    dailyKWh: number;
    hasSavedProject: boolean;
}

export interface WorkflowGuideDefinition {
    title: string;
    meaning: string;
    why: string;
    avoid: string;
    badge?: string;
    sourceType?: 'field' | 'section';
}

export interface PanelConfigurationChecks {
    vocOk: boolean;
    vmpMaxOk: boolean;
    vmpMinOk: boolean;
    currentOk: boolean;
    powerOk: boolean;
    startupOk: boolean;
    panelCountOk?: boolean;
}

export interface PanelConfigurationMargins {
    vocMargin: number;
    currentMargin: number;
    powerUtil: number;
}

export interface PanelConfigurationResult {
    label: string;
    series: number;
    parallel: number;
    totalPanels: number;
    stringVmp: number;
    stringVoc?: number;
    stringVocCold: number;
    arrayImp?: number;
    arrayIsc?: number;
    arrayIscTol: number;
    totalPower: number;
    valid: boolean;
    score: number;
    checks?: PanelConfigurationChecks;
    margins?: PanelConfigurationMargins;
    pros?: string[];
    cons?: string[];
    warnings?: string[];
    blocks?: string[];
    recommended?: boolean;
    vocMargin?: number;
    currentMargin?: number;
    powerUtil?: number;
    requestedPanels?: number;
    delta?: number;
    violations?: string[];
}

export interface NearbyPanelConfiguration {
    label: string;
    series: number;
    parallel: number;
    totalPanels: number;
    requestedPanels: number;
    delta: number;
    stringVmp: number;
    stringVocCold: number;
    arrayIscTol: number;
    totalPower: number;
    vocMargin: number;
    currentMargin: number;
    powerUtil: number;
}

export interface ConfigurationComparisonResult {
    configurations: PanelConfigurationResult[];
    recommended: number;
    userConfig: PanelConfigurationResult | null;
    nearbyValid: NearbyPanelConfiguration[] | null;
}

export interface MPPTAssignment {
    mpptLabel: string;
    mpptIndex: number;
    panels: number;
    requestedPanels?: number;
    series: number;
    parallel: number;
    config: PanelConfigurationResult | null;
    valid: boolean;
    unused: boolean;
    violations?: string[];
}

export interface MultiMPPTDistributionCandidate {
    distribution: number[];
    mpptAssignments: MPPTAssignment[];
    allValid: boolean;
    totalActualPanels: number;
    requestedPanels: number;
    panelDeviation: number;
    totalScore: number;
    label: string;
    recommended?: boolean;
}

export interface MultiMPPTDistributionResult {
    distributions: MultiMPPTDistributionCandidate[];
    recommended: number;
    mpptCount: number;
    totalPanelsRequested: number;
}

export interface SystemResults {
    config?: SystemConfig;
    aggregation: AggregationResult;
    inverter: InverterSizingResult;
    battery: BatterySizingResult;
    pvArray: PVArrayResult;
    configComparison?: ConfigurationComparisonResult;
    multiMPPTResult?: MultiMPPTDistributionResult | null;
    mpptValidation?: WarningBlockCarrier & Record<string, unknown>;
    cables?: WarningBlockCarrier & Record<string, unknown>;
    protection?: WarningBlockCarrier & Record<string, unknown>;
    architecture?: CommercialArchitectureResult;
    plantScoping?: PlantScopingResult;
    decisionStrategy?: CommercialDecisionResult;
    supportSummary?: SupportSummary;
    [key: string]: unknown;
}

export interface ReportMeta {
    generatedAt: string;
    version: string;
}

export interface ReportSummary {
    totalDailyEnergy: number;
    peakLoad: number;
    inverterSize: number;
    batteryCapacity: number;
    pvArraySize: number;
    totalPanels: number;
}

export interface ReportPayload {
    meta: ReportMeta;
    summary: ReportSummary;
    details: SystemResults;
    warnings: string[];
    blocks: string[];
}

export interface DefenseNotesResult {
    hasBlocks: boolean;
    blocks: string[];
    suggestions: string[];
}
