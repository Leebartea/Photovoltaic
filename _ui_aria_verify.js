/**
 * ARIA verification for field-help popover system
 * Checks that initFieldHelpPopovers() wired everything correctly
 */
const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:9005/pv_calculator_ui.html', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 1500));

  const results = await page.evaluate(() => {
    const icons = document.querySelectorAll('.field-help-icon');
    const panels = document.querySelectorAll('.field-help:not(.always-visible)');

    let iconStats = { total: 0, hasRole: 0, hasAriaExpanded: 0, hasAriaLabel: 0, hasAriaDescribedby: 0, hasAriaControls: 0 };
    let panelStats = { total: 0, hasId: 0, hasRole: 0, hasAriaHidden: 0 };

    icons.forEach(icon => {
      iconStats.total++;
      if (icon.getAttribute('role') === 'button') iconStats.hasRole++;
      if (icon.hasAttribute('aria-expanded')) iconStats.hasAriaExpanded++;
      if (icon.hasAttribute('aria-label')) iconStats.hasAriaLabel++;
      if (icon.hasAttribute('aria-describedby')) iconStats.hasAriaDescribedby++;
      if (icon.hasAttribute('aria-controls')) iconStats.hasAriaControls++;
    });

    panels.forEach(panel => {
      panelStats.total++;
      if (panel.id) panelStats.hasId++;
      if (panel.getAttribute('role') === 'tooltip') panelStats.hasRole++;
      if (panel.hasAttribute('aria-hidden')) panelStats.hasAriaHidden++;
    });

    // Check one sample pair is properly linked
    const firstIcon = document.querySelector('.field-help-icon[aria-controls]');
    const linkedId = firstIcon ? firstIcon.getAttribute('aria-controls') : null;
    const linkedPanel = linkedId ? document.getElementById(linkedId) : null;

    // Check tooltip CSS-only hover still works (panel has display:none by default)
    const firstPanel = document.querySelector('.field-help:not(.always-visible)');
    const firstPanelDisplay = firstPanel ? window.getComputedStyle(firstPanel).display : 'none';

    return {
      iconStats,
      panelStats,
      sampleLink: {
        iconControls: linkedId,
        panelFound: !!linkedPanel,
        panelRole: linkedPanel ? linkedPanel.getAttribute('role') : null,
        panelAriaHidden: linkedPanel ? linkedPanel.getAttribute('aria-hidden') : null,
      },
      panelDefaultDisplay: firstPanelDisplay,
    };
  });

  console.log('\n=== Field Help ARIA Verification ===\n');
  console.log('Icons:');
  console.log(`  Total:              ${results.iconStats.total}`);
  console.log(`  role="button":      ${results.iconStats.hasRole}/${results.iconStats.total}`);
  console.log(`  aria-expanded:      ${results.iconStats.hasAriaExpanded}/${results.iconStats.total}`);
  console.log(`  aria-label:         ${results.iconStats.hasAriaLabel}/${results.iconStats.total}`);
  console.log(`  aria-describedby:   ${results.iconStats.hasAriaDescribedby}/${results.iconStats.total}`);
  console.log(`  aria-controls:      ${results.iconStats.hasAriaControls}/${results.iconStats.total}`);
  console.log('\nPanels:');
  console.log(`  Total:              ${results.panelStats.total}`);
  console.log(`  Has id:             ${results.panelStats.hasId}/${results.panelStats.total}`);
  console.log(`  role="tooltip":     ${results.panelStats.hasRole}/${results.panelStats.total}`);
  console.log(`  aria-hidden:        ${results.panelStats.hasAriaHidden}/${results.panelStats.total}`);
  console.log('\nSample pair linkage:');
  console.log(`  icon aria-controls: ${results.sampleLink.iconControls}`);
  console.log(`  panel found by id:  ${results.sampleLink.panelFound}`);
  console.log(`  panel role:         ${results.sampleLink.panelRole}`);
  console.log(`  panel aria-hidden:  ${results.sampleLink.panelAriaHidden}`);
  console.log(`\n  Panel default display (should be "none"): ${results.panelDefaultDisplay}`);

  await browser.close();

  const allGood = results.iconStats.hasRole === results.iconStats.total &&
                  results.iconStats.hasAriaExpanded === results.iconStats.total &&
                  results.iconStats.hasAriaLabel === results.iconStats.total &&
                  results.panelStats.hasId === results.panelStats.total &&
                  results.panelStats.hasRole === results.panelStats.total &&
                  results.panelStats.hasAriaHidden === results.panelStats.total &&
                  results.sampleLink.panelFound &&
                  results.panelDefaultDisplay === 'none';

  console.log(allGood ? '\n✓ ARIA WIRING COMPLETE\n' : '\n✗ ISSUES FOUND — review above\n');
  process.exit(allGood ? 0 : 1);
}

run().catch(e => { console.error(e.message); process.exit(1); });
