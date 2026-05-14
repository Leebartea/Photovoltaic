# Start Here For Users And Maintainers

This is the best first document for someone who does not yet know the bot, the repo, or the UI.

Use it before diving into the more specialized guides.

## What This Product Is

This bot is an offline-first PV sizing, proposal, and engineering-handoff tool.

It supports:

- residential backup
- retail / POS
- tailoring and garment work
- bakery
- filling station
- cold room
- workshop and mini-factory
- captive business-site plant handoff
- bounded utility / mini-grid engineering preparation

It is not just a panel calculator.

It also covers:

- batteries
- inverter / cluster sizing
- phase balance
- board strategy
- feeder lanes
- breaker / cable review
- commercial pricing and presets
- proposal framing
- packet / study / commissioning handoff

## If You Are A New User

Choose the surface that matches your role:

### Client / sales-facing use

Read in this order:

1. `Helpful Md/CLIENT_UI_GUIDE.md`
2. `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md`
3. `Helpful Md/INSTALLER_CLIENT_SCENARIO_PLAYBOOK.md`

Use:

- `Client Estimate` mode
- templates and scenario playbook
- `System Summary`
- `Executive Snapshot`
- `Commercial Estimate`

Avoid:

- treating every advanced engineering control as something the client must fill manually

### Installer / engineer use

Read in this order:

1. `Helpful Md/INSTALLER_UI_GUIDE.md`
2. `Helpful Md/INSTALLER_CLIENT_SCENARIO_PLAYBOOK.md`
3. `Helpful Md/FORMULAS_AND_FACTORS.md`
4. `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md`

Use:

- `Installer Design` mode
- business profile / operating intent / continuity
- equipment references
- load roles and phase assignment
- commercial architecture and plant outputs

### Plant or utility-adjacent jobs

Read in this order:

1. `Helpful Md/PLANT_SCOPING_AND_MINIGRID_BOUNDARY.md`
2. `Helpful Md/PLANT_ENGINEERING_SURFACE_GUIDE.md`
3. `Helpful Md/UTILITY_ENGINEERING_INPUTS_GUIDE.md`
4. `Helpful Md/UTILITY_DELIVERABLE_STATUS_GUIDE.md`
5. `Helpful Md/UTILITY_PACKET_ROUTING_GUIDE.md`
6. `Helpful Md/UTILITY_INTERCONNECTION_PACKET_GUIDE.md`
7. `Helpful Md/PLANT_STUDY_INPUTS_AND_COMMISSIONING_GUIDE.md`
8. `Helpful Md/PLANT_STUDY_DATA_SHEET_GUIDE.md`
9. `Helpful Md/FORMAL_STUDY_SCOPE_REQUIRED_GUIDE.md`
10. `Helpful Md/FORMAL_STUDY_WORK_PACK_GUIDE.md`
11. `Helpful Md/FORMAL_STUDY_DATA_SHEET_GUIDE.md`
12. `Helpful Md/FORMAL_STUDY_INTAKE_CHECKLIST_GUIDE.md`
13. `Helpful Md/FORMAL_STUDY_SCREENING_SNAPSHOT_GUIDE.md`
14. `Helpful Md/UTILITY_STUDY_TRACK_GUIDE.md`
15. `Helpful Md/UTILITY_RELAY_TRANSFER_AND_FAULT_BASIS_GUIDE.md`
16. `Helpful Md/UTILITY_PROTECTION_FAULT_SCREENING_GUIDE.md`

Use:

- plant scoping
- working surface conclusion
- feeder brief
- board / source schedule
- procurement / breaker / cable review
- formal study screening snapshot
- packet / study / commissioning exports

Do not treat this as a final feeder-study or utility-interconnection calculation package unless the separate utility lane clearly says so.

## If You Are A New Maintainer

Read in this order:

