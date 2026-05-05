# Manual Testing Checklist

This document provides hand-rolled HTML fixtures and a step-by-step procedure
to verify that the WCAG and Israeli SI 5568 Checker behaves as documented.
Automated unit tests are out of scope for the current version — this checklist
is the recommended substitute.

## Setup

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```
2. Open `chrome://extensions/`, enable **Developer mode**, click **Load
   unpacked**, and select the `dist/` folder.
3. Confirm the extension shows the accessibility icon in the toolbar.

## Fixture-based test plan

Each fixture lives in `tests/fixtures/`. Open each fixture in a tab, click the
extension icon, set the standard, and run a single-page scan. Note that some
rules only fire for specific standards (e.g. SI 5568-only rules).

| #  | Fixture                              | Standard            | Expected failing rules                                                                                |
|----|--------------------------------------|---------------------|--------------------------------------------------------------------------------------------------------|
| 01 | `01-image-alt.html`                  | WCAG 2.1            | `image-alt` (1 affected)                                                                               |
| 02 | `02-form-labels.html`                | WCAG 2.1            | `form-label` (1), `placeholder-only-label` (1)                                                         |
| 03 | `03-color-contrast.html`             | WCAG 2.1            | `color-contrast` (>=1)                                                                                 |
| 04 | `04-missing-lang.html`               | WCAG 2.1            | `html-lang`, `main-landmark` may pass (has main)                                                       |
| 05 | `05-hebrew-no-lang.html`             | SI 5568             | `hebrew-rtl` (lang is wrong + dir missing), `accessibility-statement`                                  |
| 06 | `06-hebrew-no-rtl.html`              | SI 5568             | `hebrew-rtl` (dir not rtl), `accessibility-statement`                                                  |
| 07 | `07-missing-title.html`              | WCAG 2.1            | `document-title`                                                                                       |
| 08 | `08-skipped-headings.html`           | WCAG 2.1            | `heading-order` (>=1 — skip + empty)                                                                   |
| 09 | `09-duplicate-ids.html`              | WCAG 2.1            | `duplicate-id`                                                                                         |
| 10 | `10-iframe-no-title.html`            | WCAG 2.1            | `iframe-title` (1)                                                                                     |
| 11 | `11-positive-tabindex.html`          | WCAG 2.1            | `tabindex-positive` (2)                                                                                |
| 12 | `12-aria-misuse.html`                | WCAG 2.1            | `aria-misuse` (>=3 — bad role, broken labelledby, broken describedby, hidden focusable)                |
| 13 | `13-keyboard-handler.html`           | WCAG 2.1            | `keyboard-handler` (>=2)                                                                               |
| 14 | `14-accessibility-statement.html`    | SI 5568             | `accessibility-statement` (1)                                                                          |

To open a fixture file with the extension in scope, copy its absolute path into
the address bar (e.g. `file:///C:/.../tests/fixtures/01-image-alt.html`). Note
that `file://` URLs work as long as you do not enable Chrome's "Block file URL
access" for the extension.

## Smoke test for the popup itself

- [ ] Popup loads at 780×560 px without overflow.
- [ ] Tab focus is visible on every control.
- [ ] Sortable column headers (Severity, Affected) toggle on **Enter** / **Space** keys.
- [ ] `aria-sort` flips between `ascending` / `descending` / `none`.
- [ ] Scan progress is announced by a screen reader (look at the
      `role="status"` region in DOM).
- [ ] Clicking **Clear results** wipes the dashboard and the persisted scan.
- [ ] Closing and re-opening the popup restores the most recent scan.
- [ ] **Re-scan** button only appears when a result is present.
- [ ] **LTR / RTL** toggle flips the page direction.
- [ ] Empty-state copy mentions "automated screening only".

## Standards mode test

- [ ] Picking **WCAG 2.0** drops WCAG-2.1-only rules (`input-purpose`,
      `label-in-name`, `status-messages`, `orientation-lock`, `text-spacing`,
      `non-text-contrast`, `pointer-cancellation`, `content-on-hover`).
- [ ] Picking **WCAG 2.2** drops `duplicate-id` (which WCAG 2.2 removed) and
      adds `target-size-minimum` (new in 2.2). Verified by absence/presence in
      the WcagChecksStats coverage table.
