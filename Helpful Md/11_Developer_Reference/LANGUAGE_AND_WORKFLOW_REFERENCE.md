# Language and Workflow Reference
## A Complete Guide for Students and Researchers

This document explains every language, technology, and concept used in this
codebase in plain English, with examples from the actual source files. If you
are learning web development, use this as a map to understand how everything
fits together.

---

## Table of Contents

1. [The Big Picture — What This Codebase Does](#1-the-big-picture)
2. [HTML — The Structure](#2-html)
3. [CSS — The Appearance](#3-css)
4. [JavaScript — The Logic](#4-javascript)
5. [TypeScript — JavaScript with Types](#5-typescript)
6. [Node.js — The Build Environment](#6-nodejs)
7. [jsPDF — Generating PDFs in the Browser](#7-jspdf)
8. [SQLite — The Optional Database](#8-sqlite)
9. [Git and GitHub — Version Control](#9-git-and-github)
10. [The Build Pipeline — How Source Becomes Deliverable](#10-the-build-pipeline)
11. [Single-File vs Multi-File Architecture](#11-single-file-vs-multi-file)
12. [Module-by-Module Breakdown](#12-module-by-module-breakdown)
13. [Key Patterns and Terms Glossary](#13-key-patterns-and-terms-glossary)
14. [How a Calculation Flows End-to-End](#14-how-a-calculation-flows-end-to-end)
15. [How the PDF Export Works](#15-how-the-pdf-export-works)
16. [Learning Path Recommendations](#16-learning-path-recommendations)

---

## 1. The Big Picture

This is a **photovoltaic (solar) system sizing and proposal tool**. An
installer enters information about a client's electrical loads (appliances),
location, and budget. The app calculates what size solar panels, battery bank,
and inverter are needed, then produces a professional PDF proposal.

The product runs **entirely in the browser** — no internet connection is
needed after the page loads. This is called an **offline-first** or
**static** web application.

### Files you need to know
```
pv_calculator_ui.html      ← Single self-contained file (everything in one)
dist/web/                  ← Multi-file hosted version (HTML + separate JS/CSS)
src/                       ← Source code you edit
  template.html            ← HTML skeleton
  styles/
    app.css                ← All CSS styles
  scripts/
    modules/
      00-defaults.ts       ← All default values and constants
      10-engines.ts        ← All calculation engines
      20-reporting.ts      ← Report generation
      25-controller-payloads.ts  ← TypeScript type definitions
      26-controller-state.ts     ← State management types
      27-controller-guidance.ts  ← Guidance/coaching types
      28-entitlements.ts         ← Premium feature access
      29-backend.ts              ← Backend integration
      30-controller.js     ← Main application controller (~27,000 lines)
      40-init.js           ← App startup / initialization
scripts/
  build_artifacts.js       ← Build script that assembles the deliverables
vendor/
  jspdf.umd.min.js         ← PDF library (bundled for offline use)
backend/                   ← Optional Node.js server for premium features
```

---

## 2. HTML

**What it is:** HyperText Markup Language. HTML defines the *structure* of a
web page — the skeleton that the browser parses into a tree of elements
(called the DOM: Document Object Model).

**Version used:** HTML5 (the current standard, introduced in 2014).

### Where it lives in this project
- `src/template.html` — the HTML skeleton
- The build script injects the compiled CSS and JavaScript into this template
  to produce `pv_calculator_ui.html`

### Key HTML concepts used in this codebase

**Elements and tags:**
```html
<div class="card">          <!-- opening tag with a class attribute -->
  <h2>System Summary</h2>   <!-- heading element -->
  <p>Some text</p>          <!-- paragraph element -->
</div>                      <!-- closing tag -->
```

**Forms and inputs:**
The calculator is mostly a very large HTML form. Users type into `<input>`
elements, choose from `<select>` dropdowns, and check `<input type="checkbox">`
boxes.

```html
<!-- In src/template.html -->
<input type="number" id="panelWattage" value="400" min="50" max="800" />
<select id="location">
  <option value="lagos_ng">Lagos, Nigeria</option>
  <option value="nairobi_ke">Nairobi, Kenya</option>
</select>
```

**IDs:** Every interactive element has an `id` attribute so JavaScript can
find it with `document.getElementById('panelWattage')`.

**`data-*` attributes:** HTML5 allows custom attributes prefixed with `data-`.
This project uses them to carry metadata:
```html
<div data-theme="dark">      <!-- CSS uses this for dark mode -->
<div data-audience-mode="client">  <!-- JS reads this to know mode -->
```

**`<details>` and `<summary>`:** Native HTML collapse/expand widget used to
hide advanced fields from casual users (added in Batch 14):
```html
<details>
  <summary>Advanced Engineering Overrides</summary>
  <div class="form-group">...</div>
</details>
```

**SVG (Scalable Vector Graphics):** The system diagram (battery, panels,
inverter layout) is drawn as SVG — a text-based vector image format embedded
directly in the HTML. See `30-controller.js` around the `buildSVGDiagram`
function.

---

## 3. CSS

**What it is:** Cascading Style Sheets. CSS controls the *visual appearance*
of HTML elements — colors, fonts, layout, spacing, animation.

**Version used:** CSS3 (the modern standard, continuously evolving).

### Where it lives
- `src/styles/app.css` (~4,000 lines) — all styles in one file

### Key CSS concepts used in this codebase

**Selectors:** Target elements by class, ID, tag, or attribute.
```css
.card { ... }              /* class selector — targets <div class="card"> */
#resultsContainer { ... }  /* ID selector — targets <div id="resultsContainer"> */
input[type="number"] { ... } /* attribute selector */
```

**CSS Custom Properties (Variables):** Defined once, used everywhere.
The theme system (light/dark mode) is built on these:
```css
/* src/styles/app.css */
:root {
  --primary-color: #2563eb;    /* blue */
  --bg-color: #ffffff;
  --text-color: #1e293b;
  --border-color: #e2e8f0;
}

[data-theme="dark"] {
  --bg-color: #0f172a;         /* dark background */
  --text-color: #f1f5f9;
}

.card {
  background: var(--bg-color); /* uses the variable */
  color: var(--text-color);
}
```
When the user switches to dark mode, `data-theme="dark"` is set on the `<body>`
and all variables update automatically — no JavaScript needed to recolor
individual elements.

**CSS Grid:** Used for two-column and three-column form layouts.
```css
/* src/styles/app.css ~line 619 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* two equal columns */
  gap: 16px;
}

.form-row.three {
  grid-template-columns: 1fr 1fr 1fr;  /* three equal columns */
}
```

**CSS Flexbox:** Used for horizontal alignment within rows (badges, pills,
navigation items).

**Media Queries:** Make the layout responsive (adapt to different screen
sizes):
```css
/* Collapse 3-column form to 2-column on tablets */
@media (max-width: 1023px) {
  .form-row.three,
  .form-row.four {
    grid-template-columns: 1fr 1fr;
  }
}

/* Stack hero to single column on phones (added in Batch 15D) */
@media (max-width: 480px) {
  .proposal-hero-main {
    grid-template-columns: 1fr;
  }
}
```

**Specificity:** CSS rules can conflict. The rule with higher *specificity*
wins. ID selectors are more specific than class selectors, which are more
specific than tag selectors. The `!important` keyword overrides all — use it
sparingly.

**`@media print`:** Special media query that applies when printing or saving
as PDF via the browser. Used to hide navigation elements from printed output:
```css
@media print {
  .section-nav { display: none; }
}
```

---

## 4. JavaScript

**What it is:** The programming language of the web browser. JavaScript runs
*inside* the browser and makes web pages interactive — handling clicks,
updating the DOM, performing calculations.

**Version used:** Modern ES2020+ (ECMAScript 2020 and later). The project uses
arrow functions, template literals, optional chaining (`?.`), nullish
coalescing (`??`), destructuring, and `async`/`await`.

### Where it lives
- `src/scripts/modules/30-controller.js` — the main application (~27,000 lines)
- `src/scripts/modules/40-init.js` — startup code
- `src/scripts/app.js` — the concatenated build of all modules

### Key JavaScript concepts used in this codebase

**`document.getElementById()`:** The most common DOM query — finds a single
element by its `id` attribute.
```js
// 30-controller.js
const panelWattage = Number(document.getElementById('panelWattage')?.value || 400);
```

**Event listeners:** JavaScript "listens" for user actions and runs code in
response.
```js
// 40-init.js — when user types in any input field, save to localStorage
document.addEventListener('input', debounce(() => {
  saveToLocalStorageAuto();
}, 150));
```

**Template literals (backtick strings):** Allow embedding expressions inside
strings using `${}`. Used extensively to build HTML:
```js
const html = `
  <div class="card">
    <h3>${this.escapeHtml(title)}</h3>
    <p>Annual value: ${money(finance.annualSavings)}</p>
  </div>
`;
element.innerHTML = html;
```

**Arrow functions:** Concise function syntax. `(x) => x * 2` is the same as
`function(x) { return x * 2; }`.

**Optional chaining (`?.`):** Safely access deeply nested properties without
crashing if any level is `null` or `undefined`:
```js
const label = results?.battery?.chemistry || 'lifepo4';
// Instead of: results && results.battery && results.battery.chemistry
```

**Nullish coalescing (`??`):** Return the right side only if the left side is
`null` or `undefined` (unlike `||` which also triggers on `0` and `''`):
```js
const rate = config.energyRate ?? 0.18;
```

**Destructuring:** Unpack values from objects or arrays:
```js
const { inverter, battery, pvArray } = results;
const [first, ...rest] = warnings;
```

**`Array.map()`, `filter()`, `reduce()`:** Functional array methods used
throughout the engines:
```js
// Sum all appliance daily energy
const totalWh = appliances
  .filter(a => a.enabled)
  .reduce((sum, a) => sum + a.dailyWh, 0);
```

**`localStorage`:** Browser API for persisting data across page reloads.
```js
localStorage.setItem('pv_autosave', JSON.stringify(state));
const saved = JSON.parse(localStorage.getItem('pv_autosave') || 'null');
```

**`this` in object methods:** Inside the large controller object, `this` refers
to the controller itself — used to call sibling methods:
```js
this.renderResults(report, defense);
this.escapeHtml(userName);
```

**Closures:** A function that "closes over" (remembers) variables from its
enclosing scope. The PDF export uses closures extensively to share `y`, `doc`,
`mL`, and helper functions across all the rendering sub-functions:
```js
// Inside exportPDF():
let y = 28;  // current vertical position on page

function labelValue(label, value) {
  // y is captured from the outer function — shared state
  doc.text(label, mL, y);
  doc.text(value, mL + 62, y);
  y += LH;  // advance y for the next row
}
```

**`async`/`await`:** Used in the backend integration (`29-backend.ts`) for
asynchronous HTTP requests. Regular calculator operations are synchronous.

---

## 5. TypeScript

**What it is:** A superset of JavaScript that adds *static type annotations*.
TypeScript is compiled to plain JavaScript before the browser sees it. It
helps catch bugs at "compile time" (when you write the code) rather than at
"runtime" (when the user runs the app).

**Version used:** TypeScript 5.x

### Where it lives
- `src/scripts/modules/00-defaults.ts` — all defaults and constants
- `src/scripts/modules/10-engines.ts` — all calculation engines
- `src/scripts/modules/20-reporting.ts` — report generation
- `src/scripts/modules/25-controller-payloads.ts` — type definitions for all
  function inputs and outputs
- `src/scripts/modules/26-controller-state.ts` — state type definitions
- `src/scripts/modules/27-controller-guidance.ts` — guidance/coaching types
- `src/scripts/modules/28-entitlements.ts` — premium access types
- `src/scripts/modules/29-backend.ts` — backend API types

### What TypeScript adds

**Type annotations:** Tell the compiler what kind of value a variable holds.
```typescript
// 25-controller-payloads.ts
interface BatterySizingResult {
  totalCapacityAh: number;
  bankVoltage: number;
  chemistry: 'lifepo4' | 'agm' | 'gel' | 'fla';  // only these strings allowed
  isManualOverride: boolean;
  warnings: string[];
}
```

**Interfaces:** Define the "shape" of an object — what properties it must have
and what types they must be. If your code passes an object that doesn't match
the interface, TypeScript shows a red error in your editor before you run
anything.

**Generics:** Allow writing code that works with different types:
```typescript
function parseOptional<T>(value: T | null | undefined, fallback: T): T {
  return value ?? fallback;
}
```

**Why the controller is `.js` not `.ts`:** The main controller (`30-controller.js`)
is plain JavaScript because it is ~27,000 lines and a full TypeScript migration
would be a large multi-week project. The strategy (documented in
`TYPESCRIPT_ADOPTION_PLAN.md`) is to migrate incrementally — engines and types
are TypeScript, the controller uses JSDoc annotations for partial type safety.

**`tsconfig.json`:** The TypeScript configuration file at the project root.
It tells the TypeScript compiler which files to check, what JavaScript version
to target, and how strict to be.

---

## 6. Node.js

**What it is:** A JavaScript runtime that runs *outside* the browser — on your
computer or a server. It uses Chrome's V8 engine. This project uses Node.js
for the build tools and the optional backend.

**Not used at runtime:** When a user opens the calculator in their browser,
Node.js is not involved. It is only used by *developers* when building the
project.

### Where it is used

**Build script:** `scripts/build_artifacts.js` is a Node.js script that:
1. Reads all `src/scripts/modules/*.ts` and `*.js` files
2. Concatenates them in order (00, 10, 20, 25, 26, 27, 28, 29, 30, 40)
3. Reads `src/styles/app.css`
4. Reads `src/template.html`
5. Injects the combined JS and CSS into the template
6. Writes `pv_calculator_ui.html` (standalone single-file)
7. Writes `dist/web/assets/app.js`, `dist/web/assets/app.css`, and
   `dist/web/index.html` (multi-file hosted version)

**`package.json`:** The Node.js project manifest. Defines:
- `name`, `version`: project metadata
- `scripts`: command shortcuts (`npm run build` → runs `node scripts/build_artifacts.js`)
- `devDependencies`: tools only needed during development (TypeScript compiler, etc.)

**`npm` (Node Package Manager):** The tool that installs Node.js dependencies.
`npm install` reads `package.json` and downloads everything into `node_modules/`.
`npm run build` runs the build script.

**The optional backend** (`backend/`) is a Node.js Express server that provides:
- User seat management (invite, revoke, sign in)
- SQLite storage for seat records and audit logs
- Admin console API

---

## 7. jsPDF

**What it is:** A JavaScript library that generates PDF files entirely in the
browser — no server, no print dialog.

**Version:** Pinned in `vendor/jspdf.umd.min.js` (UMD = Universal Module
Definition, works in browser and Node.js).

### How it works in this project

```js
// Inside exportPDF() in 30-controller.js
const { jsPDF } = window.jspdf;
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

// Page size: A4 = 210mm wide × 297mm tall
// Coordinates: (0, 0) is top-left corner, Y increases downward

doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
doc.setTextColor(37, 99, 235);  // RGB color
doc.text('System Configuration', 16, 28);  // text at x=16mm, y=28mm

// Draw a filled rectangle
doc.setFillColor(219, 234, 254);  // light blue
doc.roundedRect(16, 32, 178, 8, 2, 2, 'F');  // x, y, width, height, rx, ry, style

// Add a new page
doc.addPage();

// Save the PDF (triggers download in browser)
doc.save('PV_System_Design_Lagos.pdf');
```

### Key jsPDF concepts used here
- **Unit system:** All coordinates are in millimeters (mm). A4 paper is
  210mm × 297mm.
- **`y` tracking:** The local variable `y` tracks the current vertical
  position. After each text line, `y += LH` (line height, typically 5.5mm).
- **`checkSpace(needed)`:** A helper that calls `doc.addPage()` and resets `y`
  when there is not enough space left on the current page.
- **`splitTextToSize(text, width)`:** Wraps long text to fit within a column
  width, returning an array of lines.
- **`drawTable(headers, rows, widths)`:** A custom helper (not a jsPDF
  built-in) that renders a grid of data with column headers.

---

## 8. SQLite

**What it is:** A lightweight, file-based relational database. Unlike MySQL or
PostgreSQL, SQLite stores the entire database in a single `.db` file and
requires no separate server process.

**Where it is used:** Only in the optional backend (`backend/`). The core
calculator has no database.

**What it stores:** Team seats, invite codes, session tokens, audit log entries.

**SQL basics:**
```sql
-- Create a table
CREATE TABLE seats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'installer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert a row
INSERT INTO seats (email, role) VALUES ('installer@example.com', 'installer');

-- Query
SELECT * FROM seats WHERE role = 'admin';

-- Update
UPDATE seats SET role = 'admin' WHERE email = 'installer@example.com';

-- Delete
DELETE FROM seats WHERE id = 5;
```

The backend uses the `better-sqlite3` npm package, which provides synchronous
SQLite access in Node.js.

---

## 9. Git and GitHub

**What they are:**
- **Git:** A version control system that tracks every change to your code,
  who made it, and when. Lives on your local machine.
- **GitHub:** A cloud platform that hosts Git repositories, enabling
  collaboration, backups, and deployment pipelines.

### Key Git terms used in this project

**Repository (repo):** The entire project folder tracked by Git. Initialised
with `git init` (already done here).

**Commit:** A saved snapshot of changes. Each commit has a unique hash (e.g.,
`00c1a70`), an author, a date, and a message.
```bash
git add src/styles/app.css          # stage the file
git commit -m "Batch 15D: ..."      # save the snapshot
git push origin main                # upload to GitHub
```

**Branch:** A parallel version of the codebase. The main branch is called
`main`. New features or fixes are often developed on a separate branch and
then merged.

**`git log --oneline`:** Shows a compact history of recent commits.

**`git diff`:** Shows what has changed since the last commit.

**`git status`:** Shows which files have been modified, staged, or are untracked.

**Push / Pull:** `git push` uploads local commits to GitHub. `git pull` downloads
remote changes to your local machine.

### GitHub Pages
This project deploys the `dist/web/` folder as a free static website via
GitHub Pages. Any push to `main` triggers the `.github/workflows/` action,
which runs the build and publishes the result.

### The workflow roles in this project
Three "agents" were used during the bug-fix campaign:
- **Opus** (Claude AI): Deep code analysis, finding exact line numbers and root causes.
- **Sonnet 4.6** (Claude AI): Planner and reviewer — coordinates, writes precise
  execution prompts, updates documentation.
- **Sonnet Max** (Claude AI): Implementer — applies exact edits, runs builds,
  commits.

This separation prevents one agent from both designing and implementing a
change without review — analogous to code review in a real team.

---

## 10. The Build Pipeline

**What "build" means here:** Transforming the *source files* (which are split
across many small, readable modules) into *deliverable files* (a single HTML
or a compact JS bundle) that work in the browser.

### Step-by-step: `npm run build`

```
npm run build
  └─ node scripts/build_artifacts.js
       1. Read src/scripts/modules/ files in order:
          00-defaults.ts → 10-engines.ts → 20-reporting.ts →
          25-26-27-28-29 (TypeScript types/support) →
          30-controller.js → 40-init.js
       2. Concatenate into one big JavaScript string (src/scripts/app.js)
       3. Read src/styles/app.css
       4. Read src/template.html
       5. Replace placeholder markers in template.html with:
          - The concatenated JS (in a <script> tag)
          - The CSS (in a <style> tag)
       6. Write pv_calculator_ui.html  ← standalone single file
       7. Write dist/web/assets/app.js ← hosted JS
       8. Write dist/web/assets/app.css ← hosted CSS
       9. Write dist/web/index.html, dist/web/pv_calculator_ui.html
       10. Copy vendor/jspdf.umd.min.js to dist/web/assets/vendor/
```

### Why two outputs?

| File | Use case | Size |
|------|----------|------|
| `pv_calculator_ui.html` | Send via email, USB, WhatsApp. Open without internet. | ~2.3 MB |
| `dist/web/` | Host on GitHub Pages / Netlify. Browser loads files separately and caches them. | Smaller individual files |

Both contain identical functionality — same JavaScript, same CSS, same HTML
structure. The difference is packaging only.

### Source vs compiled

| Concept | In this project |
|---------|----------------|
| Source | `src/` folder — human-readable, split into modules |
| Compiled/built | `pv_calculator_ui.html`, `dist/web/`, `src/scripts/app.js` |
| Version controlled? | Both — source is edited by developers; compiled artifacts are committed so users can download them directly |

---

## 11. Single-File vs Multi-File Architecture

### Single file (`pv_calculator_ui.html`)

Everything — HTML structure, CSS styles, JavaScript logic, and the vendored
jsPDF library — is embedded in one HTML file. This file is 100% self-contained:
- No internet connection needed
- No web server needed (open with double-click)
- Can be sent as an email attachment
- Works on air-gapped computers

```
pv_calculator_ui.html (2.3 MB)
  ├── <style> ... app.css inlined ... </style>
  ├── <script> ... jspdf.umd.min.js inlined ... </script>
  ├── <script> ... all modules concatenated ... </script>
  └── <body> ... template.html content ... </body>
```

### Multi-file (`dist/web/`)

Standard web application structure — the browser loads each file separately
and can cache them:
```
dist/web/
  ├── index.html           ← Entry point (links to CSS and JS files)
  ├── pv_calculator_ui.html
  ├── .nojekyll            ← Tells GitHub Pages not to process with Jekyll
  └── assets/
        ├── app.js         ← All JavaScript modules concatenated
        ├── app.css        ← All CSS
        └── vendor/
              └── jspdf.umd.min.js
```

### Why this matters for deployment

When you push to GitHub and the GitHub Actions workflow runs, it publishes
`dist/web/` to GitHub Pages. Users who visit the website URL get the
multi-file version (faster on repeat visits due to browser caching).

Users who download the single `pv_calculator_ui.html` file get the offline
version (no network needed at all).

**Both must be committed in the same code commit.** A bug fix only in `src/`
is incomplete until `npm run build` is run and the output files are also
committed. This was the exact issue caught in Batch 15D — `00c1a70` committed
only `src/`, and a second commit `9c045f8` was needed to commit the built
artifacts.

---

## 12. Module-by-Module Breakdown

### `00-defaults.ts` — Constants and Defaults
The single source of truth for all fixed values in the application.

- `DEFAULTS.REGION_PROFILES` — energy rate, currency, AC voltage, FX rate for
  each supported location (Lagos, Nairobi, Cape Town, Dubai, etc.)
- `DEFAULTS.BATTERY_SPECS` — depth of discharge, cycle life, charge efficiency
  for LiFePO4, AGM, Gel, Flooded lead-acid
- `DEFAULTS.COMMERCIAL_DECISION_STRATEGIES` — strategy labels and scoring for
  the commercial recommendation engine
- `DEFAULTS.INVERTER_MARKET` — market labels (Standard, Premium, Economy)
- `DEFAULTS.PROPOSAL_PRICING.defaultLists` — default text for included scope,
  exclusions, next steps in proposals

### `10-engines.ts` — Calculation Engines
This file contains the pure mathematical core of the application. Each engine
is an object with a `calculate()` or `generate()` method. No DOM access here
— engines only receive inputs and return results.

| Engine | What it does |
|--------|-------------|
| `LoadEngine` | Parses appliance list, computes daily energy demand (Wh/day), surge VA, phase allocation |
| `BatterySizingEngine` | Calculates required battery Ah, bank voltage, chemistry specs, usable capacity |
| `InverterSizingEngine` | Calculates required inverter VA (continuous and surge), auto-promotes tier if surge headroom is insufficient |
| `PVArrayEngine` | Calculates panel count, string/parallel configuration, daily energy yield, temperature derating |
| `ChargeControllerValidator` | Validates MPPT controller limits (voltage, current, power) |
| `ProtectionDesignEngine` | Designs PV DC fuse, battery MCCB, AC MCB, SPD, earthing — all in one pass |
| `CableDesignEngine` | Sizes DC and AC cables for current capacity and voltage drop |
| `CommercialArchitectureEngine` | Evaluates board strategy, generator path, battery throughput, MPPT grouping |
| `CommercialDecisionEngine` | Scores and recommends commercial operating postures (battery-dominant off-grid, solar bridge, hybrid generator, etc.) |
| `PlantScopingEngine` | Determines whether project is a captive site, private distribution, or utility-adjacent job |
| `SmartAdvisoryEngine` | Generates practical usage tips (load management, battery care, daily routine) based on the design |
| `UpgradeSimulator` | Analyses future upgrade paths (add panels, increase battery, parallel inverters) |

### `20-reporting.ts` — Report Generation
Collects warnings, blocks, and suggestions from all engine results into a
single report object. `OutputGenerator.generateReport()` is called after all
engines run.

### `25–27: Type Definition Files`
Pure TypeScript interfaces. No logic — only type contracts. Used by the
compiler to ensure engines return the right shapes and the controller receives
the right inputs.

### `28-entitlements.ts` — Premium Feature Access
Controls which features are available based on whether a backend is connected
and whether the user has a valid seat. Prevents premium features (branded
exports, team workspace) from being accessible in the free offline mode.

### `29-backend.ts` — Backend Integration
Handles communication with the optional Node.js backend. HTTP fetch calls for
seat sign-in, workspace sync, and audit delivery.

### `30-controller.js` — Main Application Controller (~27,000 lines)
This is the "brain" of the application. It:
- Reads all user inputs from the DOM
- Calls the engines in the correct order
- Renders results back to the DOM (HTML panels, charts, SVG diagram)
- Handles PDF export (the `exportPDF()` function is ~2,000 lines)
- Manages autosave and project storage
- Handles all user interactions (button clicks, mode changes, preset loading)

### `40-init.js` — Startup
Runs once when the page loads. Sets up event listeners, restores autosave
state, initializes the audience mode banner, and triggers the first render.

---

## 13. Key Patterns and Terms Glossary

### DOM (Document Object Model)
The browser's in-memory tree of all HTML elements. JavaScript can read and
modify the DOM to update what the user sees without reloading the page.

### `innerHTML` vs `textContent`
- `innerHTML` parses the assigned string as HTML — allows inserting tags.
  Risk: XSS if user input is not escaped.
- `textContent` treats the assigned string as plain text — safe but cannot
  insert formatted content.

### Debounce
A technique to prevent a function from running too often. When the user types
rapidly, the `input` event fires on every keystroke. `debounce(fn, 150)` waits
150ms after the last keystroke before calling `fn` — preventing 10 autosaves
for 10 keystrokes.
```js
// 40-init.js
document.addEventListener('input', debounce(() => {
  saveToLocalStorageAuto();
}, 150));
```

### Template Literal
A string enclosed in backticks (`` ` ``) that allows embedding JavaScript
expressions with `${}`. The primary way HTML is built dynamically in this app.

### Closure
A function that captures (remembers) variables from its enclosing scope even
after the outer function has returned. The PDF export uses closures so
`labelValue()`, `bulletItem()`, and other helpers can share `y`, `doc`, `mL`
without passing them as parameters every time.

### Progressive Disclosure
A UX pattern where complex options are hidden by default and shown only when
needed. This project implements it with `<details>` elements (engineering
overrides, cable lengths) and collapsible section cards.

### Offline-First
The application is designed to work with no internet connection. All data
processing happens in the browser. The PDF is generated in the browser. The
only thing that needs a network is the initial page load (or it can be served
from a downloaded file).

### FX Rate (Foreign Exchange Rate)
How many units of a local currency equal 1 USD. Used to convert USD-denominated
component prices into client-facing local currency amounts.
Example: Nigeria NGN/USD ≈ 1,550 — a $10 panel shown as NGN 15,500 in client mode.

### PSH (Peak Sun Hours)
The number of hours per day the sun produces at full rated intensity. Lagos ≈
4.5 PSH, Dubai ≈ 5.8 PSH. Used to calculate how much energy a solar array
produces per day.

### DoD (Depth of Discharge)
The maximum percentage of battery capacity that should be used before
recharging. LiFePO4 can safely discharge to 80% DoD; AGM is limited to ~50%.
Discharging beyond DoD damages the battery.

### VA vs Watts
- **Watts (W):** Real power — energy actually consumed.
- **VA (Volt-Amperes):** Apparent power — what the inverter must supply,
  accounting for reactive current drawn by motors (AC units, pumps, fans).
- **Power factor:** `W / VA` — typically 0.8–0.95 for mixed loads. Motors have
  lower power factor than resistive loads.

### Surge vs Continuous
- **Continuous load:** What the system runs all the time. Inverter must handle
  this non-stop.
- **Surge:** The brief spike when a motor starts (2–3× rated power for 0.5–2
  seconds). Inverter must survive the surge without tripping.

### Installer vs Client Mode
- **Installer mode:** Shows all engineering detail, USD costs, component specs.
  FX rate = 1 (stays in USD).
- **Client mode:** Shows simplified proposal language, local currency amounts,
  suppresses internal pricing margins and engineering appendix.

---

## 14. How a Calculation Flows End-to-End

When the user clicks "Calculate":

```
1. User clicks "Calculate" button
   └─ 40-init.js event listener → calls AppController.calculate()

2. AppController.calculate() in 30-controller.js:
   a. Reads all DOM inputs (this.getConfig())
      └─ panelWattage, location, systemType, autonomyDays, appliances...

   b. Calls LoadEngine.calculate(config)
      └─ Returns: dailyEnergyWh, designContinuousVA, designSurgeVA, phaseAllocation

   c. Calls BatterySizingEngine.calculate(loadResult, config)
      └─ Returns: totalCapacityAh, bankVoltage, chemistry, usableCapacityWh

   d. Calls InverterSizingEngine.calculate(loadResult, config)
      └─ Returns: recommendedSizeVA, surgeCapacityVA, auto-promotes if needed

   e. Calls PVArrayEngine.calculate(loadResult, battResult, config, panel, mppt)
      └─ Returns: totalPanels, arrayWattage, dailyEnergyWh, stringVoc

   f. Calls ChargeControllerValidator.validate(pvResult, mppt)
      └─ Returns: isValid, warnings

   g. Calls ProtectionDesignEngine.design(...)
      └─ Returns: pvSide, batterySide, acSide, earthing devices

   h. Calls CableDesignEngine.calculate(...)
      └─ Returns: dcRuns, acRuns with sizes and voltage drops

   i. Calls CommercialArchitectureEngine.evaluate(...)
      └─ Returns: boardStrategy, generatorPath, throughputStatus

   j. Calls CommercialDecisionEngine.evaluate(...)
      └─ Returns: recommended strategy (off-grid / solar bridge / hybrid)

   k. Calls SmartAdvisoryEngine.generate(...)
      └─ Returns: array of advisory items by category

   l. Stores all results in this.results

3. AppController.renderResults(report, defense)
   └─ Builds HTML strings from results
   └─ Sets element.innerHTML on result panels
   └─ User sees the output

4. User clicks "Export PDF"
   └─ AppController.exportPDF()
   └─ Creates jsPDF doc
   └─ Renders 6+ pages: Cover, Config, Analysis, Warnings, Advisory, Commercial
   └─ doc.save('filename.pdf') triggers browser download
```

---

## 15. How the PDF Export Works

The `exportPDF()` function in `30-controller.js` is approximately 2,000 lines.
It uses the following pattern:

```js
const doc = new jsPDF({ unit: 'mm', format: 'a4' });
let y = 28;           // current Y position (top of content area)
const mL = 16;        // left margin
const contentW = 178; // usable width (210 - 16 - 16)
const LH = 5.5;       // line height in mm
const pageH = 297;    // A4 height

// Helper: check if enough space remains on page
function checkSpace(needed) {
  if (y + needed > pageH - 22) {
    doc.addPage();
    addPageHeader();  // repeat company name + date on new page
    addPageFooter();  // brand stamp
    y = 28;           // reset to top
  }
}

// Helper: render a label + value row
function labelValue(label, value) {
  checkSpace(LH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);  // muted grey
  doc.text(label, mL, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);     // dark
  doc.text(value, mL + 62, y);      // value column at x = 78mm
  y += LH;
}
```

### Page structure
| Page | Content |
|------|---------|
| 1 | Cover — system overview, key metrics, SVG diagram |
| 2 | System Configuration — all inputs and sizing summary |
| 3 | Warnings & Blocks |
| 4 | Advisory — practical usage tips |
| 5 | Upgrade Paths |
| 6+ | Commercial (client mode) — proposal, BOM, finance, payment |

### Client vs Installer PDF
- **Installer PDF:** Shows engineering detail, USD costs, appendix
- **Client PDF:** Hides internal margins, shows local currency, adds Payment &
  Acceptance page with signature lines

---

## 16. Learning Path Recommendations

If you are studying web development, here is the order to learn these concepts:

### Beginner (start here)
1. **HTML basics** — elements, attributes, forms, links
   - Resource: `src/template.html` — read it top to bottom
2. **CSS basics** — selectors, box model, flexbox
   - Resource: first 500 lines of `src/styles/app.css`
3. **JavaScript basics** — variables, functions, DOM manipulation
   - Resource: `src/scripts/modules/40-init.js` — it is short and readable

### Intermediate
4. **JavaScript ES6+** — arrow functions, template literals, destructuring,
   `map`/`filter`/`reduce`
   - Resource: `src/scripts/modules/10-engines.ts` (ignore the TypeScript
     type annotations for now — just read the logic)
5. **CSS Grid and Flexbox** — responsive layout
   - Resource: `src/styles/app.css` media query sections
6. **localStorage API** — persisting data
   - Resource: search `localStorage` in `30-controller.js`

### Advanced
7. **TypeScript** — type annotations, interfaces, generics
   - Resource: `src/scripts/modules/25-controller-payloads.ts`
8. **PDF generation** — jsPDF API
   - Resource: the `exportPDF()` function in `30-controller.js`
9. **Node.js build tools** — reading/writing files, scripting
   - Resource: `scripts/build_artifacts.js`
10. **Git and GitHub** — version control, branching, pull requests
    - Practice: make a small edit to CSS, run `git diff`, commit, push

### Project-specific learning
- To understand a bug fix: use `git log --oneline` to find the commit, then
  `git show HASH` to see exactly what changed and why
- To trace a calculation: add `console.log()` in one of the engines and open
  the browser's developer console (F12 → Console tab)
- To understand the PDF: generate a PDF, then find the corresponding code in
  `exportPDF()` by searching for the text that appears in the PDF

---

---

## 17. Engineering Concepts Specific to This Codebase

### Inverter Technology and Surge Absorption

The field `Inverter Technology` (in System Configuration → Engineering Overrides)
controls the surge multiplier used throughout the calculation engines.

**Why this matters (the physics):**

When a motor starts (direct-on-line / DOL), it draws 3–8× its rated current for
a fraction of a second. This is called *inrush current* or *starting surge*.
The inverter must survive this without tripping.

**Transformer-based (low-frequency / LF) inverter — surge multiplier 2.5×:**
- Contains a heavy iron-core toroidal transformer between the DC battery and the AC output stage.
- The transformer's inductance stores magnetic energy (`E = ½ × L × I²`) and releases it during the surge, acting like a short-term energy buffer.
- The copper windings have thermal mass that absorbs the brief I²R heat spike without triggering protection.
- Result: the inverter can sustain 2.5× its rated VA for ~1–2 seconds, enough for most DOL motor starts.
- Trade-off: heavier, bulkier, more expensive, slightly lower efficiency at light loads.

**Transformerless (high-frequency / HF) inverter — surge multiplier 2.0×:**
- Replaces the iron-core transformer with a smaller DC-link capacitor bank and a high-frequency switching stage (~20–100 kHz).
- The capacitor bank delivers burst current but has less stored energy than a transformer.
- When a heavy motor starts, the DC bus voltage sags briefly; if too deep, the protection circuit trips the inverter.
- Result: tighter 2.0× surge rating, stricter overload window.
- Trade-off: lighter, more compact, higher efficiency at full load, lower cost.

**In the engine** (`10-engines.ts` — InverterSizingEngine):
```
surgeCap_VA = recommendedSizeVA × inverterSurgeMultiplier
if surgeCap_VA < surgeRequired × 1.10:
    auto-promote to next catalog tier
    set surgePromotionApplied = true
```
The 10% headroom (`× 1.10`) accounts for real-world variability in motor starting
current — motors do not start identically every time.

### DC Bus Voltage and its Engineering Consequences

The DC bus voltage (24V or 48V) is a fundamental system design choice that
affects everything:

| Quantity | 24V example | 48V example | Formula |
|---------|------------|------------|---------|
| Continuous DC current | 133A (3kVA / 24V / 0.94) | 89A (4kVA / 48V / 0.94) | `I = VA / V / η` |
| Cable cross-section | ~50mm² | ~25mm² | Larger current = larger cable |
| Battery capacity | 800Ah (19.2kWh at 24V) | 400Ah (19.2kWh at 48V) | `Wh = Ah × V` |
| BMS rating needed | 200A+ | 100A+ | Must exceed peak DC current |

**Rule of thumb:** For systems above ~5kWh or ~3kVA inverter, 48V is almost
always the better choice. 24V is practical for small residential systems
(1–3kVA, up to ~5kWh). The calculator currently does not enforce this
recommendation automatically — that is a planned enhancement (#R1).

### Confidence Score Formula

The confidence score on the PDF cover page is computed by
`computeConfidenceMetrics()` in `25-controller-payloads.ts`:

```
score = max(0, 100 - weightedDeviation - architecturePenalty - strategyPenalty)

weightedDeviation = (invDev × 0.40) + (battDev × 0.35) + (pvDev × 0.25)
  — only non-zero when user has overridden the auto-sizing
  
architecturePenalty:
  architecture.status === 'warn' → +5
  architecture.status === 'fail' → +12
  throughput === 'warn' → +4
  throughput === 'fail' → +10
  mppt grouping === 'warn' → +2

strategyPenalty:
  strategy.status === 'warn' → +4
  strategy.status === 'fail' → +10
  intent not aligned → +3
  system type not aligned → +3
```

**Score buckets:**
- 85–100: High confidence (green)
- 65–84: Moderate (blue)
- 45–64: Managed (amber)
- 0–44: **Stress** (red)

A score of 36% (as seen in the May 14 installer PDF) means the system penalties
total ~64 points. This typically results from: `architecture fail (+12) + throughput
warn (+4) + strategy warn (+4) + intent misalignment (+3) + managed-mode
deviation` all compounding. It does NOT mean the system is physically dangerous
— it means the commercial story and engineering posture need to be tightened
before the PDF becomes a credible client-ready proposal.

---

## Languages Summary Table

| Language / Technology | Role | Where in Project |
|-----------------------|------|-----------------|
| HTML5 | Page structure, forms, UI elements | `src/template.html` |
| CSS3 | Visual styling, layout, dark mode, responsive | `src/styles/app.css` |
| JavaScript (ES2020+) | Application logic, DOM manipulation, PDF generation | `src/scripts/modules/30-controller.js`, `40-init.js` |
| TypeScript 5 | Type-safe calculation engines and data contracts | `src/scripts/modules/00-defaults.ts`, `10-engines.ts`, `20-reporting.ts`, `25-29-*.ts` |
| Node.js | Build tooling, optional backend server | `scripts/build_artifacts.js`, `backend/` |
| SQL (SQLite dialect) | Optional premium database | `backend/` |
| SVG | System diagram rendered inline | Built by `30-controller.js`, embedded in HTML/PDF |
| JSON | Project save/load format, configuration | `localStorage`, `package.json`, import/export |
| Markdown | Documentation | All files in `Helpful Md/` |
| YAML/TOML | Deployment configuration | `.github/workflows/*.yml`, `netlify.toml`, `render.yaml` |
| Shell/Bash | Build commands, git operations | `npm run build`, `git` commands |

---

*Last updated: 2026-05-14 | Written for: Leebartea (web development student)*
*Codebase: Advanced PV Calculator — github.com/Leebartea/Photovoltaic*
