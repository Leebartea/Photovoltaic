# Plant Dispatch And Restoration Sequence Guide

## Purpose

This guide explains the `Dispatch / load-shed / restoration sequence` block in the plant result.

It is a bounded operating handoff built from the existing feeder promise lanes:

- `Protected`
- `Assisted`
- `Outside promise`

## What The Block Answers

- what should energize first
- what should be shed first
- what should restore only after source stability is confirmed
- when the app is warning that a formal dispatch study is still required

## How To Read It

### Base energization order

This tells you:

- which protected feeders should come on first
- when assisted feeders may join
- which excluded feeders must stay out

### Load-shed order

This tells you the safe commercial reading of a bad event:

- shed excluded feeders first
- stage down assisted feeders next
- preserve protected feeders last

### Restoration sequence

This tells you how the site should come back:

- restore protected feeders first
- confirm source stability
- reintroduce assisted feeders in stages

### Formal dispatch governance

This only appears when the project has crossed into a heavier utility / mini-grid lane.

Read it as:

- the app is no longer claiming that this bounded sequence is enough by itself
- a separate formal dispatch / restoration workflow is now required

## Why This Is Useful

It closes a practical gap between:

- feeder labels
- board/source schedule
- breaker/cable handoff

and:

- real operating behavior during outage, recovery, and staged restart

## Honest Boundary

This block is helpful for:

- captive mini-plants
- multi-feeder commercial sites
- private plant handoff prep

It is not a substitute for:

- formal plant dispatch studies
- utility witness-testing procedures
- full commissioning logic
