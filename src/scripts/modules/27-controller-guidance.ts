/* =============================================================================
   PHASE TS-10: CONTROLLER GUIDANCE HELPERS
   Stable workflow-guide and input-section summary logic extracted from 30-controller.js.
   Keeps UI guidance typed without rewriting DOM/event handlers.
   ============================================================================= */

type ControllerInputSectionDefinition = import('../types/pv-types').InputSectionDefinition;
type ControllerInputSectionFlowState = import('../types/pv-types').InputSectionFlowState;
type ControllerInputSectionQuickStep = import('../types/pv-types').InputSectionQuickStep;
type ControllerInputSectionSummaryContext = import('../types/pv-types').InputSectionSummaryContext;
type ControllerProposalFlowContext = import('../types/pv-types').ProposalFlowContext;
type ControllerWorkflowGuideDefinition = import('../types/pv-types').WorkflowGuideDefinition;

interface ControllerInputSectionFlowInput {
    isClientMode: boolean;
    proposal: ControllerProposalFlowContext;
    hasAppliances: boolean;
    hasResults: boolean;
    manualMode: boolean;
    pricingProfile: string;
    supplierPack: string;
    visibleSectionIds: string[];
}

interface ControllerWorkflowGuideFocusInput {
    focusId?: string | null;
    focusType?: 'field' | 'section';
    fieldDefinition?: ControllerWorkflowGuideDefinition | null;
    sectionDefinition?: ControllerWorkflowGuideDefinition | null;
    fallbackSectionDefinition: ControllerWorkflowGuideDefinition;
}

const INPUT_SECTION_DEFINITIONS: ControllerInputSectionDefinition[] = [
    {
        id: 'systemConfigCard',
        label: 'Site Setup',
        stepLabel: 'Step 1',
        shortHelp: 'Mode, location, business intent, and electrical basis.'
    },
    {
        id: 'projectWorkspaceCard',
        label: 'Project Draft',
        stepLabel: 'Step 2',
        shortHelp: 'Named draft, autosave, import/export, and browser projects.'
    },
    {
        id: 'projectTemplatesCard',
        label: 'Quick Start',
        stepLabel: 'Step 2',
        shortHelp: 'Apply a realistic starter layout when the site matches a known pattern.'
    },
    {
        id: 'workflowGuideCard',
        label: 'Guided Flow',
        stepLabel: 'Guide',
        shortHelp: 'See the recommended next move and jump directly to the right section.'
    },
    {
        id: 'proposalIdentityCard',
        label: 'Survey & Identity',
        stepLabel: 'Step 3',
        shortHelp: 'Client, site, survey stage, and scope confirmations.'
    },
    {
        id: 'proposalPricingCard',
        label: 'Commercial Terms',
        stepLabel: 'Step 4',
        shortHelp: 'Pricing basis, finance assumptions, exclusions, and next steps.'
    },
    {
        id: 'applianceInputCard',
        label: 'Add Loads',
        stepLabel: 'Step 5',
        shortHelp: 'Enter the actual appliances and process machines that drive the design.'
    },
    {
        id: 'applianceListCard',
        label: 'Load Review',
        stepLabel: 'Step 6',
        shortHelp: 'Review the current machine list before calculating.'
    },
    {
        id: 'upgradeSimulatorCard',
        label: 'Upgrade Check',
        stepLabel: 'Step 7',
        shortHelp: 'Test whether the current design can absorb a new future load.'
    },
    {
        id: 'equipmentSpecsCard',
        label: 'Equipment Review',
        stepLabel: 'Step 7',
        shortHelp: 'Auto-suggest or manually validate panel, inverter, battery, and MPPT choices.'
    }
];

