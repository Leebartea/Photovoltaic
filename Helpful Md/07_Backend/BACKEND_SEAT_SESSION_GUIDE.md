# Backend Seat Session Guide

## Purpose

This guide explains the short-lived seat-session layer for the optional premium backend.

It exists so we can stop treating a browser-held API key as the normal runtime credential.

## What It Does

The backend now supports:

- `POST /api/seat-session/issue`
- `POST /api/seat-session/renew`
- `POST /api/seat-session/revoke`

The frontend now supports:

- `Issue Seat Session`
- `Renew Seat Session`
- `Revoke Backend Session`
- `Clear Local Session`
- a live session preview showing actor seat, issue time, expiry, and target match
- auth-mode labeling for `Seat sign-in`, `API bootstrap`, and `Session renew`

## Security Posture

The API key is now the bootstrap credential.

Normal protected premium sync should use the short-lived seat session instead.

Important behavior:

- session tokens are memory-only in the browser
- session tokens are not stored in browser local storage
- session tokens are not included in project snapshots
- seat access codes are also memory-only in the browser
- seat access codes are not included in project snapshots
- changing backend target or active team seat should clear the old session
- revoke removes the active token server-side
- renew rotates the active token server-side

## When To Use It

Use seat sessions when:

- backend sync is enabled
- a shared team-seat library already exists
- the correct active named team seat is selected
- you want shared premium sync without leaving the raw API key active

## Current Flow

1. Configure backend base URL and installation key.
2. Activate the correct team seat.
3. Prefer seat sign-in with the seat access code.
4. Use the backend API key only as bootstrap fallback when needed.
5. Continue protected premium sync through the short-lived session.
6. Renew or revoke the session as the desk posture changes.

## Honest Boundary

This is stronger than browser-held API-key-only posture.

It is still not full enterprise authentication.

It does not yet provide:

- user login
- refresh tokens
- persistent identity provider integration
- revocation across clustered backend nodes

It is the right premium-stage trust improvement for the current architecture.

For the fuller flow, also read:

- `Helpful Md/TEAM_SEAT_SIGNIN_AND_SESSION_LIFECYCLE_GUIDE.md`
