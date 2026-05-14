# Installer UI Guide

## Purpose

This guide explains how an installer should move through the interface without getting lost in the wider commercial feature set.

Use it when the job is technical, survey-backed, or commercially sensitive enough that phase layout, board strategy, battery throughput, or generator posture matters.

The left column is now progressive, not flat:
- each major section shows a short summary line
- the guide card highlights the recommended next move
- the guide card now explains the focused field in plain language when you click into a high-risk term
- collapse sections you are not using so the active engineering task stays visible

For a score-by-score explanation of `Confidence`, `Coping Score`, `Commercial Strategy`, `Proposal Readiness`, `Regional Compliance`, and `Submission Pack`, use `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md`.

For worked scenario setups across residential backup, retail/POS, tailoring, bakery, filling station, cold room, workshop, mini-factory, and plant-engineering jobs, use `Helpful Md/INSTALLER_CLIENT_SCENARIO_PLAYBOOK.md`.

The results side is now segmented too:
- `System Summary` stays open
- `Results Navigator` jumps to the next section
- longer sections can collapse when you are not actively reading them

## Recommended Navigation Order

1. Start in `Installer Design`
- Use this mode for real sizing work, survey review, and final proposal control.
- Client mode is intentionally lighter and should not be the last stop for a complex commercial job.

1.5. Follow the `Guided Flow` card, not just the raw card order
- The recommended next move tells you which section deserves attention now.
- You do not need every card open at once.
- Keep `System Configuration`, `Guided Flow`, and the current work section open; collapse the rest.

2. Set the site identity first
- `Location Profile`: drives voltage, frequency, climate, pricing region, and compliance framing.
- `System Type`: choose `Off-Grid`, `Hybrid`, or `Grid-Tie` based on the actual delivery model, not the marketing headline.
- `Business Profile`: tells the calculator what kind of site it is sizing.
- `Operating Intent`: tells it what promise you are trying to make.
- `Continuity Class`: tells it how severe downtime is.
- `Operating Schedule`: tells it when the site really works.
- Read the live smart-conclusion block under `System Configuration`.
- If the fields drift, use the quick-align actions only when they match the real brief. They are explicit helpers, not hidden auto-mode.

3. Lock the commercial posture before hardware
- `Commercial Preset`: use this when you want a reusable quote posture for continuity-heavy, premium, financed, or value-led jobs. It only rewrites commercial fields; it does not change the engineering design.
- `Board Strategy`: whole board, essential board, process split, or generator-assist.
- `Generator Support`: use only if the site truly depends on a generator path.
- `PV Field Layout` and `MPPT Grouping`: use these to keep unlike PV fields from being treated as one clean tracker input.
- `Plant Scope`, `Distribution Topology`, and `Interconnection Scope`: use these when the site is becoming a mini-plant, multi-feeder, or private-distribution job so the proposal does not drift into utility-grade language by accident.
- Read the `Current working surface` conclusion after those fields. It now tells you whether the job still belongs to the normal system-design lane, the plant-engineering lane, or a separate utility / mini-grid lane.

4. Use a vertical template if the site is common
- Good candidates:
  - tailoring / garment workshop
  - bakery
  - filling station
  - cold room
  - fabrication workshop
  - mini-factory
- Templates are first drafts, not final designs.
- They preserve installer identity and location defaults, but they intentionally reset client-specific commercial fields.

5. Build or refine the load list
- Prefer machine-aware entries over generic watts.
- Confirm:
  - true nameplate power
  - startup behavior
  - simultaneous use
  - daytime share
  - load role
  - load criticality
  - phase assignment when known

6. Review the architecture before reading the hardware totals
- On a commercial job, read these first:
  - `Commercial Strategy Recommendation`
  - `Supported Load Story`
  - `Commercial Power Architecture`
  - `Regional Compliance Path`
  - `Submission Pack Readiness`
  - `Proposal Readiness`
- On plant or multi-feeder jobs, also read:
  - `Current working surface`
  - `Recommended feeder schedule`
  - `Board / source schedule`
  - `Board procurement / breaker / cable review`
  - `Dispatch / load-shed / restoration sequence`
  - `Utility / mini-grid engineering lane`
