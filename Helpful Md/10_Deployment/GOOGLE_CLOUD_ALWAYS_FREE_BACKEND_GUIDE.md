# Google Cloud Always Free — Backend Guide

## Purpose

Use this guide when you want to deploy the PV calculator backend on Google Cloud without incurring monthly hosting costs.

This is the recommended alternative to Oracle Cloud Always Free. Oracle's free compute shapes have well-documented capacity errors in many regions — provisioning is effectively a lottery. Google Cloud Always Free gives you a **guaranteed always-on free quota**, no SSH, no cron setup, no VM to manage.

The entire backend (entitlement verification, team seats, admin console, audit log, delivery trail) is lite work. It comfortably fits inside Google's permanent free limits at realistic installer-tooling usage levels.

---

## Decision: Oracle vs Google Cloud

| Factor | Oracle Always Free | Google Cloud Always Free |
|---|---|---|
| Provisioning reliability | Lottery — `out of host capacity` errors common in many regions | Guaranteed — GCP free tier is instant and consistent |
| VM management | SSH required; nginx, systemd, cron all manual | None — serverless container via Cloud Run |
| Cold starts | None (always-on VM) | Yes — ~1–3s first request after idle. Acceptable for backend API calls |
| Storage engine | SQLite (file-based, works as-is) | Firestore (NoSQL) — requires a light adapter refactor |
| Auth | Roll-your-own session tokens (already implemented in backend) | Firebase Auth available, but current custom session logic can stay |
| Backup | Custom cron scripts already in deploy/ | Cloud Scheduler + Cloud Storage, or periodic manual export |
| Signup friction | High — capacity errors, VM provisioning delays, shell setup | Low — Cloud Console account, enable billing, deploy in minutes |
| Free storage ceiling | ~200 GB block storage (Oracle VM disk) | 1 GB Firestore + 5 GB Cloud Storage |
| Best for | Lift-and-shift, zero code change, comfortable with SSH | Modern serverless, no server ops, light Firestore refactor |

**Recommendation:** If Oracle provisioning keeps failing in your region, use Google Cloud. The Firestore refactor is about 150 lines of adapter code across the 8 data stores. Everything else stays identical.

---

## What Stays Client-Side (No Backend Needed)

The backend is genuinely lite because 100% of the engineering runs in the browser:

- All PV sizing calculations
- Battery, inverter, PV, cable, protection engine output
- Commercial finance and ROI advisory
- PDF generation (jsPDF, fully offline)
- All proposal output and BOM generation
- Local Cost Build-Up pricing mode

The backend only handles:

- License entitlement verification (who has paid access)
- Team seat issuance, session, recovery
- Admin console (license management, delivery trail)
- Audit log (who accessed what, when)
- Company profile sync (optional)

---

## The 8 Data Stores and Their Firestore Mapping

The current backend uses flat JSON files (`STORAGE_DRIVER=json`) or SQLite (`STORAGE_DRIVER=sqlite`). On Google Cloud, both are replaced by Firestore collections.

| Data file | Purpose | Firestore collection | Document key |
|---|---|---|---|
| `licenses.json` | License entitlement records — who has paid access, expiry, seat count | `licenses` | `{licenseKey}` |
| `company_profiles.json` | Installer company branding profiles (name, logo URL, contact) | `companyProfiles` | `{installationId}` |
| `team_handbacks.json` | Pending team handback records from admin to seat holders | `teamHandbacks` | `{handbackId}` |
| `team_roster.json` | Team member records linked to a license — names, roles, statuses | `teamRoster` | `{rosterId}` |
| `team_seats.json` | Seat codes, invite tokens, session tokens, lockout state | `teamSeats` | `{seatCode}` |
| `audit_log.json` | Time-stamped audit events — logins, license checks, admin actions | `auditLog` | `{eventId}` (auto-ID) |
| `admin_action_approvals.json` | Pending/reviewed admin action approval workflow records | `adminActionApprovals` | `{approvalId}` |
| `admin_delivery_trail.json` | Delivery dispatch records and acknowledgements | `adminDeliveryTrail` | `{trailId}` |

