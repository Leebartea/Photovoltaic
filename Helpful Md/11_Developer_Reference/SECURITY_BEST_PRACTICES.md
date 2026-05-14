# Security Best Practices — PV Calculator Codebase

This guide covers every security concern relevant to this codebase: the
offline/static single-file app, the hosted multi-file build, the optional
Node.js backend, and the GitHub deployment pipeline.

---

## 1. What This Codebase Is (and Is Not)

The core product is a **client-side-only web application** — it runs entirely
in the user's browser with no server needed for the calculator itself. This
removes whole categories of server-side risk (SQL injection, server-side
template injection, remote code execution via backend) from the main app.

The **optional backend** (`backend/`) adds a Node.js/SQLite server for
multi-user seat management and premium features. That backend reintroduces
server-side concerns and is covered in Section 7.

---

## 2. Cross-Site Scripting (XSS)

XSS is the most relevant attack for a browser-based app that dynamically
builds HTML from user input.

### What it means
An attacker injects JavaScript into a field (e.g., company name, appliance
name) that the app then renders as raw HTML. The injected script runs in the
victim's browser, potentially stealing data or impersonating the user.

### Where the risk lives in this codebase
- `src/scripts/modules/30-controller.js` builds large HTML strings using
  template literals and inserts them via `innerHTML` / `element.innerHTML`.
- User-supplied values (installer name, client name, site name, company name,
  appliance names, quote reference, notes) are embedded in those strings.

### Existing defense — `escapeHtml()`
The controller defines a helper (`this.escapeHtml(str)`) that replaces the
five dangerous HTML characters:

```
& → &amp;   < → &lt;   > → &gt;   " → &quot;   ' → &#039;
```

Every user-supplied string that goes into an HTML template literal MUST pass
through `this.escapeHtml()`. Grep the codebase periodically:

```bash
grep -n 'escapeHtml' src/scripts/modules/30-controller.js | wc -l
```

Any user-visible string NOT wrapped in `escapeHtml` is a potential XSS sink.

### Rules going forward
1. Never interpolate raw user input directly into a template literal that goes
   to `innerHTML`.
2. PDF strings use `doc.text()` which is not HTML — no escaping needed there,
   but verify jsPDF does not interpret HTML in text strings (it does not by
   default).
3. SVG diagrams built as strings: apply `escapeHtml` to any user label embedded
   in the SVG string before inserting via `innerHTML`.

---

## 3. Content Security Policy (CSP)

A CSP header (or `<meta http-equiv>` tag) tells the browser which sources of
scripts, styles, and fonts are allowed to execute. This is the second line of
defence against XSS — even if an attacker injects a script tag, CSP prevents
it from running if the source is not whitelisted.

### Current state
No explicit CSP header is present in `src/template.html`. The Netlify and
Render deploy configs (`netlify.toml`, `render.yaml`) do not set CSP headers.

### Recommended addition (GitHub Pages / Netlify / Render)
Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
```

Note: `'unsafe-inline'` is needed because the app uses inline `<script>` and
`<style>` blocks in the single-file build. A stricter policy using nonces
would require the build pipeline to inject a random nonce per deployment.

### Why `object-src 'none'` matters
This blocks Flash/plugin execution entirely — important even though Flash is
dead, as some older browsers still support plugin APIs that can be exploited.

---

## 4. localStorage Security

The app uses `localStorage` for autosave and named project storage.

### What is stored
- Calculated system configurations (loads, battery, inverter, PV sizes)
- Proposal identity (installer name, client name, site, company, contact)
- Supplier pricing overrides
- No passwords, no cryptographic keys

### Risks
- **XSS access**: Any JavaScript running on the same origin can read
  `localStorage`. If XSS is achieved, stored project data is readable.
- **Cross-origin isolation**: `localStorage` is scoped to origin (scheme +
  host + port). Data from `https://yourdomain.com` is not accessible to any
  other origin.