- Only then move to:
  - inverter
  - battery
  - PV
  - protection
  - cable

## What The Main Terms Mean

### Business Profile
What kind of site this is.

This changes defaults, warnings, sample loads, and topology guidance. It should not silently force three-phase.

The UI now also gives a smart conclusion when the profile, intent, continuity, schedule, or system type start to pull in different directions.

### Operating Intent
What the installer is promising.

Examples:
- backup-only resilience
- daytime solar-first productivity
- full off-grid operation
- hybrid with generator
- hybrid with grid
- essential-load-only protection

### Continuity Class
How painful power loss is.

Examples:
- `Convenience`: outage is annoying
- `Business Critical`: outage hurts trade quickly
- `Process Critical`: outage interrupts production
- `Product-Loss Critical`: outage risks spoilage or stock loss

### Operating Schedule
When the site really works.

This matters because daily energy alone hides whether the real problem is:
- daytime process load
- overnight preservation load
- short operator-triggered peaks

### Board Strategy
What the quoted system is actually protecting.

Examples:
- `Full Site Board`
- `Essential-Load Sub-Board`
- `Process / Support Split Board`
- `Generator-Assist Hybrid`

### Plant Scope
Whether the job is still a captive site plant or is drifting toward a broader distribution role.

Use this to keep a business-site plant from being oversold as a public mini-grid or interconnection-heavy utility job.

### Distribution Topology
How power is being distributed inside the site boundary.

Examples:
- `single distribution board`
- `essential-load split`
- `multi-feeder radial`
- `private mini-grid distribution`

### Interconnection Scope
How much outside-party approval or network interaction the design is assuming.

Examples:
- `none / captive site`
- `private distribution`
- `private campus microgrid`
- `public-service interconnection`

### Recommended Feeder Schedule
This turns the plant-scope story into operating lanes.

Read it as:

- which feeder is the protected continuity lane
- which feeder is still assisted
- which feeder is outside the sold promise
- what source path each feeder depends on

Use this before pricing a mini-plant or multi-feeder site as if the whole plant is equally protected.

Use the `Copy feeder brief` or `Download TXT` action when the feeder story needs to move into one-line preparation or internal source-coordination notes.

### Current Working Surface
This is the UI’s conclusion about which workflow now deserves priority.

It can read as:

- `System Design Surface`
- `Plant Engineering Surface`
- `Utility / Mini-Grid Engineering Surface`

Read it as:

- which result block should now be treated as the primary handoff
- whether the normal site-design summary is still enough
- whether the job has crossed into a separate lane

### Utility / Mini-Grid Inputs (Optional)
Use this only when the project has genuinely crossed beyond a simple captive-site quote.

It captures:

- packet lane
- packet stage
- authority case status
- filing channel
- primary hold point
- response return path
- metering / export posture
- study basis
- one-line / SLD status
- protection / relay pack status
- commissioning path
- witness parties
- witness evidence
- witness / closeout pack status
- packet / study reference
- case owner / desk
- submission / review date
- current revision / response
- submission / review trail
- bounded engineering notes
- authority / review comments

The advisor below it is deliberate:

- it shows what the current plant surface recommends
- it lets you apply aligned defaults explicitly
- it does not silently rewrite the brief

When the job is beyond draft handoff, fill the three deliverable-status fields too:

- `One-Line / SLD Status`
- `Protection / Relay Pack Status`
- `Witness / Closeout Pack Status`

That keeps packet stage, live case status, and actual deliverable readiness from being confused with one another.

Also fill the packet-routing fields once the approval lane is live:

- `Filing Channel`
- `Primary Hold Point`
- `Response Return Path`

That keeps packet maturity, approval desk posture, and actual route/control logic from being collapsed into one status line.

### Dispatch / Load-Shed / Restoration Sequence
This is a bounded operating handoff, not a formal dispatch study.

Use it to keep these three things explicit:

- protected feeders come on first
- assisted feeders only return when their source path is confirmed
- excluded feeders stay outside the promise unless the scope changes

