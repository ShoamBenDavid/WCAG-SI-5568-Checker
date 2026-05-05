# WCAG and Israeli SI 5568 Checker (Chrome Extension)

A Manifest V3 Chrome extension that performs **automated accessibility
screening** against WCAG 2.0 / 2.1 / 2.2 and selected Israeli Standard SI 5568
checks. The extension scans the active web page directly (no remote server),
maps each finding to the relevant standard, and presents a structured report
in a React popup.

> This tool provides **automated screening only**. It does not certify SI 5568
> compliance and is not a substitute for a manual accessibility audit.

## Features

- 46 automated accessibility rules covering WCAG 2.0 / 2.1 / 2.2 A and AA
- Real-time DOM scanning (no mock data)
- Single-page or full-site crawl (configurable max pages, 1–25)
- Compliance modes: WCAG 2.0, WCAG 2.1, WCAG 2.2, Israeli SI 5568 (full mode)
- SI 5568 mode runs every WCAG 2.0 check plus Israeli-specific checks
  (Hebrew lang/RTL, accessibility statement); 10 rules display the original
  Hebrew source text from the SI 5568 PDFs
- Severity-weighted score, charts, KPI cards, sortable issues table
- Disability filter (visual / hearing / motor / cognitive) applied to issues,
  stats, and the score
- Persisted last scan via `chrome.storage.local` (auto-restored on popup re-open)
- Export to JSON or CSV (no third-party deps)
- Re-scan button for SPAs / dynamic content
- Self-accessible popup: keyboard sortable headers, `aria-sort`, `aria-live`
  progress, visible focus rings, optional RTL layout

## Implemented checks

