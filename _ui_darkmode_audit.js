/**
 * Dark mode visual audit — captures the same sections that had faint text
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:9005/pv_calculator_ui.html';
const OUT_DIR = path.join(__dirname, 'output', 'darkmode_audit');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, name) {
  const f = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`  ✓ ${name}.png`);
}

async function run() {
  console.log('\n=== Dark Mode Visual Audit ===\n');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 800));

  // Enable dark mode
  const themeBtn = page.locator('.theme-toggle, [onclick*="theme"], [onclick*="Theme"]').first();
  if (await themeBtn.count()) {
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 400));
  }

  // Load sample data and calculate so results are populated
  const loadBtn = page.locator('button:has-text("Load Sample Set"), button:has-text("Load Sample")').first();
  if (await loadBtn.count()) {
    await loadBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }
  const calcBtn = page.locator('button:has-text("Calculate System Design")').first();
  if (await calcBtn.count()) {
    await calcBtn.click();
    await new Promise(r => setTimeout(r, 2500));
  }

  // Capture initial dark view
  await shot(page, '01_dark_initial');

  // Helper: scroll the element into view, works inside nested scroll containers
  async function scrollTo(selector) {
    await page.evaluate(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      // Walk up to find a scrollable ancestor and scroll it
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow + style.overflowY;
        if (/scroll|auto/.test(overflow)) {
          const elTop = el.getBoundingClientRect().top;
          const parentTop = parent.getBoundingClientRect().top;
          parent.scrollTop += (elTop - parentTop) - 40;
          return;
        }
        parent = parent.parentElement;
      }
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, selector);
    await new Promise(r => setTimeout(r, 500));
  }

  // Pricing options (results column)
  await scrollTo('.proposal-options');
  await shot(page, '02_dark_pricing_options');

  // Proposal hero (results column)
  await scrollTo('.proposal-hero');
  await shot(page, '03_dark_proposal_hero');

  // Supplier freshness card (input column — scroll main page)
  await page.evaluate(() => {
    const el = document.querySelector('.supplier-pack-preview');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 400));
  await shot(page, '04_dark_supplier_freshness');

  // Support boundary strips (results column)
  await scrollTo('.support-boundary-strip');
  await shot(page, '05_dark_support_boundary');

  // Board source schedule (results column)
  await scrollTo('.plant-board-source-table');
  await shot(page, '06_dark_board_schedule');

  await browser.close();
  console.log(`\n=== Done. Screenshots in output/darkmode_audit/ ===\n`);
}

run().catch(e => { console.error(e.message); process.exit(1); });
