# Installer / Client Scenario Playbook

This guide shows how to get the best out of the calculator without trying to use every feature on every job.

The rule is simple:

- use `Client Estimate` to frame the story, package, and promise
- use `Installer Design` to lock the real engineering path
- only move into `Plant Engineering Surface` or `Utility / Mini-Grid Engineering Surface` when the job genuinely justifies it

## Fast Reading Pattern

For any scenario:

1. Pick the right `Workspace Mode`.
2. Set `Location Profile`.
3. Set `Business Profile`, `Operating Intent`, `Continuity Class`, and `Operating Schedule`.
4. Read the smart conclusion under `System Configuration`.
5. Build or review the load list.
6. Read the result in the right order for that scenario.

## 1. Residential Backup

Best starting mode:

- client first
- installer second

Recommended setup:

- `Business Profile`: `Residential Backup`
- `Operating Intent`: `Backup-Only Resilience` or `Daytime Solar-First`
- `Continuity Class`: `Convenience Critical` or `Business Critical` if home office equipment matters
- `Operating Schedule`: `Morning / Evening Residential` or `24/7` if fridge and essentials dominate
- `System Type`: usually `Hybrid` or `Off-Grid`
- `Phase`: usually `Single Phase`

What the client should focus on:

- `Executive Snapshot`
- `Proposal Budget`
- `Supported Load Story`
- `Commercial Value Outlook`

What the installer should focus on:

- inverter, battery, and panel fit
- surge loads
- cable and breaker sizing
- proposal readiness

Avoid:

- forcing plant-scoping fields on normal home jobs
- treating convenience loads like process-critical continuity

## 2. Retail / POS Shop

Best starting mode:

- client first for budget
- installer for final promise boundary

Recommended setup:

- `Business Profile`: `Retail / POS`
- `Operating Intent`: `Daytime Solar-First` or `Hybrid With Grid Support`
- `Continuity Class`: `Business Critical`
- `Operating Schedule`: `Extended Business Day`
- `System Type`: usually `Hybrid`
- `Board Strategy`: often `Essential-Load Sub-Board`

What matters most:

- POS terminals
- lighting
- telecom/router
- checkout refrigeration if present
- realistic protected vs assisted path

Best result sections:

- `Commercial Strategy Recommendation`
- `Supported Load Story`
- `Proposal Readiness`
- `Supplier Quote Freshness`

## 3. Tailoring Studio / Garment Workshop

Best starting mode:

- installer if machines are already known
- client if this is still an early business case

Recommended setup:

- `Business Profile`: `Tailoring Studio` or `Garment Workshop`
- `Operating Intent`: `Daytime Solar-First` for small studios, `Hybrid Generator Assist` for heavier workshops
- `Continuity Class`: `Business Critical` or `Process Critical`
- `Operating Schedule`: `Extended Business Day`
- `Phase`: often `Single Phase` for small studios, review `3-Phase` only when the machine set truly justifies it

What matters most:

- clutch motors
- irons / steam systems
- cutting equipment
- realistic simultaneous use

Best result sections:

- `Machine-aware load list`
- `Commercial Strategy Recommendation`
- `Supported Load Story`
- `3-Phase Balance` only if the site truly moves into 3-phase

## 4. Bakery

Best starting mode:

- installer early, because oven and mixer assumptions can distort the whole design

Recommended setup:

- `Business Profile`: `Bakery`
- `Operating Intent`: `Hybrid Generator Assist` or `Essential-Load-Only Backup`
- `Continuity Class`: `Process Critical`
- `Operating Schedule`: `Split Shift` or `Extended Business Day`
- `Phase`: single-phase or three-phase only after the oven and mixers are confirmed

What matters most:

- oven type
- oven phase
- mixer motor rating
- refrigeration vs production load split

Best result sections:

- `Commercial Strategy Recommendation`
- `Supported Load Story`
- `Commercial Power Architecture`
- `Proposal Readiness`

Avoid:

- assuming every bakery should be sold as full off-grid
- assuming every oven belongs on the protected path

## 5. Filling Station

Best starting mode:

- installer

Recommended setup:

- `Business Profile`: `Filling Station`
- `Operating Intent`: `Hybrid Generator Assist` or `Hybrid With Grid Support`
- `Continuity Class`: `Process Critical`
- `Operating Schedule`: `Extended Business Day` or `24/7`
- `Phase`: often `3-Phase`
- `Board Strategy`: usually `Process / Support Split` or `Generator-Assist Hybrid`
- `Plant Scope`: often resolves toward `Multi-Feeder Commercial Site`

What matters most:

- dispenser pumps
- booster pump
- POS/control room
- signage and forecourt lighting
- which feeders are truly protected

Best result sections:

