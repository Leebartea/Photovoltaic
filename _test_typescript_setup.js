const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = __dirname;
const tsconfigPath = path.join(root, 'tsconfig.json');
const packagePath = path.join(root, 'package.json');
const buildScriptPath = path.join(root, 'scripts', 'build_artifacts.js');
const typesPath = path.join(root, 'src', 'scripts', 'types', 'pv-types.d.ts');
const defaultsPath = path.join(root, 'src', 'scripts', 'modules', '00-defaults.ts');
const enginesPath = path.join(root, 'src', 'scripts', 'modules', '10-engines.ts');
const controllerPayloadsPath = path.join(root, 'src', 'scripts', 'modules', '25-controller-payloads.ts');
const controllerStatePath = path.join(root, 'src', 'scripts', 'modules', '26-controller-state.ts');
const controllerGuidancePath = path.join(root, 'src', 'scripts', 'modules', '27-controller-guidance.ts');
const reportingPath = path.join(root, 'src', 'scripts', 'modules', '20-reporting.ts');

assert(fs.existsSync(tsconfigPath), 'tsconfig.json should exist');
assert(fs.existsSync(typesPath), 'shared pv-types.d.ts should exist');
assert(fs.existsSync(defaultsPath), 'defaults module should now exist as 00-defaults.ts');
assert(fs.existsSync(enginesPath), 'engines module should now exist as 10-engines.ts');
assert(fs.existsSync(controllerPayloadsPath), 'controller payload helper module should now exist as 25-controller-payloads.ts');
assert(fs.existsSync(controllerStatePath), 'controller state helper module should now exist as 26-controller-state.ts');
assert(fs.existsSync(controllerGuidancePath), 'controller guidance helper module should now exist as 27-controller-guidance.ts');
assert(fs.existsSync(reportingPath), 'reporting module should now exist as 20-reporting.ts');

const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
assert(tsconfig.compilerOptions.allowJs === true, 'tsconfig should enable allowJs');
assert(tsconfig.compilerOptions.checkJs === true, 'tsconfig should enable checkJs');
assert(tsconfig.compilerOptions.noEmit === true, 'tsconfig should enable noEmit');
assert(tsconfig.include.includes('src/scripts/modules/00-defaults.ts'), 'tsconfig should include the defaults TypeScript module');
assert(tsconfig.include.includes('src/scripts/modules/10-engines.ts'), 'tsconfig should include the engines TypeScript module');
assert(tsconfig.include.includes('src/scripts/modules/25-controller-payloads.ts'), 'tsconfig should include the controller payload TypeScript module');
assert(tsconfig.include.includes('src/scripts/modules/26-controller-state.ts'), 'tsconfig should include the controller state TypeScript module');
assert(tsconfig.include.includes('src/scripts/modules/27-controller-guidance.ts'), 'tsconfig should include the controller guidance TypeScript module');
assert(tsconfig.include.includes('src/scripts/modules/20-reporting.ts'), 'tsconfig should include the reporting TypeScript module');

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
assert(packageJson.scripts.typecheck === 'tsc -p tsconfig.json', 'package.json should expose a typecheck script');
assert(packageJson.scripts['test:ts-setup'] === 'node _test_typescript_setup.js', 'package.json should expose the TS setup test');
assert(packageJson.devDependencies.typescript, 'package.json should declare a TypeScript dev dependency');

const buildContent = fs.readFileSync(buildScriptPath, 'utf8');
assert(buildContent.includes("['.ts', '.js']"), 'build should resolve TypeScript modules before JS fallbacks');
assert(buildContent.includes('src/scripts/modules/*.{js,ts}'), 'generated-file banners should point to mixed JS/TS module sources');
assert(buildContent.includes("'25-controller-payloads'"), 'build should bundle the controller payload TypeScript module');
assert(buildContent.includes("'26-controller-state'"), 'build should bundle the controller state TypeScript module');
assert(buildContent.includes("'27-controller-guidance'"), 'build should bundle the controller guidance TypeScript module');

