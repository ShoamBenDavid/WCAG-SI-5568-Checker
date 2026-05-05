(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  /**
   * Static heuristic for missing focus styles.
   *
   * We scan the loaded stylesheets for selectors that include `:focus` and
   * declare `outline: none` or `outline: 0`. If any such rule has no
   * companion `:focus-visible` rule (or other clearly visible focus style
   * such as `box-shadow`/`border` change), we surface it as a warning.
   *
   * Limitations:
   *   - Cross-origin stylesheets are not readable from the content script
   *     and are skipped silently.
   *   - We can't tell whether developers add a focus style via a different
   *     selector (e.g. `.btn.is-focused`). This is best-effort.
   */
  function gatherCssRules() {
    const out = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // CORS-blocked
      }
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (rule && rule.selectorText && rule.style) {
          out.push({
            selector: rule.selectorText,
            cssText: rule.style.cssText || "",
          });
        }
      }
    }
    return out;
  }

  a11y.register({
    id: "focus-visible",
    title: "Focus indicators must remain visible (heuristic)",
    description:
      "Stylesheets declare outline:0 or outline:none on :focus without an alternative focus style or :focus-visible rule.",
    whyItMatters:
      "Removing focus outlines without replacing them strands keyboard users, who cannot tell where they are on the page.",
    severity: "moderate",
    recommendation:
      "Provide a clearly visible focus style (outline, box-shadow, or border change). Consider :focus-visible to differentiate keyboard from mouse focus.",
    disabilities: ["motor", "visual", "cognitive"],
    selectorHint: ":focus styles",
    standards: {
      wcag20: { criterion: "2.4.7", level: "AA" },
      wcag21: { criterion: "2.4.7", level: "AA" },
      wcag22: { criterion: "2.4.7", level: "AA" },
      si5568: { criterion: "2.4.7", clause: "Annex A 2.4.7", level: "AA" },
    },
    run(doc) {
      const rules = gatherCssRules();
      let failedRules = 0;
      const total = Math.max(rules.length, 1);
      const hasFocusVisibleAlt = rules.some((r) => /:focus-visible/.test(r.selector));

      rules.forEach((r) => {
        if (!/:focus(?!-visible)/.test(r.selector)) return;
        const removesOutline = /outline\s*:\s*(0|none)/i.test(r.cssText);
        if (!removesOutline) return;
        // If the same rule replaces with box-shadow/border change, accept it.
        const replacement = /(box-shadow|border|background|color|outline-offset)\s*:/i.test(r.cssText);
        if (!replacement && !hasFocusVisibleAlt) failedRules += 1;
      });

      // Static analysis can't point to a single offending element. We report
      // the documentElement as the failure target so the developer view
      // shows the page root.
      const failedNodes = failedRules > 0 ? [doc.documentElement] : [];
      return { total, failedNodes };
    },
  });
})();
