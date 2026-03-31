# Utility Packet Routing Guide

This guide explains the structured packet-routing fields inside the optional `Utility / mini-grid inputs` block.

## What These Fields Add

They make the packet lane more specific than stage or case status alone.

The fields are:

- `Filing Channel`
- `Primary Hold Point`
- `Response Return Path`

## Why They Matter

Two jobs can both be:

- `Submitted / Under Review`

but still behave very differently.

One may be:

- installer-led
- waiting on protection clearance
- returning through an email or consultant loop

Another may be:

- already in a utility portal
- blocked on metering/export clearance
- returning through a portal redline cycle

These routing fields keep that difference visible.

## Field Meaning

### Filing Channel

Use this to show how the packet is really being filed.

Examples:

- internal prep only
- installer-led submission
- consultant / EPC submission
- portal / utility-desk filing
- externally controlled

### Primary Hold Point

Use this to show what is actually stopping the next gate.

Examples:

- internal release only
- study / protection clearance
- metering / export clearance
- witness / energization clearance
- externally controlled

### Response Return Path

Use this to show how the next response cycle will come back through the project team.

Examples:

- internal revision cycle
- installer-led response
- consultant / EPC response
- portal / redline response cycle
- externally controlled

## Where These Fields Flow

They now carry into:

- the utility hint under `System Configuration`
- `Interconnection / approval packet scaffold`
- the packet TXT brief
- the packet CSV data sheet

## Best Use Pattern

Use them once the packet is no longer only a planning note.

Good pattern:

1. set packet stage
2. set authority case status
3. set filing channel
4. set primary hold point
5. set response return path
6. then maintain revision, next action, and review comments

That keeps lane maturity, case posture, and real approval routing separate.

## Honest Boundary

These fields improve packet-routing clarity.

They do not mean:

- a stamped submission package exists
- the authority portal has accepted the packet
- the protection study is complete
- the interconnection review is fully engineered
