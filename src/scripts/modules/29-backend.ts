/* =============================================================================
   PHASE P2: OPTIONAL BACKEND RUNTIME
   Backend remains optional. This runtime only handles trusted sync edges like
   entitlement resolution and shared premium state, while the calculator stays
   offline-first and static-host friendly.
   ============================================================================= */

type BackendRuntimeConfigDefinition = import('../types/pv-types').BackendRuntimeConfig;
type BackendRuntimeResolutionDefinition = import('../types/pv-types').BackendRuntimeResolution;
type BackendRuntimeSourceDefinition = import('../types/pv-types').BackendRuntimeSource;
type BackendEntitlementSyncResultDefinition = import('../types/pv-types').BackendEntitlementSyncResult;
type PremiumEntitlementRecordDefinition = import('../types/pv-types').PremiumEntitlementRecord;

interface BackendRuntimeDefaults {
    storageKey?: string;
    requestTimeoutMs?: number;
    resolveEndpoint?: string;
    healthEndpoint?: string;
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
}

interface BackendRuntimeResolveOptions {
    rawConfig?: unknown;
    storageKey?: string;
    defaults?: BackendRuntimeDefaults | null;
}

interface BackendRuntimeSyncOptions {
    runtime?: BackendRuntimeResolutionDefinition | null;
    payload?: Record<string, unknown> | null;
}

type BackendRuntimeWindow = Window & typeof globalThis & {
    __PV_BACKEND_CONFIG__?: unknown;
};

const BACKEND_RUNTIME_STORAGE_KEY = 'pvCalculatorBackendRuntimeV1';
const BACKEND_RUNTIME_TIMEOUT_MS = 6000;
const BACKEND_RESOLVE_ENDPOINT = '/api/entitlement/resolve';
const BACKEND_HEALTH_ENDPOINT = '/health';
const BACKEND_COMPANY_PROFILES_ENDPOINT = '/api/company-profiles';
const BACKEND_TEAM_HANDBACKS_ENDPOINT = '/api/team-handbacks';
const BACKEND_TEAM_ROSTER_ENDPOINT = '/api/team-roster';
const BACKEND_TEAM_SEATS_ENDPOINT = '/api/team-seats';
const BACKEND_TEAM_SEAT_RECOVERY_ENDPOINT = '/api/team-seats/recovery';
const BACKEND_TEAM_SEAT_RECOVERY_CODE_ISSUE_ENDPOINT = '/api/team-seats/recovery-code/issue';
const BACKEND_TEAM_SEAT_RECOVERY_CODE_REDEEM_ENDPOINT = '/api/team-seats/recovery-code/redeem';
const BACKEND_TEAM_SEAT_INVITE_ISSUE_ENDPOINT = '/api/team-seats/invite/issue';
const BACKEND_TEAM_SEAT_INVITE_REDEEM_ENDPOINT = '/api/team-seats/invite/redeem';
const BACKEND_SEAT_SESSION_ENDPOINT = '/api/seat-session/issue';
const BACKEND_SEAT_SESSION_RENEW_ENDPOINT = '/api/seat-session/renew';
const BACKEND_SEAT_SESSION_REVOKE_ENDPOINT = '/api/seat-session/revoke';
const BACKEND_AUDIT_LOG_ENDPOINT = '/api/audit-log';
const KNOWN_BACKEND_SOURCES: BackendRuntimeSourceDefinition[] = ['disabled', 'explicit', 'window_config', 'local_storage'];

function asBackendRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function asBackendString(value: unknown): string {
    return String(value || '').trim();
}

function asBackendBoolean(value: unknown, fallback = false): boolean {
    if (typeof value === 'boolean') return value;
    const cleaned = asBackendString(value).toLowerCase();
    if (!cleaned) return fallback;
    if (['true', '1', 'yes', 'enabled', 'on'].includes(cleaned)) return true;
    if (['false', '0', 'no', 'disabled', 'off'].includes(cleaned)) return false;
    return fallback;
}

function asBackendPositiveInt(value: unknown, fallback: number): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(1000, Math.round(numeric));
}

