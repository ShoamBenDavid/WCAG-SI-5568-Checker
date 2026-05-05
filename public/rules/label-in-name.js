(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  function visibleText(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  a11y.register({
    id: "label-in-name",
    title: "Accessible name should contain the visible label",
    description:
      "When a control has a visible text label, the accessible name must include that label so voice-control users can activate it by speaking what they see.",
    whyItMatters:
      "Voice-control software (Dragon, Voice Access) clicks the control whose accessible name matches the spoken phrase. If aria-label overrides the visible text, the click never lands.",
    severity: "moderate",
    recommendation:
      "Avoid aria-label that disagrees with the visible text. Either drop the aria-label or extend it so the visible text is a substring (e.g. 'Search products' rather than 'Find').",
    disabilities: ["motor", "cognitive"],
    selectorHint: "button, a, [role='button'], [role='link']",
    standards: {
      // 2.5.3 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "2.5.3", level: "A" },
      wcag22: { criterion: "2.5.3", level: "A" },
    },
    run(doc) {
      const candidates = a11y.toArray(
        doc.querySelectorAll("button, a, [role='button'], [role='link']")
      );
      const failedNodes = candidates.filter((el) => {
        if (el.getAttribute("aria-hidden") === "true") return false;
        const visible = visibleText(el);
        const name = (a11y.getAccessibleName(el) || "").trim();
        if (!visible || !name) return false;
        return !name.toLowerCase().includes(visible.toLowerCase());
      });
      return { total: candidates.length, failedNodes };
    },
  });
})();