const typesContent = fs.readFileSync(typesPath, 'utf8');
[
    'RegionProfile',
    'SystemConfig',
    'ApplianceInput',
    'ManagedModeResult',
    'BatteryPracticalResult',
    'PVPracticalResult',
    'RiskIndexResult',
    'ConfidenceMetricsSummary',
    'BusinessContextEvaluationSummary',
    'OperationalScheduleSummaryPayload',
    'CommercialArchitectureHintSummary',
    'ProjectSnapshotSummary',
    'SerializedFormStateEntry',
    'SerializedFormState',
    'ProjectDynamicState',
    'ProjectSnapshotMeta',
    'ProjectSnapshot',
    'ProposalFlowContext',
    'InputSectionDefinition',
    'InputSectionQuickStep',
    'InputSectionFlowState',
    'InputSectionSummaryContext',
    'WorkflowGuideDefinition',
    'PanelConfigurationResult',
    'ConfigurationComparisonResult',
    'MultiMPPTDistributionResult',
    'OperatingScheduleDefinition',
    'PhaseAllocationResult',
    'AggregationResult',
    'InverterSizingResult',
    'BatterySizingResult',
    'PVArrayResult',
    'AdvisoryItem',
    'CommercialArchitectureResult',
    'CommercialDecisionResult',
    'ReportMeta',
    'ReportSummary',
    'DefenseNotesResult',
    'SupportSummary',
    'ReportPayload'
].forEach(typeName => {
    assert(typesContent.includes(`interface ${typeName}`) || typesContent.includes(`type ${typeName}`), `shared types should define ${typeName}`);
});

const defaultsContent = fs.readFileSync(defaultsPath, 'utf8');
assert(defaultsContent.includes("type DefaultsInverterMarketProfile = import('../types/pv-types').InverterMarketProfile;"), 'defaults should import inverter-market types with a native TypeScript alias');
assert(defaultsContent.includes("type DefaultsBusinessProfileDefinition = import('../types/pv-types').BusinessProfileDefinition;"), 'defaults should import business-profile types with a module-local alias');
assert(defaultsContent.includes("type DefaultsCommercialDecisionDefinition = import('../types/pv-types').CommercialDecisionDefinition;"), 'defaults should import commercial-decision types with a module-local alias');
assert(defaultsContent.includes('const INVERTER_MARKET_PROFILES: Record<string, DefaultsInverterMarketProfile> = {'), 'defaults should expose typed inverter market profiles');
assert(defaultsContent.includes('const BATTERY_SPEC_LIBRARY: Record<string, DefaultsBatteryChemistrySpec> = {'), 'defaults should expose typed battery specs');
assert(defaultsContent.includes('const LITHIUM_MODULE_LIBRARY: DefaultsBatteryModuleCatalog = {'), 'defaults should expose typed lithium module catalog');
assert(defaultsContent.includes('}) as Record<string, DefaultsBusinessProfileDefinition>'), 'defaults should type business profile definitions');
assert(defaultsContent.includes('}) as Record<string, DefaultsOperatingScheduleDefinition>'), 'defaults should type operating schedule definitions');
assert(defaultsContent.includes('}) as Record<string, DefaultsCommercialDecisionDefinition>'), 'defaults should type commercial decision definitions');

const enginesContent = fs.readFileSync(enginesPath, 'utf8');
assert(enginesContent.includes("type EngineAggregationResult = import('../types/pv-types').AggregationResult;"), 'engines module should import shared aggregation types with native TypeScript aliases');
assert(enginesContent.includes("type EngineCommercialArchitectureResult = import('../types/pv-types').CommercialArchitectureResult;"), 'engines module should import shared commercial-architecture types with native TypeScript aliases');
assert(enginesContent.includes("type EngineCommercialDecisionResult = import('../types/pv-types').CommercialDecisionResult;"), 'engines module should import shared commercial-decision types with native TypeScript aliases');
assert(enginesContent.includes('calculate(appliances: EngineApplianceInput[], config: EngineSystemConfig): EngineAggregationResult'), 'aggregation engine should declare its return type in native TypeScript');
assert(enginesContent.includes('calculate(aggregatedLoad: EngineAggregationResult, config: EngineSystemConfig): EngineInverterSizingResult'), 'inverter sizing engine should declare its return type in native TypeScript');
assert(enginesContent.includes('calculate(appliances: EngineApplianceInput[], config: EngineSystemConfig): EnginePhaseAllocationResult | null'), 'three-phase allocator should declare its normalized result type in native TypeScript');
assert(enginesContent.includes('): EngineManagedModeResult | null'), 'managed practical inverter engine should declare its normalized result type');
assert(enginesContent.includes('): EngineBatteryPracticalResult | null'), 'battery practical engine should declare its normalized result type');
assert(enginesContent.includes('): EnginePVPracticalResult | null'), 'pv practical engine should declare its normalized result type');
assert(enginesContent.includes('calculateRiskIndex(engineeringValue: number, practicalValue: number): EngineRiskIndexResult'), 'risk index helper should use a native typed result');
assert(enginesContent.includes('): EngineConfigurationComparisonResult'), 'configuration comparison engine should declare its normalized result type');
assert(enginesContent.includes('): EngineMultiMPPTDistributionResult | null'), 'multi-mppt distributor should declare its normalized result type');
assert(enginesContent.includes('function calculateACCurrent(powerVA: number, voltage: number, phaseType: EnginePhaseType): number'), 'phase-aware AC current helper should declare its typed signature in native TypeScript');

