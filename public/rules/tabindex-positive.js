(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "tabindex-positive",
    title: "Avoid positive tabindex values",
    description:
      "tabindex values greater than 0 force a manual tab order that is hard to maintain and confuses keyboard users.",
    whyItMatters:
      "Positive tabindex jumps the focus around the page in an order that rarely matches the visual order, breaking keyboard navigation and screen-reader expectations.",
    severity: "moderate",
    recommendation: "Use tabindex='0' to make a non-interactive element focusable, or rely on natural DOM order.",
    disabilities: ["motor", "visual", "cognitive"],
    selectorHint: "[tabindex]",
    standards: {
      wcag20: { criterion: "2.4.3", level: "A" },
      wcag21: { criterion: "2.4.3", level: "A" },
      wcag22: { criterion: "2.4.3", level: "A" },
      si5568: { criterion: "2.4.3", clause: "Annex A 2.4.3", level: "A" },
    },
    run(doc) {
      const all = a11y.toArray(doc.querySelectorAll("[tabindex]"));
      const failedNodes = all.filter((el) => {
        const v = Number(el.getAttribute("tabindex"));
        return Number.isFinite(v) && v > 0;
      });
      return { total: all.length, failedNodes };
    },
  });
})();
