(function () {
  const a11y = window.__a11y;
  if (!a11y || !a11y.register) return;

  // We can't fully simulate "user applies WCAG 1.4.12 spacing override" from a
  // content script. Heuristic: flag inline style attributes that hard-set
  // text-spacing-related properties with !important — these typically prevent
  // the user override from taking effect.
  const SPACING_PROPS = /(line-height|letter-spacing|word-spacing|paragraph-spacing)\s*:\s*[^;]*!important/i;

  a11y.register({
    id: "text-spacing",
    title: "Inline !important on spacing properties blocks user overrides",
    description:
      "Content must adapt when users override line-height, letter-spacing, word-spacing, or paragraph-spacing via a stylesheet. Hard-setting these with !important inline blocks the override.",
    whyItMatters:
      "Users with low vision or dyslexia adjust spacing via browser extensions. !important inline styles prevent that override from working.",
    severity: "moderate",
    recommendation:
      "Avoid using !important on text-spacing properties in inline styles. Move the rule to a regular stylesheet so user overrides can win.",
    disabilities: ["visual", "cognitive"],
    selectorHint: "[style]",
    standards: {
      // 1.4.12 is new in WCAG 2.1 — no WCAG 2.0 / SI 5568 mapping.
      wcag21: { criterion: "1.4.12", level: "AA" },
      wcag22: { criterion: "1.4.12", level: "AA" },
    },
    run(doc) {
      const styled = a11y.toArray(doc.querySelectorAll("[style]"));
      const failedNodes = styled.filter((el) => {
        const style = el.getAttribute("style") || "";
        return SPACING_PROPS.test(style);
      });
      return { total: styled.length, failedNodes };
    },
  });
})();
