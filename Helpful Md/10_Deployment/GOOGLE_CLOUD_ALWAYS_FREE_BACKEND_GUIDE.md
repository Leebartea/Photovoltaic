# Google Cloud Always Free — Backend Guide

## Purpose

Use this guide when you want to deploy the PV calculator backend on Google Cloud without incurring monthly hosting costs.

This is the modern serverless alternative to Oracle Cloud Always Free. No SSH, no cron setup, no VM to manage. The entire lite backend (payments, user auth, license keys, project sync) fits inside Google's permanent always-free limits at realistic usage levels.

---

## Can Google Cloud Always Free Power This Backend?

**Yes — with a light Firestore refactor.**

The current backend (`backend/server.js`) uses SQLite via `node:sqlite` with a persistent host filesystem. Google Cloud Run has no persistent disk, so SQLite cannot be used as-is. The refactor replaces SQLite storage calls with Firestore reads/writes. The Express.js HTTP structure, middleware, and API route logic can stay unchanged.

What requires no change:
- All PV calculation logic (100% client-side, never touches the backend)
- PDF generation (client-side)
- All proposal, sizing, and engineering output

What the backend handles (lite work only):
- License key issuance and verification
- Stripe payment webhook processing
- User account creation and session tokens
- Team seat management and role enforcement
- Saved project cloud sync (optional premium feature)
- PDF delivery audit log
- Admin console API

All of this fits Google Cloud Always Free.

---

## Always-Free Services Used

### Cloud Run

- **Free tier (permanent):** 2 million requests/month, 360,000 CPU-seconds/month, 180,000 GB-seconds/month
- **What it runs:** The Express.js backend as a container. No persistent disk. No SSH.
- **Cold starts:** First request after idle takes ~1–3 seconds. Acceptable for backend webhooks and API calls where the user does not notice a half-second delay.
- **Scales to zero:** No idle cost. Only billed when handling requests.

### Firestore

- **Free tier (permanent):** 1 GB storage, 50,000 document reads/day, 20,000 document writes/day, 20,000 document deletes/day
- **What it stores:** User accounts, license keys, team seats, saved projects, payment records, audit logs
- **Replaces:** SQLite in `backend/server.js`
- **Realistic usage:** 100 active users × 10 API calls/day = 1,000 reads/day — well within 50,000/day limit

### Cloud Functions (alternative to Cloud Run for webhooks)

- **Free tier (permanent):** 2 million invocations/month, 400,000 GB-seconds/month
- **What it runs:** Stripe payment webhooks, license-generation triggers
- **Use case:** If you want payment processing fully isolated from the main backend

### Firebase Authentication

- **Free tier (permanent):** 10,000 authentications/month (email/password, Google, magic link)
- **What it handles:** Installer login, team seat auth, session management
- **Replaces:** Custom session token logic in the current backend

### Cloud Storage

- **Free tier (permanent):** 5 GB storage, 1 GB egress/month
- **What it stores:** Backup exports (JSON snapshots of Firestore data), optionally PDF delivery artifacts

### Secret Manager

- **Free tier (permanent):** 6 active secret versions
- **What it stores:** `STRIPE_SECRET_KEY`, `BACKEND_ACTION_LINK_SECRET`, `BACKEND_ALLOWED_ORIGINS`, `FIREBASE_SERVICE_ACCOUNT`

---

## Architecture — Lite Backend on Google Cloud

```
[Client Browser]
      |
      | HTTPS
      v
[GitHub Pages / Netlify]          ← Static frontend (free, no change)
      |
      | API calls (license, sync, payment webhook)
      v
[Cloud Run — Express.js container]
      |
      +--→ [Firestore]            ← User data, license keys, seats, audit log
      |
      +--→ [Firebase Auth]        ← Session tokens, user identity
      |
      +--→ [Secret Manager]       ← API keys, signing secrets
      |
      +--→ [Cloud Storage]        ← Backup snapshots

[Stripe]
      |
      | Payment webhooks
      v
[Cloud Functions or Cloud Run /webhook route]
      |
      v
[Firestore — payment records + license issuance]
```

---

## What Each Backend Route Maps To

| Current Route | Purpose | Google Cloud Implementation |
|---|---|---|
| `POST /api/verify-license` | Check if a license key is valid | Cloud Run → Firestore read |
| `POST /api/issue-license` | Issue license after payment confirmed | Cloud Functions (Stripe webhook) → Firestore write |
| `POST /api/sync-project` | Save a project to the cloud | Cloud Run → Firestore write |
| `GET /api/sync-project` | Load a saved project | Cloud Run → Firestore read |
| `POST /api/team/invite` | Invite a team seat | Cloud Run → Firestore write + Firebase Auth email |
| `GET /api/admin/licenses` | Admin: list all licenses | Cloud Run → Firestore query (admin-role gate) |
| `POST /api/stripe/webhook` | Receive Stripe payment events | Cloud Functions → Firestore write |
| `GET /health` | Health check | Cloud Run → static 200 |

