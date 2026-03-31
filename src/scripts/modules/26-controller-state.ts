/* =============================================================================
   PHASE TS-9: CONTROLLER STATE HELPERS
   Stable project/workspace state shaping extracted from 30-controller.js.
   Keeps snapshot normalization and creation typed without rewriting UI events.
   ============================================================================= */

type ControllerProjectSnapshot = import('../types/pv-types').ProjectSnapshot;
type ControllerSerializedFormState = import('../types/pv-types').SerializedFormState;
type ControllerProjectDynamicState = import('../types/pv-types').ProjectDynamicState;
type ControllerApplianceInput = import('../types/pv-types').ApplianceInput;

interface ControllerNormalizeProjectSnapshotOptions {
    source?: string;
    formatVersion: string;
    appVersion: string;
    buildLegacyFormState: (rawSnapshot: unknown) => ControllerSerializedFormState;
    generateProjectId: () => string;
}

interface ControllerCreateProjectSnapshotInput {
    formatVersion: string;
    appVersion: string;
    source?: string;
    projectName: unknown;
    projectId?: string | null;
    createdAt?: string | null;
    currentProjectId?: string | null;
    currentProjectCreatedAt?: string | null;
    now?: string;
    appliances?: ControllerApplianceInput[];
    formState?: ControllerSerializedFormState;
    dynamicState?: ControllerProjectDynamicState;
    generateProjectId: () => string;
}

function cloneJsonValue<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

const ControllerState = {
    sanitizeProjectName(name: unknown): string {
        const cleaned = String(name || '').trim().replace(/\s+/g, ' ');
        return cleaned || 'Untitled PV Project';
    },

    slugifyProjectName(name: unknown): string {
        return this.sanitizeProjectName(name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || 'pv_project';
    },

    normalizeProjectSnapshot(
        rawSnapshot: unknown,
        options: ControllerNormalizeProjectSnapshotOptions
    ): ControllerProjectSnapshot {
        if (!isRecord(rawSnapshot)) {
            throw new Error('Project file is empty or invalid.');
        }

        const now = new Date().toISOString();
        const source = options.source || 'workspace';
        const meta = isRecord(rawSnapshot.meta) ? rawSnapshot.meta : null;

        if (isRecord(rawSnapshot.formState) && meta) {
            return {
                formatVersion: String(rawSnapshot.formatVersion || options.formatVersion),
                meta: {
                    id: String(meta.id || options.generateProjectId()),
                    name: this.sanitizeProjectName(meta.name),
                    createdAt: String(meta.createdAt || now),
                    updatedAt: String(meta.updatedAt || now),
                    appVersion: String(meta.appVersion || options.appVersion),
                    source: String(meta.source || source)
                },
                appliances: Array.isArray(rawSnapshot.appliances) ? cloneJsonValue(rawSnapshot.appliances) : [],
                formState: cloneJsonValue(rawSnapshot.formState as ControllerSerializedFormState),
                dynamicState: isRecord(rawSnapshot.dynamicState)
                    ? cloneJsonValue(rawSnapshot.dynamicState as ControllerProjectDynamicState)
                    : {}
            };
        }

        if (Array.isArray(rawSnapshot.appliances) || isRecord(rawSnapshot.config) || isRecord(rawSnapshot.panel) || isRecord(rawSnapshot.proposalPricing)) {
            const savedAt = String(rawSnapshot.savedAt || now);
            const migratedName = this.sanitizeProjectName(rawSnapshot.projectName || rawSnapshot.name || 'Migrated PV Project');
            return {
                formatVersion: options.formatVersion,
                meta: {
                    id: options.generateProjectId(),
                    name: migratedName,
                    createdAt: savedAt,
                    updatedAt: savedAt,
                    appVersion: options.appVersion,
                    source
                },
                appliances: Array.isArray(rawSnapshot.appliances) ? cloneJsonValue(rawSnapshot.appliances) : [],
                formState: cloneJsonValue(options.buildLegacyFormState(rawSnapshot)),
                dynamicState: isRecord(rawSnapshot.dynamicState)
                    ? cloneJsonValue(rawSnapshot.dynamicState as ControllerProjectDynamicState)
                    : {}
            };
        }

        throw new Error('Unrecognized project format.');
    },

    createProjectSnapshotRecord(input: ControllerCreateProjectSnapshotInput): ControllerProjectSnapshot {
        const now = input.now || new Date().toISOString();
        const projectName = this.sanitizeProjectName(input.projectName);
        const formState = cloneJsonValue(input.formState || {});
        formState.projectName = { value: projectName };

        return {
            formatVersion: input.formatVersion,
            meta: {
                id: input.projectId !== undefined
                    ? (input.projectId || input.generateProjectId())
                    : (input.currentProjectId || input.generateProjectId()),
                name: projectName,
                createdAt: input.createdAt || input.currentProjectCreatedAt || now,
                updatedAt: now,
                appVersion: input.appVersion,
                source: input.source || 'workspace'
            },
            appliances: Array.isArray(input.appliances) ? cloneJsonValue(input.appliances) : [],
            formState,
            dynamicState: cloneJsonValue(input.dynamicState || {})
        };
    }
};
