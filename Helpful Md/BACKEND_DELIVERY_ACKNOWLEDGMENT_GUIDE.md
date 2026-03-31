# Backend Delivery Acknowledgment Guide

## Purpose

This guide explains the acknowledgment step for the backend delivery trail.

The premium handoff loop is now:

1. issue a one-time invite or recovery item
2. prepare the dispatch pack if needed
3. record how it was delivered
4. acknowledge that the handoff was actually received or closed

That fourth step matters because a delivery record alone only says:

- we sent it

It does not say:

- the target desk received it
- the handoff loop was closed

## Route

The backend now exposes:

- `POST /api/admin/delivery-trail/acknowledge`

It requires:

- a valid short-lived admin seat session
- a seat with `team_seat_publish`

## Required Inputs

- `installationKey`
- `entryId`

Optional:

- `acknowledgmentNote`

## What Changes On The Entry

The selected delivery entry now carries:

- `acknowledgmentStatus`
- `acknowledgedAt`
- `acknowledgedBySeatId`
- `acknowledgedByLabel`
- `acknowledgmentNote`

The current statuses are:

- `pending`
- `acknowledged`

## Audit Relationship

Acknowledgment also writes an audit event:

- category: `admin_delivery`
- action: `acknowledge`

That keeps the handoff closeout inside the same backend trace model as:

- issue
- dispatch preparation
- delivery recording

## Admin Console Behavior

The hosted `/admin` shell now supports:

- filtering delivery entries by acknowledgment status
- entering an acknowledgment note
- marking pending entries as acknowledged directly from the trail

That makes the hosted admin shell a full loop surface instead of stopping at dispatch and raw delivery record.

## Honest Boundary

Acknowledgment is still operator-driven.

It means:

- a named admin seat confirmed that the handoff was closed

It does not mean:

- the backend independently verified an external provider receipt

That is still the right tradeoff for the current premium stage.