All document fields are the same JSON structure already used in the flat file store — no schema redesign required.

---

## All API Routes

The backend exposes these routes. All of these run identically on Cloud Run — only the storage layer changes.

### Public routes (no auth required)
| Route | Purpose |
|---|---|
| `GET /health` | Health check — returns `{"status":"ok"}` |
| `GET /api/entitlement/resolve` | Verify a license key — used by the frontend to gate premium features |

### Seat and session routes (require valid seat session token)
| Route | Purpose |
|---|---|
| `POST /api/seat-session/issue` | Authenticate a team seat and issue a session token |
| `POST /api/seat-session/renew` | Renew an active session before it expires |
| `POST /api/seat-session/revoke` | Revoke a session (logout) |
| `GET /api/team-seats` | Read the caller's seat record |
| `GET /api/team-seats/recovery` | Read recovery code state |
| `POST /api/team-seats/recovery-code/issue` | Issue a new recovery code for the seat |
| `POST /api/team-seats/recovery-code/redeem` | Redeem a recovery code to regain access |
| `POST /api/team-seats/invite/redeem` | Redeem an invite token to activate a new seat |
| `GET /api/company-profiles` | Read the company profile linked to the caller's license |
| `GET /api/team-handbacks` | Read pending handbacks for the caller's seat |
| `GET /api/team-roster` | Read the team roster for the caller's license |
| `GET /api/audit-log` | Read the caller's recent audit events |

### Admin routes (require admin API key header)
| Route | Purpose |
|---|---|
| `GET /api/admin/posture` | Admin console boot — returns licenses, seats, audit summary |
| `GET /api/admin/session-context` | Verify admin session is still valid |
| `GET /api/admin/audit-export` | Export the full audit log |
| `GET /api/admin/action-approvals` | List pending admin action approvals |
| `POST /api/admin/action-approvals/request` | Submit a new admin action for approval |
| `POST /api/admin/action-approvals/review` | Approve or reject a pending admin action |
| `GET /api/admin/delivery-trail` | List all delivery trail records |
| `POST /api/admin/delivery-trail/record` | Record a new delivery dispatch |
| `POST /api/admin/delivery-trail/acknowledge` | Mark a delivery as acknowledged by the recipient |
| `POST /api/admin/delivery-dispatch/prepare` | Prepare a delivery dispatch pack |
| `POST /api/team-seats/invite/issue` | Issue a seat invite token (admin action) |
| `GET /api/team-roster` | Read full team roster (admin view) |

### Static routes
| Route | Purpose |
|---|---|
| `GET /admin` | Admin console HTML |
| `GET /admin/app.js` | Admin console JS |
| `GET /admin/app.css` | Admin console CSS |

---

## The Trade-Off Fix: SQLite/JSON → Firestore Adapter

The entire storage layer in `backend/server.js` is encapsulated in 8 store loader functions (`readLicenses`, `readCompanyProfiles`, etc.) and their write counterparts. The Firestore migration is:

1. Replace each `readJsonFile(path)` call with a Firestore collection read
2. Replace each `writeJsonFile(path, data)` call with a Firestore write

The HTTP route logic, auth middleware, CORS handling, and all business logic stay unchanged.

### Step 1 — Install Firestore client

```bash
cd backend/
npm install @google-cloud/firestore
```

### Step 2 — Add Firestore adapter module

Create `backend/firestore-adapter.js`:

```js
'use strict';
const { Firestore } = require('@google-cloud/firestore');

// Only used when STORAGE_DRIVER=firestore
const db = new Firestore();

async function readCollection(collection) {
    const snap = await db.collection(collection).get();
    const records = {};
    snap.forEach(doc => { records[doc.id] = doc.data(); });
    return records;
}

async function writeDocument(collection, id, data) {
    await db.collection(collection).doc(id).set(data, { merge: true });
}

async function appendDocument(collection, data) {
    await db.collection(collection).add(data);
}

async function readDocument(collection, id) {
    const doc = await db.collection(collection).doc(id).get();
    return doc.exists ? doc.data() : null;
}

module.exports = { readCollection, writeDocument, appendDocument, readDocument };
```