| Rule ID                       | WCAG SC | SI 5568 clause                | Disabilities                   |
|-------------------------------|---------|-------------------------------|--------------------------------|
| `image-alt`                   | 1.1.1   | Part 2 §4 (1.1.1)             | visual                         |
| `form-label`                  | 1.3.1   | Part 2 §4 (1.3.1)             | visual, cognitive, motor       |
| `placeholder-only-label`      | 3.3.2   | Part 2 §5 (2.4.6)             | cognitive, visual              |
| `interactive-name`            | 4.1.2   | (excluded from SI 5568 mode)  | visual, cognitive, motor       |
| `html-lang`                   | 3.1.1   | (excluded from SI 5568 mode)  | cognitive, visual              |
| `document-title`              | 2.4.2   | Part 2 §5 (2.4.2)             | visual, cognitive              |
| `heading-order`               | 1.3.1   | Part 2 §4 (1.3.1) + Part 1 Annex D (2.4.10 → AA) | cognitive, visual |
| `duplicate-id`                | 4.1.1*  | (excluded from SI 5568 mode)  | visual, cognitive              |
| `tabindex-positive`           | 2.4.3   | (excluded from SI 5568 mode)  | motor, visual, cognitive       |
| `keyboard-handler`            | 2.1.1   | (excluded from SI 5568 mode)  | motor, visual, cognitive       |
| `iframe-title`                | 4.1.2   | (excluded from SI 5568 mode)  | visual, cognitive              |
| `video-captions`              | 1.2.2   | Part 1 Annex D (1.2.2 → AA)   | hearing                        |
| `audio-text-alt`              | 1.2.1   | Part 1 Annex D (1.2.1 → AA)   | hearing                        |
| `color-contrast`              | 1.4.3   | Part 2 §4 (1.4.3) — defs 3.6 / 3.7 | visual                    |
| `main-landmark`               | 2.4.1   | (excluded from SI 5568 mode)  | visual, cognitive              |
| `skip-link`                   | 2.4.1   | (excluded from SI 5568 mode)  | motor, visual, cognitive       |
| `aria-misuse`                 | 4.1.2   | (excluded from SI 5568 mode)  | visual, cognitive              |
| `focus-visible`               | 2.4.7   | (excluded from SI 5568 mode)  | motor, visual, cognitive       |
| **`hebrew-rtl`** (SI 5568)    | —       | Hebrew lang/RTL (Israeli regulation) | visual, cognitive       |
| **`accessibility-statement`** (SI 5568) | — | Equal Rights Reg. 35       | all                            |
| `input-purpose`               | 1.3.5   | (WCAG 2.1+ only)              | cognitive, motor, visual       |
| `link-purpose`                | 2.4.4   | Part 2 §5 (2.4.4)             | visual, cognitive              |
| `label-in-name`               | 2.5.3   | (WCAG 2.1+ only)              | motor, cognitive               |
| `audio-control`               | 1.4.2   | Part 1 (1.4.2)                | visual, cognitive, motor       |
| `status-messages`             | 4.1.3   | (WCAG 2.1+ only)              | visual, cognitive              |
| `meta-refresh`                | 2.2.1   | Part 1 (2.2.1)                | cognitive, motor, visual       |
| `target-size-minimum`         | 2.5.8   | (WCAG 2.2 only)               | motor                          |
| `tables-headers`              | 1.3.1   | Part 2 §4 (1.3.1)             | visual, cognitive              |
| `fieldset-legend`             | 1.3.1   | Part 2 §4 (1.3.1)             | visual, cognitive, motor       |
| `viewport-resize`             | 1.4.4   | Part 1 (1.4.4)                | visual, cognitive              |
| `pause-stop-hide`             | 2.2.2   | Part 1 (2.2.2)                | cognitive, motor, visual       |
| `orientation-lock`            | 1.3.4   | (WCAG 2.1+ only)              | motor, cognitive, visual       |
| `text-spacing`                | 1.4.12  | (WCAG 2.1+ only)              | visual, cognitive              |
| `language-of-parts`           | 3.1.2   | Part 1 (3.1.2)                | visual, cognitive              |
| `non-text-contrast`           | 1.4.11  | (WCAG 2.1+ only)              | visual                         |
| `multiple-ways`               | 2.4.5   | Part 1 (2.4.5)                | cognitive, motor, visual       |
| `audio-description`           | 1.2.3   | Part 1 Annex D (1.2.3 → AA)   | visual                         |
| `on-focus`                    | 3.2.1   | Part 1 (3.2.1)                | motor, cognitive, visual       |
| `on-input`                    | 3.2.2   | Part 1 (3.2.2)                | cognitive, motor               |
| `error-identification`        | 3.3.1   | Part 1 (3.3.1)                | visual, cognitive, motor       |
| `pointer-cancellation`        | 2.5.2   | (WCAG 2.1+ only)              | motor                          |
| `content-on-hover`            | 1.4.13  | (WCAG 2.1+ only)              | visual, cognitive, motor       |
| `use-of-color`                | 1.4.1   | Part 2 §4 (1.4.1)             | visual, cognitive              |
| `images-of-text`              | 1.4.5   | Part 2 §4 (1.4.5)             | visual, cognitive              |

\* `duplicate-id` (WCAG 4.1.1 Parsing) was deprecated in WCAG 2.2; this tool
still surfaces it under WCAG modes because it remains a real-world cause of
accessibility bugs.

## Full SI 5568 mode coverage

SI 5568 Part 1 (March 2013) adopts WCAG 2.0 verbatim with national amendments
documented in Annex D. The "Israeli Standard SI 5568" mode therefore runs
**every rule that maps to a WCAG 2.0 success criterion** plus the two
Israel-specific rules (`hebrew-rtl`, `accessibility-statement`). Rules that
exist only in WCAG 2.1 or WCAG 2.2 (1.3.4, 1.3.5, 1.4.10, 1.4.11, 1.4.12,
1.4.13, 2.5.2, 2.5.3, 2.5.8, 4.1.3) are excluded from SI 5568 mode because
they were not adopted by the Israeli standard.

For the **10 rules whose criteria are explicitly described in the SI 5568
PDFs** — `image-alt`, `form-label`, `placeholder-only-label`, `heading-order`,
`document-title`, `color-contrast`, `video-captions`, `audio-text-alt`,
`hebrew-rtl`, `accessibility-statement`, plus the new PDF-covered rules
`link-purpose`, `audio-control`, `audio-description`, `tables-headers`,
`fieldset-legend`, `use-of-color`, and `images-of-text` — the developer view of
each issue includes a "Standard text" panel showing the source quote from the
SI 5568 PDFs and a `Source: SI 5568 Part X §Y (Level Z)` citation line. When
the user's preferred language is Hebrew, both the rule explanation and the
source quote are rendered in Hebrew (sourced from the Hebrew text in the PDFs
themselves). Rules where Annex D promotes the conformance level —
`video-captions`, `audio-text-alt`, `audio-description`, and `heading-order`
(criterion 2.4.10) — show an "Annex D → AA" badge in both the issue subheading
and the coverage table.