- `Current working surface`
- `Recommended feeder schedule`
- `Board / source schedule`
- `Board procurement / breaker / cable review`
- `Dispatch / load-shed / restoration sequence`

Use the exports:

- `Copy feeder brief` for one-line prep
- `Copy packet brief` for approval alignment
- `Copy packet data sheet` when a structured handoff is needed

If the approval lane is already live, also capture:

- `Authority Case Status`
- `Filing Channel`
- `Primary Hold Point`
- `Response Return Path`
- `Case Owner / Desk`
- `Submission / Review Date`
- `Current Revision / Response`
- `One-Line / SLD Status`
- `Protection / Relay Pack Status`
- `Witness / Closeout Pack Status`
- `Next Action Owner / Handover`
- `Next Action Due Date`
- `Next Required Action`
- `Submission / Review Trail`
- `Authority / Review Comments`

## 6. Cold Room

Best starting mode:

- installer

Recommended setup:

- `Business Profile`: `Cold Room`
- `Operating Intent`: `Hybrid Generator Assist` or `Hybrid With Grid Support`
- `Continuity Class`: `Product-Loss Critical`
- `Operating Schedule`: `24/7 Continuous Operation`
- `Board Strategy`: often `Essential-Load Sub-Board` or `Process / Support Split`

What matters most:

- compressor startup
- defrost cycles
- overnight burden
- temperature-preservation loads

Best result sections:

- `Operating Schedule` fit
- `Supported Load Story`
- `Commercial Strategy Recommendation`
- `Commercial Value Outlook`

## 7. Workshop / Fabrication

Best starting mode:

- installer

Recommended setup:

- `Business Profile`: `Workshop` or `Fabrication`
- `Operating Intent`: `Daytime Solar-First` or `Hybrid Generator Assist`
- `Continuity Class`: `Process Critical`
- `Operating Schedule`: `Extended Business Day`
- `Phase`: review carefully; some jobs stay single-phase, others justify 3-phase

What matters most:

- welders
- grinders
- compressors
- intermittent high-surge tools

Best result sections:

- surge-driven inverter fit
- `Supported Load Story`
- `3-Phase Balance`
- `Commercial Power Architecture`

## 8. Mini-Factory / Process Line

Best starting mode:

- installer

Recommended setup:

- `Business Profile`: `Mini-Factory`
- `Operating Intent`: usually `Hybrid Generator Assist`, `Hybrid With Grid Support`, or a selective plant path
- `Continuity Class`: `Process Critical`
- `Operating Schedule`: `Split Shift` or `24/7`
- `Phase`: often `3-Phase`
- `Plant Scope`: often plant-engineering relevant

What matters most:

- process vs support feeders
- startup sequence
- protected vs assisted lanes
- battery throughput stress

Best result sections:

- `Current working surface`
- `Commercial Power Architecture`
- `Recommended feeder schedule`
- `Board / source schedule`
- `Dispatch / load-shed / restoration sequence`

## 9. Private Plant / Mini-Grid / Utility-Adjacent Job

Best starting mode:

- installer only

Recommended setup:

- use the normal design path first
- let `Plant Scope`, `Distribution Topology`, and `Interconnection Scope` resolve honestly
- open `Utility / mini-grid inputs (optional)` only when the job really has a packet, study, or witness path

What matters most:

- whether the job is still captive-site
- whether it has crossed into plant engineering
- whether it has crossed into a separate utility / mini-grid lane

Best result sections:

- `Current working surface`
- `Utility / mini-grid engineering lane`
- `Interconnection / approval packet scaffold`
- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`

Use the exports:

- `Copy packet brief` / `Download TXT`
- `Copy packet data sheet` / `Download CSV`
- `Copy study sheet` / `Download TXT`
- `Copy study data sheet` / `Download CSV`
- `Copy checklist` / `Download TXT`
- `Copy witness data sheet` / `Download CSV`

Do not leave the utility block at lane-only settings on these jobs. Carry the real case state too:

- current packet stage
- authority case status
- filing channel
- primary hold point
- response return path
- study track
- one-line / SLD status
- protection / relay pack status
- study owner / consultant
- fault / relay basis note
- witness / closeout pack status
- case owner / desk
- submission / review date
- authority / review comments

## Best Mode Choice By Scenario

Use `Client Estimate` first when:

- the job is still exploratory
- the client needs budget and promise clarity
- the load list is still being shaped

Use `Installer Design` first when:

- machine ratings are known
- three-phase or plant questions are already active
- breaker, cable, or source-path review matters
- the quote is close to procurement or authority prep

## General Rule For The Complex Features

Do not open advanced plant or utility fields just because they exist.

Open them when the job genuinely needs:

- feeder-level promise control
- board/source handoff
- breaker/cable procurement review
- packet/study/commissioning tracking
- authority-facing or witness-facing structure

That is how the product stays powerful without becoming confusing.