### Step 3 — Add STORAGE_DRIVER=firestore branch in server.js

At the top of `server.js`, after the existing `STORAGE_DRIVER` constant, add:

```js
const STORAGE_DRIVER_FIRESTORE = STORAGE_DRIVER === 'firestore';
const firestoreAdapter = STORAGE_DRIVER_FIRESTORE ? require('./firestore-adapter') : null;
```

Then in each store loader, add the Firestore branch before the existing JSON/SQLite path. Example for `readLicenses()`:

```js
async function readLicenses() {
    if (STORAGE_DRIVER_FIRESTORE) {
        const records = await firestoreAdapter.readCollection('licenses');
        return { installations: records };
    }
    // existing JSON/SQLite path stays below unchanged
    const preferredPath = fs.existsSync(PRIMARY_DATA_FILE) ? PRIMARY_DATA_FILE : EXAMPLE_DATA_FILE;
    // ... rest unchanged
}
```

Apply the same pattern to all 8 stores:

| Store function | Firestore collection | Read method | Write method |
|---|---|---|---|
| `readLicenses` / `writeLicenses` | `licenses` | `readCollection` | `writeDocument` |
| `readCompanyProfiles` / `writeCompanyProfiles` | `companyProfiles` | `readCollection` | `writeDocument` |
| `readTeamHandbacks` / `writeTeamHandbacks` | `teamHandbacks` | `readCollection` | `writeDocument` |
| `readTeamRoster` / `writeTeamRoster` | `teamRoster` | `readCollection` | `writeDocument` |
| `readTeamSeats` / `writeTeamSeats` | `teamSeats` | `readCollection` | `writeDocument` |
| `readAuditLog` / `writeAuditLog` | `auditLog` | `readCollection` | `appendDocument` (append-only) |
| `readAdminActionApprovals` / `writeAdminActionApprovals` | `adminActionApprovals` | `readCollection` | `writeDocument` |
| `readAdminDeliveryTrail` / `writeAdminDeliveryTrail` | `adminDeliveryTrail` | `readCollection` | `writeDocument` |

### Step 4 — Set STORAGE_DRIVER=firestore in backend.env

```bash
STORAGE_DRIVER=firestore
```

No other application env vars change — all the auth, CORS, session TTL, API key, pepper, and signing secret vars stay identical.

---

## Environment Variables: Oracle vs Google Cloud

All existing `backend.env` variables carry over unchanged. Only two things change:

| Variable | Oracle value | Google Cloud value |
|---|---|---|
| `HOST` | `127.0.0.1` (behind nginx) | `0.0.0.0` (Cloud Run terminates TLS) |
| `PORT` | `5055` | `8080` (Cloud Run expects 8080) |
| `STORAGE_DRIVER` | `json` or `sqlite` | `firestore` |
| `BACKEND_DATA_DIR` | `/var/data/pv-premium-sync/` | Not used (Firestore has no local path) |
| `BACKEND_SQLITE_FILE` | `/var/data/.../premium_sync.sqlite` | Not used |

Everything else (`BACKEND_API_KEYS`, `BACKEND_ACTION_LINK_SECRET`, `BACKEND_ALLOWED_ORIGINS`, `BACKEND_SEAT_CODE_PEPPER`, `SEAT_SESSION_TTL_MS`, etc.) is **identical** — copy them from your Oracle `backend.env` directly into Cloud Run env vars or Secret Manager.

---

## Free Tier Limits vs Realistic Usage

| Service | Free limit | Realistic usage (200 active users/month) | Headroom |
|---|---|---|---|
| Cloud Run requests | 2M/month | ~15k/month (seat logins, license checks, admin) | 130× |
| Cloud Run CPU | 360k CPU-seconds/month | ~1k CPU-seconds/month (lite JSON work) | 360× |
| Firestore reads | 50,000/day | ~500/day | 100× |
| Firestore writes | 20,000/day | ~200/day | 100× |
| Firestore storage | 1 GB | ~10 MB (JSON records for 200 users) | 100× |
| Cloud Storage | 5 GB | ~100 MB (backup exports) | 50× |
| Secret Manager | 6 active versions | 5 secrets in use | 1 spare |