---

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g., `pv-calculator-backend`)
3. Enable billing (required even for free tier — Google holds a card but does not charge within free limits)

### 2. Enable APIs

Enable these APIs in the Cloud Console or via CLI:

```bash
gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable firebase.googleapis.com
```

### 3. Set Up Firestore

In the Cloud Console:
- Go to Firestore → Create database
- Choose **Native mode** (not Datastore mode)
- Choose a region close to your users (e.g., `us-central1` for broad global coverage, or `europe-west1`)

### 4. Set Up Firebase Authentication

1. Go to the Firebase Console → Add project → select your GCP project
2. Enable Authentication → Sign-in method → Email/Password
3. Optionally enable Google sign-in for admin console access

### 5. Adapt the Backend (Firestore Refactor)

Replace SQLite storage in `backend/server.js` with Firestore client calls:

```js
// Before (SQLite):
const db = new Database(':memory:');
db.exec(`CREATE TABLE licenses (...)`);
const row = db.prepare('SELECT * FROM licenses WHERE key = ?').get(key);

// After (Firestore):
const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();
const doc = await db.collection('licenses').doc(key).get();
const row = doc.exists ? doc.data() : null;
```

Key Firestore collections:
- `licenses/{key}` — license records
- `users/{uid}` — user account data
- `seats/{inviteToken}` — team seat invitations
- `projects/{uid}/{projectId}` — cloud-synced projects
- `payments/{stripeEventId}` — Stripe payment records
- `auditLog/{docId}` — delivery and admin events

### 6. Containerise and Deploy to Cloud Run

Create a `Dockerfile` in `backend/`:

```dockerfile
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=8080
CMD ["node", "server.js"]
```

Deploy:

```bash
gcloud run deploy pv-backend \
  --source backend/ \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

Cloud Run returns a permanent HTTPS URL (e.g., `https://pv-backend-xxxx-uc.a.run.app`). Set this as `BACKEND_URL` in your frontend `.env` or `backend.env`.

### 7. Set Secrets

```bash
echo -n "sk_live_..." | gcloud secrets create STRIPE_SECRET_KEY --data-file=-
echo -n "your-signing-secret" | gcloud secrets create BACKEND_ACTION_LINK_SECRET --data-file=-
echo -n "https://your-user.github.io/your-repo" | gcloud secrets create BACKEND_ALLOWED_ORIGINS --data-file=-
```

Grant Cloud Run access to secrets:

```bash
gcloud secrets add-iam-policy-binding STRIPE_SECRET_KEY \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 8. Set Up Backup (Cloud Storage)

Create a backup bucket:

```bash
gsutil mb -l us-central1 gs://pv-calculator-backups
```

Schedule a daily Firestore export using Cloud Scheduler:

```bash
gcloud scheduler jobs create http firestore-daily-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default):exportDocuments" \
  --message-body='{"outputUriPrefix": "gs://pv-calculator-backups/"}' \
  --oauth-service-account-email=YOUR_SERVICE_ACCOUNT
```

---

## Free Tier Limits in Practice

| Service | Free Limit | Realistic Usage (100 active users/day) | Headroom |
|---|---|---|---|
| Cloud Run requests | 2M/month | ~10k/month | 200× |
| Firestore reads | 50k/day | ~1k/day | 50× |
| Firestore writes | 20k/day | ~500/day | 40× |
| Firebase Auth | 10k/month | ~200/month | 50× |
| Cloud Storage | 5 GB | ~50 MB/month | Effectively unlimited |
| Secret Manager | 6 versions | 4 secrets in use | 2 spare |

This app will not exceed the free tier at realistic small-business installer tooling usage levels unless it scales to thousands of daily active users — at which point it is generating revenue that easily covers the cost.

---

## Comparison: Google Cloud vs Oracle Always Free

| Factor | Google Cloud Always Free | Oracle Always Free |
|---|---|---|
| VM management | None — serverless | SSH + manual cron + nginx setup |
| Cold starts | Yes (~1–3s on Cloud Run) | No (always-on VM) |
| Storage engine | Firestore (NoSQL) | SQLite (relational, file-based) |
| Backend refactor needed | Light — replace SQLite calls with Firestore | None — lift-and-shift |
| Auth integration | Firebase Auth (built-in) | Roll-your-own or add a library |
| Backup tooling | Cloud Scheduler + Cloud Storage | Custom cron scripts |
| Signup friction | Moderate (billing card required) | High (provisioning errors common) |
| Database size limit | 1 GB Firestore free | Effectively disk-limited (Oracle gives 200 GB) |
| Best for | Teams comfortable with Google APIs or Firebase | Developers who want lift-and-shift with no code change |

---

## Honest Recommendation

If you are not blocked on the Firestore refactor, **Google Cloud Always Free is the better long-term backend home** for this project. It removes all server management overhead, has better auth tooling, and is more reliable to provision than Oracle.

If you want zero code changes and are comfortable with SSH, **Oracle Always Free** is still the right choice.

Both options are genuinely free for this app's usage profile.

---

*Added: 2026-05-14*
