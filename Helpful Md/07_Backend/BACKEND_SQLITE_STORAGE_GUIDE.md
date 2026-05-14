# Backend SQLite Storage Guide

## Purpose

This guide explains the new durable-storage path for the premium backend.

The short version:

- JSON file mode still exists for local/dev and controlled beta
- SQLite is now the recommended single-node production storage mode
- Postgres is still the better fit only if you expect multi-instance backend hosting

## Why SQLite Was The Next Necessary Move

Before this change, the backend stored runtime state in JSON files only.

That was acceptable for:

- local reference use
- demos
- controlled pilot rollout

It was not the right long-term answer for public premium deployment.

SQLite is the cleanest next step because it gives us:

- durable storage
- one deployable file
- no extra service to provision
- a much smaller operational jump than Postgres

## What It Stores

The SQLite driver now persists:

- entitlements / licenses
- shared company profiles
- shared team handbacks
- shared team roster
- shared team seats
- audit log
- admin approvals
- admin delivery trail

The backend API surface stays the same.

## Runtime Configuration

Use these env vars:

```bash
BACKEND_STORAGE_DRIVER=sqlite
BACKEND_SQLITE_FILE=/var/lib/pv-premium-sync/premium_sync.sqlite
```

Optional:

```bash
BACKEND_DATA_DIR=/var/lib/pv-premium-sync
```

`BACKEND_DATA_DIR` still matters for:

- JSON mode
- the default parent path for sqlite when `BACKEND_SQLITE_FILE` is not set

## Node Version Note

With the current local runtime in this repo:

- Node `22.12.x`

the built-in SQLite module works, but it still needs:

```bash
node --experimental-sqlite backend/server.js
```

That is why the sqlite smoke test uses:

```bash
node --experimental-sqlite _test_backend_sqlite.js
```

If your deployed Node version no longer requires that flag, the same storage driver keeps working with a normal start command.

## Seed And Fallback Behavior

Bundled example files still live in:

- `backend/data/*.example.json`

When the sqlite database is empty, the backend seeds initial state from those example files.

That means:

- the repo still has readable example data
- production runtime writes no longer need to happen inside the repo tree

## Recommended Production Shape

For a premium single-node deployment:

1. mount a persistent writable path
2. point `BACKEND_SQLITE_FILE` at that path
3. run the backend with real env vars
4. verify posture with:

```bash
node backend/server.js --check
```

You should see:

- `storage driver: sqlite`
- `sqlite file: ...`

## Verification

The premium release gate now includes sqlite coverage through:

- `node --experimental-sqlite _test_backend_sqlite.js`

That smoke test proves:

- sqlite startup
- durable write of a shared company profile
- persistence across backend restart

## Honest Stop-Point

SQLite closes the biggest remaining storage gap for a single-node premium `v1`.

After this, the remaining real closeout items are:

- backup and restore policy
- entitlement source-of-truth decision
- Postgres only if you decide to scale beyond one backend instance
