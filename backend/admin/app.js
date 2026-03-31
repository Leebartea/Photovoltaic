(function () {
    const state = {
        posture: null,
        adminContext: null,
        sessionToken: '',
        sessionIssuedAt: '',
        sessionExpiresAt: '',
        sessionAuthMode: '',
        sessionActorLabel: '',
        sessionActorSeatId: '',
        seats: [],
        selectedSeatId: '',
        approvals: [],
        selectedApprovalId: '',
        deliveryTrail: [],
        dispatchPack: null,
        auditEntries: [],
        invite: null,
        recovery: null
    };

    const elements = {};

    function byId(id) {
        return document.getElementById(id);
    }

    function collectElements() {
        [
            'statusBanner',
            'postureSummary',
            'postureWarnings',
            'shellBanner',
            'shellSummary',
            'shellNote',
            'installationKey',
            'frontendAppUrl',
            'apiKey',
            'deviceLabel',
            'actorSeatId',
            'actorSeatCode',
            'sessionSummary',
            'seatSummary',
            'seatTableBody',
            'approvalStatusFilter',
            'approvalRecoveryAction',
            'approvalReviewNote',
            'approvalSummary',
            'approvalTableBody',
            'deliveryLimit',
            'deliveryTypeFilter',
            'deliveryChannelFilter',
            'deliveryAckStatusFilter',
            'deliveryChannel',
            'deliveryArtifactMode',
            'deliveryRecipient',
            'deliveryNote',
            'deliveryAckNote',
            'deliveryTrailSummary',
            'deliveryTrailList',
            'dispatchSubjectOutput',
            'dispatchBodyOutput',
            'dispatchMeta',
            'inviteNote',
            'inviteCodeOutput',
            'inviteLinkOutput',
            'inviteMeta',
            'recoveryNote',
            'recoveryCodeOutput',
            'recoveryLinkOutput',
            'recoveryMeta',
            'auditLimit',
            'auditCategoryFilter',
            'auditActionFilter',
            'auditQueryFilter',
            'auditSummary',
            'auditList',
            'copyAuditSnapshotBtn',
            'downloadAuditTxtBtn',
            'downloadAuditCsvBtn',
            'copyInviteCodeBtn',
            'copyInviteLinkBtn',
            'copyRecoveryCodeBtn',
            'copyRecoveryLinkBtn'
        ].forEach(id => {
            elements[id] = byId(id);
        });
    }

    function asText(value) {
        return String(value || '').trim();
    }

    function setBanner(message, tone) {
        const banner = elements.statusBanner;
        if (!banner) return;
        banner.textContent = message;
        banner.className = 'banner';
        if (tone === 'warn') banner.classList.add('warn');
        if (tone === 'error') banner.classList.add('error');
    }

    function readRuntime() {
        return {
            installationKey: asText(elements.installationKey && elements.installationKey.value),
            frontendAppUrl: asText(elements.frontendAppUrl && elements.frontendAppUrl.value),
            apiKey: asText(elements.apiKey && elements.apiKey.value),
            actorSeatId: asText(elements.actorSeatId && elements.actorSeatId.value),
            actorSeatCode: asText(elements.actorSeatCode && elements.actorSeatCode.value),
            deviceLabel: asText(elements.deviceLabel && elements.deviceLabel.value) || 'Backend Admin Console'
        };
    }

    function clearIssuedOutputs() {
        state.invite = null;
        state.recovery = null;
        state.dispatchPack = null;
        if (elements.inviteCodeOutput) elements.inviteCodeOutput.value = '';
        if (elements.inviteLinkOutput) elements.inviteLinkOutput.value = '';
        if (elements.recoveryCodeOutput) elements.recoveryCodeOutput.value = '';
        if (elements.recoveryLinkOutput) elements.recoveryLinkOutput.value = '';
        if (elements.dispatchSubjectOutput) elements.dispatchSubjectOutput.value = '';
        if (elements.dispatchBodyOutput) elements.dispatchBodyOutput.value = '';
        if (elements.inviteMeta) elements.inviteMeta.textContent = 'Issue a one-time seat invite for the selected shared seat.';
        if (elements.recoveryMeta) elements.recoveryMeta.textContent = 'Issue a one-time recovery code for the selected shared seat.';
        if (elements.dispatchMeta) elements.dispatchMeta.textContent = 'Issue an invite or recovery item first, then prepare a provider-ready dispatch pack using the current channel, recipient, artifact mode, and frontend app URL.';
        updateCopyButtonState();
    }

    function clearLocalSession() {
        state.sessionToken = '';
        state.sessionIssuedAt = '';
        state.sessionExpiresAt = '';
        state.sessionAuthMode = '';
        state.sessionActorLabel = '';
        state.sessionActorSeatId = '';
        state.adminContext = null;
        if (elements.actorSeatCode) elements.actorSeatCode.value = '';
        clearIssuedOutputs();
        renderSessionSummary();
        renderAdminShell();
    }

    function preferApiKey(options) {
        return options && options.preferApiKey === true;
    }

    async function requestJson(path, options) {
        const runtime = readRuntime();
        const headers = {
            Accept: 'application/json'
        };
        if (options && options.body) {
            headers['Content-Type'] = 'application/json';
        }

        if (state.sessionToken && !preferApiKey(options) && !(options && options.omitSessionToken)) {
            headers['X-Session-Token'] = state.sessionToken;
        } else if (runtime.apiKey && !(options && options.omitApiKey)) {
            headers['X-API-Key'] = runtime.apiKey;
        }

        const response = await fetch(path, {
            method: (options && options.method) || 'GET',
            headers,
            body: options && options.body ? JSON.stringify(options.body) : undefined
        });

        const raw = await response.text();
        let body = {};
        try {
            body = raw ? JSON.parse(raw) : {};
        } catch (error) {
            throw new Error(raw || `Unexpected ${response.status} response.`);
        }

        if (!response.ok) {
            const message = asText(body.error || body.message) || `Request failed with status ${response.status}.`;
            const err = new Error(message);
            err.status = response.status;
            err.body = body;
            throw err;
        }

        return body;
    }

    async function requestText(path, options) {
        const runtime = readRuntime();
        const headers = {};
        if (state.sessionToken && !preferApiKey(options) && !(options && options.omitSessionToken)) {
            headers['X-Session-Token'] = state.sessionToken;
        } else if (runtime.apiKey && !(options && options.omitApiKey)) {
            headers['X-API-Key'] = runtime.apiKey;
        }

        const response = await fetch(path, {
            method: (options && options.method) || 'GET',
            headers
        });
        const raw = await response.text();
        if (!response.ok) {
            const error = new Error(raw || `Request failed with status ${response.status}.`);
            error.status = response.status;
            throw error;
        }
        return {
            text: raw,
            contentType: String(response.headers.get('content-type') || '')
        };
    }

    function buildActionLink(hashKey, token) {
        const runtime = readRuntime();
        if (!runtime.frontendAppUrl || !token) return '';
        try {
            const url = new URL(runtime.frontendAppUrl, window.location.href);
            url.hash = `${hashKey}=${encodeURIComponent(token)}`;
            return url.toString();
        } catch (error) {
            return '';
        }
    }

    function maskToken(value) {
        const raw = asText(value);
        if (!raw) return 'No in-memory session';
        if (raw.length <= 12) return raw;
        return `${raw.slice(0, 6)}…${raw.slice(-4)}`;
    }

    function createSummaryCard(label, value, tone) {
        const card = document.createElement('div');
        card.className = 'summary-card';
        if (tone) card.classList.add(tone);

        const title = document.createElement('strong');
        title.textContent = label;
        const text = document.createElement('span');
        text.textContent = value;
        card.appendChild(title);
        card.appendChild(text);
        return card;
    }

    function renderPosture() {
        const summary = elements.postureSummary;
        const warningList = elements.postureWarnings;
        if (!summary || !warningList) return;
        summary.replaceChildren();
        warningList.replaceChildren();

        const posture = state.posture;
        if (!posture) {
            summary.appendChild(createSummaryCard('Backend', 'Posture not loaded yet.', 'warn'));
            return;
        }

        summary.appendChild(createSummaryCard('Backend', posture.backendLabel || 'Backend runtime', 'good'));
        summary.appendChild(createSummaryCard('API key protection', posture.apiKeyProtectionEnabled ? 'Enabled' : 'Disabled', posture.apiKeyProtectionEnabled ? 'good' : 'bad'));
        summary.appendChild(createSummaryCard('Allowed origins', posture.allowedOriginsConfigured ? 'Locked' : 'Open', posture.allowedOriginsConfigured ? 'good' : 'warn'));
        summary.appendChild(createSummaryCard('Signed-link secret', posture.actionLinkSecretSource === 'explicit' ? 'Explicit' : posture.actionLinkSecretSource, posture.actionLinkSecretSource === 'explicit' ? 'good' : 'warn'));
        summary.appendChild(createSummaryCard('Seat session TTL', `${posture.seatSessionTtlMinutes} minutes`, 'good'));
        summary.appendChild(createSummaryCard('Recovery / Invite TTL', `${posture.seatRecoveryCodeTtlMinutes}m / ${posture.seatInviteCodeTtlMinutes}m`, 'good'));
        if (posture.operationsReadiness) {
            summary.appendChild(createSummaryCard('Ops readiness', `${posture.operationsReadiness.score}%`, posture.operationsReadiness.ready ? 'good' : 'warn'));
            summary.appendChild(createSummaryCard('Backup ownership', posture.operationsReadiness.policy && posture.operationsReadiness.policy.backupOwner ? posture.operationsReadiness.policy.backupOwner : 'Missing', posture.operationsReadiness.policy && posture.operationsReadiness.policy.backupOwner ? 'good' : 'warn'));
            summary.appendChild(createSummaryCard('Incident runbook', posture.operationsReadiness.policy && posture.operationsReadiness.policy.incidentRunbookUrl ? 'Linked' : 'Missing', posture.operationsReadiness.policy && posture.operationsReadiness.policy.incidentRunbookUrl ? 'good' : 'warn'));
        }

        const warnings = Array.isArray(posture.warnings) ? posture.warnings : [];
        if (!warnings.length) {
            const item = document.createElement('li');
            item.textContent = 'No immediate posture warning reported by the backend.';
            warningList.appendChild(item);
            return;
        }

        warnings.forEach(message => {
            const item = document.createElement('li');
            item.textContent = message;
            warningList.appendChild(item);
        });
    }

    function renderSessionSummary() {
        const target = elements.sessionSummary;
        if (!target) return;
        target.replaceChildren();

        const details = [
            ['Mode', state.sessionAuthMode || 'No active session'],
            ['Seat', state.sessionActorLabel || readRuntime().actorSeatId || 'No admin seat selected'],
            ['Issued', state.sessionIssuedAt || 'Not issued'],
            ['Expires', state.sessionExpiresAt || 'Not issued'],
            ['Token', maskToken(state.sessionToken)]
        ];

        details.forEach(([label, value]) => {
            const line = document.createElement('p');
            line.textContent = `${label}: ${value}`;
            target.appendChild(line);
        });
    }

    function isShellUnlocked() {
        return !!(state.adminContext && state.adminContext.unlocked);
    }

    function setShellLockedState(locked) {
        Array.from(document.querySelectorAll('.requires-session')).forEach(node => {
            node.classList.toggle('is-locked', !!locked);
            node.setAttribute('aria-disabled', locked ? 'true' : 'false');
        });
    }

    function renderAdminShell() {
        const banner = elements.shellBanner;
        const summary = elements.shellSummary;
        const note = elements.shellNote;
        if (!banner || !summary || !note) return;

        summary.replaceChildren();
        const unlocked = isShellUnlocked();
        setShellLockedState(!unlocked);

        if (!unlocked) {
            banner.textContent = 'Admin shell is locked until a short-lived seat session is active.';
            banner.className = 'banner warn';
            note.textContent = 'Issue a short-lived seat session first. The admin workspace unlocks only from a valid backend seat session, not from API-key bootstrap alone.';
            summary.appendChild(createSummaryCard('Shell state', 'Locked', 'warn'));
            summary.appendChild(createSummaryCard('Unlock rule', 'Valid seat session required', 'warn'));
            summary.appendChild(createSummaryCard('Bootstrap credential', 'API key is bootstrap-only', 'warn'));
            return;
        }

        const context = state.adminContext;
        const capabilities = context.capabilities || {};
        banner.textContent = `Admin shell unlocked for ${context.actorLabel || context.actorSeat?.label || context.actorSeatId}.`;
        banner.className = 'banner';
        note.textContent = `This shell is now tied to a live ${context.authMode || 'seat'} session. Invite, recovery, seat-library, and audit actions use the existing backend permission checks for this named operator seat.`;
        summary.appendChild(createSummaryCard('Shell state', 'Unlocked', 'good'));
        summary.appendChild(createSummaryCard('Operator seat', context.actorSeat?.roleLabel || context.actorLabel || context.actorSeatId || 'Unknown', 'good'));
        summary.appendChild(createSummaryCard('Session expiry', context.expiresAt || state.sessionExpiresAt || 'Unknown', 'good'));
        summary.appendChild(createSummaryCard('Seat management', capabilities.teamSeatPublish ? 'Allowed' : 'Read-only', capabilities.teamSeatPublish ? 'good' : 'warn'));
        summary.appendChild(createSummaryCard('Audit access', capabilities.auditRead ? 'Allowed' : 'Unavailable', capabilities.auditRead ? 'good' : 'warn'));
        summary.appendChild(createSummaryCard('Shared seat library', `${context.seatCount || 0} seat${(context.seatCount || 0) === 1 ? '' : 's'}`, 'good'));
    }

    function getSelectedSeat() {
        return state.seats.find(seat => seat.id === state.selectedSeatId) || null;
    }

    function onSeatSelectionChange(nextSeatId) {
        state.selectedSeatId = asText(nextSeatId);
        renderSeatSummary();
        renderApprovalSummary();
        clearIssuedOutputs();
    }

    function createSeatPill(value, tone) {
        const pill = document.createElement('span');
        pill.className = 'pill';
        if (tone) pill.classList.add(tone);
        pill.textContent = value;
        return pill;
    }

    function renderSeatTable() {
        const body = elements.seatTableBody;
        if (!body) return;
        body.replaceChildren();

        if (!state.seats.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = 'No shared seats loaded yet.';
            row.appendChild(cell);
            body.appendChild(row);
            return;
        }

        state.seats.forEach(seat => {
            const row = document.createElement('tr');

            const selectCell = document.createElement('td');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'targetSeatId';
            radio.className = 'seat-pick';
            radio.value = seat.id;
            radio.checked = seat.id === state.selectedSeatId;
            radio.addEventListener('change', function () {
                onSeatSelectionChange(seat.id);
            });
            selectCell.appendChild(radio);
            row.appendChild(selectCell);

            const labelCell = document.createElement('td');
            labelCell.textContent = seat.label || seat.id;
            row.appendChild(labelCell);

            const roleCell = document.createElement('td');
            roleCell.textContent = seat.roleLabel || seat.roleKey || 'Unknown';
            row.appendChild(roleCell);

            const stateCell = document.createElement('td');
            stateCell.appendChild(createSeatPill(seat.stateLabel || seat.stateKey || 'Unknown', seat.stateKey === 'suspended' ? 'bad' : seat.stateKey === 'review_only' ? 'warn' : ''));
            row.appendChild(stateCell);

            const signInCell = document.createElement('td');
            signInCell.appendChild(createSeatPill(seat.authEnabled ? 'Enabled' : 'Disabled', seat.authEnabled ? '' : 'warn'));
            row.appendChild(signInCell);

            const hintCell = document.createElement('td');
            hintCell.textContent = seat.accessCodeHint || 'No hint';
            row.appendChild(hintCell);

            const updatedCell = document.createElement('td');
            updatedCell.textContent = seat.updatedAt || 'Unknown';
            row.appendChild(updatedCell);

            body.appendChild(row);
        });
    }

    function renderSeatSummary() {
        const target = elements.seatSummary;
        if (!target) return;
        const seat = getSelectedSeat();
        target.textContent = seat
            ? `Selected seat: ${seat.label} • ${seat.roleLabel} • ${seat.stateLabel} • shared sign-in ${seat.authEnabled ? 'enabled' : 'disabled'}.`
            : 'Load the shared seat library and select the target seat for invite or recovery actions.';
    }

    function getSelectedApproval() {
        return state.approvals.find(approval => approval.id === state.selectedApprovalId) || null;
    }

    function onApprovalSelectionChange(nextApprovalId) {
        state.selectedApprovalId = asText(nextApprovalId);
        renderApprovalSummary();
    }

    function renderApprovalTable() {
        const body = elements.approvalTableBody;
        if (!body) return;
        body.replaceChildren();

        if (!state.approvals.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = 'No approval requests matched the current queue filter.';
            row.appendChild(cell);
            body.appendChild(row);
            return;
        }

        state.approvals.forEach(approval => {
            const row = document.createElement('tr');

            const targetCell = document.createElement('td');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'approvalId';
            radio.className = 'seat-pick';
            radio.value = approval.id;
            radio.checked = approval.id === state.selectedApprovalId;
            radio.addEventListener('change', function () {
                onApprovalSelectionChange(approval.id);
            });
            targetCell.appendChild(radio);
            targetCell.appendChild(document.createTextNode(` ${approval.targetLabel || approval.targetSeatId || approval.id}`));
            row.appendChild(targetCell);

            const actionCell = document.createElement('td');
            actionCell.textContent = approval.recoveryActionLabel || approval.recoveryAction || approval.actionType || 'Unknown';
            row.appendChild(actionCell);

            const statusCell = document.createElement('td');
            const tone = approval.status === 'rejected'
                ? 'bad'
                : approval.status === 'pending' || approval.status === 'expired'
                    ? 'warn'
                    : '';
            statusCell.appendChild(createSeatPill(approval.statusLabel || approval.status || 'Unknown', tone));
            row.appendChild(statusCell);

            const requestedCell = document.createElement('td');
            requestedCell.textContent = approval.requestedByLabel || approval.requestedBySeatId || 'Unknown';
            row.appendChild(requestedCell);

            const reviewedCell = document.createElement('td');
            reviewedCell.textContent = approval.reviewedByLabel || approval.reviewedBySeatId || 'Pending';
            row.appendChild(reviewedCell);

            const expiresCell = document.createElement('td');
            expiresCell.textContent = approval.expiresAt || 'Unknown';
            row.appendChild(expiresCell);

            const noteCell = document.createElement('td');
            noteCell.textContent = approval.requestNote || approval.reviewNote || 'No note';
            row.appendChild(noteCell);

            body.appendChild(row);
        });
    }

    function renderApprovalSummary() {
        const target = elements.approvalSummary;
        if (!target) return;
        const approval = getSelectedApproval();
        const selectedSeat = getSelectedSeat();
        if (approval) {
            const reviewer = approval.reviewedByLabel || approval.reviewedBySeatId || 'Pending';
            target.textContent = `Selected approval: ${approval.recoveryActionLabel || approval.recoveryAction} for ${approval.targetLabel || approval.targetSeatId}. Status: ${approval.statusLabel || approval.status}. Requested by ${approval.requestedByLabel || approval.requestedBySeatId || 'Unknown'}${reviewer ? ` • Reviewed by ${reviewer}` : ''}.`;
            return;
        }
        if (!state.approvals.length) {
            target.textContent = selectedSeat
                ? `No approval requests matched the current queue filter. You can request a high-risk action for ${selectedSeat.label} from this panel.`
                : 'Load the shared seat library, select a target seat, then queue or review high-risk actions here.';
            return;
        }
        target.textContent = `Loaded ${state.approvals.length} approval request${state.approvals.length === 1 ? '' : 's'}. Select one to review it or choose a target seat to request a new one.`;
    }

    function updateCopyButtonState() {
        const inviteLinkReady = !!(state.invite && state.invite.link);
        const inviteCodeReady = !!(state.invite && state.invite.code);
        const recoveryLinkReady = !!(state.recovery && state.recovery.link);
        const recoveryCodeReady = !!(state.recovery && state.recovery.code);
        const dispatchSubjectReady = !!(state.dispatchPack && state.dispatchPack.subject);
        const dispatchBodyReady = !!(state.dispatchPack && state.dispatchPack.text);
        if (elements.copyInviteCodeBtn) elements.copyInviteCodeBtn.disabled = !inviteCodeReady;
        if (elements.copyInviteLinkBtn) elements.copyInviteLinkBtn.disabled = !inviteLinkReady;
        if (elements.copyRecoveryCodeBtn) elements.copyRecoveryCodeBtn.disabled = !recoveryCodeReady;
        if (elements.copyRecoveryLinkBtn) elements.copyRecoveryLinkBtn.disabled = !recoveryLinkReady;
        const copyDispatchSubjectBtn = byId('copyDispatchSubjectBtn');
        const copyDispatchBodyBtn = byId('copyDispatchBodyBtn');
        const downloadDispatchTxtBtn = byId('downloadDispatchTxtBtn');
        if (copyDispatchSubjectBtn) copyDispatchSubjectBtn.disabled = !dispatchSubjectReady;
        if (copyDispatchBodyBtn) copyDispatchBodyBtn.disabled = !dispatchBodyReady;
        if (downloadDispatchTxtBtn) downloadDispatchTxtBtn.disabled = !dispatchBodyReady;
    }

    function renderInviteOutput() {
        if (elements.inviteCodeOutput) elements.inviteCodeOutput.value = state.invite ? state.invite.code : '';
        if (elements.inviteLinkOutput) elements.inviteLinkOutput.value = state.invite ? state.invite.link : '';
        if (elements.inviteMeta) {
            elements.inviteMeta.textContent = state.invite
                ? `Invite ready for ${state.invite.targetLabel}. Expires ${state.invite.expiresAt}. ${state.invite.link ? 'App link uses the configured frontend URL.' : 'Add a Frontend App URL above to generate a full handoff link.'}`
                : 'Issue a one-time seat invite for the selected shared seat.';
        }
        updateCopyButtonState();
    }

    function renderRecoveryOutput() {
        if (elements.recoveryCodeOutput) elements.recoveryCodeOutput.value = state.recovery ? state.recovery.code : '';
        if (elements.recoveryLinkOutput) elements.recoveryLinkOutput.value = state.recovery ? state.recovery.link : '';
        if (elements.recoveryMeta) {
            elements.recoveryMeta.textContent = state.recovery
                ? `Recovery ready for ${state.recovery.targetLabel}. Expires ${state.recovery.expiresAt}. ${state.recovery.link ? 'App link uses the configured frontend URL.' : 'Add a Frontend App URL above to generate a full handoff link.'}`
                : 'Issue a one-time recovery code for the selected shared seat.';
        }
        updateCopyButtonState();
    }

    function getDeliveryFilters() {
        return {
            deliveryType: asText(elements.deliveryTypeFilter && elements.deliveryTypeFilter.value),
            deliveryChannel: asText(elements.deliveryChannelFilter && elements.deliveryChannelFilter.value),
            acknowledgmentStatus: asText(elements.deliveryAckStatusFilter && elements.deliveryAckStatusFilter.value),
            limit: Math.max(1, Math.min(50, Number(elements.deliveryLimit && elements.deliveryLimit.value) || 12))
        };
    }

    function buildDeliveryFilterQuery() {
        const filters = getDeliveryFilters();
        const params = new URLSearchParams();
        params.set('limit', String(filters.limit));
        if (filters.deliveryType) params.set('deliveryType', filters.deliveryType);
        if (filters.deliveryChannel) params.set('deliveryChannel', filters.deliveryChannel);
        if (filters.acknowledgmentStatus) params.set('acknowledgmentStatus', filters.acknowledgmentStatus);
        return {
            filters,
            queryString: params.toString()
        };
    }

    function buildDeliveryFilterLabel(filters) {
        const parts = [
            filters && filters.deliveryType ? `type=${filters.deliveryType}` : '',
            filters && filters.deliveryChannel ? `channel=${filters.deliveryChannel}` : '',
            filters && filters.acknowledgmentStatus ? `status=${filters.acknowledgmentStatus}` : '',
            filters ? `limit=${filters.limit}` : ''
        ].filter(Boolean);
        return parts.length ? parts.join(' • ') : 'none';
    }

    function renderDeliveryTrail() {
        const summary = elements.deliveryTrailSummary;
        const list = elements.deliveryTrailList;
        if (!summary || !list) return;
        list.replaceChildren();

        if (!state.deliveryTrail.length) {
            summary.textContent = `No delivery entries matched the current filter set. Active filters: ${buildDeliveryFilterLabel(getDeliveryFilters())}.`;
            return;
        }

        summary.textContent = `Loaded ${state.deliveryTrail.length} delivery entr${state.deliveryTrail.length === 1 ? 'y' : 'ies'}. Active filters: ${buildDeliveryFilterLabel(getDeliveryFilters())}.`;
        let currentDayKey = '';
        state.deliveryTrail.forEach(entry => {
            const rawTimestamp = asText(entry.deliveredAt);
            const dayKey = rawTimestamp ? rawTimestamp.slice(0, 10) : 'Unknown day';
            if (dayKey !== currentDayKey) {
                currentDayKey = dayKey;
                const heading = document.createElement('article');
                heading.className = 'audit-item';
                const title = document.createElement('h3');
                title.textContent = `Delivery Trail: ${dayKey}`;
                heading.appendChild(title);
                list.appendChild(heading);
            }

            const item = document.createElement('article');
            item.className = 'audit-item';
            const title = document.createElement('h3');
            title.textContent = [entry.deliveryTypeLabel, entry.targetLabel, entry.deliveryChannel].filter(Boolean).join(' • ');
            item.appendChild(title);

            const recipient = document.createElement('p');
            recipient.textContent = `Recipient: ${entry.recipient || 'Not captured'} • Artifact: ${entry.artifactMode || 'signed_link'}`;
            item.appendChild(recipient);

            const actor = document.createElement('p');
            actor.textContent = `Recorded by: ${entry.actorLabel || entry.actorSeatId || 'Unknown'}${entry.deliveryRefId ? ` • Ref: ${entry.deliveryRefId}` : ''}`;
            item.appendChild(actor);

            const time = document.createElement('p');
            time.textContent = `Delivered at: ${entry.deliveredAt || 'Unknown'}`;
            item.appendChild(time);

            const status = document.createElement('p');
            status.textContent = `Acknowledgment: ${entry.acknowledgmentStatusLabel || entry.acknowledgmentStatus || 'Pending acknowledgment'}`;
            item.appendChild(status);

            if (entry.acknowledgedAt || entry.acknowledgedByLabel || entry.acknowledgmentNote) {
                const ack = document.createElement('p');
                ack.textContent = `Acknowledged by: ${entry.acknowledgedByLabel || entry.acknowledgedBySeatId || 'Unknown'}${entry.acknowledgedAt ? ` • At: ${entry.acknowledgedAt}` : ''}${entry.acknowledgmentNote ? ` • ${entry.acknowledgmentNote}` : ''}`;
                item.appendChild(ack);
            }

            if (entry.note) {
                const note = document.createElement('p');
                note.textContent = entry.note;
                item.appendChild(note);
            }

            if (entry.acknowledgmentStatus !== 'acknowledged') {
                const actionRow = document.createElement('div');
                actionRow.className = 'action-row compact';
                const ackButton = document.createElement('button');
                ackButton.type = 'button';
                ackButton.className = 'button';
                ackButton.textContent = 'Mark acknowledged';
                ackButton.addEventListener('click', async function () {
                    try {
                        await acknowledgeDelivery(entry.id);
                    } catch (error) {
                        if (error && error.status === 401 && state.sessionToken) {
                            clearLocalSession();
                            setBanner(error.message || 'The admin shell session is no longer valid. Sign in again.', 'error');
                            return;
                        }
                        setBanner(error && error.message ? error.message : 'Acknowledgment failed.', 'error');
                    }
                });
                actionRow.appendChild(ackButton);
                item.appendChild(actionRow);
            }

            list.appendChild(item);
        });
    }

    function renderDispatchPack() {
        if (elements.dispatchSubjectOutput) {
            elements.dispatchSubjectOutput.value = state.dispatchPack ? state.dispatchPack.subject : '';
        }
        if (elements.dispatchBodyOutput) {
            elements.dispatchBodyOutput.value = state.dispatchPack ? state.dispatchPack.body : '';
        }
        if (elements.dispatchMeta) {
            if (!state.dispatchPack) {
                elements.dispatchMeta.textContent = 'Issue an invite or recovery item first, then prepare a provider-ready dispatch pack using the current channel, recipient, artifact mode, and frontend app URL.';
            } else {
                const warnings = Array.isArray(state.dispatchPack.warnings) && state.dispatchPack.warnings.length
                    ? ` Warnings: ${state.dispatchPack.warnings.join(' ')}`
                    : '';
                elements.dispatchMeta.textContent = `Dispatch ready for ${state.dispatchPack.targetLabel}. Channel: ${state.dispatchPack.deliveryChannel}${state.dispatchPack.recipient ? ` • Recipient: ${state.dispatchPack.recipient}` : ''} • Artifact: ${state.dispatchPack.artifactMode} • Ref: ${state.dispatchPack.deliveryRefId}.${warnings}`;
            }
        }
        updateCopyButtonState();
    }

    function getAuditFilters() {
        return {
            category: asText(elements.auditCategoryFilter && elements.auditCategoryFilter.value),
            action: asText(elements.auditActionFilter && elements.auditActionFilter.value),
            query: asText(elements.auditQueryFilter && elements.auditQueryFilter.value)
        };
    }

    function buildAuditFilterQuery() {
        const filters = getAuditFilters();
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.action) params.set('action', filters.action);
        if (filters.query) params.set('query', filters.query);
        return {
            filters,
            queryString: params.toString()
        };
    }

    function buildAuditFilterLabel(filters) {
        const parts = [
            filters && filters.category ? `category=${filters.category}` : '',
            filters && filters.action ? `action=${filters.action}` : '',
            filters && filters.query ? `contains="${filters.query}"` : ''
        ].filter(Boolean);
        return parts.length ? parts.join(' • ') : 'none';
    }

    function renderAudit() {
        const summary = elements.auditSummary;
        const list = elements.auditList;
        if (!summary || !list) return;
        list.replaceChildren();

        if (!state.auditEntries.length) {
            const emptyFilters = buildAuditFilterLabel(getAuditFilters());
            summary.textContent = `No audit events matched the current filter set. Active filters: ${emptyFilters}.`;
            return;
        }

        const filters = buildAuditFilterLabel(getAuditFilters());
        summary.textContent = `Loaded ${state.auditEntries.length} event${state.auditEntries.length === 1 ? '' : 's'} in the current timeline view. Active filters: ${filters}.`;
        let currentDayKey = '';
        state.auditEntries.forEach(entry => {
            const rawTimestamp = asText(entry.timestamp);
            const dayKey = rawTimestamp ? rawTimestamp.slice(0, 10) : 'Unknown day';
            if (dayKey !== currentDayKey) {
                currentDayKey = dayKey;
                const dayHeading = document.createElement('article');
                dayHeading.className = 'audit-item';
                const title = document.createElement('h3');
                title.textContent = `Timeline: ${dayKey}`;
                dayHeading.appendChild(title);
                list.appendChild(dayHeading);
            }

            const item = document.createElement('article');
            item.className = 'audit-item';
            const title = document.createElement('h3');
            title.textContent = [entry.category, entry.action, entry.targetLabel].filter(Boolean).join(' • ');
            item.appendChild(title);

            const actor = document.createElement('p');
            actor.textContent = `Actor: ${entry.actorLabel || 'Unknown'}${entry.deviceLabel ? ` • Device: ${entry.deviceLabel}` : ''}`;
            item.appendChild(actor);

            const time = document.createElement('p');
            time.textContent = `Timestamp: ${entry.timestamp || 'Unknown'}`;
            item.appendChild(time);

            if (entry.note) {
                const note = document.createElement('p');
                note.textContent = entry.note;
                item.appendChild(note);
            }

            list.appendChild(item);
        });
    }

    function requireValue(value, message) {
        if (!asText(value)) {
            throw new Error(message);
        }
    }

    function requireSelectedSeat() {
        const selected = getSelectedSeat();
        if (!selected) {
            throw new Error('Select a shared seat first.');
        }
        return selected;
    }

    function requireUnlockedShell(actionLabel) {
        if (!isShellUnlocked()) {
            throw new Error(`${actionLabel} requires an unlocked admin shell. Issue a short-lived seat session first.`);
        }
    }

    async function loadPosture() {
        const posture = await requestJson('/api/admin/posture', {
            omitApiKey: true,
            omitSessionToken: true
        });
        state.posture = posture;
        renderPosture();
        setBanner('Backend posture loaded. Prefer a short-lived seat session over API bootstrap for ongoing admin work.', posture.warnings && posture.warnings.length ? 'warn' : 'info');
    }

    async function loadAdminSessionContext() {
        const runtime = readRuntime();
        requireValue(state.sessionToken, 'Issue a short-lived seat session first.');
        requireValue(runtime.installationKey, 'Add the installation key first.');

        const context = await requestJson(`/api/admin/session-context?installationKey=${encodeURIComponent(runtime.installationKey)}`, {
            omitApiKey: true
        });
        state.adminContext = context;
        state.sessionAuthMode = asText(context.authMode) || state.sessionAuthMode;
        state.sessionIssuedAt = asText(context.issuedAt) || state.sessionIssuedAt;
        state.sessionExpiresAt = asText(context.expiresAt) || state.sessionExpiresAt;
        state.sessionActorLabel = asText(context.actorLabel) || state.sessionActorLabel;
        state.sessionActorSeatId = asText(context.actorSeatId) || state.sessionActorSeatId;
        if (elements.actorSeatId && !elements.actorSeatId.value) {
            elements.actorSeatId.value = state.sessionActorSeatId;
        }
        renderSessionSummary();
        renderAdminShell();
        return context;
    }

    async function issueSession() {
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add an installation key first.');
        requireValue(runtime.actorSeatId, 'Add the admin seat ID first.');
        if (!runtime.actorSeatCode && !runtime.apiKey) {
            throw new Error('Provide a seat access code or backend API key before issuing a session.');
        }

        const body = {
            installationKey: runtime.installationKey,
            actorSeatId: runtime.actorSeatId,
            actorSeatCode: runtime.actorSeatCode,
            deviceLabel: runtime.deviceLabel
        };
        const result = await requestJson('/api/seat-session/issue', {
            method: 'POST',
            body,
            preferApiKey: !runtime.actorSeatCode
        });

        state.sessionToken = asText(result.sessionToken);
        state.sessionIssuedAt = asText(result.issuedAt);
        state.sessionExpiresAt = asText(result.expiresAt);
        state.sessionAuthMode = asText(result.authMode);
        state.sessionActorLabel = asText(result.actorLabel);
        state.sessionActorSeatId = asText(result.actorSeatId);
        if (elements.actorSeatId && !elements.actorSeatId.value) {
            elements.actorSeatId.value = state.sessionActorSeatId;
        }
        renderSessionSummary();
        await loadAdminSessionContext();
        setBanner(result.message || 'Short-lived seat session issued.', result.authMode === 'api_key' ? 'warn' : 'info');
    }

    async function renewSession() {
        const runtime = readRuntime();
        requireValue(state.sessionToken, 'Issue a short-lived seat session first.');
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const result = await requestJson('/api/seat-session/renew', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                deviceLabel: runtime.deviceLabel
            }
        });
        state.sessionToken = asText(result.sessionToken);
        state.sessionIssuedAt = asText(result.issuedAt);
        state.sessionExpiresAt = asText(result.expiresAt);
        state.sessionAuthMode = asText(result.authMode);
        state.sessionActorLabel = asText(result.actorLabel);
        state.sessionActorSeatId = asText(result.actorSeatId);
        renderSessionSummary();
        await loadAdminSessionContext();
        setBanner(result.message || 'Seat session renewed.', 'info');
    }

    async function revokeSession() {
        const runtime = readRuntime();
        requireValue(state.sessionToken, 'Issue a short-lived seat session first.');
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const result = await requestJson('/api/seat-session/revoke', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                deviceLabel: runtime.deviceLabel
            }
        });
        clearLocalSession();
        setBanner(result.message || 'Seat session revoked.', 'warn');
    }

    async function loadSeats() {
        requireUnlockedShell('Load seats');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        requireValue(runtime.actorSeatId || state.sessionActorSeatId, 'Add the admin seat ID first.');
        const actorSeatId = runtime.actorSeatId || state.sessionActorSeatId;
        const result = await requestJson(`/api/team-seats?installationKey=${encodeURIComponent(runtime.installationKey)}&actorSeatId=${encodeURIComponent(actorSeatId)}`);
        state.seats = Array.isArray(result.seats) ? result.seats : [];
        if (!state.selectedSeatId || !state.seats.some(seat => seat.id === state.selectedSeatId)) {
            state.selectedSeatId = state.seats[0] ? state.seats[0].id : '';
        }
        renderSeatTable();
        renderSeatSummary();
        renderApprovalSummary();
        clearIssuedOutputs();
        setBanner(`Loaded ${result.seatCount || state.seats.length} shared seat${(result.seatCount || state.seats.length) === 1 ? '' : 's'}.`, 'info');
    }

    async function loadApprovals(options) {
        requireUnlockedShell('Approval queue refresh');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const status = asText(elements.approvalStatusFilter && elements.approvalStatusFilter.value) || 'open';
        const result = await requestJson(`/api/admin/action-approvals?installationKey=${encodeURIComponent(runtime.installationKey)}&status=${encodeURIComponent(status)}`, {
            omitApiKey: true
        });
        state.approvals = Array.isArray(result.approvals) ? result.approvals : [];
        if (!state.selectedApprovalId || !state.approvals.some(approval => approval.id === state.selectedApprovalId)) {
            state.selectedApprovalId = state.approvals[0] ? state.approvals[0].id : '';
        }
        renderApprovalTable();
        renderApprovalSummary();
        if (!(options && options.silent)) {
            setBanner(`Loaded ${result.approvalCount || state.approvals.length} admin approval request${(result.approvalCount || state.approvals.length) === 1 ? '' : 's'} from the ${status} queue.`, 'info');
        }
        return result;
    }

    async function requestApproval() {
        requireUnlockedShell('Approval request');
        const runtime = readRuntime();
        const targetSeat = requireSelectedSeat();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const recoveryAction = asText(elements.approvalRecoveryAction && elements.approvalRecoveryAction.value);
        requireValue(recoveryAction, 'Choose the high-risk action first.');
        const result = await requestJson('/api/admin/action-approvals/request', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                actionType: 'team_seat_recovery',
                recoveryAction,
                targetSeatId: targetSeat.id,
                note: asText(elements.approvalReviewNote && elements.approvalReviewNote.value)
            },
            omitApiKey: true
        });
        const approvalId = asText(result.approval && result.approval.id);
        await loadApprovals({ silent: true });
        if (approvalId) {
            state.selectedApprovalId = approvalId;
            renderApprovalTable();
            renderApprovalSummary();
        }
        setBanner(result.message || `Queued ${recoveryAction} for approval review.`, 'info');
    }

    async function reviewSelectedApproval(decision) {
        requireUnlockedShell('Approval review');
        const runtime = readRuntime();
        const approval = getSelectedApproval();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        if (!approval) {
            throw new Error('Select an approval request first.');
        }
        const result = await requestJson('/api/admin/action-approvals/review', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                approvalId: approval.id,
                decision,
                note: asText(elements.approvalReviewNote && elements.approvalReviewNote.value)
            },
            omitApiKey: true
        });
        const approvalId = asText(result.approval && result.approval.id) || approval.id;
        await loadApprovals({ silent: true });
        state.selectedApprovalId = approvalId;
        renderApprovalTable();
        renderApprovalSummary();
        setBanner(result.message || `${decision === 'approve' ? 'Approved' : 'Rejected'} the selected high-risk action.`, decision === 'approve' ? 'info' : 'warn');
    }

    async function issueInvite() {
        requireUnlockedShell('Seat invite issue');
        const runtime = readRuntime();
        const targetSeat = requireSelectedSeat();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        requireValue(runtime.actorSeatId || state.sessionActorSeatId, 'Add the admin seat ID first.');
        const actorSeatId = runtime.actorSeatId || state.sessionActorSeatId;
        const result = await requestJson('/api/team-seats/invite/issue', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                actorSeatId,
                targetSeatId: targetSeat.id,
                note: asText(elements.inviteNote && elements.inviteNote.value),
                deviceLabel: runtime.deviceLabel
            }
        });
        state.invite = {
            code: asText(result.inviteCode),
            link: buildActionLink('pvSeatInviteToken', result.inviteLinkToken),
            linkToken: asText(result.inviteLinkToken),
            deliveryRefId: asText(result.deliveryRefId),
            targetSeatId: targetSeat.id,
            targetLabel: asText(result.targetLabel) || targetSeat.label,
            expiresAt: asText(result.expiresAt)
        };
        state.dispatchPack = null;
        renderInviteOutput();
        renderDispatchPack();
        setBanner(result.message || `Issued one-time seat invite for ${targetSeat.label}.`, 'info');
    }

    async function issueRecovery() {
        requireUnlockedShell('Recovery issue');
        const runtime = readRuntime();
        const targetSeat = requireSelectedSeat();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        requireValue(runtime.actorSeatId || state.sessionActorSeatId, 'Add the admin seat ID first.');
        const actorSeatId = runtime.actorSeatId || state.sessionActorSeatId;
        const result = await requestJson('/api/team-seats/recovery-code/issue', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                actorSeatId,
                targetSeatId: targetSeat.id,
                note: asText(elements.recoveryNote && elements.recoveryNote.value),
                deviceLabel: runtime.deviceLabel
            }
        });
        state.recovery = {
            code: asText(result.recoveryCode),
            link: buildActionLink('pvSeatRecoveryToken', result.recoveryLinkToken),
            linkToken: asText(result.recoveryLinkToken),
            deliveryRefId: asText(result.deliveryRefId),
            targetSeatId: targetSeat.id,
            targetLabel: asText(result.targetLabel) || targetSeat.label,
            expiresAt: asText(result.expiresAt)
        };
        state.dispatchPack = null;
        renderRecoveryOutput();
        renderDispatchPack();
        setBanner(result.message || `Issued one-time recovery code for ${targetSeat.label}.`, 'info');
    }

    async function loadDeliveryTrail(options) {
        requireUnlockedShell('Delivery trail refresh');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const query = buildDeliveryFilterQuery().queryString;
        const result = await requestJson(`/api/admin/delivery-trail?installationKey=${encodeURIComponent(runtime.installationKey)}${query ? `&${query}` : ''}`, {
            omitApiKey: true
        });
        state.deliveryTrail = Array.isArray(result.entries) ? result.entries : [];
        renderDeliveryTrail();
        if (!(options && options.silent)) {
            setBanner(`Loaded ${result.entryCount || state.deliveryTrail.length} delivery entr${(result.entryCount || state.deliveryTrail.length) === 1 ? 'y' : 'ies'} from the server trail.`, 'info');
        }
        return result;
    }

    async function recordDelivery(deliveryType) {
        requireUnlockedShell('Delivery recording');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const issued = deliveryType === 'seat_invite' ? state.invite : state.recovery;
        const deliveryLabel = deliveryType === 'seat_invite' ? 'seat invite' : 'seat recovery';
        if (!issued || !issued.targetSeatId || !issued.deliveryRefId) {
            throw new Error(`Issue a ${deliveryLabel} first so the server-side delivery reference exists.`);
        }

        const result = await requestJson('/api/admin/delivery-trail/record', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                deliveryType,
                targetSeatId: issued.targetSeatId,
                deliveryChannel: asText(elements.deliveryChannel && elements.deliveryChannel.value) || 'secure_chat',
                recipient: asText(elements.deliveryRecipient && elements.deliveryRecipient.value),
                artifactMode: asText(elements.deliveryArtifactMode && elements.deliveryArtifactMode.value) || 'signed_link',
                deliveryRefId: issued.deliveryRefId,
                note: asText(elements.deliveryNote && elements.deliveryNote.value)
            },
            omitApiKey: true
        });
        await loadDeliveryTrail({ silent: true });
        setBanner(result.message || `Recorded ${deliveryLabel} delivery.`, 'info');
    }

    async function acknowledgeDelivery(entryId) {
        requireUnlockedShell('Delivery acknowledgment');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        requireValue(entryId, 'Select a delivery entry first.');

        const result = await requestJson('/api/admin/delivery-trail/acknowledge', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                entryId,
                acknowledgmentNote: asText(elements.deliveryAckNote && elements.deliveryAckNote.value)
            },
            omitApiKey: true
        });
        await loadDeliveryTrail({ silent: true });
        setBanner(result.message || 'Acknowledged the selected delivery entry.', 'info');
        return result;
    }

    async function prepareDispatch(deliveryType) {
        requireUnlockedShell('Dispatch pack preparation');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const issued = deliveryType === 'seat_invite' ? state.invite : state.recovery;
        const deliveryLabel = deliveryType === 'seat_invite' ? 'seat invite' : 'seat recovery';
        if (!issued || !issued.targetSeatId || !issued.deliveryRefId) {
            throw new Error(`Issue a ${deliveryLabel} first so a dispatch pack can be prepared from the active backend issue record.`);
        }

        const result = await requestJson('/api/admin/delivery-dispatch/prepare', {
            method: 'POST',
            body: {
                installationKey: runtime.installationKey,
                deliveryType,
                targetSeatId: issued.targetSeatId,
                deliveryRefId: issued.deliveryRefId,
                deliveryChannel: asText(elements.deliveryChannel && elements.deliveryChannel.value) || 'secure_chat',
                recipient: asText(elements.deliveryRecipient && elements.deliveryRecipient.value),
                artifactMode: asText(elements.deliveryArtifactMode && elements.deliveryArtifactMode.value) || 'signed_link',
                note: asText(elements.deliveryNote && elements.deliveryNote.value),
                oneTimeCode: issued.code,
                signedLinkToken: issued.linkToken,
                frontendAppUrl: runtime.frontendAppUrl
            },
            omitApiKey: true
        });
        state.dispatchPack = result.dispatch || null;
        renderDispatchPack();
        setBanner(result.message || `Prepared ${deliveryLabel} dispatch pack.`, 'info');
    }

    async function pullAudit() {
        requireUnlockedShell('Audit pull');
        const runtime = readRuntime();
        requireValue(runtime.installationKey, 'Add the installation key first.');
        requireValue(runtime.actorSeatId || state.sessionActorSeatId, 'Add the admin seat ID first.');
        const actorSeatId = runtime.actorSeatId || state.sessionActorSeatId;
        const limit = Math.max(1, Math.min(50, Number(elements.auditLimit && elements.auditLimit.value) || 12));
        const filterQuery = buildAuditFilterQuery().queryString;
        const result = await requestJson(`/api/audit-log?installationKey=${encodeURIComponent(runtime.installationKey)}&actorSeatId=${encodeURIComponent(actorSeatId)}&limit=${limit}${filterQuery ? `&${filterQuery}` : ''}`);
        state.auditEntries = Array.isArray(result.entries) ? result.entries : [];
        renderAudit();
        setBanner(`Loaded ${state.auditEntries.length} backend audit event${state.auditEntries.length === 1 ? '' : 's'} from the filtered timeline.`, 'info');
    }

    async function copyText(text, emptyMessage) {
        if (!asText(text)) {
            throw new Error(emptyMessage);
        }
        await navigator.clipboard.writeText(text);
    }

    function downloadTextFile(filename, text, mimeType) {
        const blob = new Blob([text], { type: mimeType || 'text/plain;charset=utf-8' });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () {
            URL.revokeObjectURL(objectUrl);
        }, 0);
    }

    function getAuditExportPath(format) {
        const runtime = readRuntime();
        requireUnlockedShell('Audit export');
        requireValue(runtime.installationKey, 'Add the installation key first.');
        const limit = Math.max(1, Math.min(50, Number(elements.auditLimit && elements.auditLimit.value) || 12));
        const filterQuery = buildAuditFilterQuery().queryString;
        return `/api/admin/audit-export?installationKey=${encodeURIComponent(runtime.installationKey)}&format=${encodeURIComponent(format)}&limit=${limit}${filterQuery ? `&${filterQuery}` : ''}`;
    }

    async function copyAuditSnapshot() {
        const result = await requestText(getAuditExportPath('txt'), {
            omitApiKey: true
        });
        await copyText(result.text, 'Pull audit first.');
        setBanner('Copied the server-side audit snapshot.', 'info');
    }

    async function downloadAuditSnapshot(format) {
        const runtime = readRuntime();
        const result = await requestText(getAuditExportPath(format), {
            omitApiKey: true
        });
        const baseName = `${(runtime.installationKey || 'installation').replace(/[^A-Za-z0-9_-]+/g, '_') || 'installation'}_admin_audit_snapshot`;
        const extension = format === 'csv' ? 'csv' : 'txt';
        const mimeType = format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
        downloadTextFile(`${baseName}.${extension}`, result.text, mimeType);
        setBanner(`Downloaded the ${format.toUpperCase()} audit snapshot.`, 'info');
    }

    function bindButton(id, handler) {
        const node = byId(id);
        if (!node) return;
        node.addEventListener('click', async function () {
            try {
                await handler();
            } catch (error) {
                if (error && error.status === 401 && state.sessionToken) {
                    clearLocalSession();
                    setBanner(error.message || 'The admin shell session is no longer valid. Sign in again.', 'error');
                    return;
                }
                setBanner(error && error.message ? error.message : 'Action failed.', 'error');
            }
        });
    }

    function bindCopyButtons() {
        bindButton('copyInviteCodeBtn', async function () {
            await copyText(state.invite && state.invite.code, 'Issue a seat invite first.');
            setBanner('Copied the one-time seat invite code.', 'info');
        });
        bindButton('copyInviteLinkBtn', async function () {
            await copyText(state.invite && state.invite.link, 'Add a Frontend App URL and issue a seat invite first.');
            setBanner('Copied the signed seat-invite app link.', 'info');
        });
        bindButton('copyRecoveryCodeBtn', async function () {
            await copyText(state.recovery && state.recovery.code, 'Issue a recovery code first.');
            setBanner('Copied the one-time recovery code.', 'info');
        });
        bindButton('copyRecoveryLinkBtn', async function () {
            await copyText(state.recovery && state.recovery.link, 'Add a Frontend App URL and issue a recovery code first.');
            setBanner('Copied the signed recovery app link.', 'info');
        });
    }

    function boot() {
        collectElements();
        renderPosture();
        renderSessionSummary();
        renderAdminShell();
        renderSeatTable();
        renderSeatSummary();
        renderApprovalTable();
        renderApprovalSummary();
        renderInviteOutput();
        renderRecoveryOutput();
        renderDeliveryTrail();
        renderDispatchPack();
        renderAudit();
        updateCopyButtonState();

        bindButton('refreshPostureBtn', loadPosture);
        bindButton('refreshShellBtn', async function () {
            await loadAdminSessionContext();
            setBanner('Admin shell context refreshed from the active seat session.', 'info');
        });
        bindButton('issueSessionBtn', issueSession);
        bindButton('renewSessionBtn', renewSession);
        bindButton('revokeSessionBtn', revokeSession);
        bindButton('clearSessionBtn', async function () {
            clearLocalSession();
            setBanner('Cleared the local in-memory session. The backend session itself remains valid until expiry or revoke.', 'warn');
        });
        bindButton('loadSeatsBtn', loadSeats);
        bindButton('loadApprovalsBtn', loadApprovals);
        bindButton('requestApprovalBtn', requestApproval);
        bindButton('approveSelectedApprovalBtn', async function () {
            await reviewSelectedApproval('approve');
        });
        bindButton('rejectSelectedApprovalBtn', async function () {
            await reviewSelectedApproval('reject');
        });
        bindButton('loadDeliveryTrailBtn', loadDeliveryTrail);
        bindButton('recordInviteDeliveryBtn', async function () {
            await recordDelivery('seat_invite');
        });
        bindButton('recordRecoveryDeliveryBtn', async function () {
            await recordDelivery('seat_recovery');
        });
        bindButton('prepareInviteDispatchBtn', async function () {
            await prepareDispatch('seat_invite');
        });
        bindButton('prepareRecoveryDispatchBtn', async function () {
            await prepareDispatch('seat_recovery');
        });
        bindButton('pullAuditBtn', pullAudit);
        bindButton('issueInviteBtn', issueInvite);
        bindButton('issueRecoveryBtn', issueRecovery);
        bindButton('copyAuditSnapshotBtn', copyAuditSnapshot);
        bindButton('downloadAuditTxtBtn', async function () {
            await downloadAuditSnapshot('txt');
        });
        bindButton('downloadAuditCsvBtn', async function () {
            await downloadAuditSnapshot('csv');
        });
        bindCopyButtons();
        bindButton('copyDispatchSubjectBtn', async function () {
            await copyText(state.dispatchPack && state.dispatchPack.subject, 'Prepare a dispatch pack first.');
            setBanner('Copied the dispatch subject.', 'info');
        });
        bindButton('copyDispatchBodyBtn', async function () {
            await copyText(state.dispatchPack && state.dispatchPack.text, 'Prepare a dispatch pack first.');
            setBanner('Copied the dispatch pack text.', 'info');
        });
        bindButton('downloadDispatchTxtBtn', async function () {
            if (!state.dispatchPack || !state.dispatchPack.text) {
                throw new Error('Prepare a dispatch pack first.');
            }
            const runtime = readRuntime();
            const baseName = `${(runtime.installationKey || 'installation').replace(/[^A-Za-z0-9_-]+/g, '_') || 'installation'}_${(state.dispatchPack.deliveryType || 'dispatch').replace(/[^A-Za-z0-9_-]+/g, '_')}_dispatch_pack`;
            downloadTextFile(`${baseName}.txt`, state.dispatchPack.text, 'text/plain;charset=utf-8');
            setBanner('Downloaded the dispatch pack TXT.', 'info');
        });

        loadPosture().catch(error => {
            setBanner(error && error.message ? error.message : 'Could not load backend posture.', 'error');
        });
    }

    document.addEventListener('DOMContentLoaded', boot);
}());
