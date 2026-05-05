(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  /**
   * Heuristic check for clickable non-interactive elements that have no
   * keyboard support. We can only see DOM attributes (not addEventListener
   * handlers), so we look for:
   *   - div/span/p/section with onclick attribute and no role + no tabindex
   *   - role='button' / role='link' on a non-button/non-link element with no
   *     tabindex (cannot receive keyboard focus)
   *   - role='button' / role='link' without onkeydown / onkeypress when also
   *     using onclick (best-effort warning)
   */
  a11y.register({
    id: "keyboard-handler",
    title: "Clickable elements must be keyboard-operable",
    description:
      "Custom interactive elements (div/span with onclick or role='button') must be focusable via tabindex and respond to the keyboard.",
    whyItMatters:
      "Mouse-only widgets exclude keyboard users entirely. Real <button>/<a> elements get focus and Enter/Space activation for free; custom widgets must replicate this.",
    severity: "serious",
    recommendation:
      "Use a real <button> or <a href> when possible. Otherwise add tabindex='0', a role attribute, and a keydown handler that triggers on Enter/Space.",
    disabilities: ["motor", "visual", "cognitive"],
    selectorHint: "[onclick], [role='button'], [role='link']",
    standards: {
      wcag20: { criterion: "2.1.1", level: "A" },
      wcag21: { criterion: "2.1.1", level: "A" },
      wcag22: { criterion: "2.1.1", level: "A" },
      si5568: { criterion: "2.1.1", clause: "Annex A 2.1.1", level: "A" },
    },
    run(doc) {
      const failed = new Set();

      // 1. Non-interactive tags with onclick attribute and no keyboard story.
      const nonInteractive = a11y.toArray(
        doc.querySelectorAll(
          "div[onclick], span[onclick], p[onclick], section[onclick], article[onclick], li[onclick]"
        )
      );
      nonInteractive.forEach((el) => {
        const role = el.getAttribute("role");
        const tabindex = el.getAttribute("tabindex");
        const hasKeyHandler =
          el.hasAttribute("onkeydown") ||
          el.hasAttribute("onkeypress") ||
          el.hasAttribute("onkeyup");
        if (!role || tabindex === null || !hasKeyHandler) failed.add(el);
      });

      // 2. role=button/link on non-button/non-anchor without tabindex.
      const customButtons = a11y.toArray(
        doc.querySelectorAll("[role='button'], [role='link']")
      );
      customButtons.forEach((el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === "button" || (tag === "a" && el.hasAttribute("href"))) return;
        const tabindex = el.getAttribute("tabindex");
        if (tabindex === null) failed.add(el);
      });

      const total = nonInteractive.length + customButtons.length;
      return { total: total || 1, failedNodes: Array.from(failed) };
    },
  });
})();