const controllerPayloadsContent = fs.readFileSync(controllerPayloadsPath, 'utf8');
assert(controllerPayloadsContent.includes("type ControllerConfidenceMetricsSummary = import('../types/pv-types').ConfidenceMetricsSummary;"), 'controller payload helpers should import shared confidence summary types');
assert(controllerPayloadsContent.includes("type ControllerBusinessContextEvaluationSummary = import('../types/pv-types').BusinessContextEvaluationSummary;"), 'controller payload helpers should import shared business summary types');
assert(controllerPayloadsContent.includes("type ControllerOperationalScheduleSummaryPayload = import('../types/pv-types').OperationalScheduleSummaryPayload;"), 'controller payload helpers should import shared operational schedule summary types');
assert(controllerPayloadsContent.includes('computeConfidenceMetrics('), 'controller payload helpers should expose confidence metrics summarization');
assert(controllerPayloadsContent.includes('summarizeBusinessContext('), 'controller payload helpers should expose business context summarization');
assert(controllerPayloadsContent.includes('summarizeOperationalSchedule('), 'controller payload helpers should expose schedule summarization');
assert(controllerPayloadsContent.includes('summarizeCommercialArchitecture('), 'controller payload helpers should expose commercial architecture summarization');
assert(controllerPayloadsContent.includes('summarizeProjectSnapshot('), 'controller payload helpers should expose project snapshot summarization');

const controllerStateContent = fs.readFileSync(controllerStatePath, 'utf8');
assert(controllerStateContent.includes("type ControllerProjectSnapshot = import('../types/pv-types').ProjectSnapshot;"), 'controller state helpers should import shared project snapshot types');
assert(controllerStateContent.includes('sanitizeProjectName(name: unknown): string'), 'controller state helpers should expose typed project-name sanitization');
assert(controllerStateContent.includes('slugifyProjectName(name: unknown): string'), 'controller state helpers should expose typed project-name slugification');
assert(controllerStateContent.includes('normalizeProjectSnapshot('), 'controller state helpers should expose typed project snapshot normalization');
assert(controllerStateContent.includes('createProjectSnapshotRecord('), 'controller state helpers should expose typed project snapshot creation');

const controllerGuidanceContent = fs.readFileSync(controllerGuidancePath, 'utf8');
assert(controllerGuidanceContent.includes("type ControllerInputSectionFlowState = import('../types/pv-types').InputSectionFlowState;"), 'controller guidance helpers should import shared flow state types');
assert(controllerGuidanceContent.includes('const INPUT_SECTION_DEFINITIONS:'), 'controller guidance helpers should define typed input section definitions');
assert(controllerGuidanceContent.includes('buildInputSectionFlowState('), 'controller guidance helpers should expose typed flow-state building');
assert(controllerGuidanceContent.includes('summarizeInputSection('), 'controller guidance helpers should expose typed input-section summaries');
assert(controllerGuidanceContent.includes('getWorkflowGuideSectionDefinition('), 'controller guidance helpers should expose typed workflow section definitions');
assert(controllerGuidanceContent.includes('resolveWorkflowGuideFocus('), 'controller guidance helpers should expose typed focus resolution');
assert(controllerGuidanceContent.includes('shouldInputSectionBeExpanded('), 'controller guidance helpers should expose typed expansion rules');

const reportingContent = fs.readFileSync(reportingPath, 'utf8');
assert(reportingContent.includes("type ReportingSystemResults = import('../types/pv-types').SystemResults"), 'reporting module should use native TypeScript type-query aliases');
assert(reportingContent.includes("type ReportingReportPayload = import('../types/pv-types').ReportPayload"), 'reporting module should alias report payload types through TypeScript');
assert(reportingContent.includes("type ReportingDefenseNotesResult = import('../types/pv-types').DefenseNotesResult"), 'reporting module should alias defense notes result types through TypeScript');
assert(reportingContent.includes('generateReport(results: ReportingSystemResults): ReportingReportPayload'), 'output generator should declare its report payload return type in native TypeScript');
assert(reportingContent.includes('checkForBlocks(results: ReportingSystemResults): ReportingDefenseNotesResult'), 'defense notes should declare their typed return result in native TypeScript');

console.log('TYPESCRIPT SETUP OK');
