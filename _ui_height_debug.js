/**
 * Debug script: measure height breakdown and tooltip rendering
 */
const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:9005/pv_calculator_ui.html', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 1500));

  const data = await page.evaluate(() => {
    // Card heights
    const cards = ['systemConfigCard','projectWorkspaceCard','projectTemplatesCard',
      'workflowGuideCard','proposalIdentityCard','proposalPricingCard',
      'applianceInputCard','applianceListCard','upgradeSimulatorCard','equipmentSpecsCard'];

    const cardHeights = {};
    for (const id of cards) {
      const el = document.getElementById(id);
      cardHeights[id] = el ? el.getBoundingClientRect().height : 'not found';
    }

    // Tooltip visibility check
    const fieldHelps = document.querySelectorAll('.field-help');
    const helpButtons = document.querySelectorAll('button.field-help-icon');
    const boundHelpButtons = document.querySelectorAll('button.field-help-icon[aria-controls][aria-describedby][aria-expanded]');
    const tooltipPanels = document.querySelectorAll('.field-help[role="tooltip"]');
    let visibleHelps = 0;
    let hiddenHelps = 0;
    for (const el of fieldHelps) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') hiddenHelps++;
      else visibleHelps++;
    }

    // Form group heights sample
    const formGroups = document.querySelectorAll('.form-group');
    const sampleHeights = [];
    for (let i = 0; i < Math.min(10, formGroups.length); i++) {
      sampleHeights.push(formGroups[i].getBoundingClientRect().height);
    }

    // Check if field-help-wrap is block or inline
    const wrap = document.querySelector('.field-help-wrap');
    const wrapStyle = wrap ? window.getComputedStyle(wrap) : null;

    // Page height
    const inputCol = document.querySelector('.input-column, [class*="left"]');

    return {
      pageScrollHeight: document.body.scrollHeight,
      cardHeights,
      fieldHelpVisible: visibleHelps,
      fieldHelpHidden: hiddenHelps,
      totalFieldHelps: fieldHelps.length,
      helpButtons: helpButtons.length,
      boundHelpButtons: boundHelpButtons.length,
      tooltipPanels: tooltipPanels.length,
      sampleFormGroupHeights: sampleHeights,
      avgFormGroupHeight: sampleHeights.length ? (sampleHeights.reduce((a,b)=>a+b,0)/sampleHeights.length).toFixed(1) : 0,
      wrapDisplay: wrapStyle ? wrapStyle.display : 'no wrap found',
      inputColHeight: inputCol ? inputCol.scrollHeight : 'not found',
    };
  });

  console.log('\n=== Height Debug ===\n');
  console.log('Page scroll height:', data.pageScrollHeight);
  console.log('Input column height:', data.inputColHeight);
  console.log('\nCard heights:');
  for (const [id, h] of Object.entries(data.cardHeights)) {
    console.log(`  ${id}: ${h}px`);
  }
  console.log('\nTooltip visibility:');
  console.log(`  Total .field-help elements: ${data.totalFieldHelps}`);
  console.log(`  Hidden (display:none): ${data.fieldHelpHidden}`);
  console.log(`  Visible: ${data.fieldHelpVisible}`);
  console.log(`  Help buttons: ${data.helpButtons}`);
  console.log(`  Help buttons with binding: ${data.boundHelpButtons}`);
  console.log(`  Tooltip panels: ${data.tooltipPanels}`);
  console.log(`\n  .field-help-wrap display: ${data.wrapDisplay}`);
  console.log(`\nSample form-group heights: ${data.sampleFormGroupHeights.join(', ')}`);
  console.log(`Average form-group height: ${data.avgFormGroupHeight}px`);

  await browser.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
