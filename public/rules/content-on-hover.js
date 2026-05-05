(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "content-on-hover",
    title: "title-only tooltips can hide critical info",
    description:
      "Focusable elements that rely on the native title attribute and provide no aria-describedby may have content that disappears too quickly to read on hover or focus.",
    whyItMatters:
      "Native title tooltips are not keyboard-friendly, vanish on movement, and are unreliable for users with low vision or cognitive impairments.",
    severity: "minor",
    recommendation:
      "Replace title-based tooltips with a custom tooltip that is dismissible, hoverable, and persistent (1.4.13). Connect it via aria-describedby.",
    disabilities: ["visual", "cognitive", "motor"],
    selectorHint: "[title]",
    standards: {
      // 1.4.13 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "1.4.13", level: "AA" },
      wcag22: { criterion: "1.4.13", level: "AA" },
    },
    run(doc) {
      const candidates = a11y.toArray(
        doc.querySelectorAll(
          "a[title][href], button[title], input[title], select[title], textarea[title], [role='button'][title], [role='link'][title]"
        )
      );
      const failedNodes = candidates.filter((el) => {
        const title = (el.getAttribute("title") || "").trim();
        if (!title) return false;
        // If the same tooltip is already exposed as aria-describedby, accept it.
        if (el.getAttribute("aria-describedby")) return false;
        // Long titles are more likely to be tooltip-style content.
        return title.length > 25;
      });
      return { total: candidates.length, failedNodes };
    },
  });
})();
