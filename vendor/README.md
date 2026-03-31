# Vendored Browser Assets

This directory holds third-party browser assets that are intentionally bundled into the generated artifacts.

Current asset:

- `vendor/jspdf.umd.min.js`
  - package: `jsPDF`
  - version: `2.5.1`
  - license: `MIT` (license header retained in the file)

Build behavior:

- `node scripts/build_artifacts.js` inlines this file into the standalone `pv_calculator_ui.html`
- the same build copies it to `dist/web/assets/vendor/jspdf.umd.min.js`
- hosted builds reference the local vendor asset first
- PDF export therefore works without CDN access by default

If you intentionally remove this file, the build falls back to the CDN path for `jsPDF`.
