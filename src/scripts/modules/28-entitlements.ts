/* =============================================================================
   PHASE P1: PREMIUM ENTITLEMENT RESOLVER
   Offline-first capability resolution for future paid workflow rollout.
   Keeps entitlement and billing logic outside sizing math.
   ============================================================================= */

type PremiumCapabilityFeatureDefinition = import('../types/pv-types').PremiumCapabilityFeature;
type PremiumCapabilityTierDefinition = import('../types/pv-types').PremiumCapabilityTier;
type PremiumEntitlementSource = import('../types/pv-types').PremiumEntitlementSource;
type PremiumEntitlementState = import('../types/pv-types').PremiumEntitlementState;
type PremiumEntitlementRecord = import('../types/pv-types').PremiumEntitlementRecord;
type PremiumEntitlementResolution = import('../types/pv-types').PremiumEntitlementResolution;
type PremiumCapabilityAccess = import('../types/pv-types').PremiumCapabilityAccess;

interface PremiumCapabilityProgram {
    features: Record<string, PremiumCapabilityFeatureDefinition>;
    tiers: Record<string, PremiumCapabilityTierDefinition>;
    rolloutPrinciples?: string[];
}

interface PremiumEntitlementResolveOptions {
    rawEntitlement?: unknown;
    now?: string;
    program?: PremiumCapabilityProgram | null;
    storageKey?: string;
}

interface PremiumTrialEntitlementOptions {
    planKey: string;
    days?: number;
    note?: string;
    now?: string;
    program?: PremiumCapabilityProgram | null;
}

type PremiumRuntimeWindow = Window & typeof globalThis & {
    __PV_PREMIUM_ENTITLEMENT__?: unknown;
};

const PREMIUM_ENTITLEMENT_STORAGE_KEY = 'pvCalculatorPremiumEntitlementV1';
const DEFAULT_PREMIUM_GRACE_DAYS = 14;
const KNOWN_PREMIUM_SOURCES: PremiumEntitlementSource[] = ['community', 'trial', 'local_license', 'server_sync'];

function asPremiumRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function asPremiumString(value: unknown): string {
    return String(value || '').trim();
}

function asPremiumStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(item => asPremiumString(item)).filter(Boolean))];
}

function asPremiumDate(value: unknown): string | null {
    const cleaned = asPremiumString(value);
    if (!cleaned) return null;
    const parsed = new Date(cleaned);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function addDaysToPremiumDate(isoDate: string | null, days: number): string | null {
    if (!isoDate) return null;
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return null;
    parsed.setUTCDate(parsed.getUTCDate() + Math.max(0, days));
    return parsed.toISOString();
}

function formatPremiumDate(isoDate: string | null): string {
    return isoDate ? isoDate.slice(0, 10) : 'Unknown';
}

function asPremiumGraceDays(value: unknown): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return DEFAULT_PREMIUM_GRACE_DAYS;
    return Math.max(0, Math.round(numeric));
}

function asPremiumSource(value: unknown, fallback: PremiumEntitlementSource): PremiumEntitlementSource {
    const cleaned = asPremiumString(value) as PremiumEntitlementSource;
    return KNOWN_PREMIUM_SOURCES.includes(cleaned) ? cleaned : fallback;
}

function getPremiumProgram(program?: PremiumCapabilityProgram | null): PremiumCapabilityProgram {
    return program || DEFAULTS.PREMIUM_CAPABILITIES || { features: {}, tiers: {}, rolloutPrinciples: [] };
}

function getCommunityTierKey(program: PremiumCapabilityProgram): string {
    return program.tiers.community ? 'community' : (Object.keys(program.tiers)[0] || 'community');
}

function getCommunityCapabilities(program: PremiumCapabilityProgram): string[] {
    const communityTierKey = getCommunityTierKey(program);
    return [...new Set(program.tiers[communityTierKey]?.keyFeatures || [])];
}

function getTierCapabilities(program: PremiumCapabilityProgram, tierKey: string): string[] {
    return [...new Set(program.tiers[tierKey]?.keyFeatures || [])];
}

function getRequiredTierKey(program: PremiumCapabilityProgram, featureKey: string): string {
    for (const [tierKey, tier] of Object.entries(program.tiers)) {
        if ((tier.keyFeatures || []).includes(featureKey)) return tierKey;
    }
    return getCommunityTierKey(program);
}

function getPremiumStorageHandle(): Storage | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    } catch (error) {
        return null;
    }

    try {
        if (typeof localStorage !== 'undefined') return localStorage;
    } catch (error) {
        return null;
    }

    return null;
}

