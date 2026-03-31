# Utility Engineering Inputs Guide

## Purpose

This guide explains the optional `Utility / mini-grid inputs` block in `System Configuration`.

It exists for one reason:

- some plant or utility-lane jobs now need a few real packet, study, and commissioning inputs
- but the app should not force every normal captive-site project through a heavy engineering form

## What It Captures

The block captures:

- `Packet Lane`
- `Packet Stage`
- `Authority Case Status`
- `Filing Channel`
- `Primary Hold Point`
- `Response Return Path`
- `Metering / Export Posture`
- `Study Basis`
- `Study Track`
- `Protection Review Scope`
- `Export Control Basis`
- `Relay Scheme Basis`
- `Transfer Scheme Basis`
- `One-Line / SLD Status`
- `Protection / Relay Pack Status`
- `Study Owner / Consultant`
- `POC / Feeder / Node Ref`
- `Fault Level / SCC Ref`
- `Fault / Relay Basis Note`
- `Commissioning Path`
- `Witness Parties`
- `Witness Evidence`
- `Witness / Closeout Pack Status`
- `Packet / Study Reference`
- `Case Owner / Desk`
- `Submission / Review Date`
- `Current Revision / Response`
- `Next Action Owner / Handover`
- `Next Action Due Date`
- `Next Required Action`
- `Submission / Review Trail`
- `Utility / Plant Engineering Notes`
- `Authority / Review Comments`

## How To Use It

Use it when the project has crossed into:

- a plant-engineering surface
- a utility / mini-grid engineering surface
- a behind-the-meter or approval-heavy lane where packet and metering posture matter

Leave it light for normal captive-site jobs.

## Smartness Rule

The advisor below the block is intentional:

- it shows what the current plant scope recommends
- it offers a quick-align action
- it does not silently overwrite the current brief

## What It Improves

These inputs now feed:

- `Interconnection / approval packet scaffold`
- `Feeder / protection study input capture`
- `Commissioning / witness-test prep`
- the plant feeder TXT brief
- the packet, study, and commissioning TXT export briefs
- the packet and witness CSV data sheets

Those study fields now also drive bounded live screening inside the study lane:

- modeled AC current basis
- AC breaker carry margin
- fault-reference screening
- relay/export screening
- transfer-path screening
- generator-source screening

That means the heavier engineering lane can now carry real project-state inputs instead of inference alone.

## Honest Boundary

This block makes the utility lane more usable.

It does not turn the app into:

- a formal protection-study package
- a formal interconnection application engine
- a full commissioning suite

## Why The New Structured Fields Matter

`Packet Stage` keeps the handoff honest about maturity:

- planning only
- ready for submission
- under review
- conditionally cleared
- externally managed

`Witness Parties` keeps the commissioning lane honest about who must be present:

- installer only
- client + installer
- authority / utility
- multi-party witness

`Witness Evidence` keeps the proof pack honest about what must survive:

- startup and labels
- staged transfer / restart proof
- non-export / protection proof
- authority acceptance evidence

`Authority Case Status` keeps the approval lane honest about whether the case is only internal, filed, under comments, conditionally cleared, pending witness, or already closed outside the app.

`Filing Channel` keeps the packet honest about how it is really being handed into the live approval lane.

Typical meanings are:

- internal prep only
- installer-led submission
- consultant / EPC submission
- portal / utility-desk filing
- externally controlled

`Primary Hold Point` keeps the packet honest about what is actually controlling the next gate.

Typical meanings are:

- internal release only
- study / protection clearance
- metering / export clearance
- witness / energization clearance
- externally controlled

`Response Return Path` keeps the live review cycle honest about who or what carries the next response.

Typical meanings are:

- internal revision cycle
- installer-led response
- consultant / EPC response
- portal / redline response cycle
- externally controlled

`Study Track` keeps the study lane honest about whether the current handoff is still one-line basis, breaker/cable review, protection/relay review, or already an external study pack.

`Protection Review Scope` keeps the study lane honest about how deep the active protection carry-through already is.

Typical meanings are:

- `Breaker / Cable Carry-Through`
- `Feeder / Breaker Coordination`
- `Relay / Export Logic Review`
- `External Selectivity / Protection Study`

`Export Control Basis` keeps the study lane honest about how the declared metering/export posture is actually enforced or proven.

Typical meanings are:

- `Captive / No-Export Declaration`
- `Reverse Power / Zero-Export Control`
- `Non-Export Relay / Trip Proof`
- `Limited-Export Control`
- `Utility Dispatch / Metered Export`

`One-Line / SLD Status`, `Protection / Relay Pack Status`, and `Witness / Closeout Pack Status` keep the heavier lane honest about actual deliverable readiness.

They answer a different question from packet stage:

- packet stage = where the approval lane sits
- case status = where the authority or desk posture sits
- deliverable status = how far the real one-line, protection, and witness packs have progressed

Typical meanings are:

- `Draft Only`
- `Review Ready`
- `Issued / Submitted`
- `Externally Controlled`

`Study Owner / Consultant` keeps the heavier study lane owned once the job is no longer just a feeder-label handoff.

`POC / Feeder / Node Ref` keeps the study sheet tied to the actual point of connection, feeder, or internal node being reviewed.
It prevents the study handoff from drifting into generic relay language with no anchored board or feeder reference.

`Fault Level / SCC Ref` keeps the study sheet tied to the actual short-circuit or fault-level basis instead of leaving that assumption buried in free text only.

`Relay Scheme Basis` keeps the study lane honest about what protection logic the current handoff already depends on.

Typical meanings are:

- `Breaker / Interlock Only`
- `Plant Protection Relay`
- `Non-Export / Trip Relay`
- `Utility-Interface Protection`
- `External Relay Study Pack`

`Transfer Scheme Basis` keeps the study and commissioning lane honest about how sources are actually transferred or released.

Typical meanings are:

- `Manual / Local Changeover`
- `ATS / Staged Transfer`
- `Closed Transition / Sync`
- `Utility-Controlled Energization`
- `External Switching Study`

`Fault / Relay Basis Note` preserves the short protection assumption that must not be lost, for example:

- fault level basis
- relay proof requirement
- non-export protection basis
- export-limit or control note

`Case Owner / Desk`, `Submission / Review Date`, and `Authority / Review Comments` keep the live desk trail attached to the same packet and witness path once the job leaves pure planning.

`Current Revision / Response` keeps packet, study, and witness handoff aligned to the same live revision instead of drifting into a generic application reference.

`Next Action Owner / Handover`, `Next Action Due Date`, and `Next Required Action` keep the live handback explicit.

They answer:

- who owns the next step
- when it is due
- what must happen next

`Submission / Review Trail` records the short lifecycle path, for example:

- filed
- comments issued
- response / revision sent
- witness or clearance pending

That keeps later packet and witness exports traceable without pretending this is a full authority case-management system.
