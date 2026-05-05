(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  // Heuristic: an inline onfocus handler that submits a form, navigates, or
  // opens a window almost certainly causes a context change on focus, which
  // violates WCAG 3.2.1.
  const SUSPECT = /(submit\s*\(|location\s*[.=]|window\.open|history\.(push|replace|go)\s*\()/;

  a11y.register({
    id: "on-focus",
    title: "Focus must not trigger a context change",
    description:
      "Focusing a control should never submit a form, navigate the page, or open a new window without user intent.",
    whyItMatters:
      "Keyboard and screen-reader users tab through controls to explore the page. Triggering an action on focus traps them in unexpected page states.",
    severity: "moderate",
    recommendation:
      "Move the action from onfocus to onclick / onchange, or require explicit user confirmation before navigating or submitting.",
    disabilities: ["motor", "cognitive", "visual"],
    selectorHint: "[onfocus]",
    standards: {
      wcag20: { criterion: "3.2.1", level: "A" },
      wcag21: { criterion: "3.2.1", level: "A" },
      wcag22: { criterion: "3.2.1", level: "A" },
      si5568: { criterion: "3.2.1", clause: "SI 5568 Part 1 (3.2.1)", level: "A" },
    },
    run(doc) {
      const candidates = a11y.toArray(doc.querySelectorAll("[onfocus]"));
      const failedNodes = candidates.filter((el) => SUSPECT.test(el.getAttribute("onfocus") || ""));
      return { total: candidates.length, failedNodes };
    },
  });
})();