- **Sensitive PII**: Installer name, client name, and site address are
  personally identifiable. Inform users of this if operating under GDPR or
  similar regulation.

### Rules
1. Never store passwords, API keys, session tokens, or payment data in
   `localStorage`.
2. Keep stored values to what is needed to restore session state.
3. The `clearAutoSave()` and project-delete flows properly purge stored data
   — always call them on project deletion.

---

## 5. PDF Generation Security (jsPDF)

PDFs are generated client-side using the vendored `jsPDF` library
(`vendor/jspdf.umd.min.js`). No data is sent to any server during PDF export.

### Risks
- **Data exposure in PDF metadata**: jsPDF embeds author/title metadata.
  Ensure company names and contact details in metadata match what the user
  has consented to share.
- **Embedded fonts/binary blobs**: Vendored jsPDF includes embedded font data
  as base64 strings. These are benign but inflate file size. Keep the vendored
  file locked to a known version.
- **Malicious input in PDF text**: jsPDF's `doc.text()` renders plain strings,
  not HTML. JavaScript injection via user text fields cannot execute inside a
  jsPDF-generated PDF (unlike PDF forms with JavaScript enabled in Adobe).
- **URL injection in links**: If any future feature adds clickable links in the
  PDF, validate URLs strictly before passing to jsPDF link APIs.

### Vendor pinning
The vendored `jspdf.umd.min.js` is checked into git. This is intentional for
an offline-first product. When updating jsPDF:
1. Download from the official jsPDF release, not a CDN link.
2. Verify the file hash against the official release.
3. Test PDF generation fully before committing.

---

## 6. Input Validation

### Rate validation
The `RATE_BENCHMARKS` constant and `getRateStatus()` / `checkAllRates()`
functions (added in Batch 1) provide live red/amber/green badges on all six
supplier rate input fields and block PDF generation when any rate is out of
range. This prevents the "USD 6,000/VA" typo that produced multi-million
dollar quotes.

**Rule:** Any numeric input that feeds into a financial calculation must have
both a client-side validation badge and a server-side (or engine-level) clamp.

### Energy rate clamp
`parseFinanceRate` (30-controller.js) enforces min/max bounds on the energy
rate and export credit inputs, scaled by `fxScalar` for non-USD currencies.
The ceilings are:
- Energy rate: `max(1.0, 1.0 × fxScalar)` USD/kWh
- Export credit: `max(0.5, 0.5 × fxScalar)` USD/kWh

These prevent absurd payback calculations from UI interaction errors.

### FX rate validation
The FX rate field (`fxRateToUSD`) is parsed with a `Number()` cast and guarded
with `> 0` checks throughout. Never use a user-supplied FX rate in arithmetic
without the `> 0` guard.

---

## 7. Backend Security (Optional Premium Backend)

The `backend/` directory implements a Node.js Express server with SQLite
storage for multi-user seat management. If you deploy this:

### Authentication
- Session tokens are short random strings stored in SQLite.
- Always regenerate session tokens on privilege escalation (e.g., when an
  installer seat becomes an admin).
- Set `HttpOnly` and `Secure` flags on session cookies.
- Use `SameSite=Strict` to prevent CSRF attacks.

### SQL Injection
SQLite queries in the backend use parameterised statements (never string
concatenation). Verify every query with `?` placeholders, never:
```js
// WRONG — SQL injection risk
db.run(`SELECT * FROM seats WHERE email = '${email}'`);

// CORRECT — parameterised
db.run('SELECT * FROM seats WHERE email = ?', [email]);
```

### Rate Limiting
The admin console and seat invite endpoints should be rate-limited. Without
rate limiting, an attacker can brute-force invite codes or session tokens.
Add `express-rate-limit` or equivalent middleware.

### CORS
If the backend API is served from a different origin than the frontend, set
`Access-Control-Allow-Origin` to your specific frontend domain — never `*`
for authenticated endpoints.

