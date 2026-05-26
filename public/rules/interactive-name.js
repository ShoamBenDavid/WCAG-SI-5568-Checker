(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  a11y.register({
    id: "interactive-name",
    title: "Interactive elements need accessible names",
    description:
      "Links, buttons, and elements with role='button' or role='link' must expose a non-empty accessible name.",
    whyItMatters:
      "Nameless interactive controls are announced as just 'button' or 'link', leaving users unable to know what they do or where they go.",
    severity: "serious",
    recommendation:
      "Provide visible text content, an aria-label, an aria-labelledby reference, a title attribute, or alt text for icon images.",
    disabilities: ["visual", "cognitive", "motor"],
    selectorHint: "a[href], button, [role='button'], [role='link']",
    standards: {
      wcag20: { criterion: "4.1.2", level: "A" },
      wcag21: { criterion: "4.1.2", level: "A" },
      wcag22: { criterion: "4.1.2", level: "A" },
      si5568: { criterion: "4.1.2", clause: "Annex A 4.1.2", level: "A" },
    },
    run(doc) {
      const candidates = a11y.toArray(
        doc.querySelectorAll("a[href], button, input[type='button'], input[type='submit'], input[type='reset'], input[type='image'], [role='button'], [role='link']")
      );
      const failedNodes = candidates.filter((el) => {
        if (a11y.isElementHidden(el) || a11y.isDisabled(el)) return false;
        if (!a11y.isNativeInteractiveElement(el) && a11y.isInsideNativeInteractiveElement(el)) {
          return false;
        }
        const name = a11y.getAccessibleName(el);
        return !name;
      });
      return { total: candidates.length, failedNodes };
    },
  });
})();