### Interconnection / Approval Packet Scaffold
Use this when the job is no longer just a feeder-handoff story.

Read it as:

- which approval lane is active
- which packet deliverables need to stay visible
- whether anti-backfeed, export, or formal interconnection posture now needs a separate lane

Use `Copy packet brief` or `Download TXT` when this packet story needs to move into an engineering or approval handoff note.

Use `Copy packet data sheet` or `Download CSV` when the approval lane needs a field-by-field packet record instead of only a narrative brief.

### Feeder / Protection Study Input Capture
Use this when the job is about to leave proposal work and enter one-line or study prep.

Read it as:

- feeder rows that must carry through
- live breaker ratings already in the handoff
- live cable runs and parallel-run warnings
- limiting-phase or cluster assumptions that must not be lost

Use `Copy study sheet` or `Download TXT` when you need a bounded feeder/protection study-input sheet without rebuilding the carried assumptions manually.

Use `Copy study data sheet` or `Download CSV` when the same feeder/protection study basis needs spreadsheet-style carry-through instead of only a narrative handoff note.

Once the job is no longer only a one-line handoff, fill `Study Track`, `Study Owner / Consultant`, `POC / Feeder / Node Ref`, `Fault Level / SCC Ref`, `Relay Scheme Basis`, `Transfer Scheme Basis`, and `Fault / Relay Basis Note` so the study lane keeps a real owner, node anchor, fault basis, relay logic, and transfer story instead of drifting into generic review language.

Use the one-line / protection deliverable statuses at the same time so the study export reflects whether the pack is still draft-only, review-ready, or already issued.

### Commissioning / Witness-Test Prep
Use this when energization discipline matters.

Read it as:

- what must be frozen before energization
- what operating mode and source posture must be recorded
- whether the job only needs an internal commissioning pack or a formal witness / authority hold point

Use `Copy checklist` or `Download TXT` when the commissioning / witness-prep path needs to leave the result view as a bounded handoff document.

Use `Copy witness data sheet` or `Download CSV` when commissioning and witness details need a cleaner field-by-field carry-through for engineering or authority prep.

Set `Witness / Closeout Pack Status` once the witness lane becomes a real tracked deliverable, not just a narrative prep note.

### Commercial Strategy Recommendation
The calculator’s honest verdict on the least misleading operating posture for the site after the math is done.

If this says `hybrid generator assist`, do not sell the job as a clean battery-only whole-site plant.

### Supported Load Story
This is the continuity boundary for the quote.

Read it as three separate statements:

- `Protected Path`: what can honestly be sold as covered continuity
- `Assisted Path`: what still depends on generator, grid, or disciplined operating windows
- `Outside The Promised Path`: what must stay out of the continuity promise unless scope changes

Do not read the protected share as a whole-site promise unless the assisted and outside buckets are both commercially acceptable.

### Commercial Value Outlook
This is now more than simple payback.

Read it in two layers:

- energy-value layer: annual value, simple payback, and gross value outlook
- lifecycle layer: annual O&M plus planned inverter and battery refresh allowances
- optional capital-stack layer: debt, tax-benefit, and residual-value sensitivity from the collapsed advanced-finance block
- optional scenario layer: cash purchase versus financed purchase when debt share is active

Use the lifecycle view to keep battery-heavy commercial jobs from being oversold on a simple-payback headline alone.

Keep the advanced-finance block collapsed unless the client is actively asking financing questions. It is there for realism, not as a default data-entry burden.

Use the scenario layer when the client asks a practical sales question like: "Should we buy this outright or finance part of it?"

### Commercial Preset
This is a reusable commercial starting point, not a lock.

When you apply one, it updates:
- pricing basis
- lifecycle allowances
- optional finance sensitivity
- proposal terms
- included scope / exclusions / next steps

It does not change:
- appliance list
- phase topology
- inverter/battery/PV sizing
- engineering validation

### Supplier Quote Freshness
Use this to separate:

- benchmark-only quoting
- partially live supplier quoting
- major-line supplier lock
- fully dated live supplier quoting