### HTTPS
Always deploy the backend behind HTTPS. Plaintext HTTP leaks session tokens
and all admin actions. Use Let's Encrypt / Certbot or a reverse proxy (nginx,
Caddy) with TLS.

### Audit Log
The `BACKEND_SECURITY_AND_AUDIT_GUIDE.md` (in `07_Backend/`) describes the
audit trail. Ensure all privileged actions (seat grant, seat revoke, admin
login, data export) are logged with timestamp and actor identity.

---

## 8. Dependency Security

### Vendored dependencies
Only one vendored runtime dependency: `vendor/jspdf.umd.min.js`. It is
checked in directly so offline use works without npm. Keep it at a known good
version and update deliberately (not via automated Dependabot, which would
break the offline guarantee).

### npm devDependencies
`package.json` devDependencies are only used at build time — they do not ship
to the browser. Run:

```bash
npm audit
```

periodically and resolve CRITICAL / HIGH advisories. MODERATE advisories in
build-only tools are lower priority.

### No runtime npm dependencies shipped to browser
The entire runtime (excluding jsPDF) is the authored source — no React, no
lodash, no moment.js. This is intentional. Every dependency added to the
runtime is a new attack surface; keep the runtime self-contained.

---

## 9. GitHub Repository Security

### Public repository awareness
The repository is public. This means:
- **Never commit secrets** — API keys, database credentials, OAuth tokens,
  admin passwords. Use GitHub Secrets for CI/CD and `.gitignore` for local
  env files.
- The `.gitignore` should include `.env`, `*.local`, `backend/data/*.db` (any
  SQLite database with real user data).

### Commit signing
Consider enabling GPG commit signing (`git config commit.gpgsign true`) so
commits are verifiable as coming from the real author — important once
collaborators are added.

### Branch protection
On GitHub: Settings → Branches → Add rule for `main`:
- Require pull request reviews before merging (once team grows)
- Require status checks (CI build) to pass

### GitHub Actions
The `.github/workflows/` deploy pipeline runs on every push to `main`. Audit
the workflow file — ensure it:
- Only reads, never uploads, user data.
- Uses pinned action versions (e.g., `actions/checkout@v3` not
  `actions/checkout@latest`), because an unpinned action could be hijacked.
- Does not echo secrets into logs.

---

## 10. Offline / Static Deployment Security

When serving the `pv_calculator_ui.html` standalone file or the `dist/web/`
bundle via GitHub Pages or Netlify:

- **No server-side code executes** — the attack surface is purely client-side.
- **HTTPS is enforced by default** on GitHub Pages and Netlify — never serve
  via plain HTTP in production.
- **iframe embedding**: Add `X-Frame-Options: DENY` or
  `Content-Security-Policy: frame-ancestors 'none'` to prevent clickjacking
  (embedding the app in a malicious iframe to capture clicks).
- **Referrer policy**: Add `Referrer-Policy: strict-origin-when-cross-origin`
  to prevent the full URL (which may contain proposal identifiers) from leaking
  in referrer headers to third-party resources.

---

## 11. Periodic Security Checklist

Run this checklist before every major release:

- [ ] `npm audit` — zero CRITICAL, zero HIGH in devDependencies
- [ ] Grep for raw user input in template literals without `escapeHtml`:
  `grep -n '\${' src/scripts/modules/30-controller.js | grep -v escapeHtml | grep -i 'name\|input\|label\|note\|comment'`
- [ ] Verify CSP headers are present in deploy config
- [ ] Confirm `vendor/jspdf.umd.min.js` is at the intended pinned version
- [ ] Confirm no `.env` or `*.db` files are staged: `git status`
- [ ] Review any new `innerHTML` assignments added since last release
- [ ] If backend is deployed: verify all DB queries use parameterised statements
- [ ] Confirm session token endpoints are rate-limited
- [ ] Verify HTTPS is active on all deployment targets

---

*Last updated: 2026-05-14 | Maintainer: Leebartea*
