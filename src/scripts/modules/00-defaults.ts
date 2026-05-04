/* =============================================================================
   TYPESCRIPT - CENTRALIZED CONSTANTS (DEFAULTS)
   ============================================================================= */

type DefaultsSubmissionProfile = import('../types/pv-types').SubmissionProfile;
type DefaultsSubmissionProfileOptions = import('../types/pv-types').SubmissionProfileOptions;
type DefaultsInverterMarketProfile = import('../types/pv-types').InverterMarketProfile;
type DefaultsBatteryModuleCatalog = import('../types/pv-types').BatteryModuleCatalog;
type DefaultsBatteryChemistrySpec = import('../types/pv-types').BatteryChemistrySpec;
type DefaultsRegionProfile = import('../types/pv-types').RegionProfile;
type DefaultsBusinessProfileDefinition = import('../types/pv-types').BusinessProfileDefinition;
type DefaultsOperatingIntentDefinition = import('../types/pv-types').OperatingIntentDefinition;
type DefaultsContinuityClassDefinition = import('../types/pv-types').ContinuityClassDefinition;
type DefaultsOperatingScheduleDefinition = import('../types/pv-types').OperatingScheduleDefinition;
type DefaultsLabeledSummaryDefinition = import('../types/pv-types').LabeledSummaryDefinition;
type DefaultsCommercialArchitectureModeDefinition = import('../types/pv-types').CommercialArchitectureModeDefinition;
type DefaultsGeneratorSupportModeDefinition = import('../types/pv-types').GeneratorSupportModeDefinition;
type DefaultsPVFieldLayoutDefinition = import('../types/pv-types').PVFieldLayoutDefinition;
type DefaultsMPPTGroupingDefinition = import('../types/pv-types').MPPTGroupingDefinition;
type DefaultsCommercialArchitectureProfileDefaults = import('../types/pv-types').CommercialArchitectureProfileDefaults;
type DefaultsPlantScopeModeDefinition = import('../types/pv-types').PlantScopeModeDefinition;
type DefaultsDistributionTopologyDefinition = import('../types/pv-types').DistributionTopologyDefinition;
type DefaultsInterconnectionScopeDefinition = import('../types/pv-types').InterconnectionScopeDefinition;
type DefaultsPlantScopingProfileDefaults = import('../types/pv-types').PlantScopingProfileDefaults;
type DefaultsBatteryThroughputThresholds = import('../types/pv-types').BatteryThroughputThresholds;
type DefaultsCommercialDecisionDefinition = import('../types/pv-types').CommercialDecisionDefinition;
type DefaultsCommercialDecisionThresholds = import('../types/pv-types').CommercialDecisionThresholds;
type DefaultsPremiumCapabilityFeature = import('../types/pv-types').PremiumCapabilityFeature;
type DefaultsPremiumCapabilityTier = import('../types/pv-types').PremiumCapabilityTier;
type DefaultsTeamRosterRoleDefinition = import('../types/pv-types').TeamRosterRoleDefinition;
type DefaultsTeamSeatStateDefinition = import('../types/pv-types').TeamSeatStateDefinition;
type DefaultsTeamSeatRecoveryActionDefinition = import('../types/pv-types').TeamSeatRecoveryActionDefinition;

function uniqueDefaultItems(items: string[] | undefined | null): string[] {
    return [...new Set((items || []).filter(Boolean))];
}

function createSubmissionProfile(options: DefaultsSubmissionProfileOptions = {}): DefaultsSubmissionProfile {
    return {
        label: options.label || 'Installer submission pack',
        summary: options.summary || 'Structured submission and handover workflow.',
        intakeLabel: options.intakeLabel || 'Survey and intake pack',
        technicalLabel: options.technicalLabel || 'Technical design dossier',
        offGridApprovalLabel: options.offGridApprovalLabel || 'Installer electrical sign-off pack',
        utilityApprovalLabel: options.utilityApprovalLabel || 'Authority / interconnection pack',
        closeoutLabel: options.closeoutLabel || 'Commissioning and handover pack',
        intakeDeliverables: uniqueDefaultItems([
            'Client / site cover sheet',
            'Survey notes and operating brief',
            ...(options.intakeDeliverables || [])
        ]),
        technicalDeliverables: uniqueDefaultItems([
            'Load schedule and design basis',
            'Protection coordination summary',
            ...(options.technicalDeliverables || [])
        ]),
        offGridApprovalDeliverables: uniqueDefaultItems([
            'Installer electrical review sign-off',
            'DB isolation and changeover confirmation',
            ...(options.offGridApprovalDeliverables || [])
        ]),
        utilityApprovalDeliverables: uniqueDefaultItems([
            'Authority / utility application trail',
            'Operating-mode and anti-backfeed declaration',
            ...(options.utilityApprovalDeliverables || [])
        ]),
        closeoutDeliverables: uniqueDefaultItems([
            'Commissioning checklist and settings record',
            'Client handover / closeout record',
            ...(options.closeoutDeliverables || [])
        ]),
        notes: uniqueDefaultItems(options.notes || [])
    };
}

const COMPLIANCE_SUBMISSION_PROFILES: Record<string, DefaultsSubmissionProfile> = {
    licensed_installer: createSubmissionProfile({
        label: 'Licensed installer closeout pack',
        summary: 'Best for off-grid and hybrid commercial jobs where a licensed installer closes the electrical path and utility contact is limited or conditional.',
        technicalDeliverables: ['Single-line diagram', 'Equipment datasheet / cut-sheet bundle'],
        utilityApprovalLabel: 'Utility / service-change review pack',
        utilityApprovalDeliverables: ['Service-change or metering review note'],
        notes: ['Keep installer sign-off, site survey evidence, and equipment references aligned so the closeout pack stays credible.']
    }),
    north_america_ahj: createSubmissionProfile({
        label: 'AHJ permit and interconnection pack',
        summary: 'Supports permit-office, inspection, and utility interconnection workflows common in North American jurisdictions.',
        intakeDeliverables: ['Permit intake summary'],
        technicalLabel: 'Permit plan set',
        technicalDeliverables: ['Site plan / roof layout', 'Equipment cut sheets', 'Label schedule'],
        utilityApprovalLabel: 'AHJ / utility approval pack',
        utilityApprovalDeliverables: ['Permit application set', 'Utility interconnection application', 'Rapid shutdown and labeling schedule'],
        closeoutDeliverables: ['Inspection sign-off trail', 'As-built settings and labels record'],
        notes: ['Rapid shutdown, labeling, and permit-office expectations should remain explicit from the first serious quote.']
    }),
    dno_operator: createSubmissionProfile({
        label: 'DNO / grid-operator pack',
        summary: 'Supports export-setting, DNO notification, and commissioning-record workflows used in many European installations.',
        technicalDeliverables: ['Array layout and string routing', 'Export-setting summary'],
        utilityApprovalLabel: 'DNO / grid-code submission pack',
        utilityApprovalDeliverables: ['Grid-code settings record', 'DNO notification / approval record', 'Export-limit or anti-islanding declaration'],
        closeoutDeliverables: ['Commissioning settings handover', 'Client operations note'],
        notes: ['Export settings and DNO-facing records should stay attached to the final commissioning pack, not left as verbal closeout.']
    }),
    discom_interconnection: createSubmissionProfile({
        label: 'DISCOM and installer submission pack',
        summary: 'Supports licensed-installer delivery while keeping DISCOM-facing interconnection and metering requirements visible.',
        technicalDeliverables: ['Single-line diagram', 'Equipment datasheet bundle', 'Isolation and source-switching note'],
        utilityApprovalLabel: 'DISCOM review pack',
        utilityApprovalDeliverables: ['DISCOM application / review trail', 'Metering and anti-backfeed note'],
        notes: ['Mixed utility / generator sites should document source interaction clearly before handover.']
    }),
    approved_contractor: createSubmissionProfile({
        label: 'Approved-contractor utility pack',
        summary: 'Supports authority-facing jobs where approved-equipment lists, contractor credentials, and utility path control matter early.',
        intakeDeliverables: ['Authority-ready project summary'],
        technicalDeliverables: ['Approved equipment schedule', 'Connection-method note'],
        utilityApprovalLabel: 'Authority approval and connection pack',
        utilityApprovalDeliverables: ['Approved equipment declaration', 'Authority / utility submission trail', 'Connection-method approval note'],
        closeoutDeliverables: ['Authority closeout confirmation', 'Commissioning settings handover'],
        notes: ['Do not hide authority-specific approved-equipment constraints inside general assumptions.']
    }),
    dnsp_retailer: createSubmissionProfile({
        label: 'DNSP / retailer submission pack',
        summary: 'Supports Australian-style installer, DNSP, and retailer closeout with inverter-setting and backup-interface control.',
        intakeDeliverables: ['Supply-arrangement and site summary'],
        technicalDeliverables: ['Array layout', 'Inverter settings schedule'],
        utilityApprovalLabel: 'DNSP / retailer approval pack',
        utilityApprovalDeliverables: ['DNSP / retailer application trail', 'Backup-interface declaration', 'Inverter settings record'],
        closeoutDeliverables: ['Retailer / DNSP closeout record', 'Commissioning settings and handover note'],
        notes: ['Retailer and DNSP expectations should remain visible from quote through commissioning.']
    }),
    generic_local: createSubmissionProfile({
        label: 'Local installer / authority pack',
        summary: 'Fallback structured submission path when the jurisdiction is known only at a general level.',
        technicalDeliverables: ['Single-line diagram', 'Equipment reference bundle'],
        utilityApprovalLabel: 'Local authority / utility pack',
        utilityApprovalDeliverables: ['Local permit or utility review note'],
        notes: ['Confirm the real jurisdiction and review body before treating the pack as authority-ready.']
    })
};

const INVERTER_MARKET_PROFILES: Record<string, DefaultsInverterMarketProfile> = {
    EMERGING_OFFGRID: {
        label: 'Off-Grid / Emerging Market',
        sizes: [3000, 5000, 6000, 8000, 10000, 15000, 20000],
        marketRange: {
            3000: [3000, 3500], 5000: [5000, 5500], 6000: [6000, 6500],
            8000: [8000, 10000], 10000: [10000, 12000],
            15000: [15000, 15000], 20000: [20000, 20000]
        }
    },
    EU_SINGLE_PHASE: {
        label: 'EU Single-Phase',
        sizes: [3000, 5000, 8000, 10000, 12000, 20000],
        marketRange: {
            3000: [3000, 3600], 5000: [5000, 6000], 8000: [8000, 10000],
            10000: [10000, 12000], 12000: [12000, 15000], 20000: [20000, 20000]
        }
    },
    US_SPLIT_PHASE: {
        label: 'US Split-Phase (120/240V)',
        sizes: [3000, 7600, 11400, 15000, 18000],
        marketRange: {
            3000: [3000, 3800], 7600: [7600, 8000], 11400: [11400, 12000],
            15000: [15000, 15200], 18000: [18000, 18000]
        }
    }
};

const BATTERY_SPEC_LIBRARY: Record<string, DefaultsBatteryChemistrySpec> = {
    lifepo4: {
        name: 'LiFePO4',
        maxDoD: 0.80,
        cycleLife: 3000,
        chargeEfficiency: 0.97,
        dischargeEfficiency: 0.98,
        maxChargeRate: 0.50,
        maxDischargeRate: 1.00,
        selfDischargeDaily: 0.001,
        cellVoltage: 3.2,
        moduleVoltage: 51.2,
        cellsPerModule: 16
    },
    agm: {
        name: 'AGM Lead Acid',
        maxDoD: 0.50,
        cycleLife: 600,
        chargeEfficiency: 0.88,
        dischargeEfficiency: 0.92,
        maxChargeRate: 0.15,
        maxDischargeRate: 0.25,
        selfDischargeDaily: 0.002,
        cellVoltage: 2.0
    },
    gel: {
        name: 'Gel Lead Acid',
        maxDoD: 0.50,
        cycleLife: 700,
        chargeEfficiency: 0.87,
        dischargeEfficiency: 0.91,
        maxChargeRate: 0.10,
        maxDischargeRate: 0.20,
        selfDischargeDaily: 0.002,
        cellVoltage: 2.0
    },
    fla: {
        name: 'Flooded Lead Acid',
        maxDoD: 0.50,
        cycleLife: 500,
        chargeEfficiency: 0.85,
        dischargeEfficiency: 0.90,
        maxChargeRate: 0.10,
        maxDischargeRate: 0.20,
        selfDischargeDaily: 0.003,
        cellVoltage: 2.0
    }
};

const LITHIUM_MODULE_LIBRARY: DefaultsBatteryModuleCatalog = {
    nominalVoltage: 51.2,
    cellsPerModule: 16,
    cellVoltage: 3.2,
    catalog: [
        { kWh: 5.12, ah: 100, label: '5.12 kWh / 100Ah', note: 'Entry-level, single inverter' },
        { kWh: 7.2, ah: 140, label: '7.2 kWh / 140Ah', note: 'Popular mid-range (Felicity, Deye)' },
        { kWh: 7.68, ah: 150, label: '7.68 kWh / 150Ah', note: 'Common rack module (Pylontech, BYD)' },
        { kWh: 10.24, ah: 200, label: '10.24 kWh / 200Ah', note: 'High-capacity single unit' },
        { kWh: 15.0, ah: 293, label: '15 kWh / ~300Ah', note: 'Commercial / stacked modules' },
        { kWh: 17.5, ah: 342, label: '17.5 kWh / ~340Ah', note: 'High-end rack (stacked 2-3 units)' },
        { kWh: 20.48, ah: 400, label: '20.48 kWh / 400Ah', note: 'Stackable / parallel config' }
    ]
};

type DefaultsProposalListSet = {
    includedScope: string[];
    exclusions: string[];
    nextSteps: string[];
};

interface DefaultsCommercialPresetDefinition {
    label: string;
    badge: string;
    summary: string;
    focus: string;
    pricingProfile: string;
    financeValueBasis: string;
    annualMaintenancePct: number;
    inverterRefreshPct: number;
    batteryRefreshPct: number;
    taxBenefitPct: number;
    debtSharePct: number;
    debtAprPct: number;
    debtTermYears: number;
    residualValuePct: number;
    depositPct: number;
    validityDays: number;
    installWindowDays: number;
    includedScope: string[];
    exclusions: string[];
    nextSteps: string[];
}

interface DefaultsSupplierQuoteStatusDefinition {
    label: string;
    summary: string;
    quoteStrength: 'benchmark' | 'partial' | 'major' | 'locked';
}

const PREMIUM_CAPABILITY_FEATURES: Record<string, DefaultsPremiumCapabilityFeature> = {
    core_design: {
        label: 'Core design workflow',
        summary: 'Core sizing, saved project state, calculator outputs, and honest engineering warnings remain part of the product foundation.',
        category: 'core'
    },
    commercial_workflow: {
        label: 'Commercial proposal workflow',
        summary: 'Commercial presets, richer pricing posture, lifecycle finance sensitivity, and supplier quote imports for proposal-grade work.',
        category: 'commercial'
    },
    team_workspace: {
        label: 'Team workspace and approvals',
        summary: 'Shared project ownership, approval checkpoints, and controlled handback between sales, installer, and engineering roles.',
        category: 'workspace'
    },
    workspace_projects: {
        label: 'Saved projects and local workspace',
        summary: 'Named projects, save-copy, import/export, and local workspace continuity built into the offline product surface.',
        category: 'workspace'
    },
    branded_exports: {
        label: 'Branded deliverables',
        summary: 'Custom logo, palette, issuer block, branded PDFs, and customer-facing export polish tied to the same result object.',
        category: 'branding'
    },
    authority_submission_lane: {
        label: 'Authority and submission lane',
        summary: 'Submission-pack detail, approval packet continuity, and authority-facing handoff records for regulated jobs.',
        category: 'authority'
    },
    plant_engineering_handoff: {
        label: 'Plant engineering handoff',
        summary: 'Feeder briefs, board/source schedule, procurement review, and plant study input exports for heavier captive-site jobs.',
        category: 'plant'
    },
    formal_study_surface: {
        label: 'Formal study surface',
        summary: 'Separate formal-study scope, intake checklist, screening snapshot, work pack, and data sheet for external-study kickoff.',
        category: 'plant'
    },
    integration_connectors: {
        label: 'Integrations and admin APIs',
        summary: 'Supplier sync, CRM/ERP hooks, entitlement sync, and enterprise admin controls should sit behind a clean integration boundary.',
        category: 'integrations'
    }
};

const PREMIUM_CAPABILITY_TIERS: Record<string, DefaultsPremiumCapabilityTier> = {
    community: {
        label: 'Community',
        badge: 'Free core',
        summary: 'Keep the core offline calculator trustworthy and useful for learning, scoping, and early installer work.',
        audience: ['Solo users', 'Learning', 'Early scoping'],
        monthlyAnchor: 'Free',
        annualAnchor: 'Free',
        keyFeatures: ['core_design', 'workspace_projects'],
        rolloutPhase: 'Phase 0',
        gatingRule: 'Never gate core sizing, project recall, or safety-critical warnings.'
    },
    installer_pro: {
        label: 'Installer Pro',
        badge: 'Solo paid',
        summary: 'Best first paid tier for serious solo installers who need stronger commercial speed and cleaner proposal handoff.',
        audience: ['Solo installer', 'Small shop', 'Proposal-heavy users'],
        monthlyAnchor: '$29-$49 / month',
        annualAnchor: '$290-$490 / year',
        keyFeatures: ['commercial_workflow', 'branded_exports', 'authority_submission_lane'],
        rolloutPhase: 'Phase 1',
        gatingRule: 'Gate convenience, commercial polish, and advanced export control first; do not degrade core calculator honesty.'
    },
    studio_team: {
        label: 'Studio Team',
        badge: 'Team',
        summary: 'Shared project workflow for multi-person operations where sales, installer, and review roles need controlled handback.',
        audience: ['Installer team', 'Sales + engineering', 'Operations lead'],
        monthlyAnchor: '$79-$149 / month',
        annualAnchor: '$790-$1490 / year',
        keyFeatures: ['commercial_workflow', 'team_workspace', 'branded_exports', 'authority_submission_lane'],
        rolloutPhase: 'Phase 2',
        gatingRule: 'Introduce team workflow only after local single-user entitlement behavior is stable.'
    },
    engineering_plus: {
        label: 'Engineering Plus',
        badge: 'Advanced lane',
        summary: 'Adds the heavier plant and formal-study handoff surfaces for firms that regularly move beyond standard captive-site quotes.',
        audience: ['Commercial engineering desk', 'Protection consultant', 'Plant handoff teams'],
        monthlyAnchor: '$149-$249 / month',
        annualAnchor: '$1490-$2490 / year',
        keyFeatures: ['plant_engineering_handoff', 'formal_study_surface', 'authority_submission_lane'],
        rolloutPhase: 'Phase 3',
        gatingRule: 'Only gate advanced plant/final-study workflow layers, never the ability to size or understand a normal site design.'
    },
    enterprise: {
        label: 'Enterprise',
        badge: 'Platform',
        summary: 'For companies that need connector APIs, policy controls, seat management, and branded operational rollout at scale.',
        audience: ['EPC platform', 'Distributor', 'Enterprise ops'],
        monthlyAnchor: 'Custom quote',
        annualAnchor: 'Custom contract',
        keyFeatures: ['team_workspace', 'integration_connectors', 'branded_exports', 'formal_study_surface'],
        rolloutPhase: 'Phase 4',
        gatingRule: 'Keep billing/provider logic outside the sizing engine and drive all entitlement checks from one capability layer.'
    }
};

const createCommercialPreset = <TPreset extends DefaultsCommercialPresetDefinition>(preset: TPreset): TPreset => preset;

const PROPOSAL_DEFAULT_LISTS: DefaultsProposalListSet = {
    includedScope: [
        'Supply and sizing of PV modules, inverter, battery storage, BOS, and protection devices.',
        'Standard installation, commissioning, labeling, and client handover for the recommended system.',
        'Basic monitoring setup and performance verification allowance at handover.'
    ],
    exclusions: [
        'Structural roof repairs, major civil works, and concealed cable-route remediation.',
        'Utility approvals, permit fees, meter upgrades, and utility interconnection charges unless added separately.',
        'Lightning protection upgrades, generator integration, and internet service for remote monitoring unless specified.'
    ],
    nextSteps: [
        'Confirm site-survey measurements, cable routes, and mounting layout.',
        'Lock exact equipment brands and supplier pricing before procurement.',
        'Confirm installation date, payment schedule, and handover checklist with the client.'
    ]
};

const PROPOSAL_COMMERCIAL_PRESETS: Record<string, DefaultsCommercialPresetDefinition> = {
    balanced_standard_quote: createCommercialPreset({
        label: 'Balanced Standard Quote',
        badge: 'Standard',
        summary: 'General-purpose turnkey posture for most captive commercial PV jobs.',
        focus: 'Balanced allowances, traceable pricing, and conventional payment terms.',
        pricingProfile: 'standard',
        financeValueBasis: 'blended_site_energy',
        annualMaintenancePct: 1.5,
        inverterRefreshPct: 35,
        batteryRefreshPct: 35,
        taxBenefitPct: 0,
        debtSharePct: 0,
        debtAprPct: 0,
        debtTermYears: 5,
        residualValuePct: 0,
        depositPct: 60,
        validityDays: 14,
        installWindowDays: 7,
        includedScope: [...PROPOSAL_DEFAULT_LISTS.includedScope],
        exclusions: [...PROPOSAL_DEFAULT_LISTS.exclusions],
        nextSteps: [...PROPOSAL_DEFAULT_LISTS.nextSteps]
    }),
    value_capex_quote: createCommercialPreset({
        label: 'Value-Led CapEx Quote',
        badge: 'Value',
        summary: 'Budget-sensitive starting point that protects the core system while trimming commercial allowances.',
        focus: 'Lean first quote for cost-sensitive buyers who may phase upgrades later.',
        pricingProfile: 'value',
        financeValueBasis: 'blended_site_energy',
        annualMaintenancePct: 1.2,
        inverterRefreshPct: 30,
        batteryRefreshPct: 30,
        taxBenefitPct: 0,
        debtSharePct: 0,
        debtAprPct: 0,
        debtTermYears: 5,
        residualValuePct: 0,
        depositPct: 70,
        validityDays: 10,
        installWindowDays: 6,
        includedScope: [
            'Supply and sizing of the recommended PV, inverter, battery, and protection scope using the value package posture.',
            'Standard installation and commissioning for the agreed protected loads and array layout.',
            'Basic labeling, startup checks, and installer handover on completion.'
        ],
        exclusions: [
            'Brand-upgrade requests, aesthetic upgrades, and non-essential add-ons unless separately priced.',
            'Major civil works, structural remediation, concealed cable-route correction, or generator integration unless added explicitly.',
            'Authority fees, permit fees, and utility or metering charges unless listed in the quote.'
        ],
        nextSteps: [
            'Confirm the protected-load list and any future expansion items before locking procurement.',
            'Review optional upgrades separately so the lean quote stays commercially honest.',
            'Confirm the installation window and payment schedule before materials are ordered.'
        ]
    }),
    process_continuity_hybrid: createCommercialPreset({
        label: 'Process Continuity Hybrid',
        badge: 'Continuity',
        summary: 'Continuity-focused posture for sites where uptime matters and assisted backup is part of the story.',
        focus: 'Good for bakery, filling station, cold-chain, workshop, and mini-factory continuity conversations.',
        pricingProfile: 'premium',
        financeValueBasis: 'generator_energy_offset',
        annualMaintenancePct: 1.8,
        inverterRefreshPct: 40,
        batteryRefreshPct: 40,
        taxBenefitPct: 0,
        debtSharePct: 0,
        debtAprPct: 0,
        debtTermYears: 5,
        residualValuePct: 0,
        depositPct: 65,
        validityDays: 7,
        installWindowDays: 10,
        includedScope: [
            'Supply and sizing of the recommended PV, inverter, battery, and protection scope for the agreed protected process loads.',
            'Commissioning of the protected board path, operating labels, and staged support logic described in the proposal.',
            'Installer-led operational handover covering supported loads, recovery sequence, and managed-load expectations.'
        ],
        exclusions: [
            'Unlisted full-site continuity, uncontrolled process expansion, and utility-grade feeder studies unless added explicitly.',
            'Existing generator overhaul, ATS retrofit, or source-switchgear changes unless priced in the final scope.',
            'Civil, structural, and concealed-route remediation outside the confirmed survey path.'
        ],
        nextSteps: [
            'Confirm the protected process loads, feeder boundaries, and any generator-assist expectations with the client.',
            'Lock final equipment models and backup operating sequence before commercial sign-off.',
            'Validate cable paths, access, and commissioning responsibility before procurement.'
        ]
    }),
    premium_certified_quote: createCommercialPreset({
        label: 'Premium Certified Quote',
        badge: 'Premium',
        summary: 'Premium proposal posture for branded equipment, fuller documentation, and stronger handover expectations.',
        focus: 'Higher presentation quality, documentation weight, and lifecycle allowances for quality-led buyers.',
        pricingProfile: 'premium',
        financeValueBasis: 'grid_tariff_offset',
        annualMaintenancePct: 2.0,
        inverterRefreshPct: 40,
        batteryRefreshPct: 35,
        taxBenefitPct: 0,
        debtSharePct: 0,
        debtAprPct: 0,
        debtTermYears: 5,
        residualValuePct: 5,
        depositPct: 50,
        validityDays: 21,
        installWindowDays: 10,
        includedScope: [
            'Supply and sizing of the recommended premium package, including the documented equipment set and handover references.',
            'Standard installation, commissioning, labeling, and monitored startup for the agreed package.',
            'Proposal-aligned documentation set covering equipment references, operating notes, and installer handover items.'
        ],
        exclusions: [
            'Authority fees, interconnection fees, and third-party inspections unless they are called out as priced deliverables.',
            'Structural remediation, advanced remote-monitoring subscriptions, and non-standard civil works unless added separately.',
            'Generator integration, utility changeover rebuild, or custom building-management integration unless explicitly listed.'
        ],
        nextSteps: [
            'Confirm the final brand set, commercial package level, and handover expectations before final approval.',
            'Reconcile the quote against current supplier numbers for any premium-brand deltas.',
            'Lock the site program, payment milestones, and documentation deliverables with the client.'
        ]
    }),
    financed_growth_plan: createCommercialPreset({
        label: 'Financed Growth Plan',
        badge: 'Finance',
        summary: 'Advisory capital-stack starting point for clients comparing cash purchase against financed acquisition.',
        focus: 'Preserves client cash while keeping 5-year and 10-year value framing visible.',
        pricingProfile: 'standard',
        financeValueBasis: 'blended_site_energy',
        annualMaintenancePct: 1.6,
        inverterRefreshPct: 35,
        batteryRefreshPct: 35,
        taxBenefitPct: 0,
        debtSharePct: 60,
        debtAprPct: 12,
        debtTermYears: 5,
        residualValuePct: 8,
        depositPct: 35,
        validityDays: 14,
        installWindowDays: 7,
        includedScope: [
            'Supply and sizing of the recommended turnkey system with an advisory financed-acquisition sensitivity view.',
            'Standard installation, commissioning, and client handover for the agreed load scope.',
            'Proposal finance outlook showing cash-versus-financed comparison using the current advisory assumptions.'
        ],
        exclusions: [
            'Formal lender underwriting, tax advice, and jurisdiction-specific incentives unless separately confirmed.',
            'Authority fees, utility charges, civil works, and building remediation unless listed explicitly.',
            'Any finance rate or debt-share different from the values shown in the advisory sensitivity block.'
        ],
        nextSteps: [
            'Replace the advisory debt-share, APR, and term assumptions with the client’s real financing path if available.',
            'Confirm the avoided-energy basis so the finance story stays credible.',
            'Lock final supplier pricing before using the finance outlook as a client decision tool.'
        ]
    })
};

