# Plant Feeder Brief Guide

## Purpose

This guide explains the installer-facing `Plant Feeder Brief` export.

It is not a final one-line diagram.

It is a lightweight handoff output built from the live plant-scoping result so the feeder story can move into:

- site notes
- one-line preparation
- protected-bus discussion
- generator / grid handoff review

## What It Includes

The brief includes:

- date
- audience mode
- client label
- site label
- location label
- plant scope
- distribution topology
- interconnection scope
- current boundary statement
- recommended feeder schedule
- board / source schedule
- board procurement / breaker / cable review
- utility / mini-grid engineering lane
- source detail per feeder
- dominant feeder roles
- open scoping items
- key plant risks

## Where It Comes From

The brief reuses the same live objects already driving the plant output:

- plant scope
- distribution topology
- interconnection scope
- supported-load story
- recommended feeder schedule

That matters because the export is not a second plant model.

## When To Use It

Use it when:

- the site is becoming a mini-plant or multi-feeder job
- the proposal needs clearer feeder-level handoff
- the installer wants a lightweight scoping brief before drawing a one-line
- the project needs protected / assisted / outside-promise lanes explained internally

## When Not To Use It

Do not treat it as:

- a stamped one-line diagram
- a protection study
- a feeder coordination study
- a utility interconnection package
- final commissioning documentation

## Export Actions

The plant panel now exposes:

- `Copy feeder brief`
- `Download TXT`

Both actions use the same generated text payload.

## Related Screen Output

The live plant result now also shows a `Board / source schedule` beside the feeder brief.

Use them together:

- feeder brief for copy / TXT handoff
- board / source schedule for quick one-line and board-note alignment
- lane-level current screen for quick feeder/source carry checks before the breaker schedule is frozen
- carry tags for quick source / breaker / transfer shorthand before the one-line draft leaves the app

## Honest Boundary

This is the correct scope for the current product stage:

- stronger than leaving feeder intent trapped inside the results screen
- lighter and more honest than claiming full drawing-pack or utility-study output