const WORKFLOW_GUIDE_SECTION_DEFINITIONS: Record<string, ControllerWorkflowGuideDefinition> = {
    systemConfigCard: {
        title: 'Site Setup',
        meaning: 'This section defines the business and electrical basis before any hardware is sized.',
        why: 'Good regional, phase, and operating assumptions prevent the rest of the quote from drifting.',
        avoid: 'Do not rush past this section. A wrong site story usually creates a wrong project story everywhere else.'
    },
    projectWorkspaceCard: {
        title: 'Project Draft',
        meaning: 'This is where you keep work safe with autosave, named browser projects, and project file transfer.',
        why: 'It helps you move between quick scoping and reusable commercial drafts without losing context.',
        avoid: 'Do not overwrite a good saved draft when you actually mean to create a fresh variant.'
    },
    projectTemplatesCard: {
        title: 'Quick Start',
        meaning: 'Templates are structured first drafts for familiar job patterns.',
        why: 'They speed up estimation when the site resembles a known use case.',
        avoid: 'Do not treat a template as the final machine list or survey truth.'
    },
    proposalIdentityCard: {
        title: 'Survey & Identity',
        meaning: 'This section records who the quote is for and how far the site has actually been checked.',
        why: 'Proposal readiness depends on real survey confidence, not only on sizing math.',
        avoid: 'Do not send a strong commercial commitment while survey confidence is still weak.'
    },
    proposalPricingCard: {
        title: 'Commercial Terms',
        meaning: 'This section controls quote posture, exclusions, supplier benchmark basis, and advisory finance framing.',
        why: 'A technically good system can still be commercially misleading if the quote posture is sloppy.',
        avoid: 'Do not let finance assumptions or exclusions stay generic if the project is close to proposal issue.'
    },
    applianceInputCard: {
        title: 'Add Loads',
        meaning: 'This is where the real site machines and appliances are entered.',
        why: 'The design is only as honest as the load list it is built on.',
        avoid: 'Do not replace real machine information with generic watt guesses if nameplates or field knowledge exist.'
    },
    applianceListCard: {
        title: 'Load Review',
        meaning: 'This is the checkpoint where you inspect the machine list before calculation.',
        why: 'A quick review catches wrong duty cycles, wrong quantities, or missing critical loads before they distort the design.',
        avoid: 'Do not calculate with a placeholder list you have not actually reviewed.'
    },
    upgradeSimulatorCard: {
        title: 'Upgrade Check',
        meaning: 'This is a stress-test tool for future expansion, not the place to define the base design.',
        why: 'It helps you answer “what if we add one more machine later?” without rebuilding the project from scratch.',
        avoid: 'Do not use this as a substitute for entering the real base loads.'
    },
    equipmentSpecsCard: {
        title: 'Equipment Review',
        meaning: 'This section is for validating or overriding real hardware choices after the load story is solid.',
        why: 'It lets installers prove whether a proposed inverter, battery, or PV choice actually fits the job.',
        avoid: 'Do not begin here unless the load and project posture are already trustworthy.'
    }
};

const FALLBACK_SECTION_DEFINITION = WORKFLOW_GUIDE_SECTION_DEFINITIONS.systemConfigCard;