function normalizeApiBaseUrl(value: unknown): string {
    return asBackendString(value).replace(/\/+$/g, '');
}

function normalizeBackendSource(value: unknown, fallback: BackendRuntimeSourceDefinition): BackendRuntimeSourceDefinition {
    const cleaned = asBackendString(value) as BackendRuntimeSourceDefinition;
    return KNOWN_BACKEND_SOURCES.includes(cleaned) ? cleaned : fallback;
}

function getBackendStorageHandle(): Storage | null {
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

function buildBackendEndpoint(baseUrl: string, endpointPath: string): string {
    if (!baseUrl) return '';
    const normalizedEndpoint = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
    return `${baseUrl}${normalizedEndpoint}`;
}

function summarizeBackendRuntime(runtime: BackendRuntimeResolutionDefinition): string {
    if (!runtime.enabled) {
        return 'Backend sync is disabled. The calculator continues on local offline-first runtime only.';
    }
    if (!runtime.apiBaseUrl) {
        return 'Backend sync is enabled in principle, but no API base URL is configured yet.';
    }
    if (!runtime.installationKey) {
        return 'Backend API base is set, but no installation or license key is present for entitlement lookup.';
    }
    if (runtime.sessionToken) {
        return `Backend sync is ready against ${runtime.apiBaseUrl} with a short-lived seat session. The calculator can keep server-synced premium state without treating a browser-held API key as the normal operating secret.`;
    }
    if (!runtime.apiKey) {
        return `Backend sync is ready against ${runtime.apiBaseUrl}, but neither a seat session nor an API key is active in this session. That is acceptable only for local or unsecured dev use.`;
    }
    return `Backend sync is ready against ${runtime.apiBaseUrl} with an API bootstrap key. Prefer issuing a short-lived seat session for ordinary premium sync activity.`;
}

const BackendRuntime = {
    STORAGE_KEY: BACKEND_RUNTIME_STORAGE_KEY,

    readWindowConfig(): unknown {
        if (typeof window === 'undefined') return null;
        const runtimeWindow = window as BackendRuntimeWindow;
        return runtimeWindow.__PV_BACKEND_CONFIG__ || null;
    },

    readLocalConfig(storageKey = BACKEND_RUNTIME_STORAGE_KEY): unknown {
        const storage = getBackendStorageHandle();
        if (!storage) return null;

        try {
            const raw = storage.getItem(storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    },

    saveLocalConfig(rawConfig: unknown, storageKey = BACKEND_RUNTIME_STORAGE_KEY): boolean {
        const storage = getBackendStorageHandle();
        if (!storage) return false;

        try {
            const record = asBackendRecord(rawConfig) || {};
            const persisted = { ...record };
            delete persisted.apiKey;
            delete persisted.sessionToken;
            storage.setItem(storageKey, JSON.stringify(persisted));
            return true;
        } catch (error) {
            return false;
        }
    },

    clearLocalConfig(storageKey = BACKEND_RUNTIME_STORAGE_KEY): boolean {
        const storage = getBackendStorageHandle();
        if (!storage) return false;

        try {
            storage.removeItem(storageKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    resolveConfig(options: BackendRuntimeResolveOptions = {}): BackendRuntimeResolutionDefinition {
        const defaults = options.defaults || {};
        const storageKey = asBackendString(options.storageKey || defaults.storageKey || BACKEND_RUNTIME_STORAGE_KEY) || BACKEND_RUNTIME_STORAGE_KEY;
        const explicit = asBackendRecord(options.rawConfig);
        const windowConfig = this.readWindowConfig();
        const localConfig = this.readLocalConfig(storageKey);

        const windowRecord = asBackendRecord(windowConfig);
        const localRecord = asBackendRecord(localConfig);
        const record = explicit
            || windowRecord
            || localRecord
            || null;

        const source = explicit
            ? 'explicit'
            : windowRecord
                ? 'window_config'
                : localRecord
                    ? 'local_storage'
                    : 'disabled';

        const apiBaseUrl = normalizeApiBaseUrl(record?.apiBaseUrl);
        const installationKey = asBackendString(record?.installationKey);
        const deviceLabel = asBackendString(record?.deviceLabel);
        const apiKey = explicit
            ? asBackendString(explicit.apiKey)
            : windowRecord
                ? asBackendString(windowRecord.apiKey)
                : '';
        const sessionToken = explicit
            ? asBackendString(explicit.sessionToken)
            : windowRecord
                ? asBackendString(windowRecord.sessionToken)
                : '';
        const requestTimeoutMs = asBackendPositiveInt(record?.requestTimeoutMs, asBackendPositiveInt(defaults.requestTimeoutMs, BACKEND_RUNTIME_TIMEOUT_MS));
        const resolveEndpoint = asBackendString(record?.resolveEndpoint || defaults.resolveEndpoint || BACKEND_RESOLVE_ENDPOINT) || BACKEND_RESOLVE_ENDPOINT;
        const healthEndpoint = asBackendString(record?.healthEndpoint || defaults.healthEndpoint || BACKEND_HEALTH_ENDPOINT) || BACKEND_HEALTH_ENDPOINT;
        const companyProfilesEndpoint = asBackendString(record?.companyProfilesEndpoint || defaults.companyProfilesEndpoint || BACKEND_COMPANY_PROFILES_ENDPOINT) || BACKEND_COMPANY_PROFILES_ENDPOINT;
        const teamHandbacksEndpoint = asBackendString(record?.teamHandbacksEndpoint || defaults.teamHandbacksEndpoint || BACKEND_TEAM_HANDBACKS_ENDPOINT) || BACKEND_TEAM_HANDBACKS_ENDPOINT;
        const teamRosterEndpoint = asBackendString(record?.teamRosterEndpoint || defaults.teamRosterEndpoint || BACKEND_TEAM_ROSTER_ENDPOINT) || BACKEND_TEAM_ROSTER_ENDPOINT;
        const teamSeatsEndpoint = asBackendString(record?.teamSeatsEndpoint || defaults.teamSeatsEndpoint || BACKEND_TEAM_SEATS_ENDPOINT) || BACKEND_TEAM_SEATS_ENDPOINT;
        const teamSeatRecoveryEndpoint = asBackendString(record?.teamSeatRecoveryEndpoint || defaults.teamSeatRecoveryEndpoint || BACKEND_TEAM_SEAT_RECOVERY_ENDPOINT) || BACKEND_TEAM_SEAT_RECOVERY_ENDPOINT;
        const teamSeatRecoveryCodeIssueEndpoint = asBackendString(record?.teamSeatRecoveryCodeIssueEndpoint || defaults.teamSeatRecoveryCodeIssueEndpoint || BACKEND_TEAM_SEAT_RECOVERY_CODE_ISSUE_ENDPOINT) || BACKEND_TEAM_SEAT_RECOVERY_CODE_ISSUE_ENDPOINT;
        const teamSeatRecoveryCodeRedeemEndpoint = asBackendString(record?.teamSeatRecoveryCodeRedeemEndpoint || defaults.teamSeatRecoveryCodeRedeemEndpoint || BACKEND_TEAM_SEAT_RECOVERY_CODE_REDEEM_ENDPOINT) || BACKEND_TEAM_SEAT_RECOVERY_CODE_REDEEM_ENDPOINT;
        const teamSeatInviteIssueEndpoint = asBackendString(record?.teamSeatInviteIssueEndpoint || defaults.teamSeatInviteIssueEndpoint || BACKEND_TEAM_SEAT_INVITE_ISSUE_ENDPOINT) || BACKEND_TEAM_SEAT_INVITE_ISSUE_ENDPOINT;
        const teamSeatInviteRedeemEndpoint = asBackendString(record?.teamSeatInviteRedeemEndpoint || defaults.teamSeatInviteRedeemEndpoint || BACKEND_TEAM_SEAT_INVITE_REDEEM_ENDPOINT) || BACKEND_TEAM_SEAT_INVITE_REDEEM_ENDPOINT;
        const seatSessionEndpoint = asBackendString(record?.seatSessionEndpoint || defaults.seatSessionEndpoint || BACKEND_SEAT_SESSION_ENDPOINT) || BACKEND_SEAT_SESSION_ENDPOINT;
        const seatSessionRenewEndpoint = asBackendString(record?.seatSessionRenewEndpoint || defaults.seatSessionRenewEndpoint || BACKEND_SEAT_SESSION_RENEW_ENDPOINT) || BACKEND_SEAT_SESSION_RENEW_ENDPOINT;
        const seatSessionRevokeEndpoint = asBackendString(record?.seatSessionRevokeEndpoint || defaults.seatSessionRevokeEndpoint || BACKEND_SEAT_SESSION_REVOKE_ENDPOINT) || BACKEND_SEAT_SESSION_REVOKE_ENDPOINT;
        const auditLogEndpoint = asBackendString(record?.auditLogEndpoint || defaults.auditLogEndpoint || BACKEND_AUDIT_LOG_ENDPOINT) || BACKEND_AUDIT_LOG_ENDPOINT;
        const enabled = asBackendBoolean(record?.enabled, !!(apiBaseUrl || installationKey));
        const canSync = enabled && !!apiBaseUrl && !!installationKey;
        const normalizedSource = normalizeBackendSource(source, 'disabled');

        let statusLabel = 'Backend disabled';
        if (enabled && !apiBaseUrl) {
            statusLabel = 'Awaiting API base';
        } else if (enabled && apiBaseUrl && !installationKey) {
            statusLabel = 'Awaiting installation key';
        } else if (canSync) {
            statusLabel = 'Ready to sync';
        }

        return {
            enabled,
            apiBaseUrl,
            installationKey,
            deviceLabel,
            requestTimeoutMs,
            storageKey,
            source: normalizedSource,
            statusLabel,
            summary: summarizeBackendRuntime({
                enabled,
                apiBaseUrl,
                installationKey,
                deviceLabel,
                apiKey,
                sessionToken,
                requestTimeoutMs,
                storageKey,
                source: normalizedSource,
                statusLabel,
                summary: '',
                canSync,
                resolveEndpoint,
                healthEndpoint,
                companyProfilesEndpoint,
                teamHandbacksEndpoint,
                teamRosterEndpoint,
                teamSeatsEndpoint,
                teamSeatRecoveryEndpoint,
                teamSeatRecoveryCodeIssueEndpoint,
                teamSeatRecoveryCodeRedeemEndpoint,
                teamSeatInviteIssueEndpoint,
                teamSeatInviteRedeemEndpoint,
                seatSessionEndpoint,
                seatSessionRenewEndpoint,
                seatSessionRevokeEndpoint,
                auditLogEndpoint
            }),
            canSync,
            resolveEndpoint,
            healthEndpoint,
            companyProfilesEndpoint,
            teamHandbacksEndpoint,
            teamRosterEndpoint,
            teamSeatsEndpoint,
            teamSeatRecoveryEndpoint,
            teamSeatRecoveryCodeIssueEndpoint,
            teamSeatRecoveryCodeRedeemEndpoint,
            teamSeatInviteIssueEndpoint,
            teamSeatInviteRedeemEndpoint,
            seatSessionEndpoint,
            seatSessionRenewEndpoint,
            seatSessionRevokeEndpoint,
            auditLogEndpoint,
            apiKey,
            sessionToken
        };
    },

    async requestJson(endpoint: string, options: {
        runtime?: BackendRuntimeResolutionDefinition | null;
        method?: string;
        body?: Record<string, unknown> | null;
        preferApiKey?: boolean;
    } = {}): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null; message: string; }> {
        const runtime = options.runtime || this.resolveConfig();
        if (!runtime.enabled || !runtime.canSync) {
            return {
                ok: false,
                status: 0,
                data: null,
                message: runtime.summary
            };
        }
        if (typeof fetch !== 'function') {
            return {
                ok: false,
                status: 0,
                data: null,
                message: 'This runtime does not expose fetch, so backend requests cannot run here.'
            };
        }

        const url = buildBackendEndpoint(runtime.apiBaseUrl, endpoint);
        const method = asBackendString(options.method || 'GET') || 'GET';
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timeoutHandle = controller
            ? setTimeout(() => controller.abort(), runtime.requestTimeoutMs)
            : null;
        const useApiKey = !!options.preferApiKey || !runtime.sessionToken;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (useApiKey) {
            if (runtime.apiKey) headers['X-API-Key'] = runtime.apiKey;
        } else if (runtime.sessionToken) {
            headers['X-Session-Token'] = runtime.sessionToken;
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: controller?.signal
            });

            let data: Record<string, unknown> | null = null;
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }

            return {
                ok: response.ok,
                status: response.status,
                data,
                message: asBackendString(data?.error || data?.message) || (response.ok ? 'Backend request completed.' : `Backend request failed with status ${response.status}.`)
            };
        } catch (error) {
            const message = error instanceof Error && error.name === 'AbortError'
                ? `Backend request timed out after ${Math.round(runtime.requestTimeoutMs / 1000)} seconds.`
                : `Backend request could not reach ${runtime.apiBaseUrl}.`;
            return {
                ok: false,
                status: 0,
                data: null,
                message
            };
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
        }
    },

    async syncEntitlement(options: BackendRuntimeSyncOptions = {}): Promise<BackendEntitlementSyncResultDefinition> {
        const runtime = options.runtime || this.resolveConfig();
        if (!runtime.enabled) {
            return {
                ok: false,
                status: 0,
                message: 'Backend sync is disabled. The calculator is still using its offline-first entitlement path.',
                raw: null
            };
        }
        if (!runtime.canSync) {
            return {
                ok: false,
                status: 0,
                message: 'Backend sync is not ready yet. Add the API base URL and installation key first.',
                raw: null
            };
        }

        const payload = {
            installationKey: runtime.installationKey,
            deviceLabel: runtime.deviceLabel || 'PV Calculator browser runtime',
            ...options.payload
        };
        const response = await this.requestJson(runtime.resolveEndpoint, {
            runtime,
            method: 'POST',
            body: payload
        });
        const data = response.data;

        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                message: response.message,
                raw: data
            };
        }

        const entitlement = asBackendRecord(data?.entitlement);
        if (!entitlement) {
            return {
                ok: false,
                status: response.status,
                message: 'Backend replied, but no entitlement object was returned.',
                raw: data
            };
        }

        return {
            ok: true,
            status: response.status,
            message: asBackendString(data?.message) || 'Backend entitlement sync completed.',
            entitlement: entitlement as unknown as PremiumEntitlementRecordDefinition,
            syncedAt: asBackendString(data?.syncedAt) || new Date().toISOString(),
            backendLabel: asBackendString(data?.backendLabel || data?.licenseLabel),
            raw: data
        };
    },

    async fetchCompanyProfiles(runtime?: BackendRuntimeResolutionDefinition | null, actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; profiles: Record<string, unknown>[]; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const query = [
            `installationKey=${encodeURIComponent(resolvedRuntime.installationKey || '')}`,
            actorSeatId ? `actorSeatId=${encodeURIComponent(asBackendString(actorSeatId))}` : ''
        ].filter(Boolean).join('&');
        const response = await this.requestJson(`${resolvedRuntime.companyProfilesEndpoint}?${query}`, {
            runtime: resolvedRuntime,
            method: 'GET'
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            profiles: Array.isArray(response.data?.profiles)
                ? response.data.profiles.filter(profile => asBackendRecord(profile))
                : [],
            raw: response.data
        };
    },

    async upsertCompanyProfile(runtime: BackendRuntimeResolutionDefinition | null, profile: Record<string, unknown>, actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; profile: Record<string, unknown> | null; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.companyProfilesEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(actorSeatId),
                profile
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            profile: asBackendRecord(response.data?.profile),
            raw: response.data
        };
    },

    async fetchTeamHandbacks(runtime?: BackendRuntimeResolutionDefinition | null, projectKey = '', actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; handbacks: Record<string, unknown>[]; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const query = [
            `installationKey=${encodeURIComponent(resolvedRuntime.installationKey || '')}`,
            projectKey ? `projectKey=${encodeURIComponent(projectKey)}` : '',
            actorSeatId ? `actorSeatId=${encodeURIComponent(asBackendString(actorSeatId))}` : ''
        ].filter(Boolean).join('&');
        const response = await this.requestJson(`${resolvedRuntime.teamHandbacksEndpoint}?${query}`, {
            runtime: resolvedRuntime,
            method: 'GET'
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            handbacks: Array.isArray(response.data?.handbacks)
                ? response.data.handbacks.filter(item => asBackendRecord(item))
                : [],
            raw: response.data
        };
    },

    async upsertTeamHandback(runtime: BackendRuntimeResolutionDefinition | null, handback: Record<string, unknown>, actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; handback: Record<string, unknown> | null; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamHandbacksEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(actorSeatId),
                handback
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            handback: asBackendRecord(response.data?.handback),
            raw: response.data
        };
    },

    async fetchTeamRoster(runtime?: BackendRuntimeResolutionDefinition | null, actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; admin: Record<string, unknown> | null; roster: Record<string, unknown>[]; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const query = [
            `installationKey=${encodeURIComponent(resolvedRuntime.installationKey || '')}`,
            actorSeatId ? `actorSeatId=${encodeURIComponent(asBackendString(actorSeatId))}` : ''
        ].filter(Boolean).join('&');
        const response = await this.requestJson(`${resolvedRuntime.teamRosterEndpoint}?${query}`, {
            runtime: resolvedRuntime,
            method: 'GET'
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            admin: asBackendRecord(response.data?.admin),
            roster: Array.isArray(response.data?.roster)
                ? response.data.roster.filter(item => asBackendRecord(item))
                : [],
            raw: response.data
        };
    },

    async upsertTeamRoster(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        admin?: Record<string, unknown> | null;
        rosterEntry?: Record<string, unknown> | null;
        actorSeatId?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; admin: Record<string, unknown> | null; rosterEntry: Record<string, unknown> | null; roster: Record<string, unknown>[]; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamRosterEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(payload?.actorSeatId),
                admin: payload?.admin || null,
                rosterEntry: payload?.rosterEntry || null
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            admin: asBackendRecord(response.data?.admin),
            rosterEntry: asBackendRecord(response.data?.rosterEntry),
            roster: Array.isArray(response.data?.roster)
                ? response.data.roster.filter(item => asBackendRecord(item))
                : [],
            raw: response.data
        };
    },

    async fetchTeamSeats(runtime?: BackendRuntimeResolutionDefinition | null, actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; seats: Record<string, unknown>[]; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const query = [
            `installationKey=${encodeURIComponent(resolvedRuntime.installationKey || '')}`,
            actorSeatId ? `actorSeatId=${encodeURIComponent(asBackendString(actorSeatId))}` : ''
        ].filter(Boolean).join('&');
        const response = await this.requestJson(`${resolvedRuntime.teamSeatsEndpoint}?${query}`, {
            runtime: resolvedRuntime,
            method: 'GET'
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            seats: Array.isArray(response.data?.seats)
                ? response.data.seats.filter(item => asBackendRecord(item))
                : [],
            raw: response.data
        };
    },

    async upsertTeamSeat(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        seatEntry?: Record<string, unknown> | null;
        actorSeatId?: string | null;
        accessCode?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; seat: Record<string, unknown> | null; seats: Record<string, unknown>[]; bootstrapAllowed: boolean; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamSeatsEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(payload?.actorSeatId),
                seatEntry: payload?.seatEntry || null,
                accessCode: asBackendString(payload?.accessCode)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            seat: asBackendRecord(response.data?.seat),
            seats: Array.isArray(response.data?.seats)
                ? response.data.seats.filter(item => asBackendRecord(item))
                : [],
            bootstrapAllowed: asBackendBoolean(response.data?.bootstrapAllowed, false),
            raw: response.data
        };
    },

    async recoverTeamSeat(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        actorSeatId?: string | null;
        targetSeatId?: string | null;
        recoveryAction?: string | null;
        nextAccessCode?: string | null;
        nextAccessCodeHint?: string | null;
        note?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; seat: Record<string, unknown> | null; seats: Record<string, unknown>[]; recoveryAction: string; revokedSessionCount: number; clearedLockoutCount: number; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamSeatRecoveryEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(payload?.actorSeatId),
                targetSeatId: asBackendString(payload?.targetSeatId),
                recoveryAction: asBackendString(payload?.recoveryAction),
                nextAccessCode: asBackendString(payload?.nextAccessCode),
                nextAccessCodeHint: asBackendString(payload?.nextAccessCodeHint),
                note: asBackendString(payload?.note)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            seat: asBackendRecord(response.data?.seat),
            seats: Array.isArray(response.data?.seats)
                ? response.data.seats.filter(item => asBackendRecord(item))
                : [],
            recoveryAction: asBackendString(response.data?.recoveryAction),
            revokedSessionCount: Number(response.data?.revokedSessionCount || 0),
            clearedLockoutCount: Number(response.data?.clearedLockoutCount || 0),
            raw: response.data
        };
    },

    async issueTeamSeatRecoveryCode(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        actorSeatId?: string | null;
        targetSeatId?: string | null;
        note?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; recoveryCode: string; recoveryLinkToken: string; targetSeatId: string; targetLabel: string; issuedAt: string; expiresAt: string; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamSeatRecoveryCodeIssueEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(payload?.actorSeatId),
                targetSeatId: asBackendString(payload?.targetSeatId),
                note: asBackendString(payload?.note)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            recoveryCode: asBackendString(response.data?.recoveryCode),
            recoveryLinkToken: asBackendString(response.data?.recoveryLinkToken),
            targetSeatId: asBackendString(response.data?.targetSeatId),
            targetLabel: asBackendString(response.data?.targetLabel),
            issuedAt: asBackendString(response.data?.issuedAt),
            expiresAt: asBackendString(response.data?.expiresAt),
            raw: response.data
        };
    },

    async redeemTeamSeatRecoveryCode(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        targetSeatId?: string | null;
        recoveryCode?: string | null;
        recoveryLinkToken?: string | null;
        nextAccessCode?: string | null;
        nextAccessCodeHint?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; sessionToken: string; actorSeatId: string; actorLabel: string; authMode: string; issuedAt: string; expiresAt: string; seat: Record<string, unknown> | null; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamSeatRecoveryCodeRedeemEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            preferApiKey: false,
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                targetSeatId: asBackendString(payload?.targetSeatId),
                recoveryCode: asBackendString(payload?.recoveryCode),
                recoveryLinkToken: asBackendString(payload?.recoveryLinkToken),
                nextAccessCode: asBackendString(payload?.nextAccessCode),
                nextAccessCodeHint: asBackendString(payload?.nextAccessCodeHint)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            sessionToken: asBackendString(response.data?.sessionToken),
            actorSeatId: asBackendString(response.data?.actorSeatId),
            actorLabel: asBackendString(response.data?.actorLabel),
            authMode: asBackendString(response.data?.authMode),
            issuedAt: asBackendString(response.data?.issuedAt),
            expiresAt: asBackendString(response.data?.expiresAt),
            seat: asBackendRecord(response.data?.seat),
            raw: response.data
        };
    },

    async issueTeamSeatInviteCode(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        actorSeatId?: string | null;
        targetSeatId?: string | null;
        note?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; inviteCode: string; inviteLinkToken: string; targetSeatId: string; targetLabel: string; issuedAt: string; expiresAt: string; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamSeatInviteIssueEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(payload?.actorSeatId),
                targetSeatId: asBackendString(payload?.targetSeatId),
                note: asBackendString(payload?.note)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            inviteCode: asBackendString(response.data?.inviteCode),
            inviteLinkToken: asBackendString(response.data?.inviteLinkToken),
            targetSeatId: asBackendString(response.data?.targetSeatId),
            targetLabel: asBackendString(response.data?.targetLabel),
            issuedAt: asBackendString(response.data?.issuedAt),
            expiresAt: asBackendString(response.data?.expiresAt),
            raw: response.data
        };
    },

    async redeemTeamSeatInviteCode(runtime: BackendRuntimeResolutionDefinition | null, payload: {
        inviteCode?: string | null;
        inviteLinkToken?: string | null;
        nextAccessCode?: string | null;
        nextAccessCodeHint?: string | null;
    }): Promise<{ ok: boolean; status: number; message: string; sessionToken: string; actorSeatId: string; actorLabel: string; authMode: string; issuedAt: string; expiresAt: string; seat: Record<string, unknown> | null; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.teamSeatInviteRedeemEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            preferApiKey: false,
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                inviteCode: asBackendString(payload?.inviteCode),
                inviteLinkToken: asBackendString(payload?.inviteLinkToken),
                nextAccessCode: asBackendString(payload?.nextAccessCode),
                nextAccessCodeHint: asBackendString(payload?.nextAccessCodeHint)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            sessionToken: asBackendString(response.data?.sessionToken),
            actorSeatId: asBackendString(response.data?.actorSeatId),
            actorLabel: asBackendString(response.data?.actorLabel),
            authMode: asBackendString(response.data?.authMode),
            issuedAt: asBackendString(response.data?.issuedAt),
            expiresAt: asBackendString(response.data?.expiresAt),
            seat: asBackendRecord(response.data?.seat),
            raw: response.data
        };
    },

    async fetchAuditLog(runtime?: BackendRuntimeResolutionDefinition | null, limit = 12, actorSeatId = ''): Promise<{ ok: boolean; status: number; message: string; entries: Record<string, unknown>[]; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const query = [
            `installationKey=${encodeURIComponent(resolvedRuntime.installationKey || '')}`,
            `limit=${encodeURIComponent(String(limit || 12))}`,
            actorSeatId ? `actorSeatId=${encodeURIComponent(asBackendString(actorSeatId))}` : ''
        ].filter(Boolean).join('&');
        const response = await this.requestJson(`${resolvedRuntime.auditLogEndpoint}?${query}`, {
            runtime: resolvedRuntime,
            method: 'GET'
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            entries: Array.isArray(response.data?.entries)
                ? response.data.entries.filter(item => asBackendRecord(item))
                : [],
            raw: response.data
        };
    },

    async issueSeatSession(runtime: BackendRuntimeResolutionDefinition | null, actorSeatId = '', actorSeatCode = ''): Promise<{ ok: boolean; status: number; message: string; sessionToken: string; actorSeatId: string; actorLabel: string; authMode: string; issuedAt: string; expiresAt: string; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.seatSessionEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            preferApiKey: true,
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime',
                actorSeatId: asBackendString(actorSeatId),
                actorSeatCode: asBackendString(actorSeatCode)
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            sessionToken: asBackendString(response.data?.sessionToken),
            actorSeatId: asBackendString(response.data?.actorSeatId),
            actorLabel: asBackendString(response.data?.actorLabel),
            authMode: asBackendString(response.data?.authMode),
            issuedAt: asBackendString(response.data?.issuedAt),
            expiresAt: asBackendString(response.data?.expiresAt),
            raw: response.data
        };
    },

    async renewSeatSession(runtime: BackendRuntimeResolutionDefinition | null): Promise<{ ok: boolean; status: number; message: string; sessionToken: string; actorSeatId: string; actorLabel: string; authMode: string; issuedAt: string; expiresAt: string; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.seatSessionRenewEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime'
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            sessionToken: asBackendString(response.data?.sessionToken),
            actorSeatId: asBackendString(response.data?.actorSeatId),
            actorLabel: asBackendString(response.data?.actorLabel),
            authMode: asBackendString(response.data?.authMode),
            issuedAt: asBackendString(response.data?.issuedAt),
            expiresAt: asBackendString(response.data?.expiresAt),
            raw: response.data
        };
    },

    async revokeSeatSession(runtime: BackendRuntimeResolutionDefinition | null): Promise<{ ok: boolean; status: number; message: string; raw: Record<string, unknown> | null; }> {
        const resolvedRuntime = runtime || this.resolveConfig();
        const response = await this.requestJson(resolvedRuntime.seatSessionRevokeEndpoint, {
            runtime: resolvedRuntime,
            method: 'POST',
            body: {
                installationKey: resolvedRuntime.installationKey,
                deviceLabel: resolvedRuntime.deviceLabel || 'PV Calculator browser runtime'
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            message: response.message,
            raw: response.data
        };
    }
};
