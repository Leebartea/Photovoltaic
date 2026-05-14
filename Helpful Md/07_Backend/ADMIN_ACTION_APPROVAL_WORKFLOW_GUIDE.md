# Admin Action Approval Workflow Guide

## Purpose

The premium backend now has a small approval queue for the highest-risk shared-seat actions.

This is not a second execution engine.

The actual seat change still happens on the existing:

- `POST /api/team-seats/recovery`

The approval queue simply makes a narrow set of sensitive actions explicit and auditable before that route is allowed to run them.

## Approval-Gated Actions

The backend currently requires approval for:

- `rotate_access_code`
- `disable_sign_in`
- `suspend_seat`

Lower-risk actions still run directly:

- `revoke_active_sessions`
- `clear_signin_lockout`
- `restore_active`

## Routes

The backend now exposes:

- `GET /api/admin/action-approvals`
- `POST /api/admin/action-approvals/request`
- `POST /api/admin/action-approvals/review`

These are session-backed admin routes.

They require a valid short-lived backend seat session for a seat that still holds `team_seat_publish`.

## How It Works

1. An admin requests approval for a specific high-risk action and target seat.
2. The backend records a pending approval entry.
3. An admin reviews that request and approves or rejects it.
4. Once approved, the normal recovery route can execute the matching action.
5. When the action executes, the backend consumes the approval and writes that to audit too.

This keeps:

- request
- review
- execution

inside one backend trust boundary, with audit trace for each step.

## Matching Rule

The approval is matched against:

- `installationKey`
- `actionType`
- `recoveryAction`
- `targetSeatId`

For now, the queue is intentionally narrow and only supports:

- `actionType = team_seat_recovery`

## Distinct Reviewer Rule

If an installation has two or more active `Workspace Admin` seats, the backend requires a different active `Workspace Admin` to approve a queued request.

If there is only one active `Workspace Admin`, the same admin can still request and approve, but it must happen as two explicit backend steps.

That keeps the single-admin demo and small-team path workable without pretending it is dual control.

## Admin Console Use

The hosted `/admin` shell now includes:

- approval queue refresh
- high-risk action request
- approve selected
- reject selected

Use that surface to review the queue.

After approval, retry the protected recovery action from the main app or any other allowed client using the same backend installation.

## Main App Behavior

The main calculator UI does not execute approval review itself.

If a gated action is attempted without approval:

- the backend returns `approvalRequired: true`
- the calculator shows a clear message telling the operator to use `/admin`

That keeps the core app honest instead of quietly bypassing the approval rule.

## Audit Categories

Approval lifecycle is written to audit under:

- `category: admin_action_approval`

With actions such as:

- `request`
- `approve`
- `reject`
- `consume`

## Honest Boundary

This is the right premium-stage control because it adds real backend process control without:

- moving calculator math server-side
- storing sensitive access codes in the approval queue
- inventing a second shadow recovery engine

It improves trust around operator posture changes while keeping the rest of the product offline-first.