This app will not hit the free tier ceiling until it reaches several thousand daily active paying users — at which point it is generating revenue that covers Google Cloud costs with ease.

---

## Deploy Steps (Cloud Run)

### 1. Create Google Cloud project and enable APIs

```bash
gcloud projects create pv-calculator-backend --set-as-default
gcloud services enable run.googleapis.com firestore.googleapis.com \
    secretmanager.googleapis.com cloudbuild.googleapis.com
```

### 2. Create Firestore database

```bash
gcloud firestore databases create --location=us-central1
```

### 3. Store secrets

```bash
printf "your-api-key-here" | gcloud secrets create BACKEND_API_KEYS --data-file=-
printf "your-signing-secret" | gcloud secrets create BACKEND_ACTION_LINK_SECRET --data-file=-
printf "https://your-user.github.io/your-repo" | gcloud secrets create BACKEND_ALLOWED_ORIGINS --data-file=-
printf "your-seat-pepper" | gcloud secrets create BACKEND_SEAT_CODE_PEPPER --data-file=-
```

### 4. Create Dockerfile in backend/

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=8080
ENV HOST=0.0.0.0
ENV STORAGE_DRIVER=firestore
CMD ["node", "server.js"]
```

### 5. Deploy to Cloud Run

```bash
gcloud run deploy pv-backend \
  --source backend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-secrets="BACKEND_API_KEYS=BACKEND_API_KEYS:latest,BACKEND_ACTION_LINK_SECRET=BACKEND_ACTION_LINK_SECRET:latest,BACKEND_ALLOWED_ORIGINS=BACKEND_ALLOWED_ORIGINS:latest,BACKEND_SEAT_CODE_PEPPER=BACKEND_SEAT_CODE_PEPPER:latest"
```

Cloud Run returns a permanent HTTPS URL. Set this as `BACKEND_URL` in your frontend's env config or in `dist/web/assets/app.js` where the backend URL is consumed.

### 6. Verify health check

```bash
curl https://your-cloud-run-url/health
# Expected: {"status":"ok"}
```

### 7. Set up daily Firestore backup

```bash
gsutil mb gs://pv-calculator-backups-$(gcloud config get-value project)

gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --location=us-central1 \
  --uri="https://firestore.googleapis.com/v1/projects/$(gcloud config get-value project)/databases/(default):exportDocuments" \
  --message-body="{\"outputUriPrefix\": \"gs://pv-calculator-backups-$(gcloud config get-value project)/\"}" \
  --oauth-service-account-email=$(gcloud iam service-accounts list --format='value(email)' | head -1)
```

---

## Update BACKEND_ALLOWED_ORIGINS

Set this to your GitHub Pages URL. Example:

```
BACKEND_ALLOWED_ORIGINS=https://leebartea.github.io/Photovoltaic
```

The backend already reads this env var and uses it to set CORS `Access-Control-Allow-Origin`. No code change needed.

---

## After Deployment

The frontend (`pv_calculator_ui.html` and `dist/web/`) already has the backend URL wiring points for:
- `GET /api/entitlement/resolve` — called on app load to check license
- `POST /api/seat-session/issue` — called on team seat login
- `GET /api/admin/posture` — called by admin console

Set the Cloud Run HTTPS URL as the backend URL in the frontend's settings, rebuild, and push. GitHub Pages continues to serve the static frontend. Cloud Run handles all API calls.

---

## Oracle Migration Path (If Already Running on Oracle)

1. Export each JSON file from the Oracle VM (`scp` the `data/*.json` files locally)
2. Write a one-off migration script that reads each JSON file and writes each record to the matching Firestore collection using the Firestore Admin SDK
3. Verify record counts match
4. Switch DNS / backend URL in the frontend from Oracle IP to Cloud Run HTTPS URL
5. Decommission the Oracle VM

The migration can be done with zero downtime: both backends can run simultaneously during the switchover.

---

*Added: 2026-05-14 | Last updated: 2026-05-14*
