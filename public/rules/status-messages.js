(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "status-messages",
    title: "Pages with forms or async UI should expose status messages",
    description:
      "Pages that submit forms or display dynamic feedback must include at least one live region (role='status', role='alert', or aria-live).",
    whyItMatters:
      "Without a live region, success/error messages updated via JS never reach screen-reader users — they remain invisible to assistive technology.",
    severity: "moderate",
    recommendation:
      "Add a polite or assertive live region to the layout. Update its text when validation fails or async actions complete.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "[aria-live], [role='status'], [role='alert']",
    standards: {
      // 4.1.3 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "4.1.3", level: "AA" },
      wcag22: { criterion: "4.1.3", level: "AA" },
    },
    run(doc) {
      const hasInteractive = Boolean(
        doc.querySelector(
          "form, [role='form'], button[type='submit'], input[type='submit'], input[type='button']"
        )
      );
      if (!hasInteractive) return { total: 1, failedNodes: [] };
      const liveRegion = doc.querySelector(
        "[aria-live]:not([aria-live='off']), [role='status'], [role='alert'], [role='log']"
      );
      return { total: 1, failedNodes: liveRegion ? [] : [doc.body || doc.documentElement] };
    },
  });
})();