1. `README.md`
2. `Helpful Md/FREE_STATIC_HOSTING_QUICKSTART.md`
3. `Helpful Md/GITHUB_PAGES_PUBLISH_CHECKLIST.md`
4. `Helpful Md/HOSTING_RECOMMENDATION_AND_REMOTE_DEPLOYMENT_GUIDE.md`
5. `Helpful Md/DEPLOYMENT_ARTIFACTS_AND_RUNTIME.md`
6. `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`
7. `Helpful Md/DEPLOYMENT_TEMPLATES_AND_PROVIDER_SETUP_GUIDE.md`
8. `Helpful Md/ORACLE_CLOUD_ALWAYS_FREE_BACKEND_GUIDE.md`
9. `Helpful Md/SCALABLE_ARCHITECTURE.md`
10. `Helpful Md/TYPESCRIPT_ADOPTION_PLAN.md`
11. `Helpful Md/PRODUCT_STATUS_SCORECARD.md`
12. `Helpful Md/PREMIUM_CAPABILITY_ROADMAP.md`
13. `Helpful Md/PREMIUM_V1_CLOSEOUT_CHECKLIST.md`
14. `Helpful Md/ENTITLEMENT_SOURCE_OF_TRUTH_GUIDE.md`
15. `Helpful Md/OWNER_ADMIN_PREMIUM_ACCESS_POLICY.md`
16. `Helpful Md/PREMIUM_ENTITLEMENT_FOUNDATION_GUIDE.md`
17. `Helpful Md/OPTIONAL_BACKEND_FOUNDATION_GUIDE.md`
18. `Helpful Md/BACKEND_SQLITE_STORAGE_GUIDE.md`
19. `Helpful Md/BACKEND_BACKUP_AND_RESTORE_GUIDE.md`
20. `Helpful Md/BACKEND_BACKUP_RETENTION_AND_SCHEDULING_GUIDE.md`
21. `Helpful Md/PREMIUM_OPERATIONS_OWNERSHIP_AND_READINESS_GUIDE.md`
22. `Helpful Md/BACKEND_SECURITY_AND_AUDIT_GUIDE.md`
23. `Helpful Md/BACKEND_ADMIN_CONSOLE_GUIDE.md`
24. `Helpful Md/BACKEND_DELIVERY_TRAIL_GUIDE.md`
25. `Helpful Md/BACKEND_DELIVERY_DISPATCH_PACK_GUIDE.md`
26. `Helpful Md/BACKEND_DELIVERY_ACKNOWLEDGMENT_GUIDE.md`
27. `Helpful Md/BACKEND_SEAT_SESSION_GUIDE.md`
28. `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
29. `Helpful Md/TEAM_SEAT_RECOVERY_AND_ROTATION_GUIDE.md`
30. `Helpful Md/TEAM_SEAT_RECOVERY_CODE_GUIDE.md`
31. `Helpful Md/TEAM_SEAT_INVITE_AND_ENROLLMENT_GUIDE.md`
32. `Helpful Md/TEAM_SEAT_SIGNED_LINK_GUIDE.md`
33. `Helpful Md/TEAM_WORKSPACE_APPROVAL_HANDOFF_GUIDE.md`
34. `Helpful Md/PROPOSAL_BRANDING_AND_RELEASE_CONTROL_GUIDE.md`

Then use this working rule:

- edit only `src/`
- run `node scripts/build_artifacts.js`
- validate with `node scripts/build_artifacts.js --check`
- use `npm run release:gate:free` before static/free deploys
- use `npm run bundle:free-static` when you want a ready-to-upload free hosting folder for manual deploy or handoff
- use `npm run release:gate:premium` before premium/hybrid deploys
- use `npm run ops:check:premium:strict` on the real premium host before calling public paid operations closed
- use the free static hosting quickstart when the priority is getting the app live at zero cost with the least possible operational overhead
- use the GitHub Pages publish checklist when you want the exact lowest-friction repo-native free launch path for this repo
- use the hosting recommendation and remote deployment guide when you want the dated host recommendation, the remote-push requirements, and the honest alternatives to Oracle
- use the owner/admin premium access policy guide when you want the explicit rule for installation-wide admin-managed premium access versus future seat-level billing
- use the deployment templates guide when you want concrete starter files for GitHub Pages, Netlify, or Render instead of writing deployment config from scratch
- use the Oracle backend guide when you want to keep the frontend on GitHub Pages or Netlify and add a low-cash premium backend later on Oracle Cloud
- use `node _ui_height_debug.js` for initial-load UI height checks
- use `node _ui_visual_audit.js` for screenshot sweeps and initial-vs-post-walkthrough UX metrics

Never manually edit:

- `pv_calculator_ui.html`
- `dist/web/pv_calculator_ui.html`
- `dist/web/assets/app.js`
- `src/scripts/app.js`

Those are generated artifacts.

For premium work:

- the current entitlement layer is still backend-free
- there is now an optional backend sync seam for trusted entitlement refresh, but it is not required for the calculator itself
- that same optional backend seam can now also carry shared company-profile sync, shared desk-roster/admin sync, shared team-seat sync, shared project handback sync, seat-aware shared writes, and backend audit visibility across devices for the same installation key
- use the roadmap first for packaging decisions
- use the entitlement foundation guide for actual code boundaries
- use the optional backend guide when you need server-backed premium sync, shared company-profile sync, shared team state, or cross-device trust
- use the deployment playbook when you need the easiest free deployment path, the premium hybrid deployment path, or the honest stop-point before infrastructure scope creeps
- use the entitlement source-of-truth guide when you need the explicit answer for what currently authorizes premium access in a paid rollout
- use the backend sqlite guide when you need the durable single-node premium storage path without jumping straight to a separate database service
- use the backend backup/restore guide when you need a real snapshot and rollback procedure instead of a verbal retention promise
- use the backend backup retention/scheduling guide when you need a concrete nightly backup and pruning policy on the deployed host
- use the premium operations ownership/readiness guide when you need the honest answer for why beta could already be ready while public paid v1 still needed named ops ownership and a host-level readiness pass
- use the backend security and audit guide when you need the production-safe story for API keys, short-lived seat sessions, audit logging, and origin restriction
- use the backend admin console guide when you want a hosted same-origin surface for invite delivery, recovery delivery, approval-queue review, shared-seat inspection, and audit pull, with those operator controls locked behind a live short-lived seat session
- use the backend delivery-trail guide when you want server-side handoff recording for who received a one-time invite or recovery item, which channel was used, and which backend-issued delivery reference it belonged to
- use the backend delivery dispatch-pack guide when you want a provider-ready email/chat/SMS handoff pack for an active invite or recovery item without persisting raw one-time secrets at rest
- use the backend delivery acknowledgment guide when you want the handoff loop to close explicitly as pending vs acknowledged instead of stopping at raw delivery record
- use the premium v1 closeout checklist when deciding whether the premium/backend lane is actually done or whether a proposed next feature should be pushed to post-v1
- use the admin action approval workflow guide when you need explicit request/review control for high-risk shared-seat actions like code rotation, sign-in disable, or seat suspension
- use the backend seat-session guide when you want shared premium sync to stop relying on a browser-held API key as the normal credential
- use the team-seat sign-in guide when you want seat access-code sign-in, session renew, or session revoke
- use the team-seat recovery guide when you need admin-grade lockout clear, forced session revoke, access-code rotation, sign-in disable, or suspend/restore posture
- use the team-seat recovery-code guide when you need a one-time admin-issued reset path that lets the target seat set a fresh sign-in and receive a short-lived backend session
- use the team-seat invite guide when you need a one-time admin-issued onboarding or re-enrollment path that lets a saved seat claim a fresh sign-in without using the bootstrap API key
- use the signed-link guide when you want secure copy/open links for those same one-time invite and recovery flows
- use the team seats guide when you need named operator posture, shared seat bootstrap, or role-guarded shared premium actions
- use the optional workspace entitlement panel when you need local offline trial or license testing
- use the optional backend workspace panel only when you have a separately hosted API
- the current soft-gated actions are the formal-study work-pack export, the formal-study data-sheet export, the team handback TXT export, the desk-roster save/apply/delete and shared roster sync actions, the team-seat save/activate/delete and shared seat sync actions, the admin seat-recovery controls, the one-time seat recovery-code and seat-invite controls, the backend approval queue for high-risk shared-seat actions, the company-profile save/load library, local logo / branded pack actions, company-scoped release-template save/apply/delete actions, and the proposal release TXT export
- do not mix billing checks into sizing or engineering logic

## Fastest Ways To Run The Product

### Easiest offline run

Open:

- `pv_calculator_ui.html`

### Normal hosted preview

Run:

```bash
python3 serve.py --build
```

If you need a specific port:

```bash
python3 serve.py 9005 --build --no-browser
```

The local server uses `dist/web/`, so it matches the hosted bundle.

## What To Read For Specific Questions

### Build and deployment model

- `Helpful Md/DEPLOYMENT_ARTIFACTS_AND_RUNTIME.md`
- `Helpful Md/DEPLOYMENT_PLAYBOOK_FREE_AND_PREMIUM.md`

### UI navigation

- `Helpful Md/INSTALLER_UI_GUIDE.md`
- `Helpful Md/CLIENT_UI_GUIDE.md`

**Section navigator:** A sticky floating nav bar on the left side of the input column lets you jump between System, Workspace, Guide, Identity, Pricing, Loads, and Equipment cards. It highlights the currently visible section based on scroll position and auto-expands collapsed cards when clicked. Hidden on mobile to avoid crowding.

**Info tooltips:** Most field help text is now behind an (i) icon rendered as a real button. Hover, focus, or tap the icon to open the guidance; outside click and Escape close it again. Three critical fields keep always-visible help: Duty Cycle, Power (NOT startup watts), and Workspace Mode.

**Readiness checklist:** Before you calculate, the Results column shows a live checklist tracking your progress: system configuration, loads added, equipment reviewed, and the calculate action. Steps turn green as you complete them.

**Card status badges:** Collapsed cards show a green "Ready" badge when they have sufficient data for the current workflow.

### Example scenarios

- `Helpful Md/INSTALLER_CLIENT_SCENARIO_PLAYBOOK.md`

### Scores, confidence, coping, readiness

- `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md`

### Commercial presets, pricing, finance

- `Helpful Md/COMMERCIAL_PRESETS_GUIDE.md`
- `Helpful Md/COMMERCIAL_FINANCE_AND_ROI_GUIDE.md`
- `Helpful Md/SUPPLIER_QUOTE_IMPORT_GUIDE.md`
- `Helpful Md/SUPPLIER_QUOTE_FRESHNESS_GUIDE.md`
- `Helpful Md/PROPOSAL_BRANDING_AND_RELEASE_CONTROL_GUIDE.md`
- `Helpful Md/OPTIONAL_BACKEND_FOUNDATION_GUIDE.md`

### Plant and utility lane

- `Helpful Md/PLANT_SCOPING_AND_MINIGRID_BOUNDARY.md`
- `Helpful Md/PLANT_FEEDER_BRIEF_GUIDE.md`
- `Helpful Md/PLANT_BOARD_SOURCE_SCHEDULE_GUIDE.md`
- `Helpful Md/PLANT_PROCUREMENT_AND_PROTECTION_REVIEW_GUIDE.md`
- `Helpful Md/PLANT_STUDY_DATA_SHEET_GUIDE.md`
- `Helpful Md/UTILITY_DELIVERABLE_STATUS_GUIDE.md`
- `Helpful Md/UTILITY_PACKET_ROUTING_GUIDE.md`
- `Helpful Md/UTILITY_STUDY_TRACK_GUIDE.md`
- `Helpful Md/UTILITY_RELAY_TRANSFER_AND_FAULT_BASIS_GUIDE.md`
- `Helpful Md/UTILITY_PROTECTION_FAULT_SCREENING_GUIDE.md`
- `Helpful Md/UTILITY_INTERCONNECTION_PACKET_GUIDE.md`
- `Helpful Md/UTILITY_DATA_SHEET_EXPORTS_GUIDE.md`
- `Helpful Md/UTILITY_STAGE_DISCIPLINE_EXPORT_GUIDE.md`

## Bottom Line

For someone who is new:

- start here
- then choose the guide that matches the role
- only then move into the deeper technical references

That is the cleanest path to get value from the bot without being overwhelmed by the full feature set.