- [ ] Picking **SI 5568** runs every rule that maps to a WCAG 2.0 success
      criterion (≈ 38 rules) plus the two Israel-specific rules (`hebrew-rtl`,
      `accessibility-statement`). Rules that exist only in WCAG 2.1 / 2.2 are
      excluded from SI 5568 mode (see the list above).
- [ ] In SI 5568 mode, the coverage table title cells reference `SI 5568 Part 1`
      or `SI 5568 Part 2` (with the appropriate clause) — not "WCAG …".
- [ ] In SI 5568 mode, expanding any issue from one of the 17 PDF-covered
      rules (`image-alt`, `form-label`, `placeholder-only-label`,
      `heading-order`, `document-title`, `color-contrast`, `video-captions`,
      `audio-text-alt`, `hebrew-rtl`, `accessibility-statement`,
      `link-purpose`, `audio-control`, `audio-description`, `tables-headers`,
      `fieldset-legend`, `use-of-color`, `images-of-text`) shows a highlighted
      "Standard text:" panel with the SI 5568 wording and a `Source: SI 5568
      Part X §Y (Level Z)` citation line.
- [ ] For `heading-order`, `video-captions`, `audio-text-alt`, and
      `audio-description`, SI 5568 mode shows an "Annex D → AA" badge on the
      issue subheading and the coverage row, reflecting the Israeli national
      level override.

## New rules sanity test

After loading the rebuilt extension, open any moderately complex public site
(e.g. a news site, a government portal) and run a single-page scan in
**WCAG 2.1** mode:

- [ ] The WCAG coverage table now lists ≈ 40+ rule rows (was 22 in the
      previous version), confirming the 24 new rules are registered.
- [ ] At least a few new rule ids appear among the failing issues (typical
      candidates on a real-world page: `link-purpose`, `target-size-minimum`,
      `non-text-contrast`, `multiple-ways`, `language-of-parts`).
- [ ] No rule produces a JavaScript error in the DevTools console.

## SI 5568 + Hebrew language test

Switch the **Preferred Language** in the sidebar to "עברית" and pick the
**SI 5568** standard, then run a scan against `01-image-alt.html`,
`08-skipped-headings.html`, `02-form-labels.html`, `07-missing-title.html`,
and `03-color-contrast.html` (or any pages exercising those rules):

- [ ] Issue titles and descriptions render in Hebrew.
- [ ] The "ציטוט מהתקן:" panel shows the Hebrew quote sourced from PDF Part 2
      (e.g. for `image-alt`: "אם תמונה מעבירה מידע או מסר שאינו מוצג בגוף
      הטקסט, יוסף לה טקסט חלופי…").
- [ ] The Hebrew citation line reads `מקור: ת"י 5568 חלק X, סעיף Y, רמת תאימות Z`.
- [ ] Switching the preferred language back to English re-renders all rule
      copy in English without re-running the scan.

## Disability filter test

Run any scan, then toggle filters:

- [ ] Selecting only **Hearing** keeps `video-captions` and `audio-text-alt`,
      hides `image-alt`, etc.
- [ ] Selecting only **Visual** hides `video-captions`.
- [ ] Coverage table (`WcagChecksStats`) shrinks accordingly. (This was
      previously broken — verifying this fixes the regression.)
- [ ] Score and KPI cards update consistently.

## Export test

- [ ] **Export JSON** downloads a `.json` file with `meta` and `scan` keys.
- [ ] **Export CSV** downloads a `.csv` file that opens cleanly in Excel /
      LibreOffice with one row per issue.
- [ ] CSV header line includes `WCAG Reference` and `SI 5568 Reference`.

## Full-site crawl test

Open any small same-origin static site (e.g. a localhost dev server). Set
scope = `Entire Site`, max pages = 5, run the scan.

- [ ] Hidden tabs flicker only inside a separate minimized window (not the
      main browser window).
- [ ] If any page fails, the dashboard shows a "_n_ pages could not be
      scanned" amber banner with URLs and error messages.
- [ ] Crawl never exceeds the configured `maxPages` value.
