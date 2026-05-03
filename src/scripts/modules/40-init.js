// Inline event handlers in the generated HTML expect a window-global controller.
window.PVCalculator = PVCalculator;

/**
 * initFieldHelpPopovers — P2/P9 completion pass
 *
 * Auto-wires all .field-help-wrap elements with:
 *   - Unique id on each .field-help panel
 *   - aria-describedby on the .field-help-icon linking to the panel
 *   - native button semantics with aria-expanded and aria-label on the icon
 *   - aria-hidden on the panel (toggled on open/close)
 *   - role="tooltip" on the panel
 *   - Click/tap toggle that persists the panel open (touch-device support)
 *   - Escape key and outside-click to close
 *   - One-at-a-time: opening one closes all others
 *
 * This runs once at DOMContentLoaded on the semantic help-button markup.
 */
function initFieldHelpPopovers() {
    const wraps = document.querySelectorAll('.field-help-wrap');
    let counter = 0;

    function closeAll(except) {
        document.querySelectorAll('.field-help--open').forEach(panel => {
            if (panel === except) return;
            panel.classList.remove('field-help--open');
            panel.setAttribute('aria-hidden', 'true');
            const wrap = panel.closest('.field-help-wrap');
            if (wrap) {
                const icon = wrap.querySelector('.field-help-icon');
                if (icon) icon.setAttribute('aria-expanded', 'false');
            }
        });
    }

    wraps.forEach(wrap => {
        const icon = wrap.querySelector('.field-help-icon');
        const panel = wrap.querySelector('.field-help');
        if (!icon || !panel) return;

        // Skip always-visible panels — they need no toggle
        if (panel.classList.contains('always-visible')) return;

        // Assign unique id and ARIA roles
        const panelId = `fhp-${++counter}`;
        panel.id = panelId;
        panel.setAttribute('role', 'tooltip');
        panel.setAttribute('aria-hidden', 'true');

        // Wire the icon. Native buttons keep cleaner semantics than span[role="button"].
        if (icon.tagName === 'BUTTON' && !icon.getAttribute('type')) {
            icon.setAttribute('type', 'button');
        }
        if (icon.tagName !== 'BUTTON') {
            icon.setAttribute('role', 'button');
            if (!icon.hasAttribute('tabindex')) icon.setAttribute('tabindex', '0');
        }
        icon.setAttribute('aria-expanded', 'false');
        icon.setAttribute('aria-controls', panelId);
        icon.setAttribute('aria-describedby', panelId);

        // aria-label: "Help: <text>" so screen readers announce on focus
        // (fallback for AT that don't read aria-describedby on display:none)
        const helpText = panel.textContent.trim();
        if (helpText) {
            icon.setAttribute('aria-label', `Help: ${helpText}`);
        }

        function openPanel() {
            closeAll(panel);
            panel.classList.add('field-help--open');
            panel.setAttribute('aria-hidden', 'false');
            icon.setAttribute('aria-expanded', 'true');
        }

        function closePanel() {
            panel.classList.remove('field-help--open');
            panel.setAttribute('aria-hidden', 'true');
            icon.setAttribute('aria-expanded', 'false');
        }

        // Click/tap toggle
        icon.addEventListener('click', e => {
            e.stopPropagation();
            panel.classList.contains('field-help--open') ? closePanel() : openPanel();
        });

        // Native buttons already dispatch click on Enter/Space. Keep Escape support for all icons.
        icon.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closePanel();
                icon.focus();
            } else if (icon.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                panel.classList.contains('field-help--open') ? closePanel() : openPanel();
            }
        });
    });

    // Global outside-click closes all open panels
    document.addEventListener('click', () => closeAll(null));

    // Global Escape closes all open panels
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAll(null);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Populate location dropdown from REGION_PROFILES
    const locationSelect = document.getElementById('location');
    if (locationSelect) {
        locationSelect.innerHTML = '';
        const regions = {};
        for (const [key, profile] of Object.entries(DEFAULTS.REGION_PROFILES)) {
            const regionName = profile.region || 'global';
            if (!regions[regionName]) regions[regionName] = [];
            regions[regionName].push({ key, name: profile.name });
        }
        const regionLabels = {
            africa: 'Africa', americas: 'Americas', europe: 'Europe',
            asia: 'Asia', oceania: 'Oceania', global: 'Custom'
        };
        for (const [region, entries] of Object.entries(regions)) {
            const group = document.createElement('optgroup');
            group.label = regionLabels[region] || region;
            for (const entry of entries) {
                const opt = document.createElement('option');
                opt.value = entry.key;
                opt.textContent = entry.name;
                group.appendChild(opt);
            }
            locationSelect.appendChild(group);
        }
    }

    PVCalculator.initTheme();
    PVCalculator.populateSupplierPricePackOptions();
    PVCalculator.populateSupplierQuoteStatusOptions();
    PVCalculator.populateCommercialPresetOptions();
    PVCalculator.populateBusinessContextOptions();
    PVCalculator.populateOperationalModelOptions();
    PVCalculator.populateCommercialArchitectureOptions();
    PVCalculator.populatePlantScopingOptions();
    PVCalculator.populateUtilityEngineeringOptions();
    PVCalculator.populateBusinessMachineOptions();
    PVCalculator.applyLocationDefaults();
    PVCalculator.initializeProposalContextDefaults();
    PVCalculator.updateLoadTypeDefaults();
    PVCalculator.updateAppliancePhaseAssignmentUI();
    PVCalculator.updateThreePhaseClusterUI();
    PVCalculator.validatePanelSpecs();
    PVCalculator.onSystemTypeChange();
    PVCalculator.onBatteryChemistryChange();
    PVCalculator.updateAudienceMode();
    PVCalculator.migrateLegacyProjectStorage();
    PVCalculator.renderSavedProjects();
    PVCalculator.populateProjectTemplateOptions();
    PVCalculator.populateEquipmentLibraryOptions();
    PVCalculator.initializeInputSectionFlow();
    PVCalculator.renderSupplierQuoteFreshnessPreview();
    PVCalculator.renderSupplierRefreshRequestPreview();
    PVCalculator.renderSupplierQuoteImportPreview();
    PVCalculator.populateTeamWorkflowOptions();
    PVCalculator.populateTeamSeatRoleOptions();
    PVCalculator.populateTeamSeatStateOptions();
    PVCalculator.populateTeamSeatOptions();
    PVCalculator.populateTeamSeatRecoveryActionOptions();
    PVCalculator.populateTeamSeatRecoveryTargetOptions();
    PVCalculator.populateTeamRosterRoleOptions();
    PVCalculator.populateTeamRosterOptions();
    PVCalculator.populateTeamAdminInputs({ preserveExisting: false });
    PVCalculator.populateProposalProfileOptions();
    PVCalculator.populateProposalReleaseStateOptions();
    PVCalculator.populateProposalReleaseTemplateOptions();
    PVCalculator.populateBackendRuntimeInputs();
    PVCalculator.renderPremiumEntitlementPreview();
    PVCalculator.renderBackendRuntimePreview();
    PVCalculator.renderBackendSessionPreview();
    PVCalculator.renderBackendRecoveryPreview();
    PVCalculator.renderBackendSeatInvitePreview();
    PVCalculator.renderBackendAuditPreview();
    PVCalculator.renderTeamSeatPreview();
    PVCalculator.renderTeamSeatRecoveryPreview();
    PVCalculator.renderTeamRosterPreview();
    PVCalculator.renderTeamWorkflowPreview();
    PVCalculator.renderTeamWorkflowSyncPreview();
    PVCalculator.renderProposalProfilePreview();
    PVCalculator.renderProposalProfileSyncPreview();
    PVCalculator.renderProposalReleaseTemplatePreview();
    PVCalculator.renderProposalReleasePreview();
    PVCalculator.renderProposalBrandPackPreview();
    PVCalculator.restoreWorkspaceSession();
    PVCalculator.importBackendActionLinksFromLocation({ silent: true });
    PVCalculator.checkAutoSave();
    PVCalculator.initSectionNav();
    PVCalculator.updateReadinessGuide();
    PVCalculator.updateCardStatus();
    PVCalculator.initRateBadges();
    initFieldHelpPopovers();

    // Add input validation listeners for real-time feedback
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('input', function() {
            const min = parseFloat(this.min);
            const max = parseFloat(this.max);
            const val = parseFloat(this.value);

            if (this.value === '' || isNaN(val)) {
                this.classList.remove('valid', 'invalid');
                return;
            }

            if (!isNaN(min) && val < min) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else if (!isNaN(max) && val > max) {
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else {
                this.classList.add('valid');
                this.classList.remove('invalid');
            }
        });
    });

    const autosaveControls = document.querySelectorAll('input, select, textarea');
    autosaveControls.forEach(control => {
        if (control.id === 'projectImportInput' || control.id === 'supplierQuoteImportFile') return;
        control.addEventListener('change', () => PVCalculator.saveToLocalStorageAuto());
        control.addEventListener('focus', () => PVCalculator.setWorkflowGuideFocus(control.id, 'field'));
        if (control.tagName !== 'SELECT' && control.type !== 'checkbox') {
            control.addEventListener('input', () => PVCalculator.saveToLocalStorageAuto());
        }
    });

    window.addEventListener('hashchange', () => {
        PVCalculator.importBackendActionLinksFromLocation();
    });
});
