(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "pointer-cancellation",
    title: "Down-event activation must be cancellable",
    description:
      "Single-pointer activation should not fire on the down-event. If onmousedown is the only handler, users cannot abort the action by moving away before release.",
    whyItMatters:
      "Motor-impaired users frequently click in the wrong place, then drag away before releasing to cancel. Triggering on mousedown removes that escape hatch.",
    severity: "minor",
    recommendation:
      "Move the activation logic to onclick / onpointerup. Reserve onmousedown for purely visual feedback.",
    disabilities: ["motor"],
    selectorHint: "[onmousedown]",
    standards: {
      // 2.5.2 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "2.5.2", level: "A" },
      wcag22: { criterion: "2.5.2", level: "A" },
    },
    run(doc) {
      const candidates = a11y.toArray(doc.querySelectorAll("[onmousedown]"));
      const failedNodes = candidates.filter((el) => !el.hasAttribute("onclick"));
      return { total: candidates.length, failedNodes };
    },
  });
})();