Recommended installer behavior:

- leave it at `benchmark-only` during early scoping
- move to a live quote status only when the supplier quote date is real
- store the supplier reference so the proposal can be audited later
- treat an aging or stale quote as a commercial risk, not just a note

This field does not change the engineering design. It changes how honest the commercial story is.

### Supplier Quote Import
Use this when the supplier sends:

- pasted email lines
- WhatsApp pricing lines
- spreadsheet rows copied as text
- TXT / CSV / ERP-style quote files
- structured JSON quote files
- generated supplier refresh briefs when the current quote is aging or stale

Best use:

- paste the quote
- review the matched lines in `Import Review`
- apply only if the mapping is correct

It writes into the existing:

- supplier quote status
- quote date
- quote reference
- manual component overrides

It does not fetch live data and it does not replace manual review.

### Submission Pack Readiness
The structured closeout view for what would actually be needed to move from quote to authority review or formal handover.

Read it as four staged questions:
- is the survey and cover pack formalized?
- is the technical dossier strong enough?
- is the approval lane clear for this path?
- is the closeout / handover pack actually aligned?

## How The Section Flow Works

- `Site Setup`: mode, location, business posture, phase basis
- `Project Draft`: autosave, saved browser projects, template starting points
- `Survey & Identity`: client/site story and survey confidence
- `Commercial Terms`: pricing posture, exclusions, finance assumptions
- `Add Loads` and `Load Review`: the real machine list
- `Engineering Review`: equipment validation and upgrade stress checks

If the page feels wide, that is expected. The right move is to collapse finished sections, not to rush through terms that still affect the design outcome.

## How To Read Results Properly

Before reading deep results, use `Results Navigator` to jump to the section you need instead of free-scrolling through every block.

### For single-phase and lighter jobs
Start with:
- `Executive Snapshot`
- `System Summary`
- `Proposal Readiness`

Then confirm:
- inverter sizing
- battery runtime
- PV array

### For 3-phase and commercial jobs
Start with:
- `Commercial Strategy Recommendation`
- `Plant Scope Boundary`
- `Regional Compliance Path`
- `Submission Pack Readiness`
- `Commercial Estimate`
- `3-phase balance`
- `inverter cluster summary`
- `shared battery throughput`

Then confirm:
- generator coverage
- PV field grouping
- MPPT grouping
- protection and cable paths

If the result scorecards look strong but the job still feels commercially risky, stop and read `Helpful Md/OUTCOME_RESULTS_AND_SCORE_GUIDE.md` before assuming the result is installer-safe.

## Common Misreadings To Avoid

- Do not read total inverter kVA alone on a 3-phase job. The limiting phase still governs.
- Do not treat battery kWh as proof of safe battery current throughput.
- Do not assume a business profile automatically means three-phase.
- Do not treat a template as a final machine schedule.
- Do not interpret a `pass` strategy as permission to skip survey and OEM review.

## Practical Workflow By Vertical

### Tailoring studio
- Start single-phase unless the actual machine schedule proves otherwise.
- Confirm servo versus clutch.
- Keep ironing duty honest.

### Garment workshop
- Review whether quantity and simultaneous operation justify phase escalation.
- Compressor overlap matters.

### Bakery
- First question: oven type and oven phase.
- Do not let a gas-assisted bakery inherit a heavy 3-phase story by assumption.

### Filling station
- Treat phase allocation as first-class.
- Generator posture is often part of the real continuity story.

### Cold room
- Overnight preservation burden matters more than daily energy headline.
- Compressor and defrost behavior must be explicit.

### Fabrication / mini-factory
- Surge and overlap discipline matter more than average load.
- Use process split and assisted support honestly.

## Final Installer Rule

The calculator is strong enough for serious preliminary design, commercial framing, and proposal preparation.

It is not the final authority for:
- OEM parallel rules
- final protection coordination
- final distribution-board schedule
- final cable routing
- stamped or jurisdiction-final authority approval submissions

Use the tool to get to a technically honest draft faster, then close the field engineering deliberately.
