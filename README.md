# Advanced PV System Calculator

A single-page, zero-dependency photovoltaic system sizing tool built for the Nigerian off-grid solar market.

**[Live Demo](https://leebartea.github.io/pv-calculator/)** &nbsp;|&nbsp; **v1.0.0**

---

## What It Does

Enter your appliances (lights, freezers, sewing machines, pumps, etc.) and the calculator produces a complete system design:

- **Inverter sizing** with motor surge analysis, compliance-aware tiers, and market-range recommendations (e.g. 2400-2500 VA)
- **Battery bank** sizing for AGM, Gel, FLA, and LiFePO4 with SVG overview diagram
- **PV array** configuration with MPPT validation, cold Voc checks, and charge-time estimates
- **Cable sizing** with NEC-compliant ampacity and voltage drop calculations
- **Protection scheme** — breakers, fuses, and disconnect sizing
- **Smart advisories** — motor sub-type detection (clutch vs servo), industrial sewing machine flags, PV array health tiers, and stagger guidance

## Key Features

| Feature | Detail |
|---------|--------|
| Motor sub-types | Clutch, servo, compressor, pump, fan — each with correct surge, efficiency, and power factor |
| Industrial detection | Sewing machines >400 W flagged as industrial with compliance risk assessment |
| Inverter tiers | Conservative / Recommended / Optimized with market-range formatting |
| Battery override | Auto-calculated parallel strings with optional manual unit-count override |
| PV advisories | 5-tier array health (Oversized → Critical), MPPT clipping, seasonal performance |
| Daytime load analysis | Simultaneous charge + load feasibility with charge-time estimates |
| SVG overview | Compact, dynamic system diagram — panels, MPPT, batteries, inverter, loads |
| Dark mode | One-click theme toggle |
| PDF export | Download results via jsPDF |
| Offline-capable | Runs entirely in the browser — no backend required |

## Getting Started

### GitHub Pages (recommended)

1. Fork or clone this repository.
2. Rename `pv_calculator_ui.html` to `index.html`.
3. Enable GitHub Pages in **Settings → Pages → Source: main branch**.
4. Visit `https://<your-username>.github.io/<repo-name>/`.

### Local

Open `pv_calculator_ui.html` directly in any modern browser. No server needed.

```
Advance Estimation/
├── index.html        # The calculator (rename from pv_calculator_ui.html)
├── README.md         # This file
└── LICENSE.txt       # MIT License
```

## Browser Support

Chrome, Firefox, Safari, Edge — any browser with ES6 support.

## Disclaimer

This tool is for estimation and planning purposes only. Final system designs must be validated by a qualified solar engineer or electrician in accordance with local electrical codes and standards.

## License

[MIT](LICENSE.txt) &copy; 2026 Leebartea