const ControllerGuidance = {
    getInputSectionDefinitions(): ControllerInputSectionDefinition[] {
        return INPUT_SECTION_DEFINITIONS;
    },

    buildInputSectionFlowState(input: ControllerInputSectionFlowInput): ControllerInputSectionFlowState {
        const hasIdentity = !!(input.proposal.clientName || input.proposal.siteName || input.proposal.companyName);
        const visibleDefinitions = INPUT_SECTION_DEFINITIONS.filter(def => input.visibleSectionIds.includes(def.id));
        const quickSteps: ControllerInputSectionQuickStep[] = [
            {
                label: 'Site Setup',
                cardId: 'systemConfigCard',
                summary: 'Mode, location, intent, and electrical baseline.'
            },
            {
                label: 'Project Draft',
                cardId: 'projectWorkspaceCard',
                summary: 'Save, import, export, or start from a template.'
            },
            {
                label: 'Survey & Quote',
                cardId: 'proposalIdentityCard',
                summary: 'Set client details, survey posture, and commercial scope.'
            },
            {
                label: 'Loads',
                cardId: 'applianceInputCard',
                summary: 'Enter the real machines and daily duty.'
            },
            {
                label: input.isClientMode ? 'Proposal Finish' : 'Engineering Review',
                cardId: input.isClientMode ? 'proposalPricingCard' : 'equipmentSpecsCard',
                summary: input.isClientMode
                    ? 'Tune pricing posture and proposal assumptions.'
                    : 'Validate equipment, protection posture, and upgrade headroom.'
            }
        ].filter(step => visibleDefinitions.some(def => def.id === step.cardId));

        let nextSectionId = 'systemConfigCard';
        let nextStepCopy = 'Start by confirming workspace mode, location profile, business posture, and phase basis.';

        if (!input.hasAppliances) {
            nextSectionId = 'applianceInputCard';
            nextStepCopy = 'Add the real site loads first. The calculator stays honest only when the machine list reflects the actual job.';
        } else if (!hasIdentity || input.proposal.surveyStage === 'preliminary') {
            nextSectionId = 'proposalIdentityCard';
            nextStepCopy = 'Confirm who the quote is for and how far the site survey has gone before treating the output as proposal-safe.';
        } else if (!input.hasResults) {
            nextSectionId = input.isClientMode ? 'proposalPricingCard' : (input.manualMode ? 'equipmentSpecsCard' : 'applianceListCard');
            nextStepCopy = input.isClientMode
                ? 'Set the commercial posture, then calculate so the proposal summary uses the right price and finance assumptions.'
                : input.manualMode
                    ? 'If you are validating a real BOM, review the manual equipment values before calculating.'
                    : 'Review the load list, then calculate so the engineering verdict is based on the final machine mix.';
        } else if (!input.isClientMode && input.manualMode) {
            nextSectionId = 'upgradeSimulatorCard';
            nextStepCopy = 'The base design is ready. Use the engineering review tools to stress-test equipment choices and future expansion.';
        } else if (input.hasResults && input.isClientMode) {
            nextSectionId = 'proposalPricingCard';
            nextStepCopy = 'The sizing is done. Use the commercial section to tighten price posture, scope language, and finance framing before export.';
        }

        return {
            isClientMode: input.isClientMode,
            proposal: input.proposal,
            hasAppliances: input.hasAppliances,
            hasIdentity,
            hasResults: input.hasResults,
            manualMode: input.manualMode,
            pricingProfile: input.pricingProfile,
            supplierPack: input.supplierPack,
            quickSteps,
            nextSectionId,
            nextStepCopy
        };
    },

    summarizeInputSection(
        cardId: string,
        flow: ControllerInputSectionFlowState,
        context: ControllerInputSectionSummaryContext
    ): string {
        switch (cardId) {
            case 'systemConfigCard':
                return `${context.audienceLabel} · ${context.locationName} · ${context.systemTypeLabel} · ${context.phaseLabel} · ${context.businessLabel} · ${context.workflowSurfaceLabel}`;
            case 'projectWorkspaceCard':
                return `${context.projectName} · ${context.hasSavedProject ? 'saved browser project' : 'local draft'} · autosave active`;
            case 'projectTemplatesCard':
                return `${context.templateLabel} ready as a fast starting point.`;
            case 'workflowGuideCard': {
                const nextLabel = INPUT_SECTION_DEFINITIONS.find(def => def.id === flow.nextSectionId)?.label || 'Site Setup';
                return `Next move: ${nextLabel}.`;
            }
            case 'proposalIdentityCard':
                return flow.hasIdentity
                    ? `${flow.proposal.clientName || flow.proposal.siteName || flow.proposal.companyName} · ${context.surveyStageLabel}`
                    : `Identity incomplete · ${context.surveyStageLabel}`;
            case 'proposalPricingCard':
                return `${context.pricingLabel} · ${context.quoteCurrencyLabel} · ${flow.supplierPack}`;
            case 'applianceInputCard':
                return context.applianceCount > 0
                    ? `${context.applianceCount} load${context.applianceCount === 1 ? '' : 's'} in project · keep entering real machines here`
                    : 'No loads yet · start with the real machines that define the job';
            case 'applianceListCard':
                return context.applianceCount > 0
                    ? `${context.applianceCount} load${context.applianceCount === 1 ? '' : 's'} · ${context.dailyKWh} kWh/day modeled`
                    : 'No loads added yet';
            case 'upgradeSimulatorCard':
                return flow.hasResults ? 'Base design available · ready to test a future load' : 'Calculate a base design first';
            case 'equipmentSpecsCard':
                return `${context.equipmentMode} · ${context.referenceCount} applied equipment reference${context.referenceCount === 1 ? '' : 's'}`;
            default:
                return '';
        }
    },

    getWorkflowGuideSectionDefinition(cardId: string, nextSectionId?: string): ControllerWorkflowGuideDefinition {
        return WORKFLOW_GUIDE_SECTION_DEFINITIONS[cardId]
            || WORKFLOW_GUIDE_SECTION_DEFINITIONS[nextSectionId || '']
            || FALLBACK_SECTION_DEFINITION;
    },

    resolveWorkflowGuideFocus(input: ControllerWorkflowGuideFocusInput): ControllerWorkflowGuideDefinition {
        if (input.focusId && input.focusType === 'field' && input.fieldDefinition) {
            return {
                ...input.fieldDefinition,
                badge: 'Focused Field',
                sourceType: 'field'
            };
        }

        if (input.focusId && input.focusType === 'section' && input.sectionDefinition) {
            return {
                ...input.sectionDefinition,
                badge: 'Focused Section',
                sourceType: 'section'
            };
        }

        return {
            ...input.fallbackSectionDefinition,
            badge: 'Next Section Coach',
            sourceType: 'section'
        };
    },

    shouldInputSectionBeExpanded(cardId: string, flow: ControllerInputSectionFlowState): boolean {
        const alwaysOpen = new Set(['systemConfigCard', 'workflowGuideCard']);
        if (alwaysOpen.has(cardId)) return true;
        if (cardId === flow.nextSectionId) return true;
        if (cardId === 'applianceInputCard') return true;
        if (cardId === 'applianceListCard') return flow.hasAppliances;
        if (cardId === 'proposalIdentityCard') return flow.isClientMode || !flow.hasIdentity;
        if (cardId === 'proposalPricingCard') return flow.isClientMode && flow.hasAppliances;
        if (cardId === 'equipmentSpecsCard') return !flow.isClientMode && flow.manualMode;
        return false;
    }
};