## Manual review only (cannot be automated)

The following success criteria cannot be reliably tested by automated tools.
The extension does not run a check for them — these still require a manual
review by a qualified auditor:

- 1.3.2 Meaningful Sequence — depends on reading order in linearised content.
- 1.3.3 Sensory Characteristics — depends on instructions phrased as
  "click the button on the right".
- 2.1.2 No Keyboard Trap — needs runtime keyboard interaction.
- 2.1.4 Character Key Shortcuts — needs runtime keyboard interaction.
- 2.3.1 Three Flashes or Below Threshold — needs frame-rate analysis of media.
- 2.5.1 Pointer Gestures — needs runtime gesture inspection.
- 2.5.4 Motion Actuation — needs runtime device-motion inspection.
- 3.2.3 Consistent Navigation / 3.2.4 Consistent Identification — only
  testable across multiple pages of a full-site crawl (Phase-2 work).
- 3.3.4 Error Prevention — needs domain knowledge of legal/financial flows.

## Build extension package

```bash
npm install
npm run build
```

This bundles the React popup and copies the extension assets (manifest,
content/background scripts, scanner modules, rule files, icons) into `dist/`.

## Load in Chrome (unpacked)

1. Open `chrome://extensions/`
2. Turn on **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

## Architecture

```
public/
  manifest.json                      MV3 manifest with icons + module SW
  background.js                      Service worker orchestrator
  background/                        Aggregation, crawler, storage, disability filter
  content.js                         Thin orchestrator that calls window.__a11y.runScan
  scanner/                           Shared helpers: dom, accessible name, contrast
  rules/                             One file per rule, all registered to a shared registry
  icons/                             16/32/48/128 PNGs
src/
  components/                        React UI (Sidebar, Dashboard, IssuesTable, ExportBar, etc.)
  hooks/useScanState.ts              State + storage hydration
  lib/extensionBridge.ts             chrome.runtime message passing
  lib/exporters.ts                   JSON / CSV exporters
  types/index.ts                     Public TypeScript types
tests/
  fixtures/*.html                    Hand-rolled rule fixtures
  MANUAL_TESTING.md                  Step-by-step manual checklist
```

## Manual testing

See [`tests/MANUAL_TESTING.md`](tests/MANUAL_TESTING.md) for a full checklist
including each rule fixture and what failures to expect.

## Honesty disclaimer

Earlier versions of this extension implied that picking "Israeli Standard SI
5568" produced a complete SI 5568 compliance report. That was inaccurate. The
current build:

- In SI 5568 mode, runs every rule that maps to a WCAG 2.0 success criterion
  (since SI 5568 Part 1 adopts WCAG 2.0 verbatim), plus the Israel-specific
  rules (Hebrew lang/RTL, accessibility statement),
- For the 17 rules whose criteria are explicitly described in the two SI 5568
  PDFs (Part 1 March 2013 + Part 2 May 2020), shows the Hebrew source text
  from the PDFs when the preferred language is Hebrew,
- Cites the actual SI 5568 part / clause / level on every issue,
- Honors the Annex D level overrides (1.2.1, 1.2.2, 1.2.3, and 2.4.10 are
  promoted to AA),
- Clearly labels the result as "automated screening" in the UI and in this
  README.

Manual review by a qualified accessibility auditor is required for any formal
compliance attestation.

## Known limitations

- Cross-origin iframes are not scanned (their DOM is not accessible).
- Live MutationObserver mode is not implemented; use the **Re-scan** button
  for SPA route changes.
- Hebrew translations are provided only for the 17 SI 5568 PDF-covered rules.
  In WCAG modes, rules that have no `i18n.he` block fall back to English copy.
- `focus-visible` is a static CSS heuristic and may produce false positives or
  negatives.
- No automated unit-test runner — rely on the fixtures + manual checklist.
