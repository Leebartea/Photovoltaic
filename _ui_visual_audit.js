/**
 * UI Visual Audit Script using Playwright
 * Captures screenshots of all major UI sections for UX analysis
 * Run: node _ui_visual_audit.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:9005/pv_calculator_ui.html';
const OUT_DIR = path.join(__dirname, 'output', 'ui_audit');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function screenshot(page, name, opts = {}) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false, ...opts });
  console.log(`  ✓ ${name}.png`);
  return file;
}

async function run() {
  console.log('\n=== PV Calculator UI Visual Audit ===\n');

  // Use Playwright-managed Chromium (installed via `npx playwright install chromium`)
  // Falls back to system Chrome if not available
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // ── SECTION 1: Initial page load ─────────────────────────────────────────
  console.log('[1] Loading page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await delay(1000);

  const initialMetrics = await page.evaluate(() => {
    const inputCol = document.querySelector('.input-column, .left-column, [class*="input"]');
    return {
      pageScrollHeight: document.body.scrollHeight,
      inputColumnScrollHeight: inputCol ? inputCol.scrollHeight : document.body.scrollHeight,
    };
  });

  await screenshot(page, '01_initial_load');

  // Full-page capture of the entire input column (left side)
  await screenshot(page, '01b_full_page', { fullPage: true });

  // ── SECTION 2: Check audience modes ─────────────────────────────────────
  console.log('[2] Testing audience/workspace mode toggle...');

  // Check installer mode (likely default)
  const workspaceModeEl = page.locator('#workspaceMode, [id*="workspace"], select[name*="mode"]').first();
  const workspaceModeExists = await workspaceModeEl.count();
  if (workspaceModeExists) {
    await workspaceModeEl.selectOption({ index: 0 });
    await delay(500);
    await screenshot(page, '02a_installer_mode');
    await workspaceModeEl.selectOption({ index: 1 });
    await delay(500);
    await screenshot(page, '02b_client_mode');
    // Reset to installer
    await workspaceModeEl.selectOption({ index: 0 });
  }

  // ── SECTION 3: Scroll through input cards ────────────────────────────────
  console.log('[3] Scrolling through input sections...');

  const sections = [
    { id: '#systemConfigCard', name: '03a_system_config' },
    { id: '#projectWorkspaceCard', name: '03b_project_workspace' },
    { id: '#projectTemplatesCard', name: '03c_quick_start_templates' },
    { id: '#workflowGuideCard', name: '03d_workflow_guide' },
    { id: '#proposalIdentityCard', name: '03e_proposal_identity' },
    { id: '#proposalPricingCard', name: '03f_proposal_pricing' },
    { id: '#applianceInputCard', name: '03g_appliance_input' },
    { id: '#applianceListCard', name: '03h_appliance_list' },
    { id: '#upgradeSimulatorCard', name: '03i_upgrade_simulator' },
    { id: '#equipmentSpecsCard', name: '03j_equipment_specs' },
  ];

  for (const s of sections) {
    try {
      const el = page.locator(s.id).first();
      const count = await el.count();
      if (count > 0) {
        await el.scrollIntoViewIfNeeded();
        await delay(400);
        await screenshot(page, s.name);
      } else {
        console.log(`  - ${s.id} not found`);
      }
    } catch (e) {
      console.log(`  - ${s.id} error: ${e.message}`);
    }
  }

  // ── SECTION 4: Add a sample appliance and calculate ──────────────────────
  console.log('[4] Testing appliance entry flow...');

  try {
    // Scroll to appliance section
    await page.locator('#applianceInputCard').scrollIntoViewIfNeeded();
    await delay(300);

    // Try clicking "Load Sample" button
    const loadSampleBtn = page.locator('button:has-text("Load Sample"), button:has-text("Sample"), button[onclick*="loadSample"]').first();
    if (await loadSampleBtn.count() > 0) {
      await loadSampleBtn.click();
      await delay(500);
      await screenshot(page, '04a_after_load_sample');
    }

    // Try to fill appliance name
    const appNameInput = page.locator('#applianceName, input[placeholder*="appliance"], input[placeholder*="Appliance"]').first();
    if (await appNameInput.count() > 0) {
      await appNameInput.fill('Air Conditioner');
      await delay(300);
      await screenshot(page, '04b_appliance_name_filled');
    }

    // Try Add Appliance button
    const addBtn = page.locator('button:has-text("Add Appliance"), button:has-text("Add Load"), button[onclick*="addAppliance"]').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await delay(600);
      await page.locator('#applianceListCard').scrollIntoViewIfNeeded();
      await screenshot(page, '04c_appliance_list_with_item');
    }
  } catch (e) {
    console.log(`  - Appliance flow error: ${e.message}`);
  }

  // ── SECTION 5: Test template loading ────────────────────────────────────
  console.log('[5] Testing Quick Start Templates...');

  try {
    await page.locator('#projectTemplatesCard').scrollIntoViewIfNeeded();
    await delay(300);
    await screenshot(page, '05a_templates_card');

    // Click first template
    const firstTemplate = page.locator('[onclick*="applyTemplate"], [onclick*="loadTemplate"], .template-card, .template-btn').first();
    if (await firstTemplate.count() > 0) {
      await firstTemplate.click();
      await delay(800);
      await screenshot(page, '05b_after_template_applied');
    }
  } catch (e) {
    console.log(`  - Template flow error: ${e.message}`);
  }

  // ── SECTION 6: Calculate button and results ──────────────────────────────
  console.log('[6] Testing calculation flow...');

  try {
    const calcBtn = page.locator('button:has-text("Calculate"), button[onclick*="calculate"], button[onclick*="Calculate"]').first();
    if (await calcBtn.count() > 0) {
      await calcBtn.scrollIntoViewIfNeeded();
      await delay(300);
      await screenshot(page, '06a_calculate_button');
      await calcBtn.click();
      await delay(2000);
      await screenshot(page, '06b_results_full');

      // Scroll through results
      const resultsCol = page.locator('.results-column, #results, [id*="result"]').first();
      if (await resultsCol.count() > 0) {
        await resultsCol.scrollIntoViewIfNeeded();
        await delay(400);
        await screenshot(page, '06c_results_top');

        // Scroll down through results
        await page.evaluate(() => {
          const el = document.querySelector('.results-column, #resultsSection, [id*="result"]');
          if (el) el.scrollTop = 500;
        });
        await delay(400);
        await screenshot(page, '06d_results_mid');
      }
    }
  } catch (e) {
    console.log(`  - Calculation flow error: ${e.message}`);
  }

  // ── SECTION 7: Dark mode ─────────────────────────────────────────────────
  console.log('[7] Testing dark mode...');

  try {
    const themeBtn = page.locator('[onclick*="theme"], [onclick*="Theme"], button:has-text("Dark"), #themeToggle, .theme-toggle').first();
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      await delay(500);
      await screenshot(page, '07a_dark_mode');
      await themeBtn.click();
      await delay(300);
    }
  } catch (e) {
    console.log(`  - Dark mode error: ${e.message}`);
  }

  // ── SECTION 8: Mobile viewport ───────────────────────────────────────────
  console.log('[8] Testing mobile viewport (375px)...');

  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await delay(1000);
  await mobilePage.screenshot({ path: path.join(OUT_DIR, '08a_mobile_375.png'), fullPage: false });
  console.log('  ✓ 08a_mobile_375.png');

  // Scroll through key sections on mobile
  try {
    await mobilePage.locator('#applianceInputCard').scrollIntoViewIfNeeded();
    await delay(400);
    await mobilePage.screenshot({ path: path.join(OUT_DIR, '08b_mobile_appliance.png') });
    console.log('  ✓ 08b_mobile_appliance.png');
  } catch (e) {}

  // ── SECTION 9: Tablet viewport ───────────────────────────────────────────
  console.log('[9] Testing tablet viewport (768px)...');

  const tabletPage = await context.newPage();
  await tabletPage.setViewportSize({ width: 768, height: 1024 });
  await tabletPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await delay(1000);
  await tabletPage.screenshot({ path: path.join(OUT_DIR, '09a_tablet_768.png'), fullPage: false });
  console.log('  ✓ 09a_tablet_768.png');

  // ── SECTION 10: Inspect DOM for UX metrics ───────────────────────────────
  console.log('[10] Collecting DOM UX metrics...');

  const metrics = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    const cards = document.querySelectorAll('[id$="Card"], .card, .form-card, .section-card');
    const details = document.querySelectorAll('details');
    const buttons = document.querySelectorAll('button');
    const inlineStyles = document.querySelectorAll('[style]');
    const formRows = document.querySelectorAll('.form-row');
    const threeColRows = document.querySelectorAll('.form-row.three, .form-row.four');

    // Measure approximate scroll height of input column
    const inputCol = document.querySelector('.input-column, .left-column, [class*="input"]');
    const inputScrollHeight = inputCol ? inputCol.scrollHeight : document.body.scrollHeight;

    // Count hidden elements
    const hiddenElems = document.querySelectorAll('[style*="display:none"], [style*="display: none"], .hidden');

    // Count ARIA attributes
    const ariaLive = document.querySelectorAll('[aria-live]');
    const ariaExpanded = document.querySelectorAll('[aria-expanded]');
    const ariaLabel = document.querySelectorAll('[aria-label]');
    const helpButtons = document.querySelectorAll('button.field-help-icon');
    const helpButtonsWithBinding = document.querySelectorAll('button.field-help-icon[aria-controls][aria-describedby][aria-expanded]');
    const tooltipPanels = document.querySelectorAll('.field-help[role="tooltip"]');
    const tooltipPanelsWithHiddenState = document.querySelectorAll('.field-help[role="tooltip"][aria-hidden]');

    return {
      totalInputs: inputs.length,
      totalCards: cards.length,
      totalCollapsibleSections: details.length,
      totalButtons: buttons.length,
      totalInlineStyles: inlineStyles.length,
      totalFormRows: formRows.length,
      multiColumnFormRows: threeColRows.length,
      hiddenElements: hiddenElems.length,
      ariaLiveRegions: ariaLive.length,
      ariaExpandedAttrs: ariaExpanded.length,
      ariaLabels: ariaLabel.length,
      helpButtons: helpButtons.length,
      helpButtonsWithBinding: helpButtonsWithBinding.length,
      tooltipPanels: tooltipPanels.length,
      tooltipPanelsWithHiddenState: tooltipPanelsWithHiddenState.length,
      inputColumnScrollHeight: inputScrollHeight,
      pageScrollHeight: document.body.scrollHeight,
    };
  });

  // ── Summary report ───────────────────────────────────────────────────────
  console.log('\n=== UX DOM Metrics ===');
  console.log(`  Total form inputs (input/select/textarea): ${metrics.totalInputs}`);
  console.log(`  Total cards/sections: ${metrics.totalCards}`);
  console.log(`  Collapsible <details> sections: ${metrics.totalCollapsibleSections}`);
  console.log(`  Buttons: ${metrics.totalButtons}`);
  console.log(`  Elements with inline styles: ${metrics.totalInlineStyles}`);
  console.log(`  Form rows total: ${metrics.totalFormRows}`);
  console.log(`  Multi-column form rows (3-4 col): ${metrics.multiColumnFormRows}`);
  console.log(`  Hidden elements: ${metrics.hiddenElements}`);
  console.log(`  ARIA live regions: ${metrics.ariaLiveRegions}`);
  console.log(`  ARIA expanded attributes: ${metrics.ariaExpandedAttrs}`);
  console.log(`  ARIA labels: ${metrics.ariaLabels}`);
  console.log(`  Help buttons: ${metrics.helpButtons}`);
  console.log(`  Help buttons with full binding: ${metrics.helpButtonsWithBinding}`);
  console.log(`  Tooltip panels: ${metrics.tooltipPanels}`);
  console.log(`  Tooltip panels with aria-hidden: ${metrics.tooltipPanelsWithHiddenState}`);
  console.log(`  Initial page scroll height: ${initialMetrics.pageScrollHeight}px`);
  console.log(`  Initial input column height: ${initialMetrics.inputColumnScrollHeight}px`);
  console.log(`  Post-walkthrough page scroll height: ${metrics.pageScrollHeight}px`);
  console.log(`  Post-walkthrough input column height: ${metrics.inputColumnScrollHeight}px`);

  // Write metrics to JSON
  fs.writeFileSync(
    path.join(OUT_DIR, 'ux_metrics.json'),
    JSON.stringify({
      ...metrics,
      initialPageScrollHeight: initialMetrics.pageScrollHeight,
      initialInputColumnScrollHeight: initialMetrics.inputColumnScrollHeight,
      postWalkthroughPageScrollHeight: metrics.pageScrollHeight,
      postWalkthroughInputColumnScrollHeight: metrics.inputColumnScrollHeight,
    }, null, 2)
  );
  console.log('\n  Metrics saved to output/ui_audit/ux_metrics.json');

  await browser.close();
  console.log(`\n=== Audit complete. Screenshots in output/ui_audit/ ===\n`);
}

run().catch(err => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