const DEFAULTS = {
    // ── REGION PROFILES (v3.0.0 Global Edition) ──
    // Each profile carries everything needed to auto-configure the UI.
    // Adding a new region = one object entry, zero engine changes.
    REGION_PROFILES: ({
        // --- Africa ---
        lagos_ng: {
            name: 'Lagos, Nigeria',
            region: 'africa',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 4.5,
            ambientTempMin: 20,
            ambientTempMax: 35,
            climate: 'tropical_hot',
            regulatoryNote: 'Nigerian Electrical Installation Standard (NEIS) applies. Consult a licensed electrician.',
            gridNote: 'Unstable grid typical (140–260V swings). Use AVR before inverter. Utility supply may be unreliable.',
            vatPct: 7.5,
            currencyDisplay: 'NGN',
            fxRateToUSD: 1550
        },
        nairobi_ke: {
            name: 'Nairobi, Kenya',
            region: 'africa',
            acVoltage: 240,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 5.5,
            ambientTempMin: 10,
            ambientTempMax: 28,
            climate: 'tropical_moderate',
            regulatoryNote: 'Kenya Bureau of Standards (KEBS) solar regulations apply.',
            vatPct: 16,
            currencyDisplay: 'KES',
            fxRateToUSD: 130
        },
        accra_gh: {
            name: 'Accra, Ghana',
            region: 'africa',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 5.0,
            ambientTempMin: 22,
            ambientTempMax: 33,
            climate: 'tropical_hot',
            regulatoryNote: 'Energy Commission of Ghana regulations apply.',
            vatPct: 15,
            currencyDisplay: 'GHS',
            fxRateToUSD: 12.5
        },
        // --- Americas ---
        us_south: {
            name: 'Southern US (TX, FL, AZ)',
            region: 'americas',
            acVoltage: 240,
            frequency: 60,
            phaseType: 'split',
            inverterMarket: 'US_SPLIT_PHASE',
            avgPSH: 5.5,
            ambientTempMin: -5,
            ambientTempMax: 42,
            climate: 'hot_arid',
            regulatoryNote: 'NEC 690 & 705 compliance suggested. Rapid shutdown per NEC 690.12 required in many jurisdictions.'
        },
        us_north: {
            name: 'Northern US / Canada',
            region: 'americas',
            acVoltage: 240,
            frequency: 60,
            phaseType: 'split',
            inverterMarket: 'US_SPLIT_PHASE',
            avgPSH: 4.0,
            ambientTempMin: -25,
            ambientTempMax: 35,
            climate: 'cold_temperate',
            regulatoryNote: 'NEC 690 & 705 / CEC Part I compliance suggested. Cold-weather battery derating applies.'
        },
        brazil: {
            name: 'Brazil (General)',
            region: 'americas',
            acVoltage: 220,
            frequency: 60,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 5.0,
            ambientTempMin: 10,
            ambientTempMax: 38,
            climate: 'tropical_hot',
            regulatoryNote: 'ABNT NBR 16690 (PV installations) applies. Check local utility interconnection rules.',
            currencyDisplay: 'BRL',
            fxRateToUSD: 5.05
        },
        // --- Europe ---
        eu_central: {
            name: 'Central Europe (DE, FR, NL)',
            region: 'europe',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EU_SINGLE_PHASE',
            avgPSH: 3.5,
            ambientTempMin: -10,
            ambientTempMax: 35,
            climate: 'cold_temperate',
            regulatoryNote: 'IEC 62109, EN 50549 apply. Check local feed-in regulations and grid codes.',
            vatPct: 20,
            currencyDisplay: 'EUR',
            fxRateToUSD: 0.92
        },
        eu_south: {
            name: 'Southern Europe (ES, IT, GR)',
            region: 'europe',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EU_SINGLE_PHASE',
            avgPSH: 5.5,
            ambientTempMin: 0,
            ambientTempMax: 40,
            climate: 'hot_arid',
            regulatoryNote: 'IEC 62109, EN 50549 apply. High ambient temperatures — derate accordingly.',
            vatPct: 22,
            currencyDisplay: 'EUR',
            fxRateToUSD: 0.92
        },
        // --- Asia / Oceania ---
        india: {
            name: 'India (General)',
            region: 'asia',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 5.0,
            ambientTempMin: 5,
            ambientTempMax: 45,
            climate: 'tropical_hot',
            regulatoryNote: 'CEA (Central Electricity Authority) technical standards and MNRE guidelines apply.',
            vatPct: 18,
            currencyDisplay: 'INR',
            fxRateToUSD: 84
        },
        uae: {
            name: 'UAE / Middle East',
            region: 'asia',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 6.5,
            ambientTempMin: 10,
            ambientTempMax: 50,
            climate: 'hot_arid',
            regulatoryNote: 'DEWA/ADDC regulations apply for grid-connected systems.',
            vatPct: 5,
            currencyDisplay: 'AED',
            fxRateToUSD: 3.67
        },
        australia: {
            name: 'Australia',
            region: 'oceania',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EU_SINGLE_PHASE',
            avgPSH: 5.5,
            ambientTempMin: 0,
            ambientTempMax: 45,
            climate: 'hot_arid',
            regulatoryNote: 'AS/NZS 5033 (PV installations) and AS/NZS 4777 (grid connection) apply.',
            vatPct: 10,
            currencyDisplay: 'AUD',
            fxRateToUSD: 1.52
        },
        // --- Catch-all ---
        generic: {
            name: 'Generic (Manual Setup)',
            region: 'global',
            acVoltage: 230,
            frequency: 50,
            phaseType: 'single',
            inverterMarket: 'EMERGING_OFFGRID',
            avgPSH: 4.5,
            ambientTempMin: -10,
            ambientTempMax: 45,
            climate: 'mixed',
            regulatoryNote: 'Consult local electrical codes and standards for your jurisdiction.'
        }
    }) as Record<string, DefaultsRegionProfile>,

    // Legacy alias for backward compatibility (localStorage migration)
    LOCATIONS: {
        get lagos() { return DEFAULTS.REGION_PROFILES.lagos_ng; },
        get generic() { return DEFAULTS.REGION_PROFILES.generic; },
        get temperate() { return DEFAULTS.REGION_PROFILES.eu_central; },
        get desert() { return DEFAULTS.REGION_PROFILES.uae; }
    },

    COMPLIANCE_PACKS: {
        lagos_ng: {
            codeFamily: 'NEIS with licensed electrician sign-off',
            authority: 'Local licensed electrician / Disco where service changes apply',
            submissionProfile: 'licensed_installer',
            paths: {
                off_grid: 'Confirm DB isolation, breaker coordination, and changeover method before energizing.',
                hybrid: 'Review changeover logic, neutral handling, and anti-backfeed isolation before commissioning.',
                grid_tie: 'Utility review is required before any export, service change, or metering modification.'
            },
            checks: [
                'Earthing and bonding path confirmed',
                'Distribution board spare ways and breaker coordination checked',
                'Changeover / anti-backfeed isolation confirmed where utility or generator is present'
            ],
            documents: ['Single-line diagram', 'Equipment datasheets', 'Site survey photos', 'Commissioning checklist'],
            notes: ['Voltage swings are common. Confirm AVR or transfer strategy and neutral arrangement.'],
            commercialNote: 'Utility fees, service changes, or metering upgrades should remain excluded unless priced explicitly.'
        },
        nairobi_ke: {
            codeFamily: 'KEBS / EPRA-aligned PV installation practice',
            authority: 'Licensed contractor / utility review where grid interaction exists',
            submissionProfile: 'licensed_installer',
            paths: {
                off_grid: 'Confirm DB integration, earthing, and isolation for the backup circuits.',
                hybrid: 'Review changeover and protection settings for any utility-assisted operation.',
                grid_tie: 'Utility notification and interconnection review should be completed before energizing.'
            },
            checks: [
                'Earthing path confirmed',
                'Array mounting and cable-route details recorded',
                'DB protection coordination reviewed'
            ],
            documents: ['Single-line diagram', 'Equipment datasheets', 'Roof or site photos'],
            notes: ['Document shading and mounting details because commercial clients often require a clear survey trail.'],
            commercialNote: 'Leave utility approvals and permit fees as explicit line items or exclusions.'
        },
        accra_gh: {
            codeFamily: 'Energy Commission of Ghana installation path',
            authority: 'Licensed electrician / ECG or relevant utility when grid interaction exists',
            submissionProfile: 'licensed_installer',
            paths: {
                off_grid: 'Confirm earthing, DB segregation, and changeover method before handover.',
                hybrid: 'Review import/export isolation and any changeover sequence before commissioning.',
                grid_tie: 'Utility review and interconnection approval should be treated as mandatory before export.'
            },
            checks: [
                'Earthing and bonding path confirmed',
                'DB breaker coordination reviewed',
                'Utility review captured if the project is not purely off-grid'
            ],
            documents: ['Single-line diagram', 'Equipment datasheets', 'Survey notes', 'Client handover checklist'],
            notes: ['Keep generator and utility isolation explicit in the survey notes where mixed sources exist.'],
            commercialNote: 'Do not bury utility or service-upgrade work inside soft costs unless the scope is fixed.'
        },
        us_south: {
            codeFamily: 'NEC 690 / 705 with local AHJ enforcement',
            authority: 'AHJ permit office and utility interconnection team',
            submissionProfile: 'north_america_ahj',
            paths: {
                off_grid: 'Confirm disconnecting means, labeling, and battery / equipment clearances before final sign-off.',
                hybrid: 'Review transfer equipment, neutral handling, rapid shutdown, and utility operating mode before commissioning.',
                grid_tie: 'Permit, interconnection, rapid shutdown, labeling, and final inspection are mandatory before export.'
            },
            checks: [
                'Rapid shutdown requirement reviewed',
                'AC / DC disconnecting means identified',
                'Permit and utility review captured where grid interaction exists'
            ],
            documents: ['Single-line diagram', 'Equipment cut sheets', 'Site plan / roof layout', 'Label schedule'],
            notes: ['Rapid shutdown and labeling are common failure points. Treat them as explicit deliverables, not assumptions.'],
            commercialNote: 'Permit, interconnection, labeling, and inspection fees should remain visible in the quote or exclusions.'
        },
        us_north: {
            codeFamily: 'NEC 690 / 705 or CEC Part I depending on jurisdiction',
            authority: 'AHJ / ESA / utility depending on project location',
            submissionProfile: 'north_america_ahj',
            paths: {
                off_grid: 'Confirm disconnects, battery clearances, and cold-weather installation allowances.',
                hybrid: 'Review transfer equipment, labeling, and utility operating mode before commissioning.',
                grid_tie: 'Interconnection, inspection, rapid shutdown, labeling, and utility approvals are mandatory before export.'
            },
            checks: [
                'Rapid shutdown and labeling reviewed',
                'Cold-weather equipment placement confirmed',
                'Permit / utility review captured where grid interaction exists'
            ],
            documents: ['Single-line diagram', 'Cut sheets', 'Roof layout', 'Label schedule'],
            notes: ['Cold-weather battery placement and conductor routing should be part of the survey sign-off.'],
            commercialNote: 'Inspection, labeling, and utility interconnection costs should not be hidden in general soft costs.'
        },
        brazil: {
            codeFamily: 'ABNT NBR 16690 with local utility interconnection rules',
            authority: 'Local electrician / distributor utility',
            submissionProfile: 'licensed_installer',
            paths: {
                off_grid: 'Confirm local earthing practice, isolation, and DB integration before energizing.',
                hybrid: 'Review utility interaction, transfer method, and protection settings before commissioning.',
                grid_tie: 'Utility interconnection approval is required before export or meter changes.'
            },
            checks: [
                'Earthing and bonding path confirmed',
                'Protection coordination documented',
                'Utility review captured where interconnection applies'
            ],
            documents: ['Single-line diagram', 'Equipment datasheets', 'Site survey record'],
            notes: ['Utility-specific interconnection paperwork can vary widely by distributor. Capture it early.'],
            commercialNote: 'Interconnection and utility paperwork should stay explicit in scope and allowances.'
        },
        eu_central: {
            codeFamily: 'IEC 62109 / EN 50549 with local DNO rules',
            authority: 'Local installer / DNO / grid operator',
            submissionProfile: 'dno_operator',
            paths: {
                off_grid: 'Confirm earthing, isolation, and equipment placement before energizing.',
                hybrid: 'Review anti-islanding, export settings, and DNO expectations before commissioning.',
                grid_tie: 'DNO notification or approval plus grid-code settings are required before export.'
            },
            checks: [
                'Earthing and bonding path confirmed',
                'Grid-code / export setting review captured where applicable',
                'Survey evidence for mounting and cable route retained'
            ],
            documents: ['Single-line diagram', 'Datasheets', 'Array layout', 'Commissioning settings record'],
            notes: ['Grid-code settings and export limits should be captured as installer handover data.'],
            commercialNote: 'DNO paperwork, export-limit devices, and meter work should be priced or excluded explicitly.'
        },
        eu_south: {
            codeFamily: 'IEC 62109 / EN 50549 with high-temperature derating awareness',
            authority: 'Local installer / DNO / grid operator',
            submissionProfile: 'dno_operator',
            paths: {
                off_grid: 'Confirm earthing, isolation, and high-temperature equipment placement before handover.',
                hybrid: 'Review export settings, anti-islanding, and thermal placement before commissioning.',
                grid_tie: 'DNO or utility approval and final export settings are required before energizing.'
            },
            checks: [
                'Earthing and bonding path confirmed',
                'Ventilation / high-temperature placement reviewed',
                'Grid-code review captured where interconnection applies'
            ],
            documents: ['Single-line diagram', 'Datasheets', 'Thermal / location survey notes'],
            notes: ['Ambient heat and enclosure placement should be explicit because derating risk is real in this pack.'],
            commercialNote: 'Thermal mitigation or enclosure upgrades should be visible in the quote if needed.'
        },
        india: {
            codeFamily: 'CEA / MNRE-aligned installation path',
            authority: 'Licensed installer / DISCOM where grid interaction exists',
            submissionProfile: 'discom_interconnection',
            paths: {
                off_grid: 'Confirm earthing, isolation, and DB integration before energizing.',
                hybrid: 'Review transfer logic, anti-backfeed control, and DISCOM path where applicable.',
                grid_tie: 'DISCOM approval and interconnection review are required before export.'
            },
            checks: [
                'Earthing path confirmed',
                'DB protection and isolation reviewed',
                'DISCOM / utility review captured where grid interaction exists'
            ],
            documents: ['Single-line diagram', 'Datasheets', 'Survey photos', 'Commissioning checklist'],
            notes: ['Generator and utility interaction should be documented clearly in mixed-source projects.'],
            commercialNote: 'DISCOM approvals, metering, and service changes should be explicit commercial items.'
        },
        uae: {
            codeFamily: 'DEWA / ADDC / local utility solar path',
            authority: 'Approved contractor / utility solar team',
            submissionProfile: 'approved_contractor',
            paths: {
                off_grid: 'Even for private backup systems, confirm earthing, isolation, and site electrical review before energizing.',
                hybrid: 'Review utility operating mode and approved connection method before commissioning.',
                grid_tie: 'Utility approval, approved equipment path, and interconnection review are mandatory before export.'
            },
            checks: [
                'Earthing and bonding confirmed',
                'Approved connection method reviewed',
                'Utility / permitting review captured where grid interaction exists'
            ],
            documents: ['Single-line diagram', 'Approved equipment list', 'Site survey record'],
            notes: ['Approved-equipment and utility-specific submission paths should be checked early.'],
            commercialNote: 'Approvals, authority fees, and utility submissions should remain explicit in the quote.'
        },
        australia: {
            codeFamily: 'AS/NZS 5033 and AS/NZS 4777',
            authority: 'Accredited installer / DNSP / retailer as required',
            submissionProfile: 'dnsp_retailer',
            paths: {
                off_grid: 'Confirm earthing, isolation, and battery placement against the applicable standards before energizing.',
                hybrid: 'Review inverter operating mode, DNSP requirements, and changeover / backup interface before commissioning.',
                grid_tie: 'DNSP / retailer process, inverter settings, and final inspection path are required before export.'
            },
            checks: [
                'AS/NZS placement and isolation path reviewed',
                'DNSP or retailer review captured where grid interaction exists',
                'Site survey evidence retained for mounting and cable route'
            ],
            documents: ['Single-line diagram', 'Datasheets', 'Array layout', 'Commissioning settings record'],
            notes: ['Inverter settings and backup interface mode should be captured as part of commissioning.'],
            commercialNote: 'DNSP, retailer, and inspection-related work should be visible in the quote or exclusions.'
        },
        generic: {
            codeFamily: 'Local electrical code and utility process',
            authority: 'Qualified installer / electrician / local utility',
            submissionProfile: 'generic_local',
            paths: {
                off_grid: 'Confirm earthing, isolation, and DB integration before energizing.',
                hybrid: 'Review changeover, anti-backfeed, and any utility operating mode before commissioning.',
                grid_tie: 'Utility review and interconnection approval should be treated as mandatory before export.'
            },
            checks: [
                'Earthing and bonding path confirmed',
                'Protection and isolation review completed',
                'Utility or permitting path reviewed if the system is not purely off-grid'
            ],
            documents: ['Single-line diagram', 'Equipment datasheets', 'Site survey record'],
            notes: ['Capture the exact jurisdiction and installer responsibility before treating the quote as final.'],
            commercialNote: 'Permit, utility, and inspection costs should stay visible until the local path is confirmed.'
        }
    },

    // ── PHASE CONFIGURATION ──
    PHASE_CONFIG: {
        single: {
            label: 'Single Phase',
            voltages: [220, 230, 240],
            description: 'Standard residential (L + N)'
        },
        split: {
            label: 'Split Phase (120/240V)',
            voltages: [240],
            legVoltage: 120,
            legs: 2,
            description: 'US/Canada residential (2× 120V legs)'
        },
        three_phase: {
            label: '3-Phase',
            voltages: [380, 400, 415],
            sqrt3: 1.732,
            description: 'Commercial / industrial (L1 + L2 + L3 + N)'
        }
    },

    PHASE_ASSIGNMENTS: {
        auto: {
            label: 'Auto-balance',
            description: 'Distribute the load to the lightest phase.'
        },
        l1: {
            label: 'L1',
            description: 'Force this load onto phase L1.'
        },
        l2: {
            label: 'L2',
            description: 'Force this load onto phase L2.'
        },
        l3: {
            label: 'L3',
            description: 'Force this load onto phase L3.'
        },
        three_phase: {
            label: '3-phase',
            description: 'Share this load equally across L1, L2, and L3.'
        }
    },

    THREE_PHASE_IMBALANCE_THRESHOLDS: {
        balanced: 10,
        moderate: 20,
        significant: 30
    },

    THREE_PHASE_CLUSTER: {
        minModules: 3,
        readyHeadroomPct: 15,
        maxModules: 24,
        defaultDistributionMode: 'auto'
    },

    // ── INVERTER MARKET SEGMENTS ──
    INVERTER_MARKET: INVERTER_MARKET_PROFILES,
    INVERTER_MARKET_RANGE: INVERTER_MARKET_PROFILES.EMERGING_OFFGRID.marketRange,

    // ── CLIMATE BATTERY ADJUSTMENT ──
    // Applied after design margin, before Ah conversion (preserves locked battery flow)
    CLIMATE_BATTERY_ADJUST: {
        tropical_hot:      { buffer: 0.07, label: '+7% hot climate buffer (heat accelerates degradation)' },
        hot_arid:          { buffer: 0.10, label: '+10% hot/arid climate buffer (extreme heat derating)' },
        tropical_moderate: { buffer: 0.05, label: '+5% moderate tropical buffer' },
        cold_temperate:    { buffer: -0.07, label: '-7% cold climate derating (reduced usable capacity)' },
        mixed:             { buffer: 0.00, label: 'No climate adjustment' }
    },

    // Battery chemistry specifications
    BATTERY_SPECS: BATTERY_SPEC_LIBRARY,

    // Load type defaults
    LOAD_TYPES: {
        resistive: { surgeFactor: 1.0, powerFactor: 1.0 },
        electronic: { surgeFactor: 1.2, powerFactor: 0.95 },
        motor: { surgeFactor: 4.0, powerFactor: 0.8 },
        mixed: { surgeFactor: 2.0, powerFactor: 0.9 }
    },

    // Motor start methods
    MOTOR_START_SURGE: {
        dol: 6.0,
        soft_start: 3.0,
        vfd: 1.5
    },

    // Panel orientation correction factors (fraction of optimal output)
    ORIENTATION_FACTORS: {
        south: 1.00,       // Optimal — directly faces equatorial sun
        se_sw: 0.95,       // 5% loss — acceptable compromise
        east_west: 0.90,   // 10% loss — common on urban rooftops
        flat: 0.92,        // 8% loss — no tilt, dust/self-cleaning issues
        unknown: 0.93      // Conservative assumption
    },

    // Panel tilt correction factors (fraction of optimal output)
    TILT_FACTORS: {
        optimal: 1.00,     // Latitude-matched tilt
        low: 0.95,         // <10° — flat roof with minimal racking
        high: 0.97,        // >40° — steep pitch roofs
        unknown: 0.97      // Conservative assumption
    },

    // Premium capability catalog for future entitlement-aware rollout
    PREMIUM_CAPABILITIES: {
        features: PREMIUM_CAPABILITY_FEATURES,
        tiers: PREMIUM_CAPABILITY_TIERS,
        rolloutPrinciples: [
            'Keep the core sizing engine, saved project recall, and safety-critical warnings available in the base product.',
            'Gate convenience, branding, team workflow, and heavier engineering-handoff surfaces before touching core design trust.',
            'Treat billing, seat control, and online entitlements as adapters around one capability layer, not as conditions inside the sizing math.',
            'Preserve offline-first behavior with a signed local entitlement fallback for paid desktop or field use.'
        ]
    },

    BACKEND_RUNTIME: {
        storageKey: 'pvCalculatorBackendRuntimeV1',
        requestTimeoutMs: 6000,
        resolveEndpoint: '/api/entitlement/resolve',
        healthEndpoint: '/health',
        companyProfilesEndpoint: '/api/company-profiles',
        teamHandbacksEndpoint: '/api/team-handbacks',
        teamRosterEndpoint: '/api/team-roster',
        teamSeatsEndpoint: '/api/team-seats',
        teamSeatRecoveryEndpoint: '/api/team-seats/recovery',
        teamSeatRecoveryCodeIssueEndpoint: '/api/team-seats/recovery-code/issue',
        teamSeatRecoveryCodeRedeemEndpoint: '/api/team-seats/recovery-code/redeem',
        teamSeatInviteIssueEndpoint: '/api/team-seats/invite/issue',
        teamSeatInviteRedeemEndpoint: '/api/team-seats/invite/redeem',
        seatSessionEndpoint: '/api/seat-session/issue',
        seatSessionRenewEndpoint: '/api/seat-session/renew',
        seatSessionRevokeEndpoint: '/api/seat-session/revoke',
        auditLogEndpoint: '/api/audit-log',
        rolloutPrinciples: [
            'Keep backend optional for the calculator itself; only trust-sensitive premium sync should require it.',
            'Allow the static frontend to keep running on GitHub Pages or any static host when backend sync is not configured.',
            'Treat backend config as environment-level runtime state, not as project math or proposal content.',
            'Move secrets, license authority, seats, and shared brand libraries to backend only when they must be trusted across devices.',
            'Do not persist true backend secrets in browser local storage; prefer runtime injection or real authenticated sessions for production premium deployments.'
        ]
    },

    TEAM_WORKSPACE: {
        rosterRoles: {
            sales_desk: {
                label: 'Sales Desk',
                summary: 'Shapes commercial posture, client issue readiness, and early follow-through.',
                defaultHint: 'Owns commercial shaping and client issue prep.',
                permissions: ['shared_read', 'company_profile_publish', 'team_handback_publish']
            } as DefaultsTeamRosterRoleDefinition,
            commercial_review: {
                label: 'Commercial Review',
                summary: 'Checks pricing, exclusions, margin posture, and release conditions before the next desk.',
                defaultHint: 'Validates pricing posture and release control.',
                permissions: ['shared_read', 'company_profile_publish', 'team_handback_publish']
            } as DefaultsTeamRosterRoleDefinition,
            engineering_review: {
                label: 'Engineering Review',
                summary: 'Checks design realism, breaker/cable posture, and readiness before operations or release.',
                defaultHint: 'Validates technical basis before release or procurement.',
                permissions: ['shared_read', 'audit_read', 'team_handback_publish', 'team_roster_publish']
            } as DefaultsTeamRosterRoleDefinition,
            installer_ops: {
                label: 'Installer Ops',
                summary: 'Takes the approved draft into procurement, scheduling, and installation follow-through.',
                defaultHint: 'Owns field delivery and procurement follow-through.',
                permissions: ['shared_read', 'team_handback_publish']
            } as DefaultsTeamRosterRoleDefinition,
            client_delivery: {
                label: 'Client Delivery',
                summary: 'Issues the client-facing pack and manages client-side response or approval follow-through.',
                defaultHint: 'Owns client-facing issue and response follow-through.',
                permissions: ['shared_read', 'team_handback_publish']
            } as DefaultsTeamRosterRoleDefinition,
            management_signoff: {
                label: 'Management Sign-off',
                summary: 'Provides final release or commercial authority before the draft moves outward.',
                defaultHint: 'Carries the final sign-off authority.',
                permissions: ['shared_read', 'audit_read', 'company_profile_publish', 'team_handback_publish', 'team_roster_publish']
            } as DefaultsTeamRosterRoleDefinition,
            workspace_admin: {
                label: 'Workspace Admin',
                summary: 'Owns installation-level shared sync control, seat posture, and backend-facing premium workflow authority.',
                defaultHint: 'Carries shared premium workflow administration authority.',
                permissions: ['shared_read', 'audit_read', 'company_profile_publish', 'team_handback_publish', 'team_roster_publish', 'team_seat_publish']
            } as DefaultsTeamRosterRoleDefinition
        },
        seatStates: {
            active: {
                label: 'Active',
                summary: 'Seat can use every shared action allowed by its assigned role.',
                permissionMode: 'full'
            } as DefaultsTeamSeatStateDefinition,
            review_only: {
                label: 'Review-only',
                summary: 'Seat can inspect shared state and audit posture but cannot publish or change shared records.',
                permissionMode: 'read_only'
            } as DefaultsTeamSeatStateDefinition,
            suspended: {
                label: 'Suspended',
                summary: 'Seat is blocked from shared premium/backend actions until it is reactivated.',
                permissionMode: 'blocked'
            } as DefaultsTeamSeatStateDefinition
        },
        seatRecoveryActions: {
            revoke_active_sessions: {
                label: 'Revoke Active Sessions',
                summary: 'Force every short-lived backend session for the target seat to expire immediately without changing the saved seat posture.',
                invalidatesSessions: true
            } as DefaultsTeamSeatRecoveryActionDefinition,
            clear_signin_lockout: {
                label: 'Clear Sign-In Lockout',
                summary: 'Remove the temporary sign-in lockout for the target seat after an operator confirms the right access-code posture.',
                clearsLockout: true
            } as DefaultsTeamSeatRecoveryActionDefinition,
            rotate_access_code: {
                label: 'Rotate Access Code',
                summary: 'Publish a new shared sign-in code for the target seat, invalidate older seat sessions, and clear stale sign-in lockout state.',
                requiresAccessCode: true,
                requiresApproval: true,
                clearsLockout: true,
                invalidatesSessions: true
            } as DefaultsTeamSeatRecoveryActionDefinition,
            disable_sign_in: {
                label: 'Disable Shared Sign-In',
                summary: 'Remove the target seat access code from backend sign-in posture and invalidate any sessions that depended on it.',
                requiresApproval: true,
                clearsLockout: true,
                invalidatesSessions: true
            } as DefaultsTeamSeatRecoveryActionDefinition,
            suspend_seat: {
                label: 'Suspend Seat',
                summary: 'Move the target seat into suspended posture, revoke existing sessions, and keep the seat blocked until an admin restores it.',
                requiresApproval: true,
                clearsLockout: true,
                invalidatesSessions: true
            } as DefaultsTeamSeatRecoveryActionDefinition,
            restore_active: {
                label: 'Restore Active',
                summary: 'Return a suspended or review-only seat to active posture so it can use the permissions granted by its role again.'
            } as DefaultsTeamSeatRecoveryActionDefinition
        },
        stages: {
            drafting: {
                label: 'Drafting',
                summary: 'The project is still being shaped and should not be treated as a released internal basis yet.'
            },
            internal_review: {
                label: 'Internal Review',
                summary: 'The draft is ready for a sales, installer, or operations review before it moves further.'
            },
            commercial_signoff: {
                label: 'Commercial Sign-off',
                summary: 'Pricing, scope, and proposal posture are being checked before the draft is handed to the next desk.'
            },
            engineering_review: {
                label: 'Engineering Review',
                summary: 'The project now needs installer or engineering confirmation before release or procurement.'
            },
            client_ready: {
                label: 'Client-ready',
                summary: 'The workspace is being treated as ready for client-facing issue, subject to final owner approval.'
            },
            handed_off: {
                label: 'Handed Off',
                summary: 'The current desk has released the draft and the next owner should now control the follow-through.'
            }
        }
    },

    PROPOSAL_IDENTITY: {
        brandDefaults: {
            accent: '#2563eb',
            tagline: '',
            footerNote: '',
            maxLogoBytes: 180000
        },
        releaseStates: {
            working_draft: {
                label: 'Working Draft',
                summary: 'The proposal is still being shaped and should not be treated as client-ready or internally frozen yet.'
            },
            internal_review: {
                label: 'Internal Review',
                summary: 'The commercial or technical package is being reviewed before it can move to the next desk.'
            },
            ready_for_client: {
                label: 'Ready For Client',
                summary: 'The proposal is close enough for client issue once the last release conditions are checked.'
            },
            issued_to_client: {
                label: 'Issued To Client',
                summary: 'The proposal has already left the internal desk and should now carry the live release note clearly.'
            },
            frozen_for_delivery: {
                label: 'Frozen For Delivery',
                summary: 'The proposal basis should now be treated as controlled and only changed through deliberate handback.'
            }
        },
        releaseTemplates: {
            draft_internal: {
                label: 'Internal Draft Review',
                releaseState: 'internal_review',
                notes: 'Internal review only. Do not issue externally until commercial scope, exclusions, and survey posture are confirmed.'
            },
            client_issue_standard: {
                label: 'Standard Client Issue',
                releaseState: 'ready_for_client',
                notes: 'Ready for client issue once quote reference, commercial exclusions, and latest supplier posture are attached to the proposal package.'
            },
            delivery_freeze: {
                label: 'Delivery Freeze',
                releaseState: 'frozen_for_delivery',
                notes: 'Freeze the proposal basis for delivery only after the handback target, release owner, and final commercial sign-off are all closed.'
            }
        }
    },

    // Proposal / BOM commercial model
    PROPOSAL_PRICING: {
        termsDefaults: {
            depositPct: 60,
            validityDays: 14,
            installWindowDays: 7
        },
        lifecycleDefaults: {
            annualMaintenancePct: 1.5,
            inverterRefreshYear: 10,
            inverterRefreshPct: 35,
            batteryRefreshYearByChemistry: {
                lifepo4: 10,
                agm: 4,
                gel: 5,
                fla: 4
            },
            batteryRefreshPctByChemistry: {
                lifepo4: 35,
                agm: 70,
                gel: 65,
                fla: 60
            }
        },
        financeSensitivityDefaults: {
            taxBenefitPct: 0,
            debtSharePct: 0,
            debtAprPct: 0,
            debtTermYears: 5,
            residualValuePct: 0
        },
        quoteFreshnessDefaults: {
            supplierQuoteStatus: 'benchmark_only',
            refreshWindowDays: 14
        },
        supplierQuoteStatuses: {
            benchmark_only: {
                label: 'Benchmark Only',
                summary: 'The quote is still using offline benchmark pricing with no live supplier quote locked yet.',
                quoteStrength: 'benchmark'
            },
            partial_live_quotes: {
                label: 'Partial Live Quotes',
                summary: 'Some major component prices are live, but the full commercial path is still mixed between benchmarks and real quotes.',
                quoteStrength: 'partial'
            },
            major_lines_locked: {
                label: 'Major Lines Locked',
                summary: 'The core hardware lines are tied to live supplier numbers, while some BOS or soft allowances may still be benchmarked.',
                quoteStrength: 'major'
            },
            full_quote_locked: {
                label: 'Full Quote Locked',
                summary: 'The current commercial path is tied to live supplier numbers across the major BOM story and is ready for short-term quote issue.',
                quoteStrength: 'locked'
            }
        },
        financeModes: {
            grid_tariff_offset: {
                label: 'Grid Tariff Offset',
                summary: 'Use the client electricity tariff as the displaced kWh value when the site mainly buys utility energy.'
            },
            generator_energy_offset: {
                label: 'Generator Energy Offset',
                summary: 'Use the effective diesel or gas generation cost per kWh when the site mainly burns fuel during outages or weak-grid operation.'
            },
            blended_site_energy: {
                label: 'Blended Site Energy',
                summary: 'Use one blended cost per kWh when the site alternates between grid, generator, and other expensive replacement energy sources.'
            }
        },
        defaultLists: {
            includedScope: [...PROPOSAL_DEFAULT_LISTS.includedScope],
            exclusions: [...PROPOSAL_DEFAULT_LISTS.exclusions],
            nextSteps: [...PROPOSAL_DEFAULT_LISTS.nextSteps]
        },
        commercialPresets: PROPOSAL_COMMERCIAL_PRESETS,
        regionDefaults: {
            africa:  { currencyLabel: 'USD', regionalMultiplier: 1.04, laborPct: 18, softCostPct: 8, marginPct: 12, taxPct: 0, supplierPricePack: 'west_africa_import', financeMode: 'generator_energy_offset', energyRatePerKWh: 0.28, exportCreditPerKWh: 0.02, annualEscalationPct: 6, annualMaintenancePct: 1.8 },
            americas:{ currencyLabel: 'USD', regionalMultiplier: 1.18, laborPct: 22, softCostPct: 10, marginPct: 14, taxPct: 0, supplierPricePack: 'north_america_residential', financeMode: 'grid_tariff_offset', energyRatePerKWh: 0.18, exportCreditPerKWh: 0.05, annualEscalationPct: 3, annualMaintenancePct: 1.2 },
            europe:  { currencyLabel: 'USD', regionalMultiplier: 1.20, laborPct: 22, softCostPct: 10, marginPct: 14, taxPct: 0, supplierPricePack: 'europe_certified', financeMode: 'grid_tariff_offset', energyRatePerKWh: 0.24, exportCreditPerKWh: 0.07, annualEscalationPct: 3, annualMaintenancePct: 1.2 },
            asia:    { currencyLabel: 'USD', regionalMultiplier: 0.98, laborPct: 16, softCostPct: 8, marginPct: 12, taxPct: 0, supplierPricePack: 'asia_value_supply', financeMode: 'blended_site_energy', energyRatePerKWh: 0.16, exportCreditPerKWh: 0.03, annualEscalationPct: 4, annualMaintenancePct: 1.4 },
            oceania: { currencyLabel: 'USD', regionalMultiplier: 1.22, laborPct: 22, softCostPct: 10, marginPct: 14, taxPct: 0, supplierPricePack: 'oceania_remote_install', financeMode: 'grid_tariff_offset', energyRatePerKWh: 0.26, exportCreditPerKWh: 0.06, annualEscalationPct: 3, annualMaintenancePct: 1.3 },
            global:  { currencyLabel: 'USD', regionalMultiplier: 1.00, laborPct: 18, softCostPct: 8, marginPct: 12, taxPct: 0, supplierPricePack: 'global_reference', financeMode: 'blended_site_energy', energyRatePerKWh: 0.18, exportCreditPerKWh: 0.03, annualEscalationPct: 4, annualMaintenancePct: 1.5 }
        },
        pricePacks: {
            global_reference: {
                label: 'Global Reference Pack',
                badge: 'Global',
                region: 'global',
                supplierLabel: 'Cross-market benchmark',
                referenceWindow: 'Q1 2026 offline benchmark',
                coverage: 'Balanced international reference mix for modules, storage, inverter hardware, and BOS allowances.',
                note: 'Best fallback when the installer needs a neutral benchmark before local distributor pricing is confirmed.',
                rates: {
                    pvPerWp: 0.28,
                    inverterPerVA: 0.14,
                    mpptPerW: 0.040,
                    mountingPerWp: 0.12,
                    protectionPerWp: 0.08,
                    cablePerKg: 14,
                    monitoringFlat: 140,
                    batteryPerKWh: { lifepo4: 240, agm: 120, gel: 135, fla: 110 }
                }
            },
            west_africa_import: {
                label: 'West Africa Import Benchmark',
                badge: 'Africa',
                region: 'africa',
                supplierLabel: 'Regional distributor mix',
                referenceWindow: 'Q1 2026 offline benchmark',
                coverage: 'Imported modules, hybrid/off-grid inverter stock, BOS allowances, and FX-sensitive procurement channels common in Lagos, Accra, and nearby markets.',
                note: 'Good default for Nigeria and neighboring markets where imported stock and distributor markup drive the live quote.',
                rates: {
                    pvPerWp: 0.29,
                    inverterPerVA: 0.145,
                    mpptPerW: 0.041,
                    mountingPerWp: 0.11,
                    protectionPerWp: 0.085,
                    cablePerKg: 15,
                    monitoringFlat: 145,
                    batteryPerKWh: { lifepo4: 245, agm: 122, gel: 136, fla: 112 }
                }
            },
            north_america_residential: {
                label: 'North America Residential',
                badge: 'Americas',
                region: 'americas',
                supplierLabel: 'Residential installer benchmark',
                referenceWindow: 'Q1 2026 offline benchmark',
                coverage: 'Residential and light-commercial pricing posture with higher labor-compatible equipment expectations and certified BOS allowances.',
                note: 'Useful when the quote needs stronger branded-equipment positioning and North American installation overhead.',
                rates: {
                    pvPerWp: 0.34,
                    inverterPerVA: 0.20,
                    mpptPerW: 0.055,
                    mountingPerWp: 0.18,
                    protectionPerWp: 0.12,
                    cablePerKg: 21,
                    monitoringFlat: 230,
                    batteryPerKWh: { lifepo4: 380, agm: 170, gel: 195, fla: 160 }
                }
            },
            europe_certified: {
                label: 'Europe Certified Install',
                badge: 'Europe',
                region: 'europe',
                supplierLabel: 'Certified compliance benchmark',
                referenceWindow: 'Q1 2026 offline benchmark',
                coverage: 'Certified equipment allowances, higher documentation overhead, and stronger BOS/protection costs common in European residential installs.',
                note: 'Use when compliance-driven hardware selection and certified accessories materially affect the commercial baseline.',
                rates: {
                    pvPerWp: 0.33,
                    inverterPerVA: 0.19,
                    mpptPerW: 0.055,
                    mountingPerWp: 0.19,
                    protectionPerWp: 0.12,
                    cablePerKg: 20,
                    monitoringFlat: 210,
                    batteryPerKWh: { lifepo4: 360, agm: 165, gel: 190, fla: 155 }
                }
            },
            asia_value_supply: {
                label: 'Asia Value Supply',
                badge: 'Asia',
                region: 'asia',
                supplierLabel: 'Cost-led distributor benchmark',
                referenceWindow: 'Q1 2026 offline benchmark',
                coverage: 'Cost-led component sourcing, lighter BOS allowances, and efficient supply-chain assumptions common in price-sensitive Asian markets.',
                note: 'Strong baseline for value-led quoting where component sourcing is competitive and the installer wants a lean commercial posture.',
                rates: {
                    pvPerWp: 0.25,
                    inverterPerVA: 0.12,
                    mpptPerW: 0.036,
                    mountingPerWp: 0.10,
                    protectionPerWp: 0.06,
                    cablePerKg: 12,
                    monitoringFlat: 110,
                    batteryPerKWh: { lifepo4: 220, agm: 110, gel: 125, fla: 100 }
                }
            },
            oceania_remote_install: {
                label: 'Oceania Remote Install',
                badge: 'Oceania',
                region: 'oceania',
                supplierLabel: 'Remote-access benchmark',
                referenceWindow: 'Q1 2026 offline benchmark',
                coverage: 'Remote logistics, harsher access constraints, and higher BOS/monitoring allowances typical in Australian and Pacific island installs.',
                note: 'Best when travel, freight, and remote-site delivery constraints need to be reflected before the final supplier quotes arrive.',
                rates: {
                    pvPerWp: 0.36,
                    inverterPerVA: 0.22,
                    mpptPerW: 0.060,
                    mountingPerWp: 0.20,
                    protectionPerWp: 0.13,
                    cablePerKg: 24,
                    monitoringFlat: 260,
                    batteryPerKWh: { lifepo4: 410, agm: 185, gel: 210, fla: 170 }
                }
            }
        },
        profiles: {
            value: {
                label: 'Value Install',
                badge: 'Budget-first',
                headline: 'Lowest upfront commercial position for cost-sensitive projects.',
                note: 'Best when the client needs the leanest workable quote and accepts tighter commercial allowances.',
                spreadPct: 8,
                rateMultipliers: {
                    pvPerWp: 0.785714,
                    inverterPerVA: 0.714286,
                    mpptPerW: 0.625000,
                    mountingPerWp: 0.666667,
                    protectionPerWp: 0.625000,
                    cablePerKg: 0.714286,
                    monitoringFlat: 0.571429,
                    batteryPerKWh: { lifepo4: 0.708333, agm: 0.750000, gel: 0.740741, fla: 0.727273 }
                }
            },
            standard: {
                label: 'Standard Install',
                badge: 'Recommended',
                headline: 'Balanced offer for most residential and small-business installs.',
                note: 'Best overall default when you want a credible proposal without pushing the client to a premium budget.',
                spreadPct: 12,
                rateMultipliers: {
                    pvPerWp: 1.000000,
                    inverterPerVA: 1.000000,
                    mpptPerW: 1.000000,
                    mountingPerWp: 1.000000,
                    protectionPerWp: 1.000000,
                    cablePerKg: 1.000000,
                    monitoringFlat: 1.000000,
                    batteryPerKWh: { lifepo4: 1.000000, agm: 1.000000, gel: 1.000000, fla: 1.000000 }
                }
            },
            premium: {
                label: 'Premium Install',
                badge: 'Premium',
                headline: 'Higher-end package posture for brand, finish, and client assurance.',
                note: 'Use when presentation, equipment positioning, and contingency headroom matter more than lowest price.',
                spreadPct: 15,
                rateMultipliers: {
                    pvPerWp: 1.285714,
                    inverterPerVA: 1.357143,
                    mpptPerW: 1.375000,
                    mountingPerWp: 1.416667,
                    protectionPerWp: 1.375000,
                    cablePerKg: 1.357143,
                    monitoringFlat: 1.571429,
                    batteryPerKWh: { lifepo4: 1.333333, agm: 1.250000, gel: 1.259259, fla: 1.272727 }
                }
            }
        }
    },

    BUSINESS_PROFILES: ({
        custom_mixed_site: {
            label: 'Custom / Mixed Site',
            badge: 'Mixed',
            summary: 'Use when the site does not fit one vertical yet or the machine list is still evolving.',
            phaseStance: 'neutral',
            phaseGuidance: 'Do not force phase topology early. Let the real machine schedule, surge behavior, and continuity target justify single-phase, split-phase, or 3-phase.',
            recommendedIntent: 'backup_only',
            recommendedContinuity: 'business_critical',
            recommendedSchedule: 'business_day'
        },
        residential_backup: {
            label: 'Residential Backup',
            badge: 'Home',
            summary: 'Home resilience job with essential comfort, refrigeration, and connectivity loads.',
            phaseStance: 'single_default',
            phaseGuidance: 'Most homes should stay single-phase unless the site already has split-phase or a proven 3-phase service requirement.',
            recommendedIntent: 'backup_only',
            recommendedContinuity: 'convenience',
            recommendedSchedule: 'business_day',
            sampleTemplateId: 'residential_backup'
        },
        retail_shop: {
            label: 'Retail Shop / POS',
            badge: 'Retail',
            summary: 'Mini-mart, pharmacy, POS, or convenience shop where refrigeration and trading hours matter.',
            phaseStance: 'single_default',
            phaseGuidance: 'Single-phase is usually enough for small trading loads. Escalate only if refrigeration banks, AC, or larger motors justify it.',
            recommendedIntent: 'backup_only',
            recommendedContinuity: 'business_critical',
            recommendedSchedule: 'extended_business_day',
            sampleTemplateId: 'retail_shop'
        },
        tailoring_studio: {
            label: 'Tailoring Studio',
            badge: 'Workshop',
            summary: 'Small sewing or fashion studio with servo machines, lighting, fans, and intermittent pressing.',
            phaseStance: 'single_default',
            phaseGuidance: 'Tailoring studios normally stay single-phase. Move to 3-phase only when the machine list grows into a true garment workshop.',
            recommendedIntent: 'daytime_solar_first',
            recommendedContinuity: 'business_critical',
            recommendedSchedule: 'business_day',
            sampleTemplateId: 'tailoring_studio'
        },
        garment_workshop: {
            label: 'Garment Workshop',
            badge: 'Production',
            summary: 'Larger sewing floor with more machines, ironing stations, compressors, and production throughput pressure.',
            phaseStance: 'conditional_3phase',
            phaseGuidance: '3-phase review is often justified once clutch motors, pressing banks, compressors, or multiple production lines appear, but it is not automatic.',
            recommendedIntent: 'daytime_solar_first',
            recommendedContinuity: 'process_critical',
            recommendedSchedule: 'two_shift',
            sampleTemplateId: 'garment_workshop'
        },
        bakery: {
            label: 'Bakery',
            badge: 'Food',
            summary: 'Production bakery with mixers, proofing, refrigeration, and sometimes electric ovens.',
            phaseStance: 'conditional_3phase',
            phaseGuidance: 'Do not force 3-phase by category alone. Gas-fired ovens and lighter mixers may stay single-phase, while electric ovens or larger production lines justify 3-phase review.',
            recommendedIntent: 'hybrid_generator',
            recommendedContinuity: 'process_critical',
            recommendedSchedule: 'intermittent_production',
            sampleTemplateId: 'bakery_daytime_production'
        },
        filling_station: {
            label: 'Filling Station',
            badge: 'Fuel',
            summary: 'Commercial fuel site with pumps, compressors, lighting, controls, and uneven phase-heavy demand.',
            phaseStance: 'review_3phase',
            phaseGuidance: '3-phase review is strongly justified for most filling stations, but an essential-load or control-room backup package can still target selected single-phase circuits.',
            recommendedIntent: 'hybrid_generator',
            recommendedContinuity: 'process_critical',
            recommendedSchedule: 'extended_business_day',
            sampleTemplateId: 'filling_station_hybrid'
        },
        clinic_critical: {
            label: 'Clinic Critical Loads',
            badge: 'Clinic',
            summary: 'Critical-load medical site with refrigeration, lighting, IT, and selected support equipment.',
            phaseStance: 'conditional_3phase',
            phaseGuidance: 'Many clinics should back only essential circuits first. Escalate to 3-phase when the protected equipment schedule proves it.',
            recommendedIntent: 'essential_loads_only',
            recommendedContinuity: 'process_critical',
            recommendedSchedule: 'twenty_four_seven',
            sampleTemplateId: 'clinic_critical'
        },
        cold_room: {
            label: 'Cold Room / Refrigeration',
            badge: 'Cold Chain',
            summary: 'Temperature-sensitive site where compressor duty and product protection dominate the design story.',
            phaseStance: 'review_3phase',
            phaseGuidance: 'Cold-room sites often justify 3-phase or hybrid assist because product-loss exposure is high and compressor starts are unforgiving.',
            recommendedIntent: 'hybrid_generator',
            recommendedContinuity: 'product_loss_critical',
            recommendedSchedule: 'night_preservation',
            sampleTemplateId: 'cold_room_preservation'
        },
        fabrication_workshop: {
            label: 'Fabrication Workshop',
            badge: 'Workshop',
            summary: 'Workshop with welders, grinders, compressors, and higher surge industrial tools.',
            phaseStance: 'review_3phase',
            phaseGuidance: 'Most fabrication shops need explicit phase and surge review. Treat 3-phase as likely, not automatic, until the machine schedule is confirmed.',
            recommendedIntent: 'hybrid_generator',
            recommendedContinuity: 'process_critical',
            recommendedSchedule: 'intermittent_production',
            sampleTemplateId: 'fabrication_workshop'
        },
        mini_factory: {
            label: 'Mini-Factory',
            badge: 'Factory',
            summary: 'Small industrial site with multiple production machines, process uptime requirements, and larger growth expectations.',
            phaseStance: 'review_3phase',
            phaseGuidance: 'Mini-factory projects usually warrant 3-phase review and stricter continuity planning because one weak phase can bottleneck the site.',
            recommendedIntent: 'hybrid_generator',
            recommendedContinuity: 'process_critical',
            recommendedSchedule: 'two_shift',
            sampleTemplateId: 'mini_factory_process'
        },
        water_pump_site: {
            label: 'Water Pump Site',
            badge: 'Pump',
            summary: 'Pump-led site where water delivery is the main motive load and daytime operation should be exploited.',
            phaseStance: 'conditional_3phase',
            phaseGuidance: 'Small pumps can stay single-phase. Larger borehole, booster, or multi-pump arrangements deserve a 3-phase review before the topology is locked.',
            recommendedIntent: 'daytime_solar_first',
            recommendedContinuity: 'business_critical',
            recommendedSchedule: 'business_day',
            sampleTemplateId: 'pump_and_home'
        }
    }) as Record<string, DefaultsBusinessProfileDefinition>,

    BUSINESS_OPERATING_INTENTS: ({
        backup_only: {
            label: 'Backup-Only Resilience',
            summary: 'Keep selected loads alive during outages without promising full all-day off-grid operation.',
            preferredSystemTypes: ['off_grid', 'hybrid']
        },
        full_offgrid: {
            label: 'Full Off-Grid Operation',
            summary: 'Run the full site mainly from PV and battery with strict load discipline and larger storage expectations.',
            preferredSystemTypes: ['off_grid']
        },
        daytime_solar_first: {
            label: 'Daytime Solar-First',
            summary: 'Shift productive loads into solar hours and let the battery mainly bridge peaks, evenings, or interruptions.',
            preferredSystemTypes: ['off_grid', 'hybrid']
        },
        hybrid_generator: {
            label: 'Hybrid With Generator Support',
            summary: 'Use PV and battery for offset and bridging while generator support handles deep process peaks or long outages.',
            preferredSystemTypes: ['hybrid', 'off_grid']
        },
        hybrid_grid: {
            label: 'Hybrid With Grid Support',
            summary: 'Use PV and storage to reduce bills or improve uptime while grid support remains part of the operating plan.',
            preferredSystemTypes: ['hybrid', 'grid_tie']
        },
        essential_loads_only: {
            label: 'Essential Loads Only',
            summary: 'Protect only the critical circuits instead of trying to carry the full facility.',
            preferredSystemTypes: ['off_grid', 'hybrid']
        }
    }) as Record<string, DefaultsOperatingIntentDefinition>,

    BUSINESS_CONTINUITY_CLASSES: ({
        convenience: {
            label: 'Convenience Critical',
            summary: 'Outages are uncomfortable, but short interruptions do not destroy production or stock.'
        },
        business_critical: {
            label: 'Business Critical',
            summary: 'Power loss quickly hurts trading hours, sales, or routine operations.'
        },
        process_critical: {
            label: 'Process Critical',
            summary: 'Power interruption disrupts production flow, staffing, or process quality.'
        },
        product_loss_critical: {
            label: 'Product-Loss Critical',
            summary: 'Power failure risks spoilage, temperature excursions, or loss of sensitive stock.'
        }
    }) as Record<string, DefaultsContinuityClassDefinition>,

    OPERATING_SCHEDULES: ({
        business_day: {
            label: 'Business Hours (8am-6pm)',
            summary: 'Main activity happens during standard working hours, with a lighter overnight support burden.',
            operatingDaysPerWeek: 6,
            prefersDaytimeShift: true,
            expectsNightContinuity: false,
            preservationFocus: false
        },
        extended_business_day: {
            label: 'Extended Business Day',
            summary: 'Long trading day with early-start and late-close activity, plus selected overnight support loads.',
            operatingDaysPerWeek: 6,
            prefersDaytimeShift: true,
            expectsNightContinuity: true,
            preservationFocus: false
        },
        two_shift: {
            label: 'Two Shift Production',
            summary: 'Day and evening production windows with a shorter overnight idle period.',
            operatingDaysPerWeek: 6,
            prefersDaytimeShift: false,
            expectsNightContinuity: true,
            preservationFocus: false
        },
        intermittent_production: {
            label: 'Intermittent Production',
            summary: 'Batch or process peaks should be deliberately aligned to solar-rich hours whenever possible.',
            operatingDaysPerWeek: 6,
            prefersDaytimeShift: true,
            expectsNightContinuity: false,
            preservationFocus: false
        },
        twenty_four_seven: {
            label: '24/7 Continuous Operation',
            summary: 'The site expects round-the-clock uptime on key circuits and cannot be treated as a daytime-only operation.',
            operatingDaysPerWeek: 7,
            prefersDaytimeShift: false,
            expectsNightContinuity: true,
            preservationFocus: false
        },
        night_preservation: {
            label: 'Night Preservation Load',
            summary: 'Daytime production continues, but refrigeration or preservation loads dominate the overnight continuity story.',
            operatingDaysPerWeek: 7,
            prefersDaytimeShift: true,
            expectsNightContinuity: true,
            preservationFocus: true
        }
    }) as Record<string, DefaultsOperatingScheduleDefinition>,

    LOAD_ROLE_DEFINITIONS: ({
        base: {
            label: 'Base Load',
            summary: 'Always-on or routine support load that shapes the site baseline.'
        },
        process: {
            label: 'Process Load',
            summary: 'Core production or revenue-driving equipment the business deliberately depends on.'
        },
        refrigeration: {
            label: 'Refrigeration / Preservation',
            summary: 'Cold-chain, temperature-control, or stock-protection load.'
        },
        operator_peak: {
            label: 'Operator-Triggered Peak',
            summary: 'Shorter but heavier operator-initiated load that can dominate surge or demand windows.'
        },
        discretionary: {
            label: 'Discretionary / Shiftable',
            summary: 'Convenience or delayable load that should move when the power strategy gets tight.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    LOAD_CRITICALITY_DEFINITIONS: ({
        critical: {
            label: 'Critical',
            summary: 'Loss of this load creates immediate operational, safety, or stock-loss risk.'
        },
        essential: {
            label: 'Essential',
            summary: 'Strongly preferred during outages, but can be rationed with clear operating rules.'
        },
        deferrable: {
            label: 'Deferrable',
            summary: 'Can wait for sun, generator support, or a lower-demand window.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    COMMERCIAL_ARCHITECTURE_MODES: ({
        auto: {
            label: 'Auto-Resolve From Site Context',
            summary: 'Let the calculator infer whether the job behaves more like a full-site board, selective sub-board, process split, or generator-assisted architecture.'
        },
        full_site_board: {
            label: 'Full Site Board',
            summary: 'The quoted system is expected to support the main distribution board without carving out a dedicated protected sub-board.'
        },
        essential_subboard: {
            label: 'Essential-Load Sub-Board',
            summary: 'Protect only the critical and essential circuits so battery, inverter, and autonomy are spent where continuity matters most.'
        },
        process_split_board: {
            label: 'Process / Support Split Board',
            summary: 'Separate production or heavier process circuits from lighter support loads so the site can run in staged operating modes.'
        },
        generator_assist: {
            label: 'Generator-Assist Hybrid',
            summary: 'PV and battery carry offset and bridging duty while generator support remains part of the real operating topology.'
        }
    }) as Record<string, DefaultsCommercialArchitectureModeDefinition>,

    GENERATOR_SUPPORT_MODES: ({
        none: {
            label: 'No Generator Path Assumed',
            summary: 'The design is being judged without any generator support path in the commercial topology.'
        },
        existing_generator: {
            label: 'Existing Generator Available',
            summary: 'An installed generator will remain part of the operating plan and should be sized against the protected load path.'
        },
        planned_generator: {
            label: 'Generator To Be Added / Quoted',
            summary: 'The project expects generator support, but the final set size or procurement path still needs confirmation.'
        }
    }) as Record<string, DefaultsGeneratorSupportModeDefinition>,

    PV_FIELD_LAYOUTS: ({
        single_field: {
            label: 'Single Roof / Single Field',
            summary: 'One dominant PV field with similar tilt and orientation. Tracker separation is usually optional.'
        },
        dual_roof: {
            label: 'Dual Roof Faces',
            summary: 'PV is split across two roof areas or elevations that can justify separate tracker treatment.'
        },
        mixed_orientation: {
            label: 'Mixed Orientation Array',
            summary: 'Different azimuths or tilt angles need deliberate MPPT grouping so one field does not drag down another.'
        },
        roof_and_ground: {
            label: 'Roof + Ground Array',
            summary: 'Two distinct field zones with different routing, maintenance, or production behavior.'
        },
        distributed_canopy: {
            label: 'Distributed Canopy / Site Fields',
            summary: 'Multiple canopy or building-top PV zones where field routing and tracker separation matter commercially.'
        }
    }) as Record<string, DefaultsPVFieldLayoutDefinition>,

    MPPT_GROUPING_MODES: ({
        auto: {
            label: 'Auto-Resolve Grouping',
            summary: 'Let the calculator suggest whether trackers should be shared, split by field, or separated by orientation.'
        },
        grouped_single_field: {
            label: 'Grouped Single Field',
            summary: 'Treat the PV array as one coherent field and group strings under common tracking when the geometry truly matches.'
        },
        independent_trackers: {
            label: 'Independent Tracker Banks',
            summary: 'Keep tracker inputs independent so field differences and maintenance isolation stay clean.'
        },
        orientation_split: {
            label: 'Split By Orientation',
            summary: 'Use separate MPPT banks for east/west, north/south, or other orientation mismatches.'
        },
        field_split: {
            label: 'Split By PV Field',
            summary: 'Keep roof zones, canopy sections, or roof-ground arrays on separate tracker banks.'
        }
    }) as Record<string, DefaultsMPPTGroupingDefinition>,

    PLANT_SCOPE_MODES: ({
        auto: {
            label: 'Auto-Resolve Site Scope',
            summary: 'Let the calculator decide whether the job still behaves like one captive site board, a multi-feeder commercial site, or a heavier private microgrid-style plant.'
        },
        captive_site: {
            label: 'Captive Site / Single Premises',
            summary: 'One business site with one main electrical boundary. Good for straightforward single-board or protected-board projects.'
        },
        multi_feeder_site: {
            label: 'Multi-Feeder Commercial Site',
            summary: 'One business property with several meaningful feeder paths, protected boards, or process-support branches that need explicit operating discipline.'
        },
        private_microgrid: {
            label: 'Private Microgrid / Internal Plant',
            summary: 'A heavier private distribution environment with several protected or staged nodes inside one client-controlled site.'
        },
        public_service_microgrid: {
            label: 'Public-Service / Third-Party Microgrid',
            summary: 'A public-service or utility-like microgrid lane that needs external interconnection, protection, and operating studies beyond this calculator.'
        }
    }) as Record<string, DefaultsPlantScopeModeDefinition>,

    DISTRIBUTION_TOPOLOGY_MODES: ({
        auto: {
            label: 'Auto-Resolve Topology',
            summary: 'Let the calculator infer whether the site still behaves like one board, a protected critical bus, radial feeders, or distributed nodes.'
        },
        single_board: {
            label: 'Single Main Board',
            summary: 'Treat the site as one dominant board path without claiming a separate protected or feeder-level operating topology.'
        },
        protected_critical_bus: {
            label: 'Protected Critical Bus',
            summary: 'Use a protected continuity bus for critical and essential loads while other site loads remain outside the promised support path.'
        },
        radial_feeders: {
            label: 'Radial Feeders / Board Branches',
            summary: 'Treat the site as several feeder or board branches that need explicit support boundaries and staged operating behavior.'
        },
        distributed_nodes: {
            label: 'Distributed Nodes / Plant Zones',
            summary: 'Use several internal nodes or plant zones with heavier feeder coordination than a normal captive-site board story.'
        }
    }) as Record<string, DefaultsDistributionTopologyDefinition>,

    INTERCONNECTION_SCOPE_MODES: ({
        auto: {
            label: 'Auto-Resolve Source Scope',
            summary: 'Let the calculator infer whether the project is islanded, behind-the-meter hybrid, internal private distribution, or public-service interconnection.'
        },
        offgrid_islanded: {
            label: 'Islanded / No External Interconnection',
            summary: 'PV, battery, and optional generator operate inside one site without a live utility export or interconnection approval path.'
        },
        behind_meter_hybrid: {
            label: 'Behind-The-Meter Hybrid',
            summary: 'The site still sits behind a normal utility meter or service connection while PV and storage improve offset or resilience.'
        },
        private_distribution: {
            label: 'Private Distribution Only',
            summary: 'The site has internal feeder or plant distribution complexity, but it is still not being modeled as a public-service grid.'
        },
        public_service_interconnection: {
            label: 'Public-Service Interconnection',
            summary: 'A utility-facing or third-party service lane that needs formal interconnection, protection, and operating studies beyond this calculator.'
        }
    }) as Record<string, DefaultsInterconnectionScopeDefinition>,

    UTILITY_PACKET_MODES: ({
        auto: {
            label: 'Auto-Resolve Packet Lane',
            summary: 'Let the calculator suggest whether the job needs no separate packet, a captive handoff packet, a hybrid approval packet, or a formal interconnection packet.'
        },
        not_required: {
            label: 'No Separate Packet Yet',
            summary: 'Keep the job in the normal captive-site handoff path without opening a heavier approval packet lane.'
        },
        captive_handoff_packet: {
            label: 'Captive Plant Handoff Pack',
            summary: 'Use a bounded installer packet for feeder, board, breaker, and handoff discipline without claiming a formal interconnection package.'
        },
        hybrid_approval_packet: {
            label: 'Hybrid / Approval Packet',
            summary: 'Carry anti-backfeed, transfer, labeling, and utility-facing notes explicitly because the job is no longer just an internal captive-site handoff.'
        },
        formal_interconnection_packet: {
            label: 'Formal Interconnection Packet',
            summary: 'Treat the job as requiring a formal application, authority packet, metering basis, and explicit interconnection workflow.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_METERING_POSTURE_MODES: ({
        auto: {
            label: 'Auto-Resolve Metering Posture',
            summary: 'Let the calculator infer whether the job still behaves like a captive site, a behind-the-meter non-export job, a limited-export job, or a utility-metered lane.'
        },
        captive_no_meter: {
            label: 'Captive / No Separate Metering Lane',
            summary: 'Use this when the job still behaves like an internal captive-site plant with no separate export or interconnection posture.'
        },
        behind_meter_non_export: {
            label: 'Behind-Meter / Non-Export',
            summary: 'The site stays behind the normal service meter and should carry a non-export or anti-backfeed posture explicitly.'
        },
        behind_meter_limited_export: {
            label: 'Behind-Meter / Limited Export',
            summary: 'The site is still behind the meter, but export posture or export limits must stay visible in the engineering handoff.'
        },
        utility_service_meter: {
            label: 'Utility / Third-Party Metering',
            summary: 'Use this when the job now depends on a formal utility, public-service, or third-party metering posture.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_STUDY_INPUT_STATUS_MODES: ({
        auto: {
            label: 'Auto-Resolve Study Basis',
            summary: 'Let the calculator suggest whether the job is still preliminary, has a frozen feeder basis, needs protection review, or now requires an external study lane.'
        },
        preliminary_basis: {
            label: 'Preliminary Basis Only',
            summary: 'Use this while the job is still in early scoping and the feeder / protection basis is not yet frozen.'
        },
        feeder_basis_frozen: {
            label: 'Feeder Basis Frozen',
            summary: 'The feeder names, promise lanes, and board/source schedule are stable enough to move into one-line or procurement prep.'
        },
        protection_basis_pending: {
            label: 'Protection Basis Under Review',
            summary: 'The feeder story is clear, but breaker, cable, or source-protection basis still needs deliberate review.'
        },
        external_study_required: {
            label: 'External Study Required',
            summary: 'The project now needs a separate feeder, protection, or interconnection study workflow outside the normal captive-site handoff.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_STUDY_TRACK_MODES: ({
        auto: {
            label: 'Auto-Resolve Study Track',
            summary: 'Let the calculator suggest whether the active study handoff is still one-line basis, breaker/cable review, protection/relay review, or a separate external study pack.'
        },
        one_line_basis_pack: {
            label: 'One-Line / Feeder Basis Pack',
            summary: 'Use this when the study lane is still mainly preserving feeder names, source paths, and board basis for one-line drafting.'
        },
        breaker_cable_review: {
            label: 'Breaker / Cable Review Pack',
            summary: 'Use this when the study lane mainly needs breaker carry-through, cable basis, and procurement-linked protection review.'
        },
        protection_relay_review: {
            label: 'Protection / Relay Review Pack',
            summary: 'Use this when relay logic, export / non-export proof, or deeper protection review is already part of the active handoff.'
        },
        external_study_pack: {
            label: 'External Study / Utility Pack',
            summary: 'Use this when the active study lane is already being carried into a separate external feeder, protection, or utility-study workflow.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_PROTECTION_REVIEW_MODES: ({
        auto: {
            label: 'Auto-Resolve Protection Review',
            summary: 'Let the calculator suggest whether the study still only needs breaker/cable carry-through, feeder coordination review, relay/export logic review, or a separate external selectivity study.'
        },
        breaker_cable_carry_through: {
            label: 'Breaker / Cable Carry-Through',
            summary: 'Use this when the study handoff mainly needs breaker ratings, cable sizes, and feeder names preserved into a one-line or procurement review.'
        },
        feeder_breaker_coordination: {
            label: 'Feeder / Breaker Coordination',
            summary: 'Use this when feeder breaker relationships and staged board/source protection review are already part of the active handoff.'
        },
        relay_trip_export_review: {
            label: 'Relay / Export Logic Review',
            summary: 'Use this when the active handoff already depends on relay behavior, trip logic, non-export proof, or export-limiting review.'
        },
        external_selectivity_study: {
            label: 'External Selectivity / Protection Study',
            summary: 'Use this when protection grading, selectivity, or utility-interface protection now lives in a separate external study lane.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_EXPORT_CONTROL_MODES: ({
        auto: {
            label: 'Auto-Resolve Export Control Basis',
            summary: 'Let the calculator suggest whether the study still only needs a captive no-export declaration, a zero-export control basis, non-export relay proof, limited-export control, or utility-metered export logic.'
        },
        captive_no_export_declaration: {
            label: 'Captive / No-Export Declaration',
            summary: 'Use this when the site remains islanded or purely captive and does not need a separate export-control proof path.'
        },
        reverse_power_or_zero_export: {
            label: 'Reverse Power / Zero-Export Control',
            summary: 'Use this when the active study lane depends on reverse-power blocking or a zero-export control posture behind the meter.'
        },
        non_export_relay_trip_proof: {
            label: 'Non-Export Relay / Trip Proof',
            summary: 'Use this when non-export behavior must be proven through relay logic, trip settings, or formal protection evidence.'
        },
        limited_export_control: {
            label: 'Limited-Export Control',
            summary: 'Use this when the handoff depends on export limiting, export caps, or controlled export under a defined threshold.'
        },
        utility_dispatch_or_metered_export: {
            label: 'Utility Dispatch / Metered Export',
            summary: 'Use this when the project has already moved into utility-metered export, dispatch, or authority-controlled export behavior.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_RELAY_SCHEME_MODES: ({
        auto: {
            label: 'Auto-Resolve Relay Scheme',
            summary: 'Let the calculator suggest whether the active study still only needs breaker interlock basis, a plant protection relay story, non-export trip proof, a utility-interface protection scheme, or an external relay-study pack.'
        },
        breaker_interlock_only: {
            label: 'Breaker / Interlock Only',
            summary: 'Use this when the study handoff still only needs breaker labels, interlock basis, and no separate protection relay logic.'
        },
        plant_protection_relay: {
            label: 'Plant Protection Relay',
            summary: 'Use this when the active handoff already depends on an internal plant protection relay or feeder-protection logic beyond simple breaker carry-through.'
        },
        non_export_trip_relay: {
            label: 'Non-Export / Trip Relay',
            summary: 'Use this when non-export proof, reverse-power behavior, or trip logic is the main relay basis being carried into the study lane.'
        },
        utility_interface_protection: {
            label: 'Utility-Interface Protection',
            summary: 'Use this when the active lane already depends on utility-facing interface protection, export relay behavior, or grid-side protection logic.'
        },
        external_relay_study_pack: {
            label: 'External Relay Study Pack',
            summary: 'Use this when the relay scheme already lives in a separate external protection or interconnection study workflow.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_TRANSFER_SCHEME_MODES: ({
        auto: {
            label: 'Auto-Resolve Transfer Scheme',
            summary: 'Let the calculator suggest whether the active handoff still uses local manual changeover, ATS / staged transfer, synchronized transition, utility-controlled energization, or an external switching study.'
        },
        manual_local_changeover: {
            label: 'Manual / Local Changeover',
            summary: 'Use this when the current study handoff still only needs local isolation or manual changeover basis.'
        },
        ats_or_staged_transfer: {
            label: 'ATS / Staged Transfer',
            summary: 'Use this when the active handoff already depends on ATS behavior or staged transfer / staged restart logic.'
        },
        closed_transition_or_sync: {
            label: 'Closed Transition / Sync',
            summary: 'Use this when synchronized transfer, closed transition, or controller-managed source transfer is already part of the handoff.'
        },
        utility_controlled_energization: {
            label: 'Utility-Controlled Energization',
            summary: 'Use this when the active lane already depends on utility or authority-controlled switching, energization, or release sequence.'
        },
        external_switching_study: {
            label: 'External Switching Study',
            summary: 'Use this when the switching and restoration sequence already lives in a separate external study or operating-philosophy pack.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_DELIVERABLE_STATUS_MODES: ({
        auto: {
            label: 'Auto-Resolve Deliverable Status',
            summary: 'Let the calculator infer whether the current deliverable is still draft-only, review-ready, issued, or already controlled outside the app.'
        },
        draft_only: {
            label: 'Draft Only',
            summary: 'The deliverable exists only as an internal working draft and should not be treated as review-ready yet.'
        },
        review_ready: {
            label: 'Review Ready',
            summary: 'The deliverable basis is mature enough for internal review, consultant review, or controlled handoff.'
        },
        issued_or_submitted: {
            label: 'Issued / Submitted',
            summary: 'The deliverable has already been issued, submitted, or formally handed into the active review lane.'
        },
        externally_controlled: {
            label: 'Externally Controlled',
            summary: 'The deliverable is now controlled in an external EPC, authority, utility, or study workflow outside the app.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_FILING_CHANNEL_MODES: ({
        auto: {
            label: 'Auto-Resolve Filing Channel',
            summary: 'Let the calculator infer whether the packet is still internal, installer-led, consultant-led, or already in a portal / utility-desk lane.'
        },
        internal_prep_only: {
            label: 'Internal Prep Only',
            summary: 'The packet still lives inside internal preparation and has not yet entered a formal outward filing route.'
        },
        installer_led_submission: {
            label: 'Installer-Led Submission',
            summary: 'The installer or project manager is expected to file or hand in the packet directly.'
        },
        consultant_or_epc_submission: {
            label: 'Consultant / EPC Submission',
            summary: 'A consultant, EPC lead, or external engineering partner is controlling the outward packet filing.'
        },
        portal_or_utility_desk: {
            label: 'Portal / Utility Desk Filing',
            summary: 'The live filing route is a portal upload, utility desk, or authority-controlled submission channel.'
        },
        externally_controlled: {
            label: 'Externally Controlled Filing',
            summary: 'The packet filing route is already being managed in an external document-control or authority workflow.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_HOLD_POINT_MODES: ({
        auto: {
            label: 'Auto-Resolve Hold Point',
            summary: 'Let the calculator infer whether the next controlling hold point is still internal, study/protection, metering/export, witness, or already external.'
        },
        internal_release: {
            label: 'Internal Release Only',
            summary: 'No formal external hold point exists yet beyond internal engineering release.'
        },
        study_or_protection_clearance: {
            label: 'Study / Protection Clearance',
            summary: 'The next controlling gate depends on feeder study, protection review, or relay-basis clearance.'
        },
        metering_or_export_clearance: {
            label: 'Metering / Export Clearance',
            summary: 'The next controlling gate depends on metering posture, non-export proof, or export-related clearance.'
        },
        witness_or_energization_clearance: {
            label: 'Witness / Energization Clearance',
            summary: 'The next controlling gate is a witness, energization, acceptance, or final closeout hold point.'
        },
        externally_controlled: {
            label: 'Externally Controlled Hold Point',
            summary: 'The controlling hold point already sits in an external authority, EPC, or utility workflow.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_RESPONSE_PATH_MODES: ({
        auto: {
            label: 'Auto-Resolve Response Path',
            summary: 'Let the calculator infer whether responses still stay internal, installer-led, consultant-led, portal-driven, or externally controlled.'
        },
        internal_revision_cycle: {
            label: 'Internal Revision Cycle',
            summary: 'Responses are still internal and have not yet entered a formal outward review cycle.'
        },
        installer_led_response: {
            label: 'Installer-Led Response',
            summary: 'The installer or PM is expected to carry the next response, resubmission, or closeout handback.'
        },
        consultant_led_response: {
            label: 'Consultant / EPC Response',
            summary: 'A consultant, EPC lead, or external engineering owner is expected to carry the next response cycle.'
        },
        portal_redline_cycle: {
            label: 'Portal / Redline Response Cycle',
            summary: 'The live response path is already moving through a portal, desk comments, or authority redline cycle.'
        },
        externally_controlled: {
            label: 'Externally Controlled Response',
            summary: 'The active response cycle is now being controlled outside the app.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    COMMISSIONING_PATH_MODES: ({
        auto: {
            label: 'Auto-Resolve Commissioning Path',
            summary: 'Let the calculator suggest whether the job only needs internal handoff, a client witness path, or a formal authority witness path.'
        },
        internal_handover: {
            label: 'Internal Commissioning Handover',
            summary: 'Use a bounded internal commissioning pack with feeder labels, source posture, and restart notes.'
        },
        client_witness: {
            label: 'Client / Owner Witness',
            summary: 'The commissioning lane should include a formal owner or client witness walk-through for the protected and assisted feeder story.'
        },
        authority_witness: {
            label: 'Authority / Utility Witness',
            summary: 'The job now needs a formal witness, acceptance, or hold-point path beyond the normal captive-site commissioning handoff.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_PACKET_STAGE_MODES: ({
        auto: {
            label: 'Auto-Resolve Packet Stage',
            summary: 'Let the calculator suggest whether the packet is still planning-only, ready for submission, under review, or already controlled outside this workflow.'
        },
        planning_basis: {
            label: 'Planning / Draft Basis',
            summary: 'The packet lane is known, but the project is still shaping the first usable packet or approval basis.'
        },
        ready_for_submission: {
            label: 'Ready For Submission',
            summary: 'The packet basis is mature enough to leave proposal work and move into a formal approval or review lane.'
        },
        submitted_under_review: {
            label: 'Submitted / Under Review',
            summary: 'The packet or application is already in review, so comments, revisions, and tracked references must stay explicit.'
        },
        conditional_clearance: {
            label: 'Conditional / Pending Closeout',
            summary: 'The packet has a provisional or conditional clearance, but closeout items still need to be tracked before energization.'
        },
        externally_managed: {
            label: 'External Case Managed',
            summary: 'The packet is now being controlled in a separate authority, EPC, or utility workflow outside the app.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    UTILITY_CASE_STATUS_MODES: ({
        auto: {
            label: 'Auto-Resolve Case Status',
            summary: 'Let the calculator suggest whether the authority or utility case is still internal, already submitted, carrying comments, conditionally cleared, or externally closed.'
        },
        internal_preparation: {
            label: 'Internal Preparation',
            summary: 'The authority or utility case still lives inside internal packet preparation and has not yet entered a formal review desk.'
        },
        ready_for_filing: {
            label: 'Ready For Filing',
            summary: 'The case basis is stable enough to file, but the formal submission has not yet been handed into the authority lane.'
        },
        submitted_waiting_review: {
            label: 'Submitted / Awaiting Review',
            summary: 'The case has been filed and is waiting for the authority, utility, or desk-review cycle to respond.'
        },
        review_comments_open: {
            label: 'Review Comments Open',
            summary: 'The authority or utility has responded with comments, clarifications, or revision requests that must stay attached to the packet lane.'
        },
        conditional_clearance_open: {
            label: 'Conditional Clearance Open',
            summary: 'The case has a conditional or provisional clearance, but named closeout items still need to be completed before full acceptance.'
        },
        accepted_pending_witness: {
            label: 'Accepted / Pending Witness',
            summary: 'The case is materially accepted, but witness, commissioning, or acceptance-evidence steps are still open.'
        },
        externally_closed: {
            label: 'Externally Closed',
            summary: 'The case is now controlled and closed in an external authority, utility, or EPC workflow outside the app.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    WITNESS_PARTY_MODES: ({
        auto: {
            label: 'Auto-Resolve Witness Parties',
            summary: 'Let the calculator infer whether the handoff stays installer-only, client-facing, authority-facing, or multi-party.'
        },
        installer_only: {
            label: 'Installer Internal Only',
            summary: 'The handoff only needs internal installer commissioning and sign-off discipline.'
        },
        client_and_installer: {
            label: 'Client + Installer Witness',
            summary: 'The handoff should include an owner or client witness beside the installer commissioning team.'
        },
        authority_or_utility: {
            label: 'Authority / Utility Witness',
            summary: 'A formal authority, utility, or third-party witness must be expected in the commissioning path.'
        },
        multi_party_witness: {
            label: 'Multi-Party Witness',
            summary: 'The handoff should expect installer, client, and authority or third-party participation in the witness path.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    WITNESS_EVIDENCE_MODES: ({
        auto: {
            label: 'Auto-Resolve Witness Evidence',
            summary: 'Let the calculator suggest the minimum proof pack needed for startup, transfer, export posture, or authority acceptance.'
        },
        startup_labels_only: {
            label: 'Startup + Label Proof',
            summary: 'Carry startup checks, labeling, and basic operating-mode confirmation without a deeper witness package.'
        },
        staged_transfer_proof: {
            label: 'Staged Transfer / Restart Proof',
            summary: 'Carry staged restart, transfer, and protected-versus-assisted feeder proof for plant handoff.'
        },
        non_export_protection_proof: {
            label: 'Non-Export / Protection Proof',
            summary: 'Carry anti-backfeed, export-limiting, and protection-basis proof where hybrid or behind-meter posture matters.'
        },
        authority_acceptance_pack: {
            label: 'Authority Acceptance Pack',
            summary: 'Carry the witness evidence, recorded settings, transfer proof, and acceptance record expected by a formal authority or utility lane.'
        }
    }) as Record<string, DefaultsLabeledSummaryDefinition>,

    BATTERY_THROUGHPUT_THRESHOLDS: ({
        readyUtilizationPct: 70,
        tightUtilizationPct: 85,
        failUtilizationPct: 100,
        emergencySurgeFactor: 1.5,
        tightStressIndex: 75,
        failStressIndex: 95
    }) as DefaultsBatteryThroughputThresholds,

    COMMERCIAL_ARCHITECTURE_PROFILE_DEFAULTS: ({
        custom_mixed_site: { boardStrategy: 'full_site_board', pvFieldLayout: 'single_field', mpptGrouping: 'auto' },
        residential_backup: { boardStrategy: 'full_site_board', pvFieldLayout: 'single_field', mpptGrouping: 'grouped_single_field' },
        retail_shop: { boardStrategy: 'full_site_board', pvFieldLayout: 'single_field', mpptGrouping: 'grouped_single_field' },
        tailoring_studio: { boardStrategy: 'full_site_board', pvFieldLayout: 'single_field', mpptGrouping: 'grouped_single_field' },
        garment_workshop: { boardStrategy: 'process_split_board', pvFieldLayout: 'dual_roof', mpptGrouping: 'field_split' },
        bakery: { boardStrategy: 'process_split_board', pvFieldLayout: 'dual_roof', mpptGrouping: 'field_split' },
        filling_station: { boardStrategy: 'generator_assist', pvFieldLayout: 'distributed_canopy', mpptGrouping: 'field_split' },
        clinic_critical: { boardStrategy: 'essential_subboard', pvFieldLayout: 'single_field', mpptGrouping: 'grouped_single_field' },
        cold_room: { boardStrategy: 'essential_subboard', pvFieldLayout: 'roof_and_ground', mpptGrouping: 'field_split' },
        fabrication_workshop: { boardStrategy: 'generator_assist', pvFieldLayout: 'roof_and_ground', mpptGrouping: 'independent_trackers' },
        mini_factory: { boardStrategy: 'process_split_board', pvFieldLayout: 'roof_and_ground', mpptGrouping: 'independent_trackers' },
        water_pump_site: { boardStrategy: 'full_site_board', pvFieldLayout: 'single_field', mpptGrouping: 'grouped_single_field' }
    }) as Record<string, DefaultsCommercialArchitectureProfileDefaults>,

    PLANT_SCOPING_PROFILE_DEFAULTS: ({
        custom_mixed_site: { plantScope: 'captive_site', distributionTopology: 'single_board', interconnectionScope: 'offgrid_islanded' },
        residential_backup: { plantScope: 'captive_site', distributionTopology: 'single_board', interconnectionScope: 'offgrid_islanded' },
        retail_shop: { plantScope: 'captive_site', distributionTopology: 'single_board', interconnectionScope: 'offgrid_islanded' },
        tailoring_studio: { plantScope: 'captive_site', distributionTopology: 'single_board', interconnectionScope: 'offgrid_islanded' },
        garment_workshop: { plantScope: 'multi_feeder_site', distributionTopology: 'radial_feeders', interconnectionScope: 'private_distribution' },
        bakery: { plantScope: 'multi_feeder_site', distributionTopology: 'radial_feeders', interconnectionScope: 'private_distribution' },
        filling_station: { plantScope: 'multi_feeder_site', distributionTopology: 'radial_feeders', interconnectionScope: 'private_distribution' },
        clinic_critical: { plantScope: 'captive_site', distributionTopology: 'protected_critical_bus', interconnectionScope: 'offgrid_islanded' },
        cold_room: { plantScope: 'multi_feeder_site', distributionTopology: 'protected_critical_bus', interconnectionScope: 'private_distribution' },
        fabrication_workshop: { plantScope: 'multi_feeder_site', distributionTopology: 'radial_feeders', interconnectionScope: 'private_distribution' },
        mini_factory: { plantScope: 'multi_feeder_site', distributionTopology: 'radial_feeders', interconnectionScope: 'private_distribution' },
        water_pump_site: { plantScope: 'captive_site', distributionTopology: 'single_board', interconnectionScope: 'offgrid_islanded' }
    }) as Record<string, DefaultsPlantScopingProfileDefaults>,

    COMMERCIAL_DECISION_STRATEGIES: ({
        battery_dominant_offgrid: {
            label: 'Battery-Dominant Off-Grid',
            badge: 'Off-Grid',
            summary: 'Run the site mainly from PV and battery with honest autonomy, current throughput, and continuity expectations.',
            preferredSystemTypes: ['off_grid'],
            preferredIntents: ['full_offgrid', 'backup_only']
        },
        solar_dominant_daytime_bridge: {
            label: 'Solar-First With Battery Bridge',
            badge: 'Solar-First',
            summary: 'Push productive work into solar hours and let the battery mainly bridge peaks, evenings, and outage recovery.',
            preferredSystemTypes: ['off_grid', 'hybrid'],
            preferredIntents: ['daytime_solar_first', 'backup_only']
        },
        hybrid_generator_assist: {
            label: 'Hybrid With Generator Assist',
            badge: 'Hybrid Assist',
            summary: 'Use PV and battery for offset and bridging, but keep generator support inside the honest continuity story.',
            preferredSystemTypes: ['hybrid', 'off_grid'],
            preferredIntents: ['hybrid_generator']
        },
        hybrid_grid_support: {
            label: 'Hybrid With Grid Support',
            badge: 'Grid Hybrid',
            summary: 'Use PV and storage to reduce bills or improve uptime while the grid stays part of the operating plan.',
            preferredSystemTypes: ['hybrid', 'grid_tie'],
            preferredIntents: ['hybrid_grid']
        },
        essential_load_only_backup: {
            label: 'Essential-Load-Only Backup',
            badge: 'Selective Backup',
            summary: 'Protect the highest-value circuits instead of promising full-facility continuity on a strained topology.',
            preferredSystemTypes: ['off_grid', 'hybrid'],
            preferredIntents: ['essential_loads_only', 'backup_only']
        }
    }) as Record<string, DefaultsCommercialDecisionDefinition>,

    COMMERCIAL_DECISION_THRESHOLDS: ({
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
    }) as DefaultsCommercialDecisionThresholds,

    // Reusable project templates for fast installer workflows.
    // Templates preserve the current location profile and installer identity,
    // but reset client-specific fields so a prior quote does not leak forward.
    PROJECT_TEMPLATES: {
        residential_backup: {
            label: 'Residential Backup',
            badge: 'Home',
            libraryGroup: 'Residential & Home',
            description: 'Balanced home backup starter for lights, fans, refrigeration, media, and connectivity.',
            workflowFocus: 'Use when the client wants a clean backup-first home proposal without turning the job into a commercial engineering study.',
            surveyFocus: ['true essential circuits', 'nighttime comfort expectations', 'roof access and shading', 'whether AC loads are excluded or selective'],
            projectName: 'Residential Backup Estimate',
            businessProfile: 'residential_backup',
            operatingIntent: 'backup_only',
            continuityClass: 'convenience',
            operatingSchedulePreset: 'business_day',
            audienceMode: 'client',
            systemType: 'off_grid',
            phaseType: 'single',
            autonomyDays: 2,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'standard',
            includedScope: [
                'Supply and sizing of the residential backup PV array, inverter, battery bank, and essential BOS.',
                'Standard rooftop installation, protection devices, labeling, and homeowner handover.',
                'Basic commissioning, settings review, and homeowner operating guidance for backup loads.'
            ],
            exclusions: [
                'Roof repairs, decorative trunking changes, and concealed cable-route remediation beyond normal install scope.',
                'Generator integration, main-distribution-board rebuilds, and utility service upgrades unless added separately.',
                'Internet service, civil works, and lightning protection upgrades unless specified in the final quote.'
            ],
            nextSteps: [
                'Confirm essential backup loads, nighttime runtime expectations, and appliance startup behavior.',
                'Complete the roof and cable-route survey before locking the final array layout.',
                'Approve the selected package tier and confirm installation scheduling.'
            ],
            appliances: [
                { name: 'LED Lights', quantity: 12, ratedPowerW: 12, dailyUsageHours: 6, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 20, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Ceiling Fan', quantity: 4, ratedPowerW: 75, dailyUsageHours: 8, dutyCycle: 100, loadType: 'motor', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.65, daytimeRatio: 55, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'fan', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false },
                { name: 'Inverter Refrigerator', quantity: 1, ratedPowerW: 150, dailyUsageHours: 24, dutyCycle: 40, loadType: 'motor', startMethod: 'vfd', surgeFactor: 2.0, powerFactor: 0.85, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.92, motorSubType: 'compressor_inverter', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false },
                { name: 'TV (LED)', quantity: 1, ratedPowerW: 100, dailyUsageHours: 5, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 35, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Laptop Charger', quantity: 2, ratedPowerW: 65, dailyUsageHours: 4, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 60, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'WiFi Router', quantity: 1, ratedPowerW: 15, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Phone Chargers', quantity: 4, ratedPowerW: 20, dailyUsageHours: 3, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false }
            ]
        },
        retail_shop: {
            label: 'Retail Shop / POS',
            badge: 'Retail',
            libraryGroup: 'Retail & Small Trade',
            description: 'Small shop or mini-mart template with refrigeration, POS, lighting, and daylong occupancy.',
            workflowFocus: 'Use when the job is still a trading-floor backup or solar-first shop design, not a heavier process site.',
            surveyFocus: ['freezer overnight duty', 'true business hours', 'POS and CCTV continuity', 'whether AC loads are in or out of scope'],
            projectName: 'Retail Shop Solar Draft',
            businessProfile: 'retail_shop',
            operatingIntent: 'backup_only',
            continuityClass: 'business_critical',
            operatingSchedulePreset: 'extended_business_day',
            audienceMode: 'client',
            systemType: 'off_grid',
            phaseType: 'single',
            autonomyDays: 1.5,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'standard',
            includedScope: [
                'Supply and sizing of the recommended retail backup system, including refrigeration and POS support loads.',
                'Standard installation, commissioning, protection, and basic operator handover.',
                'Allowance for labeling, monitoring setup, and performance verification at handover.'
            ],
            exclusions: [
                'Dedicated air-conditioning backup, signage retrofits, and point-of-sale network upgrades unless specified.',
                'Civil works, shutter motor integration, and concealed wiring remediation beyond visible access routes.',
                'Utility service issues, permit fees, and generator changeover modifications unless added separately.'
            ],
            nextSteps: [
                'Confirm freezer or chiller duty cycle, business hours, and the must-run overnight loads.',
                'Validate daytime-only versus after-hours load expectations with the shop owner.',
                'Survey the site layout and distribution-board access before final pricing.'
            ],
            appliances: [
                { name: 'LED Lights', quantity: 18, ratedPowerW: 12, dailyUsageHours: 11, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 70, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Ceiling Fan', quantity: 6, ratedPowerW: 75, dailyUsageHours: 10, dutyCycle: 100, loadType: 'motor', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.65, daytimeRatio: 80, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'fan', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false },
                { name: 'Chest Freezer', quantity: 1, ratedPowerW: 200, dailyUsageHours: 24, dutyCycle: 45, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'compressor_modern', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false },
                { name: 'POS Terminal', quantity: 2, ratedPowerW: 30, dailyUsageHours: 12, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'CCTV + DVR', quantity: 1, ratedPowerW: 60, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false },
                { name: 'WiFi Router', quantity: 1, ratedPowerW: 15, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false }
            ]
        },
        tailoring_studio: {
            label: 'Tailoring Studio',
            badge: 'Workshop',
            libraryGroup: 'Workshop & Service',
            description: 'Solar-first tailoring or sewing workspace starter that takes motor surge and daytime production seriously.',
            workflowFocus: 'Use when the site is a practical tailoring studio and you need a strong machine-aware draft without assuming a garment-factory topology.',
            surveyFocus: ['servo versus clutch machines', 'ironing duty', 'how many machines truly run together', 'whether the shop is still single-phase'],
            projectName: 'Tailoring Studio Solar Draft',
            businessProfile: 'tailoring_studio',
            operatingIntent: 'daytime_solar_first',
            continuityClass: 'business_critical',
            operatingSchedulePreset: 'business_day',
            audienceMode: 'installer',
            systemType: 'off_grid',
            phaseType: 'single',
            autonomyDays: 1,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'standard',
            includedScope: [
                'Sizing of the workshop PV array, inverter, battery support, and protective BOS for sewing operations.',
                'Allowance for production-day operation, commissioning, and operator handover guidance.',
                'Support for load staggering assumptions where the shop workflow allows disciplined startup.'
            ],
            exclusions: [
                'All-day pressing or electric heating loads beyond the modeled work pattern unless priced separately.',
                'CNC, compressor, or additional workshop machinery not listed in the appliance schedule.',
                'Building rewiring, subpanel additions, and civil modifications unless included in the final scope.'
            ],
            nextSteps: [
                'Confirm whether the studio uses servo or clutch machines and how many can run together.',
                'Validate ironing duty cycle and whether it remains daytime-only.',
                'Review roof layout and cable route so the proposal matches the working floor plan.'
            ],
            appliances: [
                { name: 'Servo Sewing Machine', quantity: 4, ratedPowerW: 250, dailyUsageHours: 8, dutyCycle: 60, loadType: 'motor', startMethod: 'vfd', surgeFactor: 1.5, powerFactor: 0.85, daytimeRatio: 95, isSimultaneous: true, isAC: true, efficiency: 0.9, motorSubType: 'servo', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true },
                { name: 'LED Lights', quantity: 14, ratedPowerW: 12, dailyUsageHours: 9, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 80, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Pressing Iron', quantity: 1, ratedPowerW: 1200, dailyUsageHours: 1.5, dutyCycle: 45, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, daytimeRatio: 100, isSimultaneous: false, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true },
                { name: 'Ceiling Fan', quantity: 4, ratedPowerW: 75, dailyUsageHours: 9, dutyCycle: 100, loadType: 'motor', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.65, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'fan', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false },
                { name: 'Laptop Charger', quantity: 1, ratedPowerW: 80, dailyUsageHours: 6, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'WiFi Router', quantity: 1, ratedPowerW: 15, dailyUsageHours: 10, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, daytimeRatio: 80, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false }
            ]
        },
        clinic_critical: {
            label: 'Clinic Critical Loads',
            badge: 'Clinic',
            libraryGroup: 'Clinic & Critical Loads',
            description: 'Critical-load clinic starter focused on refrigeration, connectivity, treatment support, and longer backup reserve.',
            workflowFocus: 'Use when the quote must stay selective and honest around critical loads rather than pretending the entire clinic is covered.',
            surveyFocus: ['true critical circuits', 'vaccine or medicine refrigeration duty', 'hidden medical surge loads', 'whether utility or generator contingency remains'],
            projectName: 'Clinic Critical Loads Proposal',
            businessProfile: 'clinic_critical',
            operatingIntent: 'essential_loads_only',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'twenty_four_seven',
            audienceMode: 'installer',
            systemType: 'off_grid',
            phaseType: 'single',
            autonomyDays: 2,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'premium',
            includedScope: [
                'Supply and sizing of the critical-load PV system for refrigeration, lighting, connectivity, and selected treatment support loads.',
                'Standard installation, labeling, testing, and staff handover for the recommended package.',
                'Allowance for commissioning, monitoring setup, and essential-operating guidance.'
            ],
            exclusions: [
                'High-load HVAC, sterilization equipment, and imaging devices unless specifically modeled and quoted.',
                'Medical-grade UPS coordination, changeover automation, or redundancy outside the listed package.',
                'Civil works, utility permit charges, and major distribution upgrades unless added separately.'
            ],
            nextSteps: [
                'Confirm the truly critical circuits and whether any medical equipment has hidden startup surge.',
                'Validate vaccine or medicine refrigeration duty cycle and required overnight autonomy.',
                'Complete site survey and code review before issuing a final clinic quote.'
            ],
            appliances: [
                { name: 'Vaccine Refrigerator', quantity: 1, ratedPowerW: 180, dailyUsageHours: 24, dutyCycle: 45, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'compressor_modern', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false },
                { name: 'LED Lights', quantity: 16, ratedPowerW: 12, dailyUsageHours: 12, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 45, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Router + Modem', quantity: 1, ratedPowerW: 20, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Laptop Workstation', quantity: 2, ratedPowerW: 80, dailyUsageHours: 8, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 70, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Small Suction Machine', quantity: 1, ratedPowerW: 90, dailyUsageHours: 2, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: false, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Water Pump', quantity: 1, ratedPowerW: 550, dailyUsageHours: 0.75, dutyCycle: 100, loadType: 'motor', startMethod: 'soft_start', surgeFactor: 2.5, powerFactor: 0.8, daytimeRatio: 90, isSimultaneous: false, isAC: true, efficiency: 0.85, motorSubType: 'pump_softstart', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true }
            ]
        },
        pump_and_home: {
            label: 'Water Pump + Home Support',
            badge: 'Pump',
            libraryGroup: 'Pump & Utility',
            description: 'Pump-led design starter for sites where water delivery is the main motor load but home essentials still matter.',
            workflowFocus: 'Use when pumping is the commercial driver and the home loads are support loads, not the main sizing story.',
            surveyFocus: ['pump nameplate and head', 'daytime pumping feasibility', 'tank control sequence', 'whether nighttime pumping is expected'],
            projectName: 'Water Pumping Solar Draft',
            businessProfile: 'water_pump_site',
            operatingIntent: 'daytime_solar_first',
            continuityClass: 'business_critical',
            operatingSchedulePreset: 'business_day',
            audienceMode: 'installer',
            systemType: 'off_grid',
            phaseType: 'single',
            autonomyDays: 1,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'value',
            includedScope: [
                'Sizing of the pumping system, support loads, inverter, battery reserve, and protective BOS.',
                'Allowance for pump startup control, daytime pumping assumptions, and standard commissioning.',
                'Installer handover notes covering pumping schedule and load-staggering expectations.'
            ],
            exclusions: [
                'Pipework changes, tank works, borehole rehabilitation, and plumbing repairs unless explicitly priced.',
                'Generator synchronization, VFD retrofits beyond the quoted pump package, and civil trenching unless added separately.',
                'Extended nighttime pumping beyond the modeled operating pattern unless specified in the final design.'
            ],
            nextSteps: [
                'Confirm the exact pump type, head, and whether a soft-start or VFD is already installed.',
                'Validate the daily water target and whether pumping can be limited to daylight hours.',
                'Survey the cable route, pump panel location, and tank controls before final design sign-off.'
            ],
            appliances: [
                { name: 'Borehole Pump (Soft-Start)', quantity: 1, ratedPowerW: 1100, dailyUsageHours: 3, dutyCycle: 100, loadType: 'motor', startMethod: 'soft_start', surgeFactor: 2.5, powerFactor: 0.8, daytimeRatio: 100, isSimultaneous: false, isAC: true, efficiency: 0.85, motorSubType: 'pump_softstart', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true },
                { name: 'LED Lights', quantity: 8, ratedPowerW: 12, dailyUsageHours: 5, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 25, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false },
                { name: 'Ceiling Fan', quantity: 2, ratedPowerW: 75, dailyUsageHours: 6, dutyCycle: 100, loadType: 'motor', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.65, daytimeRatio: 60, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'fan', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false },
                { name: 'Inverter Refrigerator', quantity: 1, ratedPowerW: 150, dailyUsageHours: 24, dutyCycle: 40, loadType: 'motor', startMethod: 'vfd', surgeFactor: 2.0, powerFactor: 0.85, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.92, motorSubType: 'compressor_inverter', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false },
                { name: 'WiFi Router', quantity: 1, ratedPowerW: 15, dailyUsageHours: 12, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, daytimeRatio: 60, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false }
            ]
        },
        garment_workshop: {
            label: 'Garment Workshop',
            badge: 'Production',
            libraryGroup: 'Workshop & Production',
            description: 'Higher-throughput garment floor starter with multiple machines, pressing, and compressor support, without silently forcing 3-phase.',
            workflowFocus: 'Use when the shop has outgrown a tailoring studio but you still need to prove whether the final machine mix justifies a larger topology.',
            surveyFocus: ['machine count running together', 'pressing bank duty cycle', 'compressor startup timing', 'DB capacity and future expansion'],
            projectName: 'Garment Workshop Solar Draft',
            businessProfile: 'garment_workshop',
            operatingIntent: 'daytime_solar_first',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'two_shift',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'single',
            autonomyDays: 1,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'standard',
            includedScope: [
                'Sizing of the garment-workshop PV system, inverter, battery bridge, and production-support BOS.',
                'Allowance for disciplined startup, production-day load management, commissioning, and handover.',
                'Commercial framing for workshop growth while keeping the first quote technically honest.'
            ],
            exclusions: [
                'Additional industrial machinery, HVAC, or compressor upgrades not listed in the starter machine schedule.',
                'Rewiring of the full building or conversion to a permanent 3-phase service unless added to the final scope.',
                'Civil works, panel-room rebuilds, and custom trunking or containment beyond normal install routes.'
            ],
            nextSteps: [
                'Confirm whether the workshop is still servo-led or if clutch machines dominate the floor.',
                'Validate which machines truly run together during production peaks and ironing windows.',
                'Close the topology review before final sign-off if the machine list keeps growing.'
            ],
            appliances: [
                { name: 'Servo Sewing Machine', quantity: 10, ratedPowerW: 250, dailyUsageHours: 10, dutyCycle: 65, loadType: 'motor', startMethod: 'vfd', surgeFactor: 1.5, powerFactor: 0.85, daytimeRatio: 90, isSimultaneous: true, isAC: true, efficiency: 0.9, motorSubType: 'servo', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Boiler Iron Station', quantity: 2, ratedPowerW: 1800, dailyUsageHours: 3, dutyCycle: 55, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, daytimeRatio: 100, isSimultaneous: false, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'process', loadCriticality: 'deferrable' },
                { name: 'Air Compressor', quantity: 1, ratedPowerW: 2200, dailyUsageHours: 2.5, dutyCycle: 40, loadType: 'motor', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.75, daytimeRatio: 95, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'air_compressor', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'operator_peak', loadCriticality: 'essential' },
                { name: 'Overlock Machine', quantity: 4, ratedPowerW: 180, dailyUsageHours: 9, dutyCycle: 60, loadType: 'motor', startMethod: 'vfd', surgeFactor: 1.5, powerFactor: 0.85, daytimeRatio: 90, isSimultaneous: true, isAC: true, efficiency: 0.9, motorSubType: 'servo', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Workshop Lighting', quantity: 24, ratedPowerW: 18, dailyUsageHours: 11, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 75, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'auto', loadRole: 'base', loadCriticality: 'essential' },
                { name: 'Router + Admin PC', quantity: 1, ratedPowerW: 180, dailyUsageHours: 12, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 80, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'auto', loadRole: 'base', loadCriticality: 'critical' }
            ]
        },
        bakery_daytime_production: {
            label: 'Bakery Daytime Production',
            badge: 'Bakery',
            libraryGroup: 'Food Production',
            description: 'Moderate bakery starter for gas-assisted or lighter electric production where mixers, proofing, refrigeration, and daytime batching matter more than a full 3-phase oven.',
            workflowFocus: 'Good first draft when the bakery is productive but not yet a full electric-oven 3-phase site.',
            surveyFocus: ['oven type and fuel source', 'mixer start method', 'freezer overnight duty', 'whether production can stay in solar hours'],
            projectName: 'Bakery Production Solar Draft',
            businessProfile: 'bakery',
            operatingIntent: 'hybrid_generator',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'intermittent_production',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'single',
            autonomyDays: 1,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'standard',
            includedScope: [
                'Sizing of the bakery PV system, inverter, battery bridge, and production-support BOS for daytime-focused batching.',
                'Allowance for refrigeration continuity, commissioning, and operating guidance for process loads.',
                'Commercial framing for an assisted bakery topology without overselling full battery-only baking coverage.'
            ],
            exclusions: [
                'Large fully electric ovens, dough lines, or HVAC loads not explicitly listed in the starter machine schedule.',
                'Generator procurement, fuel-system changes, and panel-board modifications unless added separately.',
                'Civil works, oven rewiring, and bakery fit-out changes beyond the PV installation scope.'
            ],
            nextSteps: [
                'Confirm whether the oven is gas-assisted, diesel-assisted, or fully electric before final pricing.',
                'Validate mixer overlap and freezer overnight continuity expectations.',
                'Document whether the bakery wants full production support or only a partial assisted operating mode.'
            ],
            appliances: [
                { name: 'Spiral Mixer', quantity: 1, ratedPowerW: 1800, dailyUsageHours: 2, dutyCycle: 65, loadType: 'motor', startMethod: 'dol', surgeFactor: 4.5, powerFactor: 0.78, daytimeRatio: 100, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'mixer_heavy', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Proofing Cabinet', quantity: 1, ratedPowerW: 900, dailyUsageHours: 5, dutyCycle: 60, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, daytimeRatio: 90, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'auto', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Gas Oven Support Loads', quantity: 1, ratedPowerW: 350, dailyUsageHours: 8, dutyCycle: 70, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 100, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Bakery Freezer', quantity: 1, ratedPowerW: 250, dailyUsageHours: 24, dutyCycle: 45, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'compressor_modern', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false, phaseAssignment: 'auto', loadRole: 'refrigeration', loadCriticality: 'critical' },
                { name: 'Bakery Lighting', quantity: 18, ratedPowerW: 15, dailyUsageHours: 10, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 75, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'auto', loadRole: 'base', loadCriticality: 'essential' },
                { name: 'Sealer / Small Process Tools', quantity: 1, ratedPowerW: 450, dailyUsageHours: 2, dutyCycle: 60, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 95, isSimultaneous: false, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'auto', loadRole: 'discretionary', loadCriticality: 'deferrable' }
            ]
        },
        bakery_three_phase_oven: {
            label: 'Bakery 3-Phase Oven Line',
            badge: '3-Phase Bakery',
            libraryGroup: 'Food Production',
            description: 'Heavier bakery starter for fully electric or strongly motorized production lines where the oven and process equipment justify a deliberate 3-phase assisted design.',
            workflowFocus: 'Use this when the bakery really expects production support, not only freezer and support-load backup.',
            surveyFocus: ['true oven phase and current draw', 'whether generator support is mandatory', 'per-phase process allocation', 'overnight cold storage burden'],
            projectName: 'Bakery 3-Phase Oven Draft',
            businessProfile: 'bakery',
            operatingIntent: 'hybrid_generator',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'intermittent_production',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'three_phase',
            autonomyDays: 0.75,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'premium',
            commercialArchitectureMode: 'generator_assist',
            generatorSupportMode: 'planned_generator',
            generatorSizeKVA: 20,
            pvFieldLayout: 'dual_roof',
            mpptGroupingMode: 'field_split',
            plantScopeMode: 'multi_feeder_site',
            distributionTopologyMode: 'radial_feeders',
            interconnectionScopeMode: 'private_distribution',
            includedScope: [
                'Sizing of the bakery 3-phase hybrid system, generator-assist path, and production-support BOS.',
                'Allowance for process review, commissioning, and phased operating guidance for supported versus unsupported loads.',
                'Commercial framing that distinguishes supported production equipment from battery-only continuity claims.'
            ],
            exclusions: [
                'Extended full-batch production during long outages unless the generator path is finalized and accepted by the client.',
                'Oven replacement, panel-board reconstruction, and civil heat-extraction works unless included in the final quote.',
                'Fuel-system, exhaust, or room-ventilation modifications for generator operation unless priced separately.'
            ],
            nextSteps: [
                'Confirm the true oven current, phase connection, and whether it must stay inside the protected production path.',
                'Validate generator coverage against the protected board and startup overlap of process motors.',
                'Use the executive and commercial strategy outputs to decide whether the bakery is being sold as assisted production or selective continuity.'
            ],
            appliances: [
                { name: 'Electric Deck Oven', quantity: 1, ratedPowerW: 12000, dailyUsageHours: 5, dutyCycle: 70, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, daytimeRatio: 100, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'no', isDaytimeOnly: true, phaseAssignment: 'three_phase', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Heavy Spiral Mixer', quantity: 1, ratedPowerW: 3000, dailyUsageHours: 2, dutyCycle: 60, loadType: 'motor', startMethod: 'dol', surgeFactor: 4.5, powerFactor: 0.78, daytimeRatio: 100, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'mixer_heavy', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'three_phase', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Proofing Cabinet', quantity: 1, ratedPowerW: 1200, dailyUsageHours: 6, dutyCycle: 60, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, daytimeRatio: 90, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l2', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Bakery Freezer', quantity: 1, ratedPowerW: 300, dailyUsageHours: 24, dutyCycle: 45, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'compressor_modern', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'refrigeration', loadCriticality: 'critical' },
                { name: 'Bakery Lighting', quantity: 20, ratedPowerW: 15, dailyUsageHours: 11, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 75, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l1', loadRole: 'base', loadCriticality: 'essential' },
                { name: 'Packing Bench + Controls', quantity: 1, ratedPowerW: 350, dailyUsageHours: 8, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 90, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: true, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'essential' }
            ]
        },
        filling_station_hybrid: {
            label: 'Filling Station Hybrid',
            badge: 'Fuel Site',
            libraryGroup: 'Fuel & Service Sites',
            description: '3-phase fuel-site starter with dispenser loads, canopy lighting, controls, and assisted support for uneven commercial demand.',
            workflowFocus: 'Use when the client expects a serious filling-station support package and phase allocation matters as much as total kWh.',
            surveyFocus: ['real dispenser pump mapping', 'booster pump duty', 'generator tie-in', 'protected board versus full-site expectation'],
            projectName: 'Filling Station Hybrid Draft',
            businessProfile: 'filling_station',
            operatingIntent: 'hybrid_generator',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'extended_business_day',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'three_phase',
            autonomyDays: 0.75,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'premium',
            commercialArchitectureMode: 'generator_assist',
            generatorSupportMode: 'existing_generator',
            generatorSizeKVA: 25,
            pvFieldLayout: 'distributed_canopy',
            mpptGroupingMode: 'field_split',
            plantScopeMode: 'multi_feeder_site',
            distributionTopologyMode: 'radial_feeders',
            interconnectionScopeMode: 'private_distribution',
            includedScope: [
                'Sizing of the 3-phase filling-station hybrid system, protected process board, and assisted continuity path.',
                'Allowance for canopy-field separation, commissioning, and operating guidance for dispenser and control loads.',
                'Commercial framing for an assisted business-continuity package instead of an unrealistic battery-only whole-site promise.'
            ],
            exclusions: [
                'Undocumented pumps, workshop loads, or hidden site services not included in the machine list.',
                'Fuel-system modifications, underground cable remediation, and civil generator works unless priced separately.',
                'Full-facility autonomy claims beyond the protected-board and assisted-generator story.'
            ],
            nextSteps: [
                'Confirm which loads are truly must-run during outages and which circuits can drop off the protected path.',
                'Validate the booster or borehole pump rating and whether it shares the same distribution path as the dispensers.',
                'Use the 3-phase balance and cluster planner outputs before final commercial sign-off.'
            ],
            appliances: [
                { name: 'Fuel Dispenser Pump A', quantity: 1, ratedPowerW: 1500, dailyUsageHours: 12, dutyCycle: 50, loadType: 'motor', startMethod: 'soft_start', surgeFactor: 3.0, powerFactor: 0.78, daytimeRatio: 65, isSimultaneous: true, isAC: true, efficiency: 0.84, motorSubType: 'dispenser_pump', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false, phaseAssignment: 'l1', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Fuel Dispenser Pump B', quantity: 1, ratedPowerW: 1500, dailyUsageHours: 12, dutyCycle: 50, loadType: 'motor', startMethod: 'soft_start', surgeFactor: 3.0, powerFactor: 0.78, daytimeRatio: 65, isSimultaneous: true, isAC: true, efficiency: 0.84, motorSubType: 'dispenser_pump', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false, phaseAssignment: 'l2', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Booster Pump', quantity: 1, ratedPowerW: 5500, dailyUsageHours: 2, dutyCycle: 45, loadType: 'motor', startMethod: 'soft_start', surgeFactor: 3.0, powerFactor: 0.80, daytimeRatio: 85, isSimultaneous: false, isAC: true, efficiency: 0.85, motorSubType: 'pump_softstart', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'three_phase', loadRole: 'operator_peak', loadCriticality: 'essential' },
                { name: 'Canopy Lighting', quantity: 20, ratedPowerW: 30, dailyUsageHours: 14, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 55, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'essential' },
                { name: 'POS + Control Room', quantity: 1, ratedPowerW: 450, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 55, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'critical' },
                { name: 'Office AC', quantity: 1, ratedPowerW: 1500, dailyUsageHours: 8, dutyCycle: 70, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, daytimeRatio: 70, isSimultaneous: false, isAC: true, efficiency: 0.85, motorSubType: 'compressor_modern', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false, phaseAssignment: 'l1', loadRole: 'discretionary', loadCriticality: 'deferrable' }
            ]
        },
        cold_room_preservation: {
            label: 'Cold Room Preservation',
            badge: 'Cold Chain',
            libraryGroup: 'Cold Chain & Preservation',
            description: 'Cold-room starter with compressor-led continuity burden, product-loss risk, and assisted support assumptions.',
            workflowFocus: 'Use when the commercial story depends on preservation honesty, not just total daily energy.',
            surveyFocus: ['compressor nameplate and startup behavior', 'overnight preservation burden', 'defrost timing', 'generator or protected-board contingency'],
            projectName: 'Cold Room Preservation Draft',
            businessProfile: 'cold_room',
            operatingIntent: 'hybrid_generator',
            continuityClass: 'product_loss_critical',
            operatingSchedulePreset: 'night_preservation',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'three_phase',
            autonomyDays: 0.75,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'premium',
            commercialArchitectureMode: 'essential_subboard',
            generatorSupportMode: 'planned_generator',
            generatorSizeKVA: 15,
            pvFieldLayout: 'roof_and_ground',
            mpptGroupingMode: 'field_split',
            plantScopeMode: 'multi_feeder_site',
            distributionTopologyMode: 'protected_critical_bus',
            interconnectionScopeMode: 'private_distribution',
            includedScope: [
                'Sizing of the preservation-focused hybrid PV system, protected refrigeration board, and assisted recovery path.',
                'Allowance for compressor continuity review, commissioning, and operator guidance on protected versus deferrable loads.',
                'Commercial framing that prioritizes product protection and overnight burden realism.'
            ],
            exclusions: [
                'Additional rooms, blast-freeze equipment, or HVAC systems not included in the machine schedule.',
                'Cold-room fabrication, panel repairs, and evaporator or refrigerant servicing outside the PV scope.',
                'Unbounded full-site continuity claims beyond the protected preservation path and documented assist strategy.'
            ],
            nextSteps: [
                'Confirm compressor type, defrost cycle, and whether any heaters or fans are on separate circuits.',
                'Validate the minimum preservation burden that must stay live overnight.',
                'Decide whether the quote is preservation-only, protected-board continuity, or wider assisted support.'
            ],
            appliances: [
                { name: 'Cold Room Compressor', quantity: 1, ratedPowerW: 4000, dailyUsageHours: 16, dutyCycle: 60, loadType: 'motor', startMethod: 'dol', surgeFactor: 4.5, powerFactor: 0.78, daytimeRatio: 45, isSimultaneous: true, isAC: true, efficiency: 0.82, motorSubType: 'compressor_coldroom', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false, phaseAssignment: 'three_phase', loadRole: 'refrigeration', loadCriticality: 'critical' },
                { name: 'Evaporator Fan Bank', quantity: 1, ratedPowerW: 800, dailyUsageHours: 20, dutyCycle: 80, loadType: 'motor', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.72, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'fan', dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: false, phaseAssignment: 'l2', loadRole: 'refrigeration', loadCriticality: 'critical' },
                { name: 'Defrost Heater', quantity: 1, ratedPowerW: 1800, dailyUsageHours: 1.5, dutyCycle: 60, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, daytimeRatio: 30, isSimultaneous: false, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'operator_peak', loadCriticality: 'deferrable' },
                { name: 'Cold Room Controls', quantity: 1, ratedPowerW: 150, dailyUsageHours: 24, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l1', loadRole: 'base', loadCriticality: 'critical' },
                { name: 'Cold Room Lighting', quantity: 6, ratedPowerW: 18, dailyUsageHours: 8, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 50, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'essential' }
            ]
        },
        fabrication_workshop: {
            label: 'Fabrication Workshop',
            badge: 'Workshop',
            libraryGroup: 'Workshop & Production',
            description: 'Heavy-tool workshop starter with welders, compressors, rotary tools, and peaky commercial current windows.',
            workflowFocus: 'Use when the site has bursty industrial tools and you need to separate what is truly supported from what should be staged or deferred.',
            surveyFocus: ['welder duty cycle', 'compressor overlap', 'tool diversity assumptions', 'whether full-board support is realistic'],
            projectName: 'Fabrication Workshop Draft',
            businessProfile: 'fabrication_workshop',
            operatingIntent: 'hybrid_generator',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'intermittent_production',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'three_phase',
            autonomyDays: 0.5,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'premium',
            commercialArchitectureMode: 'process_split_board',
            generatorSupportMode: 'planned_generator',
            generatorSizeKVA: 18,
            pvFieldLayout: 'roof_and_ground',
            mpptGroupingMode: 'independent_trackers',
            plantScopeMode: 'multi_feeder_site',
            distributionTopologyMode: 'radial_feeders',
            interconnectionScopeMode: 'private_distribution',
            includedScope: [
                'Sizing of the workshop hybrid system, process/support split board, and assisted peak-load operating path.',
                'Allowance for commissioning and operator guidance on which workshop tools may run together.',
                'Commercial framing that keeps peaky tools from being oversold as battery-friendly continuous loads.'
            ],
            exclusions: [
                'Additional welding bays, larger compressors, and hidden industrial tools not listed in the machine schedule.',
                'Cable tray reconstruction, workshop rewiring, and gantry or machine relocation unless added separately.',
                'Unsupported simultaneous-tool operation beyond the staged operating assumptions in the final design.'
            ],
            nextSteps: [
                'Confirm the real welder duty cycle and whether the compressor restarts while welding is active.',
                'Validate which tools truly belong on the protected path and which should be deferred or generator-backed.',
                'Use the strategy recommendation before promising full-workshop continuity.'
            ],
            appliances: [
                { name: 'Welding Machine', quantity: 1, ratedPowerW: 5000, dailyUsageHours: 2, dutyCycle: 45, loadType: 'mixed', startMethod: 'dol', surgeFactor: 1.5, powerFactor: 0.85, daytimeRatio: 100, isSimultaneous: false, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'l1', loadRole: 'operator_peak', loadCriticality: 'deferrable' },
                { name: 'Air Compressor', quantity: 1, ratedPowerW: 3000, dailyUsageHours: 2.5, dutyCycle: 45, loadType: 'motor', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.75, daytimeRatio: 90, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'air_compressor', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'l2', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Angle Grinder Bank', quantity: 2, ratedPowerW: 1200, dailyUsageHours: 3, dutyCycle: 40, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.72, daytimeRatio: 95, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'rotary_tool', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'l3', loadRole: 'operator_peak', loadCriticality: 'deferrable' },
                { name: 'Drill Press', quantity: 1, ratedPowerW: 900, dailyUsageHours: 2, dutyCycle: 55, loadType: 'motor', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.72, daytimeRatio: 95, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'rotary_tool', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'l3', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Workshop Lighting', quantity: 18, ratedPowerW: 18, dailyUsageHours: 10, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 75, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l1', loadRole: 'base', loadCriticality: 'essential' },
                { name: 'Office PC + Router', quantity: 1, ratedPowerW: 180, dailyUsageHours: 10, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 80, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l2', loadRole: 'base', loadCriticality: 'critical' }
            ]
        },
        mini_factory_process: {
            label: 'Mini-Factory Process Line',
            badge: 'Factory',
            libraryGroup: 'Light Industrial',
            description: 'Small industrial process starter with conveyors, compressors, controls, and staged production continuity.',
            workflowFocus: 'Use when the client wants a process-support plant and you need to judge whether full-facility independence is honest or whether assisted support is still required.',
            surveyFocus: ['true process sequence', 'which machines must run together', 'protected-board boundary', 'generator or grid contingency'],
            projectName: 'Mini-Factory Process Draft',
            businessProfile: 'mini_factory',
            operatingIntent: 'hybrid_generator',
            continuityClass: 'process_critical',
            operatingSchedulePreset: 'two_shift',
            audienceMode: 'installer',
            systemType: 'hybrid',
            phaseType: 'three_phase',
            autonomyDays: 0.75,
            batteryChemistry: 'lifepo4',
            pricingProfile: 'premium',
            commercialArchitectureMode: 'process_split_board',
            generatorSupportMode: 'planned_generator',
            generatorSizeKVA: 25,
            pvFieldLayout: 'roof_and_ground',
            mpptGroupingMode: 'independent_trackers',
            plantScopeMode: 'private_microgrid',
            distributionTopologyMode: 'distributed_nodes',
            interconnectionScopeMode: 'private_distribution',
            includedScope: [
                'Sizing of the mini-factory hybrid plant, process/support split board, and assisted production-support path.',
                'Allowance for phase review, commissioning, and operator guidance on supported process sequences.',
                'Commercial framing that distinguishes protected process lines from wider factory demand.'
            ],
            exclusions: [
                'Additional process machines, HVAC, or packaging lines not included in the starter schedule.',
                'Transformer works, utility service changes, and industrial automation retrofits unless priced separately.',
                'Promises of full-plant continuity beyond the documented protected-board and assist strategy.'
            ],
            nextSteps: [
                'Map the real process sequence and identify which machines must overlap in the same production window.',
                'Validate whether the backup promise is full production support or only a protected process line.',
                'Use the strategy, architecture, and 3-phase outputs together before final commercial approval.'
            ],
            appliances: [
                { name: 'Process Conveyor', quantity: 1, ratedPowerW: 2200, dailyUsageHours: 10, dutyCycle: 60, loadType: 'motor', startMethod: 'soft_start', surgeFactor: 3.0, powerFactor: 0.80, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 0.85, motorSubType: 'conveyor_drive', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false, phaseAssignment: 'three_phase', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Process Mixer', quantity: 1, ratedPowerW: 4000, dailyUsageHours: 3, dutyCycle: 55, loadType: 'motor', startMethod: 'dol', surgeFactor: 4.5, powerFactor: 0.78, daytimeRatio: 90, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'mixer_heavy', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: true, phaseAssignment: 'three_phase', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Process Air Compressor', quantity: 1, ratedPowerW: 3000, dailyUsageHours: 4, dutyCycle: 45, loadType: 'motor', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.75, daytimeRatio: 85, isSimultaneous: false, isAC: true, efficiency: 0.82, motorSubType: 'air_compressor', dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: false, phaseAssignment: 'l1', loadRole: 'operator_peak', loadCriticality: 'essential' },
                { name: 'Packing Line', quantity: 1, ratedPowerW: 1500, dailyUsageHours: 8, dutyCycle: 70, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, daytimeRatio: 85, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l2', loadRole: 'process', loadCriticality: 'essential' },
                { name: 'Factory Controls + IT', quantity: 1, ratedPowerW: 400, dailyUsageHours: 16, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 70, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'critical' },
                { name: 'Factory Lighting', quantity: 24, ratedPowerW: 18, dailyUsageHours: 14, dutyCycle: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.95, daytimeRatio: 70, isSimultaneous: true, isAC: true, efficiency: 1.0, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: false, phaseAssignment: 'l3', loadRole: 'base', loadCriticality: 'essential' }
            ]
        }
    },

    BENCHMARK_PROJECTS: {
        tailoring_studio_reference: {
            label: 'Tailoring Studio Reference',
            templateKey: 'tailoring_studio',
            locationKey: 'lagos_ng',
            benchmarkClass: 'acceptance',
            expectedPhaseType: 'single',
            expectedStrategyKey: 'solar_dominant_daytime_bridge',
            expectedBoardStrategyKey: 'full_site_board',
            expectedArchitectureStatus: 'warn',
            note: 'Daytime tailoring production should benchmark as a solar-first workshop rather than an industrial continuity site.'
        },
        garment_workshop_reference: {
            label: 'Garment Workshop Reference',
            templateKey: 'garment_workshop',
            locationKey: 'lagos_ng',
            benchmarkClass: 'acceptance',
            expectedPhaseType: 'single',
            expectedStrategyKey: 'solar_dominant_daytime_bridge',
            expectedBoardStrategyKey: 'process_split_board',
            expectedArchitectureStatus: 'warn',
            note: 'Garment workshops sit between tailoring and light industry, so the benchmark should prove the split-board posture before phase escalation.'
        },
        bakery_daytime_reference: {
            label: 'Bakery Daytime Production Reference',
            templateKey: 'bakery_daytime_production',
            locationKey: 'lagos_ng',
            benchmarkClass: 'acceptance',
            expectedPhaseType: 'single',
            expectedStrategyKey: 'hybrid_generator_assist',
            expectedBoardStrategyKey: 'generator_assist',
            expectedArchitectureStatus: 'warn',
            note: 'A lighter bakery still needs an assisted continuity story once refrigeration and process peaks are framed honestly.'
        },
        bakery_three_phase_reference: {
            label: 'Bakery 3-Phase Oven Reference',
            templateKey: 'bakery_three_phase_oven',
            locationKey: 'lagos_ng',
            benchmarkClass: 'constrained',
            expectedPhaseType: 'three_phase',
            expectedStrategyKey: 'hybrid_generator_assist',
            expectedBoardStrategyKey: 'generator_assist',
            expectedArchitectureStatus: 'fail',
            expectedFailureSignals: ['battery_throughput', 'phase_generator_coverage'],
            note: 'This reference is intentionally constrained: it proves the bot flags an undersized bakery production-support story instead of letting a tight generator and overloaded battery bank pass as a clean acceptance case.'
        },
        filling_station_hybrid_reference: {
            label: 'Filling Station Hybrid Reference',
            templateKey: 'filling_station_hybrid',
            locationKey: 'lagos_ng',
            benchmarkClass: 'constrained',
            expectedPhaseType: 'three_phase',
            expectedStrategyKey: 'hybrid_generator_assist',
            expectedBoardStrategyKey: 'generator_assist',
            expectedArchitectureStatus: 'fail',
            expectedFailureSignals: ['battery_throughput'],
            note: 'This reference is intentionally constrained: it proves the bot does not oversell a filling-station hybrid when the shared battery bank is still over-stressed.'
        },
        cold_room_preservation_reference: {
            label: 'Cold Room Preservation Reference',
            templateKey: 'cold_room_preservation',
            locationKey: 'lagos_ng',
            benchmarkClass: 'acceptance',
            expectedPhaseType: 'three_phase',
            expectedStrategyKey: 'hybrid_generator_assist',
            expectedBoardStrategyKey: 'essential_subboard',
            expectedArchitectureStatus: 'warn',
            note: 'Cold-room jobs should benchmark around protected preservation continuity, not convenience loads.'
        },
        fabrication_workshop_reference: {
            label: 'Fabrication Workshop Reference',
            templateKey: 'fabrication_workshop',
            locationKey: 'lagos_ng',
            benchmarkClass: 'acceptance',
            expectedPhaseType: 'three_phase',
            expectedStrategyKey: 'hybrid_generator_assist',
            expectedBoardStrategyKey: 'process_split_board',
            expectedArchitectureStatus: 'warn',
            note: 'Peaky tools should benchmark as staged or assisted, not as clean battery-friendly continuity.'
        },
        mini_factory_process_reference: {
            label: 'Mini-Factory Process Reference',
            templateKey: 'mini_factory_process',
            locationKey: 'lagos_ng',
            benchmarkClass: 'acceptance',
            expectedPhaseType: 'three_phase',
            expectedStrategyKey: 'hybrid_generator_assist',
            expectedBoardStrategyKey: 'process_split_board',
            expectedArchitectureStatus: 'warn',
            note: 'Mini-factory starter projects should protect the line first and use assist strategy for wider plant demand.'
        }
    },

    // Motor sub-type characteristics (adaptive surge multipliers)
    MOTOR_SUBTYPES: {
        // Sewing machine motors
        clutch:     { efficiency: 0.60, surgeFactor: 4.0, powerFactor: 0.70, startMethod: 'dol', hint: 'Clutch motor: affordable, rugged, 3-4x surge. Common in garment workshops. Higher energy use than servo.' },
        servo:      { efficiency: 0.90, surgeFactor: 1.5, powerFactor: 0.85, startMethod: 'vfd', hint: 'Servo motor: 40-60% less energy than clutch, low surge (VFD). Ideal for PV systems.' },
        // Compressor motors (fridge, freezer, AC)
        compressor_inverter: { efficiency: 0.92, surgeFactor: 2.0, powerFactor: 0.85, startMethod: 'vfd', hint: 'Inverter compressor: smooth VFD start, only 2x surge. Most energy-efficient. Ideal for PV systems.' },
        compressor_modern:   { efficiency: 0.85, surgeFactor: 3.5, powerFactor: 0.75, startMethod: 'dol', hint: 'Modern compressor (≤7 years): improved DOL start, 3-4x surge. Better than older units.' },
        compressor_old:      { efficiency: 0.75, surgeFactor: 5.0, powerFactor: 0.65, startMethod: 'dol', hint: 'Old compressor (>7 years): worn bearings increase inrush to 5x+. Consider replacing for PV compatibility.' },
        compressor_unknown:  { efficiency: 0.80, surgeFactor: 4.0, powerFactor: 0.70, startMethod: 'dol', hint: 'Compressor (age unknown): assumed 4x surge. Select specific age bracket for better accuracy.' },
        compressor_coldroom: { efficiency: 0.82, surgeFactor: 4.5, powerFactor: 0.78, startMethod: 'dol', hint: 'Cold-room compressor: heavier duty cycle and stronger startup than a domestic refrigerator. Treat overnight continuity seriously.' },
        // Pump motors
        pump_softstart:      { efficiency: 0.85, surgeFactor: 2.5, powerFactor: 0.80, startMethod: 'soft_start', hint: 'Pump with soft-start/VFD: reduced inrush to 2.5x. Best pump option for PV systems.' },
        pump_surface:        { efficiency: 0.80, surgeFactor: 3.5, powerFactor: 0.75, startMethod: 'dol', hint: 'Surface pump (≤1HP): moderate DOL surge 3-4x. Lighter inertial load than submersible.' },
        pump_submersible:    { efficiency: 0.78, surgeFactor: 5.0, powerFactor: 0.70, startMethod: 'dol', hint: 'Submersible pump: heavy DOL surge 5x due to water column. Consider soft-start for >750W.' },
        pump_deepwell:       { efficiency: 0.75, surgeFactor: 6.0, powerFactor: 0.65, startMethod: 'dol', hint: 'Deep well/borehole pump: very heavy inrush 6x+ due to long pipe and water column. Soft-start strongly recommended.' },
        pump_unknown:        { efficiency: 0.78, surgeFactor: 5.0, powerFactor: 0.70, startMethod: 'dol', hint: 'Pump (type unknown): assumed 5x surge. Select specific pump type for better accuracy.' },
        // Other motors
        fan:                 { efficiency: 0.85, surgeFactor: 2.5, powerFactor: 0.65, startMethod: 'dol', hint: 'Fan/blower: low surge 2-3x. Safe to run alongside other motors.' },
        washing_machine:     { efficiency: 0.80, surgeFactor: 3.5, powerFactor: 0.65, startMethod: 'dol', hint: 'Washing machine motor: 3-4x surge during spin cycle. Stagger with other motor loads.' },
        blender:             { efficiency: 0.80, surgeFactor: 4.0, powerFactor: 0.70, startMethod: 'dol', hint: 'Blender/mixer/grinder: 4x surge, short burst operation. Brief but intense inrush.' },
        mixer_heavy:         { efficiency: 0.82, surgeFactor: 4.5, powerFactor: 0.78, startMethod: 'dol', hint: 'Heavy dough or process mixer: high starting torque with 4-5x surge. Common in bakeries and small process plants.' },
        air_compressor:      { efficiency: 0.82, surgeFactor: 5.0, powerFactor: 0.75, startMethod: 'dol', hint: 'Air compressor: peaky demand with strong restart current. Keep it away from other motor starts where possible.' },
        dispenser_pump:      { efficiency: 0.84, surgeFactor: 3.0, powerFactor: 0.78, startMethod: 'soft_start', hint: 'Fuel dispenser pump: moderate motor surge but uptime and phase allocation matter in filling-station work.' },
        conveyor_drive:      { efficiency: 0.85, surgeFactor: 3.0, powerFactor: 0.80, startMethod: 'soft_start', hint: 'Conveyor/process drive: moderate motor surge with longer production-duty windows.' },
        rotary_tool:         { efficiency: 0.82, surgeFactor: 3.5, powerFactor: 0.72, startMethod: 'dol', hint: 'Rotary workshop tool: grinder, saw, or cutter with brief but punchy startup current.' },
        general:             { efficiency: 0.85, surgeFactor: 4.0, powerFactor: 0.70, startMethod: 'dol', hint: 'General motor: assumed 4x surge. Select specific sub-type for better accuracy.' }
    },

    BUSINESS_MACHINE_LIBRARY: {
        servo_sewing_machine: {
            label: 'Servo Sewing Machine',
            group: 'Tailoring & Garment',
            profiles: ['tailoring_studio', 'garment_workshop'],
            badge: 'Solar friendly',
            phaseClass: 'single_phase',
            summary: 'Low-surge sewing machine archetype for tailoring studios and efficient garment floors.',
            topologyNote: 'Normally stays single-phase. Quantity and simultaneous use matter more than service voltage for small studios.',
            appliance: {
                name: 'Servo Sewing Machine',
                quantity: 1,
                ratedPowerW: 250,
                dailyUsageHours: 8,
                dutyCycle: 60,
                loadType: 'motor',
                motorSubType: 'servo',
                startMethod: 'vfd',
                surgeFactor: 1.5,
                powerFactor: 0.85,
                daytimeRatio: 95,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        clutch_sewing_machine: {
            label: 'Clutch Sewing Machine',
            group: 'Tailoring & Garment',
            profiles: ['tailoring_studio', 'garment_workshop'],
            badge: 'High surge',
            phaseClass: 'single_phase',
            summary: 'Industrial clutch machine with heavier startup and weaker PV friendliness than a servo machine.',
            topologyNote: 'Still usually a single-phase load, but several clutch machines running together can justify stronger inverter and phase review.',
            appliance: {
                name: 'Industrial Sewing Machine (Clutch)',
                quantity: 1,
                ratedPowerW: 550,
                dailyUsageHours: 8,
                dutyCycle: 60,
                loadType: 'motor',
                motorSubType: 'clutch',
                startMethod: 'dol',
                surgeFactor: 4.0,
                powerFactor: 0.70,
                daytimeRatio: 95,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        overlock_machine: {
            label: 'Overlock / Interlock Machine',
            group: 'Tailoring & Garment',
            profiles: ['tailoring_studio', 'garment_workshop'],
            badge: 'Production line',
            phaseClass: 'single_phase',
            summary: 'Light industrial sewing-process machine for seam finishing and garment throughput.',
            topologyNote: 'Normally treated as single-phase and added alongside other garment machines to judge whether a workshop stays single-phase or needs review.',
            appliance: {
                name: 'Overlock Machine',
                quantity: 1,
                ratedPowerW: 180,
                dailyUsageHours: 8,
                dutyCycle: 55,
                loadType: 'motor',
                motorSubType: 'servo',
                startMethod: 'vfd',
                surgeFactor: 1.5,
                powerFactor: 0.85,
                daytimeRatio: 95,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        boiler_iron_station: {
            label: 'Boiler Iron / Pressing Station',
            group: 'Tailoring & Garment',
            profiles: ['tailoring_studio', 'garment_workshop'],
            badge: 'Heat load',
            phaseClass: 'single_phase',
            summary: 'Pressing station archetype with resistive heat and cycling duty.',
            topologyNote: 'Usually a single-phase daytime load, but too many irons running together can distort the commercial story even without surge.',
            appliance: {
                name: 'Boiler Iron Station',
                quantity: 1,
                ratedPowerW: 1800,
                dailyUsageHours: 2,
                dutyCycle: 55,
                loadType: 'resistive',
                startMethod: 'dol',
                surgeFactor: 1.0,
                powerFactor: 1.0,
                daytimeRatio: 100,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        bakery_spiral_mixer: {
            label: 'Bakery Spiral Mixer',
            group: 'Bakery & Food',
            profiles: ['bakery', 'mini_factory'],
            badge: 'High torque',
            phaseClass: 'conditional_3phase',
            summary: 'High-torque dough mixer archetype for bakery production sizing.',
            topologyNote: 'Smaller units can stay single-phase, but multiple mixers or larger production models quickly justify 3-phase review.',
            appliance: {
                name: 'Bakery Spiral Mixer',
                quantity: 1,
                ratedPowerW: 2200,
                dailyUsageHours: 2.5,
                dutyCycle: 70,
                loadType: 'motor',
                motorSubType: 'mixer_heavy',
                startMethod: 'dol',
                surgeFactor: 4.5,
                powerFactor: 0.78,
                daytimeRatio: 100,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        bakery_planetary_mixer: {
            label: 'Bakery Planetary Mixer',
            group: 'Bakery & Food',
            profiles: ['bakery'],
            badge: 'Batch mixing',
            phaseClass: 'single_phase',
            summary: 'Batch mixer archetype for lighter bakery prep and icing workflows.',
            topologyNote: 'Often remains single-phase, but simultaneous batching with ovens and refrigeration still matters.',
            appliance: {
                name: 'Bakery Planetary Mixer',
                quantity: 1,
                ratedPowerW: 1200,
                dailyUsageHours: 2,
                dutyCycle: 65,
                loadType: 'motor',
                motorSubType: 'mixer_heavy',
                startMethod: 'dol',
                surgeFactor: 4.0,
                powerFactor: 0.78,
                daytimeRatio: 100,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        proofing_cabinet: {
            label: 'Proofing Cabinet',
            group: 'Bakery & Food',
            profiles: ['bakery'],
            badge: 'Process heat',
            phaseClass: 'single_phase',
            summary: 'Low-surge bakery process cabinet with fan and heat cycling.',
            topologyNote: 'Usually a single-phase process load. It matters more for runtime and continuity than surge.',
            appliance: {
                name: 'Proofing Cabinet',
                quantity: 1,
                ratedPowerW: 900,
                dailyUsageHours: 4,
                dutyCycle: 70,
                loadType: 'mixed',
                startMethod: 'dol',
                surgeFactor: 1.5,
                powerFactor: 0.92,
                daytimeRatio: 100,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        bakery_oven_single: {
            label: 'Electric Oven (Single-Phase)',
            group: 'Bakery & Food',
            profiles: ['bakery'],
            badge: 'Electric heat',
            phaseClass: 'single_phase',
            summary: 'Single-phase electric baking oven with heavy resistive duty.',
            topologyNote: 'Single-phase by connection, but still commercially hard on battery-heavy systems because the duty is sustained and energy-dense.',
            appliance: {
                name: 'Electric Baking Oven',
                quantity: 1,
                ratedPowerW: 5000,
                dailyUsageHours: 4,
                dutyCycle: 75,
                loadType: 'resistive',
                startMethod: 'dol',
                surgeFactor: 1.0,
                powerFactor: 1.0,
                daytimeRatio: 100,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'no',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        bakery_oven_three: {
            label: 'Electric Oven (Three-Phase)',
            group: 'Bakery & Food',
            profiles: ['bakery', 'mini_factory'],
            badge: '3-phase process',
            phaseClass: 'three_phase',
            summary: 'Three-phase electric baking oven with sustained process duty.',
            topologyNote: 'This is a true three-phase process load. If the project is still single-phase, treat the current topology as preliminary only.',
            appliance: {
                name: 'Electric Baking Oven (3-Phase)',
                quantity: 1,
                ratedPowerW: 12000,
                dailyUsageHours: 4,
                dutyCycle: 80,
                loadType: 'resistive',
                startMethod: 'dol',
                surgeFactor: 1.0,
                powerFactor: 1.0,
                daytimeRatio: 100,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'no',
                isDaytimeOnly: true,
                phaseAssignment: 'three_phase'
            }
        },
        gas_oven_support: {
            label: 'Gas Oven Support Loads',
            group: 'Bakery & Food',
            profiles: ['bakery'],
            badge: 'Support load',
            phaseClass: 'single_phase',
            summary: 'Gas- or diesel-assisted oven support load with blower, controls, and ignition auxiliaries.',
            topologyNote: 'This is usually much more solar-friendly than a fully electric oven and often keeps the bakery in a lighter design class.',
            appliance: {
                name: 'Gas Oven Support',
                quantity: 1,
                ratedPowerW: 450,
                dailyUsageHours: 5,
                dutyCycle: 70,
                loadType: 'mixed',
                startMethod: 'dol',
                surgeFactor: 2.0,
                powerFactor: 0.92,
                daytimeRatio: 100,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        cold_room_compressor: {
            label: 'Cold Room Compressor',
            group: 'Cold Room & Refrigeration',
            profiles: ['cold_room', 'mini_factory'],
            badge: 'Cold chain',
            phaseClass: 'conditional_3phase',
            summary: 'Cold-room compressor archetype with strong duty cycle and overnight preservation weight.',
            topologyNote: 'Whether it remains single-phase or moves to 3-phase depends on compressor size, but continuity is critical either way.',
            appliance: {
                name: 'Cold Room Compressor',
                quantity: 1,
                ratedPowerW: 3000,
                dailyUsageHours: 24,
                dutyCycle: 55,
                loadType: 'motor',
                motorSubType: 'compressor_coldroom',
                startMethod: 'dol',
                surgeFactor: 4.5,
                powerFactor: 0.78,
                daytimeRatio: 50,
                isSimultaneous: true,
                dutyFrequency: 'continuous',
                canStagger: 'no',
                isDaytimeOnly: false,
                phaseAssignment: 'auto'
            }
        },
        evaporator_fan_bank: {
            label: 'Evaporator Fan Bank',
            group: 'Cold Room & Refrigeration',
            profiles: ['cold_room'],
            badge: 'Continuous',
            phaseClass: 'single_phase',
            summary: 'Continuous cold-room airflow load for evaporator fan banks.',
            topologyNote: 'Usually a lighter single-phase support load, but it drives runtime and product-loss continuity requirements.',
            appliance: {
                name: 'Evaporator Fan Bank',
                quantity: 1,
                ratedPowerW: 450,
                dailyUsageHours: 24,
                dutyCycle: 100,
                loadType: 'motor',
                motorSubType: 'fan',
                startMethod: 'dol',
                surgeFactor: 2.5,
                powerFactor: 0.65,
                daytimeRatio: 50,
                isSimultaneous: true,
                dutyFrequency: 'continuous',
                canStagger: 'no',
                isDaytimeOnly: false,
                phaseAssignment: 'auto'
            }
        },
        dispenser_pump_bank: {
            label: 'Fuel Dispenser Pump',
            group: 'Filling Station',
            profiles: ['filling_station'],
            badge: 'Revenue load',
            phaseClass: 'conditional_3phase',
            summary: 'Fuel dispenser pump archetype for commercial station sizing.',
            topologyNote: 'Often lands inside a broader 3-phase station architecture even when the individual dispenser motor is not itself a balanced 3-phase load.',
            appliance: {
                name: 'Fuel Dispenser Pump',
                quantity: 1,
                ratedPowerW: 900,
                dailyUsageHours: 10,
                dutyCycle: 60,
                loadType: 'motor',
                motorSubType: 'dispenser_pump',
                startMethod: 'soft_start',
                surgeFactor: 3.0,
                powerFactor: 0.78,
                daytimeRatio: 70,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'no',
                isDaytimeOnly: false,
                phaseAssignment: 'auto'
            }
        },
        station_air_compressor: {
            label: 'Station Air Compressor',
            group: 'Filling Station',
            profiles: ['filling_station', 'fabrication_workshop'],
            badge: 'High restart',
            phaseClass: 'conditional_3phase',
            summary: 'Compressed-air support load for tire service or workshop air demand.',
            topologyNote: 'The compressor is often the ugly load in the room. Keep it out of overlapping motor starts when possible.',
            appliance: {
                name: 'Air Compressor',
                quantity: 1,
                ratedPowerW: 2200,
                dailyUsageHours: 3,
                dutyCycle: 65,
                loadType: 'motor',
                motorSubType: 'air_compressor',
                startMethod: 'dol',
                surgeFactor: 5.0,
                powerFactor: 0.75,
                daytimeRatio: 80,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: false,
                phaseAssignment: 'auto'
            }
        },
        booster_pump_three_phase: {
            label: 'Booster / Transfer Pump (3-Phase)',
            group: 'Filling Station',
            profiles: ['filling_station', 'water_pump_site'],
            badge: '3-phase pump',
            phaseClass: 'three_phase',
            summary: 'True three-phase pump archetype for station transfer, booster, or service water systems.',
            topologyNote: 'Treat this as a real 3-phase load. A single-phase project should not pretend to cover it without a topology change.',
            appliance: {
                name: 'Booster Pump (3-Phase)',
                quantity: 1,
                ratedPowerW: 3000,
                dailyUsageHours: 2,
                dutyCycle: 100,
                loadType: 'motor',
                motorSubType: 'pump_softstart',
                startMethod: 'soft_start',
                surgeFactor: 2.5,
                powerFactor: 0.80,
                daytimeRatio: 90,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'three_phase'
            }
        },
        workshop_air_compressor: {
            label: 'Workshop Air Compressor',
            group: 'Workshop & Mini-Factory',
            profiles: ['fabrication_workshop', 'mini_factory', 'garment_workshop'],
            badge: 'Compressed air',
            phaseClass: 'conditional_3phase',
            summary: 'Production air-compressor archetype for workshop and process floors.',
            topologyNote: 'Can stay single-phase at small sizes, but workshop compressor growth is one of the fastest ways a site tips into 3-phase review.',
            appliance: {
                name: 'Workshop Air Compressor',
                quantity: 1,
                ratedPowerW: 3000,
                dailyUsageHours: 4,
                dutyCycle: 70,
                loadType: 'motor',
                motorSubType: 'air_compressor',
                startMethod: 'dol',
                surgeFactor: 5.0,
                powerFactor: 0.75,
                daytimeRatio: 90,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        welder_light_industrial: {
            label: 'Light Industrial Welder',
            group: 'Workshop & Mini-Factory',
            profiles: ['fabrication_workshop', 'mini_factory'],
            badge: 'Peaky load',
            phaseClass: 'conditional_3phase',
            summary: 'Light workshop welding set with peaky duty and poor power quality.',
            topologyNote: 'Not always a 3-phase machine, but welders are one of the fastest ways a commercial PV proposal becomes commercially weak if modeled too casually.',
            appliance: {
                name: 'Light Industrial Welder',
                quantity: 1,
                ratedPowerW: 4500,
                dailyUsageHours: 1.5,
                dutyCycle: 45,
                loadType: 'mixed',
                startMethod: 'dol',
                surgeFactor: 2.5,
                powerFactor: 0.75,
                daytimeRatio: 100,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        rotary_tool_bank: {
            label: 'Grinder / Cutter / Saw',
            group: 'Workshop & Mini-Factory',
            profiles: ['fabrication_workshop', 'mini_factory'],
            badge: 'Rotary tools',
            phaseClass: 'single_phase',
            summary: 'Rotary tool archetype for grinders, saws, and cutters with brief startup punch.',
            topologyNote: 'Usually single-phase, but diversity is low and operators often overlap them with compressors or welders unless disciplined.',
            appliance: {
                name: 'Rotary Workshop Tool',
                quantity: 1,
                ratedPowerW: 1800,
                dailyUsageHours: 2,
                dutyCycle: 50,
                loadType: 'motor',
                motorSubType: 'rotary_tool',
                startMethod: 'dol',
                surgeFactor: 3.5,
                powerFactor: 0.72,
                daytimeRatio: 100,
                isSimultaneous: false,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'auto'
            }
        },
        conveyor_drive: {
            label: 'Conveyor / Process Drive',
            group: 'Workshop & Mini-Factory',
            profiles: ['mini_factory'],
            badge: 'Process line',
            phaseClass: 'three_phase',
            summary: 'Process conveyor or driven line load for mini-factory work.',
            topologyNote: 'Often a true process load. Treat it as a three-phase review item unless the exact drive arrangement is proven otherwise.',
            appliance: {
                name: 'Conveyor Drive',
                quantity: 1,
                ratedPowerW: 2200,
                dailyUsageHours: 8,
                dutyCycle: 85,
                loadType: 'motor',
                motorSubType: 'conveyor_drive',
                startMethod: 'soft_start',
                surgeFactor: 3.0,
                powerFactor: 0.80,
                daytimeRatio: 100,
                isSimultaneous: true,
                dutyFrequency: 'daily',
                canStagger: 'yes',
                isDaytimeOnly: true,
                phaseAssignment: 'three_phase'
            }
        },
        process_control_panel: {
            label: 'Control Panel / PLC Rack',
            group: 'Workshop & Mini-Factory',
            profiles: ['mini_factory', 'filling_station', 'clinic_critical'],
            badge: 'Control load',
            phaseClass: 'single_phase',
            summary: 'Control electronics, PLC, drives interface, and low-power instrumentation rack.',
            topologyNote: 'Small power draw, but operational continuity can be more important than the wattage suggests.',
            appliance: {
                name: 'Control Panel / PLC',
                quantity: 1,
                ratedPowerW: 250,
                dailyUsageHours: 24,
                dutyCycle: 100,
                loadType: 'electronic',
                startMethod: 'vfd',
                surgeFactor: 1.2,
                powerFactor: 0.95,
                daytimeRatio: 50,
                isSimultaneous: true,
                dutyFrequency: 'continuous',
                canStagger: 'na',
                isDaytimeOnly: false,
                phaseAssignment: 'auto'
            }
        }
    },

    // Appliance name auto-detection presets (keys are regex patterns)
    APPLIANCE_PRESETS: {
        // Motors with clutch/DOL — sewing machines (domestic first, industrial if wattage overridden)
        'sewing.*servo|servo.*sewing|servo.*machine': { watt: 250, loadType: 'motor', startMethod: 'vfd', surgeFactor: 1.5, powerFactor: 0.85, dutyCycle: 60, hours: 8, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Servo motor sewing machine. Low inrush (1.5x), ~90% efficient. Ideal for PV — uses 40-60% less energy than clutch. Cost: significantly more than clutch.' },
        'industrial.*sew|sew.*industrial': { watt: 550, loadType: 'motor', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.7, dutyCycle: 60, hours: 8, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Industrial sewing machine with clutch motor (400-750W, ½-1HP). DOL start with 4-7x inrush. Common in garment workshops. Surge: 2000-5000VA peak for 1-2 seconds.' },
        'sewing|sew.*machine': { watt: 250, loadType: 'motor', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.7, dutyCycle: 60, hours: 8, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Domestic sewing machine with clutch motor (~250W, ⅓HP). DOL start with 3-4x inrush. If your machine is industrial (400W+), change the wattage above — sizing will auto-adjust.' },
        // Compressor variants (specific patterns BEFORE generic — first match wins)
        'inverter\\s*(fridge|freezer|refrigerator)': { watt: 150, loadType: 'motor', motorSubType: 'compressor_inverter', startMethod: 'vfd', surgeFactor: 2.0, powerFactor: 0.85, dutyCycle: 40, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Inverter compressor: smooth VFD start, only 2x surge. Most energy-efficient fridge/freezer type.' },
        'old\\s*(fridge|freezer|refrigerator)': { watt: 150, loadType: 'motor', motorSubType: 'compressor_old', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.65, dutyCycle: 40, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Old compressor (>7yr): worn bearings increase inrush to 5x+. Consider replacing for PV compatibility.' },
        'new\\s*(fridge|freezer|refrigerator)|modern\\s*(fridge|freezer|refrigerator)': { watt: 150, loadType: 'motor', motorSubType: 'compressor_modern', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, dutyCycle: 40, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Modern compressor (≤7yr): improved DOL start, 3-4x surge. Better efficiency than older units.' },
        'refrigerator|fridge': { watt: 150, loadType: 'motor', motorSubType: 'compressor_unknown', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.70, dutyCycle: 40, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Compressor (age unknown): 4x assumed surge. Specify "inverter fridge", "new fridge", or "old fridge" for better accuracy.' },
        'freezer|deep\\s*freeze': { watt: 200, loadType: 'motor', motorSubType: 'compressor_unknown', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.70, dutyCycle: 45, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Compressor (age unknown): 4x assumed surge. Specify "inverter freezer", "new freezer", or "old freezer" for better accuracy.' },
        // AC variants
        'inverter\\s*ac|inverter\\s*air': { watt: 1200, loadType: 'motor', motorSubType: 'compressor_inverter', startMethod: 'vfd', surgeFactor: 2.0, powerFactor: 0.9, dutyCycle: 60, hours: 10, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Inverter AC: VFD compressor, only 2x surge. Much better PV compatibility than conventional AC.' },
        'air\\s*condition|split\\s*unit|\\bac\\b|\\ba\\.c\\.': { watt: 1500, loadType: 'motor', motorSubType: 'compressor_unknown', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.75, dutyCycle: 65, hours: 10, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'AC compressor (type unknown): 4x assumed surge. Specify "inverter AC" for lower surge rating.' },
        // Pump variants (specific BEFORE generic)
        'soft\\s*start.*pump|vfd.*pump': { watt: 750, loadType: 'motor', motorSubType: 'pump_softstart', startMethod: 'soft_start', surgeFactor: 2.5, powerFactor: 0.80, dutyCycle: 100, hours: 4, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Pump with soft-start/VFD: reduced inrush to 2.5x. Best pump option for PV systems.' },
        'submersible\\s*pump': { watt: 750, loadType: 'motor', motorSubType: 'pump_submersible', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.70, dutyCycle: 100, hours: 4, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Submersible pump: heavy DOL surge 5x due to water column. Consider soft-start for >750W.' },
        'borehole|deep\\s*well\\s*pump': { watt: 1100, loadType: 'motor', motorSubType: 'pump_deepwell', startMethod: 'dol', surgeFactor: 6.0, powerFactor: 0.65, dutyCycle: 100, hours: 4, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Deep well/borehole pump: very heavy inrush 6x+ due to long pipe and water column. Soft-start strongly recommended.' },
        'surface\\s*pump|booster\\s*pump': { watt: 550, loadType: 'motor', motorSubType: 'pump_surface', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.75, dutyCycle: 100, hours: 4, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Surface/booster pump (≤1HP): moderate DOL surge 3.5x. Lighter inertial load than submersible.' },
        'water\\s*pump|pump': { watt: 750, loadType: 'motor', motorSubType: 'pump_unknown', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.70, dutyCycle: 100, hours: 4, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Pump (type unknown): 5x assumed surge. Specify "submersible pump", "surface pump", or "borehole pump" for better accuracy.' },
        // Other motor loads
        'washing\\s*machine|washer': { watt: 500, loadType: 'motor', motorSubType: 'washing_machine', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.65, dutyCycle: 80, hours: 2, dutyFrequency: 'weekly', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Washing machine: 3.5x surge during spin cycle. Stagger with other motor loads.' },
        'ceiling\\s*fan|fan': { watt: 75, loadType: 'motor', motorSubType: 'fan', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.65, dutyCycle: 100, hours: 10, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Fan/blower: low surge 2-3x. Safe to run alongside other motors.' },
        'blender|grinder|mixer': { watt: 500, loadType: 'motor', motorSubType: 'blender', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.70, dutyCycle: 50, hours: 0.5, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Blender/mixer/grinder: 4x surge, short burst operation.' },
        'spiral\\s*mixer': { watt: 2200, loadType: 'motor', motorSubType: 'mixer_heavy', machinePresetId: 'bakery_spiral_mixer', startMethod: 'dol', surgeFactor: 4.5, powerFactor: 0.78, dutyCycle: 70, hours: 2.5, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Bakery spiral mixer: high starting torque and strong bakery process significance.' },
        'planetary\\s*mixer': { watt: 1200, loadType: 'motor', motorSubType: 'mixer_heavy', machinePresetId: 'bakery_planetary_mixer', startMethod: 'dol', surgeFactor: 4.0, powerFactor: 0.78, dutyCycle: 65, hours: 2, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Planetary mixer: batch bakery load. Less severe than a spiral mixer, but still not a casual domestic mixer.' },
        'proof(er|ing)\\s*(cabinet)?': { watt: 900, loadType: 'mixed', machinePresetId: 'proofing_cabinet', startMethod: 'dol', surgeFactor: 1.5, powerFactor: 0.92, dutyCycle: 70, hours: 4, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Proofing cabinet: process-support load with moderate heating and airflow duty.' },
        '(3|three)[ -]?phase\\s*oven|oven\\s*(3|three)[ -]?phase': { watt: 12000, loadType: 'resistive', machinePresetId: 'bakery_oven_three', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, dutyCycle: 80, hours: 4, dutyFrequency: 'daily', canStagger: 'no', isDaytimeOnly: 'yes', hint: 'Three-phase electric oven: sustained process load. Treat topology and energy economics seriously.' },
        'electric\\s*oven|baking\\s*oven': { watt: 5000, loadType: 'resistive', machinePresetId: 'bakery_oven_single', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, dutyCycle: 75, hours: 4, dutyFrequency: 'daily', canStagger: 'no', isDaytimeOnly: 'yes', hint: 'Electric oven: heavy sustained bakery heat load. Often the main reason hybrid assist becomes more honest than battery-heavy backup.' },
        'gas\\s*oven|diesel\\s*oven': { watt: 450, loadType: 'mixed', machinePresetId: 'gas_oven_support', startMethod: 'dol', surgeFactor: 2.0, powerFactor: 0.92, dutyCycle: 70, hours: 5, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Gas or diesel oven support load: much lighter than a fully electric oven and often far more PV-friendly.' },
        'cold\\s*room\\s*compressor|cold\\s*room': { watt: 3000, loadType: 'motor', motorSubType: 'compressor_coldroom', machinePresetId: 'cold_room_compressor', startMethod: 'dol', surgeFactor: 4.5, powerFactor: 0.78, dutyCycle: 55, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Cold-room compressor: continuity and product-loss exposure are usually the real design drivers.' },
        'evaporator\\s*fan': { watt: 450, loadType: 'motor', motorSubType: 'fan', machinePresetId: 'evaporator_fan_bank', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.65, dutyCycle: 100, hours: 24, dutyFrequency: 'continuous', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Evaporator fan bank: continuous refrigeration support load.' },
        'fuel\\s*dispenser|dispenser\\s*pump|petrol\\s*pump': { watt: 900, loadType: 'motor', motorSubType: 'dispenser_pump', machinePresetId: 'dispenser_pump_bank', startMethod: 'soft_start', surgeFactor: 3.0, powerFactor: 0.78, dutyCycle: 60, hours: 10, dutyFrequency: 'daily', canStagger: 'no', isDaytimeOnly: 'no', hint: 'Fuel dispenser pump: moderate surge but strong operational value in station projects.' },
        'air\\s*compressor': { watt: 2200, loadType: 'motor', motorSubType: 'air_compressor', machinePresetId: 'station_air_compressor', startMethod: 'dol', surgeFactor: 5.0, powerFactor: 0.75, dutyCycle: 65, hours: 3, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Air compressor: peaky restart load that can dominate workshop and filling-station support systems.' },
        'welder|welding': { watt: 4500, loadType: 'mixed', machinePresetId: 'welder_light_industrial', startMethod: 'dol', surgeFactor: 2.5, powerFactor: 0.75, dutyCycle: 45, hours: 1.5, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Welder: peaky industrial load with weak battery economics if treated as routine continuous demand.' },
        'grinder|cutter|saw': { watt: 1800, loadType: 'motor', motorSubType: 'rotary_tool', machinePresetId: 'rotary_tool_bank', startMethod: 'dol', surgeFactor: 3.5, powerFactor: 0.72, dutyCycle: 50, hours: 2, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Rotary workshop tool: short but punchy startup current. Diversity control matters.' },
        'conveyor': { watt: 2200, loadType: 'motor', motorSubType: 'conveyor_drive', machinePresetId: 'conveyor_drive', startMethod: 'soft_start', surgeFactor: 3.0, powerFactor: 0.80, dutyCycle: 85, hours: 8, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Conveyor or process drive: longer-duty production load that often pushes a site toward 3-phase review.' },
        'control\\s*panel|plc|process\\s*control': { watt: 250, loadType: 'electronic', machinePresetId: 'process_control_panel', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, dutyCycle: 100, hours: 24, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: 'no', hint: 'Control-panel or PLC load: low wattage, high operational importance.' },
        // Electronic loads
        'led|light|bulb|lamp': { watt: 10, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.9, dutyCycle: 100, hours: 6, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: 'no', hint: 'LED/electronic lighting. Low surge, good power factor.' },
        'tv|television': { watt: 100, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.3, powerFactor: 0.95, dutyCycle: 100, hours: 5, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: 'no', hint: 'Modern TV (LCD/LED). Electronic SMPS power supply.' },
        'laptop|computer|desktop|pc': { watt: 80, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.2, powerFactor: 0.95, dutyCycle: 100, hours: 8, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: 'no', hint: 'Computer with SMPS. Stable electronic load.' },
        'phone\\s*charger|charger': { watt: 20, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.9, dutyCycle: 100, hours: 3, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: 'no', hint: 'Small electronic charger. Minimal load.' },
        'router|modem|wifi': { watt: 15, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.0, powerFactor: 0.95, dutyCycle: 100, hours: 24, dutyFrequency: 'continuous', canStagger: 'na', isDaytimeOnly: 'no', hint: 'Always-on network equipment.' },
        'decoder|dstv|gotv': { watt: 25, loadType: 'electronic', startMethod: 'vfd', surgeFactor: 1.1, powerFactor: 0.9, dutyCycle: 100, hours: 8, dutyFrequency: 'daily', canStagger: 'na', isDaytimeOnly: 'no', hint: 'Set-top box. Small electronic load.' },
        // Resistive loads
        'iron|pressing': { watt: 1200, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, dutyCycle: 50, hours: 2, dutyFrequency: 'weekly', canStagger: 'yes', isDaytimeOnly: 'yes', hint: 'Heating element. Pure resistive, no surge. Thermostat cycles ~50%.' },
        'kettle|boiler|water\\s*heater': { watt: 2000, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, dutyCycle: 100, hours: 0.5, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Heating element. High wattage but short usage time.' },
        'microwave': { watt: 1000, loadType: 'mixed', startMethod: 'dol', surgeFactor: 2.0, powerFactor: 0.9, dutyCycle: 100, hours: 0.5, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Magnetron + motor. Moderate surge from turntable motor.' },
        'toaster|sandwich\\s*maker': { watt: 800, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, dutyCycle: 100, hours: 0.3, dutyFrequency: 'daily', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Pure resistive heating element.' },
        'heater|space\\s*heater': { watt: 1500, loadType: 'resistive', startMethod: 'dol', surgeFactor: 1.0, powerFactor: 1.0, dutyCycle: 100, hours: 6, dutyFrequency: 'rare', canStagger: 'yes', isDaytimeOnly: 'no', hint: 'Resistive heating element. No surge.' }
    },

    // Panel spec presets by wattage (typical industry values)
    PANEL_PRESETS: {
        50:  { vmp: 18.2, voc: 22.0, imp: 2.75, isc: 2.95, tempCoeffPmax: -0.40, tempCoeffVoc: -0.30 },
        100: { vmp: 18.4, voc: 22.5, imp: 5.43, isc: 5.75, tempCoeffPmax: -0.39, tempCoeffVoc: -0.29 },
        150: { vmp: 18.6, voc: 23.0, imp: 8.06, isc: 8.55, tempCoeffPmax: -0.38, tempCoeffVoc: -0.28 },
        200: { vmp: 24.5, voc: 30.2, imp: 8.16, isc: 8.68, tempCoeffPmax: -0.37, tempCoeffVoc: -0.28 },
        250: { vmp: 30.5, voc: 37.0, imp: 8.20, isc: 8.72, tempCoeffPmax: -0.37, tempCoeffVoc: -0.28 },
        300: { vmp: 32.8, voc: 39.8, imp: 9.15, isc: 9.72, tempCoeffPmax: -0.36, tempCoeffVoc: -0.27 },
        330: { vmp: 34.0, voc: 41.2, imp: 9.71, isc: 10.30, tempCoeffPmax: -0.36, tempCoeffVoc: -0.27 },
        350: { vmp: 35.2, voc: 42.5, imp: 9.94, isc: 10.55, tempCoeffPmax: -0.35, tempCoeffVoc: -0.27 },
        370: { vmp: 35.8, voc: 43.5, imp: 10.34, isc: 10.95, tempCoeffPmax: -0.35, tempCoeffVoc: -0.27 },
        400: { vmp: 41.0, voc: 49.0, imp: 9.76, isc: 10.36, tempCoeffPmax: -0.35, tempCoeffVoc: -0.27 },
        450: { vmp: 41.5, voc: 49.8, imp: 10.84, isc: 11.50, tempCoeffPmax: -0.34, tempCoeffVoc: -0.27 },
        500: { vmp: 42.0, voc: 50.5, imp: 11.90, isc: 12.65, tempCoeffPmax: -0.34, tempCoeffVoc: -0.26 },
        540: { vmp: 42.5, voc: 51.2, imp: 12.71, isc: 13.48, tempCoeffPmax: -0.34, tempCoeffVoc: -0.26 },
        550: { vmp: 42.8, voc: 51.5, imp: 12.85, isc: 13.63, tempCoeffPmax: -0.34, tempCoeffVoc: -0.26 },
        600: { vmp: 43.5, voc: 52.5, imp: 13.79, isc: 14.60, tempCoeffPmax: -0.33, tempCoeffVoc: -0.26 },
        700: { vmp: 44.0, voc: 53.5, imp: 15.91, isc: 16.85, tempCoeffPmax: -0.33, tempCoeffVoc: -0.25 }
    },

    // MPPT controller presets by inverter VA rating
    MPPT_PRESETS: {
        1000:  { maxVoltage: 145, maxCurrent: 18, maxPower: 1500, minVoltage: 30, maxOperating: 130, maxCharge: 30 },
        1500:  { maxVoltage: 145, maxCurrent: 18, maxPower: 2000, minVoltage: 30, maxOperating: 130, maxCharge: 40 },
        2000:  { maxVoltage: 145, maxCurrent: 18, maxPower: 2600, minVoltage: 30, maxOperating: 130, maxCharge: 50 },
        2400:  { maxVoltage: 250, maxCurrent: 18, maxPower: 3000, minVoltage: 60, maxOperating: 230, maxCharge: 60 },
        3000:  { maxVoltage: 450, maxCurrent: 18, maxPower: 4500, minVoltage: 60, maxOperating: 420, maxCharge: 80 },
        3500:  { maxVoltage: 450, maxCurrent: 22, maxPower: 5200, minVoltage: 60, maxOperating: 420, maxCharge: 80 },
        4000:  { maxVoltage: 450, maxCurrent: 22, maxPower: 5500, minVoltage: 60, maxOperating: 420, maxCharge: 100 },
        5000:  { maxVoltage: 500, maxCurrent: 27, maxPower: 7500, minVoltage: 95, maxOperating: 450, maxCharge: 120 },
        6000:  { maxVoltage: 500, maxCurrent: 30, maxPower: 8000, minVoltage: 95, maxOperating: 450, maxCharge: 120 },
        8000:  { maxVoltage: 500, maxCurrent: 36, maxPower: 10400, minVoltage: 95, maxOperating: 450, maxCharge: 150 },
        10000: { maxVoltage: 500, maxCurrent: 42, maxPower: 13000, minVoltage: 120, maxOperating: 450, maxCharge: 180 },
        12000: { maxVoltage: 500, maxCurrent: 50, maxPower: 15600, minVoltage: 120, maxOperating: 450, maxCharge: 200 },
        15000: { maxVoltage: 500, maxCurrent: 60, maxPower: 19500, minVoltage: 120, maxOperating: 450, maxCharge: 250 }
    },

    // Curated offline equipment reference library.
    // These are normalized installer presets, not live supplier catalogs.
    EQUIPMENT_LIBRARY: {
        panels: {
            mono_330_residential: {
                label: '330Wp Mono Residential',
                badge: 'Legacy retrofit',
                wattage: 330,
                vmp: 34.0,
                voc: 41.2,
                imp: 9.71,
                isc: 10.30,
                tempCoeffPmax: -0.36,
                tempCoeffVoc: -0.27,
                note: 'Useful for older rooftops, panel replacement jobs, and smaller retrofit arrays where 330Wp modules are still in circulation.'
            },
            mono_400_halfcell: {
                label: '400Wp Mono Half-Cell',
                badge: 'Balanced default',
                wattage: 400,
                vmp: 41.0,
                voc: 49.0,
                imp: 9.76,
                isc: 10.36,
                tempCoeffPmax: -0.35,
                tempCoeffVoc: -0.27,
                note: 'Strong mainstream residential and light-commercial baseline for 48V hybrids and compact rooftops.'
            },
            mono_450_allblack: {
                label: '450Wp Mono Premium',
                badge: 'Premium roof',
                wattage: 450,
                vmp: 41.5,
                voc: 49.8,
                imp: 10.84,
                isc: 11.50,
                tempCoeffPmax: -0.34,
                tempCoeffVoc: -0.27,
                note: 'Premium residential posture with a little more watt density and cleaner proposal positioning.'
            },
            mono_550_commercial: {
                label: '550Wp Commercial Mono',
                badge: 'Commercial roof',
                wattage: 550,
                vmp: 42.8,
                voc: 51.5,
                imp: 12.85,
                isc: 13.63,
                tempCoeffPmax: -0.34,
                tempCoeffVoc: -0.26,
                note: 'A practical commercial roof default when the installer wants fewer modules for the same array size.'
            },
            bifacial_600_utility: {
                label: '600Wp Bifacial Utility',
                badge: 'Ground / canopy',
                wattage: 600,
                vmp: 43.5,
                voc: 52.5,
                imp: 13.79,
                isc: 14.60,
                tempCoeffPmax: -0.33,
                tempCoeffVoc: -0.26,
                note: 'Best suited to ground-mount, canopy, and large-sheet commercial layouts where module area is not the main constraint.'
            }
        },
        inverters: {
            offgrid_3k_24_hybrid: {
                label: '3kVA / 24V Hybrid',
                badge: 'Starter hybrid',
                manualVA: 3000,
                dcVoltage: 24,
                phaseType: 'single',
                acVoltage: 230,
                systemType: 'hybrid',
                inverterMarket: 'EMERGING_OFFGRID',
                technology: 'transformerless',
                surgeMultiplier: 2.0,
                hasBuiltinMPPT: true,
                mpptInputs: [
                    { maxVoltage: 450, maxCurrent: 18, maxPower: 4500, minVoltage: 60, maxOperatingVoltage: 420, maxChargeCurrent: 80 }
                ],
                note: 'Fits lean residential hybrid jobs where loads are disciplined and panel count stays modest.'
            },
            hybrid_5k_48_single: {
                label: '5kVA / 48V Hybrid',
                badge: 'Installer default',
                manualVA: 5000,
                dcVoltage: 48,
                phaseType: 'single',
                acVoltage: 230,
                systemType: 'hybrid',
                inverterMarket: 'EMERGING_OFFGRID',
                technology: 'transformerless',
                surgeMultiplier: 2.0,
                hasBuiltinMPPT: true,
                mpptInputs: [
                    { maxVoltage: 500, maxCurrent: 27, maxPower: 7500, minVoltage: 95, maxOperatingVoltage: 450, maxChargeCurrent: 120 }
                ],
                note: 'The practical mainstream baseline for homes, shops, and small workshops in 48V single-phase deployments.'
            },
            offgrid_5k_48_transformer: {
                label: '5kVA / 48V Off-Grid Transformer',
                badge: 'Motor-heavy',
                manualVA: 5000,
                dcVoltage: 48,
                phaseType: 'single',
                acVoltage: 230,
                systemType: 'off_grid',
                inverterMarket: 'EMERGING_OFFGRID',
                technology: 'transformer',
                surgeMultiplier: 2.5,
                hasBuiltinMPPT: false,
                mpptInputs: [
                    { maxVoltage: 250, maxCurrent: 18, maxPower: 3000, minVoltage: 60, maxOperatingVoltage: 230, maxChargeCurrent: 60 }
                ],
                note: 'Useful where freezer, pump, or workshop surge is more important than an all-in-one hybrid package.'
            },
            hybrid_6k_48_dual: {
                label: '6kVA / 48V Dual-MPPT Hybrid',
                badge: 'Upgrade ready',
                manualVA: 6000,
                dcVoltage: 48,
                phaseType: 'single',
                acVoltage: 230,
                systemType: 'hybrid',
                inverterMarket: 'EMERGING_OFFGRID',
                technology: 'transformerless',
                surgeMultiplier: 2.0,
                hasBuiltinMPPT: true,
                mpptInputs: [
                    { maxVoltage: 500, maxCurrent: 18, maxPower: 4000, minVoltage: 90, maxOperatingVoltage: 450, maxChargeCurrent: 100 },
                    { maxVoltage: 500, maxCurrent: 18, maxPower: 4000, minVoltage: 90, maxOperatingVoltage: 450, maxChargeCurrent: 100 }
                ],
                note: 'A stronger installer choice when the roof has two orientations or the client may expand the PV field later.'
            },
            offgrid_8k_48_dual: {
                label: '8kVA / 48V Dual-MPPT Hybrid',
                badge: 'Small commercial',
                manualVA: 8000,
                dcVoltage: 48,
                phaseType: 'single',
                acVoltage: 230,
                systemType: 'hybrid',
                inverterMarket: 'EMERGING_OFFGRID',
                technology: 'transformerless',
                surgeMultiplier: 2.0,
                hasBuiltinMPPT: true,
                mpptInputs: [
                    { maxVoltage: 500, maxCurrent: 18, maxPower: 5200, minVoltage: 95, maxOperatingVoltage: 450, maxChargeCurrent: 120 },
                    { maxVoltage: 500, maxCurrent: 18, maxPower: 5200, minVoltage: 95, maxOperatingVoltage: 450, maxChargeCurrent: 120 }
                ],
                note: 'Good for bigger homes and small-business jobs where one chassis still covers the full system envelope.'
            },
            split_11k_48_dual: {
                label: '11.4kW / 48V Split-Phase Hybrid',
                badge: 'US split-phase',
                manualVA: 11400,
                dcVoltage: 48,
                phaseType: 'split',
                acVoltage: 240,
                systemType: 'hybrid',
                inverterMarket: 'US_SPLIT_PHASE',
                technology: 'transformerless',
                surgeMultiplier: 2.0,
                hasBuiltinMPPT: true,
                mpptInputs: [
                    { maxVoltage: 500, maxCurrent: 22, maxPower: 6500, minVoltage: 120, maxOperatingVoltage: 450, maxChargeCurrent: 120 },
                    { maxVoltage: 500, maxCurrent: 22, maxPower: 6500, minVoltage: 120, maxOperatingVoltage: 450, maxChargeCurrent: 120 }
                ],
                note: 'For North American split-phase projects that need a realistic 120/240V hybrid reference instead of a single-phase emerging-market assumption.'
            }
        },
        batteries: {
            lifepo4_5kwh_rack: {
                label: '5.12kWh Rack Module',
                badge: '51.2V lithium',
                chemistry: 'lifepo4',
                unitVoltage: 51.2,
                unitAh: 100,
                moduleKWh: 5.12,
                note: 'A strong default for modular lithium projects and compact residential battery rooms.'
            },
            lifepo4_7kwh_rack: {
                label: '7.68kWh Rack Module',
                badge: '51.2V lithium',
                chemistry: 'lifepo4',
                unitVoltage: 51.2,
                unitAh: 150,
                moduleKWh: 7.68,
                note: 'Popular mid-range rack module for higher autonomy without jumping straight to stacked commercial cabinets.'
            },
            lifepo4_10kwh_stack: {
                label: '10.24kWh Stack Module',
                badge: 'High-capacity lithium',
                chemistry: 'lifepo4',
                unitVoltage: 51.2,
                unitAh: 200,
                moduleKWh: 10.24,
                note: 'Useful when the installer wants fewer physical battery units and a cleaner premium proposal posture.'
            },
            agm_12v_200: {
                label: '12V 200Ah AGM',
                badge: 'Lead-acid',
                chemistry: 'agm',
                unitVoltage: 12,
                unitAh: 200,
                note: 'Reference AGM block for budget-sensitive backup jobs where lithium is not yet viable.'
            },
            gel_12v_220: {
                label: '12V 220Ah Gel',
                badge: 'Lead-acid',
                chemistry: 'gel',
                unitVoltage: 12,
                unitAh: 220,
                note: 'Slightly gentler cycling profile than AGM, often used where installers already standardize on gel stock.'
            },
            fla_12v_220: {
                label: '12V 220Ah Flooded',
                badge: 'Lead-acid',
                chemistry: 'fla',
                unitVoltage: 12,
                unitAh: 220,
                note: 'Traditional flooded reference block for low-cost stationary banks where maintenance access is acceptable.'
            },
            fla_2v_1000: {
                label: '2V 1000Ah Industrial Cell',
                badge: 'Cell-level bank',
                chemistry: 'fla',
                unitVoltage: 2,
                unitAh: 1000,
                note: 'For larger stationary banks built from individual cells rather than 12V blocks.'
            }
        }
    },

    // Global fallback inverter sizes (union of all markets + legacy small sizes)
    INVERTER_SIZES: [300, 500, 600, 800, 1000, 1200, 1500, 2000, 2400, 3000, 3500, 4000, 5000, 6000, 7600, 8000, 10000, 11400, 12000, 15000, 18000, 20000],

    // DC voltage thresholds
    DC_VOLTAGE_THRESHOLDS: {
        12: 1500,
        24: 3000,
        48: 15000
    },

    // Maximum DC currents per voltage
    MAX_DC_CURRENT: {
        12: 150,
        24: 200,
        48: 250
    },

    // AWG to mm2 conversion and ampacity
    AWG_DATA: {
        14: { mm2: 2.08, ampFreeAir: 25, ampConduit: 20 },
        12: { mm2: 3.31, ampFreeAir: 30, ampConduit: 25 },
        10: { mm2: 5.26, ampFreeAir: 40, ampConduit: 35 },
        8: { mm2: 8.37, ampFreeAir: 55, ampConduit: 50 },
        6: { mm2: 13.30, ampFreeAir: 75, ampConduit: 65 },
        4: { mm2: 21.15, ampFreeAir: 95, ampConduit: 85 },
        2: { mm2: 33.62, ampFreeAir: 130, ampConduit: 115 },
        1: { mm2: 42.41, ampFreeAir: 150, ampConduit: 130 },
        0: { mm2: 53.49, ampFreeAir: 170, ampConduit: 150 },
        '-1': { mm2: 67.43, ampFreeAir: 195, ampConduit: 175 },
        '-2': { mm2: 85.01, ampFreeAir: 225, ampConduit: 200 },
        '-3': { mm2: 107.22, ampFreeAir: 260, ampConduit: 230 }
    },

    // Metric cable sizes (mm2)
    METRIC_CABLE_SIZES: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240],

    // Metric cable ampacity (Amps in conduit, copper, 30°C ambient, PVC insulated per IEC 60364)
    METRIC_CABLE_AMPACITY: {
        1.5: 14, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68,
        25: 89, 35: 110, 50: 133, 70: 171, 95: 207,
        120: 239, 150: 272, 185: 310, 240: 364
    },

    // Standard battery Ah ratings
    STANDARD_AH_RATINGS: [50, 75, 100, 120, 150, 180, 200, 220, 250, 280, 300],

    // LiFePO4 cell ratings commonly available in the market
    LIFEPO4_CELL_RATINGS: [100, 150, 200, 230, 280, 304, 320],

    // LiFePO4 module library — 51.2V standard (16S × 3.2V)
    LITHIUM_MODULES: LITHIUM_MODULE_LIBRARY,

    // System constants
    COPPER_RESISTIVITY: 0.0217,  // ohm*mm2/m at 75C
    STC_TEMP: 25,
    CONTINUOUS_LOAD_FACTOR: 1.25,
    INVERTER_DERATING: 0.80,
    INVERTER_EFFICIENCY: 0.93,
    MPPT_EFFICIENCY: 0.98,
    DC_VOLTAGE_DROP_TARGET: 0.03,
    AC_VOLTAGE_DROP_TARGET: 0.02,
    PV_SOILING_LOSS: 0.03,
    PV_MISMATCH_LOSS: 0.02,
    CABLE_LOSS_FACTOR: 0.02,
    VOC_HEADROOM_PERCENT: 0.03
};

const RATE_BENCHMARKS: Record<string, { min: number; max: number; unit: string }> = {
    pvPerWp:         { min: 0.20, max: 0.55,  unit: 'USD/Wp' },
    inverterPerVA:   { min: 0.10, max: 0.25,  unit: 'USD/VA' },
    batteryPerKwh:   { min: 180,  max: 350,   unit: 'USD/kWh' },
    mpptPerW:        { min: 0.03, max: 0.08,  unit: 'USD/W' },
    mountingPerWp:   { min: 0.08, max: 0.14,  unit: 'USD/Wp' },
    protectionPerWp: { min: 0.06, max: 0.12,  unit: 'USD/Wp' }
};

function getRateStatus(key: string, value: number): { level: 'error' | 'warn' | 'ok'; msg: string } | null {
    const bench = RATE_BENCHMARKS[key];
    if (!bench) return null;
    if (value > bench.max * 5) return { level: 'error', msg: `${key}: ${value} ${bench.unit} exceeds ${bench.max * 5} — verify this rate` };
    if (value > bench.max * 1.2 || value < bench.min * 0.8) return { level: 'warn', msg: `${key}: ${value} ${bench.unit} outside normal range (${bench.min}–${bench.max} ${bench.unit})` };
    return { level: 'ok', msg: '' };
}

function checkAllRates(supplierRates: Record<string, number | null | undefined>): Array<{ level: string; msg: string }> {
    const issues: Array<{ level: string; msg: string }> = [];
    const keyMap: Record<string, string> = { batteryPerKwh: 'batteryPerKWh' };
    for (const key of Object.keys(RATE_BENCHMARKS)) {
        const supplierKey = keyMap[key] || key;
        const raw = supplierRates[supplierKey];
        if (raw === null || raw === undefined || raw === ('' as any) || !Number.isFinite(Number(raw))) continue;
        const status = getRateStatus(key, Number(raw));
        if (status && status.level !== 'ok') issues.push(status);
    }
    return issues;
}