const PremiumEntitlements = {
    STORAGE_KEY: PREMIUM_ENTITLEMENT_STORAGE_KEY,

    readWindowEntitlement(): unknown {
        if (typeof window === 'undefined') return null;
        const runtimeWindow = window as PremiumRuntimeWindow;
        return runtimeWindow.__PV_PREMIUM_ENTITLEMENT__ || null;
    },

    readLocalEntitlement(storageKey = PREMIUM_ENTITLEMENT_STORAGE_KEY): unknown {
        const storage = getPremiumStorageHandle();
        if (!storage) return null;

        try {
            const raw = storage.getItem(storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    },

    saveLocalEntitlement(rawEntitlement: unknown, storageKey = PREMIUM_ENTITLEMENT_STORAGE_KEY): boolean {
        const storage = getPremiumStorageHandle();
        if (!storage) return false;

        try {
            storage.setItem(storageKey, JSON.stringify(rawEntitlement || {}));
            return true;
        } catch (error) {
            return false;
        }
    },

    clearLocalEntitlement(storageKey = PREMIUM_ENTITLEMENT_STORAGE_KEY): boolean {
        const storage = getPremiumStorageHandle();
        if (!storage) return false;

        try {
            storage.removeItem(storageKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    getFeatureTierKey(featureKey: string, program?: PremiumCapabilityProgram | null): string {
        return getRequiredTierKey(getPremiumProgram(program), featureKey);
    },

    createTrialEntitlement(options: PremiumTrialEntitlementOptions): PremiumEntitlementRecord {
        const program = getPremiumProgram(options.program);
        const planKey = program.tiers[options.planKey] ? options.planKey : getCommunityTierKey(program);
        const issuedAt = asPremiumDate(options.now) || new Date().toISOString();
        const expiresAt = addDaysToPremiumDate(issuedAt, Math.max(1, Math.round(Number(options.days) || 14)));

        return {
            planKey,
            source: 'trial',
            grantedCapabilities: getTierCapabilities(program, planKey),
            issuedAt,
            lastVerifiedAt: issuedAt,
            expiresAt,
            offlineGraceDays: DEFAULT_PREMIUM_GRACE_DAYS,
            note: asPremiumString(options.note) || `${program.tiers[planKey]?.label || planKey} local trial`
        };
    },

    normalizeEntitlement(rawEntitlement: unknown, options: PremiumEntitlementResolveOptions = {}): PremiumEntitlementResolution {
        const program = getPremiumProgram(options.program);
        const communityTierKey = getCommunityTierKey(program);
        const communityCapabilities = getCommunityCapabilities(program);
        const record = asPremiumRecord(rawEntitlement);
        const planKeyCandidate = asPremiumString(record?.planKey);
        const planKey = program.tiers[planKeyCandidate] ? planKeyCandidate : communityTierKey;
        const planDefinition = program.tiers[planKey] || null;
        const tierCapabilities = getTierCapabilities(program, planKey);
        const grantedCapabilities = [...new Set([
            ...tierCapabilities,
            ...asPremiumStringList(record?.grantedCapabilities)
        ])];
        const expiresAt = asPremiumDate(record?.expiresAt);
        const offlineGraceDays = asPremiumGraceDays(record?.offlineGraceDays);
        const issuedAt = asPremiumDate(record?.issuedAt);
        const lastVerifiedAt = asPremiumDate(record?.lastVerifiedAt);
        const note = asPremiumString(record?.note);
        const source = asPremiumSource(record?.source, planKey === communityTierKey ? 'community' : 'local_license');
        const nowIso = asPremiumDate(options.now) || new Date().toISOString();
        const nowTime = new Date(nowIso).getTime();
        const expiryTime = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
        const graceEndsAt = expiresAt ? addDaysToPremiumDate(expiresAt, offlineGraceDays) : null;
        const graceTime = graceEndsAt ? new Date(graceEndsAt).getTime() : Number.NaN;

        let state: PremiumEntitlementState = 'active';
        if (planKey !== communityTierKey && Number.isFinite(expiryTime) && nowTime > expiryTime) {
            state = Number.isFinite(graceTime) && nowTime <= graceTime ? 'grace' : 'expired';
        }

        const effectivePlanKey = state === 'expired' ? communityTierKey : planKey;
        const effectiveCapabilities = [...new Set([
            ...communityCapabilities,
            ...(state === 'expired' ? [] : grantedCapabilities)
        ])];
        const effectivePlanDefinition = program.tiers[effectivePlanKey] || planDefinition;
        const isPremium = effectivePlanKey !== communityTierKey;

        let statusLabel = effectivePlanDefinition?.label || 'Community';
        if (state === 'grace' && planDefinition) {
            statusLabel = `${planDefinition.label} offline grace`;
        } else if (state === 'expired' && planDefinition) {
            statusLabel = `${planDefinition.label} expired`;
        } else if (source === 'trial' && planDefinition) {
            statusLabel = `${planDefinition.label} trial`;
        } else if (source === 'server_sync' && planDefinition) {
            statusLabel = `${planDefinition.label} synced`;
        } else if (planDefinition && effectivePlanKey !== communityTierKey) {
            statusLabel = `${planDefinition.label} active`;
        }

        let summary = 'Community keeps core sizing, local project continuity, and safety-critical warnings available with no backend dependency.';
        if (state === 'grace' && planDefinition) {
            summary = `${planDefinition.label} is running on offline grace until ${formatPremiumDate(graceEndsAt)}. Premium workflow can stay available without forcing a backend round-trip.`;
        } else if (state === 'expired' && planDefinition) {
            summary = `${planDefinition.label} has expired. Core workflow remains available while premium extras fall back to advisory posture until a fresh entitlement is loaded.`;
        } else if (source === 'trial' && planDefinition) {
            summary = `${planDefinition.label} is active as a trial entitlement. Keep the rollout quiet, contextual, and offline-first.`;
        } else if (planDefinition && effectivePlanKey !== communityTierKey) {
            summary = `${planDefinition.label} currently grants the premium workflow lanes attached to its capability bundle.`;
        }

        return {
            planKey,
            source,
            grantedCapabilities,
            expiresAt,
            offlineGraceDays,
            issuedAt,
            lastVerifiedAt,
            note,
            effectivePlanKey,
            effectiveCapabilities,
            graceEndsAt,
            state,
            isPremium,
            statusLabel,
            summary
        };
    },

    resolveEntitlement(options: PremiumEntitlementResolveOptions = {}): PremiumEntitlementResolution {
        const rawEntitlement = options.rawEntitlement !== undefined
            ? options.rawEntitlement
            : (this.readWindowEntitlement() || this.readLocalEntitlement(options.storageKey || PREMIUM_ENTITLEMENT_STORAGE_KEY));
        return this.normalizeEntitlement(rawEntitlement, options);
    },

    hasCapability(featureKey: string, resolvedEntitlement?: PremiumEntitlementResolution | null, options: PremiumEntitlementResolveOptions = {}): boolean {
        if (!featureKey) return false;
        const resolved = resolvedEntitlement || this.resolveEntitlement(options);
        return (resolved.effectiveCapabilities || []).includes(featureKey);
    },

    getCapabilityAccess(featureKey: string, resolvedEntitlement?: PremiumEntitlementResolution | null, options: PremiumEntitlementResolveOptions = {}): PremiumCapabilityAccess {
        const program = getPremiumProgram(options.program);
        const feature = program.features[featureKey] || null;
        const requiredTierKey = getRequiredTierKey(program, featureKey);
        const requiredTier = program.tiers[requiredTierKey] || null;
        const resolved = resolvedEntitlement || this.resolveEntitlement(options);
        const granted = this.hasCapability(featureKey, resolved, { ...options, program });

        let availabilityLabel = 'Unavailable';
        if (granted && requiredTierKey === getCommunityTierKey(program)) {
            availabilityLabel = `Included in ${requiredTier?.label || 'Community'}`;
        } else if (granted && requiredTier) {
            availabilityLabel = resolved.state === 'grace'
                ? `${requiredTier.label} grace`
                : `Included in ${requiredTier.label}`;
        } else if (requiredTier) {
            availabilityLabel = `Planned for ${requiredTier.label}`;
        }

        const summary = feature?.summary || 'Capability summary not defined yet.';
        const upgradeSummary = !requiredTier || requiredTierKey === getCommunityTierKey(program)
            ? 'This capability belongs to the core workflow.'
            : granted
                ? `${requiredTier.label} is the current capability owner for this workflow lane.`
                : `${requiredTier.label} is the first planned tier for this workflow. Current release keeps the feature visible while the entitlement layer stays advisory and offline-first.`;

        return {
            featureKey,
            feature,
            requiredTierKey,
            requiredTier,
            granted,
            source: resolved.source,
            state: resolved.state,
            availabilityLabel,
            summary,
            upgradeSummary
        };
    }
};
