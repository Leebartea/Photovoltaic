# Utility And Mini-Grid Engineering Lane Guide

## Purpose

This guide explains the `Utility / mini-grid engineering lane` block now shown in the plant-scoping result.

It exists to answer a simple question:

- when should the project leave the normal captive-site workflow and move into a separate engineering track?

## What It Does

The block does not pretend to perform:

- feeder studies
- protection grading
- selectivity studies
- dispatch studies
- formal interconnection engineering

Instead, it does something narrower and more useful:

- it tells the installer when those studies now belong in the next workflow
- it keeps the next bounded handoff blocks visible in the same result:
  - `Interconnection / approval packet scaffold`
  - `Feeder / protection study input capture`
  - `Commissioning / witness-test prep`

## Three Honest Outcomes

### Captive-Site Plant Carry-Through

For multi-feeder captive sites, the block stays inside the current product lane and says:

- carry feeder lanes into one-line prep
- keep breaker tags and board labels aligned
- keep the three-phase feeder story honest

### Private-Microgrid Engineering Lane

For heavier private internal-plant jobs, the block says the next workflow should prepare:

- one-line and feeder protection basis
- transfer and source coordination logic
- load-shed / dispatch sequence
- node metering and commissioning plan

### Public-Service / Utility-Facing Lane

For public-service or utility-adjacent jobs, the block says the next workflow must include:

- interconnection application pack
- formal protection and feeder studies
- operating / dispatch philosophy
- witness testing and commissioning sequence

## Why This Matters

Without this lane, the calculator could still size the equipment honestly but leave the user with no clear answer about:

- when the quote should stop being treated like a normal captive-site job
- when separate engineering responsibility really begins

This block closes that gap.

The companion blocks close the next gap:

- what packet basis should be carried forward
- what study inputs should be preserved
- what commissioning / witness hold points should be prepared
- what formal study items must now leave the app for external engineering

## Honest Boundary

Use this output to:

- decide whether the current app is still the right working surface
- identify the next engineering track
- preserve proposal honesty

Do not use it as:

- a substitute for the separate studies it names
- proof that the full utility / mini-grid engineering has been completed
